const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const less = require('gulp-less');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const gulpInstall = require('gulp-install');
const imagemin = require('gulp-imagemin');
const cssmin = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const eslint = require('gulp-eslint');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const prettyData = require('gulp-pretty-data');

const fs = require('fs');
const path = require('path');
const baseConfig = require('../config/baseConfig');


const _ = require('../utils');

const wxssConfig = baseConfig.wxss || {};
const { srcPath, distPath } = baseConfig;


async function install () {
  const distPath = baseConfig.distPath;
  const distPackageJsonPath = path.join(distPath, 'package.json');
  const packageJson = _.readJson(path.resolve(__dirname, '../../src/package.json'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  // console.log('dependencies', dependencies)
  // write dist package.json
  await _.writeFile(distPackageJsonPath, JSON.stringify({ dependencies, devDependencies }, null, '\t'));
  return gulp.src(distPackageJsonPath)
    .pipe(gulpInstall({ production: true }));
}


class BuildTaskControl {
  constructor(id) {
    this.id = id;
    this.init();
  }

  init () {
    const id = this.id;
    /**
     * 清空目标目录
     */
    gulp.task('clean', () => {
      return gulp.src(distPath, { read: false, allowEmpty: true })
        .pipe(clean({ force: true }));
    });


    /**
     * 安装依赖包
     */
    gulp.task('install', () => {
      return install();
    });


    /**
     * 生成 wxss 文件到目标目录 (less转wxss)
     */
    gulp.task('wxss', () => {
      return gulp.src(baseConfig.lessFiles, { base: srcPath })
        .pipe(changed(distPath))
        .pipe(less())
        // .pipe(autoprefixer([
        //   'iOS >= 8',
        //   'Android >= 4.1'
        // ]))
        // .pipe(gulpif(!baseConfig.isDev, cssmin(
        //   {inline: ['all']}
        // )))
        .pipe(gulpif(!baseConfig.isDev, prettyData(
          {
            type: 'minify',
            extensions: {
              'wxss': 'css',
              'less': 'css',
            },
          },
        )))
        .pipe(rename({ extname: '.wxss' }))
        .pipe(_.logger(wxssConfig.less ? 'generate' : undefined))
        .pipe(gulp.dest(distPath));
    });

    /**
     * 生成 js 文件到目标目录 (转es6)
     */
    gulp.task('js', () => {
      return gulp.src(baseConfig.jsFiles, { base: srcPath })
        .pipe(changed(distPath))
        // .pipe(gulpif(baseConfig.isDev, sourcemaps.init()))
        // .pipe(babel())
        // .pipe(gulpif(baseConfig.isDev, sourcemaps.write('./')))
        // .pipe(gulpif(!baseConfig.isDev, uglify()))
        // .on('error', function (err) {
        //   console.error('js Error!', err)
        // })
        .pipe(_.logger())
        .pipe(gulp.dest(distPath));
    });

    /**
     * 生成 wxml 文件到目标目录
     */
    gulp.task('wxml', () => {
      return gulp.src(baseConfig.wxmlFiles, { base: srcPath })
        .pipe(changed(distPath))
        // .pipe(gulpif(!baseConfig.isDev, htmlmin({
        //   collapseWhitespace: true,
        //   removeComments: true,
        //   keepClosingSlash: true
        // })))
        .pipe(gulpif(!baseConfig.isDev, prettyData(
          {
            type: 'minify',
            extensions: {
              'wxml': 'xml',
            },
          },
        )))
        .pipe(_.logger())
        .pipe(gulp.dest(distPath));
    });

    /**
     * 生成 json 文件到目标目录
     */
    gulp.task('json', () => {
      return gulp.src(baseConfig.jsonFiles, { base: srcPath })
        .pipe(changed(distPath))
        .pipe(gulpif(!baseConfig.isDev, prettyData(
          {
            type: 'minify',
            extensions: {
              'json': 'json',
            },
          },
        )))
        .pipe(_.logger())
        .pipe(gulp.dest(distPath));
    });

    /**
     * 生成 img 文件到目标目录
     */
    gulp.task('img', () => {
      return gulp.src(baseConfig.imgFiles, { base: srcPath })
        .pipe(changed(distPath))
        .pipe(_.logger())
        // .pipe(gulpif(!baseConfig.isDev, imagemin()))
        .pipe(gulp.dest(distPath));
    });


    /**
     *  eslint检查
     */
    gulp.task('lint', () => {
      return gulp.src(baseConfig.jsFiles, { base: srcPath })
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
    });


    gulp.task('fix', () => {
      return gulp.src(baseConfig.jsFiles, { base: srcPath })
        .pipe(eslint({
          fix: true,
        }))
        .pipe(eslint.format())
        .pipe(gulp.dest(baseConfig.jsFiles));
    });


    /**
     * 构建相关任务
     */
    gulp.task(`${id}-watch`, () => {
      gulp.watch(baseConfig.jsFiles, { cwd: srcPath }, gulp.series('js'))
        .on('unlink', (curPath) => {
          let targetPath = path.resolve(distPath, curPath);
          _.delPath(targetPath);
        });

      gulp.watch(baseConfig.jsonFiles, { cwd: srcPath }, gulp.series('json'))
        .on('change', (path) => {
          if (/package/.test(path)) {
            install();
          }
        })
        .on('unlink', (curPath) => {
          let targetPath = path.resolve(distPath, curPath);
          _.delPath(targetPath);
        });

      gulp.watch(baseConfig.wxmlFiles, { cwd: srcPath }, gulp.series('wxml'))
        .on('unlink', (curPath) => {
          let targetPath = path.resolve(distPath, curPath);
          _.delPath(targetPath);
        });

      gulp.watch(baseConfig.lessFiles, { cwd: srcPath }, gulp.series('wxss'))
        .on('unlink', (curPath) => {
          let targetPath = path.resolve(distPath, curPath);
          if (/\.less/.test(targetPath)) {
            targetPath = targetPath.replace('.less', '.wxss');
          }
          _.delPath(targetPath);
        });

      gulp.watch(baseConfig.imgFiles, { cwd: srcPath }, gulp.series('img'))
        .on('unlink', (curPath) => {
          let targetPath = path.resolve(distPath, curPath);
          _.delPath(targetPath);
        });

      // gulp.watch(baseConfig.packagePath, {cwd: srcPath}, gulp.series('install'))
      //   .on('unlink', (curPath) => {
      //     let targetPath = path.resolve(distPath, curPath)
      //     _.delPath(targetPath)
      //   })


      // gulp.watch(baseConfig.allFiles, {cwd: srcPath, events: ['add', 'change', 'unlink', 'unlinkDir']})
      //   .on('unlink', (curPath) => {
      //     let destPath = path.resolve(distPath, curPath)
      //     if (/\.less/.test(destPath)) {
      //       destPath = destPath.replace('.less', '.wxss')
      //     }
      //     _.delPath(path.resolve(distPath, destPath))
      //   })
      //   .on('unlinkDir', (curPath) => {
      //     let destPath = path.resolve(distPath, curPath)
      //     if (/\.less/.test(destPath)) {
      //       destPath = destPath.replace('.less', '.wxss')
      //     }
      //     _.delPath(path.resolve(distPath, destPath))
      //   })


    });

    gulp.task(`${id}-dev`, gulp.series('clean', gulp.parallel('js', 'wxss', 'json', 'wxml', 'img'), 'install'));

    gulp.task(`${id}-build`, gulp.series('clean', gulp.parallel('js', 'wxss', 'json', 'wxml', 'img'), 'transform', 'install'));

    gulp.task(`${id}-lint`, gulp.series('lint'));

    gulp.task(`${id}-fix`, gulp.series('fix'));

    gulp.task(`${id}-default`, gulp.series(`${id}-dev`));

  }
}

module.exports = BuildTaskControl;
