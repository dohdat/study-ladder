import { questions } from "../data/questions";
import { getMonsterMaxHealth, getMonsterPlayerDamage } from "./monsterCore";
import { applyScheduleResult, cloneState, getAttackDamage, getCard, getCriticalChance, setCard } from "./studyCore";
import type { Question, StudyState } from "../types/study";

const CRITICAL_DAMAGE_MULTIPLIER = 2;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;

type MonsterHitResult = {
  critical: boolean;
  damage: number;
  defeated: boolean;
  maxHealth: number;
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
  const critical = getSeededRoll(`${question.id}:${now}:critical`) <= getCriticalChance(state);
  const baseDamage = getAttackDamage(question, state);
  const damage = critical ? baseDamage * CRITICAL_DAMAGE_MULTIPLIER : baseDamage;
  return {
    critical,
    damage: getMonsterPlayerDamage(question, damage)
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
  setCard(next, questionId, card);
  return { hit, state: next };
}

function getSeededRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}
