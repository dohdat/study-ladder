import { useEffect, useState } from "react";
import { Box, Group, Text } from "@mantine/core";

import menuButtonBg from "../assets/hero_siege_inventory/menu-button.png";
import tabSquareBg from "../assets/hero_siege_inventory/tab-square.png";
import { HeroSiegeModeSwitch } from "./HeroSiegeUi";
import { PlayerStatus } from "./PlayerStatus";
import { UserMenu, USER_MENU_SHORTCUTS } from "./UserMenu";
import type { UserMenuSection } from "./UserMenu";
import { STUDY_BLOCKER_MS_PER_MINUTE, useStudyBlockerSettings } from "../hooks/useStudyBlocker";
import type { ActiveWarriorSkillId, StudyState } from "../types/study";
import type { CombatImpactVisual } from "./MonsterEncounter";

const PROGRESS_MAX = 100;
const MINUTES_DECIMAL_PLACES = 1;
const TODAY_PROGRESS_WIDTH = 360;
const TODAY_PANEL_HEIGHT = 64;
const TODAY_PROGRESS_HEIGHT = 12;
const HERO_TEXT = "#ffe8a8";
const HERO_DIM = "#c7b081";
const HERO_PANEL_BG = "linear-gradient(180deg, rgba(20, 13, 9, 0.98), rgba(7, 5, 4, 0.98))";
const HERO_PANEL_BORDER = "1px solid rgba(157, 114, 38, 0.84)";
const HERO_PANEL_SHADOW = "inset 0 0 0 1px #050403, inset 0 0 18px rgba(114, 36, 20, 0.28), 0 8px 16px rgba(0, 0, 0, 0.34)";
const HERO_PROGRESS_BG = "linear-gradient(180deg, #07070b, #020204)";
const TODAY_PROGRESS_FILL = "linear-gradient(180deg, #53b8ff 0%, #167bdd 55%, #063c8f 100%)";

export function AppHeader(props: {
  coins: number;
  currentExperience: number;
  health: number;
  hidePlayerStatus?: boolean;
  level: number;
  mana: number;
  maxHealth: number;
  maxMana: number;
  modeValue: string;
  nextLevelExperience: number;
  playerImpact?: CombatImpactVisual | null;
  rating: number;
  state: StudyState;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  useActiveSkill: (skillId: ActiveWarriorSkillId) => void;
}) {
  const [activeSection, setActiveSection] = useState<UserMenuSection | null>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat || isEditableShortcutTarget(event.target)) {
        return;
      }
      const shortcut = USER_MENU_SHORTCUTS.find((item) => item.key === event.key.toLowerCase());
      if (!shortcut) {
        return;
      }
      event.preventDefault();
      setActiveSection(shortcut.section);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Group justify="space-between" align="flex-start" wrap="wrap">
      <Group align="flex-start" gap="md" wrap="wrap">
        {!props.hidePlayerStatus && (
          <PlayerStatus
            coins={props.coins}
            currentExperience={props.currentExperience}
            health={props.health}
            level={props.level}
            mana={props.mana}
            maxHealth={props.maxHealth}
            maxMana={props.maxMana}
            nextLevelExperience={props.nextLevelExperience}
            onOpenStats={() => setActiveSection("stats")}
            playerImpact={props.playerImpact}
            rating={props.rating}
            state={props.state}
            useActiveSkill={props.useActiveSkill}
          />
        )}
        <TodayProgress />
      </Group>
      <Group>
        <HeroSiegeModeSwitch mode={props.modeValue} onChange={(mode) => props.setState((previous) => ({ ...previous, mode }))} />
        <UserMenu activeSection={activeSection} setActiveSection={setActiveSection} state={props.state} setState={props.setState} />
      </Group>
    </Group>
  );
}

function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ["input", "select", "textarea"].includes(tagName) || Boolean(target.closest("[contenteditable='true'], [role='textbox'], .monaco-editor"));
}

function TodayProgress() {
  const { progress, settings } = useStudyBlockerSettings();
  const studiedMinutes = progress.studiedMs / STUDY_BLOCKER_MS_PER_MINUTE;
  const progressValue = settings.dailyMinutes > 0 ? (studiedMinutes / settings.dailyMinutes) * PROGRESS_MAX : PROGRESS_MAX;
  const clampedProgress = Math.min(PROGRESS_MAX, Math.max(0, progressValue));
  return (
    <Box
      style={{
        background: HERO_PANEL_BG,
        border: HERO_PANEL_BORDER,
        borderRadius: 2,
        boxShadow: HERO_PANEL_SHADOW,
        height: TODAY_PANEL_HEIGHT,
        imageRendering: "pixelated",
        minWidth: TODAY_PROGRESS_WIDTH,
        padding: "9px 13px 10px",
        position: "relative"
      }}
    >
      <Box
        aria-hidden="true"
        style={{
          backgroundImage: `url(${menuButtonBg})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          bottom: 5,
          left: 7,
          opacity: 0.28,
          position: "absolute",
          right: 7,
          top: 5
        }}
      />
      <Group justify="space-between" mb={6} wrap="nowrap" style={{ position: "relative" }}>
        <Text size="sm" fw={900} style={{ color: HERO_TEXT, textShadow: "0 2px 0 #000" }}>Today</Text>
        <Text size="sm" fw={800} style={{ color: HERO_DIM, textShadow: "0 2px 0 #000" }}>{studiedMinutes.toFixed(MINUTES_DECIMAL_PLACES)} / {settings.dailyMinutes} min</Text>
      </Group>
      <Box
        aria-label={`Daily study progress ${Math.round(clampedProgress)}%`}
        role="progressbar"
        style={{
          background: HERO_PROGRESS_BG,
          border: "1px solid rgba(0, 0, 0, 0.94)",
          boxShadow: "inset 0 0 0 1px rgba(255, 232, 168, 0.08), 0 2px 0 rgba(0, 0, 0, 0.7)",
          height: TODAY_PROGRESS_HEIGHT,
          overflow: "hidden",
          position: "relative"
        }}
      >
        <Box
          style={{
            background: TODAY_PROGRESS_FILL,
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.26), inset 0 -1px 0 rgba(0, 0, 0, 0.42)",
            height: "100%",
            width: `${clampedProgress}%`
          }}
        />
        <Box
          aria-hidden="true"
          style={{
            backgroundImage: `url(${tabSquareBg})`,
            backgroundPosition: "center",
            backgroundSize: "100% 100%",
            inset: 0,
            opacity: 0.16,
            position: "absolute"
          }}
        />
      </Box>
    </Box>
  );
}
