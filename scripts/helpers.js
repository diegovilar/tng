var gutil = require('gulp-util');
var colors = gutil.colors;
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var watchify = require('watchify');
var browserify = require('browserify');
var assign = require('lodash.assign');
var plumber = require('gulp-plumber');
var mkdir = require('mkdir-p').sync;
var buffer = require('vinyl-buffer')
var sourcemaps = require('gulp-sourcemaps');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var util = require('util');
var fs = require('fs');
var ts = require("typescript");
var config = require('../gulpconfig');


exports.colors = colors;


exports.proxyEmitter = proxyEmitter;
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



exports.bundle = bundle;
function bundle(entryFilePath, requires, destPath, destFileName, continuous, tsOptions, minify) {
    
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
    
    tsOptions = assign({}, parseTypescriptConfig(config.tsConfigPath).compilerOptions, tsOptions)
    bundler.plugin('tsify', tsOptions);
    
    if (minify) {
        // bundler.plugin('minifyify', {map: 'tng.js.map', output: './prod/tng.js.map'});
        bundler.plugin('minifyify', {map: false});
    }
    
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
        lastBundle = lastBundle.on('error', onBundleError)
            .pipe(plumber())
            .pipe(source(destFileName));
            
        if (!minify) {
            lastBundle = lastBundle
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write('./'))
        }
            
        lastBundle = lastBundle.pipe(gulp.dest(destPath));
        
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

exports.inspect = inspect;
function inspect(value, depth) {
    
    if (depth == null) depth = 3;
    return util.inspect(value, true, depth, true);
    
}

exports.log = log;
function log() {
    var args = [].slice.call(arguments, 0);
    gutil.log.apply(gutil, args);
}

exports.parseTypescriptConfig = parseTypescriptConfig;
function parseTypescriptConfig(filePath) {
    
    // if (!filePath) {
    //     filePath = tsconfigPath;
    // }
    
    return JSON.parse(fs.readFileSync(filePath).toString());
    
}

exports.tsc = tsc;
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

exports.getKarmaOptions = getKarmaOptions;
function getKarmaOptions(karmaConfigFile) {
    
    var karmaConfig = require(karmaConfigFile);
    
    var result;
    var config = {
        set: function (options) {
            result = options; 
        }
    }
    
    karmaConfig(config);
    
    return result;
    
}