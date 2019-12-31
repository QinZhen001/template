export const logger = (str) => {
  return `[xhw bucket] ${str}`;
}

export const isObject = (obj) => {
  return obj != null && typeof obj === "object";
}


export function isFunction(func) {
  return Object.prototype.toString.call(func) === "[object Function]";
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


