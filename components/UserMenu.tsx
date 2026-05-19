import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Group,
  Menu,
  Modal,
  NumberInput,
  Textarea,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  ThemeIcon,
  Tooltip,
  Title
} from "@mantine/core";
import { IconBackpack, IconBook, IconChartBar, IconSettings, IconSparkles, IconSword, IconTrophy, IconUser } from "@tabler/icons-react";

import { AchievementsPanel } from "./AchievementsPanel";
import { CoinAmount } from "./CoinIcon";
import { HeroSiegeButton } from "./HeroSiegeUi";
import { InventoryPanel } from "./InventoryPanel";
import { MONSTER_WIKI_ENTRIES } from "./MonsterEncounter";
import { RelicIcon } from "./RelicIcon";
import { WarriorSkillTree } from "./WarriorSkillTree";
import { getHeroSiegeQualityColor, getRelicQualityLabel } from "../lib/heroSiegeQuality";
import armorArt from "../assets/hero_siege_items/armor.png";
import healthPotionArt from "../assets/hero_siege_items/health-potion.png";
import helmetArt from "../assets/hero_siege_items/helmet.png";
import manaPotionArt from "../assets/hero_siege_items/mana-potion.png";
import swordArt from "../assets/hero_siege_items/weapon-sword.png";
import devilSkullArt from "../assets/hero_siege_relics/devil-skull.png";
import fireIceArt from "../assets/hero_siege_relics/fire-ice.png";
import holyGrailArt from "../assets/hero_siege_relics/holy-grail.png";
import lightningGlobeArt from "../assets/hero_siege_relics/lightning-globe.png";
import midasHandArt from "../assets/hero_siege_relics/midas-hand.png";
import orbOfIceArt from "../assets/hero_siege_relics/orb-of-ice.png";
import orbOfPoisonArt from "../assets/hero_siege_relics/orb-of-poison.png";
import tokenLuckArt from "../assets/hero_siege_relics/token-luck.png";
import arcaneFocusArt from "../assets/hero_siege_skills/arcane-focus.png";
import axeMasteryArt from "../assets/hero_siege_skills/axe-mastery.png";
import naturalResistanceArt from "../assets/hero_siege_skills/natural-resistance.png";
import sureCritArt from "../assets/hero_siege_skills/sure-crit.png";
import treasureSenseArt from "../assets/hero_siege_skills/treasure-sense.png";
import { questions } from "../data/questions";
import { useStudyBlockerSettings } from "../hooks/useStudyBlocker";
import {
  HERO_SIEGE_WIKI_CATEGORIES,
  HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT,
  HERO_SIEGE_WIKI_ITEM_IMAGE_DISPLAYS,
  HERO_SIEGE_WIKI_ITEMS,
  HERO_SIEGE_WIKI_QUALITY_DISTRIBUTION,
  getWikiItemQualityLabel,
  getWikiItemPublicPath,
  type HeroSiegeWikiCategory,
  type HeroSiegeWikiIconDisplay,
  type HeroSiegeWikiItem
} from "../lib/heroSiegeWikiCatalog";
import { RELIC_DEFINITIONS } from "../lib/relicCore";
import {
  EXPERIENCE_PER_LEVEL,
  defaultState,
  getAttackDamage,
  getCriticalChance,
  getEffectiveCharacterStats,
  getElementalResistances,
  getHealthLoss,
  getLevelProgress,
  getMaxHealth,
  getMaxMana,
  getRunModifierTotals,
  getWarriorSkillBonusTotals,
  spendStatPoint
} from "../lib/studyCore";
import { getMonsterMaxHealth, getUniqueMonsterBonuses } from "../lib/monsterCore";
import type { CharacterStatKey, Difficulty, ItemModifierKey, Question, Relic, StudyState } from "../types/study";

const ICON_SIZE = 16;
const MENU_WIDTH = 180;
const ACHIEVEMENTS_MODAL_SIZE = 920;
const SKILLS_MODAL_SIZE = 920;
const WIKI_MODAL_SIZE = 1040;
const MODAL_TRANSITION_DURATION = 0;
const PROGRESS_MAX = 100;
const DAILY_MINUTES_MIN = 0;
const DAILY_MINUTES_MAX = 720;
const DAILY_MINUTES_STEP = 5;
const SITE_TEXTAREA_MIN_ROWS = 4;
const STAT_SHEET_BG = "radial-gradient(circle at 50% 18%, rgba(95, 31, 31, 0.72), rgba(32, 11, 10, 0.98) 46%, #080504 100%)";
const STAT_SHEET_BORDER = "2px solid #8a1744";
const STAT_FRAME_BG = "linear-gradient(180deg, rgba(45, 12, 15, 0.94), rgba(8, 6, 8, 0.98))";
const STAT_FRAME_BORDER = "1px solid rgba(192, 29, 73, 0.82)";
const STAT_FRAME_SHADOW = "inset 0 0 0 1px #080304, 0 10px 22px rgba(0, 0, 0, 0.42)";
const STAT_GOLD = "#d8c181";
const STAT_TEXT = "#f1ead7";
const STAT_MUTED = "#9f9888";
const STAT_PLUS_BG = "#7b1717";
const STAT_PLUS_BORDER = "1px solid #caa36a";
const STAT_PANEL_INNER_BORDER = "1px solid rgba(205, 36, 83, 0.72)";
const STAT_ICON_BOX_BG = "radial-gradient(circle at 45% 30%, rgba(90, 38, 27, 0.95), rgba(10, 7, 6, 0.98) 72%)";
const STAT_SMALL_ICON_SIZE = 26;
const MODAL_BG = "#17100c";
const MODAL_BORDER = "1px solid rgba(210, 168, 84, 0.62)";
const MODAL_SHADOW = "inset 0 0 0 1px #050403, 0 14px 38px rgba(0, 0, 0, 0.62)";
const TOOLTIP_SHEET_WIDTH = 420;
const TOOLTIP_BG = "linear-gradient(180deg, rgba(35, 13, 13, 0.98), rgba(9, 6, 5, 0.99))";
const TOOLTIP_BORDER = "1px solid #9f2d4e";
const TOOLTIP_SHADOW = "inset 0 0 0 1px rgba(0, 0, 0, 0.86), 0 12px 28px rgba(0, 0, 0, 0.62)";
const TOOLTIP_PADDING = 10;
const MENU_DROPDOWN_BG = "linear-gradient(180deg, #2f1d11, #0c0805)";
const MENU_DROPDOWN_BORDER = "1px solid rgba(223, 195, 122, 0.56)";
const MENU_ITEM_COLOR = "#f6d992";
const WIKI_MONSTER_IMAGE_SIZE = 56;
const WIKI_RELIC_ICON_SIZE = 42;
const WIKI_ITEM_ICON_SIZE = 34;
const WIKI_GRID_MIN_WIDTH = 220;
const WIKI_MONSTER_PAGE_SIZE = 12;
const WIKI_RELIC_PAGE_SIZE = 10;
const WIKI_ITEM_PAGE_SIZE = 24;
const MONSTER_HEALTH_RANGE_RATIO = 0.1;
const MONSTER_BASE_RESISTANCE = 0;
const MONSTER_ENCHANTED_RESISTANCE = 35;
const MONSTER_MAGIC_RESISTANCE = 25;
const MONSTER_SPECTRAL_RESISTANCE = 15;
const MONSTER_STONE_SKIN_PHYSICAL_RESISTANCE = 25;
const STAT_ROWS: Array<{ key: CharacterStatKey; label: string }> = [
  { key: "strength", label: "Strength" },
  { key: "constitution", label: "Constitution" },
  { key: "perception", label: "Perception" },
  { key: "intelligence", label: "Intelligence" }
];
const STAT_DESCRIPTIONS: Record<CharacterStatKey, string> = {
  constitution: "Increases max health and defense, reducing health lost from failed submissions.",
  intelligence: "Increases experience gains and mana rewards from completed questions.",
  perception: "Improves gold rewards and item-drop quality from completed questions.",
  strength: "Increases damage against monsters and raises critical strike chance."
};

export const USER_MENU_ITEMS = [
  { id: "profile", icon: IconUser, label: "Profile", shortcut: "P" },
  { id: "inventory", icon: IconBackpack, label: "Inventory", shortcut: "I" },
  { id: "skills", icon: IconSword, label: "Skills", shortcut: "K" },
  { id: "stats", icon: IconChartBar, label: "Stats", shortcut: "S" },
  { id: "achievements", icon: IconTrophy, label: "Achievements", shortcut: "A" },
  { id: "wiki", icon: IconBook, label: "Wiki", shortcut: "W" },
  { id: "settings", icon: IconSettings, label: "Settings", shortcut: "O" }
] as const;

export type UserMenuSection = typeof USER_MENU_ITEMS[number]["id"];

export const USER_MENU_SHORTCUTS: ReadonlyArray<{ key: string; section: UserMenuSection }> = USER_MENU_ITEMS.map((item) => ({
  key: item.shortcut.toLowerCase(),
  section: item.id
}));

export function UserMenu(props: { activeSection: UserMenuSection | null; setActiveSection: (section: UserMenuSection | null) => void; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const modalTitle = USER_MENU_ITEMS.find((item) => item.id === props.activeSection)?.label || "User";
  return (
    <>
      <Menu position="bottom-end" width={MENU_WIDTH} shadow="md">
        <Menu.Target>
          <HeroSiegeButton leftSection={<IconUser size={ICON_SIZE} />} minWidth={104}>User</HeroSiegeButton>
        </Menu.Target>
        <Menu.Dropdown style={{ background: MENU_DROPDOWN_BG, border: MENU_DROPDOWN_BORDER, borderRadius: 2, boxShadow: MODAL_SHADOW }}>
          {USER_MENU_ITEMS.map((item) => (
            <Menu.Item
              key={item.label}
              leftSection={<item.icon size={ICON_SIZE} />}
              onClick={() => props.setActiveSection(item.id)}
              rightSection={<Text size="10px" fw={900} style={{ color: "#9f8352", textShadow: "0 1px 0 #000" }}>{item.shortcut}</Text>}
              style={{ color: MENU_ITEM_COLOR, fontWeight: 800 }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <Modal
        opened={Boolean(props.activeSection)}
        onClose={() => props.setActiveSection(null)}
        title={modalTitle}
        centered
        keepMounted
        size={getModalSize(props.activeSection)}
        styles={{
          body: { background: MODAL_BG },
          content: { background: MODAL_BG, border: MODAL_BORDER, borderRadius: 2, boxShadow: MODAL_SHADOW },
          header: { background: MODAL_BG, borderBottom: MODAL_BORDER },
          title: { color: "#ffe8a8", fontWeight: 900, textShadow: "0 1px 0 #000" }
        }}
        transitionProps={{ duration: MODAL_TRANSITION_DURATION }}
      >
        <UserModalContent section={props.activeSection} state={props.state} setState={props.setState} />
      </Modal>
    </>
  );
}

function getModalSize(section: UserMenuSection | null) {
  if (section === "achievements") {
    return ACHIEVEMENTS_MODAL_SIZE;
  }
  if (section === "skills") {
    return SKILLS_MODAL_SIZE;
  }
  if (section === "wiki") {
    return WIKI_MODAL_SIZE;
  }
  return "lg";
}

function UserModalContent(props: { section: UserMenuSection | null; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  if (props.section === "stats") {
    return <StatsPanel state={props.state} setState={props.setState} />;
  }
  if (props.section === "inventory") {
    return <InventoryPanel state={props.state} setState={props.setState} />;
  }
  if (props.section === "skills") {
    return <WarriorSkillTree state={props.state} setState={props.setState} />;
  }
  if (props.section === "achievements") {
    return <AchievementsPanel state={props.state} />;
  }
  if (props.section === "wiki") {
    return <WikiPanel />;
  }
  if (props.section === "settings") {
    return <SettingsPanel state={props.state} setState={props.setState} />;
  }
  return <ProfilePanel state={props.state} setState={props.setState} />;
}

function ProfilePanel(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const levelProgress = useMemo(() => getLevelProgress(props.state), [props.state]);
  const stats = useMemo(() => getEffectiveCharacterStats(props.state), [props.state]);
  const maxHealth = useMemo(() => getMaxHealth(props.state), [props.state]);
  const maxMana = useMemo(() => getMaxMana(props.state), [props.state]);
  return (
    <Stack gap="md">
      <Group align="center" gap="md">
        <ThemeIcon size={54} radius="sm" variant="light">
          <IconUser size={28} />
        </ThemeIcon>
        <Box>
          <Title order={4}>Dat Do</Title>
          <Text size="sm" c="dimmed">Level {levelProgress.level} Warrior</Text>
        </Box>
      </Group>
      <Stack gap="xs">
        <ProgressRow label="Health" value={props.state.profile.health} max={maxHealth} color="red" />
        <ProgressRow label="Experience" value={levelProgress.currentExperience} max={levelProgress.nextLevelExperience} color="yellow" />
        <ProgressRow label="Mana" value={props.state.profile.mana} max={maxMana} color="blue" />
      </Stack>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        <StatTile label="Coins" value={<CoinAmount value={props.state.profile.coins} />} />
        <StatTile label="Level XP" value={`${levelProgress.currentExperience}/${EXPERIENCE_PER_LEVEL}`} />
        <StatTile label="Hints" value={props.state.profile.hintsBought} />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {STAT_ROWS.map((stat) => (
          <StatTile
            key={stat.key}
            label={stat.label}
            value={stats[stat.key]}
            action={<HeroSiegeButton height={24} minWidth={54} disabled={props.state.profile.statPoints <= 0} onClick={() => props.setState((previous) => spendStatPoint(previous, stat.key))}>Add</HeroSiegeButton>}
          />
        ))}
      </SimpleGrid>
      <Text size="sm" c={props.state.profile.statPoints > 0 ? "yellow.4" : "dimmed"} fw={700}>
        Unspent stat points: {props.state.profile.statPoints}
      </Text>
    </Stack>
  );
}

function StatsPanel(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const levelProgress = useMemo(() => getLevelProgress(props.state), [props.state]);
  const stats = useMemo(() => getEffectiveCharacterStats(props.state), [props.state]);
  const sampleQuestion = questions.find((question) => question.id === props.state.currentId) || questions[0];
  const criticalChance = Math.round(getCriticalChance(props.state) * PROGRESS_MAX);
  const modifiers = getRunModifierTotals(props.state);
  const skillBonuses = getWarriorSkillBonusTotals(props.state);
  const resistances = getElementalResistances(props.state);
  const maxHealth = getMaxHealth(props.state);
  const maxMana = getMaxMana(props.state);
  const primaryStats = [
    { description: STAT_DESCRIPTIONS.strength, icon: axeMasteryArt, key: "strength" as const, label: "Strength", value: stats.strength },
    { description: STAT_DESCRIPTIONS.constitution, icon: naturalResistanceArt, key: "constitution" as const, label: "Constitution", value: stats.constitution },
    { description: STAT_DESCRIPTIONS.perception, icon: treasureSenseArt, key: "perception" as const, label: "Perception", value: stats.perception },
    { description: STAT_DESCRIPTIONS.intelligence, icon: arcaneFocusArt, key: "intelligence" as const, label: "Intelligence", value: stats.intelligence }
  ];
  const combatStats = [
    { icon: swordArt, label: "Attack Damage", value: getAttackDamage(sampleQuestion, props.state) },
    { icon: sureCritArt, label: "Critical Strike", value: `${criticalChance}%` },
    { icon: devilSkullArt, label: "Fail Damage", value: getHealthLoss(props.state) },
    { icon: armorArt, label: "Defense", value: modifiers.damageReduction + skillBonuses.damageReduction },
    { icon: healthPotionArt, label: "Life", value: `${props.state.profile.health} / ${maxHealth}` },
    { icon: manaPotionArt, label: "Mana", value: `${props.state.profile.mana} / ${maxMana}` },
    { icon: fireIceArt, label: "Fire Resist", value: `${resistances.fire}%` },
    { icon: orbOfIceArt, label: "Cold Resist", value: `${resistances.cold}%` },
    { icon: lightningGlobeArt, label: "Lightning Resist", value: `${resistances.lightning}%` },
    { icon: orbOfPoisonArt, label: "Poison Resist", value: `${resistances.poison}%` },
    { icon: holyGrailArt, label: "Magic Find", value: `${modifiers.magicFindPercent + skillBonuses.magicFindPercent}%` },
    { icon: midasHandArt, label: "Gold Find", value: `${modifiers.goldFindPercent + skillBonuses.goldFindPercent}%` },
    { icon: tokenLuckArt, label: "Bonus XP", value: `${modifiers.bonusXpPercent + skillBonuses.bonusXpPercent}%` }
  ];
  return (
    <Box p="md" style={{ background: STAT_SHEET_BG, border: STAT_SHEET_BORDER, boxShadow: STAT_FRAME_SHADOW, position: "relative" }}>
      <Box style={{ border: STAT_PANEL_INNER_BORDER, boxShadow: "inset 0 0 0 2px rgba(6, 2, 3, 0.88)", padding: 14 }}>
        <Box mb="md" style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <StatFrame icon={helmetArt} label="Dat Do" value={`Level ${levelProgress.level}`} />
          <StatFrame icon={swordArt} label="Warrior" value={`Experience ${levelProgress.currentExperience}`} />
          <StatFrame icon={tokenLuckArt} label="Next Level" value={levelProgress.nextLevelExperience} />
        </Box>
        <Box style={{ display: "grid", gap: 14, gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.2fr)" }}>
          <Stack gap="sm">
            <Text size="xs" fw={900} c={STAT_GOLD} tt="uppercase">Base Attributes</Text>
            {primaryStats.map((stat) => (
              <D2StatRow
                key={stat.key}
                description={stat.description}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                canSpend={props.state.profile.statPoints > 0}
                onSpend={() => props.setState((previous) => spendStatPoint(previous, stat.key))}
              />
            ))}
            <StatFrame icon={naturalResistanceArt} label="Stat Points Remaining" value={props.state.profile.statPoints} tone={props.state.profile.statPoints > 0 ? "red" : "muted"} />
          </Stack>
          <Stack gap="xs">
            <Text size="xs" fw={900} c={STAT_GOLD} tt="uppercase">Combat Sheet</Text>
            {combatStats.map((stat) => (
              <D2ValueRow key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function StatFrame(props: { icon?: string; label: string; tone?: "muted" | "red"; value: React.ReactNode }) {
  const color = getStatFrameColor(props.tone);
  return (
    <Box px="sm" py={8} style={{ alignItems: "center", background: STAT_FRAME_BG, border: STAT_FRAME_BORDER, boxShadow: STAT_FRAME_SHADOW, display: "grid", gap: 8, gridTemplateColumns: props.icon ? "auto 1fr" : "1fr", minHeight: 52 }}>
      {props.icon && <StatHeroIcon icon={props.icon} size={STAT_SMALL_ICON_SIZE} />}
      <Box>
        <Text size="xs" ta={props.icon ? "left" : "center"} fw={900} c={STAT_GOLD}>{props.label}</Text>
        <Text size="sm" ta={props.icon ? "left" : "center"} fw={900} c={color}>{props.value}</Text>
      </Box>
    </Box>
  );
}

function getStatFrameColor(tone: "muted" | "red" | undefined) {
  if (tone === "red") {
    return "red.4";
  }
  if (tone === "muted") {
    return STAT_MUTED;
  }
  return STAT_TEXT;
}

function D2StatRow(props: { canSpend: boolean; description: string; icon: string; label: string; onSpend: () => void; value: number }) {
  return (
    <Box style={{ display: "grid", gap: 6, gridTemplateColumns: props.canSpend ? "1fr auto" : "1fr" }}>
      <Tooltip label={props.description} multiline withArrow withinPortal={false}>
        <Box component="span" style={{ display: "block" }} tabIndex={0}>
          <D2ValueRow icon={props.icon} label={props.label} value={props.value} />
        </Box>
      </Tooltip>
      {props.canSpend && <HeroSiegeButton height={24} minWidth={34} onClick={props.onSpend} style={{ alignSelf: "center", backgroundColor: STAT_PLUS_BG, border: STAT_PLUS_BORDER, padding: 0, width: 34 }}>+</HeroSiegeButton>}
    </Box>
  );
}

function D2ValueRow(props: { icon?: string; label: string; value: React.ReactNode }) {
  return (
    <Group justify="space-between" gap="xs" px="sm" py={6} wrap="nowrap" style={{ background: STAT_FRAME_BG, border: STAT_FRAME_BORDER, boxShadow: STAT_FRAME_SHADOW, minHeight: 42 }}>
      <Group gap="xs" wrap="nowrap">
        {props.icon && <StatHeroIcon icon={props.icon} size={STAT_SMALL_ICON_SIZE} />}
        <Text size="xs" fw={900} c={STAT_GOLD}>{props.label}</Text>
      </Group>
      <Text size="sm" fw={800} c={STAT_TEXT}>{props.value}</Text>
    </Group>
  );
}

function StatHeroIcon(props: { icon: string; size: number }) {
  return (
    <Box style={{ alignItems: "center", background: STAT_ICON_BOX_BG, border: "1px solid rgba(216, 193, 129, 0.58)", boxShadow: "inset 0 0 0 1px #050302, 0 2px 5px rgba(0, 0, 0, 0.45)", display: "flex", height: props.size, justifyContent: "center", width: props.size }}>
      <Box alt="" component="img" src={props.icon} style={{ display: "block", filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.72))", height: "86%", imageRendering: "pixelated", objectFit: "contain", width: "86%" }} />
    </Box>
  );
}

function WikiPanel() {
  return (
    <Tabs defaultValue="monsters" keepMounted={false}>
      <Tabs.List grow mb="md">
        <Tabs.Tab value="monsters">Monsters</Tabs.Tab>
        <Tabs.Tab value="relics">Relics</Tabs.Tab>
        <Tabs.Tab value="items">Items</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="monsters">
        <MonsterWiki />
      </Tabs.Panel>
      <Tabs.Panel value="relics">
        <RelicWiki />
      </Tabs.Panel>
      <Tabs.Panel value="items">
        <ItemWiki />
      </Tabs.Panel>
    </Tabs>
  );
}

function MonsterWiki() {
  const [page, setPage] = useState(0);
  const pageCount = getPageCount(MONSTER_WIKI_ENTRIES.length, WIKI_MONSTER_PAGE_SIZE);
  const safePage = clampPage(page, pageCount);
  const visibleMonsters = getPageItems(MONSTER_WIKI_ENTRIES, safePage, WIKI_MONSTER_PAGE_SIZE);
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Box>
          <Title order={4}>Monster Catalog</Title>
          <Text size="sm" c="dimmed">{MONSTER_WIKI_ENTRIES.length} monsters, including generated variants.</Text>
        </Box>
        <WikiPagination page={safePage} pageCount={pageCount} onPageChange={setPage} total={MONSTER_WIKI_ENTRIES.length} />
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
        {visibleMonsters.map((monster) => (
          <MonsterWikiCard key={monster.id} monster={monster} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function MonsterWikiCard(props: { monster: (typeof MONSTER_WIKI_ENTRIES)[number] }) {
  return (
    <Tooltip label={<MonsterWikiDetails monster={props.monster} />} multiline withArrow color="dark" styles={{ tooltip: { background: TOOLTIP_BG, border: TOOLTIP_BORDER, borderRadius: 2, boxShadow: TOOLTIP_SHADOW, color: "#f1dfad", padding: TOOLTIP_PADDING } }}>
      <Box p="sm" style={{ background: "var(--mantine-color-dark-7)", border: "1px solid var(--mantine-color-dark-4)", borderRadius: 6, minWidth: WIKI_GRID_MIN_WIDTH }}>
        <Group gap="sm" wrap="nowrap">
          <Box style={{ alignItems: "center", background: "#08070b", border: "1px solid #8a744c", display: "flex", flex: `0 0 ${WIKI_MONSTER_IMAGE_SIZE}px`, height: WIKI_MONSTER_IMAGE_SIZE, justifyContent: "center", width: WIKI_MONSTER_IMAGE_SIZE }}>
            <Box alt="" component="img" src={props.monster.art} style={{ display: "block", filter: props.monster.filter, height: "100%", imageRendering: "pixelated", objectFit: "contain", width: "100%" }} />
          </Box>
          <Box>
            <Text size="sm" fw={800}>{props.monster.name}</Text>
            <Text size="xs" c="dimmed">{props.monster.id}</Text>
          </Box>
        </Group>
      </Box>
    </Tooltip>
  );
}

function MonsterWikiDetails(props: { monster: (typeof MONSTER_WIKI_ENTRIES)[number] }) {
  const question = createWikiMonsterQuestion(props.monster);
  const bonuses = getUniqueMonsterBonuses(question);
  const health = getMonsterHealthRange(question);
  const resistances = getMonsterResistanceRows(bonuses);
  return (
    <Stack gap={8} style={{ textAlign: "center", width: TOOLTIP_SHEET_WIDTH }}>
      <Box>
        <Text size="lg" fw={900} tt="uppercase" style={{ color: "#e64b4b", letterSpacing: 0, textShadow: "0 2px 0 #000" }}>{props.monster.name}</Text>
        <Text size="sm" fw={800} c="gray.2">Difficulty {props.monster.difficulty} - Rating {props.monster.rating}</Text>
      </Box>
      <TooltipPowerRow label="Health" value={`${health.min}-${health.max}`} range={health} />
      <Stack gap={2}>
        {resistances.map((row) => (
          <TooltipAffixLine key={row.label} color={row.color} text={`${row.label} Resistance ${row.value}%`} range={{ min: row.value, max: row.value }} />
        ))}
      </Stack>
      {bonuses.length ? (
        <Text size="xs" fw={900} c="#ff8a3d">{bonuses.join(", ")}</Text>
      ) : (
        <Text size="xs" fw={900} c="gray.4">No unique affixes</Text>
      )}
    </Stack>
  );
}

function TooltipPowerRow(props: { label: string; range: { max: number; min: number }; value: React.ReactNode }) {
  return (
    <Group justify="center" gap={8} wrap="nowrap">
      <Text size="sm" fw={900} c="gray.1">{props.label}:</Text>
      <Text size="sm" fw={900} c="#6f6ff6">{props.value}</Text>
      <Text size="sm" fw={900} c="#20e020">[{props.range.min}-{props.range.max}]</Text>
    </Group>
  );
}

function TooltipAffixLine(props: { color: string; range: { max: number; min: number }; text: string }) {
  return (
    <Text size="sm" fw={900} style={{ color: props.color, lineHeight: 1.18, textShadow: "0 1px 0 #000" }}>
      {props.text} <Box component="span" c="#20e020">[{props.range.min}-{props.range.max}]</Box>
    </Text>
  );
}

function createWikiMonsterQuestion(monster: (typeof MONSTER_WIKI_ENTRIES)[number]): Question {
  return {
    constraints: [],
    difficulty: monster.difficulty,
    examples: [],
    functionName: "wikiMonster",
    hint: "",
    id: `wiki-${monster.id}`,
    prompt: "",
    rating: monster.rating,
    starter: "",
    tests: [],
    title: monster.name,
    topics: []
  };
}

function getMonsterHealthRange(question: Question) {
  const health = getMonsterMaxHealth(question);
  return {
    max: Math.ceil(health * (1 + MONSTER_HEALTH_RANGE_RATIO)),
    min: Math.max(1, Math.floor(health * (1 - MONSTER_HEALTH_RANGE_RATIO)))
  };
}

function getMonsterResistanceRows(bonuses: string[]) {
  const resistances = {
    Cold: MONSTER_BASE_RESISTANCE,
    Fire: MONSTER_BASE_RESISTANCE,
    Lightning: MONSTER_BASE_RESISTANCE,
    Magic: bonuses.includes("Magic Resistant") ? MONSTER_MAGIC_RESISTANCE : MONSTER_BASE_RESISTANCE,
    Physical: bonuses.includes("Stone Skin") ? MONSTER_STONE_SKIN_PHYSICAL_RESISTANCE : MONSTER_BASE_RESISTANCE,
    Poison: MONSTER_BASE_RESISTANCE
  };
  if (bonuses.includes("Fire Enchanted")) {
    resistances.Fire = MONSTER_ENCHANTED_RESISTANCE;
  }
  if (bonuses.includes("Cold Enchanted")) {
    resistances.Cold = MONSTER_ENCHANTED_RESISTANCE;
  }
  if (bonuses.includes("Lightning Enchanted")) {
    resistances.Lightning = MONSTER_ENCHANTED_RESISTANCE;
  }
  if (bonuses.includes("Spectral Hit")) {
    resistances.Cold = Math.max(resistances.Cold, MONSTER_SPECTRAL_RESISTANCE);
    resistances.Fire = Math.max(resistances.Fire, MONSTER_SPECTRAL_RESISTANCE);
    resistances.Lightning = Math.max(resistances.Lightning, MONSTER_SPECTRAL_RESISTANCE);
    resistances.Poison = Math.max(resistances.Poison, MONSTER_SPECTRAL_RESISTANCE);
  }
  return Object.entries(resistances)
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ color: getResistanceColor(label), label, value }));
}

function getResistanceColor(label: string) {
  if (label === "Fire") {
    return "#ff8a3d";
  }
  if (label === "Cold") {
    return "#73c7ff";
  }
  if (label === "Lightning") {
    return "#f0df5f";
  }
  if (label === "Poison") {
    return "#7cff7c";
  }
  return "#6f6ff6";
}

function RelicWiki() {
  const [page, setPage] = useState(0);
  const pageCount = getPageCount(RELIC_DEFINITIONS.length, WIKI_RELIC_PAGE_SIZE);
  const safePage = clampPage(page, pageCount);
  const visibleRelics = getPageItems(RELIC_DEFINITIONS, safePage, WIKI_RELIC_PAGE_SIZE);
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Box>
          <Title order={4}>Relic Catalog</Title>
          <Text size="sm" c="dimmed">{RELIC_DEFINITIONS.length} relics across all rarities.</Text>
        </Box>
        <WikiPagination page={safePage} pageCount={pageCount} onPageChange={setPage} total={RELIC_DEFINITIONS.length} />
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {visibleRelics.map((relic) => (
          <RelicWikiCard key={`${relic.id}-${relic.rarity}`} relic={relic} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function RelicWikiCard(props: { relic: Relic }) {
  const quality = getRelicQualityLabel(props.relic.rarity, props.relic.wikiRarityLabel);
  const qualityColor = getHeroSiegeQualityColor(quality);
  return (
    <Box p="sm" style={{ background: "var(--mantine-color-dark-7)", border: "1px solid var(--mantine-color-dark-4)", borderRadius: 6 }}>
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <RelicIcon relic={props.relic} size={WIKI_RELIC_ICON_SIZE} />
        <Box>
          <Group gap="xs" mb={2}>
            <Text size="sm" fw={800} c={qualityColor}>{props.relic.name}</Text>
            <Badge size="xs" variant="outline" style={{ borderColor: qualityColor, color: qualityColor }}>{quality}</Badge>
            {props.relic.source !== "any" && <Badge size="xs" color="red" variant="outline">{props.relic.source}</Badge>}
          </Group>
          <Text size="xs" c="dimmed">{props.relic.description}</Text>
          <Text size="xs" mt={4} c="yellow.3">{formatRelicModifiers(props.relic)}</Text>
        </Box>
      </Group>
    </Box>
  );
}

type WikiItemCategory = HeroSiegeWikiCategory;

const WIKI_ITEM_CATEGORIES = HERO_SIEGE_WIKI_CATEGORIES;
const WIKI_ITEMS = [...HERO_SIEGE_LOW_LEVEL_WIKI_EQUIPMENT, ...HERO_SIEGE_WIKI_ITEMS];
const WIKI_QUALITY_SORT_ORDER = ["Unique", "Set", "Rare", "Magic", "Normal"];

function ItemWiki() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<WikiItemCategory["id"]>(WIKI_ITEM_CATEGORIES[0].id);
  const [page, setPage] = useState(0);
  const selectedCategory = WIKI_ITEM_CATEGORIES.find((category) => category.id === selectedCategoryId) || WIKI_ITEM_CATEGORIES[0];
  const selectedItems = getWikiItemsForCategory(selectedCategory);
  const qualityCounts = getWikiQualityCounts(WIKI_ITEMS);
  const selectedCount = selectedItems.length;
  const pageCount = getPageCount(selectedCount, WIKI_ITEM_PAGE_SIZE);
  const safePage = clampPage(page, pageCount);
  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <Box>
          <Title order={4}>Item Catalog</Title>
          <Text size="sm" c="dimmed">
            {WIKI_ITEMS.length} Hero Siege wiki items across {WIKI_ITEM_CATEGORIES.length} equipment categories.
          </Text>
          <Group gap={6} mt={6}>
            {HERO_SIEGE_WIKI_QUALITY_DISTRIBUTION.map((quality) => (
              <Badge
                key={quality.label}
                size="sm"
                variant="outline"
                style={{ borderColor: getHeroSiegeQualityColor(quality.label), color: getHeroSiegeQualityColor(quality.label) }}
              >
                {quality.label} {qualityCounts[quality.label] || 0}
              </Badge>
            ))}
          </Group>
        </Box>
        <Group gap="xs" align="flex-end">
          <Select
            aria-label="Item category"
            data={WIKI_ITEM_CATEGORIES.map((category) => ({ label: category.label, value: category.id }))}
            value={selectedCategory.id}
            onChange={(value) => {
              setSelectedCategoryId((value || WIKI_ITEM_CATEGORIES[0].id) as WikiItemCategory["id"]);
              setPage(0);
            }}
            styles={{
              dropdown: { background: MODAL_BG, border: MODAL_BORDER },
              input: { background: "rgba(0, 0, 0, 0.42)", border: MODAL_BORDER, color: "#f1dfad", fontWeight: 800 },
              option: { color: "#f1dfad", fontWeight: 800 }
            }}
            w={220}
          />
          <WikiPagination page={safePage} pageCount={pageCount} onPageChange={setPage} total={selectedCount} />
        </Group>
      </Group>
      <ItemCategoryCard category={selectedCategory} items={selectedItems} page={safePage} pageSize={WIKI_ITEM_PAGE_SIZE} />
    </Stack>
  );
}

function getWikiItemsForCategory(category: WikiItemCategory) {
  return WIKI_ITEMS
    .filter((item) => item.category === category.sourcePage)
    .sort((left, right) => WIKI_QUALITY_SORT_ORDER.indexOf(getWikiItemQualityLabel(left)) - WIKI_QUALITY_SORT_ORDER.indexOf(getWikiItemQualityLabel(right))
      || Number(left.level || 0) - Number(right.level || 0)
      || left.name.localeCompare(right.name));
}

function getWikiQualityCounts(items: readonly HeroSiegeWikiItem[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const quality = getWikiItemQualityLabel(item);
    counts[quality] = (counts[quality] || 0) + 1;
    return counts;
  }, {});
}

function ItemCategoryCard(props: { category: WikiItemCategory; items: readonly HeroSiegeWikiItem[]; page: number; pageSize: number }) {
  const category = props.category;
  const visibleItems = getPageItems([...props.items], props.page, props.pageSize);
  return (
    <Box p="sm" style={{ background: "var(--mantine-color-dark-7)", border: "1px solid var(--mantine-color-dark-4)", borderRadius: 6 }}>
      <Group justify="space-between" mb="xs">
        <Title order={5}>{category.label}</Title>
        <Badge size="sm" variant="light">{props.items.length}</Badge>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {visibleItems.map((item) => (
          <WikiItemCard key={item.id} imageDisplay={HERO_SIEGE_WIKI_ITEM_IMAGE_DISPLAYS.get(item.id)} item={item} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

function WikiItemCard(props: { imageDisplay?: HeroSiegeWikiIconDisplay; item: HeroSiegeWikiItem }) {
  const quality = getWikiItemQualityLabel(props.item);
  return (
    <Tooltip label={<WikiItemDetails imageDisplay={props.imageDisplay} item={props.item} />} multiline withArrow color="dark" styles={{ tooltip: { background: TOOLTIP_BG, border: TOOLTIP_BORDER, borderRadius: 2, boxShadow: TOOLTIP_SHADOW, color: "#f1dfad", padding: TOOLTIP_PADDING } }}>
      <Group gap="xs" wrap="nowrap" p={6} style={{ background: "rgba(0, 0, 0, 0.22)", border: "1px solid rgba(210, 168, 84, 0.22)", minHeight: 64 }}>
        <WikiItemImage imageDisplay={props.imageDisplay} item={props.item} size={WIKI_ITEM_ICON_SIZE + 8} />
        <Box style={{ minWidth: 0 }}>
          <Text size="xs" fw={900} c={getHeroSiegeQualityColor(quality)} style={{ lineHeight: 1.2 }}>{props.item.name}</Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>{quality} {props.item.category} - Lvl {props.item.level || "?"}</Text>
          <Text size="xs" c="gray.4" style={{ lineHeight: 1.2 }}>{props.item.damage ? `Damage ${props.item.damage}` : "No weapon damage"}</Text>
        </Box>
      </Group>
    </Tooltip>
  );
}

function WikiItemDetails(props: { imageDisplay?: HeroSiegeWikiIconDisplay; item: HeroSiegeWikiItem }) {
  const item = props.item;
  const quality = getWikiItemQualityLabel(item);
  return (
    <Stack gap={8} style={{ textAlign: "center", width: TOOLTIP_SHEET_WIDTH }}>
      <Group gap="sm" justify="center" wrap="nowrap">
        <WikiItemImage imageDisplay={props.imageDisplay} item={item} size={52} />
        <Box>
          <Text size="lg" fw={900} tt="uppercase" style={{ color: getHeroSiegeQualityColor(quality), letterSpacing: 0, textShadow: "0 2px 0 #000" }}>{item.name}</Text>
          <Text size="sm" fw={800} c="gray.2">{quality} {item.category}</Text>
        </Box>
      </Group>
      <Group justify="center" gap={10}>
        {item.level && <TooltipPowerRow label="Level" value={item.level} range={{ min: Number(item.level) || 0, max: Number(item.level) || 0 }} />}
        {item.damage && <Text size="sm" fw={900} c="#f1dfad">Damage: <Box component="span" c="#6f6ff6">{item.damage}</Box></Text>}
        {item.aps && <Text size="sm" fw={900} c="#f1dfad">APS: <Box component="span" c="#6f6ff6">{item.aps}</Box></Text>}
        {item.dps && <Text size="sm" fw={900} c="#f1dfad">DPS: <Box component="span" c="#6f6ff6">{item.dps}</Box></Text>}
      </Group>
      <Stack gap={2}>
        {item.stats.length ? item.stats.map((stat, index) => (
          <Text key={`${stat}-${index}`} size="sm" fw={900} style={{ color: "#6f6ff6", lineHeight: 1.18, textShadow: "0 1px 0 #000" }}>{stat}</Text>
        )) : (
          <Text size="xs" fw={900} c="gray.4">No listed modifiers</Text>
        )}
      </Stack>
    </Stack>
  );
}

function WikiItemImage(props: { imageDisplay?: HeroSiegeWikiIconDisplay; item: HeroSiegeWikiItem; size: number }) {
  const maxNaturalHeight = Math.max(1, props.item.imageHeight || props.size);
  const maxNaturalWidth = Math.max(1, props.item.imageWidth || props.size);
  const aspectRatio = maxNaturalWidth / maxNaturalHeight;
  const imagePath = normalizeWikiImagePath(props.imageDisplay?.imagePath || getWikiItemPublicPath(props.item));
  return (
    <Box style={{ alignItems: "center", background: "#08070b", border: "1px solid #8a744c", display: "flex", flex: `0 0 ${props.size}px`, height: props.size, justifyContent: "center", width: props.size }}>
      {imagePath ? (
        <Box
          alt=""
          component="img"
          src={imagePath}
          style={{
            display: "block",
            filter: `${props.imageDisplay?.filter ? `${props.imageDisplay.filter} ` : ""}drop-shadow(0 2px 0 rgba(0, 0, 0, 0.72))`,
            height: aspectRatio < 0.72 ? "92%" : undefined,
            imageRendering: "pixelated",
            maxHeight: "92%",
            maxWidth: "92%",
            objectFit: "contain",
            width: aspectRatio >= 0.72 ? "92%" : undefined
          }}
        />
      ) : (
        <Text size="xs" fw={900}>?</Text>
      )}
    </Box>
  );
}

function normalizeWikiImagePath(imagePath: string | null) {
  return imagePath?.replace(/^\/hero_siege_wiki_items\//, "hero_siege_wiki_items/") || null;
}

function WikiPagination(props: { onPageChange: (page: number) => void; page: number; pageCount: number; total: number; unit?: string }) {
  if (props.pageCount <= 1) {
    return <Badge variant="light">{props.total}</Badge>;
  }
  return (
    <Group gap="xs" justify="flex-end">
      <HeroSiegeButton height={26} minWidth={64} disabled={props.page <= 0} onClick={() => props.onPageChange(props.page - 1)}>Prev</HeroSiegeButton>
      <Badge variant="light">Page {props.page + 1}/{props.pageCount}</Badge>
      <Badge variant="outline">{props.total} {props.unit || "entries"}</Badge>
      <HeroSiegeButton height={26} minWidth={64} disabled={props.page >= props.pageCount - 1} onClick={() => props.onPageChange(props.page + 1)}>Next</HeroSiegeButton>
    </Group>
  );
}

function getPageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(0, page), pageCount - 1);
}

function getPageItems<T>(items: T[], page: number, pageSize: number) {
  const start = page * pageSize;
  return items.slice(start, start + pageSize);
}

function formatRelicModifiers(relic: Relic) {
  const modifiers = relic.modifiers || [];
  if (!modifiers.length) {
    return "No stat modifiers";
  }
  return modifiers.map((modifier) => `${formatModifierKey(modifier.key)} ${formatModifierValue(modifier.value)}`).join(", ");
}

function formatModifierKey(key: ItemModifierKey) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function formatModifierValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function SettingsPanel(props: { setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const { settings, updateSettings } = useStudyBlockerSettings();
  const siteText = settings.distractingSites.join("\n");
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" fw={700}>Practice Mode</Text>
        <Badge variant="light">{props.state.mode === "leetcode" ? "LeetCode" : "System Design"}</Badge>
      </Group>
      <Switch
        checked={settings.enabled}
        label="Redirect distracting websites until daily study is complete"
        onChange={(event) => updateSettings({ ...settings, enabled: event.currentTarget.checked })}
      />
      <Switch
        checked={props.state.profile.godMode}
        color="yellow"
        label="God mode"
        description="Testing mode: no health or mana loss from failures, and completed questions always drop an item."
        onChange={(event) => props.setState((previous) => ({ ...previous, profile: { ...previous.profile, godMode: event.currentTarget.checked } }))}
      />
      <NumberInput
        allowDecimal={false}
        label="Study minutes per day"
        min={DAILY_MINUTES_MIN}
        max={DAILY_MINUTES_MAX}
        step={DAILY_MINUTES_STEP}
        value={settings.dailyMinutes}
        onChange={(value) => updateSettings({ ...settings, dailyMinutes: normalizeDailyMinutes(value) })}
      />
      <Textarea
        autosize
        minRows={SITE_TEXTAREA_MIN_ROWS}
        label="Distracting sites"
        description="One domain per line, for example reddit.com or youtube.com."
        value={siteText}
        onChange={(event) => updateSettings({ ...settings, distractingSites: normalizeDistractingSites(event.currentTarget.value) })}
      />
      <Group gap="xs">
        <IconSparkles size={ICON_SIZE} />
        <Text size="sm" c="dimmed">When unfinished, those sites open Study Ladder instead.</Text>
      </Group>
      <Group justify="flex-end">
        <HeroSiegeButton
          onClick={() => {
            if (window.confirm("Reset all progress, inventory, relics, skills, map, and settings for this game state?")) {
              props.setState(defaultState());
            }
          }}
          style={{ color: "#ffd6c9", filter: "drop-shadow(0 0 8px rgba(180, 35, 35, 0.35))" }}
        >
          Reset Everything
        </HeroSiegeButton>
      </Group>
    </Stack>
  );
}

function normalizeDailyMinutes(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return DAILY_MINUTES_MIN;
  }
  return Math.min(DAILY_MINUTES_MAX, Math.max(DAILY_MINUTES_MIN, Math.round(numericValue)));
}

function normalizeDistractingSites(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((site) => normalizeDomain(site))
    .filter(Boolean);
}

function normalizeDomain(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }
  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^www\./, "").replace(/\/.*$/, "");
  }
}

function ProgressRow(props: { color: string; label: string; max: number; value: number }) {
  return (
    <Box>
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={700}>{props.label}</Text>
        <Text size="sm">{props.value}/{props.max}</Text>
      </Group>
      <Progress color={props.color} value={(props.value / props.max) * PROGRESS_MAX} />
    </Box>
  );
}

function StatTile(props: { action?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Box p="sm" style={{ border: "1px solid var(--mantine-color-dark-4)", borderRadius: 6 }}>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Box>
          <Text size="xs" c="dimmed">{props.label}</Text>
          <Text fw={800}>{props.value}</Text>
        </Box>
        {props.action}
      </Group>
    </Box>
  );
}
