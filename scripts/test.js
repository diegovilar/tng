/// <reference path="../typings/node/node.d.ts"/>

var del = require('del');
var glob = require("glob");
var karma = require('karma');

var config = require('../gulp.config');
var helpers = require('./helpers');


/**
 * 
 */
exports.cleanTask = cleanTask;
function cleanTask(cb) {
    
    del(config.test.destDir + '/*', cb);
    
}

/**
 * 
 */
exports.buildTask = buildTask;
function buildTask() {
    
    var files = glob.sync(config.test.specFilesGlob);
    
     return helpers.bundle(
        files,
        null,
        config.test.destDir,
        config.test.bundleFileName,
        false
    );
    
}

/**
 * 
 */
exports.watchTask = watchTask;
function watchTask() {
    
    var files = glob.sync(config.test.specFilesGlob);
    
     return helpers.bundle(
        files,
        null,
        config.test.destDir,
        config.test.bundleFileName,
        true
    );
    
}

/**
 * 
 */
exports.createRunnerTask = createRunnerTask;
function createRunnerTask(options) {
    
    options.files = makeFileList(options.files);
    options.configFile = options.configFile || config.karmaConfigPath;

    return function (cb) {
        karma.runner.run(options, function () {
            cb && cb();
        });
    };

}
 
 /**
 * 
 */
exports.createServerTask = createServerTask;
function createServerTask(options) {
    
    options.files = makeFileList(options.files);
    options.configFile = options.configFile || config.karmaConfigPath;

    return function (cb) {
        karma.server.start(options, function () {
            cb && cb();
        });        
        // cb && setTimeout(cb, 5000);
    };
    
}

function makeFileList(codeFiles) {
    var configFiles = helpers.getKarmaOptions(config.karmaConfigPath).files;
    
    var bundleFile = config.test.destDir + '/' + config.test.bundleFileName;
    var bundleMapFile = bundleFile + '.map';
    
    var specFiles = [
        { pattern: bundleFile, watched: false },
        { pattern: bundleMapFile, watched: false, included: false }
    ];
    
    return configFiles.concat(codeFiles || [], specFiles);
}