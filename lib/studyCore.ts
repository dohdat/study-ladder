/* eslint-disable max-lines */
import { questions } from "../data/questions";
import { getSpireDifficultyModifiers } from "./campaignCore";
import { createDropItem, EQUIPMENT_SLOTS, getActiveSetBonusesForItems, SLOT_LABELS } from "./itemCore";
import { applyEloResult, DEFAULT_PLAYER_RATING, getEstimatedRating } from "./ratingCore";
import { getRelicModifierTotals, normalizeRelics } from "./relicCore";
import { ALL_MODIFIER_KEYS } from "./modifierAffixes";
import { applyElementalResistance, getResistancesFromModifiers } from "./resistanceCore";
import { getWarriorSkillBonuses, normalizeWarriorSkillRanks } from "./skillCore";
import { createShopStock, normalizeShopStock } from "./shopCore";
import { createSpireRun, normalizeSpireRun } from "./spireMapCore";
import { getUniqueMonsterBonuses } from "./monsterCore";
import type { ActivePotionEffect, CardState, CharacterStatKey, CharacterStats, DamageType, EquipmentSlot, InventoryItem, InventoryItemPosition, ItemModifierKey, Question, StudyState } from "../types/study";

const MS_PER_MINUTE = 60000;
const MS_PER_SECOND = 1000;
const EASY_MINUTES = 10;
const MEDIUM_MINUTES = 20;
const HARD_MINUTES = 25;
const QUESTION_TIME_LIMIT_MINUTES: Record<Question["difficulty"], number> = { 1: EASY_MINUTES, 2: EASY_MINUTES, 3: MEDIUM_MINUTES, 4: MEDIUM_MINUTES, 5: HARD_MINUTES };
const MAX_DIFFICULTY = 5;
const QUESTION_RATING_BUFFER = 300;
const NEXT_QUESTION_RATING_BUFFER = 350;
const MISSING_INDEX = -1;
const PERCENT = 100;
const COINS_PER_DIFFICULTY = 10;
const HEALTH_PER_CONSTITUTION = 5;
const GOLD_BONUS_PER_PERCEPTION = 0.04;
const DEFENSE_PER_THREE_CONSTITUTION = 1;
const BASE_CRITICAL_CHANCE = 0.05;
const MAX_CRITICAL_CHANCE = 0.5;
const DAMAGE_PER_STRENGTH = 3;
const DAMAGE_PER_DIFFICULTY = 8;
const FIRST_STAT_LEVEL = 1;
const STRENGTH_LEVEL_INTERVAL = 2;
const CONSTITUTION_LEVEL_INTERVAL = 3;
const PERCEPTION_LEVEL_INTERVAL = 3;
const INTELLIGENCE_LEVEL_INTERVAL = 2;
const DROP_CHANCES: Record<Question["difficulty"], number> = { 1: 0.12, 2: 0.18, 3: 0.26, 4: 0.36, 5: 0.5 };
const ENABLE_EQUIPMENT_DROPS = false;
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
const DIFFICULTY_RATING_STEP = 500;
const RATING_TARGET_OFFSET = 100;
const DEFAULT_VISIBLE_TOPIC_COUNT = 1;
const FULL_PERCENT = 100;
const META_TOUGH_START_HEALTH = 5;
const META_COIN_PURSE_GOLD = 15;
const META_RELIC_CHOICE_BONUS_CAP = 2;
export const MODIFIER_KEYS: ItemModifierKey[] = ALL_MODIFIER_KEYS;

export const HINT_COST = 10;
export const HINT_COST_INCREMENT = 10;
export const HINT_MAX_COST = 30;
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
export const DEFAULT_ITEM_MODIFIERS = Object.fromEntries(MODIFIER_KEYS.map((key) => [key, 0])) as Record<ItemModifierKey, number>;

export const difficultyLabels: Record<Question["difficulty"], string> = { 1: "Easy", 2: "Easy+", 3: "Medium", 4: "Medium+", 5: "Hard" };

export const getQuestionTimeLimitMs = (question: Question) => {
  return QUESTION_TIME_LIMIT_MINUTES[question.difficulty] * MS_PER_MINUTE;
};

export const getModifiedQuestionTimeLimitMs = (state: StudyState, question: Question) => {
  const modifiers = getRunModifierTotals(state);
  const timerPauseSeconds = Math.max(0, Math.floor(modifiers.timerPauseSeconds || 0));
  const timerPenalty = Math.min(80, Math.max(0, modifiers.timerPenaltyPercent || 0));
  return Math.max(MS_PER_MINUTE, Math.round(getQuestionTimeLimitMs(question) * (1 - timerPenalty / PERCENT)) + timerPauseSeconds * MS_PER_SECOND);
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
      mana: 0,
      rating: DEFAULT_PLAYER_RATING,
      godMode: false,
      statPoints: 0,
      statPointsAwardedLevel: FIRST_STAT_LEVEL,
      hintsBought: 0,
      startedAt: Date.now(),
      lastStudiedAt: null,
      stats: { ...DEFAULT_CHARACTER_STATS },
      skillRanks: {},
      activeSkill: null,
      activePotionEffects: [],
      inventory: [],
      inventorySlots: {},
      equipment: defaultEquipment(),
      metaProgress: createDefaultMetaProgress(),
      shopLastRefreshedAt: null,
      shopStock: [],
      relics: [],
      spireRun: createSpireRun(),
      unlockedAchievementIds: []
    },
    cards: {}
  };
}

export const defaultCard = (): CardState => ({ dueAt: 0, intervalDays: 0, ease: 2.4, reps: 0, attempts: 0, correct: 0, failedSubmissions: 0, hintsBought: 0, lastResult: null, relicFirstHitBlocked: false, relicReviveUsed: false });

export const cloneState = (state: StudyState): StudyState => ({
  ...state,
  profile: cloneProfile(state),
  cards: Object.fromEntries(Object.entries(state.cards).map(([id, card]) => [id, { ...card }]))
});

function cloneProfile(state: StudyState): StudyState["profile"] {
  return { ...state.profile, activeSkill: state.profile.activeSkill ?? null, activePotionEffects: cloneActivePotionEffects(state.profile.activePotionEffects), equipment: { ...state.profile.equipment }, inventory: state.profile.inventory.map(cloneInventoryItem), inventorySlots: cloneInventorySlots(state.profile.inventorySlots), metaProgress: { ...state.profile.metaProgress, upgrades: { ...state.profile.metaProgress.upgrades } }, relics: state.profile.relics.map((relic) => ({ ...relic, modifiers: relic.modifiers?.map((modifier) => ({ ...modifier })) })), shopStock: state.profile.shopStock.map((item) => ({ ...item })), skillRanks: { ...state.profile.skillRanks }, spireRun: { ...state.profile.spireRun, availableNodeIds: [...state.profile.spireRun.availableNodeIds], completedNodeIds: [...state.profile.spireRun.completedNodeIds], nodes: state.profile.spireRun.nodes.map((node) => ({ ...node, nextIds: [...node.nextIds] })), pendingRelicReward: cloneRelicRewardChoice(state.profile.spireRun.pendingRelicReward), roomRewardClaims: cloneRoomRewardClaims(state.profile.spireRun.roomRewardClaims), roundQuestionIds: [...state.profile.spireRun.roundQuestionIds], roundSolvedIds: [...state.profile.spireRun.roundSolvedIds], runCodeQuestionIds: [...state.profile.spireRun.runCodeQuestionIds], unknownEncounterMisses: { ...state.profile.spireRun.unknownEncounterMisses } }, stats: { ...state.profile.stats } };
}

function cloneRelicRewardChoice(choice: StudyState["profile"]["spireRun"]["pendingRelicReward"]) {
  if (!choice) {
    return null;
  }
  return { ...choice, choices: choice.choices.map((relic) => ({ ...relic, modifiers: relic.modifiers?.map((modifier) => ({ ...modifier })) })) };
}

function cloneRoomRewardClaims(claims: StudyState["profile"]["spireRun"]["roomRewardClaims"]) {
  return Object.fromEntries(Object.entries(claims || {}).map(([nodeId, claim]) => [nodeId, { ...claim, itemIds: [...(claim.itemIds || [])], relicIds: [...(claim.relicIds || [])] }]));
}

function cloneActivePotionEffects(effects: ActivePotionEffect[] | undefined) {
  return (effects || []).map((effect) => ({ ...effect, modifiers: effect.modifiers.map((modifier) => ({ ...modifier })), stats: { ...effect.stats } }));
}

function cloneInventoryItem(item: InventoryItem) {
  return { ...item, modifiers: item.modifiers?.map((modifier) => ({ ...modifier })), stats: { ...item.stats } };
}

function cloneInventorySlots(slots: Record<string, InventoryItemPosition>) {
  return Object.fromEntries(Object.entries(slots || {}).map(([itemId, position]) => [itemId, { ...position }]));
}

// eslint-disable-next-line complexity
export const normalizeStudyState = (stored: Partial<StudyState> | null | undefined): StudyState => {
  const fallback = defaultState();
  if (!stored?.cards) {
    return fallback;
  }
  const profile: Partial<StudyState["profile"]> = stored.profile || {};

  const inventory: InventoryItem[] = [];
  const normalized = {
    ...fallback,
    ...stored,
    profile: {
      ...fallback.profile,
      ...profile,
      godMode: Boolean(profile.godMode),
      experience: 0,
      rating: normalizeRating(stored, fallback),
      statPoints: 0,
      statPointsAwardedLevel: FIRST_STAT_LEVEL,
      stats: normalizeCharacterStats(profile.stats),
      skillRanks: normalizeWarriorSkillRanks(profile.skillRanks),
      activeSkill: profile.activeSkill ?? null,
      activePotionEffects: normalizeActivePotionEffects(profile.activePotionEffects),
      inventory,
      inventorySlots: {},
      equipment: defaultEquipment(),
      metaProgress: normalizeMetaProgress(profile.metaProgress),
      shopLastRefreshedAt: profile.shopLastRefreshedAt ?? fallback.profile.shopLastRefreshedAt,
      shopStock: normalizeShopStock(profile.shopStock),
      relics: normalizeRelics(profile.relics),
      spireRun: normalizeSpireRun(profile.spireRun),
      unlockedAchievementIds: normalizeUnlockedAchievementIds(profile.unlockedAchievementIds)
    },
    cards: normalizeCards(stored.cards)
  };
  const bounded = {
    ...normalized,
    profile: {
      ...normalized.profile,
      health: Math.min(getMaxHealth(normalized), Math.max(0, profile.health ?? fallback.profile.health)),
      mana: 0
    }
  };
  const stocked = {
    ...bounded,
    profile: {
      ...bounded.profile,
      shopStock: bounded.profile.shopStock.length ? bounded.profile.shopStock : createStarterShopStock()
    }
  };
  return stocked;
};

function createStarterShopStock() {
  return createShopStock(questions[0], DEFAULT_CHARACTER_STATS, STARTER_SHOP_REFRESH_AT, { maxItemLevel: FIRST_STAT_LEVEL });
}

function normalizeCharacterStats(stats: Partial<CharacterStats> | undefined): CharacterStats { return { strength: normalizeStat(stats?.strength), constitution: normalizeStat(stats?.constitution), perception: normalizeStat(stats?.perception), intelligence: normalizeStat(stats?.intelligence) }; }

function defaultEquipment(): Record<EquipmentSlot, string | null> { return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot, null])) as Record<EquipmentSlot, string | null>; }

function normalizeInventory(items: InventoryItem[] | undefined) {
  return (items || []).map((item) => ({ ...item, modifiers: normalizeItemModifiers(item.modifiers), requirements: item.requirements || { level: FIRST_STAT_LEVEL, stats: {} }, stats: { ...item.stats } }));
}

function normalizeInventorySlots(slots: Record<string, InventoryItemPosition> | undefined, inventory: InventoryItem[]) {
  const itemIds = new Set(inventory.map((item) => item.id));
  return Object.fromEntries(Object.entries(slots || {}).filter(([itemId, position]) => itemIds.has(itemId) && isFiniteInventoryPosition(position)).map(([itemId, position]) => [itemId, normalizeInventoryPosition(position)]));
}

function isFiniteInventoryPosition(position: InventoryItemPosition | undefined) {
  return Boolean(position) && Number.isFinite(position?.tab) && Number.isFinite(position?.row) && Number.isFinite(position?.column);
}

function normalizeInventoryPosition(position: InventoryItemPosition) {
  return {
    column: Math.max(0, Math.floor(position.column)),
    row: Math.max(0, Math.floor(position.row)),
    tab: Math.max(0, Math.floor(position.tab))
  };
}

function normalizeEquipment(equipment: Partial<Record<EquipmentSlot, string | null>> | undefined) { return { ...defaultEquipment(), ...(equipment || {}) }; }

function normalizeUnlockedAchievementIds(ids: string[] | undefined) { return [...new Set(ids || [])]; }

function normalizeMetaProgress(progress: Partial<StudyState["profile"]["metaProgress"]> | undefined): StudyState["profile"]["metaProgress"] {
  const fallback = createDefaultMetaProgress();
  return {
    currency: Math.max(0, Math.floor(progress?.currency || 0)),
    totalEarned: Math.max(0, Math.floor(progress?.totalEarned || 0)),
    upgrades: {
      coinPurse: normalizeMetaUpgradeRank(progress?.upgrades?.coinPurse, fallback.upgrades.coinPurse),
      relicChoice: normalizeMetaUpgradeRank(progress?.upgrades?.relicChoice, fallback.upgrades.relicChoice),
      toughStart: normalizeMetaUpgradeRank(progress?.upgrades?.toughStart, fallback.upgrades.toughStart)
    }
  };
}

function createDefaultMetaProgress(): StudyState["profile"]["metaProgress"] {
  return { currency: 0, totalEarned: 0, upgrades: { coinPurse: 0, relicChoice: 0, toughStart: 0 } };
}

function normalizeMetaUpgradeRank(value: number | undefined, fallback: number) {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value || 0 : fallback));
}

function normalizeRating(stored: Partial<StudyState>, fallback: StudyState) {
  return Number.isFinite(stored.profile?.rating) ? Math.max(DEFAULT_PLAYER_RATING, Math.round(stored.profile?.rating || DEFAULT_PLAYER_RATING)) : getEstimatedRating({ ...fallback, ...stored, profile: { ...fallback.profile, ...(stored.profile || {}) }, cards: stored.cards || {} });
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

function normalizeActivePotionEffects(effects: ActivePotionEffect[] | undefined) {
  return (effects || [])
    .filter((effect) => effect.id && effect.name && Number.isFinite(effect.roomsRemaining) && effect.roomsRemaining > 0)
    .map((effect) => ({
      ...effect,
      modifiers: normalizeItemModifiers(effect.modifiers),
      roomsRemaining: Math.max(1, Math.floor(effect.roomsRemaining)),
      stats: normalizePartialStats(effect.stats)
    }));
}

function normalizePartialStats(stats: Partial<CharacterStats> | undefined) {
  return Object.fromEntries(Object.entries(stats || {}).filter(([key, value]) => key in DEFAULT_CHARACTER_STATS && Number.isFinite(value))) as Partial<CharacterStats>;
}

function normalizeCards(cards: StudyState["cards"] | undefined) {
  return Object.fromEntries(Object.entries(cards || {}).map(([id, card]) => [id, { ...defaultCard(), ...card, failedSubmissions: Math.max(0, card.failedSubmissions || 0), hintsBought: Math.max(0, card.hintsBought || 0), relicFirstHitBlocked: Boolean(card.relicFirstHitBlocked), relicReviveUsed: Boolean(card.relicReviveUsed) }]));
}

export const getCard = (state: StudyState, questionId: string): CardState => {
  return state.cards[questionId] || defaultCard();
};

export const setCard = (state: StudyState, questionId: string, card: CardState) => {
  state.cards[questionId] = card;
};

export const isMasteredCard = (card: CardState) => card.correct > 0;

export const getEffectiveCharacterStats = (state: StudyState): CharacterStats => {
  const potionStats = getActivePotionStats(state);
  return {
    strength: state.profile.stats.strength + potionStats.strength,
    constitution: state.profile.stats.constitution + potionStats.constitution,
    perception: state.profile.stats.perception + potionStats.perception,
    intelligence: state.profile.stats.intelligence + potionStats.intelligence
  };
};

export const getEquippedItems = (state: StudyState) => {
  return [] as InventoryItem[];
};

export const getEquipmentStats = (state: StudyState): CharacterStats => {
  return { strength: 0, constitution: 0, perception: 0, intelligence: 0 };
};

export const getEquipmentModifierTotals = (state: StudyState) => {
  return { ...DEFAULT_ITEM_MODIFIERS };
};

export const getRunModifierTotals = (state: StudyState) => addModifierRecords(addModifierRecords(getEquipmentModifierTotals(state), getRelicModifierTotals(state)), getActivePotionModifierTotals(state));

export const getElementalResistances = (state: StudyState) => applyDifficultyResistancePenalty(getResistancesFromModifiers(addSkillResistances(getRunModifierTotals(state), getWarriorSkillBonusTotals(state))), getSpireDifficultyModifiers(state.profile.spireRun).resistancePenalty);

export const getWarriorSkillBonusTotals = (state: StudyState) => getWarriorSkillBonuses(state.profile.skillRanks);

export const markQuestionRunCode = (state: StudyState, questionId: string): StudyState => {
  if (!questionId || state.profile.spireRun.runCodeQuestionIds.includes(questionId)) {
    return state;
  }
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        runCodeQuestionIds: [...state.profile.spireRun.runCodeQuestionIds, questionId]
      }
    }
  };
};

function getEquippedItemStats(state: StudyState): CharacterStats {
  return getEquippedItems(state).reduce((stats, item) => addStats(stats, item.stats), { strength: 0, constitution: 0, perception: 0, intelligence: 0 });
}

function getActivePotionStats(state: StudyState): CharacterStats {
  return (state.profile.activePotionEffects || []).reduce((stats, effect) => addStats(stats, effect.stats), { strength: 0, constitution: 0, perception: 0, intelligence: 0 });
}

function getActivePotionModifierTotals(state: StudyState) {
  return (state.profile.activePotionEffects || []).reduce((totals, effect) => addModifierTotals(totals, effect.modifiers), { ...DEFAULT_ITEM_MODIFIERS });
}

export const getActiveSetBonuses = (state: StudyState): ReturnType<typeof getActiveSetBonusesForItems> => {
  return [];
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
    next[modifier.key] = (next[modifier.key] || 0) + modifier.value;
  }
  return next;
}

function addModifierRecords(base: Record<ItemModifierKey, number>, modifiers: Record<ItemModifierKey, number>) {
  const next = { ...base };
  for (const [key, value] of Object.entries(modifiers)) {
    const modifierKey = key as ItemModifierKey;
    next[modifierKey] = (next[modifierKey] || 0) + value;
  }
  return next;
}

function addSkillResistances(modifiers: Record<ItemModifierKey, number>, skills: ReturnType<typeof getWarriorSkillBonusTotals>) {
  return {
    ...modifiers,
    coldResistPercent: modifiers.coldResistPercent + skills.coldResistPercent,
    fireResistPercent: modifiers.fireResistPercent + skills.fireResistPercent,
    lightningResistPercent: modifiers.lightningResistPercent + skills.lightningResistPercent,
    poisonResistPercent: modifiers.poisonResistPercent + skills.poisonResistPercent
  };
}

function applyDifficultyResistancePenalty(resistances: ReturnType<typeof getResistancesFromModifiers>, penalty: number) {
  return {
    cold: clampPenalizedResistance(resistances.cold + penalty),
    fire: clampPenalizedResistance(resistances.fire + penalty),
    lightning: clampPenalizedResistance(resistances.lightning + penalty),
    poison: clampPenalizedResistance(resistances.poison + penalty)
  };
}

function clampPenalizedResistance(value: number) {
  return Math.min(75, Math.max(-100, Math.round(value || 0)));
}

function applyPercentBonus(value: number, bonusPercent: number) {
  return Math.round(value * (1 + bonusPercent / MODIFIER_PERCENT_BASE));
}

function applyPercentReduction(value: number, reductionPercent: number) {
  return value * (1 - Math.min(95, Math.max(0, reductionPercent || 0)) / MODIFIER_PERCENT_BASE);
}

export const getMaxHealth = (state: StudyState) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getRunModifierTotals(state);
  const skills = getWarriorSkillBonusTotals(state);
  return MAX_HEALTH + getMetaMaxHealthBonus(state) + (stats.constitution - FIRST_STAT_LEVEL) * HEALTH_PER_CONSTITUTION + modifiers.maxLife + skills.maxLife;
};

export const getMetaStartingGoldBonus = (state: StudyState) => Math.max(0, state.profile.metaProgress.upgrades.coinPurse || 0) * META_COIN_PURSE_GOLD;

export const getMetaMaxHealthBonus = (state: StudyState) => Math.max(0, state.profile.metaProgress.upgrades.toughStart || 0) * META_TOUGH_START_HEALTH;

export const getMetaRelicChoiceBonus = (state: StudyState) => Math.min(META_RELIC_CHOICE_BONUS_CAP, Math.max(0, state.profile.metaProgress.upgrades.relicChoice || 0));

export type MetaUpgradeId = keyof StudyState["profile"]["metaProgress"]["upgrades"];

export type MetaUpgradeDefinition = {
  description: string;
  id: MetaUpgradeId;
  label: string;
  maxRank: number;
};

export const META_UPGRADE_DEFINITIONS: MetaUpgradeDefinition[] = [
  { description: `Start each run with +${META_TOUGH_START_HEALTH} max health per rank.`, id: "toughStart", label: "Tough Start", maxRank: 5 },
  { description: `Start each run with +${META_COIN_PURSE_GOLD} gold per rank.`, id: "coinPurse", label: "Coin Purse", maxRank: 4 },
  { description: "Relic rewards show one extra choice per rank.", id: "relicChoice", label: "Wider Offerings", maxRank: META_RELIC_CHOICE_BONUS_CAP }
];

export function getMetaUpgradeDefinition(id: MetaUpgradeId) {
  return META_UPGRADE_DEFINITIONS.find((definition) => definition.id === id) || META_UPGRADE_DEFINITIONS[0];
}

export function getMetaUpgradeCost(state: StudyState, id: MetaUpgradeId) {
  const rank = state.profile.metaProgress.upgrades[id] || 0;
  if (id === "toughStart") {
    return 8 + rank * 6;
  }
  if (id === "coinPurse") {
    return 6 + rank * 5;
  }
  return 14 + rank * 10;
}

export function canPurchaseMetaUpgrade(state: StudyState, id: MetaUpgradeId) {
  const definition = getMetaUpgradeDefinition(id);
  return (state.profile.metaProgress.upgrades[id] || 0) < definition.maxRank && state.profile.metaProgress.currency >= getMetaUpgradeCost(state, id);
}

export function purchaseMetaUpgrade(state: StudyState, id: MetaUpgradeId): StudyState {
  if (!canPurchaseMetaUpgrade(state, id)) {
    return state;
  }
  const cost = getMetaUpgradeCost(state, id);
  const next = cloneState(state);
  next.profile.metaProgress.currency -= cost;
  next.profile.metaProgress.upgrades[id] = (next.profile.metaProgress.upgrades[id] || 0) + 1;
  next.profile.health = Math.min(getMaxHealth(next), next.profile.health);
  return next;
}

export const getMaxMana = (state: StudyState) => {
  return 0;
};

export const getHealthLoss = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL, element?: DamageType | null) => {
  if (state.profile.godMode) {
    return 0;
  }
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getRunModifierTotals(state);
  const skills = getWarriorSkillBonusTotals(state);
  const difficultyModifiers = getSpireDifficultyModifiers(state.profile.spireRun);
  const incomingDamageMultiplier = 1 + (modifiers.incomingDamagePercent || 0) / MODIFIER_PERCENT_BASE;
  const scaledAmount = amount * difficultyModifiers.monsterDamageMultiplier * Math.max(0.1, incomingDamageMultiplier);
  const reducedEnemyDamage = scaledAmount * (1 - Math.min(75, Math.max(0, modifiers.reducedEnemyDamagePercent || 0)) / MODIFIER_PERCENT_BASE);
  const physicalResistedAmount = element === "physical"
    ? applyPercentReduction(reducedEnemyDamage, modifiers.physicalResistPercent)
    : reducedEnemyDamage;
  const resistedAmount = applyElementalResistance(physicalResistedAmount, element, applyDifficultyResistancePenalty(getResistancesFromModifiers(addSkillResistances(modifiers, skills)), difficultyModifiers.resistancePenalty));
  const avoidance = Math.min(60, (modifiers.dodgeChancePercent || 0) + (modifiers.blockChancePercent || 0) + (modifiers.parryChancePercent || 0));
  const avoidedAmount = applyPercentReduction(resistedAmount, avoidance);
  const defense = Math.floor(stats.constitution / CONSTITUTION_LEVEL_INTERVAL) * DEFENSE_PER_THREE_CONSTITUTION;
  return Math.max(1, Math.round(avoidedAmount) - defense - (modifiers.armor || 0) - modifiers.damageReduction - skills.damageReduction);
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
  const modifiers = getRunModifierTotals(state);
  const skills = getWarriorSkillBonusTotals(state);
  const baseDamage = question.difficulty * DAMAGE_PER_DIFFICULTY + stats.strength * DAMAGE_PER_STRENGTH + (modifiers.physicalDamage || 0);
  const eliteBonus = getUniqueMonsterBonuses(question).length ? modifiers.bonusDamageVsElitesPercent || 0 : 0;
  const healthRatio = state.profile.health / Math.max(1, getMaxHealth(state));
  const lowHealthBonus = healthRatio <= 0.35 ? modifiers.bonusDamageWhileLowHealthPercent || 0 : 0;
  const fullHealthBonus = healthRatio >= 1 ? modifiers.bonusDamageWhileFullHealthPercent || 0 : 0;
  return applyPercentBonus(baseDamage, modifiers.enhancedDamagePercent + skills.enhancedDamagePercent + eliteBonus + lowHealthBonus + fullHealthBonus);
};

export const getCriticalChance = (state: StudyState) => {
  const modifiers = getRunModifierTotals(state);
  const skills = getWarriorSkillBonusTotals(state);
  return Math.min(MAX_CRITICAL_CHANCE, BASE_CRITICAL_CHANCE + (modifiers.criticalChancePercent + modifiers.accuracyPercent + skills.criticalChancePercent) / MODIFIER_PERCENT_BASE);
};

export const getCriticalDamageMultiplier = (state: StudyState) => {
  const modifiers = getRunModifierTotals(state);
  return 2 + (modifiers.criticalDamagePercent || 0) / MODIFIER_PERCENT_BASE;
};

export const getHealingMultiplier = (state: StudyState) => {
  const modifiers = getRunModifierTotals(state);
  return Math.max(0.1, 1 + (modifiers.increasedHealingReceivedPercent || 0) / MODIFIER_PERCENT_BASE);
};

export const applyHealingReceived = (state: StudyState, amount: number) => Math.max(0, Math.round(amount * getHealingMultiplier(state)));

export const getCoinReward = (question: Question, state?: StudyState) => {
  const baseReward = question.difficulty * COINS_PER_DIFFICULTY;
  if (!state) {
    return baseReward;
  }
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getRunModifierTotals(state);
  const skills = getWarriorSkillBonusTotals(state);
  const difficultyReward = getSpireDifficultyModifiers(state.profile.spireRun).rewardMultiplier;
  return applyPercentBonus(Math.round(baseReward * difficultyReward * (1 + (stats.perception - FIRST_STAT_LEVEL) * GOLD_BONUS_PER_PERCEPTION)), modifiers.goldFindPercent + skills.goldFindPercent);
};

export const getExperienceReward = (question: Question, state?: StudyState) => {
  return 0;
};

export const getManaReward = (question: Question, state: StudyState) => {
  return 0;
};

export const getLevelProgress = (state: StudyState) => {
  return {
    level: FIRST_STAT_LEVEL,
    currentExperience: 0,
    nextLevelExperience: 1
  };
};

export function getLevelExperienceRequirement(level: number) {
  const normalizedLevel = Math.max(FIRST_STAT_LEVEL, Math.floor(level || FIRST_STAT_LEVEL));
  const levelOffset = normalizedLevel - FIRST_STAT_LEVEL;
  return EXPERIENCE_PER_LEVEL + levelOffset * 45 + levelOffset * levelOffset * 5;
}

export const grantPendingStatPoints = (state: StudyState): StudyState => {
  return state;
};

export const spendStatPoint = (state: StudyState, stat: CharacterStatKey): StudyState => {
  if (state.profile.statPoints <= 0) {
    return state;
  }
  const next = cloneState(state);
  next.profile.statPoints -= 1;
  next.profile.stats[stat] += 1;
  next.profile.health = Math.min(next.profile.health, getMaxHealth(next));
  return next;
};

export const equipItem = (state: StudyState, itemId: string): StudyState => {
  const item = state.profile.inventory.find((row) => row.id === itemId);
  if (!item || !canEquipItem(state, item)) {
    return state;
  }
  return equipItemToSlot(state, itemId, getPreferredEquipSlot(state, item));
};

export const equipItemToSlot = (state: StudyState, itemId: string, slot: EquipmentSlot): StudyState => {
  const item = state.profile.inventory.find((row) => row.id === itemId);
  if (!item || !canEquipItem(state, item) || !getCompatibleEquipSlots(item).includes(slot)) {
    return state;
  }
  const next = cloneState(state);
  for (const equippedSlot of EQUIPMENT_SLOTS) {
    if (next.profile.equipment[equippedSlot] === item.id) {
      next.profile.equipment[equippedSlot] = null;
    }
  }
  next.profile.equipment[slot] = item.id;
  next.profile.health = Math.min(next.profile.health, getMaxHealth(next));
  return next;
};

export const unequipItem = (state: StudyState, slot: EquipmentSlot): StudyState => {
  if (!state.profile.equipment[slot]) { return state; }
  const next = cloneState(state);
  next.profile.equipment[slot] = null;
  next.profile.health = Math.min(next.profile.health, getMaxHealth(next));
  return next;
};

export const discardItem = (state: StudyState, itemId: string): StudyState => {
  if (!state.profile.inventory.some((item) => item.id === itemId)) {
    return state;
  }
  const next = cloneState(state);
  next.profile.inventory = next.profile.inventory.filter((item) => item.id !== itemId);
  delete next.profile.inventorySlots[itemId];
  for (const slot of EQUIPMENT_SLOTS) {
    if (next.profile.equipment[slot] === itemId) {
      next.profile.equipment[slot] = null;
    }
  }
  next.profile.health = Math.min(next.profile.health, getMaxHealth(next));
  return next;
};

export const getItemSellValue = (item: InventoryItem) => {
  const rarityValue: Record<InventoryItem["rarity"], number> = {
    common: 4,
    epic: 45,
    legendary: 70,
    rare: 26,
    uncommon: 12
  };
  const statTotal = Object.values(item.stats).reduce((sum, value) => sum + (value || 0), 0);
  const modifierTotal = (item.modifiers || []).reduce((sum, modifier) => sum + Math.max(1, Math.ceil(Math.abs(modifier.value) / 4)), 0);
  const levelValue = Math.max(1, Math.ceil(item.requirements.level / 2));
  return Math.max(1, rarityValue[item.rarity] + levelValue + statTotal * 3 + modifierTotal);
};

export const sellItem = (state: StudyState, itemId: string): StudyState => {
  const item = state.profile.inventory.find((row) => row.id === itemId);
  if (!item || Object.values(state.profile.equipment).includes(itemId)) {
    return state;
  }
  const next = discardItem(state, itemId);
  return {
    ...next,
    profile: {
      ...next.profile,
      coins: next.profile.coins + getItemSellValue(item)
    }
  };
};

export const bulkSellItems = (state: StudyState, itemIds: string[]): StudyState => {
  const ids = new Set(itemIds);
  if (!ids.size) {
    return state;
  }
  const equippedIds = new Set(Object.values(state.profile.equipment).filter(Boolean));
  const soldItems = state.profile.inventory.filter((item) => ids.has(item.id) && !equippedIds.has(item.id));
  if (!soldItems.length) {
    return state;
  }
  const soldIds = new Set(soldItems.map((item) => item.id));
  const next = cloneState(state);
  next.profile.coins += soldItems.reduce((sum, item) => sum + getItemSellValue(item), 0);
  next.profile.inventory = next.profile.inventory.filter((item) => !soldIds.has(item.id));
  for (const itemId of soldIds) {
    delete next.profile.inventorySlots[itemId];
  }
  return next;
};

export const moveInventoryItem = (state: StudyState, itemId: string, position: InventoryItemPosition): StudyState => {
  if (!state.profile.inventory.some((item) => item.id === itemId)) {
    return state;
  }
  const next = cloneState(state);
  next.profile.inventorySlots[itemId] = normalizeInventoryPosition(position);
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

function getPreferredEquipSlot(state: StudyState, item: InventoryItem): EquipmentSlot {
  const compatibleSlots = getCompatibleEquipSlots(item);
  return compatibleSlots.find((slot) => !state.profile.equipment[slot]) || compatibleSlots[0];
}

function getCompatibleEquipSlots(item: InventoryItem): EquipmentSlot[] {
  if (item.slot === "eyewear" || item.slot === "ringTwo") {
    return ["eyewear", "ringTwo"];
  }
  return [item.slot];
}

export const getQuestionDrop = (question: Question, state: StudyState, now = Date.now()): InventoryItem | null => {
  return null;
};

export function getRewardItemLevelCap(state: StudyState) {
  return getLevelProgress(state).level;
}

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

export const applyHealthPenalty = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, draft?: string, now = Date.now(), element?: DamageType | null): StudyState => {
  const next = cloneState(state);
  applyIncomingDamageToState(next, state, amount, manaDamage, questionId, element);
  if (questionId) {
    applyFailedRating(next, questionId, draft, now);
  }
  return next;
};

export const getIncomingDamageEffect = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, element?: DamageType | null) => {
  const healthLoss = getHealthLoss(state, amount, element);
  const manaLoss = 0;
  const card = questionId ? getCard(state, questionId) : null;
  const modifiers = getRunModifierTotals(state);
  const blocked = Boolean(card && !card.relicFirstHitBlocked && (modifiers.blockFirstHit || 0) > 0 && (healthLoss > 0 || manaLoss > 0));
  if (blocked) {
    return { blocked, healthLoss: 0, manaLoss: 0, revived: false, reviveHealth: 0 };
  }
  const revivePercent = Math.max(0, modifiers.revivePercent || 0);
  const reviveHealth = card && !card.relicReviveUsed && revivePercent > 0 && healthLoss >= state.profile.health
    ? Math.max(1, Math.round(getMaxHealth(state) * Math.min(FULL_PERCENT, revivePercent) / FULL_PERCENT))
    : 0;
  return { blocked, healthLoss, manaLoss, revived: reviveHealth > 0, reviveHealth };
};

export const applyIncomingDamage = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, element?: DamageType | null) => {
  const next = cloneState(state);
  const effect = applyIncomingDamageToState(next, state, amount, manaDamage, questionId, element);
  return { ...effect, state: next };
};

function applyIncomingDamageToState(next: StudyState, sourceState: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, element?: DamageType | null) {
  const effect = getIncomingDamageEffect(sourceState, amount, manaDamage, questionId, element);
  if (questionId && (effect.blocked || effect.revived)) {
    const card = { ...getCard(next, questionId) };
    card.relicFirstHitBlocked = card.relicFirstHitBlocked || effect.blocked;
    card.relicReviveUsed = card.relicReviveUsed || effect.revived;
    setCard(next, questionId, card);
  }
  if (effect.blocked) {
    return effect;
  }
  next.profile.health = effect.revived ? effect.reviveHealth : Math.max(0, next.profile.health - effect.healthLoss);
  next.profile.mana = 0;
  return effect;
}

export const getHintCost = (state: StudyState, questionId?: string) => {
  const cardHintsBought = questionId ? getCard(state, questionId).hintsBought : 0;
  const freeHints = Math.max(0, Math.floor(getRunModifierTotals(state).freeHintPerRoom || 0));
  if (questionId && cardHintsBought < freeHints) {
    return 0;
  }
  return Math.min(HINT_MAX_COST, HINT_COST + cardHintsBought * HINT_COST_INCREMENT);
};

export const canBuyHint = (state: StudyState, questionId?: string) => state.profile.coins >= getHintCost(state, questionId);

export const buyHint = (state: StudyState, questionId?: string) => {
  if (!canBuyHint(state, questionId)) {
    return state;
  }
  const next = cloneState(state);
  const cost = getHintCost(next, questionId);
  next.profile.coins -= cost;
  next.profile.hintsBought += 1;
  if (questionId) {
    setCard(next, questionId, { ...getCard(next, questionId), hintsBought: getCard(next, questionId).hintsBought + 1 });
  }

  return next;
};

export const getVisibleQuestionTopics = (state: StudyState, question: Question) => {
  const extraTopics = Math.max(0, Math.floor(getRunModifierTotals(state).revealTopicCount || 0));
  return question.topics.slice(0, Math.min(question.topics.length, DEFAULT_VISIBLE_TOPIC_COUNT + extraTopics));
};

export const getRecommendedDifficulty = (state: StudyState) => {
  return Math.min(MAX_DIFFICULTY, Math.max(1, Math.floor((getEstimatedRating(state) - DEFAULT_PLAYER_RATING) / DIFFICULTY_RATING_STEP) + 1)) as Question["difficulty"];
};

export const getDueQuestions = (_state: StudyState, _now = Date.now()) => [] as Question[];

export const pickQuestion = (state: StudyState, currentQuestion: Question | null, preferNext = false, _now = Date.now()) => {
  const recommended = getRecommendedDifficulty(state);
  const ratingLimit = getEstimatedRating(state) + (preferNext ? NEXT_QUESTION_RATING_BUFFER : QUESTION_RATING_BUFFER);
  const currentIndex = currentQuestion ? questions.findIndex((question) => question.id === currentQuestion.id) : MISSING_INDEX;
  const sorted = getRatingSortedQuestions(state);
  const withinRatingLimit = sorted.filter((question) => question.rating <= ratingLimit);
  const unseenWithinLevel = questions.filter((question) => {
    const card = getCard(state, question.id);
    return card.attempts === 0 && isQuestionRecommended(question, recommended, ratingLimit);
  });

  let picked = unseenWithinLevel[0] || withinRatingLimit[0] || sorted[0];
  if (preferNext) {
    const nextInOrder = questions
      .slice(currentIndex + 1)
      .concat(questions.slice(0, Math.max(0, currentIndex + 1)))
      .find((question) => question.id !== currentQuestion?.id && isQuestionRecommended(question, (recommended + 1) as Question["difficulty"], ratingLimit));
    picked = nextInOrder || picked;
  }

  return picked || sorted[0];
};

function getRatingSortedQuestions(state: StudyState) {
  const targetRating = getEstimatedRating(state) + RATING_TARGET_OFFSET;
  return [...questions].sort((a, b) => {
    const cardA = getCard(state, a.id);
    const cardB = getCard(state, b.id);
    return cardA.correct - cardB.correct || Math.abs(a.rating - targetRating) - Math.abs(b.rating - targetRating) || a.rating - b.rating;
  });
}

export const isQuestionInRecommendedRange = (state: StudyState, question: Question, preferNext = false) => {
  const recommended = getRecommendedDifficulty(state);
  const ratingLimit = getEstimatedRating(state) + (preferNext ? NEXT_QUESTION_RATING_BUFFER : QUESTION_RATING_BUFFER);
  return isQuestionRecommended(question, Math.min(MAX_DIFFICULTY, recommended + (preferNext ? 1 : 0)) as Question["difficulty"], ratingLimit);
};

function isQuestionRecommended(question: Question, maxDifficulty: Question["difficulty"], ratingLimit: number) {
  return question.difficulty <= maxDifficulty && question.rating <= ratingLimit;
}

export const getProfileStats = (state: StudyState, now = Date.now()) => {
  const attempted = questions.filter((question) => getCard(state, question.id).attempts > 0).length;
  const solved = questions.filter((question) => getCard(state, question.id).correct > 0).length;
  const mastered = questions.filter((question) => isMasteredCard(getCard(state, question.id))).length;
  const due = getDueQuestions(state, now).length;
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

export const applyScheduleResult = (state: StudyState, questionId: string, passed: boolean, draft: string, now = Date.now(), failureDamage = HEALTH_LOSS_PER_FAIL, failureManaDamage = 0, failureElement?: DamageType | null) => {
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
    applyFailedSchedule(next, card, questionId, state, now, failureDamage, failureManaDamage, failureElement);
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
  if (question) {
    next.profile.rating = applyEloResult(getEstimatedRating(next), question.rating, true, card.failedSubmissions);
  }
  applyQuestionRewards(next, question);
  applyQuestionDrop(next, question, state, now);
  applyShopRefresh(next, question, now);
  card.intervalDays = 0;
  card.dueAt = 0;
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
  const modifiers = getRunModifierTotals(next);
  next.profile.health = Math.min(getMaxHealth(next), next.profile.health + applyHealingReceived(next, (modifiers.lifeOnKill || 0) + (modifiers.healthRegen || 0) + getWarriorSkillBonusTotals(next).lifeOnKill));
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
  next.profile.shopStock = createShopStock(question, getEffectiveCharacterStats(next), now, { extraRelicStock: getRunModifierTotals(next).shopRelicStock, maxItemLevel: getRewardItemLevelCap(next) });
  next.profile.shopLastRefreshedAt = now;
}

function applyFailedSchedule(next: StudyState, card: CardState, questionId: string, state: StudyState, now: number, failureDamage: number, failureManaDamage: number, failureElement?: DamageType | null) {
  applyIncomingDamageToState(next, state, failureDamage, failureManaDamage, questionId, failureElement);
  applyRelicFailureStack(next, questionId);
  const damageCard = getCard(next, questionId);
  card.relicFirstHitBlocked = damageCard.relicFirstHitBlocked;
  card.relicReviveUsed = damageCard.relicReviveUsed;
  next.streak = 0;
  card.failedSubmissions += 1;
  card.intervalDays = 0;
  card.dueAt = 0;
  next.profile.rating = getFailedQuestionRating(next, questionId, card);
}

function applyFailedRating(next: StudyState, questionId: string, draft: string | undefined, now: number) {
  const card = { ...getCard(next, questionId) };
  card.attempts += 1;
  card.failedSubmissions += 1;
  card.lastResult = "fail";
  card.lastAttemptAt = now;
  card.draft = draft ?? card.draft;
  next.streak = 0;
  next.profile.lastStudiedAt = now;
  next.profile.rating = getFailedQuestionRating(next, questionId, card);
  applyRelicFailureStack(next, questionId);
  setCard(next, questionId, card);
}

function applyRelicFailureStack(next: StudyState, questionId: string) {
  const stackValue = getRunModifierTotals(next).submitFailDamageStackPercent || 0;
  if (stackValue <= 0 || !next.profile.spireRun.roundQuestionIds.includes(questionId)) {
    return;
  }
  next.profile.spireRun.failDamageStacks = Math.min(5, Math.max(0, next.profile.spireRun.failDamageStacks || 0) + 1);
}

function getFailedQuestionRating(next: StudyState, questionId: string, card: CardState) {
  const question = questions.find((row) => row.id === questionId);
  return question ? applyEloResult(getEstimatedRating(next), question.rating, false, card.failedSubmissions) : next.profile.rating;
}
