define(function(require, exports, module) {
  exports.flickr = function (obj) {
    return $.map(obj.items, processItem);
  };

  var processItem = function (entry, i) {
    var result = {};
    result.media = entry.media.m;
    result.author = entry.author;
    result.link = entry.link;
    return result;
  };
});