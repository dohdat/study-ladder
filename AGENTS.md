# Project Agent Instructions

- After changing source files for this Chrome extension, always run `npm.cmd run build` before handing work back. The unpacked extension loads the generated `out/` bundle, so refreshing Chrome without rebuilding can show stale UI.
- When verifying UI fixes, remind the user to reload the unpacked extension from `chrome://extensions` after the build, then refresh the app page.
