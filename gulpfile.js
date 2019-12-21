const initTasks = require("./build/index")

// 初始化gulp任务
initTasks()

// const gulp = require('gulp');
//
//
//
// const id = require('./package.json').name || 'miniprogram-custom';
//
// const transformTaskControl = require("./build/taskControl/transformTaskControl");
// const BuildTaskControl = require('./build/taskControl/buildTaskControl');
//
// // eslint-disable-next-line no-new
// new transformTaskControl(id);
// // 构建任务实例
// // eslint-disable-next-line no-new
// new BuildTaskControl(id);
//
//
// // 监听文件变化并进行开发模式构建
// gulp.task('watch', gulp.series(`${id}-watch`));
// // 开发模式构建
// gulp.task('dev', gulp.series(`${id}-dev`));
// // 生产模式构建
// gulp.task('build', gulp.series(`${id}-build`));
// // 默认模式构建 (dev)
// gulp.task('default', gulp.series(`${id}-default`));
// // eslint检查
// gulp.task('lint', gulp.series(`${id}-lint`));
// // eslint-fix
// gulp.task('fix', gulp.series(`${id}-fix`));
// // img-transform
// gulp.task('transform', gulp.series(`${id}-transform`))
