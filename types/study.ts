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
  draft?: string;
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
    hintsBought: number;
    startedAt: number;
    lastStudiedAt: number | null;
  };
  cards: Record<string, CardState>;
};

export type RunResult = {
  name: string;
  pass: boolean;
  args: string;
  expected: string;
  actual: string;
};
