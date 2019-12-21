/**
 * promise化微信的api
 */
const {promisify} = require("../shared/util")

let noPromiseApi = ['getUpdateManager', 'nextTick'];


let _xhwapi = {}
let isInit = false;

function xhwapi(wx) {
  if (isInit) {
    return _xhwapi
  } else {
    Object.keys(wx).forEach((key) => {
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
    })
    return _xhwapi;
  }
}


function addNoPromiseApi(name) {
  if (typeof name === 'string') {
    noPromiseApi.push(name);
  } else if (Array.isArray(name)) {
    noPromiseApi = noPromiseApi.concat(name);
  } else {
    return false;
  }
}


module.exports = {
  xhwapi,
  addNoPromiseApi,
}
