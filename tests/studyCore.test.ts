import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { applyPassedCombatResult, getCampaignMonsterMaxHealth, getMonsterCurrentHealth, getMonsterHit, getTimedMonsterAttack } from "../lib/combatCore";
import { createDropItem, ITEM_BASE_NAME_COUNT } from "../lib/itemCore";
import { MODIFIER_FORMATTERS } from "../lib/modifierFormat";
import { getEstimatedRating } from "../lib/ratingCore";
import { WARRIOR_SKILLS, activateWarriorSkill, canUseActiveWarriorSkill, getAvailableWarriorSkillPoints, getWarriorSkillTooltipBreakdown, resetWarriorSkillPoints, spendWarriorSkillPoint } from "../lib/skillCore";
import {
  EXPERIENCE_PER_LEVEL,
  DEFAULT_ITEM_MODIFIERS,
  HEALTH_LOSS_PER_FAIL,
  HINT_COST,
  MAX_CHARACTER_LEVEL,
  MAX_HEALTH,
  MODIFIER_KEYS,
  applyIncomingDamage,
  applyHealingReceived,
  applyScheduleResult,
  applyHealthPenalty,
  buyHint,
  bulkSellItems,
  canBuyHint,
  canEquipItem,
  canPurchaseMetaUpgrade,
  cloneState,
  defaultCard,
  defaultState,
  difficultyLabels,
  getCard,
  getAttackDamage,
  getCoinReward,
  getEffectiveCharacterStats,
  getActiveSetBonuses,
  getCriticalChance,
  getDueQuestions,
  getElementalResistances,
  getEquipmentModifierTotals,
  getExperienceReward,
  getHealthLoss,
  getHintCost,
  getIncomingDamageEffect,
  getLevelProgress,
  getModifiedQuestionTimeLimitMs,
  getItemSellValue,
  getManaReward,
  getMaxHealth,
  getMaxMana,
  getMetaStartingGoldBonus,
  getMetaStartingRelicCount,
  getMetaUpgradeCost,
  getMonsterDamageRoll,
  getMonsterLevel,
  getProfileStats,
  getQuestionTimeLimitMs,
  getQuestionDrop,
  getVisibleQuestionTopics,
  getRecommendedDifficulty,
  getRunModifierTotals,
  getTopicStats,
  getWarriorSkillBonusTotals,
  isQuestionInRecommendedRange,
  isMasteredCard,
  markQuestionRunCode,
  normalizeStudyState,
  pickQuestion,
  purchaseMetaUpgrade,
  sellItem,
  setCard,
  equipItem,
  equipItemToSlot,
  unequipItem,
  spendStatPoint
} from "../lib/studyCore";
import type { InventoryItem, ItemModifierKey, Relic } from "../types/study";

const ITEM_VISIBLE_MOD_CAPS = { common: 0, epic: 8, legendary: 12, rare: 6, uncommon: 2 };

const testRelic = (key: ItemModifierKey, value: number): Relic => ({
  description: "Test relic",
  id: `test-${key}`,
  modifiers: [{ key, value }],
  name: `Test ${key}`,
  rarity: "common",
  source: "any"
});

function getVisibleItemModCount(item: InventoryItem) {
  return Object.values(item.stats).filter(Boolean).length + (item.modifiers || []).length + (item.wikiStats || []).length;
}

describe("studyCore", () => {
  it("keeps every question identity and prompt unique", () => {
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.title)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.functionName)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(questions.length);
  });

  it("keeps every item modifier initialized and displayable", () => {
    for (const key of MODIFIER_KEYS) {
      expect(Number.isFinite(DEFAULT_ITEM_MODIFIERS[key])).toBe(true);
      expect(MODIFIER_FORMATTERS[key]?.(1)).toBeTruthy();
    }
  });

  it("keeps each warrior skill tab filled out", () => {
    const counts = WARRIOR_SKILLS.reduce<Record<string, number>>((total, skill) => ({ ...total, [skill.branch]: (total[skill.branch] || 0) + 1 }), {});

    expect(counts["Combat Skills"]).toBeGreaterThanOrEqual(8);
    expect(counts["Combat Masteries"]).toBeGreaterThanOrEqual(8);
    expect(counts.Warcries).toBeGreaterThanOrEqual(8);
  });

  it("describes warrior skills with current numbers and received bonuses", () => {
    const state = defaultState();
    state.profile.skillRanks = { bash: 2, concentrate: 3, doubleSwing: 4, tripleStrike: 1 };

    const concentrate = getWarriorSkillTooltipBreakdown(state.profile.skillRanks, "concentrate");
    expect(concentrate.effects).toContain("Damage: +15%");
    expect(concentrate.effects).toContain("Bash Bonus Damage: +18%");
    expect(concentrate.receivesBonusesFrom).toContain("Bash: +3% damage per level (current +18%)");

    const tripleStrike = getWarriorSkillTooltipBreakdown(state.profile.skillRanks, "tripleStrike");
    expect(tripleStrike.activeCost).toEqual({ health: undefined });
    expect(tripleStrike.effects).toContain("Damage: 86% per hit");
    expect(tripleStrike.effects).toContain("Total: 258% before armor");
    expect(tripleStrike.receivesBonusesFrom).toContain("Double Swing: +1.5% damage per hit per level (current +6%)");
  });

  it("normalizes empty and partial persisted state", () => {
    const empty = normalizeStudyState(null);
    expect(empty.mode).toBe("leetcode");
    expect(empty.cards).toEqual({});

    const partial = normalizeStudyState({
      mode: "system",
      cards: {
        [questions[0].id]: { ...defaultCard(), attempts: 1 }
      }
    });
    expect(partial.mode).toBe("system");
    expect(partial.profile.startedAt).toEqual(expect.any(Number));
    expect(partial.profile.health).toBe(MAX_HEALTH);
    expect(partial.profile.experience).toBe(0);
    expect(partial.profile.mana).toBe(0);
    expect(partial.profile.statPoints).toBe(0);
    expect(partial.profile.statPointsAwardedLevel).toBe(1);
    expect(partial.profile.skillRanks).toMatchObject({});
    expect(partial.profile.stats).toMatchObject({ strength: 1, constitution: 1, perception: 1, intelligence: 1 });
    expect(partial.profile.shopStock.length).toBeGreaterThan(0);
    expect(getCard(partial, questions[0].id).attempts).toBe(1);
  });

  it("spends insight on permanent meta upgrades without mutating the source state", () => {
    const state = defaultState();
    state.profile.metaProgress.currency = 20;
    const cost = getMetaUpgradeCost(state, "coinPurse");

    expect(canPurchaseMetaUpgrade(state, "coinPurse")).toBe(true);
    const upgraded = purchaseMetaUpgrade(state, "coinPurse");

    expect(upgraded.profile.metaProgress.currency).toBe(20 - cost);
    expect(upgraded.profile.metaProgress.upgrades.coinPurse).toBe(1);
    expect(getMetaStartingGoldBonus(upgraded)).toBe(15);
    expect(state.profile.metaProgress.currency).toBe(20);
    expect(state.profile.metaProgress.upgrades.coinPurse).toBe(0);
  });

  it("uses tough start ranks for permanent max health", () => {
    const state = defaultState();
    state.profile.metaProgress.currency = 20;
    const upgraded = purchaseMetaUpgrade(state, "toughStart");

    expect(upgraded.profile.metaProgress.upgrades.toughStart).toBe(1);
    expect(getMaxHealth(upgraded)).toBe(getMaxHealth(state) + 5);
  });

  it("applies mirror upgrades to run modifier totals", () => {
    const state = defaultState();
    state.profile.metaProgress.upgrades.shadowTraining = 2;
    state.profile.metaProgress.upgrades.fatedPersuasion = 1;
    state.profile.metaProgress.upgrades.oracleFavor = 1;
    state.profile.metaProgress.upgrades.lethalPrecision = 2;
    state.profile.metaProgress.upgrades.eliteHunter = 1;
    state.profile.metaProgress.upgrades.underworldBroker = 2;
    state.profile.metaProgress.upgrades.topicMemory = 1;
    state.profile.metaProgress.upgrades.relicLuck = 2;
    state.profile.metaProgress.upgrades.revealSubmitTests = 2;

    expect(getRunModifierTotals(state)).toMatchObject({
      bonusDamageVsElitesPercent: 8,
      criticalChancePercent: 6,
      enhancedDamagePercent: 10,
      freeHintPerRoom: 1,
      increasedRareDropChancePercent: 12,
      relicRerollBonus: 1,
      revealSubmitTestCount: 2,
      revealTopicCount: 1,
      shopDiscountPercent: 10
    });
  });

  it("uses mirror ranks for starter relic count", () => {
    const state = defaultState();
    state.profile.metaProgress.upgrades.starterRelics = 3;

    expect(getMetaStartingRelicCount(state)).toBe(3);
  });

  it("blocks meta upgrade purchases when insight is missing or the rank is maxed", () => {
    const broke = defaultState();
    expect(purchaseMetaUpgrade(broke, "relicChoice")).toBe(broke);

    const maxed = defaultState();
    maxed.profile.metaProgress.currency = 1000;
    maxed.profile.metaProgress.upgrades.relicChoice = 2;

    expect(canPurchaseMetaUpgrade(maxed, "relicChoice")).toBe(false);
    expect(purchaseMetaUpgrade(maxed, "relicChoice")).toBe(maxed);
  });

  it("clears legacy inventory and equipment from persisted saves", () => {
    const normalized = normalizeStudyState({
      profile: {
        inventory: [{ id: "old-sword", name: "Old Sword", rarity: "rare", requirements: { level: 1, stats: {} }, slot: "mainHand", stats: { strength: 99 } }],
        inventorySlots: { "old-sword": { column: 1, row: 1, tab: 0 } },
        equipment: { mainHand: "old-sword" }
      } as never
    });

    expect(normalized.profile.inventory).toEqual([]);
    expect(normalized.profile.inventorySlots).toEqual({});
    expect(Object.values(normalized.profile.equipment).every((itemId) => itemId === null)).toBe(true);
    expect(getEffectiveCharacterStats(normalized).strength).toBe(getEffectiveCharacterStats(defaultState()).strength);
  });

  it("clones and sets card state without mutating the original", () => {
    const state = defaultState();
    const card = { ...defaultCard(), attempts: 2 };
    setCard(state, questions[0].id, card);

    const copy = cloneState(state);
    copy.cards[questions[0].id].attempts = 7;

    expect(state.cards[questions[0].id].attempts).toBe(2);
    expect(getCard(state, "missing")).toMatchObject(defaultCard());
  });

  it("computes recommended difficulty from Elo rating and has no due queue", () => {
    const state = defaultState();
    expect(getRecommendedDifficulty(state)).toBe(1);
    state.profile.rating = 3000;
    expect(getRecommendedDifficulty(state)).toBe(5);
    expect(getDueQuestions(state, 1000)).toEqual([]);
  });

  it("applies heat modifiers to damage healing and timers", () => {
    const question = questions[0];
    const normal = defaultState();
    const heated = defaultState();
    heated.profile.spireRun.heatConditions.hardLabor = 2;
    heated.profile.spireRun.heatConditions.lastingConsequences = 2;
    heated.profile.spireRun.heatConditions.tightDeadline = 2;

    expect(getCoinReward(question, heated)).toBe(getCoinReward(question, normal));
    expect(getExperienceReward(question, heated)).toBe(0);
    expect(getManaReward(question, heated)).toBe(0);
    expect(getHealthLoss(heated, 10, "fire")).toBeGreaterThan(getHealthLoss(normal, 10, "fire"));
    expect(applyHealingReceived(heated, 20)).toBeLessThan(applyHealingReceived(normal, 20));
    expect(getModifiedQuestionTimeLimitMs(heated, question)).toBeLessThan(getModifiedQuestionTimeLimitMs(normal, question));
  });

  it("picks unseen rating-fit questions and supports next-question navigation", () => {
    const state = defaultState();
    const first = pickQuestion(state, null, false, 1000);
    expect(first.id).toBe(questions[0].id);

    const next = pickQuestion(state, first, true, 1000);
    expect(next.id).toBe(questions[1].id);

    for (const question of questions) {
      setCard(state, question.id, { ...defaultCard(), attempts: 1 });
    }
    setCard(state, questions[2].id, { ...defaultCard(), attempts: 0 });
    expect(pickQuestion(state, null, false, 1000).id).toBe(questions[2].id);
  });

  it("keeps question picks near the player rating", () => {
    const state = defaultState();
    const highRatedQuestion = questions.find((question) => question.rating > 1600);
    expect(highRatedQuestion).toBeTruthy();

    for (const question of questions) {
      setCard(state, question.id, { ...defaultCard(), attempts: 1 });
    }
    setCard(state, highRatedQuestion?.id || questions[0].id, { ...defaultCard(), attempts: 0 });

    const picked = pickQuestion(state, null, false, 1000);
    expect(picked.rating).toBeLessThanOrEqual(1300);
    expect(isQuestionInRecommendedRange(state, highRatedQuestion || questions[0], true)).toBe(false);
  });

  it("applies passed results without spaced-repetition scheduling", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.mana = 4;

    state = applyScheduleResult(state, question.id, true, "draft", 1000);
    expect(getCard(state, question.id)).toMatchObject({
      attempts: 1,
      correct: 1,
      reps: 1,
      intervalDays: 0,
      draft: "draft",
      lastResult: "pass"
    });
    expect(getCard(state, question.id).dueAt).toBe(0);
    expect(state.profile.coins).toBe(getCoinReward(question));
    expect(state.profile.experience).toBe(0);
    expect(state.profile.mana).toBe(4);
    expect(isMasteredCard(getCard(state, question.id))).toBe(true);
    expect(getCard(state, question.id).masteredAt).toBe(1000);
  });

  it("applies failed results without spaced-repetition scheduling", () => {
    const question = questions[0];
    let state = defaultState();
    setCard(state, question.id, { ...defaultCard(), reps: 2, ease: 2.4, correct: 1 });

    state = applyScheduleResult(state, question.id, false, "bad", 1000);
    const card = getCard(state, question.id);

    expect(card.lastResult).toBe("fail");
    expect(card.reps).toBe(2);
    expect(card.failedSubmissions).toBe(1);
    expect(card.dueAt).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.profile.coins).toBe(0);
    expect(state.profile.health).toBe(MAX_HEALTH - HEALTH_LOSS_PER_FAIL);
  });

  it("applies failed-submit health penalties without changing cards", () => {
    const question = questions[0];
    const state = defaultState();
    const penalized = applyHealthPenalty(state, HEALTH_LOSS_PER_FAIL, 3);

    expect(penalized.profile.health).toBe(MAX_HEALTH - HEALTH_LOSS_PER_FAIL);
    expect(penalized.profile.mana).toBe(0);
    expect(getCard(penalized, question.id)).toMatchObject(defaultCard());
    expect(state.profile.health).toBe(MAX_HEALTH);
  });

  it("counts failed submissions against Elo rating", () => {
    const question = questions[2];
    const state = defaultState();
    state.profile.rating = 1300;

    const penalized = applyHealthPenalty(state, HEALTH_LOSS_PER_FAIL, 0, question.id, "bad", 1000);

    expect(getCard(penalized, question.id).failedSubmissions).toBe(1);
    expect(getCard(penalized, question.id).attempts).toBe(1);
    expect(getEstimatedRating(penalized)).toBeLessThan(1300);
  });

  it("rolls higher health loss for higher-level monsters", () => {
    const easyQuestion = questions[0];
    const hardQuestion = questions[questions.length - 1];

    expect(getMonsterLevel(hardQuestion)).toBeGreaterThan(getMonsterLevel(easyQuestion));
    expect(getMonsterDamageRoll(hardQuestion, 1000)).toBeGreaterThan(getMonsterDamageRoll(easyQuestion, 1000));
  });

  it("rewards every successful submit while only mastering on monster defeat", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.mana = 3;
    const firstHit = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(firstHit.hit?.defeated).toBe(false);
    expect(firstHit.state.profile.coins).toBeGreaterThan(0);
    expect(firstHit.state.profile.experience).toBe(0);
    expect(firstHit.state.profile.mana).toBe(3);
    expect(getMonsterCurrentHealth(firstHit.state, question)).toBeLessThan(getMonsterCurrentHealth(state, question));
    expect(getCard(firstHit.state, question.id).correct).toBe(0);

    state = firstHit.state;
    for (let index = 0; index < 10 && getCard(state, question.id).correct === 0; index += 1) {
      state = applyPassedCombatResult(state, question.id, "draft", 2000 + index).state;
    }

    expect(getCard(state, question.id).correct).toBe(1);
    expect(state.profile.coins).toBeGreaterThan(firstHit.state.profile.coins);
    expect(state.profile.mana).toBe(3);
    expect(getMonsterCurrentHealth(state, question)).toBeGreaterThan(0);
  });

  it("keeps level progress fixed for roguelike runs", () => {
    const state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL + 12;

    expect(getLevelProgress(state)).toEqual({
      level: 1,
      currentExperience: 0,
      nextLevelExperience: 1
    });
  });

  it("ignores legacy stored experience when calculating character level", () => {
    const state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL * (MAX_CHARACTER_LEVEL + 20);

    expect(getLevelProgress(state)).toEqual({
      level: 1,
      currentExperience: 0,
      nextLevelExperience: 1
    });
  });

  it("applies character stats to health, gold rewards, and damage reduction", () => {
    const state = defaultState();
    state.profile.stats = { strength: 4, constitution: 4, perception: 4, intelligence: 4 };

    expect(getEffectiveCharacterStats(state)).toMatchObject({ strength: 4, constitution: 4, perception: 4, intelligence: 4 });
    expect(getMaxHealth(state)).toBe(65);
    expect(getMaxMana(state)).toBe(0);
    expect(getHealthLoss(state)).toBe(4);
    expect(getCoinReward(questions[0], state)).toBe(11);
    expect(getExperienceReward(questions[0], state)).toBe(0);
  });

  it("does not apply automatic level stats from legacy experience", () => {
    const base = defaultState();
    const leveled = defaultState();
    leveled.profile.experience = EXPERIENCE_PER_LEVEL * 20;

    expect(getEffectiveCharacterStats(leveled).strength).toBe(getEffectiveCharacterStats(base).strength);
    expect(getCriticalChance(leveled)).toBe(getCriticalChance(base));
  });

  it("does not grant stat points from legacy level ups", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL - getExperienceReward(question, state);

    state = applyScheduleResult(state, question.id, true, "draft", 1000);

    expect(getLevelProgress(state).level).toBe(1);
    expect(state.profile.statPoints).toBe(0);
    expect(state.profile.statPointsAwardedLevel).toBe(1);

    const upgraded = spendStatPoint(state, "strength");
    expect(upgraded).toBe(state);
  });

  it("keeps hidden legacy skill points disabled", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL * 30;

    expect(getAvailableWarriorSkillPoints(state, getLevelProgress(state).level)).toBe(0);
    state = spendWarriorSkillPoint(state, "swordMastery", getLevelProgress(state).level);

    expect(state.profile.skillRanks.swordMastery || 0).toBe(0);
    expect(getWarriorSkillBonusTotals(state)).toMatchObject({ coldResistPercent: 0, criticalChancePercent: 0, damageReduction: 0 });
    expect(getAttackDamage(question, state)).toBe(getAttackDamage(question, defaultState()));
    expect(getCriticalChance(state)).toBe(getCriticalChance(defaultState()));
    expect(getHealthLoss(state)).toBe(getHealthLoss(defaultState()));
    expect(getElementalResistances(state).fire).toBe(0);
  });

  it("resets legacy skill ranks and active skill state", () => {
    let state = defaultState();
    state.profile.skillRanks = { bash: 1, powerStrike: 1 };
    state = activateWarriorSkill(state, "powerStrike");
    expect(state.profile.activeSkill).toBe("powerStrike");

    state = resetWarriorSkillPoints(state);

    expect(getAvailableWarriorSkillPoints(state, getLevelProgress(state).level)).toBe(0);
    expect(state.profile.skillRanks).toEqual({});
    expect(state.profile.activeSkill).toBeNull();
  });

  it("queues active warrior skills and consumes them on the next monster hit", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.skillRanks = { powerStrike: 1 };

    expect(canUseActiveWarriorSkill(state, "powerStrike")).toBe(true);
    state = activateWarriorSkill(state, "powerStrike");
    expect(state.profile.activeSkill).toBe("powerStrike");
    expect(state.profile.mana).toBe(0);

    const normal = applyPassedCombatResult(defaultState(), question.id, "draft", 1000);
    const powered = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(powered.hit?.activeSkillName).toBe("Power Strike");
    expect(powered.hit?.damage).toBeGreaterThanOrEqual(normal.hit?.damage || 0);
    expect(powered.hit?.effects).toContain("Vulnerable burst");
    expect(powered.state.profile.activeSkill).toBeNull();
  });

  it("applies multi-hit active warrior skills", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.skillRanks = { tripleStrike: 1 };
    state = activateWarriorSkill(state, "tripleStrike");

    const result = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(result.hit?.activeSkillName).toBe("Triple Strike");
    expect(result.hit?.hitCount).toBe(3);
    expect(result.hit?.perHitDamage).toBeGreaterThan(0);
    expect(result.hit?.damage).toBeGreaterThan(0);
  });

  it("applies execute and blood active warrior effects", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.skillRanks = { bloodForBlood: 1, execute: 1 };
    setCard(state, question.id, { ...defaultCard(), monsterHealth: 5 });
    const normal = applyPassedCombatResult(defaultState(), question.id, "draft", 1000);
    const executed = applyPassedCombatResult(activateWarriorSkill(state, "execute"), question.id, "draft", 1000);

    expect(executed.hit?.effects).toContain("Execute");
    expect(executed.hit?.damage).toBeGreaterThan(normal.hit?.damage || 0);

    state.profile.health = Math.floor(getMaxHealth(state) / 2);
    const healthBefore = state.profile.health;
    const bloodied = applyPassedCombatResult(activateWarriorSkill(state, "bloodForBlood"), question.id, "draft", 2000);

    expect(bloodied.hit?.effects).toContain("Life steal");
    expect(bloodied.hit?.lifeRestored).toBeGreaterThan(0);
    expect(bloodied.state.profile.health).toBeGreaterThan(healthBefore - 4);
  });

  it("applies passive combat modifiers as real damage and sustain effects", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.relics.push({
      description: "Test combat modifier relic.",
      id: "combat-modifier-sword",
      modifiers: [
        { key: "physicalDamage", value: 5 },
        { key: "fireDamage", value: 3 },
        { key: "lifeStealPercent", value: 20 },
        { key: "extraAttackChancePercent", value: 100 },
        { key: "executeChancePercent", value: 100 },
        { key: "armorPenetrationPercent", value: 100 },
        { key: "resistancePenetrationPercent", value: 100 }
      ],
      name: "Combat Modifier Sword",
      rarity: "rare",
      source: "any"
    });
    setCard(state, question.id, { ...defaultCard(), monsterHealth: 5 });

    const normal = getMonsterHit(defaultState(), question, 1000);
    const modified = getMonsterHit(state, question, 1000);

    expect(modified.effects).toEqual(expect.arrayContaining(["Execute proc", "Extra attack"]));
    expect(modified.hitCount).toBe(normal.hitCount + 1);
    expect(modified.damage).toBeGreaterThan(normal.damage);
    expect(modified.lifeRestored).toBeGreaterThan(0);
  });

  it("keeps mana rewards disabled in roguelike mode", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.relics.push({
      description: "Adds gold after completing a combat.",
      id: "gold-relic",
      modifiers: [{ key: "goldFindPercent", value: 10 }],
      name: "Gold Relic",
      rarity: "common",
      source: "any"
    });
    state.profile.activePotionEffects.push({
      id: "damage-potion-effect",
      modifiers: [{ key: "timerDamagePercent", value: 2 }],
      name: "Damage Potion Effect",
      roomsRemaining: 1,
      stats: {}
    });

    expect(getRunModifierTotals(state).goldFindPercent).toBe(10);
    expect(getManaReward(question, state)).toBe(0);
  });

  it("hardens monsters when the question takes longer", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.relics.push({
      description: "Test elemental pressure relic.",
      id: "elemental-pressure-sword",
      modifiers: [
        { key: "physicalDamage", value: 12 },
        { key: "fireDamage", value: 8 }
      ],
      name: "Elemental Pressure Sword",
      rarity: "rare",
      source: "any"
    });

    const fastHit = getMonsterHit(state, question, 1000, { timePressureRatio: 0 });
    const slowHit = getMonsterHit(state, question, 1000, { timePressureRatio: 1 });

    expect(slowHit.damage).toBeLessThan(fastHit.damage);
    expect(slowHit.effects).toContain("Guarded");
  });

  it("applies no-run and timer relic damage bonuses only when their conditions are met", () => {
    const question = questions[0];
    const state = defaultState();
    state.profile.relics = [{
      description: "Rewards direct submissions and fast solves.",
      id: "direct-fast-submit",
      modifiers: [
        { key: "noRunDamagePercent", value: 50 },
        { key: "timerDamagePercent", value: 20 }
      ],
      name: "Direct Fast Submit",
      rarity: "rare",
      source: "any"
    }];

    const normal = getMonsterHit(state, question, 1000, { timeRemainingRatio: 1, usedRunCode: true });
    const boosted = getMonsterHit(state, question, 1000, { timeRemainingRatio: 1, usedRunCode: false });

    expect(boosted.damage).toBeGreaterThan(normal.damage);
    expect(boosted.effects).toEqual(expect.arrayContaining(["No-run bonus", "Timer damage"]));
    expect(normal.effects).not.toContain("No-run bonus");
  });

  it("stacks temporary wrong-answer relic damage inside the current room", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.spireRun.roundQuestionIds = [question.id];
    state.profile.relics = [{
      description: "Wrong answers increase submit damage this room.",
      id: "failure-engine",
      modifiers: [{ key: "submitFailDamageStackPercent", value: 15 }],
      name: "Failure Engine",
      rarity: "uncommon",
      source: "any"
    }];

    const normal = getMonsterHit(state, question, 1000);
    state = applyHealthPenalty(state, HEALTH_LOSS_PER_FAIL, 0, question.id, "bad", 1000);
    state = applyHealthPenalty(state, HEALTH_LOSS_PER_FAIL, 0, question.id, "bad", 2000);
    const boosted = getMonsterHit(state, question, 3000);

    expect(state.profile.spireRun.failDamageStacks).toBe(2);
    expect(boosted.damage).toBeGreaterThan(normal.damage);
    expect(boosted.effects).toContain("Failure stacks x2");
  });

  it("keeps monster fights in a reasonable correct-submission window", () => {
    const question = { ...questions.find((row) => row.difficulty === 5)!, id: "paced-heat-monster", rating: 2600 };
    const state = defaultState();
    state.profile.spireRun.heatConditions.calisthenicsProgram = 2;
    state.profile.spireRun.heatConditions.damageControl = 2;
    state.profile.spireRun.heatConditions.hardLabor = 2;
    let health = getCampaignMonsterMaxHealth(state, question);
    let hits = 0;

    while (health > 0 && hits < 10) {
      setCard(state, question.id, { ...defaultCard(), monsterHealth: health });
      const hit = getMonsterHit(state, question, 1000 + hits, { timePressureRatio: 1 });
      health = Math.max(0, health - hit.damage);
      hits += 1;
    }

    expect(hits).toBeLessThanOrEqual(6);
    expect(hits).toBeGreaterThanOrEqual(3);
  });

  it("caps regular overpowered hits so hard monsters are not one-shot by passive gear", () => {
    const question = { ...questions.find((row) => row.difficulty === 5)!, id: "paced-overpowered-monster", rating: 2600 };
    let state = defaultState();
    state.profile.inventory.push({
      id: "overpowered-sword",
      modifiers: [
        { key: "physicalDamage", value: 500 },
        { key: "enhancedDamagePercent", value: 500 }
      ],
      name: "Overpowered Sword",
      rarity: "legendary",
      requirements: { level: 1, stats: {} },
      slot: "mainHand",
      stats: {}
    });
    state = equipItem(state, "overpowered-sword");

    const maxHealth = getCampaignMonsterMaxHealth(state, question);
    const hit = getMonsterHit(state, question, 1000, { timePressureRatio: 0 });

    expect(hit.damage).toBeLessThan(maxHealth);
  });

  it("increases monster damage when the question takes longer", () => {
    const question = questions[0];
    const fullTime = getQuestionTimeLimitMs(question);
    const fastRetaliation = getTimedMonsterAttack(question, fullTime, 1000, "retaliation");
    const slowRetaliation = getTimedMonsterAttack(question, 0, 1000, "retaliation");
    const earlyPressure = getTimedMonsterAttack(question, fullTime, 1000, "elapsed");
    const latePressure = getTimedMonsterAttack(question, 0, 1000, "elapsed");

    expect(slowRetaliation.damage).toBeGreaterThan(fastRetaliation.damage);
    expect(earlyPressure.damage).toBe(0);
    expect(latePressure.damage).toBeGreaterThan(fastRetaliation.damage);
  });

  it("enrages low-health monsters for harder attacks", () => {
    const question = questions[0];
    const normal = getTimedMonsterAttack(question, getQuestionTimeLimitMs(question), 1000, "retaliation");
    const enraged = getTimedMonsterAttack(question, getQuestionTimeLimitMs(question), 1000, "retaliation", { enraged: true });

    expect(enraged.damage).toBeGreaterThan(normal.damage);
    expect(enraged.effects).toContain("Enraged");
  });

  it("does not drop equipment from solved questions in roguelike mode", () => {
    const question = questions.find((row) => row.difficulty === 5) || questions[0];
    let state = defaultState();
    state.profile.stats.perception = 40;
    state.profile.experience = EXPERIENCE_PER_LEVEL * 20;
    const now = 123456;
    const drop = getQuestionDrop(question, state, now);

    expect(drop).toBeNull();
    const normalDrop = createDropItem(question, state.profile.stats, now, { maxItemLevel: 1 });
    expect(normalDrop.rarity).toBe("common");
    expect(Object.values(normalDrop.stats || {}).filter(Boolean)).toHaveLength(0);
    expect(normalDrop.modifiers || []).toHaveLength(0);
    expect(normalDrop.wikiStats || []).toHaveLength(0);

    state = applyScheduleResult(state, question.id, true, "draft", now);
    expect(state.profile.inventory).toHaveLength(0);
  });

  it("allows two rings plus an amulet to be equipped", () => {
    let state = defaultState();
    state.profile.inventory.push(
      { id: "ring-a", modifiers: [], name: "Bronze Ring", rarity: "common", requirements: { level: 1, stats: {} }, slot: "eyewear", stats: { intelligence: 1 } },
      { id: "ring-b", modifiers: [], name: "Iron Ring", rarity: "common", requirements: { level: 1, stats: {} }, slot: "eyewear", stats: { perception: 1 } },
      { id: "amulet-a", modifiers: [], name: "Simple Pendant", rarity: "common", requirements: { level: 1, stats: {} }, slot: "headAccessory", stats: { constitution: 1 } }
    );

    state = equipItem(state, "ring-a");
    state = equipItem(state, "ring-b");
    state = equipItem(state, "amulet-a");

    expect(new Set([state.profile.equipment.eyewear, state.profile.equipment.ringTwo])).toEqual(new Set(["ring-a", "ring-b"]));
    expect(state.profile.equipment.headAccessory).toBe("amulet-a");
    expect(getEffectiveCharacterStats(state)).toMatchObject({ constitution: 1, intelligence: 1, perception: 1 });
  });

  it("equips items into the requested compatible slot", () => {
    let state = defaultState();
    state.profile.inventory.push(
      { id: "ring-a", modifiers: [], name: "Bronze Ring", rarity: "common", requirements: { level: 1, stats: {} }, slot: "eyewear", stats: { intelligence: 1 } },
      { id: "ring-b", modifiers: [], name: "Iron Ring", rarity: "common", requirements: { level: 1, stats: {} }, slot: "eyewear", stats: { perception: 1 } },
      { id: "sword-a", modifiers: [], name: "Short Sword", rarity: "common", requirements: { level: 1, stats: {} }, slot: "mainHand", stats: { strength: 1 } }
    );

    state = equipItemToSlot(state, "ring-a", "ringTwo");
    expect(state.profile.equipment.ringTwo).toBe("ring-a");
    expect(state.profile.equipment.eyewear).toBeNull();

    state = equipItemToSlot(state, "ring-b", "eyewear");
    expect(state.profile.equipment.eyewear).toBe("ring-b");
    expect(state.profile.equipment.ringTwo).toBe("ring-a");
    expect(equipItemToSlot(state, "sword-a", "ringTwo")).toBe(state);
  });

  it("bulk sells unequipped inventory items for gold", () => {
    let state = defaultState();
    const keptItem: InventoryItem = { id: "kept-sword", modifiers: [], name: "Kept Sword", rarity: "common", requirements: { level: 1, stats: {} }, slot: "mainHand", stats: { strength: 1 } };
    const soldItem: InventoryItem = { id: "sold-ring", modifiers: [{ key: "goldFindPercent", value: 8 }], name: "Sold Ring", rarity: "uncommon", requirements: { level: 1, stats: {} }, slot: "eyewear", stats: { perception: 1 } };
    const ignoredItem: InventoryItem = { id: "ignored-helm", modifiers: [], name: "Ignored Helm", rarity: "rare", requirements: { level: 1, stats: {} }, slot: "headgear", stats: { constitution: 1 } };
    state.profile.inventory.push(keptItem, soldItem, ignoredItem);
    state.profile.inventorySlots = {
      "sold-ring": { column: 1, row: 1, tab: 0 }
    };
    state = equipItem(state, keptItem.id);

    const sold = bulkSellItems(state, [keptItem.id, soldItem.id]);

    expect(sold.profile.coins).toBe(getItemSellValue(soldItem));
    expect(sold.profile.inventory.map((item) => item.id)).toEqual([keptItem.id, ignoredItem.id]);
    expect(sold.profile.equipment.mainHand).toBe(keptItem.id);
    expect(sold.profile.inventorySlots["sold-ring"]).toBeUndefined();
  });

  it("sells a single unequipped item and keeps equipped items protected", () => {
    let state = defaultState();
    const equippedItem: InventoryItem = { id: "equipped-sword", modifiers: [], name: "Equipped Sword", rarity: "common", requirements: { level: 1, stats: {} }, slot: "mainHand", stats: { strength: 1 } };
    const sellableItem: InventoryItem = { id: "sellable-ring", modifiers: [], name: "Sellable Ring", rarity: "rare", requirements: { level: 1, stats: {} }, slot: "eyewear", stats: { perception: 1 } };
    state.profile.inventory.push(equippedItem, sellableItem);
    state = equipItem(state, equippedItem.id);

    expect(sellItem(state, equippedItem.id)).toBe(state);
    const sold = sellItem(state, sellableItem.id);

    expect(sold.profile.coins).toBe(getItemSellValue(sellableItem));
    expect(sold.profile.inventory.map((item) => item.id)).toEqual([equippedItem.id]);
    expect(sold.profile.equipment.mainHand).toBe(equippedItem.id);
  });

  it("caps item modifier counts by rarity", () => {
    const question = questions.find((row) => row.difficulty === 5) || questions[0];
    const state = defaultState();
    state.profile.stats.perception = 40;
    const drops = Array.from({ length: 2000 }, (_item, index) => createDropItem(question, state.profile.stats, 456000 + index));

    expect(drops.some((item) => item.rarity === "rare" && (item.modifiers || []).length > 0)).toBe(true);
    for (const item of drops) {
      expect(getVisibleItemModCount(item)).toBeLessThanOrEqual(ITEM_VISIBLE_MOD_CAPS[item.rarity]);
    }
  });

  it("uses god mode for testing drops and failure penalties", () => {
    const question = questions[0];
    const state = defaultState();
    state.profile.godMode = true;
    state.profile.mana = 5;

    expect(getHealthLoss(state, 25)).toBe(0);
    expect(getQuestionDrop(question, state, 1)).toBeNull();

    const penalized = applyHealthPenalty(state, HEALTH_LOSS_PER_FAIL, 3);
    expect(penalized.profile.health).toBe(state.profile.health);
    expect(penalized.profile.mana).toBe(0);
  });

  it("scales item requirements and bonuses by item level", () => {
    const starterQuestion = questions[0];
    const endgameQuestion = questions[questions.length - 1];
    const stats = { strength: 1, constitution: 1, perception: 40, intelligence: 1 };
    const lowLevelLegendary = Array.from({ length: 5000 }, (_, index) => createDropItem(starterQuestion, stats, 800000 + index))
      .find((item) => item.rarity === "legendary");
    const endgameLegendary = Array.from({ length: 5000 }, (_, index) => createDropItem(endgameQuestion, stats, 900000 + index))
      .find((item) => item.rarity === "legendary");

    expect(lowLevelLegendary).toBeTruthy();
    expect(lowLevelLegendary?.requirements.level).toBeLessThan(30);
    expect(Object.values(lowLevelLegendary?.stats || {}).filter(Boolean).length).toBeLessThanOrEqual(2);
    expect(Math.max(...Object.values(lowLevelLegendary?.stats || { strength: 0 }))).toBeLessThanOrEqual(1);
    expect(lowLevelLegendary?.modifiers?.length).toBeLessThanOrEqual(2);
    expect(endgameLegendary?.requirements.level).toBe(MAX_CHARACTER_LEVEL);
    expect(endgameLegendary?.modifiers?.length).toBeLessThanOrEqual(8);
  });

  it("keeps legacy equipped item modifiers inert in roguelike mode", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.inventory.push({
      id: "modifier-sword",
      modifiers: [
        { key: "bonusXpPercent", value: 20 },
        { key: "fireResistPercent", value: 25 },
        { key: "criticalChancePercent", value: 10 },
        { key: "damageReduction", value: 2 },
        { key: "enhancedDamagePercent", value: 50 },
        { key: "goldFindPercent", value: 50 },
        { key: "lifeOnKill", value: 5 },
        { key: "lightningResistPercent", value: 90 },
        { key: "magicFindPercent", value: 50 },
        { key: "maxLife", value: 10 },
        { key: "timerDamagePercent", value: 10 }
      ],
      name: "Modifier Sword",
      rarity: "legendary",
      requirements: { level: 1, stats: {} },
      slot: "mainHand",
      stats: {}
    });
    state = equipItem(state, "modifier-sword");

    expect(getEquipmentModifierTotals(state)).toMatchObject({ bonusXpPercent: 0, goldFindPercent: 0, lifeOnKill: 0 });
    expect(getElementalResistances(state)).toMatchObject(getElementalResistances(defaultState()));
    expect(getMaxHealth(state)).toBe(MAX_HEALTH);
    expect(getMaxMana(state)).toBe(getMaxMana(defaultState()));
    expect(getHealthLoss(state)).toBe(getHealthLoss(defaultState()));
    expect(getAttackDamage(question, state)).toBe(getAttackDamage(question, defaultState()));
    expect(getCriticalChance(state)).toBe(getCriticalChance(defaultState()));
    expect(getCoinReward(question, state)).toBe(getCoinReward(question, defaultState()));
    expect(getExperienceReward(question, state)).toBe(getExperienceReward(question, defaultState()));
  });

  it("has a large Diablo-style item base name pool", () => {
    expect(ITEM_BASE_NAME_COUNT).toBeGreaterThanOrEqual(200);
  });

  it("blocks equipping items when requirements are not met", () => {
    const state = defaultState();
    const lockedItem = {
      id: "locked-helm",
      name: "Locked Helm",
      rarity: "rare" as const,
      requirements: { level: 10, stats: { strength: 20 } },
      slot: "headgear" as const,
      stats: { strength: 3 }
    };
    state.profile.inventory.push(lockedItem);

    expect(canEquipItem(state, lockedItem)).toBe(false);
    expect(equipItem(state, lockedItem.id)).toBe(state);
  });

  it("keeps legacy set bonuses inert in roguelike mode", () => {
    let state = defaultState();
    state.profile.inventory.push(
      { id: "sigon-a", name: "Sigon's Gage", rarity: "rare", requirements: { level: 1, stats: {} }, setId: "sigons-complete-steel", slot: "mainHand", stats: { strength: 1 } },
      { id: "sigon-b", name: "Sigon's Guard", rarity: "rare", requirements: { level: 1, stats: {} }, setId: "sigons-complete-steel", slot: "offHand", stats: { constitution: 1 } }
    );
    state = equipItem(state, "sigon-a");
    state = equipItem(state, "sigon-b");

    expect(getActiveSetBonuses(state)).toEqual([]);
    expect(getEffectiveCharacterStats(state).constitution).toBe(defaultState().profile.stats.constitution);
  });

  it("spends gold for hints and increases the next hint cost on that card", () => {
    let state = defaultState();
    const question = questions[0];
    state.profile.coins = 100;

    expect(HINT_COST).toBe(10);
    expect(getHintCost(state, question.id)).toBe(10);
    expect(canBuyHint(state, question.id)).toBe(true);

    state = buyHint(state, question.id);

    expect(state.profile.coins).toBe(90);
    expect(state.profile.hintsBought).toBe(1);
    expect(getCard(state, question.id).hintsBought).toBe(1);
    expect(getHintCost(state, question.id)).toBe(20);

    state = buyHint(state, question.id);

    expect(state.profile.coins).toBe(70);
    expect(state.profile.hintsBought).toBe(2);
    expect(getCard(state, question.id).hintsBought).toBe(2);
    expect(getHintCost(state, question.id)).toBe(30);
  });

  it("makes the first hint free in each room when a relic grants it", () => {
    let state = defaultState();
    const question = questions[0];
    state.profile.coins = 0;
    state.profile.relics = [testRelic("freeHintPerRoom", 1)];

    expect(getHintCost(state, question.id)).toBe(0);
    expect(canBuyHint(state, question.id)).toBe(true);

    state = buyHint(state, question.id);

    expect(state.profile.coins).toBe(0);
    expect(state.profile.hintsBought).toBe(1);
    expect(getHintCost(state, question.id)).toBe(20);
  });

  it("does not spend coins when a state is below the hint threshold", () => {
    const state = defaultState();
    state.profile.coins = HINT_COST - 1;

    expect(canBuyHint(state, questions[0].id)).toBe(false);
    expect(buyHint(state, questions[0].id)).toBe(state);
  });

  it("uses pact conditions to disable hints and run code", () => {
    const state = defaultState();
    state.profile.coins = 500;
    state.profile.spireRun.heatConditions.noHints = 1;
    state.profile.spireRun.heatConditions.noRunCode = 1;

    expect(canBuyHint(state, questions[0].id)).toBe(false);
    expect(buyHint(state, questions[0].id)).toBe(state);
    expect(markQuestionRunCode(state, questions[0].id)).toBe(state);
  });

  it("blocks the first incoming hit in a room", () => {
    let state = defaultState();
    const question = questions[0];
    state.profile.relics = [testRelic("blockFirstHit", 1)];

    state = applyHealthPenalty(state, HEALTH_LOSS_PER_FAIL, 3, question.id, "bad", 1000);

    expect(state.profile.health).toBe(MAX_HEALTH);
    expect(state.profile.mana).toBe(defaultState().profile.mana);
    expect(getCard(state, question.id)).toMatchObject({ failedSubmissions: 1, relicFirstHitBlocked: true });

    const punished = applyHealthPenalty(state, HEALTH_LOSS_PER_FAIL, 0, question.id, "bad", 2000);
    expect(punished.profile.health).toBeLessThan(state.profile.health);
  });

  it("revives once per room when incoming damage would be fatal", () => {
    let state = defaultState();
    const question = questions[0];
    state.profile.relics = [testRelic("revivePercent", 50)];
    state.profile.health = 1;

    state = applyHealthPenalty(state, MAX_HEALTH, 0, question.id, "bad", 1000);

    expect(state.profile.health).toBe(Math.round(getMaxHealth(state) * 0.5));
    expect(getCard(state, question.id).relicReviveUsed).toBe(true);

    const dead = applyHealthPenalty({ ...state, profile: { ...state.profile, health: 1 } }, MAX_HEALTH, 0, question.id, "bad", 2000);
    expect(dead.profile.health).toBe(0);
  });

  it("previews and applies relic utility damage effects consistently", () => {
    const state = defaultState();
    const question = questions[0];
    state.profile.relics = [testRelic("blockFirstHit", 1)];

    const preview = getIncomingDamageEffect(state, HEALTH_LOSS_PER_FAIL, 2, question.id);
    const applied = applyIncomingDamage(state, HEALTH_LOSS_PER_FAIL, 2, question.id);

    expect(preview).toMatchObject({ blocked: true, healthLoss: 0, manaLoss: 0 });
    expect(applied).toMatchObject({ blocked: true, healthLoss: 0, manaLoss: 0 });
    expect(applied.state.profile.health).toBe(state.profile.health);
  });

  it("adds timer grace and reveals extra question topics from relic utilities", () => {
    const state = defaultState();
    const question = questions.find((candidate) => candidate.topics.length > 2) || questions[0];
    state.profile.relics = [testRelic("timerPauseSeconds", 60), testRelic("revealTopicCount", 2)];

    expect(getModifiedQuestionTimeLimitMs(state, question)).toBe(getQuestionTimeLimitMs(question) + 60_000);
    expect(getVisibleQuestionTopics(state, question)).toEqual(question.topics.slice(0, 3));
  });

  it("computes profile and topic stats", () => {
    let state = defaultState();
    state = applyScheduleResult(state, questions[0].id, true, "", 1000);
    state = applyScheduleResult(state, questions[0].id, true, "", 2000);
    state = applyScheduleResult(state, questions[0].id, true, "", 3000);
    state = applyScheduleResult(state, questions[1].id, false, "", 4000);

    const profile = getProfileStats(state, 5000);
    expect(profile).toMatchObject({
      attempted: 2,
      solved: 1,
      mastered: 1,
      totalAttempts: 4,
      totalPasses: 3,
      accuracy: 75
    });

    const topics = getTopicStats(state);
    expect(topics.find((topic) => topic.topic === "Arrays")).toMatchObject({ mastered: 1 });
    expect(topics.find((topic) => topic.topic === "Strings")).toMatchObject({ attempted: 1, solved: 0 });
  });

  it("estimates player rating from solved question difficulty", () => {
    let state = defaultState();
    expect(getEstimatedRating(state)).toBe(1000);

    state = applyScheduleResult(state, questions[0].id, true, "", 1000);
    const firstRating = getEstimatedRating(state);
    state = applyScheduleResult(state, questions[questions.length - 1].id, true, "", 2000);

    expect(firstRating).toBeGreaterThan(1000);
    expect(getEstimatedRating(state)).toBeGreaterThan(firstRating);
  });

  it("exports difficulty labels for UI display", () => {
    expect(difficultyLabels[1]).toBe("Easy");
    expect(difficultyLabels[5]).toBe("Hard");
  });

  it("maps question difficulty to timed sessions", () => {
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 1 })).toBe(10 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 2 })).toBe(10 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 3 })).toBe(20 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 4 })).toBe(20 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 5 })).toBe(25 * 60 * 1000);
  });
});
