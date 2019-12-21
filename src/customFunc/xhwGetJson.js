const baseConfig = require('../config/baseConfig');
const monitor = require('./monitor');



/**
 * 获取json文件数
 * @param id json文件的 id（必填）
 * @returns {Promise<any>}
 */
function xhwGetJson(id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      throw new Error('xhwGetJson 需要一个id值');
    }
    let url = `${baseConfig.prefixJsonUrl}${id}.json`;
    wx.request({
      url: url,
      data: {},
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          res.article_id = id;
          monitor.addReport('detailJsonRequestError', res);
          reject(res);
        }
      },
      fail: (res) => {
        res.article_id = id;
        monitor.addReport('detailJsonRequestError', res);
        reject(res);
      },
    });
  });
}

module.exports = xhwGetJson;