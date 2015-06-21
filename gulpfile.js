/// <reference path="typings/node/node.d.ts"/>

var gulp = require('gulp');
var dev = require('./scripts/dev');
var prod = require('./scripts/prod');




// -- Tasks --

// gulp.task('default', ['prod']);

gulp.task('prod', ['prod.build']);
gulp.task('prod.clean', prod.cleanTask);
gulp.task('prod.build', ['prod.clean'], prod.buildTask);

gulp.task('dev', ['dev.build']);
gulp.task('dev.clean', dev.cleanTask);
gulp.task('dev.build', ['dev.clean'], dev.buildTask);
gulp.task('dev.watch', ['dev.clean'], dev.watchTask);

gulp.task('dev.test', ['dev.test.run']);
gulp.task('dev.test.clean', dev.test.cleanTask);
gulp.task('dev.test.build', ['dev.test.clean'], dev.test.buildTask);
gulp.task('dev.test.run', ['dev.test.build'], dev.test.runTask);
gulp.task('dev.test.server', dev.test.serverTask);
gulp.task('dev.test.watch', dev.test.watchTask);