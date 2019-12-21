/**
 * 生产环境的配置 （会覆盖baseConfig.js）
 */
const proConfig = {
  baseUrl: 'https://ydapi.heywoodsminiprogram.com/api', //业务
  prefixAbTestUrl: 'https://abtest.heywoodsminiprogram.com', //abTest
  prefixJsonUrl: 'https://goclick.heywoodsminiprogram.com/mini-program-matrix/data/json-data/', //详情json
  prefixReportUrl: 'https://moonlight.heywoodsminiprogram.com/api/v4/kv/batch', //数据上报
  prefixAdUrl: 'https://adsystemapi.heywoodsminiprogram.com', //广告
  abnormalUrl: 'https://api.heywoodsminiprogram.com', //init
  uploadUrl: 'https://aliservice.heywoodsminiprogram.com/',
  yingjiJsonUrl: 'https://res.heywoodsminiprogram.com/clickImages/yingji',
  ecommerceUrl: 'https://ecommerceweb.heywoodsminiprogram.com', //电商支付
}

module.exports = proConfig


