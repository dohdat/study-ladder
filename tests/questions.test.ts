import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";

const MIN_TEST_CASES_PER_QUESTION = 10;
const MIN_QUESTION_BANK_SIZE = 50;
const GENERATED_VARIANT_SUFFIX = /-\d+$/;
const VARIANT_TITLE_PATTERN = /\bvariant\b|\b\d+$/i;
const PLACEHOLDER_EXPLANATION_PATTERN = /follows directly|different input shape|\bRule:|For this input|the result is/i;
const TOPIC_DISTRIBUTION_TOLERANCE_PERCENT = 3;
const STOCK_PROMPT_TITLE_BY_ID: Record<string, string> = {
  "array-merge-intervals": "Merge Intervals",
  "array-two-sum": "Two Sum",
  "binary-search-rotated": "Search Rotated Array",
  "dp-climb-cost": "Minimum Climb Cost",
  "dp-coin-change": "Coin Change",
  "heap-top-k": "Top K Frequent",
  "stack-valid-brackets": "Valid Parentheses",
  "string-valid-palindrome": "Valid Palindrome",
  "tree-level-order": "Level Order Values"
};
const TARGET_TOPIC_DISTRIBUTION = [
  ["Arrays & Strings", 20],
  ["Hash Maps / Sets", 15],
  ["Trees & Binary Trees", 15],
  ["Graphs (BFS/DFS)", 15],
  ["Dynamic Programming", 10],
  ["Sliding Window / Two Pointers", 10],
  ["Binary Search", 5],
  ["Heaps / Priority Queues", 5],
  ["Linked Lists", 3],
  ["Stacks & Queues", 2]
] as const;

const TOPIC_BUCKETS: Record<string, string> = {
  Arrays: "Arrays & Strings",
  Backtracking: "Dynamic Programming",
  "Binary Search": "Binary Search",
  "Bit Manipulation": "Arrays & Strings",
  BFS: "Graphs (BFS/DFS)",
  Counting: "Arrays & Strings",
  DFS: "Graphs (BFS/DFS)",
  "Dynamic Programming": "Dynamic Programming",
  Filtering: "Arrays & Strings",
  Graphs: "Graphs (BFS/DFS)",
  Grid: "Graphs (BFS/DFS)",
  "Hash Map": "Hash Maps / Sets",
  "Hash Set": "Hash Maps / Sets",
  Heap: "Heaps / Priority Queues",
  Intervals: "Arrays & Strings",
  "Linear Scan": "Arrays & Strings",
  "Linked Lists": "Linked Lists",
  Math: "Arrays & Strings",
  Prefix: "Arrays & Strings",
  "Prefix Product": "Arrays & Strings",
  "Prefix Sum": "Arrays & Strings",
  Queues: "Stacks & Queues",
  Sliding: "Sliding Window / Two Pointers",
  "Sliding Window": "Sliding Window / Two Pointers",
  Sorting: "Arrays & Strings",
  Stacks: "Stacks & Queues",
  Strings: "Arrays & Strings",
  "Topological Sort": "Graphs (BFS/DFS)",
  Trees: "Trees & Binary Trees",
  Tries: "Hash Maps / Sets",
  "Two Pointers": "Sliding Window / Two Pointers"
};

describe("question bank", () => {
  it("contains a unique non-variant question bank", () => {
    expect(questions.length).toBeGreaterThanOrEqual(MIN_QUESTION_BANK_SIZE);
  });

  it("keeps question ids and function names unique", () => {
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.functionName)).size).toBe(questions.length);
  });

  it("does not include generated variant clones", () => {
    const generatedVariants = questions
      .filter((question) => question.id.startsWith("generated-"))
      .filter((question) => GENERATED_VARIANT_SUFFIX.test(question.id) || /\d+$/.test(question.functionName) || VARIANT_TITLE_PATTERN.test(question.title))
      .map((question) => question.id);

    expect(generatedVariants).toEqual([]);
  });

  it("keeps popular practice prompts as twisted variants", () => {
    const stockTitles = Object.entries(STOCK_PROMPT_TITLE_BY_ID)
      .flatMap(([id, stockTitle]) => {
        const question = questions.find((candidate) => candidate.id === id);
        if (!question) {
          return [`${id}: missing question`];
        }
        return question.title.toLowerCase() === stockTitle.toLowerCase() ? [`${id}: ${question.title}`] : [];
      });

    expect(stockTitles).toEqual([]);
  });

  it("keeps every question covered by at least ten runner test cases", () => {
    const underCovered = questions
      .filter((question) => !question.frontend)
      .filter((question) => question.tests.length < MIN_TEST_CASES_PER_QUESTION)
      .map((question) => `${question.id}: ${question.tests.length}`);

    expect(underCovered).toEqual([]);
  });

  it("keeps runner test cases unique per question", () => {
    const duplicateCases = questions
      .flatMap((question) => {
        const names = new Set<string>();
        const args = new Set<string>();
        return question.tests.flatMap((test) => {
          const failures: string[] = [];
          const normalizedName = test.name.toLowerCase();
          const normalizedArgs = JSON.stringify(test.args);
          if (names.has(normalizedName)) {
            failures.push(`${question.id}: duplicate test name "${test.name}"`);
          }
          if (args.has(normalizedArgs)) {
            failures.push(`${question.id}: duplicate args ${normalizedArgs}`);
          }
          names.add(normalizedName);
          args.add(normalizedArgs);
          return failures;
        });
      });

    expect(duplicateCases).toEqual([]);
  });

  it("does not show placeholder example explanations", () => {
    const placeholderExplanations = questions
      .flatMap((question) => question.examples.map((example, index) => ({ example, index, question })))
      .filter(({ example }) => PLACEHOLDER_EXPLANATION_PATTERN.test(example.explanation || ""))
      .map(({ index, question }) => `${question.id}: example ${index + 1}`);

    expect(placeholderExplanations).toEqual([]);
  });

  it("keeps primary topic distribution close to interview prep weights", () => {
    const distribution = new Map<string, number>();
    const codingQuestions = questions.filter((question) => !question.frontend);
    const targetBuckets = new Set<string>(TARGET_TOPIC_DISTRIBUTION.map(([bucket]) => bucket));
    for (const question of codingQuestions) {
      const bucket = TOPIC_BUCKETS[question.topics[0]] || question.topics[0];
      distribution.set(bucket, (distribution.get(bucket) || 0) + 1);
    }

    const unexpectedBuckets = [...distribution.keys()].filter((bucket) => !targetBuckets.has(bucket));
    const outOfRange = TARGET_TOPIC_DISTRIBUTION
      .map(([bucket, targetPercent]) => {
        const actualPercent = ((distribution.get(bucket) || 0) / codingQuestions.length) * 100;
        return { actualPercent, bucket, targetPercent };
      })
      .filter(({ actualPercent, targetPercent }) => Math.abs(actualPercent - targetPercent) > TOPIC_DISTRIBUTION_TOLERANCE_PERCENT)
      .map(({ actualPercent, bucket, targetPercent }) => `${bucket}: ${actualPercent.toFixed(1)}% vs ${targetPercent}%`);

    expect(unexpectedBuckets).toEqual([]);
    expect(outOfRange).toEqual([]);
  });
});
