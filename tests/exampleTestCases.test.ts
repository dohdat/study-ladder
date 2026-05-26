import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { ensureMinimumVisibleExamples, getVisibleRunCodeTests } from "../lib/exampleTestCases";
import type { Question } from "../types/study";

const baseQuestion: Question = {
  constraints: [],
  difficulty: 1,
  examples: [],
  functionName: "solve",
  id: "example-test",
  prompt: "Test prompt",
  rating: 1000,
  starter: "function solve() {\n  \n}",
  tests: [
    { args: [[]], expected: -1, name: "hidden empty" },
    { args: [[1]], expected: 1, name: "hidden single" },
    { args: [[2, 2]], expected: 2, name: "hidden duplicate" }
  ],
  title: "Example Test",
  topics: []
};

describe("exampleTestCases", () => {
  it("uses examples for visible run-code tests", () => {
    const tests = getVisibleRunCodeTests({
      ...baseQuestion,
      examples: [
        { input: "nums = [2,3,-1,8,4]", output: "3" },
        { input: "nums = [2,5]", output: "-1" }
      ]
    }, 3);

    expect(tests).toEqual([
      { args: [[2, 3, -1, 8, 4]], expected: 3, name: "Example 1" },
      { args: [[2, 5]], expected: -1, name: "Example 2" },
      { args: [[]], expected: -1, name: "hidden empty" }
    ]);
  });

  it("parses multiple arguments and structured output", () => {
    const tests = getVisibleRunCodeTests({
      ...baseQuestion,
      examples: [
        { input: "boxTypes = [[1,3],[2,2],[3,1]], truckSize = 4", output: "[1,2]" },
        { input: "s = \"abca\", k = 1", output: "true" },
        { input: "root = { val: 1, left: { val: 2 } }", output: "2" }
      ]
    }, 3);

    expect(tests[0]).toEqual({ args: [[[1, 3], [2, 2], [3, 1]], 4], expected: [1, 2], name: "Example 1" });
    expect(tests[1]).toEqual({ args: ["abca", 1], expected: true, name: "Example 2" });
    expect(tests[2]).toEqual({ args: [{ val: 1, left: { val: 2 } }], expected: 2, name: "Example 3" });
  });

  it("falls back to hidden tests when examples are not parseable", () => {
    const tests = getVisibleRunCodeTests({
      ...baseQuestion,
      examples: [{ input: "nums = not shown", output: "-1" }]
    }, 1);

    expect(tests).toEqual([{ args: [[]], expected: -1, name: "hidden empty" }]);
  });

  it("fills missing visible examples from runner tests", () => {
    const question = ensureMinimumVisibleExamples({
      ...baseQuestion,
      examples: [{ input: "nums = [1]", output: "1", explanation: "Single value." }],
      starter: "function solve(nums) {\n  \n}"
    });

    expect(question.examples).toHaveLength(3);
    expect(question.examples[1]).toEqual({
      explanation: "This runner case checks hidden empty.",
      input: "nums = []",
      output: "-1"
    });
    expect(getVisibleRunCodeTests(question, 3)).toHaveLength(3);
  });

  it("provides three visible run-code cases for every runnable question", () => {
    const missingCases = questions
      .filter((question) => !question.frontend)
      .map((question) => ({ cases: getVisibleRunCodeTests(question, 3), question }))
      .filter(({ cases }) => cases.length < 3)
      .map(({ cases, question }) => `${question.id}: ${cases.length}`);

    expect(missingCases).toEqual([]);
  });
});
