import {getHooks} from "./hook"


// let look = false

async function _setDependency(data, dependency, store) {
  if (store && Object.keys(dependency).length) {
    for (let key in dependency) {
      if (dependency.hasOwnProperty(key)) {
        data[key] = await store.getAsync(dependency[key])
      }
    }
  }
}

export function dispatchRequest(config) {
  let {
    name, // 名字
    model, // 模式
    responseType = "text",
    url,
    data = {},
    method = "POST",
    header = {'content-type': 'application/x-www-form-urlencoded'},
    hooks, // 钩子函数
    store, // 数据仓库
    dependency, //依赖 (数据仓库中的数据)
  } = config

  method = method.toUpperCase()
  if (!hooks) {
    // console.log("getHooks1111111")
    hooks = getHooks(name, model)
  }
  return new Promise(async (resolve, reject) => {
    // console.log("222222", this)
    // debugger
    const isNext = hooks.init ? hooks.init({resolve, reject, config}) : true;
    // console.log("isNext", this)
    // debugger
    if (isNext) {
      await _setDependency(data, dependency, store)
      wx.request({
        responseType: responseType,
        url: url,
        data: data,
        method: method,
        header: header,
        success: (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(res)
          }
          resolve(res);
          hooks.success && hooks.success(res);
        },
        fail: (res) => {
          reject(res)
          hooks.fail && hooks.fail(res);
        },
      })
    }
  })
}
