import { Box, Group, Paper, Stack, Text } from "@mantine/core";
type StaticImageData = string;
import { useCallback, useEffect, useRef, useState } from "react";

import { HeroSiegeButton } from "./HeroSiegeUi";
import { advanceSpireNode, enterSpireNode, getCurrentSpireNode, isCombatNode, selectSpireNode, SPIRE_RATINGS } from "../lib/spireMapCore";
import type { SpireMapNode, SpireNodeKind, StudyState } from "../types/study";
import campfireArt from "../assets/hero_siege_map/campfire.png";
import chestArt from "../assets/hero_siege_map/chest.png";
import deadTreeArt from "../assets/hero_siege_map/dead-tree.png";
import fieldTentArt from "../assets/hero_siege_map/field-tent.png";
import fieldTreeArt from "../assets/hero_siege_map/field-tree.png";
import graveyardRocksArt from "../assets/hero_siege_map/graveyard-rocks.png";
import questionMarkArt from "../assets/hero_siege_map/question-mark.png";
import wildBushArt from "../assets/hero_siege_map/wild-bush.png";
import demonKingArt from "../assets/hero_siege_monsters/demon-king.png";
import skeletonMageArt from "../assets/hero_siege_monsters/skeleton-mage.png";
import zombieArt from "../assets/hero_siege_monsters/zombie.png";

const EXPANDED_MAP_HEIGHT = "calc(100vh - 126px)";
const COMPACT_ROOM_HEIGHT = 66;
const COMPACT_ROOM_ICON_SIZE = 42;
const COMPACT_ROOM_ICON_INSET = 8;
const NODE_SIZE = 86;
const NODE_ICON_SIZE = 82;
const BOSS_NODE_SIZE = 128;
const BOSS_NODE_ICON_SIZE = 118;
const LEGEND_ICON_SIZE = 24;
const MAP_CONTENT_WIDTH = 1780;
const MAP_CONTENT_HEIGHT = 1280;
const ACT_LABEL = "Act #1 The Sightless Eye";
const PATH_COLOR = "rgba(20, 31, 34, 0.72)";
const LOCKED_NODE_OPACITY = 0.42;
const HIGHLIGHTED_NODE_OPACITY = 1;
const DIMMED_NODE_OPACITY = 0.2;
const NODE_DROP_SHADOW = "drop-shadow(0 4px 4px rgba(0, 0, 0, 0.52))";
const NODE_SHAPE_HIGHLIGHT = "drop-shadow(1px 0 0 rgba(255, 255, 255, 0.98)) drop-shadow(-1px 0 0 rgba(255, 255, 255, 0.98)) drop-shadow(0 1px 0 rgba(255, 255, 255, 0.98)) drop-shadow(0 -1px 0 rgba(255, 255, 255, 0.98)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))";
const NODE_SELECTED_HIGHLIGHT = "drop-shadow(2px 0 0 rgba(255, 220, 89, 0.98)) drop-shadow(-2px 0 0 rgba(255, 220, 89, 0.98)) drop-shadow(0 2px 0 rgba(255, 220, 89, 0.98)) drop-shadow(0 -2px 0 rgba(255, 220, 89, 0.98)) drop-shadow(0 0 14px rgba(255, 220, 89, 0.88))";
const NODE_ACTIVE_HIGHLIGHT = "drop-shadow(2px 0 0 rgba(62, 169, 255, 0.98)) drop-shadow(-2px 0 0 rgba(62, 169, 255, 0.98)) drop-shadow(0 2px 0 rgba(62, 169, 255, 0.98)) drop-shadow(0 -2px 0 rgba(62, 169, 255, 0.98)) drop-shadow(0 0 14px rgba(62, 169, 255, 0.88))";
const BOSS_ACTIVE_HIGHLIGHT = "drop-shadow(2px 0 0 rgba(175, 35, 42, 0.98)) drop-shadow(-2px 0 0 rgba(175, 35, 42, 0.98)) drop-shadow(0 2px 0 rgba(175, 35, 42, 0.98)) drop-shadow(0 -2px 0 rgba(175, 35, 42, 0.98)) drop-shadow(0 0 18px rgba(151, 21, 28, 0.9))";
const NODE_HIGHLIGHT_TRANSITION = "opacity 70ms ease-out";
const LEGEND_ROW_TRANSITION = "background-color 70ms ease-out";
const NODE_Z_INDEX = 2;
const HIGHLIGHTED_NODE_Z_INDEX = 3;
const SELECTED_NODE_Z_INDEX = 4;
const BOSS_NODE_Z_INDEX = 4;
const BOSS_LOCKED_OPACITY = 0.78;
const MAP_BG = "#909286";
const ENTER_BUTTON_RIGHT = 16;
const ENTER_BUTTON_BOTTOM = 16;
const PATH_NODE_RADIUS = 3.05;
const PATH_STROKE_WIDTH = 0.22;
const PATH_STROKE_DASH = "0.7 0.45";
const PATH_CURVE_JITTER = 3.6;
const NODE_VISUAL_X_JITTER = 2.4;
const NODE_VISUAL_Y_JITTER = 3.8;
const NODE_VISUAL_MIN = 5;
const NODE_VISUAL_MAX = 95;
const BOSS_VISUAL_JITTER_SCALE = 0.45;
const RANDOM_CENTER = 0.5;
const MIDPOINT_DIVISOR = 2;
const POSITION_ROUNDING_FACTOR = 10;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const MAP_DRAG_POINTER_BUTTON = 0;
const LEGEND_HIGHLIGHT_CLEAR_DEBOUNCE_MS = 90;
const FLEX_FILL_STYLE = { flex: "1 1 auto", minHeight: 0 };
const BACKDROP_PROP_OPACITY = 0.18;
const ACT_LABEL_TOP = 12;
const ACT_LABEL_LEFT = 14;
const ACT_LABEL_BORDER = "1px solid rgba(223, 195, 122, 0.72)";
const ACT_LABEL_BG = "linear-gradient(180deg, rgba(51, 34, 19, 0.96), rgba(15, 12, 8, 0.94))";
const HEADER_BADGE_BG = "linear-gradient(180deg, rgba(55, 36, 18, 0.92), rgba(18, 14, 9, 0.92))";
const HEADER_BADGE_BORDER = "1px solid rgba(223, 195, 122, 0.52)";
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
  unknown: questionMarkArt
};

const NODE_DIMENSIONS: Record<SpireNodeKind, { icon: number; size: number }> = {
  boss: { icon: BOSS_NODE_ICON_SIZE, size: BOSS_NODE_SIZE },
  elite: { icon: 58, size: 70 },
  enemy: { icon: 54, size: 66 },
  merchant: { icon: 106, size: 118 },
  rest: { icon: 60, size: 72 },
  treasure: { icon: 62, size: 74 },
  unknown: { icon: 24, size: 34 }
};

// eslint-disable-next-line complexity
export function SpireMapPanel(props: { fillAvailableHeight?: boolean; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const [highlightedKind, setHighlightedKind] = useState<SpireNodeKind | null>(null);
  const setDebouncedHighlightedKind = useDebouncedLegendHighlight(setHighlightedKind);
  const mapDrag = useMapDrag();
  const node = getCurrentSpireNode(props.state);
  const solved = props.state.profile.spireRun.roundSolvedIds.length;
  const target = props.state.profile.spireRun.roundQuestionIds.length;
  const mapOpen = props.state.profile.spireRun.mapOpen;
  const activeCombat = !mapOpen && isCombatNode(node);
  const selectedNodeIsReachable = mapOpen && Boolean(node && props.state.profile.spireRun.availableNodeIds.includes(node.id));
  return (
    <Paper withBorder p="sm" style={{ background: "var(--mantine-color-dark-7)", ...(mapOpen && props.fillAvailableHeight ? { ...FLEX_FILL_STYLE, display: "flex", flexDirection: "column" } : {}) }}>
      <Box style={{ minWidth: 0, ...(mapOpen && props.fillAvailableHeight ? { ...FLEX_FILL_STYLE, display: "flex", flexDirection: "column" } : {}) }}>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>Spire Run</Text>
            <HeaderActBadge />
            <HeaderStatusBadge tone="gold">Rating {node?.rating || SPIRE_RATINGS[0]}</HeaderStatusBadge>
            <HeaderStatusBadge tone={activeCombat ? "red" : "blue"}>{getRunBadgeLabel(mapOpen, node)}</HeaderStatusBadge>
          </Group>
          <Text size="xs" c="dimmed">{activeCombat ? `Room ${solved}/${target}` : "Pick a reachable node"}</Text>
        </Group>
        {mapOpen ? (
          <Box style={{ background: MAP_BG, border: "1px solid var(--mantine-color-dark-4)", height: props.fillAvailableHeight ? undefined : EXPANDED_MAP_HEIGHT, overflow: "hidden", position: "relative", ...(props.fillAvailableHeight ? FLEX_FILL_STYLE : {}) }}>
            <Box
              ref={mapDrag.scrollRef}
              onPointerCancel={mapDrag.endDrag}
              onPointerDown={mapDrag.startDrag}
              onPointerMove={mapDrag.moveDrag}
              onPointerUp={mapDrag.endDrag}
              style={{ cursor: mapDrag.dragging ? "grabbing" : "grab", inset: 0, overflow: "auto", overscrollBehavior: "contain", position: "absolute", touchAction: "none", userSelect: mapDrag.dragging ? "none" : undefined }}
            >
              <Box style={{ background: MAP_BG, height: MAP_CONTENT_HEIGHT, minHeight: "100%", minWidth: "100%", position: "relative", width: MAP_CONTENT_WIDTH }}>
                <MapBackdrop />
                <MapPaths state={props.state} />
                {props.state.profile.spireRun.nodes.map((mapNode) => {
                  const position = getVisualNodePosition(mapNode);
                  return (
                    <MapNode
                      key={mapNode.id}
                      active={mapNode.id === props.state.profile.spireRun.currentNodeId}
                      completed={props.state.profile.spireRun.completedNodeIds.includes(mapNode.id)}
                      highlighted={highlightedKind === mapNode.kind}
                      highlightMode={Boolean(highlightedKind)}
                      kind={mapNode.kind}
                      onSelect={() => props.setState((previous) => selectSpireNode(previous, mapNode.id))}
                      selectable={props.state.profile.spireRun.availableNodeIds.includes(mapNode.id)}
                      x={position.x}
                      y={position.y}
                    />
                  );
                })}
                <ActMapLabel />
              </Box>
            </Box>
            <Legend highlightedKind={highlightedKind} onHighlight={setDebouncedHighlightedKind} />
            <HeroSiegeButton
              disabled={!selectedNodeIsReachable}
              onClick={() => props.setState((previous) => (isCombatNode(node) ? enterSpireNode(previous) : advanceSpireNode(previous)))}
              minWidth={134}
              style={{
                bottom: ENTER_BUTTON_BOTTOM,
                position: "absolute",
                right: ENTER_BUTTON_RIGHT,
                zIndex: 4
              }}
            >
              {getMapButtonLabel(node)}
            </HeroSiegeButton>
          </Box>
        ) : (
          <CompactRoomPanel node={node} solved={solved} target={target} />
        )}
      </Box>
    </Paper>
  );
}

function useDebouncedLegendHighlight(onHighlight: (kind: SpireNodeKind | null) => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHighlightTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearHighlightTimeout, [clearHighlightTimeout]);

  return useCallback((kind: SpireNodeKind | null) => {
    clearHighlightTimeout();
    if (kind) {
      onHighlight(kind);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      onHighlight(null);
      timeoutRef.current = null;
    }, LEGEND_HIGHLIGHT_CLEAR_DEBOUNCE_MS);
  }, [clearHighlightTimeout, onHighlight]);
}

function useMapDrag() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ dragging: false, left: 0, pointerId: 0, top: 0, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== MAP_DRAG_POINTER_BUTTON || isInteractiveMapTarget(event.target)) {
      return;
    }
    const scroller = scrollRef.current;
    if (!scroller) {
      return;
    }
    dragRef.current = { dragging: true, left: scroller.scrollLeft, pointerId: event.pointerId, top: scroller.scrollTop, x: event.clientX, y: event.clientY };
    scroller.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const scroller = scrollRef.current;
    if (!drag.dragging || !scroller || event.pointerId !== drag.pointerId) {
      return;
    }
    scroller.scrollLeft = drag.left - (event.clientX - drag.x);
    scroller.scrollTop = drag.top - (event.clientY - drag.y);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const scroller = scrollRef.current;
    if (dragRef.current.dragging && scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
    dragRef.current.dragging = false;
    setDragging(false);
  }

  return { dragging, endDrag, moveDrag, scrollRef, startDrag };
}

function isInteractiveMapTarget(target: EventTarget) {
  return target instanceof Element && Boolean(target.closest("button, a, input, select, textarea"));
}

function CompactRoomPanel(props: { node: SpireMapNode | undefined; solved: number; target: number }) {
  const kind = props.node?.kind || "enemy";
  return (
    <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, borderRadius: 2, boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.72)", height: COMPACT_ROOM_HEIGHT, overflow: "hidden", padding: "10px 14px" }}>
      <Group gap="sm" wrap="nowrap">
        <Box style={{ alignItems: "center", background: "rgba(0, 0, 0, 0.32)", border: "1px solid rgba(223, 195, 122, 0.32)", display: "flex", height: COMPACT_ROOM_ICON_SIZE, justifyContent: "center", width: COMPACT_ROOM_ICON_SIZE }}>
          <NodeIcon kind={kind} size={COMPACT_ROOM_ICON_SIZE - COMPACT_ROOM_ICON_INSET} />
        </Box>
        <Box>
          <Text size="sm" fw={900} tt="uppercase" style={{ color: "#f1dfad", letterSpacing: 0, textShadow: "0 1px 0 #000" }}>{NODE_LABELS[kind]}</Text>
          <Text size="xs" c="dimmed">{ACT_LABEL}</Text>
        </Box>
      </Group>
      <Text size="xs" c="dimmed">Room {props.solved}/{props.target}</Text>
    </Group>
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
      <MapProp asset={fieldTreeArt} left={1} top={14} width={116} opacity={0.26} />
      <MapProp asset={graveyardRocksArt} left={3} top={82} width={86} opacity={0.24} />
      <MapProp asset={wildBushArt} left={8} top={94} width={70} opacity={0.22} />
      <MapProp asset={deadTreeArt} left={99} top={13} width={112} opacity={0.24} />
      <MapProp asset={graveyardRocksArt} left={97} top={78} width={96} opacity={0.25} />
      <MapProp asset={wildBushArt} left={93} top={91} width={76} opacity={0.2} />
    </Box>
  );
}

function MapProp(props: { asset: StaticImageData; left: number; opacity?: number; top: number; width: number }) {
  return (
    <Box
      alt=""
      component="img"
      src={props.asset}
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
        const line = getTrimmedPathLine(getVisualNodePosition(node), getVisualNodePosition(next));
        const curve = getPathCurve(line, node.id, id);
        return <path key={`${node.id}-${id}`} d={`M ${line.x1} ${line.y1} Q ${curve.x} ${curve.y} ${line.x2} ${line.y2}`} fill="none" stroke={PATH_COLOR} strokeDasharray={PATH_STROKE_DASH} strokeLinecap="round" strokeWidth={PATH_STROKE_WIDTH} />;
      }))}
    </svg>
  );
}

function getTrimmedPathLine(from: { x: number; y: number }, to: { x: number; y: number }) {
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

function getPathCurve(line: { x1: number; x2: number; y1: number; y2: number }, fromId: string, toId: string) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy) || 1;
  const offset = (getStableRoll(`${fromId}:${toId}:curve`) - RANDOM_CENTER) * PATH_CURVE_JITTER;
  return {
    x: (line.x1 + line.x2) / MIDPOINT_DIVISOR + (-dy / length) * offset,
    y: (line.y1 + line.y2) / MIDPOINT_DIVISOR + (dx / length) * offset
  };
}

function getVisualNodePosition(node: SpireMapNode) {
  const bossScale = node.kind === "boss" ? BOSS_VISUAL_JITTER_SCALE : 1;
  const x = node.x + (getStableRoll(`${node.id}:visual-x`) - RANDOM_CENTER) * NODE_VISUAL_X_JITTER * bossScale;
  const y = node.y + (getStableRoll(`${node.id}:visual-y`) - RANDOM_CENTER) * NODE_VISUAL_Y_JITTER * bossScale;
  return {
    x: roundPosition(clamp(x, NODE_VISUAL_MIN, NODE_VISUAL_MAX)),
    y: roundPosition(clamp(y, NODE_VISUAL_MIN, NODE_VISUAL_MAX))
  };
}

function roundPosition(value: number) { return Math.round(value * POSITION_ROUNDING_FACTOR) / POSITION_ROUNDING_FACTOR; }

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }

function getStableRoll(value: string) {
  let hash = HASH_SEED;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}

function MapNode(props: { active: boolean; completed: boolean; highlighted: boolean; highlightMode: boolean; kind: SpireNodeKind; onSelect: () => void; selectable: boolean; x: number; y: number }) {
  const [hovered, setHovered] = useState(false);
  const opacity = getNodeOpacity(props);
  const dimensions = getNodeDimensions(props.kind);
  const size = dimensions.size;
  const iconSize = dimensions.icon;
  const zIndex = getNodeZIndex(props.kind, props.highlighted, props.active);
  const highlightTone = getNodeHighlightTone(props.active, hovered);
  return (
    <Box
      aria-label={NODE_LABELS[props.kind]}
      aria-disabled={!props.selectable}
      component="button"
      onClick={() => {
        if (props.selectable) {
          props.onSelect();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ alignItems: "center", background: "transparent", border: 0, borderRadius: 0, boxShadow: "none", cursor: props.selectable ? "pointer" : "default", display: "flex", height: size, justifyContent: "center", left: `${props.x}%`, opacity, padding: 0, position: "absolute", top: `${props.y}%`, transform: "translate(-50%, -50%)", transition: NODE_HIGHLIGHT_TRANSITION, width: size, zIndex }}
      type="button"
    >
      <NodeIcon kind={props.kind} highlightTone={highlightTone} shadow size={iconSize} />
    </Box>
  );
}

function getNodeDimensions(kind: SpireNodeKind) {
  return NODE_DIMENSIONS[kind] || { icon: NODE_ICON_SIZE, size: NODE_SIZE };
}

function getNodeZIndex(kind: SpireNodeKind, highlighted: boolean, active: boolean) {
  if (active) {
    return SELECTED_NODE_Z_INDEX;
  }
  if (highlighted) {
    return HIGHLIGHTED_NODE_Z_INDEX;
  }
  return kind === "boss" ? BOSS_NODE_Z_INDEX : NODE_Z_INDEX;
}

function getNodeHighlightTone(active: boolean, hovered: boolean): "active" | "hover" | undefined {
  if (active) {
    return "active";
  }
  if (hovered) {
    return "hover";
  }
  return undefined;
}

function getNodeOpacity(props: { active: boolean; completed: boolean; highlighted: boolean; highlightMode: boolean; kind: SpireNodeKind; selectable: boolean }) {
  if (props.highlightMode) {
    return props.highlighted ? HIGHLIGHTED_NODE_OPACITY : DIMMED_NODE_OPACITY;
  }
  if (props.kind === "boss") {
    return props.selectable || props.completed || props.active ? HIGHLIGHTED_NODE_OPACITY : BOSS_LOCKED_OPACITY;
  }
  return props.selectable || props.completed || props.active ? HIGHLIGHTED_NODE_OPACITY : LOCKED_NODE_OPACITY;
}

function getRunBadgeLabel(mapOpen: boolean, node: ReturnType<typeof getCurrentSpireNode>) {
  if (mapOpen) {
    return "Choose Room";
  }
  return node ? NODE_LABELS[node.kind] : "Enemy";
}

function NodeIcon(props: { highlightTone?: "active" | "hover" | "selected"; kind: SpireNodeKind; shadow?: boolean; size?: number }) {
  const size = props.size || LEGEND_ICON_SIZE;
  const filter = getNodeIconFilter(props.kind, Boolean(props.shadow), props.highlightTone);
  return (
    <Box
      alt=""
      component="img"
      src={NODE_ICON_ASSETS[props.kind]}
      style={{ display: "block", filter, height: size, imageRendering: "pixelated", objectFit: "contain", width: size }}
    />
  );
}

function getNodeIconFilter(kind: SpireNodeKind, shadow: boolean, highlightTone: "active" | "hover" | "selected" | undefined) {
  const filters = [];
  if (kind === "unknown") {
    filters.push("saturate(0.55) brightness(1.18)");
  }
  if (shadow) {
    filters.push(NODE_DROP_SHADOW);
  }
  const highlightFilter = kind === "boss" && highlightTone === "active" ? BOSS_ACTIVE_HIGHLIGHT : getNodeHighlightFilter(highlightTone);
  if (highlightFilter) {
    filters.push(highlightFilter);
  }
  return filters.length ? filters.join(" ") : undefined;
}

function getNodeHighlightFilter(highlightTone: "active" | "hover" | "selected" | undefined) {
  if (highlightTone === "active") {
    return NODE_ACTIVE_HIGHLIGHT;
  }
  if (highlightTone === "selected") {
    return NODE_SELECTED_HIGHLIGHT;
  }
  if (highlightTone === "hover") {
    return NODE_SHAPE_HIGHLIGHT;
  }
  return undefined;
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
            style={{ background: props.highlightedKind === kind ? "rgba(223, 195, 122, 0.16)" : undefined, borderRadius: 4, cursor: "default", marginInline: -4, paddingInline: 4, transition: LEGEND_ROW_TRANSITION }}
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
