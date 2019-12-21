const gulp = require('gulp');
const spritesmith = require('gulp.spritesmith'); // 生成精灵图

const task = require("../task/index");
const userConfig = require("../config/userConfig");

const transformList = userConfig.transformList;
const spriteConfig = userConfig.spriteConfig;
const srcPath = userConfig.srcPath;

const runSprite = spriteConfig.runSprite
const ossSpriteFile = userConfig.uploadImgConfig.ossPath

// console.log("transformList", transformList);
// console.log("task", task);

class TransformTaskControl {
  constructor(id) {
    this.id = id;
    this.init();
  }

  init () {
    const id = this.id
    /**
     * 生成精灵图
     */
    gulp.task('sprites', () => {
      var stream = gulp.src('./src/icons/*.{png, jpg}')
        .pipe(spritesmith({
          imgName: 'sprite.png', // 生成的雪碧图的路径
          cssName: '../../src/common/less/sprite.less', // 生成less文件, 方便引用
          imgPath: '../../src/spriteImg/sprite.png', // 手动指定路径, 会直接出现在background属性的值中
          padding: 5, // 小图之间的间距, 防止重叠
          cssFormat: 'css', // less文件内容以css的格式输出
          // 手动指定模板
          cssTemplate: (data) => {
            // data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
            // console.log('cssTemplate', data)
            let arr = [],
              width = data.spritesheet.width / 2,
              height = data.spritesheet.height / 2,
              url = ossSpriteFile;

            arr.push(
              `.icon {
                background-origin: border-box;
                background-image: url('${url}');
                background-repeat: no-repeat;
                background-size: ${width}px ${height}px;
              }
              `);

            data.sprites.forEach(function (sprite) {
              arr.push(
                `.i-${sprite.name} {
                  width: ${sprite.width / 2 + 'px !important'}; 
                  height: ${sprite.height / 2 + 'px !important'};
                  background-position: ${sprite.offset_x / 2 + 'px'} ${sprite.offset_y / 2 + 'px'};
                }
                `);
            });

            return arr.join('');
          },
        }))
        .pipe(gulp.dest(srcPath + '/spriteImg'));
      return stream;
    });

    /**
     * 图片转换
     */
    gulp.task("transform", async (done) => {
      for (let i = 0; i < transformList.length; i++) {
        let curTask = task[transformList[i]];
        if (!curTask) {
          throw new Error(`${transformList[i]} task 任务不存在`);
        }
        await curTask();
      }
      done();
    });

    /**
     * 构建相关任务
     */
    gulp.task(`${id}-transform`, runSprite ? gulp.series('sprites', 'transform') : gulp.series('transform'))
  }
}

module.exports = TransformTaskControl;







