import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { buyShopItem } from "../lib/shopCore";
import { advanceSpireNode, canEditSpireHeat, choosePendingRelicReward, claimCurrentSpireRoomReward, completeSpireQuestion, createSpireRun, enterSpireNode, getCurrentSpireNode, isSpireHeatSetupOpen, isSpireRunSetupOpen, leaveSpireRoom, normalizeSpireRun, selectPendingRelicReward, selectSpireNode, setSpireHeatConditionRank, skipPendingRelicReward, smithSpireNode, SPIRE_RATINGS, startSpireHeatRun, upgradeCurrentSpireRoomItem } from "../lib/spireMapCore";
import { EXPERIENCE_PER_LEVEL, defaultState, getMaxHealth, getMaxMana } from "../lib/studyCore";
import type { SpireCombatRewardKind, SpireNodeKind } from "../types/study";

const FLOOR_ONE = 1500;
const FLOOR_FOUR = 1615;
const FLOOR_FIVE = 1650;
const FLOOR_SIX = 1690;
const FLOOR_SEVEN = 1725;
const FLOOR_EIGHT = 1765;
const FLOOR_TEN = 1840;
const FLOOR_FOURTEEN = 1975;
const FLOOR_FIFTEEN = 2000;
const DEAD_ROOM_SAMPLE_COUNT = 25;
const MAX_PATH_STEP = 1;
const MAX_MAP_COLUMNS = 7;
const START_NODE_COUNT = 4;
const MIN_OCCUPANCY = 0.5;
const MAX_OCCUPANCY = 0.62;
const MIN_AVERAGE_BRANCHING = 1.4;
const MAX_AVERAGE_BRANCHING = 2.8;
const MIN_ELITE_ROOMS = 3;
const MIN_REST_ROOMS = 2;
const UNKNOWN_ROOM_RATIO_CAP = 0.2;
const CONSECUTIVE_BLOCKED_KINDS: SpireNodeKind[] = ["elite", "merchant", "rest"];

describe("spireMapCore", () => {
  it("creates a randomized fifteen-floor map from 1500 to 2000", () => {
    const run = createSpireRun(1000);

    expect([...new Set(run.nodes.map((node) => node.rating))]).toEqual([...SPIRE_RATINGS]);
    expect(run.mapOpen).toBe(true);
    expect(run.roundQuestionIds).toHaveLength(0);
    expect(run.availableNodeIds.length).toBeGreaterThan(1);
    expect(run.nodes[0].rating).toBe(FLOOR_ONE);
    expect(run.nodes[run.nodes.length - 1].rating).toBe(FLOOR_FIFTEEN);
  });

  it("scales act rating bands from the configured minimum rating", () => {
    const actOne = createSpireRun(1000, 1, "normal", {}, false, 1500);
    const actTwo = createSpireRun(1000, 2, "normal", {}, false, 1500);
    const actThree = createSpireRun(1000, 3, "normal", {}, false, 1500);
    const actFour = createSpireRun(1000, 4, "normal", {}, false, 1500);
    expect(actOne.nodes[actOne.nodes.length - 1].rating).toBe(2000);
    expect(actTwo.nodes[0].rating).toBe(2000);
    expect(actTwo.nodes[actTwo.nodes.length - 1].rating).toBe(2500);
    expect(actThree.nodes[0].rating).toBe(2500);
    expect(actFour.nodes[0].rating).toBe(3000);

    const shiftedActOne = createSpireRun(1000, 1, "normal", {}, false, 1800);
    const shiftedActFour = createSpireRun(1000, 4, "normal", {}, false, 1800);
    expect(shiftedActOne.nodes[0].rating).toBe(1800);
    expect(shiftedActFour.nodes[0].rating).toBe(3300);
  });

  it("applies fixed floor and room assignment rules", () => {
    const run = createSpireRun(2000);
    const byId = new Map(run.nodes.map((node) => [node.id, node]));

    expect(run.nodes.filter((node) => node.rating === FLOOR_ONE).every((node) => node.kind === "enemy")).toBe(true);
    expect(run.nodes.filter((node) => node.rating === FLOOR_ONE)).toHaveLength(START_NODE_COUNT);
    expect(run.nodes.filter((node) => node.rating >= FLOOR_EIGHT && node.rating <= FLOOR_TEN && node.kind === "treasure")).toHaveLength(1);
    expect(run.nodes.filter((node) => node.rating === FLOOR_FOURTEEN).every((node) => node.kind === "rest")).toBe(true);
    expect(run.nodes.filter((node) => node.rating === FLOOR_FOURTEEN).length).toBeGreaterThan(0);
    expect(run.nodes.filter((node) => node.rating === FLOOR_FIFTEEN).every((node) => node.kind === "boss")).toBe(true);
    expect(run.nodes.filter((node) => node.rating === FLOOR_FIFTEEN)).toHaveLength(1);
    expect(run.nodes.filter((node) => node.rating < FLOOR_SIX).some((node) => node.kind === "rest")).toBe(false);
    expect(run.nodes.filter((node) => node.rating < FLOOR_SEVEN).some((node) => node.kind === "elite")).toBe(false);
    expect(run.nodes.filter((node) => node.rating < FLOOR_FIVE).some((node) => node.kind === "treasure")).toBe(false);
    expect(run.nodes.filter((node) => node.rating < FLOOR_FOUR).some((node) => node.kind === "merchant")).toBe(false);
    expect(run.nodes.filter((node) => node.kind === "boss").every((node) => {
      const incoming = run.nodes.filter((previous) => previous.nextIds.includes(node.id));
      return incoming.length > 0 && incoming.every((previous) => byId.has(previous.id));
    })).toBe(true);
  });

  it("repairs old saved maps that have a non-boss final floor", () => {
    const run = createSpireRun(2100);
    const savedRun = {
      ...run,
      nodes: run.nodes.map((node) => node.rating === FLOOR_FIFTEEN ? { ...node, kind: "enemy" as const } : node)
    };

    const normalized = normalizeSpireRun(savedRun);

    expect(normalized.nodes.filter((node) => node.rating === FLOOR_FIFTEEN).every((node) => node.kind === "boss")).toBe(true);
  });

  it("advances through acts and unlocks heat after the first full clear", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000, 1, "normal") } };
    const actOneBoss = state.profile.spireRun.nodes.find((node) => node.kind === "boss") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [actOneBoss.id];
    state = selectSpireNode(state, actOneBoss.id);
    state = advanceSpireNode(state, 2000);
    state = skipPendingRelicReward(state);
    state = leaveSpireRoom(state, 2001);

    expect(state.profile.spireRun.act).toBe(2);
    expect(state.profile.spireRun.difficulty).toBe("normal");
    expect(state.profile.spireRun.mapOpen).toBe(true);
    expect(state.profile.spireRun.availableNodeIds.length).toBeGreaterThan(1);

    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3000, 4, "normal") } };
    const actFourBoss = state.profile.spireRun.nodes.find((node) => node.kind === "boss") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [actFourBoss.id];
    state = selectSpireNode(state, actFourBoss.id);
    state = advanceSpireNode(state, 4000);
    state = skipPendingRelicReward(state);
    state = leaveSpireRoom(state, 4001);

    expect(state.profile.spireRun.act).toBe(1);
    expect(state.profile.spireRun.difficulty).toBe("normal");
    expect(state.profile.metaProgress.heatUnlocked).toBe(true);
    expect(isSpireHeatSetupOpen(state)).toBe(true);
    expect(canEditSpireHeat(state)).toBe(true);

    state = setSpireHeatConditionRank(state, "hardLabor", 5);
    state = setSpireHeatConditionRank(state, "tightDeadline", 5);

    expect(state.profile.spireRun.heatConditions.hardLabor).toBe(5);
    expect(state.profile.spireRun.heatConditions.tightDeadline).toBe(5);

    const beforeStart = state;
    state = enterSpireNode(state, 5000);
    expect(state).toBe(beforeStart);

    state = startSpireHeatRun(state);
    expect(isSpireHeatSetupOpen(state)).toBe(false);
    expect(canEditSpireHeat(state)).toBe(false);
  });

  it("allows the between-run setup screen before heat is unlocked", () => {
    let state = defaultState();
    state.profile.spireRun = createSpireRun(1000, 1, "normal", {}, true);

    expect(isSpireRunSetupOpen(state)).toBe(true);
    expect(isSpireHeatSetupOpen(state)).toBe(false);
    expect(canEditSpireHeat(state)).toBe(false);

    const beforeStart = state;
    state = enterSpireNode(state, 1001);
    expect(state).toBe(beforeStart);

    state = startSpireHeatRun(state);
    expect(isSpireRunSetupOpen(state)).toBe(false);
  });

  it("prevents consecutive elite merchant or rest rooms before the pre-boss rest floor", () => {
    const run = createSpireRun(3000);
    const byId = new Map(run.nodes.map((node) => [node.id, node]));

    for (const node of run.nodes) {
      if (!CONSECUTIVE_BLOCKED_KINDS.includes(node.kind) || node.rating >= FLOOR_FIFTEEN) {
        continue;
      }
      for (const nextId of node.nextIds) {
        const next = byId.get(nextId);
        expect(next && next.rating < FLOOR_FIFTEEN && CONSECUTIVE_BLOCKED_KINDS.includes(next.kind)).toBe(false);
      }
    }
  });

  it("keeps enough elite and rest rooms on the map", () => {
    const run = createSpireRun(3500);

    expect(run.nodes.filter((node) => node.kind === "elite").length).toBeGreaterThanOrEqual(MIN_ELITE_ROOMS);
    expect(run.nodes.filter((node) => node.kind === "rest").length).toBeGreaterThanOrEqual(MIN_REST_ROOMS);
    expect(run.nodes.filter((node) => node.kind === "unknown").length).toBeLessThanOrEqual(Math.floor(run.nodes.length * UNKNOWN_ROOM_RATIO_CAP));
  });

  it("uses a sparse seven-column map instead of filling every floor", () => {
    const run = createSpireRun(4000);

    for (const rating of SPIRE_RATINGS) {
      const row = run.nodes.filter((node) => node.rating === rating);
      expect(row.length).toBeGreaterThan(0);
      expect(row.length).toBeLessThanOrEqual(MAX_MAP_COLUMNS);
    }
    expect(run.nodes.length).toBeLessThan(SPIRE_RATINGS.length * MAX_MAP_COLUMNS);
  });

  it("keeps Slay-style occupancy and branching within strategic bounds", () => {
    const run = createSpireRun(4100);
    const occupancy = run.nodes.length / (SPIRE_RATINGS.length * MAX_MAP_COLUMNS);
    const branchingNodes = run.nodes.filter((node) => node.rating !== FLOOR_FIFTEEN);
    const averageBranching = branchingNodes.reduce((sum, node) => sum + node.nextIds.length, 0) / branchingNodes.length;

    expect(occupancy).toBeGreaterThanOrEqual(MIN_OCCUPANCY);
    expect(occupancy).toBeLessThanOrEqual(MAX_OCCUPANCY);
    expect(averageBranching).toBeGreaterThanOrEqual(MIN_AVERAGE_BRANCHING);
    expect(averageBranching).toBeLessThanOrEqual(MAX_AVERAGE_BRANCHING);
  });

  it("only connects nearby columns and avoids crossed paths", () => {
    const run = createSpireRun(4500);
    const byId = new Map(run.nodes.map((node) => [node.id, node]));

    for (const node of run.nodes) {
      for (const nextId of node.nextIds) {
        const next = byId.get(nextId);
        expect(next?.rating).toBeGreaterThan(node.rating);
        if (next?.rating !== FLOOR_FIFTEEN) {
          expect(next ? Math.abs(next.column - node.column) : Number.POSITIVE_INFINITY).toBeLessThanOrEqual(MAX_PATH_STEP);
        }
      }
    }

    for (const rating of SPIRE_RATINGS.slice(0, -1)) {
      const edges = run.nodes
        .filter((node) => node.rating === rating)
        .flatMap((node) => node.nextIds.map((id) => {
          const next = byId.get(id);
          return next ? { fromColumn: node.column, toColumn: next.column } : null;
        }))
        .filter((edge): edge is { fromColumn: number; toColumn: number } => Boolean(edge));
      expect(edges.some((edge, index) => edges.slice(index + 1).some((other) => (edge.fromColumn < other.fromColumn && edge.toColumn > other.toColumn) || (edge.fromColumn > other.fromColumn && edge.toColumn < other.toColumn)))).toBe(false);
    }
  });

  it("does not create unreachable dead rooms after the first floor", () => {
    for (const seed of Array.from({ length: DEAD_ROOM_SAMPLE_COUNT }, (_unused, index) => 5000 + index)) {
      const run = createSpireRun(seed);
      const incomingIds = new Set(run.nodes.flatMap((node) => node.nextIds));

      expect(run.nodes.filter((node) => node.rating !== FLOOR_ONE).every((node) => incomingIds.has(node.id))).toBe(true);
      expect(run.nodes.filter((node) => node.rating !== FLOOR_FIFTEEN).every((node) => node.nextIds.length > 0)).toBe(true);
    }
  });

  it("selects a reachable combat node before entering a 2-3 enemy room", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const nodeId = state.profile.spireRun.availableNodeIds[0];

    state = selectSpireNode(state, nodeId);

    expect(state.profile.spireRun.currentNodeId).toBe(nodeId);
    expect(state.profile.spireRun.mapOpen).toBe(true);
    expect(state.profile.spireRun.roundQuestionIds).toHaveLength(0);

    state = enterSpireNode(state, 1000);

    expect(state.profile.spireRun.mapOpen).toBe(false);
    expect(state.profile.spireRun.roundQuestionIds.length).toBeGreaterThanOrEqual(2);
    expect(state.profile.spireRun.roundQuestionIds.length).toBeLessThanOrEqual(3);
  });

  it("keeps the active room when a saved run is normalized after refresh", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const nodeId = state.profile.spireRun.availableNodeIds[0];
    state = selectSpireNode(state, nodeId);
    state = enterSpireNode(state, 2000);
    const savedRun = {
      ...state.profile.spireRun,
      roundSolvedIds: [state.profile.spireRun.roundQuestionIds[0]]
    };

    const normalized = normalizeSpireRun(savedRun);

    expect(normalized.currentNodeId).toBe(nodeId);
    expect(normalized.mapOpen).toBe(false);
    expect(normalized.roundQuestionIds).toEqual(savedRun.roundQuestionIds);
    expect(normalized.roundSolvedIds).toEqual(savedRun.roundSolvedIds);
  });

  it("reopens the map after every enemy in the selected room is solved", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const nodeId = state.profile.spireRun.availableNodeIds[0];
    state = selectSpireNode(state, nodeId);
    state = enterSpireNode(state, 1000);
    const firstNode = getCurrentSpireNode(state);
    const roomQuestions = state.profile.spireRun.roundQuestionIds.map((id) => questions.find((question) => question.id === id) || questions[0]);

    for (const question of roomQuestions.slice(0, -1)) {
      state = completeSpireQuestion(state, question, 1000);
    }
    expect(getCurrentSpireNode(state)?.id).toBe(firstNode?.id);
    expect(state.profile.spireRun.mapOpen).toBe(false);

    state = completeSpireQuestion(state, roomQuestions[roomQuestions.length - 1], 3000);
    expect(getCurrentSpireNode(state)?.id).not.toBe(firstNode?.id);
    expect(state.profile.spireRun.mapOpen).toBe(true);
    expect(state.profile.spireRun.availableNodeIds).toEqual(firstNode?.nextIds);
    expect(state.profile.spireRun.roundSolvedIds).toEqual([]);
  });

  it("clears room-scoped relic combat state when leaving a room", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const nodeId = state.profile.spireRun.availableNodeIds[0];
    state = selectSpireNode(state, nodeId);
    state = enterSpireNode(state, 1000);
    state.profile.spireRun.failDamageStacks = 3;
    state.profile.spireRun.runCodeQuestionIds = [state.profile.spireRun.roundQuestionIds[0]];
    const currentNode = getCurrentSpireNode(state);

    state = leaveSpireRoom(state, 3000);

    expect(state.profile.spireRun.mapOpen).toBe(true);
    expect(state.profile.spireRun.availableNodeIds).toEqual(currentNode?.nextIds);
    expect(state.profile.spireRun.failDamageStacks).toBe(0);
    expect(state.profile.spireRun.runCodeQuestionIds).toEqual([]);
  });

  it("offers relic choices from treasure nodes", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const treasure = state.profile.spireRun.nodes.find((node) => node.kind === "treasure") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [treasure.id];

    state = selectSpireNode(state, treasure.id);
    state = advanceSpireNode(state, 1000);
    const choice = state.profile.spireRun.pendingRelicReward?.choices[0];
    state = choosePendingRelicReward(state, choice?.id || "");

    expect(state.profile.relics).toHaveLength(1);
  });

  it("highlights a pending relic choice before confirming it", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const treasure = state.profile.spireRun.nodes.find((node) => node.kind === "treasure") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [treasure.id];
    state = selectSpireNode(state, treasure.id);
    state = advanceSpireNode(state, 1000);
    const choice = state.profile.spireRun.pendingRelicReward?.choices[0];

    state = selectPendingRelicReward(state, choice?.id || "");

    expect(state.profile.spireRun.pendingRelicReward?.selectedRelicId).toBe(choice?.id);
    expect(state.profile.relics).toHaveLength(0);

    state = choosePendingRelicReward(state, state.profile.spireRun.pendingRelicReward?.selectedRelicId || "");

    expect(state.profile.spireRun.pendingRelicReward).toBeNull();
    expect(state.profile.relics).toHaveLength(1);
  });

  it("uses wider offerings meta ranks to add relic reward choices", () => {
    let state = defaultState();
    state.profile.metaProgress.upgrades.relicChoice = 2;
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const treasure = state.profile.spireRun.nodes.find((node) => node.kind === "treasure") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [treasure.id];

    state = selectSpireNode(state, treasure.id);
    state = advanceSpireNode(state, 1000);

    expect(state.profile.spireRun.pendingRelicReward?.choices).toHaveLength(5);
  });

  it("caps map relic reward choices to the current character level", () => {
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL;
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const elite = state.profile.spireRun.nodes.find((node) => node.kind === "elite") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [elite.id];
    state = selectSpireNode(state, elite.id);

    state = advanceSpireNode(state, 1000);

    expect(state.profile.spireRun.pendingRelicReward?.choices.length).toBeGreaterThan(0);
    expect(state.profile.spireRun.pendingRelicReward?.choices.every((relic) => !relic.wikiLevel || relic.wikiLevel <= 2)).toBe(true);
  });

  it("grants enemy room gold when combat rooms are cleared", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const enemy = state.profile.spireRun.nodes.find((node) => node.kind === "enemy") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.nodes = state.profile.spireRun.nodes.map((node) => node.id === enemy.id ? { ...node, rewardKind: "gold" } : node);
    state.profile.spireRun.availableNodeIds = [enemy.id];
    state = selectSpireNode(state, enemy.id);

    state = advanceSpireNode(state, 1000);

    expect(state.profile.coins).toBeGreaterThan(0);
  });

  it("marks generated enemy rooms with visible reward kinds", () => {
    const state = defaultState();
    state.profile.spireRun = createSpireRun(1000);
    const enemyRewards = state.profile.spireRun.nodes.filter((node) => node.kind === "enemy").map((node) => node.rewardKind);

    expect(enemyRewards.length).toBeGreaterThan(0);
    expect(enemyRewards.every((kind) => kind === "gold" || kind === "heart" || kind === "insight")).toBe(true);
    expect(new Set(enemyRewards).size).toBeGreaterThan(1);
  });

  it.each(["gold", "heart", "insight"] satisfies SpireCombatRewardKind[])("applies enemy %s room rewards", (rewardKind) => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const enemy = state.profile.spireRun.nodes.find((node) => node.kind === "enemy") || state.profile.spireRun.nodes[0];
    const maxHealthBefore = getMaxHealth(state);
    const healthBefore = state.profile.health;
    state.profile.spireRun.nodes = state.profile.spireRun.nodes.map((node) => node.id === enemy.id ? { ...node, rewardKind } : node);
    state.profile.spireRun.availableNodeIds = [enemy.id];
    state = selectSpireNode(state, enemy.id);

    state = advanceSpireNode(state, 1000);

    if (rewardKind === "gold") {
      expect(state.profile.coins).toBeGreaterThan(0);
    } else if (rewardKind === "heart") {
      expect(getMaxHealth(state)).toBe(maxHealthBefore + 25);
      expect(state.profile.health).toBe(healthBefore + 25);
      expect(state.profile.spireRun.pendingRelicReward).toBeNull();
    } else if (rewardKind === "insight") {
      expect(state.profile.metaProgress.currency).toBeGreaterThan(0);
    }
  });

  it("grants elite gold and offers upgraded relic choices", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3500) } };
    const elite = state.profile.spireRun.nodes.find((node) => node.kind === "elite") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [elite.id];
    state = selectSpireNode(state, elite.id);

    state = advanceSpireNode(state, 2000);

    expect(state.profile.spireRun.pendingRelicReward?.choices).toHaveLength(4);
    expect(state.profile.coins).toBeGreaterThan(0);
    expect(state.profile.inventory).toHaveLength(0);
  });

  it("rests for 50 percent of max health rounded down", () => {
    let state = defaultState();
    state.profile.health = 10;
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3500) } };
    const rest = state.profile.spireRun.nodes.find((node) => node.kind === "rest") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [rest.id];
    state = selectSpireNode(state, rest.id);
    const expectedHealth = state.profile.health + Math.floor(getMaxHealth(state) * 0.5);

    state = advanceSpireNode(state, 3000);

    expect(state.profile.health).toBe(expectedHealth);
  });

  it("smiths the lowest tier item instead of healing at rest sites", () => {
    let state = defaultState();
    state.profile.health = 10;
    state.profile.inventory.push({
      id: "rusty-sword",
      name: "Rusty Sword",
      rarity: "common",
      requirements: { level: 1, stats: {} },
      slot: "mainHand",
      stats: { strength: 1 }
    });
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3500) } };
    const rest = state.profile.spireRun.nodes.find((node) => node.kind === "rest") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [rest.id];
    state = selectSpireNode(state, rest.id);

    state = smithSpireNode(state, 3500);

    expect(state.profile.inventory[0].rarity).toBe("uncommon");
    expect(state.profile.inventory[0].stats.strength).toBe(2);
    expect(state.profile.health).toBe(10);
    expect(state.profile.spireRun.completedNodeIds).toContain(rest.id);
  });

  it("refreshes merchant stock with potions and a larger relic stock", () => {
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL;
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3500), shopStock: [] } };
    const merchant = state.profile.spireRun.nodes.find((node) => node.kind === "merchant") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [merchant.id];
    state = selectSpireNode(state, merchant.id);

    state = enterSpireNode(state, 4000);

    expect(state.profile.shopStock.some((item) => item.kind === "consumable")).toBe(true);
    expect(state.profile.shopStock.some((item) => item.kind === "relic")).toBe(true);
    expect(state.profile.shopStock.filter((item) => item.kind === "equipment")).toHaveLength(0);
    expect(state.profile.shopStock.filter((item) => item.kind === "relic")).toHaveLength(5);
  });

  it("opens merchant rooms for shopping before continuing to the map", () => {
    let state = defaultState();
    state.profile.coins = 100;
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3500), shopStock: [] } };
    const merchant = state.profile.spireRun.nodes.find((node) => node.kind === "merchant") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [merchant.id];
    state = selectSpireNode(state, merchant.id);

    state = enterSpireNode(state, 4000);

    expect(state.profile.spireRun.mapOpen).toBe(false);
    expect(state.profile.shopStock.some((item) => item.kind === "equipment")).toBe(false);
    expect(state.profile.shopStock.some((item) => item.kind === "relic")).toBe(true);

    const randomPotion = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "random");
    state = buyShopItem(state, randomPotion?.id || "", getMaxHealth(state), getMaxMana(state));
    expect(state.profile.activePotionEffects[0].roomsRemaining).toBe(3);

    state = leaveSpireRoom(state, 4100);
    expect(state.profile.spireRun.mapOpen).toBe(true);
    expect(state.profile.spireRun.availableNodeIds).toEqual(merchant.nextIds);
    expect(state.profile.activePotionEffects[0].roomsRemaining).toBe(3);
  });

  it("opens treasure rooms and waits for the explicit treasure claim", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3500) } };
    const treasure = state.profile.spireRun.nodes.find((node) => node.kind === "treasure") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [treasure.id];
    state = selectSpireNode(state, treasure.id);

    state = enterSpireNode(state, 4200);

    expect(state.profile.spireRun.mapOpen).toBe(false);
    expect(state.profile.relics).toHaveLength(0);

    state = claimCurrentSpireRoomReward(state, 4200);
    expect(state.profile.coins).toBeGreaterThan(0);
    const rewardClaim = state.profile.spireRun.roomRewardClaims[treasure.id];
    expect(rewardClaim?.gold).toBeGreaterThan(0);
    expect(state.profile.spireRun.pendingRelicReward?.choices.length).toBeGreaterThan(1);
    expect(state.profile.relics.length + state.profile.inventory.length).toBe(0);
    expect(state.profile.spireRun.mapOpen).toBe(false);

    const choice = state.profile.spireRun.pendingRelicReward?.choices[0];
    state = choosePendingRelicReward(state, choice?.id || "");
    expect(state.profile.relics).toHaveLength(1);

    state = leaveSpireRoom(state, 4300);
    expect(state.profile.spireRun.mapOpen).toBe(true);
    expect(state.profile.spireRun.availableNodeIds).toEqual(treasure.nextIds);
  });

  it("tracks unknown encounter pity by resetting seen outcomes and increasing the others", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(3500) } };
    const unknown = state.profile.spireRun.nodes.find((node) => node.kind === "unknown") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [unknown.id];
    state = selectSpireNode(state, unknown.id);

    state = enterSpireNode(state, 5000);

    const misses = state.profile.spireRun.unknownEncounterMisses;
    expect(getCurrentSpireNode(state)?.kind).not.toBe("unknown");
    expect(state.profile.spireRun.mapOpen).toBe(false);
    expect(Object.values(misses).some((value) => value === 0)).toBe(true);
    expect(Object.values(misses).filter((value) => value === 1).length).toBe(3);
  });

  it("reveals unknown rooms only as monster treasure shop or elite rooms", () => {
    let baseState = defaultState();
    baseState = { ...baseState, profile: { ...baseState.profile, spireRun: createSpireRun(3500) } };
    const unknown = baseState.profile.spireRun.nodes.find((node) => node.kind === "unknown") || baseState.profile.spireRun.nodes[0];
    baseState.profile.spireRun.availableNodeIds = [unknown.id];
    baseState = selectSpireNode(baseState, unknown.id);

    const revealedKinds = new Set<SpireNodeKind>();
    for (let offset = 0; offset < 80; offset += 1) {
      const entered = enterSpireNode(baseState, 7000 + offset);
      revealedKinds.add(getCurrentSpireNode(entered)?.kind || "unknown");
    }

    expect([...revealedKinds].every((kind) => ["enemy", "treasure", "merchant", "elite"].includes(kind))).toBe(true);
    expect(revealedKinds).toEqual(new Set(["enemy", "treasure", "merchant", "elite"]));
  });

  it("lets god mode select and enter rooms outside the current route", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, godMode: true, spireRun: createSpireRun(3500), shopStock: [] } };
    const offRouteMerchant = state.profile.spireRun.nodes.find((node) => node.kind === "merchant" && !state.profile.spireRun.availableNodeIds.includes(node.id));
    const offRouteUnknown = state.profile.spireRun.nodes.find((node) => node.kind === "unknown" && !state.profile.spireRun.availableNodeIds.includes(node.id));

    expect(offRouteMerchant).toBeTruthy();
    expect(offRouteUnknown).toBeTruthy();

    state = selectSpireNode(state, offRouteMerchant?.id || state.profile.spireRun.nodes[0].id);
    expect(state.profile.spireRun.currentNodeId).toBe(offRouteMerchant?.id);

    state = enterSpireNode(state, 6000);
    expect(state.profile.shopStock.length).toBeGreaterThan(0);

    state = { ...state, profile: { ...state.profile, spireRun: { ...state.profile.spireRun, mapOpen: true } } };
    state = selectSpireNode(state, offRouteUnknown?.id || state.profile.spireRun.nodes[0].id);
    state = enterSpireNode(state, 7000);

    expect(state.profile.spireRun.mapOpen).toBe(false);
    expect(getCurrentSpireNode(state)?.kind).not.toBe("unknown");
  });
});
