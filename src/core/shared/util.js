// const keyList = Object.keys;
// const hasProp = Object.prototype.hasOwnProperty;

export function isFunction(func) {
  return Object.prototype.toString.call(func) === "[object Function]";
}

export function isString(str) {
  return Object.prototype.toString.call(str) === "[object String]"
}

export function isPromise(val) {
  return val && typeof val.then === "function";
}

// todo store的问题在于 没有正确的判断是否是async函数
// 由于增强编译会把 es6 => es5 所以没办法判断函数是否为async
export function isAsyncFunction(fn) {
  return Object.prototype.toString.call(fn) === "[object AsyncFunction]";
}

export function isArray(o) {
  return Object.prototype.toString.call(o) === "[object Array]";
}

export function isObject(obj) {
  return obj != null && typeof obj === "object";
}

export function logger(str) {
  return `[xhw] ${str}`;
}

export function isPainObject(obj) {
  // 区分数组和对象的情况
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/**
 * 非常简答的深拷贝
 * @param obj
 * @returns {*}
 */
export function deepCopy(obj) {
  if (!obj) {
    return null
  }
  if (!isObject(obj)) {
    return obj
  }
  let result = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        result[key] = deepCopy(obj[key]); //递归复制
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

export function promisify(api) {
  return (options, ...params) => {
    return new Promise((resolve, reject) => {
      api(
        Object.assign({}, options, {success: resolve, fail: reject}),
        ...params,
      );
    });
  };
}

/**
 * 防抖
 * @param func
 * @param delay
 */
export function debounce(func, delay = 500) {
  let timer;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 节流
 * @param func
 * @param delay
 * @returns {Function}
 */
export function throttle(func, delay = 500) {
  let last = 0;
  return function (...args) {
    let now = +new Date();
    if (now - last > delay) {
      func.apply(this, args);
      last = now;
    }
  };
}

/**
 * 延迟执行
 * @param func
 * @param delay
 * @returns {Function}
 */
export function delay(func, delay = 500) {
  return function (...args) {
    setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export function once(func) {
  return _before(2, func);
}

function _before(n, func) {
  let result;
  return function (...args) {
    if (--n > 0) {
      result = func.apply(this, args);
      // debugger;
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

export function extend(to, from) {
  for (const key in from) {
    to[key] = from[key]
  }
  return to
}

export function isNumber(obj) {
  return typeof obj === 'number' && !isNaN(obj);
}


export const isDate = d => d instanceof Date;
export const isEmpty = o => Object.keys(o).length === 0;
export const properObject = o => isObject(o) && !o.hasOwnProperty ? {...o} : o;






export function nan(value) {
  return typeof value === "number" && isNaN(value)
}

export function isInArray(arr = [], item) {
  if (!item) {
    return false
  }
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === item) {
      return true
    }
  }
  return false
}
