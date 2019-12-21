const xhwRequest = require("./xhwRequest");

async function xhwKeyRequest(name, data) {
  return new Promise(async (resolve, reject) => {
    const now = Date.parse(new Date()) / 1000;
    const expireTime = await wx.store.get('expireTime')
    console.log('expireTime', expireTime)
    if (expireTime < now) {
      await resetTime()
    } else if (!await checkLogin()) {
      await resetTime()
    }
    resolve(await xhwRequest(name, data))
  })
}

// 微信检查登录状态
async function checkLogin() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success () {
        console.log('success')
        // session_key 未过期，并且在本生命周期一直有效
        resolve(true)
      },
      fail () {
        console.log('fail')
        // session_key 已经失效，需要重新执行登录流程
        resolve(false)
      },
      complete () {
        console.log('complete')
      }
    })
  })
}

//  重置expireTime
async function resetTime() {
  return new Promise(async (resolve, reject) => {
    wx.removeStorageSync('expireTime')
    wx.store.commit('expireTime', '')
    await wx.store.get('expireTime')
    resolve(true)
  })
}


module.exports = xhwKeyRequest;