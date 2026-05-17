import { Box, Badge, Group, Progress, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";

import { ACHIEVEMENT_TOTAL, getAchievements } from "../lib/achievementCore";
import type { Achievement } from "../lib/achievementCore";
import { getAchievementPixelArt } from "../lib/achievementPixelArt";
import type { StudyState } from "../types/study";

const PROGRESS_MAX = 100;
const CARD_RADIUS = 6;
const BADGE_SIZE = 46;
const BADGE_SHADOW_SIZE = 2;
const BADGE_BORDER_SIZE = 1;
const SPRITE_PIXEL_SIZE = 3;
const SPRITE_GRID_SIZE = 10;
const CARD_MIN_HEIGHT = 110;
const CARD_PADDING = "sm";
const LOCKED_OPACITY = 0.58;
const UNLOCKED_OPACITY = 1;
const CARD_BG_UNLOCKED = "linear-gradient(145deg, #23211d, #12110f)";
const CARD_BG_LOCKED = "linear-gradient(145deg, #1f1f1f, #101010)";
const CARD_BORDER_UNLOCKED = "1px solid #8b7448";
const CARD_BORDER_LOCKED = "1px solid #3a3a3a";
const LOCKED_BADGE_COLOR = "#555";
const EMPTY_PIXEL_COLOR = "transparent";
const PIXEL_COLOR_KEYS = {
  A: 2,
  L: 2,
  M: 1,
  O: 0
} as const;

export function AchievementsPanel(props: { state: StudyState }) {
  const achievements = getAchievements(props.state);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  return (
    <Stack gap="md">
      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={800}>Achievements</Text>
          <Text size="sm" c="dimmed">{unlockedCount}/{ACHIEVEMENT_TOTAL}</Text>
        </Group>
        <Progress value={(unlockedCount / ACHIEVEMENT_TOTAL) * PROGRESS_MAX} color="yellow" />
      </Box>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function AchievementCard(props: { achievement: Achievement }) {
  const progressValue = Math.min(PROGRESS_MAX, (props.achievement.current / props.achievement.target) * PROGRESS_MAX);
  return (
    <Box p={CARD_PADDING} mih={CARD_MIN_HEIGHT} style={{ background: getCardBg(props.achievement.unlocked), border: getCardBorder(props.achievement.unlocked), borderRadius: CARD_RADIUS, opacity: getCardOpacity(props.achievement.unlocked) }}>
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <AchievementBadge achievement={props.achievement} />
        <Box flex={1}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text size="sm" fw={800} lineClamp={1}>{props.achievement.title}</Text>
            <Badge size="xs" color={props.achievement.unlocked ? "green" : "gray"} variant="light">
              {props.achievement.unlocked ? "Unlocked" : "Locked"}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{props.achievement.description}</Text>
          <Group justify="space-between" mt="xs" mb={3}>
            <Text size="10px" c="dimmed" fw={700}>Progress</Text>
            <Text size="10px" c="dimmed" fw={700}>{props.achievement.current}/{props.achievement.target}</Text>
          </Group>
          <Progress value={progressValue} size="xs" color={props.achievement.unlocked ? "yellow" : "gray"} />
        </Box>
      </Group>
    </Box>
  );
}

function AchievementBadge(props: { achievement: Achievement }) {
  const colors = props.achievement.unlocked ? props.achievement.colors : [LOCKED_BADGE_COLOR, "#2d2d2d", "#777"] as [string, string, string];
  const pixels = getAchievementPixelArt(props.achievement).join("");
  return (
    <Tooltip label={props.achievement.title} withArrow withinPortal={false}>
      <Box
        aria-label={`${props.achievement.title} badge`}
        style={{
          alignItems: "center",
          background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})`,
          border: `${BADGE_BORDER_SIZE}px solid ${colors[2]}`,
          boxShadow: `0 0 0 ${BADGE_SHADOW_SIZE}px #050505, inset 0 0 0 ${BADGE_BORDER_SIZE}px rgba(255, 255, 255, 0.16)`,
          display: "flex",
          flex: `0 0 ${BADGE_SIZE}px`,
          height: BADGE_SIZE,
          justifyContent: "center",
          width: BADGE_SIZE
        }}
      >
        <Box
          style={{
            background: "rgba(0, 0, 0, 0.34)",
            border: `${BADGE_BORDER_SIZE}px solid rgba(255, 255, 255, 0.18)`,
            display: "grid",
            gridTemplateColumns: `repeat(${SPRITE_GRID_SIZE}, ${SPRITE_PIXEL_SIZE}px)`,
            height: SPRITE_GRID_SIZE * SPRITE_PIXEL_SIZE,
            width: SPRITE_GRID_SIZE * SPRITE_PIXEL_SIZE
          }}
        >
          {pixels.split("").map((pixel, index) => (
            <Box
              key={`${props.achievement.id}-${index}`}
              style={{
                backgroundColor: getPixelColor(pixel, colors),
                height: SPRITE_PIXEL_SIZE,
                width: SPRITE_PIXEL_SIZE
              }}
            />
          ))}
        </Box>
      </Box>
    </Tooltip>
  );
}

function getPixelColor(pixel: string, colors: [string, string, string]) {
  if (pixel === ".") {
    return EMPTY_PIXEL_COLOR;
  }
  return colors[PIXEL_COLOR_KEYS[pixel as keyof typeof PIXEL_COLOR_KEYS]];
}

function getCardBg(unlocked: boolean) {
  return unlocked ? CARD_BG_UNLOCKED : CARD_BG_LOCKED;
}

function getCardBorder(unlocked: boolean) {
  return unlocked ? CARD_BORDER_UNLOCKED : CARD_BORDER_LOCKED;
}

function getCardOpacity(unlocked: boolean) {
  return unlocked ? UNLOCKED_OPACITY : LOCKED_OPACITY;
}
