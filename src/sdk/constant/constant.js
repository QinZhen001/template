//腾讯云&阿里云特殊域名和参数（transformWebpUrl方法用到）
const tencentDomainlist = [
  'goclick.heywoodsminiprogram.com',
  'yuetu.heywoodsminiprogram.com',
  'ad.heywoodsminiprogram.com',
  // 'dev.heka4.site'
];

const tencentHandleDomainlist = [
  'webpgoclick.heywoodsminiprogram.com',
  'webpyuetu.heywoodsminiprogram.com',
  'webpad.heywoodsminiprogram.com'
  // 'goclick-1253404514.picgz.myqcloud.com',
  // 'yuetu-1253404514.picgz.myqcloud.com',
  // 'dev-1253404514.picgz.myqcloud.com'
];

const aliyunDomainlist = [
  'res.heywoodsminiprogram.com',
  'down.heywoodsminiprogram.com',
  'test.heka2.tech',
  'flyres.heywoodsminiprogram.com',
];

const aliyunparameter = [
  'x-oss-process=style/gojpg',
  'x-oss-process=style/tojpg',
];

exports.tencentDomainlist = tencentDomainlist;
exports.tencentHandleDomainlist = tencentHandleDomainlist;
exports.aliyunDomainlist = aliyunDomainlist;
exports.aliyunparameter = aliyunparameter;
