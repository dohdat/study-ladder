import { questions } from "../data/questions";
import { getMonsterMaxHealth, getMonsterPlayerDamage } from "./monsterCore";
import { getActiveWarriorSkill } from "./skillCore";
import {
  applyScheduleResult, cloneState, getAttackDamage, getCard, getCoinReward, getCriticalChance, getEquipmentModifierTotals,
  getExperienceReward, getManaReward, getMaxHealth, getMaxMana, getQuestionDrop, getWarriorSkillBonusTotals, grantPendingStatPoints, setCard
} from "./studyCore";
import type { Question, StudyState } from "../types/study";

const CRITICAL_DAMAGE_MULTIPLIER = 2;
const POWER_STRIKE_MULTIPLIER = 2;
const WHIRLWIND_HIT_COUNT = 5;
const WHIRLWIND_DAMAGE_RATIO = 0.65;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;

export type MonsterHitResult = {
  activeSkillName?: string;
  critical: boolean;
  damage: number;
  defeated: boolean;
  hitCount: number;
  maxHealth: number;
  perHitDamage: number;
  remainingHealth: number;
};

export const getMonsterCurrentHealth = (state: StudyState, question: Question) => {
  const storedHealth = getCard(state, question.id).monsterHealth;
  if (!Number.isFinite(storedHealth)) {
    return getMonsterMaxHealth(question);
  }
  return Math.min(getMonsterMaxHealth(question), Math.max(0, storedHealth || 0));
};

export const getMonsterHit = (state: StudyState, question: Question, now = Date.now()) => {
  const activeSkill = getActiveWarriorSkill(state.profile.activeSkill);
  const guaranteedCritical = activeSkill?.id === "sureCrit";
  const critical = guaranteedCritical || getSeededRoll(`${question.id}:${now}:critical`) <= getCriticalChance(state);
  const baseDamage = getAttackDamage(question, state);
  const criticalDamage = critical ? baseDamage * CRITICAL_DAMAGE_MULTIPLIER : baseDamage;
  const activeHit = getActiveSkillHit(activeSkill?.id ?? null, criticalDamage);
  const perHitDamage = getMonsterPlayerDamage(question, activeHit.perHitDamage);
  return {
    activeSkillName: activeSkill?.name,
    critical,
    damage: perHitDamage * activeHit.hitCount,
    hitCount: activeHit.hitCount,
    perHitDamage
  };
};

export const applyPassedCombatResult = (state: StudyState, questionId: string, draft: string, now = Date.now()) => {
  const question = questions.find((row) => row.id === questionId);
  if (!question) {
    return { hit: null, state };
  }
  const currentHealth = getMonsterCurrentHealth(state, question);
  const hit = getMonsterHit(state, question, now);
  const remainingHealth = Math.max(0, currentHealth - hit.damage);
  const defeated = remainingHealth <= 0;
  if (defeated) {
    const next = applyScheduleResult(state, questionId, true, draft, now);
    next.profile.activeSkill = null;
    setCard(next, questionId, { ...getCard(next, questionId), monsterHealth: getMonsterMaxHealth(question) });
    return { hit: { ...hit, defeated, maxHealth: getMonsterMaxHealth(question), remainingHealth }, state: next };
  }
  return applyPartialMonsterHit(state, questionId, draft, now, { ...hit, defeated, maxHealth: getMonsterMaxHealth(question), remainingHealth });
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
  setCard(next, questionId, card);
  applyPartialRewards(next, questions.find((row) => row.id === questionId), state, now);
  return { hit, state: next };
}

function getActiveSkillHit(skillId: StudyState["profile"]["activeSkill"], baseDamage: number) {
  if (skillId === "powerStrike") {
    return { hitCount: 1, perHitDamage: baseDamage * POWER_STRIKE_MULTIPLIER };
  }
  if (skillId === "tripleStrike") {
    return { hitCount: 3, perHitDamage: baseDamage };
  }
  if (skillId === "whirlwindAssault") {
    return { hitCount: WHIRLWIND_HIT_COUNT, perHitDamage: Math.max(1, Math.round(baseDamage * WHIRLWIND_DAMAGE_RATIO)) };
  }
  return { hitCount: 1, perHitDamage: baseDamage };
}

function applyPartialRewards(next: StudyState, question: Question | undefined, rewardState: StudyState, now: number) {
  if (!question) {
    return;
  }
  next.profile.coins += getCoinReward(question, next);
  next.profile.experience += getExperienceReward(question, next);
  const leveled = grantPendingStatPoints(next);
  next.profile.statPoints = leveled.profile.statPoints;
  next.profile.statPointsAwardedLevel = leveled.profile.statPointsAwardedLevel;
  next.profile.mana = Math.min(getMaxMana(next), next.profile.mana + getManaReward(question, next));
  next.profile.health = Math.min(getMaxHealth(next), next.profile.health + getEquipmentModifierTotals(next).lifeOnKill + getWarriorSkillBonusTotals(next).lifeOnKill);
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
