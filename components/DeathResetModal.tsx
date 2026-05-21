import { Box, Group, Stack, Text } from "@mantine/core";

import charmedBloodArt from "../assets/hero_siege_relics/charmed-blood.png";
import deathsScytheArt from "../assets/hero_siege_relics/deaths-scythe.png";
import devilSkullArt from "../assets/hero_siege_relics/devil-skull.png";
import tombstoneArt from "../assets/hero_siege_map/tombstone.png";
import { HeroSiegeButton } from "./HeroSiegeUi";

const PAGE_BG = "radial-gradient(circle at 50% 44%, rgba(78, 0, 0, 0.34), rgba(0, 0, 0, 0.92) 34%, #000 72%)";
const LINE_BG = "linear-gradient(90deg, transparent, rgba(172, 171, 144, 0.24), rgba(223, 224, 182, 0.7), rgba(172, 171, 144, 0.24), transparent)";
const RED_TEXT = "#c91c1c";
const GOLD_TEXT = "#ffe8a8";
const PANEL_BG = "linear-gradient(180deg, rgba(25, 6, 8, 0.96), rgba(5, 4, 5, 0.98))";
const PANEL_BORDER = "1px solid rgba(154, 36, 36, 0.72)";
const PANEL_SHADOW = "0 18px 56px rgba(0, 0, 0, 0.72), inset 0 0 0 1px rgba(255, 232, 168, 0.08)";

export function DeathResetModal(props: { opened: boolean; onReset: () => void }) {
  if (!props.opened) {
    return null;
  }

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label="Run ended"
      style={{
        alignItems: "center",
        background: PAGE_BG,
        color: GOLD_TEXT,
        display: "flex",
        inset: 0,
        justifyContent: "center",
        overflow: "hidden",
        padding: 28,
        position: "fixed",
        zIndex: 1000
      }}
    >
      <DeathOrnament side="left" />
      <DeathOrnament side="right" />
      <Stack
        align="center"
        gap={18}
        style={{
          background: PANEL_BG,
          border: PANEL_BORDER,
          boxShadow: PANEL_SHADOW,
          maxHeight: "calc(100vh - 56px)",
          maxWidth: 560,
          overflow: "hidden",
          padding: "26px 30px 24px",
          position: "relative",
          width: "100%",
          zIndex: 2
        }}
      >
        <Box style={{ height: 2, width: "100%", background: LINE_BG }} />
        <Text
          fw={900}
          ta="center"
          tt="uppercase"
          style={{
            color: RED_TEXT,
            fontSize: 42,
            letterSpacing: 0,
            lineHeight: 1,
            textShadow: "0 0 12px rgba(201, 28, 28, 0.42), 0 3px 0 #000"
          }}
        >
          There Is No Escape
        </Text>
        <Box style={{ height: 1, width: "72%", background: "linear-gradient(90deg, transparent, rgba(133, 0, 0, 0.8), transparent)" }} />
        <Box
          aria-hidden="true"
          style={{
            alignItems: "center",
            display: "grid",
            height: 150,
            justifyItems: "center",
            overflow: "hidden",
            position: "relative",
            width: 230
          }}
        >
          <Box component="img" src={charmedBloodArt} alt="" style={{ filter: "brightness(0.88) saturate(1.55) drop-shadow(0 0 22px rgba(220, 0, 0, 0.58))", height: 146, imageRendering: "pixelated", objectFit: "contain", width: 220 }} />
          <Box component="img" src={tombstoneArt} alt="" style={{ bottom: 18, filter: "brightness(0.72) contrast(1.2) drop-shadow(0 8px 8px #000)", height: 48, imageRendering: "pixelated", objectFit: "contain", position: "absolute" }} />
        </Box>
        <Stack align="center" gap={6}>
          <Text fw={900} ta="center" tt="uppercase" style={{ color: "#f3d9a0", fontSize: 18, textShadow: "0 2px 0 #000" }}>
            Run Ended
          </Text>
          <Text c="gray.4" size="sm" ta="center" style={{ maxWidth: 460 }}>
            Your health reached zero. Continue to spend insight and prepare the next attempt.
          </Text>
        </Stack>
        <HeroSiegeButton onClick={props.onReset} minWidth={156} height={42}>
          Continue
        </HeroSiegeButton>
      </Stack>
    </Box>
  );
}

function DeathOrnament(props: { side: "left" | "right" }) {
  const flip = props.side === "right";
  return (
    <Group
      gap={8}
      wrap="nowrap"
      style={{
        alignItems: "center",
        filter: "drop-shadow(0 5px 6px #000)",
        left: flip ? undefined : 18,
        opacity: 0.38,
        pointerEvents: "none",
        position: "absolute",
        right: flip ? 18 : undefined,
        top: 18,
        transform: flip ? "scaleX(-1)" : undefined,
        zIndex: 1
      }}
    >
      <Box component="img" src={devilSkullArt} alt="" style={{ height: 42, imageRendering: "pixelated", objectFit: "contain", width: 42 }} />
      <Box component="img" src={deathsScytheArt} alt="" style={{ height: 50, imageRendering: "pixelated", objectFit: "contain", width: 92 }} />
    </Group>
  );
}
