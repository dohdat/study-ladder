import { useState } from "react";
import { Box, Group, Progress, Text } from "@mantine/core";

import { HeroSiegeModeSwitch } from "./HeroSiegeUi";
import { PlayerStatus } from "./PlayerStatus";
import { UserMenu } from "./UserMenu";
import type { UserMenuSection } from "./UserMenu";
import { STUDY_BLOCKER_MS_PER_MINUTE, useStudyBlockerSettings } from "../hooks/useStudyBlocker";
import type { ActiveWarriorSkillId, CharacterStats, StudyState } from "../types/study";

const PROGRESS_MAX = 100;
const MINUTES_DECIMAL_PLACES = 1;
const TODAY_PROGRESS_WIDTH = 360;
const HERO_PANEL_BG = "linear-gradient(180deg, rgba(48, 30, 17, 0.96), rgba(12, 9, 6, 0.98))";
const HERO_PANEL_BORDER = "1px solid rgba(223, 195, 122, 0.58)";
const HERO_PANEL_SHADOW = "inset 0 0 0 1px #050403, 0 4px 12px rgba(0, 0, 0, 0.34)";
const HERO_PROGRESS_BG = "rgba(0, 0, 0, 0.42)";

export function AppHeader(props: {
  coins: number;
  currentExperience: number;
  health: number;
  hidePlayerStatus?: boolean;
  level: number;
  mana: number;
  maxHealth: number;
  maxMana: number;
  modeValue: string;
  nextLevelExperience: number;
  rating: number;
  state: StudyState;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  stats: CharacterStats;
  useActiveSkill: (skillId: ActiveWarriorSkillId) => void;
}) {
  const [activeSection, setActiveSection] = useState<UserMenuSection | null>(null);
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap">
      <Group align="flex-start" gap="md" wrap="wrap">
        {!props.hidePlayerStatus && (
          <PlayerStatus
            coins={props.coins}
            currentExperience={props.currentExperience}
            health={props.health}
            level={props.level}
            mana={props.mana}
            maxHealth={props.maxHealth}
            maxMana={props.maxMana}
            nextLevelExperience={props.nextLevelExperience}
            onOpenStats={() => setActiveSection("stats")}
            rating={props.rating}
            state={props.state}
            stats={props.stats}
            useActiveSkill={props.useActiveSkill}
          />
        )}
        <TodayProgress />
      </Group>
      <Group>
        <HeroSiegeModeSwitch mode={props.modeValue} onChange={(mode) => props.setState((previous) => ({ ...previous, mode }))} />
        <UserMenu activeSection={activeSection} setActiveSection={setActiveSection} state={props.state} setState={props.setState} />
      </Group>
    </Group>
  );
}

function TodayProgress() {
  const { progress, settings } = useStudyBlockerSettings();
  const studiedMinutes = progress.studiedMs / STUDY_BLOCKER_MS_PER_MINUTE;
  const progressValue = settings.dailyMinutes > 0 ? (studiedMinutes / settings.dailyMinutes) * PROGRESS_MAX : PROGRESS_MAX;
  return (
    <Box p="sm" style={{ background: HERO_PANEL_BG, border: HERO_PANEL_BORDER, borderRadius: 2, boxShadow: HERO_PANEL_SHADOW, minWidth: TODAY_PROGRESS_WIDTH }}>
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={900} style={{ color: "#ffe8a8", textShadow: "0 1px 0 #000" }}>Today</Text>
        <Text size="sm" style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>{studiedMinutes.toFixed(MINUTES_DECIMAL_PLACES)} / {settings.dailyMinutes} min</Text>
      </Group>
      <Progress value={Math.min(PROGRESS_MAX, progressValue)} radius={0} style={{ background: HERO_PROGRESS_BG }} />
    </Box>
  );
}
