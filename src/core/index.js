/**
 * 框架对外暴露的核心
 *
 * 有一个非常重要的注意点：
 * component的自定义方法只能放进methods里
 * 这个思路贯穿整个框架
 *
 */
const {XhwApp, app} = require('./xhw/class/xhw-app');
const {XhwPageComponent, pageComponent} = require('./xhw/class/xhw-page-component');
const {XhwPage, page} = require('./xhw/class/xhw-page');
const {XhwComponent, component} = require("./xhw/class/xhw-component");
const XhwMixin = require("./xhw/class/xhw-mixin");

const event = require('./plugin/event/event');
const bucketControl = require('./plugin/cache-bucket/bucket-control');
const storeX = require('./plugin/x/storeX');
const storage = require('./plugin/storage/storage');
const preload = require('./plugin/preload/preload');

const request = require("./request/index");

const {xhwapi} = require("./helper/xhwapi");
const xhwApi = xhwapi(wx);

const {methodsDecorators} = require("./decorators/index");


const {launchPage} = require("./xhw2/index")

const xhw = {
  // 封装原生对象
  app,
  pageComponent,
  page,
  component,
  mixin: XhwMixin,
  // 内置插件
  event,
  bucketControl,
  storeX,
  storage,
  preload,
  // 底层请求
  request,
};


module.exports = {
  // 框架核心
  xhw,
  // promise化微信的api
  xhwApi,
  // 装饰器
  ...methodsDecorators,
  launchPage,
};
