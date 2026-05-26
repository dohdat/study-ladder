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

  it("keeps inline object literals from affecting block indentation", () => {
    expect(beautifyCode(`function hasBalancedVowels(text) {
const values = { a: 1, e: 2, i: 3, o: 4, u: 5 };
const n = text.length;
const half = Math.floor(n / 2);

let leftSum = 0;
let rightSum = 0;

for (let i = 0; i < half; i++) {
const c = text[i].toLowerCase();
leftSum += values[c] || 0;
}

const rightStart = n % 2 === 0 ? half : half + 1;
for (let i = rightStart; i < n; i++) {
const c = text[i].toLowerCase();
rightSum += values[c] || 0;
}

return leftSum === rightSum;
}`)).toBe([
      "function hasBalancedVowels(text) {",
      "  const values = { a: 1, e: 2, i: 3, o: 4, u: 5 };",
      "  const n = text.length;",
      "  const half = Math.floor(n / 2);",
      "  let leftSum = 0;",
      "  let rightSum = 0;",
      "  for (let i = 0; i < half; i++) {",
      "    const c = text[i].toLowerCase();",
      "    leftSum += values[c] || 0;",
      "  }",
      "  const rightStart = n % 2 === 0 ? half : half + 1;",
      "  for (let i = rightStart; i < n; i++) {",
      "    const c = text[i].toLowerCase();",
      "    rightSum += values[c] || 0;",
      "  }",
      "  return leftSum === rightSum;",
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

  it("keeps arrow function assignment semicolons on the closing brace line", () => {
    expect(beautifyCode("function solve(arr) {\nconst dfs = (node) => {\nif (!node) return 0;\nconst left = dfs(node.left);\nconst right = dfs(node.right);\nreturn Math.max(left, right) + 1;\n};\n}")).toBe([
      "function solve(arr) {",
      "  const dfs = (node) => {",
      "    if (!node) return 0;",
      "    const left = dfs(node.left);",
      "    const right = dfs(node.right);",
      "    return Math.max(left, right) + 1;",
      "  };",
      "}",
      ""
    ].join("\n"));
  });
});
