/**
 * xhw请求配置
 *
 * $commonParams 为每一个请求data注入公共参数
 *   common:同步数据，可直接获取
 *   dependency 请求依赖 (数据存在于store，若获取不到数据，会触发store的getters函数获取数据)
 *
 * 每一项为一个请求配置
 * header (非必填，默认{'content-type': 'application/x-www-form-urlencoded'})
 * method (非必填，默认 'POST')
 * model 请求模式  (非必填，默认normal)
 * dependency 当前请求的依赖
 * url 请求地址
 * retry 请求重试的此时 (非必填，默认0)
 *
 */
import baseConfig from "./baseConfig"

const {identification, baseUrl} = baseConfig

export default {
  $commonParams: {
    common: {
      item: identification,
    },
    dependency: {
      model: 'model',
    },
  },
  testNormal: {
    method: "post",
    model: 'normal',
    url: `${baseUrl}/shop/car`,
    dependency: {openid: 'openId'},
  },
  testWait: {
    model: 'wait',
    url: `${baseUrl}/shop/car`,
    dependency: {openid: 'openId'},
  },
  testQueue: {
    model: 'queue',
    url: `${baseUrl}/shop/car`,
    dependency: {openid: 'openId'},
  },
  testRetry: {
    retry: 3,
    model: 'normal',
    url: `${baseUrl}/shop/car`,
    dependency: {openid: 'openId'},
  },
  openId: {
    model: 'normal',
    url: `${baseUrl}/user/openId`,
  },
};


