import { ActionIcon, Badge, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
type StaticImageData = string;
import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";

import { HeroSiegeButton } from "./HeroSiegeUi";
import { HERO_ITEM_RARITY_COLORS, HeroSiegeEquipmentIcon } from "./HeroSiegeItemIcon";
import { canEquipItem, discardItem, EQUIPMENT_SLOT_LABELS, equipItem, getActiveSetBonuses, moveInventoryItem, unequipItem } from "../lib/studyCore";
import { ITEM_BASE_NAMES } from "../lib/itemNames";
import type { EquipmentSlot, InventoryItem, InventoryItemPosition, ItemModifierKey, StudyState } from "../types/study";
import inventoryGamepadBg from "../assets/hero_siege_inventory/inventory-gamepad.png";
import inventoryGridBg from "../assets/hero_siege_inventory/inventory-grid-normal.png";
import inventorySlotAmuletBg from "../assets/hero_siege_inventory/slot-amulet.png";
import inventorySlotArmorBg from "../assets/hero_siege_inventory/slot-armor.png";
import inventorySlotBeltBg from "../assets/hero_siege_inventory/slot-belt.png";
import inventorySlotBootsBg from "../assets/hero_siege_inventory/slot-boots.png";
import inventorySlotGlovesBg from "../assets/hero_siege_inventory/slot-gloves.png";
import inventorySlotHelmetBg from "../assets/hero_siege_inventory/slot-helmet.png";
import inventorySlotRingBg from "../assets/hero_siege_inventory/slot-ring.png";
import inventorySlotShieldBg from "../assets/hero_siege_inventory/slot-shield.png";
import inventorySlotWeaponBg from "../assets/hero_siege_inventory/slot-weapon.png";
import tabExtraBg from "../assets/hero_siege_inventory/tab-extra.png";
import tabMainBg from "../assets/hero_siege_inventory/tab-main.png";

const STAT_LABELS = {
  constitution: "CON",
  intelligence: "INT",
  perception: "PER",
  strength: "STR"
} as const;

const RARITY_COLORS = HERO_ITEM_RARITY_COLORS;
const MODIFIER_FORMATTERS: Record<ItemModifierKey, (value: number) => string> = {
  bonusXpPercent: (value) => `+${value}% XP`,
  coldResistPercent: (value) => `+${value}% Cold Res`,
  criticalChancePercent: (value) => `+${value}% Crit`,
  damageReduction: (value) => `Damage -${value}`,
  enhancedDamagePercent: (value) => `+${value}% Damage`,
  fireResistPercent: (value) => `+${value}% Fire Res`,
  goldFindPercent: (value) => `+${value}% Gold`,
  lifeOnKill: (value) => `+${value} Life/Sub`,
  lightningResistPercent: (value) => `+${value}% Lightning Res`,
  magicFindPercent: (value) => `+${value}% Magic Find`,
  manaOnKill: (value) => `+${value} Mana/Sub`,
  maxLife: (value) => `+${value} Max Life`,
  maxMana: (value) => `+${value} Max Mana`,
  poisonResistPercent: (value) => `+${value}% Poison Res`
};

const COMPACT_NAME_LINES = 2;
const INVENTORY_PANEL_WIDTH = 534;
const INVENTORY_PANEL_HEIGHT = 720;
const SMALL_EQUIPPED_ICON_SIZE = 34;
const MEDIUM_EQUIPPED_ICON_SIZE = 52;
const LARGE_EQUIPPED_ICON_SIZE = 44;
const WEAPON_EQUIPPED_ICON_SIZE = 64;
const INVENTORY_GRID_COLUMNS = 13;
const INVENTORY_GRID_ROWS = 5;
const INVENTORY_TAB_COUNT = 3;
const INVENTORY_EXTRA_COLUMNS = 3;
const INVENTORY_GRID_GAP = 4;
const INVENTORY_GRID_LEFT = 44;
const INVENTORY_GRID_TOP = 404;
const INVENTORY_GRID_CELL_SIZE = 32;
const INVENTORY_GRID_WIDTH = 464;
const INVENTORY_GRID_HEIGHT = INVENTORY_GRID_ROWS * INVENTORY_GRID_CELL_SIZE + (INVENTORY_GRID_ROWS - 1) * INVENTORY_GRID_GAP;
const INVENTORY_BACKGROUND_GHOST_TOP = INVENTORY_GRID_TOP + INVENTORY_GRID_HEIGHT + INVENTORY_GRID_GAP;
const SORT_BUTTON_WIDTH = 180;
const SORT_BUTTON_HEIGHT = 35;
const SORT_BUTTON_RIGHT = 24;
const SORT_BUTTON_TOP = INVENTORY_GRID_TOP + INVENTORY_GRID_HEIGHT + INVENTORY_GRID_GAP + 4;
const TAB_ROW_LEFT = 254;
const TAB_ROW_TOP = SORT_BUTTON_TOP + SORT_BUTTON_HEIGHT + 9;
const INVENTORY_BACKGROUND_GHOST_HEIGHT = TAB_ROW_TOP - INVENTORY_BACKGROUND_GHOST_TOP - INVENTORY_GRID_GAP;
const TAB_GAP = 4;
const TAB_MAIN_WIDTH = 96;
const TAB_EXTRA_WIDTH = 76;
const TAB_HEIGHT = 33;
const ITEM_ICON_SIZE = 32;
const INVENTORY_ITEM_ICON_SIZE = 28;
const DISCARD_ICON_SIZE = 13;
const DISCARD_BUTTON_SIZE = 18;
const LOCKED_ITEM_OPACITY = 0.52;
const ITEM_TILE_RARITY_BG: Record<InventoryItem["rarity"], string> = {
  common: "radial-gradient(circle at 45% 28%, rgba(74, 74, 74, 0.72), rgba(7, 7, 7, 0.96) 72%)",
  epic: "radial-gradient(circle at 45% 28%, rgba(88, 43, 130, 0.7), rgba(12, 5, 18, 0.96) 72%)",
  legendary: "radial-gradient(circle at 45% 28%, rgba(121, 84, 28, 0.76), rgba(16, 9, 3, 0.96) 72%)",
  rare: "radial-gradient(circle at 45% 28%, rgba(33, 73, 126, 0.72), rgba(5, 10, 18, 0.96) 72%)",
  uncommon: "radial-gradient(circle at 45% 28%, rgba(28, 100, 56, 0.7), rgba(4, 13, 7, 0.96) 72%)"
};
const ITEM_TILE_INSET_SHADOW = "inset 0 0 0 1px rgba(0, 0, 0, 0.82), inset 0 0 18px rgba(0, 0, 0, 0.46)";
const DETAILS_WIDTH = 260;
const DETAILS_SHEET_WIDTH = 420;
const DETAILS_BG = "linear-gradient(180deg, rgba(35, 13, 13, 0.98), rgba(9, 6, 5, 0.99))";
const DETAILS_BORDER = "1px solid #9f2d4e";
const DETAILS_SHADOW = "inset 0 0 0 1px rgba(0, 0, 0, 0.86), 0 12px 28px rgba(0, 0, 0, 0.62)";
const DETAILS_PADDING = 10;
const COMPACT_SUMMARY_GAP = 3;
const FULL_SUMMARY_GAP = 6;
const EQUIPMENT_STAGE_LEFT = 48;
const EQUIPMENT_STAGE_TOP = 38;
const EQUIPMENT_STAGE_WIDTH = 480;
const EQUIPMENT_STAGE_HEIGHT = 354;
const EQUIPMENT_STAGE_BG = "radial-gradient(circle at 50% 38%, #581a1e, #2a080a 54%, #0e0304)";
const CONTROL_HOVER_FILTER = "brightness(1.14) drop-shadow(0 0 8px rgba(255, 232, 168, 0.32))";
const CONTROL_DEFAULT_FILTER = "drop-shadow(0 3px 6px rgba(0, 0, 0, 0.34))";
const MAX_ITEM_LEVEL = 100;
const LEVELS_PER_POWER_TIER = 20;
const ITEM_DAMAGE_LEVEL_FACTOR = 0.42;
const ITEM_DAMAGE_SPREAD = 4;
const ITEM_ARMOR_LEVEL_FACTOR = 0.36;
const ITEM_ARMOR_SPREAD = 3;

const ITEM_RARITY_LABEL_COLORS: Record<InventoryItem["rarity"], string> = {
  common: "#d4d4d4",
  epic: "#b46cff",
  legendary: "#d6a94b",
  rare: "#5fa8ff",
  uncommon: "#40c057"
};

const SLOT_POWER_PROFILES: Record<EquipmentSlot, { damage?: [number, number]; defense?: [number, number]; tier: string }> = {
  armor: { defense: [12, 18], tier: "Armor" },
  backAccessory: { defense: [3, 6], tier: "Back" },
  bodyAccessory: { defense: [4, 7], tier: "Gloves" },
  eyewear: { defense: [1, 3], tier: "Ring" },
  feet: { defense: [4, 8], tier: "Boots" },
  headAccessory: { defense: [1, 3], tier: "Amulet" },
  headgear: { defense: [6, 10], tier: "Helmet" },
  mainHand: { damage: [6, 12], tier: "1-Handed" },
  offHand: { defense: [8, 14], tier: "Shield" }
};

const STAT_DISPLAY_NAMES: Record<keyof typeof STAT_LABELS, string> = {
  constitution: "Constitution",
  intelligence: "Intelligence",
  perception: "Perception",
  strength: "Strength"
};

const MODIFIER_DETAILS: Record<ItemModifierKey, { color: string; label: (value: number) => string; range: [number, number] }> = {
  bonusXpPercent: { color: "#6f6ff6", label: (value) => `+${value}% Increased Experience`, range: [5, 20] },
  coldResistPercent: { color: "#73c7ff", label: (value) => `+${value}% Cold Resistance`, range: [5, 30] },
  criticalChancePercent: { color: "#6f6ff6", label: (value) => `+${value}% Increased Critical Strike Chance`, range: [2, 8] },
  damageReduction: { color: "#6f6ff6", label: (value) => `-${value} Damage Taken`, range: [1, 4] },
  enhancedDamagePercent: { color: "#6f6ff6", label: (value) => `+${value}% Enhanced Damage`, range: [8, 30] },
  fireResistPercent: { color: "#ff8a3d", label: (value) => `+${value}% Fire Resistance`, range: [5, 30] },
  goldFindPercent: { color: "#d6a94b", label: (value) => `+${value}% Gold Find`, range: [8, 35] },
  lifeOnKill: { color: "#7cff7c", label: (value) => `+${value} Life on Complete`, range: [2, 8] },
  lightningResistPercent: { color: "#f0df5f", label: (value) => `+${value}% Lightning Resistance`, range: [5, 30] },
  magicFindPercent: { color: "#d6a94b", label: (value) => `+${value}% Magic Find`, range: [5, 25] },
  manaOnKill: { color: "#73a7ff", label: (value) => `+${value} Mana on Complete`, range: [2, 8] },
  maxLife: { color: "#7cff7c", label: (value) => `+${value} Maximum Life`, range: [5, 20] },
  maxMana: { color: "#73a7ff", label: (value) => `+${value} Maximum Mana`, range: [5, 20] },
  poisonResistPercent: { color: "#7cff7c", label: (value) => `+${value}% Poison Resistance`, range: [5, 30] }
};

type EquipmentSpriteLayout = { asset: StaticImageData; height: number; iconSize: number; label: string; left: number; top: number; width: number };
type ItemFootprint = { columns: number; rows: number };
type InventoryPlacement = { column: number; footprint: ItemFootprint; item: InventoryItem; row: number; tab: number };
type InventoryDropPreview = { footprint: ItemFootprint; position: InventoryItemPosition; valid: boolean };

const ITEM_FOOTPRINTS: Record<EquipmentSlot, ItemFootprint> = {
  armor: { columns: 2, rows: 2 },
  backAccessory: { columns: 2, rows: 2 },
  bodyAccessory: { columns: 2, rows: 2 },
  eyewear: { columns: 1, rows: 1 },
  feet: { columns: 2, rows: 2 },
  headAccessory: { columns: 1, rows: 1 },
  headgear: { columns: 2, rows: 2 },
  mainHand: { columns: 2, rows: 3 },
  offHand: { columns: 2, rows: 3 }
};

const EQUIPMENT_LAYOUT: Record<EquipmentSlot, EquipmentSpriteLayout> = {
  armor: { asset: inventorySlotArmorBg, height: 99, iconSize: LARGE_EQUIPPED_ICON_SIZE, label: "Armor", left: 226, top: 176, width: 66 },
  backAccessory: { asset: inventorySlotBeltBg, height: 35, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Belt", left: 226, top: 314, width: 66 },
  bodyAccessory: { asset: inventorySlotGlovesBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Gloves", left: 82, top: 292, width: 66 },
  eyewear: { asset: inventorySlotRingBg, height: 35, iconSize: SMALL_EQUIPPED_ICON_SIZE, label: "Ring", left: 318, top: 300, width: 34 },
  feet: { asset: inventorySlotBootsBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Boots", left: 380, top: 292, width: 66 },
  headAccessory: { asset: inventorySlotAmuletBg, height: 35, iconSize: SMALL_EQUIPPED_ICON_SIZE, label: "Amulet", left: 166, top: 300, width: 34 },
  headgear: { asset: inventorySlotHelmetBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Helmet", left: 226, top: 74, width: 66 },
  mainHand: { asset: inventorySlotWeaponBg, height: 131, iconSize: WEAPON_EQUIPPED_ICON_SIZE, label: "Weapon", left: 80, top: 136, width: 98 },
  offHand: { asset: inventorySlotShieldBg, height: 131, iconSize: WEAPON_EQUIPPED_ICON_SIZE, label: "Shield", left: 340, top: 136, width: 98 }
};

const TAB_BUTTONS = [
  { asset: tabMainBg, label: "Main", width: TAB_MAIN_WIDTH },
  { asset: tabExtraBg, label: "Extra", width: TAB_EXTRA_WIDTH },
  { asset: tabExtraBg, label: "Extra", width: TAB_EXTRA_WIDTH }
] as const;

export function InventoryPanel(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const activeSetBonuses = getActiveSetBonuses(props.state);
  return (
    <Stack gap="sm">
      <Box mx="auto" style={{ maxWidth: "100%", width: INVENTORY_PANEL_WIDTH }}>
        <EquipmentBoard state={props.state} setState={props.setState} />
        {activeSetBonuses.length > 0 && (
          <Stack gap={2} mt="xs">
            {activeSetBonuses.map((set) => (
              <Text key={set.id} size="xs" c="green.3">{set.name} ({set.count}/{set.total}) - {set.bonuses.map((bonus) => `${bonus.pieces}pc ${formatStats(bonus.stats)}`).join("; ") || "No active bonus yet"}</Text>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function EquipmentBoard(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Box style={{ backgroundImage: `url(${inventoryGamepadBg})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", height: INVENTORY_PANEL_HEIGHT, imageRendering: "pixelated", position: "relative", width: INVENTORY_PANEL_WIDTH }}>
      <EquipmentStage />
      {Object.entries(EQUIPMENT_LAYOUT).map(([slotKey, layout]) => {
        const slot = slotKey as EquipmentSlot;
        const item = props.state.profile.inventory.find((row) => row.id === props.state.profile.equipment[slot]);
        return <EquipmentSlotCell key={slot} item={item} layout={layout} slot={slot} onUnequip={() => props.setState((previous) => unequipItem(previous, slot))} />;
      })}
      <InventoryGrid activeTab={activeTab} state={props.state} setState={props.setState} />
      <InventoryBackgroundGhostMask />
      <InventorySortButton setState={props.setState} />
      <InventoryTabs activeTab={activeTab} onChange={setActiveTab} />
    </Box>
  );
}

function EquipmentStage() {
  return (
    <Box
      aria-hidden="true"
      style={{
        background: EQUIPMENT_STAGE_BG,
        border: "1px solid rgba(154, 32, 70, 0.86)",
        boxShadow: "inset 0 0 0 2px rgba(22, 3, 6, 0.92), inset 0 0 32px rgba(0, 0, 0, 0.56)",
        height: EQUIPMENT_STAGE_HEIGHT,
        left: EQUIPMENT_STAGE_LEFT,
        pointerEvents: "none",
        position: "absolute",
        top: EQUIPMENT_STAGE_TOP,
        width: EQUIPMENT_STAGE_WIDTH,
        zIndex: 1
      }}
    />
  );
}

function InventoryBackgroundGhostMask() {
  return (
    <Box
      aria-hidden="true"
      style={{
        background: "#050303",
        height: INVENTORY_BACKGROUND_GHOST_HEIGHT,
        left: INVENTORY_GRID_LEFT,
        pointerEvents: "none",
        position: "absolute",
        top: INVENTORY_BACKGROUND_GHOST_TOP,
        width: INVENTORY_GRID_WIDTH,
        zIndex: 2
      }}
    />
  );
}

function EquipmentSlotCell(props: { item?: InventoryItem; layout: EquipmentSpriteLayout; onUnequip: () => void; slot: EquipmentSlot }) {
  const content = (
    <Box component={props.item ? "button" : "div"} onClick={props.item ? props.onUnequip : undefined} style={{ backgroundColor: "transparent", backgroundImage: `url(${props.layout.asset})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", border: 0, boxShadow: "none", cursor: props.item ? "pointer" : "default", height: props.layout.height, imageRendering: "pixelated", left: props.layout.left, outline: "none", padding: 0, position: "absolute", top: props.layout.top, width: props.layout.width, zIndex: 2 }}>
      {props.item ? (
        <Box style={{ alignItems: "center", display: "flex", height: "100%", justifyContent: "center", width: "100%" }}>
          <HeroSiegeEquipmentIcon item={props.item} size={props.layout.iconSize} unframed />
        </Box>
      ) : null}
    </Box>
  );
  return props.item ? (
    <InventoryItemTooltip item={props.item} equipped>
      {content}
    </InventoryItemTooltip>
  ) : content;
}

function InventoryGrid(props: { activeTab: number; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropPreview, setDropPreview] = useState<InventoryDropPreview | null>(null);
  const placements = getAllInventoryPlacements(props.state.profile.inventory, props.state.profile.inventorySlots);
  const visiblePlacements = placements.filter((placement) => placement.tab === props.activeTab);
  const cells = Array.from({ length: INVENTORY_GRID_ROWS * INVENTORY_GRID_COLUMNS });
  const clearDragState = () => {
    setDraggedItemId(null);
    setDropPreview(null);
  };
  return (
    <Box
      onDragOver={(event) => {
        if (!draggedItemId) {
          return;
        }
        const draggedPlacement = placements.find((placement) => placement.item.id === draggedItemId);
        const position = getDropInventoryPosition(event.currentTarget, event, props.activeTab, draggedPlacement?.footprint);
        if (!position || !draggedPlacement) {
          setDropPreview(null);
          return;
        }
        const dropPosition = clampDropPreviewPosition(position, draggedPlacement.footprint);
        const valid = canMoveItemToPosition(draggedItemId, dropPosition, placements);
        setDropPreview({
          footprint: draggedPlacement.footprint,
          position: dropPosition,
          valid
        });
        if (valid) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDropPreview(null);
        }
      }}
      onDrop={(event) => {
        const itemId = event.dataTransfer.getData("text/plain") || draggedItemId;
        const draggedPlacement = placements.find((placement) => placement.item.id === itemId);
        const position = getDropInventoryPosition(event.currentTarget, event, props.activeTab, draggedPlacement?.footprint);
        const dropPosition = position && draggedPlacement ? clampDropPreviewPosition(position, draggedPlacement.footprint) : null;
        clearDragState();
        if (!itemId || !dropPosition || !canMoveItemToPosition(itemId, dropPosition, placements)) {
          return;
        }
        event.preventDefault();
        props.setState((previous) => moveInventoryItem(previous, itemId, dropPosition));
      }}
      style={{ display: "grid", gap: INVENTORY_GRID_GAP, gridTemplateColumns: `repeat(${INVENTORY_GRID_COLUMNS}, ${INVENTORY_GRID_CELL_SIZE}px)`, gridTemplateRows: `repeat(${INVENTORY_GRID_ROWS}, ${INVENTORY_GRID_CELL_SIZE}px)`, left: INVENTORY_GRID_LEFT, position: "absolute", top: INVENTORY_GRID_TOP, width: INVENTORY_GRID_WIDTH }}
    >
      <InventoryExtraColumnHighlight />
      {cells.map((_, index) => (
        <InventoryEmptyCell key={`empty-${index}`} />
      ))}
      {dropPreview ? <InventoryDropPreviewOverlay preview={dropPreview} /> : null}
      {visiblePlacements.map((placement) => (
        <InventoryItemCell
          key={placement.item.id}
          canEquip={canEquipItem(props.state, placement.item)}
          equipped={props.state.profile.equipment[placement.item.slot] === placement.item.id}
          item={placement.item}
          footprint={placement.footprint}
          isDragging={draggedItemId === placement.item.id}
          onEquip={() => props.setState((previous) => equipItem(previous, placement.item.id))}
          onUnequip={() => props.setState((previous) => unequipItem(previous, placement.item.slot))}
          onDiscard={() => props.setState((previous) => discardItem(previous, placement.item.id))}
          onDragEnd={clearDragState}
          onDragStart={(itemId) => setDraggedItemId(itemId)}
          placement={placement}
          tooltipDisabled={draggedItemId !== null}
        />
      ))}
    </Box>
  );
}

function InventoryEmptyCell() {
  return <Box style={{ backgroundImage: `url(${inventoryGridBg})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", height: INVENTORY_GRID_CELL_SIZE, imageRendering: "pixelated", width: INVENTORY_GRID_CELL_SIZE }} />;
}

function InventoryExtraColumnHighlight() {
  const width = INVENTORY_EXTRA_COLUMNS * INVENTORY_GRID_CELL_SIZE + (INVENTORY_EXTRA_COLUMNS - 1) * INVENTORY_GRID_GAP;
  const left = (INVENTORY_GRID_COLUMNS - INVENTORY_EXTRA_COLUMNS) * (INVENTORY_GRID_CELL_SIZE + INVENTORY_GRID_GAP);
  return (
    <Box
      aria-hidden="true"
      style={{
        border: "1px solid rgba(154, 91, 7, 0.95)",
        boxShadow: "inset 0 0 0 1px rgba(32, 15, 2, 0.92), inset 0 0 14px rgba(173, 103, 5, 0.18)",
        height: INVENTORY_GRID_HEIGHT,
        left,
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        width,
        zIndex: 1
      }}
    />
  );
}

function InventoryDropPreviewOverlay(props: { preview: InventoryDropPreview }) {
  const color = props.preview.valid ? "#fff6c4" : "#d84d4d";
  const width = props.preview.footprint.columns * INVENTORY_GRID_CELL_SIZE + (props.preview.footprint.columns - 1) * INVENTORY_GRID_GAP;
  const height = props.preview.footprint.rows * INVENTORY_GRID_CELL_SIZE + (props.preview.footprint.rows - 1) * INVENTORY_GRID_GAP;
  return (
    <Box
      aria-hidden="true"
      style={{
        background: props.preview.valid ? "rgba(255, 238, 164, 0.16)" : "rgba(150, 20, 20, 0.2)",
        border: `2px solid ${color}`,
        boxShadow: props.preview.valid ? "0 0 12px rgba(255, 246, 196, 0.75), inset 0 0 10px rgba(255, 246, 196, 0.28)" : "0 0 12px rgba(216, 77, 77, 0.72), inset 0 0 10px rgba(216, 77, 77, 0.24)",
        height,
        imageRendering: "pixelated",
        left: props.preview.position.column * (INVENTORY_GRID_CELL_SIZE + INVENTORY_GRID_GAP),
        pointerEvents: "none",
        position: "absolute",
        top: props.preview.position.row * (INVENTORY_GRID_CELL_SIZE + INVENTORY_GRID_GAP),
        width,
        zIndex: 4
      }}
    />
  );
}

function clampDropPreviewPosition(position: InventoryItemPosition, footprint: ItemFootprint): InventoryItemPosition {
  return {
    column: Math.max(0, Math.min(position.column, INVENTORY_GRID_COLUMNS - footprint.columns)),
    row: Math.max(0, Math.min(position.row, INVENTORY_GRID_ROWS - footprint.rows)),
    tab: position.tab
  };
}

function InventoryItemCell(props: { canEquip: boolean; equipped: boolean; footprint: ItemFootprint; isDragging: boolean; item: InventoryItem; onDiscard: () => void; onDragEnd: () => void; onDragStart: (itemId: string) => void; onEquip: () => void; onUnequip: () => void; placement: InventoryPlacement; tooltipDisabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  const action = props.equipped ? props.onUnequip : props.onEquip;
  const iconSize = getInventoryItemIconSize(props.footprint);
  const rarityColor = RARITY_COLORS[props.item.rarity];
  return (
    <InventoryItemTooltip canEquip={props.canEquip} disabled={props.tooltipDisabled} equipped={props.equipped} item={props.item}>
      <Box
        draggable
        onDragEnd={props.onDragEnd}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", props.item.id);
          props.onDragStart(props.item.id);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ gridColumn: `${props.placement.column + 1} / span ${props.footprint.columns}`, gridRow: `${props.placement.row + 1} / span ${props.footprint.rows}`, opacity: props.isDragging ? 0.42 : 1, position: "relative", zIndex: 5 }}
      >
        <Box
          aria-disabled={!props.equipped && !props.canEquip}
          component="button"
          onClick={() => {
            if (props.equipped || props.canEquip) {
              action();
            }
          }}
          style={{
            alignItems: "center",
            backgroundColor: "#08080b",
            backgroundImage: `${ITEM_TILE_RARITY_BG[props.item.rarity]}, url(${inventoryGridBg})`,
            backgroundRepeat: "no-repeat, repeat",
            backgroundSize: `100% 100%, ${INVENTORY_GRID_CELL_SIZE}px ${INVENTORY_GRID_CELL_SIZE}px`,
            border: `1px solid ${rarityColor}`,
            boxShadow: `${ITEM_TILE_INSET_SHADOW}, 0 0 8px color-mix(in srgb, ${rarityColor} 34%, transparent)`,
            cursor: "move",
            display: "flex",
            height: "100%",
            imageRendering: "pixelated",
            justifyContent: "center",
            opacity: props.equipped || props.canEquip ? 1 : LOCKED_ITEM_OPACITY,
            padding: 0,
            width: "100%"
          }}
          type="button"
        >
          <HeroSiegeEquipmentIcon item={props.item} size={iconSize} unframed />
        </Box>
        <ActionIcon
          aria-label={`Discard ${props.item.name}`}
          color="red"
          onClick={(event) => {
            event.stopPropagation();
            props.onDiscard();
          }}
          size={DISCARD_BUTTON_SIZE}
          style={{ background: "rgba(28, 6, 7, 0.94)", border: "1px solid rgba(255, 160, 130, 0.64)", opacity: hovered ? 1 : 0, pointerEvents: hovered ? "auto" : "none", position: "absolute", right: 2, top: 2 }}
          variant="filled"
        >
          <IconTrash size={DISCARD_ICON_SIZE} />
        </ActionIcon>
      </Box>
    </InventoryItemTooltip>
  );
}

function getAllInventoryPlacements(items: InventoryItem[], inventorySlots: Record<string, InventoryItemPosition>) {
  const occupiedByTab = Array.from({ length: INVENTORY_TAB_COUNT }, () => createInventoryOccupancy());
  const placements: InventoryPlacement[] = [];
  const remainingItems: InventoryItem[] = [];

  for (const item of items) {
    const footprint = ITEM_FOOTPRINTS[item.slot];
    const position = inventorySlots[item.id];
    if (isValidManualPosition(position, footprint) && canPlaceItemAt(occupiedByTab[position.tab], position.row, position.column, footprint)) {
      markPlacement(occupiedByTab[position.tab], position.row, position.column, footprint);
      placements.push({ column: position.column, footprint, item, row: position.row, tab: position.tab });
      continue;
    }
    remainingItems.push(item);
  }

  for (const item of remainingItems) {
    const footprint = ITEM_FOOTPRINTS[item.slot];
    const position = findPagedPlacement(occupiedByTab, footprint);
    markPlacement(occupiedByTab[position.tab], position.row, position.column, footprint);
    placements.push({ column: position.column, footprint, item, row: position.row, tab: position.tab });
  }

  return placements;
}

function createInventoryOccupancy() {
  return Array.from({ length: INVENTORY_GRID_ROWS }, () => Array.from({ length: INVENTORY_GRID_COLUMNS }, () => false));
}

function isValidManualPosition(position: InventoryItemPosition | undefined, footprint: ItemFootprint): position is InventoryItemPosition {
  if (!position) {
    return false;
  }
  return Number.isInteger(position.tab) && Number.isInteger(position.row) && Number.isInteger(position.column) && position.tab >= 0 && position.tab < INVENTORY_TAB_COUNT && isPositionInBounds(position, footprint);
}

function isPositionInBounds(position: InventoryItemPosition, footprint: ItemFootprint) {
  return position.row >= 0 && position.column >= 0 && position.row + footprint.rows <= INVENTORY_GRID_ROWS && position.column + footprint.columns <= INVENTORY_GRID_COLUMNS;
}

function getDropInventoryPosition(element: HTMLElement, event: React.DragEvent<HTMLElement>, tab: number, footprint?: ItemFootprint): InventoryItemPosition | null {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const rawColumn = Math.floor(x / (INVENTORY_GRID_CELL_SIZE + INVENTORY_GRID_GAP));
  const rawRow = Math.floor(y / (INVENTORY_GRID_CELL_SIZE + INVENTORY_GRID_GAP));
  if (rawRow < 0 || rawRow >= INVENTORY_GRID_ROWS || rawColumn < 0 || rawColumn >= INVENTORY_GRID_COLUMNS) {
    return null;
  }
  const column = footprint ? rawColumn - Math.floor((footprint.columns - 1) / 2) : rawColumn;
  const row = footprint ? rawRow - Math.floor((footprint.rows - 1) / 2) : rawRow;
  return { column, row, tab };
}

function canMoveItemToPosition(itemId: string, position: InventoryItemPosition, placements: InventoryPlacement[]) {
  const draggedPlacement = placements.find((placement) => placement.item.id === itemId);
  if (!draggedPlacement || !isPositionInBounds(position, draggedPlacement.footprint)) {
    return false;
  }
  const occupied = createInventoryOccupancy();
  for (const placement of placements) {
    if (placement.item.id === itemId || placement.tab !== position.tab) {
      continue;
    }
    markPlacement(occupied, placement.row, placement.column, placement.footprint);
  }
  return canPlaceItemAt(occupied, position.row, position.column, draggedPlacement.footprint);
}

function findPagedPlacement(occupiedByTab: boolean[][][], footprint: ItemFootprint) {
  for (let tab = 0; tab < occupiedByTab.length; tab += 1) {
    for (let row = 0; row <= INVENTORY_GRID_ROWS - footprint.rows; row += 1) {
      for (let column = 0; column <= INVENTORY_GRID_COLUMNS - footprint.columns; column += 1) {
        if (canPlaceItemAt(occupiedByTab[tab], row, column, footprint)) {
          return { column, row, tab };
        }
      }
    }
  }
  return { column: 0, row: 0, tab: occupiedByTab.length - 1 };
}

function canPlaceItemAt(occupied: boolean[][], row: number, column: number, footprint: ItemFootprint) {
  for (let rowOffset = 0; rowOffset < footprint.rows; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < footprint.columns; columnOffset += 1) {
      if (occupied[row + rowOffset]?.[column + columnOffset]) {
        return false;
      }
    }
  }
  return true;
}

function markPlacement(occupied: boolean[][], row: number, column: number, footprint: ItemFootprint) {
  for (let rowOffset = 0; rowOffset < footprint.rows; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < footprint.columns; columnOffset += 1) {
      occupied[row + rowOffset][column + columnOffset] = true;
    }
  }
}

function getInventoryItemIconSize(footprint: ItemFootprint) {
  const width = footprint.columns * INVENTORY_GRID_CELL_SIZE + (footprint.columns - 1) * INVENTORY_GRID_GAP;
  const height = footprint.rows * INVENTORY_GRID_CELL_SIZE + (footprint.rows - 1) * INVENTORY_GRID_GAP;
  return Math.max(INVENTORY_ITEM_ICON_SIZE, Math.min(width, height) - 8);
}

function InventorySortButton(props: { setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return (
    <HeroSiegeButton
      onClick={() => props.setState(sortInventory)}
      width={SORT_BUTTON_WIDTH}
      height={SORT_BUTTON_HEIGHT}
      style={{
        position: "absolute",
        right: SORT_BUTTON_RIGHT,
        top: SORT_BUTTON_TOP,
        zIndex: 4
      }}
    >
      Sort Tab
    </HeroSiegeButton>
  );
}

function InventoryTabs(props: { activeTab: number; onChange: (index: number) => void }) {
  return (
    <Group gap={TAB_GAP} wrap="nowrap" style={{ left: TAB_ROW_LEFT, position: "absolute", top: TAB_ROW_TOP }}>
      {TAB_BUTTONS.map((tab, index) => (
        <InventoryTab key={`${tab.label}-${index}`} active={props.activeTab === index} asset={tab.asset} label={tab.label} onClick={() => props.onChange(index)} width={tab.width} />
      ))}
    </Group>
  );
}

function InventoryTab(props: { active: boolean; asset: StaticImageData; label: string; onClick: () => void; width: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      component="button"
      onClick={props.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "transparent",
        backgroundImage: `url(${props.active ? tabMainBg : props.asset})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        border: 0,
        cursor: "pointer",
        filter: props.active || hovered ? CONTROL_HOVER_FILTER : CONTROL_DEFAULT_FILTER,
        height: TAB_HEIGHT,
        imageRendering: "pixelated",
        padding: 0,
        width: props.width
      }}
      type="button"
    >
      <Text size="sm" fw={900} ta="center" style={{ color: props.active ? "#fff0b8" : "#d6d18f", lineHeight: `${TAB_HEIGHT}px`, textShadow: "0 1px 0 #000" }}>
        {props.label}
      </Text>
    </Box>
  );
}

function sortInventory(state: StudyState): StudyState {
  return {
    ...state,
    profile: {
      ...state.profile,
      inventory: [...state.profile.inventory].sort(compareInventoryItems(state)),
      inventorySlots: {}
    }
  };
}

function compareInventoryItems(state: StudyState) {
  return (left: InventoryItem, right: InventoryItem) => {
    const equippedDelta = Number(isItemEquipped(state, right)) - Number(isItemEquipped(state, left));
    if (equippedDelta) {
      return equippedDelta;
    }
    return `${left.slot}:${left.rarity}:${left.name}`.localeCompare(`${right.slot}:${right.rarity}:${right.name}`);
  };
}

function isItemEquipped(state: StudyState, item: InventoryItem) {
  return state.profile.equipment[item.slot] === item.id;
}

export function ItemSummary(props: { compact?: boolean; item: InventoryItem }) {
  return (
    <Group gap={props.compact ? COMPACT_SUMMARY_GAP : FULL_SUMMARY_GAP} wrap="nowrap" align="flex-start">
      <ItemPixelIcon item={props.item} />
      <Box style={{ minWidth: 0 }}>
        <Group gap={4} wrap="nowrap">
          <Text size={props.compact ? "10px" : "xs"} fw={800} c={RARITY_COLORS[props.item.rarity]} lineClamp={props.compact ? COMPACT_NAME_LINES : 1}>{props.item.name}</Text>
          {props.item.setId && <Badge size="xs" color="green" variant="light">set</Badge>}
        </Group>
        <Text size="10px" c="gray.4" lineClamp={1}>{formatItemStats(props.item)}</Text>
        {props.item.modifiers?.length ? <Text size="10px" c="blue.2" lineClamp={1}>{formatItemModifiers(props.item)}</Text> : null}
        <Text size="10px" c="dimmed" lineClamp={1}>{formatItemRequirements(props.item)}</Text>
      </Box>
    </Group>
  );
}

function ItemPixelIcon(props: { item: InventoryItem }) {
  return <HeroSiegeEquipmentIcon item={props.item} size={ITEM_ICON_SIZE} />;
}

function InventoryItemTooltip(props: { canEquip?: boolean; children: React.ReactNode; disabled?: boolean; equipped?: boolean; item: InventoryItem }) {
  return (
    <Tooltip
      disabled={props.disabled}
      label={<ItemDetails canEquip={props.canEquip} equipped={props.equipped} item={props.item} />}
      multiline
      withArrow
      color="dark"
      styles={{
        tooltip: {
          background: DETAILS_BG,
          border: DETAILS_BORDER,
          borderRadius: 2,
          boxShadow: DETAILS_SHADOW,
          color: "#f1dfad",
          padding: DETAILS_PADDING
        }
      }}
    >
      {props.children}
    </Tooltip>
  );
}

function ItemDetails(props: { canEquip?: boolean; equipped?: boolean; item: InventoryItem }) {
  const baseName = getBaseItemName(props.item);
  const powerProfile = SLOT_POWER_PROFILES[props.item.slot];
  const level = props.item.requirements.level;
  const damageRange = powerProfile.damage ? getScaledPowerRange(powerProfile.damage, level, ITEM_DAMAGE_LEVEL_FACTOR, ITEM_DAMAGE_SPREAD) : null;
  const defenseRange = powerProfile.defense ? getScaledPowerRange(powerProfile.defense, level, ITEM_ARMOR_LEVEL_FACTOR, ITEM_ARMOR_SPREAD) : null;
  return (
    <Stack gap={8} style={{ textAlign: "center", width: DETAILS_SHEET_WIDTH }}>
      <Box>
        <Text size="lg" fw={900} tt="uppercase" style={{ color: ITEM_RARITY_LABEL_COLORS[props.item.rarity], letterSpacing: 0, textShadow: "0 2px 0 #000" }}>
          {props.item.name}
        </Text>
        <Text size="sm" fw={800} c="gray.2">{baseName}</Text>
      </Box>
      {damageRange && (
        <TooltipPowerRow label="Attack Damage" value={`${damageRange.min}-${damageRange.max}`} range={damageRange} />
      )}
      {defenseRange && (
        <TooltipPowerRow label={props.item.slot === "offHand" ? "Block Armor" : "Armor"} value={defenseRange.average} range={defenseRange} />
      )}
      {props.item.modifiers?.length ? (
        <Stack gap={2}>
          {props.item.modifiers.map((modifier) => {
            const details = MODIFIER_DETAILS[modifier.key];
            const range = getScaledModifierRange(details.range, level);
            return <TooltipAffixLine key={modifier.key} color={details.color} text={details.label(modifier.value)} range={range} />;
          })}
        </Stack>
      ) : null}
      <Stack gap={2}>
        {Object.entries(props.item.stats).filter(([, value]) => value).map(([key, value]) => {
          const stat = key as keyof typeof STAT_DISPLAY_NAMES;
          return <TooltipAffixLine key={key} color="#6f6ff6" text={`+${value} to ${STAT_DISPLAY_NAMES[stat]}`} range={getStatRollRange(props.item)} />;
        })}
      </Stack>
      <Box mt={2} style={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr", textAlign: "left" }}>
        <Text size="xs" fw={900} c="gray.1">[{EQUIPMENT_SLOT_LABELS[props.item.slot]}]</Text>
        <Text size="xs" fw={900} c="gray.1" ta="right">[{powerProfile.tier}]</Text>
        <Text size="xs" fw={900} c="gray.1">Level Req. {props.item.requirements.level}</Text>
        <Text size="xs" fw={900} c="gray.1" ta="right">Rarity: {formatRarity(props.item.rarity)}</Text>
        {Object.entries(props.item.requirements.stats).filter(([, value]) => value).map(([key, value]) => (
          <Text key={key} size="xs" fw={900} c="gray.1" style={{ gridColumn: "1 / -1" }}>{STAT_DISPLAY_NAMES[key as keyof typeof STAT_DISPLAY_NAMES]} Req. {value}</Text>
        ))}
      </Box>
      <Group gap={4} justify="center">
        {props.item.setId && <Badge size="xs" color="green" variant="light">set</Badge>}
        {props.equipped && <Badge size="xs" color="yellow" variant="light">equipped</Badge>}
        {!props.equipped && props.canEquip === false && <Badge size="xs" color="red" variant="light">locked</Badge>}
      </Group>
    </Stack>
  );
}

function TooltipPowerRow(props: { label: string; range: { average: number; max: number; min: number }; value: React.ReactNode }) {
  return (
    <Group justify="center" gap={8} wrap="nowrap">
      <Text size="sm" fw={900} c="gray.1">{props.label}:</Text>
      <Text size="sm" fw={900} c="#6f6ff6">{props.value}</Text>
      <Text size="sm" fw={900} c="#20e020">[{props.range.min}-{props.range.max}]</Text>
    </Group>
  );
}

function TooltipAffixLine(props: { color: string; range: { max: number; min: number }; text: string }) {
  return (
    <Text size="sm" fw={900} style={{ color: props.color, lineHeight: 1.18, textShadow: "0 1px 0 #000" }}>
      {props.text} <Box component="span" c="#20e020">[{props.range.min}-{props.range.max}]</Box>
    </Text>
  );
}

function formatItemRequirements(item: InventoryItem) {
  const statRequirements = Object.entries(item.requirements.stats)
    .filter(([, value]) => value)
    .map(([key, value]) => `${STAT_LABELS[key as keyof typeof STAT_LABELS]} ${value}`)
    .join(", ");
  return statRequirements ? `Lvl ${item.requirements.level}, ${statRequirements}` : `Lvl ${item.requirements.level}`;
}

function formatItemStats(item: InventoryItem) {
  return formatStats(item.stats);
}

function formatItemModifiers(item: InventoryItem) {
  return (item.modifiers || []).map((modifier) => MODIFIER_FORMATTERS[modifier.key](modifier.value)).join(", ");
}

function getBaseItemName(item: InventoryItem) {
  const normalizedName = item.name.toLowerCase();
  return ITEM_BASE_NAMES[item.slot].find((baseName) => normalizedName.includes(baseName.toLowerCase())) || EQUIPMENT_SLOT_LABELS[item.slot];
}

function getScaledPowerRange(baseRange: [number, number], level: number, levelFactor: number, spread: number) {
  const levelBonus = Math.max(0, Math.floor(level * levelFactor));
  const min = baseRange[0] + levelBonus;
  const max = baseRange[1] + levelBonus + Math.floor(level / spread);
  return { average: Math.round((min + max) / 2), max, min };
}

function getScaledModifierRange(baseRange: [number, number], level: number) {
  const scaledMax = Math.max(1, Math.ceil(baseRange[1] * (level / MAX_ITEM_LEVEL)));
  const scaledMin = Math.min(baseRange[0], scaledMax);
  return { max: scaledMax, min: scaledMin };
}

function getStatRollRange(item: InventoryItem) {
  const tier = Math.max(1, Math.ceil(item.requirements.level / LEVELS_PER_POWER_TIER));
  const rarityMax: Record<InventoryItem["rarity"], number> = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
  return { max: Math.min(rarityMax[item.rarity], tier), min: 1 };
}

function formatRarity(rarity: InventoryItem["rarity"]) {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

function formatStats(stats: InventoryItem["stats"]) {
  return Object.entries(stats)
    .filter(([, value]) => value)
    .map(([key, value]) => `${STAT_LABELS[key as keyof typeof STAT_LABELS]} +${value}`)
    .join(", ");
}
