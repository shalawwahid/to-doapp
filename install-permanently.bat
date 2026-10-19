@echo off
title Installing CleanFlow To-Do Permanently...
echo Setting up CleanFlow To-Do to start automatically with Windows and creating desktop shortcut...
powershell -ExecutionPolicy Bypass -File "%~dp0setup-permanence.ps1"
echo.
echo ========================================================
echo Done! CleanFlow is now installed.
echo You can launch it anytime from the desktop shortcut:
echo "CleanFlow Tasks"
echo ========================================================
pause
