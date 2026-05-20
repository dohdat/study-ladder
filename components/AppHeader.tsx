import { useEffect, useState } from "react";
import { Box, Group, Text } from "@mantine/core";

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
const TODAY_PROGRESS_WIDTH = 330;
const TODAY_PANEL_HEIGHT = 58;
const TODAY_PROGRESS_HEIGHT = 14;
const HERO_TEXT = "#ffe8a8";
const HERO_DIM = "#c7b081";
const HERO_PANEL_BG = "linear-gradient(180deg, rgba(35, 8, 10, 0.98), rgba(9, 5, 4, 0.98))";
const HERO_PANEL_BORDER = "1px solid rgba(157, 114, 38, 0.72)";
const HERO_PANEL_SHADOW = "inset 0 0 0 1px #050403, inset 0 0 18px rgba(114, 36, 20, 0.22), 0 8px 16px rgba(0, 0, 0, 0.34)";
const HERO_PROGRESS_BG = "linear-gradient(180deg, #050406, #131018 48%, #050406)";
const TODAY_PROGRESS_FILL = "linear-gradient(180deg, #53b8ff 0%, #167bdd 55%, #063c8f 100%)";

export function AppHeader(props: {
  coins: number;
  health: number;
  hidePlayerStatus?: boolean;
  maxHealth: number;
  modeValue: string;
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
            health={props.health}
            maxHealth={props.maxHealth}
            onOpenStats={() => setActiveSection("profile")}
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
        display: "flex",
        flexDirection: "column",
        gap: 7,
        height: TODAY_PANEL_HEIGHT,
        imageRendering: "pixelated",
        minWidth: TODAY_PROGRESS_WIDTH,
        padding: "8px 12px",
        position: "relative"
      }}
    >
      <Group justify="space-between" wrap="nowrap" style={{ minHeight: 18 }}>
        <Text size="sm" fw={900} style={{ color: HERO_TEXT, lineHeight: 1, textShadow: "0 2px 0 #000" }}>Today</Text>
        <Text size="sm" fw={900} style={{ color: HERO_TEXT, fontVariantNumeric: "tabular-nums", lineHeight: 1, textShadow: "0 2px 0 #000" }}>{studiedMinutes.toFixed(MINUTES_DECIMAL_PLACES)} / {settings.dailyMinutes} min</Text>
      </Group>
      <Box
        aria-label={`Daily study progress ${Math.round(clampedProgress)}%`}
        role="progressbar"
        style={{
          background: HERO_PROGRESS_BG,
          border: "1px solid rgba(0, 0, 0, 0.94)",
          boxShadow: "inset 0 0 0 1px rgba(255, 232, 168, 0.12), 0 2px 0 rgba(0, 0, 0, 0.7)",
          height: TODAY_PROGRESS_HEIGHT,
          overflow: "hidden",
          padding: 2,
          position: "relative"
        }}
      >
        <Box
          style={{
            background: TODAY_PROGRESS_FILL,
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 -1px 0 rgba(0, 0, 0, 0.48), 0 0 8px rgba(58, 151, 255, 0.42)",
            height: "100%",
            minWidth: clampedProgress > 0 ? 6 : 0,
            position: "relative",
            zIndex: 1,
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
