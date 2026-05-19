import type { ItemModifierKey } from "../types/study";

export const MODIFIER_FORMATTERS: Record<ItemModifierKey, (value: number) => string> = {
  bonusXpPercent: (value) => `+${value}% XP`,
  coldResistPercent: (value) => `+${value}% Cold Res`,
  criticalChancePercent: (value) => `+${value}% Crit`,
  damageReduction: (value) => `Damage -${value}`,
  enhancedDamagePercent: (value) => `+${value}% Damage`,
  fireResistPercent: (value) => `+${value}% Fire Res`,
  goldFindPercent: (value) => `+${value}% Gold`,
  lifeOnKill: (value) => `+${value} Life/Sub`,
  lightningResistPercent: (value) => `+${value}% Lightning Res`,
  magicFindPercent: (value) => `+${value}% Magic Find`,
  manaOnKill: (value) => `+${value} Mana/Sub`,
  maxLife: (value) => `+${value} Max Life`,
  maxMana: (value) => `+${value} Max Mana`,
  poisonResistPercent: (value) => `+${value}% Poison Res`
};

export function formatModifier(key: ItemModifierKey, value: number) {
  return MODIFIER_FORMATTERS[key](value);
}
