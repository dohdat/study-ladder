# Study Ladder

A Chrome extension built with Next.js, Mantine, and Monaco Editor for JavaScript LeetCode-style practice.

## Develop

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:3000`.

## Build Extension

```powershell
npm.cmd run build
npm.cmd run install:native-host
```

Then load the exported extension:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select `D:\Leetcode + System Design extension\out`.

`install:native-host` registers the local Codex hint helper for Chrome under the stable extension id
`mckniaaigcphmilhcpcpanfipcaoainb`. Run it once after cloning or moving the repo.

## Test Coverage

```powershell
npm.cmd run test:coverage
```

Coverage is enforced at 80% for statements, branches, functions, and lines.

## Current Scope

- Mantine owns the visual system and component styling.
- Monaco Editor is used for JavaScript editing and loads from local extension assets.
- Beautify is available from the toolbar or `Ctrl+S` / `Cmd+S`, and it fills missing semicolons on common statement lines.
- Submit is available from the toolbar or `Ctrl+Enter` / `Cmd+Enter`.
- Solving questions earns coins by difficulty, and hints are temporarily free for Codex streaming tests.
- Buying a hint streams one next-step hint with an intentionally incomplete partial-code fragment from Codex through the native messaging helper.
- LeetCode-style JavaScript questions are active.
- Practice sessions are timed by difficulty: Easy/Easy+ 10 minutes, Medium/Medium+ 20 minutes, Hard 25 minutes.
- System Design mode is present as a selectable placeholder.
- Progress is stored locally in the browser.
- The profile panel tracks coins, hints bought, attempted, solved, mastered, pass rate, streak, and per-topic mastery.
- A question is counted as mastered after 3 successful reviews on that card.
- The scheduler uses a small spaced repetition model: passed cards move out by 1 day, then 3 days, then longer intervals; failed cards return after 10 minutes.
- The runner supports synchronous or promise-returning JavaScript functions.
