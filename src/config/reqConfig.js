/**
 * 矩阵2.0请求配置
 *
 * $commonParams 为每个请求data中的公共参数
 *              dependency 意味着，数据在state中
 *
 *
 * header (非必填，默认{'content-type': 'application/x-www-form-urlencoded'})
 * method (非必填，默认 'POST')
 * model 请求模式  (非必填，默认normal)
 * dependency 请求依赖的全局数据，对应在state中 (会自动去获取数据加到请求参数data中)  (非必填)
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


