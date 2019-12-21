const path = require('path')

const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const isDev = process.argv.indexOf('--development') >= 0
const isWatch = process.argv.indexOf('--watch') >= 0


const srcPath = path.resolve(__dirname, '../../src')
const distPath = path.resolve(__dirname, '../../dist')
const packagePath = path.resolve(__dirname, '../../package.json')


module.exports = {
  isDev,
  isWatch,
  packagePath,
  srcPath, // 源目录
  distPath,// 目标目录
  wxmlFiles: [`${srcPath}/**/*.wxml`],
  lessFiles: [
    `${srcPath}/**/*.less`,
    `!${srcPath}/**/styles/**/*.less`,
    `!${srcPath}/**/_template/*.less`
  ],
  jsonFiles: [`${srcPath}/**/*.json`, `!${srcPath}/**/_template/*.json`, `!${srcPath}/node_modules/**/*.json`],
  jsFiles: [`${srcPath}/**/*.js`, `!${srcPath}/node_modules/**/*.js`],
  imgFiles: [
    `${srcPath}/icons/*.{png,jpg,gif,ico}`,
    `${srcPath}/icons/**/*.{png,jpg,gif,ico}`
  ],
  // allFiles: [`${srcPath}/**/*`,`${srcPath}/**/*.*`],  //所有文件夹 和 所有文件
}
