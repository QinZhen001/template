const {isFunction, logger} = require("../../shared/util");
const {needMethodsDomain} = require("../util/index")


function initMixins(vm) {
  for (let mixin of vm.$mixins) {
    dealOneMixin(vm, mixin)
  }
}


// mixin 支持 properties data methods watch 生命周期函数 自定义函数
function dealOneMixin(vm, mixin) {
  // console.log("333", this, vm)
  mixin = mixin.option
  for (let prop in mixin) {
    switch (prop) {
      case "methods":
        const methods = mixin[prop]
        for (let m in methods) {
          vm.pushFun(m, methods[m])
        }
        break
      case "lifetimes":
        throw new Error(logger(`mixins不支持lifetimes`))
      case "pageLifetimes":
        throw new Error(logger(`mixins不支持pageLifetimes`))
      case "mixins":
        break
      default:
        if (isFunction(mixin[prop])) {
          vm.pushFun(prop, mixin[prop])
        } else {
          vm.option[prop] = {...vm.option[prop], ...mixin[prop]}
        }
    }
  }
  const innerMixins = mixin.mixins
  if (innerMixins && innerMixins.length) {
    for (let mixin of innerMixins) {
      dealOneMixin(vm, mixin)
    }
  }
}


module.exports = {
  initMixins,
}
