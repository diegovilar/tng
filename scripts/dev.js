var config = require('./config');
var del = require('del');
var glob = require("glob");
var gulp = require('gulp');
var watch = require('gulp-watch');
var karma = require('karma');
var debounce = require('mout/function/debounce');
var tsc = require('./tsc');

var helpers = require('./helpers');
var log = helpers.log;
var colors = helpers.colors;
var bundle = helpers.bundle;


/**
 * Cleans all generated files for the in-development version of TNG.
 */
exports.cleanTask = cleanTask;
function cleanTask (cb) {
    
    del(config.dev.dir + '/*', cb);
    
}

/**
 * Builds the in-development version of TNG.
 */
exports.buildTask = buildTask;
function buildTask() {

    return bundle(
        null,
        config.exportedModules,
        config.dev.dir,
        'tng.js',
        false
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
        config.dev.dir,
        'tng.js',
        true
    );

}



//-- test

exports.test = {};

/**
 * 
 */
exports.test.cleanTask = function (cb) {
    
    del([config.dev.test.compiledSpecsGlob, config.dev.test.mapsGlob], cb);
    
};

/**
 * 
 */
exports.test.buildTask = function (cb) {

    // var glob = require('glob');
    var files = glob.sync(config.dev.test.specsGlob);

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        tsc.compile([file], config.dev.test.tsCompilerOptions);
    }

    cb();

};

/**
 * 
 */
exports.test.runTask = function (cb) {

    karma.runner.run({
        configFile: config.dev.test.karmaConfig
    }, function () {
        cb && cb();
    });

};
 
 /**
 * 
 */
exports.test.serverTask = function (cb) {

    karma.server.start({
        configFile: config.dev.test.karmaConfig,
        singleRun: false
    });
    
    cb && setTimeout(cb, 5000);
    
};

/**
 * 
 */
exports.test.watchTask = function (cb) {

    var tngBundleError = null;
    var testsBundleError = null;
    var tngBundle;
    var testsBundle;

    var runTest = debounce(function runTest() {
        // var runTest = function runTest() {
        if (tngBundleError)
            log(colors.yellow('Skiping tests due to TNG bundle error'));
        else if (testsBundleError)
            log(colors.yellow('Skiping tests due to tests bundle error'));
        else
            // gulp.start('test:run');
            exports.test.runTask();
        // };
    }, 3000);

    linkTngBundle();
    linkTestsBundle();

    watch('src/**/*', function (file) {
        if (file.event == 'add' || file.event == 'unlink') {
            log(colors.green('File ' + file.event + 'ed to TNG. Restarting bundler...'));
            tngBundle.bundler.close();
            linkTngBundle();
        }
    });

    watch('test/**/*', function (file) {
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
        testsBundle = watchAndBundleTests();
        testsBundle.events.on('bundle.end', function (err) {
            testsBundleError = err;
            runTest.cancel();
            runTest();
        });
    }
    
    function watchAndBundleTests() {
    
        var files = glob.sync('test/**/*.spec.ts');
        // files = files.concat(glob.sync('test/**/*.ts'));
        // files = lodash.uniq(files);
        
         return helpers.bundle(
            files,
            null,
            config.dev.dir,
            'tng-tests.js',
            true
        );
        
    }

};