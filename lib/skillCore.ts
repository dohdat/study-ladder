import type { ActiveWarriorSkillId, StudyState, WarriorSkillId } from "../types/study";

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

export type ActiveWarriorSkillDefinition = {
  cost: number;
  description: string;
  id: ActiveWarriorSkillId;
  name: string;
  requires: WarriorSkillId;
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
const AXE_MASTERY_DAMAGE = 3;
const AXE_MASTERY_CRIT = 1;
const SHIELD_MASTERY_REDUCTION = 1;
const QUICK_RECOVERY_LIFE = 2;
const ARCANE_FOCUS_MANA = 3;
const TREASURE_SENSE_MAGIC = 3;
const GOLD_MASTERY_GOLD = 4;
const IRON_SKIN_REDUCTION = 1;
const NATURAL_RESISTANCE = 3;
const SHOUT_REDUCTION = 1;
const BATTLE_CRY_REDUCTION = 1;
const BATTLE_ORDERS_LIFE = 4;
const BATTLE_ORDERS_MANA = 4;
const RALLYING_CRY_MANA = 2;
const BATTLE_COMMAND_XP = 3;
const FIND_ITEM_MAGIC = 5;
const FIND_POTION_LIFE = 1;
const WAR_CRY_REDUCTION = 1;
const DOUBLE_SWING_MANA = 1;
const GRIM_WARD_MAGIC = 4;
const TAUNT_GOLD = 3;
const HOWL_SYNERGY = 2;
const SHOUT_SYNERGY = 2;
const BASH_SYNERGY = 3;
const MASTERY_SYNERGY = 2;
const ORDERS_SYNERGY = 2;
const FIND_POTION_SYNERGY = 3;

export const ACTIVE_WARRIOR_SKILLS: ActiveWarriorSkillDefinition[] = [
  { cost: 5, description: "Queue a heavy blow: the next successful submit deals double damage.", id: "powerStrike", name: "Power Strike", requires: "bash" },
  { cost: 8, description: "Queue a combo: the next successful submit hits the monster 3 separate times.", id: "tripleStrike", name: "Triple Strike", requires: "doubleSwing" },
  { cost: 10, description: "Queue a focused finisher: the next successful submit is guaranteed to crit.", id: "sureCrit", name: "Sure Crit", requires: "concentrate" },
  { cost: 14, description: "Queue a storm attack: the next successful submit hits 5 times at reduced damage per hit.", id: "whirlwindAssault", name: "Whirlwind", requires: "whirlwind" }
];

export const WARRIOR_SKILLS: WarriorSkillDefinition[] = [
  { branch: "Warcries", description: "Scares loose treasure. Raises gold find per rank.", id: "howl", levelRequired: 1, maxRank: MAX_RANK, name: "Howl", row: 1 },
  { branch: "Warcries", description: "Weakens enemies through pressure. Improves War Cry mitigation.", id: "taunt", levelRequired: 6, maxRank: MAX_RANK, name: "Taunt", requires: ["howl"], row: 2 },
  { branch: "Warcries", description: "Hardens your stance. Reduces failed-submit damage.", id: "shout", levelRequired: 6, maxRank: MAX_RANK, name: "Shout", requires: ["howl"], row: 2, synergy: "Improves Concentrate defense and Battle Orders." },
  { branch: "Warcries", description: "Softens enemy pressure. Reduces failed-submit damage.", id: "battleCry", levelRequired: 12, maxRank: MAX_RANK, name: "Battle Cry", requires: ["taunt"], row: 3 },
  { branch: "Warcries", description: "Turns victories into better loot. Raises magic find.", id: "findItem", levelRequired: 12, maxRank: MAX_RANK, name: "Find Item", requires: ["findPotion"], row: 3, synergy: "Find Potion adds extra magic find." },
  { branch: "Warcries", description: "Marks defeated enemies. Raises magic find.", id: "grimWard", levelRequired: 18, maxRank: MAX_RANK, name: "Grim Ward", requires: ["battleCry"], row: 4 },
  { branch: "Warcries", description: "Short command chant. Raises max mana.", id: "rallyingCry", levelRequired: 18, maxRank: MAX_RANK, name: "Rallying Cry", requires: ["shout"], row: 4 },
  { branch: "Warcries", description: "Battle chant that grows max life and max mana.", id: "battleOrders", levelRequired: 24, maxRank: MAX_RANK, name: "Battle Orders", requires: ["shout"], row: 5, synergy: "Shout adds life and mana per rank." },
  { branch: "Warcries", description: "Veteran command that increases bonus XP.", id: "battleCommand", levelRequired: 30, maxRank: MAX_RANK, name: "Battle Command", requires: ["battleOrders"], row: 6, synergy: "Battle Orders adds more bonus XP." },
  { branch: "Warcries", description: "Punishing shout. Reduces incoming mistake damage.", id: "warCry", levelRequired: 30, maxRank: MAX_RANK, name: "War Cry", requires: ["battleOrders"], row: 6, synergy: "Howl and Taunt improve mitigation." },
  { branch: "Combat Masteries", description: "Weapon discipline. Adds damage and critical chance.", id: "swordMastery", levelRequired: 1, maxRank: MAX_RANK, name: "Sword Mastery", row: 1 },
  { branch: "Combat Masteries", description: "Heavy weapon training. Adds damage and critical chance.", id: "axeMastery", levelRequired: 1, maxRank: MAX_RANK, name: "Axe Mastery", row: 1 },
  { branch: "Combat Masteries", description: "Survival habit. Restores life on successful submissions.", id: "findPotion", levelRequired: 1, maxRank: MAX_RANK, name: "Find Potion", row: 1 },
  { branch: "Combat Masteries", description: "Guard discipline. Reduces failed-submit damage.", id: "shieldMastery", levelRequired: 6, maxRank: MAX_RANK, name: "Shield Mastery", row: 2 },
  { branch: "Combat Masteries", description: "Recover faster from mistakes. Raises max life.", id: "quickRecovery", levelRequired: 12, maxRank: MAX_RANK, name: "Quick Recovery", requires: ["shieldMastery"], row: 3 },
  { branch: "Combat Masteries", description: "Toughened armor. Reduces failed-submit damage.", id: "ironSkin", levelRequired: 18, maxRank: MAX_RANK, name: "Iron Skin", row: 4, synergy: "Shout adds extra defense." },
  { branch: "Combat Masteries", description: "Focuses resource flow. Raises max mana.", id: "arcaneFocus", levelRequired: 18, maxRank: MAX_RANK, name: "Arcane Focus", row: 4 },
  { branch: "Combat Masteries", description: "Notices better drops. Raises magic find.", id: "treasureSense", levelRequired: 24, maxRank: MAX_RANK, name: "Treasure Sense", requires: ["findPotion"], row: 5 },
  { branch: "Combat Masteries", description: "Squeezes more coins from rewards. Raises gold find.", id: "goldMastery", levelRequired: 24, maxRank: MAX_RANK, name: "Gold Mastery", requires: ["treasureSense"], row: 5 },
  { branch: "Combat Masteries", description: "Elemental discipline. Adds fire, cold, lightning, and poison resistance.", id: "naturalResistance", levelRequired: 30, maxRank: MAX_RANK, name: "Natural Resistance", requires: ["ironSkin"], row: 6 },
  { branch: "Combat Skills", description: "Foundation strike. Adds reliable damage every rank.", id: "bash", levelRequired: 1, maxRank: MAX_RANK, name: "Bash", row: 1, synergy: "Strengthens Concentrate and Frenzy." },
  { branch: "Combat Skills", description: "Active attack. Spend mana from the toolbar to double your next successful hit.", id: "powerStrike", levelRequired: 6, maxRank: MAX_RANK, name: "Power Strike", requires: ["bash"], row: 2 },
  { branch: "Combat Skills", description: "Rhythm training. Restores mana on successful submissions.", id: "doubleSwing", levelRequired: 6, maxRank: MAX_RANK, name: "Double Swing", requires: ["bash"], row: 2 },
  { branch: "Combat Skills", description: "Active combo. Spend mana from the toolbar to hit 3 times on your next successful submit.", id: "tripleStrike", levelRequired: 12, maxRank: MAX_RANK, name: "Triple Strike", requires: ["doubleSwing"], row: 3 },
  { branch: "Combat Skills", description: "Patient attack form. Adds damage and defensive scaling.", id: "concentrate", levelRequired: 18, maxRank: MAX_RANK, name: "Concentrate", requires: ["bash"], row: 4, synergy: "Bash and Shout improve it." },
  { branch: "Combat Skills", description: "Active finisher. Spend mana from the toolbar to guarantee a crit on your next successful submit.", id: "sureCrit", levelRequired: 18, maxRank: MAX_RANK, name: "Sure Crit", requires: ["concentrate"], row: 4 },
  { branch: "Combat Skills", description: "Momentum style. Adds damage and critical chance.", id: "frenzy", levelRequired: 24, maxRank: MAX_RANK, name: "Frenzy", requires: ["doubleSwing"], row: 5, synergy: "Bash and Sword Mastery improve it." },
  { branch: "Combat Skills", description: "Endgame sweep. Adds the strongest passive damage bonus.", id: "whirlwind", levelRequired: 30, maxRank: MAX_RANK, name: "Whirlwind", requires: ["concentrate"], row: 6, synergy: "Sword Mastery adds damage per rank." },
  { branch: "Combat Skills", description: "Active storm. Spend mana from the toolbar to hit 5 times at reduced damage.", id: "whirlwindAssault", levelRequired: 30, maxRank: MAX_RANK, name: "Whirlwind Assault", requires: ["whirlwind"], row: 6 }
];

export const DEFAULT_WARRIOR_SKILL_BONUSES: WarriorSkillBonuses = {
  bonusXpPercent: 0, coldResistPercent: 0, criticalChancePercent: 0, damageReduction: 0, enhancedDamagePercent: 0, fireResistPercent: 0, goldFindPercent: 0, lifeOnKill: 0, lightningResistPercent: 0, magicFindPercent: 0, manaOnKill: 0, maxLife: 0, maxMana: 0, poisonResistPercent: 0
};

export function getWarriorSkillBonuses(ranks: StudyState["profile"]["skillRanks"]) {
  const bonuses = { ...DEFAULT_WARRIOR_SKILL_BONUSES };
  const rank = (id: WarriorSkillId) => getWarriorSkillRank(ranks, id);
  bonuses.enhancedDamagePercent += rank("bash") * BASH_DAMAGE + rank("concentrate") * CONCENTRATE_DAMAGE + rank("frenzy") * FRENZY_DAMAGE + rank("whirlwind") * WHIRLWIND_DAMAGE + rank("swordMastery") * SWORD_MASTERY_DAMAGE + rank("axeMastery") * AXE_MASTERY_DAMAGE;
  bonuses.enhancedDamagePercent += rank("concentrate") * rank("bash") * BASH_SYNERGY + rank("frenzy") * rank("bash") * BASH_SYNERGY + rank("frenzy") * rank("swordMastery") * MASTERY_SYNERGY + rank("whirlwind") * rank("swordMastery") * MASTERY_SYNERGY;
  bonuses.criticalChancePercent += rank("swordMastery") * SWORD_MASTERY_CRIT + rank("axeMastery") * AXE_MASTERY_CRIT + rank("frenzy");
  bonuses.damageReduction += rank("ironSkin") * IRON_SKIN_REDUCTION + rank("shieldMastery") * SHIELD_MASTERY_REDUCTION + rank("shout") * SHOUT_REDUCTION + rank("battleCry") * BATTLE_CRY_REDUCTION + rank("warCry") * WAR_CRY_REDUCTION + rank("ironSkin") * rank("shout") * SHOUT_SYNERGY + rank("warCry") * (rank("howl") + rank("taunt")) * HOWL_SYNERGY;
  bonuses.maxLife += rank("quickRecovery") * QUICK_RECOVERY_LIFE + rank("battleOrders") * BATTLE_ORDERS_LIFE + rank("battleOrders") * rank("shout") * SHOUT_SYNERGY;
  bonuses.maxMana += rank("arcaneFocus") * ARCANE_FOCUS_MANA + rank("rallyingCry") * RALLYING_CRY_MANA + rank("battleOrders") * BATTLE_ORDERS_MANA + rank("battleOrders") * rank("shout") * SHOUT_SYNERGY;
  bonuses.bonusXpPercent += rank("battleCommand") * BATTLE_COMMAND_XP + rank("battleCommand") * rank("battleOrders") * ORDERS_SYNERGY;
  bonuses.magicFindPercent += rank("findItem") * FIND_ITEM_MAGIC + rank("grimWard") * GRIM_WARD_MAGIC + rank("treasureSense") * TREASURE_SENSE_MAGIC + rank("findItem") * rank("findPotion") * FIND_POTION_SYNERGY;
  bonuses.goldFindPercent += rank("howl") * TAUNT_GOLD + rank("goldMastery") * GOLD_MASTERY_GOLD;
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

export function getActiveWarriorSkill(skillId: ActiveWarriorSkillId | null | undefined) {
  return ACTIVE_WARRIOR_SKILLS.find((skill) => skill.id === skillId) || null;
}

export function getActiveWarriorSkillByTreeId(skillId: WarriorSkillId) {
  return ACTIVE_WARRIOR_SKILLS.find((skill) => skill.id === skillId) || null;
}

export function canUseActiveWarriorSkill(state: StudyState, skillId: ActiveWarriorSkillId) {
  const skill = getActiveWarriorSkill(skillId);
  return Boolean(skill && !state.profile.activeSkill && state.profile.mana >= skill.cost && getWarriorSkillRank(state.profile.skillRanks, skill.id) > NO_POINTS);
}

export function activateWarriorSkill(state: StudyState, skillId: ActiveWarriorSkillId): StudyState {
  if (!canUseActiveWarriorSkill(state, skillId)) {
    return state;
  }
  const skill = getActiveWarriorSkill(skillId);
  return {
    ...state,
    profile: {
      ...state.profile,
      activeSkill: skillId,
      mana: Math.max(NO_POINTS, state.profile.mana - (skill?.cost || NO_POINTS))
    }
  };
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
