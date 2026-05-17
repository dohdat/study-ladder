import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { syncUnlockedAchievements } from "../lib/achievementCore";
import type { StudyState } from "../types/study";

export function usePersistAchievements(state: StudyState, hydrated: boolean, setState: Dispatch<SetStateAction<StudyState>>) {
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const synced = syncUnlockedAchievements(state);
    if (synced !== state) {
      setState(synced);
    }
  }, [hydrated, setState, state]);
}
