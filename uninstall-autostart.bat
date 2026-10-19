@echo off
title Uninstalling CleanFlow Autostart...
echo Removing CleanFlow from Windows Startup and Desktop...

powershell -Command "
$startupFolder = [Environment]::GetFolderPath('Startup')
$startupFile = Join-Path $startupFolder 'CleanFlow-Background.lnk'
if (Test-Path $startupFile) { Remove-Item $startupFile -Force; Write-Host '[OK] Removed from Windows Startup' }

$desktopFolder = [Environment]::GetFolderPath('Desktop')
$desktopFile = Join-Path $desktopFolder 'CleanFlow Tasks.lnk'
if (Test-Path $desktopFile) { Remove-Item $desktopFile -Force; Write-Host '[OK] Removed Desktop Shortcut' }
"

echo.
echo CleanFlow autostart has been removed.
pause
