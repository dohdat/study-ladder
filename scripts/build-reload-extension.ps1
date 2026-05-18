param(
  [string]$ExtensionId = $env:STUDY_LADDER_EXTENSION_ID,
  [string]$ExtensionUrl = "",
  [string]$OpenUrl = $(if ($env:STUDY_LADDER_EXTENSION_URL) { $env:STUDY_LADDER_EXTENSION_URL } else { "" }),
  [string]$ProfileDir = $(if ($env:CHROME_USER_DATA_DIR) { $env:CHROME_USER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data" }),
  [string]$ProfileName = $(if ($env:CHROME_PROFILE_NAME) { $env:CHROME_PROFILE_NAME } else { "Default" }),
  [string]$ChromePath = $(if ($env:CHROME_PATH) { $env:CHROME_PATH } else { "" }),
  [switch]$FullBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$buildExitCode = 0

Push-Location $repoRoot.Path
try {
  if ($FullBuild) {
    npm.cmd run build
    $buildExitCode = $LASTEXITCODE
  } else {
    $monacoTarget = Join-Path $repoRoot.Path "public\monaco\vs"
    if (-not (Test-Path -LiteralPath $monacoTarget)) {
      node scripts\copy-monaco.mjs
      $buildExitCode = $LASTEXITCODE
      if ($buildExitCode -ne 0) {
        exit $buildExitCode
      }
    }

    $viteCmd = Join-Path $repoRoot.Path "node_modules\.bin\vite.cmd"
    if (-not (Test-Path -LiteralPath $viteCmd)) {
      throw "Missing Vite CLI at $viteCmd. Run npm install first."
    }

    & $viteCmd build
    $buildExitCode = $LASTEXITCODE
  }
} finally {
  Pop-Location
}

if ($buildExitCode -ne 0) {
  exit $buildExitCode
}

$reloadArgs = @{}
if ($ExtensionId) {
  $reloadArgs.ExtensionId = $ExtensionId
}
if ($ExtensionUrl) {
  $reloadArgs.ExtensionUrl = $ExtensionUrl
}
$reloadArgs.OpenUrl = $OpenUrl
if ($ProfileDir) {
  $reloadArgs.ProfileDir = $ProfileDir
}
if ($ProfileName) {
  $reloadArgs.ProfileName = $ProfileName
}
if ($ChromePath) {
  $reloadArgs.ChromePath = $ChromePath
}

& (Join-Path $PSScriptRoot "reload-extension.ps1") @reloadArgs
