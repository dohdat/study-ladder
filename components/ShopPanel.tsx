import { Badge, Box, Group, SimpleGrid, Stack, Text } from "@mantine/core";

import { CoinAmount } from "./CoinIcon";
import { HeroSiegeButton } from "./HeroSiegeUi";
import { HeroSiegeEquipmentIcon, HeroSiegePotionIcon } from "./HeroSiegeItemIcon";
import { ItemSummary } from "./InventoryPanel";
import { RelicIcon } from "./RelicIcon";
import { buyShopItem } from "../lib/shopCore";
import { getMaxHealth, getMaxMana } from "../lib/studyCore";
import type { Relic, ShopItem, StudyState } from "../types/study";

const SHOP_COLUMNS = { base: 1, sm: 2 };
const SHOP_PANEL_BG = "radial-gradient(circle at 50% 18%, #332f28 0%, #1b1a17 52%, #090909 100%)";
const SHOP_PANEL_BORDER = "2px solid #8a744c";
const SHOP_CARD_BG = "linear-gradient(145deg, #0b0b0a, #24211c)";
const SHOP_CARD_BORDER = "1px solid #7b6845";
const SHOP_CARD_SHADOW = "inset 0 0 0 1px #050505, 0 1px 4px rgba(0, 0, 0, 0.45)";
const SHOP_ICON_SIZE = 58;

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
        <Box flex={1}>{getShopSummary(props.item)}</Box>
        <Badge variant="light" color={canAfford ? "yellow" : "gray"}>{props.item.cost}</Badge>
      </Group>
      <HeroSiegeButton fullWidth disabled={!canAfford} onClick={() => buyItem(props)} style={{ marginTop: 10 }}>
        Buy
      </HeroSiegeButton>
    </Box>
  );
}

function ShopItemArt(props: { item: ShopItem }) {
  if (props.item.kind === "relic") {
    return <RelicIcon relic={props.item.relic} size={SHOP_ICON_SIZE} />;
  }
  return props.item.kind === "equipment"
    ? <HeroSiegeEquipmentIcon item={props.item.item} size={SHOP_ICON_SIZE} />
    : <HeroSiegePotionIcon type={props.item.type} size={SHOP_ICON_SIZE} />;
}

function getShopSummary(item: ShopItem) {
  if (item.kind === "equipment") {
    return <ItemSummary item={item.item} />;
  }
  if (item.kind === "relic") {
    return <RelicSummary relic={item.relic} />;
  }
  return <PotionSummary item={item} />;
}

function RelicSummary(props: { relic: Relic }) {
  return (
    <Box>
      <Text size="xs" fw={800} c="cyan.3">{props.relic.name}</Text>
      <Text size="10px" c="gray.4">{props.relic.rarity} - {props.relic.source}</Text>
      <Text size="10px" c="dimmed">{props.relic.description}</Text>
    </Box>
  );
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
