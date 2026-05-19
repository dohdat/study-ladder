import { describe, expect, it } from "vitest";

import { getRelicQualityLabel } from "../lib/heroSiegeQuality";
import { HERO_SIEGE_RELIC_MOD_RULES } from "../lib/heroSiegeWikiCatalog";
import { RELIC_DEFINITIONS } from "../lib/relicCore";

describe("relicCore", () => {
  it("keeps relic ids and effects unique", () => {
    const ids = RELIC_DEFINITIONS.map((relic) => relic.id);
    const names = RELIC_DEFINITIONS.map((relic) => relic.name);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("caps relic modifiers by displayed quality", () => {
    for (const relic of RELIC_DEFINITIONS) {
      const quality = getRelicQualityLabel(relic.rarity, relic.wikiRarityLabel);
      expect((relic.modifiers || []).length).toBeGreaterThanOrEqual(HERO_SIEGE_RELIC_MOD_RULES[quality].min);
      expect((relic.modifiers || []).length).toBeLessThanOrEqual(HERO_SIEGE_RELIC_MOD_RULES[quality].max);
    }
  });
});
