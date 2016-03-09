jquery-recent-supporters
========================
jQuery plugin to load and display a recent supporters listing on your website

See it [in demo action](http://www.more-onion.com/sites/mo3/files/jquery-recent-supporters/demo/demo.html)!

Developed by [More Onion](http://www.more-onion.com) as part of
[Campaignion](http://www.campaignion.org).

Dependecies
-----------
* jQuery 1.5+

Install
-------
Include the files ``jquery.recent-supporters.js``, ``jquery.recent-supporter.css``,
``flags.css`` and ``flags.png`` in your markup.

Also include ``jquery.timeago.js`` and your preferred easing method if you want to
use them.

Provide a container in your markup, e.g. with the id
``#recent-supporters-container``. This will be populated by jQuery Recent Supporters.

Then call the plugin on the container (you only have to provide the polling url; all
other configuration options have reasonably defaults):

```javascript
$('#recent-supporters-container').recentSupporters({
  pollingURL: 'http://example.com/my/polling-url.json'
});
```


Configuration
-------------
Call the plugin with a property object to override the defaults.

### mandatory

* ``pollingURL``:
  The URL where to poll from. Needs to provide JSON data in the format
  specified below. (``''``)

### optional

* ``createListIfMissing``:
  creates the ul element if it is missing in the container (i.e. no supporters
  were loading on the inital page load)
  (default value: ``true``) 
* ``pollingInterval``:
  inital polling interval (5 seconds)
  (``5000``)
* ``pollingIntervalMultiplier``:
  multiplier to slow down polling
  (``1.01``)
* ``poll``:
  the polling function to be used
  (``pollSupporters``)
* ``cycleSupporters``:
  whether to cycle the displayed supporters
  (``true``)
* ``cycleInterval``:
  cycling interval
  (``4000``)
* ``cycleEasing``:
  easing animation when cycling
  (``'linear'``)
* ``updateTimeagoInterval``:
  interval for timeago updating
  (``5700``)
* ``maxSupportersVisible``:
  number of maximum visible supporters in the container
  (``6``)
* ``maxSupportersInContainer``:
  number of total loaded supporters in the container
  (``15``)
* ``showCountry``:
  whether to show the country
  (``true``)
* ``maxPollErrorCount``:
  give up polling after this count of errors (no 404 or 403 as these will stop
  polling immediatly)
  (``15``)
* ``namespace``:
  the "namespace"/node id/action page id. there can be more than one action
  pages in the json output, but currently only one is displayed)
  (``'supporters'``)
* ``cssPrefix``:
  will get prepended to every class Recent Supporters uses
  (``'supporters-'``)
* ``compareFn``:
  the function which defines whether two supporter objects are considered the
  same. This is used as a ``sort`` function, so it has to adher to it's
  interface: return ``0`` for less than, ``-1`` for smaller, and ``1`` for
  greater than.
  (``compareSupporterFn``)

Manually add a supporter
------------------------

It's is possible to manually add supporters to the recent supporters instance.

The supporter object needs to include at least one of `first_name` or
`last_name` (or both). You can set either of `rfc8601` or `timestamp` (UNIX
epoch in seconds) to set the time of the support (`rfc8601` is used for the
time displayed). If you omit a time, the current time will be used.

```javascript
var now = new Date();
var $recent = $('#recent-supporters-container').recentSupporters({
  pollingURL: 'http://example.com/my/polling-url.json'
});

$recent.addNewSupporter({
  rfc8601: now.toISOString(),
  first_name: 'First',
  last_name: 'Lastname'
});
```

jQuery Timeago integration
-----------------------------
This plugin can use jQuery Timeago to display the difference between now and
the action in seconds, minutes, ... as e.g. "2 minutes ago".

See [http://timeago.yarp.com](http://timeago.yarp.com) for configuration and
details about jQuery Timeago.

JSON format
-----------
The plugin expects the data to be in a specific format (namespaced by an
string, default is ``supporters``):

    {"supporters":
      [
        {"first_name":"First",
         "last_name":"Name",
         "timestamp":"1384874190",
         "rfc8601":"2013-11-19T16:16:30+01:00",
         "country":"",
         "country_name":""
        },
        {"first_name":"Another",
         "last_name":"Lastname",
         "timestamp":"1384786670",
         "rfc8601":"2013-11-18T15:57:50+01:00",
         "country":"AT","country_name":"Austria"
        }
      ]
    }

Caveats
-------
* if there is an inital data in the markup: expects it to be correctly ordered
  by timestamp descending

TODO
----
 * sort the data on initialization
 * fuzzy timeago update interval
 * merge data from different nodes/action pages into one stream

Changes
-------

* 0.4.0
  * provide an uniquifying storage from which the recent supporters can be
    updated from
  * use an UMD header
  * move country element to beginning of supporter element
  * prefix css classes
  * fixes
  * relicense as GPLv3
* 0.3.0
  * possible to omit `timestamp` and `rfc8601` properties in supporter objects
  * add `$.fn.recentSupporters.addNewSupporter`
  * add `$.fn.recentSupporters.addNewSupporters`
* 0.2.0 update to new Campaignion format
* 0.1.0 initial release
