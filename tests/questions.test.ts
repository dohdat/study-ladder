import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";

const MIN_TEST_CASES_PER_QUESTION = 10;
const MIN_QUESTION_BANK_SIZE = 150;

describe("question bank", () => {
  it("contains at least one hundred fifty questions", () => {
    expect(questions.length).toBeGreaterThanOrEqual(MIN_QUESTION_BANK_SIZE);
  });

  it("keeps question ids and function names unique", () => {
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.functionName)).size).toBe(questions.length);
  });

  it("keeps every question covered by at least ten runner test cases", () => {
    const underCovered = questions
      .filter((question) => question.tests.length < MIN_TEST_CASES_PER_QUESTION)
      .map((question) => `${question.id}: ${question.tests.length}`);

    expect(underCovered).toEqual([]);
  });
});
