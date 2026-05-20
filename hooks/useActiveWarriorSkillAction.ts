import { useCallback, type Dispatch, type SetStateAction } from "react";

import { activateWarriorSkill, canUseActiveWarriorSkill, getActiveWarriorSkill } from "../lib/skillCore";
import type { StatusTone } from "../lib/practiceStatus";
import type { ActiveWarriorSkillId, StudyState } from "../types/study";

export function useActiveWarriorSkillAction(params: {
  setState: Dispatch<SetStateAction<StudyState>>;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  state: StudyState;
}) {
  return useCallback((skillId: ActiveWarriorSkillId) => {
    const skill = getActiveWarriorSkill(skillId);
    if (!skill) {
      return;
    }
    if (params.state.profile.activeSkill) {
      params.setTone("default");
      params.setStatus(`${getActiveWarriorSkill(params.state.profile.activeSkill)?.name || "A skill"} is already readied.`);
      return;
    }
    if (skill.healthCost && params.state.profile.health <= skill.healthCost) {
      params.setTone("fail");
      params.setStatus(`${skill.name} needs more health.`);
      return;
    }
    if (!canUseActiveWarriorSkill(params.state, skillId)) {
      params.setTone("fail");
      params.setStatus(`${skill.name} is not unlocked yet.`);
      return;
    }
    params.setState((previous) => activateWarriorSkill(previous, skillId));
    params.setTone("default");
    params.setStatus(`${skill.name} readied for the next successful submit.`);
  }, [params]);
}
