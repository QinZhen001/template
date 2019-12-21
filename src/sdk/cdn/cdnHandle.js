// 鉴权相关(各种url转化的方法)
const constant = require('../constant/constant');
const md5 = require('../lib/md5');
const {getPlatform} = require('../helper/util');

/**
 * 将普通的url转化成Webp链接（内含机型判断）
 * (对外暴露的方法)
 * https://cloud.tencent.com/document/product/460/6929
 * https://help.aliyun.com/document_detail/44703.html?spm=a2c4g.11186623.6.1298.185a17f1UhfJ5n
 * @param {String} url
 * @return {String}
 */
async function transformWebpUrl(url) {
  if (/x-oss-process=image\/format,webp/.test(url) || !url) {
    // 已经转成了Webp链接 或者 url不存在
    return url;
  }
  if (/x-oss-process=image\//.test(url)) {
    //可能对图片进行过处理
    return url.replace(/(x-oss-process=image\/)/, "$1format,webp/");
  }
  let platform = '';
  try {
    platform = await getPlatform();
  } catch (e) {
    console.error(e);
  }
  if (platform && platform == 'Android' && url.indexOf('gif') == -1) {
    //如果是安卓并且不是gif，转webp
    const domain = url.split('/')[2]; //原域名
    const tencentIndex = constant.tencentDomainlist.indexOf(domain);
    const aliyunIndex = constant.aliyunDomainlist.indexOf(domain);
    const webpRxt = 'x-oss-process=image/format,webp'; //阿里云转格式后缀
    if (tencentIndex !== -1) {
      //腾讯云列表含有此域名
      const handleDomain = constant.tencentHandleDomainlist[tencentIndex]; //处理域名
      // let webpRxt = 'imageView2/format/webp'; //转格式后缀
      url = url.replace(domain, handleDomain); //域名处理后原链接
      url += url.indexOf('?') !== -1 ? '&' + webpRxt : '?' + webpRxt;
    } else if (aliyunIndex !== -1) {
      //阿里云列表含有此域名
      if (url.indexOf('?') !== -1) {
        let parameterIndex = -1;
        //若含有以上aliyunparameter的特殊参数，直接去除
        for (const item in constant.aliyunparameter) {
          if (url.indexOf(constant.aliyunparameter[item]) !== -1) {
            parameterIndex = Number(item);
            break;
          }
        }
        //域名处理后原链接
        url = parameterIndex !== -1 ? url.replace(constant.aliyunparameter[parameterIndex], webpRxt) : url + '&' + webpRxt;
      } else {
        url += '?' + webpRxt;
      }
    }
  }
  // console.log('transformWebpUrl_url', url)
  return url;
}


/**
 * 将普通的url进行质量压缩（内含机型判断,安卓机先转webp格式）
 * (对外暴露的方法)
 * https://cloud.tencent.com/document/product/460/6929
 * https://help.aliyun.com/document_detail/44703.html?spm=a2c4g.11186623.6.1298.185a17f1UhfJ5n
 * @param {String} url
 * @param {Number} sizeData (指定目标缩略图的最短边尺寸，如果传0，则表示不缩放)
 * @return {String}
 */
function transformQualityUrl(url, sizeData = 0) {
  if (!url || !sizeData) {
    return url;
  }
  if (url.indexOf('sign') !== -1) {
    //已带鉴权的去掉
    let signIndex = url.indexOf('sign');
    url = url.slice(0, signIndex - 1);
  }
  let webpRxt; //缩放参数
  if (/x-oss-process=image\/format,webp/.test(url)) {
    url = _delWebpRxt(url);
    webpRxt = `x-oss-process=image/format,webp/resize,s_${sizeData}`;
  } else {
    webpRxt = `x-oss-process=image/resize,s_${sizeData}`;
  }
  let domain = url.split('/')[2]; //原域名
  let tencentIndex = constant.tencentDomainlist.indexOf(domain);
  let aliyunIndex = constant.aliyunDomainlist.indexOf(domain);
  let tencentHandleIndex = constant.tencentHandleDomainlist.indexOf(domain);
  if (tencentIndex !== -1) { //腾讯云列表含有此域名
    let handleDomain = constant.tencentHandleDomainlist[tencentIndex]; //处理域名
    url = url.replace(domain, handleDomain); //域名处理后原链接
    url += url.indexOf('?') !== -1 ? '&' + webpRxt : '?' + webpRxt; 
  } else if (aliyunIndex !== -1) { //阿里云列表含有此域名
    if (url.indexOf('?') !== -1) {
      let parameterIndex = -1;
      //若含有以上aliyunparameter的特殊参数，直接去除
      for (let item in constant.aliyunparameter) {
        if (url.indexOf(constant.aliyunparameter[item]) !== -1) {
          parameterIndex = Number(item);
          break;
        }
      }
      //域名处理后原链接
      url = parameterIndex !== -1 ? url.replace(constant.aliyunparameter[parameterIndex], webpRxt) : url + '&' + webpRxt;
    } else {
      url += '?' + webpRxt;
    }
  } else if (tencentHandleIndex !== -1){ //处理完的域名
    url += url.indexOf('?') !== -1 ? '&' + webpRxt : '?' + webpRxt; 
  }
  return url;
}


/**
 * 将普通的url转化成鉴权后的url
 * (对外暴露的方法)
 * https://cloud.tencent.com/document/product/228/13677
 * @param {String} url
 * @param {Number} type  1:接口、音频和视频 否则 图片
 * @return {String}
 */
// function transformAuthUrl(url, type) {
//   if (!url) {
//     return url;
//   }
//   if (!type || type !== 1) {
//     url = transformWebpUrl(url);
//   }
//   let key = globalData.getGlobalData('resourceSignKey');
//   if (!key) {
//     //key为'' 或者 undefined
//     key = 'alexander';
//   } else if (key == 'none') {
//     //不做任何处理 直接返回url
//     return url;
//   }
//   //去掉url前缀
//   let path = url.replace(/^https?:\/\/\S+?\//, '/');
//   const t = (new Date().getTime() / 1000).toString(16).replace(/\.\S+/, '');
//   let sign = '';
//   if (path.indexOf('?') !== -1) {
//     //path中有？
//     path = path.replace(/\?\S+$/, '');
//     sign = md5(`${key}${path}${t}`).toString();
//     let src;
//     if (url.indexOf('sign') !== -1) { //带有sign
//       const signIndex = url.indexOf('sign');
//       url = url.slice(0, signIndex - 1);
//       src = url.indexOf('?') !== -1 ? `${url}&sign=${sign}&t=${t}` : `${url}?sign=${sign}&t=${t}`;
//     } else {
//       src = `${url}&sign=${sign}&t=${t}`;
//     }
//     return src;
//   } else {
//     sign = md5(`${key}${path}${t}`).toString();
//     return `${url}?sign=${sign}&t=${t}`;
//   }
// }

// --------- 内置方法，不对外暴露 ------------------------


/**
 * 将普通的url去除webp后缀
 */
function _delWebpRxt(url) {
  //阿里云转格式后缀
  let webpRxt = '?x-oss-process=image/format,webp';
  let webpRxt2 = '&x-oss-process=image/format,webp';
  if (url.indexOf(webpRxt) !== -1) {
    url = url.slice(0, url.indexOf(webpRxt));
    // url = url.replace(webpRxt, '');
  } else if (url.indexOf(webpRxt2) !== -1) {
    url = url.slice(0, url.indexOf(webpRxt2));
    // url = url.replace(webpRxt2, '');
  }
  return url;
}


/**
 *
 * @param url 视频的地址
 * @param{Number} index 视频截屏第几帧 (非必填，默认为1)
 * @returns {String} 截屏后的图片
 */
function captureScreen(url, index = 1) {
  if (!/\.(mp4|rmvb|flv|mpeg|avi)$/.test(url)) {
    console.error('captureScreen错误的视频url:', url);
    return url;
  }
  if (/x-oss-process=video\/snapshot/.test(url)) {
    return url;
  }
  let length = index.toString().length;
  if (length < 4) {
    let needNum = 4 - length;
    let tempStr = '';
    for (let i = 0; i < needNum; i++) {
      tempStr += '0';
    }
    index = tempStr + index;
  }
  return `${url}?x-oss-process=video/snapshot,t_${index},f_jpg,m_fast`;
}


// exports.transformAuthUrl = transformAuthUrl;


exports.transformQualityUrl = transformQualityUrl;
exports.transformWebpUrl = transformWebpUrl;
exports.captureScreen = captureScreen;





