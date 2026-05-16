param(
  [string]$ExtensionId = $env:STUDY_LADDER_EXTENSION_ID,
  [string]$ExtensionUrl = "",
  [string]$OpenUrl = $(if ($env:STUDY_LADDER_EXTENSION_URL) { $env:STUDY_LADDER_EXTENSION_URL } else { "" }),
  [string]$ProfileDir = $(if ($env:CHROME_USER_DATA_DIR) { $env:CHROME_USER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data" }),
  [string]$ProfileName = $(if ($env:CHROME_PROFILE_NAME) { $env:CHROME_PROFILE_NAME } else { "Default" }),
  [string]$ChromePath = $(if ($env:CHROME_PATH) { $env:CHROME_PATH } else { "" }),
  [int]$ReopenDelayMilliseconds = 1200,
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-ExtensionIdFromUrl {
  param([string]$Url)

  if ($Url -match "^chrome-extension://([a-p]{32})/") {
    return $Matches[1]
  }

  return ""
}

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

function Test-ExtensionPageUrl {
  param(
    [string]$Url,
    [string]$ExpectedExtensionId
  )

  return $Url -match "^chrome-extension://$ExpectedExtensionId/"
}

function Test-ReloadPageUrl {
  param([string]$Url)

  return $Url -match "^chrome-extension://[a-p]{32}/reload\.html(?:[?#].*)?$"
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

  foreach ($extension in $settings.PSObject.Properties) {
    $extensionPath = Get-NormalizedPath (Get-ObjectPropertyValue -Object $extension.Value -Name "path")
    if ($extensionPath -and ($extensionPath -ieq $expectedPath)) {
      return $extension.Name
    }
  }

  foreach ($extension in $settings.PSObject.Properties) {
    $manifest = Get-ObjectPropertyValue -Object $extension.Value -Name "manifest"
    $name = Get-ObjectPropertyValue -Object $manifest -Name "name"
    if ($name -eq "Study Ladder") {
      return $extension.Name
    }
  }

  return ""
}

if (-not $ExtensionId -and $ExtensionUrl) {
  $ExtensionId = Get-ExtensionIdFromUrl $ExtensionUrl
}

$extensionRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$profilePath = Join-Path $ProfileDir $ProfileName

if (-not $ExtensionId) {
  $preferencesPath = Join-Path $profilePath "Preferences"
  $ExtensionId = Find-UnpackedExtensionId -PreferencesPath $preferencesPath -ExpectedExtensionPath $extensionRoot.Path
}

if (-not $ExtensionId) {
  $securePreferencesPath = Join-Path $profilePath "Secure Preferences"
  $ExtensionId = Find-UnpackedExtensionId -PreferencesPath $securePreferencesPath -ExpectedExtensionPath $extensionRoot.Path
}

if (-not $ExtensionId) {
  throw "Could not determine the Study Ladder extension ID. Pass -ExtensionUrl, pass -ExtensionId, or set STUDY_LADDER_EXTENSION_ID."
}

$ChromePath = Resolve-ChromePath -Path $ChromePath

$reloadUrl = "chrome-extension://$ExtensionId/reload.html"
$defaultOpenUrl = "chrome-extension://$ExtensionId/out/index.html"
if (-not $OpenUrl -and $ExtensionUrl -and (Test-ExtensionPageUrl -Url $ExtensionUrl -ExpectedExtensionId $ExtensionId) -and -not (Test-ReloadPageUrl -Url $ExtensionUrl)) {
  $OpenUrl = $ExtensionUrl
}
if (-not $OpenUrl) {
  $OpenUrl = $defaultOpenUrl
}
if (-not (Test-ExtensionPageUrl -Url $OpenUrl -ExpectedExtensionId $ExtensionId)) {
  throw "OpenUrl must point to the same extension ID as the reload target."
}

$arguments = @(
  "--profile-directory=`"$ProfileName`"",
  $reloadUrl
)
$openArguments = @(
  "--profile-directory=`"$ProfileName`"",
  $OpenUrl
)

if ($DryRun) {
  Write-Output "Chrome: $ChromePath"
  Write-Output "Profile store: $profilePath"
  Write-Output "Reload URL: $reloadUrl"
  Write-Output "Open URL: $OpenUrl"
  Write-Output "Reopen delay: $ReopenDelayMilliseconds ms"
  exit 0
}

Start-Process -FilePath $ChromePath -ArgumentList $arguments
Start-Sleep -Milliseconds $ReopenDelayMilliseconds
Start-Process -FilePath $ChromePath -ArgumentList $openArguments
Write-Output "Opened $reloadUrl then $OpenUrl"
