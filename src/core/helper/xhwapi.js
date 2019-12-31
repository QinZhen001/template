/**
 * promise化微信的api
 */
import {promisify} from "../shared/util";

let noPromiseApi = ["getUpdateManager", "nextTick"];


let _xhwapi = {};
let isInit = false;

const PAGE_LEVEL = 10

/**
 * 修改原生navigateTo，突破页面栈最多十层的问题
 * @param _xhwapi
 * @private
 */
function _handleNavigateTo(_xhwapi) {
  _xhwapi.navigateTo = function (options, ...params) {
    let pageList = getCurrentPages();
    let pageLen = pageList.length;
    let api
    if (pageLen >= PAGE_LEVEL) {
      api = wx.redirectTo
    } else {
      api = wx.navigateTo
    }
    return new Promise((resolve, reject) => {
      api(
        Object.assign({}, options, {success: resolve, fail: reject}),
        ...params,
      );
    });
  }
}

/**
 * 处理一些特别的api
 * @param _xhwapi
 * @private
 */
function _handleSpecialApi(_xhwapi) {
  _handleNavigateTo(_xhwapi)
}


function xhwapi(wx) {
  if (isInit) {
    return _xhwapi;
  } else {
    Object.keys(wx).forEach(key => {
      if (
        /^create.+/.test(key) ||
        /.*Sync$/.test(key) ||
        /^on.+/.test(key) ||
        noPromiseApi.indexOf(key) > -1
      ) {
        // 同步方法
        _xhwapi[key] = wx[key];
      } else {
        _xhwapi[key] = promisify(wx[key], key);
      }
    });
    _handleSpecialApi(_xhwapi)
    isInit = true
    return _xhwapi;
  }
}

function addNoPromiseApi(name) {
  if (typeof name === "string") {
    noPromiseApi.push(name);
  } else if (Array.isArray(name)) {
    noPromiseApi = noPromiseApi.concat(name);
  } else {
    return false;
  }
}

export {xhwapi, addNoPromiseApi};
