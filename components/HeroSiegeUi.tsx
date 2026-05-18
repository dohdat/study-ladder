import { forwardRef } from "react";
import { Box, Group, Text } from "@mantine/core";
type StaticImageData = string;

import menuButtonBg from "../assets/hero_siege_inventory/menu-button.png";
import menuButtonHighlightBg from "../assets/hero_siege_inventory/menu-button-highlight.png";
import tabExtraBg from "../assets/hero_siege_inventory/tab-extra.png";
import tabMainBg from "../assets/hero_siege_inventory/tab-main.png";

const HERO_FONT = "inherit";
const HERO_TEXT = "#ffe8a8";
const HERO_DISABLED_OPACITY = 0.42;
const HERO_BUTTON_HEIGHT = 35;
const HERO_BUTTON_MIN_WIDTH = 92;
const HERO_TAB_HEIGHT = 33;
const HERO_TAB_WIDTH = 96;
const SYSTEM_TAB_WIDTH = 150;
const HERO_BUTTON_TEXT_SHADOW = "0 2px 0 #000";
const HERO_BUTTON_FILTER = "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.32))";
const HERO_HOVER_FILTER = "brightness(1.14) drop-shadow(0 0 8px rgba(255, 232, 168, 0.36))";

type HeroSiegeButtonProps = {
  active?: boolean;
  "aria-label"?: string;
  children: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  height?: number;
  leftSection?: React.ReactNode;
  loading?: boolean;
  minWidth?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  width?: number | string;
};

export const HeroSiegeButton = forwardRef<HTMLButtonElement, HeroSiegeButtonProps>(function HeroSiegeButton(props, ref) {
  const unavailable = isHeroButtonUnavailable(props);
  return (
    <Box
      aria-label={props["aria-label"]}
      component="button"
      disabled={unavailable}
      onClick={props.onClick}
      ref={ref}
      type={props.type || "button"}
      style={getHeroButtonStyle(props, unavailable)}
      onMouseEnter={(event) => {
        if (!unavailable) {
          event.currentTarget.style.filter = HERO_HOVER_FILTER;
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.filter = HERO_BUTTON_FILTER;
      }}
    >
      {props.leftSection}
      <Text span inherit fw={900} lh={1}>
        {props.loading ? "Working..." : props.children}
      </Text>
    </Box>
  );
});

function isHeroButtonUnavailable(props: HeroSiegeButtonProps) {
  return Boolean(props.disabled || props.loading);
}

function getHeroButtonStyle(props: HeroSiegeButtonProps, unavailable: boolean): React.CSSProperties {
  const background = props.active ? menuButtonHighlightBg : menuButtonBg;
  return {
    alignItems: "center",
    backgroundColor: "transparent",
    backgroundImage: `url(${background})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    border: 0,
    color: HERO_TEXT,
    cursor: unavailable ? "default" : "pointer",
    display: props.fullWidth ? "flex" : "inline-flex",
    filter: HERO_BUTTON_FILTER,
    fontFamily: HERO_FONT,
    fontSize: 12,
    fontWeight: 900,
    gap: 6,
    height: props.height || HERO_BUTTON_HEIGHT,
    imageRendering: "pixelated",
    justifyContent: "center",
    letterSpacing: 0,
    lineHeight: 1,
    minWidth: props.minWidth || HERO_BUTTON_MIN_WIDTH,
    opacity: props.disabled ? HERO_DISABLED_OPACITY : 1,
    padding: "0 14px",
    textShadow: HERO_BUTTON_TEXT_SHADOW,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    width: props.fullWidth ? "100%" : props.width,
    ...props.style
  };
}

type HeroSiegeTabButtonProps = {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  width?: number;
};

export function HeroSiegeTabButton(props: HeroSiegeTabButtonProps) {
  const asset = props.active ? tabMainBg : tabExtraBg;
  return (
    <Box
      component="button"
      onClick={props.onClick}
      type="button"
      style={{
        alignItems: "center",
        backgroundColor: "transparent",
        backgroundImage: `url(${asset})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        border: 0,
        color: props.active ? "#fff0b8" : "#c8b48a",
        cursor: "pointer",
        display: "inline-flex",
        filter: props.active ? HERO_HOVER_FILTER : HERO_BUTTON_FILTER,
        fontFamily: HERO_FONT,
        fontSize: 12,
        fontWeight: 900,
        height: HERO_TAB_HEIGHT,
        imageRendering: "pixelated",
        justifyContent: "center",
        letterSpacing: 0,
        padding: "0 14px",
        textShadow: HERO_BUTTON_TEXT_SHADOW,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        width: props.width || HERO_TAB_WIDTH
      }}
    >
      {props.children}
    </Box>
  );
}

export function HeroSiegeModeSwitch(props: { mode: string; onChange: (mode: "leetcode" | "system") => void }) {
  return (
    <Group gap={0} wrap="nowrap">
      <HeroSiegeTabButton active={props.mode === "leetcode"} onClick={() => props.onChange("leetcode")}>LeetCode</HeroSiegeTabButton>
      <HeroSiegeTabButton active={props.mode === "system"} onClick={() => props.onChange("system")} width={SYSTEM_TAB_WIDTH}>System Design</HeroSiegeTabButton>
    </Group>
  );
}

export function getHeroSiegeMenuButtonAsset(): StaticImageData {
  return menuButtonBg;
}
