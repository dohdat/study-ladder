import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

function syncExtensionPagesPlugin(): Plugin {
  const syncHtml = (fileName: string) => {
    const builtPath = resolve(__dirname, "out", fileName);
    const pagesPath = resolve(__dirname, "pages", fileName);
    const html = readFileSync(builtPath, "utf8").replace(/(["'])\.\/assets\//g, "$1../out/assets/");
    writeFileSync(pagesPath, html);
  };

  return {
    name: "study-ladder-sync-extension-pages",
    apply: "build",
    closeBundle() {
      const pagesDir = resolve(__dirname, "pages");
      if (!existsSync(pagesDir)) {
        mkdirSync(pagesDir, { recursive: true });
      }

      syncHtml("index.html");
      syncHtml("profile.html");
      copyFileSync(resolve(__dirname, "public", "sandbox.html"), resolve(pagesDir, "sandbox.html"));
      copyFileSync(resolve(__dirname, "public", "sandbox.js"), resolve(pagesDir, "sandbox.js"));
      copyFileSync(resolve(__dirname, "reload.html"), resolve(pagesDir, "reload.html"));
      copyFileSync(resolve(__dirname, "reload.js"), resolve(pagesDir, "reload.js"));
    }
  };
}

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
  plugins: [react(), syncExtensionPagesPlugin(), extensionAutoReloadPlugin()],
  server: {
    host: "127.0.0.1",
    port: 3000
  }
});
