import { Badge, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
type StaticImageData = string;

import { HERO_ITEM_RARITY_COLORS, HeroSiegeEquipmentIcon } from "./HeroSiegeItemIcon";
import { canEquipItem, EQUIPMENT_SLOT_LABELS, equipItem, getActiveSetBonuses, unequipItem } from "../lib/studyCore";
import type { EquipmentSlot, InventoryItem, ItemModifierKey, StudyState } from "../types/study";
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
import menuButtonBg from "../assets/hero_siege_inventory/menu-button.png";
import tabExtraBg from "../assets/hero_siege_inventory/tab-extra.png";
import tabMainBg from "../assets/hero_siege_inventory/tab-main.png";
import tabSmallBg from "../assets/hero_siege_inventory/tab-small.png";

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

const INVENTORY_CELL_COUNT = 50;
const COMPACT_NAME_LINES = 2;
const INVENTORY_PANEL_WIDTH = 534;
const INVENTORY_PANEL_HEIGHT = 720;
const SMALL_EQUIPPED_ICON_SIZE = 34;
const MEDIUM_EQUIPPED_ICON_SIZE = 52;
const LARGE_EQUIPPED_ICON_SIZE = 76;
const INVENTORY_GRID_COLUMNS = 12;
const INVENTORY_GRID_GAP = 4;
const INVENTORY_GRID_LEFT = 44;
const INVENTORY_GRID_TOP = 430;
const INVENTORY_GRID_CELL_SIZE = 32;
const INVENTORY_GRID_WIDTH = 428;
const SORT_BUTTON_WIDTH = 180;
const SORT_BUTTON_HEIGHT = 35;
const SORT_BUTTON_RIGHT = 24;
const SORT_BUTTON_TOP = 632;
const TAB_ROW_LEFT = 154;
const TAB_ROW_TOP = 676;
const TAB_GAP = 4;
const TAB_MAIN_WIDTH = 96;
const TAB_EXTRA_WIDTH = 76;
const TAB_HEIGHT = 33;
const TAB_SMALL_WIDTH = 48;
const ITEM_ICON_SIZE = 32;
const INVENTORY_ITEM_ICON_SIZE = 28;
const LOCKED_ITEM_OPACITY = 0.52;
const DETAILS_WIDTH = 260;
const DETAILS_BG = "linear-gradient(180deg, rgba(35, 13, 13, 0.98), rgba(9, 6, 5, 0.99))";
const DETAILS_BORDER = "1px solid #9f2d4e";
const DETAILS_SHADOW = "inset 0 0 0 1px rgba(0, 0, 0, 0.86), 0 12px 28px rgba(0, 0, 0, 0.62)";
const DETAILS_PADDING = 10;
const COMPACT_SUMMARY_GAP = 3;
const FULL_SUMMARY_GAP = 6;

type EquipmentSpriteLayout = { asset: StaticImageData; height: number; iconSize: number; label: string; left: number; top: number; width: number };

const EQUIPMENT_LAYOUT: Record<EquipmentSlot, EquipmentSpriteLayout> = {
  armor: { asset: inventorySlotArmorBg, height: 99, iconSize: LARGE_EQUIPPED_ICON_SIZE, label: "Armor", left: 234, top: 220, width: 66 },
  backAccessory: { asset: inventorySlotBeltBg, height: 35, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Belt", left: 234, top: 353, width: 66 },
  bodyAccessory: { asset: inventorySlotGlovesBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Gloves", left: 84, top: 320, width: 66 },
  eyewear: { asset: inventorySlotRingBg, height: 35, iconSize: SMALL_EQUIPPED_ICON_SIZE, label: "Ring", left: 366, top: 320, width: 34 },
  feet: { asset: inventorySlotBootsBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Boots", left: 382, top: 352, width: 66 },
  headAccessory: { asset: inventorySlotAmuletBg, height: 35, iconSize: SMALL_EQUIPPED_ICON_SIZE, label: "Amulet", left: 134, top: 320, width: 34 },
  headgear: { asset: inventorySlotHelmetBg, height: 67, iconSize: MEDIUM_EQUIPPED_ICON_SIZE, label: "Helmet", left: 234, top: 102, width: 66 },
  mainHand: { asset: inventorySlotWeaponBg, height: 131, iconSize: LARGE_EQUIPPED_ICON_SIZE, label: "Weapon", left: 92, top: 176, width: 98 },
  offHand: { asset: inventorySlotShieldBg, height: 131, iconSize: LARGE_EQUIPPED_ICON_SIZE, label: "Shield", left: 344, top: 176, width: 98 }
};

const TAB_BUTTONS = [
  { asset: tabMainBg, label: "Main", width: TAB_MAIN_WIDTH },
  { asset: tabExtraBg, label: "Extra", width: TAB_EXTRA_WIDTH },
  { asset: tabExtraBg, label: "Extra", width: TAB_EXTRA_WIDTH },
  { asset: tabSmallBg, label: "Extra +", width: TAB_SMALL_WIDTH }
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
  return (
    <Box style={{ backgroundImage: `url(${inventoryGamepadBg})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", height: INVENTORY_PANEL_HEIGHT, imageRendering: "pixelated", position: "relative", width: INVENTORY_PANEL_WIDTH }}>
      {Object.entries(EQUIPMENT_LAYOUT).map(([slotKey, layout]) => {
        const slot = slotKey as EquipmentSlot;
        const item = props.state.profile.inventory.find((row) => row.id === props.state.profile.equipment[slot]);
        return <EquipmentSlotCell key={slot} item={item} layout={layout} slot={slot} onUnequip={() => props.setState((previous) => unequipItem(previous, slot))} />;
      })}
      <InventoryGrid state={props.state} setState={props.setState} />
      <InventorySortButton setState={props.setState} />
      <InventoryTabs />
    </Box>
  );
}

function EquipmentSlotCell(props: { item?: InventoryItem; layout: EquipmentSpriteLayout; onUnequip: () => void; slot: EquipmentSlot }) {
  const content = (
    <Box component={props.item ? "button" : "div"} onClick={props.item ? props.onUnequip : undefined} style={{ backgroundColor: "transparent", backgroundImage: `url(${props.layout.asset})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", border: "none", cursor: props.item ? "pointer" : "default", height: props.layout.height, imageRendering: "pixelated", left: props.layout.left, padding: 0, position: "absolute", top: props.layout.top, width: props.layout.width }}>
      {props.item ? (
        <Box style={{ alignItems: "center", display: "flex", height: "100%", justifyContent: "center", width: "100%" }}>
          <HeroSiegeEquipmentIcon item={props.item} size={props.layout.iconSize} />
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

function InventoryGrid(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const cells = Array.from({ length: Math.max(INVENTORY_CELL_COUNT, props.state.profile.inventory.length) }, (_, index) => props.state.profile.inventory[index]);
  return (
    <Box style={{ display: "grid", gap: INVENTORY_GRID_GAP, gridTemplateColumns: `repeat(${INVENTORY_GRID_COLUMNS}, ${INVENTORY_GRID_CELL_SIZE}px)`, left: INVENTORY_GRID_LEFT, position: "absolute", top: INVENTORY_GRID_TOP, width: INVENTORY_GRID_WIDTH }}>
      {cells.map((item, index) => (
        <InventoryCell key={item?.id || index} canEquip={item ? canEquipItem(props.state, item) : false} equipped={item ? props.state.profile.equipment[item.slot] === item.id : false} item={item} onEquip={() => item && props.setState((previous) => equipItem(previous, item.id))} onUnequip={() => item && props.setState((previous) => unequipItem(previous, item.slot))} />
      ))}
    </Box>
  );
}

function InventoryCell(props: { canEquip: boolean; equipped: boolean; item?: InventoryItem; onEquip: () => void; onUnequip: () => void }) {
  if (!props.item) {
    return <Box style={{ backgroundImage: `url(${inventoryGridBg})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", height: INVENTORY_GRID_CELL_SIZE, imageRendering: "pixelated", width: INVENTORY_GRID_CELL_SIZE }} />;
  }
  const action = props.equipped ? props.onUnequip : props.onEquip;
  return (
    <InventoryItemTooltip canEquip={props.canEquip} equipped={props.equipped} item={props.item}>
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
          backgroundImage: `url(${inventoryGridBg})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          border: "none",
          cursor: props.equipped || props.canEquip ? "pointer" : "default",
          display: "flex",
          height: INVENTORY_GRID_CELL_SIZE,
          imageRendering: "pixelated",
          justifyContent: "center",
          opacity: props.equipped || props.canEquip ? 1 : LOCKED_ITEM_OPACITY,
          padding: 0,
          width: INVENTORY_GRID_CELL_SIZE
        }}
        type="button"
      >
        <HeroSiegeEquipmentIcon item={props.item} size={INVENTORY_ITEM_ICON_SIZE} />
      </Box>
    </InventoryItemTooltip>
  );
}

function InventorySortButton(props: { setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return (
    <Box
      component="button"
      onClick={() => props.setState(sortInventory)}
      style={{
        backgroundColor: "transparent",
        backgroundImage: `url(${menuButtonBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        border: 0,
        cursor: "pointer",
        height: SORT_BUTTON_HEIGHT,
        imageRendering: "pixelated",
        padding: 0,
        position: "absolute",
        right: SORT_BUTTON_RIGHT,
        top: SORT_BUTTON_TOP,
        width: SORT_BUTTON_WIDTH
      }}
      type="button"
    >
      <Text size="sm" fw={900} ta="center" style={{ color: "#e8d684", lineHeight: `${SORT_BUTTON_HEIGHT}px`, textShadow: "0 1px 0 #000" }}>Sort Tab</Text>
    </Box>
  );
}

function InventoryTabs() {
  return (
    <Group gap={TAB_GAP} wrap="nowrap" style={{ left: TAB_ROW_LEFT, position: "absolute", top: TAB_ROW_TOP }}>
      {TAB_BUTTONS.map((tab, index) => (
        <Box key={`${tab.label}-${index}`} component="button" style={{ backgroundColor: "transparent", backgroundImage: `url(${tab.asset})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", border: 0, cursor: index === 0 ? "pointer" : "default", height: TAB_HEIGHT, imageRendering: "pixelated", padding: 0, width: tab.width }} type="button">
          <Text size="sm" fw={900} ta="center" style={{ color: "#d6d18f", lineHeight: `${TAB_HEIGHT}px`, textShadow: "0 1px 0 #000" }}>{tab.label}</Text>
        </Box>
      ))}
    </Group>
  );
}

function sortInventory(state: StudyState): StudyState {
  return {
    ...state,
    profile: {
      ...state.profile,
      inventory: [...state.profile.inventory].sort(compareInventoryItems(state))
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

function InventoryItemTooltip(props: { canEquip?: boolean; children: React.ReactNode; equipped?: boolean; item: InventoryItem }) {
  return (
    <Tooltip
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
  return (
    <Stack gap={4} style={{ width: DETAILS_WIDTH }}>
      <Group gap="xs" wrap="nowrap">
        <HeroSiegeEquipmentIcon item={props.item} size={INVENTORY_ITEM_ICON_SIZE} />
        <Box style={{ minWidth: 0 }}>
          <Text size="sm" fw={900} c={RARITY_COLORS[props.item.rarity]}>{props.item.name}</Text>
          <Text size="xs" c="dimmed">{EQUIPMENT_SLOT_LABELS[props.item.slot]} - {props.item.rarity}</Text>
        </Box>
      </Group>
      <Text size="xs" c="gray.3">{formatItemStats(props.item) || "No stat bonus"}</Text>
      {props.item.modifiers?.length ? <Text size="xs" c="blue.2">{formatItemModifiers(props.item)}</Text> : null}
      <Text size="xs" c="dimmed">{formatItemRequirements(props.item)}</Text>
      <Group gap={4}>
        {props.item.setId && <Badge size="xs" color="green" variant="light">set</Badge>}
        {props.equipped && <Badge size="xs" color="yellow" variant="light">equipped</Badge>}
        {!props.equipped && props.canEquip === false && <Badge size="xs" color="red" variant="light">locked</Badge>}
      </Group>
    </Stack>
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

function formatStats(stats: InventoryItem["stats"]) {
  return Object.entries(stats)
    .filter(([, value]) => value)
    .map(([key, value]) => `${STAT_LABELS[key as keyof typeof STAT_LABELS]} +${value}`)
    .join(", ");
}
