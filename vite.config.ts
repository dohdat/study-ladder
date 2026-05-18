import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

function extensionAutoReloadPlugin(): Plugin {
  let reloadInFlight = false;
  let reloadQueued = false;

  const runReload = () => {
    if (reloadInFlight) {
      reloadQueued = true;
      return;
    }

    reloadInFlight = true;
    const args = [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      resolve(__dirname, "scripts", "reload-extension.ps1")
    ];

    if (process.env.STUDY_LADDER_EXTENSION_ID) {
      args.push("-ExtensionId", process.env.STUDY_LADDER_EXTENSION_ID);
    }
    if (process.env.STUDY_LADDER_EXTENSION_URL) {
      args.push("-ExtensionUrl", process.env.STUDY_LADDER_EXTENSION_URL);
    }
    if (process.env.STUDY_LADDER_EXTENSION_OPEN_URL) {
      args.push("-OpenUrl", process.env.STUDY_LADDER_EXTENSION_OPEN_URL);
    }
    if (process.env.CHROME_USER_DATA_DIR) {
      args.push("-ProfileDir", process.env.CHROME_USER_DATA_DIR);
    }
    if (process.env.CHROME_PROFILE_NAME) {
      args.push("-ProfileName", process.env.CHROME_PROFILE_NAME);
    }
    if (process.env.CHROME_PATH) {
      args.push("-ChromePath", process.env.CHROME_PATH);
    }

    const child = spawn("powershell", args, { stdio: "inherit" });
    child.on("exit", () => {
      reloadInFlight = false;
      if (reloadQueued) {
        reloadQueued = false;
        runReload();
      }
    });
    child.on("error", (error) => {
      reloadInFlight = false;
      console.error(error);
    });
  };

  return {
    name: "study-ladder-extension-auto-reload",
    apply: "build",
    closeBundle() {
      if (process.env.STUDY_LADDER_EXTENSION_AUTO_RELOAD !== "1") {
        return;
      }
      runReload();
    }
  };
}

export default defineConfig({
  base: "./",
  build: {
    assetsDir: "assets",
    emptyOutDir: true,
    outDir: "out",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        profile: resolve(__dirname, "profile.html")
      }
    }
  },
  plugins: [react(), extensionAutoReloadPlugin()],
  server: {
    host: "127.0.0.1",
    port: 3000
  }
});
