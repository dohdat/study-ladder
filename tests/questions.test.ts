import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";

const MIN_TEST_CASES_PER_QUESTION = 10;

describe("question bank", () => {
  it("keeps every question covered by at least ten runner test cases", () => {
    const underCovered = questions
      .filter((question) => question.tests.length < MIN_TEST_CASES_PER_QUESTION)
      .map((question) => `${question.id}: ${question.tests.length}`);

    expect(underCovered).toEqual([]);
  });
});
