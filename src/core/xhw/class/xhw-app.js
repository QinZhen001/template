import {Host} from "./host";
import {types} from "../../shared/constants";
import {initPreLoad} from "../instance/preload"
import {initConsole} from "../instance/console"

const NATIVE_HOOKS = [
  // 保持第 0 位，为启动钩子
  "onLaunch",
  "onShow",
  "onHide",

  // onError 不能监听，发生错误的时候，会发生死循环。
  // 'onError',

  "onPageNotFound",
];

class XhwApp extends Host {
  constructor(option) {
    super({
      type: types.app,
      nativeHookNames: NATIVE_HOOKS,
      launchHookName: NATIVE_HOOKS[0],
      option,
    });
    // 初始化预加载
    initPreLoad(this)
    // 初始化console
    initConsole(this)
    // console.log("this.$hot", this, this.$hot)
  }
}

/**
 * 启动app
 */
function app(option) {
  const app = new XhwApp(option);
  // console.log(app)
  // debugger
  App(app);
}

export {XhwApp, app};
