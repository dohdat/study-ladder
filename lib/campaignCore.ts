import type { HeatConditionId, HeatConditionRanks, SpireAct, SpireDifficulty, SpireRun } from "../types/study";

const ACTS: Array<{ act: SpireAct; label: string; ratingBonus: number }> = [
  { act: 1, label: "Act I - The Sightless Eye", ratingBonus: 0 },
  { act: 2, label: "Act II - The Secret of the Vizjerei", ratingBonus: 220 },
  { act: 3, label: "Act III - The Infernal Gate", ratingBonus: 440 },
  { act: 4, label: "Act IV - The Harrowing", ratingBonus: 660 }
];

export const MAX_HEAT = 64;

export type HeatConditionDefinition = {
  description: string;
  heatPerRank: number;
  id: HeatConditionId;
  label: string;
  maxRank: number;
};

export const HEAT_CONDITION_DEFINITIONS: HeatConditionDefinition[] = [
  { description: "+20% incoming damage per rank.", heatPerRank: 1, id: "hardLabor", label: "Hard Labor", maxRank: 5 },
  { description: "-25% healing received per rank.", heatPerRank: 1, id: "lastingConsequences", label: "Lasting Consequences", maxRank: 4 },
  { description: "+40% shop prices per rank.", heatPerRank: 1, id: "convenienceFee", label: "Convenience Fee", maxRank: 2 },
  { description: "Combat rooms add more questions.", heatPerRank: 1, id: "jurySummons", label: "Jury Summons", maxRank: 3 },
  { description: "Bosses gain health, damage, and rating.", heatPerRank: 1, id: "extremeMeasures", label: "Extreme Measures", maxRank: 4 },
  { description: "+15% monster health per rank.", heatPerRank: 1, id: "calisthenicsProgram", label: "Calisthenics Program", maxRank: 2 },
  { description: "Monsters roll stronger unique traits.", heatPerRank: 2, id: "benefitsPackage", label: "Benefits Package", maxRank: 2 },
  { description: "Elites gain health, damage, and rating.", heatPerRank: 2, id: "middleManagement", label: "Middle Management", maxRank: 1 },
  { description: "Boss relic rewards show fewer choices.", heatPerRank: 2, id: "underworldCustoms", label: "Underworld Customs", maxRank: 1 },
  { description: "Monsters hit harder and rooms move faster.", heatPerRank: 3, id: "forcedOvertime", label: "Forced Overtime", maxRank: 2 },
  { description: "Wrong answers are more dangerous.", heatPerRank: 1, id: "heightenedSecurity", label: "Heightened Security", maxRank: 1 },
  { description: "Relic rewards show fewer choices.", heatPerRank: 2, id: "routineInspection", label: "Routine Inspection", maxRank: 4 },
  { description: "Monster health rises and big hits are less reliable.", heatPerRank: 1, id: "damageControl", label: "Damage Control", maxRank: 2 },
  { description: "Relic rerolls are reduced.", heatPerRank: 2, id: "approvalProcess", label: "Approval Process", maxRank: 2 },
  { description: "Question timers are shorter.", heatPerRank: 3, id: "tightDeadline", label: "Tight Deadline", maxRank: 5 }
];

export const HEAT_CONDITION_IDS = HEAT_CONDITION_DEFINITIONS.map((condition) => condition.id);

const NORMAL_DIFFICULTY = {
  difficulty: "normal" as SpireDifficulty,
  label: "Normal",
  monsterDamageMultiplier: 1,
  monsterHealthMultiplier: 1,
  monsterRatingBonus: 0,
  resistancePenalty: 0,
  rewardMultiplier: 1
};

export function createDefaultHeatConditions(): HeatConditionRanks {
  return Object.fromEntries(HEAT_CONDITION_DEFINITIONS.map((condition) => [condition.id, 0])) as HeatConditionRanks;
}

export function normalizeHeatConditions(source: Partial<HeatConditionRanks> | undefined): HeatConditionRanks {
  const normalized = createDefaultHeatConditions();
  for (const condition of HEAT_CONDITION_DEFINITIONS) {
    normalized[condition.id] = Math.min(condition.maxRank, Math.max(0, Math.floor(source?.[condition.id] || 0)));
  }
  return clampHeatConditions(normalized);
}

export function clampHeatConditions(source: HeatConditionRanks): HeatConditionRanks {
  const normalized = { ...source };
  let total = getHeatLevel(normalized);
  for (const condition of [...HEAT_CONDITION_DEFINITIONS].reverse()) {
    while (total > MAX_HEAT && normalized[condition.id] > 0) {
      normalized[condition.id] -= 1;
      total -= condition.heatPerRank;
    }
  }
  return normalized;
}

export function getHeatLevel(conditions: Partial<HeatConditionRanks> | undefined) {
  return HEAT_CONDITION_DEFINITIONS.reduce((total, condition) => total + Math.max(0, Math.floor(conditions?.[condition.id] || 0)) * condition.heatPerRank, 0);
}

export function getHeatRank(run: Pick<SpireRun, "heatConditions">, id: HeatConditionId) {
  return Math.max(0, Math.floor(run.heatConditions[id] || 0));
}

export function getSpireActDefinition(act: SpireAct) {
  return ACTS.find((entry) => entry.act === act) || ACTS[0];
}

export function getSpireDifficultyDefinition(_difficulty: SpireDifficulty) {
  return NORMAL_DIFFICULTY;
}

export function getSpireCampaignLabel(run: Pick<SpireRun, "act" | "difficulty" | "heatConditions">) {
  const heat = getHeatLevel(run.heatConditions);
  return `${heat > 0 ? `Heat ${heat} - ` : ""}${getSpireActDefinition(run.act).label}`;
}

export function getSpireCampaignRatingBonus(run: Pick<SpireRun, "act" | "difficulty" | "heatConditions">) {
  const heat = getHeatLevel(run.heatConditions);
  return getSpireActDefinition(run.act).ratingBonus + heat * 24 + getHeatRank(run, "benefitsPackage") * 80;
}

export function getSpireDifficultyModifiers(run: Pick<SpireRun, "difficulty" | "heatConditions">) {
  const heat = getHeatLevel(run.heatConditions);
  const hardLabor = getHeatRank(run, "hardLabor");
  const calisthenics = getHeatRank(run, "calisthenicsProgram");
  const forcedOvertime = getHeatRank(run, "forcedOvertime");
  const heightenedSecurity = getHeatRank(run, "heightenedSecurity");
  const damageControl = getHeatRank(run, "damageControl");
  return {
    ...NORMAL_DIFFICULTY,
    label: heat > 0 ? `Heat ${heat}` : NORMAL_DIFFICULTY.label,
    monsterDamageMultiplier: 1 + heat * 0.01 + hardLabor * 0.2 + forcedOvertime * 0.1 + heightenedSecurity * 0.15,
    monsterHealthMultiplier: 1 + calisthenics * 0.15 + damageControl * 0.12,
    monsterRatingBonus: heat * 24 + getHeatRank(run, "benefitsPackage") * 80,
    resistancePenalty: 0,
    rewardMultiplier: 1
  };
}

export function getHeatHealingMultiplier(run: Pick<SpireRun, "heatConditions">) {
  return Math.max(0.05, 1 - getHeatRank(run, "lastingConsequences") * 0.25);
}

export function getHeatShopPriceIncreasePercent(run: Pick<SpireRun, "heatConditions">) {
  return getHeatRank(run, "convenienceFee") * 40;
}

export function getHeatTimerPenaltyPercent(run: Pick<SpireRun, "heatConditions">) {
  return getHeatRank(run, "tightDeadline") * 10 + getHeatRank(run, "forcedOvertime") * 5;
}

export function getHeatRelicChoicePenalty(run: Pick<SpireRun, "heatConditions">, rewardKind: NonNullable<SpireRun["pendingRelicReward"]>["rewardKind"]) {
  const routine = getHeatRank(run, "routineInspection");
  const customs = rewardKind === "boss" ? getHeatRank(run, "underworldCustoms") : 0;
  return routine + customs;
}

export function getHeatRelicRerollPenalty(run: Pick<SpireRun, "heatConditions">) {
  return getHeatRank(run, "approvalProcess");
}

export function getHeatExtraRoomQuestions(run: Pick<SpireRun, "heatConditions">) {
  return Math.min(2, Math.floor(getHeatRank(run, "jurySummons") / 2));
}

export function getHeatEliteQuestionBonus(run: Pick<SpireRun, "heatConditions">) {
  return getHeatRank(run, "jurySummons") >= 1 ? 1 : 0;
}

export function getHeatBossMultiplier(run: Pick<SpireRun, "heatConditions">) {
  return 1 + getHeatRank(run, "extremeMeasures") * 0.18;
}

export function getHeatEliteMultiplier(run: Pick<SpireRun, "heatConditions">) {
  return 1 + getHeatRank(run, "middleManagement") * 0.25;
}

export function getNextSpireCampaignStage(run: Pick<SpireRun, "act" | "difficulty">): { act: SpireAct; difficulty: SpireDifficulty } | null {
  if (run.act < 4) {
    return { act: (run.act + 1) as SpireAct, difficulty: "normal" };
  }
  return null;
}
