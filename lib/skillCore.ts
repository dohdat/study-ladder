import type { StudyState, WarriorSkillId } from "../types/study";

export type WarriorSkillBranch = "Warcries" | "Combat Masteries" | "Combat Skills";
export type WarriorSkillDefinition = {
  branch: WarriorSkillBranch;
  description: string;
  id: WarriorSkillId;
  levelRequired: number;
  maxRank: number;
  name: string;
  requires?: WarriorSkillId[];
  row: number;
  synergy?: string;
};

export type WarriorSkillBonuses = {
  bonusXpPercent: number;
  coldResistPercent: number;
  criticalChancePercent: number;
  damageReduction: number;
  enhancedDamagePercent: number;
  fireResistPercent: number;
  goldFindPercent: number;
  lifeOnKill: number;
  lightningResistPercent: number;
  magicFindPercent: number;
  manaOnKill: number;
  maxLife: number;
  maxMana: number;
  poisonResistPercent: number;
};

const FIRST_LEVEL = 1;
const NO_POINTS = 0;
const MAX_RANK = 20;
const REQUIRED_RANK = 1;
const BASH_DAMAGE = 5;
const CONCENTRATE_DAMAGE = 6;
const FRENZY_DAMAGE = 7;
const WHIRLWIND_DAMAGE = 10;
const SWORD_MASTERY_DAMAGE = 4;
const SWORD_MASTERY_CRIT = 1;
const IRON_SKIN_REDUCTION = 1;
const NATURAL_RESISTANCE = 3;
const SHOUT_REDUCTION = 1;
const BATTLE_ORDERS_LIFE = 4;
const BATTLE_ORDERS_MANA = 4;
const BATTLE_COMMAND_XP = 3;
const FIND_ITEM_MAGIC = 5;
const FIND_POTION_LIFE = 1;
const WAR_CRY_REDUCTION = 1;
const DOUBLE_SWING_MANA = 1;
const TAUNT_GOLD = 3;
const HOWL_SYNERGY = 2;
const SHOUT_SYNERGY = 2;
const BASH_SYNERGY = 3;
const MASTERY_SYNERGY = 2;
const ORDERS_SYNERGY = 2;
const FIND_POTION_SYNERGY = 3;

export const WARRIOR_SKILLS: WarriorSkillDefinition[] = [
  { branch: "Warcries", description: "Unlocks shouts. +3% gold find per rank.", id: "howl", levelRequired: 1, maxRank: MAX_RANK, name: "Howl", row: 1 },
  { branch: "Warcries", description: "Prereq shout. Synergizes Battle Cry effects.", id: "taunt", levelRequired: 6, maxRank: MAX_RANK, name: "Taunt", requires: ["howl"], row: 2 },
  { branch: "Warcries", description: "Hardens armor. +1 defense per rank.", id: "shout", levelRequired: 6, maxRank: MAX_RANK, name: "Shout", requires: ["howl"], row: 2, synergy: "Improves Concentrate defense." },
  { branch: "Warcries", description: "Loot cry. +5% magic find per rank.", id: "findItem", levelRequired: 12, maxRank: MAX_RANK, name: "Find Item", requires: ["findPotion"], row: 3, synergy: "Find Potion adds +3% magic find per rank." },
  { branch: "Warcries", description: "Raises life and mana.", id: "battleOrders", levelRequired: 24, maxRank: MAX_RANK, name: "Battle Orders", requires: ["shout"], row: 5, synergy: "Shout adds +2 life and mana per rank." },
  { branch: "Warcries", description: "Command shout. +3% bonus XP per rank.", id: "battleCommand", levelRequired: 30, maxRank: MAX_RANK, name: "Battle Command", requires: ["battleOrders"], row: 6, synergy: "Battle Orders adds +2% bonus XP per rank." },
  { branch: "Combat Masteries", description: "Weapon training. +damage and crit.", id: "swordMastery", levelRequired: 1, maxRank: MAX_RANK, name: "Sword Mastery", row: 1 },
  { branch: "Combat Masteries", description: "Potion discipline. +life on successful submit.", id: "findPotion", levelRequired: 1, maxRank: MAX_RANK, name: "Find Potion", row: 1 },
  { branch: "Combat Masteries", description: "Toughened hide. Reduces failed-submit damage.", id: "ironSkin", levelRequired: 18, maxRank: MAX_RANK, name: "Iron Skin", row: 4, synergy: "Shout adds extra defense." },
  { branch: "Combat Masteries", description: "Elemental hardening. Adds all resistances.", id: "naturalResistance", levelRequired: 30, maxRank: MAX_RANK, name: "Natural Resistance", requires: ["ironSkin"], row: 6 },
  { branch: "Combat Skills", description: "Opening strike. +5% damage per rank.", id: "bash", levelRequired: 1, maxRank: MAX_RANK, name: "Bash", row: 1, synergy: "Strengthens Concentrate and Frenzy." },
  { branch: "Combat Skills", description: "Fast rhythm. +mana on successful submit.", id: "doubleSwing", levelRequired: 6, maxRank: MAX_RANK, name: "Double Swing", requires: ["bash"], row: 2 },
  { branch: "Combat Skills", description: "Focused attack. +damage and defense.", id: "concentrate", levelRequired: 18, maxRank: MAX_RANK, name: "Concentrate", requires: ["bash"], row: 4, synergy: "Bash and Shout improve it." },
  { branch: "Combat Skills", description: "Momentum attack. +damage and crit.", id: "frenzy", levelRequired: 24, maxRank: MAX_RANK, name: "Frenzy", requires: ["doubleSwing"], row: 5, synergy: "Bash and Sword Mastery improve it." },
  { branch: "Combat Skills", description: "Top-tier sweep. Heavy damage bonus.", id: "whirlwind", levelRequired: 30, maxRank: MAX_RANK, name: "Whirlwind", requires: ["concentrate"], row: 6, synergy: "Sword Mastery adds +2% damage per rank." },
  { branch: "Warcries", description: "Damaging shout. Reduces incoming mistake damage.", id: "warCry", levelRequired: 30, maxRank: MAX_RANK, name: "War Cry", requires: ["battleOrders"], row: 6, synergy: "Howl and Taunt improve mitigation." }
];

export const DEFAULT_WARRIOR_SKILL_BONUSES: WarriorSkillBonuses = {
  bonusXpPercent: 0, coldResistPercent: 0, criticalChancePercent: 0, damageReduction: 0, enhancedDamagePercent: 0, fireResistPercent: 0, goldFindPercent: 0, lifeOnKill: 0, lightningResistPercent: 0, magicFindPercent: 0, manaOnKill: 0, maxLife: 0, maxMana: 0, poisonResistPercent: 0
};

export function getWarriorSkillBonuses(ranks: StudyState["profile"]["skillRanks"]) {
  const bonuses = { ...DEFAULT_WARRIOR_SKILL_BONUSES };
  const rank = (id: WarriorSkillId) => getWarriorSkillRank(ranks, id);
  bonuses.enhancedDamagePercent += rank("bash") * BASH_DAMAGE + rank("concentrate") * CONCENTRATE_DAMAGE + rank("frenzy") * FRENZY_DAMAGE + rank("whirlwind") * WHIRLWIND_DAMAGE + rank("swordMastery") * SWORD_MASTERY_DAMAGE;
  bonuses.enhancedDamagePercent += rank("concentrate") * rank("bash") * BASH_SYNERGY + rank("frenzy") * rank("bash") * BASH_SYNERGY + rank("frenzy") * rank("swordMastery") * MASTERY_SYNERGY + rank("whirlwind") * rank("swordMastery") * MASTERY_SYNERGY;
  bonuses.criticalChancePercent += rank("swordMastery") * SWORD_MASTERY_CRIT + rank("frenzy");
  bonuses.damageReduction += rank("ironSkin") * IRON_SKIN_REDUCTION + rank("shout") * SHOUT_REDUCTION + rank("warCry") * WAR_CRY_REDUCTION + rank("ironSkin") * rank("shout") * SHOUT_SYNERGY + rank("warCry") * (rank("howl") + rank("taunt")) * HOWL_SYNERGY;
  bonuses.maxLife += rank("battleOrders") * BATTLE_ORDERS_LIFE + rank("battleOrders") * rank("shout") * SHOUT_SYNERGY;
  bonuses.maxMana += rank("battleOrders") * BATTLE_ORDERS_MANA + rank("battleOrders") * rank("shout") * SHOUT_SYNERGY;
  bonuses.bonusXpPercent += rank("battleCommand") * BATTLE_COMMAND_XP + rank("battleCommand") * rank("battleOrders") * ORDERS_SYNERGY;
  bonuses.magicFindPercent += rank("findItem") * FIND_ITEM_MAGIC + rank("findItem") * rank("findPotion") * FIND_POTION_SYNERGY;
  bonuses.goldFindPercent += rank("howl") * TAUNT_GOLD;
  bonuses.lifeOnKill += rank("findPotion") * FIND_POTION_LIFE;
  bonuses.manaOnKill += rank("doubleSwing") * DOUBLE_SWING_MANA;
  addAllResistances(bonuses, rank("naturalResistance") * NATURAL_RESISTANCE);
  return bonuses;
}

export function getWarriorSkillRank(ranks: StudyState["profile"]["skillRanks"], skillId: WarriorSkillId) {
  return Math.max(NO_POINTS, Math.floor(ranks[skillId] || NO_POINTS));
}

export function normalizeWarriorSkillRanks(ranks: StudyState["profile"]["skillRanks"] | undefined) {
  return Object.fromEntries(WARRIOR_SKILLS.map((skill) => [skill.id, Math.min(skill.maxRank, getWarriorSkillRank(ranks || {}, skill.id))])) as StudyState["profile"]["skillRanks"];
}

export function getAvailableWarriorSkillPoints(state: StudyState, level: number) {
  return Math.max(NO_POINTS, level - FIRST_LEVEL - getSpentWarriorSkillPoints(state.profile.skillRanks));
}

export function canSpendWarriorSkillPoint(state: StudyState, skillId: WarriorSkillId, level: number) {
  const skill = WARRIOR_SKILLS.find((row) => row.id === skillId);
  return Boolean(skill && level >= skill.levelRequired && getAvailableWarriorSkillPoints(state, level) > NO_POINTS && getWarriorSkillRank(state.profile.skillRanks, skillId) < skill.maxRank && hasRequirements(state, skill));
}

export function spendWarriorSkillPoint(state: StudyState, skillId: WarriorSkillId, level: number): StudyState {
  if (!canSpendWarriorSkillPoint(state, skillId, level)) {
    return state;
  }
  return { ...state, profile: { ...state.profile, skillRanks: { ...state.profile.skillRanks, [skillId]: getWarriorSkillRank(state.profile.skillRanks, skillId) + 1 } } };
}

function addAllResistances(bonuses: WarriorSkillBonuses, value: number) {
  bonuses.fireResistPercent += value;
  bonuses.coldResistPercent += value;
  bonuses.lightningResistPercent += value;
  bonuses.poisonResistPercent += value;
}

function getSpentWarriorSkillPoints(ranks: StudyState["profile"]["skillRanks"]) {
  return WARRIOR_SKILLS.reduce((total, skill) => total + getWarriorSkillRank(ranks, skill.id), NO_POINTS);
}

function hasRequirements(state: StudyState, skill: WarriorSkillDefinition | undefined) {
  return !skill?.requires?.some((requirement) => getWarriorSkillRank(state.profile.skillRanks, requirement) < REQUIRED_RANK);
}
