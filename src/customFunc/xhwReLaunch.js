/**
 * 封装wx.reLaunch (集成options自动存储)
 * @param url 页面url
 * @param success 成功的回调函数
 * @param fail 失败的回调函数
 */
function xhwReLaunch({url, success, fail}) {
  wx.reLaunch({url, success, fail});
}


module.exports = xhwReLaunch;