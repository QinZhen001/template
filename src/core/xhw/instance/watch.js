const {logger} = require("../../shared/util")
const {defineReactive} = require("../util/index")


function _initWatch({theHost}) {
  console.log("444", this, theHost)
  // debugger
  for (let name in this.$watch) {
    if (this.option.properties[name]) {
      // debugger
      defineReactive(this.option.properties, name, this.$watch[name].bind(theHost))
    } else if (theHost.data[name]) {
      defineReactive(this.option.data, name, this.$watch[name].bind(theHost))
    } else {
      throw new Error(logger(`${name} 不存在properties data中 无法watch`))
    }
  }
}


function initWatch(vm) {
  // if (vm.nativeHookNames.indexOf("ready") !== -1) {
  //   debugger
  //   vm.pushFun("ready", _initWatch)
  // }
  vm.insertInitFun(_initWatch)
}


module.exports = {
  initWatch,
}
