import {types} from "../../shared/constants"

/**
 * store作为内部插件使用
 * 如果存在全局的store那么我们进行一系列初始化
 */
export function handleStore(vm) {
  const names = vm.$$globalPluginNames
  // 存在全局插件store 且 存在use
  if (names.indexOf("$store") !== -1) {
    debugger
    switch (vm.$type) {
      case types.page:
        _handlePageStore(vm)
        break
      case types.pageComponent:
        _handlePageComponentStore(vm)
        break
      case types.component:
        _handleComponentStore(vm)
        break
    }

    // if (vm.$type === types.page) {
    //
    // } else if (vm.$type === types.pageComponent) {
    //
    // } else
  }
}


function _handlePageStore(vm) {

}

function _handlePageComponentStore(vm) {

}

function _handleComponentStore(vm) {

}
