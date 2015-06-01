/// <reference path="../typings/node/node.d.ts"/>

var gulp = require('gulp');
var karma = require('karma');
var ts = require("typescript");
var tsc = require('./tsc');
var del = require('del');



// --

var sourceSpecFiles = "test/**/*.ts";
var compiledSpecFiles = "test/**/*.js";
var compiledTestMaps = "test/**/*.map";
var karmaConfigFile = __dirname + '/../karma.conf.js';

var testCompileOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    preserveConstEnums: true,
    sourceMap: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
};



// --

exports.sourceSpecFiles = sourceSpecFiles;

exports.clean = cleanTest;
exports.compile = compileTest;
exports.run = runTest;
exports.server = startServer;



// --

gulp.task('test:clean', cleanTest);
gulp.task('test:compile', ['test:clean'], compileTest);
// gulp.task('test:run', ['test:compile'], runTest);
gulp.task('test:run', runTest);
gulp.task('test:server', startServer);



// ---

function cleanTest(cb) {
    del([compiledSpecFiles, compiledTestMaps], cb);
}

function compileTest(cb) {
    
    var glob = require('glob');
    var files = glob.sync(sourceSpecFiles);

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        tsc.compile([file], testCompileOptions);
    }
    
    cb();
    
}

function runTest(cb) {

    karma.runner.run({
        configFile: karmaConfigFile
    }, function () {
      cb();
    });

}
 
function startServer(cb) {

    karma.server.start({
        configFile: karmaConfigFile,
        singleRun: false
    });
    
    setTimeout(cb, 5000);
};