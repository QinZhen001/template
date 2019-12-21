// 文档地址: http://doc.heywoods.cn/web/#/11?page_id=13

const baseConfig = require('../config/baseConfig');

const sdk = require('../sdk/index');


/**
 * kv数据上报
 * @param{Object} data 需要上报的数据
 * @param{Boolean} needSyncOpenId 是否需要同步的openId (非必填，默认false)
 */
async function sendkv(data = {}, needSyncOpenId) {
  let commonData = await addCommonParams(needSyncOpenId);
  // console.log('data', data);
  let option = {
    url: baseConfig.prefixReportUrl,
  };
  // console.log('commonData', commonData);
  sdk.sendkv(option, commonData, data);
}


async function getCommonOpenId(needSyncOpenId) {
  if (needSyncOpenId) {
    return wx.getStorageSync('openId');
  } else {
    console.log('getCommonOpenId')
    return wx.store.get('openId');
  }
}

async function addCommonParams(needSyncOpenId) {
  let promiseArr = [];
  let commonData = {};
  promiseArr.push(
    wx.store.get('phoneInfo'),
    wx.store.get('unionId'),
    getCommonOpenId(needSyncOpenId),
    getNetworkType(),
  );
  let resArr = [];
  try {
    resArr = await Promise.all(promiseArr);
  } catch (e) {
    console.error(e);
  }
  let phoneInfo = resArr[0];
  for (const key in phoneInfo) {
    if (phoneInfo.hasOwnProperty(key)) {
      commonData[key] = phoneInfo[key];
    }
  }
  commonData.unionid = resArr[1] || "NULL";
  commonData.openid = resArr[2] || "NULL";
  commonData.network_ = translateNetworkType(resArr[3].networkType);
  let date = new Date();
  commonData.timestamp_ = (date.getTime()).toString();
  commonData.data_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  commonData.appid = baseConfig.appId || "NULL";
  commonData.server_type = baseConfig.env === "prod" ? 1 : 0;
  return commonData;
}


/**
 * 获取网络状态
 * @returns {Promise<any>}
 */
function getNetworkType() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success(res) {
        return resolve(res);
      },
      fail(res) {
        return reject(res);
      },
    });
  });
}

function translateNetworkType(type) {
  switch (type) {
    case 'wifi':
      return "0";
    case 'unknown':
      return "1";
    case '2g':
      return "2";
    case '3g':
      return "3";
    case '4g':
      return "4";
    case 'none':
      return "5";
    default:
      return "NULL";
  }
}


module.exports = sendkv;