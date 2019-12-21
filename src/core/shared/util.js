// const keyList = Object.keys;
// const hasProp = Object.prototype.hasOwnProperty;


function isFunction(func) {
  return Object.prototype.toString.call(func) === "[object Function]";
}

function isPromise(val) {
  return val && typeof val.then === 'function';
}

// todo store的问题在于 没有正确的判断是否是async函数
// 由于增强编译会把 es6 => es5 所以没办法判断函数是否为async
function isAsyncFunction(fn) {
  return Object.prototype.toString.call(fn) === "[object AsyncFunction]";
}


function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function isObject(obj) {
  return obj != null && typeof obj === "object";
}


function logger(str) {
  return `[xhw] ${str}`;
}


function isPainObject(obj) {
  // 区分数组和对象的情况
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * 非常简答的深拷贝
 * @param obj
 * @returns {*}
 */
function deepCopy(obj) {
  let result = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = deepCopy(obj[key]); //递归复制
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}


function promisify(api) {
  return (options, ...params) => {
    return new Promise((resolve, reject) => {
      api(Object.assign({}, options, {success: resolve, fail: reject}), ...params);
    });
  };
};


/**
 * 防抖
 * @param func
 * @param delay
 */
function debounce(func, delay = 500) {
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
function throttle(func, delay = 500) {
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
function delay(func, delay = 500) {
  return function (...args) {
    setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}


function once(func) {
  return _before(2, func);
}

function _before(n, func) {
  let result;
  return function (...args) {
    if (--n > 0) {
      result = func.apply(this, args);
      debugger;
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

/**
 * string => arrayBuffer
 * @param str
 * @returns {ArrayBuffer}
 */
function str2ab(str) {
  let strLen = str.length;
  let buf = new ArrayBuffer(strLen);
  let bufView = new Uint8Array(buf);
  for (let i = 0; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/**
 * @return {string}
 */
function uint8ArrayToString(arr) {
  let dataString = "";
  for (let i = 0; i < arr.length; i++) {
    dataString += String.fromCharCode(arr[i]);
  }
  return dataString;
}


module.exports = {
  logger,
  isFunction,
  isPromise,
  isArray,
  isPainObject,
  deepCopy,
  isObject,
  promisify,
  debounce,
  throttle,
  delay,
  once,
  str2ab,
  uint8ArrayToString,
  isAsyncFunction,
};
