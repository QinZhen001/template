const sendkv = require('./statistics');

const {env} = require("../config/baseConfig");

const ENV_PROD = "prod";

const MSG_REPORT_KEY = 90099;

/**
 * 往监控队列中添加一项
 * @param{String} item 监控项的名字
 * @param{String} msg 额外消息 (非必填,若存在，会将msg进行key为90099的sendkv上报)
 * @param{Boolean} needSyncOpenId 是否需要同步的OpenId (非必填，默认false)
 */
function addReport(item, msg, needSyncOpenId) {
  if (env == ENV_PROD) {
    global.monitorList = global.monitorList || [];
    if (item) {
      global.monitorList.push(item);
    }
    if (msg) {
      msg = JSON.stringify(msg);
      sendkv({key: MSG_REPORT_KEY, itemid: item, msg: msg}, needSyncOpenId);
    }
  }
}

module.exports = {
  addReport,
};


