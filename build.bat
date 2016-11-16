@echo off
setlocal
set PATH=%PATH%;.\node_modules\.bin

set BUNDLE_PATH=build\bundles

echo Cleaning...
call del-cli build/*
if errorlevel 1 goto failed

echo Transpiling...
call tsc -p . --outDir build
if errorlevel 1 goto failed

echo Rolling up...
call rollup -c rollup.index.js
if errorlevel 1 goto failed

REM FIX source paths on maps

echo Minifying...
call uglifyjs -c -m --screw-ie8 --keep-fnames --comments --in-source-map %BUNDLE_PATH%\index.js.map --source-map %BUNDLE_PATH%\index.min.js.map --output %BUNDLE_PATH%\index.min.js --source-map-url index.min.js.map %BUNDLE_PATH%\index.js
if errorlevel 1 goto failed

:done
echo Done!
goto end

:failed
echo Operation did not complete!

:end
endlocal