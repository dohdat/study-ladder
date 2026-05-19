import { EQUIPMENT_SLOTS, createDropItem } from "./itemCore";
import { getRelicCost, grantRelic, rollRelic } from "./relicCore";
import type { ActivePotionEffect, CharacterStats, Difficulty, Question, ShopItem, StudyState } from "../types/study";

const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const HEALTH_POTION_BASE_AMOUNT = 20;
const MANA_POTION_BASE_AMOUNT = 12;
const RANDOM_POTION_BASE_AMOUNT = 14;
const HEALTH_POTION_COST = 16;
const MANA_POTION_COST = 12;
const RANDOM_POTION_COST = 20;
const POTION_DIFFICULTY_AMOUNT = 4;
const EQUIPMENT_STOCK_COUNT = 5;
const RELIC_STOCK_COUNT = 3;
const RANDOM_POTION_DURATION_ROOMS = 3;
const SHOP_RATING_DISCOUNT = 180;
const SHOP_RATING_STEP = 45;
const MIN_SHOP_RATING = 1000;
const MAX_SHOP_DIFFICULTY: Difficulty = 5;
const SHOP_ITEM_RARITY_BONUS = 0.04;
const ITEM_LEVEL_COST_MULTIPLIER = 3;
const ITEM_STAT_COST_MULTIPLIER = 6;
const COMMON_RARITY_COST = 8;
const MERCHANT_RELIC_RARITIES = ["common", "uncommon", "rare", "shop"] as const;
type ShopStockOptions = { maxItemLevel?: number };

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
    createHealthPotion(question, now),
    createManaPotion(question, now),
    createRandomPotion(question, now),
    ...createShopEquipmentStock(question, stats, now, resolvedOptions),
    ...relics
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
  return dedupeShopStock((items || []).filter(isValidShopItem));
}

function isValidShopItem(item: ShopItem) {
  if (!item.id || !item.name || item.cost < 0) {
    return false;
  }
  if (item.kind === "consumable") {
    return item.amount > 0 && (item.type === "health" || item.type === "mana" || item.type === "random");
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

function createRandomPotion(question: Question, now: number): ShopItem {
  const amount = RANDOM_POTION_BASE_AMOUNT + question.difficulty * POTION_DIFFICULTY_AMOUNT;
  return { amount, cost: RANDOM_POTION_COST + question.difficulty, id: `shop-random-${question.id}-${now}`, kind: "consumable", name: "Unstable Potion", type: "random" };
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

function createShopRelic(question: Question, now: number, index: number, options: ShopStockOptions): ShopItem {
  const relic = rollRelic({ profile: { relics: [] } } as unknown as StudyState, `${question.id}:${now}:shop-relic:${index}`, { includeShop: true, maxItemLevel: options.maxItemLevel, minRarity: [...MERCHANT_RELIC_RARITIES] });
  return { cost: getRelicCost(relic), id: `shop-relic-${relic.id}-${now}-${index}`, kind: "relic", name: relic.name, relic };
}

function createShopRelics(question: Question, now: number, options: ShopStockOptions) {
  const relics: ShopItem[] = [];
  const seenIds = new Set<string>();
  for (let attempt = 0; relics.length < RELIC_STOCK_COUNT && attempt < RELIC_STOCK_COUNT * 12; attempt += 1) {
    const listing = createShopRelic(question, now, attempt, options);
    if (listing.kind === "relic" && !seenIds.has(listing.relic.id)) {
      seenIds.add(listing.relic.id);
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

function applyConsumable(state: StudyState, item: Extract<ShopItem, { kind: "consumable" }>, maxHealth: number, maxMana: number) {
  if (item.type === "health") {
    state.profile.health = Math.min(maxHealth, state.profile.health + item.amount);
    return;
  }
  if (item.type === "mana") {
    state.profile.mana = Math.min(maxMana, state.profile.mana + item.amount);
    return;
  }
  state.profile.activePotionEffects = [...(state.profile.activePotionEffects || []), createRandomPotionEffect(item, state.profile.spireRun.currentNodeId)];
}

function createRandomPotionEffect(item: Extract<ShopItem, { kind: "consumable" }>, sourceNodeId: string): ActivePotionEffect {
  const roll = getShopSeedRoll(`${item.id}:effect`);
  const base = {
    id: `${item.id}-effect`,
    roomsRemaining: RANDOM_POTION_DURATION_ROOMS,
    sourceNodeId
  };
  if (roll < 0.2) {
    return { ...base, modifiers: [{ key: "maxLife", value: item.amount }], name: "Witches Potion", stats: { constitution: 1 } };
  }
  if (roll < 0.4) {
    return { ...base, modifiers: [{ key: "maxMana", value: item.amount }], name: "Wizard Potion", stats: { intelligence: 1 } };
  }
  if (roll < 0.6) {
    return { ...base, modifiers: [{ key: "criticalChancePercent", value: 6 }], name: "Elixir of Death", stats: { strength: 1 } };
  }
  if (roll < 0.8) {
    return { ...base, modifiers: [{ key: "damageReduction", value: 1 }], name: "Blood of Spartan", stats: { constitution: 1, strength: 1 } };
  }
  return { ...base, modifiers: [{ key: "bonusXpPercent", value: 8 }, { key: "goldFindPercent", value: 8 }], name: "Bottle of Radogate", stats: { perception: 1 } };
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
