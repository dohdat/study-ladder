import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { applyEnemyDebuffsToMonsterAttack, applyPassedCombatResult, getCampaignMonsterMaxHealth, getMonsterBlockGain, getMonsterCurrentBlock, getMonsterCurrentHealth, getMonsterHit, getTimedMonsterAttack } from "../lib/combatCore";
import { createDropItem, ITEM_BASE_NAME_COUNT } from "../lib/itemCore";
import { MODIFIER_FORMATTERS } from "../lib/modifierFormat";
import { getEnemyDebuffStacks } from "../lib/enemyDebuffCore";
import { getPlayerDebuffStacks } from "../lib/playerDebuffCore";
import { getEstimatedRating } from "../lib/ratingCore";
import { getShopItemCost } from "../lib/shopCore";
import { WARRIOR_SKILLS, activateWarriorSkill, canUseActiveWarriorSkill, getAvailableWarriorSkillPoints, getWarriorSkillTooltipBreakdown, resetWarriorSkillPoints, spendWarriorSkillPoint } from "../lib/skillCore";
import {
  EXPERIENCE_PER_LEVEL,
  DEFAULT_ITEM_MODIFIERS,
  HEALTH_LOSS_PER_FAIL,
  HINT_COST,
  HINT_MAX_COST,
  MAX_CHARACTER_LEVEL,
  MAX_HEALTH,
  MODIFIER_KEYS,
  applyCombatStartRelics,
  applyCodingCompanyProfile,
  clearCodingCompanyProfile,
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
  getCodingFilteredQuestions,
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
  normalizeCodingCompanyProfiles,
  normalizeCodingMinRating,
  normalizeCodingTagWeights,
  normalizeCodingTags,
  normalizeStudyState,
  pickQuestion,
  purchaseMetaUpgrade,
  restartStudyRun,
  sellItem,
  setCard,
  equipItem,
  equipItemToSlot,
  unequipItem,
  spendStatPoint
} from "../lib/studyCore";
import type { InventoryItem, ItemModifierKey, Relic, SpireNodeKind, StudyState } from "../types/study";

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

function withCurrentNode(state: StudyState, kind: SpireNodeKind) {
  return {
    ...state,
    profile: {
      ...state.profile,
      spireRun: {
        ...state.profile.spireRun,
        currentNodeId: "test-node",
        nodes: [{
          column: 0,
          id: "test-node",
          kind,
          nextIds: [],
          rating: 1500,
          tierIndex: 0,
          x: 0,
          y: 0
        }]
      }
    }
  };
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

  it("makes negative defensive relic modifiers meaningful downsides", () => {
    const base = defaultState();
    const question = questions.find((row) => row.difficulty === 5) || questions[0];

    const enemyDamageBlight = defaultState();
    enemyDamageBlight.profile.relics = [testRelic("reducedEnemyDamagePercent", -20)];
    expect(getHealthLoss(enemyDamageBlight)).toBeGreaterThan(getHealthLoss(base));

    const physicalBlight = defaultState();
    physicalBlight.profile.relics = [testRelic("physicalResistPercent", -20)];
    expect(getHealthLoss(physicalBlight, HEALTH_LOSS_PER_FAIL, "physical")).toBeGreaterThan(getHealthLoss(base, HEALTH_LOSS_PER_FAIL, "physical"));

    const fireBlight = defaultState();
    fireBlight.profile.relics = [testRelic("fireResistPercent", -20)];
    expect(getHealthLoss(fireBlight, HEALTH_LOSS_PER_FAIL, "fire")).toBeGreaterThan(getHealthLoss(base, HEALTH_LOSS_PER_FAIL, "fire"));

    const avoidanceBlight = defaultState();
    avoidanceBlight.profile.relics = [testRelic("parryChancePercent", -20)];
    expect(getHealthLoss(avoidanceBlight)).toBeGreaterThan(getHealthLoss(base));

    const armorPenetrationBlight = defaultState();
    armorPenetrationBlight.profile.relics = [testRelic("armorPenetrationPercent", -80)];
    expect(getMonsterHit(armorPenetrationBlight, question, 1000, { timePressureRatio: 1 }).perHitDamage).toBeLessThan(getMonsterHit(base, question, 1000, { timePressureRatio: 1 }).perHitDamage);
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
      armorPenetrationPercent: 10,
      bonusDamageVsElitesPercent: 8,
      criticalChancePercent: 6,
      enhancedDamagePercent: 10,
      freeHintPerRoom: 1,
      increasedRareDropChancePercent: 12,
      relicRerollBonus: 1,
      revealSubmitTestCount: 2,
      shopDiscountPercent: 10
    });
  });

  it("uses mirror ranks for starter relic count", () => {
    const state = defaultState();
    state.profile.metaProgress.upgrades.starterRelics = 3;

    expect(getMetaStartingRelicCount(state)).toBe(3);
  });

  it("restarts the current run while preserving long-term progress and settings", () => {
    const state = defaultState();
    const question = questions[0];
    state.mode = "system";
    state.totalCorrect = 12;
    state.profile.activeCodingProfileId = "roblox";
    state.profile.codingProfiles = [{ id: "roblox", name: "Roblox", codingTags: ["DFS"], codingTagWeights: { DFS: 100 }, codingMinRating: 1800 }];
    state.profile.codingTags = ["DFS"];
    state.profile.codingTagWeights = { DFS: 100 };
    state.profile.codingMinRating = 1800;
    state.profile.godMode = true;
    state.profile.coins = 999;
    state.profile.health = 3;
    state.profile.relics = [testRelic("blockFirstHit", 1)];
    state.profile.skillRanks = { bash: 3 };
    state.profile.metaProgress.currency = 40;
    state.profile.metaProgress.upgrades.coinPurse = 2;
    state.profile.trackedAchievementIds = ["first-blood"];
    state.profile.unlockedAchievementIds = ["first-blood"];
    state.profile.spireMinRating = 1900;
    state.profile.spireRun.completedNodeIds = ["old-node"];
    state.profile.spireRun.heatConditions.hardLabor = 2;
    state.profile.spireRun.heatConditions.noHints = 1;
    setCard(state, question.id, { ...defaultCard(), correct: 1, attempts: 2 });

    const restarted = restartStudyRun(state, 12345);

    expect(restarted.mode).toBe("system");
    expect(restarted.totalCorrect).toBe(12);
    expect(restarted.profile.godMode).toBe(true);
    expect(restarted.profile.relics).toEqual([]);
    expect(restarted.profile.skillRanks).toEqual({});
    expect(restarted.profile.metaProgress).toEqual(state.profile.metaProgress);
    expect(restarted.profile.codingProfiles).toEqual(state.profile.codingProfiles);
    expect(restarted.profile.spireMinRating).toBe(1900);
    expect(restarted.profile.spireRun.mapSeed).toBe(12345);
    expect(restarted.profile.spireRun.completedNodeIds).toEqual([]);
    expect(restarted.profile.spireRun.heatConditions.hardLabor).toBe(2);
    expect(restarted.profile.spireRun.heatConditions.noHints).toBe(1);
    expect(restarted.profile.spireRun.heatSetupOpen).toBe(true);
    expect(restarted.profile.coins).toBe(getMetaStartingGoldBonus(restarted));
    expect(restarted.profile.health).toBe(getMaxHealth(restarted));
    expect(getCard(restarted, question.id).correct).toBe(1);
    expect(restarted.profile.trackedAchievementIds).toEqual(["first-blood"]);
    expect(restarted.profile.unlockedAchievementIds).toEqual(["first-blood"]);
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

  it("applies pact condition ranks to live combat and shop math", () => {
    const question = { ...questions.find((row) => row.difficulty === 5)!, id: "pact-runtime-check", rating: 2600 };
    const normal = withCurrentNode(defaultState(), "enemy");
    const boss = withCurrentNode(defaultState(), "boss");
    const elite = withCurrentNode(defaultState(), "elite");

    const hardLabor = withCurrentNode(defaultState(), "enemy");
    hardLabor.profile.spireRun.heatConditions.hardLabor = 1;
    const heightenedSecurity = withCurrentNode(defaultState(), "enemy");
    heightenedSecurity.profile.spireRun.heatConditions.heightenedSecurity = 1;
    const forcedOvertime = withCurrentNode(defaultState(), "enemy");
    forcedOvertime.profile.spireRun.heatConditions.forcedOvertime = 1;
    expect(getHealthLoss(hardLabor, 10, "physical")).toBeGreaterThan(getHealthLoss(normal, 10, "physical"));
    expect(getHealthLoss(heightenedSecurity, 10, "physical")).toBeGreaterThan(getHealthLoss(normal, 10, "physical"));
    expect(getHealthLoss(forcedOvertime, 10, "physical")).toBeGreaterThan(getHealthLoss(normal, 10, "physical"));
    expect(getModifiedQuestionTimeLimitMs(forcedOvertime, question)).toBeLessThan(getModifiedQuestionTimeLimitMs(normal, question));

    const lastingConsequences = defaultState();
    lastingConsequences.profile.spireRun.heatConditions.lastingConsequences = 1;
    expect(applyHealingReceived(lastingConsequences, 20)).toBeLessThan(applyHealingReceived(normal, 20));

    const convenienceFee = defaultState();
    convenienceFee.profile.spireRun.heatConditions.convenienceFee = 1;
    const listing = { amount: 1, cost: 50, id: "test-potion", kind: "consumable" as const, name: "Test Potion", type: "health" as const };
    expect(getShopItemCost(convenienceFee, listing)).toBeGreaterThan(getShopItemCost(normal, listing));

    const calisthenics = withCurrentNode(defaultState(), "enemy");
    calisthenics.profile.spireRun.heatConditions.calisthenicsProgram = 1;
    const damageControl = withCurrentNode(defaultState(), "enemy");
    damageControl.profile.spireRun.heatConditions.damageControl = 1;
    expect(getCampaignMonsterMaxHealth(calisthenics, question)).toBeGreaterThan(getCampaignMonsterMaxHealth(normal, question));
    expect(getCampaignMonsterMaxHealth(damageControl, question)).toBeGreaterThan(getCampaignMonsterMaxHealth(normal, question));

    const extremeMeasures = withCurrentNode(defaultState(), "boss");
    extremeMeasures.profile.spireRun.heatConditions.extremeMeasures = 1;
    expect(getCampaignMonsterMaxHealth(extremeMeasures, question)).toBeGreaterThan(getCampaignMonsterMaxHealth(boss, question));
    expect(getHealthLoss(extremeMeasures, 10, "physical")).toBeGreaterThan(getHealthLoss(boss, 10, "physical"));

    const middleManagement = withCurrentNode(defaultState(), "elite");
    middleManagement.profile.spireRun.heatConditions.middleManagement = 1;
    expect(getCampaignMonsterMaxHealth(middleManagement, question)).toBeGreaterThan(getCampaignMonsterMaxHealth(elite, question));
    expect(getHealthLoss(middleManagement, 10, "physical")).toBeGreaterThan(getHealthLoss(elite, 10, "physical"));
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

  it("filters coding picks by selected tags", () => {
    const state = defaultState();
    state.profile.codingTags = normalizeCodingTags(["Hash Map"]);
    const filtered = getCodingFilteredQuestions(state);

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((question) => question.topics.includes("Hash Map"))).toBe(true);
    expect(pickQuestion(state, null, false, 1000).topics).toContain("Hash Map");
    expect(isQuestionInRecommendedRange(state, questions.find((question) => !question.topics.includes("Hash Map")) || questions[0], true)).toBe(false);
  });

  it("filters coding picks by company profile minimum rating", () => {
    const state = defaultState();
    state.profile.codingTags = normalizeCodingTags(["Hash Map"]);
    state.profile.codingMinRating = normalizeCodingMinRating(1500);
    const filtered = getCodingFilteredQuestions(state);

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((question) => question.topics.includes("Hash Map") && question.rating >= 1500)).toBe(true);
    expect(pickQuestion(state, null, false, 1000).rating).toBeGreaterThanOrEqual(1500);
    expect(isQuestionInRecommendedRange(state, questions.find((question) => question.topics.includes("Hash Map") && question.rating < 1500) || questions[0], true)).toBe(false);
  });

  it("applies saved company profiles to coding filters", () => {
    const state = defaultState();
    state.profile.codingProfiles = [{
      id: "roblox",
      name: "Roblox",
      codingTags: normalizeCodingTags(["DFS", "BFS"]),
      codingMinRating: 2000
    }];

    const applied = applyCodingCompanyProfile(state, "roblox");

    expect(applied.profile.activeCodingProfileId).toBe("roblox");
    expect(applied.profile.codingTags).toEqual(["DFS", "BFS"]);
    expect(applied.profile.codingTagWeights).toEqual({ BFS: 50, DFS: 50 });
    expect(applied.profile.codingMinRating).toBe(2000);
    expect(getCodingFilteredQuestions(applied).every((question) => question.rating >= 2000 && question.topics.some((topic) => ["DFS", "BFS"].includes(topic)))).toBe(true);
  });

  it("normalizes company profile topic percentages", () => {
    expect(normalizeCodingTagWeights(["DFS", "BFS", "Arrays"], { Arrays: 20, BFS: 30, DFS: 50 })).toEqual({ Arrays: 20, BFS: 30, DFS: 50 });
    expect(normalizeCodingTagWeights(["DFS", "BFS"], {})).toEqual({ BFS: 50, DFS: 50 });
    expect(normalizeCodingTagWeights(["DFS", "BFS"], { BFS: 30, DFS: 90 })).toEqual({ BFS: 25, DFS: 75 });
  });

  it("clears saved company profile filters when no profile is selected", () => {
    const state = defaultState();
    state.profile.activeCodingProfileId = "roblox";
    state.profile.codingProfiles = [{
      id: "roblox",
      name: "Roblox",
      codingTags: normalizeCodingTags(["DFS", "BFS"]),
      codingMinRating: 2000
    }];
    state.profile.codingTags = normalizeCodingTags(["DFS", "BFS"]);
    state.profile.codingMinRating = 2000;

    const cleared = clearCodingCompanyProfile(state);

    expect(cleared.profile.activeCodingProfileId).toBeNull();
    expect(cleared.profile.codingTags).toEqual([]);
    expect(cleared.profile.codingTagWeights).toEqual({});
    expect(cleared.profile.codingMinRating).toBe(0);
    expect(cleared.profile.codingProfiles).toEqual(normalizeCodingCompanyProfiles(state.profile.codingProfiles));
  });

  it("drops stale profile filters while normalizing no-profile states", () => {
    const state = defaultState();
    state.profile.activeCodingProfileId = null;
    state.profile.codingProfiles = [{
      id: "roblox",
      name: "Roblox",
      codingTags: normalizeCodingTags(["DFS", "BFS"]),
      codingMinRating: 2000
    }];
    state.profile.codingTags = normalizeCodingTags(["DFS", "BFS"]);
    state.profile.codingMinRating = 2000;

    const normalized = normalizeStudyState(state);

    expect(normalized.profile.activeCodingProfileId).toBeNull();
    expect(normalized.profile.codingTags).toEqual([]);
    expect(normalized.profile.codingTagWeights).toEqual({});
    expect(normalized.profile.codingMinRating).toBe(0);
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

  it("heals when gold is gained for Bloody Idol-style relics", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.health = 30;
    state.profile.relics = [testRelic("goldGainHeal", 4)];

    state = applyScheduleResult(state, question.id, true, "draft", 1000);

    expect(state.profile.coins).toBe(getCoinReward(question, state));
    expect(state.profile.health).toBe(34);
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

  it("applies popular-tag relic damage only to matching question tags", () => {
    const tagRelics: Array<{ key: ItemModifierKey; tag: string; value: number }> = [
      { key: "damageVsArraysPercent", tag: "Arrays", value: 30 },
      { key: "damageVsStringsPercent", tag: "Strings", value: 30 },
      { key: "damageVsHashMapPercent", tag: "Hash Map", value: 30 },
      { key: "damageVsDfsPercent", tag: "DFS", value: 35 },
      { key: "damageVsBfsPercent", tag: "BFS", value: 35 },
      { key: "damageVsTreesPercent", tag: "Trees", value: 35 },
      { key: "damageVsGraphsPercent", tag: "Graphs", value: 35 },
      { key: "damageVsDynamicProgrammingPercent", tag: "Dynamic Programming", value: 40 }
    ];

    for (const relic of tagRelics) {
      const matching = questions.find((question) => question.topics.includes(relic.tag));
      const nonMatching = questions.find((question) => !question.topics.includes(relic.tag));
      const state = defaultState();
      state.profile.relics = [testRelic(relic.key, relic.value)];

      expect(matching).toBeTruthy();
      expect(nonMatching).toBeTruthy();
      expect(getAttackDamage(matching!, state)).toBeGreaterThan(getAttackDamage(matching!, defaultState()));
      expect(getAttackDamage(nonMatching!, state)).toBe(getAttackDamage(nonMatching!, defaultState()));
    }
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

  it("applies no-hint relic damage only before a hint is used on the question", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.coins = 100;
    state.profile.relics = [{
      description: "Rewards unaided solves.",
      id: "unaided-thesis-test",
      modifiers: [{ key: "noHintDamagePercent", value: 50 }],
      name: "Unaided Thesis Test",
      rarity: "unique",
      source: "any"
    }];

    const boosted = getMonsterHit(state, question, 1000);
    state = buyHint(state, question.id);
    const hinted = getMonsterHit(state, question, 1000);

    expect(boosted.damage).toBeGreaterThan(hinted.damage);
    expect(boosted.effects).toContain("No-hint bonus");
    expect(hinted.effects).not.toContain("No-hint bonus");
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

  it("applies wrong-submit debuffs after the current hit resolves", () => {
    const question = questions[0];
    let state = defaultState();

    state = applyHealthPenalty(state, 10, 0, question.id, "bad", 1000, "physical", [{ id: "vulnerable", remainingSubmits: 2, stacks: 2 }]);

    expect(getPlayerDebuffStacks(state.profile.playerDebuffs, "vulnerable")).toBe(2);
    expect(getHealthLoss(state, 10, "physical")).toBeGreaterThan(getHealthLoss(defaultState(), 10, "physical"));
  });

  it("lets weak reduce submit damage and tick down on a correct submit", () => {
    const question = questions[0];
    let state = defaultState();
    const normalDamage = getAttackDamage(question, state);
    state.profile.playerDebuffs = [{ id: "weak", remainingSubmits: 1, stacks: 2 }];

    const weakDamage = getAttackDamage(question, state);
    const result = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(weakDamage).toBeLessThan(normalDamage);
    expect(getPlayerDebuffStacks(result.state.profile.playerDebuffs, "weak")).toBe(0);
  });

  it("uses hex to make support actions more costly", () => {
    const question = questions[0];
    const state = defaultState();
    state.profile.playerDebuffs = [{ id: "hex", remainingSubmits: 2, stacks: 1 }];
    state.profile.coins = 100;

    const runMarked = markQuestionRunCode(state, question.id);

    expect(getHintCost(state, question.id)).toBe(HINT_COST + 10);
    expect(getPlayerDebuffStacks(runMarked.profile.playerDebuffs, "slimed")).toBe(1);
  });

  it("uses confused to make hint costs less predictable", () => {
    const question = questions[0];
    const state = defaultState();
    state.profile.playerDebuffs = [{ id: "confused", remainingSubmits: 2, stacks: 1 }];

    const rolledCosts = Array.from({ length: 8 }, (_unused, attempts) => {
      setCard(state, question.id, { ...defaultCard(), attempts });
      return getHintCost(state, question.id);
    });

    expect(new Set(rolledCosts).size).toBeGreaterThan(1);
    expect(rolledCosts.every((cost) => cost >= HINT_COST && cost <= HINT_MAX_COST)).toBe(true);
  });

  it("lets Ginger and Turnip-style relics block their matching enemy debuffs", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.relics = [testRelic("hexConfusedImmune", 1), testRelic("vulnerableConstrictedImmune", 1)];

    state = applyHealthPenalty(state, 10, 0, question.id, "bad", 1000, "physical", [
      { id: "hex", remainingSubmits: 2, stacks: 1 },
      { id: "confused", remainingSubmits: 2, stacks: 1 },
      { id: "vulnerable", remainingSubmits: 2, stacks: 2 },
      { id: "constricted", remainingSubmits: 2, stacks: 4 },
      { id: "frail", remainingSubmits: 2, stacks: 2 }
    ]);

    expect(getPlayerDebuffStacks(state.profile.playerDebuffs, "hex")).toBe(0);
    expect(getPlayerDebuffStacks(state.profile.playerDebuffs, "confused")).toBe(0);
    expect(getPlayerDebuffStacks(state.profile.playerDebuffs, "vulnerable")).toBe(0);
    expect(getPlayerDebuffStacks(state.profile.playerDebuffs, "constricted")).toBe(0);
    expect(getPlayerDebuffStacks(state.profile.playerDebuffs, "frail")).toBe(2);
  });

  it("lets monster block absorb correct-submit damage before health", () => {
    const question = questions[0];
    const state = defaultState();
    const maxHealth = getCampaignMonsterMaxHealth(state, question);
    setCard(state, question.id, { ...defaultCard(), monsterBlock: 999, monsterHealth: maxHealth });

    const result = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(result.hit?.blockedDamage).toBeGreaterThan(0);
    expect(getMonsterCurrentHealth(result.state, question)).toBe(maxHealth);
    expect(getMonsterCurrentBlock(result.state, question)).toBeLessThan(999);
  });

  it("lets The Boot-style relics force a minimum health hit after block", () => {
    const question = questions[0];
    const state = defaultState();
    const maxHealth = getCampaignMonsterMaxHealth(state, question);
    state.profile.relics = [testRelic("minimumSubmitDamage", 12)];
    setCard(state, question.id, { ...defaultCard(), monsterBlock: 999, monsterHealth: maxHealth });

    const result = applyPassedCombatResult(state, question.id, "draft", 1000);

    expect(result.hit?.effects).toContain("Minimum hit 12");
    expect(getMonsterCurrentHealth(result.state, question)).toBe(maxHealth - 12);
  });

  it("lets Fossilized Helix-style relics prevent the first HP loss each combat", () => {
    const question = questions[0];
    const state = defaultState();
    state.profile.relics = [testRelic("preventFirstHpLoss", 1)];

    const first = applyIncomingDamage(state, 20, 0, question.id, "physical");
    const second = applyIncomingDamage(first.state, 20, 0, question.id, "physical");

    expect(first.healthLoss).toBe(0);
    expect(first.state.profile.health).toBe(state.profile.health);
    expect(second.healthLoss).toBeGreaterThan(0);
  });

  it("lets Torii-style relics reduce small HP losses to 1", () => {
    const question = questions[0];
    const state = defaultState();
    state.profile.relics = [testRelic("smallHitToOneThreshold", 5)];

    const effect = getIncomingDamageEffect(state, 5, 0, question.id, "physical");

    expect(effect.healthLoss).toBe(1);
  });

  it("heals once at combat start for Blood Vial-style relics", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.health = 30;
    state.profile.relics = [testRelic("combatStartHeal", 6)];

    state = applyCombatStartRelics(state, question.id);
    const afterFirstStart = state.profile.health;
    state = applyCombatStartRelics(state, question.id);

    expect(afterFirstStart).toBe(36);
    expect(state.profile.health).toBe(afterFirstStart);
  });

  it("grants room-start Block and spends it before HP is lost", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.relics = [testRelic("combatStartBlock", 10)];

    state = applyCombatStartRelics(state, question.id);
    state = applyCombatStartRelics(state, question.id);
    const expectedHealthLoss = getHealthLoss(state, 13, "physical");
    const expectedBlockLoss = Math.min(10, expectedHealthLoss);
    const preview = getIncomingDamageEffect(state, 13, 0, question.id, "physical");
    const applied = applyIncomingDamage(state, 13, 0, question.id, "physical");

    expect(getCard(state, question.id).playerBlock).toBe(10);
    expect(preview.playerBlockLoss).toBe(expectedBlockLoss);
    expect(preview.healthLoss).toBe(Math.max(0, expectedHealthLoss - expectedBlockLoss));
    expect(applied.state.profile.health).toBe(state.profile.health - preview.healthLoss);
    expect(getCard(applied.state, question.id).playerBlock).toBe(10 - expectedBlockLoss);
  });

  it("applies enemy Vulnerable and Weak from combat-start relics", () => {
    const question = questions[0];
    let state = defaultState();
    state.profile.relics = [testRelic("enemyVulnerableSubmits", 2), testRelic("enemyWeakSubmits", 2)];

    state = applyCombatStartRelics(state, question.id);

    expect(getEnemyDebuffStacks(getCard(state, question.id).enemyDebuffs, "vulnerable")).toBe(1);
    expect(getEnemyDebuffStacks(getCard(state, question.id).enemyDebuffs, "weak")).toBe(1);

    const normalHit = getMonsterHit(defaultState(), question, 1000);
    const vulnerableHit = getMonsterHit(state, question, 1000);
    const normalAttack = getTimedMonsterAttack(question, 0, 1000, "retaliation");
    const weakAttack = applyEnemyDebuffsToMonsterAttack(state, question, normalAttack);

    expect(vulnerableHit.damage).toBeGreaterThan(normalHit.damage);
    expect(weakAttack.damage).toBeLessThan(normalAttack.damage);
    expect(vulnerableHit.effects).toContain("Vulnerable");
    expect(weakAttack.effects).toContain("Weak");
  });

  it("ticks enemy Vulnerable after player hits and enemy Weak after enemy attacks", () => {
    const question = questions.find((candidate) => candidate.difficulty === 5) || questions[0];
    let state = defaultState();
    state.profile.relics = [testRelic("enemyVulnerableSubmits", 2), testRelic("enemyWeakSubmits", 2)];
    state = applyCombatStartRelics(state, question.id);

    const afterHit = applyPassedCombatResult(state, question.id, "draft", 1000).state;
    const afterEnemyAttack = applyIncomingDamage(afterHit, 10, 0, question.id, "physical").state;

    expect(getCard(afterHit, question.id).enemyDebuffs?.find((debuff) => debuff.id === "vulnerable")?.remainingSubmits).toBe(1);
    expect(getCard(afterHit, question.id).enemyDebuffs?.find((debuff) => debuff.id === "weak")?.remainingSubmits).toBe(2);
    expect(getCard(afterEnemyAttack, question.id).enemyDebuffs?.find((debuff) => debuff.id === "weak")?.remainingSubmits).toBe(1);
  });

  it("heals after clearing while wounded for Meat on the Bone-style relics", () => {
    const question = questions[0];
    const state = defaultState();
    state.profile.health = Math.max(1, Math.floor(getMaxHealth(state) / 2) - 5);
    const startingHealth = state.profile.health;
    state.profile.relics = [testRelic("lowHealthClearHeal", 14)];

    const result = applyScheduleResult(state, question.id, true, "draft", 1000);

    expect(result.profile.health).toBe(Math.min(getMaxHealth(result), startingHealth + 14));
  });

  it("rolls monster block more often for bosses than normal fights", () => {
    const question = questions[0];
    const normal = defaultState();
    const boss = defaultState();
    boss.profile.spireRun.currentNodeId = "boss-node";
    boss.profile.spireRun.nodes = [{
      column: 0,
      id: "boss-node",
      kind: "boss",
      nextIds: [],
      rating: question.rating,
      tierIndex: 0,
      x: 0,
      y: 0
    }];

    const normalBlocks = Array.from({ length: 80 }, (_, index) => getMonsterBlockGain(normal, question, 1000 + index)).filter(Boolean).length;
    const bossBlocks = Array.from({ length: 80 }, (_, index) => getMonsterBlockGain(boss, question, 1000 + index)).filter(Boolean).length;

    expect(bossBlocks).toBeGreaterThan(normalBlocks);
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
