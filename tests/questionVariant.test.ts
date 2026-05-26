import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { createQuestionVariant, createQuestionVariantPrompt, createQuestionVariantRepairPrompt, createQuestionVariantResult } from "../lib/questionVariant";

const SOLUTION_REVEAL = [
  "## Approach",
  "- Count the needed state.",
  "## Code",
  "```js",
  "function firstDuplicate(nums) {",
  "  return nums[0];",
  "}",
  "```",
  "## Complexity",
  "O(n) time and O(1) space."
].join("\n");

describe("questionVariant", () => {
  it("asks Codex to preserve callable inputs while changing the playable contract", () => {
    const prompt = createQuestionVariantPrompt(questions[0]);

    expect(prompt).toContain("Preserve the exact function name and argument list");
    expect(prompt).toContain("Keep the same return shape");
    expect(prompt).toContain("Keep the estimated difficulty rating");
    expect(prompt).toContain("estimatedRating");
    expect(prompt).toContain("Generate new tests for your changed semantics");
    expect(prompt).toContain("solutionReveal");
    expect(prompt).toContain("Keep prompt text concise");
    expect(prompt).toContain("not HOW to solve it");
    expect(prompt).toContain("Use a tiny object only if");
    expect(prompt).toContain(questions[0].functionName);
    expect(prompt).toContain("Return JSON only");
  });

  it("asks Codex for frontend checks and starter files for frontend variants", () => {
    const frontendQuestion = questions.find((question) => question.id === "frontend-star-rating-component") || questions[0];
    const prompt = createQuestionVariantPrompt(frontendQuestion);

    expect(prompt).toContain("React frontend interview practice prompt");
    expect(prompt).toContain("frontend.checks");
    expect(prompt).toContain("starter files only");
    expect(prompt).toContain("Use only these check types");
    expect(prompt).toContain("Original frontend checks");
  });

  it("applies changed tests while keeping original question identity", () => {
    const original = questions[0];
    const variantTests = [
      { name: "returns repeated value", args: [[1, 2, 1]], expected: 1 },
      { name: "reports no repeat", args: [[1, 2, 3]], expected: -1 },
      { name: "handles immediate repeat", args: [[7, 7, 1]], expected: 7 },
      { name: "prefers first repeated value", args: [[5, 1, 5, 1]], expected: 5 },
      { name: "handles negative repeats", args: [[-1, 2, -1]], expected: -1 },
      { name: "handles zero repeats", args: [[0, 4, 0]], expected: 0 }
    ];
    const variant = createQuestionVariant(original, JSON.stringify({
      constraints: ["Use the same arguments.", "Return -1 when no value repeats."],
      estimatedRating: original.rating,
      examples: [{ input: "nums = [1,2,1]", output: "1", explanation: "The repeated value is detected." }],
      prompt: "A log scanner receives event codes and needs the first code that appears twice while reading left to right.",
      solutionReveal: SOLUTION_REVEAL,
      tests: variantTests,
      title: "First Repeated Event Code"
    }));

    expect(variant).toMatchObject({
      id: original.id,
      difficulty: original.difficulty,
      functionName: original.functionName,
      rating: original.rating,
      solutionReveal: SOLUTION_REVEAL,
      tests: variantTests,
      title: "First Repeated Event Code"
    });
    expect(variant?.prompt).not.toBe(original.prompt);
  });

  it("applies frontend checks and starter files for frontend variants", () => {
    const original = questions.find((question) => question.id === "frontend-star-rating-component") || questions[0];
    const result = createQuestionVariantResult(original, JSON.stringify({
      constraints: ["Render three plan cards.", "Clicking a plan marks it selected.", "Show the selected plan name."],
      estimatedRating: original.rating,
      examples: [{ input: "Click Pro", output: "Selected: Pro", explanation: "The selected plan label updates after the click." }],
      frontend: {
        checks: [
          { name: "renders plan cards", selector: ".plan-card", type: "count", value: 3 },
          { name: "shows default label", selector: ".selected-plan", textIncludes: "No plan selected", type: "exists" },
          { name: "clicking pro updates label", selector: ".plan-card:nth-of-type(2)", textIncludes: "Selected: Pro", type: "clickText" }
        ],
        files: {
          "App.tsx": "import React from \"react\";\nimport \"./styles.css\";\n\nexport default function App() {\n  return <main>{/* TODO: build pricing selector */}</main>;\n}",
          "styles.css": "main { padding: 24px; }"
        },
        wireframe: ["+----------------+", "| Pricing cards |", "+----------------+"]
      },
      prompt: "Build a React pricing selector where users choose one of three plans and see the selected plan.",
      title: "Pricing Plan Selector"
    }));

    expect(result.error).toBeUndefined();
    expect(result.question).toMatchObject({
      id: original.id,
      title: "Pricing Plan Selector",
      tests: []
    });
    expect(result.question?.frontend?.checks).toHaveLength(3);
    expect(result.question?.frontend?.files["App.tsx"]).toContain("pricing selector");
    expect(result.question?.frontend?.wireframe).toContain("| Pricing cards |");
  });

  it("rejects malformed variant output", () => {
    expect(createQuestionVariant(questions[0], "not json")).toBeNull();
    expect(createQuestionVariant(questions[0], JSON.stringify({ title: "Too short" }))).toBeNull();
    expect(createQuestionVariant(questions[0], JSON.stringify({
      constraints: ["Valid constraint."],
      estimatedRating: questions[0].rating,
      examples: [{ input: "nums = [1,2]", output: "2" }],
      prompt: "This has display fields but no playable generated tests.",
      title: "Missing Tests"
    }))).toBeNull();
    expect(createQuestionVariant(questions[0], JSON.stringify({
      constraints: ["Valid constraint."],
      estimatedRating: questions[0].rating,
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
      estimatedRating: questions[0].rating + 300,
      examples: [{ input: "nums = [1,2,1]", output: "1" }],
      prompt: "Return the first repeated number in nums, or -1 when no number repeats.",
      tests: [
        { name: "case 1", args: [[1]], expected: 1 },
        { name: "case 2", args: [[2]], expected: 2 },
        { name: "case 3", args: [[3]], expected: 3 },
        { name: "case 4", args: [[4]], expected: 4 },
        { name: "case 5", args: [[5]], expected: 5 },
        { name: "case 6", args: [[6]], expected: 6 }
      ],
      title: "Too Hard"
    }))).toBeNull();
  });

  it("accepts common Codex aliases for rating and args", () => {
    const original = questions[0];
    const result = createQuestionVariantResult(original, JSON.stringify({
      constraints: ["Return null when no answer exists."],
      estimated_rating: String(original.rating),
      examples: [{ input: "nums = [1,2,1]", output: "1" }],
      prompt: "Return the first repeated number in nums, or null when no number repeats.",
      solutionReveal: SOLUTION_REVEAL,
      tests: [
        { name: "case 1", inputArgs: [[1, 2, 1]], expected: 1 },
        { name: "case 2", inputArgs: [[1, 2, 3]], expected: null },
        { name: "case 3", inputArgs: [[7, 7]], expected: 7 },
        { name: "case 4", inputArgs: [[0, 4, 0]], expected: 0 },
        { name: "case 5", inputArgs: [[-1, 2, -1]], expected: -1 }
      ],
      title: "Repeated Number Signal"
    }));

    expect(result.error).toBeUndefined();
    expect(result.question?.tests).toHaveLength(5);
  });

  it("builds a repair prompt for invalid Codex drafts", () => {
    const prompt = createQuestionVariantRepairPrompt(questions[0], "not json", "Codex did not return a JSON object.");

    expect(prompt).toContain("Repair this question-variant draft into valid JSON.");
    expect(prompt).toContain("Return one JSON object only.");
    expect(prompt).toContain("Parser rejection reason: Codex did not return a JSON object.");
    expect(prompt).toContain("Draft to repair:");
    expect(prompt).toContain("solutionReveal must be included");
    expect(prompt).not.toContain("Compare with my code");
    expect(prompt).toContain(questions[0].functionName);
  });

  it("rejects low-rated variants that drift into harder optimization", () => {
    const original = questions.find((question) => question.id === "external-reduce-array-half-v2") || questions[0];
    const result = createQuestionVariantResult(original, JSON.stringify({
      constraints: [
        "Removing a value deletes all its occurrences from the array.",
        "At least one element must remain after deletions.",
        "First minimize distinct deletions, then minimize removed."
      ],
      estimatedRating: original.rating,
      examples: [{ input: "arr = [3,3,3,3,5,5,5,2,2,7]", output: "{\"distinct\":2,\"removed\":5}" }],
      prompt: "Return {distinct, removed} for the smallest number of distinct values whose complete removal deletes at least half the array while leaving at least one element.",
      solutionReveal: SOLUTION_REVEAL,
      tests: [
        { name: "case 1", args: [[3, 3, 3, 3, 5, 5, 5, 2, 2, 7]], expected: { distinct: 2, removed: 5 } },
        { name: "case 2", args: [[7, 7, 7, 7, 7, 7]], expected: { distinct: 0, removed: 0 } },
        { name: "case 3", args: [[1, 2, 3, 4]], expected: { distinct: 2, removed: 2 } },
        { name: "case 4", args: [[1, 1, 2, 2, 3]], expected: { distinct: 1, removed: 2 } },
        { name: "case 5", args: [[0, 0, -1, -1, 2]], expected: { distinct: 1, removed: 2 } }
      ],
      title: "Minimum Distinct Deletions with Retained Remainder"
    }));

    expect(result.question).toBeNull();
    expect(result.error).toMatch(/answer shape|multiple optimization|extra feasibility|multi-field object|harder algorithm/);
  });

  it("rejects low-rated count variants that ask for chosen values instead", () => {
    const original = questions.find((question) => question.id === "external-reduce-array-half-v2") || questions[0];
    const result = createQuestionVariantResult(original, JSON.stringify({
      constraints: [
        "Remove all copies of each chosen value.",
        "Return an array of distinct chosen values.",
        "If multiple answers use the same fewest values, return the lexicographically smallest sorted chosen-values list."
      ],
      estimatedRating: original.rating,
      examples: [
        {
          explanation: "Removing all 3s and 5s deletes 7 items, which is at least half of 10.",
          input: "arr = [3,3,3,3,5,5,5,2,2,7]",
          output: "[3,5]"
        }
      ],
      prompt: "Choose the fewest distinct values so removing every occurrence deletes at least half the array, then return the chosen values.",
      solutionReveal: SOLUTION_REVEAL,
      tests: [
        { name: "case 1", args: [[3, 3, 3, 3, 5, 5, 5, 2, 2, 7]], expected: [3, 5] },
        { name: "case 2", args: [[7, 7, 7, 7, 7, 7]], expected: [7] },
        { name: "case 3", args: [[1, 2, 3, 4]], expected: [1, 2] },
        { name: "case 4", args: [[1, 1, 2, 2, 3, 3]], expected: [1, 2] },
        { name: "case 5", args: [[0, 0, -1, -1, 2]], expected: [-1, 0] }
      ],
      title: "Value Set to Halve Array"
    }));

    expect(result.question).toBeNull();
    expect(result.error).toBe("Codex changed the answer shape for a low-rated question.");
  });
});
