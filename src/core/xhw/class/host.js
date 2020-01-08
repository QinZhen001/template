import {isFunction, logger} from "../../shared/util";
import {initHost} from "../instance/init";
import {initPlugins} from "../instance/plugin";

// ------------------------------- 主体类 ------------------------


function _checkFun(name, fn) {
  if (!isFunction(fn)) {
    throw new Error(logger(`${name} 需要一个function`));
  }
}

/**
 * Host 宿主
 * 1. 对宿主进行可插件初始化
 * 2. 提供 use(plugin) 方法，实现插件的引入
 */
export class Host {
  constructor({option = {}, nativeHookNames = [], launchHookName = nativeHookNames[0], type}) {
    for (let name in option) {
      if (option.hasOwnProperty(name)) {
        this[name] = option[name]
      }
    }
    if (!this.data) {
      this.data = {};
    }
    //原生生命周期钩子名字
    this.$nativeHookNames = nativeHookNames;
    //首位生命周期
    this.$launchHookName = launchHookName;
    // 类型
    this.$type = type;
    // 会插在在第一个生命周期 以同步的方式调用初始化函数队列
    this.$initializeQueue = [];
    // 插件自定义函数队列
    this.$customFunMap = {};
    // 插件inject函数队列
    this.$injectQueueMap = {};
    // nativeHook函数队列
    this.$hookQueueMap = this._initHookQueueMap()
    //其他初始化方法
    this._init();

    // this._clean()
  }


  _clean() {
    delete this.$customFunMap
    delete this.$injectQueueMap
    delete this.$initializeQueue
    delete this.$hookQueueMap
  }

  /**
   * 将所有生命周期的函数队列初始化
   */
  _initHookQueueMap() {
    let funQueueMap = {};
    this.$nativeHookNames.forEach(name => {
      funQueueMap[name] = [];
    });
    return funQueueMap;
  }

  /**
   * 向init函数队列末尾插入函数
   * @param func
   * @private
   */
  _pushInitFun(func) {
    _checkFun("_pushInitFun", func)
    this.$initializeQueue.push(func.bind(this));
  }


  /**
   * 想
   * @param func
   * @private
   */
  _insertInitFun(func) {
    _checkFun("_insertInitFun", func)
    this.$initializeQueue.unshift(func.bind(this));
  }

  _pushUnloadFun(func) {
    _checkFun("_pushUnloadFun", func)
  }
}

// 声明_init() 做一堆初始化操作
initHost(Host);
// 插件机制
initPlugins(Host);



