import { describe, expect, it } from "vitest";

import { getRelicQualityLabel } from "../lib/heroSiegeQuality";
import { RELIC_DEFINITIONS } from "../lib/relicCore";

describe("relicCore", () => {
  it("keeps relic ids and effects unique", () => {
    const ids = RELIC_DEFINITIONS.map((relic) => relic.id);
    const names = RELIC_DEFINITIONS.map((relic) => relic.name);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("caps relic modifiers by displayed quality", () => {
    const rules = {
      Magic: { max: 2, min: 0 },
      Normal: { max: 1, min: 1 },
      Rare: { max: 6, min: 0 },
      Set: { max: 8, min: 3 },
      Unique: { max: 12, min: 4 }
    };

    for (const relic of RELIC_DEFINITIONS) {
      const quality = getRelicQualityLabel(relic.rarity, relic.wikiRarityLabel);
      expect((relic.modifiers || []).length).toBeGreaterThanOrEqual(rules[quality].min);
      expect((relic.modifiers || []).length).toBeLessThanOrEqual(rules[quality].max);
    }
  });
});
