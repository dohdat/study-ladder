import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { applyPassedCombatResult, getMonsterCurrentHealth } from "../lib/combatCore";
import { createDropItem, ITEM_BASE_NAME_COUNT } from "../lib/itemCore";
import { getEstimatedRating } from "../lib/ratingCore";
import { WARRIOR_SKILLS, activateWarriorSkill, canUseActiveWarriorSkill, getAvailableWarriorSkillPoints, spendWarriorSkillPoint } from "../lib/skillCore";
import {
  EXPERIENCE_PER_LEVEL,
  HEALTH_LOSS_PER_FAIL,
  HINT_COST,
  MAX_CHARACTER_LEVEL,
  MAX_HEALTH,
  applyScheduleResult,
  applyHealthPenalty,
  buyHint,
  canBuyHint,
  canEquipItem,
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
  getLevelProgress,
  getManaReward,
  getMaxHealth,
  getMaxMana,
  getMonsterDamageRoll,
  getMonsterLevel,
  getProfileStats,
  getQuestionTimeLimitMs,
  getQuestionDrop,
  getRecommendedDifficulty,
  getTopicStats,
  getWarriorSkillBonusTotals,
  isQuestionInRecommendedRange,
  isMasteredCard,
  normalizeStudyState,
  pickQuestion,
  setCard,
  equipItem,
  unequipItem,
  spendStatPoint
} from "../lib/studyCore";

describe("studyCore", () => {
  it("keeps every question identity and prompt unique", () => {
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.title)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.functionName)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(questions.length);
  });

  it("keeps each warrior skill tab filled out", () => {
    const counts = WARRIOR_SKILLS.reduce<Record<string, number>>((total, skill) => ({ ...total, [skill.branch]: (total[skill.branch] || 0) + 1 }), {});

    expect(counts["Combat Skills"]).toBeGreaterThanOrEqual(8);
    expect(counts["Combat Masteries"]).toBeGreaterThanOrEqual(8);
    expect(counts.Warcries).toBeGreaterThanOrEqual(8);
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
    expect(partial.profile.mana).toBe(getMaxMana(partial));
    expect(partial.profile.statPoints).toBe(0);
    expect(partial.profile.statPointsAwardedLevel).toBe(1);
    expect(partial.profile.skillRanks).toMatchObject({});
    expect(partial.profile.stats).toMatchObject({ strength: 1, constitution: 1, perception: 1, intelligence: 1 });
    expect(partial.profile.shopStock.length).toBeGreaterThan(0);
    expect(getCard(partial, questions[0].id).attempts).toBe(1);
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
    expect(state.profile.experience).toBe(getExperienceReward(question));
    expect(state.profile.mana).toBe(getMaxMana(state));
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
    expect(penalized.profile.mana).toBe(getMaxMana(state) - 3);
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
    const firstHit = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(firstHit.hit?.defeated).toBe(false);
    expect(firstHit.state.profile.coins).toBeGreaterThan(0);
    expect(firstHit.state.profile.experience).toBeGreaterThan(0);
    expect(getMonsterCurrentHealth(firstHit.state, question)).toBeLessThan(getMonsterCurrentHealth(state, question));
    expect(getCard(firstHit.state, question.id).correct).toBe(0);

    state = firstHit.state;
    for (let index = 0; index < 10 && getCard(state, question.id).correct === 0; index += 1) {
      state = applyPassedCombatResult(state, question.id, "draft", 2000 + index).state;
    }

    expect(getCard(state, question.id).correct).toBe(1);
    expect(state.profile.coins).toBeGreaterThan(firstHit.state.profile.coins);
    expect(getMonsterCurrentHealth(state, question)).toBeGreaterThan(0);
  });

  it("computes level progress from total experience", () => {
    const state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL + 12;

    expect(getLevelProgress(state)).toEqual({
      level: 2,
      currentExperience: 12,
      nextLevelExperience: EXPERIENCE_PER_LEVEL
    });
  });

  it("caps character level at one hundred", () => {
    const state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL * (MAX_CHARACTER_LEVEL + 20);

    expect(getLevelProgress(state)).toEqual({
      level: MAX_CHARACTER_LEVEL,
      currentExperience: EXPERIENCE_PER_LEVEL,
      nextLevelExperience: EXPERIENCE_PER_LEVEL
    });
  });

  it("applies character stats to health, mana, rewards, and damage reduction", () => {
    const state = defaultState();
    state.profile.stats = { strength: 4, constitution: 4, perception: 4, intelligence: 4 };

    expect(getEffectiveCharacterStats(state)).toMatchObject({ strength: 4, constitution: 4, perception: 4, intelligence: 4 });
    expect(getMaxHealth(state)).toBe(65);
    expect(getMaxMana(state)).toBe(35);
    expect(getHealthLoss(state)).toBe(4);
    expect(getCoinReward(questions[0], state)).toBe(11);
    expect(getExperienceReward(questions[0], state)).toBe(17);
  });

  it("grants and spends four stat points on level up", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL - getExperienceReward(question, state);

    state = applyScheduleResult(state, question.id, true, "draft", 1000);

    expect(getLevelProgress(state).level).toBe(2);
    expect(state.profile.statPoints).toBe(4);
    expect(state.profile.statPointsAwardedLevel).toBe(2);

    const upgraded = spendStatPoint(state, "strength");
    expect(upgraded.profile.statPoints).toBe(3);
    expect(upgraded.profile.stats.strength).toBe(2);
  });

  it("spends Barbarian-style skill points with prerequisites and synergies", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL * 30;

    expect(getAvailableWarriorSkillPoints(state, getLevelProgress(state).level)).toBe(30);
    state = spendWarriorSkillPoint(state, "swordMastery", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "swordMastery", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "bash", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "bash", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "concentrate", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "ironSkin", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "naturalResistance", getLevelProgress(state).level);

    expect(getAvailableWarriorSkillPoints(state, getLevelProgress(state).level)).toBe(23);
    expect(getWarriorSkillBonusTotals(state)).toMatchObject({ coldResistPercent: 3, criticalChancePercent: 2, damageReduction: 1 });
    expect(getAttackDamage(question, state)).toBeGreaterThan(getAttackDamage(question, defaultState()));
    expect(getCriticalChance(state)).toBeGreaterThan(getCriticalChance(defaultState()));
    expect(getHealthLoss(state)).toBeLessThan(getHealthLoss(defaultState()));
    expect(getElementalResistances(state).fire).toBe(3);
  });

  it("queues active warrior skills and consumes them on the next monster hit", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL * 20;
    state.profile.mana = getMaxMana(state);
    state = spendWarriorSkillPoint(state, "bash", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "powerStrike", getLevelProgress(state).level);
    const manaBeforeSkill = state.profile.mana;

    expect(canUseActiveWarriorSkill(state, "powerStrike")).toBe(true);
    state = activateWarriorSkill(state, "powerStrike");
    expect(state.profile.activeSkill).toBe("powerStrike");
    expect(state.profile.mana).toBe(manaBeforeSkill - 5);

    const normal = applyPassedCombatResult(defaultState(), question.id, "draft", 1000);
    const powered = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(powered.hit?.activeSkillName).toBe("Power Strike");
    expect(powered.hit?.damage).toBeGreaterThan(normal.hit?.damage || 0);
    expect(powered.state.profile.activeSkill).toBeNull();
  });

  it("applies multi-hit active warrior skills", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL * 20;
    state.profile.mana = getMaxMana(state);
    state = spendWarriorSkillPoint(state, "bash", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "doubleSwing", getLevelProgress(state).level);
    state = spendWarriorSkillPoint(state, "tripleStrike", getLevelProgress(state).level);
    state = activateWarriorSkill(state, "tripleStrike");

    const result = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(result.hit?.activeSkillName).toBe("Triple Strike");
    expect(result.hit?.hitCount).toBe(3);
    expect(result.hit?.damage).toBe((result.hit?.perHitDamage || 0) * 3);
  });

  it("drops and equips stat bonus items from solved questions", () => {
    const question = questions.find((row) => row.difficulty === 5) || questions[0];
    let state = defaultState();
    state.profile.stats.perception = 40;
    const now = 123456;
    const drop = getQuestionDrop(question, state, now);

    expect(drop).toBeTruthy();
    const multiStatDrop = Array.from({ length: 1000 }, (_, index) => getQuestionDrop(question, state, now + index))
      .find((item) => item && item.rarity !== "common");
    expect(Object.values(multiStatDrop?.stats || {}).filter(Boolean).length).toBeGreaterThan(1);

    state = applyScheduleResult(state, question.id, true, "draft", now);
    expect(state.profile.inventory).toHaveLength(1);
    state.profile.experience = EXPERIENCE_PER_LEVEL * state.profile.inventory[0].requirements.level;

    const beforeStats = getEffectiveCharacterStats(state);
    const item = state.profile.inventory[0];
    const stat = Object.keys(item.stats)[0] as keyof typeof item.stats;
    const equipped = equipItem(state, state.profile.inventory[0].id);
    expect(equipped.profile.equipment[state.profile.inventory[0].slot]).toBe(state.profile.inventory[0].id);
    expect(getEffectiveCharacterStats(equipped)[stat]).toBe(beforeStats[stat] + (item.stats[stat] || 0));

    const unequipped = unequipItem(equipped, state.profile.inventory[0].slot);
    expect(unequipped.profile.equipment[state.profile.inventory[0].slot]).toBeNull();
  });

  it("adds special modifiers to rarer item drops", () => {
    const question = questions.find((row) => row.difficulty === 5) || questions[0];
    const state = defaultState();
    state.profile.stats.perception = 40;
    const specialDrop = Array.from({ length: 2000 }, (_, index) => getQuestionDrop(question, state, 456000 + index))
      .find((item) => item && item.rarity !== "common" && item.rarity !== "uncommon" && item.modifiers?.length);

    expect(specialDrop?.modifiers?.length).toBeGreaterThan(0);
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
    expect(lowLevelLegendary?.modifiers?.length).toBeLessThanOrEqual(1);
    expect(endgameLegendary?.requirements.level).toBe(MAX_CHARACTER_LEVEL);
    expect(endgameLegendary?.modifiers?.length).toBeLessThanOrEqual(3);
  });

  it("applies equipped special modifiers to rewards and combat math", () => {
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
        { key: "manaOnKill", value: 3 },
        { key: "maxLife", value: 10 },
        { key: "maxMana", value: 10 }
      ],
      name: "Modifier Sword",
      rarity: "legendary",
      requirements: { level: 1, stats: {} },
      slot: "mainHand",
      stats: {}
    });
    state = equipItem(state, "modifier-sword");

    expect(getEquipmentModifierTotals(state)).toMatchObject({ bonusXpPercent: 20, goldFindPercent: 50, lifeOnKill: 5 });
    expect(getElementalResistances(state)).toMatchObject({ fire: 25, lightning: 75 });
    expect(getMaxHealth(state)).toBe(MAX_HEALTH + 10);
    expect(getMaxMana(state)).toBe(30);
    expect(getHealthLoss(state)).toBe(HEALTH_LOSS_PER_FAIL - 2);
    expect(getHealthLoss(state, 20, "fire")).toBeLessThan(getHealthLoss(state, 20));
    expect(getAttackDamage(question, state)).toBeGreaterThan(getAttackDamage(question, defaultState()));
    expect(getCriticalChance(state)).toBeGreaterThan(getCriticalChance(defaultState()));
    expect(getCoinReward(question, state)).toBeGreaterThan(getCoinReward(question, defaultState()));
    expect(getExperienceReward(question, state)).toBeGreaterThan(getExperienceReward(question, defaultState()));
    expect(getManaReward(question, state)).toBeGreaterThan(getManaReward(question, defaultState()));
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

  it("applies active set bonuses from equipped set pieces", () => {
    let state = defaultState();
    state.profile.inventory.push(
      { id: "sigon-a", name: "Sigon's Gage", rarity: "rare", requirements: { level: 1, stats: {} }, setId: "sigons-complete-steel", slot: "mainHand", stats: { strength: 1 } },
      { id: "sigon-b", name: "Sigon's Guard", rarity: "rare", requirements: { level: 1, stats: {} }, setId: "sigons-complete-steel", slot: "offHand", stats: { constitution: 1 } }
    );
    state = equipItem(state, "sigon-a");
    state = equipItem(state, "sigon-b");

    expect(getActiveSetBonuses(state)[0]).toMatchObject({ count: 2, id: "sigons-complete-steel" });
    expect(getEffectiveCharacterStats(state).constitution).toBeGreaterThan(defaultState().profile.stats.constitution + 1);
  });

  it("allows free hints for local hint testing", () => {
    let state = defaultState();

    expect(canBuyHint(state)).toBe(true);
    state = buyHint(state);

    expect(HINT_COST).toBe(0);
    expect(state.profile.coins).toBe(0);
    expect(state.profile.hintsBought).toBe(1);
    expect(canBuyHint(state)).toBe(true);
  });

  it("does not spend coins when a state is below the hint threshold", () => {
    const state = defaultState();
    state.profile.coins = -1;

    expect(canBuyHint(state)).toBe(false);
    expect(buyHint(state)).toBe(state);
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
