import { Box } from "@mantine/core";

import type { Relic } from "../types/study";

const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const GRID = 12;
const DEFAULT_RELIC_ICON_SIZE = 36;
const VARIANT_COUNT = 4;
const FLAME_VARIANT = 1;
const SKULL_VARIANT = 2;
const VIEWBOX = `0 0 ${GRID} ${GRID}`;

const RARITY_COLORS = {
  blight: ["#23111d", "#f472b6", "#fef2f2"],
  boss: ["#24130b", "#f59e0b", "#fff7ed"],
  common: ["#101820", "#94a3b8", "#f8fafc"],
  event: ["#1d1630", "#c084fc", "#faf5ff"],
  rare: ["#0c1b2a", "#38bdf8", "#f0f9ff"],
  shop: ["#221a08", "#facc15", "#fef9c3"],
  special: ["#111827", "#f9fafb", "#a78bfa"],
  starter: ["#2a100c", "#fb7185", "#fff1f2"],
  uncommon: ["#0b2113", "#4ade80", "#f0fdf4"]
} as const;

export function RelicIcon(props: { relic: Relic; size?: number }) {
  const size = props.size || DEFAULT_RELIC_ICON_SIZE;
  const colors = RARITY_COLORS[props.relic.rarity];
  const variant = getVariant(props.relic.id);
  return (
    <Box aria-hidden="true" style={{ height: size, width: size }}>
      <svg viewBox={VIEWBOX} width={size} height={size} shapeRendering="crispEdges">
        <RelicPixels colors={colors} variant={variant} />
      </svg>
    </Box>
  );
}

function RelicPixels(props: { colors: readonly [string, string, string]; variant: number }) {
  const variant = props.variant % VARIANT_COUNT;
  if (variant === 0) {
    return <GemRelic colors={props.colors} />;
  }
  if (variant === FLAME_VARIANT) {
    return <FlameRelic colors={props.colors} />;
  }
  if (variant === SKULL_VARIANT) {
    return <SkullRelic colors={props.colors} />;
  }
  return <CharmRelic colors={props.colors} />;
}

function GemRelic(props: { colors: readonly [string, string, string] }) {
  return (
    <>
      <rect x="4" y="1" width="4" height="1" fill={props.colors[2]} />
      <rect x="2" y="2" width="8" height="2" fill={props.colors[1]} />
      <rect x="3" y="4" width="6" height="3" fill={props.colors[1]} />
      <rect x="4" y="7" width="4" height="2" fill={props.colors[0]} />
      <rect x="5" y="2" width="2" height="5" fill={props.colors[2]} />
    </>
  );
}

function FlameRelic(props: { colors: readonly [string, string, string] }) {
  return (
    <>
      <rect x="5" y="1" width="2" height="2" fill={props.colors[2]} />
      <rect x="4" y="3" width="4" height="2" fill={props.colors[1]} />
      <rect x="3" y="5" width="6" height="4" fill={props.colors[1]} />
      <rect x="2" y="7" width="8" height="3" fill={props.colors[0]} />
      <rect x="5" y="5" width="2" height="4" fill={props.colors[2]} />
    </>
  );
}

function SkullRelic(props: { colors: readonly [string, string, string] }) {
  return (
    <>
      <rect x="3" y="2" width="6" height="5" fill={props.colors[1]} />
      <rect x="4" y="1" width="4" height="1" fill={props.colors[2]} />
      <rect x="4" y="4" width="1" height="1" fill={props.colors[0]} />
      <rect x="7" y="4" width="1" height="1" fill={props.colors[0]} />
      <rect x="5" y="7" width="2" height="2" fill={props.colors[1]} />
      <rect x="4" y="9" width="4" height="1" fill={props.colors[0]} />
    </>
  );
}

function CharmRelic(props: { colors: readonly [string, string, string] }) {
  return (
    <>
      <rect x="5" y="1" width="2" height="2" fill={props.colors[2]} />
      <rect x="4" y="3" width="4" height="2" fill={props.colors[1]} />
      <rect x="3" y="5" width="6" height="4" fill={props.colors[1]} />
      <rect x="4" y="9" width="4" height="1" fill={props.colors[0]} />
      <rect x="6" y="5" width="2" height="3" fill={props.colors[2]} />
    </>
  );
}

function getVariant(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return hash >>> 0;
}
