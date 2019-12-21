/**
 * 将跳转path转为参数对象化
 * @param{String} str 跳转path
 * @returns {{queryObj, url: *}}
 *  /pages/test/index?aaa=aaa&bbb=bbb
 *  =>  queryObj {aaa:"aaa",bbb:"bbb"}
 *  =>  url "/pages/test/index"
 */
function transformPath(str) {
  let obj = {};
  let index = str.indexOf("?");
  if (index !== -1) {
    str.slice(index + 1, str.length).split("&").forEach(item => {
      let tempArr = item.split("=");
      obj[tempArr[0]] = tempArr[1];
    });
    str = str.slice(0, index);
  }
  return {
    queryObj: obj,
    url: str,
  };
}

function isPainObject(obj) {
  // 区分数组和对象的情况
  return Object.prototype.toString.call(obj) === '[object Object]';
}


/**
 * 高性能 string => byte[]
 * @param str
 * @returns {Array}
 */
function stringToBytes(str) {
  let ch;
  let st;
  let re = [];
  for (let i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xFF); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    }
    while (ch);
    re = re.concat(st.reverse());
  }
  return re;
}

function bytesToString(arr) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return str;
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

/**
 * 将form上的属性(包括原型上的)复制到to上
 * @param to 目标对象
 * @param form 来源对象
 */
function extend(to, form) {
  for (let key in form) {
    to[key] = form[key];
  }
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

module.exports = {
  transformPath,
  isPainObject,
  stringToBytes,
  bytesToString,
  str2ab,
  uint8ArrayToString,
  extend,
  deepCopy
};

