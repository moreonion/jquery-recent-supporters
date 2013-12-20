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

    $('#recent-supporter-container').recentSupporters({
      pollingURL: 'http://example.com/my/polling-url.json'
    });


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
* ``nodeID``:
  the "namespace"/node id/action page id. there can be more than one action
  pages in the json output, but currently only one is displayed)
  (``'0'``)

jQuery Timeago integration
-----------------------------
This plugin can use jQuery Timeago to display the difference between now and
the action in seconds, minutes, ... as e.g. "2 minutes ago".

See [http://timeago.yarp.com](http://timeago.yarp.com) for configuration and
details about jQuery Timeago.

JSON format
-----------
The plugin expects the data to be in a specific format (namespaced by an id,
default id is ``0``):

    {"0":
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

* 0.1.0 initial release
