import { describe, expect, it } from "vitest";

import { MONSTER_WIKI_ENTRIES } from "../components/MonsterEncounter";
import { HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, HERO_SIEGE_WIKI_CATEGORIES, HERO_SIEGE_WIKI_ITEM_IMAGE_DISPLAYS, HERO_SIEGE_WIKI_ITEMS, getWikiItemPublicPath, getWikiItemQualityLabel } from "../lib/heroSiegeWikiCatalog";
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

  it("does not display set relics or non-boss unique relics", () => {
    for (const relic of RELIC_DEFINITIONS) {
      const quality = getRelicQualityLabel(relic.rarity, relic.wikiRarityLabel);
      expect(quality).not.toBe("Set");
      if (quality === "Unique") {
        expect(relic.rarity).toBe("boss");
      }
    }
  });

  it("provides normal wiki-derived equipment for early levels", () => {
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.length).toBeGreaterThan(40);
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.every((item) => getWikiItemQualityLabel(item) === "Normal")).toBe(true);
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.every((item) => Number(item.level) < 20)).toBe(true);
  });

  it("does not expose socketed wiki stats", () => {
    expect(HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT.flatMap((item) => item.stats).some((stat) => /socketed/i.test(stat))).toBe(false);
    expect(RELIC_DEFINITIONS.flatMap((relic) => relic.wikiStats || []).some((stat) => /socketed/i.test(stat))).toBe(false);
  });
});
