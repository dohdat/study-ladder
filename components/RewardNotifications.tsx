import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

import { CoinIcon } from "./CoinIcon";

const TOAST_TOP = 24;
const TOAST_RIGHT = 24;
const TOAST_Z_INDEX = 50;
const TOAST_MIN_WIDTH = 248;
const TOAST_RADIUS = 5;
const TOAST_SHADOW = "0 10px 24px rgba(0, 0, 0, 0.28)";
const TOAST_BG = "#20c997";
const TOAST_ICON_SIZE = 18;

export type RewardNotification = {
  amount: number;
  id: string;
  kind: "gold" | "experience";
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
  const label = props.item.kind === "gold" ? "Gold" : "Experience";
  return (
    <Paper
      px="md"
      py="xs"
      radius={TOAST_RADIUS}
      style={{ background: TOAST_BG, boxShadow: TOAST_SHADOW, color: "white", minWidth: TOAST_MIN_WIDTH }}
    >
      <Group gap="xs" justify="space-between" wrap="nowrap">
        <Text size="sm" fw={700}>You gained some {label}</Text>
        <Group gap={5} wrap="nowrap">
          <RewardIcon kind={props.item.kind} />
          <Text size="sm" fw={800}>+ {props.item.amount}</Text>
        </Group>
      </Group>
    </Paper>
  );
}

function RewardIcon(props: { kind: RewardNotification["kind"] }) {
  if (props.kind === "gold") {
    return <CoinIcon size={TOAST_ICON_SIZE} />;
  }

  return (
    <Box c="yellow.3" style={{ alignItems: "center", display: "flex" }}>
      <IconSparkles size={TOAST_ICON_SIZE} />
    </Box>
  );
}
