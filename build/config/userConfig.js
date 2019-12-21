const path = require('path');

const srcPath = path.resolve(__dirname, '../../src');
const distPath = path.resolve(__dirname, '../../dist');
const packagePath = path.resolve(__dirname, '../../package.json');

const timestamp = new Date().getTime();

const userConfig = {
  srcPath,
  cliPath: "D:\\wechat_devtool\\cli",
  transformList: [
    // "sprite", 
    // "uploadImg",
  ],
  ossConfig: {
    region: 'oss-cn-shenzhen', // bucket所在的区域
    accessKeyId: 'LTAISNM0amKPduAE',  //通过阿里云控制台创建的AccessKey
    accessKeySecret: 'CgNDCiiiI5rBRBGMHKxR2aG1XpjuU0', //通过阿里云控制台创建的AccessSecret
    bucket: 'res-miniprogram', // 桶名
  },
  spriteConfig: {
    delPath: [`${srcPath}/icons`, `${srcPath}/spriteImg`],
    spriteFile: `${srcPath}/common/less/sprite.less`, // 精灵图样式文件
    appLessPath: `${srcPath}/app.less`,
    runSprite: false, // 是否执行精灵图任务
  },
  uploadImgConfig: {
    localPath: `${srcPath}/spriteImg/sprite.png`,   // uploadImg的本地路径
    uploadPath: `/clickImages/common/sprite/sprite${timestamp}.png`,  // uploadImg在桶里的存放路径
    ossPath: `https://res.heywoodsminiprogram.com/clickImages/common/sprite/sprite${timestamp}.png`,  // uploadImg的cdn路径
  }
};


module.exports = userConfig;