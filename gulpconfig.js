/// <reference path="typings/node/node.d.ts"/>

var path = require('path');



// -- Paths and files

exports.srcDir = 'src';
exports.tsConfigPath = path.resolve(__dirname, 'tsconfig.json');
exports.karmaConfigPath = path.resolve(__dirname, 'karma.config.js');

exports.dev = {};
exports.dev.destDir = 'build/dev';
exports.dev.bundleFileName = 'index.js';
exports.dev.tsOptions = {

};

exports.prod = {};
exports.prod.destDir = 'build/prod';
exports.prod.bundleFileName = 'index.js';
exports.prod.tsOptions = {
    removeComments: true
};

exports.test = {};
exports.test.srcDir = 'test';
exports.test.destDir = 'build/test';
exports.test.bundleFileName = 'tng-test.js';
exports.test.specFilesGlob = 'test/**/*.spec.ts';
exports.test.tsOptions = {

};



// -- Exported TNG modules --

exports.exportedModules = [
    { expose: 'tng-js',                file: './src/index.ts' },
    { expose: 'tng-js/animation',      file: './src/animation.ts' },
    { expose: 'tng-js/application',    file: './src/application.ts' },
    { expose: 'tng-js/bootstrap',      file: './src/bootstrap.ts' },
    { expose: 'tng-js/component',      file: './src/component.ts' },
    { expose: 'tng-js/component-view', file: './src/component-view.ts' },
    { expose: 'tng-js/constant',       file: './src/constant.ts' },
    { expose: 'tng-js/controller',     file: './src/controller.ts' },
    { expose: 'tng-js/decorator',      file: './src/decorator.ts' },
    { expose: 'tng-js/di',             file: './src/di.ts' },
    { expose: 'tng-js/directive',      file: './src/directive.ts' },
    { expose: 'tng-js/filter',         file: './src/filter.ts' },
    { expose: 'tng-js/module',         file: './src/module.ts' },
    { expose: 'tng-js/service',        file: './src/service.ts' },
    { expose: 'tng-js/value',          file: './src/value.ts' },
    { expose: 'tng-js/view',           file: './src/view.ts' },

    // Private API
    // { expose: 'tng/utils',          file: './src/utils.ts' },
    // { expose: 'tng/reflection',     file: './src/reflection.ts' },
    // { expose: 'tng/assert',         file: './src/assert.ts' },

    // TODO extract to different bundle
    { expose: 'ng-js/ui/router/routes',   file: './src/ui/router/routes.ts' },
    { expose: 'ng-js/ui/router/states',   file: './src/ui/router/states.ts' },
    { expose: 'ng-js/ui/bootstrap',       file: './src/ui/bootstrap/bootstrap.ts' },
    { expose: 'ng-js/ui/bootstrap/modal', file: './src/ui/bootstrap/modal.ts' }
];