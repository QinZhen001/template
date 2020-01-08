import {handleCustom, handleGlobalPlugins, handleHook, handleInject, handlePlugins} from "./plugin";
import {handlePreLoad} from "./preload"
import {handleDiff} from "../../diff/index"
import {handleStore} from "../../store/index"

let uid = 0;

/**
 * 每个vm都要进行的初始化操作
 * @param Host 最原始的宿主
 */
function initHost(Host) {
  Host.prototype._init = function () {
    const vm = this;
    vm.$uid = uid++;
    // 生命周期所在的命名空间
    // let life = {};
    // if (needMethodsDomain(this.type)) {
    //   life = this[DOMAIN_METHODS];
    //   vm.$lifeDomain = DOMAIN_METHODS;
    // } else {
    //   life = vm;
    // }
    // deal watch
    // const watch = vm.watch;
    // if (watch) {
    //   // debugger
    //   vm.$watch = watch;
    //   initWatch(vm);
    // }
    // // deal hot
    // vm.$hot = !!(vm.hot || life.onHotLoad);
    // if (vm.$hot && vm.$type !== types.app) {
    //   debugger
    //   initHot(vm);
    // }
    // // deal mixins
    // const mixins = this.mixins;
    // if (mixins) {
    //   vm.$mixins = mixins;
    //   initMixins(vm);
    // }

    // 初始化插件
    handlePlugins(vm);
    // 处理全局插件方法全局
    handleGlobalPlugins(vm)
    // 处理预加载
    handlePreLoad(vm)
    // 处理自定义方法
    handleCustom(vm)
    // 处理store插件  (依赖上面的custom)
    handleStore(vm)
    // 处理自定义diff相关
    handleDiff(vm)
    // 处理注入方法
    handleInject(vm)
    // 处理生命周期
    handleHook(vm)
  };
}


export {initHost};

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
