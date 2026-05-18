import { createDropItem } from "./itemCore";
import { getRelicCost, grantRelic, rollRelic } from "./relicCore";
import type { CharacterStats, Difficulty, Question, ShopItem, StudyState } from "../types/study";

const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const HEALTH_POTION_BASE_AMOUNT = 20;
const MANA_POTION_BASE_AMOUNT = 12;
const HEALTH_POTION_COST = 16;
const MANA_POTION_COST = 12;
const POTION_DIFFICULTY_AMOUNT = 4;
const EQUIPMENT_STOCK_COUNT = 4;
const RELIC_STOCK_COUNT = 4;
const SHOP_RATING_DISCOUNT = 180;
const SHOP_RATING_STEP = 45;
const MIN_SHOP_RATING = 1000;
const MAX_SHOP_DIFFICULTY: Difficulty = 5;
const SHOP_ITEM_RARITY_BONUS = 0.04;
const ITEM_LEVEL_COST_MULTIPLIER = 3;
const ITEM_STAT_COST_MULTIPLIER = 6;
const COMMON_RARITY_COST = 8;

const RARITY_COSTS = {
  common: COMMON_RARITY_COST,
  epic: 90,
  legendary: 140,
  rare: 52,
  uncommon: 24
} as const;

export function createShopStock(question: Question, stats: CharacterStats, now: number): ShopItem[] {
  return [
    createHealthPotion(question, now),
    createManaPotion(question, now),
    ...Array.from({ length: EQUIPMENT_STOCK_COUNT }, (_unused, index) => createShopEquipment(question, stats, now, index)),
    ...Array.from({ length: RELIC_STOCK_COUNT }, (_unused, index) => createShopRelic(question, now, index))
  ];
}

export function buyShopItem(state: StudyState, shopItemId: string, maxHealth: number, maxMana: number): StudyState {
  const listing = state.profile.shopStock.find((item) => item.id === shopItemId);
  if (!listing || state.profile.coins < listing.cost) {
    return state;
  }
  const next = cloneShopState(state);
  next.profile.coins -= listing.cost;
  next.profile.shopStock = next.profile.shopStock.filter((item) => item.id !== shopItemId);
  if (listing.kind === "equipment") {
    next.profile.inventory.push(listing.item);
    return next;
  }
  if (listing.kind === "relic") {
    return grantRelic(next, listing.relic);
  }
  applyConsumable(next, listing, maxHealth, maxMana);
  return next;
}

export function normalizeShopStock(items: ShopItem[] | undefined): ShopItem[] {
  return (items || []).filter(isValidShopItem);
}

function isValidShopItem(item: ShopItem) {
  if (!item.id || !item.name || item.cost < 0) {
    return false;
  }
  if (item.kind === "consumable") {
    return item.amount > 0 && (item.type === "health" || item.type === "mana");
  }
  if (item.kind === "equipment") {
    return Boolean(item.item);
  }
  return Boolean(item.relic);
}

function createHealthPotion(question: Question, now: number): ShopItem {
  const amount = HEALTH_POTION_BASE_AMOUNT + question.difficulty * POTION_DIFFICULTY_AMOUNT;
  return { amount, cost: HEALTH_POTION_COST + question.difficulty, id: `shop-health-${question.id}-${now}`, kind: "consumable", name: "Minor Healing Potion", type: "health" };
}

function createManaPotion(question: Question, now: number): ShopItem {
  const amount = MANA_POTION_BASE_AMOUNT + question.difficulty * POTION_DIFFICULTY_AMOUNT;
  return { amount, cost: MANA_POTION_COST + question.difficulty, id: `shop-mana-${question.id}-${now}`, kind: "consumable", name: "Minor Mana Potion", type: "mana" };
}

function createShopEquipment(question: Question, stats: CharacterStats, now: number, index: number): ShopItem {
  const shopQuestion = createShopQuestion(question, index);
  const item = createDropItem(shopQuestion, stats, now + index, { rarityBonus: SHOP_ITEM_RARITY_BONUS * index });
  const cost = getEquipmentCost(item);
  return { cost, id: `shop-equipment-${item.id}`, item, kind: "equipment", name: item.name };
}

function createShopRelic(question: Question, now: number, index: number): ShopItem {
  const relic = rollRelic({ profile: { relics: [] } } as unknown as StudyState, `${question.id}:${now}:shop-relic:${index}`, { includeShop: true });
  return { cost: getRelicCost(relic), id: `shop-relic-${relic.id}-${now}-${index}`, kind: "relic", name: relic.name, relic };
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

function applyConsumable(state: StudyState, item: Extract<ShopItem, { kind: "consumable" }>, maxHealth: number, maxMana: number) {
  if (item.type === "health") {
    state.profile.health = Math.min(maxHealth, state.profile.health + item.amount);
    return;
  }
  state.profile.mana = Math.min(maxMana, state.profile.mana + item.amount);
}

function cloneShopState(state: StudyState): StudyState {
  return {
    ...state,
    profile: {
      ...state.profile,
      equipment: { ...state.profile.equipment },
      inventory: state.profile.inventory.map((item) => ({ ...item, modifiers: item.modifiers?.map((modifier) => ({ ...modifier })), stats: { ...item.stats } })),
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
