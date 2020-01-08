/* eslint-disable no-extend-native*/


console.log("在这里加入Array函数 size")
Array.prototype.size = function (length) {
  this.length = length
}


export const arrMethods = [
  'concat',
  'copyWithin',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'pop',
  'push',
  'reduce',
  'reduceRight',
  'reverse',
  'shift',
  'slice',
  'some',
  'sort',
  'splice',
  'toLocaleString',
  'toString',
  'unshift',
  'values',
  'size'
]


export const triggerStr = [
  'concat',
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
  'size'
].join(',')
