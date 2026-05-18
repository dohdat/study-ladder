import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "monaco-editor", "min", "vs");
const target = join(root, "public", "monaco", "vs");

if (!existsSync(source)) {
  throw new Error(`Missing Monaco assets at ${source}. Run npm install first.`);
}

if (isCurrent(source, target)) {
  process.exit(0);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(dirname(target), { recursive: true });
cpSync(source, target, { recursive: true });

function isCurrent(sourcePath, targetPath) {
  if (!existsSync(targetPath)) {
    return false;
  }

  const sourceStats = getDirectoryStats(sourcePath);
  const targetStats = getDirectoryStats(targetPath);
  return sourceStats.files === targetStats.files && sourceStats.latestMtimeMs <= targetStats.latestMtimeMs;
}

function getDirectoryStats(directoryPath) {
  let files = 0;
  let latestMtimeMs = 0;
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      const childStats = getDirectoryStats(entryPath);
      files += childStats.files;
      latestMtimeMs = Math.max(latestMtimeMs, childStats.latestMtimeMs);
      continue;
    }
    if (entry.isFile()) {
      const stats = statSync(entryPath);
      files += 1;
      latestMtimeMs = Math.max(latestMtimeMs, stats.mtimeMs);
    }
  }
  return { files, latestMtimeMs };
}
