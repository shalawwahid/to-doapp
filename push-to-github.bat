@echo off
title Pushing CleanFlow to GitHub...
cd /d "%~dp0"

echo ===================================================
echo Staging all new and modified files...
echo ===================================================
git add .
git commit -m "Update CleanFlow with Daily Schedule, Monthly Tracker & Progression" >nul 2>&1

echo.
echo ===================================================
echo Pushing your code to https://github.com/shalawwahid/to-doapp
echo ===================================================
echo.

git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo SUCCESS! All your files have been pushed to GitHub.
    echo Check it out at: https://github.com/shalawwahid/to-doapp
    echo ===================================================
) else (
    echo.
    echo If you were asked to sign in, please complete the sign-in in your browser and run this script again.
)

echo.
pause
