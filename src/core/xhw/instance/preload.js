import {types} from "../../shared/constants"
import {deepCopy, isFunction, isObject, logger} from "../../shared/util"
import {xhwapi} from "../../helper/xhwapi"

const xhwApi = xhwapi(wx)

// "navigateBack"

const routeApi = ["navigateTo", "switchTab", "reLaunch", "redirectTo"]


function _handleSyncPreGet(data) {
  global["preData"] = data;
}


let $isPreLoad = false
let eventName = ""

async function _handleASyncPreGet(preGet) {
  const event = getApp().$event;
  if (!event) {
    throw new SyntaxError(logger(`预加载需要使用event插件,请先注册event插件!`));
  }
  let data = await preGet()
  event.trigger(eventName, data);
}

/**
 * 更改路由跳转的方法
 * @private
 */
function _changeRouteApi() {
  for (let name of routeApi) {
    let fn = xhwApi[name]
    xhwApi[name] = function (...args) {
      let promise = fn(...args)
      // console.log("args", args)
      let preGet = args[0].preGet
      if (preGet) {
        if (isObject(preGet)) {
          _handleSyncPreGet(preGet)
        } else if (isFunction(preGet)) {
          _handleASyncPreGet(preGet)
        }
      }
      return promise
    }
  }
}


/**
 * 安装预加载
 * @param theHost (页面实例)
 * @private
 */
function _vmInstallPreLoad({theHost}) {
  if (isFunction(theHost.preLoad)) {
    let preData = deepCopy(global["preData"])
    // debugger
    if (preData) {
      // debugger
      theHost.preLoad(preData)
      global["preData"] = null
    } else {
      // console.log("theHost.$event", theHost.$event)
      // debugger
      let pageList = getCurrentPages();
      let pageLen = pageList.length;
      eventName = pageList[pageLen - 1].route;
      // debugger
      theHost.$event.on(eventName, data => {
        // debugger
        theHost.preLoad(data)
      })
    }
  }
}


/**
 * 卸载预加载
 * @private
 */
function _vmUninstallPreLoad() {
  // console.log("this", this)
  // debugger
  this.$event.off(eventName)
}

// ------------------------------


export function initPreLoad(vm) {
  if (vm.$type === types.app) {
    if (vm.$preLoad) {
      // 全局预加载标志位
      $isPreLoad = true
      // 改变原来的路由api
      _changeRouteApi()
    }
  }
}

export function handlePreLoad(vm) {
  // 只有type为页面的情况 且有全局预加载标志位
  // 才进行预加载
  if ($isPreLoad && (vm.$type === types.page || vm.$type === types.pageComponent)) {
    // debugger
    vm._pushInitFun(_vmInstallPreLoad)
    vm._pushUnloadFun(_vmUninstallPreLoad)
  }
}


