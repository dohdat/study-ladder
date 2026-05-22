import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_GAMERSCORE_TOTAL, ACHIEVEMENT_TOTAL, getAchievementTrackerSummary, getTrackedAchievements, getAchievements, syncUnlockedAchievements, toggleTrackedAchievement } from "../lib/achievementCore";
import { getAchievementPixelArt } from "../lib/achievementPixelArt";
import { applyScheduleResult, defaultState } from "../lib/studyCore";

describe("achievementCore", () => {
  it("defines forty-three achievements with unique badge codes", () => {
    const badges = new Set(ACHIEVEMENT_DEFINITIONS.map((achievement) => achievement.badge));
    const ids = new Set(ACHIEVEMENT_DEFINITIONS.map((achievement) => achievement.id));

    expect(ACHIEVEMENT_DEFINITIONS).toHaveLength(ACHIEVEMENT_TOTAL);
    expect(ACHIEVEMENT_TOTAL).toBe(43);
    expect(badges.size).toBe(ACHIEVEMENT_TOTAL);
    expect(ids.size).toBe(ACHIEVEMENT_TOTAL);
  });

  it("renders a unique pixel art sprite for each achievement", () => {
    const state = defaultState();
    const signatures = new Set(getAchievements(state).map((achievement) => getAchievementPixelArt(achievement).join("|")));

    expect(signatures.size).toBe(ACHIEVEMENT_TOTAL);
  });

  it("unlocks progress achievements from current study state", () => {
    let state = defaultState();
    state = applyScheduleResult(state, questions[0].id, true, "draft", 1000);
    state.profile.coins = 50;
    state.profile.hintsBought = 1;

    const achievements = getAchievements(state);

    expect(achievements.find((achievement) => achievement.id === "first-blood")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "study-route")?.unlocked).toBe(false);
    expect(achievements.find((achievement) => achievement.id === "completed-grimoire")?.unlocked).toBe(false);
  });

  it("summarizes Xbox-style tracker score and closest locked achievements", () => {
    let state = defaultState();
    state = applyScheduleResult(state, questions[0].id, true, "draft", 1000);
    state = syncUnlockedAchievements(state);

    const summary = getAchievementTrackerSummary(state);

    expect(summary.gamerscore).toBe(100);
    expect(summary.totalGamerscore).toBe(ACHIEVEMENT_GAMERSCORE_TOTAL);
    expect(summary.totalUnlocked).toBe(1);
    expect(summary.totalLocked).toBe(ACHIEVEMENT_TOTAL - 1);
    expect(summary.completionPercent).toBe(Math.round((1 / ACHIEVEMENT_TOTAL) * 100));
    expect(summary.closest).toHaveLength(3);
    expect(summary.closest[0].unlocked).toBe(false);
  });

  it("persists unlocked achievements after progress is reset", () => {
    let state = defaultState();
    state = applyScheduleResult(state, questions[0].id, true, "draft", 1000);
    const synced = syncUnlockedAchievements(state);
    const reset = defaultState();
    reset.profile.unlockedAchievementIds = synced.profile.unlockedAchievementIds;

    expect(reset.profile.unlockedAchievementIds).toContain("first-blood");
    expect(getAchievements(reset).find((achievement) => achievement.id === "first-blood")?.unlocked).toBe(true);
  });

  it("tracks up to five chosen achievements", () => {
    let state = defaultState();
    const ids = ACHIEVEMENT_DEFINITIONS.slice(0, 6).map((achievement) => achievement.id);

    ids.forEach((id) => {
      state = toggleTrackedAchievement(state, id);
    });

    expect(state.profile.trackedAchievementIds).toEqual(ids.slice(0, 5));
    expect(getTrackedAchievements(state).map((achievement) => achievement.id)).toEqual(ids.slice(0, 5));
    state = toggleTrackedAchievement(state, ids[1]);
    expect(state.profile.trackedAchievementIds).toEqual([ids[0], ...ids.slice(2, 5)]);
  });

  it("unlocks relic and meta progression achievements", () => {
    let state = defaultState();
    state.profile.relics = Array.from({ length: 10 }, (_item, index) => ({
      description: "Test relic",
      id: `test-relic-${index}`,
      modifiers: [],
      name: `Test Relic ${index}`,
      rarity: "common",
      source: "any"
    }));
    state.profile.metaProgress.currency = 25;
    state.profile.metaProgress.totalEarned = 100;
    state.profile.metaProgress.upgrades.coinPurse = 1;
    state.profile.metaProgress.upgrades.starterRelics = 1;
    state.profile.relics.push({
      description: "Test unique relic",
      id: "test-unique-relic",
      modifiers: [],
      name: "Test Unique Relic",
      rarity: "unique",
      source: "any"
    });

    const achievements = getAchievements(state);

    expect(achievements.find((achievement) => achievement.id === "first-relic")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "relic-collector")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "first-insight-upgrade")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "mirror-starter-relic")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "insight-stash")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "insight-memory")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "unique-relic")?.unlocked).toBe(true);
  });

  it("unlocks pact and heat achievements from roguelike progression", () => {
    const state = defaultState();
    state.profile.metaProgress.heatUnlocked = true;
    state.profile.metaProgress.highestHeat = 16;
    state.profile.spireRun.heatConditions.hardLabor = 5;
    state.profile.spireRun.heatConditions.tightDeadline = 5;
    state.profile.spireRun.heatConditions.noRunCode = 1;
    state.profile.spireRun.heatConditions.noHints = 1;
    state.profile.spireRun.heatConditions.approvalProcess = 2;
    state.profile.spireRun.act = 4;

    const achievements = getAchievements(state);

    expect(achievements.find((achievement) => achievement.id === "first-escape")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "heat-sixteen-clear")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "heat-thirty-two-clear")?.unlocked).toBe(false);
    expect(achievements.find((achievement) => achievement.id === "pact-five-conditions")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "act-four-threshold")?.unlocked).toBe(true);
  });
});
