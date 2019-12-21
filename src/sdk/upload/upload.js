// const request = require('../request/request')
// const globalData = require('./globalData')
// const openid = require('../request/openid')


const AUTH_URL = 'api/web/vod/upload_auth'

const DEV_REG = /flydev/

const DEV_CALL_BACK_URL = 'https://flydev.heywoodsminiprogram.com/call/alivideo'

const PRO_CALL_BACK_URL = 'https://fly.heywoodsminiprogram.com/call/alivideo'

/**
 *  视频上传 (封装wx.uploadFile)
 *
 *
 * @param{String} filePath 文件路径
 * @param{Function} cb 上传中回调函数 (带参数 上传进度)
 * @param{Function} success 上传成功的回调函数
 * @param{Function} fail 上传失败的回调函数
 */
async function uploadVideo(filePath, cb, success, fail) {
  let res = null
  try {
    res = await getUploadAuth({
      title: filePath,
      file_name: filePath,
    })
  } catch (e) {
    throw new Error(e);
  }
  const uploadTask = wx.uploadFile({
    header: {
      'content-type': 'video/mp4',
    },
    url: res.data.host,
    filePath: filePath,
    name: 'file',
    formData: {
      name: res.data.file_name,
      key: res.data.file_name,
      policy: res.data.policy,
      OSSAccessKeyId: res.data.access_key_id,
      success_action_status: '200',
      signature: res.data.signature,
      'x-oss-security-token': res.data.security_token
    },
    success(suc) {
      success({...suc, data: {url: res.data.file_url, videoId: res.data.video_id}});
    },
    fail(fai) {
      fail(fai);
    }
  });
  uploadTask.onProgressUpdate((res) => {
    cb(res.progress);
  });
}


/**
 * 获取视频凭证
 * 文档： https://www.showdoc.cc/344608763388140?page_id=2159317985827022
 * @param data (openid,file_name,title)
 * @returns {Promise<any>}
 */
async function getUploadAuth(data = {}) {
  const baseConfig = globalData.getGlobalData('baseConfig')
  if (!baseConfig.accessKeyId) {
    throw new SyntaxError('请在baseConfig中配置正确的accessKeyId')
  }
  if (!baseConfig.uploadUrl) {
    throw new SyntaxError('请在baseConfig中配置正确的uploadUrl')
  }
  data.call_back_url = DEV_REG.test(baseConfig.baseUrl) ? DEV_CALL_BACK_URL : PRO_CALL_BACK_URL
  // console.log('data.call_back_url', data.call_back_url)
  data.openid = await openid.getOpenId()
  let url = `${baseConfig.uploadUrl}${AUTH_URL}`
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'access-key-id': baseConfig.accessKeyId
      },
      success: (res) => {
        if (res.statusCode !== 200 || res.data.errCode) {
          return reject(res)
        } else {
          return resolve(res)
        }
      },
      fail: (res) => {
        reject(res)
      }
    })
  })
}


exports.uploadVideo = uploadVideo


