import { EQUIPMENT_SLOTS, createDropItem } from "./itemCore";
import { getRelicCost, getRelicModifierTotals, grantRelic, rollRelic } from "./relicCore";
import { getHeatShopPriceIncreasePercent } from "./campaignCore";
import type { ActivePotionEffect, CharacterStats, Difficulty, Question, Relic, ShopItem, StudyState } from "../types/study";

const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const HEALTH_POTION_PERCENT = 20;
const RANDOM_POTION_BASE_AMOUNT = 14;
const HEALTH_POTION_COST = 16;
const RANDOM_POTION_COST = 20;
const PERCENT_DIVISOR = 100;
const POTION_LEVEL_COST_MULTIPLIER = 2;
const RELIC_LEVEL_COST_MULTIPLIER = 4;
const EQUIPMENT_STOCK_COUNT = 0;
const RELIC_STOCK_COUNT = 5;
const RANDOM_POTION_DURATION_ROOMS = 3;
const SHOP_RATING_DISCOUNT = 180;
const SHOP_RATING_STEP = 45;
const MIN_SHOP_RATING = 1000;
const MAX_SHOP_DIFFICULTY: Difficulty = 5;
const SHOP_ITEM_RARITY_BONUS = 0.04;
const ITEM_LEVEL_COST_MULTIPLIER = 3;
const ITEM_STAT_COST_MULTIPLIER = 6;
const COMMON_RARITY_COST = 8;
const MAX_SHOP_DISCOUNT_PERCENT = 70;
const MERCHANT_RELIC_RARITIES = ["common", "uncommon", "rare", "shop"] as const;
const RELIC_SELL_VALUE_DIVISOR = 4;
type ShopStockOptions = { bossRelicStock?: number; extraRelicStock?: number; maxItemLevel?: number; relicRollState?: StudyState };

const RARITY_COSTS = {
  common: COMMON_RARITY_COST,
  epic: 90,
  legendary: 140,
  rare: 52,
  uncommon: 24
} as const;

export function createShopStock(question: Question, stats: CharacterStats, now: number, options: ShopStockOptions = {}): ShopItem[] {
  const resolvedOptions = { ...options, maxItemLevel: options.maxItemLevel ?? 1 };
  const relics = createShopRelics(question, now, resolvedOptions);
  return [
    createHealthPotion(question, now, resolvedOptions),
    createRandomPotion(question, now, resolvedOptions),
    ...relics
  ];
}

export function buyShopItem(state: StudyState, shopItemId: string, maxHealth: number, _maxMana = 0): StudyState {
  const listing = state.profile.shopStock.find((item) => item.id === shopItemId);
  if (!listing || !canBuyShopItem(state, listing, maxHealth)) {
    return state;
  }
  const next = cloneShopState(state);
  next.profile.coins -= getShopItemCost(state, listing);
  next.profile.shopStock = next.profile.shopStock.filter((item) => item.id !== shopItemId);
  if (listing.kind === "equipment") {
    next.profile.inventory.push(listing.item);
    return next;
  }
  if (listing.kind === "relic") {
    return grantRelic(next, listing.relic);
  }
  applyConsumable(next, listing, maxHealth);
  return next;
}

export function sellShopRelic(state: StudyState, relicId: string): StudyState {
  const relic = getShopSellableRelics(state).find((item) => item.id === relicId);
  if (!relic || !isMerchantShopOpen(state)) {
    return state;
  }
  const next = cloneShopState(state);
  next.profile.coins += getShopRelicSellValue(relic);
  next.profile.relics = next.profile.relics.filter((item) => item.id !== relic.id);
  return next;
}

export function getShopSellableRelics(state: StudyState) {
  return state.profile.relics.filter((relic) => relic.rarity !== "blight");
}

export function getShopRelicSellValue(relic: Relic) {
  if (relic.rarity === "blight") {
    return 0;
  }
  return Math.max(1, Math.floor(getRelicCost(relic) / RELIC_SELL_VALUE_DIVISOR));
}

export function canBuyShopItem(state: StudyState, listing: ShopItem, _maxHealth: number, _maxMana = 0) {
  if (state.profile.coins < getShopItemCost(state, listing)) {
    return false;
  }
  if (listing.kind !== "consumable") {
    return true;
  }
  return true;
}

function isMerchantShopOpen(state: StudyState) {
  const currentNode = state.profile.spireRun.nodes.find((node) => node.id === state.profile.spireRun.currentNodeId);
  return Boolean(currentNode?.kind === "merchant" && !state.profile.spireRun.mapOpen);
}

export function getShopItemCost(state: StudyState, listing: ShopItem) {
  const discount = Math.min(MAX_SHOP_DISCOUNT_PERCENT, Math.max(0, getRelicModifierTotals(state).shopDiscountPercent || 0));
  const priceIncrease = Math.max(0, (getRelicModifierTotals(state).shopPriceIncreasePercent || 0) + getHeatShopPriceIncreasePercent(state.profile.spireRun));
  return Math.max(1, Math.ceil(listing.cost * (100 - discount + priceIncrease) / 100));
}

export function normalizeShopStock(items: ShopItem[] | undefined): ShopItem[] {
  return dedupeShopStock((items || []).filter(isValidShopItem));
}

function isValidShopItem(item: ShopItem) {
  if (!item.id || !item.name || item.cost < 0) {
    return false;
  }
  if (item.kind === "consumable") {
    return item.amount > 0 && (item.type === "health" || item.type === "random");
  }
  if (item.kind === "equipment") {
    return Boolean(item.item);
  }
  return Boolean(item.relic);
}

function createHealthPotion(question: Question, now: number, options: ShopStockOptions): ShopItem {
  return { amount: HEALTH_POTION_PERCENT, cost: getScaledShopCost(HEALTH_POTION_COST + question.difficulty, options), id: `shop-health-${question.id}-${now}`, kind: "consumable", name: "Minor Healing Potion", type: "health" };
}

function createRandomPotion(question: Question, now: number, options: ShopStockOptions): ShopItem {
  const amount = RANDOM_POTION_BASE_AMOUNT + Math.max(0, (options.maxItemLevel || 1) - 1);
  return { amount, cost: getScaledShopCost(RANDOM_POTION_COST + question.difficulty, options), id: `shop-random-${question.id}-${now}`, kind: "consumable", name: "Unstable Potion", type: "random" };
}

function createShopEquipment(question: Question, stats: CharacterStats, now: number, index: number, options: ShopStockOptions): ShopItem {
  const shopQuestion = createShopQuestion(question, index);
  const item = createDropItem(shopQuestion, stats, now + index, { maxItemLevel: options.maxItemLevel, rarityBonus: SHOP_ITEM_RARITY_BONUS * index, slot: getShopEquipmentSlot(index) });
  const cost = getEquipmentCost(item);
  return { cost, id: `shop-equipment-${item.id}`, item, kind: "equipment", name: item.name };
}

function getShopEquipmentSlot(index: number) {
  return EQUIPMENT_SLOTS[index % EQUIPMENT_SLOTS.length];
}

function createShopEquipmentStock(question: Question, stats: CharacterStats, now: number, options: ShopStockOptions) {
  const equipment: ShopItem[] = [];
  const seenKeys = new Set<string>();
  for (let attempt = 0; equipment.length < EQUIPMENT_STOCK_COUNT && attempt < EQUIPMENT_STOCK_COUNT * 12; attempt += 1) {
    const listing = createShopEquipment(question, stats, now, attempt, options);
    if (listing.kind !== "equipment") {
      continue;
    }
    const key = getEquipmentStockKey(listing);
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    equipment.push({ ...listing, id: `shop-equipment-${listing.item.id}-${equipment.length}` });
  }
  return equipment;
}

function createShopRelic(question: Question, now: number, index: number, options: ShopStockOptions, rarities: Relic["rarity"][] = [...MERCHANT_RELIC_RARITIES]): ShopItem {
  const relic = rollRelic(options.relicRollState || { profile: { relics: [] } } as unknown as StudyState, `${question.id}:${now}:shop-relic:${index}:${rarities.join("-")}`, { includeShop: true, maxItemLevel: options.maxItemLevel, minRarity: rarities });
  return { cost: getScaledShopCost(getRelicCost(relic), options, RELIC_LEVEL_COST_MULTIPLIER), id: `shop-relic-${relic.id}-${now}-${index}`, kind: "relic", name: relic.name, relic };
}

function createShopRelics(question: Question, now: number, options: ShopStockOptions) {
  const relics: ShopItem[] = [];
  const seenIds = new Set<string>();
  const stockCount = RELIC_STOCK_COUNT + Math.max(0, Math.floor(options.extraRelicStock || 0));
  for (let attempt = 0; relics.length < stockCount && attempt < stockCount * 12; attempt += 1) {
    const listing = createShopRelic(question, now, attempt, options);
    if (listing.kind === "relic" && !seenIds.has(listing.relic.id)) {
      seenIds.add(listing.relic.id);
      relics.push({ ...listing, id: `shop-relic-${listing.relic.id}-${now}-${relics.length}` });
    }
  }
  const bossStockCount = Math.max(0, Math.floor(options.bossRelicStock || 0));
  let bossRelics = 0;
  for (let attempt = 0; bossRelics < bossStockCount && attempt < bossStockCount * 12; attempt += 1) {
    const listing = createShopRelic(question, now, stockCount + attempt, options, ["boss"]);
    if (listing.kind === "relic" && !seenIds.has(listing.relic.id)) {
      seenIds.add(listing.relic.id);
      bossRelics += 1;
      relics.push({ ...listing, id: `shop-relic-${listing.relic.id}-${now}-${relics.length}` });
    }
  }
  return relics;
}

function dedupeShopStock(items: ShopItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getShopStockKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getShopStockKey(item: ShopItem) {
  if (item.kind === "equipment") {
    return getEquipmentStockKey(item);
  }
  if (item.kind === "relic") {
    return `relic:${item.relic.id}`;
  }
  return `consumable:${item.type}`;
}

function getEquipmentStockKey(item: Extract<ShopItem, { kind: "equipment" }>) {
  return `equipment:${item.item.wikiImagePath || item.item.name}`;
}

function createShopQuestion(question: Question, index: number): Question {
  const rating = Math.max(MIN_SHOP_RATING, question.rating - SHOP_RATING_DISCOUNT + index * SHOP_RATING_STEP);
  return {
    ...question,
    difficulty: Math.min(MAX_SHOP_DIFFICULTY, Math.max(1, question.difficulty + (index % 2))) as Difficulty,
    id: `${question.id}-shop-${index}`,
    rating
  };
}

function getEquipmentCost(item: Extract<ShopItem, { kind: "equipment" }>["item"]) {
  const statTotal = Object.values(item.stats).reduce((sum, value) => sum + (value || 0), 0);
  return RARITY_COSTS[item.rarity] + item.requirements.level * ITEM_LEVEL_COST_MULTIPLIER + statTotal * ITEM_STAT_COST_MULTIPLIER;
}

function getScaledShopCost(baseCost: number, options: ShopStockOptions, levelMultiplier = POTION_LEVEL_COST_MULTIPLIER) {
  const level = Math.max(1, Math.floor(options.maxItemLevel || 1));
  return Math.max(1, Math.round(baseCost + (level - 1) * levelMultiplier));
}

function applyConsumable(state: StudyState, item: Extract<ShopItem, { kind: "consumable" }>, maxHealth: number) {
  if (item.type === "health") {
    state.profile.health = Math.min(maxHealth, state.profile.health + Math.max(1, Math.floor(maxHealth * item.amount / PERCENT_DIVISOR)));
    return;
  }
  const potionDurationBonus = Math.max(0, Math.floor(getRelicModifierTotals(state).potionDurationBonus || 0));
  state.profile.activePotionEffects = [...(state.profile.activePotionEffects || []), getRandomPotionEffect(item, state.profile.spireRun.currentNodeId, potionDurationBonus)];
}

export function getRandomPotionEffect(item: Extract<ShopItem, { kind: "consumable" }>, sourceNodeId = "", durationBonus = 0): ActivePotionEffect {
  const roll = getShopSeedRoll(`${item.id}:effect`);
  const base = {
    id: `${item.id}-effect`,
    roomsRemaining: RANDOM_POTION_DURATION_ROOMS + Math.max(0, Math.floor(durationBonus)),
    sourceNodeId
  };
  if (roll < 0.2) {
    return { ...base, modifiers: [{ key: "maxLife", value: item.amount }], name: "Witches Potion", stats: { constitution: 1 } };
  }
  if (roll < 0.4) {
    return { ...base, modifiers: [{ key: "timerDamagePercent", value: Math.max(6, Math.floor(item.amount / 2)) }], name: "Wizard Potion", stats: { intelligence: 1 } };
  }
  if (roll < 0.6) {
    return { ...base, modifiers: [{ key: "criticalChancePercent", value: 6 }], name: "Elixir of Death", stats: { strength: 1 } };
  }
  if (roll < 0.8) {
    return { ...base, modifiers: [{ key: "damageReduction", value: 1 }], name: "Blood of Spartan", stats: { constitution: 1, strength: 1 } };
  }
  return { ...base, modifiers: [{ key: "goldFindPercent", value: 12 }, { key: "relicRerollBonus", value: 1 }], name: "Bottle of Radogate", stats: { perception: 1 } };
}

function cloneShopState(state: StudyState): StudyState {
  return {
    ...state,
    profile: {
      ...state.profile,
      equipment: { ...state.profile.equipment },
      inventory: state.profile.inventory.map((item) => ({ ...item, modifiers: item.modifiers?.map((modifier) => ({ ...modifier })), stats: { ...item.stats } })),
      activePotionEffects: (state.profile.activePotionEffects || []).map((effect) => ({ ...effect, modifiers: effect.modifiers.map((modifier) => ({ ...modifier })), stats: { ...effect.stats } })),
      relics: state.profile.relics.map((relic) => ({ ...relic, modifiers: relic.modifiers?.map((modifier) => ({ ...modifier })) })),
      shopStock: state.profile.shopStock.map((item) => ({ ...item }))
    },
    cards: { ...state.cards }
  };
}

export function getShopSeedRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}
