/**
 * launch 插件
 * 用于小程序启动时在onLaunch中上报数据
 */
const baseConfig = require('../config/baseConfig');
const sendkv = require('../customFunc/statistics');
const xhwDecryptOptions = require("../customFunc/xhwDecryptOptions");
const {isPlainObject, query2Obj} = require("./helper");

//启动日志的key
const LAUNCH_KEY = 90030;


/**
 * 往data中添加其他参数 如：channel   (只在app.onLaunch中使用)
 * @param option app.onLaunch()中的option
 * @param data 启动日志应该上报的数据
 * @returns data 增加了其他参数的data
 */
function _getOptionParams(data, option) {
  let options = xhwDecryptOptions(option.query);
  if (options && isPlainObject(options)) {
    for (let key in options) {
      if (options[key]) {
        data[`option_${key}`] = options[key];
      }
    }
    if (options.channel) {
      global.channel = options.channel;
    }
    if (options.scene) {
      // console.log('option.query.scene', option.query.scene);
      let sceneVal = query2Obj(options.scene);
      if (sceneVal.channel) {
        data['option_channel'] = sceneVal.channel;
        global.channel = sceneVal.channel;
      }
    }
  }
  if (option.referrerInfo && option.referrerInfo.appId && isPlainObject(option.referrerInfo)) {
    data.refer_appid = option.referrerInfo.appId;
  }
}


/**
 * 启动上报增加 location_type 和 geo_code
 * 文档：https://www.showdoc.cc/DataCommonInfo4Heywoods?page_id=1412059024678359
 * @param data
 * @returns {Promise<void>}
 */
async function _addLocationData(data) {
  const initInfo = (await wx.store.get('initInfo')) || {};
  // 0表示非目标位置
  let locationType = 0;
  const tagList = initInfo.tag_list;
  if (tagList) {
    for (let item of tagList) {
      if (item.type === 8) {
        // 1表示用户IP处于目标位置 (目标用户)
        locationType = 1;
        // 目标用户上报geo_code
        item.geo_code && (data.geo_code = item.geo_code);
        break;
      }
    }
  }
  data.location_type = locationType;
}

// -----------------------------------------------------------------------------


const nativeHook = {
  onLaunch: async function (option) {
    // 优先存储scene
    global.scene = option.scene || "NULL";
    try {
      const res = wx.getSystemInfoSync();
      let systemInfo = res.system.split(' ');
      let phoneInfo = {
        platform_: systemInfo[0] || "NULL",
        system_version: systemInfo[1] || "NULL",
        brand: res.brand || "NULL",
        model: res.model || "NULL",
        wxversion: res.version || "NULL",
        wx_language: res.language || "NULL",
        app_version: baseConfig.clientVersion || "NULL",
        sdkVersion: res.SDKVersion || "NULL",
        windowWidth: res.windowWidth || "NULL",
        windowHeight: res.windowHeight || "NULL",
      };
      wx.store.set("phoneInfo", phoneInfo);
      let data = {
        key: LAUNCH_KEY,
        scene: option.scene || "NULL",
        screen_width: res.screenWidth || "NULL",
        screen_height: res.screenHeight || "NULL",
        pixel_ratio: res.pixelRatio || "NULL",
      };
      _getOptionParams(data, option);
      await _addLocationData(data);
      sendkv(data);
    } catch (e) {
      console.log(e);
    }
  },
};


function appReportPlugin() {
  return {
    name: 'launch',
    nativeHook: nativeHook,
  };
};


module.exports = appReportPlugin;
