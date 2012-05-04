(
function($) {

/**
 * memory less intensive, supposed to be clean up all afer done,
 * no event attaching image loader.
 * 
 * todo: maybe count seconds and if still not loading all, should
 * fire error?
 */
$.fn.imageloader = function (opts) {
	var $elms,
  $parent = $(this),
	namespace = '_' + ('' + (new Date()).valueOf()).slice(-7),
	hasFinished = false,
	loadedImageCounter = 0,
	defaults = null,
	DEFAULT_OPTIONS = {
		selector: '.myimage',
		background: false,
		callback: function () {}
	},
  q = Queue.getInstance();

  var buildSelector = function () {
    return [defaults.selector, '[data-src]'].join('');
  };

	var init = function (i) {
		defaults = $.extend({}, DEFAULT_OPTIONS, opts);
		$elms = $parent.find(buildSelector());
    if ($elms.length === 0) {
      finishImageLoad();
    }
    else {
			$elms.each(
				function (i, elm) {
          q.add(generateImageLoadFunc(elm, $parent, namespace, defaults.background));
				}
			);
      // console.log(['we are gonna load ', $elms.length, ' image(s) on ', namespace].join(''));
			$parent.on('loadImage.' + namespace, onLoadImage);
      q.run();
		}
		return this;
	};

	var onLoadImage = function (ev, elm) {
    // console.log(elm);
		if (hasFinished) {
			// console.log('onLoadImage: hasFinished but still called?');
			return;
		}
		++loadedImageCounter;
		if (loadedImageCounter >= $elms.length) {
			finishImageLoad();
		}
	};

	var finishImageLoad = function () {
		hasFinished = true;
		defaults.callback();
		$parent.off('loadImage.' + namespace, onLoadImage);
	};

	var generateImageLoadFunc = function (elm, $parent, namespace, isBg) {
		var $elm = $(elm),
		src = $elm.data('src');

		var onFinishLoagImage = function (ev) {
			if (ev && ev.type === 'error') {
				$elm.remove();
			}
      // delete attribute
      $elm.removeAttr('data-src');
      $parent.triggerHandler('loadImage.' + namespace, elm);
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
            // console.log('loaded!: ', src);
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

	return $parent.each(init);
};

var MILSEC_INTERVAL = 23;
var instance;
var Queue = {
  getInstance: function () {
    if (typeof instance === 'undefined') {
      instance = new QueueThread();
    }
    return instance;
  }
};

var QueueThread = function () {
  this.index = 0;
  this.queue = [];
  this.isRunning = false;
}

QueueThread.prototype.add = function (func) {
  if (typeof func !== 'function') {
    throw new Error('you can only pass function.');
  }
  this.queue[this.queue.length] = func;
};

QueueThread.prototype.run = function (firenow) {
  firenow = firenow || false;
  var run = this.run.bind(this);
  if (this.isRunning && !firenow) {
    return;
  }
  this.isRunning = true;
  this.queue[this.index]();
  ++this.index;
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