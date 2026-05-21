param(
  [string]$ExtensionId = $env:STUDY_LADDER_EXTENSION_ID,
  [string]$ExtensionUrl = "",
  [string]$OpenUrl = $(if ($env:STUDY_LADDER_EXTENSION_URL) { $env:STUDY_LADDER_EXTENSION_URL } else { "" }),
  [string]$ProfileDir = $(if ($env:CHROME_USER_DATA_DIR) { $env:CHROME_USER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data" }),
  [string]$ProfileName = $(if ($env:CHROME_PROFILE_NAME) { $env:CHROME_PROFILE_NAME } else { "Default" }),
  [string]$ChromePath = $(if ($env:CHROME_PATH) { $env:CHROME_PATH } else { "" }),
  [int]$ReopenDelayMilliseconds = 3000,
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$BlockedLegacyExtensionIds = @("mckniaaigcphmilhcpcpanfipcaoainb")

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

  return $Url -match "^chrome-extension://[a-p]{32}/pages/reload\.html(?:[?#].*)?$"
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
  $pathMatches = @()

  foreach ($extension in $settings.PSObject.Properties) {
    $extensionPath = Get-NormalizedPath (Get-ObjectPropertyValue -Object $extension.Value -Name "path")
    if ($extensionPath -and ($extensionPath -ieq $expectedPath)) {
      $pathMatches += $extension
    }
  }

  foreach ($extension in ($pathMatches | Where-Object { $BlockedLegacyExtensionIds -notcontains $_.Name })) {
    if (Test-ExtensionSettingsEnabled -Settings $extension.Value) {
      return $extension.Name
    }
  }
  if ($pathMatches.Count -gt 0 -and $ExtensionId) {
    return $pathMatches[0].Name
  }

  $nameMatches = @()
  foreach ($extension in $settings.PSObject.Properties) {
    $manifest = Get-ObjectPropertyValue -Object $extension.Value -Name "manifest"
    $name = Get-ObjectPropertyValue -Object $manifest -Name "name"
    if ($name -eq "Study Ladder") {
      $nameMatches += $extension
    }
  }

  foreach ($extension in ($nameMatches | Where-Object { $BlockedLegacyExtensionIds -notcontains $_.Name })) {
    if (Test-ExtensionSettingsEnabled -Settings $extension.Value) {
      return $extension.Name
    }
  }
  if ($nameMatches.Count -gt 0 -and $ExtensionId) {
    return $nameMatches[0].Name
  }

  return ""
}

function Get-InstalledExtensionInfo {
  param(
    [string[]]$PreferencesPaths,
    [string]$ExpectedExtensionId
  )

  foreach ($preferencesPath in $PreferencesPaths) {
    if (-not (Test-Path -LiteralPath $preferencesPath)) {
      continue
    }

    $preferences = Get-Content -LiteralPath $preferencesPath -Raw | ConvertFrom-Json
    $extensions = Get-ObjectPropertyValue -Object $preferences -Name "extensions"
    $settings = Get-ObjectPropertyValue -Object $extensions -Name "settings"
    if (-not $settings) {
      continue
    }

    $extension = $settings.PSObject.Properties[$ExpectedExtensionId]
    if ($extension) {
      return [pscustomobject]@{
        PreferencesPath = $preferencesPath
        Settings = $extension.Value
      }
    }
  }

  return $null
}

if (-not $ExtensionId -and $ExtensionUrl) {
  $ExtensionId = Get-ExtensionIdFromUrl $ExtensionUrl
}

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$extensionRoots = @($repoRoot)
$defaultExportRoot = Join-Path $repoRoot.Path "dist-unpacked"
if (Test-Path -LiteralPath $defaultExportRoot) {
  $extensionRoots += Resolve-Path -LiteralPath $defaultExportRoot
}
$profilePath = Join-Path $ProfileDir $ProfileName
$preferencesPaths = @(
  (Join-Path $profilePath "Preferences"),
  (Join-Path $profilePath "Secure Preferences")
)

if (-not $ExtensionId) {
  foreach ($candidateRoot in $extensionRoots) {
    $ExtensionId = Find-UnpackedExtensionId -PreferencesPath $preferencesPaths[0] -ExpectedExtensionPath $candidateRoot.Path
    if ($ExtensionId) {
      break
    }
  }
}

if (-not $ExtensionId) {
  foreach ($candidateRoot in $extensionRoots) {
    $ExtensionId = Find-UnpackedExtensionId -PreferencesPath $preferencesPaths[1] -ExpectedExtensionPath $candidateRoot.Path
    if ($ExtensionId) {
      break
    }
  }
}

if (-not $ExtensionId) {
  throw "Could not determine the Study Ladder extension ID. Pass -ExtensionUrl, pass -ExtensionId, or set STUDY_LADDER_EXTENSION_ID."
}

$installedExtension = Get-InstalledExtensionInfo -PreferencesPaths $preferencesPaths -ExpectedExtensionId $ExtensionId
if (-not $installedExtension) {
  throw "Chrome profile '$ProfileName' does not have Study Ladder saved under extension ID '$ExtensionId'. Open chrome://extensions, enable Developer mode, choose Load unpacked, and select '$($repoRoot.Path)' or '$defaultExportRoot'."
}

$installedPath = Get-NormalizedPath (Get-ObjectPropertyValue -Object $installedExtension.Settings -Name "path")
$expectedRootPaths = @($extensionRoots | ForEach-Object { Get-NormalizedPath $_.Path })
$generatedOutPaths = @($extensionRoots | ForEach-Object { Get-NormalizedPath (Join-Path $_.Path "out") })
if ($installedPath -and ($generatedOutPaths -contains $installedPath)) {
  throw "Study Ladder is loaded from '$installedPath'. Load '$($repoRoot.Path)' or '$defaultExportRoot' instead; generated out folders are recreated during builds and can disappear from Chrome after restart."
}
if ($installedPath -and ($expectedRootPaths -notcontains $installedPath)) {
  throw "Study Ladder extension ID '$ExtensionId' is saved from '$installedPath', but this repo expects '$($expectedRootPaths -join "' or '")'. Re-load the unpacked extension from the repo/export root or pass the matching -ProfileName/-ProfileDir."
}

$ChromePath = Resolve-ChromePath -Path $ChromePath

$reloadUrl = "chrome-extension://$ExtensionId/pages/reload.html"
$defaultOpenUrl = "chrome-extension://$ExtensionId/pages/index.html"
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
