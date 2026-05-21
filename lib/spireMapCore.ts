import { questions } from "../data/questions";
import {
  MAX_HEAT,
  createDefaultHeatConditions,
  getHeatBossMultiplier,
  getHeatEliteMultiplier,
  getHeatEliteQuestionBonus,
  getHeatExtraRoomQuestions,
  getHeatLevel,
  getHeatRelicChoicePenalty,
  getHeatRelicRerollPenalty,
  getNextSpireCampaignStage,
  getSpireCampaignRatingBonus,
  getSpireDifficultyModifiers,
  normalizeHeatConditions
} from "./campaignCore";
import { createDropItem, SLOT_STAT_BIAS } from "./itemCore";
import { getUniqueMonsterBonusCount } from "./monsterCore";
import { getPomEligibleRelics, grantRelic, rollRelic, upgradeRelicRarity } from "./relicCore";
import { createShopStock } from "./shopCore";
import { getMaxHealth, getMetaRelicChoiceBonus, getMetaStartingGoldBonus, getMetaStartingRelicCount, getRunModifierTotals } from "./studyCore";
import type { Difficulty, HeatConditionId, HeatConditionRanks, InventoryItem, ItemModifier, ItemRarity, Question, Relic, RelicRarity, SpireAct, SpireCombatRewardKind, SpireDifficulty, SpireMapNode, SpireNodeKind, SpireRun, StudyState, UnknownEncounterKind } from "../types/study";

const SPIRE_ACT_COUNT = 4;
const MIN_SPIRE_TOTAL_RATING_RANGE = 200;
const BASE_ACT_RATING_SPAN = 500;
const SPIRE_RATING_OFFSETS = [0, 40, 75, 115, 150, 190, 225, 265, 300, 340, 375, 415, 450, 475, 500] as const;
const QUESTION_BANK_RATINGS = questions.map((question) => question.rating).filter(Number.isFinite);
export const QUESTION_BANK_MIN_RATING = Math.min(...QUESTION_BANK_RATINGS);
export const QUESTION_BANK_MAX_RATING = Math.max(...QUESTION_BANK_RATINGS);
export const DEFAULT_SPIRE_MIN_RATING = Math.min(QUESTION_BANK_MAX_RATING, Math.max(QUESTION_BANK_MIN_RATING, 1500));
export const SPIRE_MIN_RATING_MIN = QUESTION_BANK_MIN_RATING;
export const SPIRE_MIN_RATING_MAX = Math.max(SPIRE_MIN_RATING_MIN, QUESTION_BANK_MAX_RATING - MIN_SPIRE_TOTAL_RATING_RANGE);
export const SPIRE_RATINGS = getSpireRatings(1, DEFAULT_SPIRE_MIN_RATING);

const FIRST_TIER = 0;
const FIRST_NODE_ID = "tier-0-start";
const FLOOR_ONE_INDEX = 0;
const FLOOR_FOUR_INDEX = 3;
const FLOOR_FIVE_INDEX = 4;
const FLOOR_SIX_INDEX = 5;
const FLOOR_SEVEN_INDEX = 6;
const GUARANTEED_TREASURE_MIN_FLOOR_INDEX = 7;
const GUARANTEED_TREASURE_MAX_FLOOR_INDEX = 9;
const FLOOR_FOURTEEN_INDEX = 13;
const BOSS_FLOOR_INDEX = 14;
const MIN_ROUND_QUESTION_COUNT = 2;
const MAX_ROUND_QUESTION_COUNT = 3;
const EXPERIENCE_PER_LEVEL = 150;
const MAX_CHARACTER_LEVEL = 100;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const REST_HEALTH_RATIO = 0.3;
const ENEMY_ROOM_ITEM_CHANCE = 0.3;
const ELITE_ROOM_HEALING_CHANCE = 0.18;
const ELITE_ROOM_ITEM_COUNT = 1;
const BOSS_ROOM_ITEM_COUNT = 2;
export const MERCHANT_UPGRADE_COST = 35;
const BASE_RELIC_CHOICE_COUNT = 3;
const ELITE_RELIC_CHOICE_BONUS = 1;
const BOSS_RELIC_CHOICE_BONUS = 1;
const BASE_RELIC_REROLLS = 1;
const TREASURE_RELIC_CHANCE = 0.35;
const EVENT_RELIC_CHANCE = 0.25;
const SKIP_META_COMMON = 3;
const SKIP_META_ELITE = 6;
const SKIP_META_BOSS = 10;
const EVENT_META_REWARD = 8;
const REST_ATTUNEMENT_ROOMS = 3;
const REST_ATTUNEMENT_MODIFIER_RATIO = 0.5;
const REST_ATTUNEMENT_MAX_MODIFIERS = 2;
const REST_ATTUNEMENT_FALLBACK_LIFE = 8;
const POTION_HEALTH_RATIO = 0.25;
const UNKNOWN_BLIGHT_WEIGHT = 1;
const UNKNOWN_MONSTER_WEIGHT = 1;
const UNKNOWN_TREASURE_WEIGHT = 1;
const UNKNOWN_SHOP_WEIGHT = 1;
const UNKNOWN_ELITE_WEIGHT = 1;
const MAP_X_MIN = 8;
const MAP_X_SPREAD = 84;
const FIRST_ROW_Y = 92;
const TOP_ROW_Y = 8;
const MAP_COLUMN_COUNT = 7;
const MIN_RANDOM_WALK_PATHS = 7;
const MAX_RANDOM_WALK_PATHS = 8;
const NODE_X_JITTER = 2;
const MAX_PATH_STEP = 1;
const MAX_NODE_NEXT_IDS = 3;
const MAX_STRAIGHT_CHAIN_EDGES = 1;
const COLUMN_0 = 0;
const COLUMN_1 = 1;
const COLUMN_2 = 2;
const COLUMN_3 = 3;
const COLUMN_4 = 4;
const COLUMN_5 = 5;
const COLUMN_6 = 6;
const BOSS_COLUMN = COLUMN_3;
const PATH_STEP_LEFT = -MAX_PATH_STEP;
const PATH_STEP_STRAIGHT = 0;
const PATH_STEP_RIGHT = MAX_PATH_STEP;
const EXCLUDE_LAST_FLOOR = -1;
const DEFAULT_FIRST_SLOT = 0;
const RANDOM_CENTER = 0.5;
const VARIED_PATH_MIN_SPAN = 2;
const STRAIGHT_CHAIN_SCORE_PENALTY = 10;
const EDGE_COLUMN_SCORE_PENALTY = 6;
const START_COLUMN_ORDER = [COLUMN_0, COLUMN_1, COLUMN_2, COLUMN_3, COLUMN_4, COLUMN_5, COLUMN_6] as const;
const START_NODE_COLUMNS = [COLUMN_1, COLUMN_3, COLUMN_5, COLUMN_2] as const;
const PATH_OFFSETS = [PATH_STEP_LEFT, PATH_STEP_STRAIGHT, PATH_STEP_RIGHT] as const;
const STRAIGHT_STEP_CHANCE = 0.45;
const DIAGONAL_STEP_CHANCE = 0.275;
const BRANCHING_TARGET_MIN = 1.8;
const BRANCHING_TARGET_MAX = 2.4;
const BRANCHING_VALID_MIN = 1.4;
const BRANCHING_VALID_MAX = 2.8;
const MIN_OCCUPANCY_RATIO = 0.5;
const MAX_OCCUPANCY_RATIO = 0.62;
const MIN_ADJACENT_CONNECTIVITY_RATIO = 0.85;
const MAP_GENERATION_ATTEMPTS = 80;
const MAP_ATTEMPT_SEED_STEP = 7919;
const ELITE_RATING_BOOST = 300;
const RATING_FIT_BASE = 5000;
const ELITE_BONUS_SORT_WEIGHT = 1000;
const MIN_ELITE_ROOM_COUNT = 4;
const MIN_REST_ROOM_COUNT = 4;
const UNKNOWN_ROOM_RATIO_CAP = 0.2;
const ROOM_KIND_WEIGHTS: Array<{ kind: SpireNodeKind; weight: number }> = [
  { kind: "enemy", weight: 52 },
  { kind: "unknown", weight: 22 },
  { kind: "rest", weight: 8 },
  { kind: "merchant", weight: 6 },
  { kind: "elite", weight: 7 },
  { kind: "treasure", weight: 4 }
];
const COMBAT_REWARD_WEIGHTS: Array<{ kind: SpireCombatRewardKind; weight: number }> = [
  { kind: "gold", weight: 44 },
  { kind: "insight", weight: 28 },
  { kind: "heart", weight: 16 },
  { kind: "pom", weight: 12 }
];
const CENTAUR_HEART_MAX_HEALTH = 25;
const POM_FALLBACK_META_REWARD = 6;
const UNKNOWN_ENCOUNTER_WEIGHTS: Record<UnknownEncounterKind, number> = {
  blight: UNKNOWN_BLIGHT_WEIGHT,
  elite: UNKNOWN_ELITE_WEIGHT,
  monster: UNKNOWN_MONSTER_WEIGHT,
  shop: UNKNOWN_SHOP_WEIGHT,
  treasure: UNKNOWN_TREASURE_WEIGHT
};
const ROOM_REWARD_ITEM_RARITY: Record<"enemy" | "elite" | "boss" | "treasure", { minRarity?: ItemRarity; rarityBonus: number }> = {
  boss: { minRarity: "rare", rarityBonus: 0.24 },
  elite: { minRarity: "rare", rarityBonus: 0.18 },
  enemy: { rarityBonus: 0 },
  treasure: { rarityBonus: 0.08 }
};
const ITEM_RARITY_ORDER: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
const MAX_MERCHANT_UPGRADE_RARITY: ItemRarity = "rare";
export type RestSpecialAction = "smith" | "attuneRelic";
const CONSECUTIVE_BLOCKED_KINDS: SpireNodeKind[] = ["elite", "merchant", "rest"];
const GUARANTEED_TREASURE_FLOORS = new Set([GUARANTEED_TREASURE_MIN_FLOOR_INDEX, GUARANTEED_TREASURE_MIN_FLOOR_INDEX + 1, GUARANTEED_TREASURE_MAX_FLOOR_INDEX]);

type PathEdge = {
  fromColumn: number;
  fromTier: number;
  toColumn: number;
};

type RelicRewardKind = NonNullable<SpireRun["pendingRelicReward"]>["rewardKind"];

export function normalizeSpireMinRating(value: number | undefined) {
  return Math.min(SPIRE_MIN_RATING_MAX, Math.max(SPIRE_MIN_RATING_MIN, Math.round(Number.isFinite(value) ? value || DEFAULT_SPIRE_MIN_RATING : DEFAULT_SPIRE_MIN_RATING)));
}

export function getSpireActBaseRating(act: SpireAct, minRating = DEFAULT_SPIRE_MIN_RATING) {
  const safeAct = normalizeSpireAct(act);
  const spireMinRating = normalizeSpireMinRating(minRating);
  const totalRange = Math.max(SPIRE_ACT_COUNT, QUESTION_BANK_MAX_RATING - spireMinRating);
  return Math.min(QUESTION_BANK_MAX_RATING, spireMinRating + Math.floor((totalRange * (safeAct - 1)) / SPIRE_ACT_COUNT));
}

export function getSpireActEndRating(act: SpireAct, minRating = DEFAULT_SPIRE_MIN_RATING) {
  const safeAct = normalizeSpireAct(act);
  const spireMinRating = normalizeSpireMinRating(minRating);
  const totalRange = Math.max(SPIRE_ACT_COUNT, QUESTION_BANK_MAX_RATING - spireMinRating);
  if (safeAct >= SPIRE_ACT_COUNT) {
    return QUESTION_BANK_MAX_RATING;
  }
  return Math.min(QUESTION_BANK_MAX_RATING, spireMinRating + Math.floor((totalRange * safeAct) / SPIRE_ACT_COUNT));
}

export function getSpireRatings(act: SpireAct = 1, minRating = DEFAULT_SPIRE_MIN_RATING) {
  const baseRating = getSpireActBaseRating(act, minRating);
  const endRating = getSpireActEndRating(act, minRating);
  const actSpan = Math.max(1, endRating - baseRating);
  return SPIRE_RATING_OFFSETS.map((offset) => baseRating + Math.round((actSpan * offset) / BASE_ACT_RATING_SPAN));
}

export function createSpireRun(seed = Date.now(), act: SpireAct = 1, difficulty: SpireDifficulty = "normal", heatConditions: Partial<HeatConditionRanks> = {}, heatSetupOpen = false, minRating = DEFAULT_SPIRE_MIN_RATING): SpireRun {
  const spireMinRating = normalizeSpireMinRating(minRating);
  const nodes = createSpireNodes(seed, getSpireRatings(act, spireMinRating));
  const availableNodeIds = nodes.filter((node) => node.tierIndex === FIRST_TIER).map((node) => node.id);
  const currentNodeId = availableNodeIds[DEFAULT_FIRST_SLOT] || nodes[0]?.id || FIRST_NODE_ID;
  return {
    act,
    availableNodeIds,
    completedNodeIds: [],
    currentNodeId,
    difficulty: "normal",
    failDamageStacks: 0,
    heatConditions: normalizeHeatConditions(heatConditions),
    heatSetupOpen,
    mapOpen: true,
    mapSeed: seed,
    maxHealthBonus: 0,
    nodes,
    pendingRelicReward: null,
    roomRewardClaims: {},
    roundQuestionIds: [],
    roundSolvedIds: [],
    runCodeQuestionIds: [],
    tierIndex: FIRST_TIER,
    unknownEncounterMisses: createDefaultUnknownEncounterMisses()
  };
}

// eslint-disable-next-line complexity
export function normalizeSpireRun(run: Partial<SpireRun> | undefined, minRating = DEFAULT_SPIRE_MIN_RATING): SpireRun {
  const act = normalizeSpireAct(run?.act);
  const spireMinRating = normalizeSpireMinRating(minRating);
  const mapSeed = Number.isFinite(run?.mapSeed) ? run?.mapSeed || Date.now() : Date.now();
  const normalizedNodes = normalizeCombatRewardKinds(normalizeForcedRoomKinds(normalizeNodeRatings(run?.nodes || [], act, spireMinRating)), mapSeed);
  if (!normalizedNodes.length || !hasRequiredSpireFloors(normalizedNodes)) {
    return createSpireRun(run?.mapSeed || Date.now(), act, normalizeSpireDifficulty(run?.difficulty), run?.heatConditions, Boolean(run?.heatSetupOpen), spireMinRating);
  }
  const sourceRun = run || {};
  const currentNode = normalizedNodes.find((node) => node.id === sourceRun.currentNodeId) || normalizedNodes[0];
  const availableNodeIds = (sourceRun.availableNodeIds?.length ? sourceRun.availableNodeIds : normalizedNodes.filter((node) => node.tierIndex === FIRST_TIER).map((node) => node.id))
    .filter((id) => normalizedNodes.some((node) => node.id === id));
  const knownQuestionIds = new Set(questions.map((question) => question.id));
  const roundQuestionIds = (sourceRun.roundQuestionIds || []).filter((id) => knownQuestionIds.has(id));
  const roundSolvedIds = (sourceRun.roundSolvedIds || []).filter((id) => roundQuestionIds.includes(id));
  return {
    act,
    availableNodeIds,
    completedNodeIds: sourceRun.completedNodeIds || [],
    currentNodeId: currentNode.id,
    difficulty: normalizeSpireDifficulty(sourceRun.difficulty),
    failDamageStacks: Math.max(0, Math.floor(sourceRun.failDamageStacks || 0)),
    heatConditions: normalizeHeatConditions(sourceRun.heatConditions),
    heatSetupOpen: typeof sourceRun.heatSetupOpen === "boolean" ? sourceRun.heatSetupOpen : shouldOpenHeatSetupForLegacyRun(sourceRun, roundQuestionIds, roundSolvedIds),
    mapOpen: typeof sourceRun.mapOpen === "boolean" ? sourceRun.mapOpen : true,
    mapSeed,
    maxHealthBonus: Math.max(0, Math.floor(sourceRun.maxHealthBonus || 0)),
    nodes: normalizedNodes,
    pendingRelicReward: normalizePendingRelicReward(sourceRun.pendingRelicReward),
    roomRewardClaims: normalizeRoomRewardClaims(sourceRun.roomRewardClaims),
    roundQuestionIds,
    roundSolvedIds,
    runCodeQuestionIds: (sourceRun.runCodeQuestionIds || []).filter((id) => knownQuestionIds.has(id)),
    tierIndex: Math.min(SPIRE_RATINGS.length - 1, Math.max(FIRST_TIER, Math.floor(sourceRun.tierIndex || FIRST_TIER))),
    unknownEncounterMisses: normalizeUnknownEncounterMisses(sourceRun.unknownEncounterMisses)
  };
}

function shouldOpenHeatSetupForLegacyRun(run: Partial<SpireRun>, roundQuestionIds: string[], roundSolvedIds: string[]) {
  return normalizeSpireAct(run.act) === 1
    && run.mapOpen !== false
    && !run.pendingRelicReward
    && !(run.completedNodeIds || []).length
    && !roundQuestionIds.length
    && !roundSolvedIds.length;
}

function hasRequiredSpireFloors(nodes: SpireMapNode[]) {
  return SPIRE_RATINGS.every((_rating, tierIndex) => nodes.some((node) => node.tierIndex === tierIndex));
}

function createDefaultUnknownEncounterMisses(): Record<UnknownEncounterKind, number> { return { blight: 0, elite: 0, monster: 0, shop: 0, treasure: 0 }; }

function normalizeSpireAct(value: SpireRun["act"] | undefined): SpireAct {
  return [1, 2, 3, 4].includes(Number(value)) ? Number(value) as SpireAct : 1;
}

function normalizeSpireDifficulty(value: SpireRun["difficulty"] | undefined): SpireDifficulty {
  return "normal";
}

function normalizeUnknownEncounterMisses(misses: Partial<Record<UnknownEncounterKind, number>> | undefined) {
  const fallback = createDefaultUnknownEncounterMisses();
  return Object.fromEntries(Object.entries(fallback).map(([kind, value]) => [
    kind,
    Math.max(0, Math.floor(Number(misses?.[kind as UnknownEncounterKind]) || value))
  ])) as Record<UnknownEncounterKind, number>;
}

function normalizeRoomRewardClaims(claims: SpireRun["roomRewardClaims"] | undefined) {
  return Object.fromEntries(Object.entries(claims || {}).map(([nodeId, claim]) => [
    nodeId,
    {
      gold: Number.isFinite(claim.gold) ? Math.max(0, Math.floor(claim.gold || 0)) : undefined,
      itemIds: Array.isArray(claim.itemIds) ? claim.itemIds.filter(Boolean) : undefined,
      maxHealth: Number.isFinite(claim.maxHealth) ? Math.max(0, Math.floor(claim.maxHealth || 0)) : undefined,
      metaCurrency: Number.isFinite(claim.metaCurrency) ? Math.max(0, Math.floor(claim.metaCurrency || 0)) : undefined,
      relicIds: Array.isArray(claim.relicIds) ? claim.relicIds.filter(Boolean) : undefined
    }
  ])) as SpireRun["roomRewardClaims"];
}

function normalizePendingRelicReward(choice: Partial<SpireRun["pendingRelicReward"]> | undefined): SpireRun["pendingRelicReward"] {
  if (!choice?.nodeId || !Array.isArray(choice.choices) || !choice.choices.length) {
    return null;
  }
  return {
    choices: choice.choices.filter((relic): relic is Relic => Boolean(relic?.id && relic.name)),
    nodeId: choice.nodeId,
    rerollsRemaining: Math.max(0, Math.floor(choice.rerollsRemaining || 0)),
    rewardKind: choice.rewardKind || "treasure",
    selectedRelicId: choice.selectedRelicId && choice.choices.some((relic) => relic.id === choice.selectedRelicId) ? choice.selectedRelicId : null,
    seed: choice.seed || `${choice.nodeId}:reward`,
    skipMetaCurrency: Math.max(0, Math.floor(choice.skipMetaCurrency || 0))
  };
}

function normalizeNodeRatings(nodes: SpireMapNode[], act: SpireAct, minRating: number) {
  const ratings = getSpireRatings(act, minRating);
  const sortedRatings = [...new Set(nodes.map((node) => node.rating))].sort((a, b) => a - b);
  return nodes.map((node) => {
    const tierIndex = getNodeTierIndex(node, sortedRatings);
    return {
      ...node,
      rating: ratings[tierIndex] ?? ratings[FIRST_TIER],
      tierIndex
    };
  });
}

function getNodeTierIndex(node: Partial<SpireMapNode>, sortedRatings?: number[]) {
  if (Number.isFinite(node.tierIndex)) {
    return Math.min(SPIRE_RATINGS.length - 1, Math.max(FIRST_TIER, Math.floor(node.tierIndex || FIRST_TIER)));
  }
  const idTier = typeof node.id === "string" ? /^tier-(\d+)-/.exec(node.id)?.[1] : undefined;
  if (idTier !== undefined) {
    return Math.min(SPIRE_RATINGS.length - 1, Math.max(FIRST_TIER, Math.floor(Number(idTier))));
  }
  const ratingIndex = sortedRatings?.findIndex((rating) => rating === node.rating) ?? SPIRE_RATINGS.findIndex((rating) => rating === node.rating);
  return Math.min(SPIRE_RATINGS.length - 1, Math.max(FIRST_TIER, ratingIndex));
}

function normalizeForcedRoomKinds(nodes: SpireMapNode[]) {
  return nodes.map((node) => {
    const tierIndex = node.tierIndex;
    const forced = tierIndex >= FIRST_TIER ? getForcedNodeKind(tierIndex) : null;
    return forced && node.kind !== forced ? { ...node, kind: forced } : node;
  });
}

function normalizeCombatRewardKinds(nodes: SpireMapNode[], seed: number) {
  const normalized = nodes.map((node) => isRewardedCombatNode(node)
    ? { ...node, rewardKind: isValidCombatRewardKind(node.rewardKind) ? node.rewardKind : rollCombatRewardKind(seed, node) }
    : { ...node, rewardKind: undefined });
  return ensurePomCombatReward(normalized, seed);
}

export function canEditSpireHeat(state: StudyState) {
  return isSpireHeatSetupOpen(state);
}

export function isSpireHeatSetupOpen(state: StudyState) {
  return state.profile.metaProgress.heatUnlocked && isSpireRunSetupOpen(state);
}

export function isSpireRunSetupOpen(state: StudyState) {
  const run = state.profile.spireRun;
  return run.heatSetupOpen
    && run.mapOpen
    && !run.pendingRelicReward
    && run.completedNodeIds.length === 0
    && run.roundQuestionIds.length === 0
    && run.roundSolvedIds.length === 0;
}

export function startSpireHeatRun(state: StudyState): StudyState {
  if (!isSpireRunSetupOpen(state)) {
    return state;
  }
  const openedState = {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        heatSetupOpen: false
      }
    }
  };
  const nextState = grantStartingRelics(openedState, `${openedState.profile.spireRun.mapSeed}:act-${openedState.profile.spireRun.act}`);
  return {
    ...nextState,
    profile: {
      ...nextState.profile,
      coins: getMetaStartingGoldBonus(nextState),
      health: getMaxHealth(nextState)
    }
  };
}

function grantStartingRelics(state: StudyState, seed: string): StudyState {
  let next = state;
  const relicCount = getMetaStartingRelicCount(state);
  for (let index = 0; index < relicCount; index += 1) {
    next = grantRelic(next, rollRelic(next, `${seed}:starter-relic:${index}`));
  }
  return next;
}

export function setSpireHeatConditionRank(state: StudyState, conditionId: HeatConditionId, rank: number): StudyState {
  if (!canEditSpireHeat(state)) {
    return state;
  }
  const current = normalizeHeatConditions(state.profile.spireRun.heatConditions);
  if (!(conditionId in current)) {
    return state;
  }
  const next = normalizeHeatConditions({ ...current, [conditionId]: rank });
  if (getHeatLevel(next) > MAX_HEAT) {
    return state;
  }
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        heatConditions: next
      }
    }
  };
}

export function resetSpireHeat(state: StudyState): StudyState {
  if (!canEditSpireHeat(state)) {
    return state;
  }
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        heatConditions: createDefaultHeatConditions()
      }
    }
  };
}

function isValidBranchingMap(nodes: SpireMapNode[]) {
  const tiers = [...new Set(nodes.map((node) => node.tierIndex))];
  if (tiers.length !== SPIRE_RATINGS.length) {
    return false;
  }
  return hasRequiredSpireFloors(nodes) && getMapValidators().every((validator) => validator(nodes));
}

function getMapValidators() {
  return [
    hasValidColumns,
    hasVariedPathLinks,
    hasLocalPathLinks,
    hasNoCrossedPathEdges,
    hasNoLongStraightPathChains,
    hasNoDeadRooms,
    hasNoHangingRooms,
    hasRequiredRoomDistribution,
    hasForcedRoomKinds,
    hasSingleBossRoom,
    hasValidNodeFanOut,
    hasValidOccupancy,
    hasEnoughAdjacentConnectivity,
    hasAverageBranchingInRange,
    hasEveryStartReachBoss,
    hasRequiredRouteRiskMix
  ];
}

function hasValidNodeFanOut(nodes: SpireMapNode[]) {
  return nodes.every((node) => node.nextIds.length <= MAX_NODE_NEXT_IDS);
}

function hasRequiredRoomDistribution(nodes: SpireMapNode[]) {
  return nodes.filter((node) => node.kind === "elite").length >= MIN_ELITE_ROOM_COUNT
    && nodes.filter((node) => node.kind === "rest").length >= MIN_REST_ROOM_COUNT
    && nodes.filter((node) => node.kind === "unknown").length <= getUnknownRoomCap(nodes)
    && hasSingleGuaranteedTreasure(nodes)
    && hasNoEarlySpecialRooms(nodes)
    && hasValidShopSpacing(nodes)
    && hasValidCampfireSpacing(nodes)
    && hasSupportedEliteRooms(nodes)
    && hasNoConsecutiveSpecialRooms(nodes);
}

function hasForcedRoomKinds(nodes: SpireMapNode[]) {
  return nodes.every((node) => {
    const forced = node.tierIndex >= FIRST_TIER ? getForcedNodeKind(node.tierIndex) : null;
    return !forced || node.kind === forced;
  });
}

function hasSingleBossRoom(nodes: SpireMapNode[]) { const bossNodes = nodes.filter((node) => node.tierIndex === BOSS_FLOOR_INDEX); return bossNodes.length === 1 && bossNodes[0]?.kind === "boss" && bossNodes[0].column === BOSS_COLUMN; }

function getUnknownRoomCap(nodes: SpireMapNode[]) { return Math.max(1, Math.floor(nodes.length * UNKNOWN_ROOM_RATIO_CAP)); }

function hasValidColumns(nodes: SpireMapNode[]) { return nodes.every((node) => Number.isInteger(node.column) && node.column >= 0 && node.column < MAP_COLUMN_COUNT); }

function hasValidOccupancy(nodes: SpireMapNode[]) {
  const occupancy = nodes.length / (SPIRE_RATINGS.length * MAP_COLUMN_COUNT);
  return occupancy >= MIN_OCCUPANCY_RATIO && occupancy <= MAX_OCCUPANCY_RATIO;
}

function hasEnoughAdjacentConnectivity(nodes: SpireMapNode[]) {
  const connectedPairs = SPIRE_RATINGS.slice(FIRST_TIER, EXCLUDE_LAST_FLOOR).filter((_rating, tierIndex) => {
    const currentFloorNodes = nodes.filter((node) => node.tierIndex === tierIndex);
    const nextFloorIds = new Set(nodes.filter((node) => node.tierIndex === tierIndex + 1).map((node) => node.id));
    return currentFloorNodes.length > 0 && currentFloorNodes.every((node) => node.nextIds.some((id) => nextFloorIds.has(id)));
  }).length;
  return connectedPairs / Math.max(1, SPIRE_RATINGS.length - 1) >= MIN_ADJACENT_CONNECTIVITY_RATIO;
}

function hasAverageBranchingInRange(nodes: SpireMapNode[]) {
  const average = getAverageBranchingFactor(nodes);
  return average >= BRANCHING_VALID_MIN && average <= BRANCHING_VALID_MAX;
}

function getAverageBranchingFactor(nodes: SpireMapNode[]) {
  const branchingNodes = nodes.filter((node) => node.tierIndex !== BOSS_FLOOR_INDEX);
  return branchingNodes.reduce((sum, node) => sum + node.nextIds.length, 0) / Math.max(1, branchingNodes.length);
}

function hasSingleGuaranteedTreasure(nodes: SpireMapNode[]) {
  return nodes.filter((node) => GUARANTEED_TREASURE_FLOORS.has(node.tierIndex) && node.kind === "treasure").length === 1;
}

function hasNoEarlySpecialRooms(nodes: SpireMapNode[]) {
  return nodes.every((node) => {
    const tierIndex = node.tierIndex;
    if ((node.kind === "elite" || node.kind === "rest") && tierIndex < FLOOR_SIX_INDEX) {
      return false;
    }
    if (node.kind === "treasure" && tierIndex < FLOOR_FIVE_INDEX) {
      return false;
    }
    if (node.kind === "merchant" && tierIndex < FLOOR_FOUR_INDEX) {
      return false;
    }
    return !(node.kind === "elite" && tierIndex < FLOOR_SEVEN_INDEX);
  });
}

function hasValidShopSpacing(nodes: SpireMapNode[]) {
  return SPIRE_RATINGS.every((_rating, tierIndex) => {
    const spanStart = Math.max(FIRST_TIER, tierIndex - 4);
    return nodes.filter((node) => {
      return node.kind === "merchant" && node.tierIndex >= spanStart && node.tierIndex <= tierIndex;
    }).length <= 2;
  });
}

function hasValidCampfireSpacing(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return nodes.every((node) => node.kind !== "rest" || !getAncestorNodesWithinFloors(nodes, node, 2).some((ancestor) => ancestor.kind === "rest") && !node.nextIds.some((id) => {
    const next = byId.get(id);
    return next?.kind === "rest";
  }));
}

function hasSupportedEliteRooms(nodes: SpireMapNode[]) {
  const elites = nodes.filter((node) => node.kind === "elite");
  if (!elites.length) {
    return false;
  }
  const supported = elites.filter((node) => getAncestorNodesWithinFloors(nodes, node, 3).some((ancestor) => ancestor.kind === "rest"));
  return supported.length / elites.length >= 0.6;
}

function hasNoConsecutiveSpecialRooms(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return nodes.every((node) => !CONSECUTIVE_BLOCKED_KINDS.includes(node.kind) || node.nextIds.every((id) => {
    const next = byId.get(id);
    return !next || next.tierIndex >= BOSS_FLOOR_INDEX || !CONSECUTIVE_BLOCKED_KINDS.includes(next.kind);
  }));
}

function hasVariedPathLinks(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const deltas = nodes.flatMap((node) => node.nextIds.map((id) => Math.round((byId.get(id)?.x || node.x) - node.x)));
  return new Set(deltas).size > VARIED_PATH_MIN_SPAN;
}

function hasLocalPathLinks(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return nodes.every((node) => node.nextIds.every((id) => {
    const next = byId.get(id);
    return next && next.tierIndex > node.tierIndex && (next.tierIndex === BOSS_FLOOR_INDEX || Math.abs(next.column - node.column) <= MAX_PATH_STEP);
  }));
}

function hasNoCrossedPathEdges(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const tierIndex of SPIRE_RATINGS.slice(0, EXCLUDE_LAST_FLOOR).map((_rating, index) => index)) {
    const edges = nodes
      .filter((node) => node.tierIndex === tierIndex)
      .flatMap((node) => node.nextIds.map((id) => {
        const next = byId.get(id);
        return next ? { fromColumn: node.column, toColumn: next.column } : null;
      }))
      .filter((edge): edge is { fromColumn: number; toColumn: number } => Boolean(edge));
    if (edges.some((edge, index) => edges.slice(index + 1).some((other) => doEdgesCross(edge.fromColumn, edge.toColumn, other.fromColumn, other.toColumn)))) {
      return false;
    }
  }
  return true;
}

function hasNoLongStraightPathChains(nodes: SpireMapNode[]) {
  const incomingById = new Map<string, SpireMapNode[]>();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    for (const nextId of node.nextIds) {
      const incoming = incomingById.get(nextId) || [];
      incoming.push(node);
      incomingById.set(nextId, incoming);
    }
  }
  return nodes.every((node) => {
    const previousSameColumn = (incomingById.get(node.id) || []).some((previous) => previous.column === node.column);
    const nextSameColumn = node.nextIds.some((id) => byId.get(id)?.column === node.column);
    return !(previousSameColumn && nextSameColumn);
  });
}

function hasNoDeadRooms(nodes: SpireMapNode[]) {
  const incomingIds = new Set(nodes.flatMap((node) => node.nextIds));
  return nodes.every((node) => node.tierIndex === FIRST_TIER || incomingIds.has(node.id));
}

function hasNoHangingRooms(nodes: SpireMapNode[]) { return nodes.every((node) => node.tierIndex === BOSS_FLOOR_INDEX || node.nextIds.length > 0); }

function hasEveryStartReachBoss(nodes: SpireMapNode[]) {
  return getStartNodes(nodes).every((node) => canReachBoss(nodes, node.id));
}

function hasRequiredRouteRiskMix(nodes: SpireMapNode[]) {
  const starts = getStartNodes(nodes);
  const requiredLowRiskStarts = Math.ceil(starts.length * 0.25);
  const requiredOptionalEliteStarts = Math.ceil(starts.length * 0.3);
  const lowRiskStarts = starts.filter((node) => canReachBoss(nodes, node.id, { avoidElite: true })).length;
  const optionalEliteStarts = starts.filter((node) => canReachBoss(nodes, node.id, { requireElite: true }) && canReachBoss(nodes, node.id, { avoidElite: true })).length;
  return lowRiskStarts >= requiredLowRiskStarts && optionalEliteStarts >= requiredOptionalEliteStarts;
}

function getStartNodes(nodes: SpireMapNode[]) {
  return nodes.filter((node) => node.tierIndex === FIRST_TIER);
}

function canReachBoss(nodes: SpireMapNode[], startId: string, options: { avoidElite?: boolean; requireElite?: boolean } = {}) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const stack = [{ id: startId, seenElite: false }];
  const visited = new Set<string>();
  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const node = byId.get(current.id);
    if (!node) {
      continue;
    }
    const seenElite = current.seenElite || node.kind === "elite";
    if (options.avoidElite && seenElite) {
      continue;
    }
    const key = `${node.id}:${seenElite}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    if (node.kind === "boss") {
      return !options.requireElite || seenElite;
    }
    for (const nextId of node.nextIds) {
      stack.push({ id: nextId, seenElite });
    }
  }
  return false;
}

export function getCurrentSpireNode(state: StudyState) { return state.profile.spireRun.nodes.find((node) => node.id === state.profile.spireRun.currentNodeId) || state.profile.spireRun.nodes[0]; }

export function getCurrentRoundQuestion(state: StudyState, currentQuestion: Question | null) {
  if (state.profile.spireRun.mapOpen) {
    return currentQuestion || questions[0];
  }
  const unsolved = state.profile.spireRun.roundQuestionIds.find((id) => !state.profile.spireRun.roundSolvedIds.includes(id));
  return questions.find((question) => question.id === unsolved) || currentQuestion || questions[0];
}

export function completeSpireQuestion(state: StudyState, question: Question, now = Date.now()) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode || state.profile.spireRun.mapOpen || !state.profile.spireRun.roundQuestionIds.length) {
    return state;
  }
  const solved = Array.from(new Set([...state.profile.spireRun.roundSolvedIds, question.id]));
  const next = {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        roundSolvedIds: solved
      }
    }
  };
  if (solved.length < state.profile.spireRun.roundQuestionIds.length) {
    return next;
  }
  return completeSpireNode(next, currentNode, now);
}

export function chooseNextSpireQuestion(state: StudyState, fallback: Question | null) {
  return getCurrentRoundQuestion(state, fallback);
}

export function claimSpireNodeReward(state: StudyState, now = Date.now()) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode) {
    return state;
  }
  if (currentNode.kind === "unknown") {
    return state;
  }
  if (currentNode.kind === "enemy") {
    return applyEnemyRoomReward(state, currentNode, now);
  }
  if (currentNode.kind === "elite") {
    return applyEliteRoomReward(state, currentNode, now);
  }
  if (currentNode.kind === "boss") {
    return applyBossRoomReward(state, currentNode, now);
  }
  if (currentNode.kind === "treasure") {
    return applyTreasureRoomReward(state, currentNode, now);
  }
  if (currentNode.kind === "merchant") {
    return applyMerchantRoomReward(state, currentNode, now);
  }
  if (currentNode.kind === "rest") {
    return applyRestRoomReward(state);
  }
  if (currentNode.kind === "event") {
    return applyEventRoomReward(state, currentNode, now);
  }
  if (currentNode.kind === "blight") {
    return applyBlightRoomReward(state, currentNode, now);
  }
  return state;
}

function applyEnemyRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const rewardKind = getCombatRewardKind(node);
  if (rewardKind === "insight") {
    const metaCurrency = getRoomMetaCurrency(state, node, now);
    return recordRoomRewardClaim(addMetaCurrency(state, metaCurrency), node.id, { metaCurrency });
  }
  if (rewardKind === "heart") {
    return recordRoomRewardClaim(addCentaurHeartReward(state), node.id, { maxHealth: CENTAUR_HEART_MAX_HEALTH });
  }
  if (rewardKind === "pom") {
    return applyPomReward(state, node, now);
  }
  const gold = getRoomGold(state, node, "enemy", now);
  return recordRoomRewardClaim(addRoomGold(state, gold), node.id, { gold });
}

function applyPomReward(state: StudyState, node: SpireMapNode, now: number) {
  const candidates = getPomEligibleRelics(state);
  if (!candidates.length) {
    return recordRoomRewardClaim(addMetaCurrency(state, POM_FALLBACK_META_REWARD), node.id, { metaCurrency: POM_FALLBACK_META_REWARD });
  }
  const relic = candidates[Math.floor(getRoll(`${node.id}:${now}:pom-relic`) * candidates.length)];
  const upgraded = upgradeRelicRarity(relic);
  return {
    ...state,
    profile: {
      ...state.profile,
      relics: state.profile.relics.map((relicItem) => relicItem.id === relic.id ? upgraded : relicItem)
    }
  };
}

function addCentaurHeartReward(state: StudyState) {
  const maxHealthBonus = Math.max(0, Math.floor(state.profile.spireRun.maxHealthBonus || 0)) + CENTAUR_HEART_MAX_HEALTH;
  return {
    ...state,
    profile: {
      ...state.profile,
      health: state.profile.health + CENTAUR_HEART_MAX_HEALTH,
      spireRun: {
        ...state.profile.spireRun,
        maxHealthBonus
      }
    }
  };
}

function applyEliteRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const withGold = grantRoomGold(state, node, "elite", now);
  const withRelicChoice = createPendingRelicReward(withGold, node, now, "elite", {
    choiceBonus: ELITE_RELIC_CHOICE_BONUS,
    minRarity: ["common", "uncommon", "rare", "unique"],
    skipMetaCurrency: SKIP_META_ELITE
  });
  return maybeApplyHealingReward(withRelicChoice, node, now, "elite");
}

function applyBossRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const withGold = grantRoomGold(state, node, "boss", now);
  const withRelicChoice = createPendingRelicReward(withGold, node, now, "boss", {
    choiceBonus: BOSS_RELIC_CHOICE_BONUS,
    minRarity: ["boss"],
    skipMetaCurrency: SKIP_META_BOSS
  });
  return applyPotionReward(withRelicChoice, "health", node, now, "boss-health");
}

function applyTreasureRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const gold = getRoomGold(state, node, "treasure", now);
  const withGold = addRoomGold(state, gold);
  if (getRoll(`${node.id}:${now}:treasure-relic`) < TREASURE_RELIC_CHANCE) {
    return recordRoomRewardClaim(createPendingRelicReward(withGold, node, now, "treasure", { skipMetaCurrency: SKIP_META_COMMON }), node.id, { gold });
  }
  const metaCurrency = getRoomMetaCurrency(state, node, now);
  return recordRoomRewardClaim(addMetaCurrency(withGold, metaCurrency), node.id, { gold, metaCurrency });
}

function applyMerchantRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const question = createRoomRewardQuestion(state, node, "merchant", now, "merchant");
  return {
    ...state,
    profile: {
      ...state.profile,
      shopLastRefreshedAt: now,
      shopStock: createShopStock(question, state.profile.stats, now, { extraRelicStock: getRunModifierTotals(state).shopRelicStock, maxItemLevel: getStateLevel(state), relicRollState: state })
    }
  };
}

function applyRestRoomReward(state: StudyState) {
  const maxHealth = getMaxHealth(state);
  return {
    ...state,
    profile: {
      ...state.profile,
      health: Math.min(maxHealth, state.profile.health + Math.floor(maxHealth * REST_HEALTH_RATIO))
    }
  };
}

function applyEventRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  if (getRoll(`${node.id}:${now}:event-reward`) < EVENT_RELIC_CHANCE) {
    return createPendingRelicReward(state, node, now, "event", { minRarity: ["event", "rare"], skipMetaCurrency: SKIP_META_ELITE });
  }
  const withMeta = addMetaCurrency(state, EVENT_META_REWARD);
  return recordRoomRewardClaim(withMeta, node.id, { metaCurrency: EVENT_META_REWARD });
}

function applyBlightRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  return createPendingRelicReward(state, node, now, "blight", {
    minRarity: ["blight"],
    rerolls: 0,
    skipMetaCurrency: 0
  });
}

export function getRestSpecialAction(state: StudyState): RestSpecialAction {
  const currentNode = getCurrentSpireNode(state);
  const seed = `${state.profile.spireRun.mapSeed}:${currentNode?.id || "rest"}:rest-special`;
  return getRoll(seed) < 0.5 ? "smith" : "attuneRelic";
}

export function canUpgradeSpireInventoryItem(state: StudyState) {
  return state.profile.inventory.some(canUpgradeItemRarity);
}

export function getRestAttunableRelics(state: StudyState) {
  return getPomEligibleRelics(state);
}

function upgradeRandomEligibleItem(state: StudyState): StudyState {
  const candidates = state.profile.inventory.filter(canUpgradeItemRarity);
  const item = candidates[Math.floor(getRoll(`${state.profile.spireRun.currentNodeId || "inventory"}:${state.profile.coins}:${candidates.length}:upgrade`) * candidates.length)];
  if (!item) {
    return state;
  }
  const upgraded = upgradeItemTier(item);
  return {
    ...state,
    profile: {
      ...state.profile,
      inventory: state.profile.inventory.map((inventoryItem) => inventoryItem.id === item.id ? upgraded : inventoryItem)
    }
  };
}

function canUpgradeItemRarity(item: InventoryItem) {
  return ITEM_RARITY_ORDER.indexOf(item.rarity) < ITEM_RARITY_ORDER.indexOf(MAX_MERCHANT_UPGRADE_RARITY);
}

function upgradeItemTier(item: InventoryItem): InventoryItem {
  const currentIndex = ITEM_RARITY_ORDER.indexOf(item.rarity);
  const maxIndex = ITEM_RARITY_ORDER.indexOf(MAX_MERCHANT_UPGRADE_RARITY);
  const nextRarity = ITEM_RARITY_ORDER[Math.min(maxIndex, Math.max(0, currentIndex) + 1)] || item.rarity;
  const primaryStat = SLOT_STAT_BIAS[item.slot];
  return {
    ...item,
    rarity: nextRarity,
    stats: {
      ...item.stats,
      [primaryStat]: (item.stats[primaryStat] || 0) + 1
    }
  };
}

function rollUnknownEncounter(state: StudyState, node: SpireMapNode, now: number): UnknownEncounterKind {
  const misses = normalizeUnknownEncounterMisses(state.profile.spireRun.unknownEncounterMisses);
  const weightedOutcomes = (Object.keys(UNKNOWN_ENCOUNTER_WEIGHTS) as UnknownEncounterKind[]).map((kind) => ({
    kind,
    weight: UNKNOWN_ENCOUNTER_WEIGHTS[kind] * (misses[kind] + 1)
  }));
  const totalWeight = weightedOutcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
  let cursor = getRoll(`${node.id}:${now}:unknown-encounter`) * totalWeight;
  for (const outcome of weightedOutcomes) {
    cursor -= outcome.weight;
    if (cursor <= 0) {
      return outcome.kind;
    }
  }
  return "monster";
}

function updateUnknownEncounterMisses(state: StudyState, seen: UnknownEncounterKind): StudyState {
  const current = normalizeUnknownEncounterMisses(state.profile.spireRun.unknownEncounterMisses);
  const nextMisses = Object.fromEntries((Object.keys(UNKNOWN_ENCOUNTER_WEIGHTS) as UnknownEncounterKind[]).map((kind) => [
    kind,
    kind === seen ? 0 : current[kind] + 1
  ])) as Record<UnknownEncounterKind, number>;
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        unknownEncounterMisses: nextMisses
      }
    }
  };
}

function grantRoomGold(state: StudyState, node: SpireMapNode, kind: SpireNodeKind, now: number) {
  return addRoomGold(state, getRoomGold(state, node, kind, now));
}

function rollRoomGold(node: SpireMapNode, kind: SpireNodeKind, now: number) {
  const base = getRoomGoldBase(node, kind);
  const spread = Math.max(4, Math.floor(base * 0.35));
  return base + Math.floor(getRoll(`${node.id}:${now}:${kind}:gold`) * (spread + 1));
}

function getRoomGold(state: StudyState, node: SpireMapNode, kind: SpireNodeKind, now: number) {
  return Math.round(rollRoomGold(node, kind, now) * getSpireDifficultyModifiers(state.profile.spireRun).rewardMultiplier);
}

function getRoomMetaCurrency(state: StudyState, node: SpireMapNode, now: number) {
  const base = 3 + Math.floor(node.tierIndex / 4);
  const bonus = Math.floor(getRoll(`${node.id}:${now}:insight`) * 3);
  return Math.max(1, Math.round((base + bonus) * getSpireDifficultyModifiers(state.profile.spireRun).rewardMultiplier));
}

function addRoomGold(state: StudyState, gold: number) {
  return {
    ...state,
    profile: {
      ...state.profile,
      coins: state.profile.coins + gold
    }
  };
}

function recordRoomRewardClaim(state: StudyState, nodeId: string, claim: SpireRun["roomRewardClaims"][string]) {
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        roomRewardClaims: {
          ...state.profile.spireRun.roomRewardClaims,
          [nodeId]: claim
        }
      }
    }
  };
}

function createPendingRelicReward(
  state: StudyState,
  node: SpireMapNode,
  now: number,
  rewardKind: RelicRewardKind,
  options: { choiceBonus?: number; minRarity?: RelicRarity[]; rerolls?: number; skipMetaCurrency?: number } = {}
) {
  const seed = `${node.id}:${now}:${rewardKind}:relic-choice`;
  const forcedBlight = rewardKind === "blight";
  const choiceCount = Math.max(1, BASE_RELIC_CHOICE_COUNT + getMetaRelicChoiceBonus(state) + getRunModifierTotals(state).relicChoiceBonus + (options.choiceBonus || 0) - getHeatRelicChoicePenalty(state.profile.spireRun, rewardKind));
  const rerollsRemaining = forcedBlight ? 0 : Math.max(0, (options.rerolls ?? BASE_RELIC_REROLLS) + Math.max(0, Math.floor(getRunModifierTotals(state).relicRerollBonus || 0)) - getHeatRelicRerollPenalty(state.profile.spireRun));
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        pendingRelicReward: {
          choices: rollRelicChoices(state, seed, choiceCount, options.minRarity),
          nodeId: node.id,
          rerollsRemaining,
          rewardKind,
          selectedRelicId: null,
          seed,
          skipMetaCurrency: forcedBlight ? 0 : (options.skipMetaCurrency ?? SKIP_META_COMMON) + Math.max(0, Math.floor(getRunModifierTotals(state).skipRelicMetaBonus || 0))
        }
      }
    }
  };
}

function rollRelicChoices(state: StudyState, seed: string, count: number, minRarity?: RelicRarity[]) {
  let nextState = state;
  const choices: Relic[] = [];
  for (let index = 0; choices.length < count && index < count * 6; index += 1) {
    const relic = rollRelic(nextState, `${seed}:${index}`, { includeBlights: minRarity?.includes("blight"), includeEvents: minRarity?.includes("event"), maxItemLevel: getStateLevel(state), minRarity });
    if (choices.some((choice) => choice.id === relic.id)) {
      continue;
    }
    choices.push(relic);
    nextState = grantRelic(nextState, relic);
  }
  return choices;
}

export function selectPendingRelicReward(state: StudyState, relicId: string) {
  const pending = state.profile.spireRun.pendingRelicReward;
  if (!pending || !pending.choices.some((choice) => choice.id === relicId)) {
    return state;
  }
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        pendingRelicReward: {
          ...pending,
          selectedRelicId: relicId
        }
      }
    }
  };
}

export function choosePendingRelicReward(state: StudyState, relicId: string) {
  const pending = state.profile.spireRun.pendingRelicReward;
  const relic = pending?.choices.find((choice) => choice.id === relicId);
  if (!pending || !relic) {
    return state;
  }
  const withRelic = grantRelic(state, relic);
  return recordRoomRewardClaim(clearPendingRelicReward(withRelic), pending.nodeId, {
    ...state.profile.spireRun.roomRewardClaims[pending.nodeId],
    relicIds: [relic.id]
  });
}

export function skipPendingRelicReward(state: StudyState) {
  const pending = state.profile.spireRun.pendingRelicReward;
  if (!pending) {
    return state;
  }
  if (pending.rewardKind === "blight") {
    return state;
  }
  const metaCurrency = pending.skipMetaCurrency;
  const withMeta = addMetaCurrency(state, metaCurrency);
  return recordRoomRewardClaim(clearPendingRelicReward(withMeta), pending.nodeId, {
    ...state.profile.spireRun.roomRewardClaims[pending.nodeId],
    metaCurrency
  });
}

export function rerollPendingRelicReward(state: StudyState) {
  const pending = state.profile.spireRun.pendingRelicReward;
  if (!pending || pending.rerollsRemaining <= 0) {
    return state;
  }
  const seed = `${pending.seed}:reroll:${pending.rerollsRemaining}`;
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        pendingRelicReward: {
          ...pending,
          choices: rollRelicChoices(state, seed, pending.choices.length, getRelicChoiceRarities(pending.rewardKind)),
          rerollsRemaining: pending.rerollsRemaining - 1,
          selectedRelicId: null,
          seed
        }
      }
    }
  };
}

function getRelicChoiceRarities(kind: RelicRewardKind): RelicRarity[] | undefined {
  if (kind === "boss") {
    return ["boss"];
  }
  if (kind === "elite") {
    return ["common", "uncommon", "rare", "unique"];
  }
  if (kind === "event") {
    return ["event", "rare"];
  }
  if (kind === "blight") {
    return ["blight"];
  }
  return undefined;
}

function clearPendingRelicReward(state: StudyState): StudyState {
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        pendingRelicReward: null
      }
    }
  };
}

function addMetaCurrency(state: StudyState, amount: number): StudyState {
  const earned = Math.max(0, Math.floor(amount || 0));
  if (!earned) {
    return state;
  }
  return {
    ...state,
    profile: {
      ...state.profile,
      metaProgress: {
        ...state.profile.metaProgress,
        currency: state.profile.metaProgress.currency + earned,
        totalEarned: state.profile.metaProgress.totalEarned + earned,
        upgrades: { ...state.profile.metaProgress.upgrades }
      }
    }
  };
}

function getRoomGoldBase(node: SpireMapNode, kind: SpireNodeKind) {
  const floorIndex = node.tierIndex;
  if (kind === "boss") {
    return 95 + floorIndex * 8;
  }
  if (kind === "elite") {
    return 42 + floorIndex * 5;
  }
  if (kind === "treasure") {
    return 28 + floorIndex * 4;
  }
  return 14 + floorIndex * 3;
}

function maybeGrantRoomItem(state: StudyState, node: SpireMapNode, now: number, kind: "enemy" | "treasure", chance: number) {
  if (getRoll(`${node.id}:${now}:${kind}:item-chance`) > chance) {
    return state;
  }
  return grantRoomItems(state, node, now, kind, 1);
}

function grantRoomItems(state: StudyState, node: SpireMapNode, now: number, kind: "enemy" | "elite" | "boss" | "treasure", count: number) {
  const items = Array.from({ length: count }, (_unused, index) => createRoomRewardItem(state, node, now, kind, index));
  return {
    ...state,
    profile: {
      ...state.profile,
      inventory: [...state.profile.inventory, ...items]
    }
  };
}

function createRoomRewardItem(state: StudyState, node: SpireMapNode, now: number, kind: "enemy" | "elite" | "boss" | "treasure", index: number) {
  const question = createRoomRewardQuestion(state, node, kind, now, `${kind}-item-${index}`);
  const rarity = ROOM_REWARD_ITEM_RARITY[kind];
  return createDropItem(question, state.profile.stats, now + index, { ...rarity, maxItemLevel: getStateLevel(state) });
}

function getStateLevel(state: StudyState) {
  return 1;
}

function createRoomRewardQuestion(state: StudyState, node: SpireMapNode, kind: string, now: number, suffix: string): Question {
  return {
    ...questions[0],
    difficulty: getRoomRewardDifficulty(node, kind),
    id: `${node.id}-${now}-${suffix}`,
    rating: getEffectiveSpireRating(state.profile.spireRun, node.rating),
    title: `${kind} room reward`
  };
}

function getRoomRewardDifficulty(node: SpireMapNode, kind: string): Difficulty {
  if (kind === "boss") {
    return 5;
  }
  if (kind === "elite") {
    return Math.min(5, Math.max(3, Math.ceil(node.tierIndex / 3))) as Difficulty;
  }
  return Math.min(5, Math.max(1, Math.ceil((node.tierIndex + 1) / 3))) as Difficulty;
}

function maybeApplyHealingReward(state: StudyState, node: SpireMapNode, now: number, kind: string) {
  if (getRoll(`${node.id}:${now}:${kind}:healing`) > ELITE_ROOM_HEALING_CHANCE) {
    return state;
  }
  return applyPotionReward(state, "health", node, now, `${kind}-health`);
}

function applyPotionReward(state: StudyState, type: "health", _node: SpireMapNode, _now: number, _key: string) {
  const maxHealth = getMaxHealth(state);
  return {
    ...state,
    profile: {
      ...state.profile,
      health: Math.min(maxHealth, state.profile.health + Math.max(1, Math.floor(maxHealth * POTION_HEALTH_RATIO)))
    }
  };
}

export function advanceSpireNode(state: StudyState, now = Date.now()) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode) {
    return state;
  }
  return completeSpireNode(state, currentNode, now);
}

export function leaveSpireRoom(state: StudyState, now = Date.now()) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode || state.profile.spireRun.mapOpen || state.profile.spireRun.pendingRelicReward) {
    return state;
  }
  return completeSpireNode(markSpireRoomRewardClaimed(state, currentNode.id), currentNode, now, false);
}

export function claimCurrentSpireRoomReward(state: StudyState, now = Date.now()) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode || state.profile.spireRun.mapOpen || state.profile.spireRun.pendingRelicReward || isSpireRoomRewardClaimed(state, currentNode.id)) {
    return state;
  }
  if (currentNode.kind === "merchant") {
    return markSpireRoomRewardClaimed(state, currentNode.id);
  }
  return markSpireRoomRewardClaimed(claimSpireNodeReward(state, now), currentNode.id);
}

export function upgradeCurrentSpireRoomItem(state: StudyState) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode || state.profile.spireRun.mapOpen || (currentNode.kind !== "rest" && currentNode.kind !== "merchant") || !canUpgradeSpireInventoryItem(state)) {
    return state;
  }
  if (isSpireRoomRewardClaimed(state, currentNode.id)) {
    return state;
  }
  if (currentNode.kind === "rest" && getRestSpecialAction(state) !== "smith") {
    return state;
  }
  if (currentNode.kind === "merchant" && state.profile.coins < MERCHANT_UPGRADE_COST) {
    return state;
  }
  const charged = currentNode.kind === "merchant"
    ? { ...state, profile: { ...state.profile, coins: state.profile.coins - MERCHANT_UPGRADE_COST } }
    : state;
  const upgraded = upgradeRandomEligibleItem(charged);
  return markSpireRoomRewardClaimed(upgraded, currentNode.id);
}

export function attuneRestSiteRelic(state: StudyState, relicId: string) {
  const currentNode = getCurrentSpireNode(state);
  const relic = getRestAttunableRelics(state).find((item) => item.id === relicId);
  if (!currentNode || currentNode.kind !== "rest" || state.profile.spireRun.mapOpen || isSpireRoomRewardClaimed(state, currentNode.id) || !relic) {
    return state;
  }
  const attuned = {
    ...state,
    profile: {
      ...state.profile,
      activePotionEffects: [
        ...(state.profile.activePotionEffects || []).filter((effect) => effect.id !== getRestAttunementEffectId(currentNode.id, relic.id)),
        createRestAttunementEffect(relic, currentNode.id)
      ]
    }
  };
  return markSpireRoomRewardClaimed(recordRoomRewardClaim(attuned, currentNode.id, { relicIds: [relic.id] }), currentNode.id);
}

function createRestAttunementEffect(relic: Relic, sourceNodeId: string) {
  return {
    id: getRestAttunementEffectId(sourceNodeId, relic.id),
    modifiers: getRestAttunementModifiers(relic),
    name: `${relic.name} Attunement`,
    roomsRemaining: REST_ATTUNEMENT_ROOMS,
    sourceNodeId,
    stats: {}
  };
}

function getRestAttunementEffectId(sourceNodeId: string, relicId: string) {
  return `rest-attunement-${sourceNodeId}-${relicId}`;
}

function getRestAttunementModifiers(relic: Relic): ItemModifier[] {
  const modifiers = (relic.modifiers || [])
    .filter((modifier) => modifier.value > 0)
    .slice(0, REST_ATTUNEMENT_MAX_MODIFIERS)
    .map((modifier) => ({
      key: modifier.key,
      value: Math.max(1, Math.ceil(modifier.value * REST_ATTUNEMENT_MODIFIER_RATIO))
    }));
  return modifiers.length ? modifiers : [{ key: "maxLife", value: REST_ATTUNEMENT_FALLBACK_LIFE }];
}

export function smithSpireNode(state: StudyState, now = Date.now()) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode || currentNode.kind !== "rest" || !state.profile.spireRun.mapOpen || !canUseSpireNode(state, currentNode.id)) {
    return state;
  }
  return completeSpireNode(upgradeRandomEligibleItem(state), currentNode, now, false);
}

export function selectSpireNode(state: StudyState, nodeId: string) {
  const node = state.profile.spireRun.nodes.find((row) => row.id === nodeId);
  if (!node || isSpireRunSetupOpen(state) || !state.profile.spireRun.mapOpen || state.profile.spireRun.pendingRelicReward || !canUseSpireNode(state, nodeId)) {
    return state;
  }
  return {
    ...state,
    currentId: null,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        currentNodeId: node.id,
        mapOpen: true,
        roundQuestionIds: [],
        roundSolvedIds: [],
        runCodeQuestionIds: [],
        tierIndex: node.tierIndex
      }
    }
  };
}

export function enterSpireNode(state: StudyState, now = Date.now()) {
  const node = getCurrentSpireNode(state);
  if (!node || isSpireRunSetupOpen(state) || !state.profile.spireRun.mapOpen || state.profile.spireRun.pendingRelicReward || !canUseSpireNode(state, node.id)) {
    return state;
  }
  const revealedState = node.kind === "unknown" ? revealUnknownSpireNode(state, node, now) : state;
  const enteredNode = getCurrentSpireNode(revealedState);
  const enteredState = enteredNode?.kind === "merchant" ? applyMerchantRoomReward(revealedState, enteredNode, now) : revealedState;
  return {
    ...enteredState,
    currentId: null,
    profile: {
      ...enteredState.profile,
      spireRun: {
        ...enteredState.profile.spireRun,
        mapOpen: false,
        roundQuestionIds: isCombatNode(enteredNode) ? pickRoundQuestions(enteredState.profile.spireRun, enteredNode, state.profile.spireRun.mapSeed + now, state.profile.spireRun.roundQuestionIds, getRoundQuestionCount(enteredState.profile.spireRun, enteredNode, now)) : [],
        roundSolvedIds: [],
        runCodeQuestionIds: [],
        tierIndex: enteredNode?.tierIndex ?? node.tierIndex
      }
    }
  };
}

export function isCombatNode(node: SpireMapNode | undefined) { return Boolean(node && (node.kind === "enemy" || node.kind === "elite" || node.kind === "boss")); }

function revealUnknownSpireNode(state: StudyState, node: SpireMapNode, now: number) {
  const encounter = rollUnknownEncounter(state, node, now);
  const withMisses = updateUnknownEncounterMisses(state, encounter);
  return replaceSpireNodeKind(withMisses, node.id, getRevealedNodeKind(encounter));
}

function getRevealedNodeKind(encounter: UnknownEncounterKind): SpireNodeKind {
  if (encounter === "blight") {
    return "blight";
  }
  if (encounter === "monster") {
    return "enemy";
  }
  if (encounter === "elite") {
    return "elite";
  }
  if (encounter === "shop") {
    return "merchant";
  }
  if (encounter === "treasure") {
    return "treasure";
  }
  return "enemy";
}

function replaceSpireNodeKind(state: StudyState, nodeId: string, kind: SpireNodeKind) {
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        nodes: state.profile.spireRun.nodes.map((node) => node.id === nodeId ? { ...node, kind } : node)
      }
    }
  };
}

function canUseSpireNode(state: StudyState, nodeId: string) {
  return state.profile.godMode || state.profile.spireRun.availableNodeIds.includes(nodeId);
}

function isSpireRoomRewardClaimed(state: StudyState, nodeId: string) {
  return state.profile.spireRun.completedNodeIds.includes(nodeId);
}

function markSpireRoomRewardClaimed(state: StudyState, nodeId: string) {
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        completedNodeIds: Array.from(new Set([...state.profile.spireRun.completedNodeIds, nodeId]))
      }
    }
  };
}

function completeSpireNode(state: StudyState, node: SpireMapNode, now: number, shouldClaimReward = true) {
  const rewarded = tickActivePotionEffects(shouldClaimReward ? claimSpireNodeReward(state, now) : state, node.id);
  if (rewarded.profile.spireRun.pendingRelicReward) {
    return {
      ...rewarded,
      profile: {
        ...rewarded.profile,
        spireRun: {
          ...rewarded.profile.spireRun,
        completedNodeIds: Array.from(new Set([...rewarded.profile.spireRun.completedNodeIds, node.id])),
        failDamageStacks: 0,
        mapOpen: false,
        roundQuestionIds: [],
        roundSolvedIds: [],
        runCodeQuestionIds: []
        }
      }
    };
  }
  const finalBossCleared = node.kind === "boss" && !node.nextIds.length;
  if (finalBossCleared && rewarded.profile.spireRun.act >= 4) {
    return completeVictoriousRun(rewarded, now);
  }
  const nextCampaign = finalBossCleared ? getNextSpireCampaignStage(rewarded.profile.spireRun) : null;
  if (nextCampaign) {
    return {
      ...rewarded,
      currentId: null,
      profile: {
        ...rewarded.profile,
        spireRun: {
          ...createSpireRun(now + rewarded.profile.spireRun.mapSeed, nextCampaign.act, nextCampaign.difficulty, rewarded.profile.spireRun.heatConditions, false, rewarded.profile.spireMinRating),
          maxHealthBonus: rewarded.profile.spireRun.maxHealthBonus
        }
      }
    };
  }
  const nextIds = node.nextIds;
  return {
    ...rewarded,
    profile: {
      ...rewarded.profile,
      spireRun: {
        ...rewarded.profile.spireRun,
        availableNodeIds: nextIds,
        completedNodeIds: Array.from(new Set([...rewarded.profile.spireRun.completedNodeIds, node.id])),
        currentNodeId: nextIds[DEFAULT_FIRST_SLOT] || node.id,
        failDamageStacks: 0,
        mapOpen: true,
        roundQuestionIds: [],
        roundSolvedIds: [],
        runCodeQuestionIds: [],
        tierIndex: Math.min(SPIRE_RATINGS.length - 1, rewarded.profile.spireRun.tierIndex + 1)
      }
    }
  };
}

function completeVictoriousRun(state: StudyState, now: number): StudyState {
  const completedHeat = getHeatLevel(state.profile.spireRun.heatConditions);
  const metaProgress = {
    ...state.profile.metaProgress,
    heatUnlocked: true,
    highestHeat: Math.max(state.profile.metaProgress.highestHeat || 0, completedHeat)
  };
  const nextRun = createSpireRun(now + state.profile.spireRun.mapSeed, 1, "normal", state.profile.spireRun.heatConditions, true, state.profile.spireMinRating);
  const nextState = {
    ...state,
    currentId: null,
    profile: {
      ...state.profile,
      activePotionEffects: [],
      inventory: [],
      inventorySlots: {},
      metaProgress,
      relics: [],
      shopStock: [],
      spireRun: nextRun
    }
  };
  return {
    ...nextState,
    profile: {
      ...nextState.profile,
      coins: getMetaStartingGoldBonus(nextState),
      health: getMaxHealth(nextState)
    }
  };
}

function tickActivePotionEffects(state: StudyState, completedNodeId: string): StudyState {
  const activePotionEffects = (state.profile.activePotionEffects || [])
    .map((effect) => effect.sourceNodeId === completedNodeId ? { ...effect, sourceNodeId: undefined } : { ...effect, roomsRemaining: effect.roomsRemaining - 1, sourceNodeId: undefined })
    .filter((effect) => effect.roomsRemaining > 0);
  return {
    ...state,
    profile: {
      ...state.profile,
      activePotionEffects,
      health: Math.min(state.profile.health, getMaxHealth({ ...state, profile: { ...state.profile, activePotionEffects } })),
      mana: 0
    }
  };
}

function createSpireNodes(seed: number, ratings = SPIRE_RATINGS) {
  for (let attempt = 0; attempt < MAP_GENERATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = seed + attempt * MAP_ATTEMPT_SEED_STEP;
    const nodes = assignCombatRewardKinds(assignRoomKinds(attemptSeed, createPathRows(attemptSeed, ratings)).flat(), attemptSeed);
    if (isValidBranchingMap(nodes)) {
      return nodes;
    }
  }
  return assignCombatRewardKinds(assignRoomKinds(seed, createPathRows(seed, ratings)).flat(), seed);
}

function assignCombatRewardKinds(nodes: SpireMapNode[], seed: number) {
  const assigned = nodes.map((node) => isRewardedCombatNode(node) ? { ...node, rewardKind: rollCombatRewardKind(seed, node) } : node);
  return ensurePomCombatReward(assigned, seed);
}

function ensurePomCombatReward(nodes: SpireMapNode[], seed: number) {
  if (nodes.some((node) => isRewardedCombatNode(node) && node.rewardKind === "pom")) {
    return nodes;
  }
  const candidates = nodes.filter(isRewardedCombatNode);
  if (!candidates.length) {
    return nodes;
  }
  const target = candidates[Math.floor(getRoll(`${seed}:guaranteed-pom`) * candidates.length) % candidates.length];
  return nodes.map((node) => node.id === target.id ? { ...node, rewardKind: "pom" as const } : node);
}

function isRewardedCombatNode(node: Pick<SpireMapNode, "kind">) {
  return node.kind === "enemy";
}

function isValidCombatRewardKind(kind: SpireCombatRewardKind | undefined): kind is SpireCombatRewardKind {
  return kind === "gold" || kind === "heart" || kind === "insight" || kind === "pom";
}

function getCombatRewardKind(node: SpireMapNode): SpireCombatRewardKind {
  return isValidCombatRewardKind(node.rewardKind) ? node.rewardKind : rollCombatRewardKind(0, node);
}

function rollCombatRewardKind(seed: number, node: Pick<SpireMapNode, "id" | "tierIndex">): SpireCombatRewardKind {
  const roll = getRoll(`${seed}:${node.id}:combat-reward`) * COMBAT_REWARD_WEIGHTS.reduce((sum, reward) => sum + reward.weight, 0);
  let cursor = 0;
  for (const reward of COMBAT_REWARD_WEIGHTS) {
    cursor += reward.weight;
    if (roll <= cursor) {
      return reward.kind;
    }
  }
  return "gold";
}

function createPathRows(seed: number, ratings = SPIRE_RATINGS) {
  const rowColumns = ratings.map(() => new Set<number>());
  const edges: PathEdge[] = [];
  const pathCount = getRandomWalkPathCount(seed);
  for (const column of START_NODE_COLUMNS) {
    rowColumns[FIRST_TIER].add(column);
  }
  for (const pathIndex of Array.from({ length: pathCount }, (_unused, index) => index)) {
    let column = getPathStartColumn(seed, pathIndex);
    const pathColumns = [column];
    rowColumns[FIRST_TIER].add(column);
    for (const tierIndex of SPIRE_RATINGS.slice(0, EXCLUDE_LAST_FLOOR).map((_rating, index) => index)) {
      const nextColumn = getNextPathColumn(seed, pathIndex, tierIndex, column, edges, pathColumns);
      edges.push({ fromColumn: column, fromTier: tierIndex, toColumn: nextColumn });
      rowColumns[tierIndex + 1].add(nextColumn);
      pathColumns.push(nextColumn);
      column = nextColumn;
    }
  }
  ensureAllStartsConnected(rowColumns, edges);
  dedupeEdges(edges);
  normalizeBossFloor(rowColumns, edges);
  ensureTargetOccupancy(seed, rowColumns);
  ensureNodeConnectivity(rowColumns, edges);
  dedupeEdges(edges);
  addStrategicBranches(seed, rowColumns, edges);
  return rowColumns.map((columns, tierIndex) => createTierNodesFromColumns(seed, tierIndex, [...columns].sort((a, b) => a - b), edges, ratings));
}

function getRandomWalkPathCount(seed: number) {
  return MIN_RANDOM_WALK_PATHS + Math.floor(getRoll(`${seed}:path-count`) * (MAX_RANDOM_WALK_PATHS - MIN_RANDOM_WALK_PATHS + 1));
}

function normalizeBossFloor(rowColumns: Array<Set<number>>, edges: PathEdge[]) {
  rowColumns[BOSS_FLOOR_INDEX] = new Set([BOSS_COLUMN]);
  for (let index = edges.length - 1; index >= 0; index -= 1) { if (edges[index].fromTier === FLOOR_FOURTEEN_INDEX) { edges.splice(index, 1); } }
  rowColumns[FLOOR_FOURTEEN_INDEX].forEach((column) => edges.push({ fromColumn: column, fromTier: FLOOR_FOURTEEN_INDEX, toColumn: BOSS_COLUMN }));
}

function getPathStartColumn(seed: number, pathIndex: number): number {
  const shuffled = getShuffledColumns(seed, `start:${pathIndex}`);
  if (pathIndex < START_NODE_COLUMNS.length) {
    return START_NODE_COLUMNS[pathIndex] ?? START_NODE_COLUMNS[DEFAULT_FIRST_SLOT];
  }
  return START_NODE_COLUMNS[Math.floor(getRoll(`${seed}:start-repeat:${pathIndex}`) * START_NODE_COLUMNS.length)] ?? START_NODE_COLUMNS[DEFAULT_FIRST_SLOT];
}

function getShuffledColumns(seed: number, key: string): number[] {
  return [...START_COLUMN_ORDER].sort((a, b) => getRoll(`${seed}:${key}:${a}`) - getRoll(`${seed}:${key}:${b}`));
}

function getNextPathColumn(seed: number, pathIndex: number, tierIndex: number, column: number, edges: PathEdge[], pathColumns: number[]) {
  const candidates = getNextColumnCandidates(seed, pathIndex, tierIndex, column, pathColumns);
  return candidates.find((candidate) => !wouldCrossExistingEdge(edges, tierIndex, column, candidate))
    ?? candidates.find((candidate) => !wouldCrossExistingEdge(edges, tierIndex, column, candidate))
    ?? column;
}

function getNextColumnCandidates(seed: number, pathIndex: number, tierIndex: number, column: number, pathColumns: number[]) {
  const preferredOffset = getWeightedPathOffset(seed, pathIndex, tierIndex);
  const offsets = [preferredOffset, PATH_STEP_STRAIGHT, preferredOffset < 0 ? PATH_STEP_RIGHT : PATH_STEP_LEFT, preferredOffset < 0 ? PATH_STEP_LEFT : PATH_STEP_RIGHT];
  return Array.from(new Set(offsets))
    .map((offset) => column + offset)
    .filter((candidate) => candidate >= 0 && candidate < MAP_COLUMN_COUNT)
    .sort((a, b) => getPathCandidateScore(seed, pathIndex, tierIndex, column, a, pathColumns) - getPathCandidateScore(seed, pathIndex, tierIndex, column, b, pathColumns));
}

function getWeightedPathOffset(seed: number, pathIndex: number, tierIndex: number) {
  const roll = getRoll(`${seed}:weighted-step:${pathIndex}:${tierIndex}`);
  if (roll < STRAIGHT_STEP_CHANCE) {
    return PATH_STEP_STRAIGHT;
  }
  if (roll < STRAIGHT_STEP_CHANCE + DIAGONAL_STEP_CHANCE) {
    return PATH_STEP_LEFT;
  }
  return PATH_STEP_RIGHT;
}

function getPathCandidateScore(seed: number, pathIndex: number, tierIndex: number, column: number, candidate: number, pathColumns: number[]) {
  let score = getRoll(`${seed}:step:${pathIndex}:${tierIndex}:${candidate}`);
  if (candidate === column && getStraightChainLength(pathColumns, column) >= MAX_STRAIGHT_CHAIN_EDGES) {
    score += STRAIGHT_CHAIN_SCORE_PENALTY;
  }
  if ((candidate === COLUMN_0 || candidate === COLUMN_6) && column === candidate) {
    score += EDGE_COLUMN_SCORE_PENALTY;
  }
  return score;
}

function ensureAllStartsConnected(rowColumns: Array<Set<number>>, edges: PathEdge[]) {
  for (const column of START_NODE_COLUMNS) {
    if (edges.some((edge) => edge.fromTier === FIRST_TIER && edge.fromColumn === column)) {
      continue;
    }
    const nextColumn = getClosestAvailableColumn(column, rowColumns[FIRST_TIER + 1]);
    rowColumns[FIRST_TIER + 1].add(nextColumn);
    edges.push({ fromColumn: column, fromTier: FIRST_TIER, toColumn: nextColumn });
  }
}

function dedupeEdges(edges: PathEdge[]) {
  const seen = new Set<string>();
  for (let index = edges.length - 1; index >= 0; index -= 1) {
    const edge = edges[index];
    const key = `${edge.fromTier}:${edge.fromColumn}:${edge.toColumn}`;
    if (seen.has(key)) {
      edges.splice(index, 1);
    }
    seen.add(key);
  }
}

function ensureTargetOccupancy(seed: number, rowColumns: Array<Set<number>>) {
  const totalSlots = SPIRE_RATINGS.length * MAP_COLUMN_COUNT;
  const target = Math.ceil(totalSlots * (MIN_OCCUPANCY_RATIO + getRoll(`${seed}:occupancy-target`) * (MAX_OCCUPANCY_RATIO - MIN_OCCUPANCY_RATIO - 0.03)));
  const candidates = SPIRE_RATINGS
    .slice(FIRST_TIER + 1, BOSS_FLOOR_INDEX)
    .flatMap((_rating, tierOffset) => {
      const tierIndex = tierOffset + 1;
      return START_COLUMN_ORDER
        .filter((column) => !rowColumns[tierIndex].has(column) && hasNearbyColumn(rowColumns[tierIndex - 1], column) && (tierIndex === FLOOR_FOURTEEN_INDEX || hasNearbyColumn(rowColumns[tierIndex + 1], column)))
        .map((column) => ({ column, tierIndex }));
    })
    .sort((a, b) => getRoll(`${seed}:occupancy:${a.tierIndex}:${a.column}`) - getRoll(`${seed}:occupancy:${b.tierIndex}:${b.column}`));
  for (const candidate of candidates) {
    if (getGridNodeCount(rowColumns) >= target) {
      return;
    }
    rowColumns[candidate.tierIndex].add(candidate.column);
  }
}

function hasNearbyColumn(columns: Set<number>, column: number) {
  return [column - 1, column, column + 1].some((candidate) => columns.has(candidate));
}

function getGridNodeCount(rowColumns: Array<Set<number>>) {
  return rowColumns.reduce((sum, columns) => sum + columns.size, 0);
}

function ensureNodeConnectivity(rowColumns: Array<Set<number>>, edges: PathEdge[]) {
  for (let tierIndex = FIRST_TIER + 1; tierIndex <= BOSS_FLOOR_INDEX; tierIndex += 1) {
    for (const column of rowColumns[tierIndex]) {
      if (edges.some((edge) => edge.fromTier === tierIndex - 1 && edge.toColumn === column)) {
        continue;
      }
      const fromColumn = getClosestConnectableColumn(rowColumns[tierIndex - 1], column, tierIndex === BOSS_FLOOR_INDEX);
      edges.push({ fromColumn, fromTier: tierIndex - 1, toColumn: column });
    }
  }
  for (let tierIndex = FIRST_TIER; tierIndex < BOSS_FLOOR_INDEX; tierIndex += 1) {
    for (const column of rowColumns[tierIndex]) {
      if (edges.some((edge) => edge.fromTier === tierIndex && edge.fromColumn === column)) {
        continue;
      }
      const toColumn = getClosestConnectableColumn(rowColumns[tierIndex + 1], column, tierIndex + 1 === BOSS_FLOOR_INDEX);
      edges.push({ fromColumn: column, fromTier: tierIndex, toColumn });
    }
  }
}

function getClosestConnectableColumn(columns: Set<number>, column: number, allowBossLink: boolean) {
  const candidates = Array.from(columns)
    .filter((candidate) => allowBossLink || Math.abs(candidate - column) <= MAX_PATH_STEP)
    .sort((a, b) => Math.abs(a - column) - Math.abs(b - column) || a - b);
  return candidates[DEFAULT_FIRST_SLOT] ?? column;
}

function getClosestAvailableColumn(column: number, columns: Set<number>) {
  const candidates = [column, column - 1, column + 1].filter((candidate) => candidate >= 0 && candidate < MAP_COLUMN_COUNT);
  return candidates.find((candidate) => columns.has(candidate)) ?? candidates[DEFAULT_FIRST_SLOT] ?? column;
}

function addStrategicBranches(seed: number, rowColumns: Array<Set<number>>, edges: PathEdge[]) {
  const target = BRANCHING_TARGET_MIN + getRoll(`${seed}:branching-target`) * (BRANCHING_TARGET_MAX - BRANCHING_TARGET_MIN);
  const candidates = getBranchCandidates(seed, rowColumns, edges);
  for (const candidate of candidates) {
    if (getProjectedBranchingFactor(rowColumns, edges) >= target) {
      return;
    }
    if (canAddBranchEdge(edges, candidate)) {
      edges.push(candidate);
    }
  }
}

function getBranchCandidates(seed: number, rowColumns: Array<Set<number>>, edges: PathEdge[]) {
  return SPIRE_RATINGS.slice(FIRST_TIER, FLOOR_FOURTEEN_INDEX).flatMap((_rating, tierIndex) => Array.from(rowColumns[tierIndex]).flatMap((fromColumn) => {
    const existingNextColumns = new Set(edges.filter((edge) => edge.fromTier === tierIndex && edge.fromColumn === fromColumn).map((edge) => edge.toColumn));
    return Array.from(rowColumns[tierIndex + 1])
      .filter((toColumn) => Math.abs(toColumn - fromColumn) <= MAX_PATH_STEP && !existingNextColumns.has(toColumn))
      .map((toColumn) => ({ fromColumn, fromTier: tierIndex, toColumn }));
  })).sort((a, b) => getRoll(`${seed}:branch:${a.fromTier}:${a.fromColumn}:${a.toColumn}`) - getRoll(`${seed}:branch:${b.fromTier}:${b.fromColumn}:${b.toColumn}`));
}

function canAddBranchEdge(edges: PathEdge[], candidate: PathEdge) {
  const outgoingCount = edges.filter((edge) => edge.fromTier === candidate.fromTier && edge.fromColumn === candidate.fromColumn).length;
  return outgoingCount < MAX_NODE_NEXT_IDS
    && !edges.some((edge) => edge.fromTier === candidate.fromTier && edge.fromColumn === candidate.fromColumn && edge.toColumn === candidate.toColumn)
    && !wouldCrossExistingEdge(edges, candidate.fromTier, candidate.fromColumn, candidate.toColumn);
}

function getProjectedBranchingFactor(rowColumns: Array<Set<number>>, edges: PathEdge[]) {
  const branchingNodeCount = rowColumns.slice(FIRST_TIER, BOSS_FLOOR_INDEX).reduce((sum, columns) => sum + columns.size, 0);
  return edges.length / Math.max(1, branchingNodeCount);
}

function getStraightChainLength(pathColumns: number[], column: number) {
  let count = 0;
  for (let index = pathColumns.length - 1; index >= 0 && pathColumns[index] === column; index -= 1) {
    count += 1;
  }
  return Math.max(0, count - 1);
}

function wouldCrossExistingEdge(edges: PathEdge[], tierIndex: number, fromColumn: number, toColumn: number) {
  return edges
    .filter((edge) => edge.fromTier === tierIndex)
    .some((edge) => doEdgesCross(fromColumn, toColumn, edge.fromColumn, edge.toColumn));
}

function doEdgesCross(fromColumn: number, toColumn: number, otherFromColumn: number, otherToColumn: number) {
  return (fromColumn < otherFromColumn && toColumn > otherToColumn) || (fromColumn > otherFromColumn && toColumn < otherToColumn);
}

function createTierNodesFromColumns(seed: number, tierIndex: number, columns: number[], edges: PathEdge[], ratings = SPIRE_RATINGS) {
  return columns.map((column) => {
    const id = getNodeId(tierIndex, column, ratings);
    return {
      column,
      id,
      kind: "enemy" as SpireNodeKind,
      nextIds: getNextIdsForColumn(tierIndex, column, edges, ratings),
      rating: ratings[tierIndex],
      tierIndex,
      x: getNodeX(seed, tierIndex, column),
      y: getNodeY(tierIndex)
    };
  });
}

function getNextIdsForColumn(tierIndex: number, column: number, edges: PathEdge[], ratings = SPIRE_RATINGS) {
  const nextColumns = Array.from(new Set(edges.filter((edge) => edge.fromTier === tierIndex && edge.fromColumn === column).map((edge) => edge.toColumn)));
  return nextColumns.map((nextColumn) => getNodeId(tierIndex + 1, nextColumn, ratings));
}

function getNodeId(tierIndex: number, column: number, ratings = SPIRE_RATINGS) { return `tier-${tierIndex}-${column}-${ratings[tierIndex]}`; }

function assignRoomKinds(seed: number, rows: SpireMapNode[][]) {
  const assignedByOrigin = new Map<string, Set<SpireNodeKind>>();
  const assignedRows: SpireMapNode[][] = rows.map((row, tierIndex) => row.map((node) => ({ ...node, kind: getForcedNodeKind(tierIndex) || "enemy" as SpireNodeKind })));
  const guaranteedTreasureId = getGuaranteedTreasureId(seed, rows);
  for (const [tierIndex, row] of rows.entries()) {
    const assignedRow = row.map((node, slot) => {
      const existing = assignedRows[tierIndex][slot];
      const forced = getForcedNodeKind(tierIndex);
      const incoming = getIncomingNodes(assignedRows, tierIndex, node.id);
      const kind = forced || getNodeKind(seed, tierIndex, slot, existing.id, guaranteedTreasureId, assignedRows, incoming, assignedByOrigin);
      for (const origin of incoming) {
        if (origin.nextIds.length > 1) {
          const assigned = assignedByOrigin.get(origin.id) || new Set<SpireNodeKind>();
          assigned.add(kind);
          assignedByOrigin.set(origin.id, assigned);
        }
      }
      return { ...node, kind };
    });
    assignedRows[tierIndex] = assignedRow;
  }
  return balanceSpecialRoomCounts(seed, assignedRows);
}

function getGuaranteedTreasureId(seed: number, rows: SpireMapNode[][]) {
  const candidates = rows
    .flatMap((row, tierIndex) => GUARANTEED_TREASURE_FLOORS.has(tierIndex) ? row : [])
    .sort((a, b) => getRoll(`${seed}:guaranteed-treasure:${a.id}`) - getRoll(`${seed}:guaranteed-treasure:${b.id}`));
  return candidates[DEFAULT_FIRST_SLOT]?.id || rows[GUARANTEED_TREASURE_MIN_FLOOR_INDEX]?.[DEFAULT_FIRST_SLOT]?.id || "";
}

function balanceSpecialRoomCounts(seed: number, rows: SpireMapNode[][]) {
  const cappedUnknowns = capUnknownRooms(seed, rows);
  const withElites = ensureMinimumRoomKind(seed, cappedUnknowns, "elite", MIN_ELITE_ROOM_COUNT);
  const withRest = ensureMinimumRoomKind(seed, withElites, "rest", MIN_REST_ROOM_COUNT);
  const withSupportedElites = ensureEliteCampfireSupport(seed, withRest);
  return cleanInvalidSpecialChains(withSupportedElites);
}

function cleanInvalidSpecialChains(rows: SpireMapNode[][]) {
  let cleaned = rows;
  for (let tierIndex = FIRST_TIER + 1; tierIndex < BOSS_FLOOR_INDEX; tierIndex += 1) {
    cleaned = cleaned.map((row, rowTierIndex) => row.map((node) => {
      if (rowTierIndex !== tierIndex || !CONSECUTIVE_BLOCKED_KINDS.includes(node.kind)) {
        return node;
      }
      const incomingSpecial = getIncomingNodes(cleaned, tierIndex, node.id).some((incoming) => CONSECUTIVE_BLOCKED_KINDS.includes(incoming.kind));
      const restTooClose = node.kind === "rest" && getAncestorNodesWithinFloors(cleaned.flat(), node, 2).some((ancestor) => ancestor.kind === "rest");
      return incomingSpecial || restTooClose ? { ...node, kind: "enemy" as SpireNodeKind } : node;
    }));
  }
  return cleaned;
}

function capUnknownRooms(seed: number, rows: SpireMapNode[][]) {
  const cap = getUnknownRoomCap(rows.flat());
  const keepUnknownIds = new Set(rows
    .flat()
    .filter((node) => node.kind === "unknown")
    .sort((a, b) => getRoll(`${seed}:keep-unknown:${b.id}`) - getRoll(`${seed}:keep-unknown:${a.id}`))
    .slice(0, cap)
    .map((node) => node.id));
  return rows.map((row) => row.map((node) => node.kind === "unknown" && !keepUnknownIds.has(node.id) ? { ...node, kind: "enemy" as SpireNodeKind } : node));
}

function ensureMinimumRoomKind(seed: number, rows: SpireMapNode[][], kind: SpireNodeKind, minimumCount: number) {
  const currentCount = rows.flat().filter((node) => node.kind === kind).length;
  if (currentCount >= minimumCount) {
    return rows;
  }
  let remaining = minimumCount - currentCount;
  return rows.map((row, tierIndex) => row.map((node) => {
    if (!remaining || !canForceRoomKind(rows, tierIndex, node, kind)) {
      return node;
    }
    const shouldUse = getRoll(`${seed}:force-kind:${kind}:${node.id}`) > RANDOM_CENTER || remaining >= getForceableRoomCount(rows, kind, tierIndex);
    if (!shouldUse) {
      return node;
    }
    remaining -= 1;
    return { ...node, kind };
  }));
}

function ensureEliteCampfireSupport(seed: number, rows: SpireMapNode[][]) {
  const flatRows = rows.flat();
  const elites = flatRows.filter((node) => node.kind === "elite");
  const supportedCount = elites.filter((node) => getAncestorNodesWithinFloors(flatRows, node, 3).some((ancestor) => ancestor.kind === "rest")).length;
  let needed = Math.max(0, Math.ceil(elites.length * 0.6) - supportedCount);
  if (!needed) {
    return rows;
  }
  const supportIds = new Set(elites
    .filter((node) => !getAncestorNodesWithinFloors(flatRows, node, 3).some((ancestor) => ancestor.kind === "rest"))
    .flatMap((elite) => getAncestorNodesWithinFloors(flatRows, elite, 3)
      .filter((ancestor) => canForceRoomKind(rows, ancestor.tierIndex, ancestor, "rest"))
      .sort((a, b) => getRoll(`${seed}:elite-rest:${elite.id}:${a.id}`) - getRoll(`${seed}:elite-rest:${elite.id}:${b.id}`))
      .slice(0, 1))
    .sort((a, b) => getRoll(`${seed}:support-rest:${a.id}`) - getRoll(`${seed}:support-rest:${b.id}`))
    .filter(() => {
      const use = needed > 0;
      if (use) {
        needed -= 1;
      }
      return use;
    })
    .map((node) => node.id));
  return rows.map((row) => row.map((node) => supportIds.has(node.id) ? { ...node, kind: "rest" as SpireNodeKind } : node));
}

function getForceableRoomCount(rows: SpireMapNode[][], kind: SpireNodeKind, fromTierIndex: number) {
  return rows.slice(fromTierIndex).flatMap((row, tierOffset) => row.filter((node) => canForceRoomKind(rows, fromTierIndex + tierOffset, node, kind))).length;
}

function canForceRoomKind(rows: SpireMapNode[][], tierIndex: number, node: SpireMapNode, kind: SpireNodeKind) {
  return node.kind === "enemy"
    && isKindAllowedOnFloor(tierIndex, kind)
    && !getIncomingNodes(rows, tierIndex, node.id).some((incoming) => CONSECUTIVE_BLOCKED_KINDS.includes(incoming.kind))
    && (kind !== "rest" || !getAncestorNodesWithinFloors(rows.flat(), node, 2).some((ancestor) => ancestor.kind === "rest"))
    && (kind !== "merchant" || getShopCountInFiveFloorSpan(rows.flat(), tierIndex) < 2)
    && !node.nextIds.some((nextId) => rows[tierIndex + 1]?.some((nextNode) => nextNode.id === nextId && CONSECUTIVE_BLOCKED_KINDS.includes(nextNode.kind)));
}

function getShopCountInFiveFloorSpan(nodes: SpireMapNode[], tierIndex: number) {
  const spanStart = Math.max(FIRST_TIER, tierIndex - 4);
  return nodes.filter((node) => {
    return node.kind === "merchant" && node.tierIndex >= spanStart && node.tierIndex <= tierIndex;
  }).length;
}

function getAncestorNodesWithinFloors(nodes: SpireMapNode[], node: SpireMapNode, floorDistance: number) {
  const byId = new Map(nodes.map((entry) => [entry.id, entry]));
  const ancestors: SpireMapNode[] = [];
  let frontier = [node.id];
  for (let distance = 1; distance <= floorDistance; distance += 1) {
    const nextFrontier: string[] = [];
    for (const id of frontier) {
      for (const previous of nodes) {
        if (!previous.nextIds.includes(id)) {
          continue;
        }
        const ancestor = byId.get(previous.id);
        if (ancestor && !ancestors.some((entry) => entry.id === ancestor.id)) {
          ancestors.push(ancestor);
          nextFrontier.push(ancestor.id);
        }
      }
    }
    frontier = nextFrontier;
  }
  return ancestors;
}

function isKindAllowedOnFloor(tierIndex: number, kind: SpireNodeKind) {
  if (kind === "boss") {
    return tierIndex === BOSS_FLOOR_INDEX;
  }
  if (kind === "elite" && tierIndex < FLOOR_SEVEN_INDEX) {
    return false;
  }
  if (kind === "rest" && tierIndex < FLOOR_SIX_INDEX) {
    return false;
  }
  if (kind === "merchant" && tierIndex < FLOOR_FOUR_INDEX) {
    return false;
  }
  if (kind === "treasure" && tierIndex < FLOOR_FIVE_INDEX) {
    return false;
  }
  return tierIndex !== FLOOR_ONE_INDEX && tierIndex !== BOSS_FLOOR_INDEX;
}

function getIncomingNodes(rows: SpireMapNode[][], tierIndex: number, nodeId: string) {
  return tierIndex > FIRST_TIER ? rows[tierIndex - 1].filter((node) => node.nextIds.includes(nodeId)) : [];
}

function getNodeKind(seed: number, tierIndex: number, slot: number, nodeId: string, guaranteedTreasureId: string, rows: SpireMapNode[][], incoming: SpireMapNode[], assignedByOrigin: Map<string, Set<SpireNodeKind>>) {
  if (nodeId === guaranteedTreasureId) {
    return "treasure";
  }
  const candidates = getCandidateKinds(tierIndex, nodeId, guaranteedTreasureId, rows, incoming, assignedByOrigin);
  return pickWeightedKind(candidates, `${seed}:kind:${tierIndex}:${slot}`);
}

function getForcedNodeKind(tierIndex: number): SpireNodeKind | null {
  if (tierIndex === FLOOR_ONE_INDEX) {
    return "enemy";
  }
  if (tierIndex === FLOOR_FOURTEEN_INDEX) {
    return "rest";
  }
  if (tierIndex === BOSS_FLOOR_INDEX) {
    return "boss";
  }
  return null;
}

function getCandidateKinds(tierIndex: number, nodeId: string, guaranteedTreasureId: string, rows: SpireMapNode[][], incoming: SpireMapNode[], assignedByOrigin: Map<string, Set<SpireNodeKind>>) {
  const blocked = new Set<SpireNodeKind>();
  if (tierIndex < FLOOR_SEVEN_INDEX) {
    blocked.add("elite");
  }
  if (tierIndex < FLOOR_SIX_INDEX) {
    blocked.add("rest");
  }
  if (tierIndex < FLOOR_FOUR_INDEX) {
    blocked.add("merchant");
  }
  if (tierIndex < FLOOR_FIVE_INDEX || (GUARANTEED_TREASURE_FLOORS.has(tierIndex) && nodeId !== guaranteedTreasureId)) {
    blocked.add("treasure");
  }
  if (getShopCountInFiveFloorSpan(rows.flat(), tierIndex) >= 2) {
    blocked.add("merchant");
  }
  if (getAncestorNodesWithinFloors(rows.flat(), rows[tierIndex].find((node) => node.id === nodeId) || rows[tierIndex][DEFAULT_FIRST_SLOT], 2).some((node) => node.kind === "rest")) {
    blocked.add("rest");
  }
  if (incoming.some((node) => CONSECUTIVE_BLOCKED_KINDS.includes(node.kind))) {
    CONSECUTIVE_BLOCKED_KINDS.forEach((kind) => blocked.add(kind));
  }
  for (const origin of incoming) {
    if (origin.nextIds.length > 1) {
      assignedByOrigin.get(origin.id)?.forEach((kind) => blocked.add(kind));
    }
  }
  const candidates = ROOM_KIND_WEIGHTS.filter((entry) => entry.weight > 0 && !blocked.has(entry.kind));
  return candidates.length ? candidates : ROOM_KIND_WEIGHTS.filter((entry) => entry.kind === "enemy");
}

function pickWeightedKind(candidates: Array<{ kind: SpireNodeKind; weight: number }>, seed: string) {
  const total = candidates.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = getRoll(seed) * total;
  for (const entry of candidates) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.kind;
    }
  }
  return candidates[DEFAULT_FIRST_SLOT].kind;
}

function getNodeY(tierIndex: number) { const rowStep = (FIRST_ROW_Y - TOP_ROW_Y) / Math.max(1, SPIRE_RATINGS.length - 1); return Math.round(FIRST_ROW_Y - tierIndex * rowStep); }

function getNodeX(seed: number, tierIndex: number, column: number) {
  const base = MAP_X_MIN + (MAP_X_SPREAD / Math.max(1, MAP_COLUMN_COUNT - 1)) * column;
  const jitter = Math.round((getRoll(`${seed}:x:${tierIndex}:${column}`) - RANDOM_CENTER) * NODE_X_JITTER);
  return Math.min(MAP_X_MIN + MAP_X_SPREAD, Math.max(MAP_X_MIN, Math.round(base + jitter)));
}

function getRoundQuestionCount(run: SpireRun, node: SpireMapNode, now: number) {
  const baseCount = node.kind === "elite" || node.kind === "boss"
    ? MAX_ROUND_QUESTION_COUNT + getHeatEliteQuestionBonus(run)
    : MIN_ROUND_QUESTION_COUNT + Math.floor(getRoll(`${node.id}:${now}:round-count`) * (MAX_ROUND_QUESTION_COUNT - MIN_ROUND_QUESTION_COUNT + 1)) + getHeatExtraRoomQuestions(run);
  return Math.max(MIN_ROUND_QUESTION_COUNT, Math.min(MAX_ROUND_QUESTION_COUNT + 2, baseCount));
}

function pickRoundQuestions(run: SpireRun, node: SpireMapNode, seed: number, previousIds: string[], count: number) {
  const effectiveRating = getEffectiveSpireRating(run, node.rating);
  const targetRating = node.kind === "boss"
    ? effectiveRating + ELITE_RATING_BOOST + Math.round((getHeatBossMultiplier(run) - 1) * 500)
    : node.kind === "elite"
      ? effectiveRating + ELITE_RATING_BOOST + Math.round((getHeatEliteMultiplier(run) - 1) * 400)
      : effectiveRating;
  const ranked = [...questions]
    .filter((question) => !previousIds.includes(question.id))
    .sort((a, b) => getQuestionSortValue(node, b, targetRating, seed) - getQuestionSortValue(node, a, targetRating, seed));
  return ranked.slice(0, count).map((question) => question.id);
}

function getQuestionSortValue(node: SpireMapNode, question: Question, targetRating: number, seed: number) { const ratingFit = RATING_FIT_BASE - Math.abs(question.rating - targetRating); const eliteBonus = node.kind === "elite" || node.kind === "boss" ? getUniqueMonsterBonusCount(question) * ELITE_BONUS_SORT_WEIGHT : 0; return ratingFit + eliteBonus + getRoll(`${seed}:${question.id}`); }

function getEffectiveSpireRating(run: Pick<SpireRun, "act" | "difficulty" | "heatConditions">, rating: number) {
  return rating + getSpireCampaignRatingBonus(run);
}

function getRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}
