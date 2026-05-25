import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { createSpireRun, leaveSpireRoom } from "../lib/spireMapCore";
import { buyShopItem, createShopStock, getShopItemCost, getShopRelicSellValue, getShopSellableRelics, sellShopRelic } from "../lib/shopCore";
import { applyScheduleResult, defaultState, getEffectiveCharacterStats, getMaxHealth, MAX_HEALTH } from "../lib/studyCore";

describe("shopCore", () => {
  it("creates potions and larger relic stock for the roguelike shop", () => {
    const state = defaultState();
    const stock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);

    expect(stock.some((item) => item.kind === "consumable" && item.type === "health")).toBe(true);
    expect(stock.some((item) => item.kind === "consumable" && item.type === "random")).toBe(true);
    expect(stock.some((item) => item.kind === "consumable" && item.type === "mystery")).toBe(true);
    expect(stock.filter((item) => item.kind === "consumable")).toHaveLength(3);
    expect(stock.filter((item) => item.kind === "equipment")).toHaveLength(0);
    expect(stock.filter((item) => item.kind === "relic")).toHaveLength(5);
    const relicIds = stock.filter((item) => item.kind === "relic").map((item) => item.relic.id);
    expect(new Set(relicIds).size).toBe(relicIds.length);
    expect(stock.filter((item) => item.kind === "relic").every((item) => item.relic.rarity !== "boss")).toBe(true);
    expect(stock.filter((item) => item.kind === "relic").every((item) => !item.relic.wikiLevel || item.relic.wikiLevel <= 1)).toBe(true);
    expect(stock.filter((item) => item.kind === "relic").every((item) => !item.relic.wikiTierGroup || !["Satanic", "Satanic Set", "Heroic", "Unholy", "Angelic"].includes(item.relic.wikiTierGroup))).toBe(true);
  });

  it("can add a boss relic listing without changing normal merchant stock", () => {
    const state = defaultState();
    const stock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000, { bossRelicStock: 1, relicRollState: state });

    expect(stock.filter((item) => item.kind === "relic")).toHaveLength(6);
    expect(stock.filter((item) => item.kind === "relic" && item.relic.rarity === "boss")).toHaveLength(1);
  });

  it("refreshes shop stock only after a successful schedule result", () => {
    let state = defaultState();
    const starterStockIds = state.profile.shopStock.map((item) => item.id);
    state = applyScheduleResult(state, questions[0].id, false, "bad", 1000);
    expect(state.profile.shopStock.map((item) => item.id)).toEqual(starterStockIds);

    state = applyScheduleResult(state, questions[0].id, true, "ok", 2000);
    const firstStockIds = state.profile.shopStock.map((item) => item.id);
    expect(firstStockIds).toHaveLength(8);
    expect(firstStockIds).not.toEqual(starterStockIds);

    const failedAgain = applyScheduleResult(state, questions[0].id, false, "bad", 3000);
    expect(failedAgain.profile.shopStock.map((item) => item.id)).toEqual(firstStockIds);
  });

  it("buys consumables and relics from stock", () => {
    let state = defaultState();
    state.profile.coins = 500;
    state.profile.health = MAX_HEALTH - 20;
    state.profile.shopStock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);

    const healthPotion = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "health");
    expect(healthPotion).toBeTruthy();
    state = buyShopItem(state, healthPotion?.id || "", getMaxHealth(state));
    expect(state.profile.health).toBe(MAX_HEALTH - 10);
    expect(state.profile.shopStock.some((item) => item.id === healthPotion?.id)).toBe(false);

    const randomPotion = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "random");
    expect(randomPotion).toBeTruthy();
    state.profile.health = MAX_HEALTH - 30;
    state = buyShopItem(state, randomPotion?.id || "", getMaxHealth(state));
    expect(state.profile.health).toBe(MAX_HEALTH - 30);
    expect(state.profile.mana).toBe(0);
    expect(state.profile.activePotionEffects).toHaveLength(1);
    expect(state.profile.activePotionEffects[0].roomsRemaining).toBe(3);
    expect(state.profile.shopStock.some((item) => item.id === randomPotion?.id)).toBe(false);

    const mysteryBox = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "mystery");
    expect(mysteryBox).toBeTruthy();
    state = buyShopItem(state, mysteryBox?.id || "", getMaxHealth(state));
    expect(state.profile.activePotionEffects.some((effect) => effect.mysteryRelicSeed && effect.roomsRemaining === 3)).toBe(true);
    expect(state.profile.shopStock.some((item) => item.id === mysteryBox?.id)).toBe(false);

    expect(state.profile.shopStock.some((item) => item.kind === "equipment")).toBe(false);

    const relic = state.profile.shopStock.find((item) => item.kind === "relic");
    expect(relic).toBeTruthy();
    state = buyShopItem(state, relic?.id || "", getMaxHealth(state));
    expect(state.profile.relics.some((item) => item.id === (relic?.kind === "relic" ? relic.relic.id : ""))).toBe(true);
  });

  it("opens purchased mystery boxes into a random relic after three enemy rooms", () => {
    let state = defaultState();
    state.profile.coins = 500;
    state.profile.shopStock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);
    const mysteryBox = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "mystery");
    const run = createSpireRun(3500);
    const merchant = run.nodes.find((node) => node.kind === "merchant") || run.nodes[0];
    const enemy = run.nodes.find((node) => node.kind === "enemy") || run.nodes[0];
    const rooms = [
      { ...merchant, id: "shop-room", kind: "merchant" as const, nextIds: ["rest-room"] },
      { ...merchant, id: "rest-room", kind: "rest" as const, nextIds: ["enemy-1"] },
      { ...enemy, id: "enemy-1", kind: "enemy" as const, nextIds: ["enemy-2"] },
      { ...enemy, id: "enemy-2", kind: "enemy" as const, nextIds: ["enemy-3"] },
      { ...enemy, id: "enemy-3", kind: "enemy" as const, nextIds: [] }
    ];
    state.profile.spireRun = { ...run, availableNodeIds: ["shop-room"], currentNodeId: "shop-room", mapOpen: false, nodes: rooms };

    state = buyShopItem(state, mysteryBox?.id || "", getMaxHealth(state));
    expect(state.profile.activePotionEffects[0]).toMatchObject({ name: "Sealed Mystery Box", roomsRemaining: 3 });

    state = leaveSpireRoom(state, 2000);
    expect(state.profile.activePotionEffects[0]?.roomsRemaining).toBe(3);
    expect(state.profile.relics).toHaveLength(0);

    state = { ...state, profile: { ...state.profile, spireRun: { ...state.profile.spireRun, currentNodeId: "rest-room", mapOpen: false } } };
    state = leaveSpireRoom(state, 3000);
    expect(state.profile.activePotionEffects[0]?.roomsRemaining).toBe(3);
    expect(state.profile.relics).toHaveLength(0);

    state = { ...state, profile: { ...state.profile, spireRun: { ...state.profile.spireRun, currentNodeId: "enemy-1", mapOpen: false } } };
    state = leaveSpireRoom(state, 4000);
    expect(state.profile.activePotionEffects[0]?.roomsRemaining).toBe(2);
    expect(state.profile.relics).toHaveLength(0);

    state = { ...state, profile: { ...state.profile, spireRun: { ...state.profile.spireRun, currentNodeId: "enemy-2", mapOpen: false } } };
    state = leaveSpireRoom(state, 5000);
    expect(state.profile.activePotionEffects[0]?.roomsRemaining).toBe(1);
    expect(state.profile.relics).toHaveLength(0);

    state = { ...state, profile: { ...state.profile, spireRun: { ...state.profile.spireRun, currentNodeId: "enemy-3", mapOpen: false } } };
    state = leaveSpireRoom(state, 6000);
    expect(state.profile.activePotionEffects).toHaveLength(0);
    expect(state.profile.relics).toHaveLength(1);
  });

  it("extends random potion effects when a relic grants potion duration", () => {
    let state = defaultState();
    state.profile.coins = 500;
    state.profile.relics = [{
      description: "Test potion duration",
      id: "test-potion-duration",
      modifiers: [{ key: "potionDurationBonus", value: 2 }],
      name: "Test Potion Duration",
      rarity: "rare",
      source: "any"
    }];
    state.profile.shopStock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);
    const randomPotion = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "random");

    state = buyShopItem(state, randomPotion?.id || "", getMaxHealth(state));

    expect(state.profile.activePotionEffects[0].roomsRemaining).toBe(5);
  });

  it("allows one health potion purchase per shop even at full health", () => {
    let state = defaultState();
    state.profile.coins = 500;
    state.profile.health = getMaxHealth(state);
    state.profile.shopStock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);

    const healthPotions = state.profile.shopStock.filter((item) => item.kind === "consumable" && item.type === "health");
    expect(healthPotions).toHaveLength(1);
    const potion = healthPotions[0];
    const cost = getShopItemCost(state, potion);

    state = buyShopItem(state, potion.id, getMaxHealth(state));

    expect(state.profile.coins).toBe(500 - cost);
    expect(state.profile.health).toBe(getMaxHealth(state));
    expect(state.profile.shopStock.some((item) => item.kind === "consumable" && item.type === "health")).toBe(false);
  });

  it("applies relic shop discounts to affordability and purchase cost", () => {
    let state = defaultState();
    state.profile.shopStock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);
    state.profile.relics = [{
      description: "Test discount",
      id: "test-discount",
      modifiers: [{ key: "shopDiscountPercent", value: 25 }],
      name: "Test Discount",
      rarity: "common",
      source: "any"
    }];
    const listing = state.profile.shopStock.find((item) => item.kind === "relic");
    expect(listing).toBeTruthy();
    const discountedCost = listing ? getShopItemCost(state, listing) : 0;
    state.profile.coins = discountedCost;

    const purchased = buyShopItem(state, listing?.id || "", getMaxHealth(state));

    expect(discountedCost).toBeLessThan(listing?.cost || 0);
    expect(purchased.profile.coins).toBe(0);
  });

  it("sells owned relics for gold only while a merchant shop is open", () => {
    let state = defaultState();
    const relic = {
      description: "Test sell relic",
      id: "shop-sale-relic",
      modifiers: [],
      name: "Shop Sale Relic",
      rarity: "rare" as const,
      source: "any" as const
    };
    const blight = {
      description: "Test blight",
      id: "shop-sale-blight",
      modifiers: [],
      name: "Shop Sale Blight",
      rarity: "blight" as const,
      source: "any" as const
    };
    state.profile.relics = [relic, blight];
    state.profile.coins = 10;

    expect(sellShopRelic(state, relic.id)).toBe(state);

    const run = createSpireRun(3500);
    const merchant = run.nodes.find((node) => node.kind === "merchant") || run.nodes[0];
    state = { ...state, profile: { ...state.profile, spireRun: { ...run, currentNodeId: merchant.id, mapOpen: false } } };

    expect(getShopSellableRelics(state).map((item) => item.id)).toEqual([relic.id]);
    state = sellShopRelic(state, relic.id);

    expect(state.profile.relics.map((item) => item.id)).toEqual([blight.id]);
    expect(state.profile.coins).toBe(10 + getShopRelicSellValue(relic));
  });
});
