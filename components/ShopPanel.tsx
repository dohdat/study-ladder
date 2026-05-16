import { Badge, Box, Button, Group, SimpleGrid, Stack, Text } from "@mantine/core";

import { CoinAmount } from "./CoinIcon";
import { ItemSummary } from "./InventoryPanel";
import { buyShopItem } from "../lib/shopCore";
import { getMaxHealth, getMaxMana } from "../lib/studyCore";
import type { EquipmentSlot, ItemRarity, ShopItem, StudyState } from "../types/study";

const SHOP_COLUMNS = { base: 1, sm: 2 };
const SHOP_PANEL_BG = "radial-gradient(circle at 50% 18%, #332f28 0%, #1b1a17 52%, #090909 100%)";
const SHOP_PANEL_BORDER = "2px solid #8a744c";
const SHOP_CARD_BG = "linear-gradient(145deg, #0b0b0a, #24211c)";
const SHOP_CARD_BORDER = "1px solid #7b6845";
const SHOP_CARD_SHADOW = "inset 0 0 0 1px #050505, 0 1px 4px rgba(0, 0, 0, 0.45)";
const SHOP_ICON_SIZE = 58;
const SHOP_ICON_BOX_SHADOW = "inset 0 0 0 2px #050505";
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const VARIANT_COUNT = 4;
const VARIANT_EVEN_DIVISOR = 2;
const VARIANT_HIGH_MIN = 2;
const ARMOR_NARROW_WIDTH = 8;
const ARMOR_WIDE_WIDTH = 10;
const ARMOR_NARROW_X = 4;
const ARMOR_WIDE_X = 3;
const AXE_VARIANT_REMAINDER = 1;

type ArtColors = {
  accent: string;
  dark: string;
  light: string;
  mid: string;
};

const RARITY_ART_COLORS: Record<ItemRarity, ArtColors> = {
  common: { accent: "#adb5bd", dark: "#161616", light: "#e9ecef", mid: "#868e96" },
  epic: { accent: "#f06595", dark: "#1b0f2d", light: "#d0bfff", mid: "#845ef7" },
  legendary: { accent: "#fff3bf", dark: "#2b1d09", light: "#ffd43b", mid: "#f08c00" },
  rare: { accent: "#a5d8ff", dark: "#071829", light: "#74c0fc", mid: "#228be6" },
  uncommon: { accent: "#b2f2bb", dark: "#0b2612", light: "#69db7c", mid: "#2f9e44" }
} as const;

export function ShopPanel(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return (
    <Stack gap="sm">
      <Box p="sm" style={{ background: SHOP_PANEL_BG, border: SHOP_PANEL_BORDER, boxShadow: "inset 0 0 0 2px #111" }}>
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={800} c="#c8a96a" style={{ letterSpacing: 2 }}>SHOP</Text>
          <CoinAmount value={props.state.profile.coins} />
        </Group>
        <Text size="xs" c="dimmed" mb="sm">Merchant stock refreshes after a successful submission.</Text>
        {props.state.profile.shopStock.length ? <ShopGrid state={props.state} setState={props.setState} /> : <EmptyShop />}
      </Box>
    </Stack>
  );
}

function ShopGrid(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return (
    <SimpleGrid cols={SHOP_COLUMNS}>
      {props.state.profile.shopStock.map((item) => (
        <ShopCard key={item.id} item={item} state={props.state} setState={props.setState} />
      ))}
    </SimpleGrid>
  );
}

function ShopCard(props: { item: ShopItem; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const canAfford = props.state.profile.coins >= props.item.cost;
  return (
    <Box p="sm" style={{ background: SHOP_CARD_BG, border: SHOP_CARD_BORDER, boxShadow: SHOP_CARD_SHADOW }}>
      <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
        <ShopItemArt item={props.item} />
        <Box flex={1}>{props.item.kind === "equipment" ? <ItemSummary item={props.item.item} /> : <PotionSummary item={props.item} />}</Box>
        <Badge variant="light" color={canAfford ? "yellow" : "gray"}>{props.item.cost}</Badge>
      </Group>
      <Button fullWidth mt="sm" size="xs" variant="light" disabled={!canAfford} onClick={() => buyItem(props)}>
        Buy
      </Button>
    </Box>
  );
}

function ShopItemArt(props: { item: ShopItem }) {
  const colors = props.item.kind === "equipment" ? RARITY_ART_COLORS[props.item.item.rarity] : getPotionColors(props.item.type);
  const seed = props.item.kind === "equipment" ? props.item.item.id : props.item.id;
  const variant = getArtVariant(seed);
  return (
    <Box style={{ background: colors.dark, border: `1px solid ${colors.mid}`, boxShadow: SHOP_ICON_BOX_SHADOW, flex: `0 0 ${SHOP_ICON_SIZE}px`, height: SHOP_ICON_SIZE, width: SHOP_ICON_SIZE }}>
      <svg viewBox="0 0 16 16" width={SHOP_ICON_SIZE} height={SHOP_ICON_SIZE} shapeRendering="crispEdges" aria-hidden>
        {props.item.kind === "equipment" ? <EquipmentPixels colors={colors} slot={props.item.item.slot} variant={variant} /> : <PotionPixels colors={colors} variant={variant} />}
      </svg>
    </Box>
  );
}

function getPotionColors(type: Extract<ShopItem, { kind: "consumable" }>["type"]) {
  if (type === "health") {
    return { accent: "#ffe3e3", dark: "#25090d", light: "#ff8787", mid: "#e03131" };
  }
  return { accent: "#d0ebff", dark: "#071829", light: "#74c0fc", mid: "#1c7ed6" };
}

function PotionPixels(props: { colors: ArtColors; variant: number }) {
  const hasTallNeck = props.variant % VARIANT_EVEN_DIVISOR === 0;
  const isWide = props.variant > VARIANT_HIGH_MIN;
  return (
    <>
      <rect x={hasTallNeck ? "7" : "6"} y="1" width={hasTallNeck ? "2" : "4"} height="2" fill={props.colors.accent} />
      <rect x="5" y="3" width="6" height="2" fill={props.colors.light} />
      <rect x={isWide ? "3" : "4"} y="5" width={isWide ? "10" : "8"} height="8" fill={props.colors.mid} />
      <rect x="5" y="6" width="2" height="2" fill={props.colors.light} />
      <rect x="10" y="8" width="1" height="4" fill={props.colors.dark} />
      <rect x="5" y="13" width="6" height="1" fill={props.colors.accent} />
    </>
  );
}

function EquipmentPixels(props: { colors: ArtColors; slot: EquipmentSlot; variant: number }) {
  if (props.slot === "feet") {
    return <BootPixels colors={props.colors} variant={props.variant} />;
  }
  if (props.slot === "headgear") {
    return <HelmPixels colors={props.colors} variant={props.variant} />;
  }
  if (props.slot === "armor") {
    return <ArmorPixels colors={props.colors} variant={props.variant} />;
  }
  if (props.slot === "mainHand" || props.slot === "offHand") {
    return <WeaponPixels colors={props.colors} variant={props.variant} />;
  }
  return <AccessoryPixels colors={props.colors} variant={props.variant} />;
}

function WeaponPixels(props: { colors: ArtColors; variant: number }) {
  const isAxe = props.variant % VARIANT_EVEN_DIVISOR === AXE_VARIANT_REMAINDER;
  return (
    <>
      <rect x="10" y="1" width="2" height={isAxe ? "9" : "7"} fill={props.colors.light} />
      {isAxe ? <rect x="7" y="3" width="4" height="4" fill={props.colors.accent} /> : null}
      <rect x="9" y="7" width="4" height="2" fill={props.colors.accent} />
      <rect x="7" y="9" width="2" height="2" fill={props.colors.mid} />
      <rect x="5" y="11" width="2" height="3" fill={props.colors.mid} />
    </>
  );
}

function ArmorPixels(props: { colors: ArtColors; variant: number }) {
  const isNarrow = props.variant % VARIANT_EVEN_DIVISOR === 0;
  const shoulderWidth = isNarrow ? ARMOR_NARROW_WIDTH : ARMOR_WIDE_WIDTH;
  const shoulderX = isNarrow ? ARMOR_NARROW_X : ARMOR_WIDE_X;
  return (
    <>
      <rect x="5" y="2" width="6" height="2" fill={props.colors.light} />
      <rect x={shoulderX} y="4" width={shoulderWidth} height="8" fill={props.colors.mid} />
      <rect x="3" y="5" width="2" height="4" fill={props.colors.accent} />
      <rect x="11" y="5" width="2" height="4" fill={props.colors.dark} />
      <rect x={props.variant > VARIANT_HIGH_MIN ? "8" : "6"} y="6" width="2" height="5" fill={props.colors.light} />
    </>
  );
}

function HelmPixels(props: { colors: ArtColors; variant: number }) {
  const hasCrest = props.variant % VARIANT_EVEN_DIVISOR === 0;
  return (
    <>
      {hasCrest ? <rect x="7" y="1" width="2" height="3" fill={props.colors.accent} /> : null}
      <rect x="4" y="3" width="8" height="3" fill={props.colors.light} />
      <rect x={props.variant > VARIANT_HIGH_MIN ? "4" : "3"} y="6" width={props.variant > VARIANT_HIGH_MIN ? "8" : "10"} height="5" fill={props.colors.mid} />
      <rect x="5" y="7" width="2" height="2" fill={props.colors.dark} />
      <rect x="9" y="7" width="2" height="2" fill={props.colors.dark} />
      <rect x={hasCrest ? "6" : "7"} y="11" width={hasCrest ? "4" : "2"} height="2" fill={props.colors.accent} />
    </>
  );
}

function BootPixels(props: { colors: ArtColors; variant: number }) {
  const isTall = props.variant % VARIANT_EVEN_DIVISOR === 0;
  return (
    <>
      <rect x="5" y={isTall ? "2" : "4"} width="4" height={isTall ? "8" : "6"} fill={props.colors.mid} />
      <rect x="8" y="8" width="4" height="3" fill={props.colors.mid} />
      <rect x="4" y="10" width="9" height="3" fill={props.colors.dark} />
      <rect x={props.variant > VARIANT_HIGH_MIN ? "7" : "6"} y="4" width="2" height="4" fill={props.colors.light} />
      <rect x="10" y="11" width="2" height="1" fill={props.colors.accent} />
    </>
  );
}

function AccessoryPixels(props: { colors: ArtColors; variant: number }) {
  const isRing = props.variant % VARIANT_EVEN_DIVISOR === 0;
  if (isRing) {
    return <RingPixels colors={props.colors} variant={props.variant} />;
  }
  return (
    <>
      <rect x="7" y="2" width="2" height="3" fill={props.colors.light} />
      <rect x="5" y="5" width="6" height="2" fill={props.colors.mid} />
      <rect x="4" y="7" width="2" height="4" fill={props.colors.mid} />
      <rect x="10" y="7" width="2" height="4" fill={props.colors.dark} />
      <rect x="6" y="11" width="4" height="2" fill={props.colors.accent} />
    </>
  );
}

function RingPixels(props: { colors: ArtColors; variant: number }) {
  return (
    <>
      <rect x="5" y="5" width="6" height="2" fill={props.colors.light} />
      <rect x="4" y="7" width="2" height="4" fill={props.colors.mid} />
      <rect x="10" y="7" width="2" height="4" fill={props.colors.dark} />
      <rect x="5" y="11" width="6" height="2" fill={props.colors.mid} />
      <rect x={props.variant > 1 ? "8" : "7"} y="3" width="2" height="2" fill={props.colors.accent} />
    </>
  );
}

function getArtVariant(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) % VARIANT_COUNT;
}

function PotionSummary(props: { item: Extract<ShopItem, { kind: "consumable" }> }) {
  const color = props.item.type === "health" ? "red.3" : "blue.3";
  return (
    <Box>
      <Text size="xs" fw={800} c={color}>{props.item.name}</Text>
      <Text size="10px" c="gray.4">Restores {props.item.amount} {props.item.type === "health" ? "Health" : "Mana"}</Text>
      <Text size="10px" c="dimmed">Consumable</Text>
    </Box>
  );
}

function EmptyShop() {
  return (
    <Box p="md" style={{ background: SHOP_CARD_BG, border: SHOP_CARD_BORDER }}>
      <Text size="sm" c="dimmed">Finish a question to roll merchant stock.</Text>
    </Box>
  );
}

function buyItem(props: { item: ShopItem; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  props.setState((previous) => buyShopItem(previous, props.item.id, getMaxHealth(previous), getMaxMana(previous)));
}
