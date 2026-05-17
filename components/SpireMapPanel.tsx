import { Badge, Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconCampfire, IconCrown, IconGift, IconQuestionMark, IconShoppingBag, IconSkull } from "@tabler/icons-react";
import { useState } from "react";

import { advanceSpireNode, enterSpireNode, getCurrentSpireNode, isCombatNode, selectSpireNode, SPIRE_RATINGS } from "../lib/spireMapCore";
import type { SpireMapNode, SpireNodeKind, StudyState } from "../types/study";

const MAP_HEIGHT = 760;
const NODE_SIZE = 38;
const PATH_COLOR = "#1f2933";
const ACTIVE_COLOR = "#4dabf7";
const COMPLETED_COLOR = "#51cf66";
const SELECTABLE_COLOR = "#f8f0c2";
const LOCKED_COLOR = "#1f2933";
const NODE_FILL = "#111c25";
const NODE_COMPLETED_FILL = "#173122";
const NODE_ICON_COLOR = "#dbe4dc";
const LOCKED_NODE_OPACITY = 0.42;
const HIGHLIGHTED_NODE_OPACITY = 1;
const DIMMED_NODE_OPACITY = 0.2;
const HIGHLIGHT_GLOW = "0 0 0 4px rgba(77, 171, 247, 0.25), 0 0 18px rgba(77, 171, 247, 0.55)";
const NODE_Z_INDEX = 2;
const HIGHLIGHTED_NODE_Z_INDEX = 3;
const MAP_BG = "radial-gradient(circle at 50% 20%, #6b6b60 0%, #4f5149 52%, #363932 100%)";
const ENTER_BUTTON_RIGHT = 16;
const ENTER_BUTTON_BOTTOM = 16;
const PATH_NODE_RADIUS = 1.75;
const PATH_STROKE_WIDTH = 0.18;
const PATH_STROKE_DASH = "0.5 0.75";

const NODE_LABELS: Record<SpireNodeKind, string> = {
  boss: "Boss",
  elite: "Elite",
  enemy: "Enemy",
  merchant: "Merchant",
  rest: "Rest",
  treasure: "Treasure",
  unknown: "Unknown"
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
            <Text size="sm" fw={800}>Spire Run</Text>
            <Badge color="yellow" variant="light">Rating {node?.rating || SPIRE_RATINGS[0]}</Badge>
            <Badge color={activeCombat ? "red" : "blue"} variant="light">{getRunBadgeLabel(mapOpen, node)}</Badge>
          </Group>
          <Text size="xs" c="dimmed">{activeCombat ? `Room ${solved}/${target}` : "Pick a reachable node"}</Text>
        </Group>
        <Box style={{ background: MAP_BG, border: "1px solid var(--mantine-color-dark-4)", height: MAP_HEIGHT, overflow: "hidden", position: "relative" }}>
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
              style={{ bottom: ENTER_BUTTON_BOTTOM, position: "absolute", right: ENTER_BUTTON_RIGHT }}
            >
              {getMapButtonLabel(node)}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
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
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ inset: 0, position: "absolute", height: "100%", width: "100%" }}>
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
      style={{ alignItems: "center", background: props.completed ? NODE_COMPLETED_FILL : NODE_FILL, border: `3px solid ${color}`, borderRadius: "50%", boxShadow: props.highlighted ? HIGHLIGHT_GLOW : undefined, color: NODE_ICON_COLOR, cursor: props.selectable ? "pointer" : "default", display: "flex", height: NODE_SIZE, justifyContent: "center", left: `${props.x}%`, opacity, padding: 0, position: "absolute", top: `${props.y}%`, transform: props.highlighted ? "translate(-50%, -50%) scale(1.08)" : "translate(-50%, -50%)", width: NODE_SIZE, zIndex: props.highlighted ? HIGHLIGHTED_NODE_Z_INDEX : NODE_Z_INDEX }}
      type="button"
    >
      <NodeIcon kind={props.kind} />
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

function NodeIcon(props: { kind: SpireNodeKind }) {
  const icons = {
    boss: <IconCrown size={18} />,
    elite: <EliteEnemyIcon />,
    enemy: <IconSkull size={18} />,
    merchant: <IconShoppingBag size={18} />,
    rest: <IconCampfire size={18} />,
    treasure: <IconGift size={18} />,
    unknown: <IconQuestionMark size={18} />
  };
  return icons[props.kind];
}

function EliteEnemyIcon() {
  return (
    <Box component="span" style={{ display: "grid", height: 22, placeItems: "center", position: "relative", width: 22 }}>
      <Box component="span" style={{ borderBottom: "7px solid currentColor", borderLeft: "4px solid transparent", height: 0, left: 1, position: "absolute", top: 2, transform: "rotate(-35deg)", width: 0 }} />
      <Box component="span" style={{ borderBottom: "7px solid currentColor", borderRight: "4px solid transparent", height: 0, position: "absolute", right: 1, top: 2, transform: "rotate(35deg)", width: 0 }} />
      <IconSkull size={18} style={{ position: "relative", top: 2 }} />
    </Box>
  );
}

function Legend(props: { highlightedKind: SpireNodeKind | null; onHighlight: (kind: SpireNodeKind | null) => void }) {
  const rows: SpireNodeKind[] = ["unknown", "merchant", "treasure", "rest", "enemy", "elite", "boss"];
  return (
    <Box p="sm" style={{ background: "rgba(216, 232, 238, 0.9)", borderRadius: 6, color: "#17212b", position: "absolute", right: 12, top: 12, width: 150 }}>
      <Text size="sm" fw={900} mb={4}>Legend</Text>
      <Stack gap={4}>
        {rows.map((kind) => (
          <Group
            key={kind}
            gap="xs"
            onMouseEnter={() => props.onHighlight(kind)}
            onMouseLeave={() => props.onHighlight(null)}
            style={{ background: props.highlightedKind === kind ? "rgba(23, 33, 43, 0.12)" : undefined, borderRadius: 4, cursor: "default", marginInline: -4, paddingInline: 4 }}
            wrap="nowrap"
          >
            <NodeIcon kind={kind} />
            <Text size="xs" fw={800}>{NODE_LABELS[kind]}</Text>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}
