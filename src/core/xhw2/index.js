class Xhw {

}


function launchPage(instance) {
  let vm = new instance()
  console.log(vm)
  console.log(instance.prototype)
  console.log(instance)
  debugger
  vm.onLoad = instance.prototype.onLoad
  vm.$aaa = function () {
    console.log("aaa", this)
  }
  Page(vm);
}

module.exports = {
  launchPage,
}
