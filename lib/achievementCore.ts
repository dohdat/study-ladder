import { questions } from "../data/questions";
import { getCard, getEffectiveCharacterStats, getLevelProgress, getProfileStats, MAX_CHARACTER_LEVEL, META_UPGRADE_DEFINITIONS } from "./studyCore";
import type { CharacterStatKey, Difficulty, StudyState } from "../types/study";

const ACHIEVEMENT_COUNT = 43;
const TOP_RATING_TARGET = 3000;
const FIRST_TARGET = 1;

type AchievementMetric =
  | "allStats"
  | "coins"
  | "defeats"
  | "hints"
  | "level"
  | "mastered"
  | "metaCurrency"
  | "metaTotalEarned"
  | "metaUpgrades"
  | "ratingSolved"
  | "relics"
  | "solved"
  | "stat"
  | "streak";

type AchievementDefinition = {
  badge: string;
  colors: [string, string, string];
  description: string;
  difficulty?: Difficulty;
  id: string;
  metric: AchievementMetric;
  stat?: CharacterStatKey;
  target: number;
  title: string;
};

export type Achievement = AchievementDefinition & {
  current: number;
  unlocked: boolean;
};

type AchievementSummary = ReturnType<typeof getAchievementSummary>;
type MetricReader = (definition: AchievementDefinition, summary: AchievementSummary) => number;

export const ACHIEVEMENT_TOTAL = ACHIEVEMENT_COUNT;

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { badge: "FB", colors: ["#7a2e1f", "#d46a3a", "#ffd0a1"], description: "Defeat your first question monster.", id: "first-blood", metric: "defeats", target: 1, title: "First Blood" },
  { badge: "FP", colors: ["#49301c", "#c88733", "#ffe2a3"], description: "Defeat 5 question monsters.", id: "fallen-pack", metric: "defeats", target: 5, title: "Fallen Pack" },
  { badge: "CH", colors: ["#4a1d2f", "#d14b74", "#ffd1df"], description: "Defeat 10 question monsters.", id: "champion-hunter", metric: "defeats", target: 10, title: "Champion Hunter" },
  { badge: "BS", colors: ["#271c4f", "#6f5bd6", "#d6d0ff"], description: "Defeat 25 question monsters.", id: "baseline-slayer", metric: "defeats", target: 25, title: "Baseline Slayer" },
  { badge: "AA", colors: ["#123c35", "#28a58b", "#b8fff2"], description: "Defeat 50 question monsters.", id: "adept-aggressor", metric: "defeats", target: 50, title: "Adept Aggressor" },
  { badge: "MM", colors: ["#431414", "#c62626", "#ffd3d3"], description: "Defeat 100 question monsters.", id: "murder-machine", metric: "defeats", target: 100, title: "Murder Machine" },
  { badge: "FC", colors: ["#4f3c10", "#d6a42f", "#fff0a8"], description: "Hold 50 gold.", id: "first-cache", metric: "coins", target: 50, title: "First Cache" },
  { badge: "DP", colors: ["#59430d", "#e0bb3d", "#fff5bd"], description: "Hold 250 gold.", id: "deep-pockets", metric: "coins", target: 250, title: "Deep Pockets" },
  { badge: "MB", colors: ["#3d3106", "#f2c94c", "#fff9cf"], description: "Hold 1,000 gold.", id: "money-bags", metric: "coins", target: 1000, title: "Mr. Money Bags" },
  { badge: "EG", colors: ["#18324d", "#3f8fd2", "#c8e9ff"], description: "Solve 3 different questions.", id: "eastgate", metric: "solved", target: 3, title: "Welcome to Eastgate" },
  { badge: "PF", colors: ["#2d285c", "#7f72ff", "#dedbff"], description: "Solve 6 different questions.", id: "nightmare-opens", metric: "solved", target: 6, title: "Pact Foreshadowed" },
  { badge: "HR", colors: ["#4e1717", "#ef4444", "#ffd4d4"], description: "Solve 9 different questions.", id: "hell-opens", metric: "solved", target: 9, title: "Heat Rises" },
  { badge: "CG", colors: ["#2f2413", "#c49a4a", "#ffe7ae"], description: "Solve every current LeetCode question.", id: "completed-grimoire", metric: "solved", target: questions.length, title: "Completed Grimoire" },
  { badge: "L5", colors: ["#1d3c24", "#3dbb60", "#c9ffd4"], description: "Reach character level 5.", id: "level-5", metric: "level", target: 5, title: "Apprentice Warrior" },
  { badge: "L10", colors: ["#24423f", "#50c8bd", "#d2fff9"], description: "Reach character level 10.", id: "level-10", metric: "level", target: 10, title: "Veteran Warrior" },
  { badge: "L25", colors: ["#242c54", "#6578e8", "#d7ddff"], description: "Reach character level 25.", id: "level-25", metric: "level", target: 25, title: "Paragon Path" },
  { badge: "L50", colors: ["#43245a", "#b15bea", "#efdbff"], description: "Reach character level 50.", id: "level-50", metric: "level", target: 50, title: "Ancients Remember" },
  { badge: "L100", colors: ["#4b2d05", "#f0b429", "#fff2b5"], description: "Reach character level 100.", id: "level-100", metric: "level", target: MAX_CHARACTER_LEVEL, title: "It's Only One More Level" },
  { badge: "FM", colors: ["#273143", "#7aa2f7", "#d8e5ff"], description: "Solve one question.", id: "first-mastery", metric: "mastered", target: 1, title: "First Mastery" },
  { badge: "TB", colors: ["#2c3340", "#8aa1c1", "#edf4ff"], description: "Solve 3 questions.", id: "tome-binder", metric: "mastered", target: 3, title: "Tome Binder" },
  { badge: "AM", colors: ["#34234e", "#9d6bff", "#eadcff"], description: "Solve 6 questions.", id: "archmage-memory", metric: "mastered", target: 6, title: "Archmage Memory" },
  { badge: "PM", colors: ["#4b3b14", "#f6d365", "#fff7ca"], description: "Solve every current question.", id: "perfect-memory", metric: "mastered", target: questions.length, title: "Perfect Memory" },
  { badge: "HS", colors: ["#23320f", "#7cb342", "#e5ffc8"], description: "Pass 3 submissions in a row.", id: "hot-streak", metric: "streak", target: 3, title: "Hot Streak" },
  { badge: "ZS", colors: ["#13352f", "#39c5a3", "#d2fff5"], description: "Pass 5 submissions in a row.", id: "zealot-streak", metric: "streak", target: 5, title: "Zealot Streak" },
  { badge: "FS", colors: ["#3d1f13", "#ff8a3d", "#ffe1c8"], description: "Pass 10 submissions in a row.", id: "frenzy-streak", metric: "streak", target: 10, title: "Frenzy Streak" },
  { badge: "OH", colors: ["#213347", "#5fa8ff", "#d7ecff"], description: "Use one Codex hint.", id: "one-good-hint", metric: "hints", target: 1, title: "One Good Hint" },
  { badge: "OD", colors: ["#182a45", "#6ea8fe", "#dbeafe"], description: "Use 5 Codex hints.", id: "oracle-debt", metric: "hints", target: 5, title: "Oracle's Debt" },
  { badge: "FR", colors: ["#33302a", "#b7a37a", "#fff0c4"], description: "Claim your first relic.", id: "first-relic", metric: "relics", target: 1, title: "First Relic" },
  { badge: "RC", colors: ["#3c3120", "#c19a55", "#ffe2aa"], description: "Carry 10 relics in one run.", id: "relic-collector", metric: "relics", target: 10, title: "Relic Collector" },
  { badge: "RS", colors: ["#4c3514", "#d59c35", "#ffe9bc"], description: "Carry 25 relics in one run.", id: "relic-storm", metric: "relics", target: 25, title: "Relic Storm" },
  { badge: "IU", colors: ["#1e3446", "#4aa3df", "#d1edff"], description: "Buy your first permanent insight upgrade.", id: "first-insight-upgrade", metric: "metaUpgrades", target: 1, title: "First Insight Upgrade" },
  { badge: "MU", colors: ["#2c2c32", "#9ca3af", "#f3f4f6"], description: "Buy every permanent insight upgrade.", id: "maxed-mirror", metric: "metaUpgrades", target: getMaxMetaUpgradeRanks(), title: "Maxed Mirror" },
  { badge: "IS", colors: ["#12391f", "#22c55e", "#bbf7d0"], description: "Hold 25 unspent insight.", id: "insight-stash", metric: "metaCurrency", target: 25, title: "Insight Stash" },
  { badge: "IM", colors: ["#16361f", "#4ade80", "#dcfce7"], description: "Earn 100 total insight across runs.", id: "insight-memory", metric: "metaTotalEarned", target: 100, title: "Insight Memory" },
  { badge: "IB", colors: ["#12345b", "#5fa8ff", "#dbeafe"], description: "Earn 250 total insight across runs.", id: "insight-bank", metric: "metaTotalEarned", target: 250, title: "Insight Bank" },
  { badge: "IR", colors: ["#35205f", "#a855f7", "#f3e8ff"], description: "Earn 500 total insight across runs.", id: "insight-reservoir", metric: "metaTotalEarned", target: 500, title: "Insight Reservoir" },
  { badge: "IL", colors: ["#493713", "#eab308", "#fef3c7"], description: "Hold 100 unspent insight.", id: "insight-lord", metric: "metaCurrency", target: 100, title: "Insight Lord" },
  { badge: "ST", colors: ["#491818", "#ef4444", "#fecaca"], description: "Reach 10 Strength.", id: "iron-strength", metric: "stat", stat: "strength", target: 10, title: "Iron Strength" },
  { badge: "CN", colors: ["#1c3d2a", "#4ade80", "#bbf7d0"], description: "Reach 10 Constitution.", id: "stone-constitution", metric: "stat", stat: "constitution", target: 10, title: "Stone Constitution" },
  { badge: "PE", colors: ["#18425a", "#38bdf8", "#cffafe"], description: "Reach 10 Perception.", id: "keen-perception", metric: "stat", stat: "perception", target: 10, title: "Keen Perception" },
  { badge: "IN", colors: ["#31205f", "#8b5cf6", "#ede9fe"], description: "Reach 10 Intelligence.", id: "arcane-intelligence", metric: "stat", stat: "intelligence", target: 10, title: "Arcane Intelligence" },
  { badge: "BB", colors: ["#233025", "#84cc16", "#ecfccb"], description: "Reach 10 in all four stats.", id: "balanced-build", metric: "allStats", target: 10, title: "Balanced Build" },
  { badge: "GK", colors: ["#3d1111", "#f97316", "#ffedd5"], description: "Solve a question rated 3000 or higher.", id: "giant-killer", metric: "ratingSolved", target: TOP_RATING_TARGET, title: "Giant Killer" }
];

export function getAchievements(state: StudyState): Achievement[] {
  const summary = getAchievementSummary(state);
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const current = getAchievementCurrent(definition, summary);
    return { ...definition, current, unlocked: isAchievementUnlocked(definition, state, current) };
  });
}

export function syncUnlockedAchievements(state: StudyState): StudyState {
  const unlocked = getAchievements(state).filter((achievement) => achievement.unlocked).map((achievement) => achievement.id);
  const merged = Array.from(new Set([...state.profile.unlockedAchievementIds, ...unlocked]));
  if (merged.length === state.profile.unlockedAchievementIds.length) {
    return state;
  }
  return { ...state, profile: { ...state.profile, unlockedAchievementIds: merged } };
}

function isAchievementUnlocked(definition: AchievementDefinition, state: StudyState, current: number) {
  return current >= definition.target || state.profile.unlockedAchievementIds.includes(definition.id);
}

function getAchievementSummary(state: StudyState) {
  const profile = getProfileStats(state);
  const stats = getEffectiveCharacterStats(state);
  return {
    highestSolvedRating: getHighestSolvedRating(state),
    level: getLevelProgress(state).level,
    metaTotalEarned: state.profile.metaProgress.totalEarned,
    metaCurrency: state.profile.metaProgress.currency,
    metaUpgrades: getPurchasedMetaUpgradeRanks(state),
    profile,
    relics: state.profile.relics,
    state,
    stats
  };
}

function getAchievementCurrent(definition: AchievementDefinition, summary: ReturnType<typeof getAchievementSummary>) {
  return METRIC_READERS[definition.metric](definition, summary);
}

const METRIC_READERS: Record<AchievementMetric, MetricReader> = {
  allStats: (_definition, summary) => Math.min(summary.stats.strength, summary.stats.constitution, summary.stats.perception, summary.stats.intelligence),
  coins: (_definition, summary) => summary.state.profile.coins,
  defeats: (_definition, summary) => summary.state.totalCorrect,
  hints: (_definition, summary) => summary.state.profile.hintsBought,
  level: (_definition, summary) => summary.level,
  mastered: (_definition, summary) => summary.profile.mastered,
  metaCurrency: (_definition, summary) => summary.metaCurrency,
  metaTotalEarned: (_definition, summary) => summary.metaTotalEarned,
  metaUpgrades: (_definition, summary) => summary.metaUpgrades,
  ratingSolved: (_definition, summary) => summary.highestSolvedRating,
  relics: (_definition, summary) => summary.relics.length,
  solved: (_definition, summary) => summary.profile.solved,
  stat: (definition, summary) => definition.stat ? summary.stats[definition.stat] : 0,
  streak: (_definition, summary) => summary.state.streak
};

function getPurchasedMetaUpgradeRanks(state: StudyState) {
  return Object.values(state.profile.metaProgress.upgrades).reduce((sum, rank) => sum + Math.max(0, Math.floor(rank || 0)), 0);
}

function getMaxMetaUpgradeRanks() {
  return META_UPGRADE_DEFINITIONS.reduce((sum, upgrade) => sum + upgrade.maxRank, 0);
}

function getHighestSolvedRating(state: StudyState) {
  return questions.reduce((highest, question) => {
    return getCard(state, question.id).correct > 0 ? Math.max(highest, question.rating) : highest;
  }, 0);
}
