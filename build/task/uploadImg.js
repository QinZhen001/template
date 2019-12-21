const OSS = require('ali-oss')
const userConfig = require('../config/userConfig');

const {
  region: REGION,
  accessKeyId: ACCESS_KEYID,
  accessKeySecret: ACCESS_KEYSECRET,
  bucket: BUCKET
} = userConfig.ossConfig;
const { uploadPath, localPath } = userConfig.uploadImgConfig;
/**
 * 上传文件到阿里云
 * 参考文档 https://www.alibabacloud.com/help/zh/doc-detail/111265.htm?spm=a2c63.p38356.b99.501.6f7d30dauYWMgn
 */
async function uploadImg () {
  let client = new OSS({
    region: REGION,
    accessKeyId: ACCESS_KEYID,
    accessKeySecret: ACCESS_KEYSECRET,
    bucket: BUCKET,
  });
  try {
    let result = await client.put(uploadPath, localPath);
    // console.log(result);
  } catch (e) {
    throw new Error('上传图片任务出错');
  }
}


module.exports = uploadImg;