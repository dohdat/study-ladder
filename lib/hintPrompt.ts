import type { Question } from "../types/study";

const MAX_CODE_CHARS = 900;
const OPEN_CODEX_HINT_TYPE = "open-codex-hint";
const WARM_CODEX_HINT_TYPE = "warm-codex-hint";

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

type CodexWarmRequest = {
  type: typeof WARM_CODEX_HINT_TYPE;
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
  sendMessage?: (message: CodexHintRequest | CodexWarmRequest, callback: (response?: CodexHintResponse) => void) => void;
};

export function createHintPrompt(question: Question, code: string) {
  return [
    "Give one fast next-step hint for this JavaScript practice question.",
    "Format: one short sentence, then one incomplete JS fragment of at most 2 lines.",
    "Do not solve the whole problem or include a complete loop/final return.",
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
  return sendCodexHintMessage({ type: OPEN_CODEX_HINT_TYPE, prompt });
}

export function warmCodexHint() {
  return sendCodexHintMessage({ type: WARM_CODEX_HINT_TYPE });
}

function sendCodexHintMessage(message: CodexHintRequest | CodexWarmRequest) {
  const runtime = (globalThis as typeof globalThis & { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
  if (!runtime?.sendMessage) {
    return Promise.resolve({ ok: false, error: "Chrome runtime is not available." });
  }

  return new Promise<CodexHintResponse>((resolve) => {
    runtime.sendMessage?.(message, (response) => {
      resolve(response || { ok: false, error: runtime.lastError?.message || "No response from extension background." });
    });
  });
}
