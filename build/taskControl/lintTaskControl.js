const gulp = require("gulp")
const eslint = require('gulp-eslint');

const {jsFiles, srcPath} = require("../config/baseConfig")

class LintTaskControl {
  constructor(id) {
    this.id = id
    this.init()
  }

  init() {
    /**
     *  eslint检查
     */
    gulp.task('lint', () => {
      return gulp.src(jsFiles, {base: srcPath})
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
    });


    gulp.task('fix', () => {
      return gulp.src(jsFiles, {base: srcPath})
        .pipe(eslint({
          fix: true,
        }))
        .pipe(eslint.format())
        .pipe(gulp.dest(jsFiles));
    });
  }
}


module.exports = LintTaskControl
