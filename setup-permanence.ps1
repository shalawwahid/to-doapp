# CleanFlow Permanence & Installation Script
$appDir = $PSScriptRoot
$vbsPath = Join-Path $appDir "start-server-hidden.vbs"
$iconPath = Join-Path $appDir "public\icons\app.ico"
$wsh = New-Object -ComObject WScript.Shell

# 1. Add to Windows Startup (auto-runs invisibly whenever user turns on PC)
$startupFolder = [Environment]::GetFolderPath('Startup')
$startupShortcutPath = Join-Path $startupFolder "CleanFlow-Background.lnk"

$startupShortcut = $wsh.CreateShortcut($startupShortcutPath)
$startupShortcut.TargetPath = "wscript.exe"
$startupShortcut.Arguments = "`"$vbsPath`""
$startupShortcut.WorkingDirectory = $appDir
$startupShortcut.Description = "Starts CleanFlow To-Do Server silently in background"
if (Test-Path $iconPath) {
    $startupShortcut.IconLocation = "$iconPath, 0"
}
$startupShortcut.Save()
Write-Host "[OK] Added to Windows Startup: $startupShortcutPath"

# 2. Find Edge or Chrome for Desktop App shortcut
$browserPath = ""
$possibleBrowsers = @(
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles (x86)\Google\Chrome\Application\chrome.exe"
)

foreach ($b in $possibleBrowsers) {
    if (Test-Path $b) {
        $browserPath = $b
        break
    }
}

# 3. Create Desktop shortcut
$desktopFolder = [Environment]::GetFolderPath('Desktop')
$desktopShortcutPath = Join-Path $desktopFolder "CleanFlow Tasks.lnk"
$desktopShortcut = $wsh.CreateShortcut($desktopShortcutPath)

if ($browserPath) {
    $desktopShortcut.TargetPath = $browserPath
    $desktopShortcut.Arguments = "--app=http://localhost:3000"
} else {
    $desktopShortcut.TargetPath = "http://localhost:3000"
}

$desktopShortcut.WorkingDirectory = $appDir
$desktopShortcut.Description = "Open CleanFlow Tasks"
if (Test-Path $iconPath) {
    $desktopShortcut.IconLocation = "$iconPath, 0"
}
$desktopShortcut.Save()
Write-Host "[OK] Created Desktop App Shortcut: $desktopShortcutPath"

# 4. Check if server is running
try {
    $res = Invoke-RestMethod -Uri "http://localhost:3000/api/todos" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] Server is already running and active at http://localhost:3000"
} catch {
    Write-Host "[*] Launching server in background..."
    Start-Process "wscript.exe" -ArgumentList "`"$vbsPath`"" -WorkingDirectory $appDir
    Start-Sleep -Seconds 2
    Write-Host "[OK] Server started silently in background."
}

Write-Host "`nAll set! CleanFlow is permanently installed and set to auto-start with Windows."
