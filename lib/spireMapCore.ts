import { questions } from "../data/questions";
import { createDropItem, SLOT_STAT_BIAS } from "./itemCore";
import { getUniqueMonsterBonusCount } from "./monsterCore";
import { grantRelic, rollRelic } from "./relicCore";
import { createShopStock } from "./shopCore";
import { getMaxHealth, getMaxMana } from "./studyCore";
import type { CharacterStats, Difficulty, InventoryItem, ItemRarity, Question, SpireMapNode, SpireNodeKind, SpireRun, StudyState, UnknownEncounterKind } from "../types/study";

const RATING_FLOOR_1 = 1500;
const RATING_FLOOR_2 = 1650;
const RATING_FLOOR_3 = 1800;
const RATING_FLOOR_4 = 1950;
const RATING_FLOOR_5 = 2100;
const RATING_FLOOR_6 = 2250;
const RATING_FLOOR_7 = 2400;
const RATING_FLOOR_8 = 2550;
const RATING_FLOOR_9 = 2700;
const RATING_FLOOR_10 = 2850;
const RATING_FLOOR_11 = 3000;
const RATING_FLOOR_12 = 3150;
const RATING_FLOOR_13 = 3300;
const RATING_FLOOR_14 = 3400;
const RATING_FLOOR_15 = 3500;
export const SPIRE_RATINGS = [
  RATING_FLOOR_1,
  RATING_FLOOR_2,
  RATING_FLOOR_3,
  RATING_FLOOR_4,
  RATING_FLOOR_5,
  RATING_FLOOR_6,
  RATING_FLOOR_7,
  RATING_FLOOR_8,
  RATING_FLOOR_9,
  RATING_FLOOR_10,
  RATING_FLOOR_11,
  RATING_FLOOR_12,
  RATING_FLOOR_13,
  RATING_FLOOR_14,
  RATING_FLOOR_15
] as const;

const FIRST_TIER = 0;
const FIRST_NODE_ID = "tier-0-start";
const FLOOR_ONE_INDEX = 0;
const FLOOR_SIX_INDEX = 5;
const TREASURE_FLOOR_INDEX = 8;
const FLOOR_FOURTEEN_INDEX = 13;
const BOSS_FLOOR_INDEX = 14;
const MIN_ROUND_QUESTION_COUNT = 2;
const MAX_ROUND_QUESTION_COUNT = 3;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const REST_HEALTH_RATIO = 0.3;
const REST_MANA_RATIO = 0.3;
const ENEMY_ROOM_ITEM_CHANCE = 0.3;
const ENEMY_ROOM_POTION_CHANCE = 0.18;
const TREASURE_ROOM_GOLD_CHANCE = 0.55;
const TREASURE_ROOM_ITEM_CHANCE = 0.35;
const ELITE_ROOM_ITEM_COUNT = 1;
const BOSS_ROOM_ITEM_COUNT = 2;
const UNKNOWN_EVENT_GOLD_MIN = 18;
const UNKNOWN_EVENT_GOLD_MAX = 42;
const POTION_HEALTH_RATIO = 0.25;
const POTION_MANA_RATIO = 0.35;
const UNKNOWN_PITY_STEP = 8;
const MAP_X_MIN = 8;
const MAP_X_SPREAD = 84;
const FIRST_ROW_Y = 92;
const TOP_ROW_Y = 8;
const MAP_COLUMN_COUNT = 7;
const PATH_COUNT = 6;
const DISTINCT_START_PATH_COUNT = 4;
const NODE_X_JITTER = 4;
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
const START_COLUMN_ORDER = [COLUMN_1, COLUMN_3, COLUMN_5, COLUMN_2, COLUMN_4, COLUMN_0, COLUMN_6] as const;
const PATH_OFFSETS = [PATH_STEP_LEFT, PATH_STEP_STRAIGHT, PATH_STEP_RIGHT] as const;
const ELITE_RATING_BOOST = 300;
const RATING_FIT_BASE = 5000;
const ELITE_BONUS_SORT_WEIGHT = 1000;
const MIN_ELITE_ROOM_COUNT = 3;
const MIN_REST_ROOM_COUNT = 2;
const UNKNOWN_ROOM_RATIO_CAP = 0.2;
const ROOM_KIND_WEIGHTS: Array<{ kind: SpireNodeKind; weight: number }> = [
  { kind: "enemy", weight: 45 },
  { kind: "unknown", weight: 10 },
  { kind: "elite", weight: 20 },
  { kind: "rest", weight: 12 },
  { kind: "merchant", weight: 5 },
  { kind: "treasure", weight: 0 }
];
const UNKNOWN_ENCOUNTER_WEIGHTS: Record<UnknownEncounterKind, number> = {
  event: 25,
  monster: 35,
  shop: 18,
  treasure: 22
};
const ROOM_REWARD_ITEM_RARITY: Record<"enemy" | "elite" | "boss" | "treasure", { minRarity?: ItemRarity; rarityBonus: number }> = {
  boss: { minRarity: "rare", rarityBonus: 0.24 },
  elite: { minRarity: "rare", rarityBonus: 0.18 },
  enemy: { rarityBonus: 0 },
  treasure: { rarityBonus: 0.08 }
};
const ITEM_RARITY_ORDER: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
const CONSECUTIVE_BLOCKED_KINDS: SpireNodeKind[] = ["elite", "merchant", "rest"];

type PathEdge = {
  fromColumn: number;
  fromTier: number;
  toColumn: number;
};

export function createSpireRun(seed = Date.now()): SpireRun {
  const nodes = createSpireNodes(seed);
  const availableNodeIds = nodes.filter((node) => node.rating === SPIRE_RATINGS[FIRST_TIER]).map((node) => node.id);
  const currentNodeId = availableNodeIds[DEFAULT_FIRST_SLOT] || nodes[0]?.id || FIRST_NODE_ID;
  return {
    availableNodeIds,
    completedNodeIds: [],
    currentNodeId,
    mapOpen: true,
    mapSeed: seed,
    nodes,
    roundQuestionIds: [],
    roundSolvedIds: [],
    tierIndex: FIRST_TIER,
    unknownEncounterMisses: createDefaultUnknownEncounterMisses()
  };
}

// eslint-disable-next-line complexity
export function normalizeSpireRun(run: Partial<SpireRun> | undefined): SpireRun {
  const normalizedNodes = normalizeForcedRoomKinds(run?.nodes || []);
  if (!normalizedNodes.length || !isValidBranchingMap(normalizedNodes)) {
    return createSpireRun(run?.mapSeed || Date.now());
  }
  const sourceRun = run || {};
  const currentNode = normalizedNodes.find((node) => node.id === sourceRun.currentNodeId) || normalizedNodes[0];
  const availableNodeIds = (sourceRun.availableNodeIds?.length ? sourceRun.availableNodeIds : normalizedNodes.filter((node) => node.rating === SPIRE_RATINGS[FIRST_TIER]).map((node) => node.id))
    .filter((id) => normalizedNodes.some((node) => node.id === id));
  const roundQuestionIds: string[] = [];
  return {
    availableNodeIds,
    completedNodeIds: sourceRun.completedNodeIds || [],
    currentNodeId: currentNode.id,
    mapOpen: true,
    mapSeed: Number.isFinite(sourceRun.mapSeed) ? sourceRun.mapSeed || Date.now() : Date.now(),
    nodes: normalizedNodes,
    roundQuestionIds,
    roundSolvedIds: [],
    tierIndex: Math.min(SPIRE_RATINGS.length - 1, Math.max(FIRST_TIER, Math.floor(sourceRun.tierIndex || FIRST_TIER))),
    unknownEncounterMisses: normalizeUnknownEncounterMisses(sourceRun.unknownEncounterMisses)
  };
}

function createDefaultUnknownEncounterMisses(): Record<UnknownEncounterKind, number> {
  return { event: 0, monster: 0, shop: 0, treasure: 0 };
}

function normalizeUnknownEncounterMisses(misses: Partial<Record<UnknownEncounterKind, number>> | undefined) {
  const fallback = createDefaultUnknownEncounterMisses();
  return Object.fromEntries(Object.entries(fallback).map(([kind, value]) => [
    kind,
    Math.max(0, Math.floor(Number(misses?.[kind as UnknownEncounterKind]) || value))
  ])) as Record<UnknownEncounterKind, number>;
}

function normalizeForcedRoomKinds(nodes: SpireMapNode[]) {
  return nodes.map((node) => {
    const tierIndex = SPIRE_RATINGS.findIndex((rating) => rating === node.rating);
    const forced = tierIndex >= FIRST_TIER ? getForcedNodeKind(tierIndex) : null;
    return forced && node.kind !== forced ? { ...node, kind: forced } : node;
  });
}

function isValidBranchingMap(nodes: SpireMapNode[]) {
  const ratings = [...new Set(nodes.map((node) => node.rating))];
  if (ratings.length !== SPIRE_RATINGS.length) {
    return false;
  }
  return SPIRE_RATINGS.every((rating) => nodes.some((node) => node.rating === rating)) && getMapValidators().every((validator) => validator(nodes));
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
    hasValidNodeFanOut
  ];
}

function hasValidNodeFanOut(nodes: SpireMapNode[]) {
  return nodes.every((node) => node.nextIds.length <= MAX_NODE_NEXT_IDS);
}

function hasRequiredRoomDistribution(nodes: SpireMapNode[]) {
  return nodes.filter((node) => node.kind === "elite").length >= MIN_ELITE_ROOM_COUNT
    && nodes.filter((node) => node.kind === "rest").length >= MIN_REST_ROOM_COUNT
    && nodes.filter((node) => node.kind === "unknown").length <= getUnknownRoomCap(nodes);
}

function hasForcedRoomKinds(nodes: SpireMapNode[]) {
  return nodes.every((node) => {
    const tierIndex = SPIRE_RATINGS.findIndex((rating) => rating === node.rating);
    const forced = tierIndex >= FIRST_TIER ? getForcedNodeKind(tierIndex) : null;
    return !forced || node.kind === forced;
  });
}

function hasSingleBossRoom(nodes: SpireMapNode[]) { const bossNodes = nodes.filter((node) => node.rating === SPIRE_RATINGS[BOSS_FLOOR_INDEX]); return bossNodes.length === 1 && bossNodes[0]?.kind === "boss" && bossNodes[0].column === BOSS_COLUMN; }

function getUnknownRoomCap(nodes: SpireMapNode[]) { return Math.max(1, Math.floor(nodes.length * UNKNOWN_ROOM_RATIO_CAP)); }

function hasValidColumns(nodes: SpireMapNode[]) { return nodes.every((node) => Number.isInteger(node.column) && node.column >= 0 && node.column < MAP_COLUMN_COUNT); }

function hasVariedPathLinks(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const deltas = nodes.flatMap((node) => node.nextIds.map((id) => Math.round((byId.get(id)?.x || node.x) - node.x)));
  return new Set(deltas).size > VARIED_PATH_MIN_SPAN;
}

function hasLocalPathLinks(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return nodes.every((node) => node.nextIds.every((id) => {
    const next = byId.get(id);
    return next && next.rating > node.rating && (next.rating === SPIRE_RATINGS[BOSS_FLOOR_INDEX] || Math.abs(next.column - node.column) <= MAX_PATH_STEP);
  }));
}

function hasNoCrossedPathEdges(nodes: SpireMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const rating of SPIRE_RATINGS.slice(0, EXCLUDE_LAST_FLOOR)) {
    const edges = nodes
      .filter((node) => node.rating === rating)
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
  return nodes.every((node) => node.rating === SPIRE_RATINGS[FIRST_TIER] || incomingIds.has(node.id));
}

function hasNoHangingRooms(nodes: SpireMapNode[]) { return nodes.every((node) => node.rating === SPIRE_RATINGS[BOSS_FLOOR_INDEX] || node.nextIds.length > 0); }

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
    return applyUnknownEncounterReward(state, currentNode, now);
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
  return state;
}

function applyEnemyRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const withGold = grantRoomGold(state, node, "enemy", now);
  const withItem = maybeGrantRoomItem(withGold, node, now, "enemy", ENEMY_ROOM_ITEM_CHANCE);
  return maybeApplyPotionReward(withItem, node, now, "enemy");
}

function applyEliteRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const withRelic = grantRelic(state, rollRelic(state, `${node.id}:${now}:elite-relic`, { minRarity: ["uncommon", "rare", "boss"] }));
  const withGold = grantRoomGold(withRelic, node, "elite", now);
  const withItems = grantRoomItems(withGold, node, now, "elite", ELITE_ROOM_ITEM_COUNT);
  return maybeApplyPotionReward(withItems, node, now, "elite");
}

function applyBossRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const withRelic = grantRelic(state, rollRelic(state, `${node.id}:${now}:boss-relic`, { minRarity: ["boss"] }));
  const withGold = grantRoomGold(withRelic, node, "boss", now);
  const withItems = grantRoomItems(withGold, node, now, "boss", BOSS_ROOM_ITEM_COUNT);
  return applyPotionReward(withItems, "health", node, now, "boss-health");
}

function applyTreasureRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const withRelic = grantRelic(state, rollRelic(state, `${node.id}:${now}:treasure-relic`));
  const withGold = getRoll(`${node.id}:${now}:treasure-gold`) <= TREASURE_ROOM_GOLD_CHANCE ? grantRoomGold(withRelic, node, "treasure", now) : withRelic;
  return maybeGrantRoomItem(withGold, node, now, "treasure", TREASURE_ROOM_ITEM_CHANCE);
}

function applyMerchantRoomReward(state: StudyState, node: SpireMapNode, now: number) {
  const question = createRoomRewardQuestion(node, "merchant", now, "merchant");
  return {
    ...state,
    profile: {
      ...state.profile,
      shopLastRefreshedAt: now,
      shopStock: createShopStock(question, state.profile.stats, now)
    }
  };
}

function applyRestRoomReward(state: StudyState) {
  const maxHealth = getMaxHealth(state);
  const maxMana = getMaxMana(state);
  return {
    ...state,
    profile: {
      ...state.profile,
      health: Math.min(maxHealth, state.profile.health + Math.floor(maxHealth * REST_HEALTH_RATIO)),
      mana: Math.min(maxMana, state.profile.mana + Math.floor(maxMana * REST_MANA_RATIO))
    }
  };
}

function upgradeLowestTierItem(state: StudyState): StudyState {
  const item = [...state.profile.inventory].sort(compareSmithCandidates)[0];
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

function compareSmithCandidates(left: InventoryItem, right: InventoryItem) {
  return ITEM_RARITY_ORDER.indexOf(left.rarity) - ITEM_RARITY_ORDER.indexOf(right.rarity)
    || left.requirements.level - right.requirements.level
    || left.name.localeCompare(right.name);
}

function upgradeItemTier(item: InventoryItem): InventoryItem {
  const currentIndex = ITEM_RARITY_ORDER.indexOf(item.rarity);
  const nextRarity = ITEM_RARITY_ORDER[Math.min(ITEM_RARITY_ORDER.length - 1, Math.max(0, currentIndex) + 1)] || item.rarity;
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

function applyUnknownEncounterReward(state: StudyState, node: SpireMapNode, now: number) {
  const encounter = rollUnknownEncounter(state, node, now);
  const withMisses = updateUnknownEncounterMisses(state, encounter);
  if (encounter === "monster") {
    return applyEnemyRoomReward(withMisses, node, now);
  }
  if (encounter === "shop") {
    return applyMerchantRoomReward(withMisses, node, now);
  }
  if (encounter === "treasure") {
    return applyTreasureRoomReward(withMisses, node, now);
  }
  return applyUnknownEventReward(withMisses, node, now);
}

function applyUnknownEventReward(state: StudyState, node: SpireMapNode, now: number) {
  const gold = UNKNOWN_EVENT_GOLD_MIN + Math.floor(getRoll(`${node.id}:${now}:event-gold`) * (UNKNOWN_EVENT_GOLD_MAX - UNKNOWN_EVENT_GOLD_MIN + 1));
  const withGold = {
    ...state,
    profile: {
      ...state.profile,
      coins: state.profile.coins + gold
    }
  };
  return maybeApplyPotionReward(withGold, node, now, "unknown-event");
}

function rollUnknownEncounter(state: StudyState, node: SpireMapNode, now: number): UnknownEncounterKind {
  const misses = normalizeUnknownEncounterMisses(state.profile.spireRun.unknownEncounterMisses);
  const weighted = (Object.keys(UNKNOWN_ENCOUNTER_WEIGHTS) as UnknownEncounterKind[]).map((kind) => ({
    kind,
    weight: UNKNOWN_ENCOUNTER_WEIGHTS[kind] + misses[kind] * UNKNOWN_PITY_STEP
  }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = getRoll(`${node.id}:${now}:unknown-encounter`) * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.kind;
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
  const base = getRoomGoldBase(node, kind);
  const spread = Math.max(4, Math.floor(base * 0.35));
  const gold = base + Math.floor(getRoll(`${node.id}:${now}:${kind}:gold`) * (spread + 1));
  return {
    ...state,
    profile: {
      ...state.profile,
      coins: state.profile.coins + gold
    }
  };
}

function getRoomGoldBase(node: SpireMapNode, kind: SpireNodeKind) {
  const floorIndex = Math.max(0, getTierIndex(node.rating));
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
  const items = Array.from({ length: count }, (_unused, index) => createRoomRewardItem(state.profile.stats, node, now, kind, index));
  return {
    ...state,
    profile: {
      ...state.profile,
      inventory: [...state.profile.inventory, ...items]
    }
  };
}

function createRoomRewardItem(stats: CharacterStats, node: SpireMapNode, now: number, kind: "enemy" | "elite" | "boss" | "treasure", index: number) {
  const question = createRoomRewardQuestion(node, kind, now, `${kind}-item-${index}`);
  const rarity = ROOM_REWARD_ITEM_RARITY[kind];
  return createDropItem(question, stats, now + index, rarity);
}

function createRoomRewardQuestion(node: SpireMapNode, kind: string, now: number, suffix: string): Question {
  return {
    ...questions[0],
    difficulty: getRoomRewardDifficulty(node, kind),
    id: `${node.id}-${now}-${suffix}`,
    rating: node.rating,
    title: `${kind} room reward`
  };
}

function getRoomRewardDifficulty(node: SpireMapNode, kind: string): Difficulty {
  if (kind === "boss") {
    return 5;
  }
  if (kind === "elite") {
    return Math.min(5, Math.max(3, Math.ceil(getTierIndex(node.rating) / 3))) as Difficulty;
  }
  return Math.min(5, Math.max(1, Math.ceil((getTierIndex(node.rating) + 1) / 3))) as Difficulty;
}

function maybeApplyPotionReward(state: StudyState, node: SpireMapNode, now: number, kind: string) {
  const healthRoll = getRoll(`${node.id}:${now}:${kind}:health-potion`);
  const manaRoll = getRoll(`${node.id}:${now}:${kind}:mana-potion`);
  let next = state;
  if (healthRoll <= ENEMY_ROOM_POTION_CHANCE) {
    next = applyPotionReward(next, "health", node, now, `${kind}-health`);
  }
  if (manaRoll <= ENEMY_ROOM_POTION_CHANCE) {
    next = applyPotionReward(next, "mana", node, now, `${kind}-mana`);
  }
  return next;
}

function applyPotionReward(state: StudyState, type: "health" | "mana", _node: SpireMapNode, _now: number, _key: string) {
  if (type === "health") {
    const maxHealth = getMaxHealth(state);
    return {
      ...state,
      profile: {
        ...state.profile,
        health: Math.min(maxHealth, state.profile.health + Math.max(1, Math.floor(maxHealth * POTION_HEALTH_RATIO)))
      }
    };
  }
  const maxMana = getMaxMana(state);
  return {
    ...state,
    profile: {
      ...state.profile,
      mana: Math.min(maxMana, state.profile.mana + Math.max(1, Math.floor(maxMana * POTION_MANA_RATIO)))
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

export function smithSpireNode(state: StudyState, now = Date.now()) {
  const currentNode = getCurrentSpireNode(state);
  if (!currentNode || currentNode.kind !== "rest" || !state.profile.spireRun.mapOpen || !state.profile.spireRun.availableNodeIds.includes(currentNode.id)) {
    return state;
  }
  return completeSpireNode(upgradeLowestTierItem(state), currentNode, now, false);
}

export function selectSpireNode(state: StudyState, nodeId: string) {
  const node = state.profile.spireRun.nodes.find((row) => row.id === nodeId);
  if (!node || !state.profile.spireRun.mapOpen || !state.profile.spireRun.availableNodeIds.includes(nodeId)) {
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
        tierIndex: getTierIndex(node.rating)
      }
    }
  };
}

export function enterSpireNode(state: StudyState, now = Date.now()) {
  const node = getCurrentSpireNode(state);
  if (!node || !state.profile.spireRun.mapOpen || !state.profile.spireRun.availableNodeIds.includes(node.id) || !isCombatNode(node)) {
    return state;
  }
  return {
    ...state,
    currentId: null,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        mapOpen: false,
        roundQuestionIds: pickRoundQuestions(node, state.profile.spireRun.mapSeed + now, state.profile.spireRun.roundQuestionIds, getRoundQuestionCount(node, now)),
        roundSolvedIds: [],
        tierIndex: getTierIndex(node.rating)
      }
    }
  };
}

export function isCombatNode(node: SpireMapNode | undefined) { return Boolean(node && (node.kind === "enemy" || node.kind === "elite" || node.kind === "unknown" || node.kind === "boss")); }

function completeSpireNode(state: StudyState, node: SpireMapNode, now: number, shouldClaimReward = true) {
  const rewarded = shouldClaimReward ? claimSpireNodeReward(state, now) : state;
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
        mapOpen: true,
        roundQuestionIds: [],
        roundSolvedIds: [],
        tierIndex: Math.min(SPIRE_RATINGS.length - 1, rewarded.profile.spireRun.tierIndex + 1)
      }
    }
  };
}

function createSpireNodes(seed: number) {
  const linkedRows = createPathRows(seed);
  return assignRoomKinds(seed, linkedRows).flat();
}

function createPathRows(seed: number) {
  const rowColumns = SPIRE_RATINGS.map(() => new Set<number>());
  const edges: PathEdge[] = [];
  for (const pathIndex of Array.from({ length: PATH_COUNT }, (_unused, index) => index)) {
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
  normalizeBossFloor(rowColumns, edges);
  return rowColumns.map((columns, tierIndex) => createTierNodesFromColumns(seed, tierIndex, [...columns].sort((a, b) => a - b), edges));
}

function normalizeBossFloor(rowColumns: Array<Set<number>>, edges: PathEdge[]) {
  rowColumns[BOSS_FLOOR_INDEX] = new Set([BOSS_COLUMN]);
  for (let index = edges.length - 1; index >= 0; index -= 1) { if (edges[index].fromTier === FLOOR_FOURTEEN_INDEX) { edges.splice(index, 1); } }
  rowColumns[FLOOR_FOURTEEN_INDEX].forEach((column) => edges.push({ fromColumn: column, fromTier: FLOOR_FOURTEEN_INDEX, toColumn: BOSS_COLUMN }));
}

function getPathStartColumn(seed: number, pathIndex: number): number {
  const shuffled = getShuffledColumns(seed, `start:${pathIndex}`);
  if (pathIndex < DISTINCT_START_PATH_COUNT) {
    return shuffled[pathIndex] ?? START_COLUMN_ORDER[pathIndex];
  }
  return shuffled[Math.floor(getRoll(`${seed}:start-repeat:${pathIndex}`) * shuffled.length)] ?? START_COLUMN_ORDER[DEFAULT_FIRST_SLOT];
}

function getShuffledColumns(seed: number, key: string): number[] {
  return [...START_COLUMN_ORDER].sort((a, b) => getRoll(`${seed}:${key}:${a}`) - getRoll(`${seed}:${key}:${b}`));
}

function getNextPathColumn(seed: number, pathIndex: number, tierIndex: number, column: number, edges: PathEdge[], pathColumns: number[]) {
  const candidates = getNextColumnCandidates(seed, pathIndex, tierIndex, column, pathColumns);
  const nonStraightCandidates = candidates.filter((candidate) => candidate !== column);
  return nonStraightCandidates.find((candidate) => !wouldCrossExistingEdge(edges, tierIndex, column, candidate))
    ?? candidates.find((candidate) => !wouldCrossExistingEdge(edges, tierIndex, column, candidate))
    ?? column;
}

function getNextColumnCandidates(seed: number, pathIndex: number, tierIndex: number, column: number, pathColumns: number[]) {
  return [...PATH_OFFSETS]
    .map((offset) => column + offset)
    .filter((candidate) => candidate >= 0 && candidate < MAP_COLUMN_COUNT)
    .sort((a, b) => getPathCandidateScore(seed, pathIndex, tierIndex, column, a, pathColumns) - getPathCandidateScore(seed, pathIndex, tierIndex, column, b, pathColumns));
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

function createTierNodesFromColumns(seed: number, tierIndex: number, columns: number[], edges: PathEdge[]) {
  return columns.map((column) => {
    const id = getNodeId(tierIndex, column);
    return {
      column,
      id,
      kind: "enemy" as SpireNodeKind,
      nextIds: getNextIdsForColumn(tierIndex, column, edges),
      rating: SPIRE_RATINGS[tierIndex],
      x: getNodeX(seed, tierIndex, column),
      y: getNodeY(tierIndex)
    };
  });
}

function getNextIdsForColumn(tierIndex: number, column: number, edges: PathEdge[]) {
  const nextColumns = Array.from(new Set(edges.filter((edge) => edge.fromTier === tierIndex && edge.fromColumn === column).map((edge) => edge.toColumn)));
  return nextColumns.map((nextColumn) => getNodeId(tierIndex + 1, nextColumn));
}

function getNodeId(tierIndex: number, column: number) { return `tier-${tierIndex}-${column}-${SPIRE_RATINGS[tierIndex]}`; }

function assignRoomKinds(seed: number, rows: SpireMapNode[][]) {
  const assignedByOrigin = new Map<string, Set<SpireNodeKind>>();
  const assignedRows: SpireMapNode[][] = [];
  for (const [tierIndex, row] of rows.entries()) {
    const assignedRow = row.map((node, slot) => {
      const incoming = getIncomingNodes(assignedRows, tierIndex, node.id);
      const kind = getNodeKind(seed, tierIndex, slot, incoming, assignedByOrigin);
      for (const origin of incoming) {
        if (origin.nextIds.length > 1) {
          const assigned = assignedByOrigin.get(origin.id) || new Set<SpireNodeKind>();
          assigned.add(kind);
          assignedByOrigin.set(origin.id, assigned);
        }
      }
      return { ...node, kind };
    });
    assignedRows.push(assignedRow);
  }
  return balanceSpecialRoomCounts(seed, assignedRows);
}

function balanceSpecialRoomCounts(seed: number, rows: SpireMapNode[][]) {
  const cappedUnknowns = capUnknownRooms(seed, rows);
  const withElites = ensureMinimumRoomKind(seed, cappedUnknowns, "elite", MIN_ELITE_ROOM_COUNT);
  return ensureMinimumRoomKind(seed, withElites, "rest", MIN_REST_ROOM_COUNT);
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

function getForceableRoomCount(rows: SpireMapNode[][], kind: SpireNodeKind, fromTierIndex: number) {
  return rows.slice(fromTierIndex).flatMap((row, tierOffset) => row.filter((node) => canForceRoomKind(rows, fromTierIndex + tierOffset, node, kind))).length;
}

function canForceRoomKind(rows: SpireMapNode[][], tierIndex: number, node: SpireMapNode, kind: SpireNodeKind) {
  return node.kind === "enemy"
    && isKindAllowedOnFloor(tierIndex, kind)
    && !getIncomingNodes(rows, tierIndex, node.id).some((incoming) => CONSECUTIVE_BLOCKED_KINDS.includes(incoming.kind))
    && !node.nextIds.some((nextId) => rows[tierIndex + 1]?.some((nextNode) => nextNode.id === nextId && CONSECUTIVE_BLOCKED_KINDS.includes(nextNode.kind)));
}

function isKindAllowedOnFloor(tierIndex: number, kind: SpireNodeKind) {
  if ((kind === "elite" || kind === "rest") && tierIndex < FLOOR_SIX_INDEX) {
    return false;
  }
  return tierIndex !== FLOOR_ONE_INDEX && tierIndex !== TREASURE_FLOOR_INDEX && tierIndex !== BOSS_FLOOR_INDEX;
}

function getIncomingNodes(rows: SpireMapNode[][], tierIndex: number, nodeId: string) {
  return tierIndex > FIRST_TIER ? rows[tierIndex - 1].filter((node) => node.nextIds.includes(nodeId)) : [];
}

function getNodeKind(seed: number, tierIndex: number, slot: number, incoming: SpireMapNode[], assignedByOrigin: Map<string, Set<SpireNodeKind>>) {
  const forced = getForcedNodeKind(tierIndex);
  if (forced) {
    return forced;
  }
  const candidates = getCandidateKinds(tierIndex, incoming, assignedByOrigin);
  return pickWeightedKind(candidates, `${seed}:kind:${tierIndex}:${slot}`);
}

function getForcedNodeKind(tierIndex: number): SpireNodeKind | null {
  if (tierIndex === FLOOR_ONE_INDEX) {
    return "enemy";
  }
  if (tierIndex === TREASURE_FLOOR_INDEX) {
    return "treasure";
  }
  if (tierIndex === FLOOR_FOURTEEN_INDEX) {
    return "rest";
  }
  if (tierIndex === BOSS_FLOOR_INDEX) {
    return "boss";
  }
  return null;
}

function getCandidateKinds(tierIndex: number, incoming: SpireMapNode[], assignedByOrigin: Map<string, Set<SpireNodeKind>>) {
  const blocked = new Set<SpireNodeKind>();
  if (tierIndex < FLOOR_SIX_INDEX) {
    blocked.add("elite");
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

function getTierIndex(rating: number) { return Math.max(FIRST_TIER, SPIRE_RATINGS.findIndex((row) => row === rating)); }

function getRoundQuestionCount(node: SpireMapNode, now: number) { return node.kind === "elite" || node.kind === "boss" ? MAX_ROUND_QUESTION_COUNT : MIN_ROUND_QUESTION_COUNT + Math.floor(getRoll(`${node.id}:${now}:round-count`) * (MAX_ROUND_QUESTION_COUNT - MIN_ROUND_QUESTION_COUNT + 1)); }

function pickRoundQuestions(node: SpireMapNode, seed: number, previousIds: string[], count: number) {
  const targetRating = node.kind === "elite" || node.kind === "boss" ? Math.min(SPIRE_RATINGS[SPIRE_RATINGS.length - 1], node.rating + ELITE_RATING_BOOST) : node.rating;
  const ranked = [...questions]
    .filter((question) => !previousIds.includes(question.id))
    .sort((a, b) => getQuestionSortValue(node, b, targetRating, seed) - getQuestionSortValue(node, a, targetRating, seed));
  return ranked.slice(0, count).map((question) => question.id);
}

function getQuestionSortValue(node: SpireMapNode, question: Question, targetRating: number, seed: number) { const ratingFit = RATING_FIT_BASE - Math.abs(question.rating - targetRating); const eliteBonus = node.kind === "elite" || node.kind === "boss" ? getUniqueMonsterBonusCount(question) * ELITE_BONUS_SORT_WEIGHT : 0; return ratingFit + eliteBonus + getRoll(`${seed}:${question.id}`); }

function getRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}
