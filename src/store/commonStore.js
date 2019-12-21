const baseConfig = require('../config/baseConfig');
const {
  getSystemInfo,
  pyWxLogin,
  getOpenIdByRequest,
  getSessionIdByRequest,
  getExpireTimeByRequest,
  getInitInfoByRequest,
  getAbTestByRequest,
  getAdListByRequest,
  getPhoneInfo,
  getAdPoolListByRequest,
  getBannerAdListByRequest,
  getDistributeInfo,
  getGeneralAdListByRequest,
  getDefaultAdListByRequest,
  getWechatAdListByRequest
} = require('./storeUtil');

const state = {
  // openId: wx.getStorageSync('openId'),
  // sessionId: '',
  // model: wx.getStorageSync('model'),
  // code: '',
  // expireTime: '', //session key 到期时间
  // initInfo: '', //初始信息
  // version: '', //版本号
  // closeService: '', //关闭服务的概率
  // resourceSignKey: '', //鉴权的key
  // abTestData: null,
  // defaultAdPoolData: null,
  // bannerAdList: null,
  // adListData: null, //广告数据
  // adPoolListData: null, //广告池数据
  // generalAdList: null, //固定位置广告和广告池数据
  // defaultAdList: null, //缺省广告池数据
  // wechatAdList: null, //微信广告池数据
  // channel: null, // 渠道值
  // scene: null, // 场景值
  // phoneInfo: null, //wx.getStorageSync('phoneInfo')
  // appId: '',
  // videoAdUnitId: '', //激励视频广告id
  // randTopShowTime: '', // 详情页分享推荐弹窗
  // indexRandTopShowTime: '', // 详情页分享首页推荐弹窗 当天判断
  // ShareDetailDialog: false, // 详情页分享首页推荐弹窗 分享判断
  // detailListParams: {}, //推荐列表参数,
  // detailListPageDepend: null, //推荐列表分页
  // authorListParams: {}, //作者列表参数
  // authorListPageDepend: null, //作者列表分页
  // detailCarouselListPageDepend: null, // 详情列表视频播放完下一条数据分页
  // detailCarouselListParams: {}, // 详情列表视频播放完下一条数据分页参数
  // showGuide: null, //显示引导
  // isCloseTopTips: null,
  // videoFullHeight: '',
  // isNotFirstShowIndex: null, //是否非首次显示首页
  // videoAdData: null, //激励视频广告记录
  // distributeInfo: null, //分发配置
  // distributeAppIndex: 0, //分发配置AppList跳转index
  // adIdCacheData: wx.getStorageSync('adIdCacheData') || [],
  // adMaterialIdCacheData: wx.getStorageSync('adMaterialIdCacheData') || [],
  // jiliAdData: null, //激励广告数据
  // zantingAdData: null, // 暂停广告数据
  // zantingAdNum: 0, // 暂停第几个广告数据
  // reportAutoPlay: 0, // 上报视频是否自动播放
  // prevVideoCurrent: '', //
  // statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
  // customBarHeight: '', // 自定义顶部栏高度
};


const getters = {
  openId: async (data, commit) => {
    let openId = wx.getStorageSync('openId');
    if (openId) {
      return openId;
    }
    try {
      openId = await getOpenIdByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('openId', openId);
    return openId;
  },
  expireTime: async (data, commit) => {
    let expireTime = wx.getStorageSync('expireTime');
    if (expireTime) {
      return expireTime;
    }
    try {
      expireTime = await getExpireTimeByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('expireTime', expireTime);
    return expireTime;
  },
  sessionId: async (data, commit) => {
    let sessionId = null;
    try {
      sessionId = await getSessionIdByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('sessionId', sessionId);
    return sessionId;
  },
  model: async (data, commit) => {
    let model = wx.getStorageSync('model');
    if (model) {
      return model;
    }
    try {
      model = (await getSystemInfo()).model;
      // 流程跑到这 证明Storage中没有model 所以存一份
      model && wx.setStorageSync('model', model);
    } catch (e) {
      console.log('catch', e);
    }
    commit('model', model);
    return model;
  },
  code: async (data, commit) => {
    let code = (await pyWxLogin()).code;
    commit('code', code);
    return code;
  },
  initInfo: async (data, commit) => {
    let initInfo = null;
    try {
      initInfo = await getInitInfoByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('initInfo', initInfo);
    return initInfo;
  },
  appId: async (data, commit) => {
    let appId = baseConfig.appId;
    commit('appId', appId);
    return appId;
  },
  version: async (data, commit) => {
    let version = baseConfig.clientVersion;
    commit('version', version);
    return version;
  },
  closeService: (data, commit) => {
    let closeService = wx.getStorageSync('closeService') || '';
    commit('closeService', closeService);
    return closeService;
  },
  abTestData: async (data, commit) => {
    let abTestData = null;
    try {
      abTestData = await getAbTestByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('abTestData', abTestData);
    return abTestData;
  },
  adListData: async (data, commit) => {
    let adListData = null;
    try {
      adListData = await getAdListByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('adListData', adListData);
    return adListData;
  },
  adPoolListData: async (data, commit) => {
    let adPoolListData = null;
    try {
      adPoolListData = await getAdPoolListByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('adPoolListData', adPoolListData);
    return adPoolListData;
  },
  generalAdList: async (data, commit) => {
    let generalAdList = null;
    try {
      generalAdList = await getGeneralAdListByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('generalAdList', generalAdList);
    return generalAdList;
  },
  defaultAdList: async (data, commit) => {
    let defaultAdList = null;
    try {
      defaultAdList = await getDefaultAdListByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('defaultAdList', defaultAdList);
    return defaultAdList;
  },
  wechatAdList: async (data, commit) => {
    let wechatAdList = null;
    try {
      wechatAdList = await getWechatAdListByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('wechatAdList', wechatAdList);
    return wechatAdList;
  },
  bannerAdList: async (data, commit) => {
    let bannerAdList = null;
    try {
      bannerAdList = await getBannerAdListByRequest();
    } catch (e) {
      console.error(e);
    }
    commit('bannerAdList', bannerAdList);
    return bannerAdList;
  },
  channel: (data, commit) => {
    let channel = wx.getStorageSync('channel') || '';
    commit('channel', channel);
    return channel;
  },
  scene: (data, commit) => {
    let scene = wx.getStorageSync('scene') || '';
    commit('scene', scene);
    return scene;
  },
  phoneInfo: async (data, commit) => {
    let phoneInfo = null;
    try {
      phoneInfo = getPhoneInfo();
    } catch (e) {
      console.error(e);
    }
    commit('phoneInfo', phoneInfo);
    return phoneInfo;
  },
  distributeInfo: async (data, commit) => {
    let distributeInfo = null;
    try {
      distributeInfo = await getDistributeInfo();
    } catch (e) {
      console.error(e);
    }
    commit('distributeInfo', distributeInfo);
    return distributeInfo;
  },
  customBarHeight: async (data, commit) => {
    let customBarHeight = wx.getStorageSync('customBarHeight')
    if (customBarHeight) {
      return customBarHeight
    }
    try {
      let custom = wx.getMenuButtonBoundingClientRect(); // 菜单按钮
      let statusBarHeight = wx.getSystemInfoSync()['statusBarHeight']
      customBarHeight = custom.bottom + custom.top - statusBarHeight * 2
      customBarHeight && wx.setStorageSync('customBarHeight', customBarHeight);
      commit("customBarHeight", customBarHeight);
      console.log('customBarHeight', customBarHeight)
      return customBarHeight
    } catch (e) {
      console.error(e);
    }
  }
};


const setters = {
  code: (state, payload) => {
    state.code = payload;
  },
  expireTime: (state, payload) => {
    state.expireTime = payload
  },
  openId: (state, payload) => {
    state.openId = payload;
  },
  sessionId: (state, payload) => {
    state.sessionId = payload;
  },
  model: (state, payload) => {
    state.model = payload;
  },
  initInfo: (state, payload) => {
    state.initInfo = payload;
  },
  version: (state, payload) => {
    state.version = payload;
  },
  appId: (state, payload) => {
    state.appId = payload;
  },
  closeService: (state, payload) => {
    state.closeService = payload;
  },
  resourceSignKey: (state, payload) => {
    state.resourceSignKey = payload;
  },
  abTestData: (state, payload) => {
    state.abTestData = payload;
  },
  adListData: (state, payload) => {
    state.adListData = payload;
  },
  adPoolListData: (state, payload) => {
    state.adPoolListData = payload;
  },
  generalAdList: (state, payload) => {
    state.generalAdList = payload;
  },
  defaultAdList: (state, payload) => {
    state.defaultAdList = payload;
  },
  wechatAdList: (state, payload) => {
    state.wechatAdList = payload;
  },
  defaultAdPoolData: (state, payload) => {
    state.defaultAdPoolData = payload;
  },
  bannerAdList: (state, payload) => {
    state.bannerAdList = payload;
  },
  channel: (state, payload) => {
    state.channel = payload;
  },
  scene: (state, payload) => {
    state.scene = payload;
  },
  phoneInfo: (state, payload) => {
    state.phoneInfo = payload;
  },
  videoAdUnitId: (state, payload) => {
    state.videoAdUnitId = payload;
  },
  randTopShowTime: (state, payload) => {
    state.randTopShowTime = payload;
  },
  indexRandTopShowTime: (state, payload) => {
    state.indexRandTopShowTime = payload;
  },
  ShareDetailDialog: (state, payload) => {
    state.ShareDetailDialog = payload;
  },
  detailListParams: (state, payload) => {
    state.detailListParams = payload;
  },
  detailListPageDepend: (state, payload) => {
    state.detailListPageDepend = payload;
  },
  authorListParams: (state, payload) => {
    state.authorListParams = payload;
  },
  authorListPageDepend: (state, payload) => {
    state.authorListPageDepend = payload;
  },
  detailCarouselListParams: (state, payload) => {
    state.detailCarouselListParams = payload;
  },
  detailCarouselListPageDepend: (state, payload) => {
    state.detailCarouselListPageDepend = payload;
  },
  showGuide: (state, payload) => {
    state.showGuide = payload;
  },
  isCloseTopTips: (state, payload) => {
    state.isCloseTopTips = payload;
  },
  videoFullHeight: (state, payload) => {
    state.videoFullHeight = payload;
  },
  showGuide: (state, payload) => {
    state.showGuide = payload;
  },
  isNotFirstShowIndex: (state, payload) => {
    state.isNotFirstShowIndex = payload;
  },
  videoAdData: (state, payload) => {
    state.videoAdData = payload;
  },
  distributeInfo: (state, payload) => {
    state.distributeInfo = payload;
  },
  distributeAppIndex: (state, payload) => {
    state.distributeAppIndex = payload;
  },
  adIdCacheData: (state, payload) => {
    state.adIdCacheData = payload;
  },
  adMaterialIdCacheData: (state, payload) => {
    state.adMaterialIdCacheData = payload;
  },
  jiliAdData: (state, payload) => {
    state.jiliAdData = payload;
  },
  zantingAdData: (state, payload) => {
    state.zantingAdData = payload;
  },
  zantingAdNum: (state, payload) => {
    state.zantingAdNum = payload;
  },
  reportAutoPlay: (state, payload) => {
    state.reportAutoPlay = payload;
  },
  prevVideoCurrent: (state, payload) => {
    state.prevVideoCurrent = payload;
  },
  customBarHeight: (state, payload) => {
    state.customBarHeight = payload
  }
};


module.exports = {
  state,
  getters,
  setters,
};
