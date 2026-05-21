param(
  [string]$ExtensionId = $env:STUDY_LADDER_EXTENSION_ID,
  [string]$ProfileDir = $(if ($env:CHROME_USER_DATA_DIR) { $env:CHROME_USER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data" }),
  [string]$ProfileName = $(if ($env:CHROME_PROFILE_NAME) { $env:CHROME_PROFILE_NAME } else { "Default" }),
  [string]$ChromePath = $(if ($env:CHROME_PATH) { $env:CHROME_PATH } else { "" }),
  [int]$RemoteDebuggingPort = $(if ($env:CHROME_REMOTE_DEBUGGING_PORT) { [int]$env:CHROME_REMOTE_DEBUGGING_PORT } else { 0 }),
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$BlockedLegacyExtensionIds = @("mckniaaigcphmilhcpcpanfipcaoainb")

function Get-NormalizedPath {
  param([string]$Path)

  if (-not $Path) {
    return ""
  }

  try {
    return [System.IO.Path]::GetFullPath($Path).TrimEnd("\")
  } catch {
    return $Path.TrimEnd("\")
  }
}

function Get-ObjectPropertyValue {
  param(
    [object]$Object,
    [string]$Name
  )

  if (-not $Object) {
    return $null
  }

  $property = $Object.PSObject.Properties[$Name]
  if (-not $property) {
    return $null
  }

  return $property.Value
}

function Resolve-ChromePath {
  param([string]$Path)

  if ($Path -and (Test-Path -LiteralPath $Path)) {
    return $Path
  }

  $candidatePaths = @(
    (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe"),
    (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe")
  )

  foreach ($candidatePath in $candidatePaths) {
    if ($candidatePath -and (Test-Path -LiteralPath $candidatePath)) {
      return $candidatePath
    }
  }

  $chromeCommand = Get-Command "chrome.exe" -ErrorAction SilentlyContinue
  if ($chromeCommand) {
    return $chromeCommand.Source
  }

  throw "Google Chrome was not found. Pass -ChromePath or set CHROME_PATH."
}

function Test-ExtensionSettingsEnabled {
  param([object]$Settings)

  $disableReasons = Get-ObjectPropertyValue -Object $Settings -Name "disable_reasons"
  if ($disableReasons -and @($disableReasons).Count -gt 0) {
    return $false
  }

  $state = Get-ObjectPropertyValue -Object $Settings -Name "state"
  if ($null -ne $state -and $state -eq 0) {
    return $false
  }

  return $true
}

function Find-UnpackedExtensionId {
  param(
    [string]$PreferencesPath,
    [string]$ExpectedExtensionPath
  )

  if (-not (Test-Path -LiteralPath $PreferencesPath)) {
    return ""
  }

  $preferences = Get-Content -LiteralPath $PreferencesPath -Raw | ConvertFrom-Json
  $extensions = Get-ObjectPropertyValue -Object $preferences -Name "extensions"
  $settings = Get-ObjectPropertyValue -Object $extensions -Name "settings"
  if (-not $settings) {
    return ""
  }

  $expectedPath = Get-NormalizedPath $ExpectedExtensionPath
  $pathMatches = @()

  foreach ($extension in $settings.PSObject.Properties) {
    $extensionPath = Get-NormalizedPath (Get-ObjectPropertyValue -Object $extension.Value -Name "path")
    if ($extensionPath -and ($extensionPath -ieq $expectedPath) -and $BlockedLegacyExtensionIds -notcontains $extension.Name -and (Test-ExtensionSettingsEnabled -Settings $extension.Value)) {
      $pathMatches += $extension
    }
  }

  if ($pathMatches.Count -gt 0) {
    return $pathMatches[0].Name
  }

  return ""
}

function Resolve-ExtensionId {
  param(
    [string]$ProfilePath,
    [string]$ExpectedExtensionPath
  )

  foreach ($fileName in @("Preferences", "Secure Preferences")) {
    $candidate = Find-UnpackedExtensionId -PreferencesPath (Join-Path $ProfilePath $fileName) -ExpectedExtensionPath $ExpectedExtensionPath
    if ($candidate) {
      return $candidate
    }
  }

  return ""
}

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$ChromePath = Resolve-ChromePath -Path $ChromePath
$profilePath = Join-Path $ProfileDir $ProfileName
if (-not $ExtensionId) {
  $ExtensionId = Resolve-ExtensionId -ProfilePath $profilePath -ExpectedExtensionPath $repoRoot.Path
}

$openUrl = $(if ($ExtensionId) { "chrome-extension://$ExtensionId/pages/index.html" } else { "chrome://extensions" })
$chromeProcesses = @(Get-CimInstance Win32_Process -Filter "name = 'chrome.exe'" -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -notmatch "--type=" -and (
    $_.CommandLine -match [regex]::Escape($ProfileDir) -or
    ($RemoteDebuggingPort -gt 0 -and $_.CommandLine -match "remote-debugging-port=$RemoteDebuggingPort")
  )
})

if ($chromeProcesses.Count -gt 0) {
  Write-Warning "Chrome is already running. If Study Ladder does not open, close every Chrome window, wait for chrome.exe to exit, then rerun this script so --load-extension can apply at startup."
  $arguments = @(
    "--user-data-dir=`"$ProfileDir`"",
    "--profile-directory=`"$ProfileName`"",
    $openUrl
  )
} else {
  $arguments = @(
    "--user-data-dir=`"$ProfileDir`"",
    "--profile-directory=`"$ProfileName`"",
    "--load-extension=`"$($repoRoot.Path)`"",
    $(if ($ExtensionId) { $openUrl } else { "chrome://extensions" })
  )
}
if ($RemoteDebuggingPort -gt 0) {
  $arguments = @("--remote-debugging-port=$RemoteDebuggingPort") + $arguments
}

if ($DryRun) {
  Write-Output "Chrome: $ChromePath"
  Write-Output "Profile store: $profilePath"
  Write-Output "Profile: $ProfileName"
  Write-Output "Extension root: $($repoRoot.Path)"
  Write-Output "Extension ID: $(if ($ExtensionId) { $ExtensionId } else { '<not found yet>' })"
  Write-Output "Open URL: $openUrl"
  Write-Output "Remote debugging port: $(if ($RemoteDebuggingPort -gt 0) { $RemoteDebuggingPort } else { '<off>' })"
  Write-Output "Chrome running: $($chromeProcesses.Count -gt 0)"
  Write-Output "Arguments: $($arguments -join ' ')"
  exit 0
}

Start-Process -FilePath $ChromePath -ArgumentList $arguments
Write-Output "Opened $openUrl"
