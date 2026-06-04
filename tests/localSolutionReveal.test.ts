import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { createLocalSolutionReveal } from "../lib/localSolutionReveal";

describe("localSolutionReveal", () => {
  it("builds an instant reveal from generated runner tests", () => {
    const question = questions[0];
    const reveal = createLocalSolutionReveal(question, "function firstDuplicate(nums) {}");

    expect(reveal).toContain("## Approach");
    expect(reveal).toContain("## Code");
    expect(reveal).toContain(`function ${question.functionName}`);
    expect(reveal).toContain(JSON.stringify(question.tests[0].expected));
    expect(reveal).toContain("## Complexity");
    expect(reveal).not.toContain("## Compare with my code");
  });

  it("builds copied code that passes the stored tests", () => {
    const question = questions.find((candidate) => candidate.functionName === "hasBalancedVowels") || questions[0];
    const reveal = createLocalSolutionReveal(question, "");
    const code = reveal.match(/```js\n([\s\S]*?)\n```/)?.[1] || "";
    const run = new Function(`${code}; return ${question.functionName};`)() as (...args: unknown[]) => unknown;

    for (const test of question.tests) {
      expect(run(...test.args)).toEqual(test.expected);
    }
  });

  it("uses a real algorithm for balanced vowels instead of a generated answer table", () => {
    const question = questions.find((candidate) => candidate.functionName === "hasBalancedVowels") || questions[0];
    const reveal = createLocalSolutionReveal(question, "");

    expect(reveal).toContain("text.slice(0, half)");
    expect(reveal).toContain("text.slice(text.length - half)");
    expect(reveal).toContain("countVowels");
    expect(reveal).not.toContain("const cases =");
    expect(reveal).not.toContain("No generated answer was stored");
  });
});
