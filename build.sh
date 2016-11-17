#!/usr/bin/env bash

OLD_PATH=`pwd`
PROJECT_PATH=`dirname $0`

PACKAGES=(core
  angularts
  angularts.core
  angularts.ui.bootstrap
  angularts.ui.router)

TSC=`pwd`/node_modules/.bin/tsc
ROLLUP=`pwd`/node_modules/.bin/rollup
UGLIFYJS=`pwd`/node_modules/.bin/uglifyjs

cd $PROJECT_PATH

echo "Cleaning..."
rm -rf ./build/*
mkdir -p ./build

# for PACKAGE in ${PACKAGES[@]}
# do
#     PWD=`pwd`
#     SRCDIR=${PWD}/src/@angular/${PACKAGE}
#     DESTDIR=${PWD}/dist/packages-dist/${PACKAGE}
#     UMD_ES5_PATH=${DESTDIR}/bundles/${PACKAGE}.umd.js
#     UMD_TESTING_ES5_PATH=${DESTDIR}/bundles/${PACKAGE}-testing.umd.js
#     UMD_STATIC_ES5_PATH=${DESTDIR}/bundles/${PACKAGE}-static.umd.js
#     UMD_ES5_MIN_PATH=${DESTDIR}/bundles/${PACKAGE}.umd.min.js
#     UMD_STATIC_ES5_MIN_PATH=${DESTDIR}/bundles/${PACKAGE}-static.umd.min.js
#     LICENSE_BANNER=${PWD}/modules/@angular/license-banner.txt
# done