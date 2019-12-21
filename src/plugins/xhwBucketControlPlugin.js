const {isPainObject, repeatArr} = require("./helper");
const xhwRequest = require("../customFunc/xhwRequest");
const util = require("../util/util");

const BUCKET_KEY = 'bucket';
const BUCKET_TAG_ID_KEY = "bucketId";
const TAB_ID_KEY = "tabId";
// A桶曝光次数
const EXPOSURE_NUM = 3;

global[BUCKET_KEY] = global[BUCKET_KEY] || {};
const bucketStore = global[BUCKET_KEY];

//内容2.0所有桶数据
let globalBuckets = {
  bucketA: {
    name: 'bucketA',
    isEmpty: false,
    cursor: wx.getStorageSync('cursorBucketA') || ''
  },
  bucketFakeA: {
    name: 'bucketFakeA',
  },
  bucketB: {
    name: 'bucketB',
    isEmpty: false,
    cursor: wx.getStorageSync('cursorBucketB') || ''
  },
  bucketC: {
    name: 'bucketC',
    isEmpty: false,
    cursor: wx.getStorageSync('cursorBucketC') || ''
  },
};

// 默认的比例规则
const DEFAULT_RULES = {
  // 轮播比例
  broadcastRatio: {A: 1, B: 2},
  // 分享比例
  shareRatio: {A: 3, B: 1},
  // 首页前五
  homeTopFiveRatio: {A: 1, B: 4},
  // 底部前五
  bottomTopFiveRatio: {A: 1, B: 4},
  // 底部其他
  bottomOtherRatio: {A: 3, B: 3, new: 4},
  // 其他文章
  tabRatio: {A: 3, B: 4, new: 3},
};

// 是否在初始化
let isInInit = false;
// 任务队列
let taskList = [];

// 桶控制器
let bucketControl = null;

// --------------------------------------------------------

//队列处理
async function runTaskList() {
  let task = null;
  // eslint-disable-next-line
  while (task = taskList.pop()) {
    try {
      let res = await task.task();
      task.resolve(res);
    } catch (e) {
      console.error("任务执行失败: ", e);
      task.reject(e);
    }
  }
}

// 遍历去重（全局）
function globalAddRead(array) {
  for (let i = 0; i < array.length; i++) {
    bucketControl.addRead(array[i].article_id, 1);
  }
}

//清除所有游标及去重数组
function initStorage() {
  let time = wx.getStorageSync('bucketStorageTime');
  let ABCEmpty = (wx.getStorageSync('cursorBucketA') == -1 && wx.getStorageSync('cursorBucketB') == -1 && wx.getStorageSync('cursorBucketC') == -1) || false;
  console.log('initStorage', time, 'ABCEmpty', ABCEmpty)
  console.log('initStorage A B C', wx.getStorageSync('cursorBucketA'), wx.getStorageSync('cursorBucketB'), wx.getStorageSync('cursorBucketC'))
  if (!time || !util.isToday(time) || ABCEmpty) { //新的一天 || 全局ABC为空，清缓存
    console.warn('清缓存cursorBucket', bucketControl)
    //清桶状态和游标
    for (let key in globalBuckets) {
      if (key == 'bucketFakeA') { continue }; //bucketFakeA 与 bucketA 共用一套数据
      globalBuckets[key].isEmpty = false;
      globalBuckets[key].cursor = '';
    }
    //清游标本地缓存
    wx.removeStorageSync('cursorBucketA');
    wx.removeStorageSync('cursorBucketB');
    wx.removeStorageSync('cursorBucketC');
    if (bucketControl) {
      bucketControl.delRead(); //清去重数据
      for (let key in bucketControl.print()) {
        let name = bucketControl.print()[key].name;
        let tabId;
        if (name.indexOf('bucketB_') !== -1 || name.indexOf('bucketC_') !== -1) {
          tabId = name.slice(8);
        }
        if (tabId) {
          wx.removeStorageSync('cursorBucketB_' + tabId);
          wx.removeStorageSync('cursorBucketC_' + tabId);
        }
      }
      wx.setStorageSync('bucketStorageTime', new Date())
    }
  }
}

// 清除A（需判断）、TabB、TabC游标等信息
function removeTabBC (tabId) {
  console.warn('removeTabBC', globalBuckets['bucketA'].cursor)
  if (globalBuckets['bucketA'].cursor == -1) { //判断此时A游标是否-1，清游标
    wx.removeStorageSync('cursorBucketA');
    globalBuckets['bucketA'].isEmpty = false;
    globalBuckets['bucketA'].cursor = '';
  }
  wx.removeStorageSync('cursorBucketB_' + tabId);
  wx.removeStorageSync('cursorBucketC_' + tabId);
  globalBuckets['bucketB_' + tabId] = {name: 'bucketB_' + tabId, cursor: '', isEmpty: false};
  globalBuckets['bucketC_' + tabId] = {name: 'bucketC_' + tabId, cursor: '', isEmpty: false};
  if (bucketControl) {
    bucketControl.delRead()
    wx.setStorageSync('bucketStorageTime', new Date())
  }
}

//获取当前桶数据 （桶名、状态、游标）
function getBucketInfo(buckets) { //buckets:B、C
  if (!globalBuckets['bucket' + buckets + '_' + bucketStore[TAB_ID_KEY]]) {
    throw new Error("不存在桶", 'bucket' + buckets + '_' + bucketStore[TAB_ID_KEY]);
  }
  return globalBuckets['bucket' + buckets + '_' + bucketStore[TAB_ID_KEY]]
}

//两个数组去重拼接
function removalArrayData (arrayA, arrayB) {
  let arrayAll = arrayA;
  let arrayIdAll = [];
  for (let i = 0; i < arrayA.length; i++) {
    arrayIdAll.push(Number(arrayA[i].article_id));
  }
  for (let i = 0; i < arrayB.length; i++) {
    if (arrayIdAll.indexOf(Number(arrayB[i].article_id)) == -1) {
      arrayIdAll.push(arrayB[i].article_id);
      arrayAll.push(arrayB[i]);
    }
  }
  return arrayAll
}

//打乱数组
function arrayShuffle(array) {
  for (let i = 0; i < array.length; i++) {
    const randomIndex = Math.round(Math.random() * (array.length - 1 - i)) + i;
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]]
  }
  return array
};

//列表对象添来源等级和tabId
function addBucketRank({array, rank, tabId = null}) {
  if (Array.isArray(array) && array.length && rank) {
    array.map((item) => {
      item.article_rank = rank;
      item.tab_id = tabId;
      return item
    })
  }
  return array;
}

/**
 * A池缓存桶
 * 这里获取到的数量要 *3
 * @param bucketControl
 */
function initBucketA() {
  bucketControl.add({
    name: globalBuckets.bucketA.name,
    action: function (success, fail) {
      let cursorA = globalBuckets.bucketA.cursor;
      xhwRequest("getPoolList", {a_global_pool: 10, a_global_index: cursorA}).then(res => {
        const data = res.data.a_global_pool;
        cursorA = data.a_global_index; //游标
        globalBuckets.bucketA.cursor = cursorA
        wx.setStorageSync('cursorBucketA', cursorA)
        if (cursorA == -1) {
          globalBuckets.bucketA.isEmpty = true;
        }
        let dataList = addBucketRank({array: data.data_list, rank: 'A'});
        success(repeatArr(dataList, EXPOSURE_NUM));
      }, rej => {
        globalBuckets.bucketA.isEmpty = true;
        fail(rej);
      });
    },
    minimum: 3,
    filter: function (item, curReadMap, globalReadMap) {
      let id = String(item.article_id);
      let num = globalReadMap.get(id);
      if (!num || num < 3) {
        return item;
      }
    },
  });
}

/**
 * 赝品A池缓存桶
 * (不需要曝光三次规则)
 * @param bucketControl
 */
function initBucketFakeA() {
  bucketControl.add({
    name: globalBuckets.bucketFakeA.name,
    action: function (success, fail) {
      let cursorA = globalBuckets.bucketA.cursor;
      xhwRequest("getPoolList", {a_global_pool: 10, a_global_index: cursorA}).then(res => {
        const data = res.data.a_global_pool;
        cursorA = data.a_global_index; //游标
        globalBuckets.bucketA.cursor = cursorA
        wx.setStorageSync('cursorBucketA', cursorA)
        if (cursorA == -1) {
          globalBuckets.bucketA.isEmpty = true;
        }
        let dataList = addBucketRank({array: data.data_list, rank: 'A'});
        success(dataList);
      }, rej => {
        globalBuckets.bucketA.isEmpty = true;
        fail(rej);
      });
    },
    minimum: 3,
    filter: function (item, curReadMap, globalReadMap) {
      return item;
    },
  });
}

/**
 * B池缓存桶 (全局B 不带tabId)
 * @param bucketControl
 */
function initBucketB() {
  bucketControl.add({
    name: globalBuckets.bucketB.name,
    action: function (success, fail) {
      let cursorB = globalBuckets.bucketB.cursor;
      xhwRequest("getPoolList", {b_global_pool: 10, b_global_index: cursorB}).then(res => {
        const data = res.data.b_global_pool;
        cursorB = data.b_global_index;
        globalBuckets.bucketB.cursor = cursorB;
        wx.setStorageSync('cursorBucketB', cursorB)
        if (cursorB == -1) {
          globalBuckets.bucketB.isEmpty = true;
        }
        let dataList = addBucketRank({array: data.data_list, rank: 'B'});
        success(dataList);
      }, rej => {
        fail(rej);
        globalBuckets.bucketB.isEmpty = true;
      });
    },
    minimum: 3,
    filter: function (item, curReadMap, globalReadMap) {
      let id = String(item.article_id);
      let num = globalReadMap.get(id);
      if (!num || num < 1) {
        return item;
      }
    },
  });
}

/**
 * C池缓存桶 (不带tagId)
 * @param bucketControl
 */
function initBucketC() {
  bucketControl.add({
    name: globalBuckets.bucketC.name,
    action: function (success, fail) {
      let cursorC = globalBuckets.bucketC.cursor;
      xhwRequest("getPoolList", {new_global_pool: 10, new_global_index: cursorC}).then(res => {
        const data = res.data.new_global_pool;
        cursorC = data.new_global_index;
        globalBuckets.bucketC.cursor = cursorC;
        wx.setStorageSync('cursorBucketC', cursorC)
        if (cursorC == -1) {
          globalBuckets.bucketC.isEmpty = true;
          initStorage();
        }
        let dataList = addBucketRank({array: data.data_list, rank: 'new'});
        success(dataList);
      }, rej => {
        globalBuckets.bucketC.isEmpty = true;
        fail(rej);
      });
    },
    minimum: 3,
    filter: function (item, curReadMap, globalReadMap) {
      let id = String(item.article_id);
      let num = globalReadMap.get(id);
      if (!num || num < 1) {
        return item;
      }
    },
  });
}

//动态注册tab桶
async function initBucketTab() {
  let initInfo = await wx.store.get('initInfo');
  let tabList = initInfo.tab_list || initInfo.tag_list;
  if (!tabList || tabList.length == 0) {
    console.error("tabList为空");
  }
  for (let key in tabList) {
    let tabId = tabList[key].id;
    if (tabId && tabList[key].type !== 2) {
      let bucketTabB = {
        name: 'bucketB_' + tabId,
        isEmpty: false,
        cursor: wx.getStorageSync('bucketB_' + tabId) || ''
      }
      globalBuckets['bucketB_' + tabId] = bucketTabB;
      bucketControl.add({
        name: 'bucketB_' + tabId,
        action: function (success, fail) {
          let bucketTabId = bucketStore[TAB_ID_KEY];
          let cursorBucketTabB = globalBuckets['bucketB_' + bucketTabId].cursor
          xhwRequest("getPoolList", {
            b_tab_pool: 10,
            b_tab_index: globalBuckets['bucketB_' + bucketTabId].cursor,
            tab_id: bucketTabId,
          }).then(res => {
            const data = res.data.b_tab_pool;
            cursorBucketTabB = data.b_tab_index;
            globalBuckets['bucketB_' + bucketTabId].cursor = cursorBucketTabB;
            wx.setStorageSync('cursorBucketB_' + bucketTabId, cursorBucketTabB)
            if (cursorBucketTabB == -1) {
              globalBuckets['bucketB_' + bucketTabId].isEmpty = true;
              if (globalBuckets['bucketC_' + bucketTabId].cursor == -1) { //tab最后数据空了，清除tabB、tabC的游标
                console.log('tabB\ C数据空了', bucketTabId)
                removeTabBC(bucketTabId)
              }
            }
            let dataList = addBucketRank({array: data.data_list, rank: 'B', tabId: bucketTabId});
            success(dataList);
          }, rej => {
            globalBuckets['bucketB_' + bucketTabId].isEmpty = true;
            fail(rej);
          });
        },
        minimum: 3,
        filter: function (item, curReadMap, globalReadMap) {
          let id = String(item.article_id);
          let num = globalReadMap.get(id);
          if (!num || num < 1) {
            return item;
          }
        },
      });

      let bucketTabC = {
        name: 'bucketC_' + tabId,
        isEmpty: false,
        cursor: wx.getStorageSync('bucketC_' + tabId) || ''
      }
      globalBuckets['bucketC_' + tabId] = bucketTabC;
      bucketControl.add({
        name: 'bucketC_' + tabId,
        action: function (success, fail) {
          let bucketTabId = bucketStore[TAB_ID_KEY];
          let cursorTabC = globalBuckets['bucketC_' + bucketTabId].cursor;
          xhwRequest("getPoolList", {
            new_tab_pool: 10,
            new_tab_index: globalBuckets['bucketC_' + bucketTabId].cursor,
            tab_id: bucketTabId,
          }).then(res => {
            const data = res.data.new_tab_pool;
            cursorTabC = data.new_tab_index;
            globalBuckets['bucketC_' + bucketTabId].cursor = cursorTabC;
            wx.setStorageSync('cursorBucketC_' + bucketTabId, cursorTabC)
            if (cursorTabC == -1) {
              globalBuckets['bucketC_' + bucketTabId].isEmpty = true;
              if (globalBuckets['bucketB_' + bucketTabId].cursor == -1) { //tab最后数据空了，清除tabB、tabC的游标
                console.log('tabC\ b数据空了', bucketTabId)
                removeTabBC(bucketTabId)
              }
            }
            let dataList = addBucketRank({array: data.data_list, rank: 'new', tabId: bucketTabId});
            success(dataList);
          }, rej => {
            globalBuckets['bucketC_' + bucketTabId].isEmpty = true;
            fail(rej);
          });
        },
        minimum: 3,
        filter: function (item, curReadMap, globalReadMap) {
          let id = String(item.article_id);
          let num = globalReadMap.get(id);
          if (!num || num < 1) {
            return item;
          }
        },
      });
    }
  }
}

async function fillDataWithPromiseArr(resArr, promiseArr) {
  const promiseResultArr = await Promise.all(promiseArr);
  promiseResultArr.forEach(item => {
    if (Array.isArray(item) && item.length) {
      resArr = resArr.concat(item);
    }
  });
  return resArr;
}

// --------------------------------------------------------------------

class XhwBucketControl {
  static getInstance(bucketConfig) {
    if (!XhwBucketControl.instance) {
      XhwBucketControl.instance = new XhwBucketControl(bucketConfig);
    }
    return XhwBucketControl.instance;
  }

  constructor(config) {
    this.rules = DEFAULT_RULES;
    isInInit = true;
    wx.nextTick(async () => {
      this.initBuckets();
      await this.initRules();
      await this.initData();
      isInInit = false;
      await runTaskList();
    });
  }

  async initData() {
    // 第一次填充数据
    try {
      let cursorA = globalBuckets.bucketA.cursor;
      let cursorB = globalBuckets.bucketB.cursor;
      const {data} = await xhwRequest("getInitList", {a_global_index: cursorA, b_global_index: cursorB});
      const StrongList = data.data.strong_push_pool.data_list || []; //强推池
      const resA = data.data.a_global_pool;
      const resB = data.data.b_global_pool;
      const bucketADataList = resA.data_list || [];
      let bucketBDataList = resB.data_list || [];
      // 补充(强推池+A桶)的数据要*3
      let bucketADataListAll = removalArrayData(StrongList, bucketADataList)
      bucketADataListAll = addBucketRank({array: bucketADataListAll, rank: 'A'});
      bucketBDataList = addBucketRank({array: bucketBDataList, rank: 'B'});
      console.log("bucketADataListAll", bucketADataListAll)
      bucketControl.choose(globalBuckets.bucketA.name).fill(repeatArr(bucketADataListAll, EXPOSURE_NUM));
      bucketControl.choose(globalBuckets.bucketB.name).fill(bucketBDataList);
      globalBuckets.bucketA.cursor = resA.a_global_index;
      globalBuckets.bucketB.cursor = resB.b_global_index;
      wx.setStorageSync('cursorBucketA', resA.a_global_index)
      wx.setStorageSync('cursorBucketB', resB.b_global_index)
    } catch (e) {
      console.error("getInitList失败 ", e);
    }
  }

  async initRules() {
    try {
      const data = await wx.store.get("initInfo");
      data.broadcast_ratio && (this.rules.broadcastRatio = data.broadcast_ratio);
      data.share_ratio && (this.rules.shareRatio = data.share_ratio);
      data.home_top_five_ratio && (this.rules.homeTopFiveRatio = data.home_top_five_ratio);
      data.bottom_top_five_ratio && (this.rules.bottomTopFiveRatio = data.bottom_top_five_ratio);
      data.bottom_other_ratio && (this.rules.bottomOtherRatio = data.bottom_other_ratio);
      data.tab_ratio && (this.rules.tabRatio = data.tab_ratio);
      // console.log("this.rules", this.rules);
    } catch (e) {
      console.error("getinitInfo 错误", e);
    }
  }

  initBuckets() {
    const app = getApp();
    bucketControl = app.bucketControl;
    if (!bucketControl) {
      throw new Error("xhwBucketControl 依赖 bucketControl,请先注册bucketControl!");
    }
    initStorage();
    initBucketA();
    initBucketFakeA();
    initBucketB();
    initBucketC();
    initBucketTab();
  }

  setTagId(id) {
    console.log('setTagId', id)
    id = parseInt(id);
    bucketStore[TAB_ID_KEY] = id;
  }

  getTagId() {
    return bucketStore[TAB_ID_KEY];
  }

  addRead(id, num = 1) {
    bucketControl && bucketControl.addRead(id, num);
  }

  //获取轮播列表
  async getBannerList() {
    return new Promise(async (resolve, reject) => {
      if (isInInit) {
        taskList.push({
          task: this.getBannerList.bind(this),
          resolve,
          reject,
        });
      } else {
        let rule = this.rules.broadcastRatio;
        let resArr = [];
        let promiseArr = [];
        let bucketA = globalBuckets.bucketA;
        let bucketB = globalBuckets.bucketB;
        try {
          if (bucketA.isEmpty || bucketB.isEmpty) { //A、B任意为空
            resArr = await this.handleSpecialEmptyData(rule);
          } else {
            promiseArr.push(bucketControl.choose(bucketA.name).get(rule.A));
            promiseArr.push(bucketControl.choose(bucketB.name).get(rule.B));
          }
          if (resArr.length == 0) {
            resArr = await fillDataWithPromiseArr(resArr, promiseArr);
          }
          if (resArr.length < (rule.A + rule.B)) { //数据不够，取C
            resArr = await this.handleEmptyDataC(resArr, rule.A + rule.B);
          }
          globalAddRead(resArr)
          resolve(resArr);
        } catch (e) {
          console.error("getBannerList", e);
          reject(e);
        }
      }
    });
  }

  //获取分享弹框列表
  async getShareList() {
    return new Promise(async (resolve, reject) => {
      if (isInInit) {
        taskList.push({
          task: this.getShareList.bind(this),
          resolve,
          reject,
        });
      } else {
        let rule = this.rules.shareRatio;
        let resArr = [];
        let promiseArr = [];
        let bucketA = globalBuckets.bucketA;
        let bucketB = globalBuckets.bucketB;
        try {
          if (bucketA.isEmpty || bucketB.isEmpty) { //A、B任意为空
            resArr = await this.handleSpecialEmptyData(rule);
          } else {
            promiseArr.push(bucketControl.choose(bucketA.name).get(rule.A));
            promiseArr.push(bucketControl.choose(bucketB.name).get(rule.B));
          }
          if (resArr.length == 0) {
            resArr = await fillDataWithPromiseArr(resArr, promiseArr);
          }
          if (resArr.length < (rule.A + rule.B)) { //数据不够，取C
            resArr = await this.handleEmptyDataC(resArr, rule.A + rule.B);
          }
          globalAddRead(resArr)
          resolve(resArr);
        } catch (e) {
          console.error("getShareList", e);
          reject(e);
        }
      }
    });
  }

  // 首页前5条
  async getPageListFive() {
    return new Promise(async (resolve, reject) => {
      if (isInInit) {
        taskList.push({
          task: this.getPageListFive.bind(this),
          resolve,
          reject,
        });
      } else {
        let rule = this.rules.homeTopFiveRatio;
        let resArr = [];
        let promiseArr = [];
        let bucketA = globalBuckets.bucketA;
        let bucketB = globalBuckets.bucketB;
        try {
          if (bucketA.isEmpty || bucketB.isEmpty) { //A、B任意为空
            resArr = await this.handleSpecialEmptyData(rule);
          } else {
            promiseArr.push(bucketControl.choose(bucketA.name).get(rule.A));
            promiseArr.push(bucketControl.choose(bucketB.name).get(rule.B));
          }
          if (resArr.length == 0) {
            resArr = await fillDataWithPromiseArr(resArr, promiseArr);
          }
          if (resArr.length < (rule.A + rule.B)) { //数据不够，取C
            resArr = await this.handleEmptyDataC(resArr, rule.A + rule.B);
          }
          globalAddRead(resArr)
          resolve(resArr);
        } catch (e) {
          console.error("getPageListFive", e);
          reject(e);
        }
      }
    });
  }

  // 详情页底部推荐前5条
  async getDetailListFive() {
    return new Promise(async (resolve, reject) => {
      if (isInInit) {
        taskList.push({
          task: this.getDetailListFive.bind(this),
          resolve,
          reject,
        });
      } else {
        let rule = this.rules.bottomTopFiveRatio;
        let resArr = [];
        let promiseArr = [];
        let bucketA = globalBuckets.bucketA;
        let bucketB = globalBuckets.bucketB;
        try {
          if (bucketA.isEmpty || bucketB.isEmpty) { //A、B任意为空
            resArr = await this.handleSpecialEmptyData(rule);
          } else {
            promiseArr.push(bucketControl.choose(bucketA.name).get(rule.A));
            promiseArr.push(bucketControl.choose(bucketB.name).get(rule.B));
          }
          if (resArr.length == 0) {
            resArr = await fillDataWithPromiseArr(resArr, promiseArr);
          }
          if (resArr.length < (rule.A + rule.B)) { //数据不够，取C
            resArr = await this.handleEmptyDataC(resArr, rule.A + rule.B);
          }
          globalAddRead(resArr)
          resolve(resArr);
        } catch (e) {
          console.error("getDetailListFive", e);
          reject(e);
        }
      }
    });
  }

  // 首页其他文章 （有tabId）
  async getHomePageMaterialList() {
    return new Promise(async (resolve, reject) => {
      if (!this.getTagId()) {
        throw new Error("xhwBucketControl请先设置tagId");
      }
      let rule = this.rules.tabRatio;
      let resArr = [];
      let promiseArr = [];
      let bucketA = globalBuckets.bucketA;
      let bucketB = getBucketInfo('B');
      let bucketC = getBucketInfo('C');
      try {
        if (bucketA.isEmpty || bucketB.isEmpty || bucketC.isEmpty) { //A、B、C任意为空
          resArr = await this.handleNormalEmptyData(rule, true);
        } else {
          promiseArr.push(bucketControl.choose(globalBuckets.bucketFakeA.name).get(rule.A));
          promiseArr.push(bucketControl.choose(bucketB.name).get(rule.B));
          promiseArr.push(bucketControl.choose(bucketC.name).get(rule.new));
        }
        if (resArr.length == 0) {
          resArr = await fillDataWithPromiseArr(resArr, promiseArr);
        }
        if (resArr.length < (rule.A + rule.B + rule.new)) { //数据不够，取C
          resArr = await this.handleEmptyDataC(resArr, rule.A + rule.B + rule.new, true);
        }
        globalAddRead(resArr)
        console.log('正常顺序', resArr)
        let resArrShuffle = arrayShuffle(JSON.parse(JSON.stringify(resArr)));
        resolve(resArrShuffle);
      } catch (e) {
        console.error("getHomePageMaterialList", e);
        reject(e);
      }
    });
  }

  // 详情页其他文章 (没有tabId)
  getDetailPageMaterialList() {
    return new Promise(async (resolve, reject) => {
      let rule = this.rules.bottomOtherRatio;
      let resArr = [];
      let promiseArr = [];
      let bucketA = globalBuckets.bucketA;
      let bucketB = globalBuckets.bucketB;
      let bucketC = globalBuckets.bucketC;
      try {
        if (bucketA.isEmpty || bucketB.isEmpty || bucketC.isEmpty) { //A、B、C任意为空
          resArr = await this.handleNormalEmptyData(rule);
        } else {
          promiseArr.push(bucketControl.choose(globalBuckets.bucketFakeA.name).get(rule.A));
          promiseArr.push(bucketControl.choose(bucketB.name).get(rule.B));
          promiseArr.push(bucketControl.choose(bucketC.name).get(rule.new));
        }
        if (resArr.length == 0) {
          resArr = await fillDataWithPromiseArr(resArr, promiseArr);
        }
        if (resArr.length < (rule.A + rule.B + rule.new)) { //数据不够，取C
          resArr = await this.handleEmptyDataC(resArr, rule.A + rule.B + rule.new);
        }
        globalAddRead(resArr)
        console.log('正常顺序', resArr)
        let resArrShuffle = arrayShuffle(JSON.parse(JSON.stringify(resArr)));
        resolve(resArrShuffle);
      } catch (e) {
        console.error("getDetailPageMaterialList", e);
        reject(e);
      }
    });
  }

  /**
  * 普通位置数据空缺处理（规则存在A、B、新, 新素材保底）
  * @param rule 规则
  * @param needTab 是否需要tagId
  */
  async handleNormalEmptyData (rule, needTab) {
    let resArr = [];
    let num = rule.A + rule.B + rule.new; //应该取的长度
    let resArrA = []; let resArrB = []; let resArrC = []; //单独桶取到的数据;
    let bucketA = globalBuckets.bucketA;
    let bucketFakeA = globalBuckets.bucketFakeA;
    let bucketB = needTab ? getBucketInfo('B') : globalBuckets.bucketB;
    let bucketC = needTab ? getBucketInfo('C') : globalBuckets.bucketC;
    console.log('handleNormalEmptyData', bucketA.isEmpty, bucketB.isEmpty, bucketC.isEmpty)
    if (bucketA.isEmpty) { //A数据为空
      resArrA = await bucketControl.choose(bucketFakeA.name).processGet(rule.A);
    } else {
      resArrA = await bucketControl.choose(bucketFakeA.name).get(rule.A);
    }
    let numB = rule.A - resArrA.length + rule.B;
    if (bucketB.isEmpty) { //B数据为空
      resArrB = await bucketControl.choose(bucketB.name).processGet(numB);
    } else {
      resArrB = await bucketControl.choose(bucketB.name).get(numB);
    }
    let numC = num - (resArrB.length + resArrA.length);
    if (bucketC.isEmpty) { //C数据为空
      resArrC = await bucketControl.choose(bucketC.name).processGet(numC);
    } else {
      resArrC = await bucketControl.choose(bucketC.name).get(numC);
    }
    resArr = resArrA.concat(resArrB, resArrC)
    if (resArr.length < num) {
      console.log('handleNormalEmptyData  都没有数据了', resArrC)
    }
    // console.log('resArr/', resArr)
    return resArr
  }

  /**
  * 特殊位置数据空缺处理（针对A、B缓存桶任意为空，规则只存在A、B, 新素材保底）
  * @param rule 规则
  */
  async handleSpecialEmptyData(rule) {
    let resArr = [];
    let num = rule.A + rule.B; //应该取的长度
    let resArrA = []; let resArrB = []; let resArrC = []; //单独桶取到的数据
    let bucketA = globalBuckets.bucketA;
    let bucketB = globalBuckets.bucketB;
    console.log('handleSpecialEmptyData', bucketA, bucketB, rule.A, rule.B)
    if (bucketA.isEmpty) { //A数据为空
      resArrA = await bucketControl.choose(bucketA.name).processGet(rule.A);
    } else {
      resArrA = await bucketControl.choose(bucketA.name).get(rule.A);
    }
    num = resArrA.length == 0 ? num : num - resArrA.length;
    if (bucketB.isEmpty) { //B数据为空
      resArrB = await bucketControl.choose(bucketB.name).processGet(num);
    } else {
      resArrB = await bucketControl.choose(bucketB.name).get(num);
    }
    num -= resArrB.length;
    if (num > 0) { //取新素材
      resArrC = await bucketControl.choose(globalBuckets.bucketC.name).get(num);
    }
    resArr = resArrA.concat(resArrB, resArrC);
    // console.log('resArr/', resArr)
    return resArr
  }

  /**
  * 数据空缺处理C（针对A、B或者A、B、C缓存桶还有数据但是不够的情况， 新素材保底）
  * @param resArr 原本列表
  * @param ratioNum 规则条数
  * @param needTab 有tabId（只有首页其他文章）
  */
  async handleEmptyDataC(resArr, ratioNum, needTab) {
    let bucketC = needTab ? getBucketInfo('C') : globalBuckets.bucketC;
    console.log('handleEmptyDataC', resArr, ratioNum, bucketC, globalBuckets)
    let resArrC = await bucketControl.choose(bucketC.name).get(ratioNum - resArr.length);
    resArr = resArr.concat(resArrC);
    return resArr
  }
}


function xhwBucketControlPlugin(config) {
  const xhwBucketControl = XhwBucketControl.getInstance(config);
  return {
    name: 'xhwBucketControl',
    customMethod: {
      setTagId: xhwBucketControl.setTagId.bind(xhwBucketControl),
      getTagId: xhwBucketControl.getTagId.bind(xhwBucketControl),
      getBannerList: xhwBucketControl.getBannerList.bind(xhwBucketControl),
      getPageListFive: xhwBucketControl.getPageListFive.bind(xhwBucketControl),
      getDetailListFive: xhwBucketControl.getDetailListFive.bind(xhwBucketControl),
      getHomePageMaterialList: xhwBucketControl.getHomePageMaterialList.bind(xhwBucketControl),
      getDetailPageMaterialList: xhwBucketControl.getDetailPageMaterialList.bind(xhwBucketControl),
      getShareList: xhwBucketControl.getShareList.bind(xhwBucketControl),
      addRead: xhwBucketControl.addRead.bind(xhwBucketControl),
    }
  };
};


module.exports = xhwBucketControlPlugin;