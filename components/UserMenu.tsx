import { useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  NumberInput,
  Textarea,
  Progress,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
  Title
} from "@mantine/core";
import { IconBackpack, IconChartBar, IconSettings, IconSparkles, IconSword, IconTrophy, IconUser } from "@tabler/icons-react";

import { AchievementsPanel } from "./AchievementsPanel";
import { CoinAmount } from "./CoinIcon";
import { InventoryPanel } from "./InventoryPanel";
import { WarriorSkillTree } from "./WarriorSkillTree";
import { questions } from "../data/questions";
import { useStudyBlockerSettings } from "../hooks/useStudyBlocker";
import {
  EXPERIENCE_PER_LEVEL,
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
import type { CharacterStatKey, StudyState } from "../types/study";

const ICON_SIZE = 16;
const MENU_WIDTH = 180;
const ACHIEVEMENTS_MODAL_SIZE = 920;
const SKILLS_MODAL_SIZE = 920;
const MODAL_TRANSITION_DURATION = 0;
const PROGRESS_MAX = 100;
const DAILY_MINUTES_MIN = 0;
const DAILY_MINUTES_MAX = 720;
const DAILY_MINUTES_STEP = 5;
const SITE_TEXTAREA_MIN_ROWS = 4;
const STAT_SHEET_BG = "radial-gradient(circle at 48% 16%, #45423a 0%, #292722 42%, #11100e 100%)";
const STAT_SHEET_BORDER = "2px solid #9b8656";
const STAT_FRAME_BG = "rgba(0, 0, 0, 0.48)";
const STAT_FRAME_BORDER = "1px solid #c8b27b";
const STAT_FRAME_SHADOW = "inset 0 0 0 1px #090806";
const STAT_GOLD = "#d8c181";
const STAT_TEXT = "#f1ead7";
const STAT_MUTED = "#9f9888";
const STAT_PLUS_BG = "#7b1717";
const STAT_PLUS_BORDER = "1px solid #caa36a";
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

const USER_MENU_ITEMS = [
  { id: "profile", icon: IconUser, label: "Profile" },
  { id: "inventory", icon: IconBackpack, label: "Inventory" },
  { id: "skills", icon: IconSword, label: "Skills" },
  { id: "stats", icon: IconChartBar, label: "Stats" },
  { id: "achievements", icon: IconTrophy, label: "Achievements" },
  { id: "settings", icon: IconSettings, label: "Settings" }
] as const;

export type UserMenuSection = typeof USER_MENU_ITEMS[number]["id"];

export function UserMenu(props: { activeSection: UserMenuSection | null; setActiveSection: (section: UserMenuSection | null) => void; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const modalTitle = USER_MENU_ITEMS.find((item) => item.id === props.activeSection)?.label || "User";
  return (
    <>
      <Menu position="bottom-end" width={MENU_WIDTH} shadow="md">
        <Menu.Target>
          <Button variant="default" leftSection={<IconUser size={ICON_SIZE} />}>User</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {USER_MENU_ITEMS.map((item) => (
            <Menu.Item key={item.label} leftSection={<item.icon size={ICON_SIZE} />} onClick={() => props.setActiveSection(item.id)}>
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
  if (props.section === "settings") {
    return <SettingsPanel state={props.state} />;
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
            action={<Button size="compact-xs" variant="light" disabled={props.state.profile.statPoints <= 0} onClick={() => props.setState((previous) => spendStatPoint(previous, stat.key))}>Add</Button>}
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
  return (
    <Box p="md" style={{ background: STAT_SHEET_BG, border: STAT_SHEET_BORDER, boxShadow: STAT_FRAME_SHADOW }}>
      <Box mb="sm" style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <StatFrame label="Dat Do" value={`Level ${levelProgress.level}`} />
        <StatFrame label="Warrior" value={`Experience ${levelProgress.currentExperience}`} />
        <StatFrame label="Next Level" value={levelProgress.nextLevelExperience} />
      </Box>
      <Box style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.2fr)" }}>
        <Stack gap="sm">
          {STAT_ROWS.map((stat) => (
            <D2StatRow
              key={stat.key}
              description={STAT_DESCRIPTIONS[stat.key]}
              label={stat.label}
              value={stats[stat.key]}
              canSpend={props.state.profile.statPoints > 0}
              onSpend={() => props.setState((previous) => spendStatPoint(previous, stat.key))}
            />
          ))}
          <StatFrame label="Stat Points Remaining" value={props.state.profile.statPoints} tone={props.state.profile.statPoints > 0 ? "red" : "muted"} />
        </Stack>
        <Stack gap="xs">
          <D2ValueRow label="Attack Damage" value={getAttackDamage(sampleQuestion, props.state)} />
          <D2ValueRow label="Critical Strike" value={`${criticalChance}%`} />
          <D2ValueRow label="Fail Damage" value={getHealthLoss(props.state)} />
          <D2ValueRow label="Defense" value={modifiers.damageReduction + skillBonuses.damageReduction} />
          <D2ValueRow label="Life" value={`${props.state.profile.health} / ${maxHealth}`} />
          <D2ValueRow label="Mana" value={`${props.state.profile.mana} / ${maxMana}`} />
          <D2ValueRow label="Fire Resist" value={`${resistances.fire}%`} />
          <D2ValueRow label="Cold Resist" value={`${resistances.cold}%`} />
          <D2ValueRow label="Lightning Resist" value={`${resistances.lightning}%`} />
          <D2ValueRow label="Poison Resist" value={`${resistances.poison}%`} />
          <D2ValueRow label="Magic Find" value={`${modifiers.magicFindPercent + skillBonuses.magicFindPercent}%`} />
          <D2ValueRow label="Gold Find" value={`${modifiers.goldFindPercent + skillBonuses.goldFindPercent}%`} />
          <D2ValueRow label="Bonus XP" value={`${modifiers.bonusXpPercent + skillBonuses.bonusXpPercent}%`} />
        </Stack>
      </Box>
    </Box>
  );
}

function StatFrame(props: { label: string; tone?: "muted" | "red"; value: React.ReactNode }) {
  const color = getStatFrameColor(props.tone);
  return (
    <Box px="sm" py={6} style={{ background: STAT_FRAME_BG, border: STAT_FRAME_BORDER, boxShadow: STAT_FRAME_SHADOW }}>
      <Text size="xs" ta="center" fw={800} c={STAT_GOLD}>{props.label}</Text>
      <Text size="sm" ta="center" fw={800} c={color}>{props.value}</Text>
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

function D2StatRow(props: { canSpend: boolean; description: string; label: string; onSpend: () => void; value: number }) {
  return (
    <Box style={{ display: "grid", gap: 6, gridTemplateColumns: props.canSpend ? "1fr auto" : "1fr" }}>
      <Tooltip label={props.description} multiline withArrow withinPortal={false}>
        <Box component="span" style={{ display: "block" }} tabIndex={0}>
          <D2ValueRow label={props.label} value={props.value} />
        </Box>
      </Tooltip>
      {props.canSpend && <Button size="compact-xs" onClick={props.onSpend} style={{ alignSelf: "center", background: STAT_PLUS_BG, border: STAT_PLUS_BORDER }}>+</Button>}
    </Box>
  );
}

function D2ValueRow(props: { label: string; value: React.ReactNode }) {
  return (
    <Group justify="space-between" gap="xs" px="sm" py={5} wrap="nowrap" style={{ background: STAT_FRAME_BG, border: STAT_FRAME_BORDER, boxShadow: STAT_FRAME_SHADOW }}>
      <Text size="xs" fw={800} c={STAT_GOLD}>{props.label}</Text>
      <Text size="sm" fw={800} c={STAT_TEXT}>{props.value}</Text>
    </Group>
  );
}

function SettingsPanel(props: { state: StudyState }) {
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
