import { describe, expect, it } from "vitest";

import { getRelicQualityLabel } from "../lib/heroSiegeQuality";
import { MODIFIER_ARCHETYPES, getSynergyModifierKeys } from "../lib/modifierAffixes";
import { RELIC_DEFINITIONS, RELIC_MOD_RULES, ROGUELIKE_RELIC_RARITY_COUNTS, rollRelic } from "../lib/relicCore";
import { defaultState } from "../lib/studyCore";

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
      expect((relic.modifiers || []).length).toBeGreaterThanOrEqual(RELIC_MOD_RULES[quality].min);
      expect((relic.modifiers || []).length).toBeLessThanOrEqual(RELIC_MOD_RULES[quality].max);
    }
  });

  it("builds synergistic modifier packages instead of isolated filler stats", () => {
    const packageKeySets = MODIFIER_ARCHETYPES.map((archetype) => new Set(archetype.keys));
    const keys = getSynergyModifierKeys("test-synergy-package", 4);

    expect(keys).toHaveLength(4);
    expect(packageKeySets.some((keySet) => keys.filter((key) => keySet.has(key)).length >= 2)).toBe(true);
  });

  it("uses the curated roguelike relic catalog instead of generated legacy relics", () => {
    const counts = RELIC_DEFINITIONS.reduce<Record<string, number>>((total, relic) => ({ ...total, [relic.rarity]: (total[relic.rarity] || 0) + 1 }), {});

    expect(RELIC_DEFINITIONS).toHaveLength(117);
    expect(counts).toMatchObject(ROGUELIKE_RELIC_RARITY_COUNTS);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "burning-blood")).toBe(false);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "no-run-blade")).toBe(true);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "glass-crown")).toBe(true);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "cracked-lens")).toBe(true);
  });

  it("avoids duplicate mechanical relic packages", () => {
    const packageKeys = RELIC_DEFINITIONS.map((relic) => (relic.modifiers || []).map((modifier) => modifier.key).sort().join("|"));

    expect(new Set(packageKeys).size).toBe(packageKeys.length);
  });

  it("keeps the wiki catalog aligned with the roguelike relic source notes", () => {
    expect(RELIC_DEFINITIONS.every((relic) => relic.description.length > 0)).toBe(true);
    expect(RELIC_DEFINITIONS.every((relic) => (relic.wikiStats || []).some((stat) => stat.startsWith("Trigger: ")))).toBe(true);
    expect(RELIC_DEFINITIONS.every((relic) => (relic.wikiStats || []).some((stat) => stat.startsWith("Tuning: ")))).toBe(true);
    expect(RELIC_DEFINITIONS.some((relic) => relic.name === "Alchemist's Menu")).toBe(true);
  });

  it("keeps blights and event relics out of normal reward rolls", () => {
    const state = defaultState();

    for (let index = 0; index < 100; index += 1) {
      expect(["common", "uncommon", "rare"]).toContain(rollRelic(state, `normal-roll-${index}`).rarity);
    }
  });

  it("uses luck relics to improve future relic rarity rolls", () => {
    const normal = defaultState();
    const lucky = defaultState();
    lucky.profile.relics = [RELIC_DEFINITIONS.find((relic) => relic.id === "fortune-thread")!];

    const normalScore = getAverageRelicRarityScore(normal);
    const luckyScore = getAverageRelicRarityScore(lucky);

    expect(luckyScore).toBeGreaterThan(normalScore);
  });

  it("uses mirror luck to improve relic rarity rolls", () => {
    const normal = defaultState();
    const lucky = defaultState();
    lucky.profile.metaProgress.upgrades.relicLuck = 5;

    const normalScore = getAverageRelicRarityScore(normal);
    const luckyScore = getAverageRelicRarityScore(lucky);

    expect(luckyScore).toBeGreaterThan(normalScore);
  });
});

function getAverageRelicRarityScore(state: ReturnType<typeof defaultState>) {
  const rarityScores = { common: 1, rare: 3, uncommon: 2 } as const;
  let total = 0;
  for (let index = 0; index < 180; index += 1) {
    const rarity = rollRelic(state, `luck-roll-${index}`).rarity as keyof typeof rarityScores;
    total += rarityScores[rarity] || 0;
  }
  return total / 180;
}
