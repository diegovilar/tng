/// <reference path="../typings/node/node.d.ts"/>

var del = require('del');
var glob = require("glob");
var gulp = require('gulp');
var watch = require('gulp-watch');
var debounce = require('mout/function/debounce');
var path = require('path');
var assign = require('lodash.assign');

var config = require('../gulpconfig');
var tsc = require('./tsc');
var test = require('./test');

var helpers = require('./helpers');
var log = helpers.log;
var colors = helpers.colors;
var bundle = helpers.bundle;



function getTsOptions() {

    var tsConfigOptions = { compilerOptions: {} };

    try {
        tsConfigOptions = helpers.parseTypescriptConfig(config.tsConfigPath);
    }
    finally {
        return assign({}, tsConfigOptions.compilerOptions, config.dev.tsOptions);
    }

}

/**
 * Cleans all generated files for the in-development version of TNG.
 */
exports.cleanTask = cleanTask;
function cleanTask (cb) {

    del(config.dev.destDir + '/*', cb);

}

/**
 * Builds the in-development version of TNG.
 */
exports.buildTask = buildTask;
function buildTask() {

    return bundle(
        null,
        config.exportedModules,
        config.dev.destDir,
        config.dev.bundleFileName,
        false,
        getTsOptions()
    );

}

/**
 * Watches the in-development version of TNG.
 */
exports.watchTask = watchTask;
function watchTask() {

    return bundle(
        null,
        config.exportedModules,
        config.dev.destDir,
        config.dev.bundleFileName,
        false,
        getTsOptions()
    );

}



//-- test

exports.test = {};

var bundleFile = config.dev.destDir + '/' + config.dev.bundleFileName;
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
    port: 10188 // same as serverTask
});

/**
 *
 */
exports.test.runOnceTask = test.createServerTask({
    files: files,
    singleRun: true,
    port: 10189
});

/**
 *
 */
exports.test.serverTask = test.createServerTask({
    files: files,
    singleRun: false,
    port: 10188
});

/**
 *
 */
exports.test.watchTask = function () {

    var tngBundleError = null;
    var testsBundleError = null;
    var tngBundle;
    var testsBundle;

    var runTest = debounce(function runTest() {
        if (tngBundleError)
            log(colors.yellow('Skiping tests due to TNG bundle error'));
        else if (testsBundleError)
            log(colors.yellow('Skiping tests due to tests bundle error'));
        else
            exports.test.runTask();
    }, 3000);

    linkTngBundle();
    linkTestsBundle();

    watch(config.srcDir + '/**/*', function (file) {
        if (file.event == 'add' || file.event == 'unlink') {
            log(colors.green('File ' + file.event + 'ed to TNG. Restarting bundler...'));
            tngBundle.bundler.close();
            linkTngBundle();
        }
    });

    watch(config.test.srcDir + '/**/*', function (file) {
        if (file.event == 'add' || file.event == 'unlink') {
            log(colors.green('File ' + file.event + 'ed to tests. Restarting bundler...'));
            testsBundle.bundler.close();
            linkTestsBundle();
        }
    });

    function linkTngBundle() {
        tngBundle = watchTask();
        tngBundle.events.on('bundle.end', function (err) {
            tngBundleError = err;
            runTest.cancel();
            runTest();
        });
    }

    function linkTestsBundle() {
        testsBundle = test.watchTask();
        testsBundle.events.on('bundle.end', function (err) {
            testsBundleError = err;
            runTest.cancel();
            runTest();
        });
    }

};