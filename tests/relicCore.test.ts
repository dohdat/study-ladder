import { describe, expect, it } from "vitest";

import { getRelicQualityLabel } from "../lib/heroSiegeQuality";
import { formatModifier } from "../lib/modifierFormat";
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

  it("keeps every relic to one visible effect line", () => {
    for (const relic of RELIC_DEFINITIONS) {
      const quality = getRelicQualityLabel(relic.rarity, relic.wikiRarityLabel);
      expect((relic.modifiers || [])).toHaveLength(1);
      expect((relic.modifiers || []).length).toBeLessThanOrEqual(RELIC_MOD_RULES[quality].max);
      expect((relic.modifiers || []).length).toBeGreaterThanOrEqual(RELIC_MOD_RULES[quality].min);
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

    expect(RELIC_DEFINITIONS.length).toBeGreaterThanOrEqual(60);
    expect(RELIC_DEFINITIONS.length).toBeLessThan(118);
    expect(counts).toMatchObject(ROGUELIKE_RELIC_RARITY_COUNTS);
    expect(counts.common).toBeGreaterThan(counts.rare);
    expect(counts.uncommon).toBeGreaterThan(counts.rare);
    expect(counts.unique).toBeLessThan(counts.rare);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "burning-blood")).toBe(false);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "no-run-blade")).toBe(true);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "unaided-thesis")).toBe(true);
    expect(RELIC_DEFINITIONS.some((relic) => relic.id === "glass-crown")).toBe(true);
    expect(RELIC_DEFINITIONS.some((relic) => relic.name === "Cracked Lens")).toBe(false);
    expect(RELIC_DEFINITIONS.some((relic) => relic.name === "Free Hint Token")).toBe(false);
    expect(RELIC_DEFINITIONS.some((relic) => relic.name === "Beginner's Map")).toBe(false);
    expect(RELIC_DEFINITIONS.some((relic) => relic.name === "Bag of Preparation")).toBe(false);
    expect(RELIC_DEFINITIONS.some((relic) => relic.name === "Scratch Notes")).toBe(false);
    expect(RELIC_DEFINITIONS.some((relic) => relic.name === "Marking Marbles")).toBe(false);
  });

  it("avoids duplicate mechanical relic packages", () => {
    const packageKeys = RELIC_DEFINITIONS.map((relic) => (relic.modifiers || []).map((modifier) => modifier.key).sort().join("|"));

    expect(new Set(packageKeys).size).toBe(packageKeys.length);
  });

  it("classifies relic rarity by gameplay impact", () => {
    expect(getRelicRarity("Sand Timer")).toBe("common");
    expect(getRelicRarity("Blood Vial")).toBe("common");
    expect(getRelicRarity("Opening Strike")).toBe("uncommon");
    expect(getRelicRarity("Boss Pillow")).toBe("uncommon");
    expect(getRelicRarity("Orichalcum Notes")).toBe("rare");
    expect(getRelicRarity("Clean Amulet")).toBe("rare");
    expect(getRelicRarity("Fifth Proof")).toBe("rare");
    expect(getRelicRarity("The Boot")).toBe("rare");
    expect(getRelicRarity("Second Heart")).toBe("unique");
    expect(getRelicRarity("Fossilized Helix")).toBe("unique");
    expect(getRelicRarity("Torii")).toBe("unique");
    expect(getRelicRarity("Black Star")).toBe("unique");
  });

  it("avoids duplicate or blank displayed relic effect text", () => {
    const effectTexts = RELIC_DEFINITIONS.map((relic) => {
      const modifier = relic.modifiers?.[0];
      expect(modifier).toBeTruthy();
      return formatModifier(modifier!.key, modifier!.value);
    });

    expect(effectTexts.every(Boolean)).toBe(true);
    expect(new Set(effectTexts).size).toBe(effectTexts.length);
  });

  it("uses only relic modifier hooks with implemented gameplay behavior", () => {
    const wiredKeys = new Set([
      "accuracyPercent",
      "armorPenetrationPercent",
      "blockBreakDamagePercent",
      "blockChancePercent",
      "blockFirstHit",
      "blockedEnemyDamagePercent",
      "bossEntryHeal",
      "bossRelicChoiceBonus",
      "bossShopRelicStock",
      "bonusDamageVsElitesPercent",
      "bonusDamageWhileFullHealthPercent",
      "bonusDamageWhileLowHealthPercent",
      "coldResistPercent",
      "combatClearMeta",
      "combatStartBlock",
      "combatStartHeal",
      "criticalChancePercent",
      "criticalDamagePercent",
      "damageVsArraysPercent",
      "damageVsBfsPercent",
      "damageVsDfsPercent",
      "damageVsDynamicProgrammingPercent",
      "damageVsGraphsPercent",
      "damageVsHashMapPercent",
      "damageVsStringsPercent",
      "damageVsTreesPercent",
      "damageReduction",
      "debuffResistPercent",
      "dodgeChancePercent",
      "eliteDropBonusPercent",
      "eliteRelicChoiceBonus",
      "eliteStartHealthReductionPercent",
      "enemyVulnerableSubmits",
      "enemyWeakSubmits",
      "enhancedDamagePercent",
      "executeChancePercent",
      "extraAttackChancePercent",
      "fifthSubmitDamagePercent",
      "fireResistPercent",
      "firstSubmitDamagePercent",
      "freeHintPerRoom",
      "goldFindPercent",
      "goldGainHeal",
      "healthRegen",
      "hexConfusedImmune",
      "incomingDamagePercent",
      "increasedHealingReceivedPercent",
      "increasedLootDropChancePercent",
      "increasedRareDropChancePercent",
      "lifeOnKill",
      "lifeStealPercent",
      "lowHealthClearHeal",
      "magicFindPercent",
      "maxLife",
      "minimumSubmitDamage",
      "monsterDefeatHeal",
      "noHintDamagePercent",
      "noRunDamagePercent",
      "parryChancePercent",
      "physicalDamage",
      "physicalResistPercent",
      "poisonResistPercent",
      "preventFirstHpLoss",
      "potionDurationBonus",
      "reducedEnemyArmorPercent",
      "reducedEnemyDamagePercent",
      "relicChoiceBonus",
      "relicRerollBonus",
      "resistancePenetrationPercent",
      "revealSubmitTestCount",
      "revealTopicCount",
      "revivePercent",
      "shopDiscountPercent",
      "shopPriceIncreasePercent",
      "shopRelicStock",
      "skipRelicMaxLife",
      "skipRelicMetaBonus",
      "smallHitToOneThreshold",
      "submitFailDamageStackPercent",
      "thornsDamage",
      "timerDamagePercent",
      "timerPenaltyPercent",
      "timerPauseSeconds",
      "treasureRelicChancePercent",
      "vulnerableConstrictedImmune"
    ]);
    const activeKeys = RELIC_DEFINITIONS.flatMap((relic) => (relic.modifiers || []).map((modifier) => modifier.key));

    expect(activeKeys.filter((key) => !wiredKeys.has(key))).toEqual([]);
  });

  it("keeps formerly duplicate-feeling relic groups on distinct utility hooks", () => {
    expect(getRelicKeys("Trophy Hunter")).toContain("eliteRelicChoiceBonus");
    expect(getRelicKeys("Boss Ledger")).toContain("bossRelicChoiceBonus");
    expect(getRelicKeys("Blood Market")).toContain("bossShopRelicStock");
    expect(getRelicModifierValue("Smiling Mask", "shopDiscountPercent")).toBe(50);
    expect(getRelicModifierValue("Anchor", "combatStartBlock")).toBe(10);
    expect(getRelicModifierValue("Blood Vial", "combatStartHeal")).toBe(6);
    expect(getRelicModifierValue("Gremlin Horn", "monsterDefeatHeal")).toBe(8);
    expect(getRelicModifierValue("Bloody Idol", "goldGainHeal")).toBe(4);
    expect(getRelicModifierValue("Starved Focus", "increasedHealingReceivedPercent")).toBe(40);
    expect(getRelicModifierValue("Array Compass", "damageVsArraysPercent")).toBe(30);
    expect(getRelicModifierValue("String Rosary", "damageVsStringsPercent")).toBe(30);
    expect(getRelicModifierValue("Hash Map Cipher", "damageVsHashMapPercent")).toBe(30);
    expect(getRelicModifierValue("Depth Charm", "damageVsDfsPercent")).toBe(35);
    expect(getRelicModifierValue("Breadth Lantern", "damageVsBfsPercent")).toBe(35);
    expect(getRelicModifierValue("Tree Root", "damageVsTreesPercent")).toBe(35);
    expect(getRelicModifierValue("Graph Compass", "damageVsGraphsPercent")).toBe(35);
    expect(getRelicModifierValue("Dynamic Engine", "damageVsDynamicProgrammingPercent")).toBe(40);
    expect(getRelicKeys("Bag of Marbles")).toContain("enemyVulnerableSubmits");
    expect(getRelicKeys("Red Mask")).toContain("enemyWeakSubmits");
    expect(getRelicKeys("Iron Choice")).toContain("skipRelicMaxLife");
    expect(getRelicKeys("Alchemist's Menu")).toContain("potionDurationBonus");
    expect(getRelicKeys("Small Bounty")).toContain("treasureRelicChancePercent");
  });

  it("keeps the wiki catalog aligned with the active relic effects", () => {
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

function getRelicKeys(name: string) {
  const relic = RELIC_DEFINITIONS.find((item) => item.name === name);
  expect(relic).toBeTruthy();
  return (relic?.modifiers || []).map((modifier) => modifier.key);
}

function getRelicRarity(name: string) {
  const relic = RELIC_DEFINITIONS.find((item) => item.name === name);
  expect(relic).toBeTruthy();
  return relic?.rarity;
}

function getRelicModifierValue(name: string, key: string) {
  const relic = RELIC_DEFINITIONS.find((item) => item.name === name);
  expect(relic).toBeTruthy();
  return relic?.modifiers?.find((modifier) => modifier.key === key)?.value;
}
