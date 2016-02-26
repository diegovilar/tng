@echo off

set _OLD_CD=%cd%
set _PROJECT_PATH=%~dp0

cd %_PROJECT_PATH%

call gulp dev.build
call gulp prod.build
call min-prod.bat

cd %_OLD_CD%

:: Pausa se tiver sido aberto com clique duplo
echo %cmdcmdline% | find /i "%~0" >nul
echo.
if not errorlevel 1 pause
