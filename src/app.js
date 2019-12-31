import {xhw} from "./core/index";
import reqConfig from "./config/reqConfig"

import state from "./store/index"
import store from "./plugins/store/index"

import event from "./plugins/event/index"

import proxy from './lib/proxy'


const appReportPlugin = require("./plugins/appReportPlugin")
const appReportPlugin2 = require("./plugins/appReportPlugin2")


console.log("proxy", proxy)

// console.log("reqConfig", reqConfig)
// console.log("xhw", xhw.request)
//
// debugger

xhw.app({
  $preLoad: true,
  $consoleLevel: 1,
  async onLaunch(options) {
    console.log("this", this)
    xhw.request.init(reqConfig, this.$store)
    // xhw.request.defaults.retryTime = 15000
    this.testConsole()
    // console.log(xhw.request.defaults)
    // debugger

    // let res = await xhw.request("testNormal")
    // console.log("res", res)
    // debugger
    // let aaa = (console === wx.console)
    // // debugger
    // console.log("1111", this.$type, this)
  },
  testConsole() {
  },
  onShow() {
    console.log("1111onShow", this)
    let app = getApp()
    console.log("app", app.$launch)
  },
  plugins: [
    appReportPlugin,
    appReportPlugin2,
    store(state),
    event,
  ],
});




