import { describe, expect, it } from "vitest";

import { MONSTER_WIKI_ENTRIES } from "../components/MonsterEncounter";
import { HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, HERO_SIEGE_MOD_RULES, HERO_SIEGE_WIKI_CATEGORIES, HERO_SIEGE_WIKI_CHARMS, HERO_SIEGE_WIKI_ITEM_IMAGE_DISPLAYS, HERO_SIEGE_WIKI_ITEMS, getVisibleWikiItemStats, getVisibleWikiRelicStats, getWikiItemPublicPath, getWikiItemQualityLabel, getWikiRelicQualityLabel, pickWikiEquipmentItem } from "../lib/heroSiegeWikiCatalog";
import { getRelicQualityLabel } from "../lib/heroSiegeQuality";
import { RELIC_DEFINITIONS } from "../lib/relicCore";

describe("wiki icon uniqueness", () => {
  it("renders every wiki item with a unique icon identity", () => {
    const iconKeys = HERO_SIEGE_WIKI_ITEMS.map((item) => {
      const display = HERO_SIEGE_WIKI_ITEM_IMAGE_DISPLAYS.get(item.id);
      return display?.key || "missing";
    });

    expect(new Set(iconKeys).size).toBe(iconKeys.length);
  });

  it("renders every relic with a unique wiki icon identity", () => {
    const iconKeys = RELIC_DEFINITIONS.map((relic) => `${relic.wikiImagePath || "missing"}|${relic.wikiImageFilter || "base"}`);

    expect(new Set(iconKeys).size).toBe(iconKeys.length);
  });

  it("renders every monster variant with a unique icon identity", () => {
    const iconKeys = MONSTER_WIKI_ENTRIES.map((monster) => `${monster.art}|${monster.filter || "base"}`);

    expect(new Set(iconKeys).size).toBe(iconKeys.length);
  });

  it("uses extension-relative wiki image paths", () => {
    const item = HERO_SIEGE_WIKI_ITEMS.find((row) => row.imagePath);

    expect(item).toBeTruthy();
    expect(getWikiItemPublicPath(item!)).toMatch(/^hero_siege_wiki_items\//);
  });

  it("assigns wiki items to the five weighted quality labels", () => {
    const items = [...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_ITEMS];
    const counts = items.reduce<Record<string, number>>((result, item) => {
      const quality = getWikiItemQualityLabel(item);
      result[quality] = (result[quality] || 0) + 1;
      return result;
    }, {});
    const total = items.length;

    expect(counts.Normal).toBeGreaterThan(counts.Magic);
    expect(counts.Magic).toBeGreaterThan(counts.Rare);
    expect(counts.Rare).toBeGreaterThan(counts.Set);
    expect(counts.Set).toBeGreaterThan(counts.Unique);
    expect(counts.Normal / total).toBeGreaterThanOrEqual(0.5);
    expect(counts.Normal / total).toBeLessThanOrEqual(0.7);
    expect(counts.Magic / total).toBeGreaterThanOrEqual(0.2);
    expect(counts.Magic / total).toBeLessThanOrEqual(0.35);
    expect(counts.Rare / total).toBeGreaterThanOrEqual(0.08);
    expect(counts.Rare / total).toBeLessThanOrEqual(0.15);
    expect(counts.Set / total).toBeGreaterThanOrEqual(0.02);
    expect(counts.Set / total).toBeLessThanOrEqual(0.06);
    expect(counts.Unique / total).toBeGreaterThanOrEqual(0.015);
    expect(counts.Unique / total).toBeLessThanOrEqual(0.04);
  });

  it("gives each item category rare and unique wiki entries", () => {
    const items = [...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_ITEMS];

    for (const category of HERO_SIEGE_WIKI_CATEGORIES) {
      const categoryItems = items.filter((item) => item.category === category.sourcePage);
      if (categoryItems.length < 5) {
        continue;
      }
      const labels = new Set(categoryItems.map(getWikiItemQualityLabel));
      expect(labels.has("Rare")).toBe(true);
      expect(labels.has("Unique")).toBe(true);
    }
  });

  it("uses only the five display rarities in the wiki", () => {
    const labels = new Set([
      ...HERO_SIEGE_WIKI_ITEMS.map(getWikiItemQualityLabel),
      ...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.map(getWikiItemQualityLabel),
      ...RELIC_DEFINITIONS.map((relic) => getRelicQualityLabel(relic.rarity, relic.wikiRarityLabel))
    ]);

    expect(labels).toEqual(new Set(["Normal", "Magic", "Rare", "Set", "Unique"]));
  });

  it("assigns wiki relics with the same weighted quality order as wiki items", () => {
    const counts = HERO_SIEGE_WIKI_CHARMS.reduce<Record<string, number>>((result, item) => {
      const quality = getWikiRelicQualityLabel(item);
      result[quality] = (result[quality] || 0) + 1;
      return result;
    }, {});

    expect(counts.Normal).toBeGreaterThan(counts.Magic);
    expect(counts.Magic).toBeGreaterThan(counts.Rare);
    expect(counts.Rare).toBeGreaterThan(counts.Set);
    expect(counts.Set).toBeGreaterThan(counts.Unique);
    expect(counts.Unique).toBeGreaterThanOrEqual(1);
  });

  it("provides normal wiki-derived equipment for early levels", () => {
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.length).toBeGreaterThan(40);
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.every((item) => getWikiItemQualityLabel(item) === "Normal")).toBe(true);
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.every((item) => Number(item.level) < 20)).toBe(true);
  });

  it("uses category-appropriate icons for low-level weapon fallbacks", () => {
    const longBow = HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.find((item) => item.name === "Long Bow");
    const feralClaws = HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.find((item) => item.name === "Feral Claws");

    expect(longBow?.imagePath).toMatch(/Bow/i);
    expect(longBow?.imagePath).not.toMatch(/weapon-sword/i);
    expect(feralClaws?.imagePath).toMatch(/Claw/i);
    expect(feralClaws?.imagePath).not.toMatch(/weapon-sword/i);
  });

  it("keeps charms out of equippable item slots and maps belt and glove categories distinctly", () => {
    expect(HERO_SIEGE_WIKI_CATEGORIES.some((category) => category.sourcePage === "Charms")).toBe(false);
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.some((item) => item.category === "Charms" || /charm/i.test(item.name))).toBe(false);

    const belt = pickWikiEquipmentItem("backAccessory", "test-belt", { maxItemLevel: 10 });
    const gloves = pickWikiEquipmentItem("bodyAccessory", "test-gloves", { maxItemLevel: 10 });

    expect(belt?.category).toBe("Belts");
    expect(gloves?.category).toBe("Gloves");
  });

  it("caps wiki item tooltip modifiers by display rarity", () => {
    const items = [...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_ITEMS];
    const normalItemWithSourceStats = HERO_SIEGE_WIKI_ITEMS.find((item) => getWikiItemQualityLabel(item) === "Normal" && item.stats.length > 0);

    expect(normalItemWithSourceStats).toBeTruthy();
    expect(getVisibleWikiItemStats(normalItemWithSourceStats!)).toHaveLength(0);

    for (const item of items) {
      const quality = getWikiItemQualityLabel(item);
      expect(getVisibleWikiItemStats(item).length).toBeLessThanOrEqual(HERO_SIEGE_MOD_RULES[quality].max);
    }
  });

  it("enforces wiki item modifier counts by rarity", () => {
    const enforcedQualities = new Set(["Magic", "Rare", "Set", "Unique"]);
    const items = [...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_ITEMS].filter((item) => enforcedQualities.has(getWikiItemQualityLabel(item)));

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const quality = getWikiItemQualityLabel(item);
      expect(getVisibleWikiItemStats(item).length).toBeGreaterThanOrEqual(HERO_SIEGE_MOD_RULES[quality].min);
      expect(getVisibleWikiItemStats(item).length).toBeLessThanOrEqual(HERO_SIEGE_MOD_RULES[quality].max);
    }
  });

  it("does not expose unsupported Hero Siege source mechanics as wiki modifiers", () => {
    const disallowed = /(all attributes|all skills|arcane|attack rating|attack speed|cast rate|chance to cast|chance when|defense ignored|enemy |energy|movement speed|skill damage|stamina|target defense|vitality|value1|value2)/i;
    const visibleItemStats = [...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_ITEMS].flatMap((item) => getVisibleWikiItemStats(item));
    const visibleRelicStats = HERO_SIEGE_WIKI_CHARMS.flatMap((item) => getVisibleWikiRelicStats(item));

    expect([...visibleItemStats, ...visibleRelicStats].some((stat) => disallowed.test(stat))).toBe(false);
    expect(RELIC_DEFINITIONS.flatMap((relic) => relic.modifiers || []).some((modifier) => modifier.key === "manaOnKill")).toBe(false);
  });

  it("does not expose socketed wiki stats", () => {
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.flatMap((item) => item.stats).some((stat) => /socketed/i.test(stat))).toBe(false);
    expect(RELIC_DEFINITIONS.flatMap((relic) => relic.wikiStats || []).some((stat) => /socketed/i.test(stat))).toBe(false);
  });
});
