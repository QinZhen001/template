const senkv = require('../customFunc/statistics');
const xhwDecryptOptions = require("../customFunc/xhwDecryptOptions");

// 页面进入离开上报
const WATER_REPORT_KEY = 90031;

const nativeHook = {
  onLoad: async function () {
    let pagesList = getCurrentPages();
    let pageLen = pagesList.length;
    let curPage = pagesList[pageLen - 1];
    let options = xhwDecryptOptions(curPage.options);
    let pagePath = curPage.route;
    let reportData = {
      key: WATER_REPORT_KEY,
      page_path: pagePath,
    };
    Object.keys(options).forEach(key => {
      reportData[`option_${key}`] = (options[key]).toString();
    });
    reportData.scene = global.scene || "NULL";
    senkv(reportData);
  },
};


function pageReportPlugin() {
  return {
    name: 'report',
    nativeHook: nativeHook,
  };
};


module.exports = pageReportPlugin;





