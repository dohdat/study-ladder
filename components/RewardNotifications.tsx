import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { IconHeart, IconSparkles, IconTrophy } from "@tabler/icons-react";

import { CoinIcon } from "./CoinIcon";
import { HeroSiegeRewardItemIcon } from "./HeroSiegeItemIcon";

const TOAST_TOP = 24;
const TOAST_RIGHT = 24;
const TOAST_Z_INDEX = 50;
const TOAST_MIN_WIDTH = 248;
const TOAST_RADIUS = 5;
const TOAST_SHADOW = "0 10px 24px rgba(0, 0, 0, 0.28)";
const TOAST_BG = "#20c997";
const HEALTH_TOAST_BG = "#e03131";
const ACHIEVEMENT_TOAST_BG = "#107c10";
const TOAST_ICON_SIZE = 18;
const TOAST_ICON_GAP = 5;

export type RewardNotification = {
  amount?: number;
  achievementTitle?: string;
  id: string;
  itemName?: string;
  kind: "achievement" | "gold" | "health" | "item";
};

export function RewardNotifications(props: { items: RewardNotification[] }) {
  if (props.items.length === 0) {
    return null;
  }

  return (
    <Stack
      gap="xs"
      align="flex-end"
      style={{ pointerEvents: "none", position: "fixed", right: TOAST_RIGHT, top: TOAST_TOP, zIndex: TOAST_Z_INDEX }}
    >
      {props.items.map((item) => (
        <RewardToast item={item} key={item.id} />
      ))}
    </Stack>
  );
}

function RewardToast(props: { item: RewardNotification }) {
  const isHealthLoss = props.item.kind === "health";
  const isAchievement = props.item.kind === "achievement";
  const label = getNotificationLabel(props.item.kind);
  const amount = props.item.amount ?? 1;
  return (
    <Paper
      px="md"
      py="xs"
      radius={TOAST_RADIUS}
      style={{ background: getToastBackground(props.item.kind), boxShadow: TOAST_SHADOW, color: "white", minWidth: TOAST_MIN_WIDTH }}
    >
      <Group gap="xs" justify="space-between" wrap="nowrap">
        <Text size="sm" fw={700}>{getToastText(props.item, isHealthLoss, label)}</Text>
        <Group gap={TOAST_ICON_GAP} wrap="nowrap">
          <RewardIcon kind={props.item.kind} />
          {isAchievement && <Text size="sm" fw={800}>+{amount}G</Text>}
          {props.item.kind !== "item" && !isAchievement && <Text size="sm" fw={800}>{isHealthLoss ? "-" : "+"} {amount}</Text>}
        </Group>
      </Group>
    </Paper>
  );
}

function getToastBackground(kind: RewardNotification["kind"]) {
  if (kind === "health") {
    return HEALTH_TOAST_BG;
  }
  if (kind === "achievement") {
    return ACHIEVEMENT_TOAST_BG;
  }
  return TOAST_BG;
}

function getToastText(item: RewardNotification, isHealthLoss: boolean, label: string) {
  if (item.kind === "achievement") {
    return `Achievement unlocked: ${item.achievementTitle}`;
  }
  return `You ${isHealthLoss ? "lost" : "gained"} ${item.kind === "item" ? item.itemName : `some ${label}`}`;
}

function getNotificationLabel(kind: RewardNotification["kind"]) {
  if (kind === "gold") {
    return "Gold";
  }
  if (kind === "health") {
    return "Health";
  }
  if (kind === "item") {
    return "Item";
  }
  return "Gold";
}

function RewardIcon(props: { kind: RewardNotification["kind"] }) {
  if (props.kind === "gold") {
    return <CoinIcon size={TOAST_ICON_SIZE} />;
  }
  if (props.kind === "health") {
    return (
      <Box c="red.1" style={{ alignItems: "center", display: "flex" }}>
        <IconHeart size={TOAST_ICON_SIZE} />
      </Box>
    );
  }
  if (props.kind === "item") {
    return <HeroSiegeRewardItemIcon size={TOAST_ICON_SIZE} />;
  }
  if (props.kind === "achievement") {
    return (
      <Box c="yellow.2" style={{ alignItems: "center", display: "flex" }}>
        <IconTrophy size={TOAST_ICON_SIZE} />
      </Box>
    );
  }

  return (
    <Box c="yellow.3" style={{ alignItems: "center", display: "flex" }}>
      <IconSparkles size={TOAST_ICON_SIZE} />
    </Box>
  );
}
