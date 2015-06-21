/// <reference path="../typings/node/node.d.ts"/>

var gulp = require('gulp');
var config = require('./config');
var del = require('del');
var mkdir = require('mkdir-p').sync;
var fs = require('fs');
var uglifyjs = require('uglifyjs');

var helpers = require('./helpers');
var log = helpers.log;
var colors = helpers.colors;
var bundle = helpers.bundle;

// --

exports.cleanTask = cleanTask;
function cleanTask(cb) {
    
    del(config.buildDir + '/*', cb);
    
}



/**
 * Compiles the project
 */
exports.buildTask = buildTask;
function buildTask(cb) {
    
    var tsconfig = helpers.parseTypescriptConfig(config.tsconfigPath);
    var options = tsconfig.compilerOptions;
    
    options.outDir = config.buildDir;
    //options.declaration = true;
    options.sourceMap = true;
    
    mkdir(config.buildDir);
    
    // TODO errors?
    // Compile ts files
    try {
        helpers.tsc(tsconfig.files, options);
    }
    catch (e) {
        log(colors.red('Build error:'), helpers.inspect(e));
    }
    
    cb();
    
}

/**
 * 
 */
// exports.watch = watch;
// function watch() {
    
//     var files = helpers.parseTypescriptConfig(config.tsconfigPath).files;
    
//     // We also want to monitor these files
//     files.push(config.srcDir + '/**');
//     files.push(config.tsconfigPath);    
    
//     gulp.watch(files, function(event) {
//         log('File', colors.magenta(event.path), colors.yellow(event.type));
//         gulp.start(['build']);
//     });
    
// }





//-- Helpers

function minify(cb) {
        
    var result = uglifyjs.minify(config.devDir + '/tng.js', {
        inSourceMap: config.devDir + '/tng.js.map',
        outSourceMap: 'tng.js.map',        
        mangle: true,
        compress: {}
    });
    
    fs.writeFileSync(config.devDir + '/tng-min.js', result.code);
    fs.writeFileSync(config.devDir + '/tng-min.js.map', result.map);
    
    cb();
}