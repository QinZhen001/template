import {store, xhw} from "@xhw/core";
import event from "@xhw/plugin-event"
// import bucket from "@xhw/plugin-bucket"
import reqConfig from "./config/reqConfig"
import bucketConfig from "./config/bucketConfig";
import state from "./store/index"

import bucket from "./plugins/src/index"


import appReportPlugin from "./plugins/appReportPlugin"

xhw.app({
  $preLoad: true,
  $consoleLevel: 1,
  onLaunch(options) {
    debugger
    console.log("this", this)
    store.init(state, {debug: true, updateAll: false})
    xhw.request.init(reqConfig, {store: store, retryTime: 5000})
  },
  onShow() {

  },
  plugins: [
    appReportPlugin,
    event,
    bucket(bucketConfig),
  ],
});


