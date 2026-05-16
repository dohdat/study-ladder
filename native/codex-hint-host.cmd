@echo off
setlocal
set "NODE_EXE=C:\nvm4w\nodejs\node.exe"
if exist "%NODE_EXE%" (
  "%NODE_EXE%" "%~dp0codex-hint-host.mjs"
) else (
  node "%~dp0codex-hint-host.mjs"
)
