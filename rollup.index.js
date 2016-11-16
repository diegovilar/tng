// import typescript from "rollup-plugin-typescript";
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "rollup-plugin-commonjs";
let pak = require("./package.json");

let banner = `/**
 * @preserve
 * TAngular
 * Version: ${pak.version} (built on ${(new Date()).toUTCString()})
 * Project: ${pak.homepage}
 * Author: ${pak.author}
 */`;

export default {
    banner,
    // entry: "src/index.ts",
    entry: "build/index.js",
    // dest: "build/bundles/index.umd.js",
    targets: [
        // { dest: "build/bundles/index.iife.js", format: "iife"},
        // { dest: "build/bundles/index.cjs.js", format: "cjs"},
        // { dest: "build/bundles/index.amd.js", format: "amd"},
        // { dest: "build/bundles/index.es.js", format: "es"},
        { dest: "build/bundles/index.umd.js", format: "umd"}
    ],
    format: "umd",
    moduleName: "angularts",
    exports: "named",
    sourceMap: true,
    globals: {
        angular: "angular"
    },
    plugins: [
        sourcemaps(),
        commonjs({
            exlude: [
                "node_modules/**"
            ]
        }),
        // typescript({
        //     typescript: require("typescript")
        // })
    ]
};