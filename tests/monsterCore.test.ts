import { describe, expect, it } from "vitest";

import { getMonsterAttackProfile, getMonsterMaxHealth, getMonsterPlayerDamage, getMonsterWrongSubmitDebuffs, getUniqueMonsterBonusCount, getUniqueMonsterBonuses, getUniqueMonsterBonusesWithExtra, getUniqueMonsterName, UNIQUE_MONSTER_BONUSES } from "../lib/monsterCore";
import { DAMAGE_TYPES, ELEMENTAL_DAMAGE_TYPES } from "../lib/resistanceCore";
import type { Difficulty, Question } from "../types/study";

describe("monsterCore", () => {
  it("rolls unique bonuses sometimes instead of on every monster", () => {
    const counts = Array.from({ length: 80 }, (_, index) => getUniqueMonsterBonusCount({ ...makeQuestion(1, 1200), id: `easy-${index}` }));

    expect(counts.some((count) => count === 0)).toBe(true);
    expect(counts.some((count) => count === 1)).toBe(true);
  });

  it("picks unique bonuses from the Hades-style monster bonus categories", () => {
    const question = findQuestion((bonuses) => bonuses.length === 3);
    const bonuses = getUniqueMonsterBonuses(question);
    expect(bonuses).toHaveLength(3);
    expect(new Set(bonuses).size).toBe(bonuses.length);
    expect(bonuses.every((bonus) => UNIQUE_MONSTER_BONUSES.includes(bonus as (typeof UNIQUE_MONSTER_BONUSES)[number]))).toBe(true);
  });

  it("lets pact ranks add unique monster traits to combat rolls", () => {
    const question = findQuestion((bonuses) => bonuses.length === 0, 1, 1200);
    const boostedBonuses = getUniqueMonsterBonusesWithExtra(question, 2);

    expect(getUniqueMonsterBonusCount(question)).toBe(0);
    expect(boostedBonuses).toHaveLength(2);
    expect(getMonsterAttackProfile(question, 5, 1000, 2).bonuses).toEqual(boostedBonuses);
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
    const stoneSkin = findQuestion((bonuses) => bonuses.includes("Stone Skin"));
    const plainHealth = findQuestion((bonuses) => !bonuses.includes("Stone Skin") && !bonuses.includes("Arcane Shield"));

    expect(getMonsterAttackProfile(extraFast, 5, 1000).hitCount).toBe(2);
    expect(UNIQUE_MONSTER_BONUSES).not.toContain("Mana Burn");
    expect(getMonsterMaxHealth(stoneSkin)).toBeGreaterThan(getMonsterMaxHealth(plainHealth));
    expect(getMonsterAttackProfile(stoneSkin, 5, 1000).damage).toBeGreaterThan(0);
  });

  it("lets cursed and spectral enemies apply Hexed and Confused", () => {
    const cursed = findQuestion((bonuses) => bonuses.length === 1 && bonuses.includes("Cursed"), 1, 1200);
    const spectral = findQuestion((bonuses) => bonuses.length === 1 && bonuses.includes("Spectral Hit"), 1, 1200);

    expect(getMonsterWrongSubmitDebuffs(cursed, 1000).map((debuff) => debuff.id)).toContain("hex");
    expect(getMonsterWrongSubmitDebuffs(spectral, 1000).map((debuff) => debuff.id)).toContain("confused");
  });

  it("can roll Hexed and Confused from high-difficulty fallback debuffs", () => {
    const rolledDebuffs = new Set(
      Array.from({ length: 800 }, (_unused, index) => getMonsterWrongSubmitDebuffs({ ...makeQuestion(5, 3200), id: `fallback-debuff-${index}` }, 1000 + index))
        .flat()
        .map((debuff) => debuff.id)
    );

    expect(rolledDebuffs).toContain("hex");
    expect(rolledDebuffs).toContain("confused");
  });

  it("keeps enemy traits from countering player damage types", () => {
    const arcaneShield = findQuestion((bonuses) => bonuses.includes("Arcane Shield"));
    const fireEnchanted = findQuestion((bonuses) => bonuses.includes("Fire Enchanted"));

    expect(getMonsterMaxHealth(arcaneShield)).toBeGreaterThan(getMonsterMaxHealth(findQuestion((bonuses) => !bonuses.includes("Arcane Shield") && !bonuses.includes("Stone Skin"))));
    expect(getMonsterPlayerDamage(fireEnchanted, 40, "fire")).toBe(getMonsterPlayerDamage(fireEnchanted, 40, "physical"));
    expect(getMonsterPlayerDamage(fireEnchanted, 40, "poison")).toBe(getMonsterPlayerDamage(fireEnchanted, 40, "physical"));
    expect(getMonsterPlayerDamage(fireEnchanted, 0, "fire")).toBe(0);
  });

  it("rolls elemental attacks more often on higher-rated monsters", () => {
    const low = countElementalAttacks(1, 1000);
    const high = countElementalAttacks(5, 3400);

    expect(low).toBeLessThan(40);
    expect(high).toBeGreaterThan(low);
    const rolledElements = Array.from({ length: 20 }, (_, index) => getMonsterAttackProfile({ ...makeQuestion(5, 3400), id: `element-kind-${index}` }, 8, 1000).element);
    expect(rolledElements.every((element) => DAMAGE_TYPES.includes(element))).toBe(true);
    expect(rolledElements.some((element) => ELEMENTAL_DAMAGE_TYPES.includes(element as (typeof ELEMENTAL_DAMAGE_TYPES)[number]))).toBe(true);
  });
});

function countElementalAttacks(difficulty: Difficulty, rating: number) {
  return Array.from({ length: 80 }, (_, index) => {
    return getMonsterAttackProfile({ ...makeQuestion(difficulty, rating), id: `element-${difficulty}-${rating}-${index}` }, 6, 1000).element;
  }).filter((element) => element !== "physical").length;
}

function findQuestion(predicate: (bonuses: string[]) => boolean, difficulty: Difficulty = 5, rating = 3200) {
  for (let index = 0; index < 1000; index += 1) {
    const question = { ...makeQuestion(difficulty, rating), id: `monster-fixture-${difficulty}-${rating}-${index}` };
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
