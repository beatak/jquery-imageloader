jQuery.imageloader()
====================

jQuery.imageloader() lets you have granular controls of image loading timing.

DEMO
----

[beatak.github.com/jquery-imageloader/](http://beatak.github.com/jquery-imageloader/ "github page")

EXAMPLE
-------

    $('.YOUR-SELECTOR').imageloader(OPTIONS)

OPTIONS
-------

The instance option as follows:

Name|Type|Default|Description
----|----|-------|-----------
**selector**|string|(empty string)|Selector for the elements that $.fn.imageloader() will look for in order to load the image. If the empty string is passed, $.fn.imageloader() will try to load the image on "*this*" object.
**dataattr**|string|"src"|Data attribute for the elements that $.fn.imageloader() will look for. As default, $.fn.imageloader() will look for data-src attribute.
**background**|boolean|false|*true* if you want to load image as background-image css.
**each**|function|null|Callback function for each image is loaded. when you try to load one image, it doesn't make any difference from *callback*. See [Demo](http://beatak.github.com/jquery-imageloader/ "github page")
**callback**|function|null|Callback function when the image is loaded. "*this*" is passed as the first argument. See [Demo](http://beatak.github.com/jquery-imageloader/ "github page")
**timeout**|number|5000|Millisecond for loading timeout.

***

There is also a global option:

Name|Type|Default|Description
----|----|-------|-----------
**$.imageloader.queueInterval**|number|17|A browser can only issue parallel HTTP requests 2 to 9 for each domain name as a default ([according to Browserscope](http://www.browserscope.org/?category=network "Connections per Hostname"), May 2012).  When you try to load massive numbers of images all at once, it can consume all browser's UI thread.  So *$.fn.imageloader()* is using a time-domain queue for controling loading timing.  17 millisecond is a one frame delay under 60fps.  As default, when you apply $.fn.imageloader() to numbers of elements, it will make &lt;img&gt; elements every 17 milliseconds.


CREDIT
------

© 2012 Takashi Mizohata.

Licensed under MIT.

Special thanks to [Meetup](http://www.meetup.com/ "Meetup")