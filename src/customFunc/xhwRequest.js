/**
 * 请求的hooks
 * init: 初始化 (这里有可能会重复执行多次)
 * next: 进入到请求核心阶段 (是一个async函数,接受参数data)
 * (由init返回的boolean判断是否进入这个hook，这里只会执行一次，在此处进行耗时操作)
 * success: 请求成功
 * fail: 请求失败
 * (这里的hooks会融合进框架底层request的hooks)
 */

const qqtea = require("../lib/qqtea");
const reqConfig = require('../config/reqConfig');
const baseConfig = require("../config/baseConfig");
const {xhw} = require('../core/index');
const {addReport} = require('./monitor');
const {isPainObject, str2ab, extend, isFunction, uint8ArrayToString, deepCopy} = require("./util");

// const ENV_PROD = "prod"
// todo 目前测试中 将ENV_PROD 设为 dev2

const ENV_PROD = "dev2";
const TEA_KEY = "XHW_SHARE_ENCRYPT";


function _getNextHook({name, commonParams, encrypt}) {
  return async ({options, data}) => {
    await _addDataParams(data, commonParams);
    if (encrypt) {
      // 当前环境是需要的环境 且 此请求需要加密
      console.log(`${name} 请求的参数: \n`, data);
      data = qqtea.encrypt(JSON.stringify(data), TEA_KEY);
      data = str2ab(data);
      options.header = {'content-type': 'application/octet-stream'};
      options.responseType = "arraybuffer";
    }
  };
}


// function _getInterceptHook({name, encrypt, intercept}) {
//   const finalIntercept = async (res) => {
//     if (intercept) {
//       intercept();
//     }
//     if (encrypt) {
//       let byteArr = new Uint8Array(res.data);
//       res.data = JSON.parse(qqtea.decrypt(uint8ArrayToString(byteArr), TEA_KEY));
//     }
//   };
//
//   return finalIntercept;
// }


/**
 *
 * @param data 请求的data
 * @param dependency 请求的依赖
 * @param commonParams 请求的公共参数 (包括公共的依赖)
 * @returns {Promise<void>}
 * @private
 */
async function _addDataParams(data, commonParams) {
  await _dealDataParams(data, commonParams);
  // 全部请求的依赖项
  // addDataBaseDependency(data);
}


async function _dealDataParams(data, commonParams = {}) {
  for (let key in commonParams) {
    if (key !== 'dependency') {
      data[key] = commonParams[key];
    } else {
      try {
        const dependency = commonParams[key];
        for (let innerKey in dependency) {
          if (dependency[innerKey]) {
            data[innerKey] = await wx.store.get(dependency[innerKey]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}


async function _addDataSelfDependency(data, dependency = {}) {
  try {
    for (let innerKey in dependency) {
      if (data[innerKey]) {
        data[innerKey] = await wx.store.get(dependency[innerKey]);
      }
    }
  } catch (e) {
    console.error(e);
  }
}


/**
 * 添加相关的监控项
 * @param name  名字
 * @param res 信息
 * @private
 */
function _addMonitorReport(name, res) {
  switch (name) {
    case 'getInitInfo':
      //init
      addReport('initInfoError', res);
      break;
    case 'getAbTest':
      //AbTest
      addReport('abTestError', res);
      break;
    case 'getAdList':
      //旧广告
      addReport('adListError', res);
      break;
    case 'getAdPoolList':
      //新广告
      addReport('adListError', res);
      break;
    case 'makeSession':
      //makeSession
      addReport('makeSessionError', res, true);
      break;
    case 'toReward':
      //赞赏接口调用失败
      addReport('rewardError', res);
      break;
    case 'getHomePageList':
      //首页列表
      addReport('homePageListError', res);
      break;
    case 'getDetailsList':
      //详情页推荐列表
      addReport('recommendListError', res);
      break;
    case 'getDetailsListNew':
      //详情页新推荐列表
      addReport('recommendListError', res);
      break;
  }
}


function _checkStatusCode(code) {
  return code >= 200 && code < 300
}


// ---------- 核心模块 --------------------------


class InterceptorManager {
  constructor() {
    this.interceptors = [];
  }

  use(resolved, rejected) {
    this.interceptors.push({
      resolved,
      rejected,
    });
    return this.interceptors.length - 1;
  }

  forEach(fn) {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor);
      }
    });
  }
}


class XhwRequest {
  constructor(baseConfig = {}, reqConfig = {}) {
    this.baseConfig = baseConfig;
    this.reqConfig = reqConfig;
    this.interceptors = new InterceptorManager();
    // this._init();
    // 将类方法变为可枚举属性
    this.request = this.request.bind(this);
    this.addInterceptor = this.addInterceptor.bind(this);
  }

  addInterceptor() {

  }

  /**
   * 初始化
   * 初始化拦截器
   * @private
   */
  // _init() {
  //   Object.keys(this.reqConfig).forEach(key => {
  //     const item = this.reqConfig[key];
  //     if (item.intercept) {
  //       this.addInterceptor(item.name, item.intercept);
  //     }
  //   });
  // }


  /**
   *
   * @param{String} name reqConfig中的key
   * @param{Object} data 请求所需要的额外参数 (非必填)
   * @returns {Promise<void>}
   */
  request(name, data = {}) {
    if (Object.keys(this.reqConfig).indexOf(name) === -1) {
      throw new SyntaxError(`非法的xhwRequest ${name}: 不在reqConfig配置中`);
    }
    const options = this.reqConfig[name];
    const encrypt = (this.baseConfig.env === ENV_PROD && options.encrypt);
    // 参数依赖提前合并 提前处理
    let commonParams = deepCopy(this.reqConfig.$commonParams)
    commonParams.dependency = {...commonParams.dependency, ...options.dependency};
    const nextHook = _getNextHook({
      name,
      commonParams,
      encrypt,
    });
    const hooks = {
      // next 其实也相当于请求拦截器 (不过一系列请求只会执行一次)
      next: nextHook,
    };
    const chain = [
      {
        resolved: xhw.request,
        rejected: undefined,
      },
    ];
    options.retry = 3
    if (options.retry) {
      this._addRetryInterceptors({name, data, options});
    }
    // 添加默认的拦截器
    this._addDefaultInterceptors({name, data, options, encrypt});

    this.interceptors.forEach(interceptor => {
      chain.push(interceptor);
    });

    let promise = Promise.resolve({name, options, data, hooks})

    while (chain.length) {
      const {resolved, rejected} = chain.shift();
      promise = promise.then(resolved, rejected);
    }

    return promise;

    // 添加data依赖数据
    // xhw.request({name, options, data, hooks}).then(res => {
    //   let includeJSON = options.url.indexOf('json');
    //   if (includeJSON !== -1 ||
    //     (includeJSON === -1 && (res.data.code == 1))) {
    //     // console.log('res.data', res.data);
    //     resolve(res.data);
    //   } else {
    //     _addMonitorReport(name, res);
    //     reject(res.data);
    //   }
    // }, rej => {
    //   _addMonitorReport(name, rej);
    //   reject(rej);
    // });
  }

  _addRetryInterceptors({name, options, data}) {
    async function resolved(res) {
      if (!_checkStatusCode(res.statusCode)) {
        _addMonitorReport(name, res);
        // 进行重试
        let finRes
        const retry = options.retry
        for (let i = 0; i < retry; i++) {
          finRes = await this.request(name, data)
          if()
        }
        return
      } else {
        return res
      }
    }

    function rejected(err) {
      _addMonitorReport(name, err);
      return Promise.reject(err);
    }

    this.interceptors.use(resolved, rejected);
  }


  _addDefaultInterceptors({name, options, encrypt, data}) {
    let url = options.url || "";
    let includeJSON = url.indexOf('json');

    function resolved(res) {
      if (encrypt) {
        //进行解密
        let byteArr = new Uint8Array(res.data);
        res.data = JSON.parse(qqtea.decrypt(uint8ArrayToString(byteArr), TEA_KEY));
      }
      if (includeJSON !== -1 ||
        (includeJSON === -1 && (~~res.data.code === 1))) {
        // 注意这里res.data
        return res.data;
      } else {
        _addMonitorReport(name, res);
        return Promise.reject(res.data);
      }
    }

    function rejected(err) {
      _addMonitorReport(name, err);
      return Promise.reject(err);
    }

    this.interceptors.use(resolved, rejected);
  }


}


function createInstance() {
  const context = new XhwRequest(baseConfig, reqConfig);
  const instance = context.request;
  extend(instance, context);
  return instance;
}

const xhwRequest = createInstance();


// debugger;


module.exports = xhwRequest;
