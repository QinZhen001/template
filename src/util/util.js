const ksort = require('./ksort.js');
const custom = require('../customFunc/index');
const baseConfig = require('../config/baseConfig');
const {
  prefixJsonUrl
} = require('../config/devConfig');
const md5 = require('../lib/md5');
const formIdToken = 'gZfKOYaO39ecBFpy';


function compareVersion(num1, num2) {
  let arr1 = num1.split('.');
  let arr2 = num2.split('.');
  for (let i = 0; i < arr1.length; i++) {
    let num1 = Number(arr1[i]);
    let num2 = Number(arr2[i]);
    if (num1 > num2) {
      return true;
    } else if (num1 < num2) {
      return false;
    }
  }
  return false;
}

/**
 * 获取FormIdRequest的sign
 * @param dataArr 请求中的data所有参数
 */
function getFormIdSign(dataArr) {
  let str = assemble(dataArr);
  return (md5((((md5(str).toString().toUpperCase())) + formIdToken)).toString()).toUpperCase();
}

function assemble(dataArr) {
  let data = dataArr;
  ksort(data);
  let sign = '';
  for (let i in data) {
    //处理大于11版本
    if ((i == 'group_comment') || (i == 'wx_name')) {
      // if (config.default.client_version > 11 && (i == 'wx_name')) {
    } else {
      if (!data[i]) continue;
      sign += i + (data[i].constructor == Array ? assemble(data[i]) : data[i]);
    }
  }
  return sign;
}

/**
 * 判断时间是否是当天
 */
function isToday(date) { //判断时间是否是当天
  return new Date().toDateString() === new Date(date).toDateString();
}

/**
 * 判断时间是否是昨天
 */
function isYesterday(date) { //判断时间是否是当天
  let yesterday = new Date().getTime() - 24 * 60 * 60 * 1000;
  return new Date(yesterday).toDateString() === new Date(date).toDateString();
}

function getRandom(length) {
  return Math.round(Math.random() * length)
}

function getAdListByName(name, ads) {
  name = name || 'index'
  let adList = []
  for (let key in ads) {
    if (key.indexOf(name) > -1) {
      adList.push(ads[key])
    }
  }
  // 排序
  adList.sort(function (a, b) {
    let value1 = a.id.substring(name.length)
    let value2 = b.id.substring(name.length)
    return parseInt(value1) - parseInt(value2)
  })
  return adList
}

/**
 * 弹窗提示
 * @param{String} text 提示内容
 * @param{String} pageUrl 提交确定后跳转的页面
 */
const dialogCom = (text, pageUrl) => {
  wx.showModal({
    title: '提示',
    content: text,
    showCancel: !1,
    success(res) {
      if (res.confirm) {
        // console.log('用户点击确定')
        wx.reLaunch({
          url: pageUrl
        })
      }
    }
  })
}

/**
 * 获取用户状态
 * (ture:黑名单，false:白名单)
 * @param{String} articleId 文章id
 */
// const getUserStatus = async (articleId) => {
//   let useVipFunction = baseConfig.useVipFunction
//   if (!useVipFunction) {
//     return false
//   }
//   console.warn('检验vip体验的文章id', articleId, articleId < 100000000)
//   let status = await wx.store.get('userStatus');
//   if (articleId) {
//     return !status && articleId < 100000000
//   } else {
//     return !status
//   }
// }


/**
 * 处理数据，把data对应的title加上对应的问候语
 * @param{Array或Object} data 要处理的数据
 * @param{string} key data对应要更换title的字段
 * @param{string} titlePrefixType 类型
 */
const addGreetings = (data, key = 'title') => {
  if (Array.isArray(data)) { //数组
    data.map(item => {
      item.title_prefix_type && (item[key] = getGreetings(item.title_prefix_type) + item[key])
    })
  } else { //对象
    data.title_prefix_type && (data[key] = getGreetings(data.title_prefix_type) + data[key])
  }
  return data
}

/**
 * 获取对应类型的问候语
 * @param{String} titlePrefixType 类型(0:无 1:问候关键字 2:星期关键字 3:日期关键字)
 */
const getGreetings = (titlePrefixType) => {
  switch (titlePrefixType) {
    case '0':
      return ''
    case '1':
      return getGreetingsKeyword()
    case '2':
      return getWeekKeyword()
    case '3':
      return getDateKeyword()
    default:
      return ''
      break;
  }
}

const getGreetingsKeyword = () => {
  const hour = new Date().getHours()
  let str = ''
  if (hour >= 0 && hour < 8) {
    str = '早上'
  } else if (hour >= 8 && hour < 12) {
    str = '上午'
  } else if (hour >= 12 && hour < 14) {
    str = '中午'
  } else if (hour >= 14 && hour < 18) {
    str = '下午'
  } else if (hour >= 18 && hour <= 23) {
    str = '晚上'
  }
  return `${str}好，`
}

const getWeekKeyword = () => {
  const week = new Date().getDay()
  // console.log('week', week, typeof (week))
  let str = ''
  switch (week) {
    case 0:
      str = '日'
      break;
    case 1:
      str = '一'
      break;
    case 2:
      str = '二'
      break;
    case 3:
      str = '三'
      break;
    case 4:
      str = '四'
      break;
    case 5:
      str = '五'
      break;
    case 6:
      str = '六'
      break;
    default:
      break;
  }
  return `周${str}快乐`
}


const getDateKeyword = () => {
  const month = new Date().getMonth() + 1
  const date = new Date().getDate()
  return `今天是${month}月${date}号，`
}

/**
 * 解决路由跳转超过10层无法跳转的情况
 * (对外暴露的方法)
 * @param{Object} object
 * object包括
 * url(路径)，
 * articleType(文章类型 [非必填])，
 * success(成功的回调函数)，
 * fail(失败的回调函数)
 */
// function xhwNavigateTo({
//   url,
//   articleType,
//   success,
//   fail
// }) {
//   // console.log(url, articleType, success, fail);
//   let standardLen = 9 //标准层级
//   if (articleType && articleType == 4) { //祝福类型
//     standardLen = 3
//   }
//   let pageList = getCurrentPages()
//   let pageLen = pageList.length;
//   // console.log('pageLen', pageLen, standardLen);
//   if (pageLen > standardLen) {
//     wx.redirectTo({
//       url,
//       success,
//       fail
//     });
//   } else {
//     wx.navigateTo({
//       url,
//       success,
//       fail
//     });
//   }
// }


/**
 * 页面跳转方法
 * @param{Number} level 页面层级 (大于则采用redirectTo)
 * @param{String} url 页面url
 * @param{Function} success 成功的回调函数
 * @param{Function} fail 失败的回调函数
 * @param{Function} preGet 数据预加载函数 (返回数据对象 或 Promise)
 * @returns {Promise<void>}
 */
async function xhwNavigateTo({level = 9, url, success, fail, preGet}) {
  if (!url) {
    throw new Error(`xhwNavigateTo 需要一个正确的url`);
  }
  let pageList = getCurrentPages();
  let pageLen = pageList.length;
  if (pageLen > level) {
    wx.redirectTo({url, success, fail});
  } else {
    wx.navigateTo({url, success, fail});
  }
  if (preGet) {
    if (typeof preGet !== "function") {
      throw new Error(`xhwNavigateTo 传入的preGet必须为一个函数`);
    }
    const event = getApp().event;
    if (!event) {
      throw new SyntaxError(`preLoad插件需要使用app下的event插件,请先注册event插件`);
    }
    // 要事件名和事件一一对应 这里用url前面部分命名
    // "/pages/test/index?aaa=aaa&bbb=bbb" => "pages/test/index"
    let index = url.indexOf("?");
    let length = url.length;
    let eventName = index === -1 ? url.slice(1, length) : url.slice(1, index);
    let PreData = await preGet();
    // console.log("PreDataPreData", PreData);
    global["preData"] = PreData;
    event.trigger(eventName, PreData);
  } else {
    global["preData"] = null;
  }
}

/**
 *
 * 获取页面路径参数中的article_id
 * (对外暴露的方法)
 * @param{Number} num 索引 (不传或0代表当前页 1代表上一页 如此类推)
 * (如果访问到不存在的页面，返回默认值0)
 * @return
 */
function getArticleId(num) {
  /* eslint-disable */
  let pageLen = getCurrentPages().length;
  let curPage = null;
  if (!num) {
    curPage = getCurrentPages()[pageLen - 1];
  } else {
    if (typeof num !== 'number') {
      throw new SyntaxError(`非法的getArticleId:  ${num}`);
    }
    curPage = getCurrentPages()[pageLen - 1 - num];
    // console.log(curPage);
  }
  /* eslint-disable */
  if (curPage && curPage.options && curPage.options.article_id) {
    return curPage.options.article_id;
  }
  return 0;
}

/**
 * 收集formId上报
 * (对外暴露的方法)
 * 文档: https://www.showdoc.cc/188110967763072?page_id=1168653462997363
 * @param formId
 */
async function reportFormId(formId) {
  return
  let data = {};
  data.formid = formId;
  data.openid = await wx.store.get('openId');
  data.appid = baseConfig.appId;
  data.timestamp = new Date().getTime();
  data.sign = getFormIdSign(data);
  wx.request({
    url: 'https://pushserver.heywoodsminiprogram.com/api/collection/send',
    data: data,
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      switch (res.code) {
        case '40001':
          console.error('上报formId时参数异常', res);
          break;
        case '40201':
          console.error('上报formId时formId非法', res);
          break;
        case '40000':
          console.log(`上报formId: ${formId} 成功`, res);
      }
    },
    fail: (res) => {
      console.error('上报formId失败 ', rej);
    }
  });
}

/**
 * 检查分享类型
 * @param {String} articleId 文章id
 */
async function checkShareType(articleId) {
  if (!articleId) {
    articleId = 16021;
  }
  let initInfo = await wx.store.get('initInfo');
  let shareInfo = {
    openType: 'share'
  };
  if (initInfo.share_func_type && initInfo.share_func_type == 1) {
    shareInfo.openType = 'contact';
    shareInfo.isShowCard = true;
    shareInfo.title = '获取朋友圈链接';
    shareInfo.img = 'https://res.heywoodsminiprogram.com/clickImages/contactMessageImg.png';
    shareInfo.path = `/pages/index/index?articleId=${articleId}&appid=${baseConfig.appId}`;
  }
  if (initInfo.share_func_type && initInfo.share_func_type == 2) {
    shareInfo.openType = 'navigate';
    shareInfo.appid = initInfo.share_func_appid;
    shareInfo.param = {}
    shareInfo.path = initInfo.share_func_same_article == 1 ? `/pages/index/index?article_id=${articleId}` : '/pages/index/index'; //share_func_same_article 0或1 是否跳至同篇文章
  }
  return shareInfo
}

/**
 * 分享按钮跳转小程序处理
 * @param{String} articleId 文章id
 */
const navigateToMiniProgram = async (articleId) => {
  let shareInfo = await checkShareType(articleId)
  if (shareInfo.openType == 'navigate') {
    wx.navigateToMiniProgram({
      appId: shareInfo.appid,
      path: shareInfo.path,
      extraData: shareInfo.param,
      envVersion: baseConfig.navigatorMpVersion,
      success(res) {
        // 打开成功
      },
      fail(e) {
        console.warn('navigatorFail', e)
        if (e.errMsg && e.errMsg.indexOf('cancel') == -1) { //不是用户主动取消
          let reportData = {
            res: e.errMsg || '',
            appid: shareInfo.appid,
            timeStamp: e.timeStamp || ''
          };
          // console.log('navigatorFail reportData', reportData)
          custom.addReport('navigatetoMiniprogramError', reportData)
        }
      }
    })
  }
}

/**
 * 处理后台api返回的视频高度，做适配
 * @param{String} videoHeight api返回的高度
 * @param{String} className 标题title的类名（为了获取标题区域的高度）
 */
const handleVideoHeight = ({
  width,
  height,
  otherHeight = 0
}) => {
  const res = wx.getSystemInfoSync();
  const bottomControlHeight = 160;
  let videoHeight = (res.windowWidth * Number(height)) / Number(width);
  let result = null;
  otherHeight = otherHeight + bottomControlHeight;
  let h = res.windowHeight - otherHeight;
  result = videoHeight > h ? h : videoHeight;
  return result;
}

/**
 * 时间戳 转化为 年月日 格式
 * @param {} inputTime 
 */
const tsFormatTime = inputTime => {
  var time = parseInt(inputTime) * 1000;
  var date = new Date(time);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var str = y + '年' + m + '月' + d + '日 ';
  return str;
}


/**
 * 获取第三方自定义配置
 *@param{String} data 自定义字段
 */
function getExtConfig(data) {
  let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
  // console.log('getExtConfig', data, extConfig.custom_config)
  if(data){
    return extConfig.custom_config[data]
  } else {
    return extConfig.custom_config
  }
}

 /**
 * 获取 当前的年月日
 */
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 获取 早上、下午、晚上 时间端段
 */
const getCurrentPeriod = () => {
  const date = new Date();
  const hours = date.getHours();
  if (hours >= 0 && hours < 5) {
    return '凌晨';
  } else if (hours >= 5 && hours < 9) {
    return '早上';
  } else if (hours >= 9 && hours < 12) {
    return '上午';
  } else if (hours >= 12 && hours < 14) {
    return '中午';
  } else if (hours >= 14 && hours < 18) {
    return '下午';
  } else {
    return '晚上';
  }
}

/**
 * 获取当前星期
 */
const getCurrentWeek = (time) => {
  const date = time ? new Date(time) : new Date();
  const weekday = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六'
  ];
  const day = date.getDay();
  return weekday[day];
}


/**
 * 创建插屏广告
 */
function createInterstitialAd(type) {
  // console.log('useInterstitialAd', baseConfig.useInterstitialAd)
  if (baseConfig.useInterstitialAd) {
    if (wx.createInterstitialAd) {
      console.log('开始创建广告', type)
      let adUnitId;
      if (type == 1) {
        adUnitId = 'adunit-a86b0a9c05632596'
      } else {
        adUnitId = 'adunit-fc3697e46b1850b2'
      }
      let intersitialAd = wx.createInterstitialAd({
        adUnitId: adUnitId
      });
      intersitialAd.show().catch(err => console.error('adERR', err));
    } else {
      console.warn('不支持wx.createInterstitialAd')
    }
  }
}

/**
 * 随机数
 * @param min  最小范围
 * @param max  最大范围
 * @param num  小数的位数，不填默认整数
 */
function getRandomNumber(min, max, num) {
  let random =  (min + Math.round(Math.random() * (max - min)));
  let randomNumber = num ? random.toFixed(num) : random
  return randomNumber
}

/**
 * 获取当前页面路径
 */
function getNowRoute (){
  let pageList = getCurrentPages()
  return pageList[pageList.length - 1].route;
}

/**
 * 判断两天是否是同一天
 */
function onTheSameDay(date, date2) {
  return new Date(date).toDateString() === new Date(date2).toDateString();
}


exports.compareVersion = compareVersion;
exports.isToday = isToday;
exports.getAdListByName = getAdListByName;
exports.dialogCom = dialogCom;
exports.addGreetings = addGreetings;
exports.xhwNavigateTo = xhwNavigateTo;
exports.getArticleId = getArticleId;
exports.reportFormId = reportFormId;
exports.checkShareType = checkShareType;
exports.navigateToMiniProgram = navigateToMiniProgram;
exports.handleVideoHeight = handleVideoHeight;
exports.tsFormatTime = tsFormatTime;
exports.getExtConfig = getExtConfig;
exports.getCurrentDate = getCurrentDate;
exports.getCurrentPeriod = getCurrentPeriod;
exports.getCurrentWeek = getCurrentWeek;
exports.createInterstitialAd = createInterstitialAd;
exports.getRandomNumber = getRandomNumber;
exports.getNowRoute = getNowRoute;
exports.getRandom = getRandom;
exports.onTheSameDay = onTheSameDay;
exports.isYesterday = isYesterday;
