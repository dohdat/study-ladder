import { createWikiRelicDefinitions } from "./heroSiegeWikiCatalog";
import { getRelicQualityLabel } from "./heroSiegeQuality";
import type { ItemModifierKey, Relic, RelicRarity, StudyState } from "../types/study";

const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const COMMON_COST = 120;
const UNCOMMON_COST = 170;
const RARE_COST = 240;
const SHOP_COST = 260;
const BOSS_COST = 320;
const EVENT_COST = 210;
const UNIQUE_EFFECT_START_VALUE = 1;
const UNIQUE_EFFECT_SEARCH_LIMIT = 200;
const LOW_LEVEL_WIKI_RELIC_MAX_LEVEL = 20;
const HIGH_POWER_WIKI_RELIC_GROUPS = new Set(["Satanic", "Satanic Set", "Heroic", "Unholy", "Angelic"]);

type RelicSeed = Omit<Relic, "id"> & { id?: string };

const UNIQUE_EFFECT_KEYS: ItemModifierKey[] = [
  "bonusXpPercent",
  "goldFindPercent",
  "magicFindPercent",
  "maxLife",
  "maxMana",
  "enhancedDamagePercent",
  "criticalChancePercent",
  "lifeOnKill",
  "manaOnKill",
  "damageReduction"
];

const relic = (name: string, rarity: RelicRarity, description: string, modifiers: Partial<Record<ItemModifierKey, number>>, source: Relic["source"] = "any"): Relic => ({
  description,
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  modifiers: Object.entries(modifiers).map(([key, value]) => ({ key: key as ItemModifierKey, value: value || 0 })).filter((modifier) => modifier.value !== 0),
  name,
  rarity,
  source
});

const createRelic = (seed: RelicSeed): Relic => ({
  ...seed,
  id: seed.id || seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
});

const LEGACY_RELIC_DEFINITIONS: Relic[] = [
  createRelic({ description: "After each completed combat, recover health.", id: "burning-blood", modifiers: [{ key: "lifeOnKill", value: 6 }], name: "Burning Blood", rarity: "starter", source: "ironclad" }),
  createRelic({ description: "A stronger Burning Blood that greatly improves combat sustain.", id: "black-blood", modifiers: [{ key: "lifeOnKill", value: 12 }], name: "Black Blood", rarity: "boss", source: "ironclad" }),
  relic("Red Skull", "common", "When health is low, your attacks hit harder.", { criticalChancePercent: 4, enhancedDamagePercent: 8 }, "ironclad"),
  relic("Paper Phrog", "uncommon", "Your heavy strikes punish vulnerable monsters harder.", { enhancedDamagePercent: 12 }, "ironclad"),
  relic("Self-Forming Clay", "uncommon", "Mistakes harden your defenses for the run.", { damageReduction: 1, maxLife: 4 }, "ironclad"),
  relic("Champion Belt", "rare", "Battle cries make your critical hits more reliable.", { criticalChancePercent: 8 }, "ironclad"),
  relic("Charon's Ashes", "rare", "Every exhausted attempt leaves extra burn damage behind.", { enhancedDamagePercent: 18 }, "ironclad"),
  relic("Magic Flower", "rare", "Healing effects are stronger.", { lifeOnKill: 5, maxLife: 8 }, "ironclad"),
  relic("Mark of Pain", "boss", "Gain raw power, but the run becomes more volatile.", { enhancedDamagePercent: 28, maxMana: -4 }, "ironclad"),
  relic("Runic Cube", "boss", "Pain becomes insight and mana.", { maxMana: 10, manaOnKill: 2 }, "ironclad"),
  relic("Brimstone", "shop", "Huge offense at the cost of taking riskier fights.", { enhancedDamagePercent: 30, damageReduction: -1 }, "ironclad"),
  relic("Akabeko", "common", "Your first strike in each fight lands heavier.", { enhancedDamagePercent: 6 }),
  relic("Anchor", "common", "Start fights protected.", { damageReduction: 1 }),
  relic("Ancient Tea Set", "common", "Resting improves the next fight's mana economy.", { maxMana: 4 }),
  relic("Art of War", "common", "Patient turns become resource advantage.", { manaOnKill: 1 }),
  relic("Bag of Marbles", "common", "Open fights by making monsters easier to burst.", { enhancedDamagePercent: 5 }),
  relic("Bag of Preparation", "common", "Better preparation improves learning speed.", { bonusXpPercent: 4 }),
  relic("Blood Vial", "common", "A small source of sustain after wins.", { lifeOnKill: 2 }),
  relic("Bronze Scales", "common", "Thorny armor softens incoming punishment.", { damageReduction: 1 }),
  relic("Centennial Puzzle", "common", "Taking damage teaches you faster.", { bonusXpPercent: 5 }),
  relic("Ceramic Fish", "common", "New rewards bring extra gold.", { goldFindPercent: 8 }),
  relic("Dream Catcher", "common", "Rest sites improve future rewards.", { magicFindPercent: 5 }),
  relic("Happy Flower", "common", "Steady rhythm improves mana recovery.", { manaOnKill: 1 }),
  relic("Juzu Bracelet", "common", "Fewer ambushes means steadier progress.", { damageReduction: 1 }),
  relic("Lantern", "common", "Start with extra energy.", { maxMana: 5 }),
  relic("Maw Bank", "common", "Saving coins becomes easier.", { goldFindPercent: 10 }),
  relic("Meal Ticket", "common", "Shops are safer to visit.", { lifeOnKill: 3 }),
  relic("Nunchaku", "common", "Repeated attacks refund mana.", { manaOnKill: 1, enhancedDamagePercent: 4 }),
  relic("Oddly Smooth Stone", "common", "A small permanent defense boost.", { damageReduction: 1 }),
  relic("Omamori", "common", "Protects the run from bad luck.", { maxLife: 4 }),
  relic("Orichalcum", "common", "Reliable fallback armor.", { damageReduction: 1, maxLife: 3 }),
  relic("Pen Nib", "common", "Every sequence has a decisive strike.", { criticalChancePercent: 5 }),
  relic("Potion Belt", "common", "More room for recovery tools.", { maxMana: 3 }),
  relic("Smiling Mask", "common", "Better deals from merchants.", { goldFindPercent: 5 }),
  relic("Strawberry", "common", "Raises maximum health.", { maxLife: 7 }),
  relic("The Boot", "common", "Small hits become meaningful.", { enhancedDamagePercent: 6 }),
  relic("Tiny Chest", "common", "Treasure appears more often.", { magicFindPercent: 8 }),
  relic("Toy Ornithopter", "common", "Potions and wins recover life.", { lifeOnKill: 3 }),
  relic("Vajra", "common", "Raises strength.", { enhancedDamagePercent: 8 }),
  relic("War Paint", "common", "Improves defensive technique.", { damageReduction: 1 }),
  relic("Whetstone", "common", "Improves attack technique.", { enhancedDamagePercent: 8 }),
  relic("Blue Candle", "uncommon", "Turn bad draws into power.", { bonusXpPercent: 6 }),
  relic("Bottled Flame", "uncommon", "Your first attack is more reliable.", { criticalChancePercent: 4, enhancedDamagePercent: 6 }),
  relic("Bottled Lightning", "uncommon", "Your first skill is easier to fund.", { maxMana: 5 }),
  relic("Bottled Tornado", "uncommon", "Your build-defining power starts earlier.", { bonusXpPercent: 8 }),
  relic("Darkstone Periapt", "uncommon", "Bad luck turns into health.", { maxLife: 6 }),
  relic("Eternal Feather", "uncommon", "Long runs recover better.", { lifeOnKill: 4 }),
  relic("Frozen Egg", "uncommon", "Power rewards improve faster.", { bonusXpPercent: 7 }),
  relic("Gremlin Horn", "uncommon", "Defeating enemies returns energy.", { manaOnKill: 2 }),
  relic("Horn Cleat", "uncommon", "Second-wave pressure is easier to block.", { damageReduction: 1, maxLife: 4 }),
  relic("Ink Bottle", "uncommon", "Repeated plays create insight.", { bonusXpPercent: 5, manaOnKill: 1 }),
  relic("Kunai", "uncommon", "Multi-hit builds become safer.", { damageReduction: 1, criticalChancePercent: 3 }),
  relic("Letter Opener", "uncommon", "Skill-heavy turns deal splash damage.", { enhancedDamagePercent: 8 }),
  relic("Matryoshka", "uncommon", "Treasure rooms are more rewarding.", { magicFindPercent: 10 }),
  relic("Meat on the Bone", "uncommon", "Low-health runs recover after fights.", { lifeOnKill: 8 }),
  relic("Mummified Hand", "uncommon", "Power skills discount your next active skill.", { maxMana: 6 }),
  relic("Ornamental Fan", "uncommon", "Attack chains add defense.", { damageReduction: 1 }),
  relic("Pantograph", "uncommon", "Boss and elite routes are safer.", { maxLife: 10, lifeOnKill: 3 }),
  relic("Pear", "uncommon", "Raises maximum health.", { maxLife: 10 }),
  relic("Question Card", "uncommon", "More reward choices improve drops.", { magicFindPercent: 8 }),
  relic("Shuriken", "uncommon", "Attack chains scale strength.", { enhancedDamagePercent: 10 }),
  relic("Singing Bowl", "uncommon", "Skipped rewards become max health.", { maxLife: 6 }),
  relic("Strike Dummy", "uncommon", "Basic strikes hit harder.", { enhancedDamagePercent: 7 }),
  relic("Sundial", "uncommon", "Long loops refund mana.", { manaOnKill: 2 }),
  relic("The Courier", "uncommon", "Merchants stock better goods.", { goldFindPercent: 10, magicFindPercent: 5 }),
  relic("Toxic Egg", "uncommon", "Skill rewards mature faster.", { bonusXpPercent: 7 }),
  relic("White Beast Statue", "uncommon", "More potion-like recovery appears.", { lifeOnKill: 3, manaOnKill: 1 }),
  relic("Black Star", "rare", "Elites drop better treasure.", { magicFindPercent: 18 }),
  relic("Girya", "rare", "Resting can become permanent strength.", { enhancedDamagePercent: 14 }),
  relic("Ice Cream", "rare", "Unused mana carries momentum.", { maxMana: 12 }),
  relic("Incense Burner", "rare", "Periodic invulnerability reduces punishment.", { damageReduction: 2 }),
  relic("Lizard Tail", "rare", "A second chance effect represented as more life.", { maxLife: 18 }),
  relic("Mango", "rare", "Greatly raises maximum health.", { maxLife: 14 }),
  relic("Old Coin", "rare", "A huge gold windfall.", { goldFindPercent: 25 }),
  relic("Pocketwatch", "rare", "Careful turns are more rewarding.", { bonusXpPercent: 10 }),
  relic("Torii", "rare", "Small hits are reduced sharply.", { damageReduction: 2 }),
  relic("Tungsten Rod", "rare", "All health loss is reduced.", { damageReduction: 1 }),
  relic("Turnip", "rare", "Resist frailty and pressure.", { maxLife: 7, damageReduction: 1 }),
  relic("Unceasing Top", "rare", "Empty-handed turns find more options.", { manaOnKill: 2, bonusXpPercent: 5 }),
  relic("Wing Boots", "rare", "Route flexibility increases rewards.", { magicFindPercent: 12 }),
  relic("Astrolabe", "boss", "Transform weak habits into stronger ones.", { bonusXpPercent: 15 }),
  createRelic({ description: "Elite fights become much more profitable.", id: "black-star-ascendant", modifiers: [{ key: "magicFindPercent", value: 20 }], name: "Black Star Ascendant", rarity: "boss", source: "any" }),
  relic("Busted Crown", "boss", "More energy, fewer choices.", { maxMana: 10, magicFindPercent: -5 }),
  relic("Calling Bell", "boss", "A curse and a jackpot.", { magicFindPercent: 18, maxLife: -4 }),
  relic("Coffee Dripper", "boss", "More energy but less rest.", { maxMana: 12, lifeOnKill: -2 }),
  relic("Empty Cage", "boss", "Remove weak patterns.", { bonusXpPercent: 10 }),
  relic("Fusion Hammer", "boss", "More energy, less refinement.", { maxMana: 12, bonusXpPercent: -4 }),
  relic("Pandora's Box", "boss", "Transform your whole approach.", { magicFindPercent: 12, bonusXpPercent: 8 }),
  relic("Philosopher's Stone", "boss", "More energy, more danger.", { maxMana: 10, damageReduction: -1 }),
  relic("Runic Dome", "boss", "Power with hidden danger.", { maxMana: 10, maxLife: -5 }),
  relic("Runic Pyramid", "boss", "Keep more options between fights.", { maxMana: 8, bonusXpPercent: 8 }),
  relic("Sacred Bark", "boss", "Recovery effects are stronger.", { lifeOnKill: 8, manaOnKill: 1 }),
  relic("Snecko Eye", "boss", "Confusing, powerful draw.", { maxMana: 10, criticalChancePercent: 6 }),
  relic("Sozu", "boss", "Energy without potions.", { maxMana: 12, lifeOnKill: -2 }),
  relic("Tiny House", "boss", "A little bit of everything.", { bonusXpPercent: 5, goldFindPercent: 5, maxLife: 5, maxMana: 5 }),
  relic("Velvet Choker", "boss", "More energy, limited actions.", { maxMana: 12, enhancedDamagePercent: -4 }),
  relic("Golden Idol", "event", "Enemies drop more gold.", { goldFindPercent: 25 }),
  relic("Gremlin Visage", "event", "Start weak but learn from pressure.", { bonusXpPercent: 8, damageReduction: -1 }),
  relic("Mutagenic Strength", "event", "Start fights with explosive power.", { enhancedDamagePercent: 18 }),
  relic("N'loth's Gift", "event", "Rare rewards appear more often.", { magicFindPercent: 20 }),
  relic("Necronomicon", "event", "Heavy attacks echo.", { enhancedDamagePercent: 20, maxLife: -5 }),
  relic("Neow's Lament", "event", "Early fights are much easier.", { enhancedDamagePercent: 12 }),
  relic("Odd Mushroom", "event", "Vulnerability hurts less.", { damageReduction: 1, maxLife: 4 }),
  relic("Ssserpent Head", "event", "Unknown rooms pay out.", { goldFindPercent: 15 },
  ),
  relic("Warped Tongs", "event", "A random skill feels upgraded each fight.", { bonusXpPercent: 8, enhancedDamagePercent: 8 })
];

const WIKI_RELIC_DEFINITIONS = createWikiRelicDefinitions();
export const RELIC_DEFINITIONS: Relic[] = makeRelicEffectsUnique([...WIKI_RELIC_DEFINITIONS, ...addLegacyIconFilters(LEGACY_RELIC_DEFINITIONS)]);

export function getOwnedRelicIds(state: StudyState) {
  return new Set(state.profile.relics.map((relic) => relic.id));
}

export function getRelicModifierTotals(state: StudyState) {
  const totals: Record<ItemModifierKey, number> = {
    bonusXpPercent: 0,
    coldResistPercent: 0,
    criticalChancePercent: 0,
    damageReduction: 0,
    enhancedDamagePercent: 0,
    fireResistPercent: 0,
    goldFindPercent: 0,
    lifeOnKill: 0,
    lightningResistPercent: 0,
    magicFindPercent: 0,
    manaOnKill: 0,
    maxLife: 0,
    maxMana: 0,
    poisonResistPercent: 0
  };
  for (const relic of state.profile.relics) {
    for (const modifier of relic.modifiers || []) {
      totals[modifier.key] += modifier.value;
    }
  }
  return totals;
}

export function normalizeRelics(relics: Relic[] | undefined) {
  const knownById = new Map(RELIC_DEFINITIONS.map((row) => [row.id, row]));
  return Array.from(new Set((relics || []).map((row) => row.id)))
    .map((id) => knownById.get(id))
    .filter(Boolean) as Relic[];
}

export function grantRelic(state: StudyState, relic: Relic): StudyState {
  if (getOwnedRelicIds(state).has(relic.id)) {
    return state;
  }
  return { ...state, profile: { ...state.profile, relics: [...state.profile.relics, relic] } };
}

export function rollRelic(state: StudyState, seed: string, options: { includeShop?: boolean; maxItemLevel?: number; minRarity?: RelicRarity[] } = {}) {
  const owned = getOwnedRelicIds(state);
  const allowed = RELIC_DEFINITIONS.filter((relicRow) => {
    if (owned.has(relicRow.id)) {
      return false;
    }
    if (relicRow.source !== "any" && relicRow.source !== "ironclad") {
      return false;
    }
    if (!options.includeShop && relicRow.rarity === "shop") {
      return false;
    }
    if (options.maxItemLevel && !isRelicAllowedForLevel(relicRow, options.maxItemLevel)) {
      return false;
    }
    return !options.minRarity || options.minRarity.includes(relicRow.rarity);
  });
  if (!allowed.length) {
    return RELIC_DEFINITIONS.find((relicRow) => relicRow.id === "circlet") || relic("Circlet", "special", "A trophy for finding everything.", {});
  }
  return allowed[Math.floor(getRelicSeedRoll(seed) * allowed.length)];
}

function isRelicAllowedForLevel(relicItem: Relic, maxItemLevel: number) {
  if (relicItem.wikiLevel && relicItem.wikiLevel > maxItemLevel) {
    return false;
  }
  if (maxItemLevel < LOW_LEVEL_WIKI_RELIC_MAX_LEVEL && relicItem.wikiTierGroup && HIGH_POWER_WIKI_RELIC_GROUPS.has(relicItem.wikiTierGroup)) {
    return false;
  }
  return true;
}

export function getRelicCost(relicItem: Relic) {
  if (relicItem.rarity === "common" || relicItem.rarity === "starter") {
    return COMMON_COST;
  }
  if (relicItem.rarity === "uncommon") {
    return UNCOMMON_COST;
  }
  if (relicItem.rarity === "rare") {
    return RARE_COST;
  }
  if (relicItem.rarity === "shop") {
    return SHOP_COST;
  }
  if (relicItem.rarity === "boss") {
    return BOSS_COST;
  }
  return EVENT_COST;
}

export function getRelicSeedRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}

function makeRelicEffectsUnique(relics: Relic[]) {
  const seen = new Set<string>();
  return relics.map((relicItem, index) => {
    const baseSignature = getRelicEffectSignature(relicItem);
    if (!seen.has(baseSignature)) {
      seen.add(baseSignature);
      return relicItem;
    }

    const uniqueRelic = createUniqueEffectRelic(relicItem, index, seen);
    seen.add(getRelicEffectSignature(uniqueRelic));
    return uniqueRelic;
  });
}

function addLegacyIconFilters(relics: Relic[]) {
  return relics.map((relicItem, index) => ({
    ...relicItem,
    wikiImageFilter: relicItem.wikiImageFilter || getRelicIconFilter(relicItem.id, index),
    wikiRarityLabel: relicItem.wikiRarityLabel || getLegacyRelicQualityLabel(relicItem.rarity)
  }));
}

function getLegacyRelicQualityLabel(rarity: RelicRarity) {
  return getRelicQualityLabel(rarity);
}

function getRelicIconFilter(id: string, index: number) {
  const hue = Math.round(getRelicSeedRoll(`${id}:${index}:icon-filter`) * 360);
  const saturation = 1.08 + ((index % 5) * 0.08);
  const brightness = 0.92 + ((index % 4) * 0.06);
  return `hue-rotate(${hue}deg) saturate(${saturation.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
}

function createUniqueEffectRelic(relicItem: Relic, index: number, seen: Set<string>) {
  for (let attempt = 0; attempt < UNIQUE_EFFECT_SEARCH_LIMIT; attempt += 1) {
    const key = UNIQUE_EFFECT_KEYS[(index + attempt) % UNIQUE_EFFECT_KEYS.length];
    const value = UNIQUE_EFFECT_START_VALUE + Math.floor(attempt / UNIQUE_EFFECT_KEYS.length);
    const candidate = addRelicModifier(relicItem, key, value);
    if (!seen.has(getRelicEffectSignature(candidate))) {
      return candidate;
    }
  }
  return addRelicModifier(relicItem, "bonusXpPercent", index + UNIQUE_EFFECT_START_VALUE);
}

function addRelicModifier(relicItem: Relic, key: ItemModifierKey, value: number): Relic {
  const modifiers = relicItem.modifiers || [];
  const existing = modifiers.find((modifier) => modifier.key === key);
  const nextModifiers = existing
    ? modifiers.map((modifier) => modifier.key === key ? { ...modifier, value: modifier.value + value } : modifier)
    : [...modifiers, { key, value }];
  return { ...relicItem, modifiers: nextModifiers };
}

function getRelicEffectSignature(relicItem: Relic) {
  return (relicItem.modifiers || [])
    .filter((modifier) => modifier.value !== 0)
    .map((modifier) => `${modifier.key}:${modifier.value}`)
    .sort()
    .join("|");
}
