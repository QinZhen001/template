const {needMethodsDomain} = require("../util/index")
const {isFunction, logger} = require("../../shared/util");
const {types, DOMAIN_METHODS, EVENT_HOT_READY} = require("../../shared/constants")
const {initHost} = require("../instance/init")
const {applyPlugin} = require("../instance/plugin")


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
    if (typeof beforeCall === "function") beforeCall({theHost: _theHost});
    funcs.reduce((promise, task) => promise.then(() => task.apply(this, args)),
      // .then(pushValue), 叠加记录每次promise的结果
      Promise.resolve(),
    ).catch(e => {
      console.error(e);
    });
  };
}


// ------------------------------- 主体类 ------------------------


// class instance {
//   constructor(options) {
//     this.options = options
//   }
//
//   $aaa() {
//     console.log("aaa")
//   }
// }

/**
 * Host 宿主
 * 1. 对宿主进行可插件初始化
 * 2. 提供 use(plugin) 方法，实现插件的引入
 */
class Host {
  constructor({option = {}, nativeHookNames = [], launchHookName = nativeHookNames[0], type}) {
    //原生小程序配置
    this.option = option;
    //原生生命周期钩子名字
    this.nativeHookNames = nativeHookNames;
    //首位生命周期
    this.launchHookName = launchHookName;
    // 类型
    this.type = type
    // 插件
    this.plugins = [];
    // 会插在在第一个生命周期 以同步的方式调用初始化函数队列
    this.initializeQueue = [];
    this.customFunMap = {};
    // 存放函数队列  (inject 和 nativeHook方法存放在这)
    this.funQueueMap = this.initFunQueueMap();

    //其他初始化方法
    this._init()
  }

  /**
   * 将所有生命周期的函数队列初始化
   */
  initFunQueueMap() {
    let funQueueMap = {};
    this.nativeHookNames.forEach(name => {
      funQueueMap[name] = [];
    });
    return funQueueMap;
  }

  /**
   * 这里处理的是一个函数对象
   * @param domain
   * @param funcName
   * @param func
   */
  addCustomFun(domain, funcName, func) {
    if (!this.customFunMap[domain]) {
      this.customFunMap[domain] = {};
    }
    this.customFunMap[domain][funcName] = func;
  }

  /**
   * 这里处理的是一个函数队列
   * @param name
   * @param func
   */
  pushFun(name, func) {
    if (!this.funQueueMap[name]) {
      this.funQueueMap[name] = [];
    }
    if (!isFunction(func)) {
      throw new Error(logger(`pushFun 需要一个function: ${name} ${func}`))
    }
    this.funQueueMap[name].push(func);
  }

  pushInitFun(func) {
    if (!isFunction(func)) {
      throw new Error(logger(`pushInitFun 需要一个function`))
    }
    // initializeQueue里面的方法会在生命周期初始化的时候
    // 以同步的形式的执行
    this.initializeQueue.push(func.bind(this));
  }

  insertInitFun(func) {
    if (!isFunction(func)) {
      throw new Error(logger(`pushInitFun 需要一个function`))
    }
    this.initializeQueue.unshift(func.bind(this));
  }

  getInitFunQueue() {
    return this.initializeQueue;
  }

  getFunQueue(funName) {
    return this.funQueueMap[funName];
  }

  /**
   * 处理option
   * @returns {*} option
   */
  getInfo() {
    if (this.type !== types.component) {
      this.handleCustomMethods();
    }
    this.handleInjectAndHook();
    return this.option;
  }

  handleCustomMethods() {
    let customFunMap = this.customFunMap;
    //  在实例初始化的时候 处理插件custom方法
    // 某些plugin.initialize会依赖custom里面的东西 所以custom要最快初始化
    if (Object.keys(customFunMap).length) {
      //initializeQueue 插入一个函数 这个函数初始化插件的custom
      this.initializeQueue.unshift(function ({theHost}) {
        // 这里theHost指向的是真实实例
        Object.keys(customFunMap).forEach(pluginName => {
          // console.log("customFunMap", name, customFunMap[name]);
          if (!theHost[pluginName]) {
            theHost[pluginName] = {};
          }
          Object.keys(customFunMap[pluginName]).forEach(name => {
            theHost[pluginName][name] = customFunMap[pluginName][name].bind(theHost);
          });
        });
      });
    }
  }


  handleInjectAndHook() {
    let wrapperHost = this.option;
    let funQueueMap = this.funQueueMap;
    if (this.type === types.pageComponent) {
      wrapperHost = wrapperHost[DOMAIN_METHODS];
    }
    // 处理插件inject方法 和 生命周期函数
    Object.keys(funQueueMap).forEach(name => {
      if (wrapperHost[name] && isFunction(wrapperHost[name])) {
        // 如果该函数已经存在 添加进funQueueMap的首部 (这种情况一般是生命周期)
        funQueueMap[name].unshift(wrapperHost[name]);
        wrapperHost[name] = null;
      }
      const injectOptions = {
        //这里的wrapperHost是包裹层环境 并不是真实的环境
        // 和下面的theHost不一样
        wrapperHost: wrapperHost,
        funcName: name,
        funcs: funQueueMap[name],
      };
      // inject 和 生命周期都会在 funQueueMap里 都对应一个函数队列
      if (this.nativeHookNames.includes(name)) {
        if (name === this.launchHookName) {
          // 只有第一个生命周期才有 beforeCall 才会执行InitFunQueue
          let initFunQueue = this.getInitFunQueue();
          injectOptions.beforeCall = ({theHost}) => {
            // 这里的theHost是指向原生真实实例
            // js是词法作用域 所以这里可以拿到外部的initFunQueue
            initFunQueue.forEach(task => task({theHost}));
          };
        }
        // 异步插入 (Promise化执行)
        asyncInject(injectOptions);
      } else {
        // 同步插入
        syncInject(injectOptions);
      }
    });
  }
}

// 声明_init() 做一堆初始化操作
initHost(Host)
// 插件机制
applyPlugin(Host)


module.exports = Host;


/**
 * App(obj)
 * Component(obj)
 * Page(obj)
 * 如何在小程序构造器的参数的注入东西
 *
 * 框架想要在obj中 或 obj 的原型链中添加一些自定义属性
 *
 */













