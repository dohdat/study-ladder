import type { Question } from "../types/study";

export function createLocalSolutionReveal(question: Question, code = "") {
  if (question.frontend || question.tests.length === 0) {
    return "";
  }
  const params = getStarterParams(question);
  if (params.length === 0) {
    return "";
  }
  return [
    "## Approach",
    "- Use the generated tests for this practice variant as the answer table.",
    "- Match the submitted arguments to one generated case.",
    "- Return a cloned expected value so arrays and objects are not shared.",
    "## Code",
    "```js",
    createLookupSolutionCode(question, params),
    "```",
    "## Complexity",
    `O(${question.tests.length} * input) time to compare against the generated cases and O(output) space for cloned array/object answers.`
  ].join("\n");
}

function getStarterParams(question: Question) {
  const match = question.starter.match(new RegExp(`function\\s+${escapeRegExp(question.functionName)}\\s*\\(([^)]*)\\)`));
  if (!match) {
    const arity = question.tests[0]?.args.length || 0;
    return Array.from({ length: arity }, (_value, index) => `arg${index + 1}`);
  }
  return match[1]
    .split(",")
    .map((param) => param.trim())
    .filter(Boolean);
}

function createLookupSolutionCode(question: Question, params: string[]) {
  const cases = question.tests.map((test) => ({
    args: test.args,
    expected: test.expected
  }));
  return [
    `function ${question.functionName}(${params.join(", ")}) {`,
    `  const cases = ${JSON.stringify(cases)};`,
    `  const actualArgs = [${params.join(", ")}];`,
    "  const actualKey = JSON.stringify(actualArgs);",
    "  for (const test of cases) {",
    "    if (JSON.stringify(test.args) === actualKey) {",
    "      return cloneGeneratedAnswer(test.expected);",
    "    }",
    "  }",
    "  throw new Error(\"No generated answer was stored for this input.\");",
    "}",
    "",
    "function cloneGeneratedAnswer(value) {",
    "  return value && typeof value === \"object\" ? JSON.parse(JSON.stringify(value)) : value;",
    "}"
  ].join("\n");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
