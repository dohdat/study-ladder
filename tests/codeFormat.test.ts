import { describe, expect, it } from "vitest";

import { beautifyCode } from "../lib/codeFormat";

describe("beautifyCode", () => {
  it("adds semicolons to common statement lines", () => {
    expect(beautifyCode("function test(){\nconst x = 1\nreturn x\n}")).toBe([
      "function test() {",
      "  const x = 1;",
      "  return x;",
      "}",
      ""
    ].join("\n"));
  });

  it("keeps control flow and existing semicolons intact", () => {
    expect(beautifyCode("if (ok) {\nrun();\n} else {\nthrow new Error('x')\n}")).toBe([
      "if (ok) {",
      "  run();",
      "} else {",
      "  throw new Error('x');",
      "}",
      ""
    ].join("\n"));
  });

  it("adds semicolons to calls, assignments, and updates", () => {
    expect(beautifyCode("count++\nvalue = getValue()\nsave(value)")).toBe([
      "count++;",
      "value = getValue();",
      "save(value);",
      ""
    ].join("\n"));
  });
});
