// 文档地址: http://doc.heywoods.cn/web/#/11?page_id=13

const qqtea = require("../../lib/qqtea");
const {isPainObject} = require('../helper/util');
const {stringToBytes} = require("../helper/util");

const TEA_KEY = "XHW_SHARE_ENCRYPT";

// 队列锁
let lock = false;
// 请求队列
let queue = [];


function sendkv(option, commonData, data) {
  if (lock) {
    //存在锁,此时直接将数据丢入队列
    _pushDataToQueue(data);
  } else {
    //不存在锁,开始上锁
    lock = true;
    if (queue.length === 0) {
      //请求队列为空,直接发送请求
      _sendReport(option, commonData, data);
    } else {
      //请求队列不为空，请求队列添加一个元素
      _pushDataToQueue(data);
      // 发起请求
      _sendReport(option, commonData, queue);
    }
  }
}


// ------ 以下是内置方法，不对外暴露 ------


function _pushDataToQueue(data) {
  queue.push(data);
}


/**
 * 遍历obj 将obj中的属性中值 空 => "NULL"
 * @param{Object} obj
 * @private
 */
function _emptyToNull(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === "" || obj[key] == null) {
      obj[key] = "NULL";
    }
  });
}


function _sendReport(option, commonData = {}, report) {
  let data = {
    data: [],
  };
  if (isPainObject(report)) {
    _emptyToNull(report);
    //单条请求
    data.data.push(report);
  } else {
    //多条请求 这里report就是queue
    report.forEach(item => {
      _emptyToNull(item);
      // console.log('item', item);
      data.data.push(item);
    });
    //迅速置空队列
    queue = [];
  }
  data = {...data, ...commonData};
  console.log("数据上报: ", data);
  data = qqtea.encrypt(JSON.stringify(data), TEA_KEY);
  data = stringToBytes(data.toString());
  const params = {
    url: option.url,
    data,
    method: option.method || 'POST',
    header: option.header || {'content-type': 'application/json'},
    success: (res) => {
      _onCompleted(option, commonData, res);
    },
    fail: (res) => {
      _onRejected(res);
    },
  };
  if (wx.nextTick) {
    wx.nextTick(() => {
      wx.request(params);
    });
  } else {
    //不存在wx.nextTick
    wx.request(params);
  }
}


function _onCompleted(option, commonData, res) {
  if (queue.length === 0) {
    //_sendReport请求过程中，外部没有调用sendkv接口 所以queue为空数组
    lock = false;
  } else {
    //_sendReport请求过程中,外部有调用sendkv接口 queue不为空数组
    setTimeout(() => {
      _sendReport(option, commonData, queue);
    }, 500);
  }
}

function _onRejected() {
  lock = false;
}


module.exports = sendkv;
