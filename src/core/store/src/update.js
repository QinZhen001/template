import {fixPath, needUpdate} from "./path"
import {Store} from "./store";


export function upDateCb(prop, value, old, path) {
  console.log(prop, value, old, path)
  debugger
  let patch = {}
  if (prop.indexOf('Array-push') === 0) {
    let dl = value.length - old.length
    for (let i = 0; i < dl; i++) {
      patch[fixPath(path + '-' + (old.length + i))] = value[(old.length + i)]
    }
  } else if (prop.indexOf('Array-') === 0) {
    patch[fixPath(path)] = value
  } else {
    patch[fixPath(path + '-' + prop)] = value
  }
  console.log("patch", patch)
  debugger
  _update(patch)
}


/**
 *
 * @param computed 计算属性
 * @param using 当前实例使用数据仓库中的数据
 * @param store 全局数据仓库
 * @param theHost 微信实例
 * @private
 */
export function compute(computed, using, store, theHost) {
  for (let key in computed) {
    using[key] = computed[key].call(store.viewData, theHost)
  }
}


// -------------------------------------------


function _update(kv) {
  const store = Store.getInstance()
  console.log("9999999999999999999910", store)
  const instances = store.instances
  console.log("instances", instances)
  debugger
  for (let key in instances) {
    if (instances.hasOwnProperty(key)) {
      instances[key].forEach(ins => {
        // ins 是页面的实例
        _updateOne(kv, store, ins)
        // 如果页面中包含组件就一起更新
        ins.$components && ins.$components.forEach(compIns => {
          _updateOne(kv, store, compIns)
        })
      })
    }
  }
  console.log("store", store)
  debugger
  store.debug && storeChangeLogger(store, kv)
}


function _updateOne(kv, store, ins) {
  if (store.updateAll || (ins.$updatePath && needUpdate(kv, ins.$updatePath))) {
    const patch = Object.assign({}, kv)
    debugger
    ins.setData(patch)
  }
  // const using = getUsing(store.viewData, ins.$use)
  const using = {}
  compute(ins.$computed, using, store, ins)
  ins.setData(using)
}


function storeChangeLogger(store, diffResult) {
  debugger
  try {
    const preState = wx.getStorageSync(`$currentState`) || {}
    const title = `Data Changed`
    console.groupCollapsed(`%c  ${title} %c ${Object.keys(diffResult)}`, 'color:#e0c184; font-weight: bold', 'color:#f0a139; font-weight: bold')
    console.log(`%c    Pre Data`, 'color:#ff65af; font-weight: bold', preState)
    console.log(`%c Change Data`, 'color:#3d91cf; font-weight: bold', diffResult)
    console.log(`%c   Next Data`, 'color:#2c9f67; font-weight: bold', store.viewData)
    console.groupEnd()
    wx.setStorageSync(`$currentState`, store.viewData)
  } catch (e) {
    console.log(e)
  }
}
