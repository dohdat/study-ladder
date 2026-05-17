import { Badge, Box, Button, Group, Stack, Text } from "@mantine/core";

import { canEquipItem, EQUIPMENT_SLOT_LABELS, equipItem, getActiveSetBonuses, unequipItem } from "../lib/studyCore";
import type { EquipmentSlot, InventoryItem, ItemModifierKey, StudyState } from "../types/study";

const STAT_LABELS = {
  constitution: "CON",
  intelligence: "INT",
  perception: "PER",
  strength: "STR"
} as const;

const RARITY_COLORS = {
  common: "#b8b8b8",
  epic: "#b46cff",
  legendary: "#d6a94b",
  rare: "#5fa8ff",
  uncommon: "#40c057"
} as const;
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

const INVENTORY_CELL_COUNT = 40;
const COMPACT_NAME_LINES = 2;
const PANEL_BG = "radial-gradient(circle at 50% 20%, #36332c 0%, #1b1a17 48%, #090909 100%)";
const SLOT_BG = "linear-gradient(145deg, #090909, #24211c)";
const SLOT_BORDER = "1px solid #7b6845";
const SLOT_SHADOW = "inset 0 0 0 1px #050505, 0 1px 4px rgba(0, 0, 0, 0.45)";
const EMPTY_SLOT_COLOR = "#95886c";
const PAPER_DOLL_COLUMNS = "94px 64px 104px 64px 94px";
const PAPER_DOLL_ROW_HEIGHT = 64;
const PAPER_DOLL_GAP = 8;
const SMALL_SLOT_HEIGHT = 64;
const LARGE_SLOT_HEIGHT = 136;
const INVENTORY_GRID_COLUMNS = 8;
const INVENTORY_GRID_GAP = 4;
const BOARD_MAX_WIDTH = 480;
const ITEM_ICON_SIZE = 34;
const ITEM_ICON_GRID = 8;
const ITEM_ICON_CELL = 1;
const ITEM_ICON_VIEWBOX = `0 0 ${ITEM_ICON_GRID} ${ITEM_ICON_GRID}`;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const COMPACT_SUMMARY_GAP = 3;
const FULL_SUMMARY_GAP = 6;
const EVEN_DIVISOR = 2;
const COLOR_VARIANT_DIVISOR = 3;
const LIGHT_VARIANT_DIVISOR = 5;

const EQUIPMENT_LAYOUT: Record<EquipmentSlot, { gridColumn: string; gridRow: string; minHeight: number; title: string }> = {
  armor: { gridColumn: "3 / 4", gridRow: "2 / 4", minHeight: LARGE_SLOT_HEIGHT, title: "Armor" },
  backAccessory: { gridColumn: "3 / 4", gridRow: "4 / 5", minHeight: SMALL_SLOT_HEIGHT, title: "Belt / Back" },
  bodyAccessory: { gridColumn: "1 / 2", gridRow: "4 / 5", minHeight: SMALL_SLOT_HEIGHT, title: "Hands" },
  eyewear: { gridColumn: "4 / 5", gridRow: "3 / 4", minHeight: SMALL_SLOT_HEIGHT, title: "Ring / Eye" },
  feet: { gridColumn: "5 / 6", gridRow: "4 / 5", minHeight: SMALL_SLOT_HEIGHT, title: "Boots" },
  headAccessory: { gridColumn: "2 / 3", gridRow: "3 / 4", minHeight: SMALL_SLOT_HEIGHT, title: "Amulet" },
  headgear: { gridColumn: "3 / 4", gridRow: "1 / 2", minHeight: PAPER_DOLL_ROW_HEIGHT, title: "Helm" },
  mainHand: { gridColumn: "1 / 2", gridRow: "1 / 4", minHeight: LARGE_SLOT_HEIGHT, title: "Left Hand" },
  offHand: { gridColumn: "5 / 6", gridRow: "1 / 4", minHeight: LARGE_SLOT_HEIGHT, title: "Right Hand" }
};

export function InventoryPanel(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const activeSetBonuses = getActiveSetBonuses(props.state);
  return (
    <Stack gap="sm">
      <Box p="sm" style={{ background: PANEL_BG, border: "2px solid #8a744c", boxShadow: "inset 0 0 0 2px #111" }}>
        <Text ta="center" mb="xs" size="sm" fw={800} c="#c8a96a" style={{ letterSpacing: 3 }}>INVENTORY</Text>
        <EquipmentBoard state={props.state} setState={props.setState} />
        {activeSetBonuses.length > 0 && (
          <Stack gap={2} mt="sm">
            {activeSetBonuses.map((set) => (
              <Text key={set.id} size="xs" c="green.3">{set.name} ({set.count}/{set.total}) - {set.bonuses.map((bonus) => `${bonus.pieces}pc ${formatStats(bonus.stats)}`).join("; ") || "No active bonus yet"}</Text>
            ))}
          </Stack>
        )}
        <InventoryGrid state={props.state} setState={props.setState} />
      </Box>
    </Stack>
  );
}

function EquipmentBoard(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return (
    <Box mx="auto" style={{ display: "grid", gap: PAPER_DOLL_GAP, gridTemplateColumns: PAPER_DOLL_COLUMNS, gridTemplateRows: `repeat(4, ${PAPER_DOLL_ROW_HEIGHT}px)`, maxWidth: BOARD_MAX_WIDTH }}>
      {Object.entries(EQUIPMENT_LAYOUT).map(([slotKey, layout]) => {
        const slot = slotKey as EquipmentSlot;
        const item = props.state.profile.inventory.find((row) => row.id === props.state.profile.equipment[slot]);
        return <EquipmentSlotCell key={slot} item={item} layout={layout} slot={slot} onUnequip={() => props.setState((previous) => unequipItem(previous, slot))} />;
      })}
    </Box>
  );
}

function EquipmentSlotCell(props: { item?: InventoryItem; layout: (typeof EQUIPMENT_LAYOUT)[EquipmentSlot]; onUnequip: () => void; slot: EquipmentSlot }) {
  return (
    <Box p="xs" mih={props.layout.minHeight} style={{ background: SLOT_BG, border: SLOT_BORDER, boxShadow: SLOT_SHADOW, gridColumn: props.layout.gridColumn, gridRow: props.layout.gridRow, overflow: "hidden" }}>
      <Text size="10px" c="dimmed" fw={700}>{props.layout.title || EQUIPMENT_SLOT_LABELS[props.slot]}</Text>
      {props.item ? (
        <Stack gap={4} mt={4}>
          <ItemSummary item={props.item} />
          <Button size="compact-xs" variant="subtle" color="gray" onClick={props.onUnequip}>Unequip</Button>
        </Stack>
      ) : <Text size="xs" c={EMPTY_SLOT_COLOR} mt="xs">Empty</Text>}
    </Box>
  );
}

function InventoryGrid(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const cells = Array.from({ length: Math.max(INVENTORY_CELL_COUNT, props.state.profile.inventory.length) }, (_, index) => props.state.profile.inventory[index]);
  return (
    <Box mt="sm">
      <Text size="xs" c="dimmed" fw={700} mb={4}>Inventory</Text>
      <Box style={{ display: "grid", gap: INVENTORY_GRID_GAP, gridTemplateColumns: `repeat(${INVENTORY_GRID_COLUMNS}, minmax(0, 1fr))` }}>
        {cells.map((item, index) => (
          <InventoryCell key={item?.id || index} canEquip={item ? canEquipItem(props.state, item) : false} equipped={item ? props.state.profile.equipment[item.slot] === item.id : false} item={item} onEquip={() => item && props.setState((previous) => equipItem(previous, item.id))} onUnequip={() => item && props.setState((previous) => unequipItem(previous, item.slot))} />
        ))}
      </Box>
    </Box>
  );
}

function InventoryCell(props: { canEquip: boolean; equipped: boolean; item?: InventoryItem; onEquip: () => void; onUnequip: () => void }) {
  if (!props.item) {
    return <Box style={{ aspectRatio: "1 / 1", background: "#090909", border: "1px solid #3d3527" }} />;
  }
  return (
    <Box p={4} style={{ aspectRatio: "1 / 1", background: "#111", border: `1px solid ${RARITY_COLORS[props.item.rarity]}`, overflow: "hidden" }}>
      <ItemSummary item={props.item} compact />
      <Button fullWidth mt={3} size="compact-xs" variant={props.equipped ? "subtle" : "light"} disabled={!props.equipped && !props.canEquip} onClick={props.equipped ? props.onUnequip : props.onEquip}>
        {props.equipped ? "Unequip" : "Wear"}
      </Button>
    </Box>
  );
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
  const colors = getItemIconColors(props.item);
  return (
    <Box aria-hidden="true" style={{ background: "#050505", border: `1px solid ${RARITY_COLORS[props.item.rarity]}`, flex: `0 0 ${ITEM_ICON_SIZE}px`, height: ITEM_ICON_SIZE, width: ITEM_ICON_SIZE }}>
      <svg viewBox={ITEM_ICON_VIEWBOX} width={ITEM_ICON_SIZE} height={ITEM_ICON_SIZE} shapeRendering="crispEdges">
        {getItemIconPixels(props.item.slot).flatMap((row, y) => [...row].map((pixel, x) => pixel === "." ? null : <rect key={`${props.item.id}-${x}-${y}`} x={x} y={y} width={ITEM_ICON_CELL} height={ITEM_ICON_CELL} fill={colors[pixel as keyof typeof colors]} />))}
      </svg>
    </Box>
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

function getItemIconColors(item: InventoryItem) {
  const roll = hashString(item.id);
  const accent = RARITY_COLORS[item.rarity];
  const dark = roll % EVEN_DIVISOR === 0 ? "#16110c" : "#101626";
  const mid = getMidItemIconColor(roll);
  const light = roll % LIGHT_VARIANT_DIVISOR === 0 ? "#f8e7b1" : "#d8d1bf";
  return { a: dark, b: mid, c: light, d: accent };
}

function getMidItemIconColor(roll: number) {
  const variant = roll % COLOR_VARIANT_DIVISOR;
  if (variant === 0) {
    return "#8f6b3d";
  }
  return variant === 1 ? "#6b7280" : "#4f7d5a";
}

function getItemIconPixels(slot: EquipmentSlot) {
  const pixels: Record<EquipmentSlot, string[]> = {
    armor: ["..dd....", ".dbbd...", "dbbbbd..", "dbccbd..", ".bbbb...", ".bbbb...", ".b..b...", "........"],
    backAccessory: ["..dd....", ".dbbd...", "dbccbd..", ".bbbb...", "..bb....", "..bb....", ".b..b...", "........"],
    bodyAccessory: [".dd..dd.", "dbb..bbd", ".bbccbb.", ".bbbbbb.", "..bbbb..", "..b..b..", "........", "........"],
    eyewear: ["........", "..dd.dd.", ".dbbdbbd", "..dd.dd.", "........", "........", "........", "........"],
    feet: ["........", "..dd....", ".dbbd...", ".bbbd...", ".bbbddd.", ".bbbbbd.", "........", "........"],
    headAccessory: ["..dd....", ".dccd...", "dccccd..", ".dccd...", "..dd....", "........", "........", "........"],
    headgear: ["..dddd..", ".dbbbd..", "dbcccbd.", "dbbbbbd.", ".d....d.", "........", "........", "........"],
    mainHand: ["....dd..", "...dbd..", "..dbd...", ".dbd....", "dbd.....", ".b......", "b.......", "........"],
    offHand: ["..dddd..", ".dbbbd..", "dbcccbd.", "dbcccbd.", ".dbbbd..", "..dddd..", "........", "........"]
  };
  return pixels[slot];
}

function hashString(value: string) {
  let hash = HASH_SEED;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return hash >>> 0;
}
