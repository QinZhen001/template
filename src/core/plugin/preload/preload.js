// 与xhwNavigateTo中的key对应
const PRE_DATA_KEY = 'preData';

const PRELOAD_NAME = "preLoadName";

/**
 * 创建preLoad生命周期钩子
 * 对theHost的preLoad进行封装
 * @param theHost 真实页面的上下文环境
 */
function initialize({theHost}) {
  if (theHost.preLoad) {
    const preData = global[PRE_DATA_KEY];
    if (preData) {
      theHost.preLoad(preData);
    } else {
      const event = getApp().event;
      if (!event) {
        throw new SyntaxError(`preLoad插件 需要使用app下的event插件,请先注册event插件`);
      }
      let pageList = getCurrentPages();
      let pageLen = pageList.length;
      let eventName = pageList[pageLen - 1].route;
      event.once(eventName, data => theHost.preLoad(data));
      global[PRELOAD_NAME] = eventName;
    }
  }
};

const nativeHook = {
  onHide: function () {
    let pageList = getCurrentPages();
    let pageLen = pageList.length;
    let eventName = pageList[pageLen - 1].route;
    getApp().event.off(global[PRELOAD_NAME]);
  },
};


// 预加载插件
module.exports = function () {
  return {
    name: 'preload',
    initialize: initialize,
    nativeHook: nativeHook,
  };
};