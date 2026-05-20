import { useState } from "react";
import { Box, Badge, Group, Progress, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";

import { HeroSiegeButton } from "./HeroSiegeUi";
import armorArt from "../assets/hero_siege_items/armor.png";
import chestArt from "../assets/hero_siege_items/item-reward.png";
import helmetArt from "../assets/hero_siege_items/helmet.png";
import ringArt from "../assets/hero_siege_items/ring.png";
import shieldArt from "../assets/hero_siege_items/shield.png";
import swordArt from "../assets/hero_siege_items/weapon-sword.png";
import angelStaffArt from "../assets/hero_siege_relics/angel-staff.png";
import bookOfBelialArt from "../assets/hero_siege_relics/book-of-belial.png";
import casinoDiceArt from "../assets/hero_siege_relics/casino-dice.png";
import commandersSwordArt from "../assets/hero_siege_relics/commanders-sword.png";
import devilSkullArt from "../assets/hero_siege_relics/devil-skull.png";
import gemAngelicArt from "../assets/hero_siege_relics/gem-angelic.png";
import holyGrailArt from "../assets/hero_siege_relics/holy-grail.png";
import lanternArt from "../assets/hero_siege_relics/lantern.png";
import midasHandArt from "../assets/hero_siege_relics/midas-hand.png";
import oddBookArt from "../assets/hero_siege_relics/odd-book.png";
import satansEyeArt from "../assets/hero_siege_relics/satans-eye.png";
import spiritSkullArt from "../assets/hero_siege_relics/spirit-skull.png";
import tokenLuckArt from "../assets/hero_siege_relics/token-luck.png";
import axeMasteryArt from "../assets/hero_siege_skills/axe-mastery.png";
import battleOrdersArt from "../assets/hero_siege_skills/battle-orders.png";
import battleTranceArt from "../assets/hero_siege_skills/battle-trance.png";
import demonFormArt from "../assets/hero_siege_skills/demon-form.png";
import findItemArt from "../assets/hero_siege_skills/find-item.png";
import frenzyArt from "../assets/hero_siege_skills/frenzy.png";
import ironSkinArt from "../assets/hero_siege_skills/iron-skin.png";
import naturalResistanceArt from "../assets/hero_siege_skills/natural-resistance.png";
import quickRecoveryArt from "../assets/hero_siege_skills/quick-recovery.png";
import shieldMasteryArt from "../assets/hero_siege_skills/shield-mastery.png";
import swordMasteryArt from "../assets/hero_siege_skills/sword-mastery.png";
import treasureSenseArt from "../assets/hero_siege_skills/treasure-sense.png";
import { ACHIEVEMENT_TOTAL, getAchievements } from "../lib/achievementCore";
import type { Achievement } from "../lib/achievementCore";
import type { StudyState } from "../types/study";

const PROGRESS_MAX = 100;
const CARD_RADIUS = 6;
const BADGE_SIZE = 52;
const BADGE_BORDER_SIZE = 1;
const CARD_MIN_HEIGHT = 110;
const CARD_PADDING = "sm";
const LOCKED_OPACITY = 0.58;
const UNLOCKED_OPACITY = 1;
const ACHIEVEMENTS_PAGE_SIZE = 8;
const CARD_BG_UNLOCKED = "linear-gradient(145deg, #23211d, #12110f)";
const CARD_BG_LOCKED = "linear-gradient(145deg, #1f1f1f, #101010)";
const CARD_BORDER_UNLOCKED = "1px solid #8b7448";
const CARD_BORDER_LOCKED = "1px solid #3a3a3a";
const LOCKED_BADGE_COLOR = "#555";
const LOCKED_FILTER = "grayscale(1) brightness(0.55)";
type StaticImageData = string;

const ACHIEVEMENT_ICON_BY_ID: Partial<Record<Achievement["id"], StaticImageData>> = {
  "adept-aggressor": axeMasteryArt,
  "arcane-intelligence": angelStaffArt,
  "archmage-memory": bookOfBelialArt,
  "armored-hell": armorArt,
  "balanced-build": naturalResistanceArt,
  "baseline-slayer": swordMasteryArt,
  "champion-hunter": commandersSwordArt,
  "complete-set": gemAngelicArt,
  "completed-grimoire": oddBookArt,
  "deep-pockets": midasHandArt,
  "eastgate": lanternArt,
  "epic-omen": satansEyeArt,
  "fallen-pack": swordArt,
  "first-blood": devilSkullArt,
  "first-cache": tokenLuckArt,
  "first-mastery": battleOrdersArt,
  "first-relic": findItemArt,
  "first-insight-upgrade": shieldArt,
  "frenzy-streak": frenzyArt,
  "giant-killer": demonFormArt,
  "hell-opens": devilSkullArt,
  "hot-streak": quickRecoveryArt,
  "insight-bank": casinoDiceArt,
  "insight-lord": holyGrailArt,
  "insight-memory": gemAngelicArt,
  "insight-reservoir": satansEyeArt,
  "insight-stash": tokenLuckArt,
  "iron-strength": axeMasteryArt,
  "keen-perception": treasureSenseArt,
  "level-10": helmetArt,
  "level-100": spiritSkullArt,
  "level-25": ironSkinArt,
  "level-5": swordArt,
  "level-50": demonFormArt,
  "money-bags": midasHandArt,
  "murder-machine": devilSkullArt,
  "nightmare-opens": satansEyeArt,
  "one-good-hint": lanternArt,
  "oracle-debt": oddBookArt,
  "maxed-mirror": armorArt,
  "paragon-path": battleTranceArt,
  "perfect-memory": bookOfBelialArt,
  "relic-collector": chestArt,
  "relic-storm": holyGrailArt,
  "stone-constitution": shieldMasteryArt,
  "tome-binder": oddBookArt,
  "veteran-warrior": helmetArt,
  "zealot-streak": battleTranceArt
};

const ACHIEVEMENT_ICON_BY_METRIC: Partial<Record<Achievement["metric"], StaticImageData>> = {
  actReached: lanternArt,
  allStats: naturalResistanceArt,
  coins: midasHandArt,
  currentHeat: devilSkullArt,
  defeats: swordArt,
  heatUnlocked: holyGrailArt,
  highestHeat: demonFormArt,
  hints: lanternArt,
  level: helmetArt,
  mastered: bookOfBelialArt,
  metaCurrency: tokenLuckArt,
  metaTotalEarned: gemAngelicArt,
  metaUpgrades: shieldArt,
  pactConditions: satansEyeArt,
  pactRanks: devilSkullArt,
  ratingSolved: demonFormArt,
  relicRarity: holyGrailArt,
  relics: holyGrailArt,
  solved: oddBookArt,
  specificMetaUpgrade: shieldArt,
  stat: axeMasteryArt,
  streak: frenzyArt
};

export function AchievementsPanel(props: { state: StudyState }) {
  const [page, setPage] = useState(0);
  const achievements = getAchievements(props.state);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const pageCount = getPageCount(achievements.length);
  const safePage = Math.min(page, pageCount - 1);
  const visibleAchievements = achievements.slice(safePage * ACHIEVEMENTS_PAGE_SIZE, (safePage + 1) * ACHIEVEMENTS_PAGE_SIZE);
  return (
    <Stack gap="md">
      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={800}>Achievements</Text>
          <Text size="sm" c="dimmed">{unlockedCount}/{ACHIEVEMENT_TOTAL}</Text>
        </Group>
        <Progress value={(unlockedCount / ACHIEVEMENT_TOTAL) * PROGRESS_MAX} color="yellow" />
      </Box>
      <Group justify="flex-end" gap="xs">
        <HeroSiegeButton height={26} minWidth={64} disabled={safePage <= 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Prev</HeroSiegeButton>
        <Badge variant="light">Page {safePage + 1}/{pageCount}</Badge>
        <HeroSiegeButton height={26} minWidth={64} disabled={safePage >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>Next</HeroSiegeButton>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {visibleAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function AchievementCard(props: { achievement: Achievement }) {
  const progressValue = Math.min(PROGRESS_MAX, (props.achievement.current / props.achievement.target) * PROGRESS_MAX);
  return (
    <Box p={CARD_PADDING} mih={CARD_MIN_HEIGHT} style={{ background: getCardBg(props.achievement.unlocked), border: getCardBorder(props.achievement.unlocked), borderRadius: CARD_RADIUS, opacity: getCardOpacity(props.achievement.unlocked) }}>
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <AchievementBadge achievement={props.achievement} />
        <Box flex={1}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text size="sm" fw={800} lineClamp={1}>{props.achievement.title}</Text>
            <Badge size="xs" color={props.achievement.unlocked ? "green" : "gray"} variant="light">
              {props.achievement.unlocked ? "Unlocked" : "Locked"}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{props.achievement.description}</Text>
          <Group justify="space-between" mt="xs" mb={3}>
            <Text size="10px" c="dimmed" fw={700}>Progress</Text>
            <Text size="10px" c="dimmed" fw={700}>{props.achievement.current}/{props.achievement.target}</Text>
          </Group>
          <Progress value={progressValue} size="xs" color={props.achievement.unlocked ? "yellow" : "gray"} />
        </Box>
      </Group>
    </Box>
  );
}

function AchievementBadge(props: { achievement: Achievement }) {
  const colors = props.achievement.unlocked ? props.achievement.colors : [LOCKED_BADGE_COLOR, "#2d2d2d", "#777"] as [string, string, string];
  const icon = ACHIEVEMENT_ICON_BY_ID[props.achievement.id] || ACHIEVEMENT_ICON_BY_METRIC[props.achievement.metric] || oddBookArt;
  return (
    <Tooltip label={props.achievement.title} withArrow withinPortal={false}>
      <Box
        aria-label={`${props.achievement.title} badge`}
        style={{
          alignItems: "center",
          background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})`,
          border: `${BADGE_BORDER_SIZE}px solid ${colors[2]}`,
          boxShadow: `0 0 0 2px #050505, inset 0 0 0 ${BADGE_BORDER_SIZE}px rgba(255, 255, 255, 0.16)`,
          display: "flex",
          flex: `0 0 ${BADGE_SIZE}px`,
          height: BADGE_SIZE,
          justifyContent: "center",
          width: BADGE_SIZE
        }}
      >
        <Box
          alt=""
          component="img"
          src={icon}
          style={{
            display: "block",
            filter: props.achievement.unlocked ? "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.75))" : LOCKED_FILTER,
            height: "82%",
            imageRendering: "pixelated",
            objectFit: "contain",
            width: "82%"
          }}
        />
      </Box>
    </Tooltip>
  );
}

function getCardBg(unlocked: boolean) {
  return unlocked ? CARD_BG_UNLOCKED : CARD_BG_LOCKED;
}

function getCardBorder(unlocked: boolean) {
  return unlocked ? CARD_BORDER_UNLOCKED : CARD_BORDER_LOCKED;
}

function getCardOpacity(unlocked: boolean) {
  return unlocked ? UNLOCKED_OPACITY : LOCKED_OPACITY;
}

function getPageCount(total: number) {
  return Math.max(1, Math.ceil(total / ACHIEVEMENTS_PAGE_SIZE));
}
