const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const less = require('gulp-less');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const cssmin = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const eslint = require('gulp-eslint');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const prettyData = require('gulp-pretty-data');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const fs = require('fs');
const path = require('path');
const baseConfig = require('../config/baseConfig');


const _ = require('../util/index');

const wxssConfig = baseConfig.wxss || {};
const {srcPath, distPath} = baseConfig;


class BuildTaskControl {
  constructor(id) {
    this.id = id;
    this.init();
  }

  init() {
    const id = this.id;
    /**
     * 清空目标目录
     */
    gulp.task('clean', () => {
      return gulp.src(distPath, {read: false, allowEmpty: true})
        .pipe(clean({force: true}));
    });


    /**
     * 生成 wxss 文件到目标目录 (less转wxss)
     */
    gulp.task('wxss', () => {
      return gulp.src(baseConfig.lessFiles, {base: srcPath})
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
        .pipe(rename({extname: '.wxss'}))
        .pipe(_.logger(wxssConfig.less ? 'generate' : undefined))
        .pipe(gulp.dest(distPath));
    });

    /**
     * 生成 js 文件到目标目录 (转es6)
     */
    gulp.task('js', () => {
      return gulp.src(baseConfig.jsFiles, {base: srcPath})
        .pipe(changed(distPath))
        .pipe(_.logger())
        .pipe(gulp.dest(distPath));
    });

    /**
     * 生成 wxml 文件到目标目录
     */
    gulp.task('wxml', () => {
      return gulp.src(baseConfig.wxmlFiles, {base: srcPath})
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
      return gulp.src(baseConfig.jsonFiles, {base: srcPath})
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
      return gulp.src(baseConfig.imgFiles, {base: srcPath})
        .pipe(changed(distPath))
        .pipe(_.logger())
        // .pipe(gulpif(!baseConfig.isDev, imagemin()))
        .pipe(gulp.dest(distPath));
    });


    gulp.task(`dev`, gulp.series('clean', gulp.parallel('js', 'wxss', 'json', 'wxml', 'img'), 'install'));

    gulp.task(`build`, gulp.series('clean', gulp.parallel('js', 'wxss', 'json', 'wxml', 'img'), 'install'));

    gulp.task(`default`, gulp.series(`dev`));
  }
}

module.exports = BuildTaskControl;
