const { debounce, throttle, delay, once } = require("../shared/util");

/**
 * fn.apply(this, args);
 * 这样才能绑定正确的环境
 */

// ------------------------

/**
 * 标识热更新函数
 */
function Hot(target, key, descriptor) {
  // empty
}

/**
 * mark methods to deprecate. while developer call it, print a warning text to console
 *
 * @param {any} target
 * @param {any} key
 * @param {any} descriptor
 *
 * @return {any}
 */
function Deprecate(target, key, descriptor) {
  let fn = descriptor.value;
  descriptor.value = function(...args) {
    console.warn(
      `DEPRECATE: [${key}] This function will be removed in future versions.`
    );
    fn.apply(this, args);
  };

  return descriptor;
}

/**
 * record timing that function consume.
 *
 * @param {any} name
 * @param {any} rest
 * @return {any}
 */
function Time(name, ...rest) {
  let h = (target, key, descriptor) => {
    let fn = descriptor.value;
    let timer;

    let timeStart;
    let timeEnd;
    if (console.time == null) {
      timeStart = console.time;
      timeEnd = console.timeEnd;
    } else {
      timeStart = () => {
        timer = Date.now();
      };

      timeEnd = name => {
        let abstime = Date.now() - timer;

        console.log(`${name}函数耗时: ${abstime} ms`);
      };
    }

    descriptor.value = function(...args) {
      timeStart(name || key);
      let r = fn.apply(this, args);

      if (r && typeof r.then === "function") {
        return r.then(
          succ => {
            timeEnd(name || key);
            return Promise.resolve(succ);
          },
          fail => {
            timeEnd(name || key);
            return Promise.reject(fail);
          }
        );
      } else {
        timeEnd(name || key);
        return r;
      }
    };

    return descriptor;
  };
  if (typeof name === "string") {
    return h;
  } else {
    let args = [name, ...rest];
    name = void 0;
    h(...args);
  }
}

/**
 * debounce function with delay.
 * @param {number} [delay=100]
 *
 */
function Debounce(delay = 500) {
  return function(target, key, descriptor) {
    let fn = descriptor.value;
    descriptor.value = debounce(fn, delay);
    return descriptor;
  };
}

function Throttle(wait = 500) {
  return function(target, key, descriptor) {
    let fn = descriptor.value;
    descriptor.value = throttle(fn, wait);
    return descriptor;
  };
}

/**
 * 只能调用一次的函数
 * 重复调用返回第一次调用的结果
 */
function Once(target, name, descriptor) {
  let fn = descriptor.value;
  descriptor.value = once(fn);
  return descriptor;
}

/**
 * 延时执行
 * @param wait
 */
function Delay(wait = 500) {
  return function(target, name, descriptor) {
    let fn = descriptor.value;
    descriptor.value = delay(fn, wait);
    return descriptor;
  };
}

/**
 * Lock function util fn finish process
 *
 * @param {any} target
 * @param {any} name
 * @param {any} descriptor
 *
 * @return {any}
 */
function Lock(target, name, descriptor) {
  let fn = descriptor.value;
  let $$LockIsDoing = false;

  let reset = () => ($$LockIsDoing = false);
  descriptor.value = function(...args) {
    if ($$LockIsDoing) return;
    $$LockIsDoing = true;

    let ret = fn.apply(this, args);

    if (ret && ret.then) {
      // is promise
      return ret.then(
        succ => {
          reset();
          return Promise.resolve(succ);
        },
        fail => {
          reset();
          return Promise.reject(fail);
        }
      );
    } else {
      reset();
      return ret;
    }
  };
  return descriptor;
}

export { Hot, Deprecate, Time, Debounce, Throttle, Lock, Delay, Once };

export default { Hot, Deprecate, Time, Debounce, Throttle, Lock, Delay, Once };
