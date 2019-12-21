/**
 * 此文件放store的辅助函数
 */
const custom = require('../customFunc/index');
const baseConfig = require('../config/baseConfig');
const util = require('../util/util');
const Base64 = require('../lib/Base64.js');
const INIT_INFO_KEY = 'initInfo';
const base64 = new Base64();

/**
 * 获取openId，发送请求
 */
async function getOpenIdByRequest() {
  let openId = null;
  console.log('getOpenIdByRequest')
  try {
    let mixData = (await custom.xhwRequest('makeSession')).data.mixData;
    console.log('mixData', mixData)
    openId = base64.decode(mixData.baseid);
    wx.setStorageSync('openId', openId);
    wx.setStorageSync('expireTime', mixData.expire_time);
  } catch (e) {
    console.error(e);
  }
  console.log('makeSession获取openId', openId);
  return openId;
}


/**
 * 获取sessionId，发送请求
 */
async function getSessionIdByRequest () {
  let sessionId = null;
  try {
    sessionId = (await custom.xhwRequest('makeSession')).data.mixData.sessionid;
  } catch (e) {
    console.error(e);
  }
  console.log('makeSession获取sessionId', sessionId);
  return sessionId;
}

/**
 * 获取session key过期时间
 */
async function getExpireTimeByRequest() {
  let expireTime = null;
  try {
    expireTime = (await custom.xhwRequest('makeSession')).data.mixData.expire_time;
    wx.setStorageSync('expireTime', expireTime);
  } catch (e) {
    console.error(e);
  }
  console.log('makeSession获取expireTime', expireTime);
  return expireTime;
}

/**
 * 获取系统信息
 */
function getSystemInfo () {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: res => {
        resolve(res);
      },
      fail: rej => reject(rej),
    });
  });
}


/**
 * 获取手机信息
 */
function getPhoneInfo () {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: res => {
        const systemInfo = res.system.split(' ');
        const phoneInfo = {
          platform_: systemInfo[0],
          system_version: systemInfo[1],
          brand: res.brand,
          model: res.model,
          wxversion: res.version,
          wx_language: res.language,
          app_version: baseConfig.clientVersion,
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        };
        wx.setStorageSync('phoneInfo', phoneInfo);
        resolve(phoneInfo);
      },
      fail: rej => reject(rej),
    });
  });
}


/**
 * 获取登录凭证
 */
// function pyWxLogin() {
//   return new Promise((resolve, reject) => {
//     let name = "login";
//     global.singleton = global.singleton || {};
//     global.singleton[name] = global.singleton[name] || [];
//     global.singleton[name + 'lock'] = global.singleton[name + 'lock'] || false;
//     if (!global.singleton[name + 'lock']) {
//       global.singleton[name + 'lock'] = true;
//       wx.login({
//         success: (res) => {
//           resolve(res);
//           let promise = null;
//           // eslint-disable-next-line
//           while (promise = global.singleton[name].shift()) {
//             promise.resolve(res);
//           }
//           global.singleton[name + 'lock'] = false;
//         },
//         fail: (res) => {
//           reject(res);
//           let promise = null;
//           // eslint-disable-next-line
//           while (promise = global.singleton[name].shift()) {
//             promise.reject(res);
//           }
//           global.singleton[name + 'lock'] = false;
//         },
//       });
//     } else {
//       global.singleton[name].push({resolve, reject});
//     }
//   });
// }


function pyWxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        resolve(res);
      },
      fail: (res) => {
        reject(res);
      },
    });
  });
}

/**
 * 获取init信息，发送请求
 * (此方法会自动将返回结果保存到store)
 * api文档: https://www.showdoc.cc/48641121738702?page_id=1171813150871220
 */
async function getInitInfoByRequest (data = {}) {
  let initInfo = null;
  let requestName;
  try {
    try { //init新接口
      requestName = baseConfig.useContent2 ? 'getNewInitInfo2' : 'getNewInitInfo';
      initInfo = (await custom.xhwRequest(requestName)).data;
    } catch (e) { //旧json
      console.log('init新接口失败---使用旧json', e)
      requestName = baseConfig.useContent2 ? 'getInitInfo2' : 'getInitInfo';
      initInfo = (await custom.xhwRequest(requestName)).data;
    }
    // 进一步处理数据
    _dealData(initInfo);
    wx.store.commit('closeService', initInfo.close_service);
    //设置resourceSignKey(url鉴权的key)
    if (initInfo.resource_sign_key) {
      wx.store.commit('resourceSignKey', initInfo.resource_sign_key);
    }
    wx.store.commit('initInfo', initInfo);
  } catch (e) {
    console.error(e);
  }
  // console.log('获取initInfo', initInfo);
  return initInfo;
}

/**
 * 获取bTest，发送请求
 * (此方法会自动将返回结果保存到store)
 */
async function getAbTestByRequest () {
  let abTestData = null;
  try {
    abTestData = (await custom.xhwRequest('getAbTest')).data.data;
    abTestData = _changeAbTestJson(abTestData);
    wx.store.commit('abTestData', abTestData);
    _checkFourthReq(abTestData);
  } catch (e) {
    console.error(e);
  }
  console.log('获取abTestData', abTestData);
  return abTestData;
}

/**
 * 获取广告列表，发送请求
 * (此方法会自动将返回结果保存到store)
 */
async function getAdListByRequest () {
  let adListData = null;
  try {
    adListData = (await custom.xhwRequest('getAdList')).data;
    wx.store.commit('adListData', adListData);
  } catch (e) {
    console.error(e);
  }
  console.log('获取adListData', adListData);
  return adListData;
}

/**
 * 获取固定广告和广告池列表，发送请求
 * (此方法会自动将返回结果保存到store)
 */
async function getGeneralAdListByRequest () {
  let generalAdList = null;
  try {
    generalAdList = (await custom.xhwRequest('getGeneralAdList')).data;
    wx.store.commit('generalAdList', generalAdList);
  } catch (e) {
    console.error(e);
  }
  console.log('获取generalAdList', generalAdList);
  return generalAdList;
}

/**
 * 获取缺省广告池列表，发送请求
 * (此方法会自动将返回结果保存到store)
 */
async function getDefaultAdListByRequest () {
  let defaultAdList = null;
  try {
    defaultAdList = (await custom.xhwRequest('getDefaultAdList')).data;
    wx.store.commit('defaultAdList', defaultAdList);
  } catch (e) {
    console.error(e);
  }
  console.log('获取defaultAdList', defaultAdList);
  return defaultAdList;
}

/**
 * 获取微信广告池列表，发送请求
 * (此方法会自动将返回结果保存到store)
 */
async function getWechatAdListByRequest () {
  let wechatAdList = null;
  try {
    wechatAdList = (await custom.xhwRequest('getWechatAdList')).data;
    wx.store.commit('wechatAdList', wechatAdList);
  } catch (e) {
    console.error(e);
  }
  console.log('获取wechatAdList', wechatAdList);
  return wechatAdList;
}


/**
 * 获取轮播广告列表，发送请求
 * (此方法会自动将返回结果保存到store)
 */
async function getBannerAdListByRequest () {
  // let adListData = null;
  let bannerAdList = [];
  try {
    bannerAdList = (await custom.xhwRequest('getAdPoolList')).data.lunbo;
    // for (let v of adListData.weixin_list) {
    //   if (v.id == 'weixin01' || v.id == 'weixin02') {
    //     // weixin_list.push(v)
    //   } else {
    //     bannerAdList.push(v);
    //   }
    // }
    wx.store.commit('bannerAdList', bannerAdList);
  } catch (e) {
    console.error(e);
  }
  console.log('获取bannerAdList', bannerAdList);
  return bannerAdList;
}

/**
 * 获取广告池列表，发送请求
 * (此方法会自动将返回结果保存到store)
 */
async function getAdPoolListByRequest () {
  let adPoolListData = null;
  let result = [];
  try {
    adPoolListData = (await custom.xhwRequest('getAdPoolList')).data;
    wx.store.commit('defaultAdPoolData', [adPoolListData.default.default_])
    wx.store.commit('jiliAdData', adPoolListData.jili_ad)
    wx.store.commit('zantingAdData', adPoolListData.zanting)
    let weixin_list = []
    // let bannerAdList = []
    for (let v of adPoolListData.weixin_list) {
      if (v.id == 'weixin01' || v.id == 'weixin02') {
        weixin_list.push(v);
      }
    }
    // wx.store.commit('bannerAdList', bannerAdList)
    global.wechatAdList = adPoolListData.weixin_list
    if (adPoolListData.use_pool) {
      for (let item of adPoolListData.ad_list) {
        if (item.type == 2) { //跳转链接带参数
          if (item.path) {
            item.path += item.path.indexOf('?') !== -1 ? '&refer_app_scene=10' : '?refer_app_scene=10';
          } else {
            item.path = '/pages/index/index?refer_app_scene=10'
          }
        }
      }
      result = adPoolListData.ad_list;
    }
    console.log('广告数据 adPoolListData store', result);
    wx.store.commit('adPoolListData', result);
  } catch (e) {
    console.error(e);
  }
  console.log('获取adPoolListData', adPoolListData);
  return result;
}

/**
 * 获取用户状态(白名单)，发送请求
 * (此方法会自动将返回结果保存到store)
 */
// async function getUserStatusByRequest(params) {
//   let userStatus = null;
//   try {
//     userStatus = (await custom.xhwRequest('getUserStatus')).data.data.status;
//     wx.store.commit('userStatus', userStatus);
//   } catch (e) {
//     console.error(e);
//   }
//   console.log('获取userStatus', userStatus);
//   return userStatus;
// }


// ------  内置方法不对外暴露  ------


/**
 * 处理init信息数据
 *  @param {Object} initInfo init信息
 */
async function _dealData (initInfo) {
  let curVersion = await wx.store.get('version');
  let isGreaterLatestVersion = util.compareVersion(curVersion, initInfo.latest_version);
  if (initInfo.pendant && isGreaterLatestVersion && initInfo.version_status === 2) {
    //当前的版本大于最新的版本 且 处于审核状态 关掉所有挂件
    initInfo.pendant = [];
  }
  //增加version_close字段(提审状态但不影响线上)
  initInfo.version_close = (isGreaterLatestVersion && initInfo.version_status === 2);
}


/**
 * 处理abTest数据
 * @param {Array} data abTest数据
 */
function _changeAbTestJson (data) {
  var abTestDatajson = {};
  for (let e in data) {
    if (data[e] && typeof data[e] == 'object') {
      for (let t in data[e]) {
        abTestDatajson[data[e][t].key] = data[e][t].value;
      }
    }
  }
  return abTestDatajson;
}


/**
 * 检查是否第四范式
 * @param {Object} data abTest数据
 */
async function _checkFourthReq (data) {
  if (data && data.fourthReq && data.fourthReq == '1') {
    if (baseConfig.useFourth) {
      console.log('第四范式被abtest覆盖到上报');
      custom.sendkv({
        key: 90050,
      });
    }
  }
}

/**
 * 获取分发配置
 */
const getDistributeInfo = async () => {
  let distributeInfo = null;
  try {
    distributeInfo = (await custom.xhwRequest('getDistributeInfo')).data;
    wx.store.commit('distributeInfo', distributeInfo);
  } catch (e) {
    console.error(e);
  }
  // console.log('获取distributeInfo', distributeInfo);
  return distributeInfo;
};

module.exports = {
  getSystemInfo,
  pyWxLogin,
  getOpenIdByRequest,
  getSessionIdByRequest,
  getInitInfoByRequest,
  getAbTestByRequest,
  getAdListByRequest,
  getAdPoolListByRequest,
  getGeneralAdListByRequest,
  getDefaultAdListByRequest,
  getWechatAdListByRequest,
  getPhoneInfo,
  getBannerAdListByRequest,
  getDistributeInfo,
  getExpireTimeByRequest
  // getUserStatusByRequest
};