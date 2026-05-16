import type { Question } from "../types/study";

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
const BASE_HEALTH = 30;
const HEALTH_PER_DIFFICULTY = 18;
const HEALTH_RATING_DIVISOR = 25;

export const UNIQUE_MONSTER_BONUSES = [
  "Aura Enchanted",
  "Cold Enchanted",
  "Cursed",
  "Extra Fast",
  "Extra Strong",
  "Fire Enchanted",
  "Lightning Enchanted",
  "Magic Resistant",
  "Mana Burn",
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
  "Mana Burn": "Failed attempts drain mana pressure from your character.",
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
  if (question.difficulty >= HELL_DIFFICULTY_MIN || question.rating >= HELL_RATING_MIN) {
    return HELL_UNIQUE_BONUSES;
  }
  if (question.difficulty >= NIGHTMARE_DIFFICULTY_MIN || question.rating >= NIGHTMARE_RATING_MIN) {
    return NIGHTMARE_UNIQUE_BONUSES;
  }
  return NORMAL_UNIQUE_BONUSES;
}

export function getUniqueMonsterBonusDescription(bonus: string) {
  return UNIQUE_MONSTER_BONUS_DESCRIPTIONS[bonus as (typeof UNIQUE_MONSTER_BONUSES)[number]] || "Unique monster trait.";
}

export function getMonsterMaxHealth(question: Question) {
  return BASE_HEALTH + question.difficulty * HEALTH_PER_DIFFICULTY + Math.round((question.rating - RATING_MIN) / HEALTH_RATING_DIVISOR);
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
