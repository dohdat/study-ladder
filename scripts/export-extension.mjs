import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const targetRoot = path.resolve(process.argv[2] || path.join(repoRoot, "dist-unpacked"));

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(source, target) {
  fs.cpSync(source, target, { recursive: true });
}

function requirePath(source) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing required export input: ${source}`);
  }
}

for (const requiredPath of [
  path.join(repoRoot, "manifest.json"),
  path.join(repoRoot, "background.js"),
  path.join(repoRoot, "pages", "index.html"),
  path.join(repoRoot, "pages", "profile.html"),
  path.join(repoRoot, "pages", "reload.html"),
  path.join(repoRoot, "pages", "reload.js"),
  path.join(repoRoot, "pages", "sandbox.html"),
  path.join(repoRoot, "pages", "sandbox.js"),
  path.join(repoRoot, "public", "icons"),
  path.join(repoRoot, "out")
]) {
  requirePath(requiredPath);
}

if (targetRoot === repoRoot || !path.basename(targetRoot).toLowerCase().includes("unpacked")) {
  throw new Error(`Refusing to replace unsafe export target: ${targetRoot}`);
}

fs.rmSync(targetRoot, { force: true, recursive: true });
fs.mkdirSync(targetRoot, { recursive: true });

copyFile(path.join(repoRoot, "manifest.json"), path.join(targetRoot, "manifest.json"));
copyFile(path.join(repoRoot, "background.js"), path.join(targetRoot, "background.js"));
for (const fileName of ["index.html", "profile.html", "reload.html", "reload.js", "sandbox.html", "sandbox.js"]) {
  copyFile(path.join(repoRoot, "pages", fileName), path.join(targetRoot, "pages", fileName));
}
copyDirectory(path.join(repoRoot, "public", "icons"), path.join(targetRoot, "public", "icons"));
copyDirectory(path.join(repoRoot, "out"), path.join(targetRoot, "out"));

console.log(`Exported Study Ladder unpacked extension to: ${targetRoot}`);
console.log("Load this folder in chrome://extensions with Developer mode > Load unpacked.");
