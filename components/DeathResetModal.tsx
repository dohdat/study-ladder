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
      <Stack align="center" gap={28} style={{ maxWidth: 860, position: "relative", width: "min(88vw, 860px)", zIndex: 1 }}>
        <Box style={{ height: 2, width: "100%", background: LINE_BG }} />
        <Text
          fw={900}
          ta="center"
          tt="uppercase"
          style={{
            color: RED_TEXT,
            fontSize: "clamp(28px, 5vw, 62px)",
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
            height: "min(34vh, 260px)",
            justifyItems: "center",
            position: "relative",
            width: "min(46vw, 390px)"
          }}
        >
          <Box component="img" src={charmedBloodArt} alt="" style={{ filter: "brightness(0.9) saturate(1.8) drop-shadow(0 0 34px rgba(220, 0, 0, 0.75))", height: "100%", imageRendering: "pixelated", objectFit: "contain", transform: "scale(1.6)", width: "100%" }} />
          <Box component="img" src={tombstoneArt} alt="" style={{ bottom: "20%", filter: "brightness(0.7) contrast(1.2) drop-shadow(0 8px 8px #000)", height: "36%", imageRendering: "pixelated", objectFit: "contain", position: "absolute" }} />
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
        opacity: 0.72,
        position: "absolute",
        right: flip ? 18 : undefined,
        top: 18,
        transform: flip ? "scaleX(-1)" : undefined,
        zIndex: 1
      }}
    >
      <Box component="img" src={devilSkullArt} alt="" style={{ height: 58, imageRendering: "pixelated", objectFit: "contain", width: 58 }} />
      <Box component="img" src={deathsScytheArt} alt="" style={{ height: 70, imageRendering: "pixelated", objectFit: "contain", width: 128 }} />
    </Group>
  );
}
