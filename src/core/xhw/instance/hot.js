const {types, EVENT_HOT_READY, DOMAIN_METHODS} = require("../../shared/constants")
const {logger} = require("../../shared/util")

/**
 * 这部分可能要重新设计
 * @private
 */
function _execReserveFuns() {
  console.log("executeReserve", this)
  this.reserve.forEach(item => {
    const func = global.hotUpdate[item.type][item.funcName]
    func.apply(this, item.params)
  })
}

function _hotShow() {
  if (this.reserve && this.reserve.length) {
    _execReserveFuns.call(this)
  }
  if (this.onHotShow) {
    this.onHotShow()
  } else {
    throw new Error(logger(`onHotShow生命周期不存在`))
  }
}


function _hotLoad({theHost}) {
  console.warn("1111", "_hotLoad", theHost)
  const app = getApp()
  const event = app.event
  if (!app.$initHot) {
    // 热更新未初始化好
    event.on(EVENT_HOT_READY, () => {
      // debugger
      app.$initHot = true
      theHost.onHotLoad({}, _hotShow.bind(theHost))
    })
  } else {
    // 热更新初始化好
    theHost.onHotLoad({}, _hotShow.bind(theHost))
  }
}

// ---------------------------

function initHot(vm) {
  // 向初始化函数队列的头部插入
  vm.pushInitFun(_hotLoad)
}


module.exports = {
  initHot,
}
