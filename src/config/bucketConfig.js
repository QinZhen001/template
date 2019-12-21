/**
 * 缓存桶配置文件
 * action: 自定义函数
 *    success: 成功的回调 (需要传入要放进缓存桶的数组,一般为响应的数据数组,传入的数据尽可能大)
 *    fail：失败的回调 (需传入失败信息)
 * minimum: 桶中数据的最小值(数据小于这个值会自动填充) (非必填)
 * filter: 用做数据去重的过滤器函数，判断是否需要此条数据，需要则return (非必填)
 *    item：当前的数据
 *    array：去重数组
 *
 *  bucketConfig中的key为桶的名字 (建议以名词命名)
 */

const custom = require('../customFunc/index');
const baseConfig = require('../config/baseConfig');
var detailListFailTimes = 0;
var authorListFailTimes = 0;
let detailCarouselListFailTimes = 0;

const bucketConfig = {
  detailList: {
    action: async (success, fail) => {
      // 进行请求的前置处理
      let params = await wx.store.get('detailListParams');
      console.log('getDetailList params', params);
      custom.xhwRequest('getDetailsList', params).then(res => {
        //进行请求后的相关逻辑处理
        console.log('getDetailsList 接口res', res);
        if (res.data.page_depend) {
          wx.store.commit('detailListPageDepend', res.data.page_depend);
        }
        detailListFailTimes = 0;
        success(res.data.dataList);
      }, rej => {
        detailListFailTimes++;
        console.error('获取推荐列表失败1', rej, detailListFailTimes, params);
        if (rej.code == 1 && detailListFailTimes <= 1) {
          custom.xhwRequest('getDetailsList', params).then(res => {
            console.log('getDetailsList2', res);
            if (res.data.page_depend) {
              wx.store.commit('detailListPageDepend', res.data.page_depend);
            }
            detailListFailTimes = 0;
            success(res.data.dataList);
          }, rej => {
            console.error('获取推荐列表失败2', rej);
            fail(rej);
          });
        } else {
          fail(rej);
        }
      });
    },
    minimum: 5,
    filter: (item, curReadMap, globalReadMap) => {
      let id = String(item.article_id);
      let num = globalReadMap.get(id);
      if (!num || num < 1) {
        return item;
      }
    },
  },
  authorList: {
    action: async (success, fail) => {
      // 进行请求的前置处理
      let params = await wx.store.get('authorListParams');
      console.log('getAuthorList params', params);
      custom.xhwRequest('getAuthorList', params).then(res => {
        //进行请求后的相关逻辑处理
        console.log('getAuthorList 接口res', res);
        if (res.data.page_depend) {
          wx.store.commit('authorListPageDepend', res.data.page_depend);
        }
        authorListFailTimes = 0;
        success(res.data.dataList);
      }, rej => {
        authorListFailTimes++;
        console.error('获取作者列表失败1', rej, authorListFailTimes, params);
        if (rej.code == 1 && authorListFailTimes <= 1) {
          custom.xhwRequest('getAuthorList', params).then(res => {
            console.log('getAuthorList2', res);
            if (res.data.page_depend) {
              wx.store.commit('authorListPageDepend', res.data.page_depend);
            }
            authorListFailTimes = 0;
            success(res.data.dataList);
          }, rej => {
            console.error('获取作者列表失败2', rej);
            fail(rej);
          });
        } else {
          fail(rej);
        }
      });
    },
    minimum: 5,
  },
  detailCarouselList: {
    action: async (success, fail) => {
      let params = await wx.store.get('detailCarouselListParams');
      // 进行请求的前置处理
      custom.xhwRequest('getDetailCarousel', params).then(res => {
        //进行请求后的相关逻辑处理
        console.log('detailCarouselList 接口res', res);
        if (res.data.page_depend > 0) {
          wx.store.commit('detailCarouselListPageDepend', res.data.page_depend);
        } else {
          wx.store.set('detailCarouselListPageDepend', null)
        }
        detailCarouselListFailTimes = 0;
        // let dataList = res.data.dataList.filter(element => {
        //   if (element.article_type == 2) {
        //     return element
        //   }
        // });
        // success(dataList);
        success(res.data.dataList);
      }, rej => {
        detailCarouselListFailTimes++;
        console.log('获取详情页视频播放完后下一条内容列表失败1', rej, detailCarouselListFailTimes);
        if (rej.code == 1 && detailCarouselListFailTimes <= 1) {
          custom.xhwRequest('getDetailCarousel', params).then(res => {
            console.log('getDetailCarousel', res);
            if (res.data.page_depend > 0) {
              wx.store.commit('detailCarouselListPageDepend', res.data.page_depend);
            } else {
              wx.store.set('detailCarouselListPageDepend', null)
            }
            detailCarouselListFailTimes = 0;
            success(res.data.dataList);
          }, rej => {
            console.log('获取详情页视频播放完后下一条内容列表失败2', rej);
            fail(rej);
          });
        } else {
          fail(rej);
        }
      });
    },
    minimum: 1,
    filter: (item, curReadMap, globalReadMap) => {
      let id = String(item.article_id);
      let num = globalReadMap.get(id);
      if (!num || num < 1) {
        return item;
      }
    },
  }
};


module.exports = bucketConfig;