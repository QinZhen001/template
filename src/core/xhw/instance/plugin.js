import {XhwPlugin} from "../class/xhw-plugin";
import {isFunction, logger} from "../../shared/util";
import {DOMAIN_METHODS, types} from "../../shared/constants";


/**
 * 获取没有安装到的依赖插件
 * @param theHost 包装类实例
 * @param{Array|String} relyOn 插件依赖
 * @returns {Array}
 */
function _getNotIncludedPlugins({theHost, relyOn}) {
  const thePluginsWasNotIncluded = [];
  if (typeof relyOn === "string") {
    if (!theHost.plugins.includes(relyOn)) {
      thePluginsWasNotIncluded.push(relyOn);
    }
  } else if (Array.isArray(relyOn)) {
    relyOn.forEach(rely => {
      if (typeof rely === "string" && !theHost.plugins.includes(rely)) {
        thePluginsWasNotIncluded.push(rely);
      }
    });
  }
  return thePluginsWasNotIncluded;
}

/**
 * 同步化的方式注入增强
 * @param theHost  指向option (也就是包裹层环境，并不是小程序真实环境)
 * @param funcName
 * @param{Function} func
 */
function syncInject({wrapperHost, funcName, funcs}) {
  wrapperHost[funcName] = function (...args) {
    funcs.forEach(task => task.apply(this, args));
  };
}

/**
 * 异步promise化的方式注入增强
 * @param theHost 指向option (也就是包裹层环境，并不是小程序真实环境)
 * @param funcName 函数名字
 * @param{Array} funcs 函数数组
 * @param beforeCall
 */
function asyncInject({wrapperHost, funcName, funcs = [], beforeCall}) {
  // console.log("theHost[funcName]", funcName, theHost[funcName]);

  // 异步的方式执行funcs 返回promisefy的函数
  wrapperHost[funcName] = function (...args) {
    // 这里指向原生实例
    const _theHost = this;
    // 只有第一个生命周期会执行beforeCall
    // beforeCall 参数为一个对象 里面有真实的上下文环境theHost 和 funQueue一些需要最开始执行的函数
    if (isFunction(beforeCall)) {
      beforeCall({theHost: _theHost});
    }
    funcs
      .reduce(
        (promise, task) => promise.then(() => task.apply(this, args)),
        // .then(pushValue), 叠加记录每次promise的结果
        Promise.resolve(),
      )
      .catch(e => {
        console.error(e);
      });
  };
}


// -------------依赖vm的方法-----------------------

function usePlugins(vm) {
  // 查重 (防止同一个插件注册多次)
  let cachePlugins = []
  let plgs = vm.plugins;
  if (plgs && !Array.isArray(plgs)) plgs = [vm.plugins];
  for (let plg of plgs) {
    if (!plg) {
      continue;
    }
    if (isFunction(plg)) {
      plg = plg();
    }
    const plugin = new XhwPlugin(plg);
    // self registerd checking
    if (cachePlugins.includes(plugin.name)) {
      throw new Error(logger(`${plugin.name} 已经注册了，不允许重复注册`));
    }
    cachePlugins.push(plugin.name)
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

    // 存入全局plugins
    if (vm.$type === types.app) {
      vm.$globalPluginNames.push(plugin.name)
    }

    // theHost是包装类实例 并不是小程序原生实例
    if (typeof plugin.beforeAttach === "function") {
      plugin.beforeAttach({theHost: vm});
    }
    // attach plugin
    attachPlugin.call(vm, plugin);

    // theHost是包装类实例 并不是小程序原生实例
    if (typeof plugin.afterAttach === "function") {
      plugin.afterAttach({theHost: vm});
    }
  }
}

/**
 * 插件初始化完毕后处理custom
 * @param vm
 */
function handleCustom(vm) {
  const customFunMap = vm.$customFunMap;
  // 某些plugin.initialize会依赖custom里面的东西 所以custom要最快初始化
  if (Object.keys(customFunMap).length) {
    //$initializeQueue 插入一个函数 这个函数初始化插件的custom
    vm.$initializeQueue.unshift(function ({theHost}) {
      // 这里theHost指向的是真实实例
      for (let pluginName in customFunMap) {
        if (!theHost[pluginName]) {
          theHost[pluginName] = {};
        }
        for (let name in customFunMap[pluginName]) {
          theHost[pluginName][name] = customFunMap[pluginName][name].bind(theHost);
        }
      }
    });
  }
}

/**
 * 处理插件inject方法
 * @param vm
 */
function handleInject(vm) {
  let wrapperHost = vm;
  let injectQueueMap = vm.$injectQueueMap;
  if (vm.$type === types.pageComponent) {
    wrapperHost = wrapperHost[DOMAIN_METHODS];
  }

  for (let name in injectQueueMap) {
    if (injectQueueMap.hasOwnProperty(name)) {
      if (wrapperHost[name] && isFunction(wrapperHost[name])) {
        console.warn(logger(`${name} 函数已经存在，无法在插件中注入!`), vm)
        continue
      }
      const injectOptions = {
        //这里的wrapperHost是包裹层环境 并不是真实的环境
        // 和下面的theHost不一样
        wrapperHost: wrapperHost,
        funcName: name,
        funcs: injectQueueMap[name],
      };
      syncInject(injectOptions);
    }
  }
}

function handleHook(vm) {
  let hookQueueMap = vm.$hookQueueMap;
  let wrapperHost = vm
  if (vm.$type === types.pageComponent) {
    wrapperHost = vm[DOMAIN_METHODS];
  }
  // 处理插件inject方法 和 生命周期函数
  Object.keys(hookQueueMap).forEach(name => {
    if (isFunction(wrapperHost[name])) {
      // 如果该函数已经存在 添加进funQueueMap的首部 (这种情况一般是生命周期)
      hookQueueMap[name].unshift(wrapperHost[name]);
      wrapperHost[name] = null;
    }
    const injectOptions = {
      //这里的wrapperHost是包裹层环境 并不是真实的环境
      // 和下面的theHost不一样
      wrapperHost: wrapperHost,
      funcName: name,
      funcs: hookQueueMap[name],
    };
    if (name === vm.$launchHookName) {
      // 只有第一个生命周期才有 beforeCall 才会执行InitFunQueue
      let initFunQueue = vm.$initializeQueue;
      injectOptions.beforeCall = ({theHost}) => {
        // 这里的theHost是指向原生真实实例
        // js是词法作用域 所以这里可以拿到外部的initFunQueue
        initFunQueue.forEach(task => task({theHost}));
      };
    }
    // 异步插入 (Promise化执行)
    asyncInject(injectOptions);
  });
}

function handleGlobalPlugins(vm) {
  if (vm.$type === types.app) {
    return
  }
  if (vm.$type === types.page) {
    const app = getApp()
    for (let name of vm.$globalPluginNames) {
      vm[name] = app[name]
    }
  } else {
    vm._insertInitFun(function ({theHost}) {
      const app = getApp()
      for (let name of vm.$globalPluginNames) {
        theHost[name] = app[name]
      }
    })
  }
}

// -----------挂载到类的方法------------------


function attachPlugin(plugin) {
  const vm = this;

  if (!vm.data) vm.data = {};
  if (vm.data[plugin.name]) {
    throw new Error(`插件 ${plugin.name} 命名空间被占用，请更改插件名`);
  }

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
        throw new Error(
          logger(`${plugin.name}插件的customMethod: ${name} 必须为一个函数`),
        );
      }
      addCustom.call(vm, plugin.name, name, customMethods[name]);
    });
  }

  // attach inject method  注入方法 (不需要promise化)
  if (plugin.content.inject) {
    let injectMethods = plugin.content.inject;
    Object.keys(injectMethods).forEach(name => {
      if (!isFunction(injectMethods[name])) {
        throw new Error(
          `${plugin.name}插件的customMethod: ${name} 必须为一个函数`,
        );
      }
      addInject.call(vm, name, injectMethods[name]);
    });
  }

  // // attach native hook  (需要promise化)
  if (plugin.content.nativeHook) {
    // console.log("plugin.content.nativeHook", plugin.content.nativeHook);
    const nativeHooks = plugin.content.nativeHook;
    Object.keys(nativeHooks).forEach(hookName => {
      if (!vm.$nativeHookNames.includes(hookName)) {
        throw new Error(logger(`${hookName} 不是生命周期函数`));
      }
      if (typeof nativeHooks[hookName] !== "function") {
        throw new Error(logger(`${hookName}应该为一个函数`));
      }
      addHook.call(vm, hookName, nativeHooks[hookName]);
    });
  }

  // attach initialize function
  if (plugin.initialize) {
    pushInitFun.call(vm, plugin.initialize);
  }
}

function addInject(name, func) {
  const vm = this
  if (!isFunction(func)) {
    throw new Error(logger(`pushFun 需要一个function: ${name} ${func}`));
  }
  if (!vm.$injectQueueMap[name]) {
    this.$injectQueueMap[name] = [];
  }
  this.$injectQueueMap[name].push(func);
}

function addCustom(domain, funcName, func) {
  const vm = this
  if (!vm.$customFunMap[domain]) {
    vm.$customFunMap[domain] = {};
  }
  vm.$customFunMap[domain][funcName] = func;
}

function addHook(name, func) {
  const vm = this
  if (!isFunction(func)) {
    throw new Error(logger(`pushFun 需要一个function: ${name} ${func}`));
  }
  if (!vm.$hookQueueMap[name]) {
    this.$hookQueueMap[name] = [];
  }
  this.$hookQueueMap[name].push(func);
}

function pushInitFun(func) {
  if (!isFunction(func)) {
    throw new Error(logger(`pushInitFun 需要一个function`));
  }
  // initializeQueue里面的方法会在生命周期初始化的时候
  // 以同步的形式的执行
  this.$initializeQueue.push(func.bind(this));
}

// --------------------------------

/**
 * 添加插件相关的类方法
 * @param Host
 */
function initPlugin(Host) {
  // $globalPluginNames 全局插件的名字 存在于Host类上
  if (!Host.prototype.$globalPluginNames) {
    Host.prototype.$globalPluginNames = []
  }
}

/**
 * 初始化插件
 * @param vm 实例
 */
function initPlugins(vm) {
  // if (vm.type === types.component) {
  //   throw new Error(logger(``))
  // }
  const plugins = vm.plugins;
  if (!plugins || !plugins.length) {
    return
  }
  usePlugins(vm);
}


export {initPlugins, handleCustom, handleInject, handleHook, initPlugin, handleGlobalPlugins};
