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
	var namespace = '_' + ('' + (new Date()).valueOf()).slice(-7),
  q = Queue.getInstance(),
	DEFAULT_OPTIONS = {
		selector: '.myimage',
    dataattr: 'src',
		background: false,
		callback: function () {}
	};

	var init = function (i) {
    var self = this;
    var $this = $(this);
    var data = $this.data();
		var defaults = $.extend({}, DEFAULT_OPTIONS, opts || {});
		var $elms = $this.find(buildSelector(defaults.selector, defaults.dataattr));
    var len = $elms.length;

    data['imageloader-callback'] = defaults.callback;
    data['imageloader-hasFinished'] = false;
    data['imageloader-loadedImageCounter'] = 0;
    data['imageloader-length'] = len;

    if (len === 0) {
      finishImageLoad(this);
    }
    else {
			$elms.each(
				function (i, elm) {
          q.add(buildImageLoadFunc(elm, self, namespace, defaults.background));
				}
			);
      // console.log(['we are gonna load ', len, ' image(s) on ', namespace].join(''));
			$this.on('loadImage.' + namespace, onLoadImage);
      q.run();
		}
		return this;
	};

	var onLoadImage = function (ev, elm) {
    // console.log('onLoadImage', ev, elm);
    var parent = ev.currentTarget;
    var data = $(parent).data();
		if (data['imageloader-hasFinished']) {
			console.log('onLoadImage: hasFinished but still called?');
			return;
		}
    ++data['imageloader-loadedImageCounter'];
		if (data['imageloader-loadedImageCounter'] >= data['imageloader-length']) {
			finishImageLoad(parent);
		}
	};

	var finishImageLoad = function (parent) {
    // console.log('finishImageLoad', parent);
    var $parent = $(parent);
    var data = $parent.data();
    data['imageloader-hasFinished'] = true;
    data['imageloader-callback']();
		$parent.off('loadImage.' + namespace, onLoadImage);
    delete data['imageloader-callback'];
    delete data['imageloader-hasFinished'];
    delete data['imageloader-loadedImageCounter'];
    delete data['imageloader-length'];
	};

  var buildSelector = function (selector, dataattr) {
    return [selector, '[data-', dataattr, ']'].join('');
  };

	var buildImageLoadFunc = function (elm, parent, namespace, isBg) {
		var $elm = $(elm),
		src = $elm.data('src');

		var onFinishLoagImage = function (ev) {
			if (ev && ev.type === 'error') {
				$elm.remove();
			}
      // delete attribute
      $elm.removeAttr('data-src');
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

	return this.each(init);
};

// ===================================================================

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