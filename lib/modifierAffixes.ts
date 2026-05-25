import type { ItemModifierKey } from "../types/study";

export const MODIFIER_ROLL_RANGES: Record<ItemModifierKey, { min: number; max: number }> = {
  accuracyPercent: { min: 6, max: 18 },
  armor: { min: 3, max: 18 },
  armorPenetrationPercent: { min: 8, max: 32 },
  blockChancePercent: { min: 4, max: 14 },
  bonusDamageVsElitesPercent: { min: 12, max: 45 },
  bonusDamageWhileFullHealthPercent: { min: 12, max: 40 },
  bonusDamageWhileLowHealthPercent: { min: 12, max: 50 },
  bossEntryHeal: { min: 12, max: 30 },
  blockBreakDamagePercent: { min: 25, max: 80 },
  blockedEnemyDamagePercent: { min: 20, max: 50 },
  bossRelicChoiceBonus: { min: 1, max: 2 },
  bossShopRelicStock: { min: 1, max: 1 },
  bonusXpPercent: { min: 8, max: 25 },
  coldDamage: { min: 3, max: 25 },
  coldResistPercent: { min: 10, max: 45 },
  combatClearMeta: { min: 1, max: 3 },
  combatStartBlock: { min: 4, max: 14 },
  combatStartHeal: { min: 2, max: 6 },
  criticalChancePercent: { min: 4, max: 14 },
  criticalDamagePercent: { min: 20, max: 80 },
  damageReduction: { min: 1, max: 8 },
  damageVsArraysPercent: { min: 20, max: 40 },
  damageVsBfsPercent: { min: 25, max: 45 },
  damageVsDfsPercent: { min: 25, max: 45 },
  damageVsDynamicProgrammingPercent: { min: 25, max: 50 },
  damageVsGraphsPercent: { min: 25, max: 45 },
  damageVsHashMapPercent: { min: 20, max: 40 },
  damageVsStringsPercent: { min: 20, max: 40 },
  damageVsTreesPercent: { min: 25, max: 45 },
  debuffResistPercent: { min: 20, max: 100 },
  dodgeChancePercent: { min: 4, max: 14 },
  eliteDropBonusPercent: { min: 12, max: 35 },
  eliteStartHealthReductionPercent: { min: 15, max: 30 },
  eliteRelicChoiceBonus: { min: 1, max: 2 },
  enemyVulnerableSubmits: { min: 1, max: 3 },
  enemyWeakSubmits: { min: 1, max: 3 },
  enhancedDamagePercent: { min: 15, max: 55 },
  executeChancePercent: { min: 4, max: 15 },
  extraAttackChancePercent: { min: 4, max: 15 },
  firstSubmitDamagePercent: { min: 25, max: 80 },
  fireDamage: { min: 3, max: 25 },
  fireResistPercent: { min: 10, max: 45 },
  goldFindPercent: { min: 12, max: 45 },
  goldGainHeal: { min: 1, max: 5 },
  healthRegen: { min: 2, max: 10 },
  hexConfusedImmune: { min: 1, max: 1 },
  incomingDamagePercent: { min: -25, max: 35 },
  increasedHealingReceivedPercent: { min: 12, max: 45 },
  increasedLootDropChancePercent: { min: 12, max: 40 },
  increasedRareDropChancePercent: { min: 8, max: 24 },
  lowHealthClearHeal: { min: 8, max: 20 },
  lifeOnKill: { min: 5, max: 18 },
  lifeStealPercent: { min: 3, max: 12 },
  lightningDamage: { min: 3, max: 25 },
  lightningResistPercent: { min: 10, max: 45 },
  magicFindPercent: { min: 12, max: 35 },
  maxLife: { min: 10, max: 45 },
  minimumSubmitDamage: { min: 8, max: 18 },
  monsterDefeatHeal: { min: 3, max: 8 },
  noHintDamagePercent: { min: 20, max: 50 },
  noRunDamagePercent: { min: 25, max: 60 },
  parryChancePercent: { min: 4, max: 14 },
  physicalDamage: { min: 4, max: 30 },
  physicalResistPercent: { min: 8, max: 32 },
  poisonDamage: { min: 3, max: 25 },
  poisonResistPercent: { min: 10, max: 45 },
  preventFirstHpLoss: { min: 1, max: 1 },
  potionDurationBonus: { min: 1, max: 2 },
  reducedEnemyArmorPercent: { min: 8, max: 32 },
  reducedEnemyDamagePercent: { min: 6, max: 24 },
  relicChoiceBonus: { min: 1, max: 2 },
  relicRerollBonus: { min: 1, max: 2 },
  revealSubmitTestCount: { min: 1, max: 3 },
  resistancePenetrationPercent: { min: 8, max: 32 },
  blockFirstHit: { min: 1, max: 1 },
  freeHintPerRoom: { min: 1, max: 1 },
  revealTopicCount: { min: 1, max: 3 },
  revivePercent: { min: 25, max: 60 },
  shopDiscountPercent: { min: 8, max: 25 },
  shopPriceIncreasePercent: { min: 10, max: 30 },
  shopRelicStock: { min: 1, max: 2 },
  smallHitToOneThreshold: { min: 4, max: 7 },
  skipRelicMaxLife: { min: 4, max: 10 },
  skipRelicMetaBonus: { min: 2, max: 8 },
  submitFailDamageStackPercent: { min: 8, max: 18 },
  fifthSubmitDamagePercent: { min: 50, max: 120 },
  thornsDamage: { min: 3, max: 12 },
  timerDamagePercent: { min: 10, max: 30 },
  timerPenaltyPercent: { min: 10, max: 25 },
  timerPauseSeconds: { min: 30, max: 90 },
  treasureRelicChancePercent: { min: 10, max: 35 },
  vulnerableConstrictedImmune: { min: 1, max: 1 }
};

export const RELIC_UTILITY_MODIFIER_KEYS: ItemModifierKey[] = [
  "blockFirstHit",
  "bossEntryHeal",
  "bossRelicChoiceBonus",
  "bossShopRelicStock",
  "blockBreakDamagePercent",
  "blockedEnemyDamagePercent",
  "combatClearMeta",
  "combatStartBlock",
  "combatStartHeal",
  "damageVsArraysPercent",
  "damageVsBfsPercent",
  "damageVsDfsPercent",
  "damageVsDynamicProgrammingPercent",
  "damageVsGraphsPercent",
  "damageVsHashMapPercent",
  "damageVsStringsPercent",
  "damageVsTreesPercent",
  "debuffResistPercent",
  "eliteStartHealthReductionPercent",
  "eliteRelicChoiceBonus",
  "enemyVulnerableSubmits",
  "enemyWeakSubmits",
  "firstSubmitDamagePercent",
  "freeHintPerRoom",
  "goldGainHeal",
  "hexConfusedImmune",
  "lowHealthClearHeal",
  "minimumSubmitDamage",
  "monsterDefeatHeal",
  "potionDurationBonus",
  "preventFirstHpLoss",
  "revealTopicCount",
  "revivePercent",
  "shopDiscountPercent",
  "shopRelicStock",
  "smallHitToOneThreshold",
  "skipRelicMaxLife",
  "skipRelicMetaBonus",
  "noHintDamagePercent",
  "noRunDamagePercent",
  "relicChoiceBonus",
  "relicRerollBonus",
  "revealSubmitTestCount",
  "submitFailDamageStackPercent",
  "fifthSubmitDamagePercent",
  "thornsDamage",
  "timerDamagePercent",
  "timerPenaltyPercent",
  "timerPauseSeconds",
  "treasureRelicChancePercent",
  "vulnerableConstrictedImmune"
];
const RELIC_UTILITY_MODIFIER_KEY_SET = new Set<ItemModifierKey>(RELIC_UTILITY_MODIFIER_KEYS);

export const MODIFIER_ROLL_KEYS = (Object.keys(MODIFIER_ROLL_RANGES) as ItemModifierKey[]).filter((key) => !RELIC_UTILITY_MODIFIER_KEY_SET.has(key));
export const ALL_MODIFIER_KEYS = [...MODIFIER_ROLL_KEYS, ...RELIC_UTILITY_MODIFIER_KEYS];

export const MODIFIER_ARCHETYPES: Array<{ id: string; label: string; keys: ItemModifierKey[] }> = [
  { id: "crit-chain", label: "Critical chain", keys: ["criticalChancePercent", "criticalDamagePercent", "accuracyPercent", "extraAttackChancePercent"] },
  { id: "executioner", label: "Executioner", keys: ["executeChancePercent", "armorPenetrationPercent", "reducedEnemyArmorPercent", "physicalDamage"] },
  { id: "berserker", label: "Berserker", keys: ["bonusDamageWhileLowHealthPercent", "lifeStealPercent", "lifeOnKill", "enhancedDamagePercent"] },
  { id: "bulwark", label: "Bulwark", keys: ["damageReduction", "armor", "blockChancePercent", "parryChancePercent", "maxLife"] },
  { id: "duelist", label: "Duelist", keys: ["dodgeChancePercent", "parryChancePercent", "accuracyPercent", "criticalChancePercent"] },
  { id: "elemental-fire", label: "Fire pressure", keys: ["fireDamage", "resistancePenetrationPercent", "enhancedDamagePercent", "fireResistPercent"] },
  { id: "elemental-cold", label: "Cold pressure", keys: ["coldDamage", "resistancePenetrationPercent", "criticalChancePercent", "coldResistPercent"] },
  { id: "elemental-lightning", label: "Lightning pressure", keys: ["lightningDamage", "resistancePenetrationPercent", "extraAttackChancePercent", "lightningResistPercent"] },
  { id: "elemental-poison", label: "Poison pressure", keys: ["poisonDamage", "resistancePenetrationPercent", "executeChancePercent", "poisonResistPercent"] },
  { id: "elite-hunter", label: "Elite hunter", keys: ["bonusDamageVsElitesPercent", "eliteDropBonusPercent", "armorPenetrationPercent", "magicFindPercent"] },
  { id: "treasure-hunter", label: "Treasure hunter", keys: ["magicFindPercent", "increasedRareDropChancePercent", "increasedLootDropChancePercent", "goldFindPercent"] },
  { id: "momentum", label: "Momentum", keys: ["extraAttackChancePercent", "timerDamagePercent", "criticalChancePercent", "bonusXpPercent"] },
  { id: "sustain", label: "Sustain", keys: ["lifeOnKill", "healthRegen", "increasedHealingReceivedPercent", "maxLife"] },
  { id: "full-health-burst", label: "Full-health burst", keys: ["bonusDamageWhileFullHealthPercent", "criticalDamagePercent", "maxLife", "damageReduction"] },
  { id: "resistance-wall", label: "Resistance wall", keys: ["physicalResistPercent", "fireResistPercent", "coldResistPercent", "lightningResistPercent", "poisonResistPercent", "reducedEnemyDamagePercent"] }
];

export function getModifierRollRange(key: ItemModifierKey) {
  return MODIFIER_ROLL_RANGES[key];
}

export function getSynergyModifierKeys(seed: string, count: number, existingKeys: Iterable<ItemModifierKey> = []) {
  const picked = new Set(existingKeys);
  const result: ItemModifierKey[] = [];
  for (let attempt = 0; result.length < count && attempt < MODIFIER_ARCHETYPES.length * 2; attempt += 1) {
    const archetype = pickModifierArchetype(`${seed}:archetype:${attempt}`);
    for (const key of archetype.keys) {
      if (result.length >= count) {
        break;
      }
      if (!picked.has(key)) {
        picked.add(key);
        result.push(key);
      }
    }
  }
  for (const key of MODIFIER_ROLL_KEYS) {
    if (result.length >= count) {
      break;
    }
    if (!picked.has(key)) {
      picked.add(key);
      result.push(key);
    }
  }
  return result;
}

function pickModifierArchetype(seed: string) {
  return MODIFIER_ARCHETYPES[Math.floor(getAffixRoll(seed) * MODIFIER_ARCHETYPES.length) % MODIFIER_ARCHETYPES.length];
}

function getAffixRoll(seed: string) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}
