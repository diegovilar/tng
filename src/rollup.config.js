let pak = require("../package.json");
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "rollup-plugin-commonjs";

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
    entry: "../build/angularts/index.js",
    dest: "../build/angularts/bundles/index.js",
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
                "../node_modules/**"
            ]
        })
    ]
};