import { Group, SegmentedControl } from "@mantine/core";

import { PlayerStatus } from "./PlayerStatus";
import { UserMenu } from "./UserMenu";
import type { CharacterStats, StudyState } from "../types/study";

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
  state: StudyState;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  stats: CharacterStats;
}) {
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
          stats={props.stats}
        />
      </Group>
      <Group>
        <SegmentedControl
          value={props.modeValue}
          onChange={(value) => props.setState((previous) => ({ ...previous, mode: value as StudyState["mode"] }))}
          data={[{ label: "LeetCode", value: "leetcode" }, { label: "System Design", value: "system" }]}
        />
        <UserMenu state={props.state} setState={props.setState} />
      </Group>
    </Group>
  );
}
