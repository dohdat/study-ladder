import { Box, Group, Paper, Stack, Text } from "@mantine/core";
type StaticImageData = string;
import { useCallback, useEffect, useRef, useState } from "react";

import { HeroSiegeButton, getHeroSiegeMenuButtonAsset } from "./HeroSiegeUi";
import { CoinIcon } from "./CoinIcon";
import { HeroSiegeEquipmentIcon } from "./HeroSiegeItemIcon";
import { ShopPanel } from "./ShopPanel";
import { RelicIcon } from "./RelicIcon";
import { getSpireCampaignLabel, getSpireDifficultyModifiers } from "../lib/campaignCore";
import { canUpgradeSpireInventoryItem, claimCurrentSpireRoomReward, digCurrentSpireRoomRelic, enterSpireNode, getCurrentSpireNode, getRestSpecialAction, isCombatNode, leaveSpireRoom, MERCHANT_UPGRADE_COST, selectSpireNode, upgradeCurrentSpireRoomItem } from "../lib/spireMapCore";
import type { SpireAct, SpireMapNode, SpireNodeKind, StudyState } from "../types/study";
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
import questionMarkArt from "../assets/hero_siege_map/question-mark.png";
import wildBushArt from "../assets/hero_siege_map/wild-bush.png";
import demonKingArt from "../assets/hero_siege_monsters/demon-king.png";
import desertBeastArt from "../assets/hero_siege_monsters/desert-beast.png";
import hellBeastArt from "../assets/hero_siege_monsters/hell-beast.png";
import sheepKingArt from "../assets/hero_siege_monsters/sheep-king.png";
import skeletonMageArt from "../assets/hero_siege_monsters/skeleton-mage.png";
import zombieArt from "../assets/hero_siege_monsters/zombie.png";

const EXPANDED_MAP_HEIGHT = "calc(100vh - 126px)";
const COMPACT_ROOM_HEIGHT = 66;
const COMPACT_ROOM_ICON_SIZE = 42;
const COMPACT_ROOM_ICON_INSET = 8;
const ROOM_PANEL_MIN_HEIGHT = "calc(100vh - 126px)";
const NODE_SIZE = 86;
const NODE_ICON_SIZE = 82;
const BOSS_NODE_SIZE = 150;
const BOSS_NODE_ICON_SIZE = 140;
const LEGEND_ICON_SIZE = 24;
const MAP_CONTENT_WIDTH = 1780;
const MAP_CONTENT_HEIGHT = 1680;
const PATH_COLOR = "rgba(25, 31, 34, 0.48)";
const LOCKED_NODE_OPACITY = 0.42;
const HIGHLIGHTED_NODE_OPACITY = 1;
const DIMMED_NODE_OPACITY = 0.2;
const NODE_DROP_SHADOW = "drop-shadow(0 4px 4px rgba(0, 0, 0, 0.52))";
const NODE_SHAPE_HIGHLIGHT = "drop-shadow(1px 0 0 rgba(255, 255, 255, 0.98)) drop-shadow(-1px 0 0 rgba(255, 255, 255, 0.98)) drop-shadow(0 1px 0 rgba(255, 255, 255, 0.98)) drop-shadow(0 -1px 0 rgba(255, 255, 255, 0.98)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))";
const NODE_SELECTED_HIGHLIGHT = "drop-shadow(2px 0 0 rgba(255, 220, 89, 0.98)) drop-shadow(-2px 0 0 rgba(255, 220, 89, 0.98)) drop-shadow(0 2px 0 rgba(255, 220, 89, 0.98)) drop-shadow(0 -2px 0 rgba(255, 220, 89, 0.98)) drop-shadow(0 0 14px rgba(255, 220, 89, 0.88))";
const NODE_ACTIVE_HIGHLIGHT = "drop-shadow(2px 0 0 rgba(62, 169, 255, 0.98)) drop-shadow(-2px 0 0 rgba(62, 169, 255, 0.98)) drop-shadow(0 2px 0 rgba(62, 169, 255, 0.98)) drop-shadow(0 -2px 0 rgba(62, 169, 255, 0.98)) drop-shadow(0 0 14px rgba(62, 169, 255, 0.88))";
const BOSS_ACTIVE_HIGHLIGHT = "drop-shadow(2px 0 0 rgba(175, 35, 42, 0.98)) drop-shadow(-2px 0 0 rgba(175, 35, 42, 0.98)) drop-shadow(0 2px 0 rgba(175, 35, 42, 0.98)) drop-shadow(0 -2px 0 rgba(175, 35, 42, 0.98)) drop-shadow(0 0 18px rgba(151, 21, 28, 0.9))";
const COMPLETED_ROOM_RING_COLOR = "rgba(13, 22, 27, 0.96)";
const COMPLETED_ROOM_RING_SHADOW = "drop-shadow(0 2px 0 rgba(255, 255, 220, 0.18)) drop-shadow(0 1px 0 rgba(0, 0, 0, 0.34))";
const NODE_HIGHLIGHT_TRANSITION = "opacity 70ms ease-out";
const LEGEND_ROW_TRANSITION = "background-color 70ms ease-out";
const NODE_Z_INDEX = 2;
const HIGHLIGHTED_NODE_Z_INDEX = 3;
const SELECTED_NODE_Z_INDEX = 4;
const BOSS_NODE_Z_INDEX = 4;
const BOSS_LOCKED_OPACITY = 0.78;
const MAP_BG = "#909286";
const ACT_TWO_MAP_BG = "#a98554";
const ACT_THREE_MAP_BG = "#60714d";
const ACT_FOUR_MAP_BG = "#504a4d";
const ENTER_BUTTON_RIGHT = 16;
const ENTER_BUTTON_BOTTOM = 16;
const PATH_NODE_RADIUS = 2.3;
const PATH_STROKE_WIDTH = 0.16;
const PATH_STROKE_DASH = "0.42 0.38";
const PATH_CURVE_JITTER = 0.6;
const NODE_VISUAL_X_JITTER = 1.2;
const NODE_VISUAL_Y_JITTER = 0.9;
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
const ACT_LABEL_TOP = 16;
const ACT_LABEL_BORDER = "1px solid rgba(223, 195, 122, 0.72)";
const ACT_LABEL_BG = "linear-gradient(180deg, rgba(51, 34, 19, 0.96), rgba(15, 12, 8, 0.94))";
const ACT_LABEL_ASSET = getHeroSiegeMenuButtonAsset();
const NODE_LABELS: Record<SpireNodeKind, string> = {
  boss: "Boss",
  event: "Event",
  elite: "Elite",
  enemy: "Enemy",
  merchant: "Merchant",
  rest: "Rest",
  treasure: "Treasure",
  unknown: "Unknown"
};
const COMPLETED_ROOM_RING_PATHS = [
  "M325,18C228.7-8.3,118.5,8.3,78,21C22.4,38.4,4.6,54.6,5.6,77.6c1.4,32.4,52.2,54,142.6,63.7 c66.2,7.1,212.2,7.5,273.5-8.3c64.4-16.6,104.3-57.6,33.8-98.2C386.7-4.9,179.4-1.4,126.3,20.7",
  "M346,17C250,-3,132,4,73,23C21,40,1,61,12,86c14,32,74,48,166,54c80,5,218,-2,276,-25c52,-21,61,-56,4,-82C394,4,188,-5,112,25",
  "M302,19C216,-7,101,6,59,29C13,54,10,83,42,105c37,25,116,34,214,31c95,-3,201,-18,230,-50c22,-25,2,-52,-47,-67C365,-3,181,-2,106,23",
  "M331,16C238,-10,128,8,82,18C28,29,0,51,8,79c11,39,75,59,171,64c86,4,211,1,276,-21c60,-20,72,-58,13,-88C397,-3,197,4,119,18"
];

const NODE_ICON_ASSETS: Record<SpireNodeKind, StaticImageData> = {
  boss: demonKingArt,
  event: questionMarkArt,
  elite: skeletonMageArt,
  enemy: zombieArt,
  merchant: fieldTentArt,
  rest: campfireArt,
  treasure: chestArt,
  unknown: questionMarkArt
};
const ACT_BOSS_NODE_ASSETS: Partial<Record<SpireAct, StaticImageData>> = {
  2: desertBeastArt,
  3: hellBeastArt,
  4: sheepKingArt
};

const NODE_DIMENSIONS: Record<SpireNodeKind, { icon: number; size: number }> = {
  boss: { icon: BOSS_NODE_ICON_SIZE, size: BOSS_NODE_SIZE },
  event: { icon: 24, size: 34 },
  elite: { icon: 42, size: 54 },
  enemy: { icon: 34, size: 44 },
  merchant: { icon: 56, size: 68 },
  rest: { icon: 42, size: 54 },
  treasure: { icon: 42, size: 54 },
  unknown: { icon: 22, size: 34 }
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
  const selectedNodeIsReachable = mapOpen && Boolean(node && isReachableMapNode(props.state, node.id));
  const mapBg = getActMapBackground(props.state.profile.spireRun.act);
  return (
    <Paper withBorder p="sm" style={{ background: "var(--mantine-color-dark-7)", ...(mapOpen && props.fillAvailableHeight ? { ...FLEX_FILL_STYLE, display: "flex", flexDirection: "column" } : {}) }}>
      <Box style={{ minWidth: 0, ...(mapOpen && props.fillAvailableHeight ? { ...FLEX_FILL_STYLE, display: "flex", flexDirection: "column" } : {}) }}>
        {mapOpen ? (
          <Box style={{ background: mapBg, border: "1px solid var(--mantine-color-dark-4)", height: props.fillAvailableHeight ? undefined : EXPANDED_MAP_HEIGHT, overflow: "hidden", position: "relative", ...(props.fillAvailableHeight ? FLEX_FILL_STYLE : {}) }}>
            <Box
              className="spire-map-scroll"
              ref={mapDrag.scrollRef}
              onPointerCancel={mapDrag.endDrag}
              onPointerDown={mapDrag.startDrag}
              onPointerMove={mapDrag.moveDrag}
              onPointerUp={mapDrag.endDrag}
              style={{ cursor: mapDrag.dragging ? "grabbing" : "grab", inset: 0, msOverflowStyle: "none", overflow: "auto", overscrollBehavior: "contain", position: "absolute", scrollbarWidth: "none", touchAction: "none", userSelect: mapDrag.dragging ? "none" : undefined }}
            >
              <Box style={{ background: mapBg, height: MAP_CONTENT_HEIGHT, minHeight: "100%", minWidth: "100%", position: "relative", width: MAP_CONTENT_WIDTH }}>
                <MapBackdrop act={props.state.profile.spireRun.act} />
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
                      act={props.state.profile.spireRun.act}
                      kind={mapNode.kind}
                      onSelect={() => props.setState((previous) => selectSpireNode(previous, mapNode.id))}
                      selectable={isReachableMapNode(props.state, mapNode.id)}
                      x={position.x}
                      y={position.y}
                    />
                  );
                })}
                <ActMapLabel state={props.state} />
              </Box>
            </Box>
            <Legend highlightedKind={highlightedKind} onHighlight={setDebouncedHighlightedKind} />
            <HeroSiegeButton
              disabled={!selectedNodeIsReachable}
              onClick={() => props.setState((previous) => enterSpireNode(previous))}
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
          <RoomPanel node={node} setState={props.setState} solved={solved} state={props.state} target={target} />
        )}
      </Box>
    </Paper>
  );
}

function isReachableMapNode(state: StudyState, nodeId: string) {
  return state.profile.godMode || state.profile.spireRun.availableNodeIds.includes(nodeId);
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

function RoomPanel(props: { node: SpireMapNode | undefined; setState: React.Dispatch<React.SetStateAction<StudyState>>; solved: number; state: StudyState; target: number }) {
  if (isCombatNode(props.node)) {
    return <CompactRoomPanel node={props.node} solved={props.solved} state={props.state} target={props.target} />;
  }
  return (
    <Stack gap="sm" style={{ minHeight: ROOM_PANEL_MIN_HEIGHT }}>
      <CompactRoomPanel node={props.node} solved={props.solved} state={props.state} target={props.target} />
      {props.node?.kind === "merchant" && <MerchantRoomPanel setState={props.setState} state={props.state} />}
      {props.node?.kind === "treasure" && <TreasureRoomPanel node={props.node} setState={props.setState} state={props.state} />}
      {props.node?.kind === "rest" && <RestRoomPanel node={props.node} setState={props.setState} state={props.state} />}
      {props.node?.kind === "event" && <EventRoomPanel node={props.node} setState={props.setState} state={props.state} />}
    </Stack>
  );
}

function CompactRoomPanel(props: { node: SpireMapNode | undefined; solved: number; state: StudyState; target: number }) {
  const kind = props.node?.kind || "enemy";
  const campaignLabel = getSpireCampaignLabel(props.state.profile.spireRun);
  return (
    <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, borderRadius: 2, boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.72)", height: COMPACT_ROOM_HEIGHT, overflow: "hidden", padding: "10px 14px" }}>
      <Group gap="sm" wrap="nowrap">
        <Box style={{ alignItems: "center", background: "rgba(0, 0, 0, 0.32)", border: "1px solid rgba(223, 195, 122, 0.32)", display: "flex", height: COMPACT_ROOM_ICON_SIZE, justifyContent: "center", width: COMPACT_ROOM_ICON_SIZE }}>
          <NodeIcon act={props.state.profile.spireRun.act} kind={kind} size={COMPACT_ROOM_ICON_SIZE - COMPACT_ROOM_ICON_INSET} />
        </Box>
        <Box>
          <Text size="sm" fw={900} tt="uppercase" style={{ color: "#f1dfad", letterSpacing: 0, textShadow: "0 1px 0 #000" }}>{NODE_LABELS[kind]}</Text>
          <Text size="xs" c="dimmed">{campaignLabel}</Text>
        </Box>
      </Group>
      <Text size="xs" c="dimmed">Room {props.solved}/{props.target}</Text>
    </Group>
  );
}

function MerchantRoomPanel(props: { setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  const currentNode = getCurrentSpireNode(props.state);
  const upgraded = Boolean(currentNode && props.state.profile.spireRun.completedNodeIds.includes(currentNode.id));
  const canUpgrade = !upgraded && canUpgradeSpireInventoryItem(props.state) && props.state.profile.coins >= MERCHANT_UPGRADE_COST;
  const upgradeItem = () => {
    props.setState((previous) => {
      const beforeItems = previous.profile.inventory;
      const next = upgradeCurrentSpireRoomItem(previous);
      const changed = next.profile.inventory.find((item) => {
        const before = beforeItems.find((row) => row.id === item.id);
        return before && (before.rarity !== item.rarity || JSON.stringify(before.stats) !== JSON.stringify(item.stats));
      });
      setUpgradeMessage(changed ? `${changed.name} upgraded to ${changed.rarity}.` : "No eligible item was upgraded.");
      return next;
    });
  };
  return (
    <Stack gap="sm">
      <ShopPanel state={props.state} setState={props.setState} />
      <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "10px 14px" }}>
        <Box>
          <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>Merchant Services</Text>
          <Text size="xs" c="dimmed">{upgraded ? "Merchant upgrade used. You can still shop, then continue." : `Upgrade one random item up to Rare for ${MERCHANT_UPGRADE_COST} gold.`}</Text>
          {upgradeMessage && <Text size="xs" c="yellow.3" fw={800}>{upgradeMessage}</Text>}
        </Box>
        <Group gap={8} wrap="nowrap">
          <HeroSiegeButton disabled={!canUpgrade} onClick={upgradeItem} minWidth={132}>Upgrade Item</HeroSiegeButton>
          <HeroSiegeButton onClick={() => props.setState((previous) => leaveSpireRoom(previous))} minWidth={104}>Continue</HeroSiegeButton>
        </Group>
      </Group>
    </Stack>
  );
}

function TreasureRoomPanel(props: { node: SpireMapNode; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const opened = props.state.profile.spireRun.completedNodeIds.includes(props.node.id);
  const rewardClaim = props.state.profile.spireRun.roomRewardClaims[props.node.id];
  return (
    <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "14px 16px" }}>
      <Group gap="sm" wrap="nowrap">
        <NodeIcon kind="treasure" size={46} />
        <Box>
          <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>{opened ? "Treasure Opened" : "Treasure Chest"}</Text>
          <Text size="xs" c="dimmed">{opened ? "Continue to choose the next route." : "Open the chest to claim gold and a random relic or equipment reward."}</Text>
          {rewardClaim && <TreasureRewardIcons claim={rewardClaim} state={props.state} />}
        </Box>
      </Group>
      <Group gap={8} wrap="nowrap">
        <HeroSiegeButton disabled={opened} onClick={() => props.setState((previous) => claimCurrentSpireRoomReward(previous))} minWidth={134}>Open Treasure</HeroSiegeButton>
        <HeroSiegeButton disabled={!opened} onClick={() => props.setState((previous) => leaveSpireRoom(previous))} minWidth={104}>Continue</HeroSiegeButton>
      </Group>
    </Group>
  );
}

function TreasureRewardIcons(props: { claim: StudyState["profile"]["spireRun"]["roomRewardClaims"][string]; state: StudyState }) {
  const relics = (props.claim.relicIds || []).map((id) => props.state.profile.relics.find((relic) => relic.id === id)).filter(Boolean);
  const items = (props.claim.itemIds || []).map((id) => props.state.profile.inventory.find((item) => item.id === id)).filter(Boolean);
  return (
    <Group gap={8} mt={6} wrap="nowrap">
      {props.claim.gold ? (
        <Group gap={4} wrap="nowrap">
          <CoinIcon size={18} />
          <Text size="xs" fw={900} c="yellow.3">+{props.claim.gold} gold</Text>
        </Group>
      ) : null}
      {relics.map((relic) => relic && (
        <Group key={relic.id} gap={4} wrap="nowrap">
          <RelicIcon relic={relic} size={26} unframed />
          <Text size="xs" fw={900} c="cyan.3">{relic.name}</Text>
        </Group>
      ))}
      {items.map((item) => item && (
        <Group key={item.id} gap={4} wrap="nowrap">
          <HeroSiegeEquipmentIcon item={item} size={28} unframed />
          <Text size="xs" fw={900} c="#f1dfad">{item.name}</Text>
        </Group>
      ))}
    </Group>
  );
}

function RestRoomPanel(props: { node: SpireMapNode; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const used = props.state.profile.spireRun.completedNodeIds.includes(props.node.id);
  const specialAction = getRestSpecialAction(props.state);
  const specialText = specialAction === "smith" ? "Smith upgrades one random item up to Rare." : "Dig finds one random relic.";
  return (
    <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "14px 16px" }}>
      <Group gap="sm" wrap="nowrap">
        <NodeIcon kind="rest" size={46} />
        <Box>
          <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>{used ? "Rest Site Used" : "Rest Site"}</Text>
          <Text size="xs" c="dimmed">{used ? "Continue to choose the next route." : `Rest heals 50% health. ${specialText}`}</Text>
        </Box>
      </Group>
      <Group gap={8} wrap="nowrap">
        <HeroSiegeButton disabled={used} onClick={() => props.setState((previous) => claimCurrentSpireRoomReward(previous))} minWidth={104}>Rest</HeroSiegeButton>
        {specialAction === "smith" ? (
          <HeroSiegeButton disabled={used || !canUpgradeSpireInventoryItem(props.state)} onClick={() => props.setState((previous) => upgradeCurrentSpireRoomItem(previous))} minWidth={104}>Smith</HeroSiegeButton>
        ) : (
          <HeroSiegeButton disabled={used} onClick={() => props.setState((previous) => digCurrentSpireRoomRelic(previous))} minWidth={104}>Dig</HeroSiegeButton>
        )}
        <HeroSiegeButton disabled={!used} onClick={() => props.setState((previous) => leaveSpireRoom(previous))} minWidth={104}>Continue</HeroSiegeButton>
      </Group>
    </Group>
  );
}

function EventRoomPanel(props: { node: SpireMapNode; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const resolved = props.state.profile.spireRun.completedNodeIds.includes(props.node.id);
  return (
    <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "14px 16px" }}>
      <Group gap="sm" wrap="nowrap">
        <NodeIcon kind="event" size={36} />
        <Box>
          <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>{resolved ? "Event Resolved" : "Unknown Event"}</Text>
          <Text size="xs" c="dimmed">{resolved ? "Event reward claimed. Continue to choose the next route." : "Resolve the event to receive a random boon."}</Text>
        </Box>
      </Group>
      <Group gap={8} wrap="nowrap">
        <HeroSiegeButton disabled={resolved} onClick={() => props.setState((previous) => claimCurrentSpireRoomReward(previous))} minWidth={124}>Resolve Event</HeroSiegeButton>
        <HeroSiegeButton disabled={!resolved} onClick={() => props.setState((previous) => leaveSpireRoom(previous))} minWidth={104}>Continue</HeroSiegeButton>
      </Group>
    </Group>
  );
}

function MapBackdrop(props: { act: SpireAct }) {
  if (props.act === 2) {
    return (
      <Box aria-hidden="true" style={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "absolute", zIndex: 0 }}>
        <MapProp asset={fieldWallArt} left={2} top={15} width={170} opacity={0.24} />
        <MapProp asset={fieldPillarArt} left={9} top={82} width={86} opacity={0.34} />
        <MapProp asset={fieldTorchArt} left={15} top={28} width={70} opacity={0.3} />
        <MapProp asset={fieldWallArt} left={100} top={18} width={180} opacity={0.26} />
        <MapProp asset={fieldPillarArt} left={91} top={80} width={96} opacity={0.34} />
        <MapProp asset={graveyardRocksArt} left={96} top={93} width={96} opacity={0.22} />
      </Box>
    );
  }
  if (props.act === 3) {
    return (
      <Box aria-hidden="true" style={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "absolute", zIndex: 0 }}>
        <MapProp asset={deadTreeArt} left={3} top={16} width={124} opacity={0.28} />
        <MapProp asset={wildBushArt} left={7} top={84} width={112} opacity={0.3} />
        <MapProp asset={fieldTreeArt} left={15} top={31} width={116} opacity={0.18} />
        <MapProp asset={deadTreeArt} left={96} top={16} width={132} opacity={0.3} />
        <MapProp asset={wildBushArt} left={92} top={85} width={126} opacity={0.32} />
        <MapProp asset={fieldCorpseArt} left={98} top={94} width={78} opacity={0.24} />
      </Box>
    );
  }
  if (props.act === 4) {
    return (
      <Box aria-hidden="true" style={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "absolute", zIndex: 0 }}>
        <MapProp asset={fieldWallArt} left={0} top={12} width={190} opacity={0.28} />
        <MapProp asset={fieldTorchArt} left={8} top={30} width={82} opacity={0.38} />
        <MapProp asset={fieldCorpseArt} left={12} top={88} width={92} opacity={0.24} />
        <MapProp asset={fieldWallArt} left={100} top={12} width={190} opacity={0.3} />
        <MapProp asset={fieldTorchArt} left={92} top={30} width={82} opacity={0.4} />
        <MapProp asset={deadTreeArt} left={96} top={84} width={120} opacity={0.22} />
      </Box>
    );
  }
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

function ActMapLabel(props: { state: StudyState }) {
  const difficulty = getSpireDifficultyModifiers(props.state.profile.spireRun);
  return (
    <Box
      style={{
        alignItems: "center",
        backgroundColor: "transparent",
        backgroundImage: `url(${ACT_LABEL_ASSET})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        border: 0,
        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.34)",
        color: "#f1dfad",
        display: "flex",
        height: 40,
        imageRendering: "pixelated",
        justifyContent: "center",
        left: "50%",
        minWidth: 420,
        padding: "0 26px",
        position: "absolute",
        top: ACT_LABEL_TOP,
        transform: "translateX(-50%)",
        zIndex: 4
      }}
    >
      <Text size="xs" fw={900} ta="center" tt="uppercase" style={{ letterSpacing: 0, lineHeight: 1, textShadow: "0 2px 0 #000" }}>
        {getSpireCampaignLabel(props.state.profile.spireRun)} {difficulty.resistancePenalty ? `(${difficulty.resistancePenalty}% Resist)` : ""}
      </Text>
    </Box>
  );
}

function getMapButtonLabel(node: SpireMapNode | undefined) {
  if (!node || isCombatNode(node)) {
    return "Enter Room";
  }
  if (node.kind === "treasure") {
    return "Enter Treasure";
  }
  if (node.kind === "rest") {
    return "Enter Rest";
  }
  if (node.kind === "merchant") {
    return "Enter Shop";
  }
  if (node.kind === "unknown") {
    return "Enter ?";
  }
  if (node.kind === "event") {
    return "Enter Event";
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

function MapNode(props: { act: SpireAct; active: boolean; completed: boolean; highlighted: boolean; highlightMode: boolean; kind: SpireNodeKind; onSelect: () => void; selectable: boolean; x: number; y: number }) {
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
      {props.completed && <CompletedRoomRing kind={props.kind} seed={`${props.kind}:${props.x}:${props.y}`} size={size} />}
      <NodeIcon act={props.act} kind={props.kind} highlightTone={highlightTone} shadow size={iconSize} />
    </Box>
  );
}

function CompletedRoomRing(props: { kind: SpireNodeKind; seed: string; size: number }) {
  const variant = getCompletedRoomRingVariant(props.seed);
  const ringSize = getCompletedRoomRingSize(props.kind, props.size, variant.size);
  const strokeWidth = getCompletedRoomRingStroke(props.kind, variant.stroke);
  const secondaryStrokeWidth = Math.max(4, strokeWidth * 0.54);
  const path = getCompletedRoomRingPath(variant.path);
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="0 0 500 150"
      style={{
        filter: COMPLETED_ROOM_RING_SHADOW,
        height: ringSize,
        overflow: "visible",
        pointerEvents: "none",
        position: "absolute",
        transform: `translate(${variant.offsetX}px, ${variant.offsetY}px) rotate(${getCompletedRoomRingRotation(props.kind, variant.rotation)}deg)`,
        width: ringSize,
        zIndex: 0
      }}
    >
      <path d={path} fill="none" opacity={0.3} stroke="rgba(228, 218, 190, 0.52)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={secondaryStrokeWidth} />
      <path d={path} fill="none" stroke={COMPLETED_ROOM_RING_COLOR} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
    </svg>
  );
}

function getCompletedRoomRingVariant(seed: string) {
  return {
    offsetX: Math.round((getStableRoll(`${seed}:ring-x`) - RANDOM_CENTER) * 6),
    offsetY: Math.round((getStableRoll(`${seed}:ring-y`) - RANDOM_CENTER) * 5),
    path: Math.floor(getStableRoll(`${seed}:ring-path`) * COMPLETED_ROOM_RING_PATHS.length),
    rotation: Math.round((getStableRoll(`${seed}:ring-rotation`) - RANDOM_CENTER) * 22),
    size: 0.9 + getStableRoll(`${seed}:ring-size`) * 0.28,
    stroke: 0.85 + getStableRoll(`${seed}:ring-stroke`) * 0.35
  };
}

function getCompletedRoomRingPath(index: number) {
  return COMPLETED_ROOM_RING_PATHS[index] || COMPLETED_ROOM_RING_PATHS[0];
}

function getCompletedRoomRingSize(kind: SpireNodeKind, size: number, scale: number) {
  if (kind === "boss") {
    return Math.round(size * 0.92 * scale);
  }
  return Math.round(size * 1.72 * scale);
}

function getCompletedRoomRingStroke(kind: SpireNodeKind, scale: number) {
  return Math.round((kind === "boss" ? 9 : 8) * scale);
}

function getCompletedRoomRingRotation(kind: SpireNodeKind, rotation: number) {
  return (kind === "boss" ? -10 : 9) + rotation;
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

function NodeIcon(props: { act?: SpireAct; highlightTone?: "active" | "hover" | "selected"; kind: SpireNodeKind; shadow?: boolean; size?: number }) {
  const size = props.size || LEGEND_ICON_SIZE;
  const filter = getNodeIconFilter(props.kind, Boolean(props.shadow), props.highlightTone);
  const opacity = getNodeIconOpacity(props.kind, props.highlightTone);
  return (
    <Box
      alt=""
      component="img"
      src={getNodeIconAsset(props.kind, props.act)}
      style={{ display: "block", filter, height: size, imageRendering: "pixelated", objectFit: "contain", opacity, position: "relative", width: size, zIndex: 1 }}
    />
  );
}

function getNodeIconAsset(kind: SpireNodeKind, act: SpireAct = 1) {
  if (kind === "boss") {
    return ACT_BOSS_NODE_ASSETS[act] || NODE_ICON_ASSETS.boss;
  }
  return NODE_ICON_ASSETS[kind];
}

function getActMapBackground(act: SpireAct) {
  if (act === 2) {
    return ACT_TWO_MAP_BG;
  }
  if (act === 3) {
    return ACT_THREE_MAP_BG;
  }
  if (act === 4) {
    return ACT_FOUR_MAP_BG;
  }
  return MAP_BG;
}

function getNodeIconFilter(kind: SpireNodeKind, shadow: boolean, highlightTone: "active" | "hover" | "selected" | undefined) {
  const filters = [];
  if (kind !== "boss") {
    filters.push("grayscale(1) saturate(0.25) contrast(1.35) brightness(0.54)");
  }
  if (kind === "unknown") {
    filters.push("brightness(0.74)");
  }
  if (shadow) {
    filters.push(kind === "boss" ? NODE_DROP_SHADOW : "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.32))");
  }
  const highlightFilter = kind === "boss" && highlightTone === "active" ? BOSS_ACTIVE_HIGHLIGHT : getNodeHighlightFilter(highlightTone);
  if (highlightFilter) {
    filters.push(highlightFilter);
  }
  return filters.length ? filters.join(" ") : undefined;
}

function getNodeIconOpacity(kind: SpireNodeKind, highlightTone: "active" | "hover" | "selected" | undefined) {
  if (kind === "boss" || highlightTone) {
    return 1;
  }
  return 0.78;
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
  const rows: SpireNodeKind[] = ["unknown", "event", "merchant", "treasure", "rest", "enemy", "elite", "boss"];
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
