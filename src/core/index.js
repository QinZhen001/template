/**
 * 框架对外暴露的核心
 *
 * 有一个非常重要的注意点：
 * component的自定义方法只能放进methods里
 * 这个思路贯穿整个框架
 *
 */
import {app} from "./xhw/class/xhw-app";
import {pageComponent} from "./xhw/class/xhw-page-component";
import {page} from "./xhw/class/xhw-page";
import {component} from "./xhw/class/xhw-component";
import {XhwMixin} from "./xhw/class/xhw-mixin";
import {request} from "./xhw/request/index";
import {xhwapi} from "./helper/xhwapi";


export {store} from "./store/index"


export * from "./decorators/index";

export const xhwApi = xhwapi(wx);

export const xhw = {
  // 封装原生对象
  app,
  pageComponent,
  page,
  component,
  mixin: XhwMixin,
  // 底层请求
  request,
};

export default xhw;
