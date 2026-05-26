import type { FrontendCheck, Question, TestCase } from "../types/study";
import { FRONTEND_APP_FILE, FRONTEND_CSS_FILE } from "./frontendChallenge";

const MAX_PROMPT_TESTS = 10;
const MAX_CONSTRAINTS = 8;
const MAX_EXAMPLES = 3;
const MAX_VARIANT_TESTS = 12;
const MIN_VARIANT_TESTS = 5;
const MAX_PROMPT_LENGTH = 360;
const MAX_EXAMPLE_FIELD_LENGTH = 240;
const MAX_FRONTEND_CHECKS = 6;
const MIN_FRONTEND_CHECKS = 3;
const MAX_FRONTEND_FILE_LENGTH = 5000;
const MAX_SOLUTION_REVEAL_LENGTH = 6000;
const MAX_WIREFRAME_LINES = 10;
const MAX_WIREFRAME_LINE_LENGTH = 80;
const RATING_TOLERANCE = 150;
const MIN_MEANINGFUL_TEXT_LENGTH = 12;
const MAX_REPAIR_DRAFT_CHARS = 5000;
const LOW_RATING_MAX = 1500;
const HARD_ALGORITHM_PATTERN = /\b(subset|knapsack|reachable|combination|combinations|dynamic programming|dp table)\b/i;
const EXTRA_FEASIBILITY_PATTERN = /\b(leaving at least one|leave at least one|at least one .*remain|no valid deletion|invalid because .*remain)\b/i;
const DISTINCT_OBJECTIVE_PATTERN = /\b(smallest|minimize|minimum)[^.]{0,90}\b(distinct|values|value count)\b/i;
const SECONDARY_REMOVAL_OBJECTIVE_PATTERN = /\b(smallest|minimize|minimum|maximum|maximize)[^.]{0,90}\b(removed|deletion|deletions|remaining|remainder|residue)\b/i;
const LOW_RATING_SHAPE_LABELS: Record<string, string> = { array: "flat array", object: "object", scalar: "scalar value" };

export type QuestionVariantPayload = {
  constraints: string[];
  examples: Array<{
    explanation?: string;
    input: string;
    output: string;
  }>;
  estimatedRating: number;
  prompt: string;
  solutionReveal?: string;
  tests: TestCase[];
  title: string;
  frontend?: {
    checks: FrontendCheck[];
    files: {
      "App.tsx": string;
      "styles.css": string;
    };
    wireframe?: string[];
  };
};

export type QuestionVariantResult = {
  error?: string;
  question: Question | null;
};

export function createQuestionVariantPrompt(question: Question) {
  if (question.frontend) {
    return createFrontendQuestionVariantPrompt(question);
  }
  const lowRatingRules = question.rating <= LOW_RATING_MAX ? [
    "- This is a low-rated question: do not add subset-selection, knapsack, dynamic programming, or multiple optimization objectives.",
    `- This low-rated question's original answer shape is ${LOW_RATING_SHAPE_LABELS[getReturnShape(question.tests)]}; preserve that answer shape exactly.`,
    "- Do not turn a count/boolean/string answer into returning the actual chosen values, indices, elements, or a multi-field object.",
    "- Do not add extra feasibility rules such as requiring at least one element to remain unless the original prompt already has that rule."
  ] : [];
  return [
    "Create a fresh playable variant of this JavaScript interview practice prompt.",
    "Return JSON only. No markdown, no commentary.",
    "",
    "Rules:",
    "- Preserve the exact function name and argument list. Do not add, remove, or reorder parameters.",
    "- Keep the same return shape as the original prompt unless the original rating is above 1500 and the shape change is clearly still within the rating band.",
    "- Keep the same core algorithmic family and difficulty. Make only a small playable twist, not a harder reconstruction problem.",
    `- Keep the estimated difficulty rating between ${question.rating - RATING_TOLERANCE} and ${question.rating + RATING_TOLERANCE}. Do not make the task easier or harder than that band.`,
    "- Set estimatedRating to your best LeetCode-style rating estimate for the changed task.",
    "- Generate new tests for your changed semantics. These tests will grade the answer, not the original expected outputs.",
    "- Also generate solutionReveal: Markdown with exactly these headings: ## Approach, ## Code, ## Complexity.",
    "- solutionReveal Code must contain one complete JavaScript function matching the required function name and arguments.",
    "- Do not only rename variables, change numbers, or change the story. The implementation goal must be slightly different.",
    "- Good variations: adjust an edge behavior, return a same-shape count/boolean/string/array result, or add one simple tie-break rule that does not require a second algorithm.",
    "- Prefer a simple return value: number, boolean, string, or flat array. Use a tiny object only if the original answer was already object-shaped or the question is above 1500 rating.",
    ...lowRatingRules,
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
    "{\"title\":\"string\",\"estimatedRating\":1300,\"prompt\":\"string\",\"constraints\":[\"string\"],\"examples\":[{\"input\":\"string\",\"output\":\"string\",\"explanation\":\"string\"}],\"tests\":[{\"name\":\"string\",\"args\":[...],\"expected\":...}],\"solutionReveal\":\"## Approach\\n- ...\\n## Code\\n```js\\nfunction name(args) { }\\n```\\n## Complexity\\n...\"}",
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

export function createQuestionVariantRepairPrompt(question: Question, draft: string, reason = "Invalid JSON") {
  if (question.frontend) {
    return createFrontendQuestionVariantRepairPrompt(question, draft, reason);
  }
  const lowRatingRules = question.rating <= LOW_RATING_MAX ? [
    "- low-rated questions must not add subset-selection, knapsack, DP, multiple optimization objectives, or extra feasibility rules.",
    `- low-rated questions must preserve the original answer shape: ${LOW_RATING_SHAPE_LABELS[getReturnShape(question.tests)]}.`,
    "- low-rated scalar questions must not return chosen values, indices, elements, arrays, or multi-field objects."
  ] : [];
  return [
    "Repair this question-variant draft into valid JSON.",
    "Return one JSON object only. No markdown, no code fence, no commentary.",
    "Do not invent a different task unless needed to satisfy the schema.",
    "",
    "Required JSON schema:",
    "{\"title\":\"string\",\"estimatedRating\":1300,\"prompt\":\"string\",\"constraints\":[\"string\"],\"examples\":[{\"input\":\"string\",\"output\":\"string\",\"explanation\":\"string\"}],\"tests\":[{\"name\":\"string\",\"args\":[...],\"expected\":...}],\"solutionReveal\":\"## Approach\\n- ...\\n## Code\\n```js\\nfunction name(args) { }\\n```\\n## Complexity\\n...\"}",
    "",
    "Hard requirements:",
    `- estimatedRating must be between ${question.rating - RATING_TOLERANCE} and ${question.rating + RATING_TOLERANCE}.`,
    "- tests must contain at least 5 usable cases.",
    "- every test must use args, not inputArgs or arguments.",
    "- solutionReveal must be included and must have ## Approach, ## Code, and ## Complexity sections.",
    "- prompt must be concise and under 360 characters.",
    "- preserve the exact function name and argument list from the original question.",
    ...lowRatingRules,
    "",
    `Original title: ${question.title}`,
    `Original rating: ${question.rating}`,
    `Function: ${getFunctionSignature(question.starter, question.functionName)}`,
    `Original prompt: ${question.prompt}`,
    `Original tests for input shape only: ${JSON.stringify(question.tests.slice(0, MAX_PROMPT_TESTS))}`,
    "",
    `Parser rejection reason: ${reason}`,
    "Draft to repair:",
    draft.slice(0, MAX_REPAIR_DRAFT_CHARS)
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
    frontend: payload.frontend || question.frontend,
    prompt: payload.prompt,
    solutionReveal: payload.solutionReveal || question.solutionReveal,
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
  if (question.frontend) {
    return parseFrontendVariantPayload(question, record);
  }
  const title = normalizeMeaningfulString(record.title);
  const prompt = normalizeMeaningfulString(record.prompt);
  const constraints = normalizeConstraints(record.constraints);
  const examples = normalizeExamples(record.examples);
  const estimatedRating = normalizeEstimatedRating(record);
  const tests = normalizeTests(record.tests);
  const solutionRecord = record as Partial<QuestionVariantPayload> & { revealSolution?: unknown; solution?: unknown };
  const solutionReveal = normalizeSolutionReveal(solutionRecord.solutionReveal ?? solutionRecord.solution ?? solutionRecord.revealSolution);
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
  if (!solutionReveal) {
    lastParseError = "Codex did not provide a usable solution reveal.";
    return null;
  }
  const driftReason = getDifficultyDriftReason(question, prompt, constraints, examples, tests);
  if (driftReason) {
    lastParseError = driftReason;
    return null;
  }
  return { constraints, estimatedRating, examples, prompt, solutionReveal, tests, title };
}

function createFrontendQuestionVariantPrompt(question: Question) {
  return [
    "Create a fresh playable variant of this React frontend interview practice prompt.",
    "Return JSON only. No markdown, no commentary.",
    "",
    "Rules:",
    "- Keep this as a React + TypeScript frontend challenge.",
    "- Change the UI task enough that it is not the stock prompt, but keep the same broad component family and difficulty.",
    `- Keep the estimated difficulty rating between ${question.rating - RATING_TOLERANCE} and ${question.rating + RATING_TOLERANCE}.`,
    "- Generate frontend checks that grade the changed UI behavior. These checks replace the original checks.",
    "- Put generated checks under frontend.checks.",
    "- Use only these check types: exists, count, clickText, clickCount, inputText.",
    "- Use stable class selectors such as .filter-button or .item-card. Do not use data-testid.",
    "- Include 3 to 5 checks covering initial render and at least one interaction when the prompt is interactive.",
    "- Include starter files only. App.tsx must not solve the challenge; it should render a TODO placeholder and may include static seed data constants.",
    "- styles.css may include light scaffolding styles, but must not hide required elements or fake passing checks.",
    "- Keep prompt text concise: 1 or 2 sentences, under 45 words.",
    "- Constraints must be short requirement bullets, not implementation steps.",
    "- Do not mention that this is a variant, remix, hidden test, LeetCode, or NeetCode.",
    "",
    "JSON schema:",
    "{\"title\":\"string\",\"estimatedRating\":1420,\"prompt\":\"string\",\"constraints\":[\"string\"],\"examples\":[{\"input\":\"string\",\"output\":\"string\",\"explanation\":\"string\"}],\"frontend\":{\"wireframe\":[\"string\"],\"checks\":[{\"name\":\"string\",\"type\":\"exists|count|clickText|clickCount|inputText\",\"selector\":\".class\",\"value\":3,\"textIncludes\":\"text\"}],\"files\":{\"App.tsx\":\"string\",\"styles.css\":\"string\"}}}",
    "",
    `Original title: ${question.title}`,
    `Original rating: ${question.rating}`,
    `Original prompt: ${question.prompt}`,
    `Topics: ${question.topics.join(", ")}`,
    `Constraints: ${JSON.stringify(question.constraints)}`,
    `Examples: ${JSON.stringify(question.examples)}`,
    `Original wireframe: ${JSON.stringify(question.frontend?.wireframe || [])}`,
    `Original frontend checks: ${JSON.stringify(question.frontend?.checks || [])}`,
    `Original starter files for shape only. Replace with starter files for your changed UI: ${JSON.stringify(question.frontend?.files || {})}`
  ].join("\n");
}

function createFrontendQuestionVariantRepairPrompt(question: Question, draft: string, reason = "Invalid JSON") {
  return [
    "Repair this React frontend question-variant draft into valid JSON.",
    "Return one JSON object only. No markdown, no code fence, no commentary.",
    "",
    "Required JSON schema:",
    "{\"title\":\"string\",\"estimatedRating\":1420,\"prompt\":\"string\",\"constraints\":[\"string\"],\"examples\":[{\"input\":\"string\",\"output\":\"string\",\"explanation\":\"string\"}],\"frontend\":{\"wireframe\":[\"string\"],\"checks\":[{\"name\":\"string\",\"type\":\"exists|count|clickText|clickCount|inputText\",\"selector\":\".class\",\"value\":3,\"textIncludes\":\"text\"}],\"files\":{\"App.tsx\":\"string\",\"styles.css\":\"string\"}}}",
    "",
    "Hard requirements:",
    `- estimatedRating must be between ${question.rating - RATING_TOLERANCE} and ${question.rating + RATING_TOLERANCE}.`,
    "- frontend.checks must include at least 3 usable checks.",
    "- App.tsx must be starter code, not a completed solution.",
    "- preserve React + TypeScript frontend challenge format.",
    "",
    `Original title: ${question.title}`,
    `Original rating: ${question.rating}`,
    `Original prompt: ${question.prompt}`,
    `Original frontend checks: ${JSON.stringify(question.frontend?.checks || [])}`,
    "",
    `Parser rejection reason: ${reason}`,
    "Draft to repair:",
    draft.slice(0, MAX_REPAIR_DRAFT_CHARS)
  ].join("\n");
}

function parseFrontendVariantPayload(question: Question, record: Partial<QuestionVariantPayload>): QuestionVariantPayload | null {
  const title = normalizeMeaningfulString(record.title);
  const prompt = normalizeMeaningfulString(record.prompt);
  const constraints = normalizeConstraints(record.constraints);
  const examples = normalizeExamples(record.examples);
  const estimatedRating = normalizeEstimatedRating(record);
  const frontendRecord = getFrontendRecord(record);
  const checks = normalizeFrontendChecks(frontendRecord.checks);
  const files = normalizeFrontendFiles(question, frontendRecord.files);
  const wireframe = normalizeWireframe(frontendRecord.wireframe);
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
  if (checks.length < MIN_FRONTEND_CHECKS) {
    lastParseError = `Codex provided only ${checks.length} usable frontend checks.`;
    return null;
  }
  return {
    constraints,
    estimatedRating,
    examples,
    frontend: {
      checks,
      files,
      wireframe
    },
    prompt,
    tests: [],
    title
  };
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

function normalizeSolutionReveal(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  const text = value.trim();
  if (!text || text.length > MAX_SOLUTION_REVEAL_LENGTH) {
    return "";
  }
  const normalizedHeadings = new Set(
    [...text.matchAll(/^##\s+(.+)$/gim)].map((match) => match[1].trim().toLowerCase())
  );
  const requiredHeadings = ["approach", "code", "complexity"];
  if (!requiredHeadings.every((heading) => normalizedHeadings.has(heading))) {
    return "";
  }
  if (!/```(?:javascript|js)?[\s\S]*?function\s+\w+\s*\(/i.test(text)) {
    return "";
  }
  return text;
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

function getDifficultyDriftReason(question: Question, prompt: string, constraints: string[], examples: QuestionVariantPayload["examples"], tests: TestCase[]) {
  if (question.rating > LOW_RATING_MAX) {
    return "";
  }
  const combinedText = [prompt, ...constraints, ...examples.flatMap((example) => [example.input, example.output, example.explanation || ""])].join(" ");
  if (getReturnShape(question.tests) !== getReturnShape(tests)) {
    return "Codex changed the answer shape for a low-rated question.";
  }
  if (HARD_ALGORITHM_PATTERN.test(combinedText)) {
    return "Codex made the low-rated question require a harder algorithm.";
  }
  if (DISTINCT_OBJECTIVE_PATTERN.test(combinedText) && SECONDARY_REMOVAL_OBJECTIVE_PATTERN.test(combinedText)) {
    return "Codex added multiple optimization objectives for a low-rated question.";
  }
  if (!EXTRA_FEASIBILITY_PATTERN.test(question.prompt) && EXTRA_FEASIBILITY_PATTERN.test(combinedText)) {
    return "Codex added an extra feasibility rule to a low-rated question.";
  }
  if (getReturnShape(question.tests) !== "object" && getReturnShape(tests) === "object") {
    return "Codex changed a low-rated scalar/array answer into a multi-field object.";
  }
  return "";
}

function getReturnShape(tests: TestCase[]) {
  const expected = tests.find((test) => test.expected !== undefined)?.expected;
  if (Array.isArray(expected)) {
    return "array";
  }
  if (expected && typeof expected === "object") {
    return "object";
  }
  return "scalar";
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

function getFrontendRecord(record: Partial<QuestionVariantPayload>) {
  const frontend = record.frontend && typeof record.frontend === "object" ? record.frontend : {};
  const topLevel = record as Partial<NonNullable<QuestionVariantPayload["frontend"]>>;
  return {
    ...frontend,
    checks: (frontend as Partial<NonNullable<QuestionVariantPayload["frontend"]>>).checks ?? topLevel.checks,
    files: (frontend as Partial<NonNullable<QuestionVariantPayload["frontend"]>>).files ?? topLevel.files,
    wireframe: (frontend as Partial<NonNullable<QuestionVariantPayload["frontend"]>>).wireframe ?? topLevel.wireframe
  } as Partial<NonNullable<QuestionVariantPayload["frontend"]>>;
}

function normalizeFrontendChecks(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  const checks: FrontendCheck[] = [];
  const seenNames = new Set<string>();
  for (const check of value) {
    if (!check || typeof check !== "object") {
      continue;
    }
    const record = check as Partial<FrontendCheck>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const selector = typeof record.selector === "string" ? record.selector.trim() : "";
    if (!name || seenNames.has(name) || !selector || !isFrontendCheckType(record.type)) {
      continue;
    }
    const normalized: FrontendCheck = { name, selector, type: record.type };
    if (typeof record.textIncludes === "string" && record.textIncludes.trim()) {
      normalized.textIncludes = record.textIncludes.trim();
    }
    if (record.type === "count") {
      const valueNumber = typeof record.value === "number" && Number.isFinite(record.value) ? Math.max(0, Math.floor(record.value)) : Number.NaN;
      if (!Number.isFinite(valueNumber)) {
        continue;
      }
      normalized.value = valueNumber;
    }
    if (record.type === "clickCount") {
      if (typeof record.value !== "string" || !record.value.trim()) {
        continue;
      }
      normalized.value = record.value.trim();
    }
    if (record.type === "clickText" && !normalized.textIncludes) {
      continue;
    }
    if (record.type === "inputText") {
      if (typeof record.value !== "string" || !record.value.trim() || !normalized.textIncludes) {
        continue;
      }
      normalized.value = record.value;
    }
    seenNames.add(name);
    checks.push(normalized);
    if (checks.length >= MAX_FRONTEND_CHECKS) {
      break;
    }
  }
  return checks;
}

function isFrontendCheckType(type: unknown): type is FrontendCheck["type"] {
  return type === "clickCount" || type === "clickText" || type === "count" || type === "exists" || type === "inputText";
}

function normalizeFrontendFiles(question: Question, value: unknown): NonNullable<QuestionVariantPayload["frontend"]>["files"] {
  const fallback = createDefaultFrontendStarter(question);
  if (!value || typeof value !== "object") {
    return fallback;
  }
  const record = value as Record<string, unknown>;
  const appFile = normalizeFrontendFile(record[FRONTEND_APP_FILE], fallback[FRONTEND_APP_FILE]);
  const cssFile = normalizeFrontendFile(record[FRONTEND_CSS_FILE], fallback[FRONTEND_CSS_FILE]);
  return {
    [FRONTEND_APP_FILE]: appFile,
    [FRONTEND_CSS_FILE]: cssFile
  };
}

function normalizeFrontendFile(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed && trimmed.length <= MAX_FRONTEND_FILE_LENGTH ? trimmed : fallback;
}

function createDefaultFrontendStarter(question: Question): NonNullable<QuestionVariantPayload["frontend"]>["files"] {
  return {
    [FRONTEND_APP_FILE]: `import React from "react";\nimport "./styles.css";\n\nexport default function App() {\n  // TODO: Build the UI for: ${question.title}\n  return <main>{/* TODO: Implement the requested experience. */}</main>;\n}`,
    [FRONTEND_CSS_FILE]: `body {\n  margin: 0;\n  font-family: Inter, system-ui, sans-serif;\n}\n\nmain {\n  padding: 24px;\n}`
  };
}

function normalizeWireframe(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((line): line is string => typeof line === "string")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(0, MAX_WIREFRAME_LINE_LENGTH))
    .slice(0, MAX_WIREFRAME_LINES);
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
