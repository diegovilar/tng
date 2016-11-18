let pak = require("../../package.json");

import commonjs from "rollup-plugin-commonjs";
import nodeResolve from 'rollup-plugin-node-resolve';
import sourcemaps from "rollup-plugin-sourcemaps";

let banner = `/**
 * @preserve
 * AngularTS - ${pak.description}
 * Version: ${pak.version} (built on ${(new Date()).toUTCString()})
 * Project: ${pak.homepage}
 * Author:  ${pak.author}
 * License: ${pak.license}
 */`;

export default {
    banner,
    entry: "../../build/angularts/index.js",
    dest: "../../build/angularts/bundles/index.js",
    format: "umd",
    moduleName: "angularts",
    exports: "named",
    sourceMap: true,
    globals: {
        angular: "angular",
        "angularts.core" : "angularts.core",
        "angularts.ui.bootstrap" : "angularts.ui.bootstrap",
        "angularts.ui.router" : "angularts.ui.router",
    },
    external: [
        "angular",
        "angularts.core",
        "angularts.ui.bootstrap",
        "angularts.ui.router",
    ],
    // external: function(moduleId) {
    //     var internal = moduleId.indexOf("angularts") > -1;
    //     console.log(">> " + moduleId + " = " + (internal ? "internal" : "external"));
    //     return !internal;
    // },
    // paths: {
    //     "angularts.core" : "../../build/angularts.core/bundles/index.js",
    //     "angularts.ui.bootstrap" : "../../build/angularts.ui.bootstrap/bundles/index.js",
    //     "angularts.ui.router" : "../../build/angularts.ui.router/bundles/index.js",
    // },
    plugins: [
        sourcemaps(),
        nodeResolve({ jsnext: true, main: true }),
        commonjs()
    ]
};