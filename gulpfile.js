/// <reference path="typings/node/node.d.ts"/>

var gulp = require('gulp');
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
var vm = require('vm');



// -- Paths --

var srcDir = './src';
var buildDir = './build';
var buildBrowserDir = './build-browser';
var tsconfigPath = './tsconfig.json';



// -- Tasks --

gulp.task('default', ['build', 'build:browser']);
gulp.task('clean:build', cleanBuild);
gulp.task('clean:browser', cleanBuildBrowser);
gulp.task('clean', ['clean:build', 'clean:browser']);
gulp.task('build', ['clean:build'], build);
gulp.task('watch', ['build'], watch);
gulp.task('test', ['build'], test);
gulp.task('build:browser', ['clean:browser'], buildBrowser);
gulp.task('watch:browser', ['clean:browser'], watchBrowser);
gulp.task('build:browser:tests', ['clean:browser', 'build:browser'], buildBrowserTests);

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

function test(cb) {
      
    var context = {
        require: require
    };    
    
    var code = "require('./build/tests')";    
    
    try {
        vm.runInNewContext(code, context, {displayErrors:false});
        log(colors.green('All tests passed!'));
    }
    catch (e) {
        log(colors.red('TEST ERROR:'));
        log(e.stack);
    }
        
    cb();
    
}

/**
 * Compiles a bundled version of the library for the browser
 */
function buildBrowser() {
    
    bundle(
        srcDir + '/main.ts',
        buildBrowserDir,
        'tng.js',
        false
    );
  
}

function watchBrowser() {
    
     bundle(
        srcDir + '/main.ts',
        buildBrowserDir,
        'tng.js',
        true
    );
    
}

function buildBrowserTests() {
    
    bundle(
        srcDir + '/tests.ts',
        buildBrowserDir,
        'tests.js',
        false
    );
  
}

function bundle(entryFilePath, destPath, destFileName, watch) {
    
    var bundler;
    
    var bundlerOptions = {
        debug: true,
        bundleExternal: false
    };
    
    if (watch) {
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
    
    bundler.plugin('tsify', parseTypescriptConfig().compilerOptions);
    
    bundler.require([
        {file: './src/main.ts', expose: 'tng'},
        {file: './src/animation.ts', expose: 'tng/animation'},
        {file: './src/application.ts', expose: 'tng/application'},
        {file: './src/bootstrap.ts', expose: 'tng/bootstrap'},
        {file: './src/component.ts', expose: 'tng/component'},
        {file: './src/component-view.ts', expose: 'tng/component-view'},
        {file: './src/constant.ts', expose: 'tng/constant'},
        {file: './src/controller.ts', expose: 'tng/controller'},
        {file: './src/decorator.ts', expose: 'tng/decorator'},
        {file: './src/di.ts', expose: 'tng/di'},
        {file: './src/directive.ts', expose: 'tng/directive'},
        {file: './src/filter.ts', expose: 'tng/filter'},
        {file: './src/module.ts', expose: 'tng/module'},
        {file: './src/reflection.ts', expose: 'tng/reflection'},
        {file: './src/service.ts', expose: 'tng/service'},
        {file: './src/utils.ts', expose: 'tng/utils'},
        {file: './src/value.ts', expose: 'tng/value'},
        {file: './src/view.ts', expose: 'tng/view'},
        
        {file: './src/ui-router.ts', expose: 'tng/ui-router'},
        {file: './src/ui-router/routes.ts', expose: 'tng/ui-router/routes'},
        {file: './src/ui-router/states.ts', expose: 'tng/ui-router/states'}
    ]);
    
    function run() {
        mkdir(destPath);
        return bundler
            .bundle()
            .pipe(output(destFileName))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
                //.pipe(uglify())
                //.pipe(rename(destFileName.replace(/\.js$/, '-min.js')))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(destPath))
            .on('error', log.bind(gutil, colors.red('Browserify Error')));
    }
        
    return run(); 
    
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