/* eslint-disable max-lines */
import { questions } from "../data/questions";
import { areHintsDisabledByHeat, getHeatBossMultiplier, getHeatEliteMultiplier, getHeatHealingMultiplier, getHeatRank, getHeatTimerPenaltyPercent, getSpireDifficultyModifiers, isRunCodeDisabledByHeat } from "./campaignCore";
import { addEnemyDebuffs, cloneEnemyDebuffs, normalizeEnemyDebuffs, tickEnemyDebuffs } from "./enemyDebuffCore";
import { createDropItem, EQUIPMENT_SLOTS, getActiveSetBonusesForItems, SLOT_LABELS } from "./itemCore";
import { applyEloResult, DEFAULT_PLAYER_RATING, getEstimatedRating } from "./ratingCore";
import { getRelicModifierTotals, normalizeRelics } from "./relicCore";
import { ALL_MODIFIER_KEYS } from "./modifierAffixes";
import { applyElementalResistance, getResistancesFromModifiers } from "./resistanceCore";
import { getWarriorSkillBonuses, normalizeWarriorSkillRanks } from "./skillCore";
import { createShopStock, normalizeShopStock } from "./shopCore";
import { DEFAULT_SPIRE_MIN_RATING, createSpireRun, getSpireRatings, normalizeSpireMinRating, normalizeSpireRun } from "./spireMapCore";
import { getMonsterMaxHealth, getUniqueMonsterBonusesWithExtra } from "./monsterCore";
import { addPlayerDebuffs, clonePlayerDebuffs, getPlayerDebuffStacks, normalizePlayerDebuffs, tickPlayerDebuffsAfterSubmit, type PlayerDebuffApplication } from "./playerDebuffCore";
import type { ActivePotionEffect, CardState, CharacterStatKey, CharacterStats, CodingCompanyProfile, DamageType, EquipmentSlot, InventoryItem, InventoryItemPosition, ItemModifierKey, Question, StudyState } from "../types/study";

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
const META_DEATH_GOLD_KEEP_PER_RANK = 25;
const META_STARTER_RELICS_PER_RANK = 1;
const META_RELIC_CHOICE_BONUS_CAP = 2;
const META_RELIC_LUCK_PERCENT = 6;
const META_REVEAL_SUBMIT_TESTS_PER_RANK = 1;
const CODING_MIN_RATING_FLOOR = 0;
const CODING_TAG_WEIGHT_TOTAL = 100;
const CODING_PROFILE_NAME_MAX_LENGTH = 48;
const WEAK_DAMAGE_REDUCTION_PERCENT = 25;
const VULNERABLE_INCOMING_DAMAGE_PERCENT = 35;
const FRAIL_HEALING_REDUCTION_PERCENT = 35;
const FRAIL_MITIGATION_REDUCTION_PERCENT = 25;
const SLIMED_TIMER_PENALTY_SECONDS = 10;
const HEX_HINT_COST_PENALTY = 10;
const CONFUSED_DAMAGE_MIN_PERCENT = 70;
const CONFUSED_DAMAGE_RANGE_PERCENT = 60;
const CONFUSED_HINT_COST_STEP = 5;
const CONFUSED_HINT_COST_ROLLS = 4;
const PARASITE_REWARD_REDUCTION_PERCENT = 20;
const TAG_DAMAGE_MODIFIERS: Array<{ key: ItemModifierKey; tag: string }> = [
  { key: "damageVsArraysPercent", tag: "Arrays" },
  { key: "damageVsBfsPercent", tag: "BFS" },
  { key: "damageVsDfsPercent", tag: "DFS" },
  { key: "damageVsDynamicProgrammingPercent", tag: "Dynamic Programming" },
  { key: "damageVsGraphsPercent", tag: "Graphs" },
  { key: "damageVsHashMapPercent", tag: "Hash Map" },
  { key: "damageVsStringsPercent", tag: "Strings" },
  { key: "damageVsTreesPercent", tag: "Trees" }
];
export const MODIFIER_KEYS: ItemModifierKey[] = ALL_MODIFIER_KEYS;

export const HINT_COST = 10;
export const HINT_COST_INCREMENT = 10;
export const HINT_MAX_COST = 30;
export const MAX_TRACKED_ACHIEVEMENTS = 5;
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
  const timerPenalty = Math.min(80, Math.max(0, (modifiers.timerPenaltyPercent || 0) + getHeatTimerPenaltyPercent(state.profile.spireRun)));
  const slimedPenaltySeconds = getPlayerDebuffStacks(state.profile.playerDebuffs, "slimed") * SLIMED_TIMER_PENALTY_SECONDS;
  return Math.max(MS_PER_MINUTE, Math.round(getQuestionTimeLimitMs(question) * (1 - timerPenalty / PERCENT)) + (timerPauseSeconds - slimedPenaltySeconds) * MS_PER_SECOND);
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
      spireMinRating: DEFAULT_SPIRE_MIN_RATING,
      codingTags: [],
      codingTagWeights: {},
      codingMinRating: CODING_MIN_RATING_FLOOR,
      codingProfiles: [],
      activeCodingProfileId: null,
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
      playerDebuffs: [],
      inventory: [],
      inventorySlots: {},
      equipment: defaultEquipment(),
      metaProgress: createDefaultMetaProgress(),
      shopLastRefreshedAt: null,
      shopStock: [],
      relics: [],
      spireRun: createSpireRun(Date.now(), 1, "normal", undefined, false, DEFAULT_SPIRE_MIN_RATING),
      trackedAchievementIds: [],
      unlockedAchievementIds: []
    },
    cards: {}
  };
}

export const defaultCard = (): CardState => ({ dueAt: 0, intervalDays: 0, ease: 2.4, reps: 0, attempts: 0, correct: 0, enemyDebuffs: [], failedSubmissions: 0, hintsBought: 0, lastResult: null, monsterBlock: 0, playerBlock: 0, relicCombatStartHealed: false, relicFirstHitBlocked: false, relicFirstHpLossPrevented: false, relicReviveUsed: false });

export const cloneState = (state: StudyState): StudyState => ({
  ...state,
  profile: cloneProfile(state),
  cards: Object.fromEntries(Object.entries(state.cards).map(([id, card]) => [id, cloneCardState(card)]))
});

function cloneProfile(state: StudyState): StudyState["profile"] {
  return { ...state.profile, activeSkill: state.profile.activeSkill ?? null, activePotionEffects: cloneActivePotionEffects(state.profile.activePotionEffects), activeCodingProfileId: normalizeActiveCodingProfileId(state.profile.activeCodingProfileId, state.profile.codingProfiles), codingMinRating: normalizeCodingMinRating(state.profile.codingMinRating), codingProfiles: normalizeCodingCompanyProfiles(state.profile.codingProfiles), codingTags: [...(state.profile.codingTags || [])], codingTagWeights: { ...(state.profile.codingTagWeights || {}) }, equipment: { ...state.profile.equipment }, inventory: state.profile.inventory.map(cloneInventoryItem), inventorySlots: cloneInventorySlots(state.profile.inventorySlots), metaProgress: { ...state.profile.metaProgress, upgrades: { ...state.profile.metaProgress.upgrades } }, playerDebuffs: clonePlayerDebuffs(state.profile.playerDebuffs), relics: state.profile.relics.map((relic) => ({ ...relic, modifiers: relic.modifiers?.map((modifier) => ({ ...modifier })) })), shopStock: state.profile.shopStock.map((item) => ({ ...item })), skillRanks: { ...state.profile.skillRanks }, spireRun: { ...state.profile.spireRun, availableNodeIds: [...state.profile.spireRun.availableNodeIds], completedNodeIds: [...state.profile.spireRun.completedNodeIds], nodes: state.profile.spireRun.nodes.map((node) => ({ ...node, nextIds: [...node.nextIds] })), pendingRelicReward: cloneRelicRewardChoice(state.profile.spireRun.pendingRelicReward), roomRewardClaims: cloneRoomRewardClaims(state.profile.spireRun.roomRewardClaims), roundQuestionIds: [...state.profile.spireRun.roundQuestionIds], roundSolvedIds: [...state.profile.spireRun.roundSolvedIds], runCodeQuestionIds: [...state.profile.spireRun.runCodeQuestionIds], unknownEncounterMisses: { ...state.profile.spireRun.unknownEncounterMisses } }, stats: { ...state.profile.stats }, trackedAchievementIds: [...state.profile.trackedAchievementIds], unlockedAchievementIds: [...state.profile.unlockedAchievementIds] };
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

function cloneCardState(card: CardState): CardState {
  return { ...card, enemyDebuffs: cloneEnemyDebuffs(card.enemyDebuffs) };
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
  const codingProfiles = normalizeCodingCompanyProfiles(profile.codingProfiles);
  const activeCodingProfileId = normalizeActiveCodingProfileId(profile.activeCodingProfileId, codingProfiles);
  const normalized = {
    ...fallback,
    ...stored,
    profile: {
      ...fallback.profile,
      ...profile,
      godMode: Boolean(profile.godMode),
      experience: 0,
      rating: normalizeRating(stored, fallback),
      spireMinRating: normalizeSpireMinRating(profile.spireMinRating),
      codingTags: activeCodingProfileId ? normalizeCodingTags(profile.codingTags) : [],
      codingTagWeights: activeCodingProfileId ? normalizeCodingTagWeights(profile.codingTags, profile.codingTagWeights) : {},
      codingMinRating: activeCodingProfileId ? normalizeCodingMinRating(profile.codingMinRating) : CODING_MIN_RATING_FLOOR,
      codingProfiles,
      activeCodingProfileId,
      statPoints: 0,
      statPointsAwardedLevel: FIRST_STAT_LEVEL,
      stats: normalizeCharacterStats(profile.stats),
      skillRanks: normalizeWarriorSkillRanks(profile.skillRanks),
      activeSkill: profile.activeSkill ?? null,
      activePotionEffects: normalizeActivePotionEffects(profile.activePotionEffects),
      playerDebuffs: normalizePlayerDebuffs(profile.playerDebuffs),
      inventory,
      inventorySlots: {},
      equipment: defaultEquipment(),
      metaProgress: normalizeMetaProgress(profile.metaProgress),
      shopLastRefreshedAt: profile.shopLastRefreshedAt ?? fallback.profile.shopLastRefreshedAt,
      shopStock: normalizeShopStock(profile.shopStock),
      relics: normalizeRelics(profile.relics),
      spireRun: normalizeSpireRun(profile.spireRun, normalizeSpireMinRating(profile.spireMinRating)),
      trackedAchievementIds: normalizeTrackedAchievementIds(profile.trackedAchievementIds),
      unlockedAchievementIds: normalizeUnlockedAchievementIds(profile.unlockedAchievementIds)
    },
    cards: normalizeCards(stored.cards)
  };
  const scrubbed = scrubAccidentalDeathInsight(normalized);
  const bounded = {
    ...scrubbed,
    profile: {
      ...scrubbed.profile,
      health: Math.min(getMaxHealth(scrubbed), Math.max(0, profile.health ?? fallback.profile.health)),
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

export type RestartStudyRunOptions = {
  retainGoldAfterDeath?: boolean;
};

export function restartStudyRun(state: StudyState, now = Date.now(), options: RestartStudyRunOptions = {}): StudyState {
  const previousRunCoins = Math.max(0, Math.floor(state.profile.coins || 0));
  const spireMinRating = normalizeSpireMinRating(state.profile.spireMinRating);
  const next = defaultState();
  next.mode = state.mode;
  next.cards = { ...state.cards };
  next.totalCorrect = state.totalCorrect;
  next.profile.activeCodingProfileId = state.profile.activeCodingProfileId;
  next.profile.codingMinRating = state.profile.codingMinRating;
  next.profile.codingProfiles = state.profile.codingProfiles.map((profile) => ({ ...profile, codingTags: [...profile.codingTags], codingTagWeights: { ...profile.codingTagWeights } }));
  next.profile.codingTags = [...state.profile.codingTags];
  next.profile.codingTagWeights = { ...state.profile.codingTagWeights };
  next.profile.godMode = state.profile.godMode;
  next.profile.metaProgress = { ...state.profile.metaProgress, upgrades: { ...state.profile.metaProgress.upgrades } };
  next.profile.spireMinRating = spireMinRating;
  next.profile.spireRun = createSpireRun(now, 1, "normal", state.profile.spireRun.heatConditions, true, spireMinRating);
  next.profile.trackedAchievementIds = [...state.profile.trackedAchievementIds];
  next.profile.unlockedAchievementIds = [...state.profile.unlockedAchievementIds];
  next.profile.coins = getMetaStartingGoldBonus(next) + getRetainedDeathGold(next, previousRunCoins, options.retainGoldAfterDeath);
  next.profile.health = getMaxHealth(next);
  return next;
}

function scrubAccidentalDeathInsight(state: StudyState): StudyState {
  const meta = state.profile.metaProgress;
  if (
    meta.currency <= 0
    || meta.currency !== meta.totalEarned
    || state.totalCorrect > 0
    || state.profile.relics.length > 0
    || Object.values(state.cards).some((card) => card.correct > 0)
    || state.profile.spireRun.completedNodeIds.length > 0
    || Object.keys(state.profile.spireRun.roomRewardClaims).length > 0
  ) {
    return state;
  }

  return {
    ...state,
    profile: {
      ...state.profile,
      metaProgress: {
        ...meta,
        currency: 0,
        totalEarned: 0
      }
    }
  };
}

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

function normalizeTrackedAchievementIds(ids: string[] | undefined) { return [...new Set(ids || [])].slice(0, MAX_TRACKED_ACHIEVEMENTS); }

function normalizeUnlockedAchievementIds(ids: string[] | undefined) { return [...new Set(ids || [])]; }

export function getAvailableCodingTags() {
  return [...new Set(questions.flatMap((question) => question.topics))].sort((a, b) => a.localeCompare(b));
}

export function normalizeCodingTags(tags: unknown) {
  const available = new Set(getAvailableCodingTags());
  if (!Array.isArray(tags)) {
    return [];
  }
  return [...new Set(tags.filter((tag): tag is string => typeof tag === "string" && available.has(tag)))];
}

export function normalizeCodingMinRating(value: unknown) {
  if (!Number.isFinite(Number(value))) {
    return CODING_MIN_RATING_FLOOR;
  }
  return Math.max(CODING_MIN_RATING_FLOOR, Math.floor(Number(value)));
}

export function normalizeCodingTagWeights(tags: unknown, weights: unknown) {
  const normalizedTags = normalizeCodingTags(tags);
  if (!normalizedTags.length) {
    return {};
  }
  const source = weights && typeof weights === "object" ? weights as Record<string, unknown> : {};
  const rawWeights = normalizedTags.map((tag) => normalizeCodingTagWeightValue(source[tag]));
  const hasConfiguredWeight = rawWeights.some((weight) => weight !== null);
  const values = hasConfiguredWeight
    ? rawWeights.map((weight) => weight ?? 0)
    : createEvenCodingTagWeights(normalizedTags.length);
  const total = values.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    return Object.fromEntries(normalizedTags.map((tag, index) => [tag, createEvenCodingTagWeights(normalizedTags.length)[index]]));
  }
  let remaining = CODING_TAG_WEIGHT_TOTAL;
  return Object.fromEntries(normalizedTags.map((tag, index) => {
    const value = index === normalizedTags.length - 1
      ? remaining
      : Math.min(remaining, Math.max(0, Math.round((values[index] / total) * CODING_TAG_WEIGHT_TOTAL)));
    remaining -= value;
    return [tag, value];
  }));
}

function normalizeCodingTagWeightValue(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.max(0, Math.min(CODING_TAG_WEIGHT_TOTAL, Math.round(numeric)));
}

function createEvenCodingTagWeights(count: number) {
  if (count <= 0) {
    return [];
  }
  const base = Math.floor(CODING_TAG_WEIGHT_TOTAL / count);
  let remaining = CODING_TAG_WEIGHT_TOTAL;
  return Array.from({ length: count }, (_row, index) => {
    const value = index === count - 1 ? remaining : base;
    remaining -= value;
    return value;
  });
}

export function normalizeCodingCompanyProfiles(profiles: unknown): CodingCompanyProfile[] {
  if (!Array.isArray(profiles)) {
    return [];
  }
  const seen = new Set<string>();
  return profiles.reduce<CodingCompanyProfile[]>((normalized, row, index) => {
    if (!row || typeof row !== "object") {
      return normalized;
    }
    const profile = row as Partial<CodingCompanyProfile>;
    const fallbackId = `company-profile-${index}`;
    const id = normalizeCodingProfileId(profile.id, fallbackId);
    const name = normalizeCodingProfileName(profile.name, `Profile ${index + 1}`);
    if (seen.has(id)) {
      return normalized;
    }
    seen.add(id);
    normalized.push({
      id,
      name,
      codingTags: normalizeCodingTags(profile.codingTags),
      codingTagWeights: normalizeCodingTagWeights(profile.codingTags, profile.codingTagWeights),
      codingMinRating: normalizeCodingMinRating(profile.codingMinRating)
    });
    return normalized;
  }, []);
}

export function applyCodingCompanyProfile(state: StudyState, profileId: string): StudyState {
  const profiles = normalizeCodingCompanyProfiles(state.profile.codingProfiles);
  const profile = profiles.find((candidate) => candidate.id === profileId);
  if (!profile) {
    return {
      ...state,
      profile: {
        ...state.profile,
        codingProfiles: profiles,
        activeCodingProfileId: normalizeActiveCodingProfileId(state.profile.activeCodingProfileId, profiles)
      }
    };
  }
  return {
    ...state,
    profile: {
      ...state.profile,
      activeCodingProfileId: profile.id,
      codingMinRating: profile.codingMinRating,
      codingProfiles: profiles,
      codingTags: profile.codingTags,
      codingTagWeights: normalizeCodingTagWeights(profile.codingTags, profile.codingTagWeights)
    }
  };
}

export function clearCodingCompanyProfile(state: StudyState): StudyState {
  return {
    ...state,
    profile: {
      ...state.profile,
      activeCodingProfileId: null,
      codingMinRating: CODING_MIN_RATING_FLOOR,
      codingProfiles: normalizeCodingCompanyProfiles(state.profile.codingProfiles),
      codingTags: [],
      codingTagWeights: {}
    }
  };
}

function normalizeActiveCodingProfileId(profileId: unknown, profiles: unknown) {
  const normalizedProfiles = normalizeCodingCompanyProfiles(profiles);
  return typeof profileId === "string" && normalizedProfiles.some((profile) => profile.id === profileId) ? profileId : null;
}

function normalizeCodingProfileId(value: unknown, fallback: string) {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw || fallback;
}

function normalizeCodingProfileName(value: unknown, fallback: string) {
  const raw = typeof value === "string" ? value.trim() : "";
  return (raw || fallback).slice(0, CODING_PROFILE_NAME_MAX_LENGTH);
}

export function getCodingFilteredQuestions(state: StudyState) {
  const selectedTags = new Set(normalizeCodingTags(state.profile.codingTags));
  const minRating = normalizeCodingMinRating(state.profile.codingMinRating);
  const tagFiltered = selectedTags.size
    ? questions.filter((question) => question.topics.some((topic) => selectedTags.has(topic)))
    : questions;
  const filtered = tagFiltered.filter((question) => question.rating >= minRating);
  return filtered.length ? filtered : tagFiltered.length ? tagFiltered : questions;
}

export function getCodingQuestionWeight(state: StudyState, question: Question) {
  const selectedTags = normalizeCodingTags(state.profile.codingTags);
  if (!selectedTags.length) {
    return 0;
  }
  const weights = normalizeCodingTagWeights(selectedTags, state.profile.codingTagWeights);
  return question.topics.reduce((total, topic) => total + (weights[topic] || 0), 0);
}

function normalizeMetaProgress(progress: Partial<StudyState["profile"]["metaProgress"]> | undefined): StudyState["profile"]["metaProgress"] {
  const fallback = createDefaultMetaProgress();
  const upgrades = createDefaultMetaUpgrades();
  for (const definition of META_UPGRADE_DEFINITIONS) {
    upgrades[definition.id] = normalizeMetaUpgradeRank(progress?.upgrades?.[definition.id], fallback.upgrades[definition.id]);
  }
  return {
    currency: Math.max(0, Math.floor(progress?.currency || 0)),
    heatUnlocked: Boolean(progress?.heatUnlocked),
    highestHeat: Math.max(0, Math.floor(progress?.highestHeat || 0)),
    totalEarned: Math.max(0, Math.floor(progress?.totalEarned || 0)),
    upgrades
  };
}

function createDefaultMetaProgress(): StudyState["profile"]["metaProgress"] {
  return { currency: 0, heatUnlocked: false, highestHeat: 0, totalEarned: 0, upgrades: createDefaultMetaUpgrades() };
}

function createDefaultMetaUpgrades(): StudyState["profile"]["metaProgress"]["upgrades"] {
  return Object.fromEntries(META_UPGRADE_DEFINITIONS.map((definition) => [definition.id, 0])) as StudyState["profile"]["metaProgress"]["upgrades"];
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
  return Object.fromEntries(Object.entries(cards || {}).map(([id, card]) => [id, { ...defaultCard(), ...card, enemyDebuffs: normalizeEnemyDebuffs(card.enemyDebuffs), failedSubmissions: Math.max(0, card.failedSubmissions || 0), hintsBought: Math.max(0, card.hintsBought || 0), monsterBlock: Math.max(0, Math.floor(card.monsterBlock || 0)), playerBlock: Math.max(0, Math.floor(card.playerBlock || 0)), relicCombatStartHealed: Boolean(card.relicCombatStartHealed), relicFirstHitBlocked: Boolean(card.relicFirstHitBlocked), relicFirstHpLossPrevented: Boolean(card.relicFirstHpLossPrevented), relicReviveUsed: Boolean(card.relicReviveUsed), solutionRevealedAt: Math.max(0, card.solutionRevealedAt || 0) || undefined }]));
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

export const getRunModifierTotals = (state: StudyState) => addModifierRecords(addModifierRecords(addModifierRecords(getEquipmentModifierTotals(state), getRelicModifierTotals(state)), getActivePotionModifierTotals(state)), getMetaModifierTotals(state));

export const getElementalResistances = (state: StudyState) => applyDifficultyResistancePenalty(getResistancesFromModifiers(addSkillResistances(getRunModifierTotals(state), getWarriorSkillBonusTotals(state))), getSpireDifficultyModifiers(state.profile.spireRun).resistancePenalty);

export const getWarriorSkillBonusTotals = (state: StudyState) => getWarriorSkillBonuses(state.profile.skillRanks);

export const markQuestionRunCode = (state: StudyState, questionId: string): StudyState => {
  if (!questionId || isRunCodeDisabledByHeat(state.profile.spireRun) || state.profile.spireRun.runCodeQuestionIds.includes(questionId)) {
    return state;
  }
  const playerDebuffs = getPlayerDebuffStacks(state.profile.playerDebuffs, "hex")
    ? addPlayerDebuffs(state.profile.playerDebuffs, [{ id: "slimed", remainingSubmits: 1, stacks: 1 }])
    : state.profile.playerDebuffs;
  return {
    ...state,
    profile: {
      ...state.profile,
      playerDebuffs,
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
  return value * (1 - Math.min(95, Math.max(-100, reductionPercent || 0)) / MODIFIER_PERCENT_BASE);
}

export const getMaxHealth = (state: StudyState) => {
  const stats = getEffectiveCharacterStats(state);
  const modifiers = getRunModifierTotals(state);
  const skills = getWarriorSkillBonusTotals(state);
  return MAX_HEALTH + getMetaMaxHealthBonus(state) + (state.profile.spireRun.maxHealthBonus || 0) + (stats.constitution - FIRST_STAT_LEVEL) * HEALTH_PER_CONSTITUTION + modifiers.maxLife + skills.maxLife;
};

export const getMetaStartingGoldBonus = (state: StudyState) => Math.max(0, state.profile.metaProgress.upgrades.coinPurse || 0) * META_COIN_PURSE_GOLD;

export const getMetaDeathGoldKeepCap = (state: StudyState) => Math.max(0, state.profile.metaProgress.upgrades.deathGoldKeep || 0) * META_DEATH_GOLD_KEEP_PER_RANK;

function getRetainedDeathGold(state: StudyState, previousRunCoins: number, retainGoldAfterDeath = false) {
  if (!retainGoldAfterDeath) {
    return 0;
  }
  return Math.min(Math.max(0, Math.floor(previousRunCoins || 0)), getMetaDeathGoldKeepCap(state));
}

export const getMetaMaxHealthBonus = (state: StudyState) => Math.max(0, state.profile.metaProgress.upgrades.toughStart || 0) * META_TOUGH_START_HEALTH;

export const getMetaStartingRelicCount = (state: StudyState) => Math.max(0, state.profile.metaProgress.upgrades.starterRelics || 0) * META_STARTER_RELICS_PER_RANK;

export const getMetaRelicChoiceBonus = (state: StudyState) => Math.min(META_RELIC_CHOICE_BONUS_CAP, Math.max(0, state.profile.metaProgress.upgrades.relicChoice || 0));

export function setSpireMinimumRating(state: StudyState, value: number): StudyState {
  const spireMinRating = normalizeSpireMinRating(value);
  if (spireMinRating === state.profile.spireMinRating) {
    return state;
  }
  const ratings = getSpireRatings(state.profile.spireRun.act, spireMinRating);
  return {
    ...state,
    profile: {
      ...state.profile,
      spireMinRating,
      spireRun: {
        ...state.profile.spireRun,
        nodes: state.profile.spireRun.nodes.map((node) => ({
          ...node,
          rating: ratings[node.tierIndex] ?? ratings[0]
        }))
      }
    }
  };
}

export type MetaUpgradeId = keyof StudyState["profile"]["metaProgress"]["upgrades"];

export type MetaUpgradeDefinition = {
  baseCost: number;
  costStep: number;
  description: string;
  id: MetaUpgradeId;
  label: string;
  maxRank: number;
  modifiers?: Array<{ key: ItemModifierKey; valuePerRank: number }>;
  unlockAchievementCount: number;
};

export const META_UPGRADE_DEFINITIONS: MetaUpgradeDefinition[] = [
  { baseCost: 8, costStep: 6, description: `Start each run with +${META_TOUGH_START_HEALTH} max health per rank.`, id: "toughStart", label: "Thick Skin", maxRank: 10, unlockAchievementCount: 0 },
  { baseCost: 6, costStep: 5, description: `Start each run with +${META_COIN_PURSE_GOLD} gold per rank.`, id: "coinPurse", label: "Deep Pockets", maxRank: 8, unlockAchievementCount: 0 },
  { baseCost: 8, costStep: 6, description: `After death, keep up to ${META_DEATH_GOLD_KEEP_PER_RANK} gold per rank for the next run.`, id: "deathGoldKeep", label: "Grave Purse", maxRank: 5, unlockAchievementCount: 0 },
  { baseCost: 12, costStep: 8, description: "+5% damage per rank. A simple permanent power path.", id: "shadowTraining", label: "Shadow Training", maxRank: 6, modifiers: [{ key: "enhancedDamagePercent", valuePerRank: 5 }], unlockAchievementCount: 0 },
  { baseCost: 18, costStep: 10, description: "+3% critical chance per rank.", id: "lethalPrecision", label: "Lethal Precision", maxRank: 5, modifiers: [{ key: "criticalChancePercent", valuePerRank: 3 }], unlockAchievementCount: 1 },
  { baseCost: 18, costStep: 9, description: "+4% reduced incoming enemy damage per rank.", id: "ironResolve", label: "Iron Resolve", maxRank: 5, modifiers: [{ key: "reducedEnemyDamagePercent", valuePerRank: 4 }], unlockAchievementCount: 2 },
  { baseCost: 16, costStep: 10, description: "+4% damage per rank while above 80% health.", id: "highConfidence", label: "High Confidence", maxRank: 5, modifiers: [{ key: "bonusDamageWhileFullHealthPercent", valuePerRank: 4 }], unlockAchievementCount: 3 },
  { baseCost: 18, costStep: 10, description: "+12% critical damage per rank.", id: "crushingInsight", label: "Crushing Insight", maxRank: 4, modifiers: [{ key: "criticalDamagePercent", valuePerRank: 12 }], unlockAchievementCount: 4 },
  { baseCost: 18, costStep: 10, description: "+8% gold found per rank from room rewards.", id: "goldenTouch", label: "Golden Touch", maxRank: 5, modifiers: [{ key: "goldFindPercent", valuePerRank: 8 }], unlockAchievementCount: 5 },
  { baseCost: 16, costStep: 9, description: "Wrong answers add +4% comeback damage per stack.", id: "mistakeAlchemy", label: "Mistake Alchemy", maxRank: 4, modifiers: [{ key: "submitFailDamageStackPercent", valuePerRank: 4 }], unlockAchievementCount: 6 },
  { baseCost: 18, costStep: 11, description: "+10% no-run submit damage per rank.", id: "cleanExecution", label: "Clean Execution", maxRank: 4, modifiers: [{ key: "noRunDamagePercent", valuePerRank: 10 }], unlockAchievementCount: 7 },
  { baseCost: 24, costStep: 10, description: "+15 seconds of timer grace per rank.", id: "swiftReflex", label: "Swift Reflex", maxRank: 4, modifiers: [{ key: "timerPauseSeconds", valuePerRank: 15 }], unlockAchievementCount: 8 },
  { baseCost: 22, costStep: 0, description: "Block the first hit in each combat room.", id: "silverGuard", label: "Silver Guard", maxRank: 1, modifiers: [{ key: "blockFirstHit", valuePerRank: 1 }], unlockAchievementCount: 10 },
  { baseCost: 24, costStep: 14, description: "Pierce enemy guard so late solves still hit hard.", id: "topicMemory", label: "Wardbreaker", maxRank: 2, modifiers: [{ key: "armorPenetrationPercent", valuePerRank: 10 }], unlockAchievementCount: 12 },
  { baseCost: 20, costStep: 10, description: "+8% damage against elites and bosses per rank.", id: "eliteHunter", label: "Elite Hunter", maxRank: 5, modifiers: [{ key: "bonusDamageVsElitesPercent", valuePerRank: 8 }], unlockAchievementCount: 14 },
  { baseCost: 18, costStep: 14, description: `Reveal ${META_REVEAL_SUBMIT_TESTS_PER_RANK} failed submit test case per rank.`, id: "revealSubmitTests", label: "Trial Lantern", maxRank: 3, modifiers: [{ key: "revealSubmitTestCount", valuePerRank: META_REVEAL_SUBMIT_TESTS_PER_RANK }], unlockAchievementCount: 16 },
  { baseCost: 26, costStep: 18, description: `Start each run with ${META_STARTER_RELICS_PER_RANK} random relic per rank.`, id: "starterRelics", label: "Heirloom Cache", maxRank: 3, unlockAchievementCount: 18 },
  { baseCost: 16, costStep: 8, description: "+5% shop discount per rank.", id: "underworldBroker", label: "Underworld Broker", maxRank: 4, modifiers: [{ key: "shopDiscountPercent", valuePerRank: 5 }], unlockAchievementCount: 20 },
  { baseCost: 32, costStep: 0, description: "Shops stock one extra relic.", id: "shopkeeperFavor", label: "Shopkeeper Favor", maxRank: 1, modifiers: [{ key: "shopRelicStock", valuePerRank: 1 }], unlockAchievementCount: 22 },
  { baseCost: 22, costStep: 12, description: "+4% rare relic chance per rank.", id: "olympianFavor", label: "Olympian Favor", maxRank: 6, modifiers: [{ key: "increasedRareDropChancePercent", valuePerRank: 4 }], unlockAchievementCount: 24 },
  { baseCost: 26, costStep: 14, description: "Relic rewards show one extra choice per rank.", id: "relicChoice", label: "Dark Foresight", maxRank: META_RELIC_CHOICE_BONUS_CAP, unlockAchievementCount: 26 },
  { baseCost: 30, costStep: 18, description: "+1 relic reward reroll per rank.", id: "fatedPersuasion", label: "Fated Persuasion", maxRank: 3, modifiers: [{ key: "relicRerollBonus", valuePerRank: 1 }], unlockAchievementCount: 28 },
  { baseCost: 20, costStep: 10, description: "+2 insight when skipping relic rewards per rank.", id: "fatedTreasury", label: "Fated Treasury", maxRank: 5, modifiers: [{ key: "skipRelicMetaBonus", valuePerRank: 2 }], unlockAchievementCount: 30 },
  { baseCost: 28, costStep: 18, description: "Each room starts with one free hint charge.", id: "oracleFavor", label: "Oracle Favor", maxRank: 1, modifiers: [{ key: "freeHintPerRoom", valuePerRank: 1 }], unlockAchievementCount: 32 },
  { baseCost: 34, costStep: 18, description: `+${META_RELIC_LUCK_PERCENT}% chance for rarer relic rolls per rank.`, id: "relicLuck", label: "Fortune Glass", maxRank: 5, modifiers: [{ key: "increasedRareDropChancePercent", valuePerRank: META_RELIC_LUCK_PERCENT }], unlockAchievementCount: 35 },
  { baseCost: 40, costStep: 0, description: "Gain 1 revive each run.", id: "deathDefiance", label: "Death Defiance", maxRank: 1, modifiers: [{ key: "revivePercent", valuePerRank: 45 }], unlockAchievementCount: 38 }
];

export function getMetaUpgradeDefinition(id: MetaUpgradeId) {
  return META_UPGRADE_DEFINITIONS.find((definition) => definition.id === id) || META_UPGRADE_DEFINITIONS[0];
}

export function getMetaUpgradeCost(state: StudyState, id: MetaUpgradeId) {
  const rank = state.profile.metaProgress.upgrades[id] || 0;
  const definition = getMetaUpgradeDefinition(id);
  return definition.baseCost + rank * definition.costStep;
}

export function getUnlockedAchievementCount(state: StudyState) {
  return new Set(state.profile.unlockedAchievementIds).size;
}

export function isMetaUpgradeUnlocked(state: StudyState, id: MetaUpgradeId) {
  return getUnlockedAchievementCount(state) >= getMetaUpgradeDefinition(id).unlockAchievementCount;
}

export function isMetaUpgradeVisible(state: StudyState, id: MetaUpgradeId) {
  return isMetaUpgradeUnlocked(state, id) || (state.profile.metaProgress.upgrades[id] || 0) > 0;
}

export function getVisibleMetaUpgradeDefinitions(state: StudyState) {
  return META_UPGRADE_DEFINITIONS.filter((definition) => isMetaUpgradeVisible(state, definition.id));
}

export function getNextLockedMetaUpgradeDefinition(state: StudyState) {
  const unlockedAchievementCount = getUnlockedAchievementCount(state);
  return META_UPGRADE_DEFINITIONS.find((definition) => definition.unlockAchievementCount > unlockedAchievementCount) || null;
}

export function getMetaModifierTotals(state: StudyState) {
  const totals = { ...DEFAULT_ITEM_MODIFIERS };
  for (const definition of META_UPGRADE_DEFINITIONS) {
    const rank = Math.max(0, Math.min(definition.maxRank, Math.floor(state.profile.metaProgress.upgrades[definition.id] || 0)));
    for (const modifier of definition.modifiers || []) {
      totals[modifier.key] = (totals[modifier.key] || 0) + modifier.valuePerRank * rank;
    }
  }
  return totals;
}

export function canPurchaseMetaUpgrade(state: StudyState, id: MetaUpgradeId) {
  const definition = getMetaUpgradeDefinition(id);
  return isMetaUpgradeUnlocked(state, id) && (state.profile.metaProgress.upgrades[id] || 0) < definition.maxRank && state.profile.metaProgress.currency >= getMetaUpgradeCost(state, id);
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
  const constrictedDamage = getPlayerDebuffStacks(state.profile.playerDebuffs, "constricted");
  const incomingDebuffPercent = getPlayerDebuffStacks(state.profile.playerDebuffs, "vulnerable") ? VULNERABLE_INCOMING_DAMAGE_PERCENT : 0;
  const incomingDamageMultiplier = 1 + ((modifiers.incomingDamagePercent || 0) + incomingDebuffPercent) / MODIFIER_PERCENT_BASE;
  const scaledAmount = (amount + constrictedDamage) * difficultyModifiers.monsterDamageMultiplier * getNodeHeatMonsterMultiplier(state) * Math.max(0.1, incomingDamageMultiplier);
  const frailPenalty = getPlayerDebuffStacks(state.profile.playerDebuffs, "frail") ? FRAIL_MITIGATION_REDUCTION_PERCENT : 0;
  const reducedEnemyDamagePercent = (modifiers.reducedEnemyDamagePercent || 0) - frailPenalty;
  const reducedEnemyDamage = scaledAmount * (1 - Math.min(75, reducedEnemyDamagePercent) / MODIFIER_PERCENT_BASE);
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
  const eliteBonus = getUniqueMonsterBonusesWithExtra(question, getPactUniqueMonsterBonusCount(state)).length ? modifiers.bonusDamageVsElitesPercent || 0 : 0;
  const healthRatio = state.profile.health / Math.max(1, getMaxHealth(state));
  const lowHealthBonus = healthRatio <= 0.35 ? modifiers.bonusDamageWhileLowHealthPercent || 0 : 0;
  const fullHealthBonus = healthRatio >= 1 ? modifiers.bonusDamageWhileFullHealthPercent || 0 : 0;
  const tagBonus = getQuestionTagDamageBonus(question, modifiers);
  const weakPenalty = getPlayerDebuffStacks(state.profile.playerDebuffs, "weak") ? -WEAK_DAMAGE_REDUCTION_PERCENT : 0;
  const confusedStacks = getPlayerDebuffStacks(state.profile.playerDebuffs, "confused");
  const confusedPercent = confusedStacks ? CONFUSED_DAMAGE_MIN_PERCENT + Math.round(getSeededRoll(`${question.id}:${getCard(state, question.id).attempts}:confused`) * CONFUSED_DAMAGE_RANGE_PERCENT) - PERCENT : 0;
  return applyPercentBonus(baseDamage, modifiers.enhancedDamagePercent + skills.enhancedDamagePercent + eliteBonus + lowHealthBonus + fullHealthBonus + tagBonus + weakPenalty + confusedPercent);
};

function getQuestionTagDamageBonus(question: Question, modifiers: Record<ItemModifierKey, number>) {
  const tags = new Set(question.topics);
  return TAG_DAMAGE_MODIFIERS.reduce((total, modifier) => total + (tags.has(modifier.tag) ? modifiers[modifier.key] || 0 : 0), 0);
}

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
  const frailPenalty = getPlayerDebuffStacks(state.profile.playerDebuffs, "frail") ? FRAIL_HEALING_REDUCTION_PERCENT : 0;
  return Math.max(0.05, (1 + ((modifiers.increasedHealingReceivedPercent || 0) - frailPenalty) / MODIFIER_PERCENT_BASE) * getHeatHealingMultiplier(state.profile.spireRun));
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
  const parasitePenalty = getPlayerDebuffStacks(state.profile.playerDebuffs, "parasite") ? -PARASITE_REWARD_REDUCTION_PERCENT : 0;
  return applyPercentBonus(Math.round(baseReward * difficultyReward * (1 + (stats.perception - FIRST_STAT_LEVEL) * GOLD_BONUS_PER_PERCEPTION)), modifiers.goldFindPercent + skills.goldFindPercent + parasitePenalty);
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
  addGoldAndApplyRelicHealing(next, getItemSellValue(item));
  return next;
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
  const goldGained = soldItems.reduce((sum, item) => sum + getItemSellValue(item), 0);
  next.profile.inventory = next.profile.inventory.filter((item) => !soldIds.has(item.id));
  for (const itemId of soldIds) {
    delete next.profile.inventorySlots[itemId];
  }
  addGoldAndApplyRelicHealing(next, goldGained);
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

export const applyHealthPenalty = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, draft?: string, now = Date.now(), element?: DamageType | null, debuffs: PlayerDebuffApplication[] = [], monsterBlockGain = 0): StudyState => {
  const next = cloneState(state);
  const effect = applyIncomingDamageToState(next, state, amount, manaDamage, questionId, element);
  if (questionId) {
    applyFailedRating(next, questionId, draft, now);
    applyThornsDamage(next, state, questionId, effect.healthLoss);
    applyMonsterBlockGain(next, questionId, monsterBlockGain);
  }
  next.profile.playerDebuffs = tickPlayerDebuffsAfterSubmit(next.profile.playerDebuffs);
  next.profile.playerDebuffs = addPlayerDebuffs(next.profile.playerDebuffs, filterResistedPlayerDebuffs(state, questionId, now, debuffs));
  return next;
};

function applyMonsterBlockGain(next: StudyState, questionId: string, amount: number) {
  const blockGain = Math.max(0, Math.floor(amount || 0));
  if (!blockGain) {
    return;
  }
  const card = { ...getCard(next, questionId) };
  card.monsterBlock = Math.max(0, Math.floor(card.monsterBlock || 0)) + blockGain;
  setCard(next, questionId, card);
}

function applyThornsDamage(next: StudyState, sourceState: StudyState, questionId: string, healthLoss: number) {
  const thornsDamage = Math.max(0, Math.floor(getRunModifierTotals(sourceState).thornsDamage || 0));
  if (!questionId || healthLoss <= 0 || thornsDamage <= 0) {
    return;
  }
  const card = { ...getCard(next, questionId) };
  card.monsterHealth = Math.max(0, getMonsterHealthForCard(sourceState, questionId) - thornsDamage);
  setCard(next, questionId, card);
}

function getMonsterHealthForCard(state: StudyState, questionId: string) {
  const stored = getCard(state, questionId).monsterHealth;
  if (Number.isFinite(stored)) {
    return Math.max(0, stored || 0);
  }
  const question = questions.find((row) => row.id === questionId);
  return question ? Math.round(getMonsterMaxHealth(question, getPactUniqueMonsterBonusCount(state)) * getSpireDifficultyModifiers(state.profile.spireRun).monsterHealthMultiplier * getNodeHeatMonsterMultiplier(state)) : 0;
}

function getPactUniqueMonsterBonusCount(state: StudyState) {
  return getHeatRank(state.profile.spireRun, "benefitsPackage");
}

function getNodeHeatMonsterMultiplier(state: StudyState) {
  const nodeKind = state.profile.spireRun.nodes.find((node) => node.id === state.profile.spireRun.currentNodeId)?.kind;
  if (nodeKind === "boss") {
    return getHeatBossMultiplier(state.profile.spireRun);
  }
  if (nodeKind === "elite") {
    return getHeatEliteMultiplier(state.profile.spireRun);
  }
  return 1;
}

function filterResistedPlayerDebuffs(state: StudyState, questionId: string | undefined, now: number, debuffs: PlayerDebuffApplication[]) {
  const modifiers = getRunModifierTotals(state);
  const blockedIds = new Set([
    ...((modifiers.hexConfusedImmune || 0) > 0 ? ["hex", "confused"] : []),
    ...((modifiers.vulnerableConstrictedImmune || 0) > 0 ? ["vulnerable", "constricted"] : [])
  ]);
  const eligibleDebuffs = debuffs.filter((debuff) => !blockedIds.has(debuff.id));
  const resistPercent = Math.min(100, Math.max(0, getRunModifierTotals(state).debuffResistPercent || 0));
  if (!eligibleDebuffs.length || resistPercent <= 0) {
    return eligibleDebuffs;
  }
  return eligibleDebuffs.filter((debuff) => getSeededRoll(`${questionId || "global"}:${now}:${debuff.id}:debuff-resist`) * PERCENT >= resistPercent);
}

export const getIncomingDamageEffect = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, element?: DamageType | null) => {
  const rawHealthLoss = getHealthLoss(state, amount, element);
  const manaLoss = 0;
  const card = questionId ? getCard(state, questionId) : null;
  const modifiers = getRunModifierTotals(state);
  const prevented = Boolean(card && !card.relicFirstHpLossPrevented && (modifiers.preventFirstHpLoss || 0) > 0 && rawHealthLoss > 0);
  if (prevented) {
    return { blocked: false, healthLoss: 0, manaLoss: 0, playerBlockLoss: 0, prevented, revived: false, reviveHealth: 0 };
  }
  const smallHitThreshold = Math.max(0, Math.floor(modifiers.smallHitToOneThreshold || 0));
  const healthLoss = rawHealthLoss > 1 && smallHitThreshold > 0 && rawHealthLoss <= smallHitThreshold ? 1 : rawHealthLoss;
  const blocked = Boolean(card && !card.relicFirstHitBlocked && (modifiers.blockFirstHit || 0) > 0 && (healthLoss > 0 || manaLoss > 0));
  if (blocked) {
    return { blocked, healthLoss: 0, manaLoss: 0, playerBlockLoss: 0, prevented: false, revived: false, reviveHealth: 0 };
  }
  const playerBlock = Math.max(0, Math.floor(card?.playerBlock || 0));
  const playerBlockLoss = Math.min(playerBlock, healthLoss);
  const finalHealthLoss = Math.max(0, healthLoss - playerBlockLoss);
  const revivePercent = Math.max(0, modifiers.revivePercent || 0);
  const reviveHealth = card && !card.relicReviveUsed && revivePercent > 0 && finalHealthLoss >= state.profile.health
    ? Math.max(1, Math.round(getMaxHealth(state) * Math.min(FULL_PERCENT, revivePercent) / FULL_PERCENT))
    : 0;
  return { blocked, healthLoss: finalHealthLoss, manaLoss, playerBlockLoss, prevented: false, revived: reviveHealth > 0, reviveHealth };
};

export const applyIncomingDamage = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, element?: DamageType | null) => {
  const next = cloneState(state);
  const effect = applyIncomingDamageToState(next, state, amount, manaDamage, questionId, element);
  return { ...effect, state: next };
};

function applyIncomingDamageToState(next: StudyState, sourceState: StudyState, amount = HEALTH_LOSS_PER_FAIL, manaDamage = 0, questionId?: string, element?: DamageType | null) {
  const effect = getIncomingDamageEffect(sourceState, amount, manaDamage, questionId, element);
  if (questionId && (effect.blocked || effect.prevented || effect.revived || effect.playerBlockLoss > 0)) {
    const card = { ...getCard(next, questionId) };
    card.relicFirstHitBlocked = card.relicFirstHitBlocked || effect.blocked;
    card.relicFirstHpLossPrevented = card.relicFirstHpLossPrevented || effect.prevented;
    card.relicReviveUsed = card.relicReviveUsed || effect.revived;
    card.playerBlock = Math.max(0, Math.floor(card.playerBlock || 0) - effect.playerBlockLoss);
    setCard(next, questionId, card);
  }
  if (questionId && (amount > 0 || manaDamage > 0)) {
    const card = { ...getCard(next, questionId) };
    card.enemyDebuffs = tickEnemyDebuffs(card.enemyDebuffs, ["weak"]);
    setCard(next, questionId, card);
  }
  if (effect.blocked || effect.prevented) {
    return effect;
  }
  next.profile.health = effect.revived ? effect.reviveHealth : Math.max(0, next.profile.health - effect.healthLoss);
  next.profile.mana = 0;
  return effect;
}

export const getHintCost = (state: StudyState, questionId?: string) => {
  if (areHintsDisabledByHeat(state.profile.spireRun)) {
    return HINT_MAX_COST;
  }
  const cardHintsBought = questionId ? getCard(state, questionId).hintsBought : 0;
  const freeHints = Math.max(0, Math.floor(getRunModifierTotals(state).freeHintPerRoom || 0));
  const hexPenalty = getPlayerDebuffStacks(state.profile.playerDebuffs, "hex") * HEX_HINT_COST_PENALTY;
  const confusedPenalty = getConfusedHintCostPenalty(state, questionId, cardHintsBought);
  if (questionId && cardHintsBought < freeHints) {
    return Math.min(HINT_MAX_COST, hexPenalty + confusedPenalty);
  }
  return Math.min(HINT_MAX_COST, HINT_COST + hexPenalty + confusedPenalty + cardHintsBought * HINT_COST_INCREMENT);
};

function getConfusedHintCostPenalty(state: StudyState, questionId: string | undefined, cardHintsBought: number) {
  const confusedStacks = getPlayerDebuffStacks(state.profile.playerDebuffs, "confused");
  if (!questionId || confusedStacks <= 0) {
    return 0;
  }
  const card = getCard(state, questionId);
  const rollCount = Math.min(CONFUSED_HINT_COST_ROLLS + confusedStacks - 1, CONFUSED_HINT_COST_ROLLS + 2);
  return Math.floor(getSeededRoll(`${questionId}:${card.attempts}:${cardHintsBought}:confused-hint-cost`) * rollCount) * CONFUSED_HINT_COST_STEP;
}

export const canBuyHint = (state: StudyState, questionId?: string) => !areHintsDisabledByHeat(state.profile.spireRun) && state.profile.coins >= getHintCost(state, questionId);

export function applyCombatStartRelics(state: StudyState, questionId: string): StudyState {
  const block = Math.max(0, Math.floor(getRunModifierTotals(state).combatStartBlock || 0));
  const heal = Math.max(0, Math.floor(getRunModifierTotals(state).combatStartHeal || 0));
  const enemyVulnerableSubmits = Math.max(0, Math.floor(getRunModifierTotals(state).enemyVulnerableSubmits || 0));
  const enemyWeakSubmits = Math.max(0, Math.floor(getRunModifierTotals(state).enemyWeakSubmits || 0));
  if (!questionId || (block <= 0 && heal <= 0 && enemyVulnerableSubmits <= 0 && enemyWeakSubmits <= 0)) {
    return state;
  }
  const card = getCard(state, questionId);
  if (card.relicCombatStartHealed) {
    return state;
  }
  const next = cloneState(state);
  const nextCard = { ...getCard(next, questionId), relicCombatStartHealed: true };
  if (heal > 0) {
    next.profile.health = Math.min(getMaxHealth(next), next.profile.health + applyHealingReceived(next, heal));
  }
  if (block > 0) {
    nextCard.playerBlock = Math.max(0, Math.floor(nextCard.playerBlock || 0)) + block;
  }
  nextCard.enemyDebuffs = addEnemyDebuffs(nextCard.enemyDebuffs, [
    ...(enemyVulnerableSubmits ? [{ id: "vulnerable" as const, remainingSubmits: enemyVulnerableSubmits, stacks: 1 }] : []),
    ...(enemyWeakSubmits ? [{ id: "weak" as const, remainingSubmits: enemyWeakSubmits, stacks: 1 }] : [])
  ]);
  setCard(next, questionId, nextCard);
  return next;
}

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
  const candidateQuestions = getCodingFilteredQuestions(state);
  const currentIndex = currentQuestion ? candidateQuestions.findIndex((question) => question.id === currentQuestion.id) : MISSING_INDEX;
  const sorted = getRatingSortedQuestions(state);
  const withinRatingLimit = sorted.filter((question) => question.rating <= ratingLimit);
  const unseenWithinLevel = candidateQuestions.filter((question) => {
    const card = getCard(state, question.id);
    return card.attempts === 0 && isQuestionRecommended(question, recommended, ratingLimit);
  });

  let picked = unseenWithinLevel[0] || withinRatingLimit[0] || sorted[0];
  if (preferNext) {
    const nextInOrder = candidateQuestions
      .slice(currentIndex + 1)
      .concat(candidateQuestions.slice(0, Math.max(0, currentIndex + 1)))
      .find((question) => question.id !== currentQuestion?.id && isQuestionRecommended(question, (recommended + 1) as Question["difficulty"], ratingLimit));
    picked = nextInOrder || picked;
  }

  return picked || sorted[0];
};

function getRatingSortedQuestions(state: StudyState) {
  const targetRating = getEstimatedRating(state) + RATING_TARGET_OFFSET;
  return [...getCodingFilteredQuestions(state)].sort((a, b) => {
    const cardA = getCard(state, a.id);
    const cardB = getCard(state, b.id);
    return cardA.correct - cardB.correct || getCodingQuestionWeight(state, b) - getCodingQuestionWeight(state, a) || Math.abs(a.rating - targetRating) - Math.abs(b.rating - targetRating) || a.rating - b.rating;
  });
}

export const isQuestionInRecommendedRange = (state: StudyState, question: Question, preferNext = false) => {
  const recommended = getRecommendedDifficulty(state);
  const ratingLimit = getEstimatedRating(state) + (preferNext ? NEXT_QUESTION_RATING_BUFFER : QUESTION_RATING_BUFFER);
  return isQuestionAllowedByCodingTags(state, question) && isQuestionRecommended(question, Math.min(MAX_DIFFICULTY, recommended + (preferNext ? 1 : 0)) as Question["difficulty"], ratingLimit);
};

function isQuestionAllowedByCodingTags(state: StudyState, question: Question) {
  return getCodingFilteredQuestions(state).some((candidate) => candidate.id === question.id);
}

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

export const applyScheduleResult = (state: StudyState, questionId: string, passed: boolean, draft: string, now = Date.now(), failureDamage = HEALTH_LOSS_PER_FAIL, failureManaDamage = 0, failureElement?: DamageType | null, failureDebuffs: PlayerDebuffApplication[] = [], failureMonsterBlockGain = 0) => {
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
    applyFailedSchedule(next, card, questionId, state, now, failureDamage, failureManaDamage, failureElement, failureDebuffs, failureMonsterBlockGain);
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
  card.playerBlock = 0;
  next.profile.playerDebuffs = tickPlayerDebuffsAfterSubmit(next.profile.playerDebuffs);
}

function applyQuestionRewards(next: StudyState, question: Question | undefined) {
  if (!question) {
    return;
  }
  addGoldAndApplyRelicHealing(next, getCoinReward(question, next));
  next.profile.experience += getExperienceReward(question, next);
  const leveled = grantPendingStatPoints(next);
  next.profile.statPoints = leveled.profile.statPoints;
  next.profile.statPointsAwardedLevel = leveled.profile.statPointsAwardedLevel;
  const modifiers = getRunModifierTotals(next);
  next.profile.health = Math.min(getMaxHealth(next), next.profile.health + applyHealingReceived(next, (modifiers.lifeOnKill || 0) + (modifiers.healthRegen || 0) + (modifiers.monsterDefeatHeal || 0) + getWarriorSkillBonusTotals(next).lifeOnKill));
  next.profile.metaProgress.currency += Math.max(0, Math.floor(modifiers.combatClearMeta || 0));
  applyLowHealthClearHeal(next, modifiers.lowHealthClearHeal || 0);
}

function addGoldAndApplyRelicHealing(next: StudyState, amount: number) {
  const gold = Math.max(0, Math.floor(amount || 0));
  if (gold <= 0) {
    return;
  }
  next.profile.coins += gold;
  const healPerGoldGain = Math.max(0, Math.floor(getRunModifierTotals(next).goldGainHeal || 0));
  if (healPerGoldGain > 0) {
    next.profile.health = Math.min(getMaxHealth(next), next.profile.health + applyHealingReceived(next, healPerGoldGain));
  }
}

function applyLowHealthClearHeal(next: StudyState, amount: number) {
  const heal = Math.max(0, Math.floor(amount || 0));
  const maxHealth = getMaxHealth(next);
  if (heal <= 0 || next.profile.health <= 0 || next.profile.health > maxHealth / 2) {
    return;
  }
  next.profile.health = Math.min(maxHealth, next.profile.health + applyHealingReceived(next, heal));
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
  const shopModifiers = getRunModifierTotals(next);
  next.profile.shopStock = createShopStock(question, getEffectiveCharacterStats(next), now, { bossRelicStock: shopModifiers.bossShopRelicStock, extraRelicStock: shopModifiers.shopRelicStock, maxItemLevel: getRewardItemLevelCap(next), relicRollState: next });
  next.profile.shopLastRefreshedAt = now;
}

function applyFailedSchedule(next: StudyState, card: CardState, questionId: string, state: StudyState, now: number, failureDamage: number, failureManaDamage: number, failureElement?: DamageType | null, failureDebuffs: PlayerDebuffApplication[] = [], failureMonsterBlockGain = 0) {
  const effect = applyIncomingDamageToState(next, state, failureDamage, failureManaDamage, questionId, failureElement);
  applyRelicFailureStack(next, questionId);
  const damageCard = getCard(next, questionId);
  card.playerBlock = damageCard.playerBlock;
  card.relicFirstHitBlocked = damageCard.relicFirstHitBlocked;
  card.relicFirstHpLossPrevented = damageCard.relicFirstHpLossPrevented;
  card.relicReviveUsed = damageCard.relicReviveUsed;
  next.profile.playerDebuffs = tickPlayerDebuffsAfterSubmit(next.profile.playerDebuffs);
  next.profile.playerDebuffs = addPlayerDebuffs(next.profile.playerDebuffs, filterResistedPlayerDebuffs(state, questionId, now, failureDebuffs));
  applyThornsDamage(next, state, questionId, effect.healthLoss);
  const thornsCard = getCard(next, questionId);
  card.monsterHealth = thornsCard.monsterHealth;
  card.monsterBlock = Math.max(0, Math.floor(card.monsterBlock || 0)) + Math.max(0, Math.floor(failureMonsterBlockGain || 0));
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
