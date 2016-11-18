import commonjs from "rollup-plugin-commonjs";
import sourcemaps from "rollup-plugin-sourcemaps";

const VERSION = require("../../package.json").version;
const PAK = require("./package.json");
const BUILD_PATH = "../../build/angularts.ui.router";

const BANNER = `/**
 * @preserve
 * ${PAK.name} - ${PAK.description}
 *
 * Version:  ${VERSION} (built on ${(new Date()).toUTCString()})
 * Homepage: ${PAK.homepage}
 * Author:   ${PAK.author}
 * License:  ${PAK.license}
 */`;

export default {
    banner : BANNER,
    entry: `${BUILD_PATH}/src/index.js`,
    targets: [
        { dest: `${BUILD_PATH}/bundles/index.umd.js`, format: "umd" },
        { dest: `${BUILD_PATH}/bundles/index.amd.js`, format: "amd" },
        { dest: `${BUILD_PATH}/bundles/index.iife.js`, format: "iife" },
        { dest: `${BUILD_PATH}/bundles/index.cjs.js`, format: "cjs" }
    ],
    moduleName: PAK.name,
    exports: "named",
    sourceMap: true,
    globals: {
        angular: "angular",
        "angularts.core": "angularts.core",
        "angularts.ui.bootstrap": "angularts.ui.bootstrap",
    },
    external: [
        "angular",
        "angularts.core",
        "angularts.ui.bootstrap",
    ],
    plugins: [
        sourcemaps(),
        commonjs(),
    ]
};