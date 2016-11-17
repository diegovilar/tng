let pak = require("../../package.json");
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "rollup-plugin-commonjs";

let banner = `/**
 * @preserve
 * AngularTS (Core) - ${pak.description}
 * Version: ${pak.version} (built on ${(new Date()).toUTCString()})
 * Project: ${pak.homepage}
 * Author:  ${pak.author}
 * License: ${pak.license}
 */`;

export default {
    banner,
    entry: "../../build/angularts.core/index.js",
    dest:  "../../build/angularts.core/bundles/index.js",
    format: "umd",
    moduleName: "angularts.core",
    exports: "named",
    sourceMap: true,
    globals: {
        angular: "angular"
    },
    external: [
        "angular"
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