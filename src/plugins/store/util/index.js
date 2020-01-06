export const logger = (str) => {
  return `[xhw storeX] ${str}`;
}

export const isObject = (obj) => {
  return obj != null && typeof obj === "object";
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


export function isAsyncFunction(fn) {
  return Object.prototype.toString.call(fn) === "[object AsyncFunction]";
}

export function isFunction(obj) {
  return Object.prototype.toString.call(obj) == '[object Function]'
}

export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

export function isString(obj) {
  return typeof obj === 'string'
}

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
