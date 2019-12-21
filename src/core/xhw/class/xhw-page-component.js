const Host = require("./host")
const {types, EVENT_HOT_READY, DOMAIN_METHODS} = require("../../shared/constants")
const {isFunction} = require("../../shared/util")


const NATIVE_HOOKS = [
  // 保持第 0 位，为启动钩子
  'onLoad',
  'onShow',
  'onReady',
  'onHide',
  'onUnload',

  // 自定义的生命周期
  "onHotLoad",
  "onHotShow",

  // 'onPullDownRefresh',
  // 'onReachBottom',
  // 'onPageScroll',
  // 'onResize',
  // 'onTabItemTap',
];


class XhwPageComponent extends Host {
  constructor(option) {
    super({
      type: types.pageComponent,
      option,
      nativeHookNames: NATIVE_HOOKS,
      launchHookName: NATIVE_HOOKS[0],
    });
  }
}


class Info {
  constructor(props) {
    Object.keys(props).forEach(key => {
      this[key] = props[key]
    })
  }

  $aaa() {
    console.log("aaa")
  }

  $wer() {
  }
}

Info.prototype.$ccc = () => {
  console.log("ccc")
}

Info.prototype.$cc1 = () => {
  console.log("ccc")
}

Info.prototype.ccc2 = () => {
  console.log("ccc")
}

function pageComponent(option) {
  // const pageComponent = new XhwPageComponent(option)
  // let info = pageComponent.getInfo()
  // info.aaa = () => {
  //   console.log("aaa")
  // }
  // console.log("info", info.__proto__)
  // console.log("info", info.prototype)
  // info.__proto__.ccc = () => {
  //   console.log("aaa")
  // }
  let info = new Info(option)
  // info.$ddd = "asdasd"
  info.methods.$asd = () => "asfas"
  // debugger
  Component.aaa = "aaa"
  Component(info)
}

module.exports = {
  XhwPageComponent,
  pageComponent,
};


