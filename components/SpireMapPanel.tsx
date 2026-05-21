import { Badge, Box, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
type StaticImageData = string;
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { HeroSiegeButton, getHeroSiegeMenuButtonAsset } from "./HeroSiegeUi";
import { CoinIcon } from "./CoinIcon";
import { ShopPanel } from "./ShopPanel";
import { RelicIcon } from "./RelicIcon";
import { HEAT_CONDITION_DEFINITIONS, MAX_HEAT, getHeatLevel, getSpireCampaignLabel, getSpireDifficultyModifiers } from "../lib/campaignCore";
import { attuneRestSiteRelic, canEditSpireHeat, choosePendingRelicReward, claimCurrentSpireRoomReward, enterSpireNode, getCurrentSpireNode, getRestAttunableRelics, isCombatNode, isSpireRunSetupOpen, leaveSpireRoom, rerollPendingRelicReward, resetSpireHeat, selectPendingRelicReward, selectSpireNode, setSpireHeatConditionRank, skipPendingRelicReward, startSpireHeatRun } from "../lib/spireMapCore";
import { META_UPGRADE_DEFINITIONS, canPurchaseMetaUpgrade, getMetaUpgradeCost, purchaseMetaUpgrade } from "../lib/studyCore";
import { formatModifier } from "../lib/modifierFormat";
import { getRelicRarityColor } from "../lib/heroSiegeQuality";
import type { Relic, SpireAct, SpireCombatRewardKind, SpireMapNode, SpireNodeKind, StudyState } from "../types/study";
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
import barbedShieldArt from "../assets/hero_siege_relics/barbed-shield.png";
import bookOfBelialArt from "../assets/hero_siege_relics/book-of-belial.png";
import casinoDiceArt from "../assets/hero_siege_relics/casino-dice.png";
import deathsScytheArt from "../assets/hero_siege_relics/deaths-scythe.png";
import dislocatedEyeArt from "../assets/hero_siege_relics/dislocated-eye.png";
import fortuneCardArt from "../assets/hero_siege_relics/fortune-card.png";
import guardianAngelArt from "../assets/hero_siege_relics/guardian-angel.png";
import heatOrbArt from "../assets/hero_siege_relics/orb-of-fire.png";
import holyGrailArt from "../assets/hero_siege_relics/holy-grail.png";
import kingsCrownArt from "../assets/hero_siege_relics/kings-crown.png";
import midasHandArt from "../assets/hero_siege_relics/midas-hand.png";
import oddBookArt from "../assets/hero_siege_relics/odd-book.png";
import razorwireArt from "../assets/hero_siege_relics/razorwire.png";
import steamSaleArt from "../assets/hero_siege_relics/steam-sale.png";
import tokenLuckArt from "../assets/hero_siege_relics/token-luck.png";
import battleTranceArt from "../assets/hero_siege_skills/battle-trance.png";
import findItemArt from "../assets/hero_siege_skills/find-item.png";
import ironSkinArt from "../assets/hero_siege_skills/iron-skin.png";
import shieldMasteryArt from "../assets/hero_siege_skills/shield-mastery.png";
import sureCritArt from "../assets/hero_siege_skills/sure-crit.png";
import swordMasteryArt from "../assets/hero_siege_skills/sword-mastery.png";
import treasureSenseArt from "../assets/hero_siege_skills/treasure-sense.png";

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
const MAP_SCROLL_PERFORMANCE_DEBOUNCE_MS = 140;
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
const USER_MENU_OPEN_EVENT = "study-ladder-user-menu-open";
const HEAT_PANEL_TOP = 70;
const HEAT_PANEL_LEFT = 16;
const HEAT_ROW_ICON_SIZE = 18;
const NODE_LABELS: Record<SpireNodeKind, string> = {
  blight: "Blight",
  boss: "Boss",
  event: "Event",
  elite: "Elite",
  enemy: "Enemy",
  merchant: "Merchant",
  rest: "Rest",
  treasure: "Treasure",
  unknown: "Unknown"
};

const NODE_ICON_ASSETS: Record<SpireNodeKind, StaticImageData> = {
  blight: deadTreeArt,
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
  blight: { icon: 34, size: 44 },
  boss: { icon: BOSS_NODE_ICON_SIZE, size: BOSS_NODE_SIZE },
  event: { icon: 24, size: 34 },
  elite: { icon: 42, size: 54 },
  enemy: { icon: 34, size: 44 },
  merchant: { icon: 56, size: 68 },
  rest: { icon: 42, size: 54 },
  treasure: { icon: 42, size: 54 },
  unknown: { icon: 22, size: 34 }
};

type VisualSpireMapNode = SpireMapNode & { position: { x: number; y: number } };

// eslint-disable-next-line complexity
export function SpireMapPanel(props: { fillAvailableHeight?: boolean; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const [highlightedKind, setHighlightedKind] = useState<SpireNodeKind | null>(null);
  const setDebouncedHighlightedKind = useDebouncedLegendHighlight(setHighlightedKind);
  const userMenuOpen = useUserMenuOpen();
  const mapDrag = useMapDrag();
  const node = getCurrentSpireNode(props.state);
  const solved = props.state.profile.spireRun.roundSolvedIds.length;
  const target = props.state.profile.spireRun.roundQuestionIds.length;
  const mapOpen = props.state.profile.spireRun.mapOpen;
  const selectedNodeIsReachable = mapOpen && Boolean(node && isReachableMapNode(props.state, node.id));
  const pendingRelicReward = props.state.profile.spireRun.pendingRelicReward;
  const mapBg = getActMapBackground(props.state.profile.spireRun.act);
  const reachableNodeIds = useMemo(() => new Set(props.state.profile.spireRun.availableNodeIds), [props.state.profile.spireRun.availableNodeIds]);
  const completedNodeIds = useMemo(() => new Set(props.state.profile.spireRun.completedNodeIds), [props.state.profile.spireRun.completedNodeIds]);
  const visualNodes = useMemo(() => props.state.profile.spireRun.nodes.map((mapNode) => ({ ...mapNode, position: getVisualNodePosition(mapNode) })), [props.state.profile.spireRun.nodes]);
  useEffect(() => {
    if (userMenuOpen) {
      setHighlightedKind(null);
    }
  }, [userMenuOpen]);
  return (
    <Paper withBorder p="sm" style={{ background: "var(--mantine-color-dark-7)", ...(mapOpen && props.fillAvailableHeight ? { ...FLEX_FILL_STYLE, display: "flex", flexDirection: "column" } : {}) }}>
      <Box style={{ minWidth: 0, ...(mapOpen && props.fillAvailableHeight ? { ...FLEX_FILL_STYLE, display: "flex", flexDirection: "column" } : {}) }}>
        {mapOpen && isSpireRunSetupOpen(props.state) ? (
          <RunSetupScreen fillAvailableHeight={props.fillAvailableHeight} setState={props.setState} state={props.state} />
        ) : mapOpen ? (
          <Box style={{ background: mapBg, border: "1px solid var(--mantine-color-dark-4)", height: props.fillAvailableHeight ? undefined : EXPANDED_MAP_HEIGHT, overflow: "hidden", position: "relative", ...(props.fillAvailableHeight ? FLEX_FILL_STYLE : {}) }}>
            <Box
              className="spire-map-scroll"
              ref={mapDrag.scrollRef}
              onPointerCancel={mapDrag.endDrag}
              onPointerDown={mapDrag.startDrag}
              onPointerMove={mapDrag.moveDrag}
              onPointerUp={mapDrag.endDrag}
              onScroll={mapDrag.onScroll}
              style={{ contain: "layout paint style", cursor: mapDrag.dragging ? "grabbing" : "grab", inset: 0, msOverflowStyle: "none", overflow: "auto", overscrollBehavior: "contain", position: "absolute", scrollbarWidth: "none", touchAction: "none", userSelect: mapDrag.dragging ? "none" : undefined, willChange: "scroll-position" }}
            >
              <Box style={{ background: mapBg, contain: "layout paint style", height: MAP_CONTENT_HEIGHT, minHeight: "100%", minWidth: "100%", position: "relative", transform: "translateZ(0)", width: MAP_CONTENT_WIDTH }}>
                <MapBackdrop act={props.state.profile.spireRun.act} />
                <MapPaths nodes={visualNodes} />
                {visualNodes.map((mapNode) => {
                  return (
                    <MapNode
                      key={mapNode.id}
                      active={mapNode.id === props.state.profile.spireRun.currentNodeId}
                      completed={completedNodeIds.has(mapNode.id)}
                      highlighted={highlightedKind === mapNode.kind}
                      highlightMode={Boolean(highlightedKind)}
                      act={props.state.profile.spireRun.act}
                      mapMoving={mapDrag.mapMoving}
                      id={mapNode.id}
                      kind={mapNode.kind}
                      onSelect={() => props.setState((previous) => selectSpireNode(previous, mapNode.id))}
                      rewardKind={mapNode.rewardKind}
                      selectable={props.state.profile.godMode || reachableNodeIds.has(mapNode.id)}
                      x={mapNode.position.x}
                      y={mapNode.position.y}
                    />
                  );
                })}
                <ActMapLabel state={props.state} />
              </Box>
            </Box>
            <Legend disabled={userMenuOpen} highlightedKind={highlightedKind} onHighlight={setDebouncedHighlightedKind} />
            <HeroSiegeButton
              disabled={!selectedNodeIsReachable || Boolean(pendingRelicReward)}
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
            {pendingRelicReward && <PendingRelicRewardPanel floating inlineContinue state={props.state} setState={props.setState} />}
          </Box>
        ) : (
          <RoomPanel node={node} setState={props.setState} solved={solved} state={props.state} target={target} />
        )}
      </Box>
    </Paper>
  );
}

function useUserMenuOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const syncFromDom = () => setOpen(document.body.dataset.userMenuOpen === "true");
    const handleMenuOpen = (event: Event) => {
      setOpen(Boolean((event as CustomEvent<boolean>).detail));
    };
    syncFromDom();
    window.addEventListener(USER_MENU_OPEN_EVENT, handleMenuOpen);
    return () => window.removeEventListener(USER_MENU_OPEN_EVENT, handleMenuOpen);
  }, []);
  return open;
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
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragging, setDragging] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

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

  function onScroll() {
    if (!scrolling) {
      setScrolling(true);
    }
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setScrolling(false);
      scrollTimeoutRef.current = null;
    }, MAP_SCROLL_PERFORMANCE_DEBOUNCE_MS);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const scroller = scrollRef.current;
    if (dragRef.current.dragging && scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
    dragRef.current.dragging = false;
    setDragging(false);
  }

  return { dragging, endDrag, mapMoving: dragging || scrolling, moveDrag, onScroll, scrollRef, startDrag };
}

function isInteractiveMapTarget(target: EventTarget) {
  return target instanceof Element && Boolean(target.closest("button, a, input, select, textarea"));
}

function RoomPanel(props: { node: SpireMapNode | undefined; setState: React.Dispatch<React.SetStateAction<StudyState>>; solved: number; state: StudyState; target: number }) {
  const pendingRelicReward = props.state.profile.spireRun.pendingRelicReward;
  if (pendingRelicReward) {
    return (
      <Stack gap="sm" style={{ minHeight: ROOM_PANEL_MIN_HEIGHT }}>
        <CompactRoomPanel node={props.node} solved={props.solved} state={props.state} target={props.target} />
        <PendingRelicRewardPanel state={props.state} setState={props.setState} />
        <Group justify="flex-end">
          <HeroSiegeButton
            disabled={!pendingRelicReward.selectedRelicId}
            onClick={() => props.setState((previous) => {
              const selectedRelicId = previous.profile.spireRun.pendingRelicReward?.selectedRelicId;
              return selectedRelicId ? choosePendingRelicReward(previous, selectedRelicId) : previous;
            })}
            minWidth={104}
          >
            Continue
          </HeroSiegeButton>
        </Group>
      </Stack>
    );
  }
  if (isCombatNode(props.node) && props.node && props.state.profile.spireRun.completedNodeIds.includes(props.node.id)) {
    return (
      <Stack gap="sm" style={{ minHeight: ROOM_PANEL_MIN_HEIGHT }}>
        <CompactRoomPanel node={props.node} solved={props.solved} state={props.state} target={props.target} />
        <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "14px 16px" }}>
          <Box>
            <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>Room Cleared</Text>
            <Text size="xs" c="dimmed">Relic reward resolved. Continue to choose the next route.</Text>
          </Box>
          <HeroSiegeButton onClick={() => props.setState((previous) => leaveSpireRoom(previous))} minWidth={104}>Continue</HeroSiegeButton>
        </Group>
      </Stack>
    );
  }
  if (isCombatNode(props.node)) {
    return <CompactRoomPanel node={props.node} solved={props.solved} state={props.state} target={props.target} />;
  }
  const showCompactRoomPanel = props.node?.kind !== "rest";
  return (
    <Stack gap="sm" style={{ minHeight: ROOM_PANEL_MIN_HEIGHT }}>
      {showCompactRoomPanel && <CompactRoomPanel node={props.node} solved={props.solved} state={props.state} target={props.target} />}
      {props.node?.kind === "merchant" && <MerchantRoomPanel setState={props.setState} state={props.state} />}
      {props.node?.kind === "treasure" && <TreasureRoomPanel node={props.node} setState={props.setState} state={props.state} />}
      {props.node?.kind === "rest" && <RestRoomPanel node={props.node} setState={props.setState} state={props.state} />}
      {props.node?.kind === "event" && <EventRoomPanel node={props.node} setState={props.setState} state={props.state} />}
      {props.node?.kind === "blight" && <BlightRoomPanel node={props.node} setState={props.setState} state={props.state} />}
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
  return (
    <Stack gap="sm">
      <ShopPanel state={props.state} setState={props.setState} />
      <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "10px 14px" }}>
        <Box>
          <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>Merchant Room</Text>
          <Text size="xs" c="dimmed">Buy what you need, then continue to the next route.</Text>
        </Box>
        <Group gap={8} wrap="nowrap">
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
          <Text size="xs" c="dimmed">{opened ? "Continue to choose the next route." : "Open the chest to claim gold; rare chests may offer a relic choice."}</Text>
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
      {props.claim.metaCurrency ? <Text size="xs" fw={900} c="violet.2">+{props.claim.metaCurrency} insight</Text> : null}
    </Group>
  );
}

function PendingRelicRewardPanel(props: { floating?: boolean; inlineContinue?: boolean; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const pending = props.state.profile.spireRun.pendingRelicReward;
  if (!pending) {
    return null;
  }
  const forcedBlight = pending.rewardKind === "blight";
  const confirmSelection = () => props.setState((previous) => {
    const selectedRelicId = previous.profile.spireRun.pendingRelicReward?.selectedRelicId;
    return selectedRelicId ? choosePendingRelicReward(previous, selectedRelicId) : previous;
  });
  return (
    <Box
      style={{
        background: ACT_LABEL_BG,
        border: ACT_LABEL_BORDER,
        boxShadow: "0 14px 34px rgba(0, 0, 0, 0.46), inset 0 0 0 1px rgba(0, 0, 0, 0.72)",
        left: props.floating ? "50%" : undefined,
        maxWidth: props.floating ? 880 : undefined,
        padding: "14px 16px",
        position: props.floating ? "absolute" : "relative",
        top: props.floating ? 18 : undefined,
        transform: props.floating ? "translateX(-50%)" : undefined,
        width: props.floating ? "min(880px, calc(100% - 32px))" : undefined,
        zIndex: props.floating ? 5 : undefined
      }}
    >
      <Group justify="space-between" align="flex-start" mb="sm" wrap="nowrap">
        <Box>
          <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>{forcedBlight ? "Choose a Blight" : "Choose a Relic"}</Text>
          <Text size="xs" c="dimmed">{forcedBlight ? "Pick one blight relic to continue." : `Pick one run relic, reroll the offering, or skip it for ${pending.skipMetaCurrency} insight.`}</Text>
        </Box>
        <Group gap={8} wrap="nowrap">
          <Badge color="violet" variant="light">Insight {props.state.profile.metaProgress.currency}</Badge>
          {!forcedBlight ? (
            <>
              <HeroSiegeButton disabled={pending.rerollsRemaining <= 0} onClick={() => props.setState((previous) => rerollPendingRelicReward(previous))} minWidth={98}>
                Reroll {pending.rerollsRemaining}
              </HeroSiegeButton>
              <HeroSiegeButton onClick={() => props.setState((previous) => skipPendingRelicReward(previous))} minWidth={116}>Skip +{pending.skipMetaCurrency}</HeroSiegeButton>
            </>
          ) : null}
          {props.inlineContinue ? (
            <HeroSiegeButton disabled={!pending.selectedRelicId} onClick={confirmSelection} minWidth={116}>
              Continue
            </HeroSiegeButton>
          ) : null}
        </Group>
      </Group>
      <Box style={{ display: "grid", gap: 10, gridTemplateColumns: `repeat(${Math.min(4, pending.choices.length)}, minmax(0, 1fr))` }}>
        {pending.choices.map((relic) => (
          <RelicChoiceCard
            key={relic.id}
            relic={relic}
            selected={pending.selectedRelicId === relic.id}
            onChoose={() => props.setState((previous) => selectPendingRelicReward(previous, relic.id))}
          />
        ))}
      </Box>
    </Box>
  );
}

function RelicChoiceCard(props: { footer?: React.ReactNode; onChoose: () => void; relic: Relic; selected: boolean }) {
  const rarityColor = getRelicRarityColor(props.relic.rarity);
  const effects = (props.relic.modifiers || []).map((modifier) => formatModifier(modifier.key, modifier.value)).filter(Boolean);
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={props.onChoose}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.onChoose();
        }
      }}
      style={{
        background: "linear-gradient(180deg, rgba(15, 13, 11, 0.96), rgba(5, 4, 4, 0.98))",
        border: `1px solid ${props.selected ? "#fff0a8" : rarityColor}`,
        boxShadow: props.selected
          ? `inset 0 0 0 1px rgba(0, 0, 0, 0.86), 0 0 0 2px ${rarityColor}, 0 0 18px rgba(255, 225, 94, 0.42)`
          : "inset 0 0 0 1px rgba(0, 0, 0, 0.86)",
        cursor: "pointer",
        minHeight: 180,
        padding: 10
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <RelicIcon relic={props.relic} size={46} />
        <Box style={{ minWidth: 0 }}>
          <Text size="sm" fw={900} lineClamp={1} style={{ color: rarityColor }}>{props.relic.name}</Text>
        </Box>
      </Group>
      <Stack gap={4} mt={8}>
        {effects.slice(0, 4).map((effect) => (
          <Text key={effect} size="11px" c="yellow.3" lineClamp={1}>{effect}</Text>
        ))}
        <Text size="11px" c="gray.3" lineClamp={3}>{props.relic.description}</Text>
        {props.footer}
      </Stack>
    </Box>
  );
}

function RestRoomPanel(props: { node: SpireMapNode; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const used = props.state.profile.spireRun.completedNodeIds.includes(props.node.id);
  const attunableRelics = getRestAttunableRelics(props.state);
  const [selectedRelicId, setSelectedRelicId] = useState(attunableRelics[0]?.id || "");
  const [attunePickerOpen, setAttunePickerOpen] = useState(false);
  const selectedRelic = attunableRelics.find((relic) => relic.id === selectedRelicId) || attunableRelics[0] || null;
  const specialText = attunableRelics.length ? " Attune channels one relic for the next 3 rooms." : "";
  useEffect(() => {
    if (used) {
      setAttunePickerOpen(false);
      return;
    }
    if (attunableRelics.length && !attunableRelics.some((relic) => relic.id === selectedRelicId)) {
      setSelectedRelicId(attunableRelics[0].id);
    }
  }, [selectedRelicId, attunableRelics, used]);
  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "14px 16px" }}>
        <Group gap="sm" wrap="nowrap">
          <NodeIcon kind="rest" size={46} />
          <Box>
            <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>{used ? "Rest Site Used" : "Rest Site"}</Text>
            <Text size="xs" c="dimmed">{used ? "Continue to choose the next route." : `Rest heals 30% health.${specialText}`}</Text>
          </Box>
        </Group>
        <Group gap={8} wrap="nowrap">
          <HeroSiegeButton disabled={used} onClick={() => props.setState((previous) => claimCurrentSpireRoomReward(previous))} minWidth={104}>Rest</HeroSiegeButton>
          {attunableRelics.length ? (
            <HeroSiegeButton disabled={used} onClick={() => setAttunePickerOpen((open) => !open)} minWidth={126}>{attunePickerOpen ? "Cancel Attune" : "Attune Relic"}</HeroSiegeButton>
          ) : null}
          <HeroSiegeButton disabled={!used} onClick={() => props.setState((previous) => leaveSpireRoom(previous))} minWidth={104}>Continue</HeroSiegeButton>
        </Group>
      </Group>
      {!used && attunePickerOpen ? (
        <Box style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "14px 16px" }}>
          <Group justify="space-between" mb={10} wrap="nowrap">
            <Box>
              <Text size="sm" fw={900} style={{ color: "#fff0b8", textShadow: "0 1px 0 #000" }}>Attune a Relic</Text>
              <Text size="xs" c="dimmed">Choose one relic to channel for the next 3 rooms. This uses the rest site.</Text>
            </Box>
            <HeroSiegeButton
              disabled={!selectedRelic}
              onClick={() => selectedRelic && props.setState((previous) => attuneRestSiteRelic(previous, selectedRelic.id))}
              minWidth={132}
            >
              Attune
            </HeroSiegeButton>
          </Group>
          <Box style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {attunableRelics.map((relic) => (
              <RelicChoiceCard
                key={relic.id}
                relic={relic}
                selected={selectedRelicId === relic.id}
                onChoose={() => setSelectedRelicId(relic.id)}
                footer={<Text size="11px" fw={900} c="violet.2">Attune: temporary 3-room focus effect</Text>}
              />
            ))}
          </Box>
        </Box>
      ) : null}
    </Stack>
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

function BlightRoomPanel(props: { node: SpireMapNode; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const resolved = props.state.profile.spireRun.completedNodeIds.includes(props.node.id);
  return (
    <Group justify="space-between" wrap="nowrap" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, padding: "14px 16px" }}>
      <Group gap="sm" wrap="nowrap">
        <NodeIcon kind="blight" size={42} />
        <Box>
          <Text size="sm" fw={900} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>{resolved ? "Blight Claimed" : "Blight Room"}</Text>
          <Text size="xs" c="dimmed">{resolved ? "Continue to choose the next route." : "Choose one blight relic. Blights are permanent run curses."}</Text>
        </Box>
      </Group>
      <Group gap={8} wrap="nowrap">
        <HeroSiegeButton disabled={resolved} onClick={() => props.setState((previous) => claimCurrentSpireRoomReward(previous))} minWidth={124}>Choose Blight</HeroSiegeButton>
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
  const heat = getHeatLevel(props.state.profile.spireRun.heatConditions);
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
      <Group gap={7} justify="center" wrap="nowrap">
        {heat > 0 ? (
          <Group gap={2} wrap="nowrap">
            <Box
              component="img"
              src={heatOrbArt}
              alt=""
              style={{
                filter: "drop-shadow(0 1px 0 #000)",
                height: 18,
                imageRendering: "pixelated",
                width: 18
              }}
            />
            <Text size="xs" fw={900} tt="uppercase" style={{ color: "#ffe26a", letterSpacing: 0, lineHeight: 1, textShadow: "0 2px 0 #000" }}>
              {heat}
            </Text>
          </Group>
        ) : null}
        <Text size="xs" fw={900} ta="center" tt="uppercase" style={{ letterSpacing: 0, lineHeight: 1, textShadow: "0 2px 0 #000" }}>
          {getSpireCampaignLabel(props.state.profile.spireRun)} {difficulty.resistancePenalty ? `(${difficulty.resistancePenalty}% Resist)` : ""}
        </Text>
      </Group>
    </Box>
  );
}

function RunSetupScreen(props: { fillAvailableHeight?: boolean; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const mapBg = getActMapBackground(props.state.profile.spireRun.act);
  const showPact = props.state.profile.metaProgress.heatUnlocked;
  return (
    <Box
      style={{
        alignItems: "center",
        background: mapBg,
        border: "1px solid var(--mantine-color-dark-4)",
        display: "flex",
        height: props.fillAvailableHeight ? undefined : EXPANDED_MAP_HEIGHT,
        justifyContent: "center",
        overflow: "hidden",
        padding: 18,
        position: "relative",
        ...(props.fillAvailableHeight ? FLEX_FILL_STYLE : {})
      }}
    >
      <MapBackdrop act={props.state.profile.spireRun.act} />
      <Stack gap={18} align="center" style={{ maxHeight: "100%", overflow: "auto", width: "min(1320px, 100%)", zIndex: 2 }}>
        <SimpleGrid cols={{ base: 1, lg: showPact ? 2 : 1 }} spacing={18} style={{ alignItems: "start", width: "100%" }}>
          <MirrorUpgradePanel setState={props.setState} state={props.state} />
          {showPact ? <HeatPanel embedded setState={props.setState} state={props.state} /> : null}
        </SimpleGrid>
        <HeroSiegeButton onClick={() => props.setState((previous) => startSpireHeatRun(previous))} minWidth={150}>
          Start Act I
        </HeroSiegeButton>
      </Stack>
    </Box>
  );
}

function MirrorUpgradePanel(props: { setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  return (
    <Box
      style={{
        background: "linear-gradient(180deg, rgba(44, 38, 33, 0.94), rgba(18, 15, 13, 0.96))",
        border: ACT_LABEL_BORDER,
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.42), inset 0 0 0 1px rgba(0, 0, 0, 0.72)",
        color: "#f1dfad",
        padding: "24px 28px",
        width: "100%"
      }}
    >
      <Group justify="space-between" mb={12} wrap="nowrap">
        <Box>
          <Text size="lg" fw={900} tt="uppercase" style={{ color: "#fff0b8", textShadow: "0 1px 0 #000" }}>Mirror Upgrades</Text>
          <Text size="sm" c="gray.4">Spend insight between runs before starting Act I.</Text>
        </Box>
        <Badge size="lg" color="yellow" variant="filled">Insight {props.state.profile.metaProgress.currency}</Badge>
      </Group>
      <Stack gap={7}>
        {META_UPGRADE_DEFINITIONS.map((upgrade, index) => {
          const rank = props.state.profile.metaProgress.upgrades[upgrade.id] || 0;
          const maxed = rank >= upgrade.maxRank;
          const cost = getMetaUpgradeCost(props.state, upgrade.id);
          const canBuy = canPurchaseMetaUpgrade(props.state, upgrade.id);
          return (
            <Group key={upgrade.id} justify="space-between" gap={14} wrap="nowrap">
              <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
                <Box
                  style={{
                    alignItems: "center",
                    background: rank ? "rgba(235, 188, 82, 0.24)" : "rgba(0, 0, 0, 0.26)",
                    border: "1px solid rgba(255, 225, 120, 0.24)",
                    display: "flex",
                    height: 34,
                    justifyContent: "center",
                    width: 34
                  }}
                >
                  <Box alt="" component="img" src={getMirrorUpgradeIcon(upgrade.id)} style={{ filter: rank ? "drop-shadow(0 2px 0 #000)" : "grayscale(0.75) brightness(0.72) drop-shadow(0 2px 0 #000)", height: 28, imageRendering: "pixelated", objectFit: "contain", width: 28 }} />
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={900} c={rank ? "yellow.3" : "orange.2"} truncate>{upgrade.label}</Text>
                  <Text size="xs" c="gray.4" truncate>{upgrade.description}</Text>
                </Box>
              </Group>
              <Group gap={7} wrap="nowrap">
                <Text size="sm" fw={900} c={rank ? "yellow.3" : "gray.4"} style={{ minWidth: 54, textAlign: "right" }}>
                  {rank}/{upgrade.maxRank}
                </Text>
                <HeroSiegeButton
                  disabled={!canBuy}
                  height={30}
                  minWidth={maxed ? 70 : 92}
                  onClick={() => props.setState((previous) => purchaseMetaUpgrade(previous, upgrade.id))}
                  style={{ fontSize: 11, padding: "0 12px" }}
                >
                  {maxed ? "Max" : `${cost}`}
                </HeroSiegeButton>
              </Group>
            </Group>
          );
        })}
      </Stack>
    </Box>
  );
}

const MIRROR_UPGRADE_ICONS: Record<string, StaticImageData> = {
  cleanExecution: swordMasteryArt,
  coinPurse: midasHandArt,
  crushingInsight: razorwireArt,
  deathDefiance: guardianAngelArt,
  eliteHunter: kingsCrownArt,
  fatedPersuasion: casinoDiceArt,
  fatedTreasury: fortuneCardArt,
  goldenTouch: midasHandArt,
  highConfidence: battleTranceArt,
  ironResolve: ironSkinArt,
  lethalPrecision: sureCritArt,
  mistakeAlchemy: barbedShieldArt,
  olympianFavor: tokenLuckArt,
  oracleFavor: dislocatedEyeArt,
  relicLuck: fortuneCardArt,
  relicChoice: findItemArt,
  revealSubmitTests: dislocatedEyeArt,
  shadowTraining: bookOfBelialArt,
  shopkeeperFavor: steamSaleArt,
  silverGuard: shieldMasteryArt,
  starterRelics: holyGrailArt,
  swiftReflex: heatOrbArt,
  topicMemory: oddBookArt,
  toughStart: deathsScytheArt,
  underworldBroker: treasureSenseArt
};

function getMirrorUpgradeIcon(id: string) {
  return MIRROR_UPGRADE_ICONS[id] || tokenLuckArt;
}

function HeatPanel(props: { embedded?: boolean; setState: React.Dispatch<React.SetStateAction<StudyState>>; showStart?: boolean; state: StudyState }) {
  const editable = canEditSpireHeat(props.state);
  const heat = getHeatLevel(props.state.profile.spireRun.heatConditions);
  return (
    <Box
      style={{
        background: "linear-gradient(180deg, rgba(44, 38, 33, 0.94), rgba(18, 15, 13, 0.96))",
        border: ACT_LABEL_BORDER,
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.42), inset 0 0 0 1px rgba(0, 0, 0, 0.72)",
        color: "#f1dfad",
        left: props.embedded ? undefined : HEAT_PANEL_LEFT,
        maxWidth: props.embedded ? 760 : 360,
        padding: props.embedded ? "24px 28px" : "10px 12px",
        position: props.embedded ? "relative" : "absolute",
        top: props.embedded ? undefined : HEAT_PANEL_TOP,
        width: props.embedded ? "min(760px, 100%)" : undefined,
        zIndex: 5
      }}
    >
      <Group justify="space-between" mb={props.embedded ? 12 : 6} wrap="nowrap">
        <Box>
          <Text size={props.embedded ? "lg" : "xs"} fw={900} tt="uppercase" style={{ color: "#fff0b8", textShadow: "0 1px 0 #000" }}>Pact of Conditions</Text>
          <Text size={props.embedded ? "sm" : "10px"} c="gray.4">Set heat, then start Act I.</Text>
        </Box>
        <Badge size={props.embedded ? "lg" : "md"} color={heat > 0 ? "red" : "gray"} variant="filled">Heat {heat}/{MAX_HEAT}</Badge>
      </Group>
      <Stack gap={props.embedded ? 7 : 4}>
        {HEAT_CONDITION_DEFINITIONS.map((condition, index) => {
          const rank = props.state.profile.spireRun.heatConditions[condition.id] || 0;
          const canAdd = editable && rank < condition.maxRank && heat + condition.heatPerRank <= MAX_HEAT;
          const canRemove = editable && rank > 0;
          return (
            <Group key={condition.id} justify="space-between" gap={props.embedded ? 14 : 8} wrap="nowrap">
              <Group gap={props.embedded ? 10 : 7} wrap="nowrap" style={{ minWidth: 0 }}>
                <Box
                  style={{
                    alignItems: "center",
                    background: rank ? "rgba(222, 72, 72, 0.28)" : "rgba(0, 0, 0, 0.26)",
                    border: "1px solid rgba(255, 225, 120, 0.24)",
                    color: rank ? "#ff6b5a" : "#9a8b75",
                    display: "flex",
                    fontSize: props.embedded ? 12 : 10,
                    fontWeight: 900,
                    height: props.embedded ? 24 : HEAT_ROW_ICON_SIZE,
                    justifyContent: "center",
                    width: props.embedded ? 24 : HEAT_ROW_ICON_SIZE
                  }}
                >
                  {index + 1}
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <Text size={props.embedded ? "sm" : "11px"} fw={900} c={rank ? "red.4" : "orange.2"} truncate>{condition.label}</Text>
                  <Text size={props.embedded ? "xs" : "9px"} c="gray.4" truncate={!props.embedded}>{condition.description}</Text>
                </Box>
              </Group>
              <Group gap={props.embedded ? 7 : 4} wrap="nowrap">
                <Text size={props.embedded ? "sm" : "11px"} fw={900} c={rank ? "red.3" : "gray.4"} style={{ minWidth: props.embedded ? 54 : 44, textAlign: "right" }}>
                  {rank}/{condition.maxRank}
                </Text>
                <HeatStepButton large={props.embedded} disabled={!canRemove} onClick={() => props.setState((previous) => setSpireHeatConditionRank(previous, condition.id, rank - 1))}>-</HeatStepButton>
                <HeatStepButton large={props.embedded} disabled={!canAdd} onClick={() => props.setState((previous) => setSpireHeatConditionRank(previous, condition.id, rank + 1))}>+</HeatStepButton>
                <Text size={props.embedded ? "sm" : "10px"} c="orange.3" fw={900} style={{ minWidth: props.embedded ? 22 : 16 }}>{condition.heatPerRank}</Text>
              </Group>
            </Group>
          );
        })}
      </Stack>
      <Group justify="space-between" mt={props.embedded ? 18 : 8} wrap="nowrap">
        <Text size={props.embedded ? "sm" : "10px"} c="gray.4">Best clear: heat {props.state.profile.metaProgress.highestHeat || 0}</Text>
        <Group gap={8} wrap="nowrap">
          <HeroSiegeButton
            disabled={!editable || heat === 0}
            height={props.embedded ? 35 : 26}
            minWidth={props.embedded ? 82 : 64}
            onClick={() => props.setState((previous) => resetSpireHeat(previous))}
            style={{ fontSize: props.embedded ? 12 : 10, padding: props.embedded ? "0 14px" : "0 10px" }}
          >
            Clear
          </HeroSiegeButton>
          {props.showStart ? (
            <HeroSiegeButton onClick={() => props.setState((previous) => startSpireHeatRun(previous))} minWidth={126}>
              Start Act I
            </HeroSiegeButton>
          ) : null}
        </Group>
      </Group>
    </Box>
  );
}

function HeatStepButton(props: { children: React.ReactNode; disabled: boolean; large?: boolean; onClick: () => void }) {
  const size = props.large ? 30 : 22;
  return (
    <HeroSiegeButton
      disabled={props.disabled}
      height={size}
      minWidth={size}
      onClick={props.onClick}
      width={size}
      style={{
        fontSize: props.large ? 14 : 11,
        minWidth: size,
        padding: 0,
        width: size
      }}
    >
      {props.children}
    </HeroSiegeButton>
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

const MapPaths = memo(function MapPaths(props: { nodes: VisualSpireMapNode[] }) {
  const paths = useMemo(() => {
    const nodeById = new Map(props.nodes.map((node) => [node.id, node]));
    return props.nodes.flatMap((node) => node.nextIds.map((id) => {
      const next = nodeById.get(id);
      if (!next) {
        return null;
      }
      const line = getTrimmedPathLine(node.position, next.position);
      const curve = getPathCurve(line, node.id, id);
      return {
        d: `M ${line.x1} ${line.y1} Q ${curve.x} ${curve.y} ${line.x2} ${line.y2}`,
        key: `${node.id}-${id}`
      };
    }).filter(Boolean) as Array<{ d: string; key: string }>);
  }, [props.nodes]);

  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ inset: 0, position: "absolute", height: "100%", width: "100%", zIndex: 1 }}>
      {paths.map((path) => (
        <path key={path.key} d={path.d} fill="none" stroke={PATH_COLOR} strokeDasharray={PATH_STROKE_DASH} strokeLinecap="round" strokeWidth={PATH_STROKE_WIDTH} />
      ))}
    </svg>
  );
});

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

const MapNode = memo(function MapNode(props: { act: SpireAct; active: boolean; completed: boolean; highlighted: boolean; highlightMode: boolean; id: string; kind: SpireNodeKind; mapMoving: boolean; onSelect: () => void; rewardKind?: SpireCombatRewardKind; selectable: boolean; x: number; y: number }) {
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
      {props.completed && <CompletedRoomRing kind={props.kind} seed={props.id} size={size} />}
      <NodeIcon act={props.act} kind={props.kind} highlightTone={highlightTone} shadow size={iconSize} />
      {props.kind === "enemy" && props.rewardKind ? <NodeRewardBadge hovered={!props.mapMoving && hovered} kind={props.rewardKind} /> : null}
    </Box>
  );
});

function NodeRewardBadge(props: { hovered: boolean; kind: SpireCombatRewardKind }) {
  return (
    <Box
      aria-hidden="true"
      style={{
        alignItems: "center",
        display: "flex",
        height: 26,
        justifyContent: "center",
        pointerEvents: "none",
        position: "absolute",
        right: -8,
        top: -6,
        width: 26,
        zIndex: 5
      }}
    >
      {props.kind === "gold" ? (
        <Box style={{ filter: "drop-shadow(0 2px 0 #000) drop-shadow(0 0 3px rgba(247, 201, 72, 0.42))" }}>
          <CoinIcon size={18} />
        </Box>
      ) : props.kind === "heart" ? (
        <CentaurHeartIcon />
      ) : props.kind === "pom" ? (
        <PomPowerIcon />
      ) : (
        <Box alt="" component="img" src={getRewardKindIcon(props.kind)} style={{ display: "block", filter: `drop-shadow(0 2px 0 #000) drop-shadow(0 0 4px ${getRewardKindColor(props.kind)}66)`, height: 22, imageRendering: "pixelated", objectFit: "contain", width: 22 }} />
      )}
      {props.hovered ? <NodeRewardTooltip kind={props.kind} /> : null}
    </Box>
  );
}

function NodeRewardTooltip(props: { kind: SpireCombatRewardKind }) {
  return (
    <Box
      style={{
        background: "linear-gradient(180deg, rgba(35, 13, 13, 0.98), rgba(9, 6, 5, 0.99))",
        border: `1px solid ${getRewardKindColor(props.kind)}aa`,
        boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.86), 0 8px 18px rgba(0, 0, 0, 0.52)",
        color: "#f1dfad",
        left: "50%",
        minWidth: 142,
        padding: "6px 8px",
        position: "absolute",
        top: -48,
        transform: "translateX(-50%)",
        zIndex: 8
      }}
    >
      <Text size="11px" fw={900} style={{ color: getRewardKindColor(props.kind), lineHeight: 1.1, textShadow: "0 1px 0 #000" }}>{getRewardKindLabel(props.kind)}</Text>
      <Text size="10px" c="gray.3" style={{ lineHeight: 1.15 }}>{getRewardKindDescription(props.kind)}</Text>
    </Box>
  );
}

function CentaurHeartIcon() {
  return (
    <Box
      aria-hidden="true"
      style={{
        color: "#ff2f3f",
        filter: "drop-shadow(0 2px 0 #000) drop-shadow(0 0 5px rgba(255, 47, 63, 0.72))",
        fontFamily: "Arial, sans-serif",
        fontSize: 24,
        fontWeight: 900,
        lineHeight: 1,
        textShadow: "1px 0 0 #7a0610, -1px 0 0 #7a0610, 0 1px 0 #7a0610, 0 -1px 0 #7a0610"
      }}
    >
      ♥
    </Box>
  );
}

function PomPowerIcon() {
  return (
    <Box
      aria-hidden="true"
      style={{
        background: "radial-gradient(circle at 34% 30%, #ff9a9a 0 12%, #d71938 34%, #8f071b 72%, #3a0308 100%)",
        border: "1px solid #ff6870",
        borderRadius: "50%",
        boxShadow: "inset 0 2px 0 rgba(255, 255, 255, 0.28), inset 0 -3px 0 rgba(0, 0, 0, 0.38)",
        filter: "drop-shadow(0 2px 0 #000) drop-shadow(0 0 5px rgba(255, 31, 65, 0.72))",
        height: 22,
        position: "relative",
        width: 22
      }}
    >
      <Box style={{ background: "#ffd7a3", borderRadius: "50%", height: 3, left: 7, position: "absolute", top: 8, width: 3 }} />
      <Box style={{ background: "#ffd7a3", borderRadius: "50%", height: 3, left: 13, position: "absolute", top: 8, width: 3 }} />
      <Box style={{ background: "#ffd7a3", borderRadius: "50%", height: 3, left: 10, position: "absolute", top: 13, width: 3 }} />
    </Box>
  );
}

function getRewardKindIcon(kind: SpireCombatRewardKind) {
  if (kind === "insight") {
    return oddBookArt;
  }
  return tokenLuckArt;
}

function getRewardKindColor(kind: SpireCombatRewardKind) {
  if (kind === "gold") {
    return "#f7c948";
  }
  if (kind === "heart") {
    return "#ff6b6b";
  }
  if (kind === "insight") {
    return "#a879ff";
  }
  if (kind === "pom") {
    return "#ff4b5f";
  }
  return "#46a3ff";
}

function getRewardKindLabel(kind: SpireCombatRewardKind) {
  if (kind === "gold") {
    return "Gold";
  }
  if (kind === "heart") {
    return "Centaur Heart";
  }
  if (kind === "insight") {
    return "Insight";
  }
  if (kind === "pom") {
    return "Pom of Power";
  }
  return "Reward";
}

function getRewardKindDescription(kind: SpireCombatRewardKind) {
  if (kind === "gold") {
    return "Clear combat to earn run gold.";
  }
  if (kind === "heart") {
    return "Clear combat to gain +25 current and max health this run.";
  }
  if (kind === "insight") {
    return "Clear combat to earn mirror currency.";
  }
  if (kind === "pom") {
    return "Clear combat to upgrade one owned relic's rarity.";
  }
  return "Clear combat to claim this reward.";
}

function CompletedRoomRing(props: { kind: SpireNodeKind; seed: string; size: number }) {
  const variant = getCompletedRoomRingVariant(props.seed);
  const ringDimensions = getCompletedRoomRingDimensions(props.kind, props.size, variant.size);
  const strokeWidth = getCompletedRoomRingStroke(props.kind, variant.stroke);
  const accentStrokeWidth = strokeWidth * (0.9 + variant.inkWeight * 0.18);
  const path = getCompletedRoomRingPath(props.seed, variant);
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="-1 -1 2 2"
      style={{
        filter: COMPLETED_ROOM_RING_SHADOW,
        height: ringDimensions.height,
        overflow: "visible",
        pointerEvents: "none",
        position: "absolute",
        transform: `translate(${variant.offsetX}px, ${variant.offsetY}px) rotate(${getCompletedRoomRingRotation(props.kind, variant.rotation)}deg)`,
        width: ringDimensions.width,
        zIndex: 0
      }}
    >
      <path d={path} fill="none" stroke={COMPLETED_ROOM_RING_COLOR} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      <path d={path} fill="none" opacity={0.42} pathLength={100} stroke={COMPLETED_ROOM_RING_COLOR} strokeDasharray={`${variant.inkLength} ${100 - variant.inkLength}`} strokeDashoffset={variant.inkOffset} strokeLinecap="round" strokeLinejoin="round" strokeWidth={accentStrokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function getCompletedRoomRingVariant(seed: string) {
  return {
    offsetX: Math.round((getStableRoll(`${seed}:ring-x`) - RANDOM_CENTER) * 3),
    offsetY: Math.round((getStableRoll(`${seed}:ring-y`) - RANDOM_CENTER) * 3),
    rotation: Math.round((getStableRoll(`${seed}:ring-rotation`) - RANDOM_CENTER) * 22),
    size: 0.9 + getStableRoll(`${seed}:ring-size`) * 0.28,
    inkLength: 9 + Math.round(getStableRoll(`${seed}:ring-ink-length`) * 7),
    inkOffset: Math.round(getStableRoll(`${seed}:ring-ink-offset`) * 100),
    inkWeight: getStableRoll(`${seed}:ring-ink-weight`),
    stroke: 0.72 + getStableRoll(`${seed}:ring-stroke`) * 0.34,
    wobble: 0.42 + getStableRoll(`${seed}:ring-wobble`) * 0.32
  };
}

function getCompletedRoomRingPath(seed: string, variant: ReturnType<typeof getCompletedRoomRingVariant>) {
  const bezierCircle = 0.551915024494;
  const controlAngle = Math.atan(bezierCircle);
  const controlDistance = Math.sqrt(bezierCircle * bezierCircle + 1);
  const radiusMin = -0.07 * variant.wobble;
  const radiusMax = 0.025 * variant.wobble;
  const angleMin = 0.025;
  const angleMax = 0.13 + getStableRoll(`${seed}:angle-max`) * 0.05;
  let radius = 0.9 + (getStableRoll(`${seed}:radius-start`) - RANDOM_CENTER) * 0.035;
  let theta = ((145 + getStableRoll(`${seed}:theta`) * 60) * Math.PI) / 180;
  let path = `M ${roundSvgPoint(radius * Math.sin(theta))} ${roundSvgPoint(radius * Math.cos(theta))}`;
  path += ` C ${roundSvgPoint(controlDistance * radius * Math.sin(theta + controlAngle))} ${roundSvgPoint(controlDistance * radius * Math.cos(theta + controlAngle))}`;

  for (let index = 0; index < 4; index += 1) {
    theta += (Math.PI / 2) * (1 + angleMin + getStableRoll(`${seed}:angle:${index}`) * (angleMax - angleMin));
    radius *= 1 + radiusMin + getStableRoll(`${seed}:radius:${index}`) * (radiusMax - radiusMin);
    const controlX = roundSvgPoint(controlDistance * radius * Math.sin(theta - controlAngle));
    const controlY = roundSvgPoint(controlDistance * radius * Math.cos(theta - controlAngle));
    const pointX = roundSvgPoint(radius * Math.sin(theta));
    const pointY = roundSvgPoint(radius * Math.cos(theta));
    path += index ? ` S ${controlX} ${controlY} ${pointX} ${pointY}` : ` ${controlX} ${controlY} ${pointX} ${pointY}`;
  }

  return path;
}

function roundSvgPoint(value: number) { return Math.round(value * 1000) / 1000; }

function getCompletedRoomRingDimensions(kind: SpireNodeKind, size: number, scale: number) {
  if (kind === "boss") {
    return {
      height: Math.round(size * 0.78 * scale),
      width: Math.round(size * 1.26 * scale)
    };
  }
  return {
    height: Math.round(size * 1.34 * scale),
    width: Math.round(size * 2.16 * scale)
  };
}

function getCompletedRoomRingStroke(kind: SpireNodeKind, scale: number) {
  return Math.max(1.45, (kind === "boss" ? 2.8 : 2.15) * scale);
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
  if (kind === "blight") {
    filters.push("sepia(0.6) saturate(1.4) hue-rotate(250deg) brightness(0.82)");
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

function Legend(props: { disabled?: boolean; highlightedKind: SpireNodeKind | null; onHighlight: (kind: SpireNodeKind | null) => void }) {
  const rows: SpireNodeKind[] = ["unknown", "blight", "event", "merchant", "treasure", "rest", "enemy", "elite", "boss"];
  return (
    <Box p="sm" style={{ background: ACT_LABEL_BG, border: ACT_LABEL_BORDER, borderRadius: 2, boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.72), 0 10px 26px rgba(0, 0, 0, 0.36)", color: "#e7dcc0", pointerEvents: props.disabled ? "none" : undefined, position: "absolute", right: 12, top: 12, width: 150, zIndex: 4 }}>
      <Text size="sm" fw={900} mb={6} style={{ color: "#f1dfad", textShadow: "0 1px 0 #000" }}>Legend</Text>
      <Stack gap={4}>
        {rows.map((kind) => (
          <Group
            key={kind}
            gap="xs"
            onMouseEnter={() => !props.disabled && props.onHighlight(kind)}
            onMouseLeave={() => !props.disabled && props.onHighlight(null)}
            style={{ background: props.highlightedKind === kind ? "rgba(223, 195, 122, 0.16)" : undefined, borderRadius: 4, cursor: "default", marginInline: -4, paddingInline: 4, transition: LEGEND_ROW_TRANSITION }}
            wrap="nowrap"
          >
            <Box style={{ alignItems: "center", background: "rgba(0, 0, 0, 0.28)", border: "1px solid rgba(223, 195, 122, 0.26)", display: "flex", height: 26, justifyContent: "center", width: 26 }}>
              <NodeIcon kind={kind} size={LEGEND_ICON_SIZE} />
            </Box>
            <Text size="xs" fw={800} style={{ textShadow: "0 1px 0 #000" }}>{NODE_LABELS[kind]}</Text>
          </Group>
        ))}
        <Text size="10px" fw={900} mt={4} tt="uppercase" c="gray.4">Enemy rewards</Text>
        {(["gold", "heart", "insight", "pom"] as SpireCombatRewardKind[]).map((kind) => (
          <Group key={kind} gap="xs" wrap="nowrap">
            <RewardLegendIcon kind={kind} />
            <Text size="xs" fw={800} style={{ textShadow: "0 1px 0 #000" }}>{getRewardKindLabel(kind)}</Text>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}

function RewardLegendIcon(props: { kind: SpireCombatRewardKind }) {
  return (
    <Box style={{ alignItems: "center", display: "flex", height: 26, justifyContent: "center", width: 26 }}>
      {props.kind === "gold" ? (
        <CoinIcon size={18} />
      ) : props.kind === "heart" ? (
        <CentaurHeartIcon />
      ) : props.kind === "pom" ? (
        <PomPowerIcon />
      ) : (
        <Box alt="" component="img" src={getRewardKindIcon(props.kind)} style={{ display: "block", filter: `drop-shadow(0 2px 0 #000) drop-shadow(0 0 4px ${getRewardKindColor(props.kind)}66)`, height: 22, imageRendering: "pixelated", objectFit: "contain", width: 22 }} />
      )}
    </Box>
  );
}
