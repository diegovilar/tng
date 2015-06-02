/// <reference path="typings/node/node.d.ts"/>

var gulp = require('gulp');
var lodash = require('lodash');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var colors = gutil.colors;
var copy = require('gulp-copy');
var rename = require('gulp-rename');
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var assign = require('lodash.assign');
var output = require('vinyl-source-stream');
var buffer = require('vinyl-buffer')
var sourcemaps = require('gulp-sourcemaps');
var ts = require("typescript");
var fs = require('fs');
var path = require('path');
var del = require('del');
var mkdir = require('mkdir-p').sync;
var util = require('util');
var uglifyjs = require('uglifyjs');
var EventEmitter2 = require('eventemitter2').EventEmitter2
var es = require('event-stream');
var glob = require("glob");
var batch = require('gulp-batch');
var debounce = require('mout/function/debounce');



// --

var test = require('./scripts/test');



// -- Paths --

var srcFiles = 'src/**/*.ts';
var srcDir = './src';
var buildDir = './build';
var buildBrowserDir = './build-browser';
var tsconfigPath = './tsconfig.json';



// -- Exported modules --

var exportedModules = [
    { expose: 'tng',                file: './src/main.ts' },
    { expose: 'tng/animation',      file: './src/animation.ts' },
    { expose: 'tng/application',    file: './src/application.ts' },
    { expose: 'tng/bootstrap',      file: './src/bootstrap.ts' },
    { expose: 'tng/component',      file: './src/component.ts' },
    { expose: 'tng/component-view', file: './src/component-view.ts' },
    { expose: 'tng/constant',       file: './src/constant.ts' },
    { expose: 'tng/controller',     file: './src/controller.ts' },
    { expose: 'tng/decorator',      file: './src/decorator.ts' },
    { expose: 'tng/di',             file: './src/di.ts' },
    { expose: 'tng/directive',      file: './src/directive.ts' },
    { expose: 'tng/filter',         file: './src/filter.ts' },
    { expose: 'tng/module',         file: './src/module.ts' },
    { expose: 'tng/reflection',     file: './src/reflection.ts' },
    { expose: 'tng/service',        file: './src/service.ts' },
    { expose: 'tng/utils',          file: './src/utils.ts' },
    { expose: 'tng/value',          file: './src/value.ts' },
    { expose: 'tng/view',           file: './src/view.ts' },
    { expose: 'tng/assert',         file: './src/assert.ts' },

    // TODO extract to different bundle
    { expose: 'tng/ui-router',          file: './src/ui-router.ts' },
    { expose: 'tng/ui-router/routes',   file: './src/ui-router/routes.ts' },
    { expose: 'tng/ui-router/states',   file: './src/ui-router/states.ts' }
];



// -- Tasks --

gulp.task('default', ['build']);

gulp.task('clean:build', cleanBuild);
gulp.task('clean:browser', cleanBuildBrowser);

// gulp.task('clean', ['clean:build', 'clean:browser']);
// gulp.task('build', ['clean:build'], build);
// gulp.task('watch', ['build'], watch);
// gulp.task('test', ['build'], test);

gulp.task('build:browser', ['clean:browser'], buildBrowser);
gulp.task('build', ['clean:browser'], buildBrowser);

gulp.task('watch:browser', ['clean:browser'], watchBrowser);
gulp.task('watch', ['clean:browser'], watchBrowser);
// gulp.task('build:browser:tests', ['clean:browser', 'build:browser'], buildBrowserTests);

gulp.task('minify', ['build'], minifyBrowser);

gulp.task('test:watch', watchTest);




// --

function proxyEmitter(emitter, proxy, prefix) {
  var oldEmit = emitter.emit;

  emitter.emit = function () {
      var proxyArgs = [].slice.call(arguments, 1);
      proxyArgs.unshift(prefix + '.' + arguments[0]);
      // console.log('** ' + arguments[0] + ' proxied as ' + proxyArgs[0]);
      proxy.emit.apply(proxy, proxyArgs);
      oldEmit.apply(emitter, arguments);
  };
  
  return emitter;
}

function watchTest(cb) {
    
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
            gulp.start('test:run');
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
        tngBundle = watchBrowser();
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
    
}

function cleanBuild(cb) {
    del(buildDir + '/*', cb);
}

function cleanBuildBrowser(cb) {
    del(buildBrowserDir + '/*', cb);
}

/**
 * Compiles the project
 */
function build(cb) {
    
    var tsconfig = parseTypescriptConfig();
    var options = tsconfig.compilerOptions;
    
    options.outDir = buildDir;
    //options.declaration = true;
    options.sourceMap = true;
    
    mkdir(buildDir);
    
    // TODO errors?
    // Compile ts files
    try {
        tsc(tsconfig.files, options);
    }
    catch (e) {
        log(colors.red('Build error:'), inspect(e));
    }
    
    cb();
    
}

/**
 * 
 */
function watch() {
    
    var files = parseTypescriptConfig().files;
    
    // We also want to monitor these files
    files.push(srcDir + '/**');
    files.push(tsconfigPath);    
    
    gulp.watch(files, function(event) {
        log('File', colors.magenta(event.path), colors.yellow(event.type));
        gulp.start(['build']);
    });
    
}

/**
 * Compiles a bundled version of the library for the browser
 */
function buildBrowser() {
    
    return bundle(
        null,
        exportedModules,
        buildBrowserDir,
        'tng.js',
        false
    );
  
}

function watchBrowser() {
    
     return bundle(
        null,
        exportedModules,
        buildBrowserDir,
        'tng.js',
        true
    );
    
}

function watchAndBundleTests() {
    
    var files = glob.sync('test/**/*.spec.ts');
    // files = files.concat(glob.sync('test/**/*.ts'));
    // files = lodash.uniq(files);
    
     return bundle(
        files,
        null,
        buildBrowserDir,
        'tng-tests.js',
        true
    );
    
}

function bundle(entryFilePath, requires, destPath, destFileName, continuous) {
    
    var emitter = new EventEmitter2({wildcard: true});
    var bundler;
    var lastBundle;
    
    var bundlerOptions = {
        debug: true,
        bundleExternal: false
    };
    
    if (continuous) {
        bundlerOptions = assign({}, watchify.args, bundlerOptions);
        bundler = watchify(browserify(entryFilePath, bundlerOptions));
        bundler.on('log', log);        
        bundler.on('update', function(ids) {
            for (var i = 0; i < ids.length; i++) {
                log('Change detected on', colors.magenta(ids[i]));
            }
            return run();
        });
    }
    else {
        bundler = browserify(entryFilePath, bundlerOptions); 
    }
    
    proxyEmitter(bundler, emitter, 'bundler');
    
    bundler.plugin('tsify', parseTypescriptConfig().compilerOptions);
    
    if (requires) {
        bundler.require(requires);
    }
    
    function onBundleError(err) {
        log(colors.red('Bundle "' + destFileName + '" error:'), err.message);
        this.emit('end', err);
    }
    
    function run() {
        mkdir(destPath);

        lastBundle = bundler.bundle();
        proxyEmitter(lastBundle, emitter, 'bundle');
        
        // Error handling
        lastBundle.on('error', onBundleError)
            .pipe(plumber());
            
        lastBundle.pipe(output(destFileName))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(destPath));
        
        return lastBundle;
    }
        
    // Always run once at startup (even if watching)
    run();
    
    return {
        bundler: bundler,
        events: emitter,
        getBundle: function() {
            return lastBundle;
        }
    };
    
}

function minifyBrowser(cb) {
        
    var result = uglifyjs.minify(buildBrowserDir + '/tng.js', {
        inSourceMap: buildBrowserDir + '/tng.js.map',
        outSourceMap: 'tng.js.map',        
        mangle: true,
        compress: {}
    });
    
    fs.writeFileSync(buildBrowserDir + '/tng-min.js', result.code);
    fs.writeFileSync(buildBrowserDir + '/tng-min.js.map', result.map);
    
    cb();
}

// -----

function inspect(value, depth) {
    
    if (depth == null) depth = 3;
    return util.inspect(value, true, depth, true);
    
}

function log() {
    var args = [].slice.call(arguments, 0);
    gutil.log.apply(gutil, args);
}

/**
 * 
 */
function parseTypescriptConfig(filePath) {
    
    if (!filePath) {
        filePath = tsconfigPath;
    }
    
    return JSON.parse(fs.readFileSync(filePath).toString());
    
}

/**
 * 
 */
function tsc(fileNames, options) {
    
    var ScriptTarget = {
        ES3 : 0,
        ES5 : 1,
        ES6 : 2,
        LATEST : 2 
    };
    var ModuleKind = {
        NONE : 0,
        COMMONJS : 1,
        AMD : 2
    };
    
    if (options) {
        if (typeof options.target === 'string') {
            options.target = ScriptTarget[options.target.toUpperCase()];
        }
        if (typeof options.module === 'string') {
            options.module = ModuleKind[options.module.toUpperCase()];
        }
    }
    
    var program = ts.createProgram(fileNames, options);
    var emitResult = program.emit();
    var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    
    allDiagnostics.forEach(function (diagnostic) {
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        throw new Error(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
    });
    
    //var exitCode = emitResult.emitSkipped ? 1 : 0;
    //if (exitCode) {
    //    grunt.log(`Process exiting with code '${exitCode}'.`);
    //}
    //return exitCode;
    
}