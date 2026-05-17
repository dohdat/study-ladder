import { Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import type { StaticImageData } from "next/image";
import { useState } from "react";

import { advanceSpireNode, enterSpireNode, getCurrentSpireNode, isCombatNode, selectSpireNode, SPIRE_RATINGS } from "../lib/spireMapCore";
import type { SpireMapNode, SpireNodeKind, StudyState } from "../types/study";
import campBenchArt from "../assets/hero_siege_map/camp-bench.png";
import campfireArt from "../assets/hero_siege_map/campfire.png";
import chestArt from "../assets/hero_siege_map/chest.png";
import deadTreeArt from "../assets/hero_siege_map/dead-tree.png";
import fieldCorpseArt from "../assets/hero_siege_map/field-corpse.png";
import fieldPillarArt from "../assets/hero_siege_map/field-pillar.png";
import fieldTentArt from "../assets/hero_siege_map/field-tent.png";
import fieldTorchArt from "../assets/hero_siege_map/field-torch.png";
import fieldTreeArt from "../assets/hero_siege_map/field-tree.png";
import fieldWallArt from "../assets/hero_siege_map/field-wall.png";
import graveyardRocksArt from "../assets/hero_siege_map/graveyard-rocks.png";
import healthShrineArt from "../assets/hero_siege_map/health-shrine.png";
import tombstoneArt from "../assets/hero_siege_map/tombstone.png";
import wildBushArt from "../assets/hero_siege_map/wild-bush.png";
import demonKingArt from "../assets/hero_siege_monsters/demon-king.png";
import skeletonMageArt from "../assets/hero_siege_monsters/skeleton-mage.png";
import zombieArt from "../assets/hero_siege_monsters/zombie.png";

const MAP_HEIGHT = 760;
const NODE_SIZE = 38;
const NODE_ICON_SIZE = 30;
const LEGEND_ICON_SIZE = 24;
const ACT_LABEL = "Act #1 The Sightless Eye";
const PATH_COLOR = "rgba(15, 25, 21, 0.82)";
const ACTIVE_COLOR = "#4dabf7";
const COMPLETED_COLOR = "#51cf66";
const SELECTABLE_COLOR = "#dfc37a";
const LOCKED_COLOR = "#18231d";
const NODE_FILL = "radial-gradient(circle at 45% 30%, rgba(52, 48, 35, 0.92), rgba(13, 17, 13, 0.94) 72%)";
const NODE_COMPLETED_FILL = "radial-gradient(circle at 45% 30%, rgba(42, 70, 38, 0.92), rgba(14, 31, 18, 0.94) 72%)";
const NODE_ICON_COLOR = "#d8d1ba";
const LOCKED_NODE_OPACITY = 0.42;
const HIGHLIGHTED_NODE_OPACITY = 1;
const DIMMED_NODE_OPACITY = 0.2;
const HIGHLIGHT_GLOW = "0 0 0 4px rgba(77, 171, 247, 0.25), 0 0 18px rgba(77, 171, 247, 0.55)";
const NODE_Z_INDEX = 2;
const HIGHLIGHTED_NODE_Z_INDEX = 3;
const MAP_BG = [
  "radial-gradient(circle at 16% 18%, rgba(71, 87, 55, 0.84) 0%, rgba(57, 69, 47, 0.44) 24%, transparent 43%)",
  "radial-gradient(circle at 72% 78%, rgba(92, 67, 43, 0.38) 0%, rgba(47, 45, 33, 0.3) 28%, transparent 52%)",
  "linear-gradient(145deg, rgba(32, 43, 31, 0.96) 0%, rgba(55, 57, 44, 0.96) 42%, rgba(28, 34, 28, 0.98) 100%)"
].join(", ");
const ENTER_BUTTON_RIGHT = 16;
const ENTER_BUTTON_BOTTOM = 16;
const PATH_NODE_RADIUS = 1.75;
const PATH_STROKE_WIDTH = 0.18;
const PATH_STROKE_DASH = "0.5 0.75";
const BACKDROP_PROP_OPACITY = 0.52;
const ACT_LABEL_TOP = 12;
const ACT_LABEL_LEFT = 14;
const ACT_LABEL_BORDER = "1px solid rgba(223, 195, 122, 0.72)";
const ACT_LABEL_BG = "linear-gradient(180deg, rgba(51, 34, 19, 0.96), rgba(15, 12, 8, 0.94))";
const HEADER_BADGE_BG = "linear-gradient(180deg, rgba(55, 36, 18, 0.92), rgba(18, 14, 9, 0.92))";
const HEADER_BADGE_BORDER = "1px solid rgba(223, 195, 122, 0.52)";
const ACTION_BUTTON_BG = "linear-gradient(180deg, #5a2f18 0%, #31170d 49%, #140a06 100%)";
const ACTION_BUTTON_BORDER = "1px solid #d4a348";
const ACTION_BUTTON_SHADOW = "inset 0 0 0 1px rgba(255, 226, 138, 0.24), 0 6px 18px rgba(0, 0, 0, 0.42)";

const NODE_LABELS: Record<SpireNodeKind, string> = {
  boss: "Boss",
  elite: "Elite",
  enemy: "Enemy",
  merchant: "Merchant",
  rest: "Rest",
  treasure: "Treasure",
  unknown: "Unknown"
};

const NODE_ICON_ASSETS: Record<SpireNodeKind, StaticImageData> = {
  boss: demonKingArt,
  elite: skeletonMageArt,
  enemy: zombieArt,
  merchant: fieldTentArt,
  rest: campfireArt,
  treasure: chestArt,
  unknown: tombstoneArt
};

// eslint-disable-next-line complexity
export function SpireMapPanel(props: { setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const [highlightedKind, setHighlightedKind] = useState<SpireNodeKind | null>(null);
  const node = getCurrentSpireNode(props.state);
  const solved = props.state.profile.spireRun.roundSolvedIds.length;
  const target = props.state.profile.spireRun.roundQuestionIds.length;
  const mapOpen = props.state.profile.spireRun.mapOpen;
  const activeCombat = !mapOpen && isCombatNode(node);
  const selectedNodeIsReachable = mapOpen && Boolean(node && props.state.profile.spireRun.availableNodeIds.includes(node.id));
  return (
    <Paper withBorder p="sm" style={{ background: "var(--mantine-color-dark-7)" }}>
      <Box style={{ minWidth: 0 }}>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>Spire Run</Text>
            <HeaderActBadge />
            <HeaderStatusBadge tone="gold">Rating {node?.rating || SPIRE_RATINGS[0]}</HeaderStatusBadge>
            <HeaderStatusBadge tone={activeCombat ? "red" : "blue"}>{getRunBadgeLabel(mapOpen, node)}</HeaderStatusBadge>
          </Group>
          <Text size="xs" c="dimmed">{activeCombat ? `Room ${solved}/${target}` : "Pick a reachable node"}</Text>
        </Group>
        <Box style={{ background: MAP_BG, border: "1px solid var(--mantine-color-dark-4)", height: MAP_HEIGHT, overflow: "hidden", position: "relative" }}>
          <MapBackdrop />
          <MapPaths state={props.state} />
          {props.state.profile.spireRun.nodes.map((mapNode) => (
            <MapNode
              key={mapNode.id}
              active={mapNode.id === props.state.profile.spireRun.currentNodeId}
              completed={props.state.profile.spireRun.completedNodeIds.includes(mapNode.id)}
              highlighted={highlightedKind === mapNode.kind}
              highlightMode={Boolean(highlightedKind)}
              kind={mapNode.kind}
              onSelect={() => props.setState((previous) => selectSpireNode(previous, mapNode.id))}
              selectable={mapOpen && props.state.profile.spireRun.availableNodeIds.includes(mapNode.id)}
              x={mapNode.x}
              y={mapNode.y}
            />
          ))}
          <Legend highlightedKind={highlightedKind} onHighlight={setHighlightedKind} />
          {mapOpen && (
            <Button
              disabled={!selectedNodeIsReachable}
              onClick={() => props.setState((previous) => (isCombatNode(node) ? enterSpireNode(previous) : advanceSpireNode(previous)))}
              style={{
                background: ACTION_BUTTON_BG,
                border: ACTION_BUTTON_BORDER,
                borderRadius: 2,
                bottom: ENTER_BUTTON_BOTTOM,
                boxShadow: ACTION_BUTTON_SHADOW,
                color: "#ffe6a6",
                fontWeight: 900,
                letterSpacing: 0,
                minWidth: 120,
                position: "absolute",
                right: ENTER_BUTTON_RIGHT,
                textShadow: "0 1px 0 #000",
                textTransform: "uppercase",
                zIndex: 4
              }}
            >
              {getMapButtonLabel(node)}
            </Button>
          )}
          <ActMapLabel />
        </Box>
      </Box>
    </Paper>
  );
}

function HeaderActBadge() {
  return (
    <Box
      component="span"
      style={{
        background: HEADER_BADGE_BG,
        border: HEADER_BADGE_BORDER,
        borderRadius: 2,
        color: "#f6d678",
        display: "inline-flex",
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 0,
        lineHeight: 1,
        padding: "5px 10px",
        textShadow: "0 1px 0 #000",
        textTransform: "uppercase"
      }}
    >
      {ACT_LABEL}
    </Box>
  );
}

function HeaderStatusBadge(props: { children: React.ReactNode; tone: "blue" | "gold" | "red" }) {
  return (
    <Box
      component="span"
      style={{
        background: getHeaderStatusBadgeBg(props.tone),
        border: getHeaderStatusBadgeBorder(props.tone),
        borderRadius: 2,
        color: getHeaderStatusBadgeColor(props.tone),
        display: "inline-flex",
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 0,
        lineHeight: 1,
        padding: "5px 10px",
        textShadow: "0 1px 0 #000",
        textTransform: "uppercase"
      }}
    >
      {props.children}
    </Box>
  );
}

function getHeaderStatusBadgeBg(tone: "blue" | "gold" | "red") {
  if (tone === "red") {
    return "linear-gradient(180deg, rgba(86, 27, 18, 0.94), rgba(27, 10, 7, 0.94))";
  }
  if (tone === "blue") {
    return "linear-gradient(180deg, rgba(30, 55, 72, 0.94), rgba(10, 20, 29, 0.94))";
  }
  return HEADER_BADGE_BG;
}

function getHeaderStatusBadgeBorder(tone: "blue" | "gold" | "red") {
  if (tone === "red") {
    return "1px solid rgba(227, 112, 78, 0.46)";
  }
  if (tone === "blue") {
    return "1px solid rgba(101, 172, 218, 0.46)";
  }
  return HEADER_BADGE_BORDER;
}

function getHeaderStatusBadgeColor(tone: "blue" | "gold" | "red") {
  if (tone === "red") {
    return "#ffb098";
  }
  if (tone === "blue") {
    return "#a9dcff";
  }
  return "#f6d678";
}

function MapBackdrop() {
  return (
    <Box aria-hidden="true" style={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "absolute", zIndex: 0 }}>
      <Box style={{ background: "radial-gradient(ellipse at center, transparent 0%, rgba(12, 12, 10, 0.26) 68%, rgba(6, 7, 5, 0.52) 100%)", inset: 0, position: "absolute" }} />
      <Box style={{ background: "linear-gradient(64deg, transparent 0 38%, rgba(85, 70, 42, 0.18) 39% 43%, transparent 44% 100%), linear-gradient(113deg, transparent 0 54%, rgba(20, 17, 11, 0.22) 55% 58%, transparent 59% 100%)", inset: 0, position: "absolute" }} />
      <MapProp asset={fieldTreeArt} left={3} top={2} width={132} opacity={0.36} />
      <MapProp asset={deadTreeArt} left={91} top={3} width={118} opacity={0.34} />
      <MapProp asset={fieldTentArt} left={5} top={72} width={92} opacity={0.45} />
      <MapProp asset={campfireArt} left={12} top={79} width={54} opacity={0.5} />
      <MapProp asset={campBenchArt} left={10} top={70} width={74} opacity={0.42} />
      <MapProp asset={fieldWallArt} left={33} top={86} width={104} opacity={0.32} />
      <MapProp asset={fieldPillarArt} left={68} top={4} width={44} opacity={0.36} />
      <MapProp asset={graveyardRocksArt} left={83} top={78} width={86} opacity={0.4} />
      <MapProp asset={tombstoneArt} left={79} top={66} width={50} opacity={0.36} />
      <MapProp asset={fieldTorchArt} left={88} top={21} width={44} opacity={0.44} />
      <MapProp asset={healthShrineArt} left={59} top={80} width={54} opacity={0.4} />
      <MapProp asset={chestArt} left={89} top={84} width={64} opacity={0.4} />
      <MapProp asset={fieldCorpseArt} left={24} top={78} width={70} opacity={0.28} />
      <MapProp asset={wildBushArt} left={20} top={8} width={82} opacity={0.36} />
      <MapProp asset={wildBushArt} left={53} top={3} width={96} opacity={0.3} />
      <MapProp asset={wildBushArt} left={74} top={83} width={92} opacity={0.3} />
    </Box>
  );
}

function MapProp(props: { asset: StaticImageData; left: number; opacity?: number; top: number; width: number }) {
  return (
    <Box
      alt=""
      component="img"
      src={props.asset.src}
      style={{
        imageRendering: "pixelated",
        left: `${props.left}%`,
        opacity: props.opacity ?? BACKDROP_PROP_OPACITY,
        position: "absolute",
        top: `${props.top}%`,
        transform: "translate(-50%, -50%)",
        width: props.width
      }}
    />
  );
}

function ActMapLabel() {
  return (
    <Box
      style={{
        background: ACT_LABEL_BG,
        border: ACT_LABEL_BORDER,
        borderRadius: 2,
        boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.72), 0 6px 18px rgba(0, 0, 0, 0.34)",
        color: "#f1dfad",
        left: ACT_LABEL_LEFT,
        minWidth: 186,
        padding: "10px 14px",
        position: "absolute",
        top: ACT_LABEL_TOP,
        zIndex: 4
      }}
    >
      <Text size="xs" fw={900} ta="center" tt="uppercase" style={{ letterSpacing: 0, textShadow: "0 1px 0 #000" }}>{ACT_LABEL}</Text>
    </Box>
  );
}

function getMapButtonLabel(node: SpireMapNode | undefined) {
  if (!node || isCombatNode(node)) {
    return "Enter Room";
  }
  if (node.kind === "treasure") {
    return "Open Treasure";
  }
  if (node.kind === "rest") {
    return "Rest";
  }
  return "Continue";
}

function MapPaths(props: { state: StudyState }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ inset: 0, position: "absolute", height: "100%", width: "100%", zIndex: 1 }}>
      {props.state.profile.spireRun.nodes.flatMap((node) => node.nextIds.map((id) => {
        const next = props.state.profile.spireRun.nodes.find((row) => row.id === id);
        if (!next) {
          return null;
        }
        const line = getTrimmedPathLine(node, next);
        return <line key={`${node.id}-${id}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={PATH_COLOR} strokeDasharray={PATH_STROKE_DASH} strokeLinecap="round" strokeWidth={PATH_STROKE_WIDTH} />;
      }))}
    </svg>
  );
}

function getTrimmedPathLine(from: SpireMapNode, to: SpireMapNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const offsetX = (dx / length) * PATH_NODE_RADIUS;
  const offsetY = (dy / length) * PATH_NODE_RADIUS;
  return {
    x1: from.x + offsetX,
    x2: to.x - offsetX,
    y1: from.y + offsetY,
    y2: to.y - offsetY
  };
}

function MapNode(props: { active: boolean; completed: boolean; highlighted: boolean; highlightMode: boolean; kind: SpireNodeKind; onSelect: () => void; selectable: boolean; x: number; y: number }) {
  const color = getNodeBorderColor(props.active, props.completed, props.selectable);
  const opacity = getNodeOpacity(props);
  return (
    <Box
      aria-label={NODE_LABELS[props.kind]}
      component="button"
      disabled={!props.selectable}
      onClick={props.onSelect}
      style={{ alignItems: "center", background: props.completed ? NODE_COMPLETED_FILL : NODE_FILL, border: `2px solid ${color}`, borderRadius: 2, boxShadow: props.highlighted ? HIGHLIGHT_GLOW : "inset 0 0 0 1px rgba(0, 0, 0, 0.76), 0 4px 10px rgba(0, 0, 0, 0.32)", color: NODE_ICON_COLOR, cursor: props.selectable ? "pointer" : "default", display: "flex", height: NODE_SIZE, justifyContent: "center", left: `${props.x}%`, opacity, padding: 2, position: "absolute", top: `${props.y}%`, transform: props.highlighted ? "translate(-50%, -50%) scale(1.08)" : "translate(-50%, -50%)", width: NODE_SIZE, zIndex: props.highlighted ? HIGHLIGHTED_NODE_Z_INDEX : NODE_Z_INDEX }}
      type="button"
    >
      <NodeIcon kind={props.kind} size={NODE_ICON_SIZE} />
    </Box>
  );
}

function getNodeOpacity(props: { active: boolean; completed: boolean; highlighted: boolean; highlightMode: boolean; selectable: boolean }) {
  if (props.highlightMode) {
    return props.highlighted ? HIGHLIGHTED_NODE_OPACITY : DIMMED_NODE_OPACITY;
  }
  return props.selectable || props.completed || props.active ? HIGHLIGHTED_NODE_OPACITY : LOCKED_NODE_OPACITY;
}

function getRunBadgeLabel(mapOpen: boolean, node: ReturnType<typeof getCurrentSpireNode>) {
  if (mapOpen) {
    return "Choose Room";
  }
  return node ? NODE_LABELS[node.kind] : "Enemy";
}

function getNodeBorderColor(active: boolean, completed: boolean, selectable: boolean) {
  if (active) {
    return ACTIVE_COLOR;
  }
  if (completed) {
    return COMPLETED_COLOR;
  }
  if (selectable) {
    return SELECTABLE_COLOR;
  }
  return LOCKED_COLOR;
}

function NodeIcon(props: { kind: SpireNodeKind; size?: number }) {
  const size = props.size || LEGEND_ICON_SIZE;
  return (
    <Box
      alt=""
      component="img"
      src={NODE_ICON_ASSETS[props.kind].src}
      style={{ display: "block", filter: props.kind === "unknown" ? "saturate(0.55) brightness(1.18)" : undefined, imageRendering: "pixelated", maxHeight: size, maxWidth: size, objectFit: "contain" }}
    />
  );
}

function Legend(props: { highlightedKind: SpireNodeKind | null; onHighlight: (kind: SpireNodeKind | null) => void }) {
  const rows: SpireNodeKind[] = ["unknown", "merchant", "treasure", "rest", "enemy", "elite", "boss"];
  return (
    <Box p="sm" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, borderRadius: 2, boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.72), 0 10px 26px rgba(0, 0, 0, 0.36)", color: "#e7dcc0", position: "absolute", right: 12, top: 12, width: 150, zIndex: 4 }}>
      <Text size="sm" fw={900} mb={6} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>Legend</Text>
      <Stack gap={4}>
        {rows.map((kind) => (
          <Group
            key={kind}
            gap="xs"
            onMouseEnter={() => props.onHighlight(kind)}
            onMouseLeave={() => props.onHighlight(null)}
            style={{ background: props.highlightedKind === kind ? "rgba(223, 195, 122, 0.16)" : undefined, borderRadius: 4, cursor: "default", marginInline: -4, paddingInline: 4 }}
            wrap="nowrap"
          >
            <Box style={{ alignItems: "center", background: "rgba(0, 0, 0, 0.28)", border: "1px solid rgba(223, 195, 122, 0.26)", display: "flex", height: 26, justifyContent: "center", width: 26 }}>
              <NodeIcon kind={kind} size={LEGEND_ICON_SIZE} />
            </Box>
            <Text size="xs" fw={800} style={{ textShadow: "0 1px 0 #000" }}>{NODE_LABELS[kind]}</Text>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}
