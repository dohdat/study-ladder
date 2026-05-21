@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0open-extension.ps1" -ChromePath "%LOCALAPPDATA%\Chromium\Application\chrome.exe" -ProfileDir "%LOCALAPPDATA%\codex-chrome-profile" -RemoteDebuggingPort 9222 %*
