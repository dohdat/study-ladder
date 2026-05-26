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
});
