define(function(require, exports, module) {
  exports.imgur = function (obj) {
    console.log('processing imgur');
    return $.map(obj.value.items[0].responseData.feed.entries, processItem);
  };

  var processItem = function (entry, i) {
    var result = {};
    result.media = entry.mediaGroups.contents.url;
    result.author = entry.author;
    result.link = entry.link;
    return result;
  };
});