import {store, xhw} from "./core/index";
import reqConfig from "./config/reqConfig"

import state from "./store/index"
import proxy from './lib/proxy'


// import event from "./plugins/event/index"

const appReportPlugin = require("./plugins/appReportPlugin")
const appReportPlugin2 = require("./plugins/appReportPlugin2")


console.log("proxy", proxy)

console.log("store", store)


// console.log("reqConfig", reqConfig)
// console.log("xhw", xhw.request)
//
// debugger

xhw.app({
  $preLoad: false,
  $consoleLevel: 1,
  onLaunch(options) {
    debugger
    console.log("this", this)
    store.init(state, {
      debug: true,
      updateAll: false,
    })
    xhw.request.init(reqConfig, {store: store})
    // xhw.request.defaults.retryTime = 15000
    // console.log(xhw.request.defaults)
    // debugger
  },
  onShow() {
    console.log("1111onShow", this)
    let app = getApp()
    console.log("app", app.$launch)
  },
  plugins: [
    appReportPlugin,
    appReportPlugin2,
  ],
});


