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

export type EquipmentSlot =
  | "mainHand"
  | "offHand"
  | "headgear"
  | "armor"
  | "headAccessory"
  | "eyewear"
  | "bodyAccessory"
  | "backAccessory"
  | "feet";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type ItemModifierKey =
  | "bonusXpPercent"
  | "criticalChancePercent"
  | "damageReduction"
  | "enhancedDamagePercent"
  | "goldFindPercent"
  | "lifeOnKill"
  | "magicFindPercent"
  | "manaOnKill"
  | "maxLife"
  | "maxMana";

export type ItemModifier = {
  key: ItemModifierKey;
  value: number;
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
};

export type ShopConsumableType = "health" | "mana";

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
    statPoints: number;
    statPointsAwardedLevel: number;
    hintsBought: number;
    startedAt: number;
    lastStudiedAt: number | null;
    stats: CharacterStats;
    inventory: InventoryItem[];
    equipment: Record<EquipmentSlot, string | null>;
    shopLastRefreshedAt: number | null;
    shopStock: ShopItem[];
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
