import { Box, Group, Progress, Stack, Text, Tooltip } from "@mantine/core";
import { IconTargetArrow, IconTrophy } from "@tabler/icons-react";

import { ACHIEVEMENT_TOTAL, getAchievementTrackerSummary, getTrackedAchievements } from "../lib/achievementCore";
import type { Achievement } from "../lib/achievementCore";
import type { StudyState } from "../types/study";

const STRIP_BG = "linear-gradient(180deg, rgba(11, 34, 14, 0.96), rgba(5, 10, 6, 0.98))";
const STRIP_BORDER = "1px solid rgba(126, 231, 135, 0.38)";
const STRIP_SHADOW = "inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 18px rgba(0, 0, 0, 0.3)";
const TRACKED_BG = "rgba(126, 231, 135, 0.08)";
const TRACKED_BORDER = "1px solid rgba(126, 231, 135, 0.22)";
const COUNT_PILL_BG = "linear-gradient(180deg, #2cc853, #0d7b2c)";
const COUNT_PILL_SHADOW = "inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 rgba(0, 0, 0, 0.28)";
const STRIP_RADIUS = 4;
const COUNT_PILL_MIN_WIDTH = 82;
const TRACKED_MIN_WIDTH = 108;
const TRACKED_MAX_WIDTH = 146;
const EMPTY_MIN_WIDTH = 152;
const ICON_SIZE = 16;

export function AchievementTrackerStrip(props: { onOpenAchievements?: () => void; state: StudyState }) {
  const summary = getAchievementTrackerSummary(props.state);
  const tracked = getTrackedAchievements(props.state);
  return (
    <Box
      role={props.onOpenAchievements ? "button" : undefined}
      tabIndex={props.onOpenAchievements ? 0 : undefined}
      onClick={props.onOpenAchievements}
      onKeyDown={(event) => {
        if (props.onOpenAchievements && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          props.onOpenAchievements();
        }
      }}
      style={{
        background: STRIP_BG,
        border: STRIP_BORDER,
        borderRadius: STRIP_RADIUS,
        boxShadow: STRIP_SHADOW,
        cursor: props.onOpenAchievements ? "pointer" : "default",
        maxWidth: "100%",
        padding: "8px 10px"
      }}
    >
      <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
        <AchievementCountPill unlocked={summary.totalUnlocked} />
        {tracked.length > 0 ? tracked.map((achievement) => <TrackedAchievement key={achievement.id} achievement={achievement} />) : <EmptyTrackedState />}
      </Group>
    </Box>
  );
}

function AchievementCountPill(props: { unlocked: number }) {
  return (
    <Box
      style={{
        alignItems: "center",
        background: COUNT_PILL_BG,
        borderRadius: 999,
        boxShadow: COUNT_PILL_SHADOW,
        color: "#ffffff",
        display: "inline-flex",
        flex: "0 0 auto",
        gap: 6,
        justifyContent: "center",
        minHeight: 32,
        minWidth: COUNT_PILL_MIN_WIDTH,
        padding: "0 12px",
        whiteSpace: "nowrap"
      }}
    >
      <IconTrophy size={ICON_SIZE} />
      <Text span size="sm" fw={900} lh={1}>{props.unlocked}/{ACHIEVEMENT_TOTAL}</Text>
    </Box>
  );
}

function TrackedAchievement(props: { achievement: Achievement }) {
  return (
    <Tooltip label={<AchievementTooltip achievement={props.achievement} />} multiline withArrow withinPortal={false}>
      <Box
        style={{
          background: TRACKED_BG,
          border: TRACKED_BORDER,
          borderRadius: STRIP_RADIUS,
          flex: `0 1 ${TRACKED_MAX_WIDTH}px`,
          minWidth: TRACKED_MIN_WIDTH,
          overflow: "hidden",
          padding: "4px 6px"
        }}
      >
        <Group gap={4} justify="space-between" wrap="nowrap" mb={3}>
          <Text size="10px" fw={900} c="green.1" lineClamp={1}>{props.achievement.title}</Text>
          <Text size="10px" fw={900} c={props.achievement.unlocked ? "green.2" : "gray.4"}>{props.achievement.progressPercent}%</Text>
        </Group>
        <Progress value={props.achievement.progressPercent} color={props.achievement.unlocked ? "green" : "gray"} size={4} />
      </Box>
    </Tooltip>
  );
}

function AchievementTooltip(props: { achievement: Achievement }) {
  return (
    <Stack gap={3}>
      <Text size="sm" fw={900}>{props.achievement.title}</Text>
      <Text size="xs">{props.achievement.description}</Text>
      <Text size="xs" fw={800} c={props.achievement.unlocked ? "green.3" : "gray.3"}>
        Progress: {props.achievement.current}/{props.achievement.target}
      </Text>
    </Stack>
  );
}

function EmptyTrackedState() {
  return (
    <Group gap={4} wrap="nowrap" style={{ minWidth: EMPTY_MIN_WIDTH }}>
      <IconTargetArrow size={ICON_SIZE} color="#7ee787" />
      <Text size="xs" fw={800} c="green.1">Pick up to 5 to track</Text>
    </Group>
  );
}
