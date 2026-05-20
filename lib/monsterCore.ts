import { DAMAGE_TYPES, ELEMENTAL_DAMAGE_TYPES } from "./resistanceCore";
import type { DamageType, ElementalDamageType, Question } from "../types/study";

const HASH_OFFSET = 2166136261;
const HASH_PRIME = 16777619;
const HASH_RANGE = 4294967296;
const NIGHTMARE_RATING_MIN = 1800;
const HELL_RATING_MIN = 2600;
const NIGHTMARE_DIFFICULTY_MIN = 3;
const HELL_DIFFICULTY_MIN = 5;
const NORMAL_UNIQUE_BONUSES = 1;
const NIGHTMARE_UNIQUE_BONUSES = 2;
const HELL_UNIQUE_BONUSES = 3;
const RATING_MIN = 1000;
const MAX_UNIQUE_BONUS_CHANCE = 0.9;
const RATING_CHANCE_STEP = 0.04;
const RATING_CHANCE_DIVISOR = 400;
const BASE_HEALTH = 30;
const HEALTH_PER_DIFFICULTY = 18;
const HEALTH_RATING_DIVISOR = 25;
const EXTRA_STRONG_DAMAGE_BONUS = 4;
const FIRE_ENCHANTED_DAMAGE_BONUS = 3;
const LIGHTNING_ENCHANTED_DAMAGE_BONUS = 5;
const COLD_ENCHANTED_DAMAGE_BONUS = 2;
const CURSED_DAMAGE_BONUS = 2;
const AURA_ENCHANTED_DAMAGE_BONUS = 2;
const SPECTRAL_HIT_DAMAGE_SPREAD = 4;
const MULTI_SHOT_HIT_COUNT = 3;
const DEFAULT_HIT_COUNT = 1;
const EXTRA_FAST_HIT_COUNT_BONUS = 1;
const MANA_BURN_DAMAGE_RATIO = 0.5;
const TELEPORTING_DAMAGE_REDUCTION = 0.25;
const MONSTER_ENCHANTED_RESISTANCE = 35;
const MONSTER_MAGIC_RESISTANT_ELEMENTAL_RESISTANCE = 25;
const MONSTER_SPECTRAL_RESISTANCE = 15;
const MONSTER_STONE_SKIN_PHYSICAL_RESISTANCE = 25;
const PERCENT = 100;
const MAX_ELEMENTAL_ATTACK_CHANCE = 0.74;
const ELEMENTAL_RATING_CHANCE_STEP = 0.04;
const ELEMENTAL_RATING_CHANCE_DIVISOR = 400;
const UNIQUE_BONUS_CHANCES: Record<Question["difficulty"], number> = {
  1: 0.22,
  2: 0.32,
  3: 0.48,
  4: 0.64,
  5: 0.78
};
const ELEMENTAL_ATTACK_CHANCES: Record<Question["difficulty"], number> = {
  1: 0.1,
  2: 0.16,
  3: 0.25,
  4: 0.38,
  5: 0.52
};

export const UNIQUE_MONSTER_BONUSES = [
  "Aura Enchanted",
  "Cold Enchanted",
  "Cursed",
  "Extra Fast",
  "Extra Strong",
  "Fire Enchanted",
  "Lightning Enchanted",
  "Magic Resistant",
  "Multi-Shot",
  "Spectral Hit",
  "Stone Skin",
  "Teleporting"
] as const;

const UNIQUE_MONSTER_BONUS_DESCRIPTIONS: Record<(typeof UNIQUE_MONSTER_BONUSES)[number], string> = {
  "Aura Enchanted": "The monster radiates a passive aura that makes the fight more punishing.",
  "Cold Enchanted": "Cold attacks make failed submissions cost extra tempo.",
  "Cursed": "The monster weakens your defenses when you miss a solution.",
  "Extra Fast": "The monster is quicker, so mistakes are punished sooner.",
  "Extra Strong": "The monster hits harder when a submission fails.",
  "Fire Enchanted": "Fire attacks add burst damage on failed submissions.",
  "Lightning Enchanted": "Lightning attacks can spike damage on mistakes.",
  "Magic Resistant": "The monster resists easy progress and has sturdier health.",
  "Multi-Shot": "The monster can punish several weak attempts in one encounter.",
  "Spectral Hit": "The monster's hit carries mixed elemental power, making its damage less predictable.",
  "Stone Skin": "The monster has tougher defenses and is harder to bring down.",
  "Teleporting": "The monster is evasive and harder to pin down quickly."
};

const UNIQUE_NAME_PREFIXES = [
  "Ash",
  "Bane",
  "Black",
  "Blood",
  "Bone",
  "Chaos",
  "Cold",
  "Dire",
  "Doom",
  "Dread",
  "Flesh",
  "Gloom",
  "Grave",
  "Grim",
  "Moon",
  "Night",
  "Plague",
  "Rot",
  "Rust",
  "Shadow",
  "Soul",
  "Spine",
  "Storm",
  "Vile"
] as const;

const UNIQUE_NAME_SUFFIXES = [
  "Bite",
  "Brow",
  "Claw",
  "Crawler",
  "Drinker",
  "Eye",
  "Fang",
  "Grin",
  "Hack",
  "Heart",
  "Horn",
  "Maw",
  "Razor",
  "Rend",
  "Rip",
  "Shank",
  "Skull",
  "Spawn",
  "Thorn",
  "Touch",
  "Vex",
  "Web",
  "Wing",
  "Wound"
] as const;

const UNIQUE_NAME_APPELLATIONS = [
  "the Cold",
  "the Dark",
  "the Dead",
  "the Defiler",
  "the Destroyer",
  "the Flayer",
  "the Grim",
  "the Hungry",
  "the Hunter",
  "the Jagged",
  "the Mauler",
  "the Quick",
  "the Shade",
  "the Slasher",
  "the Tainted",
  "the Unclean",
  "the Unholy",
  "the Wraith"
] as const;

export function getUniqueMonsterName(question: Question) {
  const seed = getMonsterSeed(question);
  const prefix = pickSeeded(UNIQUE_NAME_PREFIXES, `${seed}:prefix`);
  const suffix = pickSeeded(UNIQUE_NAME_SUFFIXES, `${seed}:suffix`);
  const appellation = pickSeeded(UNIQUE_NAME_APPELLATIONS, `${seed}:appellation`);
  return `${prefix} ${suffix} ${appellation}`;
}

export function getUniqueMonsterBonuses(question: Question) {
  const seed = getMonsterSeed(question);
  const count = getUniqueMonsterBonusCount(question);
  const bonuses: string[] = [];
  for (let index = 0; index < count; index += 1) {
    bonuses.push(pickUniqueBonus(bonuses, `${seed}:bonus:${index}`));
  }
  return bonuses;
}

export function getUniqueMonsterBonusCount(question: Question) {
  const bonusChance = getUniqueMonsterBonusChance(question);
  if (getSeededRoll(`${getMonsterSeed(question)}:bonus-chance`) >= bonusChance) {
    return 0;
  }
  if (question.difficulty >= HELL_DIFFICULTY_MIN || question.rating >= HELL_RATING_MIN) {
    return HELL_UNIQUE_BONUSES;
  }
  if (question.difficulty >= NIGHTMARE_DIFFICULTY_MIN || question.rating >= NIGHTMARE_RATING_MIN) {
    return NIGHTMARE_UNIQUE_BONUSES;
  }
  return NORMAL_UNIQUE_BONUSES;
}

function getUniqueMonsterBonusChance(question: Question) {
  const ratingSteps = Math.max(0, Math.floor((question.rating - RATING_MIN) / RATING_CHANCE_DIVISOR));
  return Math.min(MAX_UNIQUE_BONUS_CHANCE, UNIQUE_BONUS_CHANCES[question.difficulty] + ratingSteps * RATING_CHANCE_STEP);
}

export function getUniqueMonsterBonusDescription(bonus: string) {
  return UNIQUE_MONSTER_BONUS_DESCRIPTIONS[bonus as (typeof UNIQUE_MONSTER_BONUSES)[number]] || "Unique monster trait.";
}

export function getMonsterMaxHealth(question: Question) {
  const bonuses = getUniqueMonsterBonuses(question);
  const bonusHealth = bonuses.includes("Stone Skin") || bonuses.includes("Magic Resistant") ? HEALTH_PER_DIFFICULTY : 0;
  return BASE_HEALTH + question.difficulty * HEALTH_PER_DIFFICULTY + Math.round((question.rating - RATING_MIN) / HEALTH_RATING_DIVISOR) + bonusHealth;
}

export function getMonsterAttackProfile(question: Question, baseDamage: number, now = Date.now()) {
  const bonuses = getUniqueMonsterBonuses(question);
  const element = getMonsterAttackType(question, bonuses);
  const hitCount = (bonuses.includes("Multi-Shot") ? MULTI_SHOT_HIT_COUNT : DEFAULT_HIT_COUNT) + (bonuses.includes("Extra Fast") ? EXTRA_FAST_HIT_COUNT_BONUS : 0);
  const perHitDamage = Math.max(DEFAULT_HIT_COUNT, baseDamage + getBonusDamage(bonuses, question, now));
  const damage = perHitDamage * hitCount;
  return {
    bonuses,
    damage,
    element,
    hitCount,
    manaDamage: 0,
    perHitDamage
  };
}

export function getMonsterPlayerDamage(question: Question, damage: number, damageType: DamageType = "physical", penetrationPercent = 0, resistanceBonusPercent = 0) {
  const bonuses = getUniqueMonsterBonuses(question);
  const reduction = bonuses.reduce((total, bonus) => total + getDamageReduction(bonus), 0);
  const reducedDamage = Math.round(damage * (1 - Math.min(reduction, TELEPORTING_DAMAGE_REDUCTION)));
  return applyMonsterResistance(reducedDamage, damageType, getMonsterResistances(question), penetrationPercent, resistanceBonusPercent);
}

export function getMonsterResistances(question: Question): Record<DamageType, number> {
  const bonuses = getUniqueMonsterBonuses(question);
  const resistances: Record<DamageType, number> = {
    cold: 0,
    fire: 0,
    lightning: 0,
    physical: 0,
    poison: 0
  };
  if (bonuses.includes("Stone Skin")) {
    resistances.physical = MONSTER_STONE_SKIN_PHYSICAL_RESISTANCE;
  }
  if (bonuses.includes("Magic Resistant")) {
    for (const element of ELEMENTAL_DAMAGE_TYPES) {
      resistances[element] = Math.max(resistances[element], MONSTER_MAGIC_RESISTANT_ELEMENTAL_RESISTANCE);
    }
  }
  if (bonuses.includes("Fire Enchanted")) {
    resistances.fire = Math.max(resistances.fire, MONSTER_ENCHANTED_RESISTANCE);
  }
  if (bonuses.includes("Cold Enchanted")) {
    resistances.cold = Math.max(resistances.cold, MONSTER_ENCHANTED_RESISTANCE);
  }
  if (bonuses.includes("Lightning Enchanted")) {
    resistances.lightning = Math.max(resistances.lightning, MONSTER_ENCHANTED_RESISTANCE);
  }
  if (bonuses.includes("Spectral Hit")) {
    for (const element of ELEMENTAL_DAMAGE_TYPES) {
      resistances[element] = Math.max(resistances[element], MONSTER_SPECTRAL_RESISTANCE);
    }
  }
  return resistances;
}

function getBonusDamage(bonuses: string[], question: Question, now: number) {
  return bonuses.reduce((damage, bonus) => damage + getBonusDamageAmount(bonus, question, now), 0);
}

function getBonusDamageAmount(bonus: string, question: Question, now: number) {
  if (bonus === "Extra Strong") {
    return EXTRA_STRONG_DAMAGE_BONUS;
  }
  if (bonus === "Fire Enchanted") {
    return FIRE_ENCHANTED_DAMAGE_BONUS;
  }
  if (bonus === "Lightning Enchanted") {
    return LIGHTNING_ENCHANTED_DAMAGE_BONUS;
  }
  if (bonus === "Cold Enchanted") {
    return COLD_ENCHANTED_DAMAGE_BONUS;
  }
  if (bonus === "Cursed") {
    return CURSED_DAMAGE_BONUS;
  }
  if (bonus === "Aura Enchanted") {
    return AURA_ENCHANTED_DAMAGE_BONUS;
  }
  if (bonus === "Spectral Hit") {
    return Math.floor(getSeededRoll(`${getMonsterSeed(question)}:${now}:spectral`) * SPECTRAL_HIT_DAMAGE_SPREAD);
  }
  return 0;
}

export function getMonsterAttackType(question: Question, bonuses = getUniqueMonsterBonuses(question)): DamageType {
  const forced = getForcedElement(bonuses, question);
  if (forced) {
    return forced;
  }
  const ratingSteps = Math.max(0, Math.floor((question.rating - RATING_MIN) / ELEMENTAL_RATING_CHANCE_DIVISOR));
  const chance = Math.min(MAX_ELEMENTAL_ATTACK_CHANCE, ELEMENTAL_ATTACK_CHANCES[question.difficulty] + ratingSteps * ELEMENTAL_RATING_CHANCE_STEP);
  if (getSeededRoll(`${getMonsterSeed(question)}:elemental-chance`) >= chance) {
    return "physical";
  }
  return pickSeeded(ELEMENTAL_DAMAGE_TYPES, `${getMonsterSeed(question)}:elemental-type`);
}

function getForcedElement(bonuses: string[], question: Question): ElementalDamageType | null {
  if (bonuses.includes("Fire Enchanted")) {
    return "fire";
  }
  if (bonuses.includes("Cold Enchanted")) {
    return "cold";
  }
  if (bonuses.includes("Lightning Enchanted")) {
    return "lightning";
  }
  if (bonuses.includes("Spectral Hit")) {
    return pickSeeded(ELEMENTAL_DAMAGE_TYPES, `${getMonsterSeed(question)}:spectral-element`);
  }
  return null;
}

function applyMonsterResistance(amount: number, type: DamageType, resistances: Record<DamageType, number>, penetrationPercent = 0, resistanceBonusPercent = 0) {
  if (amount <= 0) {
    return 0;
  }
  const effectiveResistance = Math.max(0, resistances[type] + Math.max(0, resistanceBonusPercent || 0) - Math.max(0, penetrationPercent || 0));
  return Math.max(DEFAULT_HIT_COUNT, Math.round(amount * (1 - effectiveResistance / PERCENT)));
}

function getDamageReduction(bonus: string) {
  if (bonus === "Teleporting") {
    return TELEPORTING_DAMAGE_REDUCTION;
  }
  return 0;
}

function pickUniqueBonus(existing: string[], seed: string) {
  const available = UNIQUE_MONSTER_BONUSES.filter((bonus) => !existing.includes(bonus));
  return pickSeeded(available, seed);
}

function pickSeeded<T>(values: readonly T[], seed: string) {
  return values[getSeededIndex(seed, values.length)];
}

function getSeededIndex(seed: string, length: number) {
  return Math.floor(getSeededRoll(seed) * length);
}

function getSeededRoll(seed: string) {
  let hash = HASH_OFFSET;
  for (const character of seed) {
    hash = Math.imul(hash ^ character.charCodeAt(0), HASH_PRIME) >>> 0;
  }
  return hash / HASH_RANGE;
}

function getMonsterSeed(question: Question) {
  return `${question.id}:${question.rating}:${question.difficulty}`;
}
