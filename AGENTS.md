# Project Agent Instructions

- After changing source files for this Chrome extension, always run `npm.cmd run build` before handing work back. The unpacked extension loads the generated `out/` bundle, so refreshing Chrome without rebuilding can show stale UI.
- After a successful build, run `npm.cmd run reload:extension` when Chrome has the unpacked extension installed. The helper opens `reload.html` to call `chrome.runtime.reload()` and then reopens `out/index.html`.
- If the reload helper cannot find the extension ID, pass `-- -ExtensionUrl "<current chrome-extension://.../out/index.html>"`, pass `-- -ExtensionId <id>`, or set `STUDY_LADDER_EXTENSION_ID`.
