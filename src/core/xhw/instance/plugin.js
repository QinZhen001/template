const xhwPlugin = require("../class/xhw-plugin")
const {logger, isFunction} = require("../../shared/util")


/**
 * 获取没有安装到的依赖插件
 * @param theHost 包装类实例
 * @param{Array|String} relyOn 插件依赖
 * @returns {Array}
 */
function _getNotIncludedPlugins({vm, relyOn}) {
  const thePluginsWasNotIncluded = [];
  if (typeof relyOn === "string") {
    if (!vm.plugins.includes(relyOn)) {
      thePluginsWasNotIncluded.push(relyOn);
    }
  } else if (Array.isArray(relyOn)) {
    relyOn.forEach(rely => {
      if (typeof rely === "string" && !vm.plugins.includes(rely)) {
        thePluginsWasNotIncluded.push(rely);
      }
    });
  }
  return thePluginsWasNotIncluded;
}


function getPlugins() {
  return this.plugins;
}

function pushPlugin(plguin) {
  this.plugins.push(plguin);
}


function usePlugins(plugins) {
  const vm = this
  let plgs = plugins;
  if (!plgs) throw new Error(logger('usePlugins params is required'));
  if (plgs && !Array.isArray(plgs)) plgs = [plugins];
  for (let plg of plgs) {
    if (!plg) {
      continue
    }
    if (isFunction(plg)) {
      plg = plg()
    }
    const plugin = new xhwPlugin(plg);
    // self registerd checking
    const plugins = vm.getPlugins();
    if (plugins.includes(plugin.name)) {
      throw new Error(logger(`${plugin.name} 已经注册了，不允许重复注册`));
    }
    //检查依赖
    const {relyOn} = plugin.options;
    if (relyOn) {
      const thePluginsWasNotIncluded = _getNotIncludedPlugins({vm, relyOn});
      if (thePluginsWasNotIncluded.length) {
        thePluginsWasNotIncluded.forEach(item => {
          let msg = `插件 ${plugin.name} 依赖插件 ${item},请先注册 ${item}`;
          console.error(logger(msg));
        });
      }
    }

    // 存入plugins
    vm.pushPlugin(plugin.name);

    // theHost是包装类实例 并不是小程序原生实例
    if (typeof plugin.beforeAttach === 'function') plugin.beforeAttach({theHost: vm});

    // attach plugin
    vm.attachPlugin(plugin);


    // theHost是包装类实例 并不是小程序原生实例
    if (typeof plugin.afterAttach === 'function') plugin.afterAttach({theHost: vm});
  }
}


function attachPlugin(plugin) {
  const vm = this;

  if (!vm.data) vm.data = {};
  if (vm.data[plugin.name]) throw new Error(`插件 ${plugin.name} 命名空间被占用，请更改插件名`);

  // attach data
  if (plugin.content.data) {
    vm.data[plugin.name] = plugin.content.data;
  }
  //
  // attach custom method
  // 增加自定义方法 在plugin.name的作用域下
  // Component无法使用带custom的插件
  if (plugin.content.custom) {
    const customMethods = plugin.content.custom;
    Object.keys(customMethods).forEach(name => {
      if (!isFunction(customMethods[name])) {
        throw new Error(logger(`${plugin.name}插件的customMethod: ${name} 必须为一个函数`));
      }
      vm.addCustomFun(plugin.name, name, customMethods[name]);
    });
  }

  // attach inject method  注入方法 (不需要promise化)
  if (plugin.content.inject) {
    let injectMethods = plugin.content.inject;
    Object.keys(injectMethods).forEach(name => {
      if (!isFunction(injectMethods[name])) {
        throw new Error(`${plugin.name}插件的customMethod: ${name} 必须为一个函数`);
      }
      vm.pushFun(name, injectMethods[name]);
    });
  }

  // // attach native hook  (需要promise化)
  if (plugin.content.nativeHook) {
    // console.log("plugin.content.nativeHook", plugin.content.nativeHook);
    const nativeHooks = plugin.content.nativeHook;
    Object.keys(nativeHooks).forEach(hookName => {
      if (!vm.nativeHookNames.includes(hookName)) {
        throw new Error(logger(`${hookName} 不是生命周期函数`));
      }
      if (typeof nativeHooks[hookName] !== 'function') {
        throw new Error(logger(`${hookName}应该为一个函数`));
      }
      vm.pushFun(hookName, nativeHooks[hookName]);
    });
  }

  // attach initialize function
  if (plugin.initialize) {
    vm.pushInitFun(plugin.initialize);
  }
}

// ------------------ 对外暴露


function applyPlugin(Host) {
  Host.prototype.use = usePlugins
  Host.prototype.getPlugins = getPlugins
  Host.prototype.pushPlugin = pushPlugin
  Host.prototype.attachPlugin = attachPlugin
}


function initPlugins(vm) {
  const plugins = vm.option.plugins
  vm.use(plugins)
  console.log("vm", vm)
}

module.exports = {
  applyPlugin,
  initPlugins,
}
