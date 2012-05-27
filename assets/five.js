define(function(require, exports, module) {
  exports.five = function (obj) {
    // console.log('processing five');
    return $.map(obj.value.items[0].responseData.feed.entries, processItem);
  };

  var reg_img = /<img[^>]+>/gi;
  var reg_anc = /<a[^>]+>/gi;
  var reg_src = /src="([^"]*)"/i;
  var reg_href = /href="([^"]*)"/i;

  var processItem = function (entry, i) {
    var result = {};
    result.link = entry.link;
    var arr, myattr;
    arr = entry.content.match(reg_img);
    if (arr && arr.length) {
      myattr = arr[0].match(reg_src);
      if (myattr && myattr.length) {
        result.media = myattr[1];
      }
    }

    arr = entry.content.match(reg_anc);
    if (arr && arr.length) {
      myattr = arr[0].match(reg_href);
      if (myattr && myattr.length) {
        result.author = myattr[1];
      }
    }
    return result;
  };
});