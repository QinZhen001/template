/**
 * launch 插件
 * 用于小程序启动时在onLaunch中上报数据
 */
const baseConfig = require('../config/baseConfig');

//启动日志的key
const LAUNCH_KEY = 90030;

// -----------------------------------------------------------------------------


function timeount() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 3000)
  })
}

const nativeHook = {
  onLaunch: async function (option) {
    console.log("plugin onLaunch  222222", option)
  },
};


function appReportPlugin() {
  return {
    name: 'launch2',
    nativeHook: nativeHook,
    inject: {
      ccc: () => {
        console.log("inject aaa")
      },
    },
    custom: {
      custom1: function () {
        console.log("custom1")
      },
      custom2: function () {
        console.log("custom2")
      },
    },
  };
};


module.exports = appReportPlugin;
