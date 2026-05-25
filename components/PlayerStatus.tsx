import { Box, Group, Paper, Text, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

import playerWarriorAvatarArt from "../assets/hero_siege_inventory/player-warrior-avatar.png";
import type { ActivePotionEffect, ActiveWarriorSkillId, PlayerDebuff, StudyState } from "../types/study";
import { CoinIcon } from "./CoinIcon";
import { ImpactEffects, type CombatImpactVisual } from "./MonsterEncounter";
import { RelicIcon } from "./RelicIcon";
import { getRelicRarityColor } from "../lib/heroSiegeQuality";
import { formatModifier } from "../lib/modifierFormat";
import { PLAYER_DEBUFF_DEFINITIONS, formatPlayerDebuff, getPlayerDebuffDescription } from "../lib/playerDebuffCore";
import { getCard } from "../lib/studyCore";
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
const RELIC_ICON_SIZE = 21;
const RELIC_SLOT_SIZE = 25;
const RELIC_VISIBLE_COUNT = 12;
const RESOURCE_BAR_HEIGHT = 18;
const RESOURCE_BAR_BORDER = "1px solid rgba(12, 10, 14, 0.98)";
const PLAYER_PANEL_BG = "linear-gradient(180deg, rgba(10, 9, 12, 0.76), rgba(4, 4, 5, 0.8))";
const PLAYER_PANEL_BORDER = "1px solid rgba(32, 30, 34, 0.96)";
const PLAYER_PANEL_SHADOW = "inset 0 0 0 1px rgba(115, 107, 92, 0.14), 0 10px 24px rgba(0, 0, 0, 0.38)";
const NAME_COLOR = "#e95aff";
const HERO_GOLD = "#f1dfad";
const HEALTH_FILL = "linear-gradient(180deg, #ff5d5d, #b30017 72%, #5b0209)";
const BLOCK_FILL = "linear-gradient(180deg, #8fd3ff, #2773c8 72%, #123466)";
const RELIC_TOOLTIP_BG = "linear-gradient(180deg, rgba(50, 8, 15, 0.98), rgba(16, 5, 8, 0.98))";
const RELIC_TOOLTIP_BORDER = "1px solid rgba(231, 25, 104, 0.9)";
const RELIC_TOOLTIP_SHADOW = "0 14px 36px rgba(0, 0, 0, 0.72), inset 0 0 0 1px rgba(255, 255, 255, 0.04)";
const ACTIVE_EFFECT_VISIBLE_COUNT = 3;

export function PlayerStatus(props: {
  coins: number;
  health: number;
  maxHealth: number;
  onOpenStats?: () => void;
  playerImpact?: CombatImpactVisual | null;
  rating: number;
  state: StudyState;
  useActiveSkill: (skillId: ActiveWarriorSkillId) => void;
}) {
  const healthValue = (props.health / props.maxHealth) * PERCENT_MAX;
  const ratingColor = getRatingColor(props.rating);
  const playerBlock = props.state.currentId ? Math.max(0, Math.floor(getCard(props.state, props.state.currentId).playerBlock || 0)) : 0;

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
      <AvatarIllustration debuffs={props.state.profile.playerDebuffs} impact={props.playerImpact} />
      <Box style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
        <Group justify="space-between" gap="xs" wrap="nowrap" mb={5}>
          <Box>
            <Text size="lg" fw={900} lh={1} style={{ color: NAME_COLOR, textShadow: "0 2px 0 #000" }}>Dat Do</Text>
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
          {playerBlock > 0 && <HudBar fill={BLOCK_FILL} value={Math.min(PERCENT_MAX, playerBlock * 10)} text={`${playerBlock} Block`} />}
        </StackedResourceBars>
        {props.state.profile.playerDebuffs.length > 0 && <PlayerDebuffStrip debuffs={props.state.profile.playerDebuffs} />}
        {props.state.profile.activePotionEffects.length > 0 && <ActiveEffectStrip effects={props.state.profile.activePotionEffects} />}
        {props.state.profile.relics.length > 0 && <RelicStrip relics={props.state.profile.relics} />}
      </Box>
    </Paper>
  );
}

function PlayerDebuffStrip(props: { debuffs: PlayerDebuff[] }) {
  const visible = props.debuffs.slice(0, ACTIVE_EFFECT_VISIBLE_COUNT);
  const remaining = props.debuffs.length - visible.length;
  return (
    <Box
      mt={6}
      onClick={(event) => event.stopPropagation()}
      style={{
        alignItems: "center",
        display: "flex",
        gap: 5,
        maxWidth: "100%",
        overflow: "hidden"
      }}
    >
      <Text
        size="9px"
        fw={900}
        c="gray.3"
        lh={1.25}
        style={{ flex: "0 0 auto", textShadow: "0 1px 0 #000", textTransform: "uppercase" }}
      >
        Debuffs
      </Text>
      {visible.map((debuff) => (
        <PlayerDebuffPill key={debuff.id} debuff={debuff} />
      ))}
      {remaining > 0 && <Text size="10px" fw={900} c="gray.3">+{remaining}</Text>}
    </Box>
  );
}

function PlayerDebuffPill(props: { debuff: PlayerDebuff }) {
  const definition = PLAYER_DEBUFF_DEFINITIONS[props.debuff.id];
  return (
    <Tooltip
      label={getPlayerDebuffDescription(props.debuff)}
      position="bottom-start"
      offset={10}
      withArrow
      multiline
      zIndex={3000}
      styles={{
        tooltip: {
          background: RELIC_TOOLTIP_BG,
          border: `1px solid ${definition.color}`,
          borderRadius: 2,
          boxShadow: RELIC_TOOLTIP_SHADOW,
          color: "#f8eed4",
          maxWidth: 320,
          padding: "9px 11px"
        },
        arrow: {
          borderColor: definition.color
        }
      }}
    >
      <Box
        style={{
          background: `linear-gradient(180deg, ${definition.color}38, rgba(4, 4, 5, 0.78))`,
          border: `1px solid ${definition.color}9a`,
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.75), 0 2px 3px rgba(0, 0, 0, 0.55)",
          display: "flex",
          flex: "0 1 auto",
          gap: 5,
          maxWidth: 142,
          minWidth: 0,
          padding: "2px 6px"
        }}
      >
        <Text size="9px" fw={900} c={definition.color} lh={1.25}>BAD</Text>
        <Text size="9px" fw={900} c="#f8eed4" lh={1.25} truncate>{formatPlayerDebuff(props.debuff)}</Text>
        {!props.debuff.permanent && <Text size="9px" fw={900} c="gray.3" lh={1.25}>{props.debuff.remainingSubmits}s</Text>}
      </Box>
    </Tooltip>
  );
}

function ActiveEffectStrip(props: { effects: ActivePotionEffect[] }) {
  const visible = props.effects.slice(0, ACTIVE_EFFECT_VISIBLE_COUNT);
  const remaining = props.effects.length - visible.length;
  return (
    <Box
      mt={6}
      onClick={(event) => event.stopPropagation()}
      style={{
        alignItems: "center",
        display: "flex",
        gap: 5,
        maxWidth: "100%",
        overflow: "hidden"
      }}
    >
      <Text
        size="9px"
        fw={900}
        c="gray.3"
        lh={1.25}
        style={{ flex: "0 0 auto", textShadow: "0 1px 0 #000", textTransform: "uppercase" }}
      >
        Active Effects
      </Text>
      {visible.map((effect) => (
        <ActiveEffectPill key={effect.id} effect={effect} />
      ))}
      {remaining > 0 && <Text size="10px" fw={900} c="gray.3">+{remaining}</Text>}
    </Box>
  );
}

function ActiveEffectPill(props: { effect: ActivePotionEffect }) {
  const attuned = isAttunement(props.effect);
  const mystery = isMysteryBox(props.effect);
  const tone = attuned ? "yellow.3" : mystery ? "violet.2" : "blue.2";
  return (
    <Tooltip
      label={<ActiveEffectTooltip effect={props.effect} />}
      position="bottom-start"
      offset={10}
      withArrow
      multiline
      zIndex={3000}
      styles={{
        tooltip: {
          background: RELIC_TOOLTIP_BG,
          border: attuned ? "1px solid rgba(250, 204, 21, 0.9)" : RELIC_TOOLTIP_BORDER,
          borderRadius: 2,
          boxShadow: RELIC_TOOLTIP_SHADOW,
          color: "#f8eed4",
          maxWidth: 320,
          padding: "10px 12px"
        },
        arrow: {
          borderColor: attuned ? "rgba(250, 204, 21, 0.9)" : "rgba(231, 25, 104, 0.9)"
        }
        }}
      >
        <Box
          style={{
          background: attuned ? "linear-gradient(180deg, rgba(91, 58, 7, 0.92), rgba(12, 9, 5, 0.84))" : mystery ? "linear-gradient(180deg, rgba(52, 24, 78, 0.92), rgba(7, 5, 10, 0.84))" : "linear-gradient(180deg, rgba(22, 14, 17, 0.9), rgba(4, 4, 5, 0.7))",
          border: attuned ? "1px solid rgba(250, 204, 21, 0.72)" : mystery ? "1px solid rgba(204, 93, 232, 0.72)" : "1px solid rgba(223, 195, 122, 0.18)",
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.75), 0 2px 3px rgba(0, 0, 0, 0.55)",
          display: "flex",
          flex: "0 1 auto",
          gap: 5,
          maxWidth: 154,
          minWidth: 0,
          padding: "2px 6px"
        }}
      >
        <Text size="9px" fw={900} c={tone} lh={1.25}>{attuned ? "ATTUNED" : mystery ? "SEALED" : "BUFF"}</Text>
        <Text size="9px" fw={900} c="#f8eed4" lh={1.25} truncate>{formatEffectName(props.effect.name)}</Text>
        <Text size="9px" fw={900} c="gray.3" lh={1.25}>{props.effect.roomsRemaining}r</Text>
      </Box>
    </Tooltip>
  );
}

function ActiveEffectTooltip(props: { effect: ActivePotionEffect }) {
  const mystery = isMysteryBox(props.effect);
  const effects = [
    ...props.effect.modifiers.map((modifier) => formatModifier(modifier.key, modifier.value)),
    ...Object.entries(props.effect.stats).filter(([, value]) => value).map(([key, value]) => `+${value} ${formatStatName(key)}`)
  ].filter(Boolean);
  return (
    <Box maw={296}>
      <Text size="sm" fw={900} tt="uppercase" lh={1.15} c={isAttunement(props.effect) ? "yellow.3" : mystery ? "violet.2" : "blue.2"} style={{ textShadow: "0 2px 0 #000" }}>
        {props.effect.name}
      </Text>
      <Text size="11px" mt={5} c="gray.3" lh={1.25}>
        {props.effect.roomsRemaining} {props.effect.roomsRemaining === 1 ? "room" : "rooms"} remaining
      </Text>
      <Text size="12px" mt={7} c="blue.2" lh={1.28} style={{ textShadow: "0 1px 0 #000" }}>
        {mystery ? "Opens into a random relic after enough enemy rooms are cleared." : effects.join(", ") || "Temporary effect active"}
      </Text>
    </Box>
  );
}

function isMysteryBox(effect: ActivePotionEffect) {
  return Boolean(effect.mysteryRelicSeed);
}

function isAttunement(effect: ActivePotionEffect) {
  return effect.id.startsWith("rest-attunement-") || /attunement$/i.test(effect.name);
}

function formatEffectName(name: string) {
  return name.replace(/\s+Attunement$/i, "");
}

function formatStatName(stat: string) {
  return stat.charAt(0).toUpperCase() + stat.slice(1);
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
        padding: "3px 5px",
        width: "100%"
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
  const rarityColor = getRelicRarityColor(props.relic.rarity);
  return (
    <Box maw={296}>
      <Text size="sm" fw={900} tt="uppercase" lh={1.15} c={rarityColor} style={{ textShadow: "0 2px 0 #000" }}>
        {props.relic.name}
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

function AvatarIllustration(props: { debuffs: PlayerDebuff[]; impact?: CombatImpactVisual | null }) {
  const statusColor = getDominantStatusImpactColor(props.impact?.statusEffects || []) || props.debuffs.map((debuff) => PLAYER_DEBUFF_DEFINITIONS[debuff.id].color)[0];
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
            position: "relative",
            width: AVATAR_ART_WIDTH
          }}
        />
        {statusColor && <PlayerPortraitStatusWash color={statusColor} />}
        {props.impact && <ImpactEffects key={`${props.impact.id}-player-impact`} damageTypes={props.impact.damageTypes} />}
        {props.impact && <PlayerDamagePop key={props.impact.id} impact={props.impact} />}
      </Box>
    </Box>
  );
}

function PlayerPortraitStatusWash(props: { color: string }) {
  return (
    <Box
      style={{
        background: `radial-gradient(circle at 48% 44%, ${props.color}66, ${props.color}1f 44%, transparent 72%)`,
        border: `1px solid ${props.color}99`,
        boxShadow: `0 0 16px ${props.color}aa, inset 0 0 18px ${props.color}42`,
        height: 80,
        left: 18,
        mixBlendMode: "screen",
        pointerEvents: "none",
        position: "absolute",
        top: 8,
        width: 64,
        zIndex: 6
      }}
    />
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

function getStatusImpactColor(status: string) {
  if (/fire/i.test(status)) {
    return "#ff8a3d";
  }
  if (/cold/i.test(status)) {
    return "#73c7ff";
  }
  if (/lightning|shock/i.test(status)) {
    return "#f0df5f";
  }
  if (/poison/i.test(status)) {
    return "#7cff7c";
  }
  if (/weak/i.test(status)) {
    return "#c084fc";
  }
  if (/vulnerable|enraged|extra strong/i.test(status)) {
    return "#ff4d4d";
  }
  if (/frail/i.test(status)) {
    return "#73c7ff";
  }
  if (/hex|cursed/i.test(status)) {
    return "#ff4d8d";
  }
  if (/slimed/i.test(status)) {
    return "#7cff7c";
  }
  if (/confused/i.test(status)) {
    return "#f0df5f";
  }
  if (/parasite/i.test(status)) {
    return "#b56bff";
  }
  if (/cursed/i.test(status)) {
    return "#ff4d8d";
  }
  return "#d7b56d";
}

function getDominantStatusImpactColor(statuses: string[]) {
  if (!statuses.length) {
    return null;
  }
  return getStatusImpactColor(statuses[0]);
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
