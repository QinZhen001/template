const SHARE_REPORT_KEY = 90033;
// const baseConfig = require('../config/baseConfig');
const sendkv = require('./statistics');
// const sign = require('../lib/sign');
const qqtea = require("../lib/qqtea");
const {transformPath} = require("./util");


// 用于分享加密解密的key
const TEA_KEY = "XHW_SHARE_ENCRYPT";

function getOpenIdSync() {
  return wx.store.state.openId || wx.getStorageSync('openId') || "NULL";
}

/**
 * 获取最终的channel值
 * 当 channel不存在 => 'none'
 * 当 channel____ =>  channel_4
 * 当 channel_2 => channel_3
 *
 * @return {String}
 * @private
 */
function _getFinalChannel() {
  let channel = global.channel;
  if (!channel) {
    return 'none';
  }
  if (!/_/.test(channel)) {
    return `${channel}_`;
  }
  if (/[0-9]+/.test(channel)) {
    // 有数字
    let matchArr = channel.match(/[0-9]+/);
    let num = matchArr[0];
    num = parseInt(num) + 1;
    return channel.replace(/[0-9]+/, num);
  } else {
    // 没有数字
    let firstIndex = channel.indexOf('_');
    //num指所有_的数量  (第一个_不算 且 转发num要+1 相互抵消)
    let num = channel.length - firstIndex;
    return channel.replace(/_+/, `_${num}`);
  }
}


/**
 * 使用tea算法加密path
 * (若path中带有xhw字段，则需要解密)
 * @param path
 * @returns {String} 加密后的path
 * @private
 */
function _encryptPath(path) {
  let index = path.indexOf("?");
  if (index !== -1) {
    let aheadStr = path.slice(0, index);
    let laterStr = path.slice(index + 1, path.length);
    let encryptText = encodeURIComponent(qqtea.encrypt(laterStr, TEA_KEY).toString());
    path = `${aheadStr}?xhw=${encryptText}`;
  }
  return path;
}


/**
 * 解析路径提取特定参数加入data
 * @param{Object} data sendkv需要上报的数据
 * @param{String} path 传进的分享路径
 */
function addPathQuery(data, path) {
  const {queryObj} = transformPath(path);
  Object.keys(queryObj).forEach(key => {
    if (key === "exp_material_id" || key === "exp_id") {
      data[`option_${key}`] = queryObj[key];
    }
  });
}

/**
 * 将option添加至data
 * @param{Object} data sendkv需要上报的数据
 * @param{Object} options 触发分享的页面url解析出来的query对象
 */
function addOptionQuery(data, options) {
  Object.keys(options).forEach(key => {
    data[`option_${key}`] = options[key];
  });
}

// ----------------------------------------------------

/**
 * 对分享进行封装
 * @param{Object} params包含path，title，imageUrl
 *    @param{String} path 页面路径
 *    @param{String} title 标题
 *    @param{String} imageUrl 图片url
 * @param{Boolean} needEncrypt (是否需要加密，默认false)
 * @returns {{title, path, imageUrl}}
 */
function xhwShare({path = "/pages/index/index", title = "", imageUrl}, needEncrypt = false) {
  if (!path) {
    throw new Error(`xhwShare 需要一个path`);
  }
  let pageList = getCurrentPages();
  /* eslint-disable */
  let pageLen = pageList.length;
  let curPage = pageList[pageLen - 1];
  /* eslint-disable */
  let channel = _getFinalChannel();
  let from_userid = getOpenIdSync();
  let timestamp = new Date().getTime();
  let trace_id = `${from_userid}${timestamp}`;
  let data = {
    key: SHARE_REPORT_KEY,
  };
  curPage.route && (data.page_path = curPage.route);
  curPage.options.article_id && (data.article_id = curPage.options.article_id);
  addOptionQuery(data, curPage.options);
  addPathQuery(data, path);
  sendkv(data);
  //处理路径
  let str = path.indexOf('?') !== -1 ?
    `&channel=${channel}&from_userid=${from_userid}&trace_id=${trace_id}` :
    `?channel=${channel}&from_userid=${from_userid}&trace_id=${trace_id}`;
  path = path + str;
  // console.log("加密前", path);
  if (needEncrypt) {
    path = _encryptPath(path);
  }
  // console.log("加密后", path);
  return {
    title: title,
    path: path,
    imageUrl: imageUrl,
  };
}


module.exports = xhwShare;