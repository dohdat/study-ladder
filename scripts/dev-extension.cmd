@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-reload-extension.ps1" %*
