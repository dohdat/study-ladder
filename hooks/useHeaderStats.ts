import { useMemo } from "react";

import { getEstimatedRating } from "../lib/ratingCore";
import { getEffectiveCharacterStats, getLevelProgress, getMaxHealth, getMaxMana } from "../lib/studyCore";
import type { StudyState } from "../types/study";

export function useHeaderStats(state: StudyState) {
  return {
    characterStats: useMemo(() => getEffectiveCharacterStats(state), [state]),
    estimatedRating: useMemo(() => getEstimatedRating(state), [state]),
    levelProgress: useMemo(() => getLevelProgress(state), [state]),
    maxHealth: useMemo(() => getMaxHealth(state), [state]),
    maxMana: useMemo(() => getMaxMana(state), [state])
  };
}
