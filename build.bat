@echo off
setlocal

set OLD_PATH=%cd%
set PROJECT_PATH=%~dp0
set PATH=%PATH%;%PROJECT_PATH%\node_modules\.bin
set ROLLUP=%PROJECT_PATH%\node_modules\.bin\rollup.cmd
set TSC=%PROJECT_PATH%\node_modules\.bin\tsc.cmd
set UGLIFYJS=%PROJECT_PATH%\node_modules\.bin\uglifyjs.cmd
set SRC_ROOT=%PROJECT_PATH%\src
set DST_ROOT=%PROJECT_PATH%\build

cd %PROJECT_PATH%

echo Cleaning...
call del-cli build/*
if errorlevel 1 goto failed

echo [1/3] angularts:
SET SRC_PATH=%SRC_ROOT%\core
SET DEST_PATH=%DST_ROOT%\angularts.core
echo Transpiling...
call tsc -p %SRC_PATH% --outDir %DEST_PATH%
if errorlevel 1 goto failed
echo Rolling up...
cd %SRC_PATH%
call %ROLLUP% -c rollup.config.js
if errorlevel 1 goto failed
echo Minifying...
set BUNDLE_PATH=%DEST_PATH%\bundles
call uglifyjs -c -m --screw-ie8 --keep-fnames --comments --in-source-map %BUNDLE_PATH%\index.js.map --source-map %BUNDLE_PATH%\index.min.js.map --output %BUNDLE_PATH%\index.min.js --source-map-url index.min.js.map %BUNDLE_PATH%\index.js
if errorlevel 1 goto failed

REM TODO FIX source paths on maps


:done
echo Done!
goto end

:failed
echo Operation did not complete!

:end
cd %OLD_PATH%
endlocal