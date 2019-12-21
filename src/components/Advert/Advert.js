// Component({
//   behaviors: [],
//   properties: {
//     adLoc: {
//       type: String,
//       value: '',
//     },
//   },
//   data: {
//     adList: {},
//     type: 0,
//   },
//   lifetimes: {
//     attached: async function () {
//       // 在组件实例进入页面节点树时执行
//       this.getGeneralList()
//       this.updateCache() //判断是否更新缓存
//     },
//     detached: function () {
//       // 在组件实例被从页面节点树移除时执行
//     },
//   },
//   methods: {
//     updateCache() { //24小时后重新去重，清空已曝光的素材id缓存
//       let adIdCacheDataTime = wx.getStorageSync('adIdCacheDataTime')
//       !adIdCacheDataTime && wx.setStorageSync('adIdCacheDataTime', new Date())
//       if (adIdCacheDataTime && !util.isToday(adIdCacheDataTime)) {
//         wx.setStorageSync('adIdCacheDataTime', new Date())
//         wx.setStorageSync('adIdCacheData', [])//清空已曝光的广告id缓存
//         wx.setStorageSync('adMaterialIdCacheData', [])//清空已曝光的素材id缓存
//         wx.removeStorageSync('positionIdCacheData')//清空已曝光的素固定广告位数据id缓存
//         wx.removeStorageSync('generalAdIndex')//清空一般广告索引
//         wx.removeStorageSync('defaultAdIndex')//清空缺省广告索引
//       }
//     },
//     async getGeneralList() { //获取特定广告数据和一般广告池数据
//       generalPoolList = (await wx.store.get('generalAdList')).general_pool
//       let generalAdList = await wx.store.get('generalAdList')
//       console.warn('进入获取特定广告池', generalAdList)
//       let {position} = generalAdList
//       let positionAdItem = position[this.data.adLoc]
//       console.log(this.data.adLoc, 'adLoc')
//       if (positionAdItem) { //特定广告位有数据
//         const index = util.getRandom(positionAdItem.images.length - 1) //随机获取广告的素材(图片和id)
//         positionAdItem.materialId = positionAdItem.images[index].id
//         positionAdItem.src = positionAdItem.images[index].path
//         if (util.getExtConfig('useSyAd2')) {
//           console.warn('已开启实验广告')
//           switch (this.data.adLoc) {
//             case 'index2':
//               positionAdItem.syStyle = 2
//               break;
//             case 'index4':
//               positionAdItem.syStyle = 1
//               break;
//             case 'bottom1':
//               positionAdItem.syStyle = 3
//               break;
//             default:
//               break;
//           }
//           positionAdItem.syLocId = this.data.adLoc
//         }
//         this.setData({
//           adList: positionAdItem,
//         })
//         console.log('渲染的广告数据', this.data.adList)
//       } else { //特定广告位没有数据 进入获取广告池数据
//         let general_pool = null
//         if (global.generalAdList) {
//           general_pool = global.generalAdList
//           console.warn('进入获取global一般广告池', general_pool)
//         } else {
//           generalAdList.general_pool.length && (general_pool = await this.duplicateRemoval(generalAdList.general_pool))//对一般广告池数据进行去重
//           console.warn('进入获取一般广告池', general_pool)
//         }
//         if (general_pool && general_pool.length) { //一般广告池有数据
//           const count = generalAdIndex++ % general_pool.length //对一般广告池索引取模
//           const adItem = general_pool[count]
//           const index = util.getRandom(adItem.images.length - 1)
//           let imagesItem = adItem.images.splice(index, 1)[0]
//           if (generalAdIndex == general_pool.length) { //走完一次循环
//             generalAdIndex = 0 //重置索引为0，即重新开始
//             wx.setStorageSync('generalAdIndex', 0)
//             general_pool = general_pool.filter(item => {
//               return item.images.length != 0 //去除images为空数组的广告
//             })
//           } else {
//             wx.setStorageSync('generalAdIndex', generalAdIndex) //还没有走完
//           }
//           adItem.materialId = imagesItem.id
//           adItem.src = imagesItem.path
//           this.setData({
//             adList: adItem,
//           })
//           global.generalAdList = general_pool //储存广告数据到global，方便下次读取
//         } else { //一般广告池无数据进入获取微信广告数据
//           this.getWechatAdList()
//         }
//       }
//     },
//     async getWechatAdList() { //获取微信广告数据
//       let {wechat_ad} = await wx.store.get('wechatAdList')
//       console.warn('进入获取微信广告池', wechat_ad)
//       if (wechat_ad && wechat_ad.length) { //微信广告有数据
//         const adItem = wechat_ad[wechatAdIndex++ % wechat_ad.length] //对微信广告池的索引进行取模
//         this.setData({
//           adList: adItem,
//         })
//       } else { //没有配置微信广告
//         if (!generalPoolList.length) { //微信广告和广告池后台两个池都无数据
//           console.warn('微信广告和广告池后台两个池都无数据')
//           this.getDefaultAdList()//获取缺省广告数据
//           return
//         }
//         //清除全局变量数据和缓存
//         // wx.store.set('adIdCacheData', [])
//         wx.store.set('adMaterialIdCacheData', [])
//         // wx.setStorageSync('adIdCacheData', [])
//         wx.setStorageSync('adMaterialIdCacheData', [])
//         wx.removeStorageSync('generalAdIndex')//清空一般广告索引
//         wx.removeStorageSync('defaultAdIndex')//清空缺省广告索引
//         //清除global广告数据
//         global.generalAdList = undefined
//         this.getGeneralList() //获取一般广告池
//       }
//
//     },
//     async getDefaultAdList() {
//       let default_pool = null
//       if (global.defaultAdList) {
//         default_pool = global.defaultAdList
//         console.warn('进入获取global缺省广告池', default_pool)
//       } else {
//         defaultPoolList = (await wx.store.get('defaultAdList')).default_pool
//         default_pool = (await wx.store.get('defaultAdList')).default_pool
//         default_pool = await this.duplicateRemoval(default_pool)
//         console.warn('进入获取缺省广告池', default_pool)
//       }
//       if (default_pool && default_pool.length) { //缺省广告池有数据
//         const count = defaultAdIndex++ % default_pool.length //对缺省广告的索引进行取模
//         const adItem = default_pool[count]
//         const index = util.getRandom(adItem.images.length - 1)
//         let imagesItem = adItem.images.splice(index, 1)[0]
//         if (defaultAdIndex == default_pool.length) { //走完一次循环
//           defaultAdIndex = 0 ////重置索引为0，即重新开始
//           wx.setStorageSync('defaultAdIndex', 0)
//           default_pool = default_pool.filter(item => {
//             return item.images.length != 0 //去除images为空数组的广告
//           })
//         } else {
//           wx.setStorageSync('defaultAdIndex', defaultAdIndex) //还没有走完
//         }
//         adItem.materialId = imagesItem.id
//         adItem.src = imagesItem.path
//         this.setData({
//           adList: adItem,
//         })
//         global.defaultAdList = default_pool//储存广告数据到global，方便下次读取
//       } else { //缺省广告池无数据，可能是后台没有配置缺省广告，有可能是去重bug
//         if (!defaultPoolList.length) {
//           console.error('缺省广告池无数据，后台没有配置缺省广告')
//           return
//         }
//         global.defaultAdList = undefined
//         this.getDefaultAdList()
//       }
//     },
//     duplicateRemoval(data) { //统一去重
//       return new Promise(async (resolve, reject) => {
//         let adIdCacheData = await wx.store.get('adIdCacheData')
//         if (!adIdCacheData.length) {
//           adIdCacheData = wx.getStorageSync('adIdCacheData')
//         }
//         let adMaterialIdCacheData = await wx.store.get('adMaterialIdCacheData')
//         if (!adMaterialIdCacheData.length) {
//           adMaterialIdCacheData = wx.getStorageSync('adMaterialIdCacheData')
//         }
//         if (adIdCacheData && adIdCacheData.length) {//去除id重复的数据
//           for (let id of adIdCacheData) {
//             data.forEach((item, index) => {
//               id == item.id && data.splice(index, 1)
//             })
//           }
//         }
//         if (adMaterialIdCacheData && adMaterialIdCacheData.length) { //去除materialId重复的数据
//           for (let materialId of adMaterialIdCacheData) {
//             data.forEach((item, index) => {
//               if (item.ad_pool_type == 4) {//微信广告
//                 materialId == item.id && data.splice(index, 1)
//               } else { //其它广告
//                 item.images.forEach((obj, index) => {
//                   obj.id == materialId && item.images.splice(index, 1)
//                 })
//                 item.images.length == 0 && data.splice(index, 1)//去除images为空数据的数据
//               }
//             })
//           }
//         }
//         console.warn('去重后的广告数据', data)
//         resolve(data)
//       })
//     },
//     navigatorFail(e) {
//       let reportData = {
//         res: e.detail.errMsg || '',
//         appid: e.currentTarget.dataset.item.jump_appid || e.currentTarget.dataset.appid,
//         timeStamp: e.timeStamp || '',
//       };
//       console.warn('navigatorFail', e, reportData)
//       if (e.errMsg && e.errMsg.indexOf('cancel') == -1) { //不是用户主动取消
//         custom.addReport('navigatetoMiniprogramError', reportData)
//       }
//     },
//     toWebView(e) {
//       let {appId} = baseConfig
//       const URL = e.currentTarget.dataset.item.jump_path
//       const {share_text, share_image} = e.currentTarget.dataset.item
//       let url = ''
//       const shareConfig = `&share_text=${share_text || ''}&share_image=${share_image}`
//       if (URL.includes('gid')) {
//         let currentPages = getCurrentPages();
//         url = `/pages/goodsDetail/goodsDetail?${URL}`
//         custom.sendkv({
//           key: 90077,
//           page_type: 1,
//           page_path: currentPages[currentPages.length - 1].route,
//           item_id: URL.slice(4),
//           src_: currentPages[currentPages.length - 1].route,
//           source: 'LoktMA',
//           type: 0,
//         })
//       } else if (URL.includes('shopping.heka2.top')) { //是否是电商广告
//         url = `/pages/webView/webView?weburl=${URL}/${appId}${shareConfig}`
//       } else {
//         url = `/pages/webView/webView?weburl=${URL}${shareConfig}`
//       }
//       util.xhwNavigateTo({
//         url: url,
//       });
//     },
//     adLoad(e) {
//       let item = e.currentTarget.dataset.item;
//       console.log('广告adLoad', e, item)
//       let {id, typeRes, ad_group, materialId, adType, name, item_id, source, jump_path, type, ad_master, ad_pool_type} = item;
//       let data = {
//         key: 90101,
//         advertiser_id: ad_master,
//         ad_pool_type,
//         type,
//         type_res: typeRes ? typeRes : 1,
//         loc_id: this.data.adLoc,
//         ad_id: id,
//         title: name,
//         img: materialId,
//         path: jump_path,
//         ret_: 0,
//       }
//       if (type == 2) {
//         data.item_id = item_id || "null"
//         data.source = source || "null"
//       }
//       id && custom.sendkv(data)
//       console.warn('materialId', materialId, 'id', id)
//       //广告数据曝光
//       id && this.ad2ExposureReport([{
//         ad_group,
//         ad_id: id,
//         material_id: materialId,
//       }])
//       const ID = materialId || id
//       console.warn('ID', ID)
//       ad_pool_type == 1 && ID && this.handleMaterialId({materialId: ID}) //储存已曝光的素材id，只有一般广告池(ad_pool_type==1)才执行handleMaterialId方法，
//     },
//     async handleMaterialId({id, materialId}) {
//       let adIdCacheData = await wx.store.get('adIdCacheData')
//       if (!adIdCacheData.length) {
//         adIdCacheData = wx.getStorageSync('adIdCacheData')
//       }
//       let adMaterialIdCacheData = await wx.store.get('adMaterialIdCacheData')
//       if (!adMaterialIdCacheData.length) {
//         adMaterialIdCacheData = wx.getStorageSync('adMaterialIdCacheData')
//       }
//       if (adIdCacheData && adIdCacheData.length) {
//         id && adIdCacheData.push(id)
//         wx.store.set('adIdCacheData', adIdCacheData)
//         wx.setStorageSync('adIdCacheData', adIdCacheData)
//       } else {
//         id && wx.store.set('adIdCacheData', [id])
//         id && wx.setStorageSync('adIdCacheData', [id])
//       }
//
//       if (adMaterialIdCacheData && adMaterialIdCacheData.length) {
//         materialId && adMaterialIdCacheData.push(materialId)
//         wx.store.set('adMaterialIdCacheData', adMaterialIdCacheData)
//         wx.setStorageSync('adMaterialIdCacheData', adMaterialIdCacheData)
//       } else {
//         materialId && wx.store.set('adMaterialIdCacheData', [materialId])
//         materialId && wx.setStorageSync('adMaterialIdCacheData', [materialId])
//       }
//     },
//     ad2ExposureReport(adData) {
//       let params = {
//         data: JSON.stringify(adData),
//       }
//       custom.xhwRequest('ad2ExposureReport', params).then(function (res) {
//         console.log('ad2ExposureReport', res, adData)
//       })
//     },
//     adLoadErr(e) {
//       let item = e.currentTarget.dataset.item;
//       let {id, type, name} = item;
//       console.error('微信广告加载失败，错误码为：', e.detail.errCode, ',错误的微信广告id为：' + id, e)
//       custom.sendkv({
//         key: 90101,
//         type,
//         loc_id: this.data.adLoc,
//         ad_id: id,
//         title: name,
//         ret_: e.detail.errCode,
//       })
//       this.getDefaultAdList() //微信广告加载失败，用缺省广告替补
//     },
//     async ad2ClickReport(e) {
//       let {item} = e.currentTarget.dataset
//       let {id, ad_group, materialId, type, jump_path, item_id, source, name, jump_appid, ad_master, ad_pool_type} = item
//       console.warn('广告adClick', item)
//       let data = {
//         key: 90102,
//         advertiser_id: ad_master,
//         ad_pool_type,
//         type,
//         loc_id: this.data.adLoc,
//         ad_id: id,
//         title: name,
//         img: materialId,
//         path: jump_path,
//         ret_: 0,
//       }
//       if (type == 1) { //跳转小程序
//         data.goto_appid = jump_appid
//       }
//       if (type == 2) {
//         data.item_id = item_id || "null"
//         data.source = source || "null"
//       }
//       custom.sendkv(data);
//       const params = {
//         ad_group,
//         ad_id: id,
//         material_id: materialId,
//       }
//       if (ad_pool_type == 2) { //固定广告位
//         let positionIdCacheData = wx.getStorageSync('positionIdCacheData')
//         if (positionIdCacheData) {
//           if (!positionIdCacheData.includes(id)) { //去重
//             positionIdCacheData.push(id)
//             wx.setStorageSync('positionIdCacheData', positionIdCacheData)
//             custom.xhwRequest('ad2ClickReport', {data: JSON.stringify([params])})
//           }
//         } else {
//           wx.setStorageSync('positionIdCacheData', [id]) //第一次储存固定广告位的id
//           custom.xhwRequest('ad2ClickReport', {data: JSON.stringify([params])})
//         }
//       } else { //其它广告
//         let adIdCacheData = await wx.store.get('adIdCacheData')
//         if (!adIdCacheData.length) {
//           adIdCacheData = wx.getStorageSync('adIdCacheData')
//         }
//         if (!adIdCacheData.includes(id)) { //去重
//           global.generalAdList = global.generalAdList.filter(item => { //点击广告，立即去除已经点击的广告id数据
//             return item.id != id
//           })
//           this.handleMaterialId({id})//储存广告id
//           //广告数据点击曝光
//           custom.xhwRequest('ad2ClickReport', {data: JSON.stringify([params])})
//         }
//       }
//     },
//   },
// })
