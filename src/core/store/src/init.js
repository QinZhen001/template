import {Store} from "./store";
import {getPath, getUsing} from "./path"
import {isArray} from "../../shared/util";
import {types} from "../../shared/constants"


/**
 * store作为内部插件使用
 * 如果存在全局的store那么我们进行一系列初始化
 */
export function handleStore(vm) {
  if (isArray(vm.use) && vm.use.length) {
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
}


function _installStore(vm) {
  vm._pushInitFun(function ({theHost}) {
    // 由于theHost已经是实例 并不存在computed和use了
    // 但这些属性我们可以从vm上取到
    const use = vm.use
    const computed = vm.computed
    const route = theHost.route
    theHost.$store = Store.getInstance()
    const store = theHost.$store
    store.instances[route] = store.instances[route] || []
    store.instances[route].push(theHost)
    theHost.$updatePath = getPath(use)
    const using = getUsing(store.viewData, use)
    if (computed) {
      _compute(computed, using, store, theHost)
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
    const use = vm.use
    const computed = vm.computed
    const pageIndex = getCurrentPages().length - 1
    const page = getCurrentPages()[pageIndex]
    this.$updatePath = getPath(use)
    this.$store = Store.getInstance()
    const using = getUsing(this.$store.viewData, use)
    if (computed) {
      _compute(computed, using, this.$store, this)
    }
    this.setData(using)
    page.$components = page.$components || []
    page.$components.push(this)
  })
}


// _compute(vm.computed, using, store, theHost)

/**
 *
 * @param computed 计算属性
 * @param using 当前实例使用数据仓库中的数据
 * @param store 全局数据仓库
 * @param theHost 微信实例
 * @private
 */
function _compute(computed, using, store, theHost) {
  for (let key in computed) {
    using[key] = computed[key].call(store.viewData, theHost)
  }
}
