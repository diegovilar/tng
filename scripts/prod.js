/// <reference path="../typings/node/node.d.ts"/>

var gulp = require('gulp');
var glob = require("glob");
var del = require('del');
var mkdir = require('mkdir-p').sync;
var fs = require('fs-extra');
var uglifyjs = require('uglifyjs');

var config = require('../gulpconfig');
var test = require('./test');

var helpers = require('./helpers');
var log = helpers.log;
var colors = helpers.colors;
var bundle = helpers.bundle;

// --

exports.cleanTask = cleanTask;
function cleanTask(cb) {
    
    del(config.prod.destDir + '/*', cb);
    
}



/**
 * Compiles the project
 */
exports.buildTask = buildTask;
function buildTask() {
    
    var tsOptions = {
        removeComments: true
    };

    var b = bundle(
        null,
        config.exportedModules,
        config.prod.destDir,
        config.prod.bundleFileName,
        false,
        tsOptions
        // true
    );
    
    fs.copySync(config.srcDir + '/tng.d.ts', config.prod.destDir + '/tng.d.ts');
    
    return b;
    
    // b.events.on('bundle.end', function (err) {
    //     setTimeout(function () {
    //         cb && cb();
    //     }, 3000);
    // });

}

exports.minifyTask = minifyTask;
function minifyTask(cb) {
        
    // setTimeout(function () {
        var result = uglifyjs.minify(config.prod.destDir + '/tng.js', {
            inSourceMap: config.prod.destDir + '/tng.js.map',
            outSourceMap: 'tng-min.js.map',
            mangle: true,
            compress: {}
        });
        
        fs.writeFileSync(config.prod.destDir + '/tng-min.js', result.code);
        fs.writeFileSync(config.prod.destDir + '/tng-min.js.map', result.map);
        
        cb && cb();
    // }, 5000);
    
}



//-- test

exports.test = {};

var bundleFile = config.prod.destDir + '/' + config.prod.bundleFileName;
var bundleMapFile = bundleFile + '.map';
var files = [
    { pattern: bundleFile, watched: false },
    { pattern: bundleMapFile, watched: false, included: false },
];

/**
 * 
 */
exports.test.runTask = test.createRunnerTask({
    files: files,
    port: 10288 // same as serverTask
});

/**
 * 
 */
exports.test.runOnceTask = test.createServerTask({
    files: files,
    singleRun: true,
    port: 10289
});

/**
 * 
 */
exports.test.serverTask = test.createServerTask({
    files: files,
    singleRun: false,
    port: 10288
});