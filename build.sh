#!/usr/bin/env bash

PACKAGES=(core
    ui.bootstrap
    ui.router)

function exitWithError() {
    echo
    echo "The build was interrupeted!"
    read -p "Press [Enter] key to continue..."
    exit 1
}

set -e -o pipefail

OLD_PATH=`pwd`
PROJECT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $PROJECT_PATH || { exitWithError; }

SRC_ROOT=${PROJECT_PATH}/src
DEST_ROOT=${PROJECT_PATH}/build
TSC=${PROJECT_PATH}/node_modules/.bin/tsc
ROLLUP=${PROJECT_PATH}/node_modules/.bin/rollup
UGLIFYJS=${PROJECT_PATH}/node_modules/.bin/uglifyjs
FIXMAPS=${PROJECT_PATH}/build-helpers/fix-maps.js
VERSION=`node -e "console.log(require('./package.json').version)"`

for ARG in "$@"; do
  case "$ARG" in
    --packages=*)
      PACKAGES_STR=${ARG#--packages=}
      PACKAGES=( ${PACKAGES_STR//,/ } )
      ;;
    *)
      echo "Unknown option $ARG."
      exitWithError
      ;;
  esac
done

echo
echo "Building version ${VERSION}"

# Cleaning old builds
for PACKAGE in ${PACKAGES[@]}
do
    DEST_PATH=${DEST_ROOT}/angularts.${PACKAGE}
    echo
    echo "Cleaning old build at ${DEST_PATH}..."
    rm -rf ${DEST_PATH}/* || { exitWithError; }
done

mkdir -p ${DEST_ROOT} || { exitWithError; }

BUNDLES=(umd
    amd
    cjs
    iife)

for PACKAGE in ${PACKAGES[@]}
do
    SRC_PATH=${SRC_ROOT}/${PACKAGE}
    DEST_PATH=${DEST_ROOT}/angularts.${PACKAGE}
    BUNDLE_PATH=${DEST_PATH}/bundles
    TSCONFIG=$SRC_PATH/tsconfig.build.json
    ROLLUPCONFIG=$SRC_PATH/rollup.build.js

    echo
    echo "Building package \"${PACKAGE}\" from ${SRC_PATH}:"

    echo
    echo "Transpiling to ${DEST_PATH}..."
    echo "Config: ${TSCONFIG}"
    $TSC -p $TSCONFIG --outDir $DEST_PATH/src || { exitWithError; }

    echo
    echo "Rolling up to ${BUNDLE_PATH}..."
    echo "Config: ${ROLLUPCONFIG}"
    cd $SRC_PATH || { exitWithError; }
    $ROLLUP -c $ROLLUPCONFIG || { exitWithError; }

    for BUNDLE in ${BUNDLES[@]}
    do
        INDEX=index.${BUNDLE}
        BUNDLE_TARGET=${BUNDLE_PATH}/${INDEX}
        echo
        echo "Minifying from ${BUNDLE_TARGET}.js..."
        $UGLIFYJS -c -m --screw-ie8 --keep-fnames --comments --in-source-map ${BUNDLE_TARGET}.js.map --source-map ${BUNDLE_TARGET}.min.js.map --output ${BUNDLE_TARGET}.min.js --source-map-url ${INDEX}.min.js.map ${BUNDLE_TARGET}.js || { exitWithError; }

        # fixing sourcemaps
        SOURCEMAPS=(${BUNDLE_TARGET}.js.map
            ${BUNDLE_TARGET}.min.js.map)
        echo
        for MAP in ${SOURCEMAPS[@]}
        do
            echo "Fixing sources paths in ${MAP}..."
            node $FIXMAPS $MAP || { exitWithError; }
        done
    done

    # Processing package.json
    PACKAGE_JSON=`cat ${SRC_PATH}/package.json` || { exitWithError; }
    PACKAGE_JSON="${PACKAGE_JSON//"0.0.0-PLACEHOLDER"/"$VERSION"}" || { exitWithError; }
    printf "$PACKAGE_JSON" > ${DEST_PATH}/package.json || { exitWithError; }
done

cd $OLD_PATH
echo
echo "Done!"