import { Badge, Box, Group, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";

import { CoinAmount } from "./CoinIcon";
import { HeroSiegeButton } from "./HeroSiegeUi";
import { HeroSiegeEquipmentIcon, HeroSiegePotionIcon } from "./HeroSiegeItemIcon";
import { InventoryItemTooltip, ItemSummary } from "./InventoryPanel";
import { RelicIcon } from "./RelicIcon";
import { getHeroSiegeQualityColor, getRelicQualityLabel } from "../lib/heroSiegeQuality";
import { formatModifier } from "../lib/modifierFormat";
import { buyShopItem, canBuyShopItem, getRandomPotionEffect } from "../lib/shopCore";
import { getMaxHealth, getMaxMana } from "../lib/studyCore";
import type { CharacterStatKey, EquipmentSlot, InventoryItem, Relic, ShopItem, StudyState } from "../types/study";

const SHOP_COLUMNS = { base: 1, sm: 2 };
const SHOP_PANEL_BG = "radial-gradient(circle at 50% 18%, #332f28 0%, #1b1a17 52%, #090909 100%)";
const SHOP_PANEL_BORDER = "2px solid #8a744c";
const SHOP_CARD_BG = "linear-gradient(145deg, #0b0b0a, #24211c)";
const SHOP_CARD_BORDER = "1px solid #7b6845";
const SHOP_CARD_SHADOW = "inset 0 0 0 1px #050505, 0 1px 4px rgba(0, 0, 0, 0.45)";
const SHOP_ICON_SIZE = 70;
const SHOP_TOOLTIP_BG = "linear-gradient(180deg, rgba(49, 15, 20, 0.98), rgba(15, 4, 6, 0.98))";
const SHOP_TOOLTIP_BORDER = "1px solid #bb1b5d";
const SHOP_TOOLTIP_SHADOW = "0 14px 28px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 211, 122, 0.14)";

export function ShopPanel(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return (
    <Stack gap="sm">
      <Box p="sm" style={{ background: SHOP_PANEL_BG, border: SHOP_PANEL_BORDER, boxShadow: "inset 0 0 0 2px #111" }}>
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={800} c="#c8a96a" style={{ letterSpacing: 2 }}>SHOP</Text>
          <CoinAmount value={props.state.profile.coins} />
        </Group>
        <Text size="xs" c="dimmed" mb="sm">Buy potions, equipment, and relics from the current merchant stock.</Text>
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
  const canBuy = canBuyShopItem(props.state, props.item, getMaxHealth(props.state), getMaxMana(props.state));
  return (
    <Box p="sm" style={{ background: SHOP_CARD_BG, border: SHOP_CARD_BORDER, boxShadow: SHOP_CARD_SHADOW }}>
      <ShopItemTooltip item={props.item} state={props.state}>
        <Box>
          <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
            <ShopItemArt item={props.item} />
            <Box flex={1} style={{ minWidth: 0 }}>{getShopSummary(props.item)}</Box>
            <Badge variant="light" color={canAfford ? "yellow" : "gray"}>{props.item.cost}</Badge>
          </Group>
        </Box>
      </ShopItemTooltip>
      <Group justify="flex-end" mt={8}>
        <HeroSiegeButton disabled={!canBuy} height={26} minWidth={70} onClick={() => buyItem(props)} style={{ fontSize: 10, padding: "0 12px" }}>
          Buy
        </HeroSiegeButton>
      </Group>
    </Box>
  );
}

function ShopItemArt(props: { item: ShopItem }) {
  if (props.item.kind === "relic") {
    return <RelicIcon relic={props.item.relic} size={SHOP_ICON_SIZE} unframed />;
  }
  return props.item.kind === "equipment"
    ? <HeroSiegeEquipmentIcon item={props.item.item} size={SHOP_ICON_SIZE} unframed />
    : <HeroSiegePotionIcon type={props.item.type} size={SHOP_ICON_SIZE} unframed />;
}

function getShopSummary(item: ShopItem) {
  if (item.kind === "equipment") {
    return <ItemSummary item={item.item} large showIcon={false} />;
  }
  if (item.kind === "relic") {
    return <RelicSummary relic={item.relic} />;
  }
  return <PotionSummary item={item} />;
}

function RelicSummary(props: { relic: Relic }) {
  const quality = getRelicQualityLabel(props.relic.rarity, props.relic.wikiRarityLabel);
  return (
    <Box>
      <Text size="sm" fw={800} c={getHeroSiegeQualityColor(quality)}>{props.relic.name}</Text>
      <Text size="12px" c="gray.4">{getRelicSubtitle(props.relic)}</Text>
      <Text size="12px" c="blue.2">{formatRelicEffects(props.relic)}</Text>
      <Text size="12px" c="dimmed" lineClamp={1}>{props.relic.description}</Text>
    </Box>
  );
}

function PotionSummary(props: { item: Extract<ShopItem, { kind: "consumable" }> }) {
  const color = getPotionColor(props.item.type);
  return (
    <Box>
      <Text size="sm" fw={800} c={color}>{props.item.name}</Text>
      <Text size="12px" c="gray.4">{getPotionEffectText(props.item)}</Text>
      <Text size="12px" c="dimmed">Consumable</Text>
    </Box>
  );
}

function ShopItemTooltip(props: { children: React.ReactElement; item: ShopItem; state?: StudyState }) {
  if (props.item.kind === "equipment") {
    return <InventoryItemTooltip compareItem={props.state ? getEquippedComparisonItem(props.state, props.item.item) : null} item={props.item.item} showRollRanges={false}>{props.children}</InventoryItemTooltip>;
  }
  return (
    <Tooltip
      label={props.item.kind === "relic" ? <RelicTooltip relic={props.item.relic} /> : <PotionTooltip item={props.item} />}
      multiline
      withArrow
      color="dark"
      styles={{
        tooltip: {
          background: SHOP_TOOLTIP_BG,
          border: SHOP_TOOLTIP_BORDER,
          borderRadius: 2,
          boxShadow: SHOP_TOOLTIP_SHADOW,
          color: "#f1dfad",
          padding: 12
        }
      }}
    >
      {props.children}
    </Tooltip>
  );
}

function RelicTooltip(props: { relic: Relic }) {
  const quality = getRelicQualityLabel(props.relic.rarity, props.relic.wikiRarityLabel);
  return (
    <Stack gap={4} style={{ textAlign: "center", width: 260 }}>
      <Text size="sm" fw={900} tt="uppercase" c={getHeroSiegeQualityColor(quality)}>{props.relic.name}</Text>
      <Text size="xs" fw={800} c="gray.2">{getRelicSubtitle(props.relic)}</Text>
      <Stack gap={2}>
        {(props.relic.modifiers || []).map((modifier) => ({ key: modifier.key, text: formatModifier(modifier.key, modifier.value) })).filter((modifier) => modifier.text).map((modifier) => (
          <Text key={modifier.key} size="xs" fw={900} c="blue.2">{modifier.text}</Text>
        ))}
      </Stack>
      <Text size="xs" c="gray.2">{props.relic.description}</Text>
    </Stack>
  );
}

function PotionTooltip(props: { item: Extract<ShopItem, { kind: "consumable" }> }) {
  return (
    <Stack gap={4} style={{ textAlign: "center", width: 240 }}>
      <Text size="sm" fw={900} tt="uppercase" c={getPotionColor(props.item.type)}>{props.item.name}</Text>
      <Text size="xs" fw={800} c="gray.2">{getPotionEffectText(props.item)}</Text>
      <Text size="xs" c="dimmed">{props.item.type === "random" ? "Effect lasts for 3 rooms." : "Used immediately when purchased."}</Text>
    </Stack>
  );
}

function getPotionColor(type: Extract<ShopItem, { kind: "consumable" }>["type"]) {
  if (type === "health") {
    return "red.3";
  }
  return "blue.3";
}

function getPotionEffectText(item: Extract<ShopItem, { kind: "consumable" }>) {
  if (item.type === "health") {
    return `Restores ${item.amount}% Health`;
  }
  if (item.type === "mana") {
    return `Restores ${item.amount}% Mana`;
  }
  const effect = getRandomPotionEffect(item);
  return `${effect.name}: ${formatPotionEffectParts(effect)} for ${effect.roomsRemaining} rooms`;
}

function formatPotionEffectParts(effect: ReturnType<typeof getRandomPotionEffect>) {
  return [
    ...effect.modifiers.map((modifier) => formatModifier(modifier.key, modifier.value)),
    ...Object.entries(effect.stats).filter(([, value]) => value).map(([key, value]) => `+${value} ${formatStatName(key as CharacterStatKey)}`)
  ].filter(Boolean).join(", ");
}

function formatStatName(stat: CharacterStatKey) {
  return stat.charAt(0).toUpperCase() + stat.slice(1);
}

function formatRelicEffects(relic: Relic) {
  const modifiers = (relic.modifiers || []).map((modifier) => formatModifier(modifier.key, modifier.value)).filter(Boolean);
  return modifiers.length ? modifiers.join(", ") : "No listed effect";
}

function getRelicSubtitle(relic: Relic) {
  if (relic.wikiRarityLabel || relic.wikiCategory) {
    return `${getRelicQualityLabel(relic.rarity, relic.wikiRarityLabel)} ${relic.wikiCategory || "Relic"}`;
  }
  return `${getRelicQualityLabel(relic.rarity)} relic`;
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

function getEquippedComparisonItem(state: StudyState, item: InventoryItem) {
  const slot = getCompatibleInventorySlots(item).find((candidate) => state.profile.equipment[candidate]) || getCompatibleInventorySlots(item)[0];
  const equippedId = state.profile.equipment[slot];
  return state.profile.inventory.find((row) => row.id === equippedId) || null;
}

function getCompatibleInventorySlots(item: InventoryItem) {
  if (item.slot === "eyewear" || item.slot === "ringTwo") {
    return ["eyewear", "ringTwo"] as EquipmentSlot[];
  }
  return [item.slot];
}
