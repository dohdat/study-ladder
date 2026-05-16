import { afterEach, describe, expect, it, vi } from "vitest";

import { questions } from "../data/questions";
import { createHintPrompt, requestCodexHint } from "../lib/hintPrompt";

const LONG_CODE_LENGTH = 1900;
const TRUNCATED_PROMPT_LENGTH = 1800;

function setChromeRuntime(runtime?: unknown) {
  Object.defineProperty(globalThis, "chrome", {
    configurable: true,
    value: runtime ? { runtime } : undefined
  });
}

describe("hintPrompt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setChromeRuntime();
  });

  it("asks Codex for one next step with partial code, not the solution", () => {
    const prompt = createHintPrompt(questions[0], "function firstDuplicate(nums) {}");

    expect(prompt).toContain("Give me exactly one next-step hint with a small JavaScript code fragment.");
    expect(prompt).toContain("must be intentionally incomplete");
    expect(prompt).toContain("Do not include the full function");
    expect(prompt).toContain("Use a TODO comment");
    expect(prompt).toContain(questions[0].title);
    expect(prompt).toContain("function firstDuplicate");
  });

  it("truncates long code in the hint prompt", () => {
    const prompt = createHintPrompt(questions[0], "x".repeat(LONG_CODE_LENGTH));

    expect(prompt).toContain(`${"x".repeat(TRUNCATED_PROMPT_LENGTH)}\n...`);
    expect(prompt).not.toContain("x".repeat(LONG_CODE_LENGTH));
  });

  it("reports unavailable Chrome runtime when hint requests run outside the extension", async () => {
    setChromeRuntime();

    await expect(requestCodexHint("hint")).resolves.toMatchObject({
      error: "Chrome runtime is not available.",
      ok: false
    });
  });

  it("sends hint requests through the Chrome runtime", async () => {
    const sendMessage = vi.fn((_message, callback) => callback({ ok: true }));
    setChromeRuntime({ sendMessage });

    await expect(requestCodexHint("next move")).resolves.toEqual({ ok: true });
    expect(sendMessage).toHaveBeenCalledWith({ prompt: "next move", type: "open-codex-hint" }, expect.any(Function));
  });

  it("uses Chrome runtime lastError when the background does not respond", async () => {
    const sendMessage = vi.fn((_message, callback) => callback(undefined));
    setChromeRuntime({ lastError: { message: "native host missing" }, sendMessage });

    await expect(requestCodexHint("next move")).resolves.toEqual({
      error: "native host missing",
      ok: false
    });
  });
});
