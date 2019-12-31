import {xhw, xhwApi} from "../../../core/index";


export async function getOpenIdByRequest() {
  let openId
  try {
    let res = await xhwApi.login()
    openId = (await xhw.request("openId", {code: res.code})).data.openId
    // debugger
    xhwApi.setStorageSync('openId', openId)
  } catch (e) {
    console.log(e)
  }
  return openId
}
