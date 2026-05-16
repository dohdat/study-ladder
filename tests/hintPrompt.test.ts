import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { createHintPrompt } from "../lib/hintPrompt";

describe("hintPrompt", () => {
  it("asks Codex for only the next step, not the solution", () => {
    const prompt = createHintPrompt(questions[0], "function firstDuplicate(nums) {}");

    expect(prompt).toContain("Give me exactly one next-step hint.");
    expect(prompt).toContain("Do not provide the full solution");
    expect(prompt).toContain(questions[0].title);
    expect(prompt).toContain("function firstDuplicate");
  });
});
