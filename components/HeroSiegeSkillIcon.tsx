import { Box } from "@mantine/core";
type StaticImageData = string;

import arcaneFocusArt from "../assets/hero_siege_skills/arcane-focus.png";
import axeMasteryArt from "../assets/hero_siege_skills/axe-mastery.png";
import bashArt from "../assets/hero_siege_skills/bash.png";
import battleCommandArt from "../assets/hero_siege_skills/battle-command.png";
import battleCryArt from "../assets/hero_siege_skills/battle-cry.png";
import battleOrdersArt from "../assets/hero_siege_skills/battle-orders.png";
import battleTranceArt from "../assets/hero_siege_skills/battle-trance.png";
import bloodForBloodArt from "../assets/hero_siege_skills/blood-for-blood.png";
import bloodlustArt from "../assets/hero_siege_skills/bloodlust.png";
import burningPactArt from "../assets/hero_siege_skills/burning-pact.png";
import cleaveArt from "../assets/hero_siege_skills/cleave.png";
import concentrateArt from "../assets/hero_siege_skills/concentrate.png";
import demonFormArt from "../assets/hero_siege_skills/demon-form.png";
import doubleSwingArt from "../assets/hero_siege_skills/double-swing.png";
import executeArt from "../assets/hero_siege_skills/execute.png";
import findItemArt from "../assets/hero_siege_skills/find-item.png";
import findPotionArt from "../assets/hero_siege_skills/find-potion.png";
import frenzyArt from "../assets/hero_siege_skills/frenzy.png";
import grimWardArt from "../assets/hero_siege_skills/grim-ward.png";
import howlArt from "../assets/hero_siege_skills/howl.png";
import ironSkinArt from "../assets/hero_siege_skills/iron-skin.png";
import naturalResistanceArt from "../assets/hero_siege_skills/natural-resistance.png";
import powerStrikeArt from "../assets/hero_siege_skills/power-strike.png";
import quickRecoveryArt from "../assets/hero_siege_skills/quick-recovery.png";
import shieldMasteryArt from "../assets/hero_siege_skills/shield-mastery.png";
import shockwaveArt from "../assets/hero_siege_skills/shockwave.png";
import shoutArt from "../assets/hero_siege_skills/shout.png";
import sureCritArt from "../assets/hero_siege_skills/sure-crit.png";
import swordMasteryArt from "../assets/hero_siege_skills/sword-mastery.png";
import tauntArt from "../assets/hero_siege_skills/taunt.png";
import treasureSenseArt from "../assets/hero_siege_skills/treasure-sense.png";
import tripleStrikeArt from "../assets/hero_siege_skills/triple-strike.png";
import warCryArt from "../assets/hero_siege_skills/war-cry.png";
import whirlwindArt from "../assets/hero_siege_skills/whirlwind.png";
import type { WarriorSkillId } from "../types/study";

const DEFAULT_SKILL_ICON_SIZE = 30;
const SKILL_IMAGE_SCALE = "86%";
const SKILL_FRAME_BG = "radial-gradient(circle at 45% 28%, rgba(62, 49, 29, 0.98), rgba(8, 7, 6, 0.98) 74%)";
const SKILL_FRAME_SHADOW = "inset 0 0 0 1px rgba(0, 0, 0, 0.86), 0 3px 8px rgba(0, 0, 0, 0.42)";
const SKILL_FRAME_PADDING = 2;
const LOCKED_SKILL_OPACITY = 0.45;

const SKILL_ASSETS: Record<WarriorSkillId, StaticImageData> = {
  arcaneFocus: arcaneFocusArt,
  axeMastery: axeMasteryArt,
  bash: bashArt,
  battleCommand: battleCommandArt,
  battleCry: battleCryArt,
  battleOrders: battleOrdersArt,
  battleTrance: battleTranceArt,
  bloodForBlood: bloodForBloodArt,
  bloodlust: bloodlustArt,
  burningPact: burningPactArt,
  cleave: cleaveArt,
  concentrate: concentrateArt,
  demonForm: demonFormArt,
  doubleSwing: doubleSwingArt,
  execute: executeArt,
  findItem: findItemArt,
  findPotion: findPotionArt,
  frenzy: frenzyArt,
  goldMastery: treasureSenseArt,
  grimWard: grimWardArt,
  howl: howlArt,
  ironSkin: ironSkinArt,
  naturalResistance: naturalResistanceArt,
  powerStrike: powerStrikeArt,
  quickRecovery: quickRecoveryArt,
  rallyingCry: battleOrdersArt,
  shieldMastery: shieldMasteryArt,
  shockwave: shockwaveArt,
  shout: shoutArt,
  sureCrit: sureCritArt,
  swordMastery: swordMasteryArt,
  taunt: tauntArt,
  treasureSense: treasureSenseArt,
  tripleStrike: tripleStrikeArt,
  warCry: warCryArt,
  whirlwind: whirlwindArt,
  whirlwindAssault: whirlwindArt
};

export function HeroSiegeSkillIcon(props: { locked?: boolean; size?: number; skillId: WarriorSkillId }) {
  const size = props.size || DEFAULT_SKILL_ICON_SIZE;
  return (
    <Box
      aria-hidden="true"
      style={{
        alignItems: "center",
        background: SKILL_FRAME_BG,
        border: `1px solid ${props.locked ? "#3d3527" : "#8a744c"}`,
        boxShadow: SKILL_FRAME_SHADOW,
        display: "flex",
        flex: `0 0 ${size}px`,
        height: size,
        justifyContent: "center",
        opacity: props.locked ? LOCKED_SKILL_OPACITY : 1,
        padding: SKILL_FRAME_PADDING,
        width: size
      }}
    >
      <Box
        alt=""
        component="img"
        src={SKILL_ASSETS[props.skillId]}
        style={{
          display: "block",
          filter: "drop-shadow(0 2px 0 rgba(0, 0, 0, 0.72))",
          imageRendering: "pixelated",
          maxHeight: SKILL_IMAGE_SCALE,
          maxWidth: SKILL_IMAGE_SCALE,
          objectFit: "contain"
        }}
      />
    </Box>
  );
}
