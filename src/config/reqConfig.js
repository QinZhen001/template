/**
 * 矩阵2.0请求配置
 *
 * $commonParams 为每个请求data中的公共参数
 *              dependency 意味着，数据在state中
 *
 *
 * header (非必填，默认{'content-type': 'application/x-www-form-urlencoded'})
 * method (非必填，默认 'POST')
 * model 请求模式  (非必填，默认normal)
 * dependency 请求依赖的全局数据，对应在state中 (会自动去获取数据加到请求参数data中)  (非必填)
 *
 */


const {
  clientVersion,
  identification,
  appId,
  baseUrl,
  prefixAbTestUrl,
  prefixJsonUrl,
  prefixAdUrl,
  abnormalUrl,
  yingjiJsonUrl,
  ecommerceUrl,
} = require('./baseConfig');


const reqConfig = {
  $commonParams: {
    item: identification,
    client_version: clientVersion,
    dependency: { model: 'model' },
  },
  uploadAuth: {
    model: 'normal',
    url: `${baseUrl}/eat/ali_vod/upload_auth`,
    dependency: { openid: 'openId' },
  },
  makeSession: {
    // encrypt: true,
    model: 'wait',
    url: `${baseUrl}/eat/user/login`,
    // url: `${baseUrl}/user/make_session`,
    dependency: {code: 'code'},
  },
  getInitInfo: { //Init
    model: 'wait',
    method: 'GET',
    url: `${abnormalUrl}/${appId}/init.json`,
  },
  getInitInfo2: { //Init内容2.0
    model: 'wait',
    method: 'GET',
    url: `${abnormalUrl}/${appId}/init_v2.json`,
  },
  getNewInitInfo: { //新Init
    model: 'wait',
    method: 'POST',
    url: `${baseUrl}/common/init`,
  },
  getNewInitInfo2: { //新Init内容2.0
    model: 'wait',
    method: 'POST',
    url: `${baseUrl}/v2/common/init`,
  },
  getAbTest: { //AbTest
    model: 'wait',
    url: `${prefixAbTestUrl}/strategy`,
    dependency: { openid: 'openId', version: 'version', appid: 'appId' },
  },
  reportFormId: { //上报FormId
    model: 'queue',
    url: `https://pushserver.heywoodsminiprogram.com/api/collection/send`,
    dependency: { openid: 'openId', appid: 'appId' },
  },
  getAdList: { //获取广告（广告位）
    model: 'wait',
    url: `${prefixAdUrl}/api/ad/get_list`,
    dependency: { openid: 'openId', version: 'version' },
  },
  getAdPoolList: { //获取广告（广告位）
    model: 'wait',
    url: `${prefixAdUrl}/api/ad/get_pool_list`,
    dependency: { openid: 'openId', version: 'version' },
  },
  getGeneralAdList: {
    model: 'wait',
    url: `${prefixAdUrl}/api/v2/ad/get_general_list`,
    dependency: { openid: 'openId', version: 'version' },
  },
  getDefaultAdList: {
    model: 'wait',
    url: `${prefixAdUrl}/api/v2/ad/get_default_list`,
    dependency: { openid: 'openId', version: 'version' },
  },
  getWechatAdList: {
    model: 'wait',
    url: `${prefixAdUrl}/api/v2/ad/get_wechat_list`,
    dependency: { openid: 'openId', version: 'version' },
  },
  fourReportReq: { //第四范式上报
    model: 'normal',
    url: `${baseUrl}/four/report`,
    dependency: { openid: 'openId' },
  },
  getHomePageList: { //首页列表
    model: 'normal',
    url: `${baseUrl}/eat/template/home_page_list`,
    dependency: { openid: 'openId' },
  },
  getDetailsList: { //详情列表
    model: 'normal',
    url: `${baseUrl}/eat/article/get_detail_list`,
    dependency: { openid: 'openId' },
  },
  getDetailsListOld: { //详情列表
    model: 'normal',
    url: `${baseUrl}/template/details_list`,
    dependency: { openid: 'openId' },
  },
  getAuthorInfo: { //作者信息
    model: 'normal',
    url: `${baseUrl}/eat/author/get_info`,
    dependency: { openid: 'openId' },
  },
  getBannerList: { //轮播
    model: 'normal',
    url: `${baseUrl}/eat/template/v2/proto_broadcast_list`,
    dependency: { openid: 'openId' },
  },
  getHolidayDetail: { //节日页详情
    model: 'normal',
    url: `${baseUrl}/eat/feast_act/details`,
    dependency: { openid: 'openId' },
  },
  getAuthorList: { //作者列表
    model: 'normal',
    url: `${baseUrl}/eat/author/get_article_list`,
  },
  getRewardList: { //赞赏列表
    model: 'normal',
    url: `${baseUrl}/eat/reward/getRewardList`,
  },
  toReward: { //赞赏
    model: 'normal',
    url: `${baseUrl}/eat/reward/toReward`,
    dependency: { openid: 'openId' },
  },
  getCommonPool: { //分享弹框（公共推荐池）
    model: 'normal',
    url: `${baseUrl}/eat/article/get_common_pool_list`,
    dependency: { openid: 'openId' },
  },
  getHomePop: { // 首页分享弹框（公共推荐池）
    model: 'normal',
    url: `${baseUrl}/template/home_pop`,
    dependency: { openid: 'openId' },
  },
  adExposureReport: { //广告曝光
    model: 'normal',
    url: `${prefixAdUrl}/api/adstat/expo`,
    dependency: { openid: 'openId' },
  },
  ad2ExposureReport: { //广告曝光
    model: 'normal',
    url: `${prefixAdUrl}/api/v2/adstat/exposure`,
    dependency: { openid: 'openId' },
  },
  adClickReport: { //广告点击上报
    model: 'normal',
    url: `${prefixAdUrl}/api/adstat/report`,
    dependency: { openid: 'openId' },
  },
  ad2ClickReport: { //广告点击上报
    model: 'normal',
    url: `${prefixAdUrl}/api/v2/adstat/click_report`,
    dependency: { openid: 'openId' },
  },
  addNotSeeOrderArticle: { //分享弹框点击上报
    model: 'normal',
    url: `${baseUrl}/eat/template/common_pool/add_not_see_order_article`,
    dependency: { openid: 'openId' },
  },
  getHolidayState: { //节日信息
    model: 'normal',
    url: `${baseUrl}/eat/feast_act/state`,
  },
  getHotword: { //获取搜索热门关键词
    model: 'normal',
    url: `${baseUrl}/eat/es/hot_word`,
  },
  getSearchList: { //获取搜索列表
    model: 'normal',
    url: `${baseUrl}/eat/es/search`,
  },
  getTopicList: { // 获取最新主题列表
    // model: 'normal',
    // url: `${baseUrl}/template/get_topic_list`,
    model: 'normal',
    url: `${baseUrl}/eat/topic/topic_article_list`,
    dependency: { openid: 'openId' },
  },
  getTopicInfoList: { // 获取主题列表id
    model: 'normal',
    url: `${baseUrl}/eat/topic/topic_list`,
  },
  getHotTopicList: { // 根据id获取主题列表数据
    model: 'normal',
    url: `${baseUrl}/eat/topic/hot_topic`,
    dependency: { openid: 'openId' },
  },
  getDetailCarousel: { // 获取详情页视频播放完后下一条内容
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/template/detail_carousel`,
    dependency: { openid: 'openId' },
  },
  getYingjiData: { //Yingji数据
    model: 'normal',
    method: 'GET',
    url: `${yingjiJsonUrl}/yingjiData.json`,
  },
  getYingjiMusicUrl: { //Yingji听歌台数据
    model: 'normal',
    method: 'GET',
    url: `${yingjiJsonUrl}/musicData.json`,
  },
  getYingjiLieqiUrl: { //Yingji猎奇数据
    model: 'normal',
    method: 'GET',
    url: `${yingjiJsonUrl}/lieqiData.json`,
  },
  getYingjiMusicShareUrl: { //Yingji听歌台分享数据
    model: 'normal',
    method: 'GET',
    url: `${yingjiJsonUrl}/shareImageData.json`,
  },
  getYingjiLieqiShareUrl: { //Yingji猎奇分享数据
    model: 'normal',
    method: 'GET',
    url: `${yingjiJsonUrl}/lieqishareImageData.json`,
  },
  getDistributeInfo: { //获取流量分发配置
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/distribute/info`,
    dependency: { version: 'version', appid: 'appId' },
  },
  distributeReport: { //流量分发上报
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/distribute/report`,
    dependency: { version: 'version' },
  },
  toWebPay: { //web支付
    model: 'normal',
    url: `${ecommerceUrl}/api/pay/mini_pay`,
    dependency: { openid: 'openId' },
  },
  getInitList: { //获取初始化用的 A B 新
    model: "normal",
    url: `${baseUrl}/v2/template/init_pool`,
  },
  getPoolList: { //获取指定数量的 A B 新
    model: "normal",
    url: `${baseUrl}/v2/template/get_pool_list`,
  },
  ecommerceMakeSession: {
    model: 'normal',
    url: `${baseUrl}/ecommerce/user/make_session`
  },
  getGoodsDetail: { // 商品详情
    model: 'normal',
    url: `${baseUrl}/ecommerce/goods/info`
  },
  getRecommGoodsList: { // 推荐商品列表
    model: 'normal',
    url: `${baseUrl}/ecommerce/goods/recomm_list`
  },
  sendOrder: { // 订单提交
    model: 'normal',
    url: `${baseUrl}/ecommerce/order/create`
  },
  getLastShipInfo: {
    model: 'normal',
    url: `${baseUrl}/ecommerce/user/last_ship_info`
  },
  getPreviewHomePageList: { //预览首页列表（运营专用）
    model: 'normal',
    url: `${baseUrl}/template/get_all_articles`,
  },
  getAarticleEditInfo: { //文章创建修改发布信息（运营专用）
    model: 'normal',
    url: `${baseUrl}/template/get_article_created_updated_published_detail`,
  },
  getAllCreatorsList: { //获取创建者（运营专用）
    model: 'normal',
    url: `${baseUrl}/template/get_all_creators`,
  },
  rewardSetSession: { // 赞赏换取session_key
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/reward/set_session_key`,
  },
  rewardSetUserInfo: { // 赞赏换取用户信息
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/reward/set_user_info`,
    dependency: { openid: 'openId' },
  },
  rewardTotalAmount: { // 赞赏获取总额
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/reward/get_before_rank_amount`,
    dependency: { openid: 'openId' },
  },
  rewardPersonRank: { // 赞赏获取排名
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/reward/get_person_rank`,
    dependency: { openid: 'openId' },
  },
  rewardCheckAuth: { // 赞赏是否需要授权
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/reward/check_auth`,
    dependency: { openid: 'openId' },
  },
  rewardRank: { // 赞赏前三排行榜数据
    model: 'normal',
    method: 'POST',
    url: `${baseUrl}/eat/reward/get_third_ranking`,
  }
};


module.exports = reqConfig;
