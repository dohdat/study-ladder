import { ActionIcon, Box, Group, Paper, Progress, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { IconBolt, IconDroplet, IconHeart, IconSparkles } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { ACTIVE_WARRIOR_SKILLS, canUseActiveWarriorSkill, getActiveWarriorSkill, getWarriorSkillRank } from "../lib/skillCore";
import type { ActiveWarriorSkillId, CharacterStats, StudyState } from "../types/study";
import { CoinIcon } from "./CoinIcon";

const PERCENT_MAX = 100;
const RATING_MAX = 3500;
const RED_RATING_MIN = 3000;
const ORANGE_RATING_MIN = 2400;
const YELLOW_RATING_MIN = 1800;
const BLUE_RATING_MIN = 1400;
const AVATAR_SIZE = 58;
const ACTIVE_SKILL_BUTTON_SIZE = 38;
const ACTIVE_SKILL_ICON_SIZE = 18;
const ACTIVE_SKILL_COST_ICON_SIZE = 11;
const ACTIVE_SKILL_COST_FONT_SIZE = "10px";
const ACTIVE_SKILL_GAP = 4;
const ACTIVE_SKILL_MIN_WIDTH = 42;
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
  rating: number;
  state: StudyState;
  stats: CharacterStats;
  useActiveSkill: (skillId: ActiveWarriorSkillId) => void;
}) {
  const healthValue = (props.health / props.maxHealth) * PERCENT_MAX;
  const experienceValue = (props.currentExperience / props.nextLevelExperience) * PERCENT_MAX;
  const manaValue = props.maxMana ? (props.mana / props.maxMana) * PERCENT_MAX : 0;
  const gear = GEAR_TIERS.find((tier) => props.level >= tier.minLevel) || GEAR_TIERS[GEAR_TIERS.length - 1];
  const ratingColor = getRatingColor(props.rating);

  return (
    <Paper
      withBorder
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
      <Group gap="xs" wrap="nowrap" align="center">
        <AvatarIllustration gear={gear} level={props.level} />
        <ActiveSkillBar state={props.state} useActiveSkill={props.useActiveSkill} />
      </Group>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" gap="xs" wrap="nowrap" mb={2}>
          <Box>
            <Text size="sm" fw={700} lh={1.1}>Dat Do</Text>
            <Text size="xs" c="gray.3">Level {props.level} Warrior</Text>
          </Box>
          <Box ta="right">
            <Group gap={5} wrap="nowrap" justify="flex-end">
              <CoinIcon size={18} />
              <Text size="sm" fw={700} lh={1}>{props.coins}</Text>
            </Group>
            <Text size="10px" c={`${ratingColor}.4`} fw={800} lh={1.2}>Rating {props.rating}</Text>
          </Box>
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

function ActiveSkillBar(props: { state: StudyState; useActiveSkill: (skillId: ActiveWarriorSkillId) => void }) {
  const visibleSkills = ACTIVE_WARRIOR_SKILLS.filter((skill) => getWarriorSkillRank(props.state.profile.skillRanks, skill.id) > 0);
  const activeSkill = getActiveWarriorSkill(props.state.profile.activeSkill);
  if (!visibleSkills.length) {
    return null;
  }
  return (
    <Stack gap={ACTIVE_SKILL_GAP} onClick={(event) => event.stopPropagation()}>
      {visibleSkills.map((skill) => {
        const isReadied = activeSkill?.id === skill.id;
        const disabled = !isReadied && !canUseActiveWarriorSkill(props.state, skill.id);
        return (
          <Tooltip key={skill.id} label={isReadied ? `${skill.name} is readied.` : `${skill.description} Costs ${skill.cost} mana${skill.healthCost ? ` and ${skill.healthCost} health` : ""}.`} withArrow>
            <Box style={{ minWidth: ACTIVE_SKILL_MIN_WIDTH }}>
              <ActionIcon
                aria-label={skill.name}
                color={isReadied ? "yellow" : "blue"}
                disabled={disabled}
                onClick={() => props.useActiveSkill(skill.id)}
                size={ACTIVE_SKILL_BUTTON_SIZE}
                variant={isReadied ? "filled" : "default"}
              >
                <ActiveSkillIcon skillId={skill.id} />
              </ActionIcon>
              <Group gap={2} justify="center" mt={1} wrap="nowrap">
                <IconDroplet size={ACTIVE_SKILL_COST_ICON_SIZE} color="#4dabf7" />
                <Text size={ACTIVE_SKILL_COST_FONT_SIZE} c="blue.2" fw={800}>{skill.cost}</Text>
              </Group>
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

function ActiveSkillIcon(props: { skillId: ActiveWarriorSkillId }) {
  const paths: Record<ActiveWarriorSkillId, ReactNode> = {
    bloodForBlood: <IconHeart size={ACTIVE_SKILL_ICON_SIZE} />,
    cleave: <Text size="xs" fw={900}>x2</Text>,
    execute: <Text size="xs" fw={900}>!</Text>,
    powerStrike: <IconBolt size={ACTIVE_SKILL_ICON_SIZE} />,
    sureCrit: <IconSparkles size={ACTIVE_SKILL_ICON_SIZE} />,
    tripleStrike: <Text size="xs" fw={900}>x3</Text>,
    whirlwindAssault: <Text size="xs" fw={900}>x5</Text>
  };
  return paths[props.skillId];
}

function getRatingColor(rating: number) {
  if (rating >= RATING_MAX) {
    return "grape";
  }
  if (rating >= RED_RATING_MIN) {
    return "red";
  }
  if (rating >= ORANGE_RATING_MIN) {
    return "orange";
  }
  if (rating >= YELLOW_RATING_MIN) {
    return "yellow";
  }
  if (rating >= BLUE_RATING_MIN) {
    return "blue";
  }
  return "green";
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
