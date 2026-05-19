import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import { buyShopItem, createShopStock } from "../lib/shopCore";
import { applyScheduleResult, defaultState, getEffectiveCharacterStats, getMaxHealth, getMaxMana, MAX_HEALTH } from "../lib/studyCore";

describe("shopCore", () => {
  it("creates potions, basic equipment, and relic stock from a completed question", () => {
    const state = defaultState();
    const stock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);

    expect(stock.some((item) => item.kind === "consumable" && item.type === "health")).toBe(true);
    expect(stock.some((item) => item.kind === "consumable" && item.type === "mana")).toBe(true);
    expect(stock.some((item) => item.kind === "consumable" && item.type === "random")).toBe(true);
    expect(stock.filter((item) => item.kind === "consumable")).toHaveLength(3);
    expect(stock.filter((item) => item.kind === "equipment")).toHaveLength(5);
    expect(stock.filter((item) => item.kind === "relic")).toHaveLength(3);
    const relicIds = stock.filter((item) => item.kind === "relic").map((item) => item.relic.id);
    expect(new Set(relicIds).size).toBe(relicIds.length);
    expect(stock.filter((item) => item.kind === "relic").every((item) => item.relic.rarity !== "boss")).toBe(true);
    const equipmentKeys = stock.filter((item) => item.kind === "equipment").map((item) => item.item.wikiImagePath || item.item.name);
    expect(new Set(equipmentKeys).size).toBe(equipmentKeys.length);
    expect(stock.filter((item) => item.kind === "equipment").every((item) => Boolean(item.item.wikiCategory && item.item.wikiImagePath))).toBe(true);
    expect(stock.filter((item) => item.kind === "equipment").every((item) => !item.item.wikiTierGroup || !["Satanic", "Satanic Set", "Heroic", "Unholy", "Angelic"].includes(item.item.wikiTierGroup))).toBe(true);
    expect(stock.filter((item) => item.kind === "equipment").every((item) => item.item.rarity === "common")).toBe(true);
    expect(stock.filter((item) => item.kind === "equipment").every((item) => item.item.wikiRarityLabel === "Normal")).toBe(true);
    expect(stock.filter((item) => item.kind === "equipment").every((item) => item.item.wikiLevel && item.item.wikiLevel < 20)).toBe(true);
    expect(stock.filter((item) => item.kind === "equipment").every((item) => Object.values(item.item.stats).filter(Boolean).length <= 1 && !(item.item.modifiers || []).length)).toBe(true);
    expect(new Set(stock.filter((item) => item.kind === "equipment").map((item) => item.item.slot)).size).toBe(5);
    expect(stock.filter((item) => item.kind === "relic").every((item) => !item.relic.wikiLevel || item.relic.wikiLevel <= 1)).toBe(true);
    expect(stock.filter((item) => item.kind === "relic").every((item) => !item.relic.wikiTierGroup || !["Satanic", "Satanic Set", "Heroic", "Unholy", "Angelic"].includes(item.relic.wikiTierGroup))).toBe(true);
  });

  it("refreshes shop stock only after a successful schedule result", () => {
    let state = defaultState();
    const starterStockIds = state.profile.shopStock.map((item) => item.id);
    state = applyScheduleResult(state, questions[0].id, false, "bad", 1000);
    expect(state.profile.shopStock.map((item) => item.id)).toEqual(starterStockIds);

    state = applyScheduleResult(state, questions[0].id, true, "ok", 2000);
    const firstStockIds = state.profile.shopStock.map((item) => item.id);
    expect(firstStockIds).toHaveLength(11);
    expect(firstStockIds).not.toEqual(starterStockIds);

    const failedAgain = applyScheduleResult(state, questions[0].id, false, "bad", 3000);
    expect(failedAgain.profile.shopStock.map((item) => item.id)).toEqual(firstStockIds);
  });

  it("buys consumables, equipment, and relics from stock", () => {
    let state = defaultState();
    state.profile.coins = 500;
    state.profile.health = MAX_HEALTH - 20;
    state.profile.shopStock = createShopStock(questions[0], getEffectiveCharacterStats(state), 1000);

    const healthPotion = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "health");
    expect(healthPotion).toBeTruthy();
    state = buyShopItem(state, healthPotion?.id || "", getMaxHealth(state), getMaxMana(state));
    expect(state.profile.health).toBe(MAX_HEALTH - 10);
    expect(state.profile.shopStock.some((item) => item.id === healthPotion?.id)).toBe(false);

    const randomPotion = state.profile.shopStock.find((item) => item.kind === "consumable" && item.type === "random");
    expect(randomPotion).toBeTruthy();
    state.profile.health = MAX_HEALTH - 30;
    state.profile.mana = 0;
    state = buyShopItem(state, randomPotion?.id || "", getMaxHealth(state), getMaxMana(state));
    expect(state.profile.health).toBe(MAX_HEALTH - 30);
    expect(state.profile.mana).toBe(0);
    expect(state.profile.activePotionEffects).toHaveLength(1);
    expect(state.profile.activePotionEffects[0].roomsRemaining).toBe(3);
    expect(state.profile.shopStock.some((item) => item.id === randomPotion?.id)).toBe(false);

    const equipment = state.profile.shopStock.find((item) => item.kind === "equipment");
    expect(equipment).toBeTruthy();
    state = buyShopItem(state, equipment?.id || "", getMaxHealth(state), getMaxMana(state));
    expect(state.profile.inventory.some((item) => item.id === (equipment?.kind === "equipment" ? equipment.item.id : ""))).toBe(true);

    const relic = state.profile.shopStock.find((item) => item.kind === "relic");
    expect(relic).toBeTruthy();
    state = buyShopItem(state, relic?.id || "", getMaxHealth(state), getMaxMana(state));
    expect(state.profile.relics.some((item) => item.id === (relic?.kind === "relic" ? relic.relic.id : ""))).toBe(true);
  });
});
