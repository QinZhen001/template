/**
 * 请求的hooks
 * init: 初始化 (这里有可能会重复执行多次)
 * next: 进入到请求核心阶段 (是一个async函数，接受参数data)
 * (由init返回的boolean判断是否进入这个hook，这里只会执行一次，在此处进行耗时操作)
 * success: 请求成功
 * fail: 请求失败
 */


const {isPainObject, str2ab, uint8ArrayToString} = require("../shared/util");


const MODEL_NORMAL = 'normal';
const MODEL_WAIT = 'wait';
const MODEL_QUEUE = 'queue';


const TEA_KEY = "XHW_SHARE_ENCRYPT";

global.singleton = global.singleton || {};

// hooks的存储 (以空间换时间，每一个请求对应的hooks应该都是固定的)
let hooksCache = {};

/**
 *
 * @param name 名字
 * @param options 请求的options
 * @param outerHooks
 * @returns {*}
 * @private
 */
function _getHooks(name, options, outerHooks) {
  // 先从缓存中查找
  if (hooksCache[name]) {
    return hooksCache[name];
  }
  let finalHooks = {};
  switch (options.model) {
    case MODEL_NORMAL:
      finalHooks = outerHooks;
      break;
    case MODEL_WAIT:
      // 等待模式
      finalHooks = _getWaitModelHooks(name, outerHooks);
      break;
    case MODEL_QUEUE:
      // 队列模式
      finalHooks = _getQueueModelHooks(name, outerHooks);
      break;
    default:
      finalHooks = outerHooks;
  }
  // 缓存起来
  hooksCache[name] = finalHooks;
  return finalHooks;
}


function _getQueueModelHooks(name, outerHooks) {
  let init = ({resolve, reject, name, options, data, encrypt}) => {
    outerHooks.init && outerHooks.init({resolve, reject, name, options, data, encrypt});
    // console.log('进入到pre过程', name);
    global.singleton[`${name}lock `] = global.singleton[`${name}lock `] || false;
    if (global.singleton[`${name}lock `]) {
      global.singleton[name].push({resolve, reject, name, options, data, encrypt});
      return false;
    } else {
      global.singleton[`${name}lock `] = true;
      global.singleton[name] = [];
      return true;
    }
  };
  let success = async (res) => {
    outerHooks.success && outerHooks.success(res);
    for (let item of global.singleton[name]) {
      try {
        item.resolve(await request({
          name: item.name,
          options: item.options,
          data: item.data,
          hooks: {
            next: outerHooks.next,
          },
          encrypt: item.encrypt,
        }));
      } catch (e) {
        item.reject(e);
      }
    }
    global.singleton[`${name}lock `] = false;
  };
  let fail = (res) => {
    outerHooks.fail && outerHooks.fail(res);
    global.singleton[`${name}lock `] = false;
  };
  // test
  return {
    init,
    next: outerHooks.next,
    success,
    fail,
  };
}


function _getWaitModelHooks(name, outerHooks) {
  let init = ({resolve, reject}) => {
    outerHooks.init && outerHooks.init({resolve, reject, name});
    // console.log('进入到pre过程', name);
    global.singleton[`${name}lock `] = global.singleton[`${name}lock `] || false;
    if (global.singleton[`${name}lock `]) {
      global.singleton[name].push(resolve);
      return false;
    } else {
      global.singleton[`${name}lock `] = true;
      global.singleton[name] = [];
      return true;
    }
  };
  let success = (res) => {
    outerHooks.success && outerHooks.success(res);
    // console.log('进入到after过程', global.singleton[name]);
    let func = null;
    // eslint-disable-next-line
    while (func = global.singleton[name].shift()) {
      func(res);
    }
    global.singleton[`${name}lock `] = false;
  };
  let fail = (res) => {
    outerHooks.fail && outerHooks.fail(res);
    global.singleton[`${name}lock `] = false;
  };
  return {
    init,
    next: outerHooks.next,
    success,
    fail,
  };
}


// -------------------- 核心模块 -------------------

function request({name, options, data, hooks}) {
  if (!options.url) {
    throw new Error('request的option需要参数url');
  }
  if (options.model) {
    hooks = _getHooks(name, options, hooks);
  }
  return new Promise(async (resolve, reject) => {
    let isNext = hooks.init ? hooks.init({resolve, reject, name, options, data}) : true;
    // next是请求核心流程 (只会执行一次)
    if (isNext) {
      hooks.next && await hooks.next({options, data});
      wx.request({
        responseType: options.responseType || "text",
        url: options.url,
        data: data,
        method: options.method || 'POST',
        header: options.header || {'content-type': 'application/x-www-form-urlencoded'},
        success: (res) => {
          hooks.success && hooks.success(res);
          resolve(res);
        },
        fail: (res) => {
          // console.log('failres', res);
          hooks.fail && hooks.fail(res);
          reject(res);
        },
      });
    }
  });
}


module.exports = request;
