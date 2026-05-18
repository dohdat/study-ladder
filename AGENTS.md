# Project Agent Instructions

- For source edits, keep iteration fast: run the narrowest relevant checks first, such as `npm.cmd run typecheck` and a focused `npm.cmd run test:unit -- <test-file>`. Do not run the full production build after every small edit while still iterating.
- For visual/UI iteration, prefer `npm.cmd run dev:extension`. It runs a quick Vite build into `out/`, reloads the unpacked extension, and reopens `chrome-extension://.../out/index.html`. It intentionally skips the full Monaco asset scan when `public/monaco/vs` already exists. Do not use a localhost-only workflow for extension visual checks unless the user explicitly asks for it.
- For repeated visual tweaking, use `npm.cmd run dev:extension:watch -- -ExtensionId <id>` in a long-running terminal. It keeps Vite warm, rebuilds `out/` on file changes, and reloads the extension after each rebuild.
- For screenshot-level visual tweaks, run focused checks first, usually `npm.cmd run typecheck`, then `npm.cmd run dev:extension` when the user needs to see the change in Chrome.
- Before handing work back for a final packaged change, or before commit/push/release work, run one final `npm.cmd run build` and `npm.cmd run reload:extension`. The unpacked extension loads the generated `out/` bundle, so Chrome can show stale UI without this final reload.
- If the reload helper cannot find the extension ID, pass `-- -ExtensionUrl "<current chrome-extension://.../out/index.html>"`, pass `-- -ExtensionId <id>`, or set `STUDY_LADDER_EXTENSION_ID`.
- For docs-only or investigation-only changes, skip build/reload unless the user asks to verify the extension bundle.
- Timing note: the project now uses Vite instead of Next for extension builds. `npm.cmd run dev:extension` is the fast visual loop; `npm.cmd run build` is the final packaged build with Monaco asset verification. Focused map tests are usually under 1 second of test runtime.
