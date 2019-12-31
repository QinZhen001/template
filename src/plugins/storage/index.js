/**
 * 比较版本号的大小,判断是否过期
 * @param curVersion  当前的版本号   (例如 '1.2.4')
 * @param overdueVersion  过期的版本号    (例如 '1.2.5')
 * @returns {boolean}  true curVersion > optVersion 版本过期
 */
function isOverdue(curVersion, overdueVersion) {
  let arr1 = curVersion.split('.');
  let arr2 = overdueVersion.split('.');
  for (let i = 0; i < arr1.length; i++) {
    if (Number(arr1[i]) > Number(arr2[i])) {
      return true;
    }
  }
  return false;
}

class Storage {
  constructor(config) {
    this.config = config
    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.remove = this.remove.bind(this)
    this.clear = this.clear.bind(this)
  }

  /**
   * 获取缓存
   * @param {*} key - 缓存名
   * @param {*} funOpt.expire - 是否忽略过期时间校验
   * @param {*} funOpt.appVersion - 缓存的指定适用应用版本号
   */
  set(key, value, funOpt) {
    try {
      const _opt = Object.assign({}, this.config, funOpt);
      const data = {
        value,
        expire: Date.now() + (_opt.expire * 24 * 3600 * 1000),
      };

      if (_opt.appVersion) data.version = _opt.appVersion;
      wx.setStorageSync(key, data);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 设置缓存
   * @param {*} key - 缓存名
   * @param {*} funOpt.ignoreVersion - 是否忽略版本校验
   * @param {*} funOpt.ignoreExpire - 是否忽略过期时间校验
   * @param {*} funOpt.appVersion - 缓存的指定适用应用版本号
   */
  get(key, funOpt) {
    try {
      const data = wx.getStorageSync(key);
      const _opt = Object.assign({ignoreVersion: false, ignoreExpire: false}, this.config, funOpt);

      // 校验数据存在性
      if (!data) {
        console.info(`key:${key} 数据不存在`, {key, data});
        return undefined;
      }

      // 校验版本号
      if (!_opt.ignoreVersion && data.version && _opt.appVersion && isOverdue(_opt.appVersion, data.version)) {
        console.info(`key:${key} 版本号过期`, {key, data});
        return undefined;
      }

      // 校验过期时间
      if (!_opt.ignoreExpire && data.expire <= Date.now()) {
        console.info(`key:${key} 有效时间过期`, {key, data});
        return undefined;
      }

      return data.value;
    } catch (e) {
      console.error(e);
    }
  }


  remove(key) {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.error(e);
    }
  }

  clear() {
    try {
      wx.clearStorageSync();
    } catch (e) {
      console.error(e);
    }
  }
}

export default function (options) {
  const config = Object.assign({expire: 7}, options);
  const storage = new Storage(config)
  return {
    name: 'storage',
    custom: {
      set: storage.set,
      get: storage.get,
      remove: storage.remove,
      clear: storage.clear,
    },
  };
};
