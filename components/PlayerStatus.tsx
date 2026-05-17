import { ActionIcon, Box, Group, Paper, Progress, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { IconDroplet } from "@tabler/icons-react";
import type { StaticImageData } from "next/image";

import healthShrineArt from "../assets/hero_siege_map/health-shrine.png";
import chestArt from "../assets/hero_siege_map/chest.png";
import fieldTorchArt from "../assets/hero_siege_map/field-torch.png";
import warriorAvatarArt from "../assets/hero_siege_monsters/samurai-skeleton.png";
import { ACTIVE_WARRIOR_SKILLS, canUseActiveWarriorSkill, getActiveWarriorSkill, getWarriorSkillRank } from "../lib/skillCore";
import type { ActiveWarriorSkillId, CharacterStats, StudyState } from "../types/study";
import { CoinIcon } from "./CoinIcon";
import { HeroSiegeSkillIcon } from "./HeroSiegeSkillIcon";

const PERCENT_MAX = 100;
const RATING_MAX = 3500;
const RED_RATING_MIN = 3000;
const ORANGE_RATING_MIN = 2400;
const YELLOW_RATING_MIN = 1800;
const BLUE_RATING_MIN = 1400;
const AVATAR_SIZE = 58;
const AVATAR_ART_SIZE = 50;
const ACTIVE_SKILL_BUTTON_SIZE = 38;
const ACTIVE_SKILL_ICON_SIZE = 30;
const ACTIVE_SKILL_COST_ICON_SIZE = 11;
const ACTIVE_SKILL_COST_FONT_SIZE = "10px";
const ACTIVE_SKILL_GAP = 4;
const ACTIVE_SKILL_MIN_WIDTH = 42;
const RESOURCE_ICON_SIZE = 19;
const RESOURCE_ICON_FRAME_SIZE = 23;
const PLAYER_PANEL_BG = "linear-gradient(180deg, rgba(51, 43, 32, 0.98) 0%, rgba(29, 24, 18, 0.98) 56%, rgba(15, 13, 10, 0.99) 100%)";
const PLAYER_PANEL_BORDER = "1px solid rgba(223, 195, 122, 0.56)";
const PLAYER_PANEL_SHADOW = "inset 0 0 0 1px rgba(0, 0, 0, 0.78), 0 10px 26px rgba(0, 0, 0, 0.36)";
const HERO_GOLD = "#f1dfad";
const HERO_DIM = "#bca982";

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
  const ratingColor = getRatingColor(props.rating);

  return (
    <Paper
      withBorder
      onClick={props.onOpenStats}
      p="xs"
      style={{
        alignItems: "center",
        background: PLAYER_PANEL_BG,
        border: PLAYER_PANEL_BORDER,
        borderRadius: 4,
        boxShadow: PLAYER_PANEL_SHADOW,
        color: "inherit",
        cursor: props.onOpenStats ? "pointer" : "default",
        display: "flex",
        gap: 12,
        minWidth: 360,
        overflow: "hidden",
        position: "relative",
        textAlign: "left"
        }}
    >
      <Group gap="xs" wrap="nowrap" align="center">
        <AvatarIllustration />
        <ActiveSkillBar state={props.state} useActiveSkill={props.useActiveSkill} />
      </Group>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" gap="xs" wrap="nowrap" mb={2}>
          <Box>
            <Text size="sm" fw={900} lh={1.1} style={{ color: HERO_GOLD, textShadow: "0 1px 0 #000" }}>Dat Do</Text>
            <Text size="xs" fw={700} style={{ color: HERO_DIM, textShadow: "0 1px 0 #000" }}>Level {props.level} Warrior</Text>
          </Box>
          <Box ta="right">
            <Group gap={5} wrap="nowrap" justify="flex-end">
              <CoinIcon size={18} />
              <Text size="sm" fw={700} lh={1}>{props.coins}</Text>
            </Group>
            <Text size="10px" c={`${ratingColor}.4`} fw={800} lh={1.2}>Rating {props.rating}</Text>
          </Box>
        </Group>
        <StatBar asset={healthShrineArt} color="red" value={healthValue} text={`${props.health} / ${props.maxHealth}`} />
        <StatBar asset={fieldTorchArt} color="blue" value={manaValue} text={`${props.mana} / ${props.maxMana}`} />
        <StatBar asset={chestArt} color="yellow" value={experienceValue} text={`${props.currentExperience} / ${props.nextLevelExperience}`} />
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
                styles={{
                  root: {
                    background: isReadied ? "linear-gradient(180deg, #8a5d1b 0%, #41240f 58%, #160c06 100%)" : "linear-gradient(180deg, #263b43 0%, #142229 58%, #090e12 100%)",
                    border: isReadied ? "1px solid rgba(241, 223, 173, 0.86)" : "1px solid rgba(119, 170, 196, 0.5)",
                    borderRadius: 2,
                    boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.68)"
                  }
                }}
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
  return <HeroSiegeSkillIcon skillId={props.skillId} size={ACTIVE_SKILL_ICON_SIZE} />;
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

function AvatarIllustration() {
  return (
    <Box
      aria-hidden="true"
      style={{
        alignItems: "center",
        background: "radial-gradient(circle at 48% 28%, rgba(88, 76, 50, 0.92), rgba(25, 20, 14, 0.98) 70%)",
        border: "2px solid rgba(223, 195, 122, 0.66)",
        boxShadow: "inset 0 0 0 2px rgba(0, 0, 0, 0.72), 0 4px 12px rgba(0, 0, 0, 0.34)",
        display: "flex",
        height: AVATAR_SIZE,
        justifyContent: "center",
        padding: 2,
        width: AVATAR_SIZE
      }}
    >
      <Box
        alt=""
        component="img"
        src={warriorAvatarArt.src}
        style={{
          display: "block",
          filter: "drop-shadow(0 2px 0 rgba(0, 0, 0, 0.7)) saturate(1.08) brightness(1.08)",
          height: AVATAR_ART_SIZE,
          imageRendering: "pixelated",
          objectFit: "contain",
          width: AVATAR_ART_SIZE
        }}
      />
    </Box>
  );
}

function StatBar(props: { asset: StaticImageData; color: string; text: string; value: number }) {
  return (
    <Group gap="xs" wrap="nowrap" mb={4}>
      <ResourceIcon asset={props.asset} />
      <Progress color={props.color} value={props.value} size="sm" radius={0} style={{ background: "rgba(0, 0, 0, 0.38)", flex: 1, minWidth: 120 }} />
      <Text size="xs" fw={700} ta="right" style={{ color: "#eadfca", minWidth: 48, textShadow: "0 1px 0 #000" }}>{props.text}</Text>
    </Group>
  );
}

function ResourceIcon(props: { asset: StaticImageData }) {
  return (
    <Box style={{ alignItems: "center", background: "rgba(0, 0, 0, 0.28)", border: "1px solid rgba(223, 195, 122, 0.24)", display: "flex", height: RESOURCE_ICON_FRAME_SIZE, justifyContent: "center", width: RESOURCE_ICON_FRAME_SIZE }}>
      <Box alt="" component="img" src={props.asset.src} style={{ display: "block", height: RESOURCE_ICON_SIZE, imageRendering: "pixelated", objectFit: "contain", width: RESOURCE_ICON_SIZE }} />
    </Box>
  );
}

function MiniStat(props: { label: string; value: number }) {
  return (
    <Group gap={4} justify="center" wrap="nowrap" style={{ background: "rgba(0, 0, 0, 0.34)", border: "1px solid rgba(223, 195, 122, 0.18)", borderRadius: 2, padding: "2px 4px" }}>
      <Text size="10px" fw={800} style={{ color: HERO_DIM, textShadow: "0 1px 0 #000" }}>{props.label}</Text>
      <Text size="10px" fw={900} style={{ color: HERO_GOLD, textShadow: "0 1px 0 #000" }}>{props.value}</Text>
    </Group>
  );
}
