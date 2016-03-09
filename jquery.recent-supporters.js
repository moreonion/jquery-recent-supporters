/*!
 * jQuery plugin to load and display a recent supporters listing on your website
 * https://github.com/moreonion/jquery-recent-supporters
 *
 * Copyright (c) 2013-2016 more onion
 * Released under the GPLv3 license
 * https://github.com/moreonion/jquery-recent-supporters/blob/master/LICENSE
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function( root, jQuery ) {
      if ( jQuery === undefined ) {
        if ( typeof window !== 'undefined' ) {
          jQuery = require('jquery');
        }
        else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    factory(jQuery);
  }
}(function ($) {

  $.fn.recentSupporters = function( options ) {

    // the default poll function
    // it is attached to settings.poll which gets called on every poll
    var pollSupporters = function () {
      // no polling if there is no URL to poll
      if (settings.pollingURL.length < 1) {
        return;
      }

      // do the AJAX request on the polling URL
      jQuery.ajax({
        contentType: 'application/json',
        url: settings.pollingURL,
        success: function(data) {
          // on success: update the container
          var supporters = data[settings.namespace];
          updateRecentSupportersContainer(supporters);
          setNextPoll();
        },
        error: function(data) {
          // on 403 or 404 do *not* set a next polling try
          if (data.status === '403') { // forbidden
            return;
          } else if (data.status === '404') { // not found
            return;
          } else if (pollErrorCount >= settings.maxPollErrorCount ) {
            return;
          } else {
            // do nothing, be quiet, try again but slow down polling
            settings.pollingIntervalMultiplier = settings.pollingIntervalMultiplier * 1.1;
            pollErrorCount = pollErrorCount + 1;
            setNextPoll();
          }
        }
      });

    }

    // These are the defaults.
    var defaults = {
      createListIfMissing: true,
      pollingURL: '',
      pollingInterval: 5000,
      pollingIntervalMultiplier: 1.01,
      poll: pollSupporters,
      cycleSupporters: true,
      cycleInterval: 4000,
      cycleEasing: 'linear',
      updateTimeagoInterval: 5700,
      maxSupportersVisible: 6,
      maxSupportersInContainer: 15,
      showCountry: true,
      maxPollErrorCount: 15,
      namespace: 'supporters',
      cssPrefix: 'supporters-',
      compareFn: compareSupporterFn
    }
    var settings = $.extend({}, defaults, options );

    var nextPoll = settings.pollingInterval;
    var $ul = $('ul.'+settings.cssPrefix+'recent-supporters');
    var $container = this;
    var lastSupporterTimestamp = getMostRecentTimestamp();
    var pollErrorCount = 0;

    var supporterStore = [];

    // check if easing is available
    // if not set it to 'linear'
    if (!$.easing || !$.easing[settings.cycleEasing]) {
      settings.cycleEasing = 'linear';
    }

    /**
     * Helper function for uniqueifying an array
     *
     * @see http://stackoverflow.com/questions/2218999/remove-duplicates-from-an-array-of-objects-in-javascript
     */
    function unique(a, compareFunc){
      a.sort(compareFunc);
      for(var i = 1; i < a.length; ){
        if (compareFunc(a[i-1], a[i]) === 0) {
          a.splice(i, 1);
        } else {
          i++;
        }
      }
      a.reverse();
      return a;
    }

    /**
     * The count of supporters in the storage.
     *
     * NB: This can differ from the supporters actually displayed in the DOM,
     * as the binding is not strict.
     */
    function supporterCount() {
      return supporterStore.length;
    }

    /**
     * Add supporter items to the store.
     *
     * When you add supporters to the store, the store ensures that they are unique.
     * Set the comparing function in the settings.
     */
    function addSupportersToStore(supporters) {
      if ($.isArray(supporters)) {
        var oldCount = supporterStore.length;
        supporterStore = $.merge(supporterStore, supporters);
        supporterStore = unique(supporterStore, settings.compareFn);
        // if new supporters have been added emit event
        if (supporterStore.length > oldCount) {
          $container.trigger('addsupporters.recentsupporters');
        }
      } else {
        throw new Error('No Array given.');
      }
    };

    /**
     * Update the displayed supporters with information from the store.
     *
     */
    function updateFromStore() {
      updateRecentSupportersContainer(supporterStore);
    }

    /**
     * The default comparing function.
     *
     * This assumes some properties to be present: timestamp, last_name, and first_name.
     *
     * NB: If all of these are missing, all supporters are considered equal and
     * therefore only one will get stored in the store! So ensure that any of
     * the fields are set or provide a custom compareFn via the settings.
     */
    function compareSupporterFn(a, b) {
      if (a.timestamp && b.timestamp) {
        if (a.timestamp < b.timestamp) {
          return -1;
        }
        if (a.timestamp > b.timestamp) {
          return 1;
        }
      }
      // from here timestamps are the same
      if (a.last_name && b.last_name) {
        if (a.last_name < b.last_name) {
          return -1;
        }
        if (a.last_name > b.last_name) {
          return 1;
        }
      }
      // from here surnames are the same
      if (a.first_name && b.first_name) {
        if (a.first_name < b.first_name) {
          return -1;
        }
        if (a.first_name > b.first_name) {
          return 1;
        }
      }
      // now no greater or less could be decided
      // they must be the same
      return 0;
    }

    /**
     * sets the next poll via a timeout
     */
    function setNextPoll () {
      // calculate next poll based on settings
      // and set the timeout for next poll
      nextPoll = Math.floor(nextPoll * settings.pollingIntervalMultiplier);
      setTimeout(function() {
        settings.poll.call();
      }, nextPoll);
    }

    /**
     * Updates the recent supporters container (called upon AJAX success)
     * - checks if any new supporters needs to be inserted
     * - creates ul if needed
     * - calls function to add supporters
     *
     * @param {Object} supporters The supporters
     */
    function updateRecentSupportersContainer (supporters) {
      if (!$.isArray(supporters)) {
        return;
      }
      var newSupporters = $.map(supporters, function (s, i) {
        if (parseInt(s.timestamp, 10) > lastSupporterTimestamp) {
          return s;
        }
      });

      // create the ul if the container was initialized empty
      if (settings.createListIfMissing && containerEmpty() && newSupporters.length > 0) {

        // subsitute the placeholder if available
        var $noActivityYet = $('.no-activity-yet', $container);
        if ($noActivityYet.length > 0) {
          $noActivityYet.after('<ul class="'+settings.cssPrefix+'recent-supporters">');
          $noActivityYet.hide();
          $ul = $('.'+settings.cssPrefix+'recent-supporters', $container);
        } else {
          $container.append('<ul class="'+settings.cssPrefix+'recent-supporters">');
          $ul = $('.'+settings.cssPrefix+'recent-supporters', $container);
        }
      }

      // sort the supporters by timestamp (in case they are not already)
      // (if more than 1 as 1 needs not to be sorted :)
      if (newSupporters.length > 1) {
        var newSortedSupporters = newSupporters.sort(function(a,b) { 
          return parseFloat(a.timestamp) - parseFloat(b.timestamp);
        });
      }

      // add new sorted supporters
      $.each(newSupporters, function (i, s) {
        addNewSupporter(s);
      });
    }

    /**
     * Adds a new supporter item into the DOM.
     * - checks for settings,
     * - resets visibility if needed,
     * - initializes timeago
     *
     * @param {Object} supporter The supporter object to be inserted.
     */
    function addNewSupporter (supporter) {
      var li = $('li:visible', $ul);
      var $newElement;
      var lastTimestamp = getMostRecentTimestamp();
      var liCount = $('li.'+settings.cssPrefix+'supporter', $ul).length;
      // get the most recent supporter element
      // only the first one, if timestamp matches more than one supporter
      var $mostRecentElement = $('li span[data-timestamp="'+lastTimestamp+'"]', $ul).first().parent();

      // insert element hidden to not disturb any ongoing cycling
      $newElement = supporterElement(supporter);
      $newElement.hide();
      // if we created the ul just now, there is no mostRecentElement yet
      if ($mostRecentElement.length > 0) {
        $mostRecentElement.before($newElement);
      } else {
        $ul.append($newElement);
        setVisibleSupporters();
      }
      if ($.fn.timeago) {
        $('.'+settings.cssPrefix+'time', $ul).timeago('updateFromDOM');
      }

      // remove supporters from DOM when maxSupporterInContainer treshold is hit
      // needs to remove only the last one as addNewSupporter will only add one at best
      if (settings.maxSupportersInContainer <= liCount) {
        var firstTimestamp = getLeastRecentTimestamp();
        // get the least recent supporter element
        // only the first one, if timestamp matches more than one supporter
        var $leastRecentElement = $('li span[data-timestamp="'+firstTimestamp+'"]', $ul).first().parent();
        $leastRecentElement.remove();

        // need to reset visibility as we do not check if removed element is
        // currently visible or not
        setVisibleSupporters();
      }

      // ensure the correct visibility
      setVisibleSupporters();

      // if we do cycle, we do not show the element immediatly but rely on
      // the cycling to show our new element; if we do not cycle we have to
      // take care for ourself to show the new element
      if (!settings.cycleSupporters) {
        $newElement.slideDown({duration: 200, easing: settings.cycleEasing});
        // hide any elements which are too much
        if ($('li', $ul).length > settings.maxSupportersVisible) {
          $('li:visible', $ul).last().slideUp({duration: 200, easing: settings.cycleEasing});
        }
      }

      // update variable used in next poll
      if (lastSupporterTimestamp < supporter.timestamp) {
        lastSupporterTimestamp = supporter.timestamp;
      }
    }

    /**
     * Adds a new supporters
     *
     * @param {Array} supporters The list of supporter objects to add.
     */
    function addNewSupporters (supporters) {
      if ($.isArray(supporters)) {
        $.each(supporters, function (index, supporter) {
          addNewSupporter(supporter);
        });
      } else {
        throw new Error('No Array given.');
      }
    }

    /**
     * Generates a new supporter element from supporter object.
     *
     * @param {Object} supporter A single supporter object.
     * @return {Object} Returns a jQuery li object ready to be inserted into the DOM.
     */
    function supporterElement (supporter) {
      var $li = $('<li>');
      var datetime = new Date();
      var rfc8601, timestamp;
      if (typeof supporter.rfc8601 === 'undefined') {
        if (typeof supporter.timestamp === 'undefined') {
          timestamp = Math.floor(datetime.getTime / 1000)
        } else {
          timestamp = parseInt(supporter.timestamp, 10);
          datetime = new Date(timestamp * 1000);
        }
        rfc8601 = datetime.toISOString();
      } else {
        rfc8601 = supporter.rfc8601;
        datetime = new Date(rfc8601);
        if (typeof supporter.timestamp === 'undefined') {
          timestamp = Math.floor(datetime.getTime / 1000)
        }
      }
      var minString = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
      var datetimeString = datetime.getDate()+"."+(datetime.getMonth()+1)+"."+datetime.getFullYear()+" "+datetime.getHours()+":"+minString;
      var name = [supporter.first_name, supporter.last_name].join(" ")
      $li.addClass(settings.cssPrefix+'supporter').append('<span class="'+settings.cssPrefix+'name">'+name+'</span>'+"\n"+'<span class="'+settings.cssPrefix+'time" data-timestamp="'+timestamp+'" title="'+rfc8601+'">'+datetimeString+'</span>');
      if (settings.showCountry) {
        var countryCode = supporter.country ? supporter.country.toLowerCase() : "no-cc";
        var countryName = supporter.country_name;
        var countryStr = typeof supporter.country !== 'undefined' ? supporter.country : '';
        $li.prepend('<span title="'+countryName+'" class="'+settings.cssPrefix+'country '+settings.cssPrefix+'flag '+settings.cssPrefix+'flag-'+countryCode+'">'+countryStr+'</span> ');
      }
      return $li;
    }

    /**
     * Checks if the container is empty.
     * e.g. when loaded without any supporters in initial markup
     *
     * @return {Boolean} Returns true if empty, false otherwise
     */
    function containerEmpty () {
      return $('ul.'+settings.cssPrefix+'recent-supporters', $container).length > 0 ? false : true;
    }

    /**
     * Get the most recent timestamp of the supporters.
     *
     * @return {Integer} Returns the most recent timestamp
     */
    function getMostRecentTimestamp () {
      var li = $('li .'+settings.cssPrefix+'time', $ul);
      var timestamps = li.map(function (i, el) {
        return parseInt(el.getAttribute('data-timestamp'), 10);
      });
      return Math.max.apply(Math, timestamps.get());
    }

    /**
     * Get the least recent timestamp of the supporters.
     *
     * @return {Integer} Returns the least recent timestamp
     */
    function getLeastRecentTimestamp () {
      var li = $('li .'+settings.cssPrefix+'time', $ul);
      var timestamps = li.map(function (i, el) {
        return parseInt(el.getAttribute('data-timestamp'), 10);
      });
      return Math.min.apply(Math, timestamps.get());
    }

    /**
     * Sets the visibility of the supporters.
     * Show only the maxSupportersVisible number of supporters.
     */
    function setVisibleSupporters() {
      $('li.'+settings.cssPrefix+'supporter', $ul).show().slice(settings.maxSupportersVisible).hide();
    }

    /**
     * Cycles to the next supporter. Cycles only 1 by 1 supporter.
     */
    function cycleSupporters() {
      var supporterElements = $('li.'+settings.cssPrefix+'supporter', $ul);
      // move last element to top in list and show hide
      // if there is at least one supporter more loaded then shown
      if (supporterElements.length > settings.maxSupportersVisible) {
        var minHeight = $container.height();
        $container.css({minHeight: minHeight + 'px'});
        $('li:visible', $ul).last().slideUp({duration: 200, easing: settings.cycleEasing});
        supporterElements.last().hide().detach().prependTo($ul).slideDown({duration: 200, easing: settings.cycleEasing});
      }
    }

    // set number of visible supporters
    setVisibleSupporters();

    // start cycling if enabled
    if (settings.cycleSupporters) {
      setInterval(function() {
        cycleSupporters();
      }, settings.cycleInterval);
    }

    // start the polling if we have the requested box in the markup
    if (this.length > 0) {
      settings.poll.call();

      // initialize timeago (if available)
      if ($.fn.timeago) {
        $('.'+settings.cssPrefix+'time', $ul).timeago('updateFromDOM');
        // set update interval
        setInterval(function() {
          $('.'+settings.cssPrefix+'time', $ul).timeago('updateFromDOM');
        }, settings.updateTimeagoInterval);
      }
    }

    // provide means to add supporters manually
    this.addNewSupporter = addNewSupporter;
    this.addNewSupporters = addNewSupporters;
    this.addSupportersToStore = addSupportersToStore;
    this.updateFromStore = updateFromStore;
    this.supporterCount = supporterCount;

    return this;
  }
}));
