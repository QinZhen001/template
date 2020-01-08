import {deepCopy, logger} from "../../shared/util";
import {Observer} from "./observer";
import {upDateCb} from "./update"

global.singleton = global.singleton || {};
const singleton = global.singleton;


const STORE = 'store';

/**
 * (流程锁，减少不必要的耗时操作)
 * get之前的操作 存储多余的任务
 * @param name
 * @param resolve
 * @param reject
 * @returns {boolean} 是否继续执行流程
 * @private
 */
function _beforeGet({name, resolve, reject}) {
  name = `${STORE}_${name}`
  let lockName = `${name}_lock`
  singleton[lockName] = singleton[lockName] || false;
  if (singleton[lockName]) {
    // 锁上了 把信息存储在任务队列
    singleton[name].push({resolve, reject});
    return false
  } else {
    // 锁起来
    singleton[lockName] = true
    singleton[name] = []
    return true
  }
}

/**
 * 执行多余的任务 同时把锁关闭
 * @private
 */
function _afterGet({name, result}) {
  name = `${STORE}_${name}`
  let lockName = `${name}_lock`
  let task
  // eslint-disable-next-line
  while (task = singleton[name].shift()) {
    task.resolve && task.resolve(result)
  }
  singleton[lockName] = false
}


export class Store {
  static getInstance() {
    if (!Store.instance) {
      // 在app的onLaunch中 已经存在了Store.instance
      Store.instance = new Store();
    }
    return Store.instance;
  }

  /**
   * init必须调用 且只调用一次
   * @param states 初始状态
   * @param options 配置
   */
  init(states, options) {
    this._initStates(states)
    const {
      debug = true,
      updateAll = false,
    } = options
    this.debug = debug
    this.updateAll = updateAll
    if (this.viewData) {
      this.observer = new Observer()
      this.observer.observe(this.viewData, upDateCb)
    }
  }

  constructor() {
    this.instances = []
    // this.changes = []
    console.log("走了stores constructor  ")
    this.get = this.get.bind(this)
    this.commit = this.commit.bind(this)
    this.set = this.set.bind(this)
    this.getAsync = this.getAsync.bind(this)
  }


  _initStates(states) {
    if (states) {
      Object.keys(states).forEach((name) => {
        const store = states[name]
        if (store.globalData) {
          this.globalData = {...this.globalData, ...store.globalData}
        }
        if (store.viewData) {
          this.viewData = {...this.viewData, ...store.viewData}
        }
        if (store.getters) {
          this.getters = {...this.getters, ...store.getters};
        }
        if (store.setters) {
          this.setters = {...this.setters, ...store.setters};
        }
      })
    }
  }

  /**
   * 获取当前store中的state中的具体数据
   * @param{String} name 在state中的名字 (必填)
   * @param{Object} data 额外的参数  (非必填)  (会穿透到对应getters函数)
   * @returns {Promise<any>}
   * 问题：同时多次调用get我们只需要走一次get流程，后面的采用第一次的结果即可
   */
  get(name) {
    if (!name) {
      return deepCopy({
        globalData: this.globalData,
        viewData: this.viewData,
      })
    }
    if (this.globalData[name]) {
      return deepCopy(this.globalData[name])
    }
    if (this.viewData[name]) {
      return deepCopy(this.viewData[name])
    }
    return undefined
  }


  // todo： get需要(name, data) 两个参数
  // todo： 其中data是透传到getters函数

  /**
   *
   * @param name
   * @param data
   * @returns {Promise<any>}
   */
  getAsync(name, data) {
    if (typeof name !== 'string') {
      throw new Error(logger(`getAsync必须传进一个string, "${name}" 非法`));
    }
    if (!this.globalData.hasOwnProperty(name)) {
      throw new Error(logger(`"${name}" 不存在与globalData`));
    }
    return new Promise(async (resolve, reject) => {
      if (_beforeGet({name, resolve, reject})) {
        let value = this.get(name);
        let result = null
        if (value !== null && value !== undefined && value !== "") {
          // value有值 值有可能为false 或 0
          // value !== "" 是因为 wx.getStorage一个不存在的东西 返回 ""
          result = deepCopy(value)
        } else {
          // state没有值 触发getters
          let getter = this.getters[name];
          if (getter) {
            result = await (arguments.length === 1 ? getter(this.set) : getter(data, this.set)
            )
          }
        }
        resolve(result)
        _afterGet({result, name})
      }
    });
  }

  /**
   * 提交申请，触发setters
   * @param name 在state中的名字
   * @param payload 数据载荷
   */
  commit(name, payload) {
    if (!this.setters[name]) {
      throw new Error(logger(`setters中不存在: ${name}`));
    }
    this.setters[name](deepCopy(payload));
  }

  set(key, value) {
    if (typeof key !== 'string') {
      throw new Error(logger(`set方法中key必须为一个string  "${key}" 非法`));
    }
    if (this.globalData.hasOwnProperty(key)) {
      this.globalData[key] = value
      return
    }
    if (this.viewData.hasOwnProperty(key)) {
      // debugger
      this.observer.set(this.viewData, key, value, this.observer)
      return
    }
    throw Error(logger(`${key} 不存在在store中`))
  }
}