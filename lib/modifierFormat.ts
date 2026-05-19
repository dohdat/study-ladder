import type { ItemModifierKey } from "../types/study";

export const MODIFIER_FORMATTERS: Partial<Record<ItemModifierKey, (value: number) => string>> = {
  accuracyPercent: (value) => `+${value}% Accuracy`,
  armor: (value) => `+${value} Armor`,
  armorPenetrationPercent: (value) => `+${value}% Armor Pen`,
  blockChancePercent: (value) => `+${value}% Block`,
  bonusDamageVsElitesPercent: (value) => `+${value}% vs Elites`,
  bonusDamageWhileFullHealthPercent: (value) => `+${value}% Dmg Full HP`,
  bonusDamageWhileLowHealthPercent: (value) => `+${value}% Dmg Low HP`,
  bonusXpPercent: (value) => `+${value}% XP`,
  coldResistPercent: (value) => `+${value}% Cold Res`,
  coldDamage: (value) => `+${value} Cold Dmg`,
  criticalChancePercent: (value) => `+${value}% Crit`,
  criticalDamagePercent: (value) => `+${value}% Crit Dmg`,
  damageReduction: (value) => `Damage -${value}`,
  dodgeChancePercent: (value) => `+${value}% Dodge`,
  eliteDropBonusPercent: (value) => `+${value}% Elite Drop`,
  enhancedDamagePercent: (value) => `+${value}% Damage`,
  executeChancePercent: (value) => `+${value}% Execute`,
  extraAttackChancePercent: (value) => `+${value}% Extra Hit`,
  fireResistPercent: (value) => `+${value}% Fire Res`,
  fireDamage: (value) => `+${value} Fire Dmg`,
  goldFindPercent: (value) => `+${value}% Gold`,
  healthRegen: (value) => `+${value} Regen`,
  increasedHealingReceivedPercent: (value) => `+${value}% Healing`,
  increasedLootDropChancePercent: (value) => `+${value}% Drops`,
  increasedRareDropChancePercent: (value) => `+${value}% Rare Drops`,
  lifeOnKill: (value) => `+${value} Life/Sub`,
  lifeStealPercent: (value) => `+${value}% Life Steal`,
  lightningResistPercent: (value) => `+${value}% Lightning Res`,
  lightningDamage: (value) => `+${value} Lightning Dmg`,
  magicFindPercent: (value) => `+${value}% Magic Find`,
  maxLife: (value) => `+${value} Max Life`,
  maxMana: (value) => `+${value} Max Mana`,
  parryChancePercent: (value) => `+${value}% Parry`,
  physicalDamage: (value) => `+${value} Physical Dmg`,
  physicalResistPercent: (value) => `+${value}% Physical Res`,
  poisonDamage: (value) => `+${value} Poison Dmg`,
  poisonResistPercent: (value) => `+${value}% Poison Res`,
  reducedEnemyArmorPercent: (value) => `-${value}% Enemy Armor`,
  reducedEnemyDamagePercent: (value) => `-${value}% Enemy Dmg`,
  resistancePenetrationPercent: (value) => `+${value}% Resist Pen`
};

export function formatModifier(key: ItemModifierKey, value: number) {
  return MODIFIER_FORMATTERS[key]?.(value) || "";
}
