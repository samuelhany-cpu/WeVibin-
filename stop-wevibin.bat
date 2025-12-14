@echo off
echo ========================================
echo    Stopping WeVibin'
echo ========================================
echo.

echo Killing Electron processes...
taskkill /F /IM electron.exe 2>nul
if %errorlevel% equ 0 (
    echo - Electron stopped
) else (
    echo - No Electron processes running
)

echo Killing Node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo - Node processes stopped
) else (
    echo - No Node processes running
)

echo.
echo All WeVibin' processes stopped!
echo.
pause
