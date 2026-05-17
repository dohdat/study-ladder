# Project Agent Instructions

- For source edits, keep iteration fast: run the narrowest relevant checks first, such as `npm.cmd run typecheck` and a focused `npm.cmd run test:unit -- <test-file>`. Do not run the full production build after every small edit while still iterating.
- Before handing work back for a change that should be visible in the unpacked Chrome extension, run one final `npm.cmd run build`. The unpacked extension loads the generated `out/` bundle, so Chrome can show stale UI without this final build.
- After a successful final build, run `npm.cmd run reload:extension` when Chrome has the unpacked extension installed. The helper opens `reload.html` to call `chrome.runtime.reload()` and then reopens `out/index.html`.
- If the reload helper cannot find the extension ID, pass `-- -ExtensionUrl "<current chrome-extension://.../out/index.html>"`, pass `-- -ExtensionId <id>`, or set `STUDY_LADDER_EXTENSION_ID`.
- For docs-only or investigation-only changes, skip build/reload unless the user asks to verify the extension bundle.
- Timing note: `npm.cmd run build` currently takes about 50 seconds, while focused map tests are usually under 1 second of test runtime. Prefer batching visual/UI tweaks before the final build and reload.
