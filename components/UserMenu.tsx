import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  NumberFormatter,
  NumberInput,
  Textarea,
  Progress,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconChartBar, IconCircleCheck, IconSettings, IconSparkles, IconTrophy, IconUser } from "@tabler/icons-react";

import { CoinAmount } from "./CoinIcon";
import { questions } from "../data/questions";
import { STUDY_BLOCKER_MS_PER_MINUTE, useStudyBlockerSettings } from "../hooks/useStudyBlocker";
import { EXPERIENCE_PER_LEVEL, MAX_HEALTH, getLevelProgress, getProfileStats, getTopicStats } from "../lib/studyCore";
import type { StudyState } from "../types/study";

const ICON_SIZE = 16;
const MENU_WIDTH = 180;
const PROGRESS_MAX = 100;
const TOPIC_PREVIEW_LIMIT = 6;
const STREAK_ACHIEVEMENT_COUNT = 3;
const GEARED_UP_LEVEL = 5;
const DAILY_MINUTES_MIN = 0;
const DAILY_MINUTES_MAX = 720;
const DAILY_MINUTES_STEP = 5;
const MINUTES_DECIMAL_PLACES = 1;
const SITE_TEXTAREA_MIN_ROWS = 4;

const USER_MENU_ITEMS = [
  { id: "profile", icon: IconUser, label: "Profile" },
  { id: "stats", icon: IconChartBar, label: "Stats" },
  { id: "achievements", icon: IconTrophy, label: "Achievements" },
  { id: "settings", icon: IconSettings, label: "Settings" }
] as const;

type UserMenuSection = typeof USER_MENU_ITEMS[number]["id"];

export function UserMenu(props: { state: StudyState }) {
  const [activeSection, setActiveSection] = useState<UserMenuSection | null>(null);
  const modalTitle = USER_MENU_ITEMS.find((item) => item.id === activeSection)?.label || "User";
  return (
    <>
      <Menu position="bottom-end" width={MENU_WIDTH} shadow="md">
        <Menu.Target>
          <Button variant="default" leftSection={<IconUser size={ICON_SIZE} />}>User</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {USER_MENU_ITEMS.map((item) => (
            <Menu.Item key={item.label} leftSection={<item.icon size={ICON_SIZE} />} onClick={() => setActiveSection(item.id)}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <Modal opened={Boolean(activeSection)} onClose={() => setActiveSection(null)} title={modalTitle} centered size="lg">
        <UserModalContent section={activeSection} state={props.state} />
      </Modal>
    </>
  );
}

function UserModalContent(props: { section: UserMenuSection | null; state: StudyState }) {
  if (props.section === "stats") {
    return <StatsPanel state={props.state} />;
  }
  if (props.section === "achievements") {
    return <AchievementsPanel state={props.state} />;
  }
  if (props.section === "settings") {
    return <SettingsPanel state={props.state} />;
  }
  return <ProfilePanel state={props.state} />;
}

function ProfilePanel(props: { state: StudyState }) {
  const levelProgress = useMemo(() => getLevelProgress(props.state), [props.state]);
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
        <ProgressRow label="Health" value={props.state.profile.health} max={MAX_HEALTH} color="red" />
        <ProgressRow label="Experience" value={levelProgress.currentExperience} max={levelProgress.nextLevelExperience} color="yellow" />
      </Stack>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        <StatTile label="Coins" value={<CoinAmount value={props.state.profile.coins} />} />
        <StatTile label="Level XP" value={`${levelProgress.currentExperience}/${EXPERIENCE_PER_LEVEL}`} />
        <StatTile label="Hints" value={props.state.profile.hintsBought} />
      </SimpleGrid>
    </Stack>
  );
}

function StatsPanel(props: { state: StudyState }) {
  const profile = useMemo(() => getProfileStats(props.state), [props.state]);
  const topics = useMemo(() => getTopicStats(props.state), [props.state]);
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <StatTile label="Attempted" value={profile.attempted} />
        <StatTile label="Solved" value={profile.solved} />
        <StatTile label="Mastered" value={`${profile.mastered}/${questions.length}`} />
        <StatTile label="Pass Rate" value={<NumberFormatter value={profile.accuracy} suffix="%" />} />
      </SimpleGrid>
      <Stack gap="sm">
        <Text size="sm" fw={700}>Topic Mastery</Text>
        {topics.slice(0, TOPIC_PREVIEW_LIMIT).map((topic) => (
          <Box key={topic.topic}>
            <Group justify="space-between" mb={4}>
              <Text size="sm">{topic.topic}</Text>
              <Text size="xs" c="dimmed">{topic.mastered}/{topic.total}</Text>
            </Group>
            <Progress value={(topic.mastered / topic.total) * PROGRESS_MAX} />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

function AchievementsPanel(props: { state: StudyState }) {
  const profile = useMemo(() => getProfileStats(props.state), [props.state]);
  const levelProgress = useMemo(() => getLevelProgress(props.state), [props.state]);
  const achievements = [
    { earned: profile.solved > 0, label: "First Clear", detail: "Solve one practice question." },
    { earned: props.state.streak >= STREAK_ACHIEVEMENT_COUNT, label: "Hot Streak", detail: "Pass three questions in a row." },
    { earned: profile.mastered > 0, label: "Mastery Mark", detail: "Master one question through review." },
    { earned: levelProgress.level >= GEARED_UP_LEVEL, label: "Geared Up", detail: "Reach level 5." }
  ];
  return (
    <Stack gap="sm">
      {achievements.map((achievement) => (
        <Group key={achievement.label} gap="sm" wrap="nowrap">
          <ThemeIcon color={achievement.earned ? "yellow" : "gray"} variant={achievement.earned ? "filled" : "light"}>
            {achievement.earned ? <IconTrophy size={ICON_SIZE} /> : <IconCircleCheck size={ICON_SIZE} />}
          </ThemeIcon>
          <Box flex={1}>
            <Group gap="xs">
              <Text size="sm" fw={700}>{achievement.label}</Text>
              <Badge size="xs" variant="light" color={achievement.earned ? "green" : "gray"}>
                {achievement.earned ? "Unlocked" : "Locked"}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">{achievement.detail}</Text>
          </Box>
        </Group>
      ))}
    </Stack>
  );
}

function SettingsPanel(props: { state: StudyState }) {
  const { progress, settings, updateSettings } = useStudyBlockerSettings();
  const studiedMinutes = progress.studiedMs / STUDY_BLOCKER_MS_PER_MINUTE;
  const progressValue = settings.dailyMinutes > 0 ? (studiedMinutes / settings.dailyMinutes) * PROGRESS_MAX : PROGRESS_MAX;
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
      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={700}>Today</Text>
          <Text size="sm">{studiedMinutes.toFixed(MINUTES_DECIMAL_PLACES)} / {settings.dailyMinutes} min</Text>
        </Group>
        <Progress value={Math.min(PROGRESS_MAX, progressValue)} />
      </Box>
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

function StatTile(props: { label: string; value: React.ReactNode }) {
  return (
    <Box p="sm" style={{ border: "1px solid var(--mantine-color-dark-4)", borderRadius: 6 }}>
      <Text size="xs" c="dimmed">{props.label}</Text>
      <Text fw={800}>{props.value}</Text>
    </Box>
  );
}
