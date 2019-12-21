const bucketConfig = require('./config/bucketConfig');
const store = require('./store/index');
const {xhw} = require('./core/index');
const launchPlugin = require("./plugins/appReportPlugin");
const custom = require("./customFunc/index");
const baseConfig = require('./config/baseConfig');


let xhwBucketControlPlugin = null
if (baseConfig.useContent2) {
  xhwBucketControlPlugin = require("./plugins/xhwBucketControlPlugin");
}


xhw.app({
  onLaunch(option) {
    console.log('原生 onLaunch', option);
    wx.setStorageSync('userComeInTime', new Date());
    wx.onPageNotFound((res) => {
      console.log('wx.onPageNotFound', res);
    })
  },
  onShow() {
  },
  onPageNotFound(res) {
    console.log('onPageNotFound', res);
    if (res) {
      let queryStr = '';
      let query = res.query;
      for (var i in query) {
        queryStr += i + '=' + query[i] + '&';
      }
      if (queryStr) {
        queryStr = '?' + queryStr;
        if (queryStr[queryStr.length - 1] == '&') {
          queryStr = queryStr.substr(0, queryStr.length - 1);
        }
      }
      console.log('queryStr', queryStr);
      if (res.path) {
        let url = '/pages/index/index';
        switch (res.path) {
          case 'pages/index':
            url = '/pages/index/index';
            break;
          case '/pages/index':
            url = '/pages/index/index';
            break;
          case '/pages/detail':
            url = '/pages/detail/detail';
            break;
          case '/pages/holiday':
            url = '/pages/holiday/holiday';
            break;
          case '/pages/author':
            url = '/pages/author/author';
            break;
          case '/pages/reward':
            url = '/pages/reward/reward';
            break;
          case '/pages/webView':
            url = '/pages/webView/webView';
            break;
          default:
            let addReportData = {
              path: res.path,
              query: res.query,
              isEntryPage: res.isEntryPage,
            };
            custom.addReport('pagePathError', addReportData);
            break;
        }
        url += queryStr;
        wx.reLaunch({
          url: url,
        });
      }
    }
  },
  plugins: [
    xhw.event,
    xhw.storeX(store),
    xhw.bucketControl(bucketConfig),
    xhwBucketControlPlugin,
    launchPlugin,
  ],
});


// App(app.getInfo());


// App({
//   onLaunch(option) {
//     console.log('原生 onLaunch', option);
//     wx.setStorageSync('userComeInTime', new Date());
//     wx.onPageNotFound((res) => {
//       console.log('wx.onPageNotFound', res);
//     })
//   },
//   onShow() {
//   },
// })
