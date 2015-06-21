/// <reference path="../typings/node/node.d.ts"/>

var ts = require("typescript");



exports.srcDir   = './src';
exports.buildDir = './build';
exports.srcFiles     = 'src/**/*.ts';
exports.tsconfigPath = './tsconfig.json';

exports.dev = {};
exports.dev.dir = './dev';
exports.dev.test = {};
exports.dev.test.specsGlob = 'test/**/*.ts';
exports.dev.test.compiledSpecsGlob = 'test/**/*.js';
exports.dev.test.mapsGlob = 'test/**/*.map';
exports.dev.test.karmaConfig = __dirname + '/../karma.dev.js';

exports.dev.test.tsCompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    preserveConstEnums: true,
    sourceMap: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
};


// -- Exported TNG modules --
exports.exportedModules = [
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