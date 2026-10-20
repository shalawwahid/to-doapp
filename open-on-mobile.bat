@echo off
title CleanFlow Mobile Link
cls
echo ======================================================================
echo          CleanFlow — Mobile Access (No Credit Card Needed)
echo ======================================================================
echo.
echo   1. Local Wi-Fi Link (Same Wi-Fi)
echo      URL: http://10.119.225.106:3000
echo.
echo   2. Start Free Secure HTTPS Link (For Installing on Phone Screen)
echo.
echo ======================================================================
set /p choice="Enter 1 or 2 (or press Enter for HTTPS): "

if "%choice%"=="1" (
    cls
    echo ======================================================================
    echo  Local Wi-Fi Link:
    echo        http://10.119.225.106:3000
    echo ======================================================================
    echo  - Android: In Chrome, tap 3 dots -^> "Add to Home screen"
    echo  - iPhone:  In Safari, tap Share  -^> "Add to Home Screen"
    echo ======================================================================
    pause
    exit /b
)

cls
echo ======================================================================
echo  Starting Secure HTTPS Tunnel for Mobile App Installation...
echo ======================================================================
echo.
echo  Your tunnel password if prompted: 130.193.250.106
echo.
npx localtunnel --port 3000
pause
