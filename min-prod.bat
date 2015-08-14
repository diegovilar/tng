@echo off
set OLD_CD=%cd%
set PROJECT_PATH=%~dp0
set ROOT=%~dp0

if [%1] NEQ [] (
    set ROOT=%1
)

cd %PROJECT_PATH%

uglifyjs -cm --screw-ie8 --source-map build\prod\tng.min.js.map --in-source-map build\prod\tng.js.map -o build\prod\tng.min.js build\prod\tng.js

cd %OLD_CD%
