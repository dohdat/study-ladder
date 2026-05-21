import { questions } from "../data/questions";
import { getSpireDifficultyModifiers } from "./campaignCore";
import { getMonsterAttackProfile, getMonsterMaxHealth, getMonsterPlayerDamage } from "./monsterCore";
import { getActiveWarriorSkill, getWarriorSkillRank } from "./skillCore";
import {
  applyHealingReceived, applyScheduleResult, cloneState, getAttackDamage, getCard, getCoinReward, getCriticalChance, getCriticalDamageMultiplier,
  getMaxHealth, getMonsterDamageRoll, getQuestionDrop, getQuestionTimeLimitMs, getRunModifierTotals, getWarriorSkillBonusTotals,
  setCard
} from "./studyCore";
import type { DamageType, Question, StudyState } from "../types/study";

const POWER_STRIKE_MULTIPLIER = 2;
const CLEAVE_HIT_COUNT = 2;
const CLEAVE_DAMAGE_RATIO = 0.9;
const TRIPLE_STRIKE_HIT_COUNT = 3;
const TRIPLE_STRIKE_DAMAGE_RATIO = 0.8;
const EXECUTE_WOUNDED_THRESHOLD = 0.35;
const EXECUTE_MULTIPLIER = 1.4;
const EXECUTE_WOUNDED_MULTIPLIER = 3;
const BLOOD_FOR_BLOOD_MIN_MULTIPLIER = 1.25;
const WHIRLWIND_HIT_COUNT = 5;
const WHIRLWIND_DAMAGE_RATIO = 0.65;
const LOW_HEALTH_RATIO_DIVISOR = 100;
const BLOOD_FOR_BLOOD_LIFE_STEAL_RATIO = 0.25;
const FRENZY_EXTRA_RATIO_PER_RANK = 0.01;
const DOUBLE_SWING_EXTRA_RATIO_PER_RANK = 0.015;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const MAX_TIME_MONSTER_DEFENSE_PERCENT = 20;
const MAX_TIME_MONSTER_DAMAGE_BONUS_PERCENT = 75;
const ENRAGE_HEALTH_RATIO = 0.5;
const ENRAGE_DAMAGE_BONUS_PERCENT = 35;
const PERCENT = 100;
const TIME_DAMAGE_FREE_RATIO = 0.18;
const TIME_DAMAGE_MIN_RATIO = 0.18;
const TIME_DAMAGE_RATIO_RANGE = 0.82;
const MAX_CORRECT_HITS_BY_DIFFICULTY: Record<Question["difficulty"], number> = { 1: 3, 2: 3, 3: 4, 4: 5, 5: 6 };
const MIN_REGULAR_HITS_BY_DIFFICULTY: Record<Question["difficulty"], number> = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3 };

export type MonsterHitOptions = {
  timePressureRatio?: number;
  timeRemainingRatio?: number;
  usedRunCode?: boolean;
};

export type MonsterHitResult = {
  activeSkillName?: string;
  critical: boolean;
  damage: number;
  damageTypes: DamageType[];
  defeated: boolean;
  effects: string[];
  hitCount: number;
  lifeRestored: number;
  maxHealth: number;
  perHitDamage: number;
  remainingHealth: number;
};

export type TimedMonsterAttackMode = "elapsed" | "retaliation";
export type TimedMonsterAttackOptions = {
  enraged?: boolean;
};

export const getMonsterCurrentHealth = (state: StudyState, question: Question) => {
  const storedHealth = getCard(state, question.id).monsterHealth;
  const maxHealth = getCampaignMonsterMaxHealth(state, question);
  if (!Number.isFinite(storedHealth)) {
    return maxHealth;
  }
  return Math.min(maxHealth, Math.max(0, storedHealth || 0));
};

export const isMonsterEnraged = (state: StudyState, question: Question) => {
  const maxHealth = getCampaignMonsterMaxHealth(state, question);
  return maxHealth > 0 && getMonsterCurrentHealth(state, question) / maxHealth <= ENRAGE_HEALTH_RATIO;
};

export const getMonsterHit = (state: StudyState, question: Question, now = Date.now(), options: MonsterHitOptions = {}) => {
  const activeSkill = getActiveWarriorSkill(state.profile.activeSkill);
  const guaranteedCritical = activeSkill?.id === "sureCrit";
  const critical = guaranteedCritical || getSeededRoll(`${question.id}:${now}:critical`) <= getCriticalChance(state);
  const baseDamage = getAttackDamage(question, state);
  const criticalDamage = critical ? baseDamage * getCriticalDamageMultiplier(state) : baseDamage;
  const activeHit = getActiveSkillHit(state, question, activeSkill?.id ?? null, criticalDamage);
  const modifiers = getRunModifierTotals(state);
  const currentHealth = getMonsterCurrentHealth(state, question);
  const maxHealth = getCampaignMonsterMaxHealth(state, question);
  const executeProc = currentHealth / maxHealth <= EXECUTE_WOUNDED_THRESHOLD && getSeededRoll(`${question.id}:${now}:execute-proc`) <= (modifiers.executeChancePercent || 0) / 100;
  const extraAttack = getSeededRoll(`${question.id}:${now}:extra-attack`) <= (modifiers.extraAttackChancePercent || 0) / 100 ? 1 : 0;
  const timeHardening = getTimeHardening(options.timePressureRatio);
  const guardPenetration = Math.max(0, (modifiers.armorPenetrationPercent || 0) + (modifiers.reducedEnemyArmorPercent || 0) + (modifiers.resistancePenetrationPercent || 0));
  const timeDefensePercent = Math.max(0, timeHardening.defensePercent - guardPenetration);
  const physicalDamage = executeProc ? Math.max(activeHit.perHitDamage, currentHealth) : activeHit.perHitDamage;
  const damageTypes = getPlayerHitDamageTypes(physicalDamage, modifiers);
  const rawPerHitDamage = getMonsterPlayerDamage(question, physicalDamage, "physical")
    + getElementalDamage(question, modifiers);
  const perHitDamage = applyTimeDefense(rawPerHitDamage, timeDefensePercent);
  const hitCount = activeHit.hitCount + extraAttack;
  const relicDamage = getRelicDamageBonus(state, modifiers, options);
  const totalDamage = applyRelicDamageBonus(applyCombatPacing(perHitDamage * hitCount, currentHealth, maxHealth, question.difficulty, Boolean(activeSkill || executeProc)), relicDamage.bonusPercent);
  const lifeSteal = Math.floor(totalDamage * (modifiers.lifeStealPercent || 0) / 100);
  return {
    activeSkillName: activeSkill?.name,
    critical,
    damage: totalDamage,
    damageTypes,
    effects: [...activeHit.effects, ...(timeDefensePercent ? ["Guarded"] : []), ...(executeProc ? ["Execute proc"] : []), ...(extraAttack ? ["Extra attack"] : []), ...relicDamage.effects],
    hitCount,
    lifeRestored: applyHealingReceived(state, activeHit.lifeRestored + lifeSteal),
    perHitDamage
  };
};

function getRelicDamageBonus(state: StudyState, modifiers: ReturnType<typeof getRunModifierTotals>, options: MonsterHitOptions) {
  const noRunBonus = options.usedRunCode === false ? Math.max(0, modifiers.noRunDamagePercent || 0) : 0;
  const timerBonus = Math.round(Math.max(0, Math.min(1, options.timeRemainingRatio || 0)) * Math.max(0, modifiers.timerDamagePercent || 0));
  const failStackBonus = Math.max(0, state.profile.spireRun.failDamageStacks || 0) * Math.max(0, modifiers.submitFailDamageStackPercent || 0);
  return {
    bonusPercent: noRunBonus + timerBonus + failStackBonus,
    effects: [
      ...(noRunBonus ? ["No-run bonus"] : []),
      ...(timerBonus ? ["Timer damage"] : []),
      ...(failStackBonus ? [`Failure stacks x${state.profile.spireRun.failDamageStacks}`] : [])
    ]
  };
}

function applyRelicDamageBonus(damage: number, bonusPercent: number) {
  if (bonusPercent <= 0) {
    return damage;
  }
  return Math.max(1, Math.round(damage * (1 + bonusPercent / PERCENT)));
}

function applyCombatPacing(damage: number, currentHealth: number, maxHealth: number, difficulty: Question["difficulty"], isBurstHit: boolean) {
  if (damage <= 0 || maxHealth <= 0) {
    return damage;
  }
  const minimumProgressDamage = Math.max(1, Math.ceil(maxHealth / MAX_CORRECT_HITS_BY_DIFFICULTY[difficulty]));
  const floorDamage = Math.max(damage, minimumProgressDamage);
  if (isBurstHit) {
    return floorDamage;
  }
  const regularHitCap = Math.ceil(maxHealth / MIN_REGULAR_HITS_BY_DIFFICULTY[difficulty]);
  return currentHealth > regularHitCap ? Math.min(floorDamage, regularHitCap) : floorDamage;
}

function getTimeHardening(timePressureRatio = 0) {
  const pressure = Math.min(1, Math.max(0, timePressureRatio || 0));
  return {
    defensePercent: Math.round(pressure * MAX_TIME_MONSTER_DEFENSE_PERCENT)
  };
}

export function getTimedMonsterAttack(question: Question, timeRemainingMs: number, now = Date.now(), mode: TimedMonsterAttackMode = "elapsed", options: TimedMonsterAttackOptions = {}) {
  const pressureRatio = getElapsedPressureRatio(question, timeRemainingMs);
  const damageMultiplier = (mode === "retaliation" ? 1 : pressureRatio) * (1 + pressureRatio * MAX_TIME_MONSTER_DAMAGE_BONUS_PERCENT / PERCENT);
  const baseAttack = getMonsterAttackProfile(question, getMonsterDamageRoll(question, now), now);
  const phasedAttack = options.enraged ? addMonsterAttackEffect(scaleMonsterAttack(baseAttack, 1 + ENRAGE_DAMAGE_BONUS_PERCENT / PERCENT), "Enraged") : baseAttack;
  return scaleMonsterAttack(phasedAttack, damageMultiplier);
}

export function getElapsedPressureRatio(question: Question, timeRemainingMs: number) {
  const timeLimitMs = getQuestionTimeLimitMs(question);
  const elapsedRatio = timeLimitMs > 0 ? Math.min(1, Math.max(0, (timeLimitMs - timeRemainingMs) / timeLimitMs)) : 0;
  return getElapsedDamageRatio(elapsedRatio);
}

function getElapsedDamageRatio(elapsedRatio: number) {
  if (elapsedRatio <= TIME_DAMAGE_FREE_RATIO) {
    return 0;
  }
  const pressureRatio = (elapsedRatio - TIME_DAMAGE_FREE_RATIO) / (1 - TIME_DAMAGE_FREE_RATIO);
  return Math.min(1, TIME_DAMAGE_MIN_RATIO + pressureRatio * TIME_DAMAGE_RATIO_RANGE);
}

function scaleMonsterAttack(attack: ReturnType<typeof getMonsterAttackProfile>, damageMultiplier: number) {
  if (damageMultiplier <= 0) {
    return { ...attack, damage: 0, manaDamage: 0, perHitDamage: 0 };
  }
  const perHitDamage = Math.max(1, Math.round(attack.perHitDamage * damageMultiplier));
  const damage = perHitDamage * attack.hitCount;
  return {
    ...attack,
    damage,
    manaDamage: attack.manaDamage > 0 ? Math.max(1, Math.round(attack.manaDamage * damageMultiplier)) : 0,
    perHitDamage
  };
}

function addMonsterAttackEffect(attack: ReturnType<typeof getMonsterAttackProfile>, effect: string) {
  return { ...attack, effects: [...(attack.effects || []), effect] };
}

function applyTimeDefense(damage: number, defensePercent: number) {
  if (damage <= 0 || defensePercent <= 0) {
    return damage;
  }
  return Math.max(1, Math.round(damage * (1 - Math.min(MAX_TIME_MONSTER_DEFENSE_PERCENT, defensePercent) / PERCENT)));
}

function getPlayerHitDamageTypes(physicalDamage: number, modifiers: ReturnType<typeof getRunModifierTotals>): DamageType[] {
  const damageTypes: DamageType[] = physicalDamage > 0 ? ["physical"] : [];
  if ((modifiers.fireDamage || 0) > 0) {
    damageTypes.push("fire");
  }
  if ((modifiers.coldDamage || 0) > 0) {
    damageTypes.push("cold");
  }
  if ((modifiers.lightningDamage || 0) > 0) {
    damageTypes.push("lightning");
  }
  if ((modifiers.poisonDamage || 0) > 0) {
    damageTypes.push("poison");
  }
  return damageTypes.length ? damageTypes : ["physical"];
}

function getElementalDamage(question: Question, modifiers: ReturnType<typeof getRunModifierTotals>) {
  return getMonsterPlayerDamage(question, modifiers.fireDamage || 0, "fire")
    + getMonsterPlayerDamage(question, modifiers.coldDamage || 0, "cold")
    + getMonsterPlayerDamage(question, modifiers.lightningDamage || 0, "lightning")
    + getMonsterPlayerDamage(question, modifiers.poisonDamage || 0, "poison");
}

export const applyPassedCombatResult = (state: StudyState, questionId: string, draft: string, now = Date.now(), options: MonsterHitOptions = {}) => {
  const question = questions.find((row) => row.id === questionId);
  if (!question) {
    return { hit: null, state };
  }
  const currentHealth = getMonsterCurrentHealth(state, question);
  const hit = getMonsterHit(state, question, now, options);
  const remainingHealth = Math.max(0, currentHealth - hit.damage);
  const defeated = remainingHealth <= 0;
  if (defeated) {
    const next = applyScheduleResult(state, questionId, true, draft, now);
    next.profile.activeSkill = null;
    next.profile.health = Math.min(getMaxHealth(next), next.profile.health + hit.lifeRestored);
    const maxHealth = getCampaignMonsterMaxHealth(state, question);
    setCard(next, questionId, { ...getCard(next, questionId), monsterHealth: maxHealth });
    return { hit: { ...hit, defeated, maxHealth, remainingHealth }, state: next };
  }
  return applyPartialMonsterHit(state, questionId, draft, now, { ...hit, defeated, maxHealth: getCampaignMonsterMaxHealth(state, question), remainingHealth });
};

function applyPartialMonsterHit(state: StudyState, questionId: string, draft: string, now: number, hit: MonsterHitResult) {
  const next = cloneState(state);
  const card = { ...getCard(next, questionId) };
  card.attempts += 1;
  card.lastResult = "pass";
  card.lastAttemptAt = now;
  card.draft = draft;
  card.monsterHealth = hit.remainingHealth;
  next.profile.lastStudiedAt = now;
  next.profile.activeSkill = null;
  next.profile.health = Math.min(getMaxHealth(next), next.profile.health + hit.lifeRestored);
  setCard(next, questionId, card);
  applyPartialRewards(next, questions.find((row) => row.id === questionId), state, now);
  return { hit, state: next };
}

function getActiveSkillHit(state: StudyState, question: Question, skillId: StudyState["profile"]["activeSkill"], baseDamage: number) {
  if (skillId === "powerStrike") {
    return createActiveHit(1, baseDamage * POWER_STRIKE_MULTIPLIER, ["Vulnerable burst"]);
  }
  if (skillId === "cleave") {
    return createActiveHit(CLEAVE_HIT_COUNT, Math.max(1, Math.round(baseDamage * CLEAVE_DAMAGE_RATIO)), ["Cleave"]);
  }
  if (skillId === "tripleStrike") {
    const rank = getWarriorSkillRank(state.profile.skillRanks, "doubleSwing");
    return createActiveHit(TRIPLE_STRIKE_HIT_COUNT, Math.max(1, Math.round(baseDamage * (TRIPLE_STRIKE_DAMAGE_RATIO + rank * DOUBLE_SWING_EXTRA_RATIO_PER_RANK))), ["Combo"]);
  }
  if (skillId === "execute") {
    const currentHealth = getMonsterCurrentHealth(state, question);
    const wounded = currentHealth / getCampaignMonsterMaxHealth(state, question) <= EXECUTE_WOUNDED_THRESHOLD;
    return createActiveHit(1, Math.round(baseDamage * (wounded ? EXECUTE_WOUNDED_MULTIPLIER : EXECUTE_MULTIPLIER)), [wounded ? "Execute" : "Finisher"]);
  }
  if (skillId === "bloodForBlood") {
    const maxHealth = getMaxHealth(state);
    const missingRatio = Math.max(0, maxHealth - state.profile.health) / Math.max(LOW_HEALTH_RATIO_DIVISOR, maxHealth);
    const damage = Math.round(baseDamage * Math.max(BLOOD_FOR_BLOOD_MIN_MULTIPLIER, 1 + missingRatio));
    return createActiveHit(1, damage, ["Life steal"], Math.max(1, Math.round(damage * BLOOD_FOR_BLOOD_LIFE_STEAL_RATIO)));
  }
  if (skillId === "whirlwindAssault") {
    const rank = getWarriorSkillRank(state.profile.skillRanks, "frenzy");
    return createActiveHit(WHIRLWIND_HIT_COUNT, Math.max(1, Math.round(baseDamage * (WHIRLWIND_DAMAGE_RATIO + rank * FRENZY_EXTRA_RATIO_PER_RANK))), ["Whirlwind"]);
  }
  return createActiveHit(1, baseDamage);
}

function createActiveHit(hitCount: number, perHitDamage: number, effects: string[] = [], lifeRestored = 0) {
  return { effects, hitCount, lifeRestored, perHitDamage };
}

export function getCampaignMonsterMaxHealth(state: StudyState, question: Question) {
  return Math.round(getMonsterMaxHealth(question) * getSpireDifficultyModifiers(state.profile.spireRun).monsterHealthMultiplier);
}

function applyPartialRewards(next: StudyState, question: Question | undefined, rewardState: StudyState, now: number) {
  if (!question) {
    return;
  }
  next.profile.coins += getCoinReward(question, next);
  const modifiers = getRunModifierTotals(next);
    next.profile.health = Math.min(getMaxHealth(next), next.profile.health + applyHealingReceived(next, (modifiers.lifeOnKill || 0) + getWarriorSkillBonusTotals(next).lifeOnKill));
  const drop = getQuestionDrop(question, rewardState, now);
  if (drop) {
    next.profile.inventory.push(drop);
  }
}

function getSeededRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}
