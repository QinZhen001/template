import {isNumber, isObject, logger} from "../../shared/util"
import {dispatchRequest} from './dispatch'
import InterceptorManager from "./interceptorManager"

// 做一层缓存
let cache = {}

function _checkConfig(config) {
  if (!isObject(config)) {
    throw new Error(logger(`Request need a object,not ${typeof config}`))
  }
}

function _getFinOptions(name, config, data, store) {
  if (cache[name]) {
    return cache[name]
  }
  // const commonParams = deepCopy(config.$commonParams)
  const commonParams = config.$commonParams
  const {dependency: comDependency, common: comData} = commonParams
  const options = config[name]
  data = {
    ...comData,
    ...data,
  }
  options.dependency = {
    ...comDependency,
    ...options.dependency,
  }
  const finalOptions = {
    name,
    ...options,
    data: data,
    store,
  }
  cache[name] = finalOptions
  return finalOptions
}

// /**
//  * 重试机制
//  * 添加重试拦截器
//  * @param chain (promise链)
//  * @param retry (重试次数)
//  * @param options 请求参数对象
//  * @private
//  */
function _addRetryInterceptor({chain, options, defaults}) {
  // debugger
  const {retry} = options
  const {retryTime} = defaults
  let startTime
  for (let i = 0; i < retry; i++) {
    chain.push({
      resolved: undefined,
      rejected: res => {
        if (!startTime) {
          startTime = new Date().getTime()
        } else {
          let nowTime = new Date().getTime()
          if (nowTime - startTime > retryTime) {
            return Promise.reject(res)
          }
        }
        // console.log("res", res)
        // debugger
        return dispatchRequest(options)
      },
    })
  }
}

export default class XhwRequest {
  constructor() {
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    }
    this.defaults = {
      retryTime: 5000,
    }
    this.init = this.init.bind(this)
    this.request = this.request.bind(this)
  }

  init(config, option) {
    _checkConfig(config)
    this.config = config
    this.store = option.store
    this.defaults.retryTime = option.retryTime || 5000
  }


  request(name, data) {
    const config = this.config
    if (Object.keys(config).indexOf(name) === -1) {
      throw new SyntaxError(logger(`非法的xhwRequest ${name}: 不在reqConfig配置中`));
    }

    const finalOptions = _getFinOptions(name, config, data, this.store)

    // console.log(finalOptions)
    // debugger

    const chain = [
      {
        resolved: dispatchRequest,
        rejected: undefined,
      },
    ]


    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    })

    // 中间插入重试机制
    const retry = config[name].retry
    if (isNumber(retry)) {
      // debugger
      _addRetryInterceptor({
        chain,
        options: finalOptions,
        defaults: this.defaults,
      })
    }


    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })


    let promise = Promise.resolve(finalOptions)

    while (chain.length) {
      const {resolved, rejected} = chain.shift()
      promise = promise.then(resolved, rejected)
    }

    return promise
  }
}

