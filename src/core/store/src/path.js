import {isArray, isString} from "../../shared/util";

export function fixPath(path) {
  let mpPath = ''
  const arr = path.replace('#-', '').split('-')
  arr.forEach((item, index) => {
    if (index) {
      if (isNaN(Number(item))) {
        mpPath += '.' + item
      } else {
        mpPath += '[' + item + ']'
      }
    } else {
      mpPath += item
    }
  })
  console.log("mpPath", mpPath)
  debugger
  return mpPath
}

export function getPath(obj) {
  // obj 是use  (使用的store全局数据)
  if (isArray(obj)) {
    const result = {}
    obj.forEach(item => {
      if (isString(item)) {
        result[item] = true
      } else {
        // todo 默认use中都是字符串
        // todo 以后再处理其他情况
      }
    })
    return result
  }
}

/**
 *
 * @param data 全局仓库的所有data
 * @param paths 当前页面的use
 * @returns {{}}
 */
export function getUsing(data, paths = []) {
  const obj = {}
  paths.forEach((path, index) => {
    if (!isString(path)) {
      // todo默认use中都是字符串
    } else {
      obj[path] = data[path]
    }
  })
  console.log("adasd", obj)
  debugger
  return obj
}

/**
 * 判断是否需要更新
 * @param diffResult  {aaa:'aaa'}
 * @param updatePath  需要更新 例子： {aaa:true,bbb:true}
 */
export function needUpdate(diffResult, updatePath) {
  for (let keyA in diffResult) {
    if (updatePath[keyA]) {
      return true
    }
    for (let keyB in updatePath) {
      if (_includePath(keyA, keyB)) {
        return true
      }
    }
  }
  return false
}

/**
 * 判断pathB是否在pathA里面
 * 例子 pathA: "log[0]"   pathB: "moto"
 * @param pathA
 * @param pathB
 * @returns {boolean}
 */
function _includePath(pathA, pathB) {
  if (pathA.indexOf(pathB) === 0) {
    const next = pathA.substr(pathB.length, 1)
    if (next === '[' || next === '.') {
      return true
    }
  }
  return false
}

