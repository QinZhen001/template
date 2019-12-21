const Host = require('./host');
const {types} = require("../../shared/constants")


const NATIVE_HOOKS = [
  // 保持第 0 位，为启动钩子
  'onLaunch',
  'onShow',
  'onHide',

  // onError 不能监听，发生错误的时候，会发生死循环。
  // 'onError',

  'onPageNotFound',
];


class XhwApp extends Host {
  constructor(option) {
    super({
      type: types.app,
      nativeHookNames: NATIVE_HOOKS,
      launchHookName: NATIVE_HOOKS[0],
      option,
    });

    console.log("this.$hot", this, this.$hot)
  }
}


/**
 * 启动app
 */
function app(option) {
  console.log("111")
  const app = new XhwApp(option)
  App(app.getInfo())
}

module.exports = {
  XhwApp,
  app,
};
