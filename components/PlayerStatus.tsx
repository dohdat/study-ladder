import { Box, Group, Paper, Text, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";
type StaticImageData = string;

import healthShrineArt from "../assets/hero_siege_map/health-shrine.png";
import chestArt from "../assets/hero_siege_map/chest.png";
import fieldTorchArt from "../assets/hero_siege_map/field-torch.png";
import demonKingArt from "../assets/hero_siege_monsters/demon-king.png";
import slotBgArt from "../assets/hero_siege_inventory/slot-bg-normal.png";
import tabSquareArt from "../assets/hero_siege_inventory/tab-square.png";
import { ACTIVE_WARRIOR_SKILLS, canUseActiveWarriorSkill, getActiveWarriorSkill, getWarriorSkillRank } from "../lib/skillCore";
import type { ActiveWarriorSkillId, CharacterStats, StudyState } from "../types/study";
import { CoinIcon } from "./CoinIcon";
import { HeroSiegeSkillIcon } from "./HeroSiegeSkillIcon";
import { ImpactEffects, type CombatImpactVisual } from "./MonsterEncounter";
import { RelicIcon } from "./RelicIcon";
import { formatModifier } from "../lib/modifierFormat";
import type { Relic } from "../types/study";

const PERCENT_MAX = 100;
const RATING_MAX = 3500;
const RED_RATING_MIN = 3000;
const ORANGE_RATING_MIN = 2400;
const YELLOW_RATING_MIN = 1800;
const BLUE_RATING_MIN = 1400;
const AVATAR_FRAME_WIDTH = 86;
const AVATAR_FRAME_HEIGHT = 104;
const AVATAR_ART_SIZE = 118;
const ACTIVE_SKILL_BUTTON_SIZE = 36;
const ACTIVE_SKILL_ICON_SIZE = 30;
const ACTIVE_SKILL_SLOT_COUNT = 3;
const RELIC_ICON_SIZE = 26;
const RELIC_VISIBLE_COUNT = 8;
const RESOURCE_BAR_HEIGHT = 18;
const RESOURCE_BAR_BORDER = "1px solid rgba(12, 10, 14, 0.98)";
const PLAYER_PANEL_BG = "linear-gradient(180deg, rgba(10, 9, 12, 0.76), rgba(4, 4, 5, 0.8))";
const PLAYER_PANEL_BORDER = "1px solid rgba(32, 30, 34, 0.96)";
const PLAYER_PANEL_SHADOW = "inset 0 0 0 1px rgba(115, 107, 92, 0.14), 0 10px 24px rgba(0, 0, 0, 0.38)";
const NAME_COLOR = "#e95aff";
const HERO_GOLD = "#f1dfad";
const HERO_DIM = "#bca982";
const HEALTH_FILL = "linear-gradient(180deg, #ff5d5d, #b30017 72%, #5b0209)";
const MANA_FILL = "linear-gradient(180deg, #5f8fff, #123abb 70%, #06185e)";
const XP_FILL = "linear-gradient(180deg, #ffc658, #e58100 72%, #6c3500)";

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
  playerImpact?: CombatImpactVisual | null;
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
        borderRadius: 2,
        boxShadow: PLAYER_PANEL_SHADOW,
        color: "inherit",
        cursor: props.onOpenStats ? "pointer" : "default",
        display: "flex",
        gap: 10,
        minHeight: 126,
        minWidth: 472,
        overflow: "hidden",
        padding: 8,
        position: "relative",
        textAlign: "left"
        }}
    >
      <AvatarIllustration impact={props.playerImpact} level={props.level} />
      <Box style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
        <Group justify="space-between" gap="xs" wrap="nowrap" mb={5}>
          <Box>
            <Text size="lg" fw={900} lh={1} style={{ color: NAME_COLOR, textShadow: "0 2px 0 #000" }}>Dat Do</Text>
            <Text size="xs" fw={800} mt={1} style={{ color: HERO_GOLD, textShadow: "0 1px 0 #000" }}>Level {props.level} Warrior</Text>
          </Box>
          <Box ta="right">
            <Group gap={5} wrap="nowrap" justify="flex-end">
              <CoinIcon size={18} />
              <Text size="sm" fw={700} lh={1}>{props.coins}</Text>
            </Group>
            <Text size="10px" c={`${ratingColor}.4`} fw={800} lh={1.2}>Rating {props.rating}</Text>
          </Box>
        </Group>
        <StackedResourceBars>
          <HudBar fill={HEALTH_FILL} icon={healthShrineArt} value={healthValue} text={`${props.health} / ${props.maxHealth}`} />
          <HudBar fill={MANA_FILL} icon={fieldTorchArt} value={manaValue} text={`${props.mana} / ${props.maxMana}`} />
          <HudBar fill={XP_FILL} icon={chestArt} value={experienceValue} text={`${props.currentExperience} / ${props.nextLevelExperience}`} />
        </StackedResourceBars>
        <Group justify="space-between" mt={7} wrap="nowrap">
          <ActiveSkillBar state={props.state} useActiveSkill={props.useActiveSkill} />
          <Group gap={4} wrap="nowrap">
            <MiniStat label="STR" value={props.stats.strength} />
            <MiniStat label="CON" value={props.stats.constitution} />
            <MiniStat label="PER" value={props.stats.perception} />
            <MiniStat label="INT" value={props.stats.intelligence} />
          </Group>
        </Group>
        {props.state.profile.relics.length > 0 && <RelicStrip relics={props.state.profile.relics} />}
      </Box>
    </Paper>
  );
}

function RelicStrip(props: { relics: Relic[] }) {
  const visible = props.relics.slice(0, RELIC_VISIBLE_COUNT);
  const remaining = props.relics.length - visible.length;
  return (
    <Group gap={4} mt={6} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
      {visible.map((relic) => (
        <Tooltip key={relic.id} label={<RelicMiniTooltip relic={relic} />} withArrow>
          <Box style={{ filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.75))" }}>
            <RelicIcon relic={relic} size={RELIC_ICON_SIZE} unframed />
          </Box>
        </Tooltip>
      ))}
      {remaining > 0 && <Text size="10px" fw={900} c="gray.3">+{remaining}</Text>}
    </Group>
  );
}

function RelicMiniTooltip(props: { relic: Relic }) {
  const effects = (props.relic.modifiers || []).map((modifier) => formatModifier(modifier.key, modifier.value)).filter(Boolean);
  return (
    <Box maw={220}>
      <Text size="xs" fw={900}>{props.relic.name}</Text>
      <Text size="xs" c="gray.3">{effects.join(", ") || props.relic.description}</Text>
    </Box>
  );
}

function ActiveSkillBar(props: { state: StudyState; useActiveSkill: (skillId: ActiveWarriorSkillId) => void }) {
  const visibleSkills = ACTIVE_WARRIOR_SKILLS.filter((skill) => getWarriorSkillRank(props.state.profile.skillRanks, skill.id) > 0);
  const activeSkill = getActiveWarriorSkill(props.state.profile.activeSkill);
  const slots = Array.from({ length: ACTIVE_SKILL_SLOT_COUNT }, (_item, index) => visibleSkills[index] || null);
  return (
    <Group gap={7} onClick={(event) => event.stopPropagation()} wrap="nowrap">
      {slots.map((skill, index) => {
        if (!skill) {
          return <EmptySkillSlot key={`empty-skill-${index}`} />;
        }
        const isReadied = activeSkill?.id === skill.id;
        const disabled = !isReadied && !canUseActiveWarriorSkill(props.state, skill.id);
        return (
          <Tooltip key={skill.id} label={isReadied ? `${skill.name} is readied.` : `${skill.description} Costs ${skill.cost} mana${skill.healthCost ? ` and ${skill.healthCost} health` : ""}.`} withArrow>
            <Box
              component="button"
              aria-label={skill.name}
              disabled={disabled}
              onClick={() => props.useActiveSkill(skill.id)}
              style={{
                alignItems: "center",
                backgroundColor: "transparent",
                backgroundImage: `url(${slotBgArt})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 100%",
                border: 0,
                boxShadow: isReadied ? "0 0 0 1px #fff, 0 0 10px rgba(102, 180, 255, 0.72)" : "none",
                cursor: disabled ? "not-allowed" : "pointer",
                display: "flex",
                height: ACTIVE_SKILL_BUTTON_SIZE,
                imageRendering: "pixelated",
                justifyContent: "center",
                opacity: disabled ? 0.44 : 1,
                padding: 0,
                width: ACTIVE_SKILL_BUTTON_SIZE
              }}
            >
              <ActiveSkillIcon skillId={skill.id} />
            </Box>
          </Tooltip>
        );
      })}
    </Group>
  );
}

function EmptySkillSlot() {
  return (
    <Box
      aria-hidden="true"
      style={{
        backgroundColor: "transparent",
        backgroundImage: `url(${slotBgArt})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        height: ACTIVE_SKILL_BUTTON_SIZE,
        imageRendering: "pixelated",
        opacity: 0.74,
        width: ACTIVE_SKILL_BUTTON_SIZE
      }}
    />
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

function AvatarIllustration(props: { impact?: CombatImpactVisual | null; level: number }) {
  return (
    <Box
      aria-hidden="true"
      style={{
        flex: `0 0 ${AVATAR_FRAME_WIDTH}px`,
        height: AVATAR_FRAME_HEIGHT,
        position: "relative"
      }}
    >
      <Box
        style={{
          alignItems: "center",
          background: "radial-gradient(circle at 50% 43%, rgba(23, 16, 18, 0.78), rgba(0, 0, 0, 0) 69%)",
          display: "flex",
          height: 88,
          imageRendering: "pixelated",
          justifyContent: "center",
          left: -18,
          overflow: "visible",
          position: "absolute",
          top: -14,
          width: AVATAR_FRAME_WIDTH
        }}
      >
        <Box
          alt=""
          component="img"
          src={demonKingArt}
          style={{
            display: "block",
            filter: "drop-shadow(0 5px 2px rgba(0, 0, 0, 0.82)) saturate(1.12) brightness(1.08)",
            height: AVATAR_ART_SIZE,
            imageRendering: "pixelated",
            objectFit: "contain",
            objectPosition: "center 48%",
            width: AVATAR_ART_SIZE
          }}
        />
        {props.impact && <ImpactEffects key={`${props.impact.id}-player-impact`} damageTypes={props.impact.damageTypes} />}
        {props.impact && <PlayerDamagePop key={props.impact.id} impact={props.impact} />}
      </Box>
      <Box
        style={{
          alignItems: "center",
          background: "linear-gradient(180deg, #164c6c 0%, #0b314c 54%, #082034 100%)",
          border: "2px solid rgba(113, 183, 210, 0.82)",
          bottom: 2,
          boxShadow: "inset 0 0 0 2px #031016, 0 4px 8px rgba(0, 0, 0, 0.56)",
          clipPath: "polygon(50% 0, 100% 14%, 92% 74%, 50% 100%, 8% 74%, 0 14%)",
          color: "#f1dfad",
          display: "flex",
          height: 48,
          justifyContent: "center",
          left: 2,
          position: "absolute",
          width: 42
        }}
      >
        <Text size="sm" fw={900} lh={1} style={{ textShadow: "0 2px 0 #000" }}>{props.level}</Text>
      </Box>
    </Box>
  );
}

function PlayerDamagePop(props: { impact: CombatImpactVisual }) {
  const hitCount = (props.impact.hitCount || 0) > 1 ? ` x${props.impact.hitCount}` : "";
  return (
    <Box
      style={{
        animation: "monster-damage-pop 820ms ease-out both",
        color: "#ff7070",
        fontSize: 18,
        fontWeight: 900,
        left: 54,
        pointerEvents: "none",
        position: "absolute",
        textShadow: "0 2px 0 #000, 0 0 8px rgba(255, 0, 0, 0.82)",
        top: 2,
        zIndex: 8
      }}
    >
      -{props.impact.amount || 0}{hitCount}
    </Box>
  );
}

function StackedResourceBars(props: { children: ReactNode }) {
  return <Box style={{ display: "grid", gap: 4 }}>{props.children}</Box>;
}

function HudBar(props: { fill: string; icon: StaticImageData; text: string; value: number }) {
  const value = Math.max(0, Math.min(PERCENT_MAX, props.value));
  return (
    <Box style={{ background: "#050507", border: RESOURCE_BAR_BORDER, boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 2px 0 rgba(0, 0, 0, 0.5)", height: RESOURCE_BAR_HEIGHT, overflow: "hidden", position: "relative" }}>
      <Box style={{ background: props.fill, height: "100%", left: 0, position: "absolute", top: 0, width: `${value}%` }} />
      <Box alt="" component="img" src={props.icon} style={{ display: "block", filter: "drop-shadow(0 1px 0 #000)", height: 16, imageRendering: "pixelated", left: 4, objectFit: "contain", position: "absolute", top: 1, width: 16 }} />
      <Text size="xs" fw={900} ta="center" style={{ color: "#f2efe7", inset: 0, lineHeight: `${RESOURCE_BAR_HEIGHT}px`, position: "absolute", textShadow: "0 1px 0 #000" }}>{props.text}</Text>
    </Box>
  );
}

function MiniStat(props: { label: string; value: number }) {
  return (
    <Group gap={4} justify="center" wrap="nowrap" style={{ backgroundColor: "rgba(0, 0, 0, 0.34)", backgroundImage: `url(${tabSquareArt})`, backgroundSize: "100% 100%", border: "1px solid rgba(223, 195, 122, 0.18)", borderRadius: 2, imageRendering: "pixelated", minWidth: 42, padding: "2px 4px" }}>
      <Text size="10px" fw={800} style={{ color: HERO_DIM, textShadow: "0 1px 0 #000" }}>{props.label}</Text>
      <Text size="10px" fw={900} style={{ color: HERO_GOLD, textShadow: "0 1px 0 #000" }}>{props.value}</Text>
    </Group>
  );
}
