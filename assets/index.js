Array.prototype.shuffle = function () {
  var tmp, current, top = this.length;
  if (top) {
    while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = this[current];
      this[current] = this[top];
      this[top] = tmp;
    }
  }
  return this;
};

(
function () {
  var SCR0 = '<script type="text/javascript">date0 = (new Date()).valueOf();</script>';
  var SCR_ONLOAD0 = 'onLoad="date1 = (new Date()).valueOf();self.focus();opener.benchmark(date1 - date0);"';
  var SCR1 = '<script type="text/javascript" src="assets/jquery-1.7.1.js"></script><script type="text/javascript" src="jquery.imageloader.js"></script>';
  var SCR_ONLOAD1 = 'onLoad="date1 = (new Date()).valueOf();self.focus();$(document.body).imageloader({selector:\'img\', callback:function(){date2 = (new Date()).valueOf();opener.benchmark(date1 - date0, date2 - date0);}})"';

  var URL_PIPE = 'http://pipes.yahoo.com/pipes/pipe.run?_id=29053b7ff74d5086a97cb14ad3ba0aba&_render=json&_callback=receivejsonp&url=';
  var URL = {
    FLICKR: 'http://api.flickr.com/services/feeds/photos_public.gne?format=json',
    '500PX': 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=20&q=http://feed.500px.com/500px-best',
    IMGUR: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=20&q=http://feeds.feedburner.com/ImgurGallery'
  };

  var cityscapes = ['aep.jpg', 'bog.jpg', 'bom.jpg', 'cai.jpg', 'can.jpg', 'ccu.jpg', 'cgk.jpg', 'dac.jpg', 'del.jpg', 'hkg.jpg', 'ist.jpg', 'khi.jpg', 'lax.jpg', 'lcy.jpg', 'lim.jpg', 'los.jpg', 'mex.jpg', 'mnl.jpg', 'mow.jpg', 'nyc.jpg', 'osa.jpg', 'pek.jpg', 'rio.jpg', 'sha.jpg', 'thr.jpg', 'tyo.jpg'];

  var adapter = {};
  var tpl_win;
  var ref_win;
  var tpl_normal;
  var tpl_lazy;
  var opt_win = [
    'width=350',
    'height=350',
    'menuber=0',
    'toolbar=1',
    'status=0',
    'scrollbars=1',
    'resizaable=1'
  ];
  var datastore = [];
  var datastorekey = {};
  var syncflag = [];
  var syncflaglength = 0;

  $(
    function () {
      prettyPrint();
      $('#example-0').click(example0);
      $('#example-1').click(example1);
      $('#example-2').click(example2);
      $('#example-3').click(example3);

      require(
        [
          'assets/flickr.js',
          'assets/five.js',
          'assets/imgur.js'
        ], 
        requireinit
      );
    }
  );

  // ===================================

  var example0 = function (ev) {
    ev.preventDefault();
    $('.lazy-img').imageloader();
  };

  var example1 = function (ev) {
    ev.preventDefault();
    $('.deffered-block').imageloader(
      {
        selector: '.defferred',
        callback: function (elm) {
          $(elm).slideDown();
        }
      }
    );
  };

  var example2 = function (ev) {
    ev.preventDefault();
    $('.my-square-image').imageloader(
      {
        background: true,
        callback: function (elm) {
          $(elm).fadeIn();
        }
      }
    );
  };

  var example3 = function (ev) {
    ev.preventDefault();
    $('.each-img-block').imageloader(
      {
        selector: '.each-img',
        each: function (elm) {
          console.log(elm);
          $(elm).css('visibility', 'hidden');
        },
        callback: function (elm) {
          $(elm)
            .hide()
            .find('.each-img').css('visibility', 'visible');
          $(elm).fadeIn();
        }
      }
    );
  };

  // ===================================

  var requireinit = function (flickr, five, imgur) {
    adapter.flickr = flickr.flickr;
    adapter.five = five.five;
    adapter.imgur = imgur.imgur;
    tpl_win = $.trim( $('#template-window').html() );
    tpl_normal = $.trim( $('#template-imgblock-normal').html() );
    tpl_lazy = $.trim( $('#template-imgblock-lazy').html() );
    startLoading();
  };

  var startLoading = function () {
    syncflag = [];
    syncflaglength = 3;
    calljsonp(URL.FLICKR);
    calljsonp(pipeurl('500PX'));
    calljsonp(pipeurl('IMGUR'));
  };



  var addImages = function () {
    $('#imagecount').html(getImageLoadingLength(datastore));
    $('#imageallcount').html(datastore.length);
    $('#external-load').fadeIn();
    $('#nomarlimageloading').click(onNormalimageloading);
    $('#jqueryimageloading').click(onJqueryimageloading);
  }

  var updateImages = function () {
    $('#imagecount').html(getImageLoadingLength(datastore));
    $('#imageallcount').html(datastore.length);
  }

  var pipeurl = function (id) {
    var url;
    switch (id.toUpperCase()) {
      case '500PX':
      case 'IMGUR':
      	url = URL[id.toUpperCase()];
      break;
    }
    return [URL_PIPE, encodeURIComponent(url)].join('');
  };

  var openNewWindow = function (html) {
    ref_win = window.open('', '_child_win', opt_win.join(','));
    ref_win.document.writeln(html);
    ref_win.document.close();
  };

  window.hasAddedImage = false;
  var processImages = function (arr, key) {
    var init = false;
    if (window.hasAddedImage === false) {
      init = true;
      window.hasAddedImage = true;
    }
    var obj, index;
    loop:for (var i = 0, len = arr.length; i < len; ++i) {
      obj = arr[i];
      if (datastorekey[obj.media]) {
        continue loop;
      }
      index = datastore.length;
      datastore[index] = obj;
      datastorekey[obj.media] = key;
    }
    if (init) {
      addImages();
    }
    else {
      updateImages();
    }
  };

  var getImageLoadingLength = function (arr) {
    var tri1 = arr.length / 3;
    var trimod = tri1 % 3;
    return tri1 - trimod;
  };

  var onNormalimageloading = function (ev) {
    // console.log('onNormalimageloading');
    window.hook = 'all';
    ev.preventDefault();
    var html = [];
    datastore.shuffle();
    for (var i = 0, len = getImageLoadingLength(datastore); i < len; ++i) {
      html[html.length] = Mustache.render(tpl_normal, {src: datastore[i].media});
    }
    newWindow(
      {
        TITLE: 'Normal load', 
        SCRIPT0: SCR0,
        SCRIPT1: SCR1,
        SCRIPTONLOAD: SCR_ONLOAD0
      },
      html.join('')
    );
  };

  var onJqueryimageloading = function (ev) {
    ev.preventDefault();
    window.hook = 'jil';
    // console.log('onJqueryimageloading');
    var html = [];
    datastore.shuffle();
    for (var i = 0, len = getImageLoadingLength(datastore); i < len; ++i) {
      html[html.length] = Mustache.render(tpl_lazy, {src: datastore[i].media});
    }
    newWindow(
      {
        TITLE: 'jQuery.imageloader()!', 
        SCRIPT0: SCR0,
        SCRIPT1: SCR1,
        SCRIPTONLOAD: SCR_ONLOAD1
      },
      html.join('')
    );
  };

  // ===================================

  window.newWindow = function (view, content) {
    view.CONTENT = content;
    var html = Mustache.render(tpl_win, view);
    openNewWindow(html);
  };

  window.benchmark = function (winload, loadup) {
    // console.log('benchmark: ', winload, loadup);
    var $row = $('.tr-' + window.hook);
    if (winload) {
      $row.find('.counter[title="winload"]').html(winload);
    }
    if (loadup) {
      $row.find('.counter[title="loadup"]').html(loadup);
    }
    window.hook = '';
  };

  window.calljsonp = function (url) {
    var i = '_' + ('' + (new Date).valueOf()).slice(-6);
    var s = ['<script type="text/javascript" src="', url, '" id="', i, '"></script>'].join('');
    var $s = $(s);
    $s.load(
      function (ev) {
        $s.remove();
      });
    $(document).append($s);
  };

  window.receivejsonp = function (obj) {
    // console.log('receivejsonp');
    var result;
    var key;

    if (obj) {
      if (obj.generator && obj.generator.indexOf('www.flickr.com') > -1) {
        // console.log('receivejsonp: ', 'flickr');
        result = adapter.flickr(obj);
        key = 'FLICKR';
      }

      try {
        if (!result && obj.value.items[0].responseData.feed.link && obj.value.items[0].responseData.feed.link.indexOf('500px.com') > -1) {
          // console.log('receivejsonp: ', '500px');
          result = adapter.five(obj);
          key = '500PX';
        }
      } catch (er) {}

      try {
        if (!result && obj.value.items[0].responseData.feed.description && obj.value.items[0].responseData.feed.description.indexOf('imgur.com') > -1) {
          // console.log('receivejsonp: ', 'IMGUR');
          result = adapter.imgur(obj);
          key = 'IMGUR';
        }
      } catch (er) {}

      if (!result) {
        // console.log('a new kind');
        // console.log(obj);
        return;
      }
    }
    if (result) {
      processImages(result, key);
    }
    else {
      throw new Error('no results? on ' + key);
    }
  };
  window.jsonFlickrFeed = window.receivejsonp;
})();
