import type { Question } from "../types/study";

const MAX_CODE_CHARS = 1800;
const OPEN_CODEX_HINT_TYPE = "open-codex-hint";

export const CODEX_HINT_CHUNK = "codex-hint-chunk";
export const CODEX_HINT_DONE = "codex-hint-done";
export const CODEX_HINT_ERROR = "codex-hint-error";

type CodexHintResponse = {
  ok: boolean;
  error?: string;
};

type CodexHintRequest = {
  type: typeof OPEN_CODEX_HINT_TYPE;
  prompt: string;
};

export type CodexHintStreamMessage = {
  type: typeof CODEX_HINT_CHUNK | typeof CODEX_HINT_DONE | typeof CODEX_HINT_ERROR;
  text?: string;
  error?: string;
};

type ChromeRuntime = {
  lastError?: {
    message?: string;
  };
  sendMessage?: (message: CodexHintRequest, callback: (response?: CodexHintResponse) => void) => void;
};

export function createHintPrompt(question: Question, code: string) {
  return [
    "You are helping me practice a LeetCode-style JavaScript question.",
    "Give me exactly one next-step hint.",
    "Do not provide the full solution, final code, or complete algorithm.",
    "Point out the smallest useful concept, edge case, or next move.",
    "",
    `Question: ${question.title}`,
    `Function: ${question.functionName}`,
    `Prompt: ${question.prompt}`,
    `Topics: ${question.topics.join(", ")}`,
    "",
    "My current code:",
    truncateCode(code)
  ].join("\n");
}

function truncateCode(code: string) {
  if (code.length <= MAX_CODE_CHARS) {
    return code;
  }

  return `${code.slice(0, MAX_CODE_CHARS)}\n...`;
}

export function requestCodexHint(prompt: string) {
  const runtime = (globalThis as typeof globalThis & { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
  if (!runtime?.sendMessage) {
    return Promise.resolve({ ok: false, error: "Chrome runtime is not available." });
  }

  return new Promise<CodexHintResponse>((resolve) => {
    runtime.sendMessage?.({ type: OPEN_CODEX_HINT_TYPE, prompt }, (response) => {
      resolve(response || { ok: false, error: runtime.lastError?.message || "No response from extension background." });
    });
  });
}
