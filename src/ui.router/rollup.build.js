let pak = require("../../package.json");
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "rollup-plugin-commonjs";

let banner = `/**
 * @preserve
 * AngularTS (UI Router) - ${pak.description}
 * Version: ${pak.version} (built on ${(new Date()).toUTCString()})
 * Project: ${pak.homepage}
 * Author:  ${pak.author}
 * License: ${pak.license}
 */`;

export default {
    banner,
    entry: "../../build/angularts.ui.router/index.js",
    dest: "../../build/angularts.ui.router/bundles/index.js",
    format: "umd",
    moduleName: "angularts.ui.router",
    exports: "named",
    sourceMap: true,
    globals: {
        angular: "angular",
        "angularts.core" : "angularts.core",
        "angularts.ui.bootstrap" : "angularts.ui.bootstrap",
    },
    external: [
        "angular",
        "angularts.core",
        "angularts.ui.bootstrap"
    ],
    plugins: [
        sourcemaps(),
        commonjs({
            exlude: [
                "../../node_modules/**"
            ]
        })
    ]
};