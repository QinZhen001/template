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
    }, 10000)
  })
}

const nativeHook = {
  onLaunch: async function (option) {
    console.log("plugin onLaunch", option)
    await timeount()
  },
};


function appReportPlugin() {
  return {
    name: 'launch',
    nativeHook: nativeHook,
    custom: {
      xxx: function () {
        console.log("xxx", this)
      },
      asd: () => {
        console.log("asd", this)
      },
    },
  };
};


module.exports = appReportPlugin;
