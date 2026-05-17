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
    expect(stock.filter((item) => item.kind === "equipment")).toHaveLength(4);
    expect(stock.filter((item) => item.kind === "relic")).toHaveLength(4);
  });

  it("refreshes shop stock only after a successful schedule result", () => {
    let state = defaultState();
    const starterStockIds = state.profile.shopStock.map((item) => item.id);
    state = applyScheduleResult(state, questions[0].id, false, "bad", 1000);
    expect(state.profile.shopStock.map((item) => item.id)).toEqual(starterStockIds);

    state = applyScheduleResult(state, questions[0].id, true, "ok", 2000);
    const firstStockIds = state.profile.shopStock.map((item) => item.id);
    expect(firstStockIds).toHaveLength(10);
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
    expect(state.profile.health).toBe(MAX_HEALTH);
    expect(state.profile.shopStock.some((item) => item.id === healthPotion?.id)).toBe(false);

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
