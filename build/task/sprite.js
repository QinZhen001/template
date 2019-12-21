const fs = require('fs')
const path = require('path');
const util = require('../utils');
const baseConfig = require('../config/baseConfig');
const userConfig = require('../config/userConfig');

const srcPath = baseConfig.srcPath;
const spriteConfig = userConfig.spriteConfig


const statSync = (filePath) => {
  let resolve, reject;
  let promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  })
  let deferred = {
    resolve,
    reject,
    promise
  }
  fs.stat(filePath, (err, stats) => {
    if (err) {
      deferred.reject(err)
    } else {
      deferred.resolve(stats)
    }
  })
  return deferred.promise
}

const sprite = async () => {
  await getWXmlFile(srcPath)
}


/**
 * get wxml file under src
 */
const getWXmlFile = async (filePath) => {
  util.readDir(filePath).then(files => {
    files.forEach(async (filename) => {    // 遍历读取到的文件列表
      const filedir = path.join(filePath, filename)
      const stat = await statSync(filedir)
      const iconArr = await getSpriteIcon()
      if (stat.isFile() && path.extname(filedir) == '.wxml') {
        getImageTag(filedir, iconArr)
      }
      if (stat.isDirectory()) {
        getWXmlFile(filedir)   // 递归
      }
    })
  })
}

/**
* read the file line by line to find the image tag and deal
*/
const getImageTag = (file, iconArr) => {
  let startReg = RegExp(/<image(.*?)><\/image>/);
  let startReg1 = RegExp(/<image(.*?)\/>/);
  let startReg2 = RegExp(/<image\s(.*?)/);
  let endReg = RegExp(/(.*?)(\/image>|\/>)/);
  let str = ''
  let changeStr = '' // 存储多行标签
  let fileFlag = false
  let addless = false
  util.readLine(file, (line, lineCount, byteCount) => {
    if (!fileFlag) {
      changeStr = ''
    }
    if (line.match(/<!--(\s+?)<image/)) {
      fileFlag = false
      str += line
      str += '\n'
    } else if (startReg.test(line) || startReg1.test(line)) { // 匹配image单行双标签 和 单行单标签
      let strRes = judgeImage(line, iconArr)
      fileFlag = false
      if (strRes[1]) {
        addless = true
      }
      str += strRes[0]
    } else if (startReg2.test(line)) { // 匹配image多行开始标签
      fileFlag = true
      changeStr += line
      changeStr += '\n'
    } else if (fileFlag) {
      changeStr += line
      changeStr += '\n'
      if (endReg.test(line)) { // 匹配image多行结束标签
        fileFlag = false;
        let changeStrStorage = changeStr
        let changeStrRes = judgeImage(changeStrStorage, iconArr)
        if (changeStrRes[1]) {
          addless = true
        }
        str += changeStrRes[0]
        changeStr = ''
      }
    } else {
      str += line
      str += '\n'
    }
  }, end => {
    if (addless) {
      addLess(file)
    }
    util.writeFile(file, str)
  })
}

/**
 * 判断image标签是否需要处理
 * @param {String} line 匹配到的image标签
 */
const judgeImage = (line, iconArr) => {
  let resLine
  let flag = false
  let isAddless = false
  let srcReg = RegExp(/\S+\/(\S+?)\.(gif|jpeg|png|jpg|bmp)/);
  if (line.match(srcReg)) {
    let strArr = line.match(srcReg)
    for (let i = 0; i < iconArr.length; i++) {
      if (iconArr[i] === strArr[1]) {
        flag = true
        isAddless = true
        resLine = dealSpriteImage(line, iconArr[i])
      }
    }
  }
  if (!flag) {
    resLine = line + '\n'
  }
  return [resLine, isAddless]
}

/**
 * get sprite icon array
 */
const getSpriteIcon = () => {
  return new Promise((resolve, reject) => {
    const iconReg = RegExp(/.i-(.*?) {/)
    let iconArr = []
    util.readLine(spriteConfig.spriteFile, (line, lineCount, byteCount) => {
      if (iconReg.test(line)) {
        let str = line.match(iconReg)[1]
        iconArr.push(str)
      }
    }, end => {
      resolve(iconArr)
    })
  })
}

/**
 * 生成格式化后的image标签
 * @param {String} iconName 图标类名
 * @param {String} line image标签（多行和单行）
 */
function dealSpriteImage (line, iconName) {
  let reg = RegExp(/src=["'](.*?)["']/)
  let resStr // 格式化后的标签
  let name = 'i-' + iconName + ' icon ' // 格式化后的标签要添加的类名
  let srcStr = line.match(reg)[0];
  let styleStr0
  if (line.match(/\/>/)) {
    styleStr0 = line.replace(/\/>/, '></view>')
  }
  styleStr0 = line.replace(/image/g, 'view')
  let styleStr = styleStr0.replace(srcStr, '')
  if (line.indexOf("class=") == -1) {
    styleStr = styleStr.replace(/<view/, `<view class="${name}" `)
  }
  let pos = styleStr.indexOf("class=") + 7 // class位置
  let char = styleStr.substr(pos, pos) // 在class="后面添加类名
  resStr = styleStr.replace(char, name + char)
  return resStr
}

/**
 * import sprite.less
 */
function addLess (filedir) {
  let higher = path.resolve(filedir, '..')
  if (higher.indexOf('pages') != -1) {   // 如果页面中有精灵图处理，在app.less引入sprite.less
    judgeLess(1, spriteConfig.appLessPath);
  } else {
    util.readDir(higher).then(files => {
      files.forEach((filename) => {
        // 获取当前文件的绝对路径
        const filepath = path.join(higher, filename)
        if (path.extname(filepath) == '.less') {
          judgeLess(2, filepath)
        }
      })
    })
  }
}

/**
 * 判断是否引入sprite.less
 * @param {String} file 
 */
function judgeLess (type, file) {
  let newContent
  if (type == 1) {
    newContent = '@import "./common/less/sprite.less";\n'
  }
  if (type == 2) {
    newContent = '@import "../../common/less/sprite.less";\n'
  }
  util.readFile(file).then(data => {
    if (data.indexOf('common/less/sprite.less') == -1) {
      newContent += data
      util.writeFile(file, newContent)
    }
  })
}



module.exports = sprite;
