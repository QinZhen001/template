/* eslint-disable no-new-require,no-new */
const fs = require("fs")
const path = require("path")


const buildTaskControl = require("./taskControl/buildTaskControl")
const LintTaskControl = require("./taskControl/lintTaskControl")
const NpmTaskControl = require("./taskControl/npmTaskControl")
const TransformTaskControl = require("./taskControl/transformTaskControl")
const WatchTaskControl = require("./taskControl/watchTaskControl")


function initTasks() {
  // 转换
  new TransformTaskControl()
  // eslint
  new LintTaskControl()
  // npm相关
  new NpmTaskControl()
  // 构建 (依赖前面的task)
  new buildTaskControl()
  // 监听
  new WatchTaskControl()
}


module.exports = initTasks
