import { types } from "../../shared/constants";

function defineReactive(obj, key, customSetter) {
  // console.log("property", property, property.set)
  // debugger
  // console.warn("111 defineReactive")
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }
  let val = obj[key];
  Object.defineProperty(obj, key, {
    set(newVal) {
      // 深比较 新旧值不相等触发setter
      if (deepEqual(newVal, val)) {
        return;
      }
      customSetter(newVal, val);
      val = newVal;
    }
  });
}

/**
 * 判断theHost上下文环境下有没有domain命名空间
 * @param theHost 当前环境
 * @param domain 命名空间
 */
function checkDomain(theHost, domain) {
  if (!theHost[domain]) {
    throw new Error(`${domain} 命名空间不存在`);
  }
  return true;
}

/**
 * 深比较
 */
function deepEqual(a, b) {
  if (a === b) return true;

  if (a && b && typeof a === "object" && typeof b === "object") {
    var arrA = Array.isArray(a);
    var arrB = Array.isArray(b);
    var i;
    var length;
    var key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date;
    var dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp;
    var regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = Object.keys(a);
    length = keys.length;

    if (length !== Object.keys(b).length) {
      return false;
    }

    for (i = length; i-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    }

    for (i = length; i-- !== 0; ) {
      key = keys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }
  // eslint-disable-next-line
  return a !== a && b !== b;
}

// 是否需要添加methods命名空间
function needMethodsDomain(type) {
  return type === types.pageComponent || type === types.component;
}

export { defineReactive, checkDomain, deepEqual, needMethodsDomain };
