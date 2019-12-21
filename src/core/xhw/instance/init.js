const {types, DOMAIN_METHODS, EVENT_HOT_READY} = require("../../shared/constants")
const {needMethodsDomain} = require("../util/index")
const {initHot} = require("./hot")
const {initMixins} = require("./mixins")
const {initWatch} = require("./watch")
const {initPlugins} = require("./plugin")


let uid = 0

/**
 * 初始化
 * @param Host 最原始的宿主
 */
function initHost(Host) {
  Host.prototype._init = function () {
    const vm = this
    vm.$uid = uid++
    // 生命周期所在的命名空间
    let life = {}
    if (needMethodsDomain(this.type)) {
      life = this.option[DOMAIN_METHODS]
      vm.$lifeDomain = DOMAIN_METHODS
    } else {
      life = vm.option
    }
    // deal watch
    const watch = vm.option.watch
    if (watch) {
      // debugger
      vm.$watch = watch
      initWatch(vm)
    }
    // deal mixins
    const mixins = this.option.mixins
    if (mixins) {
      vm.$mixins = mixins
      initMixins(vm)
    }
    // deal plugins
    const plugins = this.option.plugins
    if (plugins && plugins.length) {
      initPlugins(vm)
    }
    // deal hot
    vm.$hot = !!(vm.option.hot || life.onHotLaunch || life.onHotLoad);
    if (vm.$hot && vm.type !== types.app) {
      initHot(vm)
    }
  }
}


module.exports = {
  initHost,
}

/**
 * 挂载在全局  getApp()中的变量
 * $initHot 是否完成热更新初始化
 *
 */


/**
 * 挂载在实例上的框架内部变量
 * $uid{Number} 编号
 * $lifeDomain{String} 生命周期所在的命名空间
 * $hot{Boolean} 此实例是否为热更新
 * $watch{Object} watch监听相关
 * $mixins{Object} 混入相关
 *
 */


/**
 *
 * 最难把握的就是时机的问题
 * watch一定要比较前的执行
 *
 */
