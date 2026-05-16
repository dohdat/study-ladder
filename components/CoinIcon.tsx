import { Box, Group, Text, Title } from "@mantine/core";

const DEFAULT_COIN_SIZE = 34;
const COIN_BORDER_WIDTH = 3;
const COIN_MARK_SCALE = 0.58;
const COIN_MARK_WEIGHT = 900;
const COIN_SHADOW = "inset -5px -8px 0 rgba(156, 58, 0, 0.22), inset 8px 7px 0 rgba(255, 255, 255, 0.28)";
const COIN_GRADIENT = "radial-gradient(circle at 34% 24%, #fff866 0%, #ffe239 28%, #ffb703 60%, #d76500 100%)";

export function CoinIcon(props: { size?: number }) {
  const size = props.size || DEFAULT_COIN_SIZE;
  return (
    <Box
      aria-hidden="true"
      style={{
        alignItems: "center",
        background: COIN_GRADIENT,
        border: `${COIN_BORDER_WIDTH}px solid #b94700`,
        borderRadius: "50%",
        boxShadow: COIN_SHADOW,
        display: "inline-flex",
        height: size,
        justifyContent: "center",
        width: size
      }}
    >
      <Text c="#fff45a" fw={COIN_MARK_WEIGHT} lh={1} style={{ fontSize: size * COIN_MARK_SCALE, textShadow: "0 2px 0 #c46600" }}>
        $
      </Text>
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
