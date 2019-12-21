const app = getApp();
const bucketControl = app.bucketControl;
const util = require('../../util/util');
const custom = require('../../customFunc/index');
const {xhw, xhwApi} = require("../../core/index");
const pageReportPlugin = require('../../plugins/pageReportPlugin');
const themeGlobalData = require('../../common/js/globalData.js');

const config = require('../../config/baseConfig');


xhw.page({
  async onLoad(options) {
    // console.log("onLoad", custom)
    // console.log("onLoad111", custom.xhwRequest)
    custom.xhwRequest("getNewInitInfo").then(res => {
      console.log("resres", res)
    })

    let aaa = custom.xhwRequest
    console.log("aaa111", aaa.request)
    console.log("aaa222", aaa.addInterceptor)

    debugger
  },
  onHide() {
  },
  onReachBottom() {
  },
  onPullDownRefresh() {
  },
  toDetail(e) {
  },
  tabClick(e) {
  },
  test() {
    console.log("test")
  },
  async clickTest() {
    let info = await xhwApi.getSystemInfo()
    console.log("info", info) //...
  },
})


// xhw.pageComponent({
//   data: {
//     index: 0,
//   },
//   methods: {
//     async onLoad(options) {
//       console.log("this onload", this, this.aaa)
//
//     },
//     async onShow() {
//
//     },
//     onHide() {
//
//     },
//     onReachBottom() {
//     },
//     onPullDownRefresh() {
//
//     },
//     toDetail(e) {
//
//     },
//     tabClick(e) {
//
//     },
//   },
//   plugins: [pageReportPlugin],
// })

// class Index {
//   async onLoad(options) {
//     // let distributeInfo = (await custom.xhwKeyRequest('getDistributeInfo')).data;
//     // console.log('distributeInfo111', distributeInfo)
//     console.log("this.onLoad", this)
//     this.$aaa()
//   }
// }
//

// launchPage(Index)


// xhw.pageComponent(Index)

// console.log(component)
//
// debugger
// component.use(pageReportPlugin());


// Component(component.getInfo());


xhw.pageComponent({
  behaviors: [index],
  data: {
    index: 0,
  },
  methods: {
    // onLoad(options) {
      // xxx (删除)
    // },
    onHotLoad(options, cb) {
      // 将原本onLoad的逻辑移进onHotLoad中，删除onLoad中的代码
      // xxx (移动至)

      // 在恰当时机 (如热更新第一次setData) 调用cb，触发onHotShow
      cb()
    },
    onHotShow() {
      // 热更新show生命周期
    },
    async onShow() {
      // 无需改动
    },
  },
});
