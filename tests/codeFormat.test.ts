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

  it("keeps for loop headers on one line", () => {
    expect(beautifyCode("function test(){\nfor(let i=0;i<nums.length;i++){\nconsole.log(nums[i])\n}\n}")).toBe([
      "function test() {",
      "  for (let i=0;i<nums.length;i++) {",
      "    console.log(nums[i]);",
      "  }",
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

  it("closes simple missing parentheses and brackets", () => {
    expect(beautifyCode("const seen = new Set(\narr.push(nums[i]")).toBe([
      "const seen = new Set();",
      "arr.push(nums[i]);",
      ""
    ].join("\n"));
  });

  it("adds missing empty constructor brackets", () => {
    expect(beautifyCode("function test(){\nconst freq = new Map\nconst seen = new Set\nreturn freq\n}")).toBe([
      "function test() {",
      "  const freq = new Map();",
      "  const seen = new Set();",
      "  return freq;",
      "}",
      ""
    ].join("\n"));
  });

  it("adds missing closing braces", () => {
    expect(beautifyCode("function test() {\nif (ok) {\nreturn true")).toBe([
      "function test() {",
      "  if (ok) {",
      "    return true;",
      "  }",
      "}",
      ""
    ].join("\n"));
  });
});
