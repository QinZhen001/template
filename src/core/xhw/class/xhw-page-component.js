import {Host} from "./host";
import {types} from "../../shared/constants";
import {logger} from "../../shared/util"


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
];

const COMPONENT_HOOKS = [
  "created", "attached", "ready", "moved", "detached",
]

/**
 * 把component当做page使用
 * (禁掉不属于page的生命周期)
 * @param option
 */
function checkOption(option) {
  for (let name of COMPONENT_HOOKS) {
    if (option[name]) {
      throw new Error(logger(`XhwPageComponent 不支持生命周期 ${name}`))
    }
  }
  if (option.lifetimes) {
    throw new Error(logger(`XhwPageComponent 不支持生命周期 lifetimes`))
  }
}

class XhwPageComponent extends Host {
  constructor(option) {
    checkOption(option)
    super({
      type: types.pageComponent,
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

function pageComponent(option) {
  const pageComponent = new XhwPageComponent(option);
  Component(pageComponent);
}

export {XhwPageComponent, pageComponent};
