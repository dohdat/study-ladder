import { afterEach, describe, expect, it, vi } from "vitest";

import { questions } from "../data/questions";
import { createExampleExplanationPrompt, createHintPrompt, createSolutionRevealPrompt, requestCodexExampleExplanation, requestCodexHint, requestCodexQuestionVariant, requestCodexSolutionReveal, requestCodexSystemDesignScore, warmCodexHint } from "../lib/hintPrompt";

const LONG_CODE_LENGTH = 1900;
const TRUNCATED_PROMPT_LENGTH = 900;

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

    expect(prompt).toContain("Give one fast next-step hint");
    expect(prompt).toContain("one incomplete JS fragment of at most 2 lines");
    expect(prompt).toContain("Do not solve the whole problem");
    expect(prompt).toContain(questions[0].title);
    expect(prompt).toContain("function firstDuplicate");
  });

  it("truncates long code in the hint prompt", () => {
    const prompt = createHintPrompt(questions[0], "x".repeat(LONG_CODE_LENGTH));

    expect(prompt).toContain(`${"x".repeat(TRUNCATED_PROMPT_LENGTH)}\n...`);
    expect(prompt).not.toContain("x".repeat(LONG_CODE_LENGTH));
  });

  it("asks Codex to explain one example output without code", () => {
    const prompt = createExampleExplanationPrompt(questions[0], questions[0].examples[0], 1);

    expect(prompt).toContain("Explain how this example output is calculated.");
    expect(prompt).toContain("Do not include code");
    expect(prompt).toContain(questions[0].examples[0].input);
    expect(prompt).toContain(questions[0].examples[0].output);
  });

  it("asks Codex for reveal sections without why-it-works", () => {
    const prompt = createSolutionRevealPrompt(questions[0], "function firstDuplicate(nums) {}");

    expect(prompt).toContain("## Approach");
    expect(prompt).toContain("## Code");
    expect(prompt).toContain("## Complexity");
    expect(prompt).not.toContain("## Compare with my code");
    expect(prompt).toContain("Do not include a 'Why it works' section.");
    expect(prompt).toContain(questions[0].functionName);
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

  it("sends warmup requests through the Chrome runtime", async () => {
    const sendMessage = vi.fn((_message, callback) => callback({ ok: true }));
    setChromeRuntime({ sendMessage });

    await expect(warmCodexHint()).resolves.toEqual({ ok: true });
    expect(sendMessage).toHaveBeenCalledWith({ type: "warm-codex-hint" }, expect.any(Function));
  });

  it("sends question variant requests through the Chrome runtime", async () => {
    const sendMessage = vi.fn((_message, callback) => callback({ ok: true, text: "{\"title\":\"Variant\"}" }));
    setChromeRuntime({ sendMessage });

    await expect(requestCodexQuestionVariant("question-1", "make variant")).resolves.toEqual({ ok: true, text: "{\"title\":\"Variant\"}" });
    expect(sendMessage).toHaveBeenCalledWith({ prompt: "make variant", questionId: "question-1", type: "open-codex-question-variant" }, expect.any(Function));
  });

  it("sends example explanation requests through the Chrome runtime", async () => {
    const sendMessage = vi.fn((_message, callback) => callback({ ok: true, text: "Step by step" }));
    setChromeRuntime({ sendMessage });

    await expect(requestCodexExampleExplanation("question-1:0", "explain example")).resolves.toEqual({ ok: true, text: "Step by step" });
    expect(sendMessage).toHaveBeenCalledWith({ exampleKey: "question-1:0", prompt: "explain example", type: "open-codex-example-explanation" }, expect.any(Function));
  });

  it("sends solution reveal requests through the Chrome runtime", async () => {
    const sendMessage = vi.fn((_message, callback) => callback({ ok: true, text: "## Approach" }));
    setChromeRuntime({ sendMessage });

    await expect(requestCodexSolutionReveal("question-1", "reveal")).resolves.toEqual({ ok: true, text: "## Approach" });
    expect(sendMessage).toHaveBeenCalledWith({ prompt: "reveal", questionId: "question-1", type: "open-codex-solution-reveal" }, expect.any(Function));
  });

  it("sends system design score requests through the Chrome runtime", async () => {
    const sendMessage = vi.fn((_message, callback) => callback({ ok: true, text: "Score: 82/100" }));
    setChromeRuntime({ sendMessage });

    await expect(requestCodexSystemDesignScore("system-1", "score me")).resolves.toEqual({ ok: true, text: "Score: 82/100" });
    expect(sendMessage).toHaveBeenCalledWith({ prompt: "score me", questionId: "system-1", type: "open-codex-system-design-score" }, expect.any(Function));
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
