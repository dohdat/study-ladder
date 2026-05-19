import type { InventoryItem, ItemRarity, RelicRarity } from "../types/study";

export type HeroSiegeQuality = "Normal" | "Magic" | "Rare" | "Set" | "Unique";

export const HERO_SIEGE_QUALITY_COLORS: Record<HeroSiegeQuality, string> = {
  Magic: "#2899ff",
  Normal: "#ffffff",
  Rare: "#fff03d",
  Set: "#20e020",
  Unique: "#ff8a3d"
} as const;

export const ITEM_RARITY_TO_QUALITY: Record<ItemRarity, HeroSiegeQuality> = {
  common: "Normal",
  epic: "Set",
  legendary: "Unique",
  rare: "Rare",
  uncommon: "Magic"
} as const;

export const RELIC_RARITY_TO_QUALITY: Record<RelicRarity, HeroSiegeQuality> = {
  blight: "Rare",
  boss: "Unique",
  common: "Normal",
  event: "Rare",
  rare: "Rare",
  shop: "Set",
  special: "Rare",
  starter: "Normal",
  uncommon: "Magic"
} as const;

export function getHeroSiegeQualityColor(quality: string | undefined) {
  return HERO_SIEGE_QUALITY_COLORS[toHeroSiegeQuality(quality)];
}

export function getItemQuality(item: InventoryItem) {
  return ITEM_RARITY_TO_QUALITY[item.rarity];
}

export function getRelicQualityLabel(rarity: RelicRarity, wikiRarityLabel?: string) {
  if (wikiRarityLabel === "Normal" || wikiRarityLabel === "Magic" || wikiRarityLabel === "Rare" || wikiRarityLabel === "Set" || wikiRarityLabel === "Unique") {
    return wikiRarityLabel;
  }
  return RELIC_RARITY_TO_QUALITY[rarity];
}

export function toHeroSiegeQuality(value: string | undefined): HeroSiegeQuality {
  if (value === "Magic" || value === "Rare" || value === "Set" || value === "Unique") {
    return value;
  }
  return "Normal";
}
