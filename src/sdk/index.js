const cdn = require('./cdn/cdnHandle');
const sendkv = require('./statistics/statistics');


const sdk = {
  transformQualityUrl: cdn.transformQualityUrl,
  transformWebpUrl: cdn.transformWebpUrl,
  captureScreen: cdn.captureScreen,
  sendkv,
};


module.exports = sdk;


