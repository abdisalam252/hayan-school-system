@echo off
TITLE Hayan School System Launcher

echo =======================================================
echo    HAYAN SCHOOL SYSTEM - STARTING...
echo =======================================================

echo.
echo [1/3] Starting Backend Server...
cd backend
start "Hayan Backend" /min npm run dev
cd ..

echo [2/3] Starting Frontend Interface...
cd frontend
start "Hayan Frontend" /min npm run dev
cd ..

echo.
echo [3/3] Waiting for system to warm up (5 seconds)...
timeout /t 5 >nul

echo.
echo Opening the Application in your Browser...
echo Opening the Application in your Browser...
start http://localhost:5173

echo.
echo =======================================================
echo    SYSTEM IS RUNNING!
echo    You can minimize or close this launcher window.
echo    Do NOT close the other two black windows.
echo =======================================================
pause
