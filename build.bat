@echo off
setlocal
set PATH=%PATH%;.\node_modules\.bin

set BUNDLE_PATH=build\bundles

echo Cleaning...
call del-cli build/*

echo Transpiling...
call tsc -p . --outDir build

echo Rolling up...
call rollup -c rollup.index.js

echo Minifying...
call uglifyjs -c -m --screw-ie8 --keep-fnames --comments --in-source-map %BUNDLE_PATH%\index.umd.js.map --source-map %BUNDLE_PATH%\index.umd.min.js.map --output %BUNDLE_PATH%\index.umd.min.js %BUNDLE_PATH%\index.umd.js

echo Done!
endlocal