import {Store} from "./store";
import {getPath, getUsing} from "./path"
import {types} from "../../shared/constants"
import {compute} from "./update"

/**
 * store作为内部插件使用
 * 如果存在全局的store那么我们进行一系列初始化
 */
export function handleStore(vm) {
  if (vm.$type === types.app) {
    return
  }
  switch (vm.$type) {
    case types.page:
      _installStore(vm)
      _uninstallStore(vm)
      break
    case types.pageComponent:
      _installStore(vm)
      _uninstallStore(vm)
      break
    case types.component:
      _installStoreForComponent(vm)
      break
  }
}


function _installStore(vm) {
  vm._pushInitFun(function ({theHost}) {
    theHost.$store = Store.getInstance()
    // 由于theHost已经是实例 并不存在computed和use了
    // 但这些属性我们可以从vm上取到
    const use = (theHost.$use = vm.use)
    const computed = (theHost.$computed = vm.computed)
    const route = theHost.route
    const store = theHost.$store
    store.instances[route] = store.instances[route] || []
    store.instances[route].push(theHost)
    let using = {}
    if (use) {
      theHost.$updatePath = getPath(use)
      using = getUsing(store.viewData, use)
    }
    if (computed) {
      compute(computed, using, store, theHost)
    }
    theHost.setData(using)
  })
}

function _uninstallStore(vm) {
  // instances卸载当前页面
  vm._pushUnloadFun(function () {
    const route = this.route
    const store = this.$store
    store.instances[route] = store.instances[route].filter(ins => ins !== this)
  })
}


function _installStoreForComponent(vm) {
  vm.$hookQueueMap.ready.push(function () {
    console.log("确保this", this)
    this.$store = Store.getInstance()
    const use = (this.$use = vm.use)
    const computed = (this.$computed = vm.computed)
    const pageIndex = getCurrentPages().length - 1
    const page = getCurrentPages()[pageIndex]
    let using = {}
    if (use) {
      this.$updatePath = getPath(use)
      using = getUsing(this.$store.viewData, use)
    }
    if (computed) {
      compute(computed, using, this.$store, this)
    }
    this.setData(using)
    page.$components = page.$components || []
    page.$components.push(this)
  })
}

