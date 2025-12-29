@echo off
cd /d "%~dp0"
echo Killing any running Node.js processes...
taskkill /F /IM node.exe

echo.
echo Restarting Hayan School System...
start_hayan_system.bat
