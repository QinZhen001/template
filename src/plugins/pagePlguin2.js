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
  onLoad: async function (option) {
    console.log("plugin onLoad 22222", option)
    await timeount()
  },
};


function appReportPlugin() {
  return {
    name: 'page2',
    nativeHook: nativeHook,
  };
};


module.exports = appReportPlugin;
