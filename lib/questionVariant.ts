import type { Question, TestCase } from "../types/study";

const MAX_PROMPT_TESTS = 10;
const MAX_CONSTRAINTS = 8;
const MAX_EXAMPLES = 3;
const MAX_VARIANT_TESTS = 12;
const MIN_VARIANT_TESTS = 5;
const MAX_PROMPT_LENGTH = 360;
const MAX_EXAMPLE_FIELD_LENGTH = 240;
const RATING_TOLERANCE = 150;
const MIN_MEANINGFUL_TEXT_LENGTH = 12;

export type QuestionVariantPayload = {
  constraints: string[];
  examples: Array<{
    explanation?: string;
    input: string;
    output: string;
  }>;
  estimatedRating: number;
  prompt: string;
  tests: TestCase[];
  title: string;
};

export type QuestionVariantResult = {
  error?: string;
  question: Question | null;
};

export function createQuestionVariantPrompt(question: Question) {
  return [
    "Create a fresh playable variant of this JavaScript interview practice prompt.",
    "Return JSON only. No markdown, no commentary.",
    "",
    "Rules:",
    "- Preserve the exact function name and argument list. Do not add, remove, or reorder parameters.",
    "- You MAY change the return semantics and output shape to make the task feel different.",
    "- Keep the same core algorithmic family and difficulty, but require a different final thing than the stock prompt.",
    `- Keep the estimated difficulty rating between ${question.rating - RATING_TOLERANCE} and ${question.rating + RATING_TOLERANCE}. Do not make the task easier or harder than that band.`,
    "- Set estimatedRating to your best LeetCode-style rating estimate for the changed task.",
    "- Generate new tests for your changed semantics. These tests will grade the answer, not the original expected outputs.",
    "- Do not only rename variables, change numbers, or change the story. The implementation goal must be slightly different.",
    "- Good variations: return pair values instead of indices, return a count instead of a boolean, return a repaired/normalized result, add a tie-break rule, or ask for the earliest/widest/cheapest valid choice.",
    "- Prefer a simple return value: number, boolean, string, array, or a tiny object with at most 2 fields.",
    "- Keep prompt text concise: 1 or 2 sentences, under 45 words.",
    "- The prompt must state WHAT to return, not HOW to solve it. Do not mention sorting, scanning, hashing, stacks, maps, greedy, DP, or traversal strategy.",
    "- Put tie-break rules and edge behavior in constraints, not the main prompt.",
    "- Constraints must be short requirement bullets, not solution steps.",
    "- Keep each example input/output on one short line. Avoid long JSON objects in examples.",
    "- Keep all test args compatible with the original function arguments.",
    "- Include 8 to 10 tests with unique names and edge cases: empty/min input, duplicates, negatives/zero where relevant, ties, no-solution, boundary order, and misleading near misses.",
    "- Do not mention that this is a variant, remix, hidden test, LeetCode, or NeetCode.",
    "",
    "JSON schema:",
    "{\"title\":\"string\",\"estimatedRating\":1300,\"prompt\":\"string\",\"constraints\":[\"string\"],\"examples\":[{\"input\":\"string\",\"output\":\"string\",\"explanation\":\"string\"}],\"tests\":[{\"name\":\"string\",\"args\":[...],\"expected\":...}]}",
    "",
    `Original title: ${question.title}`,
    `Original rating: ${question.rating}`,
    `Function: ${getFunctionSignature(question.starter, question.functionName)}`,
    `Original prompt: ${question.prompt}`,
    `Topics: ${question.topics.join(", ")}`,
    `Constraints: ${JSON.stringify(question.constraints)}`,
    `Examples: ${JSON.stringify(question.examples)}`,
    `Original tests for input shape only. Replace expected values if your semantics change: ${JSON.stringify(question.tests.slice(0, MAX_PROMPT_TESTS))}`
  ].join("\n");
}

export function createQuestionVariant(question: Question, text: string): Question | null {
  return createQuestionVariantResult(question, text).question;
}

export function createQuestionVariantResult(question: Question, text: string): QuestionVariantResult {
  const payload = parseVariantPayload(question, text);
  if (!payload) {
    return { error: getLastParseError(), question: null };
  }
  return { question: {
    ...question,
    constraints: payload.constraints,
    examples: payload.examples,
    prompt: payload.prompt,
    tests: payload.tests,
    title: payload.title
  } };
}

let lastParseError = "";

function parseVariantPayload(question: Question, text: string): QuestionVariantPayload | null {
  lastParseError = "";
  const jsonText = extractJsonObject(text);
  if (!jsonText) {
    lastParseError = "Codex did not return a JSON object.";
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    lastParseError = "Codex returned JSON with syntax errors.";
    return null;
  }
  if (!parsed || typeof parsed !== "object") {
    lastParseError = "Codex returned an invalid JSON shape.";
    return null;
  }
  const record = parsed as Partial<QuestionVariantPayload>;
  const title = normalizeMeaningfulString(record.title);
  const prompt = normalizeMeaningfulString(record.prompt);
  const constraints = normalizeConstraints(record.constraints);
  const examples = normalizeExamples(record.examples);
  const estimatedRating = normalizeEstimatedRating(record);
  const tests = normalizeTests(record.tests);
  if (!title) {
    lastParseError = "Codex did not provide a usable title.";
    return null;
  }
  if (!prompt) {
    lastParseError = "Codex did not provide a usable prompt.";
    return null;
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    lastParseError = "Codex prompt was too long.";
    return null;
  }
  if (!isRatingInBand(question.rating, estimatedRating)) {
    lastParseError = `Codex estimated rating ${estimatedRating || "missing"} outside the allowed band.`;
    return null;
  }
  if (constraints.length === 0) {
    lastParseError = "Codex did not provide constraints.";
    return null;
  }
  if (examples.length === 0) {
    lastParseError = "Codex did not provide short examples.";
    return null;
  }
  if (tests.length < MIN_VARIANT_TESTS) {
    lastParseError = `Codex provided only ${tests.length} usable tests.`;
    return null;
  }
  return { constraints, estimatedRating, examples, prompt, tests, title };
}

function getLastParseError() {
  return lastParseError || "Codex draft did not match the question format.";
}

function extractJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return "";
  }
  return trimmed.slice(start, end + 1);
}

function normalizeMeaningfulString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  return trimmed.length >= MIN_MEANINGFUL_TEXT_LENGTH ? trimmed : "";
}

function normalizeConstraints(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((constraint): constraint is string => typeof constraint === "string")
    .map((constraint) => constraint.trim())
    .filter(Boolean)
    .slice(0, MAX_CONSTRAINTS);
}

function normalizeExamples(value: unknown): QuestionVariantPayload["examples"] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((example): QuestionVariantPayload["examples"][number] | null => {
      if (!example || typeof example !== "object") {
        return null;
      }
      const record = example as Partial<QuestionVariantPayload["examples"][number]>;
      if (typeof record.input !== "string" || typeof record.output !== "string") {
        return null;
      }
      const input = record.input.trim();
      const output = record.output.trim();
      const explanation = typeof record.explanation === "string" ? record.explanation.trim() : undefined;
      if (input.length > MAX_EXAMPLE_FIELD_LENGTH || output.length > MAX_EXAMPLE_FIELD_LENGTH || (explanation && explanation.length > MAX_EXAMPLE_FIELD_LENGTH)) {
        return null;
      }
      return {
        explanation,
        input,
        output
      };
    })
    .filter((example): example is QuestionVariantPayload["examples"][number] => Boolean(example?.input && example?.output))
    .slice(0, MAX_EXAMPLES);
}

function normalizeEstimatedRating(record: Partial<QuestionVariantPayload> & Record<string, unknown>) {
  const value = record.estimatedRating ?? record.estimated_rating ?? record.rating ?? record.difficultyRating;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
  }
  return 0;
}

function isRatingInBand(originalRating: number, estimatedRating: number) {
  return estimatedRating >= originalRating - RATING_TOLERANCE && estimatedRating <= originalRating + RATING_TOLERANCE;
}

function normalizeTests(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seenNames = new Set<string>();
  const tests: TestCase[] = [];
  for (const test of value) {
    if (!test || typeof test !== "object") {
      continue;
    }
    const record = test as Partial<TestCase> & { inputArgs?: unknown; arguments?: unknown };
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const args = record.args ?? record.inputArgs ?? record.arguments;
    if (!name || seenNames.has(name) || !Array.isArray(args) || !isJsonSafe(args) || !isJsonSafe(record.expected)) {
      continue;
    }
    seenNames.add(name);
    tests.push({ name, args, expected: record.expected });
    if (tests.length >= MAX_VARIANT_TESTS) {
      break;
    }
  }
  return tests;
}

function isJsonSafe(value: unknown): boolean {
  if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    return false;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (!value || typeof value !== "object") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonSafe);
  }
  return Object.values(value).every(isJsonSafe);
}

function getFunctionSignature(starter: string, fallbackName: string) {
  return starter.split("\n")[0]?.trim() || `function ${fallbackName}(...)`;
}
