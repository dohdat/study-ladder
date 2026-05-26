import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("sandbox console serialization", () => {
  it("prints Map contents instead of JSON empty objects", () => {
    const sandbox = readFileSync("public/sandbox.js", "utf8");

    expect(sandbox).toContain("value instanceof Map");
    expect(sandbox).toContain("Map(${value.size})");
    expect(sandbox).toContain("value instanceof Set");
    expect(sandbox).toContain("Object.entries(value)");
    expect(sandbox).toContain("[Circular]");
  });
});
