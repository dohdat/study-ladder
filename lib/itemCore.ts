import { ITEM_BASE_NAMES, ITEM_NAME_POOL_COUNT } from "./itemNames";
import { applyWikiItemData, createWikiMechanicalStats, createWikiModifiers, pickWikiEquipmentItem } from "./heroSiegeWikiCatalog";
import type { CharacterStatKey, CharacterStats, EquipmentSlot, InventoryItem, ItemModifierKey, ItemRarity, Question } from "../types/study";

const FIRST_STAT_LEVEL = 1;
const MAX_CRITICAL_CHANCE = 0.5;
const MIN_ITEM_LEVEL = 1;
const MAX_ITEM_LEVEL = 100;
const MIN_QUESTION_RATING = 1000;
const MAX_QUESTION_RATING = 3500;
const STAT_REQUIREMENT_PER_POWER_TIER = 2;
const LEVELS_PER_POWER_TIER = 20;
const LOW_LEVEL_AFFIX_MAX_LEVEL = 20;
const MID_LEVEL_AFFIX_MAX_LEVEL = 50;
const LOW_LEVEL_MODIFIER_MAX_LEVEL = 30;
const MID_LEVEL_MODIFIER_MAX_LEVEL = 70;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const ITEM_ID_RADIX = 36;
const RARITY_DIFFICULTY_BONUS = 0.03;
const RARITY_PERCEPTION_BONUS = 0.01;
const LEGENDARY_ROLL_MAX = 0.03;
const EPIC_ROLL_MAX = 0.1;
const RARE_ROLL_MAX = 0.24;
const UNCOMMON_ROLL_MAX = 0.48;
const RARITY_AFFIX_COUNTS: Record<ItemRarity, number> = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 4 };
const RARITY_STAT_MAX: Record<ItemRarity, number> = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
const RARITY_LEVEL_OFFSET: Record<ItemRarity, number> = { common: 0, uncommon: 2, rare: 5, epic: 9, legendary: 14 };
const RARITY_STAT_REQUIREMENTS: Record<ItemRarity, number> = { common: 0, uncommon: 2, rare: 4, epic: 7, legendary: 10 };
const RARITY_MODIFIER_COUNTS: Record<ItemRarity, number> = { common: 0, uncommon: 0, rare: 1, epic: 2, legendary: 3 };
const RARITY_ORDER: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
const SET_DROP_CHANCE = 0;
const MIN_SET_DIFFICULTY: Question["difficulty"] = 2;
const COMMON_ONLY_MAX_LEVEL = 3;
const UNCOMMON_MAX_LEVEL = 8;
const RARE_MAX_LEVEL = 20;
const EPIC_MAX_LEVEL = 40;
const STAT_KEYS: CharacterStatKey[] = ["strength", "constitution", "perception", "intelligence"];
const MODIFIER_POOLS: Array<{ key: ItemModifierKey; min: number; max: number }> = [
  { key: "bonusXpPercent", min: 5, max: 20 },
  { key: "coldResistPercent", min: 5, max: 30 },
  { key: "criticalChancePercent", min: 2, max: 8 },
  { key: "damageReduction", min: 1, max: 4 },
  { key: "enhancedDamagePercent", min: 8, max: 30 },
  { key: "fireResistPercent", min: 5, max: 30 },
  { key: "goldFindPercent", min: 8, max: 35 },
  { key: "lifeOnKill", min: 2, max: 8 },
  { key: "lightningResistPercent", min: 5, max: 30 },
  { key: "magicFindPercent", min: 5, max: 25 },
  { key: "manaOnKill", min: 2, max: 8 },
  { key: "maxLife", min: 5, max: 20 },
  { key: "maxMana", min: 5, max: 20 },
  { key: "poisonResistPercent", min: 5, max: 30 }
];

export const ITEM_BASE_NAME_COUNT = ITEM_NAME_POOL_COUNT;
export const EQUIPMENT_SLOTS: EquipmentSlot[] = ["mainHand", "offHand", "headgear", "armor", "headAccessory", "eyewear", "bodyAccessory", "backAccessory", "feet"];
const LOW_LEVEL_ITEM_BASE_NAMES: Record<EquipmentSlot, string[]> = {
  armor: ["Padded Armor", "Leather Coat", "Studded Leather", "Tunic", "Hide Vest", "Chain Shirt"],
  backAccessory: ["Small Charm", "Lucky Pebble", "Cloth Pouch", "Old Token", "Carved Charm", "Scout's Satchel"],
  bodyAccessory: ["Leather Gloves", "Cloth Wraps", "Sash", "Leather Belt", "Heavy Gloves", "Chain Gloves"],
  eyewear: ["Bronze Ring", "Iron Ring", "Copper Band", "Socket Ring", "Plain Ring", "Silver Loop"],
  feet: ["Boots", "Heavy Boots", "Cloth Shoes", "Chain Boots", "Light Plated Boots", "Trail Boots"],
  headAccessory: ["Amulet", "Locket", "Talisman", "Pearls", "Carcanet", "Simple Pendant"],
  headgear: ["Cap", "Casque", "Leather Hood", "War Hat", "Great Helm", "Basinet"],
  mainHand: ["Hand Axe", "Hatchet", "Cudgel", "Mace", "Dagger", "Short Sword", "Sabre", "Gnarled Staff", "Wand", "Short Spear"],
  offHand: ["Wooden Shield", "Buckler", "Round Shield", "Small Crescent", "Bone Shield", "Tribal Ward"]
};
export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  armor: "Armor",
  backAccessory: "Back Accessory",
  bodyAccessory: "Body Accessory",
  eyewear: "Eyewear",
  feet: "Boots",
  headAccessory: "Head Accessory",
  headgear: "Headgear",
  mainHand: "Main-hand Item",
  offHand: "Off-hand Item"
};
export const SLOT_STAT_BIAS: Record<EquipmentSlot, CharacterStatKey> = {
  armor: "constitution",
  backAccessory: "perception",
  bodyAccessory: "constitution",
  eyewear: "intelligence",
  feet: "perception",
  headAccessory: "perception",
  headgear: "intelligence",
  mainHand: "strength",
  offHand: "strength"
};

export const ITEM_SET_DEFINITIONS = [
  { id: "sigons-complete-steel", name: "Sigon's Complete Steel", pieces: ["Sigon's Gage", "Sigon's Guard", "Sigon's Shelter", "Sigon's Sabot"], bonuses: { 2: { constitution: 2 }, 3: { strength: 2, constitution: 2 }, 4: { strength: 3, constitution: 3 } } },
  { id: "angelic-raiment", name: "Angelic Raiment", pieces: ["Angelic Sickle", "Angelic Mantle", "Angelic Halo", "Angelic Wings"], bonuses: { 2: { intelligence: 2 }, 3: { perception: 2, intelligence: 2 }, 4: { perception: 3, intelligence: 3 } } },
  { id: "isenharts-armory", name: "Isenhart's Armory", pieces: ["Isenhart's Lightbrand", "Isenhart's Case", "Isenhart's Horns", "Isenhart's Parry"], bonuses: { 2: { strength: 2 }, 3: { strength: 2, constitution: 2 }, 4: { strength: 4 } } },
  { id: "vidalas-rig", name: "Vidala's Rig", pieces: ["Vidala's Barb", "Vidala's Fetlock", "Vidala's Ambush", "Vidala's Snare"], bonuses: { 2: { perception: 2 }, 3: { perception: 3 }, 4: { perception: 4, intelligence: 2 } } },
  { id: "cleglaws-brace", name: "Cleglaw's Brace", pieces: ["Cleglaw's Tooth", "Cleglaw's Claw", "Cleglaw's Pincers"], bonuses: { 2: { strength: 2 }, 3: { strength: 3, constitution: 2 } } },
  { id: "arcannas-tricks", name: "Arcanna's Tricks", pieces: ["Arcanna's Sign", "Arcanna's Head", "Arcanna's Flesh", "Arcanna's Deathwand"], bonuses: { 2: { intelligence: 2 }, 3: { intelligence: 3 }, 4: { intelligence: 4, perception: 2 } } }
] as const;

export type DropItemOptions = {
  maxItemLevel?: number;
  minRarity?: ItemRarity;
  rarityBonus?: number;
  slot?: EquipmentSlot;
};

export function createDropItem(question: Question, stats: CharacterStats, now: number, options: DropItemOptions = {}): InventoryItem {
  const seed = `${question.id}:${now}`;
  const slot = options.slot || pickFrom(EQUIPMENT_SLOTS, seededRandom(`${seed}:slot`));
  const rarity = capRarityForLevel(getDropRarity(question, stats, seed, options), options.maxItemLevel, options.minRarity);
  const itemLevel = getCappedItemLevel(getItemLevelRequirement(question, rarity), options.maxItemLevel);
  const itemStats = rollItemStats(slot, rarity, itemLevel, seed);
  const wikiItem = pickWikiEquipmentItem(slot, `${seed}:wiki`, { maxItemLevel: options.maxItemLevel ?? itemLevel, rarity })
    || pickWikiEquipmentItem(slot, `${seed}:wiki-fallback`, { maxItemLevel: MAX_ITEM_LEVEL });
  const wikiStats = createWikiMechanicalStats(slot, wikiItem);
  const primaryStat = getStrongestItemStat(itemStats) || SLOT_STAT_BIAS[slot];
  const setDefinition = getDropSet(question, seed);
  const setPieceName = setDefinition ? pickFrom([...setDefinition.pieces], seededRandom(`${seed}:set-piece`)) : null;
  return applyWikiItemData({
    id: `item-${question.id}-${now}-${Math.floor(seededRandom(`${seed}:id`) * HASH_SEED).toString(ITEM_ID_RADIX)}`,
    modifiers: mergeItemModifiers(rollItemModifiers(rarity, itemLevel, seed), createWikiModifiers(wikiItem?.stats || [])).slice(0, getLevelModifierCap(itemLevel)),
    name: setPieceName || createItemName(slot, itemLevel, seed),
    requirements: rollItemRequirements(rarity, primaryStat, itemLevel, seed),
    rarity,
    setId: setDefinition?.id,
    slot,
    stats: Object.values(wikiStats).some(Boolean) ? limitStatsForRarity({ ...itemStats, ...wikiStats }, rarity, itemLevel) : itemStats
  }, wikiItem);
}

function getCappedItemLevel(itemLevel: number, maxItemLevel: number | undefined) {
  if (!Number.isFinite(maxItemLevel)) {
    return itemLevel;
  }
  return Math.min(itemLevel, Math.max(MIN_ITEM_LEVEL, Math.floor(maxItemLevel || MIN_ITEM_LEVEL)));
}

export function getActiveSetBonusesForItems(items: InventoryItem[]) {
  return ITEM_SET_DEFINITIONS.map((set) => {
    const count = items.filter((item) => item.setId === set.id).length;
    const bonuses = Object.entries(set.bonuses).filter(([pieces]) => count >= Number(pieces)).map(([pieces, stats]) => ({ pieces: Number(pieces), stats }));
    return { count, id: set.id, name: set.name, total: set.pieces.length, bonuses };
  }).filter((set) => set.count > 0);
}

function getDropSet(question: Question, seed: string) {
  if (question.difficulty < MIN_SET_DIFFICULTY || seededRandom(`${seed}:set`) > SET_DROP_CHANCE) {
    return null;
  }
  return pickFrom([...ITEM_SET_DEFINITIONS], seededRandom(`${seed}:set-id`));
}

function createItemName(slot: EquipmentSlot, itemLevel: number, seed: string) {
  const pool = itemLevel < LOW_LEVEL_AFFIX_MAX_LEVEL ? LOW_LEVEL_ITEM_BASE_NAMES[slot] : ITEM_BASE_NAMES[slot];
  const baseName = pickFrom(pool, seededRandom(`${seed}:base-name`));
  return baseName;
}

function capRarityForLevel(rarity: ItemRarity, maxItemLevel: number | undefined, minRarity: ItemRarity | undefined) {
  const preserveMinimum = (capped: ItemRarity) => enforceMinimumRarity(capped, minRarity);
  if (!Number.isFinite(maxItemLevel)) {
    return preserveMinimum(rarity);
  }
  const maxLevel = Math.max(MIN_ITEM_LEVEL, Math.floor(maxItemLevel || MIN_ITEM_LEVEL));
  if (maxLevel <= COMMON_ONLY_MAX_LEVEL) {
    return preserveMinimum(capRarity(rarity, "common"));
  }
  if (maxLevel <= UNCOMMON_MAX_LEVEL) {
    return preserveMinimum(capRarity(rarity, "uncommon"));
  }
  if (maxLevel <= RARE_MAX_LEVEL) {
    return preserveMinimum(capRarity(rarity, "rare"));
  }
  if (maxLevel <= EPIC_MAX_LEVEL) {
    return preserveMinimum(capRarity(rarity, "epic"));
  }
  return preserveMinimum(rarity);
}

function capRarity(rarity: ItemRarity, maxRarity: ItemRarity) {
  return RARITY_ORDER[Math.min(RARITY_ORDER.indexOf(rarity), RARITY_ORDER.indexOf(maxRarity))] || rarity;
}

function getItemLevelRequirement(question: Question, rarity: ItemRarity) {
  const clampedRating = Math.min(MAX_QUESTION_RATING, Math.max(MIN_QUESTION_RATING, question.rating));
  const ratingProgress = (clampedRating - MIN_QUESTION_RATING) / (MAX_QUESTION_RATING - MIN_QUESTION_RATING);
  const ratingLevel = MIN_ITEM_LEVEL + Math.round(ratingProgress * (MAX_ITEM_LEVEL - MIN_ITEM_LEVEL));
  return Math.min(MAX_ITEM_LEVEL, Math.max(MIN_ITEM_LEVEL, ratingLevel + RARITY_LEVEL_OFFSET[rarity]));
}

function rollItemRequirements(rarity: ItemRarity, primaryStat: CharacterStatKey, itemLevel: number, seed: string) {
  const statRequirement = Math.min(RARITY_STAT_REQUIREMENTS[rarity], getItemPowerTier(itemLevel) * STAT_REQUIREMENT_PER_POWER_TIER);
  return {
    level: itemLevel,
    stats: statRequirement > 0 && seededRandom(`${seed}:requires-stat`) > MAX_CRITICAL_CHANCE ? { [primaryStat]: statRequirement } : {}
  };
}

function rollItemStats(slot: EquipmentSlot, rarity: ItemRarity, itemLevel: number, seed: string): Partial<CharacterStats> {
  const itemStats: Partial<CharacterStats> = {};
  const chosen = [SLOT_STAT_BIAS[slot]];
  const affixCount = Math.min(RARITY_AFFIX_COUNTS[rarity], getLevelAffixCap(itemLevel));
  for (let index = FIRST_STAT_LEVEL; index < affixCount; index += FIRST_STAT_LEVEL) {
    const candidate = pickFrom(STAT_KEYS, seededRandom(`${seed}:affix:${index}`));
    chosen.push(chosen.includes(candidate) ? pickFallbackStat(chosen, index) : candidate);
  }
  for (const [index, stat] of chosen.entries()) {
    itemStats[stat] = (itemStats[stat] || 0) + rollStatValue(rarity, itemLevel, `${seed}:value:${stat}:${index}`);
  }
  return itemStats;
}

function pickFallbackStat(chosen: CharacterStatKey[], index: number) {
  return STAT_KEYS.find((stat) => !chosen.includes(stat)) || STAT_KEYS[index % STAT_KEYS.length];
}

function rollStatValue(rarity: ItemRarity, itemLevel: number, seed: string) {
  const statMax = Math.min(RARITY_STAT_MAX[rarity], getItemPowerTier(itemLevel));
  return FIRST_STAT_LEVEL + Math.floor(seededRandom(seed) * statMax);
}

function rollItemModifiers(rarity: ItemRarity, itemLevel: number, seed: string) {
  const modifierCount = Math.min(RARITY_MODIFIER_COUNTS[rarity], getLevelModifierCap(itemLevel));
  const picked: ItemModifierKey[] = [];
  for (let index = 0; index < modifierCount; index += FIRST_STAT_LEVEL) {
    const poolItem = pickAvailableModifier(picked, `${seed}:modifier:${index}`);
    picked.push(poolItem.key);
  }
  return picked.map((key, index) => {
    const poolItem = MODIFIER_POOLS.find((modifier) => modifier.key === key) || MODIFIER_POOLS[0];
    return { key, value: rollModifierValue(poolItem, itemLevel, `${seed}:modifier-value:${key}:${index}`) };
  });
}

function mergeItemModifiers(base: InventoryItem["modifiers"], wikiModifiers: InventoryItem["modifiers"]) {
  const merged = [...(base || [])];
  for (const modifier of wikiModifiers || []) {
    if (!merged.some((row) => row.key === modifier.key)) {
      merged.push(modifier);
    }
  }
  return merged;
}

function limitStatsForRarity(stats: Partial<CharacterStats>, rarity: ItemRarity, itemLevel: number) {
  const maxStats = Math.min(RARITY_AFFIX_COUNTS[rarity], getLevelAffixCap(itemLevel));
  return Object.fromEntries(Object.entries(stats).slice(0, maxStats)) as Partial<CharacterStats>;
}

function pickAvailableModifier(picked: ItemModifierKey[], seed: string) {
  const available = MODIFIER_POOLS.filter((modifier) => !picked.includes(modifier.key));
  return pickFrom(available.length ? available : MODIFIER_POOLS, seededRandom(seed));
}

function rollModifierValue(poolItem: { min: number; max: number }, itemLevel: number, seed: string) {
  const scaledMax = Math.max(FIRST_STAT_LEVEL, Math.ceil(poolItem.max * (itemLevel / MAX_ITEM_LEVEL)));
  const scaledMin = Math.min(poolItem.min, scaledMax);
  return scaledMin + Math.floor(seededRandom(seed) * (scaledMax - scaledMin + FIRST_STAT_LEVEL));
}

function getItemPowerTier(itemLevel: number) {
  return Math.max(FIRST_STAT_LEVEL, Math.ceil(itemLevel / LEVELS_PER_POWER_TIER));
}

function getLevelAffixCap(itemLevel: number) {
  const LOW_LEVEL_AFFIX_CAP = 2;
  const MID_LEVEL_AFFIX_CAP = 3;
  const HIGH_LEVEL_AFFIX_CAP = 4;
  if (itemLevel < LOW_LEVEL_AFFIX_MAX_LEVEL) {
    return LOW_LEVEL_AFFIX_CAP;
  }
  if (itemLevel < MID_LEVEL_AFFIX_MAX_LEVEL) {
    return MID_LEVEL_AFFIX_CAP;
  }
  return HIGH_LEVEL_AFFIX_CAP;
}

function getLevelModifierCap(itemLevel: number) {
  const LOW_LEVEL_MODIFIER_CAP = 1;
  const MID_LEVEL_MODIFIER_CAP = 2;
  const HIGH_LEVEL_MODIFIER_CAP = 3;
  if (itemLevel < LOW_LEVEL_MODIFIER_MAX_LEVEL) {
    return LOW_LEVEL_MODIFIER_CAP;
  }
  if (itemLevel < MID_LEVEL_MODIFIER_MAX_LEVEL) {
    return MID_LEVEL_MODIFIER_CAP;
  }
  return HIGH_LEVEL_MODIFIER_CAP;
}

function getStrongestItemStat(stats: Partial<CharacterStats>): CharacterStatKey | null {
  return STAT_KEYS.reduce<{ stat: CharacterStatKey | null; value: number }>((best, stat) => {
    const value = stats[stat] || 0;
    return value > best.value ? { stat, value } : best;
  }, { stat: null, value: 0 }).stat;
}

function getDropRarity(question: Question, stats: CharacterStats, seed: string, options: DropItemOptions): ItemRarity {
  const roll = seededRandom(`${seed}:rarity`) - question.difficulty * RARITY_DIFFICULTY_BONUS - (stats.perception - FIRST_STAT_LEVEL) * RARITY_PERCEPTION_BONUS - (options.rarityBonus || 0);
  const rolled = getRarityFromRoll(roll);
  return enforceMinimumRarity(rolled, options.minRarity);
}

function getRarityFromRoll(roll: number): ItemRarity {
  if (roll < LEGENDARY_ROLL_MAX) {
    return "legendary";
  }
  if (roll < EPIC_ROLL_MAX) {
    return "epic";
  }
  if (roll < RARE_ROLL_MAX) {
    return "rare";
  }
  if (roll < UNCOMMON_ROLL_MAX) {
    return "uncommon";
  }
  return "common";
}

function enforceMinimumRarity(rarity: ItemRarity, minRarity: ItemRarity | undefined) {
  if (!minRarity) {
    return rarity;
  }
  return RARITY_ORDER[Math.max(RARITY_ORDER.indexOf(rarity), RARITY_ORDER.indexOf(minRarity))] || rarity;
}

function pickFrom<T>(items: T[], roll: number) {
  return items[Math.min(items.length - 1, Math.floor(roll * items.length))];
}

function seededRandom(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}
