import heroSiegeWikiItems from "../data/heroSiegeWikiItems.json";
import { HERO_SIEGE_ITEM_CATEGORIES } from "./heroSiegeItemCatalog";
import { getRelicQualityLabel, ITEM_RARITY_TO_QUALITY, type HeroSiegeQuality } from "./heroSiegeQuality";
import type { CharacterStatKey, CharacterStats, EquipmentSlot, InventoryItem, ItemModifier, ItemModifierKey, ItemRarity, Relic, RelicRarity } from "../types/study";

const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const MIN_WIKI_STAT = 1;
const MAX_WIKI_STAT = 5;
const MAX_WIKI_MODIFIER = 30;
const RELIC_STAT_DIVISOR = 18;
const EQUIPMENT_STAT_DIVISOR = 22;
const WIKI_ITEM_PATH_PREFIX = "hero_siege_wiki_items/";
const REGULAR_WIKI_ITEM_PATH_PREFIX = "regular/";
const HIGH_POWER_TIER_GROUPS = new Set(["Satanic", "Satanic Set", "Heroic", "Unholy", "Angelic"]);
const HIGH_POWER_TIERS = new Set(["S", "SS"]);
const WIKI_QUALITY_TO_RARITY: Record<HeroSiegeQuality, ItemRarity> = {
  Magic: "uncommon",
  Normal: "common",
  Rare: "rare",
  Set: "epic",
  Unique: "legendary"
};
export const HERO_SIEGE_WIKI_QUALITY_DISTRIBUTION: readonly { cutoff: number; label: HeroSiegeQuality }[] = [
  { cutoff: 0.52, label: "Normal" },
  { cutoff: 0.8, label: "Magic" },
  { cutoff: 0.93, label: "Rare" },
  { cutoff: 0.98, label: "Set" },
  { cutoff: 1, label: "Unique" }
] as const;
const CATEGORY_MAGIC_RATIO = 0.28;
const CATEGORY_RARE_RATIO = 0.13;
const CATEGORY_SET_RATIO = 0.05;
const CATEGORY_UNIQUE_RATIO = 0.02;
const LOW_LEVEL_CATEGORY_PAGE_BY_ID: Record<string, string> = {
  amulets: "Amulets",
  armors: "Body Armors",
  belts: "Belts",
  boots: "Boots",
  charms: "Charms",
  gloves: "Gloves",
  helms: "Helmets",
  "normal-axes": "Axes",
  "normal-daggers": "Daggers",
  "normal-maces": "Maces",
  "normal-swords": "Swords",
  rings: "Rings",
  shields: "Shields",
  "weapon-bow": "Bows",
  "weapon-chainsaw": "Chainsaws",
  "weapon-claw": "Claws",
  "weapon-flask": "Flasks",
  "weapon-gun": "Guns",
  "weapon-polearm": "Polearms",
  "weapon-throwing": "Throwing Weapons"
};
const REGULAR_WIKI_ITEM_IMAGES: Record<string, { height: number; imagePath: string; width: number }> = {
  amulet: { height: 23, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}amulet.png`, width: 26 },
  armor: { height: 15, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}armor.png`, width: 20 },
  axe: { height: 44, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}weapon-axe.png`, width: 62 },
  belt: { height: 17, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}belt.png`, width: 21 },
  boots: { height: 18, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}boots.png`, width: 18 },
  charm: { height: 34, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}relic-charm.png`, width: 34 },
  gloves: { height: 18, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}gloves.png`, width: 22 },
  helmet: { height: 23, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}helmet.png`, width: 19 },
  orb: { height: 13, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}relic-orb.png`, width: 13 },
  ring: { height: 10, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}ring.png`, width: 10 },
  shield: { height: 21, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}shield.png`, width: 32 },
  sword: { height: 21, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}weapon-sword.png`, width: 33 },
  tome: { height: 21, imagePath: `${REGULAR_WIKI_ITEM_PATH_PREFIX}relic-glyph.png`, width: 21 }
};

export type HeroSiegeWikiItem = {
  aps: string;
  category: string;
  damage: string;
  dps: string;
  id: string;
  imageHeight: number | null;
  imagePath: string | null;
  imageWidth: number | null;
  level: string;
  name: string;
  slot: EquipmentSlot;
  stats: string[];
  tier: string;
  tierGroup: string;
};

export type HeroSiegeWikiCategory = {
  id: string;
  label: string;
  slot: EquipmentSlot;
  sourcePage: string;
};

export type HeroSiegeWikiIconDisplay = {
  filter: string;
  imagePath: string | null;
  key: string;
};

const WIKI_ITEM_DATA = heroSiegeWikiItems as {
  categories: HeroSiegeWikiCategory[];
  generatedAt: string;
  items: HeroSiegeWikiItem[];
};

export const HERO_SIEGE_WIKI_CATEGORIES: readonly HeroSiegeWikiCategory[] = WIKI_ITEM_DATA.categories;
export const HERO_SIEGE_WIKI_ITEMS: readonly HeroSiegeWikiItem[] = WIKI_ITEM_DATA.items;
export const HERO_SIEGE_WIKI_EQUIPMENT = HERO_SIEGE_WIKI_ITEMS.filter((item) => item.category !== "Charms");
export const HERO_SIEGE_WIKI_CHARMS = HERO_SIEGE_WIKI_ITEMS.filter((item) => item.category === "Charms");
export const HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT = createLowLevelWikiEquipment();
export const HERO_SIEGE_WIKI_ITEM_QUALITIES = createWikiItemQualities(HERO_SIEGE_WIKI_ITEMS);
export const HERO_SIEGE_WIKI_ITEM_IMAGE_DISPLAYS = getUniqueWikiItemImageDisplays([...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_ITEMS]);
export const HERO_SIEGE_WIKI_CHARM_IMAGE_DISPLAYS = getUniqueWikiItemImageDisplays(HERO_SIEGE_WIKI_CHARMS);

export function pickWikiEquipmentItem(slot: EquipmentSlot, seed: string, options: { maxItemLevel?: number; rarity?: ItemRarity } = {}) {
  const candidates = getWikiEquipmentCandidates(slot, options);
  return candidates.length ? candidates[Math.floor(getCatalogRoll(seed) * candidates.length)] : null;
}

export function getWikiItemPublicPath(item: Pick<HeroSiegeWikiItem, "imagePath">) {
  return item.imagePath ? `${WIKI_ITEM_PATH_PREFIX}${item.imagePath.replace(/^hero_siege_wiki_items\//, "")}` : null;
}

export function getUniqueWikiItemImageDisplays(items: readonly Pick<HeroSiegeWikiItem, "id" | "imagePath">[]): Map<string, HeroSiegeWikiIconDisplay> {
  const imageCounts = new Map<string, number>();
  return items.reduce((displays, item) => {
    const imagePath = getWikiItemPublicPath(item);
    const occurrence = imagePath ? imageCounts.get(imagePath) || 0 : 0;
    if (imagePath) {
      imageCounts.set(imagePath, occurrence + 1);
    }
    const filter = occurrence > 0 ? getDuplicateIconFilter(item.id, occurrence) : "";
    displays.set(item.id, {
      filter,
      imagePath,
      key: `${imagePath || "missing"}|${filter || "base"}`
    });
    return displays;
  }, new Map<string, HeroSiegeWikiIconDisplay>());
}

export function getWikiItemLevel(item: Pick<HeroSiegeWikiItem, "level">) {
  const parsed = Number.parseInt(item.level || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : MIN_WIKI_STAT;
}

export function getWikiItemRarity(item: Pick<HeroSiegeWikiItem, "id" | "tierGroup">): ItemRarity {
  return WIKI_QUALITY_TO_RARITY[getWikiItemQualityLabel(item)];
}

export function getWikiItemQualityLabel(item: Pick<HeroSiegeWikiItem, "id" | "tierGroup">): HeroSiegeQuality {
  if (item.tierGroup === "Normal") {
    return "Normal";
  }
  return HERO_SIEGE_WIKI_ITEM_QUALITIES.get(item.id) || getRolledWikiQuality(item.id);
}

export function createWikiRelicDefinitions() {
  const imageDisplays = HERO_SIEGE_WIKI_CHARM_IMAGE_DISPLAYS;
  return HERO_SIEGE_WIKI_CHARMS.map((item) => {
    const wikiStats = getPlayableWikiStats(item.stats);
    const modifiers = createWikiModifiers(wikiStats, RELIC_STAT_DIVISOR);
    const imageDisplay = imageDisplays.get(item.id);
    const rarity = getWikiRelicRarity(item);
    return {
      description: wikiStats.slice(0, 3).join(", ") || `${item.tierGroup} charm.`,
      id: item.id,
      modifiers: modifiers.length ? modifiers : [{ key: "magicFindPercent", value: 1 }],
      name: item.name,
      rarity,
      source: "any",
      wikiCategory: item.category,
      wikiImageFilter: imageDisplay?.filter,
      wikiImagePath: imageDisplay?.imagePath || getWikiItemPublicPath(item),
      wikiLevel: getWikiItemLevel(item),
      wikiRarityLabel: getRelicQualityLabel(rarity),
      wikiStats,
      wikiTier: item.tier,
      wikiTierGroup: item.tierGroup
    } satisfies Relic;
  });
}

export function applyWikiItemData(item: InventoryItem, wikiItem: HeroSiegeWikiItem | null): InventoryItem {
  if (!wikiItem) {
    return item;
  }
  const imageDisplay = HERO_SIEGE_WIKI_ITEM_IMAGE_DISPLAYS.get(wikiItem.id);
  const wikiStats = getPlayableWikiStats(wikiItem.stats);
  return {
    ...item,
    name: wikiItem.name,
    wikiAps: wikiItem.aps,
    wikiCategory: wikiItem.category,
    wikiDamage: wikiItem.damage,
    wikiDps: wikiItem.dps,
    wikiImageFilter: imageDisplay?.filter,
    wikiImagePath: imageDisplay?.imagePath || getWikiItemPublicPath(wikiItem),
    wikiLevel: getWikiItemLevel(wikiItem),
    wikiRarityLabel: ITEM_RARITY_TO_QUALITY[item.rarity],
    wikiStats,
    wikiTier: wikiItem.tier,
    wikiTierGroup: wikiItem.tierGroup
  };
}

export function createWikiMechanicalStats(slot: EquipmentSlot, wikiItem: HeroSiegeWikiItem | null): Partial<CharacterStats> {
  if (!wikiItem) {
    return {};
  }
  const stats: Partial<CharacterStats> = {};
  for (const line of getPlayableWikiStats(wikiItem.stats)) {
    const stat = getWikiCharacterStat(line, slot);
    if (!stat) {
      continue;
    }
    stats[stat] = Math.max(stats[stat] || 0, scaleWikiValue(line, EQUIPMENT_STAT_DIVISOR));
  }
  return stats;
}

export function createWikiModifiers(stats: string[], divisor = EQUIPMENT_STAT_DIVISOR): ItemModifier[] {
  const modifiers = new Map<ItemModifierKey, number>();
  for (const line of getPlayableWikiStats(stats)) {
    const modifier = getWikiModifier(line, divisor);
    if (modifier) {
      modifiers.set(modifier.key, Math.max(modifiers.get(modifier.key) || 0, modifier.value));
    }
  }
  return Array.from(modifiers.entries()).map(([key, value]) => ({ key, value }));
}

function getWikiEquipmentCandidates(slot: EquipmentSlot, options: { maxItemLevel?: number; rarity?: ItemRarity }) {
  const maxItemLevel = Number.isFinite(options.maxItemLevel) ? Math.max(MIN_WIKI_STAT, Math.floor(options.maxItemLevel || MIN_WIKI_STAT)) : null;
  const sourceItems = maxItemLevel && maxItemLevel < 20
    ? [...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_EQUIPMENT]
    : [...HERO_SIEGE_WIKI_EQUIPMENT, ...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT];
  const bySlot = sourceItems.filter((item) => item.slot === slot && (item.imagePath || item.tierGroup === "Normal"));
  const byLevel = maxItemLevel ? bySlot.filter((item) => getWikiItemLevel(item) <= maxItemLevel && isWikiItemAllowedForLevel(item, maxItemLevel)) : bySlot;
  if (!byLevel.length) {
    return [];
  }
  return byLevel;
}

function createLowLevelWikiEquipment(): HeroSiegeWikiItem[] {
  return HERO_SIEGE_ITEM_CATEGORIES
    .filter((category) => !category.id.includes("unique") && category.id !== "charms-unique" && category.id !== "weapon-universal")
    .flatMap((category) => category.names.slice(0, 8).map((name, index) => {
      const image = getRegularWikiItemImage(category.id, name);
      return {
        aps: "",
        category: getLowLevelWikiCategory(category.id, name),
        damage: "",
        dps: "",
        id: `normal-${category.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        imageHeight: image.height,
        imagePath: image.imagePath,
        imageWidth: image.width,
        level: String(Math.min(19, 1 + Math.floor(index / 2))),
        name,
        slot: category.slot,
        stats: [],
        tier: "",
        tierGroup: "Normal"
      } satisfies HeroSiegeWikiItem;
    }));
}

function getPlayableWikiStats(stats: readonly string[]) {
  return stats.filter((stat) => !stat.toLowerCase().includes("socketed"));
}

function createWikiItemQualities(items: readonly HeroSiegeWikiItem[]) {
  const byCategory = new Map<string, HeroSiegeWikiItem[]>();
  for (const item of items) {
    const categoryItems = byCategory.get(item.category) || [];
    categoryItems.push(item);
    byCategory.set(item.category, categoryItems);
  }

  const qualities = new Map<string, HeroSiegeQuality>();
  for (const categoryItems of byCategory.values()) {
    const sorted = [...categoryItems].sort((left, right) => getCatalogRoll(`${right.id}:category-quality-v2`) - getCatalogRoll(`${left.id}:category-quality-v2`));
    const counts = getCategoryQualityCounts(sorted.length);
    let cursor = 0;
    cursor = assignCategoryQuality(qualities, sorted, cursor, counts.Unique, "Unique");
    cursor = assignCategoryQuality(qualities, sorted, cursor, counts.Set, "Set");
    cursor = assignCategoryQuality(qualities, sorted, cursor, counts.Rare, "Rare");
    cursor = assignCategoryQuality(qualities, sorted, cursor, counts.Magic, "Magic");
    assignCategoryQuality(qualities, sorted, cursor, sorted.length - cursor, "Normal");
  }
  return qualities;
}

function getCategoryQualityCounts(total: number): Record<HeroSiegeQuality, number> {
  const unique = total >= 4 ? Math.max(1, Math.floor(total * CATEGORY_UNIQUE_RATIO)) : 0;
  const set = total >= 8 ? Math.max(1, Math.floor(total * CATEGORY_SET_RATIO)) : 0;
  const rare = total >= 3 ? Math.max(1, Math.floor(total * CATEGORY_RARE_RATIO)) : 0;
  const magic = Math.max(0, Math.floor(total * CATEGORY_MAGIC_RATIO));
  const claimed = unique + set + rare + magic;
  return {
    Magic: Math.max(0, Math.min(magic, total - unique - set - rare)),
    Normal: Math.max(0, total - claimed),
    Rare: rare,
    Set: set,
    Unique: unique
  };
}

function assignCategoryQuality(qualities: Map<string, HeroSiegeQuality>, items: readonly HeroSiegeWikiItem[], start: number, count: number, quality: HeroSiegeQuality) {
  const end = Math.min(items.length, start + count);
  for (let index = start; index < end; index += 1) {
    qualities.set(items[index].id, quality);
  }
  return end;
}

function getRolledWikiQuality(id: string): HeroSiegeQuality {
  const roll = getCatalogRoll(`${id}:wiki-quality-v2`);
  return HERO_SIEGE_WIKI_QUALITY_DISTRIBUTION.find((quality) => roll < quality.cutoff)?.label || "Unique";
}

function getLowLevelWikiCategory(categoryId: string, name: string) {
  if (categoryId === "weapon-spell") {
    return getSpellWeaponCategory(name);
  }
  return LOW_LEVEL_CATEGORY_PAGE_BY_ID[categoryId] || categoryId;
}

function getRegularWikiItemImage(categoryId: string, name: string) {
  if (categoryId === "armors") {
    return REGULAR_WIKI_ITEM_IMAGES.armor;
  }
  if (categoryId === "helms") {
    return REGULAR_WIKI_ITEM_IMAGES.helmet;
  }
  if (categoryId === "gloves") {
    return REGULAR_WIKI_ITEM_IMAGES.gloves;
  }
  if (categoryId === "boots") {
    return REGULAR_WIKI_ITEM_IMAGES.boots;
  }
  if (categoryId === "amulets") {
    return REGULAR_WIKI_ITEM_IMAGES.amulet;
  }
  if (categoryId === "rings") {
    return REGULAR_WIKI_ITEM_IMAGES.ring;
  }
  if (categoryId === "belts") {
    return REGULAR_WIKI_ITEM_IMAGES.belt;
  }
  if (categoryId === "shields") {
    return REGULAR_WIKI_ITEM_IMAGES.shield;
  }
  if (categoryId === "charms") {
    return REGULAR_WIKI_ITEM_IMAGES.charm;
  }
  if (categoryId === "normal-axes" || categoryId === "normal-maces" || categoryId === "weapon-throwing" || categoryId === "weapon-chainsaw") {
    return REGULAR_WIKI_ITEM_IMAGES.axe;
  }
  if (categoryId === "weapon-spell") {
    return getSpellWeaponImage(name);
  }
  return REGULAR_WIKI_ITEM_IMAGES.sword;
}

function getSpellWeaponCategory(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("cane")) {
    return "Canes";
  }
  if (normalized.includes("wand")) {
    return "Wands";
  }
  if (normalized.includes("tome")) {
    return "Books";
  }
  if (normalized.includes("spellblade")) {
    return "Spellblades";
  }
  return "Staves";
}

function getSpellWeaponImage(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("tome")) {
    return REGULAR_WIKI_ITEM_IMAGES.tome;
  }
  if (normalized.includes("wand") || normalized.includes("cane") || normalized.includes("staff")) {
    return REGULAR_WIKI_ITEM_IMAGES.orb;
  }
  return REGULAR_WIKI_ITEM_IMAGES.sword;
}

function isWikiItemAllowedForLevel(item: HeroSiegeWikiItem, maxItemLevel: number) {
  if (maxItemLevel < 20 && (HIGH_POWER_TIER_GROUPS.has(item.tierGroup) || HIGH_POWER_TIERS.has(item.tier))) {
    return false;
  }
  if (maxItemLevel < 50 && (item.tierGroup === "Heroic" || item.tierGroup === "Unholy" || item.tierGroup === "Angelic" || item.tier === "SS")) {
    return false;
  }
  return true;
}

function getWikiRelicRarity(item: HeroSiegeWikiItem): RelicRarity {
  if (item.tierGroup === "Heroic" || item.tierGroup === "Unholy" || item.tierGroup === "Angelic" || item.tier === "SS") {
    return "boss";
  }
  if (item.tierGroup === "Satanic Set") {
    return "shop";
  }
  if (item.tier === "S" || item.tier === "A") {
    return "rare";
  }
  return item.tier === "B" ? "uncommon" : "common";
}

function getWikiCharacterStat(line: string, slot: EquipmentSlot): CharacterStatKey | null {
  const normalized = line.toLowerCase();
  if (normalized.includes("all attributes") || normalized.includes("all stats")) {
    return slot === "mainHand" ? "strength" : "constitution";
  }
  if (normalized.includes("strength") || normalized.includes("attack damage")) {
    return "strength";
  }
  if (normalized.includes("vitality") || normalized.includes("stamina") || normalized.includes("defense") || normalized.includes("life")) {
    return "constitution";
  }
  if (normalized.includes("intelligence") || normalized.includes("energy") || normalized.includes("mana") || normalized.includes("cast rate")) {
    return "intelligence";
  }
  if (normalized.includes("movement") || normalized.includes("magic find") || normalized.includes("gold") || normalized.includes("attack rating")) {
    return "perception";
  }
  return null;
}

function getWikiModifier(line: string, divisor: number): ItemModifier | null {
  const normalized = line.toLowerCase();
  if (normalized.includes("enhanced damage") || normalized.includes("attack damage increased") || normalized.includes("skill damage increased")) {
    return { key: "enhancedDamagePercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("crit")) {
    return { key: "criticalChancePercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("magic find")) {
    return { key: "magicFindPercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("gold")) {
    return { key: "goldFindPercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("life after each kill") || normalized.includes("replenish life")) {
    return { key: "lifeOnKill", value: scaleWikiValue(line, divisor) };
  }
  if (normalized.includes("mana after each kill") || normalized.includes("replenish mana")) {
    return { key: "manaOnKill", value: scaleWikiValue(line, divisor) };
  }
  if (normalized.includes(" to life") || normalized.includes("life increased")) {
    return { key: "maxLife", value: scaleWikiValue(line, divisor) };
  }
  if (normalized.includes(" to mana") || normalized.includes("mana increased")) {
    return { key: "maxMana", value: scaleWikiValue(line, divisor) };
  }
  if (normalized.includes("physical damage taken reduced") || normalized.includes("magic damage taken reduced")) {
    return { key: "damageReduction", value: scaleWikiValue(line, divisor) };
  }
  if (normalized.includes("fire resistance")) {
    return { key: "fireResistPercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("cold resistance")) {
    return { key: "coldResistPercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("lightning resistance")) {
    return { key: "lightningResistPercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("poison resistance")) {
    return { key: "poisonResistPercent", value: scaleWikiPercent(line, divisor) };
  }
  if (normalized.includes("increased experience")) {
    return { key: "bonusXpPercent", value: scaleWikiPercent(line, divisor) };
  }
  return null;
}

function scaleWikiValue(line: string, divisor: number) {
  const value = getAverageNumber(line);
  return Math.max(MIN_WIKI_STAT, Math.min(MAX_WIKI_STAT, Math.ceil(value / divisor)));
}

function scaleWikiPercent(line: string, divisor: number) {
  const value = getAverageNumber(line);
  return Math.max(MIN_WIKI_STAT, Math.min(MAX_WIKI_MODIFIER, Math.ceil(value / Math.max(1, divisor / 3))));
}

function getAverageNumber(line: string) {
  const range = line.match(/\[(-?\d+)-(-?\d+)\]/);
  if (range) {
    return (Math.abs(Number(range[1])) + Math.abs(Number(range[2]))) / 2;
  }
  const direct = line.match(/-?\d+/);
  return direct ? Math.abs(Number(direct[0])) : MIN_WIKI_STAT;
}

function getCatalogRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}

function getDuplicateIconFilter(id: string, occurrence: number) {
  const roll = getCatalogRoll(`${id}:${occurrence}:icon`);
  const hue = Math.round(roll * 360);
  const brightness = 0.9 + ((occurrence % 3) * 0.12);
  const saturation = 1.25 + ((occurrence % 4) * 0.18);
  return `hue-rotate(${hue}deg) saturate(${saturation.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
}
