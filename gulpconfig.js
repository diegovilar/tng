/// <reference path="typings/node/node.d.ts"/>

var path = require('path');



// -- Paths and files

exports.srcDir = 'src';
exports.tsConfigPath = path.resolve(__dirname, 'tsconfig.json');
exports.karmaConfigPath = path.resolve(__dirname, 'karma.config.js');

exports.dev = {};
exports.dev.destDir = 'build/dev';
exports.dev.bundleFileName = 'tng.js';
exports.dev.tsOptions = {

};

exports.prod = {};
exports.prod.destDir = 'build/prod';
exports.prod.bundleFileName = 'tng.js';
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
    { expose: 'tng/service',        file: './src/service.ts' },
    { expose: 'tng/value',          file: './src/value.ts' },
    { expose: 'tng/view',           file: './src/view.ts' },

    // Private API
    // { expose: 'tng/utils',          file: './src/utils.ts' },
    // { expose: 'tng/reflection',     file: './src/reflection.ts' },
    // { expose: 'tng/assert',         file: './src/assert.ts' },

    // TODO extract to different bundle
    { expose: 'tng/ui/router/routes',   file: './src/ui/router/routes.ts' },
    { expose: 'tng/ui/router/states',   file: './src/ui/router/states.ts' },
    { expose: 'tng/ui/bootstrap/modal', file: './src/ui/bootstrap/modal.ts' }
];