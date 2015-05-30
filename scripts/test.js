/// <reference path="../typings/node/node.d.ts"/>

var gulp = require('gulp');
var karma = require('gulp-karma');
var ts = require("typescript");
var tsc = require('./tsc');
var del = require('del');

var sourceTestFiles = "./tests/**/*.ts";
var compiledTestFiles = "./tests/**/*.js";
var compiledTestMaps = "./tests/**/*.map";
var karmaConfigFile = './karma.conf.js';

var testCompileOptions = {
  noEmitOnError: true,
  noImplicitAny: true,
  preserveConstEnums: true,
  sourceMap: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
};



// --

exports.cleanTest = cleanTest;
exports.compileTest = compileTest;



// ---

function cleanTest(cb) {
  del([compiledTestFiles, compiledTestMaps], cb);
}

function compileTest(cb) {
  
  var glob = require('glob');
  var sourceTestFiles = glob.sync(sourceTestFiles);

  for (var i = 0; i < sourceTestFiles.length; i++) {
    var file = sourceTestFiles[i];
    tsc.compile([file], testCompileOptions);
  }
  
  cb();
  
}


function karmaRun() {
  // Be sure to return the stream 
  return gulp.src(compiledTestFiles)
    .pipe(karma({
      configFile: karmaConfigFile,
      action: 'run'
    }))
    .on('error', function (err) {
      // Make sure failed tests cause gulp to exit non-zero 
      throw err;
    });
};
 
function watch() {
  gulp.src(sourceTestFiles)
    .pipe(karma({
      configFile: karmaConfigFile,
      action: 'watch'
    }));
};