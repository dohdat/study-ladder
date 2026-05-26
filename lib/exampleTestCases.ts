import type { Question, TestCase } from "../types/study";

type ParsedValue = { ok: true; value: unknown } | { ok: false };

export function getVisibleRunCodeTests(question: Question, count: number): TestCase[] {
  const tests = question.examples
    .map((example, index) => createExampleTest(example, index))
    .filter((test): test is TestCase => Boolean(test));
  const seenArgs = new Set(tests.map((test) => JSON.stringify(test.args)));
  for (const test of question.tests) {
    if (tests.length >= count) {
      break;
    }
    const key = JSON.stringify(test.args);
    if (seenArgs.has(key)) {
      continue;
    }
    tests.push(test);
    seenArgs.add(key);
  }
  return tests.slice(0, count);
}

export function ensureMinimumVisibleExamples(question: Question, count = 3): Question {
  if (question.examples.length >= count || !question.tests.length) {
    return question;
  }
  const examples = [...question.examples];
  const seenInputs = new Set(examples.map((example) => example.input));
  const argNames = getStarterArgumentNames(question.starter);
  for (const test of question.tests) {
    if (examples.length >= count) {
      break;
    }
    const input = formatNamedArgs(test.args, argNames);
    if (seenInputs.has(input)) {
      continue;
    }
    examples.push({
      input,
      output: formatExampleOutput(test.expected),
      explanation: `This runner case checks ${test.name.replace(/\s*-\s*edge\s+\d+:.*/i, "").toLowerCase()}.`
    });
    seenInputs.add(input);
  }
  return examples.length === question.examples.length ? question : { ...question, examples };
}

function createExampleTest(example: Question["examples"][number], index: number): TestCase | null {
  const args = parseExampleInput(example.input);
  const expected = parseExampleOutput(example.output);
  if (!args || !expected.ok) {
    return null;
  }
  return {
    args,
    expected: expected.value,
    name: `Example ${index + 1}`
  };
}

function parseExampleInput(input: string): unknown[] | null {
  const parts = splitTopLevel(input, ",")
    .map((part) => {
      const equalsIndex = findTopLevelEquals(part);
      return (equalsIndex >= 0 ? part.slice(equalsIndex + 1) : part).trim();
    })
    .filter(Boolean);
  if (!parts.length) {
    return [];
  }
  const values = parts.map((part) => parseValue(part, false));
  return values.every((value) => value.ok) ? values.map((value) => value.value) : null;
}

function parseExampleOutput(output: string): ParsedValue {
  return parseValue(output, true);
}

function getStarterArgumentNames(starter: string) {
  return starter.match(/\(([^)]*)\)/)?.[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean) || [];
}

function formatNamedArgs(args: unknown[], names: string[]) {
  return args.map((arg, index) => `${names[index] || `arg${index + 1}`} = ${JSON.stringify(arg)}`).join(", ");
}

function formatExampleOutput(value: unknown) {
  return value === undefined ? "undefined" : JSON.stringify(value);
}

function parseValue(text: string, allowBareString: boolean): ParsedValue {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false };
  }
  if (trimmed === "undefined") {
    return { ok: true, value: undefined };
  }
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    const normalized = normalizeJsonLikeValue(trimmed);
    if (normalized !== trimmed) {
      try {
        return { ok: true, value: JSON.parse(normalized) };
      } catch {
        return parseNonJsonValue(trimmed, allowBareString);
      }
    }
    return parseNonJsonValue(trimmed, allowBareString);
  }
}

function normalizeJsonLikeValue(text: string) {
  return text
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, "$1\"$2\":")
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_match, value: string) => JSON.stringify(value));
}

function parseNonJsonValue(trimmed: string, allowBareString: boolean): ParsedValue {
  if (/^-?(?:\d+|\d*\.\d+)$/.test(trimmed)) {
    return { ok: true, value: Number(trimmed) };
  }
  return allowBareString ? { ok: true, value: trimmed } : { ok: false };
}

function splitTopLevel(text: string, delimiter: string) {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let quote: string | null = null;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];
    if (quote) {
      if (char === quote && previous !== "\\") {
        quote = null;
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[" || char === "{" || char === "(") {
      depth += 1;
      continue;
    }
    if (char === "]" || char === "}" || char === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (char === delimiter && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

function findTopLevelEquals(text: string) {
  let depth = 0;
  let quote: string | null = null;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];
    if (quote) {
      if (char === quote && previous !== "\\") {
        quote = null;
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[" || char === "{" || char === "(") {
      depth += 1;
      continue;
    }
    if (char === "]" || char === "}" || char === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (char === "=" && depth === 0) {
      return index;
    }
  }
  return -1;
}
