@echo off
title Pushing CleanFlow to GitHub...
cd /d "%~dp0"

echo ===================================================
echo Pushing your code to https://github.com/shalawwahid/to-doapp
echo ===================================================
echo.

git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo SUCCESS! Your project has been pushed to GitHub.
    echo Check it out at: https://github.com/shalawwahid/to-doapp
    echo ===================================================
) else (
    echo.
    echo If you were asked to sign in, please complete the sign-in and run this script again.
)

echo.
pause
