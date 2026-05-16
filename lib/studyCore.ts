import { questions } from "../data/questions";
import { createDropItem, EQUIPMENT_SLOTS, getActiveSetBonusesForItems, SLOT_LABELS } from "./itemCore";
import { createShopStock, normalizeShopStock } from "./shopCore";
import type { CardState, CharacterStatKey, CharacterStats, EquipmentSlot, InventoryItem, ItemModifierKey, Question, StudyState } from "../types/study";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const EASY_MAX_DIFFICULTY = 2;
const MEDIUM_MAX_DIFFICULTY = 4;
const EASY_MINUTES = 10;
const MEDIUM_MINUTES = 20;
const HARD_MINUTES = 25;
const MAX_DIFFICULTY = 5;
const CORRECTS_PER_DIFFICULTY = 3;
const MISSING_INDEX = -1;
const PERCENT = 100;
const SECOND_REVIEW_REPS = 2;
const SECOND_REVIEW_INTERVAL_DAYS = 3;
const MAX_EASE = 3.2;
const PASS_EASE_BONUS = 0.08;
const MIN_EASE = 1.4;
const FAIL_EASE_PENALTY = 0.22;
const FAIL_REVIEW_DELAY_MINUTES = 10;
const COINS_PER_DIFFICULTY = 10;
const EXPERIENCE_PER_DIFFICULTY = 15;
const BASE_MANA = 20;
const MANA_PER_INTELLIGENCE = 5;
const HEALTH_PER_CONSTITUTION = 5;
const GOLD_BONUS_PER_PERCEPTION = 0.04;
const EXPERIENCE_BONUS_PER_INTELLIGENCE = 0.04;
const MANA_PER_DIFFICULTY = 2;
const MANA_BONUS_PER_INTELLIGENCE = 1;
const DEFENSE_PER_THREE_CONSTITUTION = 1;
const BASE_CRITICAL_CHANCE = 0.05;
const CRITICAL_CHANCE_PER_STRENGTH = 0.015;
const MAX_CRITICAL_CHANCE = 0.5;
const DAMAGE_PER_STRENGTH = 3;
const DAMAGE_PER_DIFFICULTY = 8;
const FIRST_STAT_LEVEL = 1;
const STRENGTH_LEVEL_INTERVAL = 2;
const CONSTITUTION_LEVEL_INTERVAL = 3;
const PERCEPTION_LEVEL_INTERVAL = 3;
const INTELLIGENCE_LEVEL_INTERVAL = 2;
const STAT_POINTS_PER_LEVEL = 4;
const DROP_CHANCES: Record<Question["difficulty"], number> = { 1: 0.12, 2: 0.18, 3: 0.26, 4: 0.36, 5: 0.5 };
const DROP_PERCEPTION_BONUS = 0.01;
const MAX_DROP_CHANCE = 0.75;
const MODIFIER_PERCENT_BASE = 100;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const MONSTER_LEVEL_RATING_FLOOR = 900;
const MONSTER_LEVEL_RATING_STEP = 100;
const MONSTER_DAMAGE_BASE = 2;
const MONSTER_DAMAGE_LEVEL_DIVISOR = 5;
const MONSTER_DAMAGE_SPREAD_DIVISOR = 8;
const MONSTER_DAMAGE_MIN_SPREAD = 1;
const RANDOM_INCLUSIVE_OFFSET = 1;
const STARTER_SHOP_REFRESH_AT = 0;
const MODIFIER_KEYS: ItemModifierKey[] = [
  "bonusXpPercent",
  "criticalChancePercent",
  "damageReduction",
  "enhancedDamagePercent",
  "goldFindPercent",
  "lifeOnKill",
  "magicFindPercent",
  "manaOnKill",
  "maxLife",
  "maxMana"
];

export const DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;
export const MASTERED_REPS = 3;
export const HINT_COST = 0;
export const MAX_HEALTH = 50;
export const HEALTH_LOSS_PER_FAIL = 5;
export const EXPERIENCE_PER_LEVEL = 150;
export const MAX_CHARACTER_LEVEL = 100;
export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  strength: 1,
  constitution: 1,
  perception: 1,
  intelligence: 1
};
export const EQUIPMENT_SLOT_LABELS = SLOT_LABELS;
export const DEFAULT_ITEM_MODIFIERS: Record<ItemModifierKey, number> = {
  bonusXpPercent: 0,
  criticalChancePercent: 0,
  damageReduction: 0,
  enhancedDamagePercent: 0,
  goldFindPercent: 0,
  lifeOnKill: 0,
  magicFindPercent: 0,
  manaOnKill: 0,
  maxLife: 0,
  maxMana: 0
};

export const difficultyLabels: Record<Question["difficulty"], string> = {
  1: "Easy",
  2: "Easy+",
  3: "Medium",
  4: "Medium+",
  5: "Hard"
};

export const getQuestionTimeLimitMs = (question: Question) => {
  if (question.difficulty <= EASY_MAX_DIFFICULTY) {
    return EASY_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  }

  if (question.difficulty <= MEDIUM_MAX_DIFFICULTY) {
    return MEDIUM_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  }

  return HARD_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
};

export const defaultState = (): StudyState => {
  const state = createDefaultStateBase();
  return { ...state, profile: { ...state.profile, shopStock: createStarterShopStock() } };
};

function createDefaultStateBase(): StudyState {
  return {
    mode: "leetcode",
    currentId: null,
    totalCorrect: 0,
    streak: 0,
    profile: {
      coins: 0,
      experience: 0,
      health: MAX_HEALTH,
      mana: BASE_MANA,
      statPoints: 0,
      statPointsAwardedLevel: FIRST_STAT_LEVEL,
      hintsBought: 0,
      startedAt: Date.now(),
      lastStudiedAt: null,
      stats: { ...DEFAULT_CHARACTER_STATS },
      inventory: [],
      equipment: defaultEquipment(),
      shopLastRefreshedAt: null,
      shopStock: []
    },
    cards: {}
  };
}

export const defaultCard = (): CardState => ({
  dueAt: 0,
  intervalDays: 0,
  ease: 2.4,
  reps: 0,
  attempts: 0,
  correct: 0,
  lastResult: null
});

export const cloneState = (state: StudyState): StudyState => ({
  ...state,
  profile: {
    ...state.profile,
    stats: { ...state.profile.stats },
    inventory: state.profile.inventory.map((item) => ({ ...item, modifiers: item.modifiers?.map((modifier) => ({ ...modifier })), stats: { ...item.stats } })),
    equipment: { ...state.profile.equipment },
    shopStock: state.profile.shopStock.map((item) => ({ ...item }))
  },
  cards: Object.fromEntries(Object.entries(state.cards).map(([id, card]) => [id, { ...card }]))
});

export const normalizeStudyState = (stored: Partial<StudyState> | null | undefined): StudyState => {
  const fallback = defaultState();
  if (!stored?.cards) {
    return fallback;
  }

  const normalized = {
    ...fallback,
    ...stored,
    profile: {
      ...fallback.profile,
      ...(stored.profile || {}),
      experience: Math.max(0, stored.profile?.experience ?? fallback.profile.experience),
      statPoints: Math.max(0, stored.profile?.statPoints ?? fallback.profile.statPoints),
      statPointsAwardedLevel: Math.max(FIRST_STAT_LEVEL, stored.profile?.statPointsAwardedLevel ?? fallback.profile.statPointsAwardedLevel),
      stats: normalizeCharacterStats(stored.profile?.stats),
      inventory: normalizeInventory(stored.profile?.inventory),
      equipment: normalizeEquipment(stored.profile?.equipment),
      shopLastRefreshedAt: stored.profile?.shopLastRefreshedAt ?? fallback.profile.shopLastRefreshedAt,
      shopStock: normalizeShopStock(stored.profile?.shopStock)
    },
    cards: stored.cards
  };
  const bounded = {
    ...normalized,
    profile: {
      ...normalized.profile,
      health: Math.min(getMaxHealth(normalized), Math.max(0, stored.profile?.health ?? fallback.profile.health)),
      mana: Math.min(getMaxMana(normalized), Math.max(0, stored.profile?.mana ?? fallback.profile.mana))
    }
  };
  const stocked = {
    ...bounded,
    profile: {
      ...bounded.profile,
      shopStock: bounded.profile.shopStock.length ? bounded.profile.shopStock : createStarterShopStock()
    }
  };
  return grantPendingStatPoints(stocked);
};

function createStarterShopStock() {
  return createShopStock(questions[0], DEFAULT_CHARACTER_STATS, STARTER_SHOP_REFRESH_AT);
}

function normalizeCharacterStats(stats: Partial<CharacterStats> | undefined): CharacterStats {
  return {
    strength: normalizeStat(stats?.strength),
    constitution: normalizeStat(stats?.constitution),
    perception: normalizeStat(stats?.perception),
    intelligence: normalizeStat(stats?.intelligence)
  };
}

function defaultEquipment(): Record<EquipmentSlot, string | null> {
  return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot, null])) as Record<EquipmentSlot, string | null>;
}

function normalizeInventory(items: InventoryItem[] | undefined) {
  return (items || []).map((item) => ({ ...item, modifiers: normalizeItemModifiers(item.modifiers), requirements: item.requirements || { level: FIRST_STAT_LEVEL, stats: {} }, stats: { ...item.stats } }));
}

function normalizeEquipment(equipment: Partial<Record<EquipmentSlot, string | null>> | undefined) {
  return { ...defaultEquipment(), ...(equipment || {}) };
}

function normalizeStat(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return FIRST_STAT_LEVEL;
  }
  return Math.max(FIRST_STAT_LEVEL, Math.floor(value || FIRST_STAT_LEVEL));
}

function normalizeItemModifiers(modifiers: InventoryItem["modifiers"] | undefined) {
  return (modifiers || []).filter((modifier) => MODIFIER_KEYS.includes(modifier.key) && Number.isFinite(modifier.value));
}

export const getCard = (state: StudyState, questionId: string): CardState => {
  return state.cards[questionId] || defaultCard();
};

export const setCard = (state: StudyState, questionId: string, card: CardState) => {
  state.cards[questionId] = card;
};

export const isMasteredCard = (card: CardState) => card.correct >= MASTERED_REPS && card.reps >= MASTERED_REPS;

export const getEffectiveCharacterStats = (state: StudyState): CharacterStats => {
  const levelBonus = getLevelProgress(state).level - FIRST_STAT_LEVEL;
  const equipmentStats = getEquipmentStats(state);
  return {
    strength: state.profile.stats.strength + equipmentStats.strength + Math.floor((levelBonus + FIRST_STAT_LEVEL) / STRENGTH_LEVEL_INTERVAL),
    constitution: state.profile.stats.constitution + equipmentStats.constitution + Math.floor(levelBonus / CONSTITUTION_LEVEL_INTERVAL),
    perception: state.profile.stats.perception + equipmentStats.perception + Math.floor((levelBonus + FIRST_STAT_LEVEL) / PERCEPTION_LEVEL_INTERVAL),
    intelligence: state.profile.stats.intelligence + equipmentStats.intelligence + Math.floor(levelBonus / INTELLIGENCE_LEVEL_INTERVAL)
  };
};

export const getEquippedItems = (state: StudyState) => {
  return EQUIPMENT_SLOTS.map((slot) => state.profile.inventory.find((item) => item.id === state.profile.equipment[slot])).filter(Boolean) as InventoryItem[];
};

export const getEquipmentStats = (state: StudyState): CharacterStats => {
  return addStats(getEquippedItemStats(state), getSetBonusStats(state));
};

export const getEquipmentModifierTotals = (state: StudyState) => {
  return getEquippedItems(state).reduce((totals, item) => addModifierTotals(totals, item.modifiers), { ...DEFAULT_ITEM_MODIFIERS });
};

function getEquippedItemStats(state: StudyState): CharacterStats {
  return getEquippedItems(state).reduce((stats, item) => addStats(stats, item.stats), { strength: 0, constitution: 0, perception: 0, intelligence: 0 });
}

export const getActiveSetBonuses = (state: StudyState) => {
  return getActiveSetBonusesForItems(getEquippedItems(state));
};

function getSetBonusStats(state: StudyState): CharacterStats {
  return getActiveSetBonuses(state)
    .flatMap((set) => set.bonuses)
    .reduce((stats, bonus) => addStats(stats, bonus.stats), { strength: 0, constitution: 0, perception: 0, intelligence: 0 });
}

function getEffectiveCharacterStatsWithoutItem(state: StudyState, itemId: string): CharacterStats {
  const withoutItem = cloneState(state);
  for (const slot of EQUIPMENT_SLOTS) {
    if (withoutItem.profile.equipment[slot] === itemId) {
      withoutItem.profile.equipment[slot] = null;
    }
  }
  return getEffectiveCharacterStats(withoutItem);
}

function addStats(base: CharacterStats, bonus: Partial<CharacterStats>): CharacterStats {
  return {
    strength: base.strength + (bonus.strength || 0),
    constitution: base.constitution + (bonus.constitution || 0),
    perception: base.perception + (bonus.perception || 0),
    intelligence: base.intelligence + (bonus.intelligence || 0)
  };
}

function addModifierTotals(base: Record<ItemModifierKey, number>, modifiers: InventoryItem["modifiers"] | undefined) {
  const next = { ...base };
  for (const modifier of modifiers || []) {
    next[modifier.key] += modifier.value;
  }
  return next;
}

function applyPercentBonus(value: number, bonusPercent: number) {
  return Math.round(value * (1 + bonusPercent / MODIFIER_PERCENT_BASE));
}

export const getMaxHealth = (state: StudyState) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  return MAX_HEALTH + (stats.constitution - FIRST_STAT_LEVEL) * HEALTH_PER_CONSTITUTION + modifiers.maxLife;
};

export const getMaxMana = (state: StudyState) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  return BASE_MANA + (stats.intelligence - FIRST_STAT_LEVEL) * MANA_PER_INTELLIGENCE + modifiers.maxMana;
};

export const getHealthLoss = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  const defense = Math.floor(stats.constitution / CONSTITUTION_LEVEL_INTERVAL) * DEFENSE_PER_THREE_CONSTITUTION;
  return Math.max(1, amount - defense - modifiers.damageReduction);
};

export const getMonsterLevel = (question: Question) => {
  return Math.max(FIRST_STAT_LEVEL, Math.ceil((question.rating - MONSTER_LEVEL_RATING_FLOOR) / MONSTER_LEVEL_RATING_STEP));
};

export const getMonsterDamageRoll = (question: Question, now = Date.now()) => {
  const monsterLevel = getMonsterLevel(question);
  const baseDamage = MONSTER_DAMAGE_BASE + question.difficulty + Math.ceil(monsterLevel / MONSTER_DAMAGE_LEVEL_DIVISOR);
  const spread = Math.max(MONSTER_DAMAGE_MIN_SPREAD, Math.ceil(monsterLevel / MONSTER_DAMAGE_SPREAD_DIVISOR));
  return baseDamage + Math.floor(getSeededRoll(`${question.id}:${now}:monster-hit`) * (spread + RANDOM_INCLUSIVE_OFFSET));
};

export const getAttackDamage = (question: Question, state: StudyState) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  return applyPercentBonus(question.difficulty * DAMAGE_PER_DIFFICULTY + stats.strength * DAMAGE_PER_STRENGTH, modifiers.enhancedDamagePercent);
};

export const getCriticalChance = (state: StudyState) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  return Math.min(MAX_CRITICAL_CHANCE, BASE_CRITICAL_CHANCE + stats.strength * CRITICAL_CHANCE_PER_STRENGTH + modifiers.criticalChancePercent / MODIFIER_PERCENT_BASE);
};

export const getCoinReward = (question: Question, state?: StudyState) => {
  const baseReward = question.difficulty * COINS_PER_DIFFICULTY;
  if (!state) {
    return baseReward;
  }
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  return applyPercentBonus(Math.round(baseReward * (1 + (stats.perception - FIRST_STAT_LEVEL) * GOLD_BONUS_PER_PERCEPTION)), modifiers.goldFindPercent);
};

export const getExperienceReward = (question: Question, state?: StudyState) => {
  const baseReward = question.difficulty * EXPERIENCE_PER_DIFFICULTY;
  if (!state) {
    return baseReward;
  }
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  return applyPercentBonus(Math.round(baseReward * (1 + (stats.intelligence - FIRST_STAT_LEVEL) * EXPERIENCE_BONUS_PER_INTELLIGENCE)), modifiers.bonusXpPercent);
};

export const getManaReward = (question: Question, state: StudyState) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  return question.difficulty * MANA_PER_DIFFICULTY + Math.floor(stats.intelligence / MANA_BONUS_PER_INTELLIGENCE) + modifiers.manaOnKill;
};

export const getLevelProgress = (state: StudyState) => {
  const totalExperience = state.profile.experience;
  const level = Math.min(MAX_CHARACTER_LEVEL, Math.floor(totalExperience / EXPERIENCE_PER_LEVEL) + 1);
  const isCapped = level >= MAX_CHARACTER_LEVEL;
  return {
    level,
    currentExperience: isCapped ? EXPERIENCE_PER_LEVEL : totalExperience % EXPERIENCE_PER_LEVEL,
    nextLevelExperience: EXPERIENCE_PER_LEVEL
  };
};

export const grantPendingStatPoints = (state: StudyState): StudyState => {
  const level = getLevelProgress(state).level;
  const awardedLevel = Math.max(FIRST_STAT_LEVEL, state.profile.statPointsAwardedLevel || FIRST_STAT_LEVEL);
  if (level <= awardedLevel) {
    return state;
  }
  const next = cloneState(state);
  next.profile.statPoints += (level - awardedLevel) * STAT_POINTS_PER_LEVEL;
  next.profile.statPointsAwardedLevel = level;
  return next;
};

export const spendStatPoint = (state: StudyState, stat: CharacterStatKey): StudyState => {
  if (state.profile.statPoints <= 0) {
    return state;
  }
  const next = cloneState(state);
  next.profile.statPoints -= 1;
  next.profile.stats[stat] += 1;
  next.profile.health = Math.min(next.profile.health, getMaxHealth(next));
  next.profile.mana = Math.min(next.profile.mana, getMaxMana(next));
  return next;
};

export const equipItem = (state: StudyState, itemId: string): StudyState => {
  const item = state.profile.inventory.find((row) => row.id === itemId);
  if (!item || !canEquipItem(state, item)) {
    return state;
  }
  const next = cloneState(state);
  next.profile.equipment[item.slot] = item.id;
  next.profile.health = Math.min(next.profile.health, getMaxHealth(next));
  next.profile.mana = Math.min(next.profile.mana, getMaxMana(next));
  return next;
};

export const canEquipItem = (state: StudyState, item: InventoryItem) => {
  if (getLevelProgress(state).level < item.requirements.level) {
    return false;
  }
  const stats = getEffectiveCharacterStatsWithoutItem(state, item.id);
  return Object.entries(item.requirements.stats).every(([key, value]) => {
    return stats[key as CharacterStatKey] >= (value || 0);
  });
};

export const getQuestionDrop = (question: Question, state: StudyState, now = Date.now()) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getEquipmentModifierTotals(state);
  const baseChance = DROP_CHANCES[question.difficulty] + (stats.perception - FIRST_STAT_LEVEL) * DROP_PERCEPTION_BONUS;
  const chance = Math.min(MAX_DROP_CHANCE, baseChance * (1 + modifiers.magicFindPercent / MODIFIER_PERCENT_BASE));
  const roll = getDropRoll(question.id, now);
  if (roll > chance) {
    return null;
  }
  return createDropItem(question, stats, now);
};

function getDropRoll(questionId: string, now: number) {
  return getSeededRoll(`${questionId}:${now}:drop`);
}

function getSeededRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}

export const applyHealthPenalty = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL): StudyState => {
  const next = cloneState(state);
  next.profile.health = Math.max(0, next.profile.health - getHealthLoss(state, amount));
  return next;
};

export const canBuyHint = (state: StudyState) => state.profile.coins >= HINT_COST;

export const buyHint = (state: StudyState) => {
  if (!canBuyHint(state)) {
    return state;
  }

  return {
    ...state,
    profile: {
      ...state.profile,
      coins: state.profile.coins - HINT_COST,
      hintsBought: state.profile.hintsBought + 1
    }
  };
};

export const getRecommendedDifficulty = (state: StudyState) => {
  return Math.min(MAX_DIFFICULTY, 1 + Math.floor(state.totalCorrect / CORRECTS_PER_DIFFICULTY)) as Question["difficulty"];
};

export const getDueQuestions = (state: StudyState, now = Date.now()) => {
  return questions.filter((question) => getCard(state, question.id).dueAt <= now);
};

export const pickQuestion = (state: StudyState, currentQuestion: Question | null, preferNext = false, now = Date.now()) => {
  const recommended = getRecommendedDifficulty(state);
  const currentIndex = currentQuestion ? questions.findIndex((question) => question.id === currentQuestion.id) : MISSING_INDEX;
  const sorted = [...questions].sort((a, b) => {
    const cardA = getCard(state, a.id);
    const cardB = getCard(state, b.id);
    return cardA.dueAt - cardB.dueAt || a.difficulty - b.difficulty;
  });

  const due = sorted.filter((question) => getCard(state, question.id).dueAt <= now);
  const unseenWithinLevel = sorted.filter((question) => {
    const card = getCard(state, question.id);
    return card.attempts === 0 && question.difficulty <= recommended;
  });

  let picked = unseenWithinLevel[0] || due.find((question) => question.difficulty <= recommended) || due[0];
  if (preferNext) {
    const nextInOrder = questions
      .slice(currentIndex + 1)
      .concat(questions.slice(0, Math.max(0, currentIndex + 1)))
      .find((question) => question.id !== currentQuestion?.id && question.difficulty <= recommended + 1);
    picked = nextInOrder || picked;
  }

  return picked || sorted[0];
};

export const getProfileStats = (state: StudyState, now = Date.now()) => {
  const attempted = questions.filter((question) => getCard(state, question.id).attempts > 0).length;
  const solved = questions.filter((question) => getCard(state, question.id).correct > 0).length;
  const mastered = questions.filter((question) => isMasteredCard(getCard(state, question.id))).length;
  const due = questions.filter((question) => getCard(state, question.id).dueAt <= now).length;
  const totalAttempts = questions.reduce((sum, question) => sum + getCard(state, question.id).attempts, 0);
  const totalPasses = questions.reduce((sum, question) => sum + getCard(state, question.id).correct, 0);
  const accuracy = totalAttempts ? Math.round((totalPasses / totalAttempts) * PERCENT) : 0;

  return { attempted, solved, mastered, due, totalAttempts, totalPasses, accuracy };
};

export const getTopicStats = (state: StudyState) => {
  const topicMap = new Map<string, { topic: string; total: number; attempted: number; solved: number; mastered: number }>();

  for (const question of questions) {
    for (const topic of question.topics) {
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { topic, total: 0, attempted: 0, solved: 0, mastered: 0 });
      }

      const row = topicMap.get(topic);
      if (!row) {
        continue;
      }

      const card = getCard(state, question.id);
      row.total += 1;
      row.attempted += card.attempts > 0 ? 1 : 0;
      row.solved += card.correct > 0 ? 1 : 0;
      row.mastered += isMasteredCard(card) ? 1 : 0;
    }
  }

  return [...topicMap.values()].sort((a, b) => {
    return b.mastered - a.mastered || b.solved - a.solved || a.topic.localeCompare(b.topic);
  });
};

export const applyScheduleResult = (state: StudyState, questionId: string, passed: boolean, draft: string, now = Date.now(), failureDamage = HEALTH_LOSS_PER_FAIL) => {
  const next = cloneState(state);
  const card = { ...getCard(next, questionId) };
  const wasMastered = isMasteredCard(card);

  card.attempts += 1;
  card.lastResult = passed ? "pass" : "fail";
  card.lastAttemptAt = now;
  card.draft = draft;
  next.profile.lastStudiedAt = now;

  if (passed) {
    applyPassedSchedule(next, card, questionId, state, wasMastered, now);
  } else {
    applyFailedSchedule(next, card, state, now, failureDamage);
  }

  setCard(next, questionId, card);
  return next;
};

function applyPassedSchedule(next: StudyState, card: CardState, questionId: string, state: StudyState, wasMastered: boolean, now: number) {
  const question = questions.find((row) => row.id === questionId);
  card.correct += 1;
  card.reps += 1;
  next.totalCorrect += 1;
  next.streak += 1;
  applyQuestionRewards(next, question);
  applyQuestionDrop(next, question, state, now);
  applyShopRefresh(next, question, now);
  card.intervalDays = getNextIntervalDays(card);
  card.ease = Math.min(MAX_EASE, card.ease + PASS_EASE_BONUS);
  card.dueAt = now + card.intervalDays * DAY;
  if (!wasMastered && isMasteredCard(card)) {
    card.masteredAt = now;
  }
}

function applyQuestionRewards(next: StudyState, question: Question | undefined) {
  if (!question) {
    return;
  }
  next.profile.coins += getCoinReward(question, next);
  next.profile.experience += getExperienceReward(question, next);
  const leveled = grantPendingStatPoints(next);
  next.profile.statPoints = leveled.profile.statPoints;
  next.profile.statPointsAwardedLevel = leveled.profile.statPointsAwardedLevel;
  next.profile.mana = Math.min(getMaxMana(next), next.profile.mana + getManaReward(question, next));
  next.profile.health = Math.min(getMaxHealth(next), next.profile.health + getEquipmentModifierTotals(next).lifeOnKill);
}

function applyQuestionDrop(next: StudyState, question: Question | undefined, state: StudyState, now: number) {
  const drop = question ? getQuestionDrop(question, state, now) : null;
  if (drop) {
    next.profile.inventory.push(drop);
  }
}

function applyShopRefresh(next: StudyState, question: Question | undefined, now: number) {
  if (!question) {
    return;
  }
  next.profile.shopStock = createShopStock(question, getEffectiveCharacterStats(next), now);
  next.profile.shopLastRefreshedAt = now;
}

function getNextIntervalDays(card: CardState) {
  if (card.reps === 1) {
    return 1;
  }
  if (card.reps === SECOND_REVIEW_REPS) {
    return SECOND_REVIEW_INTERVAL_DAYS;
  }
  return Math.ceil(card.intervalDays * card.ease);
}

function applyFailedSchedule(next: StudyState, card: CardState, state: StudyState, now: number, failureDamage: number) {
  next.profile.health = Math.max(0, next.profile.health - getHealthLoss(state, failureDamage));
  next.streak = 0;
  card.reps = Math.max(0, card.reps - 1);
  card.ease = Math.max(MIN_EASE, card.ease - FAIL_EASE_PENALTY);
  card.intervalDays = 0;
  card.dueAt = now + FAIL_REVIEW_DELAY_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
}
