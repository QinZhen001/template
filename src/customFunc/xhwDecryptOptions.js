const qqtea = require("../lib/qqtea");

// 用于分享加密解密的key
const TEA_KEY = "XHW_SHARE_ENCRYPT";


/**
 * 解密options
 * @param options
 * @returns {*}
 */
function xhwDecryptOptions(options) {
  if (options.xhw) {
    let cipherText = decodeURIComponent(options.xhw);
    return _str2Query(qqtea.decrypt(cipherText, TEA_KEY));
  }
  return options;
}

// ---------------------------------------------------------------------------

/**
 * 将aaa=aaa&bbb=bbb =>  {aaa:"aaa",bbb:"bbb"}
 * @param{String} str
 * @private
 */
function _str2Query(str) {
  // console.log("_str2Query", str);
  let obj = {};
  str.split("&").forEach(item => {
    let temp = item.split("=");
    obj[temp[0]] = temp[1];
  });
  return obj;
}


module.exports = xhwDecryptOptions;