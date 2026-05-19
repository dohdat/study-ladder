import type { DamageType, ElementalDamageType, ItemModifierKey } from "../types/study";

export type ElementalResistances = Record<ElementalDamageType, number>;

export const ELEMENTAL_DAMAGE_TYPES: ElementalDamageType[] = ["fire", "cold", "lightning", "poison"];
export const DAMAGE_TYPES: DamageType[] = ["physical", ...ELEMENTAL_DAMAGE_TYPES];
export const MAX_ELEMENTAL_RESISTANCE_PERCENT = 75;
const PERCENT = 100;

const RESISTANCE_MODIFIERS: Record<ElementalDamageType, ItemModifierKey> = {
  cold: "coldResistPercent",
  fire: "fireResistPercent",
  lightning: "lightningResistPercent",
  poison: "poisonResistPercent"
};

export function getResistanceModifierKey(element: ElementalDamageType) {
  return RESISTANCE_MODIFIERS[element];
}

export function getResistancesFromModifiers(modifiers: Record<ItemModifierKey, number>): ElementalResistances {
  return {
    cold: clampResistance(modifiers.coldResistPercent),
    fire: clampResistance(modifiers.fireResistPercent),
    lightning: clampResistance(modifiers.lightningResistPercent),
    poison: clampResistance(modifiers.poisonResistPercent)
  };
}

export function applyElementalResistance(amount: number, element: DamageType | null | undefined, resistances: ElementalResistances) {
  if (!element || element === "physical") {
    return amount;
  }
  return Math.max(1, Math.round(amount * (1 - resistances[element] / PERCENT)));
}

function clampResistance(value: number) {
  return Math.min(MAX_ELEMENTAL_RESISTANCE_PERCENT, Math.max(0, Math.round(value || 0)));
}
