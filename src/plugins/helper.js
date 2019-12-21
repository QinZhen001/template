function isPlainObject(obj) {
  // 区分数组和对象的情况
  return Object.prototype.toString.call(obj) === '[object Object]';
}


function repeatArr(arr, num = 1) {
  let resultArr = [];
  if (Array.isArray(arr) && arr.length) {
    while (num) {
      resultArr = resultArr.concat(arr);
      num--;
    }
  }
  return resultArr;
}


function query2Obj(query) {
  if (!query) return {};
  let obj = {};
  let queryVal = decodeURIComponent(query);
  let p = queryVal.split('&');
  for (let i in p) {
    let t = p[i].split('=');
    obj[t[0]] = t[1];
  }
  return obj;
}


module.exports = {
  isPlainObject,
  repeatArr,
  query2Obj,
};
