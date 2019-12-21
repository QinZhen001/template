const Host = require('./host');
const {types, EVENT_HOT_READY} = require("../../shared/constants")

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
}


Info.prototype.$ccc = () => {
  console.log("ccc")
}
Info.prototype.$eee = () => {
  console.log("ccc")
}

Info.prototype.$ddd = "$ddd"


function page(option) {
  // let info = new Info(option)
  // console.log(info.$aaa === Info.prototype.$aaa)
  // debugger
  // Page(info)


  const page = new XhwPage(option)
  let info = page.getInfo()
  info.aaa = function () {
    console.log("aaa", this)
  }
  info.bbb = "bbb"
  Page(info)
}


module.exports = {
  XhwPage,
  page,
};
