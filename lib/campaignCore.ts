import type { SpireAct, SpireDifficulty, SpireRun } from "../types/study";

const ACTS: Array<{ act: SpireAct; label: string; ratingBonus: number }> = [
  { act: 1, label: "Act I - The Sightless Eye", ratingBonus: 0 },
  { act: 2, label: "Act II - The Secret of the Vizjerei", ratingBonus: 220 },
  { act: 3, label: "Act III - The Infernal Gate", ratingBonus: 440 },
  { act: 4, label: "Act IV - The Harrowing", ratingBonus: 660 }
];

const DIFFICULTIES: Array<{ difficulty: SpireDifficulty; label: string; monsterDamageMultiplier: number; monsterRatingBonus: number; monsterHealthMultiplier: number; resistancePenalty: number; rewardMultiplier: number }> = [
  { difficulty: "normal", label: "Normal", monsterDamageMultiplier: 1, monsterHealthMultiplier: 1, monsterRatingBonus: 0, resistancePenalty: 0, rewardMultiplier: 1 },
  { difficulty: "nightmare", label: "Nightmare", monsterDamageMultiplier: 1.35, monsterHealthMultiplier: 1.6, monsterRatingBonus: 820, resistancePenalty: -40, rewardMultiplier: 1.5 },
  { difficulty: "hell", label: "Hell", monsterDamageMultiplier: 1.8, monsterHealthMultiplier: 2.4, monsterRatingBonus: 1600, resistancePenalty: -100, rewardMultiplier: 2.25 }
];

export function getSpireActDefinition(act: SpireAct) {
  return ACTS.find((entry) => entry.act === act) || ACTS[0];
}

export function getSpireDifficultyDefinition(difficulty: SpireDifficulty) {
  return DIFFICULTIES.find((entry) => entry.difficulty === difficulty) || DIFFICULTIES[0];
}

export function getSpireCampaignLabel(run: Pick<SpireRun, "act" | "difficulty">) {
  return `${getSpireDifficultyDefinition(run.difficulty).label} - ${getSpireActDefinition(run.act).label}`;
}

export function getSpireCampaignRatingBonus(run: Pick<SpireRun, "act" | "difficulty">) {
  return getSpireActDefinition(run.act).ratingBonus + getSpireDifficultyDefinition(run.difficulty).monsterRatingBonus;
}

export function getSpireDifficultyModifiers(run: Pick<SpireRun, "difficulty">) {
  return getSpireDifficultyDefinition(run.difficulty);
}

export function getNextSpireCampaignStage(run: Pick<SpireRun, "act" | "difficulty">): { act: SpireAct; difficulty: SpireDifficulty } | null {
  if (run.act < 4) {
    return { act: (run.act + 1) as SpireAct, difficulty: run.difficulty };
  }
  if (run.difficulty === "normal") {
    return { act: 1, difficulty: "nightmare" };
  }
  if (run.difficulty === "nightmare") {
    return { act: 1, difficulty: "hell" };
  }
  return null;
}
