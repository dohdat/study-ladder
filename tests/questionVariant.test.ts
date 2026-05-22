import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { createQuestionVariant, createQuestionVariantPrompt } from "../lib/questionVariant";

describe("questionVariant", () => {
  it("asks Codex to preserve callable inputs while changing the playable contract", () => {
    const prompt = createQuestionVariantPrompt(questions[0]);

    expect(prompt).toContain("Preserve the exact function name and argument list");
    expect(prompt).toContain("You MAY change the return semantics");
    expect(prompt).toContain("Generate new tests for your changed semantics");
    expect(prompt).toContain("Keep prompt text concise");
    expect(prompt).toContain("not HOW to solve it");
    expect(prompt).toContain("tiny object with at most 2 fields");
    expect(prompt).toContain(questions[0].functionName);
    expect(prompt).toContain("Return JSON only");
  });

  it("applies changed tests while keeping original question identity", () => {
    const original = questions[0];
    const variantTests = [
      { name: "returns repeated value with count", args: [[1, 2, 1]], expected: { value: 1, count: 2 } },
      { name: "reports no repeat", args: [[1, 2, 3]], expected: null },
      { name: "handles immediate repeat", args: [[7, 7, 1]], expected: { value: 7, count: 2 } },
      { name: "prefers first repeated scan", args: [[5, 1, 5, 1]], expected: { value: 5, count: 2 } },
      { name: "handles negative repeats", args: [[-1, 2, -1]], expected: { value: -1, count: 2 } },
      { name: "handles zero repeats", args: [[0, 4, 0]], expected: { value: 0, count: 2 } }
    ];
    const variant = createQuestionVariant(original, JSON.stringify({
      constraints: ["Use the same arguments.", "Return the same output shape."],
      examples: [{ input: "nums = [1,2,1]", output: "1", explanation: "The repeated value is detected." }],
      prompt: "A log scanner receives event codes and needs the first code that appears twice while reading left to right.",
      tests: variantTests,
      title: "First Repeated Event Code"
    }));

    expect(variant).toMatchObject({
      id: original.id,
      difficulty: original.difficulty,
      functionName: original.functionName,
      rating: original.rating,
      tests: variantTests,
      title: "First Repeated Event Code"
    });
    expect(variant?.prompt).not.toBe(original.prompt);
  });

  it("rejects malformed variant output", () => {
    expect(createQuestionVariant(questions[0], "not json")).toBeNull();
    expect(createQuestionVariant(questions[0], JSON.stringify({ title: "Too short" }))).toBeNull();
    expect(createQuestionVariant(questions[0], JSON.stringify({
      constraints: ["Valid constraint."],
      examples: [{ input: "nums = [1,2]", output: "2" }],
      prompt: "This has display fields but no playable generated tests.",
      title: "Missing Tests"
    }))).toBeNull();
    expect(createQuestionVariant(questions[0], JSON.stringify({
      constraints: ["Valid constraint."],
      examples: [{ input: "nums = [1,2]", output: "2" }],
      prompt: "Long ".repeat(140),
      tests: [
        { name: "case 1", args: [[1]], expected: 1 },
        { name: "case 2", args: [[2]], expected: 2 },
        { name: "case 3", args: [[3]], expected: 3 },
        { name: "case 4", args: [[4]], expected: 4 },
        { name: "case 5", args: [[5]], expected: 5 },
        { name: "case 6", args: [[6]], expected: 6 }
      ],
      title: "Prompt Too Long"
    }))).toBeNull();
    expect(createQuestionVariant(questions[0], JSON.stringify({
      constraints: ["Return -1 when no answer exists."],
      examples: [{ input: "nums = [1,2,1]", output: "1" }],
      prompt: "Scan the array with a hash map and return the first duplicated number.",
      tests: [
        { name: "case 1", args: [[1]], expected: 1 },
        { name: "case 2", args: [[2]], expected: 2 },
        { name: "case 3", args: [[3]], expected: 3 },
        { name: "case 4", args: [[4]], expected: 4 },
        { name: "case 5", args: [[5]], expected: 5 },
        { name: "case 6", args: [[6]], expected: 6 }
      ],
      title: "Gives Away Strategy"
    }))).toBeNull();
  });
});
