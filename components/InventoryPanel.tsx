import { Badge, Box, Button, Group, Stack, Text } from "@mantine/core";

import { canEquipItem, EQUIPMENT_SLOT_LABELS, equipItem, getActiveSetBonuses } from "../lib/studyCore";
import type { EquipmentSlot, InventoryItem, StudyState } from "../types/study";

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
        <EquipmentBoard state={props.state} />
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

function EquipmentBoard(props: { state: StudyState }) {
  return (
    <Box mx="auto" style={{ display: "grid", gap: PAPER_DOLL_GAP, gridTemplateColumns: PAPER_DOLL_COLUMNS, gridTemplateRows: `repeat(4, ${PAPER_DOLL_ROW_HEIGHT}px)`, maxWidth: BOARD_MAX_WIDTH }}>
      {Object.entries(EQUIPMENT_LAYOUT).map(([slotKey, layout]) => {
        const slot = slotKey as EquipmentSlot;
        const item = props.state.profile.inventory.find((row) => row.id === props.state.profile.equipment[slot]);
        return <EquipmentSlotCell key={slot} item={item} layout={layout} slot={slot} />;
      })}
    </Box>
  );
}

function EquipmentSlotCell(props: { item?: InventoryItem; layout: (typeof EQUIPMENT_LAYOUT)[EquipmentSlot]; slot: EquipmentSlot }) {
  return (
    <Box p="xs" mih={props.layout.minHeight} style={{ background: SLOT_BG, border: SLOT_BORDER, boxShadow: SLOT_SHADOW, gridColumn: props.layout.gridColumn, gridRow: props.layout.gridRow, overflow: "hidden" }}>
      <Text size="10px" c="dimmed" fw={700}>{props.layout.title || EQUIPMENT_SLOT_LABELS[props.slot]}</Text>
      {props.item ? <ItemSummary item={props.item} /> : <Text size="xs" c={EMPTY_SLOT_COLOR} mt="xs">Empty</Text>}
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
          <InventoryCell key={item?.id || index} canEquip={item ? canEquipItem(props.state, item) : false} equipped={item ? props.state.profile.equipment[item.slot] === item.id : false} item={item} onEquip={() => item && props.setState((previous) => equipItem(previous, item.id))} />
        ))}
      </Box>
    </Box>
  );
}

function InventoryCell(props: { canEquip: boolean; equipped: boolean; item?: InventoryItem; onEquip: () => void }) {
  if (!props.item) {
    return <Box style={{ aspectRatio: "1 / 1", background: "#090909", border: "1px solid #3d3527" }} />;
  }
  return (
    <Box p={4} style={{ aspectRatio: "1 / 1", background: "#111", border: `1px solid ${RARITY_COLORS[props.item.rarity]}`, overflow: "hidden" }}>
      <ItemSummary item={props.item} compact />
      <Button fullWidth mt={3} size="compact-xs" variant={props.equipped ? "default" : "light"} disabled={props.equipped || !props.canEquip} onClick={props.onEquip}>
        {props.equipped ? "On" : "Wear"}
      </Button>
    </Box>
  );
}

function ItemSummary(props: { compact?: boolean; item: InventoryItem }) {
  return (
    <Box>
      <Group gap={4} wrap="nowrap">
        <Text size={props.compact ? "10px" : "xs"} fw={800} c={RARITY_COLORS[props.item.rarity]} lineClamp={props.compact ? COMPACT_NAME_LINES : 1}>{props.item.name}</Text>
        {props.item.setId && <Badge size="xs" color="green" variant="light">set</Badge>}
      </Group>
      <Text size="10px" c="gray.4" lineClamp={1}>{formatItemStats(props.item)}</Text>
      {props.item.modifiers?.length ? <Text size="10px" c="blue.2" lineClamp={1}>{formatItemModifiers(props.item)}</Text> : null}
      <Text size="10px" c="dimmed" lineClamp={1}>{formatItemRequirements(props.item)}</Text>
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
  return (item.modifiers || []).map((modifier) => {
    if (modifier.key === "bonusXpPercent") {
      return `+${modifier.value}% XP`;
    }
    if (modifier.key === "criticalChancePercent") {
      return `+${modifier.value}% Crit`;
    }
    if (modifier.key === "damageReduction") {
      return `Damage -${modifier.value}`;
    }
    if (modifier.key === "enhancedDamagePercent") {
      return `+${modifier.value}% Damage`;
    }
    if (modifier.key === "goldFindPercent") {
      return `+${modifier.value}% Gold`;
    }
    if (modifier.key === "lifeOnKill") {
      return `+${modifier.value} Life/Sub`;
    }
    if (modifier.key === "magicFindPercent") {
      return `+${modifier.value}% Magic Find`;
    }
    if (modifier.key === "manaOnKill") {
      return `+${modifier.value} Mana/Sub`;
    }
    if (modifier.key === "maxLife") {
      return `+${modifier.value} Max Life`;
    }
    return `+${modifier.value} Max Mana`;
  }).join(", ");
}

function formatStats(stats: InventoryItem["stats"]) {
  return Object.entries(stats)
    .filter(([, value]) => value)
    .map(([key, value]) => `${STAT_LABELS[key as keyof typeof STAT_LABELS]} +${value}`)
    .join(", ");
}
