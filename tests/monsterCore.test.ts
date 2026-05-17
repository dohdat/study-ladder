import { describe, expect, it } from "vitest";

import { getMonsterAttackProfile, getMonsterMaxHealth, getMonsterPlayerDamage, getUniqueMonsterBonusCount, getUniqueMonsterBonuses, getUniqueMonsterName, UNIQUE_MONSTER_BONUSES } from "../lib/monsterCore";
import type { Difficulty, Question } from "../types/study";

describe("monsterCore", () => {
  it("rolls unique bonuses sometimes instead of on every monster", () => {
    const counts = Array.from({ length: 80 }, (_, index) => getUniqueMonsterBonusCount({ ...makeQuestion(1, 1200), id: `easy-${index}` }));

    expect(counts.some((count) => count === 0)).toBe(true);
    expect(counts.some((count) => count === 1)).toBe(true);
  });

  it("picks unique bonuses from the thirteen Diablo II bonus categories", () => {
    const question = findQuestion((bonuses) => bonuses.length === 3);
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

  it("applies multi-shot as multiple failed-submit hits", () => {
    const question = findQuestion((bonuses) => bonuses.includes("Multi-Shot"));
    expect(getUniqueMonsterBonuses(question)).toContain("Multi-Shot");

    const attack = getMonsterAttackProfile(question, 5, 1000);
    expect(attack.hitCount).toBeGreaterThanOrEqual(3);
    expect(attack.damage).toBe(attack.perHitDamage * attack.hitCount);
  });

  it("applies every unique bonus to combat math", () => {
    const extraFast = findQuestion((bonuses) => bonuses.includes("Extra Fast") && !bonuses.includes("Multi-Shot"));
    const manaBurn = findQuestion((bonuses) => bonuses.includes("Mana Burn"));
    const stoneSkin = findQuestion((bonuses) => bonuses.includes("Stone Skin"));
    const plainHealth = findQuestion((bonuses) => !bonuses.includes("Stone Skin") && !bonuses.includes("Magic Resistant"));

    expect(getMonsterAttackProfile(extraFast, 5, 1000).hitCount).toBe(2);
    expect(getMonsterAttackProfile(manaBurn, 5, 1000).manaDamage).toBeGreaterThan(0);
    expect(getMonsterMaxHealth(stoneSkin)).toBeGreaterThan(getMonsterMaxHealth(plainHealth));
    expect(getMonsterPlayerDamage(stoneSkin, 40)).toBeLessThan(40);
  });
});

function findQuestion(predicate: (bonuses: string[]) => boolean) {
  for (let index = 0; index < 1000; index += 1) {
    const question = { ...makeQuestion(5, 3200), id: `monster-fixture-${index}` };
    if (predicate(getUniqueMonsterBonuses(question))) {
      return question;
    }
  }
  throw new Error("No monster fixture matched the requested unique bonus.");
}

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
