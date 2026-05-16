import { describe, expect, it } from "vitest";

import { getUniqueMonsterBonusCount, getUniqueMonsterBonuses, getUniqueMonsterName, UNIQUE_MONSTER_BONUSES } from "../lib/monsterCore";
import type { Difficulty, Question } from "../types/study";

describe("monsterCore", () => {
  it("uses the Diablo II unique bonus count by app difficulty band", () => {
    expect(getUniqueMonsterBonusCount(makeQuestion(1, 1200))).toBe(1);
    expect(getUniqueMonsterBonusCount(makeQuestion(3, 1700))).toBe(2);
    expect(getUniqueMonsterBonusCount(makeQuestion(5, 2400))).toBe(3);
    expect(getUniqueMonsterBonusCount(makeQuestion(1, 2600))).toBe(3);
  });

  it("picks unique bonuses from the thirteen Diablo II bonus categories", () => {
    const question = makeQuestion(5, 3200);
    const bonuses = getUniqueMonsterBonuses(question);
    expect(bonuses).toHaveLength(3);
    expect(new Set(bonuses).size).toBe(bonuses.length);
    expect(bonuses.every((bonus) => UNIQUE_MONSTER_BONUSES.includes(bonus as (typeof UNIQUE_MONSTER_BONUSES)[number]))).toBe(true);
  });

  it("generates stable prefix suffix appellation names", () => {
    const question = makeQuestion(4, 2100);
    expect(getUniqueMonsterName(question)).toBe(getUniqueMonsterName(question));
    expect(getUniqueMonsterName(question).split(" ")).toHaveLength(4);
  });
});

function makeQuestion(difficulty: Difficulty, rating: number): Question {
  return {
    constraints: [],
    difficulty,
    examples: [],
    functionName: "solve",
    hint: "Think about the invariant.",
    id: `question-${difficulty}-${rating}`,
    prompt: "Solve the task.",
    rating,
    starter: "function solve() {}",
    tests: [],
    title: "Question",
    topics: []
  };
}
