import { ActionIcon, Badge, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
type StaticImageData = string;
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { IconCoins } from "@tabler/icons-react";

import { HeroSiegeButton } from "./HeroSiegeUi";
import { HERO_ITEM_RARITY_COLORS, HeroSiegeEquipmentIcon } from "./HeroSiegeItemIcon";
import { getHeroSiegeQualityColor, getItemQuality } from "../lib/heroSiegeQuality";
import { MODIFIER_FORMATTERS } from "../lib/modifierFormat";
import { bulkSellItems, canEquipItem, EQUIPMENT_SLOT_LABELS, equipItem, equipItemToSlot, getActiveSetBonuses, getItemSellValue, moveInventoryItem, sellItem, unequipItem } from "../lib/studyCore";
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
const SORT_BUTTON_WIDTH = 132;
const BULK_SELL_BUTTON_WIDTH = 132;
const BULK_SELL_BUTTON_GAP = 8;
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
  common: "radial-gradient(circle at 45% 26%, rgba(245, 245, 245, 0.2), rgba(72, 72, 72, 0.48) 38%, rgba(7, 7, 7, 0.96) 82%)",
  epic: "radial-gradient(circle at 45% 26%, rgba(39, 245, 70, 0.34), rgba(12, 88, 26, 0.58) 38%, rgba(3, 14, 5, 0.96) 82%)",
  legendary: "radial-gradient(circle at 45% 26%, rgba(255, 225, 105, 0.4), rgba(145, 103, 25, 0.64) 40%, rgba(17, 10, 3, 0.96) 82%)",
  rare: "radial-gradient(circle at 45% 26%, rgba(255, 246, 84, 0.38), rgba(118, 101, 16, 0.58) 40%, rgba(15, 13, 2, 0.96) 82%)",
  uncommon: "radial-gradient(circle at 45% 26%, rgba(57, 171, 255, 0.38), rgba(13, 74, 126, 0.58) 40%, rgba(2, 9, 17, 0.96) 82%)"
};
const ITEM_TILE_INSET_SHADOW = "inset 0 0 18px rgba(0, 0, 0, 0.58), inset 0 -5px 10px rgba(0, 0, 0, 0.34)";
const DETAILS_WIDTH = 260;
const DETAILS_SHEET_WIDTH = 300;
const DETAILS_COMPARE_GAP = 8;
const INVENTORY_SIDE_PANEL_GAP = 58;
const INVENTORY_SIDE_PANEL_VIEWPORT_PADDING = 18;
const INVENTORY_SIDE_PANEL_MAX_WIDTH = DETAILS_SHEET_WIDTH * 2 + DETAILS_COMPARE_GAP;
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

const SLOT_POWER_PROFILES: Record<EquipmentSlot, { damage?: [number, number]; defense?: [number, number]; tier: string }> = {
  armor: { defense: [12, 18], tier: "Armor" },
  backAccessory: { defense: [3, 6], tier: "Belt" },
  bodyAccessory: { defense: [4, 7], tier: "Gloves" },
  eyewear: { defense: [1, 3], tier: "Ring" },
  feet: { defense: [4, 8], tier: "Boots" },
  headAccessory: { defense: [1, 3], tier: "Amulet" },
  headgear: { defense: [6, 10], tier: "Helmet" },
  mainHand: { damage: [6, 12], tier: "1-Handed" },
  offHand: { defense: [8, 14], tier: "Shield" },
  ringTwo: { defense: [1, 3], tier: "Ring" }
};

const STAT_DISPLAY_NAMES: Record<keyof typeof STAT_LABELS, string> = {
  constitution: "Constitution",
  intelligence: "Intelligence",
  perception: "Perception",
  strength: "Strength"
};

const MODIFIER_DETAILS: Partial<Record<ItemModifierKey, { color: string; label: (value: number) => string; range: [number, number] }>> = {
  accuracyPercent: { color: "#6f6ff6", label: (value) => `+${value}% Accuracy`, range: [2, 10] },
  armor: { color: "#73c7ff", label: (value) => `+${value} Armor`, range: [1, 8] },
  armorPenetrationPercent: { color: "#6f6ff6", label: (value) => `+${value}% Armor Penetration`, range: [3, 20] },
  blockChancePercent: { color: "#73c7ff", label: (value) => `+${value}% Block Chance`, range: [2, 8] },
  bonusDamageVsElitesPercent: { color: "#6f6ff6", label: (value) => `+${value}% Damage vs Elites`, range: [5, 25] },
  bonusDamageWhileFullHealthPercent: { color: "#6f6ff6", label: (value) => `+${value}% Damage While Full Health`, range: [5, 20] },
  bonusDamageWhileLowHealthPercent: { color: "#6f6ff6", label: (value) => `+${value}% Damage While Low Health`, range: [5, 25] },
  bonusXpPercent: { color: "#6f6ff6", label: (value) => `+${value}% Increased Experience`, range: [5, 20] },
  coldResistPercent: { color: "#73c7ff", label: (value) => `+${value}% Cold Resistance`, range: [5, 30] },
  coldDamage: { color: "#73c7ff", label: (value) => `+${value} Cold Damage`, range: [1, 10] },
  criticalChancePercent: { color: "#6f6ff6", label: (value) => `+${value}% Increased Critical Strike Chance`, range: [2, 8] },
  criticalDamagePercent: { color: "#6f6ff6", label: (value) => `+${value}% Critical Strike Damage`, range: [10, 40] },
  damageReduction: { color: "#6f6ff6", label: (value) => `-${value} Damage Taken`, range: [1, 4] },
  dodgeChancePercent: { color: "#73c7ff", label: (value) => `+${value}% Dodge Chance`, range: [2, 8] },
  eliteDropBonusPercent: { color: "#d6a94b", label: (value) => `+${value}% Elite Drop Bonus`, range: [5, 20] },
  enhancedDamagePercent: { color: "#6f6ff6", label: (value) => `+${value}% Enhanced Damage`, range: [8, 30] },
  executeChancePercent: { color: "#6f6ff6", label: (value) => `+${value}% Execute Chance`, range: [2, 8] },
  extraAttackChancePercent: { color: "#6f6ff6", label: (value) => `+${value}% Extra Attack Chance`, range: [2, 8] },
  fireResistPercent: { color: "#ff8a3d", label: (value) => `+${value}% Fire Resistance`, range: [5, 30] },
  fireDamage: { color: "#ff8a3d", label: (value) => `+${value} Fire Damage`, range: [1, 10] },
  goldFindPercent: { color: "#d6a94b", label: (value) => `+${value}% Gold Find`, range: [8, 35] },
  healthRegen: { color: "#7cff7c", label: (value) => `+${value} Health Regeneration`, range: [1, 5] },
  increasedHealingReceivedPercent: { color: "#7cff7c", label: (value) => `+${value}% Increased Healing Received`, range: [5, 25] },
  increasedLootDropChancePercent: { color: "#d6a94b", label: (value) => `+${value}% Loot Drop Chance`, range: [5, 25] },
  increasedRareDropChancePercent: { color: "#d6a94b", label: (value) => `+${value}% Rare Drop Chance`, range: [3, 12] },
  lifeOnKill: { color: "#7cff7c", label: (value) => `+${value} Life on Complete`, range: [2, 8] },
  lifeStealPercent: { color: "#7cff7c", label: (value) => `+${value}% Life Steal`, range: [1, 6] },
  lightningResistPercent: { color: "#f0df5f", label: (value) => `+${value}% Lightning Resistance`, range: [5, 30] },
  lightningDamage: { color: "#f0df5f", label: (value) => `+${value} Lightning Damage`, range: [1, 10] },
  magicFindPercent: { color: "#d6a94b", label: (value) => `+${value}% Magic Find`, range: [5, 25] },
  maxLife: { color: "#7cff7c", label: (value) => `+${value} Maximum Life`, range: [5, 20] },
  maxMana: { color: "#73a7ff", label: (value) => `+${value} Maximum Mana`, range: [5, 20] },
  parryChancePercent: { color: "#73c7ff", label: (value) => `+${value}% Parry Chance`, range: [2, 8] },
  physicalDamage: { color: "#6f6ff6", label: (value) => `+${value} Physical Damage`, range: [1, 12] },
  physicalResistPercent: { color: "#73c7ff", label: (value) => `+${value}% Physical Resistance`, range: [3, 20] },
  poisonDamage: { color: "#7cff7c", label: (value) => `+${value} Poison Damage`, range: [1, 10] },
  poisonResistPercent: { color: "#7cff7c", label: (value) => `+${value}% Poison Resistance`, range: [5, 30] },
  reducedEnemyArmorPercent: { color: "#6f6ff6", label: (value) => `-${value}% Enemy Armor`, range: [3, 20] },
  reducedEnemyDamagePercent: { color: "#73c7ff", label: (value) => `-${value}% Enemy Damage`, range: [3, 15] },
  resistancePenetrationPercent: { color: "#6f6ff6", label: (value) => `+${value}% Resistance Penetration`, range: [3, 20] }
};

type EquipmentSpriteLayout = { asset: StaticImageData; height: number; iconSize: number; label: string; left: number; top: number; width: number };
type ItemFootprint = { columns: number; rows: number };
type InventoryPlacement = { column: number; footprint: ItemFootprint; item: InventoryItem; row: number; tab: number };
type InventoryDropPreview = { footprint: ItemFootprint; position: InventoryItemPosition; valid: boolean };
type InventoryPreview = { canEquip?: boolean; compareItem?: InventoryItem | null; equipped?: boolean; item: InventoryItem };

const ITEM_FOOTPRINTS: Record<EquipmentSlot, ItemFootprint> = {
  armor: { columns: 2, rows: 2 },
  backAccessory: { columns: 2, rows: 2 },
  bodyAccessory: { columns: 2, rows: 2 },
  eyewear: { columns: 1, rows: 1 },
  feet: { columns: 2, rows: 2 },
  headAccessory: { columns: 1, rows: 1 },
  headgear: { columns: 2, rows: 2 },
  mainHand: { columns: 2, rows: 3 },
  offHand: { columns: 2, rows: 3 },
  ringTwo: { columns: 1, rows: 1 }
};

const EQUIPMENT_LAYOUT: Record<EquipmentSlot, EquipmentSpriteLayout> = {
  armor: { asset: inventorySlotArmorBg, height: 99, iconSize: LARGE_EQUIPPED_ICON_SIZE, label: "Armor", left: 226, top: 176, width: 66 },
  backAccessory: { asset: inventorySlotBeltBg, height: 35, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Belt", left: 226, top: 314, width: 66 },
  bodyAccessory: { asset: inventorySlotGlovesBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Gloves", left: 82, top: 292, width: 66 },
  eyewear: { asset: inventorySlotRingBg, height: 35, iconSize: SMALL_EQUIPPED_ICON_SIZE, label: "Ring", left: 318, top: 300, width: 34 },
  feet: { asset: inventorySlotBootsBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Boots", left: 380, top: 292, width: 66 },
  headAccessory: { asset: inventorySlotAmuletBg, height: 35, iconSize: SMALL_EQUIPPED_ICON_SIZE, label: "Amulet", left: 302, top: 92, width: 34 },
  headgear: { asset: inventorySlotHelmetBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Helmet", left: 226, top: 74, width: 66 },
  mainHand: { asset: inventorySlotWeaponBg, height: 131, iconSize: WEAPON_EQUIPPED_ICON_SIZE, label: "Weapon", left: 80, top: 136, width: 98 },
  offHand: { asset: inventorySlotShieldBg, height: 131, iconSize: WEAPON_EQUIPPED_ICON_SIZE, label: "Shield", left: 340, top: 136, width: 98 },
  ringTwo: { asset: inventorySlotRingBg, height: 35, iconSize: SMALL_EQUIPPED_ICON_SIZE, label: "Ring", left: 164, top: 300, width: 34 }
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
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<EquipmentSlot | null>(null);
  const [preview, setPreview] = useState<InventoryPreview | null>(null);
  const shiftHeld = useShiftKeyPressed();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<{ left: number; top: number } | null>(null);
  const draggedItem = draggedItemId ? props.state.profile.inventory.find((item) => item.id === draggedItemId) || null : null;
  useEffect(() => {
    if (!preview || !boardRef.current) {
      setPreviewAnchor(null);
      return undefined;
    }
    const updateAnchor = () => {
      if (!boardRef.current) {
        return;
      }
      const rect = boardRef.current.getBoundingClientRect();
      setPreviewAnchor({
        left: Math.max(INVENTORY_SIDE_PANEL_VIEWPORT_PADDING, Math.min(rect.right + INVENTORY_SIDE_PANEL_GAP, window.innerWidth - INVENTORY_SIDE_PANEL_MAX_WIDTH - INVENTORY_SIDE_PANEL_VIEWPORT_PADDING)),
        top: Math.max(rect.top, INVENTORY_SIDE_PANEL_VIEWPORT_PADDING)
      });
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [preview]);
  return (
    <Box ref={boardRef} style={{ backgroundImage: `url(${inventoryGamepadBg})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", height: INVENTORY_PANEL_HEIGHT, imageRendering: "pixelated", position: "relative", width: INVENTORY_PANEL_WIDTH }}>
      <InventoryComparisonSidePanel anchor={previewAnchor} compareEnabled={shiftHeld} preview={preview} />
      <EquipmentStage />
      {Object.entries(EQUIPMENT_LAYOUT).map(([slotKey, layout]) => {
        const slot = slotKey as EquipmentSlot;
        const item = props.state.profile.inventory.find((row) => row.id === props.state.profile.equipment[slot]);
        const canDropDraggedItem = Boolean(draggedItem && canEquipItem(props.state, draggedItem) && isCompatibleSlotHighlight(draggedItem.slot, slot));
        return <EquipmentSlotCell key={slot} canDropDraggedItem={canDropDraggedItem} highlighted={canDropDraggedItem || isCompatibleSlotHighlight(highlightedSlot, slot)} item={item} layout={layout} onDropItem={(itemId) => props.setState((previous) => equipItemToSlot(previous, itemId, slot))} onPreview={setPreview} slot={slot} onUnequip={() => props.setState((previous) => unequipItem(previous, slot))} />;
      })}
      <InventoryGrid activeTab={activeTab} draggedItemId={draggedItemId} state={props.state} setDraggedItemId={setDraggedItemId} setState={props.setState} onHoverItem={setPreview} onHoverSlot={setHighlightedSlot} />
      <InventoryBackgroundGhostMask />
      <InventoryActions state={props.state} setState={props.setState} />
      <InventoryTabs activeTab={activeTab} onChange={setActiveTab} />
    </Box>
  );
}

function InventoryComparisonSidePanel(props: { anchor: { left: number; top: number } | null; compareEnabled: boolean; preview: InventoryPreview | null }) {
  if (!props.preview || !props.anchor) {
    return null;
  }
  return (
    <Box
      aria-live="polite"
      style={{
        left: props.anchor.left,
        maxHeight: `calc(100vh - ${props.anchor.top + INVENTORY_SIDE_PANEL_VIEWPORT_PADDING}px)`,
        overflow: "hidden",
        pointerEvents: "none",
        position: "fixed",
        top: props.anchor.top,
        transform: "translateX(0)",
        zIndex: 2200
      }}
    >
      <ItemComparisonDetails {...props.preview} compareEnabled={props.compareEnabled} />
    </Box>
  );
}

function useShiftKeyPressed() {
  const [shiftHeld, setShiftHeld] = useState(false);
  useEffect(() => {
    const updateFromKeyboard = (event: KeyboardEvent) => setShiftHeld(event.shiftKey);
    const clearShift = () => setShiftHeld(false);
    window.addEventListener("keydown", updateFromKeyboard);
    window.addEventListener("keyup", updateFromKeyboard);
    window.addEventListener("blur", clearShift);
    return () => {
      window.removeEventListener("keydown", updateFromKeyboard);
      window.removeEventListener("keyup", updateFromKeyboard);
      window.removeEventListener("blur", clearShift);
    };
  }, []);
  return shiftHeld;
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

function EquipmentSlotCell(props: { canDropDraggedItem: boolean; highlighted: boolean; item?: InventoryItem; layout: EquipmentSpriteLayout; onDropItem: (itemId: string) => void; onPreview: (preview: InventoryPreview | null) => void; onUnequip: () => void; slot: EquipmentSlot }) {
  const content = (
    <Box
      component="button"
      onClick={props.item ? (event: MouseEvent<HTMLButtonElement>) => {
        if (!event.shiftKey) {
          return;
        }
        event.preventDefault();
        props.onUnequip();
      } : undefined}
      onMouseEnter={() => props.item && props.onPreview({ equipped: true, item: props.item })}
      onMouseLeave={() => props.onPreview(null)}
      onDragOver={(event) => {
        if (!props.canDropDraggedItem) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        if (!props.canDropDraggedItem) {
          return;
        }
        const itemId = event.dataTransfer.getData("text/plain");
        if (!itemId) {
          return;
        }
        event.preventDefault();
        props.onDropItem(itemId);
        props.onPreview(null);
      }}
      style={{ backgroundColor: "transparent", backgroundImage: `url(${props.layout.asset})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", border: 0, boxShadow: props.highlighted ? "0 0 0 2px rgba(255, 242, 154, 0.9), 0 0 18px rgba(255, 225, 90, 0.55)" : "none", cursor: props.canDropDraggedItem ? "copy" : props.item ? "pointer" : "default", filter: props.highlighted ? "brightness(1.22)" : "none", height: props.layout.height, imageRendering: "pixelated", left: props.layout.left, outline: "none", padding: 0, position: "absolute", top: props.layout.top, width: props.layout.width, zIndex: props.highlighted ? 4 : 2 }}
      type="button"
    >
      {props.item ? (
        <Box style={{ alignItems: "center", display: "flex", height: "100%", justifyContent: "center", width: "100%" }}>
          <HeroSiegeEquipmentIcon item={props.item} size={props.layout.iconSize} unframed />
        </Box>
      ) : null}
    </Box>
  );
  return content;
}

function InventoryGrid(props: { activeTab: number; draggedItemId: string | null; onHoverItem: (preview: InventoryPreview | null) => void; onHoverSlot: (slot: EquipmentSlot | null) => void; state: StudyState; setDraggedItemId: (itemId: string | null) => void; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const [dropPreview, setDropPreview] = useState<InventoryDropPreview | null>(null);
  const placements = getAllInventoryPlacements(props.state.profile.inventory, props.state.profile.inventorySlots);
  const visiblePlacements = placements.filter((placement) => placement.tab === props.activeTab);
  const cells = Array.from({ length: INVENTORY_GRID_ROWS * INVENTORY_GRID_COLUMNS });
  const clearDragState = () => {
    props.setDraggedItemId(null);
    setDropPreview(null);
  };
  return (
    <Box
      onDragOver={(event) => {
        if (!props.draggedItemId) {
          return;
        }
        const draggedPlacement = placements.find((placement) => placement.item.id === props.draggedItemId);
        const position = getDropInventoryPosition(event.currentTarget, event, props.activeTab, draggedPlacement?.footprint);
        if (!position || !draggedPlacement) {
          setDropPreview(null);
          return;
        }
        const dropPosition = clampDropPreviewPosition(position, draggedPlacement.footprint);
        const valid = canMoveItemToPosition(props.draggedItemId, dropPosition, placements);
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
        const itemId = event.dataTransfer.getData("text/plain") || props.draggedItemId;
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
      style={{ display: "grid", gap: INVENTORY_GRID_GAP, gridTemplateColumns: `repeat(${INVENTORY_GRID_COLUMNS}, ${INVENTORY_GRID_CELL_SIZE}px)`, gridTemplateRows: `repeat(${INVENTORY_GRID_ROWS}, ${INVENTORY_GRID_CELL_SIZE}px)`, height: INVENTORY_GRID_HEIGHT, left: INVENTORY_GRID_LEFT, overflow: "hidden", position: "absolute", top: INVENTORY_GRID_TOP, width: INVENTORY_GRID_WIDTH }}
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
          equipped={isItemEquipped(props.state, placement.item)}
          item={placement.item}
          footprint={placement.footprint}
          isDragging={props.draggedItemId === placement.item.id}
          compareItem={getEquippedComparisonItem(props.state, placement.item)}
          onEquip={() => props.setState((previous) => equipItem(previous, placement.item.id))}
          onUnequip={() => props.setState((previous) => unequipItem(previous, getEquippedSlot(previous, placement.item) || placement.item.slot))}
          onSell={() => props.setState((previous) => sellItem(previous, placement.item.id))}
          onDragEnd={clearDragState}
          onDragStart={(itemId) => props.setDraggedItemId(itemId)}
          onHoverItem={props.onHoverItem}
          onHoverSlot={props.onHoverSlot}
          placement={placement}
          tooltipDisabled={props.draggedItemId !== null}
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

function InventoryItemCell(props: { canEquip: boolean; compareItem?: InventoryItem | null; equipped: boolean; footprint: ItemFootprint; isDragging: boolean; item: InventoryItem; onDragEnd: () => void; onDragStart: (itemId: string) => void; onEquip: () => void; onHoverItem: (preview: InventoryPreview | null) => void; onHoverSlot: (slot: EquipmentSlot | null) => void; onSell: () => void; onUnequip: () => void; placement: InventoryPlacement; tooltipDisabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  const action = props.equipped ? props.onUnequip : props.onEquip;
  const iconSize = getInventoryItemIconSize(props.footprint);
  const rarityColor = RARITY_COLORS[props.item.rarity];
  const stateGlow = props.equipped
    ? `0 0 10px color-mix(in srgb, ${rarityColor} 58%, transparent)`
    : hovered
      ? `0 0 8px color-mix(in srgb, ${rarityColor} 36%, transparent)`
      : "none";
  return (
    <Box
      draggable
      onDragEnd={props.onDragEnd}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", props.item.id);
        props.onDragStart(props.item.id);
        props.onHoverItem(null);
      }}
      onMouseEnter={() => {
        setHovered(true);
        props.onHoverSlot(props.item.slot);
        props.onHoverItem(props.tooltipDisabled ? null : { canEquip: props.canEquip, compareItem: props.compareItem, equipped: props.equipped, item: props.item });
      }}
      onMouseLeave={() => {
        setHovered(false);
        props.onHoverSlot(null);
        props.onHoverItem(null);
      }}
      style={{ gridColumn: `${props.placement.column + 1} / span ${props.footprint.columns}`, gridRow: `${props.placement.row + 1} / span ${props.footprint.rows}`, opacity: props.isDragging ? 0.42 : 1, position: "relative", zIndex: 5 }}
    >
      <Box
        aria-disabled={!props.equipped && !props.canEquip}
        component="button"
        onClick={(event) => {
          if (!event.shiftKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          if (props.equipped || props.canEquip) {
            action();
          }
        }}
        style={{
          alignItems: "center",
          backgroundColor: "#08080b",
          backgroundImage: ITEM_TILE_RARITY_BG[props.item.rarity],
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          border: 0,
          boxShadow: `${ITEM_TILE_INSET_SHADOW}, ${stateGlow}`,
          cursor: "grab",
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
        aria-label={`Sell ${props.item.name} for ${getItemSellValue(props.item)} gold`}
        color="yellow"
        disabled={props.equipped}
        onClick={(event) => {
          event.stopPropagation();
          props.onSell();
        }}
        size={DISCARD_BUTTON_SIZE}
        style={{ background: "rgba(31, 21, 4, 0.94)", border: "1px solid rgba(255, 222, 130, 0.68)", opacity: hovered && !props.equipped ? 1 : 0, pointerEvents: hovered && !props.equipped ? "auto" : "none", position: "absolute", right: 2, top: 2 }}
        variant="filled"
      >
        <IconCoins size={DISCARD_ICON_SIZE} />
      </ActionIcon>
    </Box>
  );
}

function isItemEquipped(state: StudyState, item: InventoryItem) {
  return Boolean(getEquippedSlot(state, item));
}

function getEquippedSlot(state: StudyState, item: InventoryItem): EquipmentSlot | null {
  return (Object.entries(state.profile.equipment).find(([, itemId]) => itemId === item.id)?.[0] as EquipmentSlot | undefined) || null;
}

function getEquippedComparisonItem(state: StudyState, item: InventoryItem) {
  const slot = getCompatibleInventorySlots(item).find((candidate) => state.profile.equipment[candidate]) || getCompatibleInventorySlots(item)[0];
  const equippedId = state.profile.equipment[slot];
  return state.profile.inventory.find((row) => row.id === equippedId) || null;
}

function isCompatibleSlotHighlight(sourceSlot: EquipmentSlot | null, targetSlot: EquipmentSlot) {
  if (!sourceSlot) {
    return false;
  }
  return getCompatibleInventorySlots({ slot: sourceSlot } as InventoryItem).includes(targetSlot);
}

function getCompatibleInventorySlots(item: InventoryItem) {
  if (item.slot === "eyewear" || item.slot === "ringTwo") {
    return ["eyewear", "ringTwo"] as EquipmentSlot[];
  }
  return [item.slot];
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
    if (!position) {
      continue;
    }
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
  return null;
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

function InventoryActions(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const sellableItems = getBulkSellItems(props.state);
  const sellValue = sellableItems.reduce((sum, item) => sum + getItemSellValue(item), 0);
  return (
    <>
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
      <HeroSiegeButton
        disabled={!sellableItems.length}
        onClick={() => {
          if (!sellableItems.length) {
            return;
          }
          const confirmed = window.confirm(`Sell ${sellableItems.length} unequipped item${sellableItems.length === 1 ? "" : "s"} from all inventory tabs for ${sellValue} gold?`);
          if (confirmed) {
            props.setState((previous) => bulkSellItems(previous, sellableItems.map((item) => item.id)));
          }
        }}
        width={BULK_SELL_BUTTON_WIDTH}
        height={SORT_BUTTON_HEIGHT}
        style={{
          opacity: sellableItems.length ? 1 : 0.5,
          position: "absolute",
          right: SORT_BUTTON_RIGHT + SORT_BUTTON_WIDTH + BULK_SELL_BUTTON_GAP,
          top: SORT_BUTTON_TOP,
          zIndex: 4
        }}
      >
        Bulk Sell
      </HeroSiegeButton>
    </>
  );
}

function getBulkSellItems(state: StudyState) {
  const equippedIds = new Set(Object.values(state.profile.equipment).filter(Boolean));
  return getAllInventoryPlacements(state.profile.inventory, state.profile.inventorySlots)
    .filter((placement) => !equippedIds.has(placement.item.id))
    .map((placement) => placement.item);
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

export function ItemSummary(props: { compact?: boolean; item: InventoryItem; large?: boolean; showIcon?: boolean }) {
  const nameSize = props.large ? "sm" : props.compact ? "10px" : "xs";
  const detailSize = props.large ? "12px" : "10px";
  return (
    <Group gap={props.compact ? COMPACT_SUMMARY_GAP : FULL_SUMMARY_GAP} wrap="nowrap" align="flex-start">
      {props.showIcon !== false && <ItemPixelIcon item={props.item} />}
      <Box style={{ minWidth: 0 }}>
        <Group gap={4} wrap="nowrap">
          <Text size={nameSize} fw={800} c={getHeroSiegeQualityColor(getItemQuality(props.item))} lineClamp={props.compact ? COMPACT_NAME_LINES : 1}>{props.item.name}</Text>
          {props.item.setId && <Badge size="xs" color="green" variant="light">set</Badge>}
        </Group>
        <Text size={detailSize} c="gray.4" lineClamp={1}>{formatItemStats(props.item)}</Text>
        {getItemEffectLine(props.item) ? <Text size={detailSize} c="blue.2" lineClamp={1}>{getItemEffectLine(props.item)}</Text> : null}
        <Text size={detailSize} c="dimmed" lineClamp={1}>{formatItemRequirements(props.item)}</Text>
      </Box>
    </Group>
  );
}

function ItemPixelIcon(props: { item: InventoryItem }) {
  return <HeroSiegeEquipmentIcon item={props.item} size={ITEM_ICON_SIZE} />;
}

export function InventoryItemTooltip(props: { canEquip?: boolean; children: React.ReactNode; compareItem?: InventoryItem | null; disabled?: boolean; equipped?: boolean; item: InventoryItem; offset?: number; showRollRanges?: boolean }) {
  const shiftHeld = useShiftKeyPressed();
  const [pointerShiftHeld, setPointerShiftHeld] = useState(false);
  const compareEnabled = shiftHeld || pointerShiftHeld;
  return (
    <Tooltip
      disabled={props.disabled}
      label={<ItemComparisonDetails canEquip={props.canEquip} compareEnabled={compareEnabled} compareItem={props.compareItem} equipped={props.equipped} item={props.item} showRollRanges={props.showRollRanges} />}
      multiline
      withArrow
      color="dark"
      offset={props.offset ?? 14}
      position="right"
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
      <Box
        onMouseEnter={(event) => setPointerShiftHeld(event.shiftKey)}
        onMouseLeave={() => setPointerShiftHeld(false)}
        onMouseMove={(event) => setPointerShiftHeld(event.shiftKey)}
      >
        {props.children}
      </Box>
    </Tooltip>
  );
}

function ItemComparisonDetails(props: { canEquip?: boolean; compareEnabled?: boolean; compareItem?: InventoryItem | null; equipped?: boolean; item: InventoryItem; showRollRanges?: boolean }) {
  if (props.compareEnabled && props.compareItem && !props.equipped) {
    return (
      <Group align="flex-start" gap={DETAILS_COMPARE_GAP} wrap="nowrap">
        <ItemDetails canEquip={props.canEquip} item={props.item} showRollRanges={props.showRollRanges} titlePrefix="New" />
        <ItemDetails equipped item={props.compareItem} showRollRanges={props.showRollRanges} titlePrefix="Equipped" />
      </Group>
    );
  }
  return <ItemDetails canEquip={props.canEquip} compareAvailable={Boolean(props.compareItem && !props.equipped)} equipped={props.equipped} item={props.item} showRollRanges={props.showRollRanges} />;
}

function ItemDetails(props: { canEquip?: boolean; compareAvailable?: boolean; equipped?: boolean; item: InventoryItem; showRollRanges?: boolean; titlePrefix?: string }) {
  const baseName = getBaseItemName(props.item);
  const powerProfile = SLOT_POWER_PROFILES[props.item.slot];
  const level = props.item.requirements.level;
  const showRollRanges = props.showRollRanges !== false;
  const rollSeed = props.item.id;
  const damageRange = powerProfile.damage ? getScaledPowerRange(powerProfile.damage, level, ITEM_DAMAGE_LEVEL_FACTOR, ITEM_DAMAGE_SPREAD) : null;
  const defenseRange = powerProfile.defense ? getScaledPowerRange(powerProfile.defense, level, ITEM_ARMOR_LEVEL_FACTOR, ITEM_ARMOR_SPREAD) : null;
  return (
    <Stack gap={8} style={{ background: DETAILS_BG, border: DETAILS_BORDER, boxShadow: DETAILS_SHADOW, color: "#f1dfad", padding: DETAILS_PADDING, textAlign: "center", width: DETAILS_SHEET_WIDTH }}>
      <Box>
        {props.titlePrefix && <Text size="xs" fw={900} c={props.equipped ? "yellow.3" : "green.3"} tt="uppercase">{props.titlePrefix}</Text>}
        <Text size="lg" fw={900} tt="uppercase" style={{ color: getHeroSiegeQualityColor(getItemQuality(props.item)), letterSpacing: 0, textShadow: "0 2px 0 #000" }}>
          {props.item.name}
        </Text>
        <Text size="sm" fw={800} c="gray.2">{baseName}</Text>
        {(props.item.wikiRarityLabel || props.item.wikiCategory) && (
          <Text size="xs" fw={800} c="gray.4">{formatWikiItemSubtitle(props.item)}</Text>
        )}
      </Box>
      {props.item.wikiDamage || props.item.wikiAps || props.item.wikiDps ? (
        <Group justify="center" gap={8}>
          {props.item.wikiDamage && <Text size="sm" fw={900} c="gray.1">Damage: <Box component="span" c="#6f6ff6">{showRollRanges ? props.item.wikiDamage : formatRolledValue(props.item.wikiDamage, `${rollSeed}:wiki-damage`)}</Box></Text>}
          {props.item.wikiAps && <Text size="sm" fw={900} c="gray.1">APS: <Box component="span" c="#6f6ff6">{props.item.wikiAps}</Box></Text>}
          {props.item.wikiDps && <Text size="sm" fw={900} c="gray.1">DPS: <Box component="span" c="#6f6ff6">{showRollRanges ? props.item.wikiDps : formatRolledValue(props.item.wikiDps, `${rollSeed}:wiki-dps`)}</Box></Text>}
        </Group>
      ) : null}
      {damageRange && (
        <TooltipPowerRow label="Attack Damage" showRollRange={showRollRanges} value={showRollRanges ? `${damageRange.min}-${damageRange.max}` : getRolledRangeValue(damageRange, `${rollSeed}:attack-damage`)} range={damageRange} />
      )}
      {defenseRange && (
        <TooltipPowerRow label={props.item.slot === "offHand" ? "Block Armor" : "Armor"} showRollRange={showRollRanges} value={showRollRanges ? defenseRange.average : getRolledRangeValue(defenseRange, `${rollSeed}:defense`)} range={defenseRange} />
      )}
      {props.item.modifiers?.length ? (
        <Stack gap={2}>
          {props.item.modifiers.map((modifier) => {
            const details = MODIFIER_DETAILS[modifier.key];
            if (!details) {
              return null;
            }
            const range = getScaledModifierRange(details.range, level);
            return <TooltipAffixLine key={modifier.key} color={details.color} showRollRange={showRollRanges} text={details.label(modifier.value)} range={range} />;
          })}
        </Stack>
      ) : null}
      {props.item.wikiStats?.length ? (
        <Stack gap={2}>
          {props.item.wikiStats.slice(0, 8).map((stat, index) => (
            <Text key={`${stat}-${index}`} size="sm" fw={900} style={{ color: "#73a7ff", lineHeight: 1.18, textShadow: "0 1px 0 #000" }}>{showRollRanges ? stat : formatRolledValue(stat, `${rollSeed}:wiki-stat:${index}`)}</Text>
          ))}
        </Stack>
      ) : null}
      {props.item.flavorText && <Text size="xs" fs="italic" c="gray.3">{props.item.flavorText}</Text>}
      <Stack gap={2}>
        {Object.entries(props.item.stats).filter(([, value]) => value).map(([key, value]) => {
          const stat = key as keyof typeof STAT_DISPLAY_NAMES;
          return <TooltipAffixLine key={key} color="#6f6ff6" showRollRange={showRollRanges} text={`+${value} to ${STAT_DISPLAY_NAMES[stat]}`} range={getStatRollRange(props.item)} />;
        })}
      </Stack>
      <Box mt={2} style={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr", textAlign: "left" }}>
        <Text size="xs" fw={900} c="gray.1">[{EQUIPMENT_SLOT_LABELS[props.item.slot]}]</Text>
        <Text size="xs" fw={900} c="gray.1" ta="right">[{powerProfile.tier}]</Text>
        <Text size="xs" fw={900} c="gray.1">Level Req. {props.item.requirements.level}</Text>
        <Text size="xs" fw={900} c="gray.1" ta="right">Rarity: {getItemQuality(props.item)}</Text>
        {Object.entries(props.item.requirements.stats).filter(([, value]) => value).map(([key, value]) => (
          <Text key={key} size="xs" fw={900} c="gray.1" style={{ gridColumn: "1 / -1" }}>{STAT_DISPLAY_NAMES[key as keyof typeof STAT_DISPLAY_NAMES]} Req. {value}</Text>
        ))}
      </Box>
      <Group gap={4} justify="center">
        {props.item.setId && <Badge size="xs" color="green" variant="light">set</Badge>}
        {props.equipped && <Badge size="xs" color="yellow" variant="light">equipped</Badge>}
        {!props.equipped && props.canEquip === false && <Badge size="xs" color="red" variant="light">locked</Badge>}
      </Group>
      <Stack gap={2} mt={2}>
        {(props.equipped || props.canEquip === true) && (
          <Text size="10px" fw={700} c="dimmed" opacity={0.62} tt="uppercase">Shift + Left Click to {props.equipped ? "Unequip" : "Equip"}</Text>
        )}
        {props.compareAvailable && <Text size="10px" fw={700} c="dimmed" opacity={0.62} tt="uppercase">Hold Shift to Compare</Text>}
      </Stack>
    </Stack>
  );
}

function TooltipPowerRow(props: { label: string; range: { average: number; max: number; min: number }; showRollRange?: boolean; value: React.ReactNode }) {
  return (
    <Group justify="center" gap={8} wrap="nowrap">
      <Text size="sm" fw={900} c="gray.1">{props.label}:</Text>
      <Text size="sm" fw={900} c="#6f6ff6">{props.value}</Text>
      {props.showRollRange !== false && <Text size="sm" fw={900} c="#20e020">[{props.range.min}-{props.range.max}]</Text>}
    </Group>
  );
}

function TooltipAffixLine(props: { color: string; range: { max: number; min: number }; showRollRange?: boolean; text: string }) {
  return (
    <Text size="sm" fw={900} style={{ color: props.color, lineHeight: 1.18, textShadow: "0 1px 0 #000" }}>
      {props.text}{props.showRollRange !== false && <Box component="span" c="#20e020"> [{props.range.min}-{props.range.max}]</Box>}
    </Text>
  );
}

function formatRolledValue(value: string, seed: string) {
  return value.replace(/(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)/g, (_match, min: string, max: string) => {
    const rolled = rollNumberBetween(Number(min), Number(max), `${seed}:${min}:${max}`);
    return Number.isInteger(rolled) ? String(rolled) : rolled.toFixed(1);
  });
}

function getRolledRangeValue(range: { max: number; min: number }, seed: string) {
  return rollNumberBetween(range.min, range.max, seed);
}

function rollNumberBetween(min: number, max: number, seed: string) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return min || 0;
  }
  if (min === max) {
    return min;
  }
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const roll = getTooltipSeedRoll(seed);
  if (Number.isInteger(low) && Number.isInteger(high)) {
    return low + Math.floor(roll * (high - low + 1));
  }
  return low + roll * (high - low);
}

function getTooltipSeedRoll(seed: string) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function formatItemRequirements(item: InventoryItem) {
  const statRequirements = Object.entries(item.requirements.stats)
    .filter(([, value]) => value)
    .map(([key, value]) => `${STAT_LABELS[key as keyof typeof STAT_LABELS]} ${value}`)
    .join(", ");
  return statRequirements ? `Lvl ${item.requirements.level}, ${statRequirements}` : `Lvl ${item.requirements.level}`;
}

function formatItemStats(item: InventoryItem) {
  if (item.wikiRarityLabel || item.wikiCategory) {
    return formatWikiItemSubtitle(item);
  }
  return formatStats(item.stats);
}

function formatWikiItemSubtitle(item: InventoryItem) {
  return `${getItemQuality(item)} ${item.wikiCategory || EQUIPMENT_SLOT_LABELS[item.slot]}`;
}

function formatItemModifiers(item: InventoryItem) {
  return (item.modifiers || []).map((modifier) => MODIFIER_FORMATTERS[modifier.key]?.(modifier.value) || "").filter(Boolean).join(", ");
}

function getItemEffectLine(item: InventoryItem) {
  return item.wikiStats?.[0] || formatItemModifiers(item);
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

function formatStats(stats: InventoryItem["stats"]) {
  return Object.entries(stats)
    .filter(([, value]) => value)
    .map(([key, value]) => `${STAT_LABELS[key as keyof typeof STAT_LABELS]} +${value}`)
    .join(", ");
}
