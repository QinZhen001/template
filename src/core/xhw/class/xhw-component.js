import {Host} from "./host";
import {types} from "../../shared/constants";
import {logger} from "../../shared/util";

const NATIVE_HOOKS = [
  // 保持第 0 位，为启动钩子
  "created",
  "attached",
  "moved",
  "detached",
  "ready",

  // 自定义生命周期
  "onHotLoad",
  "onHotShow",
];

/**
 * 对热更新组件做一层检查
 * @param option
 */
function checkLifetimes(option) {
  // if (option.attached) {
  //   throw new SyntaxError(`无法在热更新Component中使用attached`)
  // }
  const lifetimes = option.lifetimes;
  if (lifetimes && lifetimes.attached) {
    throw new SyntaxError(logger(`attached应该放在lifetimes外面`));
  }
  const pageLifetimes = option.pageLifetimes;
  if (pageLifetimes && pageLifetimes.show) {
    throw new SyntaxError(
      logger(`无法在热更新Component pageLifetimes中使用show`),
    );
  }
}

class XhwComponent extends Host {
  constructor(option) {
    super({
      type: types.component,
      option,
      nativeHookNames: NATIVE_HOOKS,
      launchHookName: NATIVE_HOOKS[0],
    });
    if (this.$hot) {
      // 此组件是热更新组件 做一次检查
      checkLifetimes(option);
    }
  }
}

function component(option) {
  const component = new XhwComponent(option);
  Component(component);
}

export {XhwComponent, component};
