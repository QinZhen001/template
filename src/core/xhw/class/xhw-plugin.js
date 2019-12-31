/**
 * 框架的核心就是支持插件化，支持内部插件和外部的自定义插件进而增强功能
 *
 *  框架插件
 *  @param{String} name:插件名字
 *  @param{Object} data: 注入包裹层data中[plugin.name]的命名空间  （注意治理不能注入真实的this环境）
 *  @param{Array|String} relyOn：依赖的插件
 *  @param{Object} nativeHook: 混入到宿主的生命周期钩子 (异步方式，this指向原生实例)
 *  @param{Object} customMethod:  混入到this[pluginName]的相应的函数中  (不会形成函数队列)
 *  @param{Object} inject:  混入到this的相应的函数中 (形成函数队列,同名函数不会发生覆盖情况)
 *  @param{Function} beforeAttach：插件装载前的钩子方法
 *  @param{Function} afterAttach： 插件装载完成的钩子方法
 *  @param{Function} initialize： 插件初始化方法， 在原生实例初始化的时候执行
 *
 *
 *
 *  beforeAttach，afterAttach，initialize都接受一个函数 函数参数为{theHost}
 *  只有initialize函数中的theHost指向真实this环境
 *
 *  initialize和custom 都会插入宿主的initializeQueue中 且custom会在initialize之前运行
 *
 *  注意外部传入customMethod 内部识别成custom 将来可能会统一
 *
 */

function getPluginName(name) {
  let firstChar = name.substr(0, 1)
  if (firstChar === "$") {
    return name
  }
  return `$${name}`
}

export class XhwPlugin {
  constructor(content = {}) {
    if (!content.name) {
      throw new Error("params of name are required when create a XhwPlugin.");
    }
    this.name = getPluginName(content.name);
    this.content = {
      data: content.data,
      custom: content.custom,
      nativeHook: content.nativeHook,
      inject: content.inject,
    };
    this.options = {
      relyOn: content.relyOn,
    };
    if (typeof content.beforeAttach === "function") {
      this.beforeAttach = content.beforeAttach;
    }
    if (typeof content.afterAttach === "function") {
      this.afterAttach = content.afterAttach;
    }
    if (typeof content.initialize === "function") {
      this.initialize = content.initialize;
    }
  }
}
