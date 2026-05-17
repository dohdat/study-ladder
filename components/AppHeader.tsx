import { useState } from "react";
import { Box, Group, Progress, SegmentedControl, Text } from "@mantine/core";

import { PlayerStatus } from "./PlayerStatus";
import { UserMenu } from "./UserMenu";
import type { UserMenuSection } from "./UserMenu";
import { STUDY_BLOCKER_MS_PER_MINUTE, useStudyBlockerSettings } from "../hooks/useStudyBlocker";
import type { CharacterStats, StudyState } from "../types/study";

const PROGRESS_MAX = 100;
const MINUTES_DECIMAL_PLACES = 1;
const TODAY_PROGRESS_WIDTH = 360;

export function AppHeader(props: {
  coins: number;
  currentExperience: number;
  health: number;
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
}) {
  const [activeSection, setActiveSection] = useState<UserMenuSection | null>(null);
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap">
      <Group align="flex-start" gap="md" wrap="wrap">
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
          stats={props.stats}
        />
        <TodayProgress />
      </Group>
      <Group>
        <SegmentedControl
          value={props.modeValue}
          onChange={(value) => props.setState((previous) => ({ ...previous, mode: value as StudyState["mode"] }))}
          data={[{ label: "LeetCode", value: "leetcode" }, { label: "System Design", value: "system" }]}
        />
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
    <Box p="sm" style={{ background: "var(--mantine-color-dark-6)", border: "1px solid var(--mantine-color-dark-4)", borderRadius: 6, minWidth: TODAY_PROGRESS_WIDTH }}>
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={700}>Today</Text>
        <Text size="sm">{studiedMinutes.toFixed(MINUTES_DECIMAL_PLACES)} / {settings.dailyMinutes} min</Text>
      </Group>
      <Progress value={Math.min(PROGRESS_MAX, progressValue)} />
    </Box>
  );
}
