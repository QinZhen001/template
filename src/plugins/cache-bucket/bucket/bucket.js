import {BUCKET_KEY, BUCKET_READ_KEY} from "../util/constant";

global[BUCKET_KEY] = global[BUCKET_KEY] || {};
const bucketStore = global[BUCKET_KEY];

global.singleton = global.singleton || {};
const singleton = global.singleton;


function _checkAction(action) {
  if (typeof action !== 'function') {
    throw new Error(`传入的action必须为一个函数: ${action}`);
  }
  if (action.length !== 2) {
    throw new Error(`传入的action个函数需要两个参数 success 和 fail`);
  }
  return true;
}


function _checkFilter(filter) {
  if (typeof filter !== 'function') {
    throw new Error(`传入的filter必须为一个函数: ${filter}`);
  }
  // if (filter.length !== 2) {
  //   throw new Error(`传入的filter需要两个参数 item 和 array`);
  // }
  return true;
}


function _getReadMap(key) {
  if (bucketStore[key]) {
    return bucketStore[key];
  }
  let readMap = wx.getStorageSync(key);
  return readMap === "" ? new Map() : new Map([...JSON.parse(readMap)]);
}

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
  name = `${BUCKET_KEY}_${name}`
  let lockName = `${name}_lock`
  singleton[lockName] = singleton[lockName] || false;
  if (singleton[lockName]) {
    // 锁上了 把信息存储在任务队列
    singleton[name].push({resolve, reject});
    return false
  } else {
    // 锁起来
    singleton[lockName] = true
    singleton[name] = singleton[name] || []
    singleton[name].push({resolve, reject});
    return true
  }
}


/**
 * 执行多余的任务 同时把锁关闭
 * @param name 桶实例的名字
 * @param num 获取多少条数据
 * @param fn 需要执行的函数
 * @private
 */
async function _afterGet({name, num, fn}) {
  name = `${BUCKET_KEY}_${name}`
  let lockName = `${name}_lock`
  let task
  // eslint-disable-next-line
  while (task = singleton[name].shift()) {
    try {
      let res = await fn(num)
      task.resolve && task.resolve(res)
    } catch (e) {
      task.reject && task.reject(e)
    }
  }
  singleton[lockName] = false
}

// ----------------------- 核心 ------------------------------------

/**
 * 抽象存储桶对象
 * checkData前置 正常请求前补充数据
 * (请求后再补充数据，会导致游标更新不及时)
 */
export class Bucket {
  constructor({name, action, minimum, filter}) {
    if (!name) {
      throw new Error(`缓存桶名字不存在`);
    }
    if (action && _checkAction(action)) {
      this.action = action;
    }
    if (filter && _checkFilter(filter)) {
      this.filter = filter;
    }
    this.name = name;
    this.minimum = minimum || 0;
  }

  /**
   * 向bucket实例中添加action
   * @param action
   */
  addAction(action) {
    if (_checkAction(action)) {
      this.action = action;
    }
  }

  /**
   * 向bucket实例中添加filter
   * @param filter
   */
  addFilter(filter) {
    if (_checkFilter(filter)) {
      this.filter = filter;
    }
  }


  checkData(num) {
    const list = bucketStore[this.name] || [];
    return list.length < num || list.length <= this.minimum;
  }


  /**
   *
   * @param{Number} num 需要数据的数量 (非必填)
   * @returns {Promise<any>}
   * 同样存在的问题：同时多次调用get我们只需要走一次get流程，后面的采用第一次的结果即可
   */
  get(num = 4) {
    return new Promise(async (resolve, reject) => {
      if (!this.action) {
        throw new Error(`bucket名: ${this.name} 的action不存在`);
      }
      if (_beforeGet({name: this.name, resolve, reject})) {
        // 检查桶是否需要填充数据
        if (this.checkData(num)) {
          try {
            // 前置流程 补充数据
            await this.autoFill();
          } catch (e) {
            console.error("bucket get error", e)
            reject(e);
          }
        }
        await _afterGet({name: this.name, num, fn: this.processGet.bind(this)})
      }
    });
  }


  /**
   * 桶执行核心流程
   * @param num
   * @returns {Promise<any>}
   */
  processGet(num) {
    return new Promise((resolve, reject) => {
      let list = bucketStore[this.name] || [];
      resolve(this.filterData(list, num));
    });
  }

  /**
   * 根据过滤规则，处理数据，获取num条数据
   * (已处理list.length<num的情况)
   * @param list 桶里的数据
   * @param num 需要的数据条数
   * @returns {Array}
   */
  filterData(list, num) {
    // 这里list指向bucketStore[this.name] 不用操作bucketStore[this.name]
    let resArr = [];
    if (this.filter) {
      // 需要过滤数据
      let item = null;
      const partMapKey = `${this.name}_${BUCKET_READ_KEY}`;
      const globalMapKey = BUCKET_READ_KEY;
      const hadReadPartMap = _getReadMap(partMapKey);
      const hadReadGlobalMap = _getReadMap(globalMapKey);
      while (resArr.length < num && (item = list.shift())) {
        let result = this.filter(item, hadReadPartMap, hadReadGlobalMap);
        result && resArr.push(result);
      }
    } else {
      // 不需要过滤数据
      resArr = list.length > num ? list.splice(0, num) : list.splice(0, list.length);
    }
    return resArr;
  }


  /**
   * 根据action桶填充数据
   * @returns {Promise<any>}
   */
  autoFill() {
    return new Promise((resolve, reject) => {
      this.action(resArr => {
        // console.log('我是桶fill', resArr)
        if (util.isArray(resArr) && resArr.length) {
          bucketStore[this.name] = bucketStore[this.name] || [];
          bucketStore[this.name].push(...resArr);
        }
        resolve(true);
      }, rej => {
        console.error("bucket autoFill error", rej)
        // 请求出错
        reject(rej);
      });
    });
  }

  /**
   * 手动补充数据至数组尾部
   * @param{Array} arr
   */
  fill(arr) {
    if (util.isArray(arr) && arr.length) {
      bucketStore[this.name] = bucketStore[this.name] || [];
      bucketStore[this.name].push(...arr);
    }
  }

  /**
   * 手动补充数据至数组头部
   * @param{Array} arr
   */
  headFill(arr) {
    if (util.isArray(arr) && arr.length) {
      bucketStore[this.name] = bucketStore[this.name] || [];
      let newArr = arr.concat(bucketStore[this.name]);
      bucketStore[this.name] = newArr;
    }
  }

  delData() {
    delete bucketStore[this.name];
  }

  /**
   * 添加桶的已读的id，用作缓存桶数据的去重
   * (id会存于storage中)
   * @param{String|Number} id 数据源的标识id  (如：article_id)
   * @param{Number} num 已读次数  (非必填，默认为1)
   */
  addRead(id, num = 1) {
    //将id转为string
    id = String(id);
    const key = `${this.name}_${BUCKET_READ_KEY}`;
    let item = bucketStore[key].get(id) || 0;
    bucketStore[key].set(id, item + num);
    wx.setStorage({
      key: key,
      data: JSON.stringify([...bucketStore[BUCKET_READ_KEY]]),
    });
  }
}

