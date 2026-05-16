import { Box, Group, Paper, Progress, SimpleGrid, Text } from "@mantine/core";
import { IconBolt, IconHeart, IconSparkles } from "@tabler/icons-react";
import type { ReactNode } from "react";

import type { CharacterStats } from "../types/study";
import { CoinIcon } from "./CoinIcon";

const PERCENT_MAX = 100;
const AVATAR_SIZE = 58;
const SPRITE_SIZE = 16;
const BRONZE_GEAR_LEVEL = 3;
const STEEL_GEAR_LEVEL = 5;
const LEGENDARY_GEAR_LEVEL = 10;
const GEAR_TIERS = [
  { minLevel: LEGENDARY_GEAR_LEVEL, armor: "#3bc9db", trim: "#ffd43b", weapon: "#e9ecef", cape: "#d6336c", gem: "#91a7ff" },
  { minLevel: STEEL_GEAR_LEVEL, armor: "#748ffc", trim: "#ffd43b", weapon: "#ced4da", cape: "#7048e8", gem: "#74c0fc" },
  { minLevel: BRONZE_GEAR_LEVEL, armor: "#f08c00", trim: "#ffe066", weapon: "#adb5bd", cape: "#5c7cfa", gem: "#ffd43b" },
  { minLevel: 1, armor: "#4dabf7", trim: "#a5d8ff", weapon: "#868e96", cape: "transparent", gem: "#dee2e6" }
];

export function PlayerStatus(props: {
  coins: number;
  currentExperience: number;
  health: number;
  level: number;
  mana: number;
  maxHealth: number;
  maxMana: number;
  nextLevelExperience: number;
  onOpenStats?: () => void;
  stats: CharacterStats;
}) {
  const healthValue = (props.health / props.maxHealth) * PERCENT_MAX;
  const experienceValue = (props.currentExperience / props.nextLevelExperience) * PERCENT_MAX;
  const manaValue = props.maxMana ? (props.mana / props.maxMana) * PERCENT_MAX : 0;
  const gear = GEAR_TIERS.find((tier) => props.level >= tier.minLevel) || GEAR_TIERS[GEAR_TIERS.length - 1];

  return (
    <Paper
      withBorder
      component="button"
      type="button"
      onClick={props.onOpenStats}
      p="xs"
      style={{
        alignItems: "center",
        background: "var(--mantine-color-dark-6)",
        color: "inherit",
        cursor: props.onOpenStats ? "pointer" : "default",
        display: "flex",
        gap: 12,
        minWidth: 360,
        textAlign: "left"
        }}
    >
      <AvatarIllustration gear={gear} level={props.level} />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" gap="xs" wrap="nowrap" mb={2}>
          <Box>
            <Text size="sm" fw={700} lh={1.1}>Dat Do</Text>
            <Text size="xs" c="gray.3">Level {props.level} Warrior</Text>
          </Box>
          <Group gap={5} wrap="nowrap">
            <CoinIcon size={18} />
            <Text size="sm" fw={700} lh={1}>{props.coins}</Text>
          </Group>
        </Group>
        <StatBar color="red" icon={<IconHeart size={14} />} value={healthValue} text={`${props.health} / ${props.maxHealth}`} />
        <StatBar color="blue" icon={<IconBolt size={14} />} value={manaValue} text={`${props.mana} / ${props.maxMana}`} />
        <StatBar color="yellow" icon={<IconSparkles size={14} />} value={experienceValue} text={`${props.currentExperience} / ${props.nextLevelExperience}`} />
        <SimpleGrid cols={4} spacing={4} mt={4}>
          <MiniStat label="STR" value={props.stats.strength} />
          <MiniStat label="CON" value={props.stats.constitution} />
          <MiniStat label="PER" value={props.stats.perception} />
          <MiniStat label="INT" value={props.stats.intelligence} />
        </SimpleGrid>
      </Box>
    </Paper>
  );
}

function AvatarIllustration(props: { gear: (typeof GEAR_TIERS)[number]; level: number }) {
  const hasHelm = props.level >= BRONZE_GEAR_LEVEL;
  const hasGem = props.level >= STEEL_GEAR_LEVEL;
  const hasCrown = props.level >= LEGENDARY_GEAR_LEVEL;
  const colors = getAvatarColors(props.gear, { hasCrown, hasGem, hasHelm });

  return (
    <Box
      aria-hidden="true"
      style={{
        background: "linear-gradient(180deg, #b9a6ee 0%, #9b85df 100%)",
        border: "2px solid var(--mantine-color-dark-3)",
        height: AVATAR_SIZE,
        width: AVATAR_SIZE
      }}
    >
      <svg viewBox={`0 0 ${SPRITE_SIZE} ${SPRITE_SIZE}`} width={AVATAR_SIZE} height={AVATAR_SIZE} shapeRendering="crispEdges">
        {AVATAR_SPRITE.map((row, y) =>
          [...row].map((key, x) => {
            const fill = colors[key];
            return fill ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} /> : null;
          })
        )}
      </svg>
    </Box>
  );
}

function getAvatarColors(gear: (typeof GEAR_TIERS)[number], flags: { hasCrown: boolean; hasGem: boolean; hasHelm: boolean }) {
  const colors: Record<string, string | undefined> = {
    a: gear.armor,
    b: "#7e5bef",
    c: gear.cape,
    e: "#2b1a12",
    f: "#f1c27d",
    g: flags.hasGem ? gear.gem : gear.trim,
    h: flags.hasHelm ? gear.trim : "#5c3b21",
    k: "#2b1a12",
    p: "#6f42c1",
    q: "#231134",
    r: flags.hasCrown ? "#ffd43b" : undefined,
    s: "#8d5524",
    t: gear.trim,
    w: gear.weapon
  };
  return colors;
}

const AVATAR_SPRITE = [
  ".......r........",
  "..w...rhr.......",
  ".w...khhhk......",
  ".w..kffffk......",
  "..w.kfefek......",
  "..w.kffffk..q...",
  "...kctgtck.qqq..",
  "...kttattkqqpqq.",
  "..kttaaattkpppq.",
  "..kttaaattkppq..",
  "...kaaakk..q....",
  "...kakkak.......",
  "..kk....kk......",
  ".kk......kk.....",
  ".....bbbb.......",
  "....bbbbbb......"
];

function StatBar(props: { color: string; icon: ReactNode; text: string; value: number }) {
  return (
    <Group gap="xs" wrap="nowrap" mb={4}>
      <Box c={`${props.color}.4`} style={{ alignItems: "center", display: "flex", width: 18 }}>
        {props.icon}
      </Box>
      <Progress color={props.color} value={props.value} size="sm" radius={0} style={{ flex: 1, minWidth: 120 }} />
      <Text size="xs" c="gray.1" ta="right" style={{ minWidth: 48 }}>{props.text}</Text>
    </Group>
  );
}

function MiniStat(props: { label: string; value: number }) {
  return (
    <Group gap={4} justify="center" wrap="nowrap" style={{ background: "var(--mantine-color-dark-7)", borderRadius: 4, padding: "2px 4px" }}>
      <Text size="10px" c="dimmed" fw={700}>{props.label}</Text>
      <Text size="10px" c="gray.1" fw={800}>{props.value}</Text>
    </Group>
  );
}
