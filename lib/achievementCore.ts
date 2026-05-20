import { questions } from "../data/questions";
import { HEAT_CONDITION_DEFINITIONS, getHeatLevel } from "./campaignCore";
import { getCard, getProfileStats, META_UPGRADE_DEFINITIONS } from "./studyCore";
import type { MetaUpgradeId } from "./studyCore";
import type { CharacterStatKey, Difficulty, RelicRarity, StudyState } from "../types/study";

const ACHIEVEMENT_COUNT = 43;
const TOP_RATING_TARGET = 3000;
const FIRST_TARGET = 1;

type AchievementMetric =
  | "allStats"
  | "coins"
  | "defeats"
  | "actReached"
  | "hints"
  | "heatUnlocked"
  | "highestHeat"
  | "currentHeat"
  | "level"
  | "mastered"
  | "metaCurrency"
  | "metaTotalEarned"
  | "metaUpgrades"
  | "pactConditions"
  | "pactRanks"
  | "ratingSolved"
  | "relics"
  | "relicRarity"
  | "solved"
  | "specificMetaUpgrade"
  | "stat"
  | "streak";

type AchievementDefinition = {
  badge: string;
  colors: [string, string, string];
  description: string;
  difficulty?: Difficulty;
  id: string;
  metric: AchievementMetric;
  rarity?: RelicRarity;
  stat?: CharacterStatKey;
  target: number;
  title: string;
  upgrade?: MetaUpgradeId;
};

export type Achievement = AchievementDefinition & {
  current: number;
  unlocked: boolean;
};

type AchievementSummary = ReturnType<typeof getAchievementSummary>;
type MetricReader = (definition: AchievementDefinition, summary: AchievementSummary) => number;

export const ACHIEVEMENT_TOTAL = ACHIEVEMENT_COUNT;

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { badge: "FB", colors: ["#7a2e1f", "#d46a3a", "#ffd0a1"], description: "Clear your first combat question in a roguelike run.", id: "first-blood", metric: "defeats", target: 1, title: "First Blood" },
  { badge: "CR", colors: ["#49301c", "#c88733", "#ffe2a3"], description: "Clear 10 combat questions across runs.", id: "combat-route", metric: "defeats", target: 10, title: "Combat Route" },
  { badge: "CH", colors: ["#4a1d2f", "#d14b74", "#ffd1df"], description: "Clear 50 combat questions across runs.", id: "chamber-hunter", metric: "defeats", target: 50, title: "Chamber Hunter" },
  { badge: "SR", colors: ["#18324d", "#3f8fd2", "#c8e9ff"], description: "Solve 10 different LeetCode rooms.", id: "study-route", metric: "solved", target: 10, title: "Study Route" },
  { badge: "CG", colors: ["#2f2413", "#c49a4a", "#ffe7ae"], description: "Solve every current LeetCode room in the bank.", id: "completed-grimoire", metric: "solved", target: questions.length, title: "Completed Grimoire" },
  { badge: "PM", colors: ["#4b3b14", "#f6d365", "#fff7ca"], description: "Master every current LeetCode room.", id: "perfect-memory", metric: "mastered", target: questions.length, title: "Perfect Memory" },
  { badge: "GK", colors: ["#3d1111", "#f97316", "#ffedd5"], description: "Solve a question rated 3000 or higher.", id: "giant-killer", metric: "ratingSolved", target: TOP_RATING_TARGET, title: "Giant Killer" },
  { badge: "A2", colors: ["#5a3514", "#d9913d", "#ffe2aa"], description: "Reach Act II during a run.", id: "act-two-gates", metric: "actReached", target: 2, title: "Act II Gates" },
  { badge: "A3", colors: ["#4e1717", "#ef4444", "#ffd4d4"], description: "Reach Act III during a run.", id: "act-three-descent", metric: "actReached", target: 3, title: "Act III Descent" },
  { badge: "A4", colors: ["#31205f", "#8b5cf6", "#ede9fe"], description: "Reach Act IV during a run.", id: "act-four-threshold", metric: "actReached", target: 4, title: "Act IV Threshold" },
  { badge: "ES", colors: ["#4b2d05", "#f0b429", "#fff2b5"], description: "Clear Act IV once and unlock the Pact of Conditions.", id: "first-escape", metric: "heatUnlocked", target: 1, title: "First Escape" },
  { badge: "H1", colors: ["#581c15", "#f97316", "#ffedd5"], description: "Clear a run at Heat 1 or higher.", id: "heat-one-clear", metric: "highestHeat", target: 1, title: "First Heat" },
  { badge: "H4", colors: ["#5f1f13", "#fb923c", "#fed7aa"], description: "Clear a run at Heat 4 or higher.", id: "heat-four-clear", metric: "highestHeat", target: 4, title: "Kindled Contract" },
  { badge: "H8", colors: ["#621b1b", "#ef4444", "#fecaca"], description: "Clear a run at Heat 8 or higher.", id: "heat-eight-clear", metric: "highestHeat", target: 8, title: "Burning Contract" },
  { badge: "H16", colors: ["#4c0519", "#e11d48", "#fecdd3"], description: "Clear a run at Heat 16 or higher.", id: "heat-sixteen-clear", metric: "highestHeat", target: 16, title: "Blazing Contract" },
  { badge: "H32", colors: ["#2e1065", "#a855f7", "#f3e8ff"], description: "Clear a run at Heat 32 or higher.", id: "heat-thirty-two-clear", metric: "highestHeat", target: 32, title: "Infernal Contract" },
  { badge: "HX", colors: ["#111827", "#f43f5e", "#fff1f2"], description: "Clear the highest challenge: Heat 64.", id: "heat-sixty-four-clear", metric: "highestHeat", target: 64, title: "No Escape Clause" },
  { badge: "PR", colors: ["#271c4f", "#6f5bd6", "#d6d0ff"], description: "Add your first rank to the Pact of Conditions.", id: "first-pact-rank", metric: "pactRanks", target: 1, title: "Signed in Blood" },
  { badge: "PC", colors: ["#3d1f13", "#ff8a3d", "#ffe1c8"], description: "Enable 5 different Pact conditions at once.", id: "pact-five-conditions", metric: "pactConditions", target: 5, title: "Fine Print" },
  { badge: "PA", colors: ["#431414", "#c62626", "#ffd3d3"], description: "Enable every Pact condition at least once.", id: "pact-all-conditions", metric: "pactConditions", target: HEAT_CONDITION_DEFINITIONS.length, title: "Every Clause" },
  { badge: "P64", colors: ["#020617", "#dc2626", "#fee2e2"], description: "Set the Pact to Heat 64 before entering a run.", id: "pact-sixty-four-set", metric: "currentHeat", target: 64, title: "Marked for Fire" },
  { badge: "IU", colors: ["#1e3446", "#4aa3df", "#d1edff"], description: "Buy your first Mirror upgrade with insight.", id: "first-insight-upgrade", metric: "metaUpgrades", target: 1, title: "First Mirror Spark" },
  { badge: "M10", colors: ["#12345b", "#5fa8ff", "#dbeafe"], description: "Buy 10 total Mirror ranks.", id: "mirror-ten-ranks", metric: "metaUpgrades", target: 10, title: "Polished Mirror" },
  { badge: "MH", colors: ["#2c3340", "#8aa1c1", "#edf4ff"], description: "Buy half of all available Mirror ranks.", id: "mirror-half-lit", metric: "metaUpgrades", target: Math.ceil(getMaxMetaUpgradeRanks() / 2), title: "Half-Lit Mirror" },
  { badge: "MU", colors: ["#2c2c32", "#9ca3af", "#f3f4f6"], description: "Buy every permanent Mirror rank.", id: "maxed-mirror", metric: "metaUpgrades", target: getMaxMetaUpgradeRanks(), title: "Maxed Mirror" },
  { badge: "SR1", colors: ["#12391f", "#22c55e", "#bbf7d0"], description: "Unlock one starting relic from the Mirror.", id: "mirror-starter-relic", metric: "specificMetaUpgrade", target: 1, title: "Keepsake Drawer", upgrade: "starterRelics" },
  { badge: "SR3", colors: ["#14532d", "#4ade80", "#dcfce7"], description: "Start runs with three Mirror relics.", id: "mirror-three-starters", metric: "specificMetaUpgrade", target: 3, title: "Loaded Departure", upgrade: "starterRelics" },
  { badge: "LU", colors: ["#3d3106", "#f2c94c", "#fff9cf"], description: "Max the Mirror upgrade that improves relic rarity odds.", id: "mirror-luck-maxed", metric: "specificMetaUpgrade", target: getMetaUpgradeMaxRank("relicLuck"), title: "Fated Luck", upgrade: "relicLuck" },
  { badge: "TS", colors: ["#213347", "#5fa8ff", "#d7ecff"], description: "Unlock hidden submission test visibility from the Mirror.", id: "mirror-test-sight", metric: "specificMetaUpgrade", target: 1, title: "Test Sight", upgrade: "revealSubmitTests" },
  { badge: "DD", colors: ["#491818", "#ef4444", "#fecaca"], description: "Buy your first Mirror revive rank.", id: "mirror-death-defiance", metric: "specificMetaUpgrade", target: 1, title: "Death Defiance", upgrade: "deathDefiance" },
  { badge: "DM", colors: ["#4c1d95", "#c084fc", "#f3e8ff"], description: "Max the Mirror revive ranks.", id: "mirror-defiance-maxed", metric: "specificMetaUpgrade", target: getMetaUpgradeMaxRank("deathDefiance"), title: "Stubborn Return", upgrade: "deathDefiance" },
  { badge: "IS", colors: ["#12391f", "#22c55e", "#bbf7d0"], description: "Hold 25 unspent insight.", id: "insight-stash", metric: "metaCurrency", target: 25, title: "Insight Stash" },
  { badge: "IM", colors: ["#16361f", "#4ade80", "#dcfce7"], description: "Earn 100 total insight across runs.", id: "insight-memory", metric: "metaTotalEarned", target: 100, title: "Insight Memory" },
  { badge: "IV", colors: ["#35205f", "#a855f7", "#f3e8ff"], description: "Earn 500 total insight across runs.", id: "insight-vault", metric: "metaTotalEarned", target: 500, title: "Insight Vault" },
  { badge: "FR", colors: ["#33302a", "#b7a37a", "#fff0c4"], description: "Claim your first relic in a run.", id: "first-relic", metric: "relics", target: 1, title: "First Relic" },
  { badge: "RC", colors: ["#3c3120", "#c19a55", "#ffe2aa"], description: "Carry 10 relics in one run.", id: "relic-collector", metric: "relics", target: 10, title: "Relic Collector" },
  { badge: "RS", colors: ["#4c3514", "#d59c35", "#ffe9bc"], description: "Carry 20 relics in one run.", id: "relic-storm", metric: "relics", target: 20, title: "Relic Storm" },
  { badge: "UR", colors: ["#45206a", "#c084fc", "#f3e8ff"], description: "Carry a unique relic.", id: "unique-relic", metric: "relicRarity", rarity: "unique", target: 1, title: "Unique Spark" },
  { badge: "BR", colors: ["#4a0711", "#ef233c", "#ffd1d8"], description: "Carry a boss relic.", id: "boss-relic", metric: "relicRarity", rarity: "boss", target: 1, title: "Boss Trophy" },
  { badge: "SH", colors: ["#0c4a6e", "#38bdf8", "#e0f2fe"], description: "Carry a shop relic from a merchant.", id: "shop-relic", metric: "relicRarity", rarity: "shop", target: 1, title: "Merchant's Mark" },
  { badge: "ER", colors: ["#3b1b58", "#b674ff", "#eadcff"], description: "Carry an event relic from an event room.", id: "event-relic", metric: "relicRarity", rarity: "event", target: 1, title: "Strange Bargain" },
  { badge: "BL", colors: ["#1f2937", "#60a5fa", "#dbeafe"], description: "Accept a blight relic.", id: "first-blight", metric: "relicRarity", rarity: "blight", target: 1, title: "Cursed Choice" },
  { badge: "B3", colors: ["#0f172a", "#38bdf8", "#cffafe"], description: "Carry three blight relics in one run.", id: "blight-stack", metric: "relicRarity", rarity: "blight", target: 3, title: "Blight Stack" }
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
  const currentHeat = getHeatLevel(state.profile.spireRun.heatConditions);
  return {
    actReached: state.profile.spireRun.act,
    currentHeat,
    highestSolvedRating: getHighestSolvedRating(state),
    highestHeat: Math.max(state.profile.metaProgress.highestHeat || 0, currentHeat),
    heatUnlocked: state.profile.metaProgress.heatUnlocked ? 1 : 0,
    metaTotalEarned: state.profile.metaProgress.totalEarned,
    metaCurrency: state.profile.metaProgress.currency,
    metaUpgrades: getPurchasedMetaUpgradeRanks(state),
    pactConditions: getActivePactConditionCount(state),
    pactRanks: getPactRankCount(state),
    profile,
    relics: state.profile.relics,
    state,
  };
}

function getAchievementCurrent(definition: AchievementDefinition, summary: ReturnType<typeof getAchievementSummary>) {
  return METRIC_READERS[definition.metric](definition, summary);
}

const METRIC_READERS: Record<AchievementMetric, MetricReader> = {
  actReached: (_definition, summary) => summary.actReached,
  allStats: (_definition, _summary) => 0,
  coins: (_definition, summary) => summary.state.profile.coins,
  currentHeat: (_definition, summary) => summary.currentHeat,
  defeats: (_definition, summary) => summary.state.totalCorrect,
  heatUnlocked: (_definition, summary) => summary.heatUnlocked,
  highestHeat: (_definition, summary) => summary.highestHeat,
  hints: (_definition, summary) => summary.state.profile.hintsBought,
  level: (_definition, _summary) => 0,
  mastered: (_definition, summary) => summary.profile.mastered,
  metaCurrency: (_definition, summary) => summary.metaCurrency,
  metaTotalEarned: (_definition, summary) => summary.metaTotalEarned,
  metaUpgrades: (_definition, summary) => summary.metaUpgrades,
  pactConditions: (_definition, summary) => summary.pactConditions,
  pactRanks: (_definition, summary) => summary.pactRanks,
  ratingSolved: (_definition, summary) => summary.highestSolvedRating,
  relicRarity: (definition, summary) => definition.rarity ? summary.relics.filter((relic) => relic.rarity === definition.rarity).length : 0,
  relics: (_definition, summary) => summary.relics.length,
  solved: (_definition, summary) => summary.profile.solved,
  specificMetaUpgrade: (definition, summary) => definition.upgrade ? summary.state.profile.metaProgress.upgrades[definition.upgrade] || 0 : 0,
  stat: (_definition, _summary) => 0,
  streak: (_definition, summary) => summary.state.streak
};

function getPurchasedMetaUpgradeRanks(state: StudyState) {
  return Object.values(state.profile.metaProgress.upgrades).reduce((sum, rank) => sum + Math.max(0, Math.floor(rank || 0)), 0);
}

function getMaxMetaUpgradeRanks() {
  return META_UPGRADE_DEFINITIONS.reduce((sum, upgrade) => sum + upgrade.maxRank, 0);
}

function getMetaUpgradeMaxRank(id: MetaUpgradeId) {
  return META_UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === id)?.maxRank || 0;
}

function getPactRankCount(state: StudyState) {
  return Object.values(state.profile.spireRun.heatConditions).reduce((sum, rank) => sum + Math.max(0, Math.floor(rank || 0)), 0);
}

function getActivePactConditionCount(state: StudyState) {
  return Object.values(state.profile.spireRun.heatConditions).filter((rank) => Math.max(0, Math.floor(rank || 0)) > 0).length;
}

function getHighestSolvedRating(state: StudyState) {
  return questions.reduce((highest, question) => {
    return getCard(state, question.id).correct > 0 ? Math.max(highest, question.rating) : highest;
  }, 0);
}
