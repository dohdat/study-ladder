import { ELEMENTAL_DAMAGE_TYPES } from "./resistanceCore";
import type { DamageType, ElementalDamageType, PlayerDebuffId, Question } from "../types/study";
import type { PlayerDebuffApplication } from "./playerDebuffCore";

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
const TELEPORTING_DAMAGE_REDUCTION = 0.25;
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
  "Arcane Shield",
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
  "Arcane Shield": "The monster starts with extra shield health, but it does not counter any damage type.",
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
  return getUniqueMonsterBonusesWithExtra(question, 0);
}

export function getUniqueMonsterBonusesWithExtra(question: Question, extraBonusCount = 0) {
  const seed = getMonsterSeed(question);
  const count = getUniqueMonsterBonusCount(question, extraBonusCount);
  const bonuses: string[] = [];
  for (let index = 0; index < count; index += 1) {
    bonuses.push(pickUniqueBonus(bonuses, `${seed}:bonus:${index}`));
  }
  return bonuses;
}

export function getUniqueMonsterBonusCount(question: Question, extraBonusCount = 0) {
  const bonusChance = getUniqueMonsterBonusChance(question);
  if (getSeededRoll(`${getMonsterSeed(question)}:bonus-chance`) >= bonusChance) {
    return Math.min(UNIQUE_MONSTER_BONUSES.length, Math.max(0, Math.floor(extraBonusCount || 0)));
  }
  const extraCount = Math.max(0, Math.floor(extraBonusCount || 0));
  if (question.difficulty >= HELL_DIFFICULTY_MIN || question.rating >= HELL_RATING_MIN) {
    return Math.min(UNIQUE_MONSTER_BONUSES.length, HELL_UNIQUE_BONUSES + extraCount);
  }
  if (question.difficulty >= NIGHTMARE_DIFFICULTY_MIN || question.rating >= NIGHTMARE_RATING_MIN) {
    return Math.min(UNIQUE_MONSTER_BONUSES.length, NIGHTMARE_UNIQUE_BONUSES + extraCount);
  }
  return Math.min(UNIQUE_MONSTER_BONUSES.length, NORMAL_UNIQUE_BONUSES + extraCount);
}

function getUniqueMonsterBonusChance(question: Question) {
  const ratingSteps = Math.max(0, Math.floor((question.rating - RATING_MIN) / RATING_CHANCE_DIVISOR));
  return Math.min(MAX_UNIQUE_BONUS_CHANCE, UNIQUE_BONUS_CHANCES[question.difficulty] + ratingSteps * RATING_CHANCE_STEP);
}

export function getUniqueMonsterBonusDescription(bonus: string) {
  return UNIQUE_MONSTER_BONUS_DESCRIPTIONS[bonus as (typeof UNIQUE_MONSTER_BONUSES)[number]] || "Unique monster trait.";
}

export function getMonsterMaxHealth(question: Question, extraBonusCount = 0) {
  const bonuses = getUniqueMonsterBonusesWithExtra(question, extraBonusCount);
  const bonusHealth = bonuses.includes("Stone Skin") || bonuses.includes("Arcane Shield") ? HEALTH_PER_DIFFICULTY : 0;
  return BASE_HEALTH + question.difficulty * HEALTH_PER_DIFFICULTY + Math.round((question.rating - RATING_MIN) / HEALTH_RATING_DIVISOR) + bonusHealth;
}

export function getMonsterAttackProfile(question: Question, baseDamage: number, now = Date.now(), extraBonusCount = 0) {
  const bonuses = getUniqueMonsterBonusesWithExtra(question, extraBonusCount);
  const element = getMonsterAttackType(question, bonuses);
  const hitCount = (bonuses.includes("Multi-Shot") ? MULTI_SHOT_HIT_COUNT : DEFAULT_HIT_COUNT) + (bonuses.includes("Extra Fast") ? EXTRA_FAST_HIT_COUNT_BONUS : 0);
  const perHitDamage = Math.max(DEFAULT_HIT_COUNT, baseDamage + getBonusDamage(bonuses, question, now));
  const damage = perHitDamage * hitCount;
  return {
    bonuses,
    damage,
    element,
    effects: [] as string[],
    hitCount,
    manaDamage: 0,
    perHitDamage
  };
}

export function getMonsterPlayerDamage(question: Question, damage: number, _damageType: DamageType = "physical", extraBonusCount = 0) {
  const bonuses = getUniqueMonsterBonusesWithExtra(question, extraBonusCount);
  const reduction = bonuses.reduce((total, bonus) => total + getDamageReduction(bonus), 0);
  if (damage <= 0) {
    return 0;
  }
  return Math.max(DEFAULT_HIT_COUNT, Math.round(damage * (1 - Math.min(reduction, TELEPORTING_DAMAGE_REDUCTION))));
}

export function getMonsterWrongSubmitDebuffs(question: Question, now = Date.now(), extraBonusCount = 0): PlayerDebuffApplication[] {
  const bonuses = getUniqueMonsterBonusesWithExtra(question, extraBonusCount);
  const debuff = bonuses.map(getDebuffForBonus).find(Boolean) || getFallbackWrongSubmitDebuff(question, now);
  if (!debuff) {
    return [];
  }
  if (debuff === "constricted") {
    return [{ id: debuff, remainingSubmits: 2, stacks: question.difficulty + 1 }];
  }
  if (debuff === "parasite") {
    return getSeededRoll(`${getMonsterSeed(question)}:${now}:parasite`) < 0.22 ? [{ id: debuff, permanent: true, stacks: 1 }] : [];
  }
  return [{ id: debuff, remainingSubmits: debuff === "slimed" ? 1 : 2, stacks: debuff === "vulnerable" || debuff === "weak" || debuff === "frail" ? 2 : 1 }];
}

function getBonusDamage(bonuses: string[], question: Question, now: number) {
  return bonuses.reduce((damage, bonus) => damage + getBonusDamageAmount(bonus, question, now), 0);
}

function getDebuffForBonus(bonus: string): PlayerDebuffId | null {
  if (bonus === "Aura Enchanted") {
    return "weak";
  }
  if (bonus === "Cold Enchanted") {
    return "frail";
  }
  if (bonus === "Cursed") {
    return "hex";
  }
  if (bonus === "Extra Fast" || bonus === "Multi-Shot") {
    return "constricted";
  }
  if (bonus === "Extra Strong" || bonus === "Fire Enchanted") {
    return "vulnerable";
  }
  if (bonus === "Lightning Enchanted" || bonus === "Spectral Hit") {
    return "confused";
  }
  if (bonus === "Arcane Shield" || bonus === "Stone Skin") {
    return "slimed";
  }
  if (bonus === "Teleporting") {
    return "hex";
  }
  return null;
}

function getFallbackWrongSubmitDebuff(question: Question, now: number): PlayerDebuffId | null {
  const chance = Math.min(0.75, 0.28 + question.difficulty * 0.08);
  if (getSeededRoll(`${getMonsterSeed(question)}:${now}:wrong-submit-debuff`) >= chance) {
    return null;
  }
  const pools: Record<Question["difficulty"], PlayerDebuffId[]> = {
    1: ["weak", "slimed"],
    2: ["weak", "vulnerable", "frail"],
    3: ["vulnerable", "frail", "hex", "constricted"],
    4: ["vulnerable", "frail", "hex", "constricted", "confused"],
    5: ["vulnerable", "frail", "hex", "constricted", "confused", "parasite"]
  };
  return pickSeeded(pools[question.difficulty], `${getMonsterSeed(question)}:${now}:wrong-submit-debuff-kind`);
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
