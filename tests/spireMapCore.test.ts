import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { advanceSpireNode, completeSpireQuestion, createSpireRun, enterSpireNode, getCurrentSpireNode, selectSpireNode, SPIRE_RATINGS } from "../lib/spireMapCore";
import { defaultState } from "../lib/studyCore";
import type { SpireNodeKind } from "../types/study";

const FLOOR_ONE = 1500;
const FLOOR_SIX = 2250;
const FLOOR_NINE = 2700;
const FLOOR_FOURTEEN = 3400;
const FLOOR_FIFTEEN = 3500;
const DEAD_ROOM_SAMPLE_COUNT = 25;
const MAX_PATH_STEP = 1;
const MAX_MAP_COLUMNS = 7;
const MIN_ELITE_ROOMS = 3;
const MIN_REST_ROOMS = 2;
const UNKNOWN_ROOM_RATIO_CAP = 0.2;
const STRAIGHT_CHAIN_SAMPLE_COUNT = 20;
const CONSECUTIVE_BLOCKED_KINDS: SpireNodeKind[] = ["elite", "merchant", "rest"];

describe("spireMapCore", () => {
  it("creates a randomized fifteen-floor map from 1500 to 3500", () => {
    const run = createSpireRun(1000);

    expect([...new Set(run.nodes.map((node) => node.rating))]).toEqual([...SPIRE_RATINGS]);
    expect(run.mapOpen).toBe(true);
    expect(run.roundQuestionIds).toHaveLength(0);
    expect(run.availableNodeIds.length).toBeGreaterThan(1);
    expect(run.nodes[0].rating).toBe(FLOOR_ONE);
    expect(run.nodes[run.nodes.length - 1].rating).toBe(3500);
  });

  it("applies fixed floor and room assignment rules", () => {
    const run = createSpireRun(2000);

    expect(run.nodes.filter((node) => node.rating === FLOOR_ONE).every((node) => node.kind === "enemy")).toBe(true);
    expect(run.nodes.filter((node) => node.rating === FLOOR_NINE).every((node) => node.kind === "treasure")).toBe(true);
    expect(run.nodes.filter((node) => node.rating === FLOOR_FIFTEEN).every((node) => node.kind === "boss")).toBe(true);
    expect(run.nodes.filter((node) => node.rating < FLOOR_SIX).some((node) => node.kind === "elite" || node.kind === "rest")).toBe(false);
    expect(run.nodes.filter((node) => node.rating === FLOOR_FOURTEEN).every((node) => node.kind === "rest")).toBe(true);
  });

  it("prevents consecutive elite merchant or rest rooms before the pre-boss rest floor", () => {
    const run = createSpireRun(3000);
    const byId = new Map(run.nodes.map((node) => [node.id, node]));

    for (const node of run.nodes) {
      if (!CONSECUTIVE_BLOCKED_KINDS.includes(node.kind) || node.rating >= FLOOR_FOURTEEN) {
        continue;
      }
      for (const nextId of node.nextIds) {
        const next = byId.get(nextId);
        expect(next && next.rating < FLOOR_FOURTEEN && CONSECUTIVE_BLOCKED_KINDS.includes(next.kind)).toBe(false);
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

  it("only connects nearby columns and avoids crossed paths", () => {
    const run = createSpireRun(4500);
    const byId = new Map(run.nodes.map((node) => [node.id, node]));

    for (const node of run.nodes) {
      for (const nextId of node.nextIds) {
        const next = byId.get(nextId);
        expect(next?.rating).toBeGreaterThan(node.rating);
        expect(next ? Math.abs(next.column - node.column) : Number.POSITIVE_INFINITY).toBeLessThanOrEqual(MAX_PATH_STEP);
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

  it("avoids long straight vertical path chains", () => {
    for (const seed of Array.from({ length: STRAIGHT_CHAIN_SAMPLE_COUNT }, (_unused, index) => 7000 + index)) {
      const run = createSpireRun(seed);
      const incomingById = new Map<string, typeof run.nodes>();
      const byId = new Map(run.nodes.map((node) => [node.id, node]));
      for (const node of run.nodes) {
        for (const nextId of node.nextIds) {
          incomingById.set(nextId, [...(incomingById.get(nextId) || []), node]);
        }
      }

      for (const node of run.nodes) {
        const previousSameColumn = (incomingById.get(node.id) || []).some((previous) => previous.column === node.column);
        const nextSameColumn = node.nextIds.some((id) => byId.get(id)?.column === node.column);
        expect(previousSameColumn && nextSameColumn).toBe(false);
      }
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

  it("grants relics from treasure nodes", () => {
    let state = defaultState();
    state = { ...state, profile: { ...state.profile, spireRun: createSpireRun(1000) } };
    const treasure = state.profile.spireRun.nodes.find((node) => node.kind === "treasure") || state.profile.spireRun.nodes[0];
    state.profile.spireRun.availableNodeIds = [treasure.id];

    state = selectSpireNode(state, treasure.id);
    state = advanceSpireNode(state, 1000);

    expect(state.profile.relics).toHaveLength(1);
  });
});
