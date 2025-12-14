@echo off
REM Simple quick start - assumes everything is already built
cd /d "%~dp0"

echo Starting WeVibin' (Quick Mode)...
echo.

REM Start server
cd server
start "WeVibin Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM Detect IP and start client
cd ..\client
call node detect-ip.js

REM Start Vite
start "WeVibin Vite" cmd /k "npx vite"
timeout /t 5 /nobreak >nul

REM Start Electron
start "WeVibin App" cmd /k "npx cross-env NODE_ENV=development electron ."

echo.
echo WeVibin' started in 3 windows!
pause
