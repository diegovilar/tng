let pak = require("../../package.json");
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "rollup-plugin-commonjs";

let banner = `/**
 * @preserve
 * AngularTS (UI Bootstrap) - ${pak.description}
 * Version: ${pak.version} (built on ${(new Date()).toUTCString()})
 * Project: ${pak.homepage}
 * Author:  ${pak.author}
 * License: ${pak.license}
 */`;

export default {
    banner,
    entry: "../../build/angularts.ui.bootstrap/index.js",
    dest:  "../../build/angularts.ui.bootstrap/bundles/index.js",
    format: "umd",
    moduleName: "angularts.ui.bootstrap",
    exports: "named",
    sourceMap: true,
    globals: {
        angular: "angular",
        "angularts.core" : "angularts.core"
    },
    external: [
        "angular",
        "angularts.core"
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