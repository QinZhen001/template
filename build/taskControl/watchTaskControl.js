const path = require("path")
const gulp = require("gulp")


const {srcPath, distPath} = require("../config/baseConfig")
const {jsFiles, jsonFiles, wxmlFiles, lessFiles, imgFiles} = require("../config/baseConfig")

const _ = require("../util/index")

function del(delPath) {
  let targetPath = path.resolve(distPath, delPath);
  if (/\.less/.test(targetPath)) {
    targetPath = targetPath.replace('.less', '.wxss');
  }
  _.delPath(targetPath);
}


class WatchTaskControl {
  constructor(id) {
    this.id = id
    this.init()
  }

  init() {
    gulp.watch(jsFiles, {cwd: srcPath}, gulp.series('js'))
      .on('unlink', (curPath) => {
        del(curPath)
      });

    gulp.watch(jsonFiles, {cwd: srcPath}, gulp.series('json'))
      .on('change', (path) => {
        if (/package/.test(path)) {
          // 自动安装依赖
          _.install();
        }
      })
      .on('unlink', (curPath) => {
        del(curPath)
      });

    gulp.watch(wxmlFiles, {cwd: srcPath}, gulp.series('wxml'))
      .on('unlink', (curPath) => {
        del(curPath)
      });

    gulp.watch(lessFiles, {cwd: srcPath}, gulp.series('wxss'))
      .on('unlink', (curPath) => {
        del(curPath)
      });

    gulp.watch(imgFiles, {cwd: srcPath}, gulp.series('img'))
      .on('unlink', (curPath) => {
        del(curPath)
      });
  }
}


module.exports = WatchTaskControl
