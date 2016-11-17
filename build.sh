#!/usr/bin/env bash

PACKAGES=(
    core
    ui.bootstrap
    ui.router
    all)

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

for ARG in "$@"; do
  case "$ARG" in
    --packages=*)
      PACKAGES_STR=${ARG#--packages=}
      PACKAGES=( ${PACKAGES_STR//,/ } )
      BUILD_ALL=false
      ;;
    --bundle=*)
      BUNDLE=( "${ARG#--bundle=}" )
      ;;
    *)
      echo "Unknown option $ARG."
      exitWithError
      ;;
  esac
done

mkdir -p ${DEST_ROOT} || { exitWithError; }

for PACKAGE in ${PACKAGES[@]}
do
    if [ "${PACKAGE}" == "all" ]; then
        PACKAGE=angularts
        SRC_PATH=${SRC_ROOT}/all
        DEST_PATH=${DEST_ROOT}/${PACKAGE}
        BUNDLE_PATH=${DEST_PATH}/bundles
    else
        SRC_PATH=${SRC_ROOT}/${PACKAGE}
        DEST_PATH=${DEST_ROOT}/angularts.${PACKAGE}
        BUNDLE_PATH=${DEST_PATH}/bundles
    fi

    TSCONFIG=$SRC_PATH/tsconfig.build.json
    ROLLUPCONFIG=$SRC_PATH/rollup.build.js

    echo
    echo "Building package \"${PACKAGE}\" from ${SRC_PATH}:"

    echo
    echo "Cleaning ${DEST_PATH}..."
    rm -rf ${DEST_PATH} || { exitWithError; }

    echo
    echo "Transpiling to ${DEST_PATH}..."
    echo "Config: ${TSCONFIG}"
    $TSC -p $TSCONFIG --outDir $DEST_PATH || { exitWithError; }

    echo
    echo "Rolling up to ${BUNDLE_PATH}..."
    echo "Config: ${ROLLUPCONFIG}"
    cd $SRC_PATH || { exitWithError; }
    $ROLLUP -c $ROLLUPCONFIG || { exitWithError; }

    echo
    echo "Minifying from ${BUNDLE_PATH}..."
    UGLIFYJS -c -m --screw-ie8 --keep-fnames --comments --in-source-map ${BUNDLE_PATH}/index.js.map --source-map ${BUNDLE_PATH}/index.min.js.map --output ${BUNDLE_PATH}/index.min.js --source-map-url index.min.js.map ${BUNDLE_PATH}/index.js || { exitWithError; }
done

cd $OLD_PATH
echo
echo "Done!"