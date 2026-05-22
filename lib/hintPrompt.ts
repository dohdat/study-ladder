import type { Question } from "../types/study";

const MAX_CODE_CHARS = 900;
const OPEN_CODEX_HINT_TYPE = "open-codex-hint";
const OPEN_CODEX_QUESTION_VARIANT_TYPE = "open-codex-question-variant";
const OPEN_CODEX_EXAMPLE_EXPLANATION_TYPE = "open-codex-example-explanation";
const OPEN_CODEX_SOLUTION_REVEAL_TYPE = "open-codex-solution-reveal";
const WARM_CODEX_HINT_TYPE = "warm-codex-hint";

export const CODEX_HINT_CHUNK = "codex-hint-chunk";
export const CODEX_HINT_DONE = "codex-hint-done";
export const CODEX_HINT_ERROR = "codex-hint-error";
export const CODEX_QUESTION_VARIANT_CHUNK = "codex-question-variant-chunk";
export const CODEX_QUESTION_VARIANT_DONE = "codex-question-variant-done";
export const CODEX_QUESTION_VARIANT_ERROR = "codex-question-variant-error";
export const CODEX_EXAMPLE_EXPLANATION_CHUNK = "codex-example-explanation-chunk";
export const CODEX_EXAMPLE_EXPLANATION_DONE = "codex-example-explanation-done";
export const CODEX_EXAMPLE_EXPLANATION_ERROR = "codex-example-explanation-error";

type CodexHintResponse = {
  ok: boolean;
  error?: string;
};

type CodexMessageResponse = CodexHintResponse & {
  text?: string;
};

type CodexHintRequest = {
  type: typeof OPEN_CODEX_HINT_TYPE;
  prompt: string;
};

type CodexQuestionVariantRequest = {
  type: typeof OPEN_CODEX_QUESTION_VARIANT_TYPE;
  prompt: string;
  questionId: string;
};

type CodexExampleExplanationRequest = {
  type: typeof OPEN_CODEX_EXAMPLE_EXPLANATION_TYPE;
  exampleKey: string;
  prompt: string;
};

type CodexSolutionRevealRequest = {
  type: typeof OPEN_CODEX_SOLUTION_REVEAL_TYPE;
  prompt: string;
  questionId: string;
};

type CodexWarmRequest = {
  type: typeof WARM_CODEX_HINT_TYPE;
};

export type CodexHintStreamMessage = {
  type: typeof CODEX_HINT_CHUNK | typeof CODEX_HINT_DONE | typeof CODEX_HINT_ERROR;
  text?: string;
  error?: string;
};

export type CodexExampleExplanationStreamMessage = {
  type: typeof CODEX_EXAMPLE_EXPLANATION_CHUNK | typeof CODEX_EXAMPLE_EXPLANATION_DONE | typeof CODEX_EXAMPLE_EXPLANATION_ERROR;
  exampleKey?: string;
  text?: string;
  error?: string;
};

type ChromeRuntime = {
  lastError?: {
    message?: string;
  };
  sendMessage?: (message: CodexHintRequest | CodexQuestionVariantRequest | CodexExampleExplanationRequest | CodexSolutionRevealRequest | CodexWarmRequest, callback: (response?: CodexMessageResponse) => void) => void;
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

export function createExampleExplanationPrompt(question: Question, example: Question["examples"][number], exampleNumber: number) {
  return [
    "Explain how this example output is calculated.",
    "Use clear step-by-step bullets. Do not include code or solve the general algorithm.",
    "Keep it under 120 words. Show arithmetic/counts/tie-breaks when relevant.",
    "",
    `Question: ${question.title}`,
    `Prompt: ${question.prompt}`,
    `Constraints: ${question.constraints.join(" | ")}`,
    `Example ${exampleNumber}:`,
    `Input: ${example.input}`,
    `Output: ${example.output}`,
    example.explanation ? `Existing explanation: ${example.explanation}` : ""
  ].filter(Boolean).join("\n");
}

export function createSolutionRevealPrompt(question: Question, code: string) {
  return [
    "Reveal a concise solution for this JavaScript interview practice question.",
    "Return Markdown with exactly these headings and no other top-level headings:",
    "## Approach",
    "## Code",
    "## Complexity",
    "## Compare with my code",
    "Do not include a 'Why it works' section.",
    "The Code section must contain one complete JavaScript function matching the required function name and arguments.",
    "Keep Approach under 5 bullets and Compare under 4 bullets.",
    "",
    `Question: ${question.title}`,
    `Function: ${question.functionName}`,
    `Prompt: ${question.prompt}`,
    `Constraints: ${question.constraints.join(" | ")}`,
    `Examples: ${JSON.stringify(question.examples)}`,
    `Tests to satisfy: ${JSON.stringify(question.tests)}`,
    "",
    "My failed code:",
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

export function requestCodexQuestionVariant(questionId: string, prompt: string) {
  return sendCodexHintMessage({ type: OPEN_CODEX_QUESTION_VARIANT_TYPE, prompt, questionId });
}

export function requestCodexExampleExplanation(exampleKey: string, prompt: string) {
  return sendCodexHintMessage({ type: OPEN_CODEX_EXAMPLE_EXPLANATION_TYPE, exampleKey, prompt });
}

export function requestCodexSolutionReveal(questionId: string, prompt: string) {
  return sendCodexHintMessage({ type: OPEN_CODEX_SOLUTION_REVEAL_TYPE, prompt, questionId });
}

export function warmCodexHint() {
  return sendCodexHintMessage({ type: WARM_CODEX_HINT_TYPE });
}

function sendCodexHintMessage(message: CodexHintRequest | CodexQuestionVariantRequest | CodexExampleExplanationRequest | CodexSolutionRevealRequest | CodexWarmRequest): Promise<CodexMessageResponse> {
  const runtime = (globalThis as typeof globalThis & { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
  if (!runtime?.sendMessage) {
    return Promise.resolve({ ok: false, error: "Chrome runtime is not available." });
  }

  return new Promise<CodexMessageResponse>((resolve) => {
    runtime.sendMessage?.(message, (response) => {
      resolve(response || { ok: false, error: runtime.lastError?.message || "No response from extension background." });
    });
  });
}
