import { describe, expect, it } from "vitest";

import { RELIC_DEFINITIONS } from "../lib/relicCore";
import type { Relic } from "../types/study";

describe("relicCore", () => {
  it("keeps relic ids and effects unique", () => {
    const ids = RELIC_DEFINITIONS.map((relic) => relic.id);
    const names = RELIC_DEFINITIONS.map((relic) => relic.name);
    const effectSignatures = RELIC_DEFINITIONS.map(getEffectSignature);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(effectSignatures).size).toBe(effectSignatures.length);
  });
});

function getEffectSignature(relic: Relic) {
  return (relic.modifiers || [])
    .filter((modifier) => modifier.value !== 0)
    .map((modifier) => `${modifier.key}:${modifier.value}`)
    .sort()
    .join("|");
}
