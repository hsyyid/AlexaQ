/**
* Util function to transform JSON object to url encoded format
*/
function urlEncode(obj) {
    return Object.keys(obj).map(function(key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
    }).join("&");
}
  
module.exports = {
    urlEncode
}
