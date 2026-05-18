param(
  [string]$ExtensionId = $env:STUDY_LADDER_EXTENSION_ID,
  [string]$ExtensionUrl = "",
  [string]$OpenUrl = $(if ($env:STUDY_LADDER_EXTENSION_URL) { $env:STUDY_LADDER_EXTENSION_URL } else { "" }),
  [string]$ProfileDir = $(if ($env:CHROME_USER_DATA_DIR) { $env:CHROME_USER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data" }),
  [string]$ProfileName = $(if ($env:CHROME_PROFILE_NAME) { $env:CHROME_PROFILE_NAME } else { "Default" }),
  [string]$ChromePath = $(if ($env:CHROME_PATH) { $env:CHROME_PATH } else { "" })
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$viteCmd = Join-Path $repoRoot.Path "node_modules\.bin\vite.cmd"
if (-not (Test-Path -LiteralPath $viteCmd)) {
  throw "Missing Vite CLI at $viteCmd. Run npm install first."
}

$monacoTarget = Join-Path $repoRoot.Path "public\monaco\vs"
if (-not (Test-Path -LiteralPath $monacoTarget)) {
  Push-Location $repoRoot.Path
  try {
    node scripts\copy-monaco.mjs
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  } finally {
    Pop-Location
  }
}

$previousAutoReload = $env:STUDY_LADDER_EXTENSION_AUTO_RELOAD
$previousExtensionId = $env:STUDY_LADDER_EXTENSION_ID
$previousExtensionUrl = $env:STUDY_LADDER_EXTENSION_URL
$previousOpenUrl = $env:STUDY_LADDER_EXTENSION_OPEN_URL
$previousProfileDir = $env:CHROME_USER_DATA_DIR
$previousProfileName = $env:CHROME_PROFILE_NAME
$previousChromePath = $env:CHROME_PATH

$env:STUDY_LADDER_EXTENSION_AUTO_RELOAD = "1"
if ($ExtensionId) {
  $env:STUDY_LADDER_EXTENSION_ID = $ExtensionId
}
if ($ExtensionUrl) {
  $env:STUDY_LADDER_EXTENSION_URL = $ExtensionUrl
}
if ($OpenUrl) {
  $env:STUDY_LADDER_EXTENSION_OPEN_URL = $OpenUrl
}
if ($ProfileDir) {
  $env:CHROME_USER_DATA_DIR = $ProfileDir
}
if ($ProfileName) {
  $env:CHROME_PROFILE_NAME = $ProfileName
}
if ($ChromePath) {
  $env:CHROME_PATH = $ChromePath
}

Push-Location $repoRoot.Path
try {
  & $viteCmd build --watch --clearScreen false
  exit $LASTEXITCODE
} finally {
  Pop-Location
  $env:STUDY_LADDER_EXTENSION_AUTO_RELOAD = $previousAutoReload
  $env:STUDY_LADDER_EXTENSION_ID = $previousExtensionId
  $env:STUDY_LADDER_EXTENSION_URL = $previousExtensionUrl
  $env:STUDY_LADDER_EXTENSION_OPEN_URL = $previousOpenUrl
  $env:CHROME_USER_DATA_DIR = $previousProfileDir
  $env:CHROME_PROFILE_NAME = $previousProfileName
  $env:CHROME_PATH = $previousChromePath
}
