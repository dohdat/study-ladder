import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_TOTAL, getAchievements, syncUnlockedAchievements } from "../lib/achievementCore";
import { getAchievementPixelArt } from "../lib/achievementPixelArt";
import { applyScheduleResult, defaultState, equipItem } from "../lib/studyCore";

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
    expect(achievements.find((achievement) => achievement.id === "first-cache")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "one-good-hint")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "completed-grimoire")?.unlocked).toBe(false);
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

  it("unlocks equipment, set, and rarity achievements", () => {
    let state = defaultState();
    state.profile.inventory.push(
      { id: "sigon-a", name: "Sigon's Gage", rarity: "rare", requirements: { level: 1, stats: {} }, setId: "sigons-complete-steel", slot: "mainHand", stats: { strength: 1 } },
      { id: "sigon-b", name: "Sigon's Guard", rarity: "legendary", requirements: { level: 1, stats: {} }, setId: "sigons-complete-steel", slot: "offHand", stats: { constitution: 1 } }
    );
    state = equipItem(state, "sigon-a");
    state = equipItem(state, "sigon-b");

    const achievements = getAchievements(state);

    expect(achievements.find((achievement) => achievement.id === "rare-taste")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "legendary-find")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "geared-up")?.unlocked).toBe(true);
    expect(achievements.find((achievement) => achievement.id === "green-glow")?.unlocked).toBe(true);
  });
});
