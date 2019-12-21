const baseConfig = require('../../../config/baseConfig');
const Bucket = require('./bucket');
const {BUCKET_KEY, BUCKET_READ_KEY} = require("./constant");

global[BUCKET_KEY] = global[BUCKET_KEY] || {};
const bucketStore = global[BUCKET_KEY];

/**
 * 存储桶控制器
 */
class BucketControl {
  static getInstance(bucketConfig) {
    if (!BucketControl.instance) {
      BucketControl.instance = new BucketControl(bucketConfig);
    }
    return BucketControl.instance;
  }

  constructor(bucketConfig = {}) {
    let buckets = {};
    Object.keys(bucketConfig).forEach(key => {
      buckets[key] = new Bucket({name: key, ...bucketConfig[key]});
    });
    this.buckets = buckets;
    // this 的指向 (防止函数被单独拿出来使用)
    // http://es6.ruanyifeng.com/#docs/class
    this.add = this.add.bind(this);
    this.addRead = this.addRead.bind(this);
    this.remove = this.remove.bind(this);
    this.choose = this.choose.bind(this);
    this.print = this.print.bind(this);
    this.delAll = this.delAll.bind(this);
    this.delRead = this.delRead.bind(this);
    this.init();
  }

  /**
   * 缓存桶相关初始化的操作
   */
  init() {
    let readMap = wx.getStorageSync(BUCKET_READ_KEY);
    bucketStore[BUCKET_READ_KEY] = readMap === "" ? new Map() : new Map([...JSON.parse(readMap)]);
    let useContent2 = wx.getStorageSync('useContent2') || false;
    if (useContent2 !== baseConfig.useContent2) { //内容版本不同，删除去重数组和缓存桶时间
      wx.setStorageSync('useContent2', baseConfig.useContent2 || false);
      wx.removeStorageSync('bucketStorageTime');
      this.delRead();
    }
  }

  /**
   * 往缓存桶控制中心增加缓存桶
   * @param bucket
   */
  add(bucket) {
    if (this.buckets[bucket.name]) {
      console.error(`${bucket.name} 缓存桶已经存在`);
    }
    if (bucket instanceof Bucket) {
      this.buckets[bucket.name] = bucket;
    } else {
      this.buckets[bucket.name] = new Bucket(bucket);
    }
  }

  /**
   * 删除选择的缓存桶及桶内数据
   * @param{String} bucketName 桶名字
   */
  remove(bucketName) {
    if (this.buckets[bucketName]) {
      this.buckets[bucketName].delData();
      delete this.buckets[bucketName];
    }
  }

  /**
   * 删除所有缓存桶及桶内数据
   */
  delAll() {
    this.buckets = null;
    Object.keys(bucketStore).forEach(key => {
      if (key !== BUCKET_READ_KEY) {
        delete bucketStore[key];
      }
    });
  }

  /**
   * 获取缓存桶
   * @param name 桶名字
   * @returns{Bucket}
   */
  choose(name) {
    if (!this.buckets[name]) {
      throw new Error(`非法的桶名字: ${name}`);
    }
    return this.buckets[name];
  }

  print() {
    return this.buckets;
  }


  /**
   * 添加全局的已读的id，用作缓存桶数据的去重
   * (id会存于storage中)
   * @param{String|Number} id 数据源的标识id  (如：article_id)
   * @param{Number} num 已读次数  (非必填，默认为1)
   */
  addRead(id, num = 1) {
    //将id转为string
    id = String(id);
    if (!bucketStore[BUCKET_READ_KEY]) {
      bucketStore[BUCKET_READ_KEY] = new Map();
    }
    let item = bucketStore[BUCKET_READ_KEY].get(id) || 0;
    bucketStore[BUCKET_READ_KEY].set(id, item + num);
    wx.setStorage({
      key: BUCKET_READ_KEY,
      data: JSON.stringify([...bucketStore[BUCKET_READ_KEY]]),
    });
  }


  /**
   * 删除storage中的去重数组
   * @returns {Promise<any>}
   */
  delRead() {
    return new Promise((resolve, reject) => {
      bucketStore[BUCKET_READ_KEY] = null;
      wx.removeStorage({
        key: BUCKET_READ_KEY,
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        },
      });
    });
  }
}


module.exports = function (config) {
  // 这里之所以要设置成类 是因为bucketControl初始化要依赖一个config
  let bucketControl = BucketControl.getInstance(config);
  return {
    name: 'bucketControl',
    customMethod: {
      add: bucketControl.add,
      addRead: bucketControl.addRead,
      remove: bucketControl.remove,
      choose: bucketControl.choose,
      print: bucketControl.print,
      delAll: bucketControl.delAll,
      delRead: bucketControl.delRead,
    },
  };
};














