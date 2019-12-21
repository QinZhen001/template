/**
 * 页面跳转方法 (集成预加载机制 和 options自动存储)
 * @param{Number} level (页面层级大于level则采用redirectTo)
 * @param{String} url 页面url
 * @param{Function} success 成功的回调函数
 * @param{Function} fail 失败的回调函数
 * @param{Function} preGet 数据预加载函数 (用于预加载机制，返回数据对象 或 Promise)
 * @returns {Promise<void>}
 */
async function xhwNavigateTo({level = 9, url, success, fail, preGet}) {
  if (!url) {
    throw new Error(`xhwNavigateTo 需要一个正确的url`);
  }
  let pageList = getCurrentPages();
  let pageLen = pageList.length;
  if (pageLen > level) {
    wx.redirectTo({url, success, fail});
  } else {
    wx.navigateTo({url, success, fail});
  }
  if (preGet) {
    if (typeof preGet !== "function") {
      throw new Error(`xhwNavigateTo 传入的preGet必须为一个函数`);
    }
    const event = getApp().event;
    if (!event) {
      throw new SyntaxError(`preLoad插件需要使用app下的event插件,请先注册event插件`);
    }
    // 要事件名和事件一一对应 这里用url前面部分命名
    // "/pages/test/index?aaa=aaa&bbb=bbb" => "pages/test/index"
    let index = url.indexOf("?");
    let length = url.length;
    let eventName = index === -1 ? url.slice(1, length) : url.slice(1, index);
    let PreData = await preGet();
    // console.log("PreDataPreData", PreData, typeof preGet, typeof PreData);
    global["preData"] = PreData;
    event.trigger(eventName, PreData);
  } else {
    global["preData"] = null;
  }
}


module.exports = xhwNavigateTo;