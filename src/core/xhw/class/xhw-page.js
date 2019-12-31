import {Host} from "./host";
import {types} from "../../shared/constants";

const NATIVE_HOOKS = [
  // 保持第 0 位，为启动钩子
  "onLoad",
  "onShow",
  "onReady",
  "onHide",
  "onUnload",

  // 自定义的生命周期
  "onHotLoad",
  "onHotShow",

  // 'onPullDownRefresh',
  // 'onReachBottom',
  // 'onPageScroll',
  // 'onResize',
  // 'onTabItemTap',

  // 因为 onShareAppMessage 需要同步返回一个 object，所以暂时不实现
  // 'onShareAppMessage',
];

class XhwPage extends Host {
  constructor(option) {
    super({
      type: types.page,
      option,
      nativeHookNames: NATIVE_HOOKS,
      launchHookName: NATIVE_HOOKS[0],
    });
  }

  _pushUnloadFun(func) {
    super._pushUnloadFun(func)
    this.$hookQueueMap.onUnload.push(func)
  }
}

function page(option) {
  const page = new XhwPage(option);
  Page(page);
}

export {XhwPage, page};
