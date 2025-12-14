@echo off
echo ========================================
echo    WeVibin' - Automatic Startup
echo ========================================
echo.

REM Change to the script's directory
cd /d "%~dp0"

echo [1/6] Checking if ports are available...
netstat -ano | findstr ":3001" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 is already in use!
    echo Trying to kill process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /F /PID %%a 2>nul
    timeout /t 2 /nobreak >nul
)

netstat -ano | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 5173 is already in use!
    echo Trying to kill process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do taskkill /F /PID %%a 2>nul
    timeout /t 2 /nobreak >nul
)

echo [2/6] Detecting local IP address...
cd client
call node detect-ip.js
if %errorlevel% neq 0 (
    echo ERROR: IP detection failed!
    pause
    exit /b 1
)
echo.

echo [3/6] Building client TypeScript files...
call npm run build:main
if %errorlevel% neq 0 (
    echo ERROR: Main build failed!
    pause
    exit /b 1
)

call npm run build:preload
if %errorlevel% neq 0 (
    echo ERROR: Preload build failed!
    pause
    exit /b 1
)
echo.

echo [4/6] Starting server...
cd ..\server
start "WeVibin Server" cmd /k "npm run dev"
echo Waiting for server to start...
timeout /t 3 /nobreak >nul
echo.

echo [5/6] Starting Vite dev server...
cd ..\client
start "WeVibin Vite" cmd /k "npx vite --clearScreen false"
echo Waiting for Vite to start...
timeout /t 5 /nobreak >nul
echo.

echo [6/6] Starting Electron app...
start "WeVibin App" cmd /k "npx cross-env NODE_ENV=development electron ."
echo.

echo ========================================
echo    WeVibin' is starting!
echo ========================================
echo.
echo Three windows opened:
echo  1. Server (port 3001)
echo  2. Vite Dev Server (port 5173)
echo  3. Electron App
echo.
echo Close those windows to stop the app.
echo.
pause
