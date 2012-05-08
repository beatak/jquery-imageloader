(
function($) {

var MILSEC_INTERVAL = 17;
var DEFAULT_OPTIONS = {
  selector: '.myimage',
  dataattr: 'src',
  background: false,
  callback: function () {}
};

/**
 * jQuery.imageloader() lets you load images lazily.  It is designed
 * to be memory less intensive, cleaning up all after done and using
 * a singleton-style queue mechanism so that it won't overwhelm 
 * browser UI thread.
 * 
 * todo: maybe count seconds and if still not loading all, should
 * fire error?
 */
$.fn.imageloader = function (opts) {
  var q = Queue.getInstance();

  var init = function () {
    var self = this;
    var $this = $(this);
    var defaults = $.extend({}, DEFAULT_OPTIONS, opts || {});
    var $elms = $this.find([defaults.selector, '[data-', defaults.dataattr, ']'].join(''));
    var len = $elms.length;
    var ns = '_' + ('' + (new Date()).valueOf()).slice(-7);
    $this.data(
      ns,
      {
        callback: defaults.callback,
        isLoading: true,
        loadedImageCounter: 0,
        length: len
      }
    );

    if (len === 0) {
      finishImageLoad(this, ns);
    }
    else {
      $elms.each(
        function (i, elm) {
          q.add(buildImageLoadFunc(elm, self, ns, defaults.background, defaults.dataattr));
        }
      );
      // console.log(['we are gonna load ', len, ' image(s) on ', ns].join(''));
      $this.on('loadImage.' + ns, onLoadImage);
      q.run();
    }
    return this;
  };

  var onLoadImage = function (ev, elm) {
    // console.log('onLoadImage: ', ev.namespace);
    var parent = ev.currentTarget;
    var defaults = $(parent).data(ev.namespace);
    if (!defaults.isLoading) {
      // console.log('onLoadImage: is not loading but still called?');
      return;
    }
    ++defaults.loadedImageCounter;
    if (defaults.loadedImageCounter >= defaults.length) {
      finishImageLoad(parent, ev.namespace);
    }
  };

  var finishImageLoad = function (parent, ns) {
    // console.log('finishImageLoad: ', ns);
    var $parent = $(parent);
    var data = $parent.data();
    var callback = data[ns].callback;
    $parent.off('loadImage.' + ns, onLoadImage);
    delete data[ns];
    setTimeout(
      function () {
        callback();
      },
      MILSEC_INTERVAL * 2
    );
  };

  var buildImageLoadFunc = function (elm, parent, namespace, isBg, attr) {
    var $elm = $(elm),
    src = $elm.data('src');

    var onFinishLoagImage = function (ev) {
      if (ev && ev.type === 'error') {
        $elm.remove();
      }
      // delete attribute
      $elm.removeAttr( ['data-', attr].join('') );
      $(parent).triggerHandler('loadImage.' + namespace, elm);
    };

    return function () {
      $('<img />')
        .bind(
          'error',
          function (ev) {
            $(this).unbind('error').unbind('load');
            onFinishLoagImage(ev);
          }
        )
        .bind(
          'load',
          function(ev) {
            $(this).unbind('error').unbind('load');
            if (isBg) {
              $elm.css('background-image', ['url(', src, ')'].join(''));
            }
            else {
              $elm.attr('src', src);
            }
            onFinishLoagImage(ev);
          }
        )
        .attr('src', src);
    };
  };

  return this.each(init);
};

// ===================================================================

var _queue_instance_;
var Queue = {
  getInstance: function () {
    if (_queue_instance_ instanceof QueueImpl === false) {
      _queue_instance_ = new QueueImpl();
    }
    return _queue_instance_;
  }
};

var QueueImpl = function () {
  this.index = 0;
  this.queue = [];
  this.isRunning = false;
}

QueueImpl.prototype.add = function (func) {
  if (typeof func !== 'function') {
    throw new Error('you can only pass function.');
  }
  this.queue[this.queue.length] = func;
};

QueueImpl.prototype.run = function (firenow) {
  firenow = firenow || false;
  var run = $.proxy(this.run, this);
  if (this.isRunning && !firenow) {
    return;
  }
  this.isRunning = true;
  this.queue[this.index++]();
  if (this.index < this.queue.length) {
    setTimeout(
      function () {
        run(true);
      },
      MILSEC_INTERVAL
    );
  }
  else {
    this.isRunning = false;
  }
};

})(jQuery);