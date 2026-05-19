import { Box, Group, Paper, Text, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

import playerWarriorAvatarArt from "../assets/hero_siege_inventory/player-warrior-avatar.png";
import slotBgArt from "../assets/hero_siege_inventory/slot-bg-normal.png";
import { ACTIVE_WARRIOR_SKILLS, canUseActiveWarriorSkill, getActiveWarriorSkill, getWarriorSkillRank } from "../lib/skillCore";
import type { ActiveWarriorSkillId, StudyState } from "../types/study";
import { CoinIcon } from "./CoinIcon";
import { HeroSiegeSkillIcon } from "./HeroSiegeSkillIcon";
import { ImpactEffects, type CombatImpactVisual } from "./MonsterEncounter";
import { RelicIcon } from "./RelicIcon";
import { getHeroSiegeQualityColor, getRelicQualityLabel } from "../lib/heroSiegeQuality";
import { formatModifier } from "../lib/modifierFormat";
import type { Relic } from "../types/study";

const PERCENT_MAX = 100;
const RATING_MAX = 3500;
const RED_RATING_MIN = 3000;
const ORANGE_RATING_MIN = 2400;
const YELLOW_RATING_MIN = 1800;
const BLUE_RATING_MIN = 1400;
const AVATAR_FRAME_WIDTH = 112;
const AVATAR_FRAME_HEIGHT = 104;
const AVATAR_ART_WIDTH = 108;
const AVATAR_ART_HEIGHT = 102;
const ACTIVE_SKILL_BUTTON_SIZE = 36;
const ACTIVE_SKILL_ICON_SIZE = 30;
const ACTIVE_SKILL_SLOT_COUNT = 3;
const RELIC_ICON_SIZE = 21;
const RELIC_SLOT_SIZE = 25;
const RELIC_VISIBLE_COUNT = 10;
const RESOURCE_BAR_HEIGHT = 18;
const RESOURCE_BAR_BORDER = "1px solid rgba(12, 10, 14, 0.98)";
const PLAYER_PANEL_BG = "linear-gradient(180deg, rgba(10, 9, 12, 0.76), rgba(4, 4, 5, 0.8))";
const PLAYER_PANEL_BORDER = "1px solid rgba(32, 30, 34, 0.96)";
const PLAYER_PANEL_SHADOW = "inset 0 0 0 1px rgba(115, 107, 92, 0.14), 0 10px 24px rgba(0, 0, 0, 0.38)";
const NAME_COLOR = "#e95aff";
const HERO_GOLD = "#f1dfad";
const HEALTH_FILL = "linear-gradient(180deg, #ff5d5d, #b30017 72%, #5b0209)";
const MANA_FILL = "linear-gradient(180deg, #5f8fff, #123abb 70%, #06185e)";
const XP_FILL = "linear-gradient(180deg, #ffc658, #e58100 72%, #6c3500)";
const RELIC_TOOLTIP_BG = "linear-gradient(180deg, rgba(50, 8, 15, 0.98), rgba(16, 5, 8, 0.98))";
const RELIC_TOOLTIP_BORDER = "1px solid rgba(231, 25, 104, 0.9)";
const RELIC_TOOLTIP_SHADOW = "0 14px 36px rgba(0, 0, 0, 0.72), inset 0 0 0 1px rgba(255, 255, 255, 0.04)";

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
        gap: 8,
        minHeight: 126,
        minWidth: 498,
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
          <HudBar fill={HEALTH_FILL} value={healthValue} text={`${props.health} / ${props.maxHealth}`} />
          <HudBar fill={MANA_FILL} value={manaValue} text={`${props.mana} / ${props.maxMana}`} />
          <HudBar fill={XP_FILL} value={experienceValue} text={`${props.currentExperience} / ${props.nextLevelExperience}`} />
        </StackedResourceBars>
        <Group justify="space-between" mt={7} wrap="nowrap">
          <ActiveSkillBar state={props.state} useActiveSkill={props.useActiveSkill} />
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
    <Box
      mt={6}
      onClick={(event) => event.stopPropagation()}
      style={{
        alignItems: "center",
        background: "linear-gradient(180deg, rgba(22, 14, 17, 0.9), rgba(4, 4, 5, 0.7))",
        border: "1px solid rgba(223, 195, 122, 0.18)",
        boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
        display: "flex",
        gap: 4,
        maxWidth: "100%",
        overflow: "hidden",
        padding: "3px 5px"
      }}
    >
      {visible.map((relic) => (
        <Tooltip
          key={relic.id}
          label={<RelicMiniTooltip relic={relic} />}
          position="bottom-start"
          offset={10}
          withArrow
          multiline
          zIndex={3000}
          styles={{
            tooltip: {
              background: RELIC_TOOLTIP_BG,
              border: RELIC_TOOLTIP_BORDER,
              borderRadius: 2,
              boxShadow: RELIC_TOOLTIP_SHADOW,
              color: "#f8eed4",
              maxWidth: 320,
              padding: "10px 12px"
            },
            arrow: {
              borderColor: "rgba(231, 25, 104, 0.9)"
            }
          }}
        >
          <Box
            style={{
              alignItems: "center",
              background: "radial-gradient(circle at 50% 35%, rgba(80, 63, 42, 0.28), rgba(0, 0, 0, 0.72) 72%)",
              border: "1px solid rgba(223, 195, 122, 0.22)",
              boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.75), 0 2px 3px rgba(0, 0, 0, 0.55)",
              display: "flex",
              flex: `0 0 ${RELIC_SLOT_SIZE}px`,
              height: RELIC_SLOT_SIZE,
              justifyContent: "center",
              width: RELIC_SLOT_SIZE
            }}
          >
            <RelicIcon relic={relic} size={RELIC_ICON_SIZE} unframed />
          </Box>
        </Tooltip>
      ))}
      {remaining > 0 && <Text size="10px" fw={900} c="gray.3">+{remaining}</Text>}
    </Box>
  );
}

function RelicMiniTooltip(props: { relic: Relic }) {
  const effects = (props.relic.modifiers || []).map((modifier) => formatModifier(modifier.key, modifier.value)).filter(Boolean);
  const quality = getRelicQualityLabel(props.relic.rarity, props.relic.wikiRarityLabel);
  return (
    <Box maw={296}>
      <Text size="sm" fw={900} tt="uppercase" lh={1.15} c={getHeroSiegeQualityColor(quality)} style={{ textShadow: "0 2px 0 #000" }}>
        {props.relic.name}
      </Text>
      <Text size="11px" fw={800} mt={3} c="gray.2" lh={1.2}>
        {quality} Relic
      </Text>
      <Text size="12px" mt={7} c="blue.2" lh={1.28} style={{ textShadow: "0 1px 0 #000" }}>
        {effects.join(", ") || props.relic.description}
      </Text>
      {effects.length > 0 && (
        <Text size="11px" mt={5} c="gray.3" lh={1.25}>
          {props.relic.description}
        </Text>
      )}
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
          height: 102,
          justifyContent: "center",
          left: 0,
          overflow: "visible",
          position: "absolute",
          top: -7,
          width: AVATAR_FRAME_WIDTH
        }}
      >
        <Box
          alt=""
          component="img"
          src={playerWarriorAvatarArt}
          style={{
            display: "block",
            filter: "drop-shadow(0 5px 3px rgba(0, 0, 0, 0.82)) saturate(1.08) brightness(1.06)",
            height: AVATAR_ART_HEIGHT,
            imageRendering: "auto",
            objectFit: "contain",
            objectPosition: "center bottom",
            width: AVATAR_ART_WIDTH
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

function HudBar(props: { fill: string; text: string; value: number }) {
  const value = Math.max(0, Math.min(PERCENT_MAX, props.value));
  return (
    <Box style={{ background: "#050507", border: RESOURCE_BAR_BORDER, boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 2px 0 rgba(0, 0, 0, 0.5)", height: RESOURCE_BAR_HEIGHT, overflow: "hidden", position: "relative" }}>
      <Box style={{ background: props.fill, height: "100%", left: 0, position: "absolute", top: 0, width: `${value}%` }} />
      <Text size="xs" fw={900} ta="center" style={{ color: "#f2efe7", inset: 0, lineHeight: `${RESOURCE_BAR_HEIGHT}px`, position: "absolute", textShadow: "0 1px 0 #000" }}>{props.text}</Text>
    </Box>
  );
}
