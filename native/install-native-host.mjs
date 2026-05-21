import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST_NAME = "com.study_ladder.codex_hint";
const BLOCKED_LEGACY_EXTENSION_IDS = new Set(["mckniaaigcphmilhcpcpanfipcaoainb"]);
const REGISTRY_KEY = `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${HOST_NAME}`;
const MANIFEST_FILE = `${HOST_NAME}.json`;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const defaultExportRoot = path.join(repoRoot, "dist-unpacked");
const hostPath = path.join(scriptDir, "codex-hint-host.cmd");
const installDir = path.join(os.homedir(), "AppData", "Local", "StudyLadder");
const manifestPath = path.join(installDir, MANIFEST_FILE);

function normalizePath(value) {
  return value ? path.resolve(value).replace(/[\\\/]+$/, "").toLowerCase() : "";
}

function hasDisableReasons(value) {
  if (!value) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }
  return true;
}

function findLoadedExtensionId() {
  if (process.env.STUDY_LADDER_EXTENSION_ID) {
    return process.env.STUDY_LADDER_EXTENSION_ID;
  }

  const profileDir = process.env.CHROME_USER_DATA_DIR || path.join(os.homedir(), "AppData", "Local", "Google", "Chrome", "User Data");
  const profileName = process.env.CHROME_PROFILE_NAME || "Default";
  const profilePath = path.join(profileDir, profileName);
  const expectedPaths = new Set([repoRoot, defaultExportRoot].filter(fs.existsSync).map(normalizePath));

  for (const fileName of ["Preferences", "Secure Preferences"]) {
    const preferencesPath = path.join(profilePath, fileName);
    if (!fs.existsSync(preferencesPath)) {
      continue;
    }

    const preferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"));
    const settings = preferences.extensions?.settings || {};
    for (const [extensionId, extensionSettings] of Object.entries(settings)) {
      if (BLOCKED_LEGACY_EXTENSION_IDS.has(extensionId)) {
        continue;
      }
      if (hasDisableReasons(extensionSettings.disable_reasons)) {
        continue;
      }
      if (extensionSettings.state === 0) {
        continue;
      }
      if (expectedPaths.has(normalizePath(extensionSettings.path))) {
        return extensionId;
      }
    }
  }

  return "";
}

const extensionId = findLoadedExtensionId();
if (!extensionId) {
  throw new Error(`Could not find a loaded Study Ladder extension for ${repoRoot} or ${defaultExportRoot}. Load the unpacked extension first, then rerun npm run install:native-host.`);
}

const manifest = {
  name: HOST_NAME,
  description: "Study Ladder Codex hint native messaging host",
  path: hostPath,
  type: "stdio",
  allowed_origins: [`chrome-extension://${extensionId}/`]
};

fs.mkdirSync(installDir, { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const result = spawnSync("reg", ["add", REGISTRY_KEY, "/ve", "/t", "REG_SZ", "/d", manifestPath, "/f"], {
  stdio: "inherit"
});

if (result.status !== 0) {
  throw new Error("Could not register Study Ladder native messaging host.");
}

console.log(`Registered ${HOST_NAME}`);
console.log(`Allowed extension id: ${extensionId}`);
console.log(`Native host manifest: ${manifestPath}`);
