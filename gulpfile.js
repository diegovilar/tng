/// <reference path="typings/node/node.d.ts"/>

var gulp = require('gulp');
var dev = require('./scripts/dev');
var prod = require('./scripts/prod');
var test = require('./scripts/test');



// -- Tasks --

gulp.task('prod', ['prod.build']);
gulp.task('prod.clean', prod.cleanTask);
gulp.task('prod.build', ['prod.clean'], prod.buildTask);
// gulp.task('prod.minify', ['prod.build'], prod.minifyTask);
gulp.task('prod.test.server', prod.test.serverTask);
gulp.task('prod.test.run', prod.test.runTask);
gulp.task('prod.test.runOnce', prod.test.runOnceTask);

gulp.task('dev', ['dev.build']);
gulp.task('dev.clean', dev.cleanTask);
gulp.task('dev.build', ['dev.clean'], dev.buildTask);
gulp.task('dev.watch', ['dev.clean'], dev.watchTask);
gulp.task('dev.test.server', dev.test.serverTask);
gulp.task('dev.test.run', dev.test.runTask);
gulp.task('dev.test.runOnce', dev.test.runOnceTask);
gulp.task('dev.test.watch', dev.test.watchTask);

gulp.task('test.clean', test.cleanTask);
gulp.task('test.build', ['test.clean'], test.buildTask);