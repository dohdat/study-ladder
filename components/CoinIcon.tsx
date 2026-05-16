import { Box, Group, Text, Title } from "@mantine/core";

const DEFAULT_COIN_SIZE = 34;
const COIN_BORDER_WIDTH = 2;
const COIN_INNER_BORDER_WIDTH = 1;
const COIN_INNER_SCALE = 0.72;
const COIN_MARK_SCALE = 0.48;
const COIN_MARK_WEIGHT = 900;
const COIN_SHADOW = "inset 0 -3px 0 rgba(167, 88, 0, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.42)";
const COIN_GRADIENT = "linear-gradient(180deg, #ffd75a 0%, #f7b731 58%, #d99018 100%)";
const COIN_INNER_BORDER = "#ffe8a3";
const COIN_BORDER = "#b46b12";
const COIN_TEXT = "#fff3bd";
const COIN_TEXT_SHADOW = "0 1px 0 #8f560d";

export function CoinIcon(props: { size?: number }) {
  const size = props.size || DEFAULT_COIN_SIZE;
  return (
    <Box
      aria-hidden="true"
      style={{
        alignItems: "center",
        background: COIN_GRADIENT,
        border: `${COIN_BORDER_WIDTH}px solid ${COIN_BORDER}`,
        borderRadius: "50%",
        boxShadow: COIN_SHADOW,
        display: "inline-flex",
        height: size,
        justifyContent: "center",
        width: size
      }}
    >
      <Box
        style={{
          alignItems: "center",
          border: `${COIN_INNER_BORDER_WIDTH}px solid ${COIN_INNER_BORDER}`,
          borderRadius: "50%",
          display: "inline-flex",
          height: size * COIN_INNER_SCALE,
          justifyContent: "center",
          width: size * COIN_INNER_SCALE
        }}
      >
        <Text c={COIN_TEXT} fw={COIN_MARK_WEIGHT} lh={1} style={{ fontSize: size * COIN_MARK_SCALE, textShadow: COIN_TEXT_SHADOW }}>
          H
        </Text>
      </Box>
    </Box>
  );
}

export function CoinAmount(props: { value: number }) {
  return (
    <Group gap="xs" align="center">
      <CoinIcon />
      <Title order={3}>{props.value}</Title>
    </Group>
  );
}
