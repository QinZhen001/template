const gulp = require("gulp")

const {install} = require("../util/index")


class NpmTaskControl {
  constructor(id) {
    this.id = id
    this.init()
  }

  init() {
    /**
     * 安装依赖
     */
    gulp.task('install', () => {
      return install();
    });
  }
}


module.exports = NpmTaskControl
