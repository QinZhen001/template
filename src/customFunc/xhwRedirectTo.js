/**
 * 封装wx.redirectTo
 * @param url 页面url
 * @param success 成功的回调函数
 * @param fail 失败的回调函数
 */
function xhwRedirectTo({url, success, fail}) {
  wx.redirectTo({url, success, fail});
}


module.exports = xhwRedirectTo;