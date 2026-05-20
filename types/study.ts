export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type TestCase = {
  name: string;
  args: unknown[];
  expected: unknown;
};

export type Question = {
  id: string;
  title: string;
  difficulty: Difficulty;
  rating: number;
  topics: string[];
  functionName: string;
  prompt: string;
  constraints: string[];
  starter: string;
  hint?: string;
  examples: Array<{
    explanation?: string;
    input: string;
    output: string;
  }>;
  tests: TestCase[];
};

export type CardState = {
  dueAt: number;
  intervalDays: number;
  ease: number;
  reps: number;
  attempts: number;
  correct: number;
  failedSubmissions: number;
  hintsBought: number;
  lastResult: "pass" | "fail" | null;
  lastAttemptAt?: number;
  masteredAt?: number;
  monsterHealth?: number;
  draft?: string;
};

export type CharacterStats = {
  strength: number;
  constitution: number;
  perception: number;
  intelligence: number;
};

export type CharacterStatKey = keyof CharacterStats;

export type ElementalDamageType = "fire" | "cold" | "lightning" | "poison";
export type DamageType = "physical" | ElementalDamageType;

export type ActiveWarriorSkillId =
  | "bloodForBlood"
  | "cleave"
  | "execute"
  | "powerStrike"
  | "sureCrit"
  | "tripleStrike"
  | "whirlwindAssault";

export type WarriorSkillId =
  | ActiveWarriorSkillId
  | "arcaneFocus"
  | "axeMastery"
  | "bash"
  | "battleCry"
  | "battleCommand"
  | "battleOrders"
  | "battleTrance"
  | "bloodlust"
  | "burningPact"
  | "concentrate"
  | "doubleSwing"
  | "demonForm"
  | "findItem"
  | "findPotion"
  | "frenzy"
  | "goldMastery"
  | "grimWard"
  | "howl"
  | "ironSkin"
  | "naturalResistance"
  | "quickRecovery"
  | "rallyingCry"
  | "shieldMastery"
  | "shockwave"
  | "shout"
  | "swordMastery"
  | "treasureSense"
  | "taunt"
  | "warCry"
  | "whirlwind";

export type EquipmentSlot =
  | "mainHand"
  | "offHand"
  | "headgear"
  | "armor"
  | "headAccessory"
  | "eyewear"
  | "ringTwo"
  | "bodyAccessory"
  | "backAccessory"
  | "feet";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type ItemModifierKey =
  | "accuracyPercent"
  | "armor"
  | "armorPenetrationPercent"
  | "blockChancePercent"
  | "bonusDamageVsElitesPercent"
  | "bonusDamageWhileFullHealthPercent"
  | "bonusDamageWhileLowHealthPercent"
  | "bonusXpPercent"
  | "coldResistPercent"
  | "coldDamage"
  | "criticalChancePercent"
  | "criticalDamagePercent"
  | "damageReduction"
  | "dodgeChancePercent"
  | "eliteDropBonusPercent"
  | "enhancedDamagePercent"
  | "executeChancePercent"
  | "extraAttackChancePercent"
  | "fireResistPercent"
  | "fireDamage"
  | "goldFindPercent"
  | "healthRegen"
  | "increasedHealingReceivedPercent"
  | "increasedLootDropChancePercent"
  | "increasedRareDropChancePercent"
  | "lifeOnKill"
  | "lifeStealPercent"
  | "lightningResistPercent"
  | "lightningDamage"
  | "magicFindPercent"
  | "manaOnKill"
  | "maxLife"
  | "maxMana"
  | "parryChancePercent"
  | "physicalDamage"
  | "physicalResistPercent"
  | "poisonDamage"
  | "poisonResistPercent"
  | "reducedEnemyArmorPercent"
  | "reducedEnemyDamagePercent"
  | "resistancePenetrationPercent";

export type ItemModifier = {
  key: ItemModifierKey;
  value: number;
};

export type RelicRarity = "starter" | "common" | "uncommon" | "rare" | "boss" | "shop" | "event" | "blight" | "special";

export type RelicSource = "any" | "ironclad";

export type Relic = {
  id: string;
  name: string;
  rarity: RelicRarity;
  source: RelicSource;
  description: string;
  modifiers?: ItemModifier[];
  wikiCategory?: string;
  wikiImageFilter?: string;
  wikiImagePath?: string | null;
  wikiLevel?: number;
  wikiRarityLabel?: string;
  wikiStats?: string[];
  wikiTier?: string;
  wikiTierGroup?: string;
};

export type SpireNodeKind = "unknown" | "merchant" | "treasure" | "rest" | "enemy" | "elite" | "boss" | "event";

export type UnknownEncounterKind = "elite" | "monster" | "shop" | "treasure";
export type SpireAct = 1 | 2 | 3 | 4;
export type SpireDifficulty = "normal" | "nightmare" | "hell";

export type SpireMapNode = {
  column: number;
  id: string;
  kind: SpireNodeKind;
  rating: number;
  x: number;
  y: number;
  nextIds: string[];
};

export type SpireRun = {
  act: SpireAct;
  availableNodeIds: string[];
  difficulty: SpireDifficulty;
  tierIndex: number;
  currentNodeId: string;
  completedNodeIds: string[];
  mapOpen: boolean;
  mapSeed: number;
  nodes: SpireMapNode[];
  roomRewardClaims: Record<string, {
    gold?: number;
    itemIds?: string[];
    relicIds?: string[];
  }>;
  roundQuestionIds: string[];
  roundSolvedIds: string[];
  unknownEncounterMisses: Partial<Record<UnknownEncounterKind, number>>;
};

export type InventoryItem = {
  id: string;
  modifiers?: ItemModifier[];
  name: string;
  rarity: ItemRarity;
  setId?: string;
  slot: EquipmentSlot;
  stats: Partial<CharacterStats>;
  requirements: {
    level: number;
    stats: Partial<CharacterStats>;
  };
  wikiAps?: string;
  wikiCategory?: string;
  wikiDamage?: string;
  wikiDps?: string;
  wikiImageFilter?: string;
  wikiImagePath?: string | null;
  wikiLevel?: number;
  wikiRarityLabel?: string;
  wikiStats?: string[];
  wikiTier?: string;
  wikiTierGroup?: string;
  flavorText?: string;
};

export type InventoryItemPosition = {
  column: number;
  row: number;
  tab: number;
};

export type ShopConsumableType = "health" | "mana" | "random";

export type ActivePotionEffect = {
  id: string;
  modifiers: ItemModifier[];
  name: string;
  roomsRemaining: number;
  sourceNodeId?: string;
  stats: Partial<CharacterStats>;
};

export type ShopItem =
  | {
      amount: number;
      cost: number;
      id: string;
      kind: "consumable";
      name: string;
      type: ShopConsumableType;
    }
  | {
      cost: number;
      id: string;
      item: InventoryItem;
      kind: "equipment";
      name: string;
    }
  | {
      cost: number;
      id: string;
      kind: "relic";
      name: string;
      relic: Relic;
    };

export type StudyState = {
  mode: "leetcode" | "system";
  currentId: string | null;
  totalCorrect: number;
  streak: number;
  profile: {
    coins: number;
    experience: number;
    health: number;
    mana: number;
    rating: number;
    godMode: boolean;
    statPoints: number;
    statPointsAwardedLevel: number;
    hintsBought: number;
    startedAt: number;
    lastStudiedAt: number | null;
    stats: CharacterStats;
    skillRanks: Partial<Record<WarriorSkillId, number>>;
    activeSkill: ActiveWarriorSkillId | null;
    activePotionEffects: ActivePotionEffect[];
    inventory: InventoryItem[];
    inventorySlots: Record<string, InventoryItemPosition>;
    equipment: Record<EquipmentSlot, string | null>;
    shopLastRefreshedAt: number | null;
    shopStock: ShopItem[];
    relics: Relic[];
    spireRun: SpireRun;
    unlockedAchievementIds: string[];
  };
  cards: Record<string, CardState>;
};

export type RunResult = {
  name: string;
  pass: boolean;
  args: string;
  expected: string;
  actual: string;
  stdout?: string[];
};

export type ConsoleRunResult = {
  error?: string;
  ok: boolean;
  output: string[];
  results?: RunResult[];
  runtimeMs?: number;
};
