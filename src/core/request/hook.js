// const HOOKS = ["init", "next", "beforeSuccess", "beforeFail"]
import {dispatchRequest} from "./dispatch"


const MODEL_NORMAL = 'normal';
const MODEL_WAIT = 'wait';
const MODEL_QUEUE = 'queue';


global.singleton = global.singleton || {};

// hooks的存储 (以空间换时间，每一个请求对应的hooks应该都是固定的)
let hooksCache = {};


function _getWaitModelHooks(name) {
  const init = ({resolve, reject}) => {
    global.singleton[`${name}lock `] = global.singleton[`${name}lock `] || false;
    if (global.singleton[`${name}lock `]) {
      global.singleton[name].push(resolve);
      return false;
    } else {
      global.singleton[`${name}lock `] = true;
      global.singleton[name] = [];
      return true;
    }
  }
  const success = (res) => {
    let func = null;
    // eslint-disable-next-line
    while (func = global.singleton[name].shift()) {
      func(res);
    }
    global.singleton[`${name}lock `] = false;
  }
  const fail = (res) => {
    global.singleton[`${name}lock `] = false;
  }
  return {
    init,
    success,
    fail,
  }
}

function _getQueueModelHooks(name) {
  let init = ({resolve, reject, config}) => {
    global.singleton[`${name}lock `] = global.singleton[`${name}lock `] || false;
    if (global.singleton[`${name}lock `]) {
      global.singleton[name].push({resolve, reject, config});
      return false;
    } else {
      global.singleton[`${name}lock `] = true;
      global.singleton[name] = [];
      return true;
    }
  }
  let success = async (res) => {
    for (let item of global.singleton[name]) {
      try {
        item.resolve(await dispatchRequest({
          ...item.config,
          hooks: {},
        }));
      } catch (e) {
        item.reject(e);
      }
    }
    global.singleton[`${name}lock `] = false;
  }
  let fail = (res) => {
    global.singleton[`${name}lock `] = false;
  };
  return {
    init,
    success,
    fail,
  }
}


// ------------------------------

export function getHooks(name, model) {
  if (hooksCache[name]) {
    console.log("hooksCache", hooksCache)
    return hooksCache[name];
  }
  let finalHooks = {};
  switch (model) {
    case MODEL_NORMAL:
      break;
    case MODEL_WAIT:
      // 等待模式
      finalHooks = _getWaitModelHooks(name);
      break;
    case MODEL_QUEUE:
      // 队列模式
      finalHooks = _getQueueModelHooks(name);
      break;
  }
  hooksCache[name] = finalHooks;
  return finalHooks;
}


