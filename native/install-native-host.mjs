import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST_NAME = "com.study_ladder.codex_hint";
const EXTENSION_ID = "mckniaaigcphmilhcpcpanfipcaoainb";
const REGISTRY_KEY = `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${HOST_NAME}`;
const MANIFEST_FILE = `${HOST_NAME}.json`;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const hostPath = path.join(scriptDir, "codex-hint-host.cmd");
const installDir = path.join(os.homedir(), "AppData", "Local", "StudyLadder");
const manifestPath = path.join(installDir, MANIFEST_FILE);
const manifest = {
  name: HOST_NAME,
  description: "Study Ladder Codex hint native messaging host",
  path: hostPath,
  type: "stdio",
  allowed_origins: [`chrome-extension://${EXTENSION_ID}/`]
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
console.log(`Allowed extension id: ${EXTENSION_ID}`);
console.log(`Native host manifest: ${manifestPath}`);
