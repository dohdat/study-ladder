import type { Question } from "../types/study";

const curatedQuestions: Question[] = [
  {
    id: "array-first-duplicate",
    title: "First Duplicate",
    difficulty: 1,
    rating: 1050,
    topics: ["Hash Set", "Arrays"],
    functionName: "firstDuplicate",
    prompt: "Return the first number that appears twice while scanning left to right. If no number repeats, return -1.",
    constraints: ["Input length is between 0 and 1000.", "Numbers are integers.", "Keep the original array unchanged."],
    starter: "function firstDuplicate(nums) {\n  \n}",
    examples: [
      { input: "nums = [2, 1, 3, 5, 3, 2]", output: "3", explanation: "The first value whose second appearance is reached while scanning left to right is 3." },
      { input: "nums = [1, 2, 3]", output: "-1", explanation: "No value appears more than once, so return -1." }
    ],
    tests: [
      { name: "finds first repeated scan order", args: [[2, 1, 3, 5, 3, 2]], expected: 3 },
      { name: "returns -1 when unique", args: [[1, 2, 3, 4]], expected: -1 },
      { name: "handles immediate duplicate", args: [[7, 7, 1]], expected: 7 },
      { name: "prefers earliest second appearance", args: [[5, 1, 5, 1]], expected: 5 },
      { name: "handles negative duplicate", args: [[-1, 2, -1, 2]], expected: -1 },
      { name: "handles zero duplicate", args: [[0, 4, 5, 0]], expected: 0 },
      { name: "empty array has no duplicate", args: [[]], expected: -1 },
      { name: "single item has no duplicate", args: [[9]], expected: -1 },
      { name: "duplicate after long prefix", args: [[1, 2, 3, 4, 5, 6, 3]], expected: 3 },
      { name: "does not return later duplicate", args: [[1, 2, 3, 2, 1]], expected: 2 }
    ]
  },
  {
    id: "string-valid-palindrome",
    title: "Clean Palindrome",
    difficulty: 1,
    rating: 1120,
    topics: ["Two Pointers", "Strings"],
    functionName: "isCleanPalindrome",
    prompt: "Return true when the text is a palindrome after ignoring spaces, punctuation, and letter casing.",
    constraints: ["Only compare letters and digits.", "An empty cleaned string is a palindrome."],
    starter: "function isCleanPalindrome(text) {\n  \n}",
    examples: [
      { input: "text = \"A man, a plan, a canal: Panama\"", output: "true", explanation: "After removing punctuation and matching case, the cleaned text reads the same forward and backward." },
      { input: "text = \"race a car\"", output: "false", explanation: "The cleaned text has a mismatch, so it is not a palindrome." }
    ],
    tests: [
      { name: "ignores punctuation", args: ["A man, a plan, a canal: Panama"], expected: true },
      { name: "detects mismatch", args: ["race a car"], expected: false },
      { name: "handles empty cleaned text", args: ["!!!"], expected: true },
      { name: "handles mixed case word", args: ["Noon"], expected: true },
      { name: "compares digits too", args: ["1a2a1"], expected: true },
      { name: "detects digit mismatch", args: ["1a2"], expected: false },
      { name: "ignores spaces", args: ["never odd or even"], expected: true },
      { name: "single letter is palindrome", args: ["x"], expected: true },
      { name: "mixed punctuation mismatch", args: ["hello, ollehx"], expected: false },
      { name: "handles uppercase punctuation", args: ["Was it a car or a cat I saw?"], expected: true }
    ]
  },
  {
    id: "array-two-sum",
    title: "Two Sum Indices",
    difficulty: 1,
    rating: 1280,
    topics: ["Hash Map", "Arrays"],
    functionName: "twoSum",
    prompt: "Return the indices of two different numbers whose sum equals the target. Return the smaller index first. There is exactly one answer.",
    constraints: ["Input length is between 2 and 2000.", "Do not use the same element twice.", "Return an array like [0, 2]."],
    starter: "function twoSum(nums, target) {\n  \n}",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "Because nums[0] + nums[1] == 9, return [0, 1]." },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", explanation: "Because nums[1] + nums[2] == 6, return [1, 2]." }
    ],
    tests: [
      { name: "basic pair", args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { name: "middle pair", args: [[3, 2, 4], 6], expected: [1, 2] },
      { name: "uses duplicate values at different indices", args: [[3, 3], 6], expected: [0, 1] },
      { name: "handles negative complement", args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
      { name: "finds pair at edges", args: [[8, 1, 2, 7], 15], expected: [0, 3] },
      { name: "handles zero target", args: [[0, 4, 3, 0], 0], expected: [0, 3] },
      { name: "returns smaller index first", args: [[5, 75, 25], 100], expected: [1, 2] },
      { name: "finds late pair", args: [[1, 2, 3, 4, 5], 9], expected: [3, 4] },
      { name: "handles repeated non-answer", args: [[1, 1, 2, 4], 6], expected: [2, 3] },
      { name: "handles negative pair", args: [[-5, -2, -3, 9], -8], expected: [0, 2] }
    ]
  },
  {
    id: "string-longest-unique",
    title: "Longest Unique Window",
    difficulty: 2,
    rating: 1520,
    topics: ["Sliding Window", "Strings", "Hash Map"],
    functionName: "longestUniqueSubstring",
    prompt: "Return the length of the longest substring that contains no repeated characters.",
    constraints: ["Input length is between 0 and 5000.", "Characters are case-sensitive."],
    starter: "function longestUniqueSubstring(s) {\n  \n}",
    examples: [
      { input: "s = \"abcabcbb\"", output: "3", explanation: "The longest substring without repeated characters is \"abc\", with length 3." },
      { input: "s = \"bbbbb\"", output: "1", explanation: "Every longer substring repeats \"b\", so the longest unique window has length 1." }
    ],
    tests: [
      { name: "shrinks repeated window", args: ["abcabcbb"], expected: 3 },
      { name: "all same letters", args: ["bbbbb"], expected: 1 },
      { name: "empty string", args: [""], expected: 0 },
      { name: "late repeat", args: ["pwwkew"], expected: 3 },
      { name: "all unique", args: ["abcdef"], expected: 6 },
      { name: "case sensitive", args: ["aA"], expected: 2 },
      { name: "repeat at start", args: ["abba"], expected: 2 },
      { name: "repeat after gap", args: ["dvdf"], expected: 3 },
      { name: "space counts as character", args: ["a b c a"], expected: 5 },
      { name: "numeric string", args: ["112233"], expected: 2 }
    ]
  },
  {
    id: "array-merge-intervals",
    title: "Merge Intervals",
    difficulty: 2,
    rating: 1640,
    topics: ["Arrays", "Sorting", "Intervals"],
    functionName: "mergeIntervals",
    prompt: "Merge overlapping intervals and return them sorted by start time.",
    constraints: ["Each interval is [start, end].", "Touching intervals like [1, 3] and [3, 5] should merge.", "Do not mutate the original interval arrays."],
    starter: "function mergeIntervals(intervals) {\n  \n}",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10]]", output: "[[1,6],[8,10]]", explanation: "[1,3] overlaps [2,6], so they merge into [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "The intervals touch at 4, so they merge into one interval." }
    ],
    tests: [
      { name: "merges overlap", args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { name: "merges touching intervals", args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { name: "handles unsorted input", args: [[[5, 7], [1, 2], [2, 4]]], expected: [[1, 4], [5, 7]] },
      { name: "empty input", args: [[]], expected: [] },
      { name: "single interval", args: [[[2, 3]]], expected: [[2, 3]] },
      { name: "nested interval", args: [[[1, 10], [2, 3], [4, 8]]], expected: [[1, 10]] },
      { name: "keeps separated intervals", args: [[[1, 2], [4, 5], [7, 8]]], expected: [[1, 2], [4, 5], [7, 8]] },
      { name: "merges negative intervals", args: [[[-5, -1], [-3, 2], [4, 6]]], expected: [[-5, 2], [4, 6]] },
      { name: "merges chain overlaps", args: [[[1, 4], [2, 5], [5, 9]]], expected: [[1, 9]] },
      { name: "sorts before merging", args: [[[10, 12], [0, 1], [1, 2]]], expected: [[0, 2], [10, 12]] }
    ]
  },
  {
    id: "stack-valid-brackets",
    title: "Valid Brackets",
    difficulty: 2,
    rating: 1480,
    topics: ["Stacks", "Strings"],
    functionName: "validBrackets",
    prompt: "Return true if every opening bracket is closed by the same type of bracket in the correct order.",
    constraints: ["The string contains only (), {}, and [].", "An empty string is valid."],
    starter: "function validBrackets(s) {\n  \n}",
    examples: [
      { input: "s = \"()[]{}\"", output: "true", explanation: "Every opening bracket closes with the same bracket type in the correct order." },
      { input: "s = \"(]\"", output: "false", explanation: "The opening parenthesis cannot be closed by a square bracket." }
    ],
    tests: [
      { name: "valid mixed brackets", args: ["()[]{}"], expected: true },
      { name: "wrong type", args: ["(]"], expected: false },
      { name: "nested valid", args: ["{[]}"], expected: true },
      { name: "wrong order", args: ["([)]"], expected: false },
      { name: "empty string", args: [""], expected: true },
      { name: "single opener", args: ["("], expected: false },
      { name: "single closer", args: [")"], expected: false },
      { name: "deep nesting", args: ["((({[]})))"], expected: true },
      { name: "extra closer at end", args: ["(()))"], expected: false },
      { name: "extra opener at end", args: ["(()"], expected: false }
    ]
  },
  {
    id: "dp-climb-cost",
    title: "Minimum Climb Cost",
    difficulty: 3,
    rating: 2050,
    topics: ["Dynamic Programming"],
    functionName: "minClimbCost",
    prompt: "You can climb one or two steps at a time. Each step has a cost paid when you step on it. Return the minimum cost to reach just beyond the final step.",
    constraints: ["Input length is between 2 and 1000.", "Costs are non-negative integers.", "You may start on step 0 or step 1."],
    starter: "function minClimbCost(cost) {\n  \n}",
    examples: [
      { input: "cost = [10, 15, 20]", output: "15", explanation: "Start at step 1, pay 15, then climb beyond the final step." },
      { input: "cost = [1,100,1,1,1,100,1,1,100,1]", output: "6", explanation: "The cheapest route avoids the expensive 100-cost steps where possible." }
    ],
    tests: [
      { name: "short path", args: [[10, 15, 20]], expected: 15 },
      { name: "classic alternating costs", args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
      { name: "two steps", args: [[5, 9]], expected: 5 },
      { name: "prefers starting at step one", args: [[9, 1, 9]], expected: 1 },
      { name: "all zeros", args: [[0, 0, 0, 0]], expected: 0 },
      { name: "equal costs", args: [[2, 2, 2, 2]], expected: 4 },
      { name: "skip expensive middle", args: [[1, 100, 1]], expected: 2 },
      { name: "long steady costs", args: [[1, 2, 3, 4, 5, 6]], expected: 9 },
      { name: "expensive first step", args: [[100, 1, 1, 1]], expected: 2 },
      { name: "expensive last step can be skipped", args: [[1, 1, 100]], expected: 1 }
    ]
  },
  {
    id: "binary-search-rotated",
    title: "Search Rotated Array",
    difficulty: 3,
    rating: 2180,
    topics: ["Binary Search", "Arrays"],
    functionName: "searchRotated",
    prompt: "Return the index of target in a sorted array that was rotated at an unknown pivot. Return -1 when target is missing.",
    constraints: ["All numbers are unique.", "Aim for O(log n) time.", "Input length is between 0 and 5000."],
    starter: "function searchRotated(nums, target) {\n  \n}",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "After the rotation point between 7 and 0, the target 0 is found at index 4." },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1", explanation: "The target 3 is not present in the array." }
    ],
    tests: [
      { name: "finds in right sorted side", args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { name: "missing target", args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { name: "single element hit", args: [[1], 1], expected: 0 },
      { name: "single element miss", args: [[1], 0], expected: -1 },
      { name: "not rotated hit", args: [[1, 2, 3, 4, 5], 4], expected: 3 },
      { name: "pivot at end", args: [[2, 3, 4, 5, 1], 1], expected: 4 },
      { name: "finds left sorted side", args: [[6, 7, 8, 1, 2, 3, 4, 5], 7], expected: 1 },
      { name: "empty array", args: [[], 3], expected: -1 },
      { name: "two items rotated", args: [[2, 1], 1], expected: 1 },
      { name: "two items not rotated", args: [[1, 2], 1], expected: 0 }
    ]
  },
  {
    id: "tree-level-order",
    title: "Level Order Values",
    difficulty: 3,
    rating: 1980,
    topics: ["Trees", "Queue", "BFS"],
    functionName: "levelOrderValues",
    prompt: "Given a binary tree object with val, left, and right fields, return an array of values grouped by depth.",
    constraints: ["Return [] for a null root.", "Keep values left-to-right within each level."],
    starter: "function levelOrderValues(root) {\n  \n}",
    examples: [
      { input: "root = { val: 1, left: { val: 2 }, right: { val: 3 } }", output: "[[1],[2,3]]", explanation: "The root is level 0, and its left and right children form the next level." }
    ],
    tests: [
      { name: "balanced tree", args: [{ val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } }], expected: [[1], [2, 3]] },
      { name: "empty tree", args: [null], expected: [] },
      { name: "left leaning tree", args: [{ val: 4, left: { val: 5, left: { val: 6, left: null, right: null }, right: null }, right: null }], expected: [[4], [5], [6]] },
      { name: "single root", args: [{ val: 1, left: null, right: null }], expected: [[1]] },
      { name: "right leaning tree", args: [{ val: 1, left: null, right: { val: 2, left: null, right: { val: 3, left: null, right: null } } }], expected: [[1], [2], [3]] },
      { name: "complete three levels", args: [{ val: 1, left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } }, right: { val: 3, left: { val: 6, left: null, right: null }, right: { val: 7, left: null, right: null } } }], expected: [[1], [2, 3], [4, 5, 6, 7]] },
      { name: "missing left child", args: [{ val: 1, left: null, right: { val: 3, left: { val: 4, left: null, right: null }, right: null } }], expected: [[1], [3], [4]] },
      { name: "missing right child", args: [{ val: 1, left: { val: 2, left: null, right: { val: 5, left: null, right: null } }, right: null }], expected: [[1], [2], [5]] },
      { name: "string values", args: [{ val: "a", left: { val: "b", left: null, right: null }, right: { val: "c", left: null, right: null } }], expected: [["a"], ["b", "c"]],
      },
      { name: "zero value root", args: [{ val: 0, left: { val: -1, left: null, right: null }, right: null }], expected: [[0], [-1]] }
    ]
  },
  {
    id: "heap-top-k",
    title: "Top K Frequent",
    difficulty: 4,
    rating: 2720,
    topics: ["Hash Map", "Sorting"],
    functionName: "topKFrequent",
    prompt: "Return the k most frequent numbers. When frequencies tie, the smaller number should come first.",
    constraints: ["Return the result sorted by frequency descending, then value ascending.", "Input length is between 1 and 5000."],
    starter: "function topKFrequent(nums, k) {\n  \n}",
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", explanation: "1 appears three times and 2 appears two times, so they are the top two values." },
      { input: "nums = [4,4,1,1,2], k = 2", output: "[1,4]", explanation: "1 and 4 tie in frequency, so the smaller value comes first." }
    ],
    tests: [
      { name: "basic top two", args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { name: "tie sorts smaller first", args: [[4, 4, 1, 1, 2], 2], expected: [1, 4] },
      { name: "single item", args: [[9], 1], expected: [9] },
      { name: "returns all when k equals unique count", args: [[3, 3, 2, 1], 3], expected: [3, 1, 2] },
      { name: "negative values", args: [[-1, -1, -2, -2, -2, 3], 2], expected: [-2, -1] },
      { name: "zero participates in tie", args: [[0, 0, 1, 1, 2], 2], expected: [0, 1] },
      { name: "k one with clear winner", args: [[5, 5, 5, 6, 6], 1], expected: [5] },
      { name: "three way frequency tie", args: [[3, 2, 1], 2], expected: [1, 2] },
      { name: "larger mixed ranking", args: [[4, 4, 4, 2, 2, 3, 3, 3, 1], 3], expected: [3, 4, 2] },
      { name: "tie after top value", args: [[9, 9, 8, 7], 3], expected: [9, 7, 8] }
    ]
  },
  {
    id: "graph-shortest-path",
    title: "Shortest Path Length",
    difficulty: 4,
    rating: 2860,
    topics: ["Graphs", "BFS", "Queue"],
    functionName: "shortestPathLength",
    prompt: "Given directed edges [from, to], return the fewest edges needed to travel from start to target. Return -1 if target is unreachable.",
    constraints: ["Nodes are strings.", "Edges are unweighted.", "The graph may contain cycles."],
    starter: "function shortestPathLength(edges, start, target) {\n  \n}",
    examples: [
      { input: "edges = [[\"A\",\"B\"],[\"B\",\"C\"]], start = \"A\", target = \"C\"", output: "2", explanation: "The shortest path is A -> B -> C, which uses 2 edges." },
      { input: "edges = [[\"A\",\"B\"]], start = \"B\", target = \"A\"", output: "-1", explanation: "There is no directed path from B back to A." }
    ],
    tests: [
      { name: "finds two-hop path", args: [[["A", "B"], ["B", "C"], ["A", "D"]], "A", "C"], expected: 2 },
      { name: "same start and target", args: [[["A", "B"]], "A", "A"], expected: 0 },
      { name: "unreachable target", args: [[["A", "B"], ["C", "A"]], "B", "C"], expected: -1 },
      { name: "avoids cycle", args: [[["A", "B"], ["B", "A"], ["B", "C"]], "A", "C"], expected: 2 },
      { name: "direct edge", args: [[["A", "B"], ["B", "C"]], "A", "B"], expected: 1 },
      { name: "chooses shortest branch", args: [[["A", "B"], ["B", "D"], ["A", "C"], ["C", "D"]], "A", "D"], expected: 2 },
      { name: "empty edges with different nodes", args: [[], "A", "B"], expected: -1 },
      { name: "cycle without target", args: [[["A", "B"], ["B", "C"], ["C", "A"]], "A", "D"], expected: -1 },
      { name: "start not in graph", args: [[["A", "B"]], "X", "B"], expected: -1 },
      { name: "target reached after four hops", args: [[["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"]], "A", "E"], expected: 4 }
    ]
  },
  {
    id: "dp-coin-change",
    title: "Coin Change",
    difficulty: 5,
    rating: 3370,
    topics: ["Dynamic Programming"],
    functionName: "coinChange",
    prompt: "Return the fewest number of coins needed to make the amount. Return -1 when the amount cannot be made.",
    constraints: ["You may use each coin value unlimited times.", "Amount is between 0 and 10000.", "Coin values are positive integers."],
    starter: "function coinChange(coins, amount) {\n  \n}",
    examples: [
      { input: "coins = [1, 2, 5], amount = 11", output: "3", explanation: "11 can be made with 5 + 5 + 1, using 3 coins." },
      { input: "coins = [2], amount = 3", output: "-1", explanation: "Only coin value 2 is available, so amount 3 cannot be made." }
    ],
    tests: [
      { name: "uses mixed coins", args: [[1, 2, 5], 11], expected: 3 },
      { name: "impossible amount", args: [[2], 3], expected: -1 },
      { name: "zero amount", args: [[1], 0], expected: 0 },
      { name: "larger dynamic case", args: [[1, 3, 4], 6], expected: 2 },
      { name: "single coin exact", args: [[7], 14], expected: 2 },
      { name: "single coin impossible", args: [[5], 3], expected: -1 },
      { name: "prefers larger coin mix", args: [[1, 5, 10, 25], 30], expected: 2 },
      { name: "non greedy optimal", args: [[1, 3, 4], 10], expected: 3 },
      { name: "unordered coins", args: [[5, 1, 2], 4], expected: 2 },
      { name: "large impossible parity", args: [[4, 6], 7], expected: -1 }
    ]
  }
];

type TestInput = {
  args: unknown[];
  name: string;
};

type ExternalRatedQuestionSeed = {
  cases: TestInput[];
  constraints: string[];
  difficulty: Question["difficulty"];
  examples: Question["examples"];
  functionName: string;
  id: string;
  prompt: string;
  rating: number;
  source: {
    dislikes: number;
    likes: number;
    slug: string;
  };
  solver: (args: unknown[]) => unknown;
  starterArgs: string;
  title: string;
  topics: string[];
};

type TreeNode = {
  left?: TreeNode | null;
  right?: TreeNode | null;
  val: number;
};

type GeneratedFamily = {
  buildCase: (variant: number, testIndex: number) => TestInput;
  constraints: string[];
  count: number;
  difficulty: Question["difficulty"];
  explainExample?: (test: TestInput & { expected: unknown }, variant: number) => string;
  functionPrefix: string;
  prompt: (variant: number) => string;
  ratingBase: number;
  solver: (args: unknown[], variant: number) => unknown;
  starterArgs: string;
  title: (variant: number) => string;
  topics: string[];
};

const GENERATED_TEST_COUNT = 10;
const GENERATED_FAMILY_COUNT = 1;
const RATING_STEP = 17;

const EXTERNAL_RATED_QUESTION_SEEDS: ExternalRatedQuestionSeed[] = [
  {
    cases: makeCases([[[3, 3, 3, 3, 5, 5, 5, 2, 2, 7]], [[7, 7, 7, 7, 7, 7]], [[1, 2, 3, 4]], [[1, 1, 2, 2, 3, 3]], [[9, 8, 8, 7, 7, 7, 6, 6, 6, 6]], [[4, 4, 4, 2, 2, 1, 1, 1]], [[10]], [[5, 5, 6, 6, 7, 8, 8, 8]], [[1, 1, 1, 2, 2, 3, 4, 5]], [[2, 2, 2, 3, 3, 4, 4, 4, 4, 5]]], "removes frequent values first"),
    constraints: ["Remove all copies of each chosen value.", "Return the fewest distinct values needed.", "At least half of the original array length must be removed."],
    difficulty: 2,
    examples: [
      { input: "arr = [3,3,3,3,5,5,5,2,2,7]", output: "2", explanation: "Choosing 3 and 5 removes seven numbers, which is at least half the array." },
      { input: "arr = [7,7,7,7,7,7]", output: "1", explanation: "One chosen value removes the whole array." }
    ],
    functionName: "minValueSetToHalveArray",
    id: "external-reduce-array-half-v2",
    prompt: "Choose as few distinct values as possible so removing every occurrence of those values deletes at least half of the array.",
    rating: 1303,
    source: { dislikes: 154, likes: 3370, slug: "reduce-array-size-to-the-half" },
    solver: (args) => minValueSetToHalveArray(args[0] as number[]),
    starterArgs: "arr",
    title: "Value Set to Halve Array",
    topics: ["Arrays", "Hash Map", "Greedy"]
  },
  {
    cases: makeCases([[[2, 3, -1, 8, 4]], [[1, -1, 4]], [[2, 5]], [[0, 0, 0]], [[1, 2, 3, 3]], [[4, 1, -5, 2, 2]], [[10]], [[-1, -1, -1, 0, 1, 2]], [[3, 6, 2, 1, 7]], [[5, -2, 2, 0, 5]]], "checks left and right sums"),
    constraints: ["Return the smallest valid index.", "Left and right sums do not include the current value.", "Return -1 when no index balances the array."],
    difficulty: 2,
    examples: [
      { input: "nums = [2,3,-1,8,4]", output: "3", explanation: "The values before 8 sum to 4 and the values after it also sum to 4." },
      { input: "nums = [2,5]", output: "-1", explanation: "Neither index leaves equal sums on both sides." }
    ],
    functionName: "middleBalanceIndex",
    id: "external-middle-index-array",
    prompt: "Return the first index where the sum on the left equals the sum on the right.",
    rating: 1303,
    source: { dislikes: 80, likes: 1579, slug: "find-the-middle-index-in-array" },
    solver: (args) => middleBalanceIndex(args[0] as number[]),
    starterArgs: "nums",
    title: "Middle Balance Index",
    topics: ["Arrays", "Prefix Sum"]
  },
  {
    cases: makeCases([["011101"], ["00111"], ["1111"], ["00"], ["01001"], ["101010"], ["0001"], ["1100"], ["0101011"], ["1000001"]], "scores each valid binary split"),
    constraints: ["Split into two non-empty parts.", "Score equals zeros on the left plus ones on the right.", "Return the maximum possible score."],
    difficulty: 2,
    examples: [
      { input: 's = "011101"', output: "5", explanation: "Splitting after the first 0 gives one left zero and four right ones." },
      { input: 's = "1111"', output: "3", explanation: "The best split leaves three ones on the right." }
    ],
    functionName: "maxBinarySplitScore",
    id: "external-maximum-score-split-string",
    prompt: "Split a binary string into two non-empty parts and return the best zero-left plus one-right score.",
    rating: 1306,
    source: { dislikes: 7, likes: 71, slug: "maximum-score-of-a-split" },
    solver: (args) => maxBinarySplitScore(args[0] as string),
    starterArgs: "s",
    title: "Best Binary Split Score",
    topics: ["Arrays", "Prefix Sum", "Strings"]
  },
  {
    cases: makeCases([[[[1, 3], [2, 2], [3, 1]], 4], [[[5, 10], [2, 5], [4, 7], [3, 9]], 10], [[[1, 3]], 1], [[[2, 4], [3, 2]], 3], [[[10, 1], [1, 100]], 2], [[[4, 6], [2, 8], [1, 10]], 5], [[[3, 9], [3, 9]], 4], [[[2, 5], [8, 1]], 6], [[[6, 3], [4, 4], [2, 10]], 7], [[[1, 20], [9, 2], [5, 6]], 8]], "loads highest value boxes first"),
    constraints: ["Each box type is [boxCount, unitsPerBox].", "Take at most truckSize boxes total.", "Return the maximum units loaded."],
    difficulty: 2,
    examples: [
      { input: "boxTypes = [[1,3],[2,2],[3,1]], truckSize = 4", output: "8", explanation: "Load the 3-unit box, both 2-unit boxes, and one 1-unit box." },
      { input: "boxTypes = [[5,10],[2,5],[4,7],[3,9]], truckSize = 10", output: "91", explanation: "The truck fills from the highest units per box first." }
    ],
    functionName: "maximumTruckUnits",
    id: "external-maximum-units-truck-v2",
    prompt: "Given box counts and units per box, load the truck to maximize total units without exceeding its box capacity.",
    rating: 1310,
    source: { dislikes: 240, likes: 4047, slug: "maximum-units-on-a-truck" },
    solver: (args) => maximumTruckUnits(args[0] as number[][], args[1] as number),
    starterArgs: "boxTypes, truckSize",
    title: "Maximum Truck Units",
    topics: ["Arrays", "Sorting", "Greedy"]
  },
  {
    cases: makeCases([[[1, 1, 1]], [[1, 5, 2, 4, 1]], [[8]], [[3, 2, 1]], [[1, 2, 3]], [[0, 0, 0, 0]], [[5, 7, 7, 8]], [[2, 2, 3, 3]], [[10, 1, 2]], [[4, 4, 4, 10]]], "increments until strictly increasing"),
    constraints: ["Only increment values.", "Each +1 costs one operation.", "Return the minimum total operations."],
    difficulty: 2,
    examples: [
      { input: "nums = [1,1,1]", output: "3", explanation: "The cheapest strict sequence is [1,2,3]." },
      { input: "nums = [1,5,2,4,1]", output: "14", explanation: "Each value after 5 must be raised enough to stay above the previous value." }
    ],
    functionName: "minOpsStrictlyIncreasing",
    id: "external-min-ops-array-increasing",
    prompt: "Return the fewest increments needed to make the array strictly increasing.",
    rating: 1315,
    source: { dislikes: 69, likes: 1325, slug: "minimum-operations-to-make-the-array-increasing" },
    solver: (args) => minOpsStrictlyIncreasing(args[0] as number[]),
    starterArgs: "nums",
    title: "Strictly Increasing Fixes",
    topics: ["Arrays", "Greedy"]
  },
  {
    cases: makeCases([[[1, 3, 0, 0, 2, 0, 0, 4]], [[0, 0, 0, 2, 0, 0]], [[1, 2, 3]], [[0]], [[0, 1, 0, 0, 0]], [[5, 0, 0, 5, 0]], [[0, 0, 1, 0, 0, 0, 0]], [[2]], [[0, 0, 0, 0]], [[1, 0, 2, 0, 3, 0]]], "counts every all-zero subarray"),
    constraints: ["Count contiguous subarrays made only of zeroes.", "Return 0 if the array has no zero.", "The answer can be larger than the input length."],
    difficulty: 2,
    examples: [
      { input: "nums = [1,3,0,0,2,0,0,4]", output: "6", explanation: "Each length-2 zero run contributes three all-zero subarrays." },
      { input: "nums = [0,0,0,2,0,0]", output: "9", explanation: "The runs of length 3 and 2 contribute 6 and 3." }
    ],
    functionName: "countZeroFilledSubarrays",
    id: "external-zero-filled-subarrays-v2",
    prompt: "Return how many contiguous subarrays contain only zero values.",
    rating: 1316,
    source: { dislikes: 95, likes: 2793, slug: "number-of-zero-filled-subarrays" },
    solver: (args) => countZeroFilledSubarrays(args[0] as number[]),
    starterArgs: "nums",
    title: "Zero Filled Subarrays",
    topics: ["Arrays", "Math"]
  },
  {
    cases: makeCases([[[2, 2, 2, 2, 5, 5, 5, 8], 3, 4], [[11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5], [[1, 1, 1, 1], 1, 0], [[5, 5, 5], 2, 5], [[1, 2, 3, 4, 5], 2, 4], [[10, 1, 10, 1, 10], 3, 7], [[4, 4, 4, 4], 4, 4], [[0, 0, 10, 10], 2, 5], [[7, 8, 9], 2, 8], [[3, 3, 3, 3, 3], 5, 3]], "checks average threshold windows"),
    constraints: ["Use windows of exactly k numbers.", "A window passes when its average is at least threshold.", "Return the number of passing windows."],
    difficulty: 2,
    examples: [
      { input: "arr = [2,2,2,2,5,5,5,8], k = 3, threshold = 4", output: "3", explanation: "The final three length-3 windows have average at least 4." },
      { input: "arr = [1,1,1,1], k = 1, threshold = 0", output: "4", explanation: "Every single-value window reaches the threshold." }
    ],
    functionName: "countAverageThresholdWindows",
    id: "external-average-threshold-subarrays",
    prompt: "Count fixed-length windows whose average is at least the given threshold.",
    rating: 1317,
    source: { dislikes: 112, likes: 1860, slug: "number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold" },
    solver: (args) => countAverageThresholdWindows(args[0] as number[], args[1] as number, args[2] as number),
    starterArgs: "arr, k, threshold",
    title: "Average Threshold Windows",
    topics: ["Arrays", "Sliding Window"]
  },
  {
    cases: makeCases([[[1, 3, 2, 4], [3, 1, 2, 4]], [[2, 3, 1], [3, 1, 2]], [[1, 2, 3], [1, 2, 3]], [[4, 1, 2, 3], [1, 4, 3, 2]], [[5, 4, 3, 2, 1], [1, 2, 3, 4, 5]], [[1], [1]], [[2, 1, 4, 3], [2, 4, 1, 3]], [[3, 4, 1, 2], [4, 3, 2, 1]], [[6, 2, 5, 1, 3, 4], [2, 6, 1, 5, 4, 3]], [[1, 4, 2, 5, 3], [5, 1, 4, 2, 3]]], "tracks common prefix values"),
    constraints: ["A and B contain the same distinct values.", "For each prefix length, count values seen in both prefixes.", "Return one count per prefix."],
    difficulty: 2,
    examples: [
      { input: "A = [1,3,2,4], B = [3,1,2,4]", output: "[0,2,3,4]", explanation: "After two positions, values 1 and 3 have appeared in both prefixes." },
      { input: "A = [2,3,1], B = [3,1,2]", output: "[0,1,3]", explanation: "Only value 3 is common after two positions, then all values are common." }
    ],
    functionName: "prefixCommonCounts",
    id: "external-prefix-common-array",
    prompt: "Return the count of values that appear in both arrays' prefixes after every position.",
    rating: 1304,
    source: { dislikes: 78, likes: 1371, slug: "find-the-prefix-common-array-of-two-arrays" },
    solver: (args) => prefixCommonCounts(args[0] as number[], args[1] as number[]),
    starterArgs: "A, B",
    title: "Prefix Common Counts",
    topics: ["Arrays", "Hash Set"]
  },
  {
    cases: makeCases([[[10, 5, 15, 3, 7, null, 18], 7, 15], [[10, 5, 15, 3, 7, 13, 18, 1, null, 6], 6, 10], [[1], 1, 1], [[5, 3, 8, 2, 4, 6, 10], 4, 8], [[8, 4, 12, 2, 6, 10, 14], 9, 13], [[6, 2, 8, null, 4, 7, 9], 1, 3], [[6, 2, 8, null, 4, 7, 9], 4, 9], [[20, 10, 30, 5, 15, 25, 35], 12, 28], [[3, 1, 4, null, 2], 2, 3], [[12, 6, 18, 3, 9, 15, 21], 0, 100]], "sums values inside a BST range"),
    constraints: ["The tree is provided as a level-order array with null for missing children.", "Only values between low and high inclusive count.", "Return 0 for an empty tree."],
    difficulty: 2,
    examples: [
      { input: "root = [10,5,15,3,7,null,18], low = 7, high = 15", output: "32", explanation: "Values 7, 10, and 15 are inside the range." },
      { input: "root = [1], low = 1, high = 1", output: "1", explanation: "The single root value is inside the range." }
    ],
    functionName: "rangeSumBstLevelOrder",
    id: "external-range-sum-bst-v2",
    prompt: "Given a binary search tree as level-order values, return the sum of node values inside the inclusive range.",
    rating: 1335,
    source: { dislikes: 389, likes: 7268, slug: "range-sum-of-bst" },
    solver: (args) => rangeSumBstLevelOrder(args[0] as Array<number | null>, args[1] as number, args[2] as number),
    starterArgs: "root, low, high",
    title: "Range Sum BST Values",
    topics: ["Trees", "DFS", "Binary Search Tree"]
  },
  {
    cases: makeCases([[[3, 1, 4, 3, null, 1, 5]], [[3, 3, null, 4, 2]], [[1]], [[2, 1, 3]], [[5, 4, 8, 3, null, 6, 10]], [[1, 2, 3, 4, 5]], [[9, 8, 10, null, null, 7, 11]], [[0, -1, 1]], [[4, 4, 4, 4]], [[7, 3, 9, 1, 5, 8, 10]]], "counts nodes matching path maximum"),
    constraints: ["The tree is level-order with null gaps.", "A node is good if no ancestor has a greater value.", "Return the number of good nodes."],
    difficulty: 3,
    examples: [
      { input: "root = [3,1,4,3,null,1,5]", output: "4", explanation: "The root, left-left 3, right 4, and right-right 5 are never below a prior path maximum." },
      { input: "root = [1]", output: "1", explanation: "The root has no ancestors, so it is good." }
    ],
    functionName: "countGoodLevelOrderNodes",
    id: "external-good-nodes-tree",
    prompt: "Count tree nodes whose value is at least every earlier value on the path from the root.",
    rating: 1360,
    source: { dislikes: 214, likes: 6373, slug: "count-good-nodes-in-binary-tree" },
    solver: (args) => countGoodLevelOrderNodes(args[0] as Array<number | null>),
    starterArgs: "root",
    title: "Good Tree Nodes",
    topics: ["Trees", "DFS"]
  },
  {
    cases: makeCases([[[1, 2, 3, 4, 5, null, 6, 7, null, null, null, null, 8]], [[6, 7, 8, 2, 7, 1, 3, 9, null, 1, 4]], [[1]], [[1, 2, 3]], [[5, 3, 8, 1, 4, 7, 9]], [[2, null, 3, null, 4]], [[2, 3, null, 4]], [[10, 5, 15, null, null, 12, 20]], [[0, -1, 1, -2, null, null, 2]], [[4, 1, 6, 0, 2, 5, 7]]], "sums the deepest level"),
    constraints: ["The tree is level-order with null for missing children.", "Only nodes on the deepest level contribute.", "Return 0 for an empty tree."],
    difficulty: 3,
    examples: [
      { input: "root = [1,2,3,4,5,null,6,7,null,null,null,null,8]", output: "15", explanation: "The deepest leaves are 7 and 8." },
      { input: "root = [1]", output: "1", explanation: "The root is also the deepest leaf." }
    ],
    functionName: "deepestLeavesTotal",
    id: "external-deepest-leaves-sum-v2",
    prompt: "Return the sum of all values on the deepest level of the binary tree.",
    rating: 1388,
    source: { dislikes: 127, likes: 4849, slug: "deepest-leaves-sum" },
    solver: (args) => deepestLeavesTotal(args[0] as Array<number | null>),
    starterArgs: "root",
    title: "Deepest Leaves Total",
    topics: ["Trees", "BFS"]
  },
  {
    cases: makeCases([[[2, 3, 1, 3, 1, null, 1]], [[2, 1, 1, 1, 3, null, null, null, null, null, 1]], [[9]], [[1, 2, 3]], [[1, 1, 1, 1, 1]], [[8, 8, 8, 8, null, null, 8]], [[2, 2, 2, 3, 3]], [[4, 5, 4, 5, null, null, 4]], [[1, 2, 1, null, 2, null, 1]], [[7, 7, 7, 6, null, null, 6]]], "counts root-to-leaf pseudo-palindromes"),
    constraints: ["Values are single digits.", "A path counts when its values can be rearranged into a palindrome.", "Only root-to-leaf paths count."],
    difficulty: 3,
    examples: [
      { input: "root = [2,3,1,3,1,null,1]", output: "2", explanation: "Two root-to-leaf paths leave at most one value with an odd count." },
      { input: "root = [9]", output: "1", explanation: "A single value can always form a palindrome." }
    ],
    functionName: "countPseudoPalindromePaths",
    id: "external-pseudo-palindromic-tree-paths",
    prompt: "Count root-to-leaf paths whose values could be rearranged into a palindrome.",
    rating: 1405,
    source: { dislikes: 131, likes: 3346, slug: "pseudo-palindromic-paths-in-a-binary-tree" },
    solver: (args) => countPseudoPalindromePaths(args[0] as Array<number | null>),
    starterArgs: "root",
    title: "Pseudo Palindrome Tree Paths",
    topics: ["Trees", "DFS", "Bit Manipulation"]
  },
  {
    cases: makeCases([[[[1, 2], [3], [3], []]], [[[4, 3, 1], [3, 2, 4], [3], [4], []]], [[[1], []]], [[[]]], [[[1, 2, 3], [2], [3], []]], [[[1], [2], [3], []]], [[[2], [], [1]]], [[[1, 3], [2], [3], []]], [[[1, 2], [3], [3], [4], []]], [[[1], [2, 3], [3], []]]], "enumerates every source-to-target path"),
    constraints: ["graph[i] lists directed edges from node i.", "Start at node 0 and end at node n - 1.", "Return paths in DFS order."],
    difficulty: 3,
    examples: [
      { input: "graph = [[1,2],[3],[3],[]]", output: "[[0,1,3],[0,2,3]]", explanation: "There are two directed routes from node 0 to node 3." },
      { input: "graph = [[1],[]]", output: "[[0,1]]", explanation: "The only edge reaches the target." }
    ],
    functionName: "allSourceTargetPaths",
    id: "external-all-paths-source-target-v2",
    prompt: "Return every directed path from node 0 to the final node.",
    rating: 1383,
    source: { dislikes: 153, likes: 7650, slug: "all-paths-from-source-to-target" },
    solver: (args) => allSourceTargetPaths(args[0] as number[][]),
    starterArgs: "graph",
    title: "All Source Target Paths",
    topics: ["Graphs", "DFS", "Backtracking"]
  },
  {
    cases: makeCases([[[[1], [2], [3], []]], [[[1, 3], [3, 0, 1], [2], [0]]], [[[]]], [[[1], [], [0, 3], [1]]], [[[1, 2], [2], [3], []]], [[[2], [], [1]]], [[[1], [0, 2], [3], []]], [[[1, 2, 3], [], [], []]], [[[1], [2], [], [0]]], [[[1, 4], [2], [3], [], []]]], "follows keys through rooms"),
    constraints: ["rooms[i] lists keys found in room i.", "Room 0 starts unlocked.", "Return true only if every room can be visited."],
    difficulty: 3,
    examples: [
      { input: "rooms = [[1],[2],[3],[]]", output: "true", explanation: "Each room gives the key to the next room." },
      { input: "rooms = [[1,3],[3,0,1],[2],[0]]", output: "false", explanation: "No reachable room gives a key to room 2." }
    ],
    functionName: "canVisitEveryRoom",
    id: "external-keys-and-rooms-v2",
    prompt: "Starting from room 0, determine whether collected keys can unlock every room.",
    rating: 1412,
    source: { dislikes: 303, likes: 6697, slug: "keys-and-rooms" },
    solver: (args) => canVisitEveryRoom(args[0] as number[][]),
    starterArgs: "rooms",
    title: "Keys Reach Every Room",
    topics: ["Graphs", "DFS"]
  },
  {
    cases: makeCases([[[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], [[[0, 2]]], [[[2, 1, 1], [1, 1, 1], [0, 1, 2]]], [[[1]]], [[[2]]], [[[2, 0, 1]]], [[[2, 1, 0], [0, 1, 1], [1, 0, 2]]], [[[2, 1], [1, 1]]], [[[0, 0], [0, 0]]]], "spreads rot by minute"),
    constraints: ["0 is empty, 1 is fresh, and 2 is rotten.", "Each minute rot spreads four-directionally.", "Return -1 if any fresh orange can never rot."],
    difficulty: 3,
    examples: [
      { input: "grid = [[2,1,1],[1,1,0],[0,1,1]]", output: "4", explanation: "The rot reaches the final fresh orange after four minutes." },
      { input: "grid = [[2,1,1],[0,1,1],[1,0,1]]", output: "-1", explanation: "The isolated fresh orange in the bottom-left cannot be reached." }
    ],
    functionName: "minutesToRotAllOranges",
    id: "external-rotting-oranges-v2",
    prompt: "Return how many minutes it takes for rot to reach every fresh orange in the grid.",
    rating: 1433,
    source: { dislikes: 478, likes: 15220, slug: "rotting-oranges" },
    solver: (args) => minutesToRotAllOranges(args[0] as number[][]),
    starterArgs: "grid",
    title: "Rotting Orange Minutes",
    topics: ["Grid", "BFS"]
  },
  {
    cases: [
      { args: ["00110110", 2], name: "finds all size two codes" },
      { args: ["0110", 1], name: "single bit codes" },
      { args: ["0110", 2], name: "missing one code" },
      { args: ["0000000001011100", 4], name: "larger code size" },
      { args: ["111100001010", 3], name: "mixed repeated windows" },
      { args: ["01", 2], name: "not enough windows" },
      { args: ["01010101", 2], name: "alternating misses codes" },
      { args: ["00110", 2], name: "minimal complete windows" },
      { args: ["00010111", 3], name: "complete size three set" },
      { args: ["101010101011", 3], name: "late missing code" }
    ],
    constraints: ["s contains only 0 and 1.", "k is between 1 and 12.", "Return true only when every possible binary code of length k appears."],
    difficulty: 3,
    examples: [
      { input: 's = "00110110", k = 2', output: "true", explanation: "The windows include 00, 01, 10, and 11." },
      { input: 's = "0110", k = 2', output: "false", explanation: "The length-2 windows are 01, 11, and 10, so the required code 00 is missing." }
    ],
    functionName: "containsEveryBinaryCode",
    id: "external-check-binary-codes",
    prompt: "Return true when the string contains every possible binary code of length k as a contiguous substring.",
    rating: 1504,
    source: { dislikes: 116, likes: 2721, slug: "check-if-a-string-contains-all-binary-codes-of-size-k" },
    solver: (args) => containsEveryBinaryCode(args[0] as string, args[1] as number),
    starterArgs: "s, k",
    title: "Contains Every Binary Code",
    topics: ["Hash Set", "Strings", "Sliding Window"]
  },
  {
    cases: [
      { args: [[1, 2, 3]], name: "ascending values" },
      { args: [[1, 3, 3]], name: "duplicate high values" },
      { args: [[4, -2, -3, 4, 1]], name: "mixed negative values" },
      { args: [[0, 0, 0]], name: "all equal" },
      { args: [[5]], name: "single value" },
      { args: [[3, 1, 2, 4]], name: "unsorted values" },
      { args: [[-1, -2, -3]], name: "all negative descending" },
      { args: [[2, 2, 5, 1]], name: "plateaus and drop" },
      { args: [[10, 1, 10]], name: "same ends" },
      { args: [[7, 3, 9, 2, 6]], name: "larger mixed case" }
    ],
    constraints: ["Input length is between 1 and 1000.", "Values may be negative.", "Sum max minus min across every non-empty subarray."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,2,3]", output: "4", explanation: "The non-zero ranges are [1,2], [2,3], and [1,2,3]." },
      { input: "nums = [1,3,3]", output: "4", explanation: "Subarrays ending at the repeated 3 still contribute ranges." }
    ],
    functionName: "sumSubarrayRanges",
    id: "external-sum-subarray-ranges",
    prompt: "Return the sum of max(subarray) - min(subarray) over every non-empty contiguous subarray.",
    rating: 1504,
    source: { dislikes: 144, likes: 3014, slug: "sum-of-subarray-ranges" },
    solver: (args) => sumSubarrayRanges(args[0] as number[]),
    starterArgs: "nums",
    title: "Sum Subarray Ranges",
    topics: ["Arrays", "Monotonic Stack"]
  },
  {
    cases: [
      { args: ["aab"], name: "one deletion needed" },
      { args: ["aaabbbcc"], name: "multiple frequency collisions" },
      { args: ["ceabaacb"], name: "staggered repeats" },
      { args: ["abc"], name: "all singletons" },
      { args: ["aaaa"], name: "single character" },
      { args: ["abbccc"], name: "already unique counts" },
      { args: ["bbcebab"], name: "reduce duplicate counts" },
      { args: ["zzzyyyxxxwww"], name: "many equal groups" },
      { args: ["aabbccdde"], name: "many pairs and singleton" },
      { args: ["abbbcccd"], name: "keeps largest frequencies" }
    ],
    constraints: ["s contains lowercase letters.", "Return the minimum number of deleted characters.", "All remaining character frequencies must be unique."],
    difficulty: 3,
    examples: [
      { input: 's = "aab"', output: "0", explanation: "The frequencies 2 and 1 are already unique." },
      { input: 's = "aaabbbcc"', output: "2", explanation: "Delete two letters so the remaining counts can be 3, 2, and 1." }
    ],
    functionName: "minDeletionsForUniqueFrequencies",
    id: "external-unique-frequencies",
    prompt: "Delete as few characters as possible so no two remaining letters have the same frequency.",
    rating: 1510,
    source: { dislikes: 76, likes: 5063, slug: "minimum-deletions-to-make-character-frequencies-unique" },
    solver: (args) => minDeletionsForUniqueFrequencies(args[0] as string),
    starterArgs: "s",
    title: "Unique Character Frequencies",
    topics: ["Hash Map", "Strings", "Greedy"]
  },
  {
    cases: [
      { args: [[1, 2, 1]], name: "basic unique window sum" },
      { args: [[4, 2, 4, 5, 6]], name: "classic repeated start" },
      { args: [[5, 2, 1, 2, 5, 2, 1, 2, 5]], name: "repeating pattern" },
      { args: [[1, 1, 1]], name: "all duplicates" },
      { args: [[10, 20, 30]], name: "all unique" },
      { args: [[3, 4, 5, 3, 4, 6]], name: "best window after duplicate" },
      { args: [[8]], name: "single value" },
      { args: [[2, 3, 2, 4, 5]], name: "drop old duplicate" },
      { args: [[6, 1, 2, 3, 1, 4]], name: "longer tail" },
      { args: [[9, 8, 9, 7, 6, 5]], name: "duplicate then long run" }
    ],
    constraints: ["Input values are positive integers.", "Choose one contiguous subarray.", "The chosen subarray must contain only distinct values."],
    difficulty: 3,
    examples: [
      { input: "nums = [4,2,4,5,6]", output: "17", explanation: "The best distinct window is [2,4,5,6]." },
      { input: "nums = [1,1,1]", output: "1", explanation: "Only one value can be kept in a distinct window." }
    ],
    functionName: "maximumUniqueSubarraySum",
    id: "external-maximum-erasure-value",
    prompt: "Return the largest sum of a contiguous subarray that contains no repeated values.",
    rating: 1529,
    source: { dislikes: 68, likes: 3412, slug: "maximum-erasure-value" },
    solver: (args) => maximumUniqueSubarraySum(args[0] as number[]),
    starterArgs: "nums",
    title: "Maximum Unique Subarray Sum",
    topics: ["Sliding Window", "Arrays", "Hash Set"]
  },
  {
    cases: [
      { args: [[3, 2, 2, 1], 3], name: "pairs light people" },
      { args: [[3, 5, 3, 4], 5], name: "many solo boats" },
      { args: [[1, 2], 3], name: "one boat" },
      { args: [[5, 1, 4, 2], 6], name: "pairs after sorting" },
      { args: [[2, 2, 2, 2], 4], name: "all pair evenly" },
      { args: [[2, 2, 2], 3], name: "all solo due limit" },
      { args: [[1, 1, 1, 1], 2], name: "many light pairs" },
      { args: [[4, 4, 4], 5], name: "no pair possible" },
      { args: [[1, 3, 2, 2], 3], name: "some pairs some solo" },
      { args: [[6, 2, 3, 4, 1], 7], name: "larger mixed weights" }
    ],
    constraints: ["Each boat can carry at most two people.", "Every person's weight is at most limit.", "Return the fewest boats needed."],
    difficulty: 3,
    examples: [
      { input: "people = [3,2,2,1], limit = 3", output: "3", explanation: "Pair 1 with 2, then the other 2 and 3 each need a boat." },
      { input: "people = [1,2], limit = 3", output: "1", explanation: "The two weights sum to 3, which equals the limit, so one boat can carry both people." }
    ],
    functionName: "minimumRescueBoats",
    id: "external-boats-to-save-people",
    prompt: "Return the minimum number of boats needed when each boat can carry up to two people within the weight limit.",
    rating: 1530,
    source: { dislikes: 179, likes: 6958, slug: "boats-to-save-people" },
    solver: (args) => minimumRescueBoats(args[0] as number[], args[1] as number),
    starterArgs: "people, limit",
    title: "Minimum Rescue Boats",
    topics: ["Two Pointers", "Arrays", "Greedy"]
  },
  {
    cases: [
      { args: ["abc", "bca"], name: "same simple letters" },
      { args: ["a", "aa"], name: "different letter sets" },
      { args: ["cabbba", "abbccc"], name: "swappable frequency sets" },
      { args: ["abbzzca", "babzzcz"], name: "matching sets and counts" },
      { args: ["uau", "ssx"], name: "different letter set with same counts" },
      { args: ["aaabbbbccddeeeee", "aaaaabbcccdddeee"], name: "matching frequency multiset" },
      { args: ["abcdd", "aabbc"], name: "different frequency multiset" },
      { args: ["zzxy", "xyzz"], name: "same letters" },
      { args: ["zzxy", "xyza"], name: "one missing letter" },
      { args: ["aabbccc", "aaabbbc"], name: "same counts different letters" }
    ],
    constraints: ["Both strings contain lowercase letters.", "You may reorder letters and swap all occurrences of one existing letter with another.", "Return whether the two words can become equal."],
    difficulty: 3,
    examples: [
      { input: 'word1 = "abc", word2 = "bca"', output: "true", explanation: "They already use the same letters with the same frequencies." },
      { input: 'word1 = "a", word2 = "aa"', output: "false", explanation: "One word has two copies of a letter and the other does not." }
    ],
    functionName: "areCloseWords",
    id: "external-close-strings",
    prompt: "Return true when two words can be made equal by reordering letters and swapping whole letter identities.",
    rating: 1530,
    source: { dislikes: 360, likes: 4138, slug: "determine-if-two-strings-are-close" },
    solver: (args) => areCloseWords(args[0] as string, args[1] as string),
    starterArgs: "word1, word2",
    title: "Close Words",
    topics: ["Hash Map", "Strings", "Sorting"]
  },
  {
    cases: [
      { args: ["aabca"], name: "two palindromic centers" },
      { args: ["adc"], name: "no repeated ends" },
      { args: ["bbcbaba"], name: "multiple middle choices" },
      { args: ["aaaaa"], name: "single repeated letter" },
      { args: ["abcba"], name: "nested palindrome letters" },
      { args: ["abcaacba"], name: "wide repeated endpoints" },
      { args: ["xyzxyz"], name: "repeated sequence" },
      { args: ["z"], name: "too short" },
      { args: ["ababa"], name: "alternating letters" },
      { args: ["leetcode"], name: "mixed word" }
    ],
    constraints: ["s contains lowercase letters.", "Count distinct palindromic subsequences of length exactly 3.", "Subsequences do not need to be contiguous."],
    difficulty: 3,
    examples: [
      { input: 's = "aabca"', output: "3", explanation: "The distinct length-3 palindromes are aaa, aba, and aca." },
      { input: 's = "adc"', output: "0", explanation: "No letter can be used as both ends." }
    ],
    functionName: "countLengthThreePalindromes",
    id: "external-length-three-palindromes",
    prompt: "Return how many distinct palindromic subsequences of length three exist in the string.",
    rating: 1533,
    source: { dislikes: 108, likes: 2869, slug: "unique-length-3-palindromic-subsequences" },
    solver: (args) => countLengthThreePalindromes(args[0] as string),
    starterArgs: "s",
    title: "Length-Three Palindromic Subsequences",
    topics: ["Hash Set", "Strings"]
  },
  {
    cases: [
      { args: [[2, 1, 2, 4, 2, 2], [5, 2, 6, 2, 3, 2]], name: "top row target" },
      { args: [[3, 5, 1, 2, 3], [3, 6, 3, 3, 4]], name: "impossible target" },
      { args: [[1, 2, 1, 1, 1], [2, 1, 2, 2, 2]], name: "bottom row target" },
      { args: [[1], [2]], name: "single domino already valid" },
      { args: [[2, 2, 2], [2, 2, 2]], name: "already equal" },
      { args: [[1, 2, 3], [3, 3, 3]], name: "one row rotations" },
      { args: [[4, 4, 4, 4], [4, 1, 2, 3]], name: "no rotations needed top" },
      { args: [[1, 1, 2, 1], [2, 2, 1, 2]], name: "choose cheaper row" },
      { args: [[6, 1, 6, 6], [6, 6, 2, 6]], name: "candidate with blocker" },
      { args: [[1, 2, 1, 2], [2, 1, 2, 1]], name: "alternating needs two" }
    ],
    constraints: ["top and bottom have the same length.", "Each domino side is an integer from 1 to 6.", "Return -1 if no common row value can be made."],
    difficulty: 3,
    examples: [
      { input: "top = [2,1,2,4,2,2], bottom = [5,2,6,2,3,2]", output: "2", explanation: "Rotate two dominoes so every top value is 2." },
      { input: "top = [3,5,1,2,3], bottom = [3,6,3,3,4]", output: "-1", explanation: "No value can appear on every domino." }
    ],
    functionName: "minDominoRotations",
    id: "external-domino-rotations",
    prompt: "Return the minimum rotations needed to make every value in either the top row or bottom row identical.",
    rating: 1541,
    source: { dislikes: 271, likes: 3287, slug: "minimum-domino-rotations-for-equal-row" },
    solver: (args) => minDominoRotations(args[0] as number[], args[1] as number[]),
    starterArgs: "top, bottom",
    title: "Minimum Domino Rotations",
    topics: ["Arrays", "Greedy"]
  },
  {
    cases: [
      { args: ["deeedbbcccbdaa", 3], name: "classic cascading removal" },
      { args: ["pbbcggttciiippooaais", 2], name: "many cascades" },
      { args: ["abcd", 2], name: "no removals" },
      { args: ["aaaa", 2], name: "all removed in pairs" },
      { args: ["aaabbbacd", 3], name: "remove separate triples" },
      { args: ["aabbccddeeedcba", 3], name: "center removal only" },
      { args: ["yfttttfbbbbnnnnffbgffffgbbbbgssssgthyyyy", 4], name: "long cascading groups" },
      { args: ["zzzzzy", 5], name: "remove leading group" },
      { args: ["baaab", 3], name: "cascade into pair but not enough" },
      { args: ["aababaab", 3], name: "later triple after stack merge" }
    ],
    constraints: ["Remove exactly k adjacent equal letters whenever they form.", "Repeat until no removable group remains.", "Return the final string."],
    difficulty: 3,
    examples: [
      { input: 's = "deeedbbcccbdaa", k = 3', output: '"aa"', explanation: "Removing eee, ccc, and bbb leaves aa." },
      { input: 's = "abcd", k = 2', output: '"abcd"', explanation: "Every adjacent character is different, so no run ever reaches k = 2 and the string stays unchanged." }
    ],
    functionName: "removeAdjacentGroups",
    id: "external-remove-adjacent-duplicates-k",
    prompt: "Repeatedly remove adjacent groups of exactly k equal characters and return the remaining string.",
    rating: 1542,
    source: { dislikes: 123, likes: 6110, slug: "remove-all-adjacent-duplicates-in-string-ii" },
    solver: (args) => removeAdjacentGroups(args[0] as string, args[1] as number),
    starterArgs: "s, k",
    title: "Remove Adjacent Groups",
    topics: ["Stacks", "Strings"]
  },
  {
    cases: [
      { args: [[1, -3, 2, 3, -4]], name: "positive best swing" },
      { args: [[2, -5, 1, -4, 3, -2]], name: "negative best swing" },
      { args: [[1, 2, 3]], name: "all positive" },
      { args: [[-1, -2, -3]], name: "all negative" },
      { args: [[0, 0]], name: "all zero" },
      { args: [[5, -1, -2, 7, -10, 4]], name: "mixed peaks" },
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], name: "classic max subarray shape" },
      { args: [[8]], name: "single positive" },
      { args: [[-8]], name: "single negative" },
      { args: [[3, -4, 2, -3, -1, 7, -5]], name: "late positive range" }
    ],
    constraints: ["Input length is at least 1.", "Values may be negative.", "Return the maximum absolute sum across all contiguous subarrays."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,-3,2,3,-4]", output: "5", explanation: "The subarray [2,3] has absolute sum 5." },
      { input: "nums = [2,-5,1,-4,3,-2]", output: "8", explanation: "The subarray [-5,1,-4] has absolute sum 8." }
    ],
    functionName: "maxAbsoluteSubarraySum",
    id: "external-maximum-absolute-subarray-sum",
    prompt: "Return the largest absolute value of any contiguous subarray sum.",
    rating: 1542,
    source: { dislikes: 51, likes: 2007, slug: "maximum-absolute-sum-of-any-subarray" },
    solver: (args) => maxAbsoluteSubarraySum(args[0] as number[]),
    starterArgs: "nums",
    title: "Maximum Absolute Subarray Sum",
    topics: ["Arrays", "Dynamic Programming"]
  },
  {
    cases: [
      { args: [[[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]], name: "classic schedule intersections" },
      { args: [[[1, 3], [5, 9]], []], name: "empty second list" },
      { args: [[], [[4, 8]]], name: "empty first list" },
      { args: [[[1, 7]], [[3, 10]]], name: "single overlap" },
      { args: [[[1, 2]], [[3, 4]]], name: "no overlap" },
      { args: [[[1, 5]], [[5, 7]]], name: "touching endpoints" },
      { args: [[[1, 4], [6, 8]], [[2, 3], [7, 9]]], name: "contained intersections" },
      { args: [[[0, 3], [6, 10], [12, 14]], [[1, 5], [9, 13]]], name: "multiple partial overlaps" },
      { args: [[[2, 6], [8, 12]], [[1, 3], [4, 10], [11, 15]]], name: "one interval overlaps many" },
      { args: [[[1, 1], [3, 3]], [[1, 1], [2, 4]]], name: "zero length intervals" }
    ],
    constraints: ["Each list is sorted by start.", "Intervals are closed, so touching endpoints count as an intersection.", "Return intersections in order."],
    difficulty: 3,
    examples: [
      { input: "first = [[0,2],[5,10]], second = [[1,5],[8,12]]", output: "[[1,2],[5,5],[8,10]]", explanation: "Every overlapping closed interval segment is returned." },
      { input: "first = [[1,2]], second = [[3,4]]", output: "[]", explanation: "The first interval ends at 2 before the second starts at 3, so there is no shared range." }
    ],
    functionName: "intervalIntersections",
    id: "external-interval-list-intersections",
    prompt: "Return all intersections between two sorted lists of closed intervals.",
    rating: 1542,
    source: { dislikes: 131, likes: 5935, slug: "interval-list-intersections" },
    solver: (args) => intervalIntersections(args[0] as number[][], args[1] as number[][]),
    starterArgs: "first, second",
    title: "Interval List Intersections",
    topics: ["Two Pointers", "Arrays", "Intervals"]
  },
  {
    cases: [
      { args: [[3, 6, 7, 11], 8], name: "sample speed" },
      { args: [[30, 11, 23, 4, 20], 5], name: "tight hours" },
      { args: [[30, 11, 23, 4, 20], 6], name: "one extra hour" },
      { args: [[1, 1, 1, 1], 4], name: "all one speed" },
      { args: [[9], 3], name: "single pile split over hours" },
      { args: [[100, 50, 25], 10], name: "larger piles" },
      { args: [[5, 5, 5], 6], name: "can slow down" },
      { args: [[5, 5, 5], 3], name: "must finish each pile hourly" },
      { args: [[312884470], 312884469], name: "large single pile" },
      { args: [[8, 16, 24], 7], name: "mixed multiples" }
    ],
    constraints: ["Each hour can only eat from one pile.", "Eating speed is a positive integer.", "Return the smallest speed that finishes within h hours."],
    difficulty: 4,
    examples: [
      { input: "piles = [3,6,7,11], h = 8", output: "4", explanation: "Speed 4 is enough, while speed 3 is too slow." },
      { input: "piles = [30,11,23,4,20], h = 5", output: "30", explanation: "Only the maximum pile speed finishes in five hours." }
    ],
    functionName: "minEatingSpeed",
    id: "external-koko-eating-bananas",
    prompt: "Return the minimum whole-number eating speed needed to finish all piles within h hours.",
    rating: 1766,
    source: { dislikes: 923, likes: 13792, slug: "koko-eating-bananas" },
    solver: (args) => minEatingSpeed(args[0] as number[], args[1] as number),
    starterArgs: "piles, h",
    title: "Minimum Eating Speed",
    topics: ["Binary Search", "Arrays"]
  },
  {
    cases: [
      { args: [[1, 1, 1]], name: "simple possible array" },
      { args: [[1, 3, 4, 2, 6, 8]], name: "mixed doubled array" },
      { args: [[6, 3, 0, 1]], name: "impossible missing double" },
      { args: [[0, 0, 0, 0]], name: "zeros pair together" },
      { args: [[2, 4, 4, 8]], name: "duplicate values" },
      { args: [[1]], name: "odd length impossible" },
      { args: [[2, 1]], name: "one pair unsorted" },
      { args: [[4, 4, 16, 20, 8, 8, 2, 10]], name: "multiple chains" },
      { args: [[1, 2, 3, 6]], name: "two separate pairs" },
      { args: [[1, 2, 2, 4, 4, 8]], name: "repeated chain possible" }
    ],
    constraints: ["changed may be shuffled.", "Every original value should have one doubled partner.", "Return an empty array if no original array exists."],
    difficulty: 3,
    examples: [
      { input: "changed = [1,3,4,2,6,8]", output: "[1,3,4]", explanation: "The doubled partners are 2, 6, and 8." },
      { input: "changed = [6,3,0,1]", output: "[]", explanation: "The value 1 has no doubled partner." }
    ],
    functionName: "findOriginalFromDoubled",
    id: "external-original-from-doubled",
    prompt: "Given a shuffled array containing original values and their doubled values, reconstruct the original array or return an empty array.",
    rating: 1557,
    source: { dislikes: 120, likes: 2568, slug: "find-original-array-from-doubled-array" },
    solver: (args) => findOriginalFromDoubled(args[0] as number[]),
    starterArgs: "changed",
    title: "Original Array From Doubled Values",
    topics: ["Hash Map", "Arrays", "Sorting"]
  },
  {
    cases: [
      { args: [[5, 19, 8, 1]], name: "classic halve target" },
      { args: [[3, 8, 20]], name: "few large values" },
      { args: [[1]], name: "single value" },
      { args: [[10, 10]], name: "equal values" },
      { args: [[100, 1, 1]], name: "dominant value" },
      { args: [[6, 6, 6]], name: "three equal values" },
      { args: [[1, 2, 3, 4, 5]], name: "increasing values" },
      { args: [[9, 7, 5, 3]], name: "decreasing values" },
      { args: [[50, 25, 25]], name: "large tie after halve" },
      { args: [[4, 4, 4, 4]], name: "four equal values" }
    ],
    constraints: ["One operation halves one current number.", "Always compare against half of the original total sum.", "Return the fewest operations needed."],
    difficulty: 3,
    examples: [
      { input: "nums = [5,19,8,1]", output: "3", explanation: "Halving the largest current value each time reaches half the original total in three operations." },
      { input: "nums = [3,8,20]", output: "3", explanation: "The largest values must be reduced repeatedly." }
    ],
    functionName: "minOperationsToHalveSum",
    id: "external-halve-array-sum",
    prompt: "Return the minimum number of operations needed to reduce the array sum by at least half when each operation halves one element.",
    rating: 1550,
    source: { dislikes: 32, likes: 678, slug: "minimum-operations-to-halve-array-sum" },
    solver: (args) => minOperationsToHalveSum(args[0] as number[]),
    starterArgs: "nums",
    title: "Halve Array Sum",
    topics: ["Heap", "Greedy"]
  },
  {
    cases: [
      { args: [[1, 5, 4, 2, 9, 9, 9], 3], name: "sample with repeated nines" },
      { args: [[4, 4, 4], 3], name: "no distinct window" },
      { args: [[1, 2, 3, 4], 2], name: "all windows distinct" },
      { args: [[1, 1, 1, 7, 8, 9], 3], name: "best late window" },
      { args: [[5], 1], name: "single length window" },
      { args: [[2, 3, 2, 3, 2], 2], name: "alternating valid windows" },
      { args: [[9, 9, 1, 2, 3], 3], name: "first valid after duplicates" },
      { args: [[6, 7, 8, 6, 7, 9], 4], name: "longer distinct window" },
      { args: [[10, 20, 10, 30, 40], 3], name: "middle best window" },
      { args: [[1, 2], 3], name: "window longer than array" }
    ],
    constraints: ["A valid window has length exactly k.", "Every value inside the window must be distinct.", "Return 0 if no valid window exists."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,5,4,2,9,9,9], k = 3", output: "15", explanation: "The best distinct length-3 window is [4,2,9]." },
      { input: "nums = [4,4,4], k = 3", output: "0", explanation: "The only window has duplicate values." }
    ],
    functionName: "maxDistinctWindowSum",
    id: "external-distinct-window-sum",
    prompt: "Return the maximum sum of any length-k subarray whose values are all distinct.",
    rating: 1553,
    source: { dislikes: 50, likes: 2350, slug: "maximum-sum-of-distinct-subarrays-with-length-k" },
    solver: (args) => maxDistinctWindowSum(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Maximum Distinct Window Sum",
    topics: ["Sliding Window", "Arrays", "Hash Map"]
  },
  {
    cases: [
      { args: [[1, 2, 3, 4, 5], 3], name: "three baskets pattern" },
      { args: [[0, 1, 2, 2], 2], name: "best suffix" },
      { args: [[1, 2, 1], 2], name: "all within two types" },
      { args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4], 2], name: "classic long window" },
      { args: [[1], 2], name: "single fruit" },
      { args: [[1, 1, 1], 2], name: "one type only" },
      { args: [[1, 2, 3, 2, 2], 2], name: "best after first type drops" },
      { args: [[0, 0, 1, 1, 2, 2], 2], name: "two pairs tied" },
      { args: [[5, 6, 5, 6, 7, 6, 7], 2], name: "switch best basket types" },
      { args: [[1, 2, 3, 4], 2], name: "only pairs possible" }
    ],
    constraints: ["Pick one contiguous stretch.", "The stretch may contain at most two fruit types.", "Return the longest valid stretch length."],
    difficulty: 3,
    examples: [
      { input: "fruits = [1,2,1]", output: "3", explanation: "The whole array uses only two fruit types." },
      { input: "fruits = [0,1,2,2]", output: "3", explanation: "The longest window with at most two fruit types is [1,2,2], which has length 3." }
    ],
    functionName: "longestTwoFruitBasket",
    id: "external-fruit-into-baskets",
    prompt: "Return the longest contiguous stretch containing at most two distinct fruit types.",
    rating: 1516,
    source: { dislikes: 597, likes: 6248, slug: "fruit-into-baskets" },
    solver: (args) => longestTwoFruitBasket(args[0] as number[]),
    starterArgs: "fruits",
    title: "Two Fruit Baskets",
    topics: ["Sliding Window", "Arrays", "Hash Map"]
  },
  {
    cases: [
      { args: [[2, 1, 5]], name: "middle node sees later greater" },
      { args: [[2, 7, 4, 3, 5]], name: "mixed next greater values" },
      { args: [[1, 7, 5, 1, 9, 2, 5, 1]], name: "larger linked list" },
      { args: [[9, 8, 7]], name: "descending values" },
      { args: [[1, 2, 3]], name: "ascending values" },
      { args: [[5]], name: "single node" },
      { args: [[2, 2, 2]], name: "equal values are not greater" },
      { args: [[3, 1, 2, 4]], name: "late greater value" },
      { args: [[4, 1, 6, 2, 5]], name: "skips smaller nodes" },
      { args: [[1, 3, 2, 4, 1]], name: "multiple pending nodes" }
    ],
    constraints: ["The linked list is provided as an array of node values.", "For each node, find the first later node with a greater value.", "Use 0 when no later greater value exists."],
    difficulty: 3,
    examples: [
      { input: "values = [2,1,5]", output: "[5,5,0]", explanation: "Both 2 and 1 next see 5; 5 has no greater value after it." },
      { input: "values = [9,8,7]", output: "[0,0,0]", explanation: "No node has a larger value to its right." }
    ],
    functionName: "nextGreaterLinkedValues",
    id: "external-next-greater-linked-list",
    prompt: "Given linked-list values in order, return the next greater node value for every position.",
    rating: 1571,
    source: { dislikes: 130, likes: 3546, slug: "next-greater-node-in-linked-list" },
    solver: (args) => nextGreaterLinkedValues(args[0] as number[]),
    starterArgs: "values",
    title: "Next Greater Linked List Values",
    topics: ["Linked Lists", "Stacks"]
  },
  {
    cases: [
      { args: [[1, 2, -3, 3, 1]], name: "removes prefix zero run" },
      { args: [[1, 2, 3, -3, 4]], name: "removes middle zero run" },
      { args: [[1, 2, 3, -3, -2]], name: "cascades to one value" },
      { args: [[0, 0, 1]], name: "removes zero nodes" },
      { args: [[1, -1]], name: "removes entire list" },
      { args: [[1, 3, 2, -3, -2, 5, 5, -5, 1]], name: "multiple removed spans" },
      { args: [[2, -2, 3, -3]], name: "all spans removed" },
      { args: [[4, 1, -1, 2]], name: "keeps outer values" },
      { args: [[1, 2, -2, 3, -3, 4]], name: "two internal removals" },
      { args: [[5, -3, -2, 6]], name: "leading sum to zero" }
    ],
    constraints: ["The linked list is provided as an array.", "Remove every consecutive run whose sum is 0.", "Return the remaining linked-list values in order."],
    difficulty: 4,
    examples: [
      { input: "values = [1,2,-3,3,1]", output: "[3,1]", explanation: "The prefix [1,2,-3] sums to 0 and is removed." },
      { input: "values = [1,-1]", output: "[]", explanation: "The full segment 1 + -1 sums to 0, so both nodes are removed and nothing remains." }
    ],
    functionName: "removeZeroSumLinkedValues",
    id: "external-remove-zero-sum-linked-list",
    prompt: "Remove every consecutive zero-sum segment from a linked list represented as values.",
    rating: 1782,
    source: { dislikes: 226, likes: 3520, slug: "remove-zero-sum-consecutive-nodes-from-linked-list" },
    solver: (args) => removeZeroSumLinkedValues(args[0] as number[]),
    starterArgs: "values",
    title: "Remove Zero-Sum Linked List Segments",
    topics: ["Linked Lists", "Hash Map"]
  },
  {
    cases: [
      { args: [[4, 2, 8], { val: 1, left: { val: 4, right: { val: 2, left: { val: 1 } } }, right: { val: 4, left: { val: 2, left: { val: 6 } }, right: { val: 8, left: { val: 1 }, right: { val: 3 } } } }], name: "finds downward path" },
      { args: [[1, 4, 2, 6], { val: 1, left: { val: 4, right: { val: 2, left: { val: 1 } } }, right: { val: 4, left: { val: 2, left: { val: 6 } } } }], name: "path starts below root" },
      { args: [[1, 4, 2, 6, 8], { val: 1, left: { val: 4, right: { val: 2, left: { val: 1 } } }, right: { val: 4, left: { val: 2, left: { val: 6 } } } }], name: "missing final node" },
      { args: [[1], { val: 1 }], name: "single matching node" },
      { args: [[2], { val: 1 }], name: "single missing node" },
      { args: [[2, 3], { val: 2, left: { val: 3 }, right: { val: 4 } }], name: "left child path" },
      { args: [[2, 4], { val: 2, left: { val: 3 }, right: { val: 4 } }], name: "right child path" },
      { args: [[3, 2], { val: 1, left: { val: 3, right: { val: 2 } }, right: { val: 3 } }], name: "starts at left branch" },
      { args: [[3, 4], { val: 1, left: { val: 3, right: { val: 2 } }, right: { val: 3 } }], name: "matching start but no continuation" },
      { args: [[], { val: 1 }], name: "empty list is found" }
    ],
    constraints: ["listValues represents the linked list.", "A match must move downward through parent-to-child tree edges.", "Return true if any downward path matches the whole list."],
    difficulty: 4,
    examples: [
      { input: "listValues = [2,4], root = { val: 2, right: { val: 4 } }", output: "true", explanation: "The linked list matches a downward root-to-child path." },
      { input: "listValues = [3,4], root = { val: 3, left: { val: 2 } }", output: "false", explanation: "The first node matches, but the next required value is absent." }
    ],
    functionName: "linkedListPathInTree",
    id: "external-linked-list-in-binary-tree",
    prompt: "Return true when the linked-list values appear as one downward path in the binary tree.",
    rating: 1650,
    source: { dislikes: 90, likes: 3029, slug: "linked-list-in-binary-tree" },
    solver: (args) => linkedListPathInTree(args[0] as number[], args[1] as TreeNode | null),
    starterArgs: "listValues, root",
    title: "Linked List Path In Binary Tree",
    topics: ["Linked Lists", "Trees", "DFS"]
  },
  {
    cases: [
      { args: [{ val: 3, left: { val: 5, left: { val: 6 }, right: { val: 2, left: { val: 7 }, right: { val: 4 } } }, right: { val: 1, left: { val: 0 }, right: { val: 8 } } }], name: "classic deepest subtree" },
      { args: [{ val: 1 }], name: "single node tree" },
      { args: [{ val: 0, left: { val: 1 }, right: { val: 3 } }], name: "two deepest sides share root" },
      { args: [{ val: 0, left: { val: 1, left: { val: 2 } }, right: { val: 3 } }], name: "left side is deepest" },
      { args: [{ val: 0, right: { val: 3, right: { val: 4 } } }], name: "right chain deepest" },
      { args: [{ val: 2, left: { val: 1, left: { val: 9 }, right: { val: 8 } }, right: { val: 3 } }], name: "left child covers deepest leaves" },
      { args: [{ val: 5, left: { val: 4 }, right: { val: 6, left: { val: 7 }, right: { val: 8 } } }], name: "right child covers deepest leaves" },
      { args: [{ val: 10, left: { val: 2, right: { val: 3 } }, right: { val: 12, left: { val: 11 } } }], name: "deepest leaves on both sides" },
      { args: [{ val: 1, left: { val: 2, left: { val: 3, left: { val: 4 } } } }], name: "long left chain" },
      { args: [null], name: "empty tree" }
    ],
    constraints: ["Return the value at the root of the smallest subtree containing all deepest nodes.", "Return null for an empty tree.", "Each node has val, left, and right."],
    difficulty: 3,
    examples: [
      { input: "root = { val: 1 }", output: "1", explanation: "The only node is also the deepest subtree root." },
      { input: "root = { val: 0, left: { val: 1 }, right: { val: 3 } }", output: "0", explanation: "The deepest leaves are on both sides, so the root covers them." }
    ],
    functionName: "deepestSubtreeRootValue",
    id: "external-smallest-deepest-subtree",
    prompt: "Return the root value of the smallest subtree that contains every deepest node.",
    rating: 1534,
    source: { dislikes: 404, likes: 3266, slug: "smallest-subtree-with-all-the-deepest-nodes" },
    solver: (args) => deepestSubtreeRootValue(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Smallest Deepest Subtree Root",
    topics: ["Trees", "DFS"]
  },
  {
    cases: [
      { args: [[8, 5, 1, 7, 10, 12]], name: "balanced from preorder" },
      { args: [[1, 2, 3]], name: "ascending preorder" },
      { args: [[3, 2, 1]], name: "descending preorder" },
      { args: [[4]], name: "single value" },
      { args: [[5, 3, 2, 4, 7, 6, 8]], name: "complete bst preorder" },
      { args: [[10, 5, 1, 7, 40, 50]], name: "classic preorder" },
      { args: [[6, 2, 1, 4, 3, 5, 8, 7, 9]], name: "larger balanced tree" },
      { args: [[2, 1, 3]], name: "three nodes" },
      { args: [[7, 4, 6, 5]], name: "nested right turn" },
      { args: [[]], name: "empty preorder" }
    ],
    constraints: ["preorder contains unique values.", "Build the binary search tree represented by preorder.", "Return the inorder traversal of the built tree."],
    difficulty: 3,
    examples: [
      { input: "preorder = [8,5,1,7,10,12]", output: "[1,5,7,8,10,12]", explanation: "Inorder traversal of any BST returns sorted values." },
      { input: "preorder = []", output: "[]", explanation: "An empty preorder builds an empty tree." }
    ],
    functionName: "bstInorderFromPreorder",
    id: "external-bst-from-preorder",
    prompt: "Build the BST described by preorder and return its inorder traversal.",
    rating: 1563,
    source: { dislikes: 93, likes: 6799, slug: "construct-binary-search-tree-from-preorder-traversal" },
    solver: (args) => bstInorderFromPreorder(args[0] as number[]),
    starterArgs: "preorder",
    title: "BST Inorder From Preorder",
    topics: ["Trees", "Binary Search"]
  },
  {
    cases: [
      { args: [[[20, 15, 1], [20, 17, 0], [50, 20, 1], [50, 80, 0], [80, 19, 1]]], name: "builds described tree" },
      { args: [[[1, 2, 1], [1, 3, 0]]], name: "simple root with two children" },
      { args: [[[2, 1, 1]]], name: "single edge" },
      { args: [[[5, 3, 1], [5, 8, 0], [3, 2, 1], [3, 4, 0]]], name: "larger tree" },
      { args: [[[7, 9, 0], [9, 10, 1]]], name: "right then left chain" },
      { args: [[[4, 2, 1], [2, 1, 1], [1, 0, 1]]], name: "left chain" },
      { args: [[[4, 6, 0], [6, 8, 0], [8, 9, 0]]], name: "right chain" },
      { args: [[[10, 4, 1], [10, 12, 0], [12, 11, 1]]], name: "mixed levels" },
      { args: [[[3, 1, 1], [3, 5, 0], [1, 0, 1], [5, 6, 0]]], name: "two subtrees" },
      { args: [[]], name: "empty descriptions" }
    ],
    constraints: ["Each description is [parent, child, isLeft].", "isLeft is 1 for left child and 0 for right child.", "Return level-order values, using null only for missing nodes before later values."],
    difficulty: 3,
    examples: [
      { input: "descriptions = [[1,2,1],[1,3,0]]", output: "[1,2,3]", explanation: "1 is the root, with 2 on the left and 3 on the right." },
      { input: "descriptions = []", output: "[]", explanation: "With no parent-child descriptions, there is no root node and the level-order output is empty." }
    ],
    functionName: "treeLevelOrderFromDescriptions",
    id: "external-create-tree-descriptions",
    prompt: "Build a binary tree from parent-child descriptions and return its level-order values.",
    rating: 1644,
    source: { dislikes: 40, likes: 1665, slug: "create-binary-tree-from-descriptions" },
    solver: (args) => treeLevelOrderFromDescriptions(args[0] as Array<[number, number, number]>),
    starterArgs: "descriptions",
    title: "Tree From Descriptions",
    topics: ["Trees", "Hash Map", "BFS"]
  },
  {
    cases: [
      { args: [{ val: 3, left: { val: 5, left: { val: 6 }, right: { val: 2, left: { val: 7 }, right: { val: 4 } } }, right: { val: 1, left: { val: 0 }, right: { val: 8 } } }, 5, 2], name: "classic target distance" },
      { args: [{ val: 1 }, 1, 3], name: "single node too far" },
      { args: [{ val: 1 }, 1, 0], name: "target distance zero" },
      { args: [{ val: 1, left: { val: 2 }, right: { val: 3 } }, 1, 1], name: "children at distance one" },
      { args: [{ val: 1, left: { val: 2, left: { val: 4 } }, right: { val: 3 } }, 2, 1], name: "parent and child" },
      { args: [{ val: 1, left: { val: 2, left: { val: 4 } }, right: { val: 3 } }, 4, 2], name: "walk upward to root" },
      { args: [{ val: 10, left: { val: 5, right: { val: 7 } }, right: { val: 15 } }, 7, 2], name: "target leaf to ancestor sibling" },
      { args: [{ val: 8, left: { val: 4 }, right: { val: 12, left: { val: 10 }, right: { val: 14 } } }, 12, 1], name: "both children and parent" },
      { args: [{ val: 2, left: { val: 1 }, right: { val: 3 } }, 9, 1], name: "missing target" },
      { args: [null, 1, 1], name: "empty tree" }
    ],
    constraints: ["Return values at exactly k edges from target.", "Movement may go to parent or child.", "Return values sorted ascending."],
    difficulty: 4,
    examples: [
      { input: "root = { val: 1, left: { val: 2 }, right: { val: 3 } }, target = 1, k = 1", output: "[2,3]", explanation: "Both children are one edge from the target." },
      { input: "root = { val: 1 }, target = 1, k = 0", output: "[1]", explanation: "Distance zero returns the target itself." }
    ],
    functionName: "nodesDistanceK",
    id: "external-nodes-distance-k",
    prompt: "Return sorted node values exactly k edges away from the target value in a binary tree.",
    rating: 1663,
    source: { dislikes: 278, likes: 12154, slug: "all-nodes-distance-k-in-binary-tree" },
    solver: (args) => nodesDistanceK(args[0] as TreeNode | null, args[1] as number, args[2] as number),
    starterArgs: "root, target, k",
    title: "Nodes Distance K",
    topics: ["Trees", "BFS", "Graphs"]
  },
  {
    cases: [
      { args: [{ val: 1, left: { val: 2 }, right: { val: 3 } }], name: "split simple tree" },
      { args: [{ val: 1, left: { val: 2, left: { val: 4 }, right: { val: 5 } }, right: { val: 3 } }], name: "larger tree" },
      { args: [{ val: 2, left: { val: 3 }, right: { val: 9 } }], name: "right split best" },
      { args: [{ val: 5 }], name: "single node cannot split" },
      { args: [{ val: 1, left: { val: 1 }, right: { val: 1 } }], name: "equal small children" },
      { args: [{ val: 10, left: { val: 10 }, right: { val: 10 } }], name: "equal large children" },
      { args: [{ val: 4, left: { val: 2, left: { val: 1 } }, right: { val: 6 } }], name: "nested left subtree" },
      { args: [{ val: 3, right: { val: 4, right: { val: 5 } } }], name: "right chain" },
      { args: [{ val: 3, left: { val: 4, left: { val: 5 } } }], name: "left chain" },
      { args: [null], name: "empty tree" }
    ],
    constraints: ["Remove exactly one edge to split the tree.", "Return the maximum product of the two resulting subtree sums.", "Return 0 when no split is possible."],
    difficulty: 4,
    examples: [
      { input: "root = { val: 1, left: { val: 2 }, right: { val: 3 } }", output: "9", explanation: "Splitting off the subtree sum 3 leaves sum 3, product 9." },
      { input: "root = { val: 5 }", output: "0", explanation: "A single node has no edge to remove." }
    ],
    functionName: "maxTreeSplitProduct",
    id: "external-max-product-split-tree",
    prompt: "Return the maximum product of subtree sums after removing one edge from the binary tree.",
    rating: 1675,
    source: { dislikes: 122, likes: 3584, slug: "maximum-product-of-splitted-binary-tree" },
    solver: (args) => maxTreeSplitProduct(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Maximum Product Split Tree",
    topics: ["Trees", "DFS"]
  },
  {
    cases: [
      { args: [3, [[0, 1], [0, 2], [1, 2]]], name: "fully connected graph" },
      { args: [7, [[0, 2], [0, 5], [2, 4], [1, 6], [5, 4]]], name: "two components" },
      { args: [4, []], name: "all isolated nodes" },
      { args: [5, [[0, 1], [2, 3]]], name: "two pairs and isolated" },
      { args: [1, []], name: "single node" },
      { args: [6, [[0, 1], [1, 2], [3, 4]]], name: "chain and pair components" },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], name: "one connected chain" },
      { args: [8, [[0, 1], [2, 3], [4, 5], [6, 7]]], name: "four pairs" },
      { args: [6, [[0, 1], [0, 2], [3, 4], [4, 5]]], name: "two size three components" },
      { args: [9, [[0, 1], [2, 3], [3, 4], [6, 7]]], name: "multiple sizes and isolated" }
    ],
    constraints: ["Nodes are numbered from 0 to n - 1.", "Edges are undirected.", "Return the number of unordered node pairs that cannot reach each other."],
    difficulty: 3,
    examples: [
      { input: "n = 3, edges = [[0,1],[0,2],[1,2]]", output: "0", explanation: "All three nodes are in one connected component, so no pair of nodes is unreachable." },
      { input: "n = 4, edges = []", output: "6", explanation: "All six unordered pairs are unreachable." }
    ],
    functionName: "countUnreachablePairs",
    id: "external-unreachable-node-pairs",
    prompt: "Return how many unordered pairs of nodes are in different connected components.",
    rating: 1604,
    source: { dislikes: 56, likes: 2273, slug: "count-unreachable-pairs-of-nodes-in-an-undirected-graph" },
    solver: (args) => countUnreachablePairs(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, edges",
    title: "Unreachable Node Pairs",
    topics: ["Graphs", "DFS"]
  },
  {
    cases: [
      { args: [[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]], name: "odd cycle not bipartite" },
      { args: [[[1, 3], [0, 2], [1, 3], [0, 2]]], name: "even cycle bipartite" },
      { args: [[[]]], name: "single isolated node" },
      { args: [[[1], [0], [3], [2]]], name: "two separate edges" },
      { args: [[[1, 2], [0], [0]]], name: "star graph" },
      { args: [[[1], [0, 2], [1, 3], [2, 0]]], name: "four cycle" },
      { args: [[[1], [0, 2], [1, 0]]], name: "triangle" },
      { args: [[[1, 4], [0, 2], [1, 3], [2], [0]]], name: "path with leaf" },
      { args: [[[1], [0], [], [4], [3]]], name: "isolated and edge components" },
      { args: [Array.from({ length: 0 })], name: "empty graph" }
    ],
    constraints: ["graph[i] lists neighbors of node i.", "The graph is undirected.", "Return true if the graph can be colored using two colors with no same-color edge."],
    difficulty: 3,
    examples: [
      { input: "graph = [[1,3],[0,2],[1,3],[0,2]]", output: "true", explanation: "The even cycle can be split into two sides." },
      { input: "graph = [[1],[0,2],[1,0]]", output: "false", explanation: "A triangle forces two adjacent nodes to share a color." }
    ],
    functionName: "isBipartiteGraph",
    id: "external-is-graph-bipartite",
    prompt: "Return true if an undirected graph can be split into two groups with no edge inside a group.",
    rating: 1625,
    source: { dislikes: 421, likes: 9268, slug: "is-graph-bipartite" },
    solver: (args) => isBipartiteGraph(args[0] as number[][]),
    starterArgs: "graph",
    title: "Is Graph Bipartite",
    topics: ["Graphs", "BFS"]
  },
  {
    cases: [
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], name: "one stop cheaper path" },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], name: "direct flight only" },
      { args: [4, [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 3, 500]], 0, 3, 1], name: "stop limit blocks cheapest" },
      { args: [4, [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 3, 500]], 0, 3, 2], name: "two stops allow chain" },
      { args: [3, [[0, 1, 100]], 0, 2, 1], name: "destination unreachable" },
      { args: [1, [], 0, 0, 0], name: "source is destination" },
      { args: [5, [[0, 1, 50], [1, 4, 50], [0, 2, 30], [2, 3, 30], [3, 4, 30]], 0, 4, 1], name: "shorter stop count wins" },
      { args: [5, [[0, 1, 50], [1, 4, 50], [0, 2, 30], [2, 3, 30], [3, 4, 30]], 0, 4, 2], name: "more stops allow cheaper route" },
      { args: [4, [[0, 1, 5], [1, 2, 5], [0, 2, 20], [2, 3, 5]], 0, 3, 1], name: "must use direct to intermediate" },
      { args: [4, [[0, 1, 5], [1, 2, 5], [0, 2, 20], [2, 3, 5]], 0, 3, 2], name: "chain becomes cheapest" }
    ],
    constraints: ["flights are [from, to, price].", "At most k stops means at most k intermediate cities.", "Return -1 when no valid route exists."],
    difficulty: 4,
    examples: [
      { input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1", output: "200", explanation: "The route 0 -> 1 -> 2 uses one stop and costs 200." },
      { input: "n = 3, flights = [[0,1,100]], src = 0, dst = 2, k = 1", output: "-1", explanation: "The only flight leaves city 0 for city 1; there is no flight path onward to city 2 within 1 stop." }
    ],
    functionName: "cheapestFlightWithinStops",
    id: "external-cheapest-flights-k-stops",
    prompt: "Return the cheapest flight price from src to dst using at most k stops.",
    rating: 1786,
    source: { dislikes: 469, likes: 11269, slug: "cheapest-flights-within-k-stops" },
    solver: (args) => cheapestFlightWithinStops(args[0] as number, args[1] as Array<[number, number, number]>, args[2] as number, args[3] as number, args[4] as number),
    starterArgs: "n, flights, src, dst, k",
    title: "Cheapest Flights Within Stops",
    topics: ["Graphs", "Dynamic Programming", "BFS"]
  },
  {
    cases: [
      { args: [[10, 6, 8, 5, 11, 9]], name: "classic visibility counts" },
      { args: [[5, 1, 2, 3, 10]], name: "increasing tail" },
      { args: [[5, 4, 3, 2, 1]], name: "descending heights" },
      { args: [[1, 2, 3, 4, 5]], name: "ascending heights" },
      { args: [[7]], name: "single person" },
      { args: [[2, 2, 2]], name: "equal heights" },
      { args: [[3, 1, 4, 2]], name: "taller blocker" },
      { args: [[8, 3, 6, 1, 5]], name: "multiple blockers" },
      { args: [[1, 5, 3, 6, 4, 2]], name: "alternating heights" },
      { args: [[9, 1, 8, 2, 7, 3]], name: "large front blockers" }
    ],
    constraints: ["A person can see rightward until a person at least as tall blocks the view.", "Return the visible count for each position.", "Input values are heights."],
    difficulty: 5,
    examples: [
      { input: "heights = [10,6,8,5,11,9]", output: "[3,1,2,1,1,0]", explanation: "Each person sees shorter people until the first taller or equal blocker." },
      { input: "heights = [1,2,3]", output: "[1,1,0]", explanation: "Each person sees the next taller person, then visibility stops." }
    ],
    functionName: "visiblePeopleToRight",
    id: "external-visible-people-queue",
    prompt: "Return how many people each person can see to their right in the queue.",
    rating: 2105,
    source: { dislikes: 68, likes: 2239, slug: "number-of-visible-people-in-a-queue" },
    solver: (args) => visiblePeopleToRight(args[0] as number[]),
    starterArgs: "heights",
    title: "Visible People In Queue",
    topics: ["Stacks", "Queues"]
  },
  {
    cases: makeCases([[[1, 2, 3, 4]], [[1, 2, 3, 4, 5, 6, 7]], [[3, 2, 1]], [[10]], [[]], [[5, 1, 7, 0, 2]], [[8, 6, 10, 4, 7, 9, 12]], [[2, 1, 3]], [[9, 3, 11, 1, 5]], [[4, 2, 6, 1, 3, 5, 7]]], "balances bst values"),
    constraints: ["values are the BST node values.", "Build a height-balanced BST from the same values.", "Return its level-order values."],
    difficulty: 3,
    examples: [
      { input: "values = [1,2,3]", output: "[2,1,3]", explanation: "The middle value becomes the root of a balanced BST." },
      { input: "values = []", output: "[]", explanation: "An empty input has no node values to place in a balanced BST, so the level-order tree is empty." }
    ],
    functionName: "balancedBstLevelOrder",
    id: "external-balance-bst",
    prompt: "Return the level-order values of a height-balanced BST built from the given BST values.",
    rating: 1541,
    source: { dislikes: 105, likes: 4182, slug: "balance-a-binary-search-tree" },
    solver: (args) => balancedBstLevelOrder(args[0] as number[]),
    starterArgs: "values",
    title: "Balance Binary Search Tree",
    topics: ["Trees", "Binary Search"]
  },
  {
    cases: makeCases([[{ val: 1, left: { val: 4, left: { val: 7 } }, right: { val: 3, left: { val: 9 }, right: { val: 8 } } }], [{ val: 1 }], [{ val: 1, left: { val: 3 }, right: { val: 2 } }], [{ val: 1, left: { val: 2, left: { val: 3 } } }], [{ val: 1, right: { val: 2, right: { val: 3 } } }], [{ val: 5, left: { val: 1 }, right: { val: 4 } }], [{ val: 7, left: { val: 6 }, right: { val: 5 } }], [{ val: 2, left: { val: 9, left: { val: 1 }, right: { val: 3 } }, right: { val: 4 } }], [{ val: 10, left: { val: 1 }, right: { val: 20, left: { val: 15 } } }], [null]], "sorts levels"),
    constraints: ["At each tree level, you may swap node values.", "Return the minimum swaps needed so every level is sorted ascending.", "Return 0 for an empty tree."],
    difficulty: 3,
    examples: [
      { input: "root = { val: 1, left: { val: 3 }, right: { val: 2 } }", output: "1", explanation: "Level 2 contains values [3,2]; one swap changes it to sorted order [2,3]." },
      { input: "root = { val: 1 }", output: "0", explanation: "A single node level is already sorted." }
    ],
    functionName: "minLevelSortSwaps",
    id: "external-sort-binary-tree-levels",
    prompt: "Return the minimum swaps needed to sort each binary-tree level ascending.",
    rating: 1635,
    source: { dislikes: 45, likes: 1254, slug: "minimum-number-of-operations-to-sort-a-binary-tree-by-level" },
    solver: (args) => minLevelSortSwaps(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Sort Binary Tree Levels",
    topics: ["Trees", "BFS"]
  },
  {
    cases: makeCases([[{ val: 5, left: { val: 2 }, right: { val: 4 } }, 1], [{ val: 5, left: { val: 2 }, right: { val: 4 } }, 2], [{ val: 1 }, 1], [{ val: 1 }, 2], [{ val: 1, left: { val: 2, left: { val: 4 }, right: { val: 5 } }, right: { val: 3 } }, 1], [{ val: 1, left: { val: 2, left: { val: 4 }, right: { val: 5 } }, right: { val: 3 } }, 2], [{ val: 1, left: { val: 2 }, right: { val: 3, right: { val: 4 } } }, 1], [null, 1], [{ val: 9, left: { val: 8 }, right: { val: 7 } }, 3], [{ val: 6, left: { val: 4, left: { val: 2 }, right: { val: 5 } }, right: { val: 8 } }, 2]], "finds perfect subtree size"),
    constraints: ["A perfect subtree has all leaves on the same level and every internal node has two children.", "Return the kth largest perfect subtree size.", "Return -1 when fewer than k perfect subtrees exist."],
    difficulty: 3,
    examples: [
      { input: "root = { val: 5, left: { val: 2 }, right: { val: 4 } }, k = 1", output: "3", explanation: "The whole tree is perfect and has size 3." },
      { input: "root = { val: 1 }, k = 2", output: "-1", explanation: "The single node is one perfect subtree of size 1, but there is no second perfect subtree for k = 2." }
    ],
    functionName: "kthPerfectSubtreeSize",
    id: "external-kth-perfect-subtree",
    prompt: "Return the kth largest size among perfect subtrees in the binary tree.",
    rating: 1603,
    source: { dislikes: 15, likes: 158, slug: "k-th-largest-perfect-subtree-size-in-binary-tree" },
    solver: (args) => kthPerfectSubtreeSize(args[0] as TreeNode | null, args[1] as number),
    starterArgs: "root, k",
    title: "Kth Perfect Subtree Size",
    topics: ["Trees", "DFS"]
  },
  {
    cases: makeCases([[{ val: 1, left: { val: 4, left: { val: 2 }, right: { val: 4 } }, right: { val: 3, left: { val: 2 }, right: { val: 5 } } }], [{ val: 4, left: { val: 3 }, right: { val: 8 } }], [{ val: 5, left: { val: 4 }, right: { val: 8, left: { val: 6 }, right: { val: 3 } } }], [{ val: -1 }], [{ val: 2, left: { val: 1 }, right: { val: 3 } }], [{ val: 2, left: { val: 3 }, right: { val: 1 } }], [null], [{ val: 10, left: { val: 5, left: { val: 1 }, right: { val: 8 } }, right: { val: 15, right: { val: 7 } } }], [{ val: 8, left: { val: 6 }, right: { val: 10 } }], [{ val: 0, left: { val: -2 }, right: { val: 3 } }]], "finds max bst sum"),
    constraints: ["A valid BST has all left values lower and all right values higher.", "Return the maximum sum of any subtree that is a BST.", "Return 0 if every valid BST sum is negative."],
    difficulty: 5,
    examples: [
      { input: "root = { val: 2, left: { val: 1 }, right: { val: 3 } }", output: "6", explanation: "The whole tree is a BST with sum 6." },
      { input: "root = { val: -1 }", output: "0", explanation: "Negative BST sums do not improve the answer." }
    ],
    functionName: "maxSumBstSubtree",
    id: "external-max-sum-bst",
    prompt: "Return the maximum sum among all subtrees that are valid binary search trees.",
    rating: 1914,
    source: { dislikes: 200, likes: 3007, slug: "maximum-sum-bst-in-binary-tree" },
    solver: (args) => maxSumBstSubtree(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Maximum Sum BST Subtree",
    topics: ["Trees", "DFS"]
  },
  {
    cases: makeCases([[{ val: 1, right: { val: 1, left: { val: 1, right: { val: 1 } } } }], [{ val: 1 }], [{ val: 1, left: { val: 2 } }], [{ val: 1, left: { val: 2, right: { val: 3, left: { val: 4 } } } }], [{ val: 1, right: { val: 2, left: { val: 3, right: { val: 4, left: { val: 5 } } } } }], [null], [{ val: 1, left: { val: 2, left: { val: 3 } } }], [{ val: 1, right: { val: 2, right: { val: 3 } } }], [{ val: 1, left: { val: 2, right: { val: 4 } }, right: { val: 3, left: { val: 5 } } }], [{ val: 1, left: { val: 2, right: { val: 3 } }, right: { val: 4, left: { val: 5, right: { val: 6 } } } }]], "finds longest zigzag"),
    constraints: ["A zigzag path alternates left and right child moves.", "Return the number of edges in the longest zigzag path.", "A single node has length 0."],
    difficulty: 4,
    examples: [
      { input: "root = { val: 1, left: { val: 2 } }", output: "1", explanation: "One child edge forms a zigzag of length 1." },
      { input: "root = { val: 1 }", output: "0", explanation: "A single-node tree has no left or right child edge, so there is no alternating path to count." }
    ],
    functionName: "longestZigzagPath",
    id: "external-longest-zigzag-tree",
    prompt: "Return the longest path length that alternates left and right moves in a binary tree.",
    rating: 1713,
    source: { dislikes: 86, likes: 3762, slug: "longest-zigzag-path-in-a-binary-tree" },
    solver: (args) => longestZigzagPath(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Longest ZigZag Tree Path",
    topics: ["Trees", "DFS"]
  },
  {
    cases: makeCases([[4, [[0, 1], [0, 2], [1, 2]]], [6, [[0, 1], [0, 2], [0, 3], [1, 2]]], [4, [[0, 1], [2, 3]]], [5, [[0, 1], [0, 2], [3, 4], [2, 3]]], [1, []], [3, [[0, 1], [1, 2], [0, 2]]], [5, []], [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], [6, [[0, 1], [2, 3], [4, 5], [1, 2]]], [4, [[0, 1], [0, 2], [0, 3]]]], "connects network"),
    constraints: ["connections are undirected cables.", "You may move extra cables between computers.", "Return the minimum operations to connect all computers, or -1 if impossible."],
    difficulty: 3,
    examples: [
      { input: "n = 4, connections = [[0,1],[0,2],[1,2]]", output: "1", explanation: "One extra cable can connect the isolated computer." },
      { input: "n = 4, connections = [[0,1],[2,3]]", output: "-1", explanation: "There are not enough cables to connect all computers." }
    ],
    functionName: "makeNetworkConnected",
    id: "external-network-connected",
    prompt: "Return the fewest cable moves needed to connect every computer in the network.",
    rating: 1633,
    source: { dislikes: 85, likes: 5621, slug: "number-of-operations-to-make-network-connected" },
    solver: (args) => makeNetworkConnected(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, connections",
    title: "Make Network Connected",
    topics: ["Graphs", "DFS"]
  },
  {
    cases: makeCases([[6, [[0, 1], [1, 3], [2, 3], [4, 0], [4, 5]]], [5, [[1, 0], [1, 2], [3, 2], [3, 4]]], [3, [[1, 0], [2, 0]]], [4, [[0, 1], [2, 0], [3, 2]]], [1, []], [4, [[1, 0], [2, 0], [3, 0]]], [4, [[0, 1], [0, 2], [0, 3]]], [5, [[0, 1], [2, 0], [3, 2], [4, 3]]], [6, [[1, 0], [2, 0], [3, 2], [4, 3], [5, 4]]], [3, [[0, 1], [1, 2]]]], "reorders routes"),
    constraints: ["connections are directed roads.", "Reverse the fewest roads so every city can reach city 0.", "The roads form a tree."],
    difficulty: 3,
    examples: [
      { input: "n = 3, connections = [[0,1],[1,2]]", output: "2", explanation: "Both roads point away from city 0 and must be reversed." },
      { input: "n = 3, connections = [[1,0],[2,0]]", output: "0", explanation: "Every city can already reach city 0." }
    ],
    functionName: "minReorderRoutesToZero",
    id: "external-reorder-routes-zero",
    prompt: "Return the minimum directed roads to reverse so every city can reach city 0.",
    rating: 1634,
    source: { dislikes: 150, likes: 4667, slug: "reorder-routes-to-make-all-paths-lead-to-the-city-zero" },
    solver: (args) => minReorderRoutesToZero(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, connections",
    title: "Reorder Routes To Zero",
    topics: ["Graphs", "DFS"]
  },
  {
    cases: makeCases([[4, [[1, 2], [1, 3], [2, 4]]], [3, [[1, 2], [1, 3], [2, 3]]], [5, [[1, 2], [3, 4], [4, 5], [3, 5]]], [1, []], [2, [[1, 2]]], [4, [[1, 2], [3, 4]]], [4, [[1, 2], [2, 3], [3, 4], [4, 1]]], [4, [[1, 2], [2, 3], [3, 1]]], [6, [[1, 2], [2, 3], [4, 5]]], [6, [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]]]], "checks possible bipartition"),
    constraints: ["People are numbered 1 through n.", "dislikes are undirected conflict pairs.", "Return true if people can be split into two groups with no disliked pair inside a group."],
    difficulty: 4,
    examples: [
      { input: "n = 4, dislikes = [[1,2],[1,3],[2,4]]", output: "true", explanation: "One valid split is group A = [1,4] and group B = [2,3], which separates every disliked pair." },
      { input: "n = 3, dislikes = [[1,2],[1,3],[2,3]]", output: "false", explanation: "The triangle cannot be split into two conflict-free groups." }
    ],
    functionName: "possibleBipartition",
    id: "external-possible-bipartition",
    prompt: "Return true if disliked pairs can be separated into two groups.",
    rating: 1795,
    source: { dislikes: 120, likes: 4931, slug: "possible-bipartition" },
    solver: (args) => possibleBipartition(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, dislikes",
    title: "Possible Bipartition",
    topics: ["Graphs", "BFS"]
  },
  {
    cases: makeCases([[[[0, 1], [1, 0]]], [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], [[[1, 0], [0, 0]]], [[[0]]], [[[1]]], [[[0, 0], [0, 0]]], [[[0, 1, 0], [0, 0, 0], [1, 0, 0]]], [[[0, 1, 1], [1, 0, 1], [1, 1, 0]]], [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], [[[0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0], [1, 1, 0, 0]]]], "finds shortest binary matrix path"),
    constraints: ["0 means open and 1 means blocked.", "You may move in 8 directions.", "Return the shortest path length from top-left to bottom-right, or -1."],
    difficulty: 3,
    examples: [
      { input: "grid = [[0,1],[1,0]]", output: "2", explanation: "Move diagonally from start to finish." },
      { input: "grid = [[1]]", output: "-1", explanation: "The only cell is the start and it is blocked, so no clear path can begin." }
    ],
    functionName: "shortestBinaryMatrixPath",
    id: "external-shortest-binary-matrix-path",
    prompt: "Return the shortest clear path length through a binary matrix using eight-direction movement.",
    rating: 1658,
    source: { dislikes: 276, likes: 7451, slug: "shortest-path-in-binary-matrix" },
    solver: (args) => shortestBinaryMatrixPath(args[0] as number[][]),
    starterArgs: "grid",
    title: "Shortest Binary Matrix Path",
    topics: ["Graphs", "BFS", "Grid"]
  },
  {
    cases: makeCases([[[5, 0, 3, 8, 6]], [[1, 1, 1, 0, 6, 12]], [[1, 1]], [[2, 3, 1, 5, 4, 6]], [[1, 2, 3, 4]], [[4, 3, 2, 1]], [[1, 5, 2, 6, 3, 7]], [[10, 0, 5, 7, 6]], [[3, 3, 3, 3]], [[6, 0, 8, 30, 37, 6, 75, 98, 39, 90, 63, 74, 52, 92, 64]]], "splits disjoint array"),
    constraints: ["Both partitions must be non-empty.", "Every value in the left partition must be less than or equal to every value in the right partition.", "Return the smallest possible left partition length."],
    difficulty: 3,
    examples: [
      { input: "nums = [5,0,3,8,6]", output: "3", explanation: "The split [5,0,3] and [8,6] works because 5 is less than both right-side values." },
      { input: "nums = [1,1,1,0,6,12]", output: "4", explanation: "The 0 must stay in the left partition, so the first valid split is after index 3." }
    ],
    functionName: "partitionDisjointIndex",
    id: "external-partition-disjoint-array",
    prompt: "Return the smallest left partition length so every left value is less than or equal to every right value.",
    rating: 1501,
    source: { dislikes: 83, likes: 1772, slug: "partition-array-into-disjoint-intervals" },
    solver: (args) => partitionDisjointIndex(args[0] as number[]),
    starterArgs: "nums",
    title: "Partition Array Into Disjoint Intervals",
    topics: ["Arrays", "Prefix"]
  },
  {
    cases: makeCases([[[55, 30, 5, 4, 2], [100, 20, 10, 10, 5]], [[2, 2, 2], [10, 10, 1]], [[30, 29, 19, 5], [25, 25, 25, 25, 25]], [[5, 4], [3, 2]], [[9, 8, 7], [9, 8, 7]], [[4], [5]], [[10, 9, 8, 7], [11, 10, 9, 8]], [[100, 80, 60], [90, 80, 70, 60]], [[1, 1, 1], [1, 1, 1]], [[20, 15, 10, 5], [20, 19, 18, 5]]], "finds widest valid pair"),
    constraints: ["Both arrays are sorted in non-increasing order.", "Use indices i and j with i <= j.", "Return the maximum j - i where nums1[i] <= nums2[j]."],
    difficulty: 3,
    examples: [
      { input: "nums1 = [55,30,5,4,2], nums2 = [100,20,10,10,5]", output: "2", explanation: "Pair i = 2 and j = 4 gives distance 2 because 5 <= 5." },
      { input: "nums1 = [2,2,2], nums2 = [10,10,1]", output: "1", explanation: "The best valid pair is i = 0, j = 1." }
    ],
    functionName: "maximumDistancePairValues",
    id: "external-maximum-distance-pair-values",
    prompt: "Return the maximum distance between a valid pair across two non-increasing arrays.",
    rating: 1515,
    source: { dislikes: 37, likes: 1595, slug: "maximum-distance-between-a-pair-of-values" },
    solver: (args) => maximumDistancePairValues(args[0] as number[], args[1] as number[]),
    starterArgs: "nums1, nums2",
    title: "Maximum Distance Between Valid Pairs",
    topics: ["Arrays", "Two Pointers"]
  },
  {
    cases: makeCases([[[2, 3, 4, 6]], [[1, 2, 4, 5, 10]], [[2, 3, 4, 6, 8, 12]], [[1, 1, 1]], [[2, 2, 4, 4]], [[3, 5, 7, 11]], [[1, 2, 3, 4, 6, 8, 12, 24]], [[4, 6, 8, 12, 16, 24]], [[2, 5, 10, 20]], [[1, 3, 9, 27, 81]]], "counts equal product tuples"),
    constraints: ["nums contains positive integers.", "A tuple uses four distinct indices.", "Different index orderings count as different tuples."],
    difficulty: 3,
    examples: [
      { input: "nums = [2,3,4,6]", output: "8", explanation: "2 * 6 equals 3 * 4, and those four values can be ordered in 8 valid tuples." },
      { input: "nums = [1,2,4,5,10]", output: "16", explanation: "Products 10 and 20 each appear from two different pairs." }
    ],
    functionName: "tupleSameProductCount",
    id: "external-tuple-same-product",
    prompt: "Count ordered tuples of four distinct numbers where the product of the first pair equals the product of the second pair.",
    rating: 1530,
    source: { dislikes: 59, likes: 1375, slug: "tuple-with-same-product" },
    solver: (args) => tupleSameProductCount(args[0] as number[]),
    starterArgs: "nums",
    title: "Tuple With Same Product",
    topics: ["Hash Map", "Arrays"]
  },
  {
    cases: makeCases([[[2, 3, 1, 6, 7]], [[1, 1, 1, 1, 1]], [[2, 3]], [[7, 11, 12, 9, 5, 2, 7, 17, 22]], [[0, 0, 0]], [[5, 1, 4, 1, 5]], [[3, 3, 3]], [[4, 2, 2, 6, 4]], [[8, 1, 2, 12, 7, 6]], [[10, 10, 10, 10]]], "counts xor triplets"),
    constraints: ["Choose indices i < j <= k.", "The xor of arr[i..j-1] must equal the xor of arr[j..k].", "Return the number of valid triplets."],
    difficulty: 3,
    examples: [
      { input: "arr = [2,3,1,6,7]", output: "4", explanation: "Four choices split a zero-xor range into two equal-xor parts." },
      { input: "arr = [1,1,1,1,1]", output: "10", explanation: "Many even-length zero-xor ranges produce valid split points." }
    ],
    functionName: "xorTripletCount",
    id: "external-count-xor-triplets",
    prompt: "Count triplets where the xor on the left side of the split equals the xor on the right side.",
    rating: 1525,
    source: { dislikes: 138, likes: 2030, slug: "count-triplets-that-can-form-two-arrays-of-equal-xor" },
    solver: (args) => xorTripletCount(args[0] as number[]),
    starterArgs: "arr",
    title: "Count Equal XOR Triplets",
    topics: ["Hash Map", "Bit Manipulation", "Arrays"]
  },
  {
    cases: makeCases([[[2, 1, 3, 4], 1], [[2, 0, 2, 0], 0], [[1, 2, 3], 4], [[0], 1], [[7, 7, 7], 7], [[5, 6, 7, 8], 9], [[10, 12, 15], 3], [[1, 1, 1, 1], 2], [[31, 14, 7], 8], [[4, 4, 4, 4], 4]], "counts xor bit flips"),
    constraints: ["One operation flips one bit in the array xor.", "Return the minimum number of bit flips needed to make the xor equal k.", "All values are non-negative integers."],
    difficulty: 3,
    examples: [
      { input: "nums = [2,1,3,4], k = 1", output: "2", explanation: "The current xor differs from k in two bit positions." },
      { input: "nums = [2,0,2,0], k = 0", output: "0", explanation: "The xor is 2 ^ 0 ^ 2 ^ 0 = 0, which already matches k, so no bit flips are needed." }
    ],
    functionName: "minXorOperations",
    id: "external-min-xor-operations",
    prompt: "Return the minimum bit flips needed so the xor of all numbers equals k.",
    rating: 1525,
    source: { dislikes: 61, likes: 625, slug: "minimum-number-of-operations-to-make-array-xor-equal-to-k" },
    solver: (args) => minXorOperations(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Minimum Operations For Target XOR",
    topics: ["Hash Map", "Bit Manipulation"]
  },
  {
    cases: makeCases([["ca"], ["cabaabac"], ["aabccabba"], ["aaaa"], ["abc"], ["abbbbbba"], ["bbbbbbbbbbbb"], ["cabbaac"], ["ccabcc"], ["aabcaa"]], "trims matching string ends"),
    constraints: ["At each step, delete a non-empty prefix and suffix made of the same character.", "The prefix and suffix cannot overlap.", "Return the minimum remaining length."],
    difficulty: 3,
    examples: [
      { input: 's = "ca"', output: "2", explanation: "The ends are different, so nothing can be deleted." },
      { input: 's = "cabaabac"', output: "0", explanation: "Repeatedly delete matching c, then a, then b groups until empty." }
    ],
    functionName: "minimumLengthAfterDeletingSimilarEnds",
    id: "external-minimum-length-similar-ends",
    prompt: "Return the minimum string length after repeatedly deleting matching character groups from both ends.",
    rating: 1502,
    source: { dislikes: 112, likes: 1325, slug: "minimum-length-of-string-after-deleting-similar-ends" },
    solver: (args) => minimumLengthAfterDeletingSimilarEnds(args[0] as string),
    starterArgs: "s",
    title: "Minimum Length After Deleting Similar Ends",
    topics: ["Two Pointers", "Strings"]
  },
  {
    cases: makeCases([["abcabc"], ["aaacb"], ["abc"], ["aaaa"], ["abca"], ["cababc"], ["aabbccabc"], ["bbbcca"], ["acbbcac"], ["abcabcabc"]], "counts abc substrings"),
    constraints: ["s contains only a, b, and c.", "Count substrings containing all three characters at least once.", "Return a number."],
    difficulty: 3,
    examples: [
      { input: 's = "abcabc"', output: "10", explanation: "Every start position can form several substrings after all three characters appear." },
      { input: 's = "aaacb"', output: "3", explanation: "Only substrings ending at the final b can contain a, b, and c." }
    ],
    functionName: "numberOfSubstringsAllThree",
    id: "external-number-substrings-all-three",
    prompt: "Count substrings that contain at least one a, one b, and one c.",
    rating: 1646,
    source: { dislikes: 83, likes: 4472, slug: "number-of-substrings-containing-all-three-characters" },
    solver: (args) => numberOfSubstringsAllThree(args[0] as string),
    starterArgs: "s",
    title: "Substrings Containing A, B, And C",
    topics: ["Sliding Window", "Strings"]
  },
  {
    cases: makeCases([[[2, 1, 2], 3], [[0, 4], 5], [[6, 3, 3, 2], 2], [[1, 1, 1], 6], [[5], 4], [[4, 3, 2, 1], 7], [[10, 10], 1], [[2, 8, 5], 5], [[3, 3, 3, 3], 4], [[1, 9, 9], 3]], "maximizes product after increments"),
    constraints: ["Each operation increments one array element by 1.", "Use exactly k operations.", "Return the maximum product modulo 1,000,000,007."],
    difficulty: 3,
    examples: [
      { input: "nums = [2,1,2], k = 3", output: "12", explanation: "Raise the 1 and one 2 to make values [3,2,2], product 12." },
      { input: "nums = [0,4], k = 5", output: "20", explanation: "Increment 0 up to 5, then product is 5 * 4." }
    ],
    functionName: "maximumProductAfterIncrements",
    id: "external-max-product-after-increments",
    prompt: "Return the largest product possible after incrementing the smallest useful values exactly k times.",
    rating: 1686,
    source: { dislikes: 45, likes: 792, slug: "maximum-product-after-k-increments" },
    solver: (args) => maximumProductAfterIncrements(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Maximum Product After K Increments",
    topics: ["Heap", "Greedy"]
  },
  {
    cases: makeCases([[[[2, 1, 3], [6, 5, 4], [7, 8, 9]]], [[[-19, 57], [-40, -5]]], [[[1]]], [[[100, -42, -46, -41], [31, 97, 10, -10], [-58, -51, 82, 89], [51, 81, 69, -51]]], [[[7, 6, 5], [4, 3, 2], [1, 0, -1]]], [[[1, 2], [3, 4]]], [[[-1, -2, -3], [-4, -5, -6], [-7, -8, -9]]], [[[5, 1, 9], [2, 8, 3], [4, 6, 7]]], [[[10, 10, 10], [1, 1, 1], [10, 10, 10]]], [[[0, 2, 3], [4, 5, 6], [7, 8, 9]]]], "finds minimum falling path"),
    constraints: ["From each cell, the next row may use the same column or an adjacent column.", "Return the minimum possible path sum from top row to bottom row.", "The matrix is square."],
    difficulty: 3,
    examples: [
      { input: "matrix = [[2,1,3],[6,5,4],[7,8,9]]", output: "13", explanation: "The path 1 -> 4 -> 8 has the minimum sum." },
      { input: "matrix = [[-19,57],[-40,-5]]", output: "-59", explanation: "Choose -19 in the top row, then move down to adjacent -40; -19 + -40 = -59." }
    ],
    functionName: "minimumFallingPathSum",
    id: "external-minimum-falling-path-sum",
    prompt: "Return the minimum falling path sum through a square matrix.",
    rating: 1573,
    source: { dislikes: 175, likes: 7009, slug: "minimum-falling-path-sum" },
    solver: (args) => minimumFallingPathSum(args[0] as number[][]),
    starterArgs: "matrix",
    title: "Minimum Falling Path Sum",
    topics: ["Dynamic Programming", "Arrays"]
  },
  {
    cases: makeCases([[[{ val: 1, left: { val: 5, right: { val: 4, left: { val: 9 }, right: { val: 2 } } }, right: { val: 3, left: { val: 10 }, right: { val: 6 } } }, 3]], [[{ val: 1, left: { val: 2 }, right: { val: 3 } }, 2]], [[{ val: 1 }, 1]], [[{ val: 7, left: { val: 4 }, right: { val: 9, left: { val: 8 } } }, 8]], [[{ val: 5, left: { val: 2, left: { val: 1 }, right: { val: 3 } }, right: { val: 8 } }, 1]], [[{ val: 4, left: { val: 2 }, right: { val: 6 } }, 6]], [[{ val: 9, left: { val: 1, right: { val: 3 } }, right: { val: 12 } }, 3]], [[{ val: 10, left: { val: 5 }, right: { val: 15, left: { val: 12 }, right: { val: 18 } } }, 12]], [[{ val: 2, right: { val: 3, right: { val: 4 } } }, 4]], [[{ val: 8, left: { val: 4, left: { val: 2 } }, right: { val: 10 } }, 10]]], "spreads tree infection"),
    constraints: ["Node values are unique.", "Each minute, infection spreads to parent and child neighbors.", "Return the number of minutes until every node is infected."],
    difficulty: 3,
    examples: [
      { input: "root = { val: 1, left: { val: 5 }, right: { val: 3 } }, start = 3", output: "2", explanation: "The infection travels from 3 to 1, then to 5." },
      { input: "root = { val: 1 }, start = 1", output: "0", explanation: "The infection starts at the only node in the tree, so every node is infected at minute 0." }
    ],
    functionName: "infectionMinutes",
    id: "external-binary-tree-infection-time",
    prompt: "Return how many minutes are needed for infection to spread through the whole binary tree.",
    rating: 1711,
    source: { dislikes: 70, likes: 3273, slug: "amount-of-time-for-binary-tree-to-be-infected" },
    solver: (args) => infectionMinutes(args[0] as TreeNode | null, args[1] as number),
    starterArgs: "root, start",
    title: "Binary Tree Infection Time",
    topics: ["Trees", "BFS"]
  },
  {
    cases: makeCases([[{ val: 5, left: { val: 4, left: { val: 1 }, right: { val: 10 } }, right: { val: 9, right: { val: 7 } } }], [{ val: 3, left: { val: 1 }, right: { val: 2 } }], [{ val: 1 }], [{ val: 1, left: { val: 2, left: { val: 4 } }, right: { val: 3, right: { val: 5 } } }], [{ val: 8, left: { val: 3, left: { val: 1 }, right: { val: 6 } }, right: { val: 10, right: { val: 14 } } }], [{ val: 2, left: { val: 1 } }], [{ val: 2, right: { val: 1 } }], [{ val: 10, left: { val: 5 }, right: { val: 15, left: { val: 12 }, right: { val: 20 } } }], [{ val: 4, left: { val: 2, left: { val: 1 } }, right: { val: 6, right: { val: 7 } } }], [null]], "replaces cousin values"),
    constraints: ["Replace each node value with the sum of values at the same depth that are not siblings.", "The root value becomes 0.", "Return the updated tree as compact level-order values."],
    difficulty: 3,
    examples: [
      { input: "root = { val: 3, left: { val: 1 }, right: { val: 2 } }", output: "[0,0,0]", explanation: "The two children are siblings, so neither has cousin value at that level." },
      { input: "root = { val: 1 }", output: "[0]", explanation: "The root is alone on its level, so the cousin sum for that node is 0." }
    ],
    functionName: "replaceCousinValues",
    id: "external-cousins-binary-tree-ii",
    prompt: "Replace every binary tree node with the sum of its cousin values and return compact level-order values.",
    rating: 1677,
    source: { dislikes: 54, likes: 1233, slug: "cousins-in-binary-tree-ii" },
    solver: (args) => replaceCousinValues(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Cousins In Binary Tree II",
    topics: ["Trees", "BFS"]
  },
  {
    cases: makeCases([[{ val: 1, left: { val: 2, left: { val: 4 }, right: { val: 5 } }, right: { val: 3, left: { val: 6 } } }], [{ val: 1, left: { val: 2, right: { val: 4 } }, right: { val: 3 } }], [{ val: 1 }], [null], [{ val: 1, left: { val: 2 }, right: { val: 3 } }], [{ val: 1, left: { val: 2, left: { val: 4 } }, right: { val: 3 } }], [{ val: 1, right: { val: 2 } }], [{ val: 1, left: { val: 2, left: { val: 3 } } }], [{ val: 1, left: { val: 2 }, right: { val: 3, right: { val: 4 } } }], [{ val: 1, left: { val: 2, left: { val: 4 }, right: { val: 5 } }, right: { val: 3, left: { val: 6 }, right: { val: 7 } } }]], "checks complete tree"),
    constraints: ["A complete tree fills levels from left to right.", "After a missing child appears in BFS order, no later node may exist.", "Return true or false."],
    difficulty: 3,
    examples: [
      { input: "root = { val: 1, left: { val: 2 }, right: { val: 3 } }", output: "true", explanation: "The final level is filled from the left." },
      { input: "root = { val: 1, left: { val: 2, right: { val: 4 } }, right: { val: 3 } }", output: "false", explanation: "A right child appears after a missing left position." }
    ],
    functionName: "isCompleteBinaryTree",
    id: "external-complete-binary-tree",
    prompt: "Return true if the binary tree is complete.",
    rating: 1703,
    source: { dislikes: 62, likes: 4557, slug: "check-completeness-of-a-binary-tree" },
    solver: (args) => isCompleteBinaryTree(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Check Complete Binary Tree",
    topics: ["Trees", "BFS"]
  },
  {
    cases: makeCases([[3, [[0, 1], [1, 2]], []], [3, [[0, 1]], [[2, 1]]], [3, [[1, 0]], [[2, 1]]], [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [[1, 2], [2, 3], [3, 1]]], [1, [], []], [4, [[0, 1], [0, 2]], [[1, 3], [2, 3]]], [4, [], [[0, 1], [1, 2], [2, 3]]], [4, [[0, 1], [2, 3]], [[1, 2]]], [5, [[0, 1], [2, 3]], [[1, 2], [3, 4]]], [3, [[0, 1], [0, 2]], [[1, 0]]]], "finds alternating color paths"),
    constraints: ["Red and blue edges are directed.", "Adjacent edges in the path must alternate colors.", "Return shortest distances from node 0, using -1 for unreachable nodes."],
    difficulty: 3,
    examples: [
      { input: "n = 3, redEdges = [[0,1],[1,2]], blueEdges = []", output: "[0,1,-1]", explanation: "Two red edges in a row cannot be used." },
      { input: "n = 3, redEdges = [[0,1]], blueEdges = [[2,1]]", output: "[0,1,-1]", explanation: "Node 1 is reachable by the red edge 0 -> 1, but no alternating path starts at 0 and reaches node 2." }
    ],
    functionName: "shortestAlternatingPaths",
    id: "external-shortest-alternating-colors",
    prompt: "Return shortest path lengths from node 0 when each step must alternate red and blue edges.",
    rating: 1780,
    source: { dislikes: 206, likes: 3712, slug: "shortest-path-with-alternating-colors" },
    solver: (args) => shortestAlternatingPaths(args[0] as number, args[1] as Array<[number, number]>, args[2] as Array<[number, number]>),
    starterArgs: "n, redEdges, blueEdges",
    title: "Shortest Alternating Color Paths",
    topics: ["Graphs", "BFS"]
  },
  {
    cases: makeCases([[8, [[0, 3], [0, 4], [1, 3], [2, 4], [2, 7], [3, 5], [3, 6], [3, 7], [4, 6]]], [5, [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]], [3, [[0, 1], [1, 2]]], [4, []], [4, [[0, 2], [1, 2], [2, 3]]], [6, [[0, 1], [1, 2], [3, 4], [4, 5]]], [5, [[0, 2], [0, 3], [1, 3], [3, 4]]], [7, [[0, 4], [1, 4], [2, 5], [4, 6], [5, 6]]], [2, [[0, 1]]], [6, [[0, 2], [1, 2], [2, 3], [2, 4], [4, 5]]]], "lists dag ancestors"),
    constraints: ["The graph is a directed acyclic graph.", "Return ancestors for every node in ascending order.", "A node is not its own ancestor."],
    difficulty: 3,
    examples: [
      { input: "n = 3, edges = [[0,1],[1,2]]", output: "[[],[0],[0,1]]", explanation: "Node 2 can be reached from both 0 and 1." },
      { input: "n = 4, edges = []", output: "[[],[],[],[]]", explanation: "With no directed edges, no node can reach any other node, so every ancestor list is empty." }
    ],
    functionName: "allAncestorsDag",
    id: "external-all-ancestors-dag",
    prompt: "Return the sorted ancestor list for every node in a directed acyclic graph.",
    rating: 1788,
    source: { dislikes: 44, likes: 1758, slug: "all-ancestors-of-a-node-in-a-directed-acyclic-graph" },
    solver: (args) => allAncestorsDag(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, edges",
    title: "All Ancestors In A DAG",
    topics: ["Graphs", "Topological Sort"]
  },
  {
    cases: makeCases([[3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.2], 0, 2], [3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.3], 0, 2], [3, [[0, 1]], [0.5], 0, 2], [1, [], [], 0, 0], [4, [[0, 1], [1, 2], [2, 3], [0, 3]], [0.9, 0.9, 0.9, 0.5], 0, 3], [5, [[0, 1], [1, 4], [0, 2], [2, 4], [0, 3], [3, 4]], [0.5, 0.5, 0.4, 0.9, 0.7, 0.7], 0, 4], [2, [[0, 1]], [0.01], 1, 0], [4, [[0, 1], [1, 2]], [0.5, 0.5], 0, 3], [4, [[0, 1], [1, 3], [0, 2], [2, 3]], [0.6, 0.6, 0.9, 0.3], 0, 3], [3, [[0, 1], [1, 2]], [1, 1], 0, 2]], "finds maximum probability path"),
    constraints: ["Edges are undirected.", "Path probability is the product of edge probabilities.", "Return 0 when the end node is unreachable."],
    difficulty: 3,
    examples: [
      { input: "n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start = 0, end = 2", output: "0.25", explanation: "The path 0 -> 1 -> 2 has probability 0.25, which beats the direct 0.2 edge." },
      { input: "n = 3, edges = [[0,1]], succProb = [0.5], start = 0, end = 2", output: "0", explanation: "The only edge connects 0 and 1, leaving node 2 disconnected from the start, so no path probability exists." }
    ],
    functionName: "maxProbabilityPath",
    id: "external-path-maximum-probability",
    prompt: "Return the maximum success probability of any path from start to end.",
    rating: 1846,
    source: { dislikes: 110, likes: 3895, slug: "path-with-maximum-probability" },
    solver: (args) => maxProbabilityPath(args[0] as number, args[1] as Array<[number, number]>, args[2] as number[], args[3] as number, args[4] as number),
    starterArgs: "n, edges, succProb, start, end",
    title: "Path With Maximum Probability",
    topics: ["Graphs", "Dijkstra"]
  },
  {
    cases: makeCases([[[[2, 5, 3], [1, 8, 4], [1, 7, 5]], [2, 7, 5]], [[[3, 4, 5], [4, 5, 6]], [3, 2, 5]], [[[2, 5, 3], [2, 3, 4], [1, 2, 5], [5, 2, 3]], [2, 5, 5]], [[[1, 1, 1]], [1, 1, 1]], [[[1, 1, 1]], [1, 1, 2]], [[[2, 7, 5], [2, 5, 5]], [2, 7, 5]], [[[3, 3, 3], [1, 3, 2], [3, 2, 1]], [3, 3, 3]], [[[1, 2, 3], [2, 3, 4], [3, 4, 5]], [3, 3, 5]], [[[5, 5, 5], [4, 5, 5], [5, 4, 5], [5, 5, 4]], [5, 5, 5]], [[[1, 5, 3], [3, 1, 5], [5, 3, 1]], [3, 5, 5]]], "checks target triplet merge"),
    constraints: ["You may merge triplets by taking coordinate-wise maximum values.", "Triplets with any coordinate above the target cannot be used.", "Return true only if all three target coordinates can be matched."],
    difficulty: 3,
    examples: [
      { input: "triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]", output: "true", explanation: "Use only triplets that do not exceed the target; together they cover 2, 7, and 5." },
      { input: "triplets = [[3,4,5],[4,5,6]], target = [3,2,5]", output: "false", explanation: "Every available triplet exceeds the target in at least one coordinate." }
    ],
    functionName: "canMergeTriplets",
    id: "external-merge-triplets-target",
    prompt: "Return true if safe triplets can be merged into the exact target triplet.",
    rating: 1636,
    source: { dislikes: 82, likes: 944, slug: "merge-triplets-to-form-target-triplet" },
    solver: (args) => canMergeTriplets(args[0] as Array<[number, number, number]>, args[1] as [number, number, number]),
    starterArgs: "triplets, target",
    title: "Merge Triplets To Form Target",
    topics: ["Arrays", "Greedy"]
  },
  {
    cases: makeCases([[[[1, -1], [-1, 1]]], [[[1, 2, 3], [-1, -2, -3], [1, 2, 3]]], [[[0, -1], [-2, 3]]], [[[-1]]], [[[1, 2], [3, 4]]], [[[-1, -2], [-3, -4]]], [[[5, -4, 3], [-2, 0, 1]]], [[[7, -8], [9, -10]]], [[[2, -3, -4], [-5, 6, 7]]], [[[0]]]], "maximizes matrix sum"),
    constraints: ["One operation flips signs of any adjacent pair.", "Return the largest possible matrix sum.", "You may perform any number of operations."],
    difficulty: 3,
    examples: [
      { input: "matrix = [[1,-1],[-1,1]]", output: "4", explanation: "Flip signs so every value becomes positive." },
      { input: "matrix = [[1,2,3],[-1,-2,-3],[1,2,3]]", output: "16", explanation: "An odd number of negatives forces the smallest absolute value to stay negative." }
    ],
    functionName: "maximumMatrixAbsoluteSum",
    id: "external-maximum-matrix-sum",
    prompt: "Return the maximum sum obtainable by flipping signs of adjacent matrix cells.",
    rating: 1648,
    source: { dislikes: 75, likes: 1623, slug: "maximum-matrix-sum" },
    solver: (args) => maximumMatrixAbsoluteSum(args[0] as number[][]),
    starterArgs: "matrix",
    title: "Maximum Matrix Sum",
    topics: ["Arrays", "Greedy", "Matrix"]
  },
  {
    cases: makeCases([[[[0, 0, 1, 1], [1, 0, 1, 0], [1, 1, 0, 0]]], [[[0]]], [[[1]]], [[[0, 1], [1, 1]]], [[[0, 0], [0, 0]]], [[[1, 0], [0, 1]]], [[[0, 1, 1], [1, 1, 1]]], [[[1, 1, 0], [1, 0, 1], [0, 0, 1]]], [[[0, 1, 0, 1]]], [[[1, 0, 0, 1], [0, 1, 1, 0]]]], "scores flipped matrix"),
    constraints: ["You may flip any row or column.", "Interpret each row as a binary number.", "Return the largest total score possible."],
    difficulty: 3,
    examples: [
      { input: "grid = [[0,0,1,1],[1,0,1,0],[1,1,0,0]]", output: "39", explanation: "Make the leading bit in every row equal 1, then flip columns where more zeros remain." },
      { input: "grid = [[0]]", output: "1", explanation: "Flip the only row so the single binary value becomes 1." }
    ],
    functionName: "scoreMatrixAfterFlips",
    id: "external-score-after-flipping-matrix",
    prompt: "Return the maximum binary-row score after any row and column flips.",
    rating: 1818,
    source: { dislikes: 226, likes: 2493, slug: "score-after-flipping-matrix" },
    solver: (args) => scoreMatrixAfterFlips(args[0] as number[][]),
    starterArgs: "grid",
    title: "Score After Flipping Matrix",
    topics: ["Arrays", "Greedy", "Matrix"]
  },
  {
    cases: makeCases([[[4, 5, 0, -2, -3, 1], 5], [[5], 9], [[1, 2, 3], 3], [[0, 0], 1], [[7, 4, -10], 5], [[2, -2, 2, -4], 6], [[3, 3, 3], 3], [[8, 9, 7, 8, 9], 8], [[-1, 2, 9], 2], [[1, 1, 1, 1], 2]], "counts divisible subarrays"),
    constraints: ["Subarrays are contiguous.", "A subarray qualifies when its sum is divisible by k.", "Return the number of qualifying subarrays."],
    difficulty: 3,
    examples: [
      { input: "nums = [4,5,0,-2,-3,1], k = 5", output: "7", explanation: "Matching prefix remainders identify seven subarrays with sums divisible by 5." },
      { input: "nums = [5], k = 9", output: "0", explanation: "The only subarray sum is not divisible by 9." }
    ],
    functionName: "subarraysDivisibleByK",
    id: "external-subarray-sums-divisible-by-k",
    prompt: "Count contiguous subarrays whose sum is divisible by k.",
    rating: 1676,
    source: { dislikes: 346, likes: 7926, slug: "subarray-sums-divisible-by-k" },
    solver: (args) => subarraysDivisibleByK(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Subarray Sums Divisible By K",
    topics: ["Hash Map", "Prefix Sum", "Arrays"]
  },
  {
    cases: makeCases([[[1, 1, 2, 1, 1], 3], [[2, 4, 6], 1], [[2, 2, 2, 1, 2, 2, 1, 2, 2, 2], 2], [[1], 1], [[1, 2, 1], 1], [[1, 3, 5], 2], [[2, 2, 1, 2, 1], 1], [[1, 2, 2, 2, 1], 2], [[2, 1, 2, 1, 2, 1], 2], [[1, 1, 1, 1], 4]], "counts nice subarrays"),
    constraints: ["A nice subarray contains exactly k odd numbers.", "Even numbers may appear anywhere inside the subarray.", "Return the number of nice subarrays."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,1,2,1,1], k = 3", output: "2", explanation: "There are two windows containing exactly three odd values." },
      { input: "nums = [2,4,6], k = 1", output: "0", explanation: "All values are even, so every subarray has 0 odd numbers and none can contain exactly k = 1 odd value." }
    ],
    functionName: "countNiceSubarrays",
    id: "external-count-number-of-nice-subarrays",
    prompt: "Count contiguous subarrays that contain exactly k odd numbers.",
    rating: 1624,
    source: { dislikes: 150, likes: 5457, slug: "count-number-of-nice-subarrays" },
    solver: (args) => countNiceSubarrays(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Count Number Of Nice Subarrays",
    topics: ["Hash Map", "Sliding Window", "Prefix Sum"]
  },
  {
    cases: makeCases([[7, [[0, 1], [0, 2], [1, 4], [1, 5], [2, 3], [2, 6]], [false, false, true, false, true, true, false]], [7, [[0, 1], [0, 2], [1, 4], [1, 5], [2, 3], [2, 6]], [false, false, true, false, false, true, false]], [4, [[0, 1], [1, 2], [0, 3]], [true, true, true, true]], [1, [], [false]], [1, [], [true]], [3, [[0, 1], [1, 2]], [false, false, true]], [5, [[0, 1], [0, 2], [2, 3], [2, 4]], [false, true, false, true, false]], [6, [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]], [false, false, false, false, true, true]], [4, [[0, 1], [0, 2], [0, 3]], [false, false, false, false]], [4, [[0, 1], [0, 2], [2, 3]], [false, false, false, true]]], "collects tree apples"),
    constraints: ["The tree is rooted at node 0.", "Each traversed edge costs one second in each direction.", "Return the minimum time to collect every apple and return to root."],
    difficulty: 3,
    examples: [
      { input: "n = 7, edges = [[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]], hasApple = [false,false,true,false,true,true,false]", output: "8", explanation: "Only branches leading to apples need to be walked out and back." },
      { input: "n = 1, edges = [], hasApple = [false]", output: "0", explanation: "The tree only has the root and it has no apple, so no travel away from node 0 is needed." }
    ],
    functionName: "collectApplesTime",
    id: "external-minimum-time-collect-apples",
    prompt: "Return the minimum travel time needed to collect all apples in a rooted tree.",
    rating: 1683,
    source: { dislikes: 333, likes: 3864, slug: "minimum-time-to-collect-all-apples-in-a-tree" },
    solver: (args) => collectApplesTime(args[0] as number, args[1] as Array<[number, number]>, args[2] as boolean[]),
    starterArgs: "n, edges, hasApple",
    title: "Minimum Time To Collect Apples",
    topics: ["Trees", "DFS"]
  },
  {
    cases: makeCases([[{ val: 3, left: { val: 0 }, right: { val: 0 } }], [{ val: 0, left: { val: 3 }, right: { val: 0 } }], [{ val: 1 }], [{ val: 2, left: { val: 0 } }], [{ val: 0, left: { val: 0 }, right: { val: 3 } }], [{ val: 1, left: { val: 0 }, right: { val: 2 } }], [{ val: 4, left: { val: 0, left: { val: 0 } }, right: { val: 0 } }], [{ val: 0, left: { val: 2 }, right: { val: 0, right: { val: 1 } } }], [{ val: 5, left: { val: 0 }, right: { val: 0, left: { val: 0 }, right: { val: 0 } } }], [{ val: 0, left: { val: 1 }, right: { val: 0, left: { val: 3 } } }]], "balances tree coins"),
    constraints: ["Each move transfers one coin across one edge.", "Every node must end with exactly one coin.", "The total number of coins equals the number of nodes."],
    difficulty: 3,
    examples: [
      { input: "root = { val: 3, left: { val: 0 }, right: { val: 0 } }", output: "2", explanation: "Move one coin from the root to each child." },
      { input: "root = { val: 0, left: { val: 3 }, right: { val: 0 } }", output: "3", explanation: "Two coins move out from the left child, then one continues to the right child." }
    ],
    functionName: "distributeCoinsMoves",
    id: "external-distribute-coins-binary-tree",
    prompt: "Return the fewest edge moves needed so every binary tree node has one coin.",
    rating: 1709,
    source: { dislikes: 249, likes: 6092, slug: "distribute-coins-in-binary-tree" },
    solver: (args) => distributeCoinsMoves(args[0] as TreeNode | null),
    starterArgs: "root",
    title: "Distribute Coins In Binary Tree",
    topics: ["Trees", "DFS"]
  },
  {
    cases: makeCases([[[[1, 1, 1, 1, 1, 1, 1, 0], [1, 0, 0, 0, 0, 1, 1, 0], [1, 0, 1, 0, 1, 1, 1, 0], [1, 0, 0, 0, 0, 1, 0, 1], [1, 1, 1, 1, 1, 1, 1, 0]]], [[[0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [0, 1, 1, 1, 0]]], [[[1, 1], [1, 1]]], [[[0]]], [[[1]]], [[[1, 0, 1], [1, 0, 1], [1, 1, 1]]], [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], [[[1, 0, 1], [0, 0, 0], [1, 0, 1]]], [[[1, 1, 1, 1], [1, 0, 0, 1], [1, 1, 1, 1]]], [[[0, 1, 0], [1, 1, 1], [0, 1, 0]]]], "counts closed islands"),
    constraints: ["0 is land and 1 is water.", "A closed island is a land component not touching the border.", "Use four-directional adjacency."],
    difficulty: 3,
    examples: [
      { input: "grid = [[1,1,1],[1,0,1],[1,1,1]]", output: "1", explanation: "The center land cell is fully surrounded by water." },
      { input: "grid = [[0]]", output: "0", explanation: "Land touching the border is not closed." }
    ],
    functionName: "closedIslandCount",
    id: "external-number-of-closed-islands",
    prompt: "Count land components that are completely surrounded by water.",
    rating: 1659,
    source: { dislikes: 192, likes: 4775, slug: "number-of-closed-islands" },
    solver: (args) => closedIslandCount(args[0] as number[][]),
    starterArgs: "grid",
    title: "Number Of Closed Islands",
    topics: ["Graphs", "DFS", "Grid"]
  },
  {
    cases: makeCases([[[[0, 1], [1, 0]]], [[[0, 1, 0], [0, 0, 0], [0, 0, 1]]], [[[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]], [[[1, 0, 0], [0, 0, 0], [0, 0, 1]]], [[[1, 0, 1]]], [[[1, 0], [0, 1]]], [[[1, 1, 0], [0, 0, 0], [0, 1, 1]]], [[[0, 0, 1], [0, 0, 0], [1, 0, 0]]], [[[1, 0, 0, 0, 1]]], [[[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]]]], "finds shortest island bridge"),
    constraints: ["The grid contains exactly two islands.", "You may flip water cells to land.", "Return the minimum number of flips needed to connect the islands."],
    difficulty: 3,
    examples: [
      { input: "grid = [[0,1],[1,0]]", output: "1", explanation: "Flip one water cell to join the diagonal islands." },
      { input: "grid = [[1,0,1]]", output: "1", explanation: "The single water cell between islands connects them." }
    ],
    functionName: "shortestBridgeLength",
    id: "external-shortest-bridge",
    prompt: "Return the shortest water bridge needed to connect two islands.",
    rating: 1826,
    source: { dislikes: 221, likes: 5801, slug: "shortest-bridge" },
    solver: (args) => shortestBridgeLength(args[0] as number[][]),
    starterArgs: "grid",
    title: "Shortest Bridge",
    topics: ["Graphs", "BFS", "Grid"]
  },
  {
    cases: makeCases([[[1, 4, 6, 7, 8, 20], [2, 7, 15]], [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31], [2, 7, 15]], [[1], [2, 7, 15]], [[1, 15, 30], [3, 10, 20]], [[1, 2, 4, 5, 29, 30], [2, 7, 25]], [[5, 6, 7], [2, 7, 15]], [[1, 8, 15, 22, 29], [2, 7, 15]], [[1, 3, 5, 7, 9], [3, 8, 20]], [[2, 14, 15, 16, 40], [4, 9, 30]], [[1, 2, 3, 28, 29, 30, 31], [2, 8, 20]]], "buys cheapest travel passes"),
    constraints: ["Passes last 1, 7, or 30 days.", "Travel days are strictly increasing.", "Return the minimum total ticket cost."],
    difficulty: 3,
    examples: [
      { input: "days = [1,4,6,7,8,20], costs = [2,7,15]", output: "11", explanation: "A 7-day pass for days 4 through 8 plus two 1-day passes costs 11." },
      { input: "days = [1], costs = [2,7,15]", output: "2", explanation: "Only day 1 needs coverage, so buying a single 1-day pass for 2 beats the 7-day and 30-day passes." }
    ],
    functionName: "minCostTickets",
    id: "external-minimum-cost-for-tickets",
    prompt: "Return the cheapest way to cover all planned travel days with 1-day, 7-day, and 30-day passes.",
    rating: 1786,
    source: { dislikes: 191, likes: 8821, slug: "minimum-cost-for-tickets" },
    solver: (args) => minCostTickets(args[0] as number[], args[1] as [number, number, number]),
    starterArgs: "days, costs",
    title: "Minimum Cost For Tickets",
    topics: ["Dynamic Programming", "Arrays"]
  },
  {
    cases: makeCases([[[1, 2, 4], 5], [[1, 4, 8, 13], 5], [[3, 9, 6], 2], [[1, 1, 1], 0], [[1, 2, 2, 4], 2], [[5], 10], [[1, 4, 4, 8], 4], [[10, 20, 30], 15], [[2, 3, 5, 7, 11], 10], [[1, 100, 101], 1]], "maximizes value frequency"),
    constraints: ["Each operation increments one array element by 1.", "Use at most k operations.", "Return the highest achievable frequency of any value."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,2,4], k = 5", output: "3", explanation: "Raise 1 and 2 to 4 using five increments, so three values match." },
      { input: "nums = [1,4,8,13], k = 5", output: "2", explanation: "No value can be matched by more than two numbers within five increments." }
    ],
    functionName: "maxFrequencyAfterIncrements",
    id: "external-frequency-most-frequent-element",
    prompt: "Return the largest frequency achievable after at most k increments.",
    rating: 1876,
    source: { dislikes: 314, likes: 5783, slug: "frequency-of-the-most-frequent-element" },
    solver: (args) => maxFrequencyAfterIncrements(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Frequency Of The Most Frequent Element",
    topics: ["Sliding Window", "Arrays", "Sorting"]
  },
  {
    cases: makeCases([[[1, 2, 3, 4, 3, 2, 5], 3], [[2, 2, 2, 2], 2], [[3, 4, 5, 6], 2], [[1], 1], [[1, 3, 4], 2], [[5, 6, 7, 8, 9], 5], [[9, 10, 11, 5, 6], 3], [[4, 5, 7, 8], 2], [[1, 2], 3], [[10, 11, 12, 14, 15, 16], 3]], "computes k-window powers"),
    constraints: ["A window has power when every adjacent value increases by exactly 1.", "Return the last value for powered windows and -1 otherwise.", "Return one answer per length-k window."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,2,3,4,3,2,5], k = 3", output: "[3,4,-1,-1,-1]", explanation: "Only the first two length-3 windows are consecutive increasing runs." },
      { input: "nums = [2,2,2,2], k = 2", output: "[-1,-1,-1]", explanation: "Equal adjacent values do not increase by one." }
    ],
    functionName: "kSizeSubarrayPowers",
    id: "external-power-k-size-subarrays-ii",
    prompt: "Return each length-k window's power when it forms a consecutive increasing run.",
    rating: 1595,
    source: { dislikes: 12, likes: 165, slug: "find-the-power-of-k-size-subarrays-ii" },
    solver: (args) => kSizeSubarrayPowers(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Power Of K-Size Subarrays II",
    topics: ["Sliding Window", "Arrays"]
  },
  {
    cases: makeCases([[["mobile", "mouse", "moneypot", "monitor", "mousepad"], "mouse"], [["bags", "baggage", "banner", "box", "cloths"], "bags"], [["havana"], "havana"], [["apple", "app", "apricot", "banana"], "app"], [["car", "card", "cart", "dog"], "ca"], [["zebra", "zen", "zero"], "ze"], [["code", "coder", "coding", "cope"], "cod"], [["a", "ab", "abc"], "abcd"], [["aa", "aaa", "aaaa", "b"], "aaa"], [["lamp", "landing", "lane", "late"], "la"]], "builds search suggestions"),
    constraints: ["Products are strings.", "After each typed character, return up to three lexicographically smallest products with that prefix.", "Return an array of suggestion arrays."],
    difficulty: 3,
    examples: [
      { input: 'products = ["mobile","mouse","moneypot","monitor","mousepad"], searchWord = "mouse"', output: '[["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]', explanation: "Suggestions are recomputed for each growing prefix and capped at three items." },
      { input: 'products = ["havana"], searchWord = "havana"', output: '[["havana"],["havana"],["havana"],["havana"],["havana"],["havana"]]', explanation: "The only product matches every prefix." }
    ],
    functionName: "searchSuggestions",
    id: "external-search-suggestions-system",
    prompt: "Return lexicographically ordered product suggestions after each character of the search word is typed.",
    rating: 1765,
    source: { dislikes: 267, likes: 5141, slug: "search-suggestions-system" },
    solver: (args) => searchSuggestions(args[0] as string[], args[1] as string),
    starterArgs: "products, searchWord",
    title: "Search Suggestions System",
    topics: ["Binary Search", "Strings", "Sorting"]
  },
  {
    cases: makeCases([[[4, 2, 7, 6, 9, 14, 12], 5, 1], [[4, 12, 2, 7, 3, 18, 20, 3, 19], 10, 2], [[14, 3, 19, 3], 17, 0], [[1, 2, 3], 0, 0], [[1, 5, 1, 2, 3, 4, 10000], 4, 1], [[5, 4, 3], 0, 0], [[1, 10, 20, 30], 9, 1], [[1, 3, 6, 10], 5, 1], [[10, 20], 0, 1], [[2, 7, 9, 12], 3, 2]], "finds furthest building"),
    constraints: ["Move from left to right across building heights.", "Climbs can be paid with bricks or ladders.", "Return the furthest reachable building index."],
    difficulty: 3,
    examples: [
      { input: "heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1", output: "4", explanation: "Use bricks on smaller climbs and the ladder on the largest climb before resources run out." },
      { input: "heights = [14,3,19,3], bricks = 17, ladders = 0", output: "3", explanation: "The only climb costs 16 bricks, leaving enough to finish." }
    ],
    functionName: "furthestReachableBuilding",
    id: "external-furthest-building",
    prompt: "Return the furthest building reachable when bricks and ladders cover upward climbs.",
    rating: 1962,
    source: { dislikes: 150, likes: 6239, slug: "furthest-building-you-can-reach" },
    solver: (args) => furthestReachableBuilding(args[0] as number[], args[1] as number, args[2] as number),
    starterArgs: "heights, bricks, ladders",
    title: "Furthest Building You Can Reach",
    topics: ["Heap", "Greedy", "Arrays"]
  },
  {
    cases: makeCases([[[[1, 4], [2, 3], [4, 6]], 1], [[[3, 10], [1, 5], [2, 6]], 0], [[[1, 2]], 0], [[[1, 10], [2, 5], [6, 7]], 2], [[[5, 10], [1, 4], [2, 3]], 0], [[[1, 4], [2, 5], [3, 6]], 2], [[[10, 20], [1, 2], [2, 3], [3, 4]], 0], [[[1, 100], [2, 3], [3, 4], [4, 5]], 3], [[[2, 6], [1, 5], [3, 4]], 1], [[[4, 8], [1, 3], [2, 5], [6, 7]], 0]], "assigns smallest chair"),
    constraints: ["Each friend has an arrival and leaving time.", "A leaving chair becomes available immediately at that time.", "Return the chair number used by the target friend."],
    difficulty: 3,
    examples: [
      { input: "times = [[1,4],[2,3],[4,6]], targetFriend = 1", output: "1", explanation: "Friend 0 takes chair 0, then friend 1 takes the next smallest chair." },
      { input: "times = [[3,10],[1,5],[2,6]], targetFriend = 0", output: "2", explanation: "Two earlier friends occupy chairs 0 and 1 before the target arrives." }
    ],
    functionName: "smallestChairForFriend",
    id: "external-smallest-unoccupied-chair",
    prompt: "Return the smallest-numbered chair assigned to the target friend.",
    rating: 1695,
    source: { dislikes: 78, likes: 1459, slug: "the-number-of-the-smallest-unoccupied-chair" },
    solver: (args) => smallestChairForFriend(args[0] as Array<[number, number]>, args[1] as number),
    starterArgs: "times, targetFriend",
    title: "Smallest Unoccupied Chair",
    topics: ["Heap", "Simulation", "Arrays"]
  },
  {
    cases: makeCases([[[3, 4, 1, 2, 6], [[0, 3], [1, 3], [2, 4]]], [[4, 3, 1, 6], [[0, 1], [1, 2], [2, 3], [0, 3]]], [[1], [[0, 0]]], [[2, 4, 6], [[0, 2], [1, 2]]], [[1, 2, 3, 4], [[0, 3], [1, 2]]], [[1, 3, 5, 7], [[0, 0], [0, 1], [2, 3]]], [[8, 5, 4, 7, 2], [[0, 4], [1, 3], [3, 4]]], [[9, 10, 12, 13], [[0, 1], [0, 2], [2, 3]]], [[6, 7, 8, 10, 11], [[0, 2], [2, 4], [3, 4]]], [[5, 6, 7, 8, 9, 10], [[0, 5], [2, 5], [4, 5]]]], "checks alternating parity ranges"),
    constraints: ["A range is special when every adjacent pair inside it has different parity.", "Each query is [left, right].", "Return one boolean per query."],
    difficulty: 3,
    examples: [
      { input: "nums = [3,4,1,2,6], queries = [[0,3],[1,3],[2,4]]", output: "[true,true,false]", explanation: "Ranges 0-3 and 1-3 alternate odd/even at every step; range 2-4 fails because 2 and 6 are both even." },
      { input: "nums = [2,4,6], queries = [[0,2],[1,2]]", output: "[false,false]", explanation: "Every adjacent pair in the queried ranges has matching even parity, so neither range is special." }
    ],
    functionName: "isSpecialParityArray",
    id: "external-special-array-ii",
    prompt: "For each query, return whether the selected subarray alternates parity between every neighboring pair.",
    rating: 1523,
    source: { dislikes: 67, likes: 916, slug: "special-array-ii" },
    solver: (args) => isSpecialParityArray(args[0] as number[], args[1] as Array<[number, number]>),
    starterArgs: "nums, queries",
    title: "Special Parity Ranges",
    topics: ["Arrays", "Prefix Sum"]
  },
  {
    cases: makeCases([[[[0, 2], [3, 6], [8, 10]], [4, 9]], [[[0, 5]], [2, 3]], [[[0, 2], [3, 4]], [5, 7]], [[[1, 5]], [1, 5]], [[[1, 10]], [3, 7]], [[[2, 4], [6, 8]], [3, 7]], [[[-5, -1], [0, 3]], [-3, 1]], [[[1, 2], [2, 3], [3, 4]], [2, 3]], [[[0, 100]], [20, 80]], [[[5, 7], [8, 12]], [6, 10]]], "removes interval overlap"),
    constraints: ["Intervals are non-overlapping and sorted by start.", "Return the remaining interval pieces after removing the target interval.", "Keep all interval endpoints as numbers."],
    difficulty: 3,
    examples: [
      { input: "intervals = [[0,2],[3,6],[8,10]], remove = [4,9]", output: "[[0,2],[3,4],[9,10]]", explanation: "The removal cuts the middle interval after 4 and the last interval before 9; [0,2] stays untouched." },
      { input: "intervals = [[0,5]], remove = [2,3]", output: "[[0,2],[3,5]]", explanation: "Removing the center segment splits the original interval into the two outside pieces." }
    ],
    functionName: "removeIntervalPieces",
    id: "external-remove-interval",
    prompt: "Remove one interval from a sorted list of disjoint intervals and return the pieces that remain.",
    rating: 1525,
    source: { dislikes: 36, likes: 481, slug: "remove-interval" },
    solver: (args) => removeIntervalPieces(args[0] as Array<[number, number]>, args[1] as [number, number]),
    starterArgs: "intervals, remove",
    title: "Remove Interval Pieces",
    topics: ["Arrays", "Intervals"]
  },
  {
    cases: makeCases([[[5, 5, 5]], [[1, 12, 1, 2, 5, 50, 3]], [[1, 1, 2]], [[3, 6, 2, 3]], [[2, 3, 4, 5, 10]], [[4, 4, 4, 4]], [[1, 2, 3, 4, 9]], [[6, 7, 8, 20, 21]], [[10, 21, 22, 100, 101, 102]], [[2, 2, 3, 4]]], "finds largest polygon perimeter"),
    constraints: ["Use at least three side lengths.", "A polygon is valid when its longest side is shorter than the sum of the other chosen sides.", "Return -1 if no valid polygon can be formed."],
    difficulty: 3,
    examples: [
      { input: "nums = [5,5,5]", output: "15", explanation: "All three sides can form an equilateral triangle, so the best perimeter is 5 + 5 + 5 = 15." },
      { input: "nums = [1,12,1,2,5,50,3]", output: "12", explanation: "The side 50 is too long and 12 is not shorter than 1+1+2+3+5, but sides [1,1,2,3,5] form perimeter 12." }
    ],
    functionName: "largestPolygonPerimeter",
    id: "external-largest-polygon-perimeter",
    prompt: "Return the largest perimeter obtainable from a subset of side lengths that can form a polygon.",
    rating: 1521,
    source: { dislikes: 71, likes: 840, slug: "find-polygon-with-the-largest-perimeter" },
    solver: (args) => largestPolygonPerimeter(args[0] as number[]),
    starterArgs: "nums",
    title: "Largest Polygon Perimeter",
    topics: ["Arrays", "Greedy", "Sorting"]
  },
  {
    cases: makeCases([["NESW"], ["NES"], ["NNSWWEWSSESSWENNW"], [""], ["N"], ["NS"], ["EESSWW"], ["NNESW"], ["NWSE"], ["NENESSWW"]], "detects crossed walking path"),
    constraints: ["The path contains only N, S, E, and W.", "The starting point counts as visited.", "Return true as soon as any coordinate is visited twice."],
    difficulty: 3,
    examples: [
      { input: 'path = "NESW"', output: "true", explanation: "The moves return to the starting coordinate after the final W, so the path crosses itself." },
      { input: 'path = "NES"', output: "false", explanation: "The visited coordinates are all different: start, north, east, then south." }
    ],
    functionName: "doesPathCross",
    id: "external-path-crossing",
    prompt: "Return true when a grid walk ever visits a coordinate it has already visited.",
    rating: 1508,
    source: { dislikes: 50, likes: 1561, slug: "path-crossing" },
    solver: (args) => doesPathCross(args[0] as string),
    starterArgs: "path",
    title: "Path Crossing",
    topics: ["Hash Set", "Strings"]
  },
  {
    cases: makeCases([["annabelle", 2], ["leetcode", 3], ["true", 4], ["yzyzyzyzyzyzyzy", 2], ["abc", 4], ["aabbcc", 3], ["abcba", 2], ["aaaa", 1], ["aabbc", 2], ["xyzxyz", 6]], "checks k palindrome construction"),
    constraints: ["Use every character exactly once.", "Each constructed string must be a palindrome.", "Return false when k is larger than the string length."],
    difficulty: 3,
    examples: [
      { input: 's = "annabelle", k = 2', output: "true", explanation: "Only b has an odd count, and one odd center can be placed among two palindromes." },
      { input: 's = "leetcode", k = 3', output: "false", explanation: "Five letters have odd counts, but three palindromes can provide only three odd centers." }
    ],
    functionName: "canBuildKPalindromes",
    id: "external-construct-k-palindrome-strings",
    prompt: "Return whether all characters can be rearranged into exactly k palindrome strings.",
    rating: 1531,
    source: { dislikes: 160, likes: 1795, slug: "construct-k-palindrome-strings" },
    solver: (args) => canBuildKPalindromes(args[0] as string, args[1] as number),
    starterArgs: "s, k",
    title: "Construct K Palindromes",
    topics: ["Hash Map", "Strings", "Greedy"]
  },
  {
    cases: makeCases([[["lc", "cl", "gg"]], [["ab", "ty", "yt", "lc", "cl", "ab"]], [["cc", "ll", "xx"]], [["aa", "aa", "bb", "bb"]], [["ab", "ba", "cd", "dc", "ee"]], [["ab", "cd", "ef"]], [["aa"]], [["aa", "bb", "aa"]], [["az", "za", "az", "za", "zz"]], [["mm", "mn", "nm", "nn", "nn"]]], "builds two-letter palindrome"),
    constraints: ["Every word has length 2.", "Each word can be used at most once.", "Return the maximum palindrome length after concatenating selected words."],
    difficulty: 3,
    examples: [
      { input: 'words = ["lc","cl","gg"]', output: "6", explanation: '"lc" and "cl" mirror each other for 4 characters, and "gg" can sit in the center for 2 more.' },
      { input: 'words = ["ab","ty","yt","lc","cl","ab"]', output: "8", explanation: '"ty"+"yt" and "lc"+"cl" form two mirrored pairs, giving 8 characters total.' }
    ],
    functionName: "longestTwoLetterPalindrome",
    id: "external-two-letter-word-palindrome",
    prompt: "Return the longest palindrome length that can be built by concatenating two-letter words.",
    rating: 1557,
    source: { dislikes: 79, likes: 2966, slug: "longest-palindrome-by-concatenating-two-letter-words" },
    solver: (args) => longestTwoLetterPalindrome(args[0] as string[]),
    starterArgs: "words",
    title: "Two-Letter Word Palindrome",
    topics: ["Hash Map", "Strings", "Greedy"]
  },
  {
    cases: makeCases([[[1, 2, 3, 4, 5, 6, 7], [3, 5]], [[1, 2, 4, null, 3], [3]], [[1], [1]], [[1, 2, 3], []], [[1, 2, 3, 4, null, null, 5], [2]], [[5, 3, 6, 2, 4, null, 7], [3, 7]], [[1, 2, 3, null, 4], [1]], [[1, null, 2, null, 3], [2]], [[8, 4, 10, 2, 6, 9, 12], [4, 10]], [[1, 2, 3, 4, 5], [4, 5]]], "returns forest root values"),
    constraints: ["The tree is given as a level-order array with null for missing children.", "Delete every listed value.", "Return the remaining forest root values sorted ascending."],
    difficulty: 3,
    examples: [
      { input: "root = [1,2,3,4,5,6,7], toDelete = [3,5]", output: "[1,6,7]", explanation: "Deleting 3 separates children 6 and 7 into new trees, while deleting 5 removes that leaf." },
      { input: "root = [1], toDelete = [1]", output: "[]", explanation: "The only node is deleted, so no forest roots remain." }
    ],
    functionName: "forestRootValuesAfterDeleting",
    id: "external-delete-nodes-forest-roots",
    prompt: "Delete selected values from a binary tree and return the sorted values of the remaining forest roots.",
    rating: 1511,
    source: { dislikes: 145, likes: 4814, slug: "delete-nodes-and-return-forest" },
    solver: (args) => forestRootValuesAfterDeleting(args[0] as Array<number | null>, args[1] as number[]),
    starterArgs: "root, toDelete",
    title: "Forest Roots After Deletions",
    topics: ["Trees", "DFS", "Hash Set"]
  },
  {
    cases: makeCases([[6, 2, [2, 2, -1, 2, 2, 2], [0, 0, 1, 0, 0, 0]], [1, 0, [-1], [0]], [7, 6, [1, 2, 3, 4, 5, 6, -1], [0, 6, 5, 4, 3, 2, 1]], [4, 0, [-1, 0, 0, 1], [2, 1, 1, 0]], [5, 4, [4, 4, 4, 4, -1], [0, 0, 0, 0, 3]], [8, 0, [-1, 0, 0, 1, 1, 2, 2, 6], [1, 2, 3, 4, 0, 0, 5, 0]], [3, 1, [1, -1, 1], [0, 2, 0]], [9, 8, [8, 8, 7, 7, 6, 6, 8, 8, -1], [0, 0, 0, 2, 2, 1, 1, 3, 4]], [2, 1, [1, -1], [0, 5]], [6, 0, [-1, 0, 1, 2, 3, 4], [1, 1, 1, 1, 1, 0]]], "computes inform time"),
    constraints: ["Each employee has one manager except the head.", "A manager informs direct reports after informTime[manager] minutes.", "Return the time until every employee knows the news."],
    difficulty: 3,
    examples: [
      { input: "n = 6, headID = 2, manager = [2,2,-1,2,2,2], informTime = [0,0,1,0,0,0]", output: "1", explanation: "Employee 2 is the head and needs 1 minute to inform all direct reports." },
      { input: "n = 1, headID = 0, manager = [-1], informTime = [0]", output: "0", explanation: "The only employee already has the news, so no informing time is needed." }
    ],
    functionName: "minutesToInformEmployees",
    id: "external-inform-all-employees",
    prompt: "Return the number of minutes needed for the head employee to inform the whole company tree.",
    rating: 1561,
    source: { dislikes: 325, likes: 4260, slug: "time-needed-to-inform-all-employees" },
    solver: (args) => minutesToInformEmployees(args[0] as number, args[1] as number, args[2] as number[], args[3] as number[]),
    starterArgs: "n, headID, manager, informTime",
    title: "Time To Inform Employees",
    topics: ["Trees", "DFS", "BFS"]
  },
  {
    cases: makeCases([[[1, 2, 3, null, 4], 3], [[1, 2, 3, 4, 5, 6, 7], 3], [[1, 2, 3, 4, 5, 6, 7], 4], [[1], 2], [[1, 2, null, 3, null, 4], 4], [[1, 2, 3, null, null, 4, 5], 3], [[1, 2, 3, 4, null, null, 5], 5], [[1, null, 2, null, 3], 2], [[1, 2, 3, 4, null, 5, null, 6], 4], [[1, 2, 3, 4, 5, null, null, 6, 7], 5]], "counts close leaf pairs"),
    constraints: ["The tree is a level-order array.", "A good pair contains two different leaves.", "Count pairs whose shortest path length is at most distance."],
    difficulty: 4,
    examples: [
      { input: "root = [1,2,3,null,4], distance = 3", output: "1", explanation: "Leaves 4 and 3 are connected by the path 4 -> 2 -> 1 -> 3, which has length 3." },
      { input: "root = [1], distance = 2", output: "0", explanation: "A single leaf has no second leaf to pair with." }
    ],
    functionName: "countGoodLeafPairs",
    id: "external-good-leaf-node-pairs",
    prompt: "Count leaf pairs in a binary tree whose distance is within the given limit.",
    rating: 1746,
    source: { dislikes: 111, likes: 2502, slug: "number-of-good-leaf-nodes-pairs" },
    solver: (args) => countGoodLeafPairs(args[0] as Array<number | null>, args[1] as number),
    starterArgs: "root, distance",
    title: "Good Leaf Node Pairs",
    topics: ["Trees", "DFS"]
  },
  {
    cases: makeCases([[6, [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]], [5, [[0, 1], [2, 1], [3, 1], [1, 4]]], [3, []], [4, [[0, 1], [1, 2], [2, 3]]], [4, [[1, 0], [2, 0], [3, 0]]], [1, []], [7, [[0, 2], [1, 2], [3, 4], [5, 4]]], [6, [[0, 1], [2, 3], [4, 5]]], [5, [[0, 2], [2, 4], [1, 4]]], [8, [[0, 3], [1, 3], [2, 4], [5, 6], [6, 7]]]], "finds source vertices"),
    constraints: ["Nodes are numbered from 0 to n - 1.", "Edges are directed.", "Return every node with no incoming edge in ascending order."],
    difficulty: 3,
    examples: [
      { input: "n = 6, edges = [[0,1],[0,2],[2,5],[3,4],[4,2]]", output: "[0,3]", explanation: "Only nodes 0 and 3 have no incoming edges, so every other node can be reached from one of them." },
      { input: "n = 3, edges = []", output: "[0,1,2]", explanation: "With no edges, each node must be chosen as its own starting point." }
    ],
    functionName: "smallestSourceVertices",
    id: "external-minimum-source-vertices",
    prompt: "Return the smallest set of starting vertices from which all nodes in a directed acyclic graph can be reached.",
    rating: 1512,
    source: { dislikes: 136, likes: 3878, slug: "minimum-number-of-vertices-to-reach-all-nodes" },
    solver: (args) => smallestSourceVertices(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, edges",
    title: "Minimum Source Vertices",
    topics: ["Graphs", "Indegree"]
  },
  {
    cases: makeCases([[[["+", ".", "+"], [".", ".", "+"], ["+", "+", "+"]], [1, 0]], [[[ "+", "+", "."], [".", ".", "."], ["+", "+", "+"]], [1, 0]], [[[ ".", "+"]], [0, 0]], [[[ ".", ".", "."], ["+", "+", "."], [".", ".", "."]], [1, 2]], [[[ "+", "+", "+", "+"], ["+", ".", ".", "+"], ["+", ".", ".", "+"], ["+", "+", ".", "+"]], [1, 1]], [[[ ".", ".", "+"], ["+", ".", "+"], ["+", ".", "."]], [1, 1]], [[[ "+", ".", "+"], ["+", ".", "+"], ["+", ".", "."]], [0, 1]], [[[ "+", "+", "+"], ["+", ".", "+"], ["+", "+", "+"]], [1, 1]], [[[ ".", ".", "."], [".", "+", "."], [".", ".", "."]], [1, 0]], [[[ "+", ".", ".", "+"], ["+", ".", "+", "+"], ["+", ".", ".", "."]], [1, 1]]], "finds nearest maze exit"),
    constraints: ["The maze contains '.' for open cells and '+' for walls.", "The entrance cell is not counted as an exit even if it is on the border.", "Return -1 if no border exit is reachable."],
    difficulty: 3,
    examples: [
      { input: 'maze = [["+","." , "+"],[".",".","+"],["+","+","+"]], entrance = [1,0]', output: "2", explanation: "From the entrance, move right to [1,1] and then up to the border exit [0,1]." },
      { input: 'maze = [[".","+"]], entrance = [0,0]', output: "-1", explanation: "The entrance is the only open border cell and it cannot count as its own exit." }
    ],
    functionName: "nearestMazeExit",
    id: "external-nearest-maze-exit",
    prompt: "Return the fewest moves from the entrance to any reachable maze exit.",
    rating: 1638,
    source: { dislikes: 128, likes: 2645, slug: "nearest-exit-from-entrance-in-maze" },
    solver: (args) => nearestMazeExit(args[0] as string[][], args[1] as [number, number]),
    starterArgs: "maze, entrance",
    title: "Nearest Maze Exit",
    topics: ["Graphs", "BFS", "Grid"]
  },
  {
    cases: makeCases([[[[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]], [[[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]], [[[1, 1], [1, 1]]], [[[0, 0], [0, 0]]], [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], [[[0, 1, 0], [1, 1, 1], [0, 1, 0]]], [[[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]]], [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], [[[0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 1, 0, 1, 0], [0, 0, 0, 0, 0]]]], "counts enclave land"),
    constraints: ["Land is 1 and water is 0.", "Land connected to the border can walk off the grid.", "Count land cells that cannot reach any border through four-direction moves."],
    difficulty: 3,
    examples: [
      { input: "grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]", output: "3", explanation: "The three center land cells connect to each other but not to any border land." },
      { input: "grid = [[1,1],[1,1]]", output: "0", explanation: "All land cells touch the border directly or through border land, so none are enclaves." }
    ],
    functionName: "countEnclaveLand",
    id: "external-number-of-enclaves",
    prompt: "Count land cells that cannot reach the grid boundary by walking across land.",
    rating: 1616,
    source: { dislikes: 91, likes: 4644, slug: "number-of-enclaves" },
    solver: (args) => countEnclaveLand(args[0] as number[][]),
    starterArgs: "grid",
    title: "Number Of Enclaves",
    topics: ["Graphs", "DFS", "Grid"]
  },
  {
    cases: makeCases([[[[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]]], [[[1, 0, 1], [1, 1, 0], [1, 1, 0]]], [[[1]]], [[[0]]], [[[1, 1], [1, 1]]], [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], [[[1, 0], [0, 1]]], [[[1, 1, 0], [1, 1, 1], [0, 1, 1]]], [[[0, 0, 0], [0, 0, 0]]], [[[1, 1, 1, 1]]]], "counts all one squares"),
    constraints: ["The matrix contains only 0 and 1.", "Count every square submatrix made entirely of 1 values.", "Return a number."],
    difficulty: 3,
    examples: [
      { input: "matrix = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]", output: "15", explanation: "There are ten 1x1 squares, four 2x2 squares, and one 3x3 square." },
      { input: "matrix = [[1,1],[1,1]]", output: "5", explanation: "The matrix has four single-cell squares and one 2x2 square." }
    ],
    functionName: "countSquareSubmatrices",
    id: "external-count-square-submatrices",
    prompt: "Return how many square submatrices contain only 1 values.",
    rating: 1613,
    source: { dislikes: 117, likes: 5961, slug: "count-square-submatrices-with-all-ones" },
    solver: (args) => countSquareSubmatrices(args[0] as number[][]),
    starterArgs: "matrix",
    title: "Count Square Submatrices",
    topics: ["Dynamic Programming", "Arrays", "Matrix"]
  },
  {
    cases: makeCases([[1, 6, 3], [2, 6, 7], [2, 5, 10], [1, 2, 3], [3, 6, 7], [30, 30, 500], [2, 4, 5], [3, 3, 9], [4, 2, 5], [5, 6, 18]], "counts dice roll sums"),
    constraints: ["Use exactly n dice.", "Each die has faces 1 through k.", "Return the count modulo 1,000,000,007."],
    difficulty: 3,
    examples: [
      { input: "n = 2, k = 6, target = 7", output: "6", explanation: "The valid pairs are (1,6), (2,5), (3,4), (4,3), (5,2), and (6,1)." },
      { input: "n = 1, k = 2, target = 3", output: "0", explanation: "One die with faces 1 and 2 cannot produce total 3." }
    ],
    functionName: "diceRollTargetWays",
    id: "external-dice-rolls-target-sum",
    prompt: "Return how many ways exactly n k-sided dice can sum to target.",
    rating: 1654,
    source: { dislikes: 186, likes: 5337, slug: "number-of-dice-rolls-with-target-sum" },
    solver: (args) => diceRollTargetWays(args[0] as number, args[1] as number, args[2] as number),
    starterArgs: "n, k, target",
    title: "Dice Rolls With Target Sum",
    topics: ["Dynamic Programming"]
  },
  {
    cases: makeCases([[[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], [[0, 0, 1, 1, 1, 0, 0], 0], [[0, 0, 0, 1], 4], [[1, 1, 1], 0], [[0, 0, 0], 1], [[1, 0, 1, 0, 1], 1], [[1, 0, 0, 1, 1, 0, 1], 2], [[0], 0], [[0], 1], [[1, 0, 1, 1, 0, 1, 1, 1], 1]], "finds longest ones after flips"),
    constraints: ["The array contains only 0 and 1.", "You may flip at most k zeroes to ones.", "Return the maximum length of a contiguous all-ones window after flips."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", output: "6", explanation: "Flip two zeroes around the run near the end to form a six-length window of ones." },
      { input: "nums = [0,0,1,1,1,0,0], k = 0", output: "3", explanation: "No flips are available, so the best window is the existing run [1,1,1]." }
    ],
    functionName: "longestOnesAfterFlips",
    id: "external-max-consecutive-ones-iii",
    prompt: "Return the longest contiguous run of ones obtainable after flipping at most k zeroes.",
    rating: 1656,
    source: { dislikes: 192, likes: 10526, slug: "max-consecutive-ones-iii" },
    solver: (args) => longestOnesAfterFlips(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Max Consecutive Ones III",
    topics: ["Sliding Window", "Arrays"]
  },
  {
    cases: makeCases([[[[1, 2, 10], [2, 3, 20], [2, 5, 25]], 5], [[[1, 2, 10], [2, 2, 15]], 2], [[[1, 1, 5]], 1], [[[1, 3, 10]], 4], [[[2, 4, 7], [1, 2, 3]], 4], [[[1, 5, 10], [2, 3, 5], [4, 5, 2]], 5], [[[3, 3, 8], [1, 4, 2]], 4], [[[1, 2, 4], [2, 4, 6], [3, 5, 8]], 5], [[[5, 5, 9]], 5], [[[1, 10, 1], [3, 7, 2], [6, 10, 3]], 10]], "applies range seat bookings"),
    constraints: ["Each booking is [firstFlight, lastFlight, seats].", "Flight numbers are 1-based.", "Return booked seats for every flight from 1 through n."],
    difficulty: 3,
    examples: [
      { input: "bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5", output: "[10,55,45,25,25]", explanation: "Flight 2 receives seats from all three bookings: 10 + 20 + 25 = 55, while flights 4 and 5 receive only the last booking." },
      { input: "bookings = [[1,1,5]], n = 1", output: "[5]", explanation: "The only booking covers the only flight, so that flight has 5 seats booked." }
    ],
    functionName: "flightBookingTotals",
    id: "external-corporate-flight-bookings",
    prompt: "Return the total booked seats for each flight after applying inclusive range bookings.",
    rating: 1570,
    source: { dislikes: 168, likes: 1881, slug: "corporate-flight-bookings" },
    solver: (args) => flightBookingTotals(args[0] as Array<[number, number, number]>, args[1] as number),
    starterArgs: "bookings, n",
    title: "Flight Booking Totals",
    topics: ["Arrays", "Prefix Sum"]
  },
  {
    cases: makeCases([[[2, 1, 6, 4]], [[1, 1, 1]], [[1, 2, 3]], [[0, 0, 0]], [[5, 5, 2, 5, 8]], [[1, 3, 5, 7]], [[10, 4, 6, 2]], [[3, 2, 1, 6, 4]], [[4, 1, 1, 1, 4]], [[7, 3, 2, 1, 9, 4]]], "counts fair removals"),
    constraints: ["Remove exactly one element.", "After removal, compare the sum at even indexes with the sum at odd indexes.", "Return how many removal indexes make the array fair."],
    difficulty: 3,
    examples: [
      { input: "nums = [2,1,6,4]", output: "1", explanation: "Removing index 1 leaves [2,6,4]; even-index sum 2 + 4 equals odd-index sum 6." },
      { input: "nums = [1,1,1]", output: "3", explanation: "Removing any one value leaves [1,1], whose even and odd sums are both 1." }
    ],
    functionName: "countFairRemovalWays",
    id: "external-ways-to-make-fair-array",
    prompt: "Return how many indexes can be removed so the remaining array has equal even-index and odd-index sums.",
    rating: 1590,
    source: { dislikes: 50, likes: 1410, slug: "ways-to-make-a-fair-array" },
    solver: (args) => countFairRemovalWays(args[0] as number[]),
    starterArgs: "nums",
    title: "Fair Array Removals",
    topics: ["Arrays", "Prefix Sum"]
  },
  {
    cases: makeCases([[[12, 6, 1, 2, 7]], [[1, 10, 3, 4, 19]], [[1, 2, 3]], [[5, 4, 3, 2, 1]], [[9, 1, 8, 2, 7]], [[2, 3, 1, 6, 4, 5]], [[10, 5, 4, 3, 9]], [[4, 8, 2, 6, 1]], [[100, 1, 50, 2, 60]], [[3, 3, 3, 3]]], "maximizes ordered triplet value"),
    constraints: ["Choose indexes i < j < k.", "The value is (nums[i] - nums[j]) * nums[k].", "Return 0 if every valid triplet has a negative value."],
    difficulty: 3,
    examples: [
      { input: "nums = [12,6,1,2,7]", output: "77", explanation: "Choose i = 0, j = 2, k = 4: (12 - 1) * 7 = 77, which is the largest valid value." },
      { input: "nums = [1,2,3]", output: "0", explanation: "Every earlier value is smaller than the middle value, so the best triplet value is negative and the rule returns 0." }
    ],
    functionName: "maximumOrderedTripletValue",
    id: "external-maximum-ordered-triplet-value",
    prompt: "Return the largest non-negative value of (nums[i] - nums[j]) * nums[k] over ordered triplets i < j < k.",
    rating: 1583,
    source: { dislikes: 20, likes: 828, slug: "maximum-value-of-an-ordered-triplet-ii" },
    solver: (args) => maximumOrderedTripletValue(args[0] as number[]),
    starterArgs: "nums",
    title: "Maximum Ordered Triplet Value",
    topics: ["Arrays", "Linear Scan"]
  },
  {
    cases: makeCases([[[4, 1, 3, 3]], [[1, 2, 3, 4, 5]], [[1, 1, 1, 1]], [[3, 2, 1]], [[8, 4, 2, 1]], [[0, 1, 2]], [[5, 5, 6, 7]], [[10, 9, 8, 7, 6]], [[2, 4, 6, 8]], [[6, 1, 7, 3, 9]]], "counts bad index pairs"),
    constraints: ["A pair (i, j) has i < j.", "A good pair satisfies j - i == nums[j] - nums[i].", "Return the number of pairs that are not good."],
    difficulty: 3,
    examples: [
      { input: "nums = [4,1,3,3]", output: "5", explanation: "Only pair (1,2) is good because 2 - 1 equals 3 - 1, so the other five pairs are bad." },
      { input: "nums = [1,2,3,4,5]", output: "0", explanation: "Every pair keeps the same index difference and value difference, so no pair is bad." }
    ],
    functionName: "countBadIndexPairs",
    id: "external-count-number-of-bad-pairs",
    prompt: "Return how many index pairs fail the good-pair difference rule.",
    rating: 1622,
    source: { dislikes: 62, likes: 1799, slug: "count-number-of-bad-pairs" },
    solver: (args) => countBadIndexPairs(args[0] as number[]),
    starterArgs: "nums",
    title: "Count Bad Pairs",
    topics: ["Hash Map", "Arrays", "Counting"]
  },
  {
    cases: makeCases([[["amazon", "apple", "facebook", "google", "leetcode"], ["e", "o"]], [["amazon", "apple", "facebook", "google", "leetcode"], ["l", "e"]], [["acaac", "cccbb", "aacbb", "caacc", "bcbbb"], ["c", "cc", "b"]], [["abc", "def"], ["a"]], [["abc", "ab", "bc"], ["ab"]], [["hello", "yellow", "hero"], ["e", "lo"]], [["aaaa", "aaab", "baaa"], ["aaa"]], [["cat", "dog", "bird"], ["z"]], [["mississippi", "mission", "sipping"], ["is", "pp"]], [["x", "xx", "xxx"], ["x", "xx"]]], "filters universal words"),
    constraints: ["A word is universal when it contains every required letter count from words2.", "Return universal words from words1 in original order.", "Inputs contain lowercase letters."],
    difficulty: 3,
    examples: [
      { input: 'words1 = ["amazon","apple","facebook","google","leetcode"], words2 = ["e","o"]', output: '["facebook","google","leetcode"]', explanation: "The required counts are one e and one o; only those three words contain both." },
      { input: 'words1 = ["abc","def"], words2 = ["a"]', output: '["abc"]', explanation: '"abc" contains the required a, while "def" does not.' }
    ],
    functionName: "universalWordSubsets",
    id: "external-word-subsets",
    prompt: "Return the words from words1 that contain all letter requirements imposed by words2.",
    rating: 1625,
    source: { dislikes: 317, likes: 3542, slug: "word-subsets" },
    solver: (args) => universalWordSubsets(args[0] as string[], args[1] as string[]),
    starterArgs: "words1, words2",
    title: "Universal Word Subsets",
    topics: ["Hash Map", "Strings", "Arrays"]
  },
  {
    cases: makeCases([[[[0, 1], [0, 2]]], [[[0, 1], [1, 2], [2, 3], [1, 4]]], [[[0, 1]]], [[]], [[[0, 1], [2, 3], [3, 4], [4, 5]]], [[[0, 1], [1, 2], [1, 3], [3, 4], [4, 5]]], [[[1, 2], [2, 3], [3, 4]]], [[[0, 1], [0, 2], [0, 3], [0, 4]]], [[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]], [[[2, 0], [2, 1], [2, 3], [3, 4]]]], "measures tree diameter"),
    constraints: ["Edges describe an undirected tree.", "The diameter is the largest number of edges on any path.", "Return 0 when the tree has fewer than two nodes."],
    difficulty: 4,
    examples: [
      { input: "edges = [[0,1],[0,2]]", output: "2", explanation: "The longest path is 1 -> 0 -> 2, which uses two edges." },
      { input: "edges = [[0,1]]", output: "1", explanation: "The only path connects the two nodes with one edge." }
    ],
    functionName: "treeDiameterLength",
    id: "external-tree-diameter",
    prompt: "Return the diameter length of an undirected tree.",
    rating: 1792,
    source: { dislikes: 26, likes: 904, slug: "tree-diameter" },
    solver: (args) => treeDiameterLength(args[0] as Array<[number, number]>),
    starterArgs: "edges",
    title: "Tree Diameter Length",
    topics: ["Trees", "DFS", "Graphs"]
  },
  {
    cases: makeCases([[[1, 2, 4, 5, 3, 6, 7], [4, 5, 2, 6, 7, 3, 1]], [[1], [1]], [[1, 2], [2, 1]], [[1, 2, 3], [3, 2, 1]], [[1, 2, 3], [2, 3, 1]], [[1, 2, 4, 3], [4, 2, 3, 1]], [[1, 2, 4, 5, 3], [4, 5, 2, 3, 1]], [[5, 3, 2, 4, 8], [2, 4, 3, 8, 5]], [[10, 20, 40, 50, 30, 60], [40, 50, 20, 60, 30, 10]], [[7, 3, 1, 5, 9], [1, 5, 3, 9, 7]]], "rebuilds tree level order"),
    constraints: ["Values are unique.", "The traversals come from a full binary tree shape when reconstruction is ambiguous.", "Return the rebuilt tree as compact level-order values."],
    difficulty: 4,
    examples: [
      { input: "preorder = [1,2,4,5,3,6,7], postorder = [4,5,2,6,7,3,1]", output: "[1,2,3,4,5,6,7]", explanation: "Preorder gives each subtree root first, and postorder marks where each subtree ends; rebuilding gives the complete tree level order." },
      { input: "preorder = [1,2], postorder = [2,1]", output: "[1,2]", explanation: "The only child is reconstructed under root 1, so the compact level order is [1,2]." }
    ],
    functionName: "buildTreeLevelOrderFromPrePost",
    id: "external-construct-tree-pre-post",
    prompt: "Rebuild a binary tree from preorder and postorder traversals and return its compact level-order values.",
    rating: 1732,
    source: { dislikes: 161, likes: 3400, slug: "construct-binary-tree-from-preorder-and-postorder-traversal" },
    solver: (args) => buildTreeLevelOrderFromPrePost(args[0] as number[], args[1] as number[]),
    starterArgs: "preorder, postorder",
    title: "Tree Level Order From Pre/Post",
    topics: ["Trees", "Divide and Conquer", "Arrays"]
  },
  {
    cases: makeCases([[6, [[0, 1], [0, 2], [1, 2], [3, 4]]], [6, [[0, 1], [0, 2], [1, 2], [3, 4], [3, 5]]], [3, [[0, 1], [1, 2], [0, 2]]], [4, []], [4, [[0, 1], [2, 3]]], [5, [[0, 1], [1, 2], [0, 2], [3, 4]]], [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], [7, [[0, 1], [0, 2], [1, 2], [3, 4], [4, 5], [3, 5]]], [1, []], [8, [[0, 1], [1, 2], [0, 2], [3, 4], [5, 6], [6, 7], [5, 7]]]], "counts complete components"),
    constraints: ["The graph is undirected.", "A component is complete when every pair of nodes inside it has an edge.", "Isolated nodes count as complete components."],
    difficulty: 4,
    examples: [
      { input: "n = 6, edges = [[0,1],[0,2],[1,2],[3,4]]", output: "3", explanation: "Nodes [0,1,2] form a triangle, [3,4] form a complete pair, and node 5 is isolated." },
      { input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]", output: "0", explanation: "The single component is a path, not a clique, so it is not complete." }
    ],
    functionName: "countCompleteGraphComponents",
    id: "external-complete-components-count",
    prompt: "Return how many connected components in an undirected graph are complete.",
    rating: 1769,
    source: { dislikes: 32, likes: 1287, slug: "count-the-number-of-complete-components" },
    solver: (args) => countCompleteGraphComponents(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, edges",
    title: "Count Complete Components",
    topics: ["Graphs", "DFS"]
  },
  {
    cases: makeCases([[["0201", "0101", "0102", "1212", "2002"], "0202"], [["8888"], "0009"], [["8887", "8889", "8878", "8898", "8788", "8988", "7888", "9888"], "8888"], [[], "0000"], [["0001"], "0001"], [["0001"], "0002"], [["9999"], "9999"], [["0009", "0010"], "0011"], [["5555", "5556"], "5557"], [["1000", "9000", "0100", "0900"], "0009"]], "opens combination lock"),
    constraints: ["The lock starts at 0000.", "Each move rotates one wheel forward or backward by one digit.", "Return -1 if a deadend blocks the target."],
    difficulty: 4,
    examples: [
      { input: 'deadends = ["0201","0101","0102","1212","2002"], target = "0202"', output: "6", explanation: "A shortest safe route changes one wheel at a time and reaches 0202 in six moves while avoiding deadends." },
      { input: 'deadends = ["8888"], target = "0009"', output: "1", explanation: "Rotating the last wheel backward from 0 to 9 reaches the target in one move." }
    ],
    functionName: "openLockMoves",
    id: "external-open-the-lock",
    prompt: "Return the fewest wheel rotations needed to reach the target lock combination without entering a deadend.",
    rating: 1878,
    source: { dislikes: 239, likes: 5148, slug: "open-the-lock" },
    solver: (args) => openLockMoves(args[0] as string[], args[1] as string),
    starterArgs: "deadends, target",
    title: "Open The Lock",
    topics: ["Graphs", "BFS", "Hash Set"]
  },
  {
    cases: makeCases([["001101"], ["11100"], ["0000"], ["10101"], ["010101"], ["110011"], ["01"], ["1001"], ["1010101"], ["0110"]], "counts valid building selections"),
    constraints: ["The string contains only 0 and 1.", "Choose three buildings in increasing index order.", "Valid choices alternate as 010 or 101."],
    difficulty: 3,
    examples: [
      { input: 's = "001101"', output: "6", explanation: "Valid selections must look like 010 or 101; counting all such ordered triples gives 6." },
      { input: 's = "11100"', output: "0", explanation: "There is no building of type 0 before and after a type 1, and no type 1 after the zeroes, so no alternating triple exists." }
    ],
    functionName: "countAlternatingBuildingWays",
    id: "external-select-buildings",
    prompt: "Return how many ways to choose three buildings whose types alternate.",
    rating: 1657,
    source: { dislikes: 54, likes: 1062, slug: "number-of-ways-to-select-buildings" },
    solver: (args) => countAlternatingBuildingWays(args[0] as string),
    starterArgs: "s",
    title: "Ways To Select Buildings",
    topics: ["Dynamic Programming", "Strings", "Prefix Sum"]
  },
  {
    cases: makeCases([["TTFF", 2], ["TFFT", 1], ["TTFTTFTT", 1], ["FFFF", 2], ["T", 0], ["FTFTFT", 2], ["TTTFFFT", 3], ["TFTTT", 1], ["FFFTTFT", 2], ["TFTFTFTF", 3]], "maximizes exam answer run"),
    constraints: ["answerKey contains only T and F.", "You may change at most k answers.", "Return the longest run of equal answers after changes."],
    difficulty: 3,
    examples: [
      { input: 'answerKey = "TTFF", k = 2', output: "4", explanation: "Change both F answers to T, producing a run of four T answers." },
      { input: 'answerKey = "TFFT", k = 1', output: "3", explanation: "Changing either the first T or the last T creates a run of three F answers." }
    ],
    functionName: "maxExamConfusionRun",
    id: "external-maximize-exam-confusion",
    prompt: "Return the longest same-answer streak obtainable by changing at most k exam answers.",
    rating: 1643,
    source: { dislikes: 56, likes: 3103, slug: "maximize-the-confusion-of-an-exam" },
    solver: (args) => maxExamConfusionRun(args[0] as string, args[1] as number),
    starterArgs: "answerKey, k",
    title: "Maximize Exam Confusion",
    topics: ["Sliding Window", "Strings"]
  },
  {
    cases: makeCases([[[5, 8, 6], 3], [[2, 5], 11], [[4, 7, 5], 4], [[1, 2, 3], 6], [[10], 3], [[9, 9, 9], 9], [[6, 6, 6], 4], [[100, 1], 10], [[3, 3, 3], 2], [[7, 11, 13], 5]], "maximizes equal candy share"),
    constraints: ["Each child receives candies from exactly one pile.", "You may split piles but cannot merge pieces from different piles for one child.", "Return 0 if every child cannot receive at least one candy."],
    difficulty: 3,
    examples: [
      { input: "candies = [5,8,6], k = 3", output: "5", explanation: "A share size of 5 gives pieces from piles 5, 8, and 6, while size 6 gives only two pieces." },
      { input: "candies = [2,5], k = 11", output: "0", explanation: "There are only 7 candies total, so 11 children cannot each receive one." }
    ],
    functionName: "maximumCandiesPerChild",
    id: "external-maximum-candies-children",
    prompt: "Return the largest equal candy amount that can be given to each of k children.",
    rating: 1646,
    source: { dislikes: 86, likes: 1843, slug: "maximum-candies-allocated-to-k-children" },
    solver: (args) => maximumCandiesPerChild(args[0] as number[], args[1] as number),
    starterArgs: "candies, k",
    title: "Maximum Candies Per Child",
    topics: ["Binary Search", "Arrays"]
  },
  {
    cases: makeCases([[[1, 2, 3], 5], [[2], 1], [[5, 10, 10], 9], [[3, 3, 3], 10], [[7], 3], [[1, 1, 1], 100], [[4, 6], 8], [[9, 2, 5], 11], [[10, 10], 2], [[6, 8, 12], 20]], "finds minimum trip time"),
    constraints: ["time[i] is how long one bus needs for one trip.", "Each bus can make repeated trips.", "Return the earliest time when totalTrips trips can be completed."],
    difficulty: 3,
    examples: [
      { input: "time = [1,2,3], totalTrips = 5", output: "3", explanation: "By time 3, the buses complete 3 + 1 + 1 = 5 trips, and earlier times complete fewer." },
      { input: "time = [2], totalTrips = 1", output: "2", explanation: "The only bus finishes its first trip at time 2." }
    ],
    functionName: "minimumTripCompletionTime",
    id: "external-minimum-time-trips",
    prompt: "Return the minimum time needed for buses with fixed trip times to complete totalTrips trips.",
    rating: 1641,
    source: { dislikes: 195, likes: 3101, slug: "minimum-time-to-complete-trips" },
    solver: (args) => minimumTripCompletionTime(args[0] as number[], args[1] as number),
    starterArgs: "time, totalTrips",
    title: "Minimum Trip Completion Time",
    topics: ["Binary Search", "Arrays"]
  },
  {
    cases: makeCases([[[[1, 2], [2, 4], [3, 2], [4, 1]]], [[[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]]], [[[0, 3], [1, 9], [2, 6]]], [[[5, 2]]], [[[2, 3], [2, 1], [2, 2]]], [[[3, 5], [1, 2], [2, 4], [3, 1]]], [[[10, 1], [0, 2], [1, 1]]], [[[1, 10], [1, 5], [2, 1], [3, 2]]], [[[0, 10], [5, 1], [5, 2], [6, 1]]], [[[4, 3], [0, 10], [1, 2], [2, 1], [10, 2]]]], "orders single threaded cpu tasks"),
    constraints: ["Each task is [enqueueTime, processingTime].", "When several tasks are available, run the shortest processing time, then the smallest original index.", "Return the order of original task indexes."],
    difficulty: 4,
    examples: [
      { input: "tasks = [[1,2],[2,4],[3,2],[4,1]]", output: "[0,2,3,1]", explanation: "Task 0 runs first; then task 2 is shorter than task 1, task 3 is shortest next, and task 1 runs last." },
      { input: "tasks = [[5,2]]", output: "[0]", explanation: "The CPU waits until time 5 and then runs the only task." }
    ],
    functionName: "singleThreadedCpuOrder",
    id: "external-single-threaded-cpu",
    prompt: "Return the task execution order for a single-threaded CPU using shortest-available-task priority.",
    rating: 1798,
    source: { dislikes: 292, likes: 3510, slug: "single-threaded-cpu" },
    solver: (args) => singleThreadedCpuOrder(args[0] as Array<[number, number]>),
    starterArgs: "tasks",
    title: "Single-Threaded CPU Order",
    topics: ["Heap", "Sorting", "Arrays"]
  },
  {
    cases: makeCases([[[5, 3, 4, 4]], [[1, 2, 3]], [[3, 2, 1]], [[6, 1, 2, 3]], [[4, 1, 5, 2, 6]], [[10, -5, 2]], [[2, 2, 1, 3]], [[8, 1, 1, 10]], [[7, 6, 5, 4, 3]], [[1, 5, 2, 6, 3, 7]]], "merges adjacent pairs until sorted"),
    constraints: ["While the array is not nondecreasing, merge the adjacent pair with the smallest sum.", "If sums tie, choose the leftmost pair.", "Return how many merge operations are needed."],
    difficulty: 5,
    examples: [
      { input: "nums = [5,3,4,4]", output: "2", explanation: "First merge 3 + 4 into 7 to get [5,7,4]; then merge 7 + 4 into 11, leaving [5,11], which is nondecreasing." },
      { input: "nums = [1,2,3]", output: "0", explanation: "The array already satisfies nondecreasing order, so no pair removals are needed." }
    ],
    functionName: "minimumPairMergesToSort",
    id: "external-minimum-pair-removal-sort-array",
    prompt: "Return how many minimum-sum adjacent-pair merges are needed until the array becomes nondecreasing.",
    rating: 2608,
    source: { dislikes: 39, likes: 412, slug: "minimum-pair-removal-to-sort-array-ii" },
    solver: (args) => minimumPairMergesToSort(args[0] as number[]),
    starterArgs: "nums",
    title: "Minimum Pair Merges To Sort",
    topics: ["Linked Lists", "Heap", "Arrays"]
  },
  {
    cases: makeCases([[[3, 6, 9, 12]], [[9, 4, 7, 2, 10]], [[20, 1, 15, 3, 10, 5, 8]], [[1, 1, 1, 1]], [[1, 3, 5, 7, 9]], [[1]], [[1, 5, 9, 13, 4, 8, 12]], [[5, 10, 15, 20, 25, 30]], [[8, 3, 4, 5, 6, 7]], [[1, 7, 10, 13, 14, 19]]], "finds arithmetic chain"),
    constraints: ["Pick a subsequence without reordering nums.", "A valid chain uses one fixed difference between adjacent chosen values.", "Return the maximum possible length."],
    difficulty: 4,
    examples: [
      { input: "nums = [3,6,9,12]", output: "4", explanation: "All four values form one subsequence with difference 3: 3, 6, 9, 12." },
      { input: "nums = [9,4,7,2,10]", output: "3", explanation: "The best chain is 4, 7, 10 with difference 3; no four values keep a single difference in order." }
    ],
    functionName: "longestArithmeticSubsequenceLength",
    id: "external-longest-arithmetic-subsequence",
    prompt: "Return the length of the longest subsequence whose adjacent values all share the same difference.",
    rating: 1759,
    source: { dislikes: 220, likes: 4921, slug: "longest-arithmetic-subsequence" },
    solver: (args) => longestArithmeticSubsequenceLength(args[0] as number[]),
    starterArgs: "nums",
    title: "Longest Arithmetic Subsequence",
    topics: ["Dynamic Programming", "Hash Map", "Arrays"]
  },
  {
    cases: makeCases([["acfgbd", 2], ["abcd", 3], ["eduktdb", 15], ["aaaa", 0], ["azaza", 25], ["abcxyz", 2], ["leetcode", 4], ["pvjcci", 4], ["dyyonfv", 7], ["zabcdefghijkl", 1]], "finds ideal subsequence"),
    constraints: ["s contains lowercase English letters.", "A kept character may follow the previous kept character only when their alphabet distance is at most k.", "Return the maximum kept length."],
    difficulty: 4,
    examples: [
      { input: 's = "acfgbd", k = 2', output: "4", explanation: "One best subsequence is a, c, b, d; every neighboring pair differs by at most 2 letters." },
      { input: 's = "abcd", k = 3', output: "4", explanation: "The whole string works because each adjacent alphabet distance is 1, which is within k." }
    ],
    functionName: "longestIdealSubsequenceLength",
    id: "external-longest-ideal-subsequence",
    prompt: "Return the longest subsequence length where each neighboring pair of kept letters is within k alphabet steps.",
    rating: 1835,
    source: { dislikes: 83, likes: 1536, slug: "longest-ideal-subsequence" },
    solver: (args) => longestIdealSubsequenceLength(args[0] as string, args[1] as number),
    starterArgs: "s, k",
    title: "Longest Ideal Subsequence",
    topics: ["Dynamic Programming", "Strings", "Hash Map"]
  },
  {
    cases: makeCases([[1], [2], [3], [4], [5], [7], [10], [15], [20], [25]], "counts vowel strings"),
    constraints: ["Use only the vowels a, e, i, o, and u.", "Each vowel has a fixed set of vowels that may follow it.", "Return the count modulo 1,000,000,007."],
    difficulty: 4,
    examples: [
      { input: "n = 1", output: "5", explanation: "A one-letter string can be any one of the five vowels." },
      { input: "n = 2", output: "10", explanation: "Apply the follow rules from each first vowel; the allowed two-letter strings total 10." }
    ],
    functionName: "countVowelPermutationStrings",
    id: "external-count-vowels-permutation",
    prompt: "Count length-n vowel strings that obey the allowed next-vowel transition rules.",
    rating: 1730,
    source: { dislikes: 220, likes: 3302, slug: "count-vowels-permutation" },
    solver: (args) => countVowelPermutationStrings(args[0] as number),
    starterArgs: "n",
    title: "Count Vowel Permutations",
    topics: ["Dynamic Programming", "Strings"]
  },
  {
    cases: makeCases([[["a", "b", "ba", "bca", "bda", "bdca"]], [["xbc", "pcxbcf", "xb", "cxbc", "pcxbc"]], [["abcd", "dbqca"]], [["a"]], [["a", "ab", "abc", "abcd"]], [["x", "xy", "xz", "xyz", "xyza"]], [["ksqvsyq", "ks", "kss", "czvh", "zczpzvdhx", "zczpzvh", "zczpzvhx"]], [["a", "ba", "bca", "bdca", "bdeca"]], [["q", "w", "qw", "qwe", "aqwe"]], [["abc", "ab", "ac", "a", "abcd", "abcde"]]], "finds word chain"),
    constraints: ["Words can be used in any order.", "A word can follow another when it is made by inserting exactly one character.", "Return the largest chain length."],
    difficulty: 4,
    examples: [
      { input: 'words = ["a","b","ba","bca","bda","bdca"]', output: "4", explanation: "The chain a -> ba -> bda -> bdca grows by exactly one inserted letter at each step." },
      { input: 'words = ["xbc","pcxbcf","xb","cxbc","pcxbc"]', output: "5", explanation: "xb -> xbc -> cxbc -> pcxbc -> pcxbcf uses every word in a valid growth chain." }
    ],
    functionName: "longestStringChainLength",
    id: "external-longest-string-chain",
    prompt: "Return the maximum number of words in a chain where each next word adds one letter to the previous word.",
    rating: 1599,
    source: { dislikes: 272, likes: 7826, slug: "longest-string-chain" },
    solver: (args) => longestStringChainLength(args[0] as string[]),
    starterArgs: "words",
    title: "Longest String Chain",
    topics: ["Dynamic Programming", "Hash Map", "Strings"]
  },
  {
    cases: makeCases([[[[1, 2], [2, 3], [5], [0], [5], [], []]], [[[1, 2], [2, 3], [5], [0], [5], [], [4]]], [[[]]], [[[1], [2], [3], []]], [[[1], [2], [0]]], [[[1, 2], [2], [], [0]]], [[[1], [], [1], [2]]], [[[1, 2, 3], [2], [3], []]], [[[1], [2], [3], [1]]], [[[1, 2], [3], [3], []]]], "finds safe graph nodes"),
    constraints: ["graph[i] lists all directed edges from node i.", "A node is safe when every possible path from it eventually stops.", "Return safe node indexes in ascending order."],
    difficulty: 4,
    examples: [
      { input: "graph = [[1,2],[2,3],[5],[0],[5],[],[]]", output: "[2,4,5,6]", explanation: "Nodes 2, 4, 5, and 6 cannot reach the cycle 0 -> 1 -> 3 -> 0, so they are safe." },
      { input: "graph = [[1],[2],[3],[]]", output: "[0,1,2,3]", explanation: "Every path moves toward terminal node 3, so every node is safe." }
    ],
    functionName: "eventualSafeGraphNodes",
    id: "external-find-eventual-safe-states",
    prompt: "Return all directed graph nodes that cannot reach any cycle.",
    rating: 1962,
    source: { dislikes: 529, likes: 7053, slug: "find-eventual-safe-states" },
    solver: (args) => eventualSafeGraphNodes(args[0] as number[][]),
    starterArgs: "graph",
    title: "Find Eventual Safe States",
    topics: ["Graphs", "Topological Sort", "DFS"]
  },
  {
    cases: makeCases([[[1, 10, 3, 10, 2], 3, 1], [[1, 10, 3, 10, 2], 3, 2], [[7, 7, 7, 7, 12, 7, 7], 2, 3], [[1000000000, 1000000000], 1, 1], [[1, 2, 4, 9, 3, 4, 1], 2, 2], [[5, 5, 5, 5], 4, 1], [[1, 2, 3, 4, 5], 1, 5], [[1, 10, 2, 9, 3, 8, 4], 2, 2], [[3, 3, 3], 2, 2], [[2, 2, 4, 4, 4, 6], 2, 2]], "finds bouquet day"),
    constraints: ["Each bouquet needs k adjacent flowers that have bloomed.", "A flower blooms on bloomDay[i].", "Return the minimum day, or -1 when m bouquets cannot be made."],
    difficulty: 4,
    examples: [
      { input: "bloomDay = [1,10,3,10,2], m = 3, k = 1", output: "3", explanation: "By day 3, flowers at days 1, 2, and 3 have bloomed, enough for three single-flower bouquets." },
      { input: "bloomDay = [1,10,3,10,2], m = 3, k = 2", output: "-1", explanation: "Three bouquets of size 2 would require 6 flowers, but the garden has only 5." }
    ],
    functionName: "minDaysForBouquets",
    id: "external-min-days-bouquets",
    prompt: "Return the earliest day when m bouquets can be made from adjacent bloomed flowers.",
    rating: 1945,
    source: { dislikes: 326, likes: 5772, slug: "minimum-number-of-days-to-make-m-bouquets" },
    solver: (args) => minDaysForBouquets(args[0] as number[], args[1] as number, args[2] as number),
    starterArgs: "bloomDay, m, k",
    title: "Minimum Days For Bouquets",
    topics: ["Binary Search", "Arrays"]
  },
  {
    cases: makeCases([[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], [[3, 2, 2, 4, 1, 4], 3], [[1, 2, 3, 1, 1], 4], [[10], 1], [[5, 5, 5, 5], 2], [[7, 2, 5, 10, 8], 2], [[9, 8, 7, 6], 4], [[2, 2, 2, 2, 2], 3], [[1, 10, 1, 10], 2], [[4, 3, 2, 1, 4], 3]], "finds ship capacity"),
    constraints: ["Ship packages in their existing order.", "Each day can carry packages until the capacity would be exceeded.", "Return the smallest capacity that finishes within days."],
    difficulty: 4,
    examples: [
      { input: "weights = [1,2,3,4,5,6,7,8,9,10], days = 5", output: "15", explanation: "Capacity 15 can split the packages into five valid days; capacity 14 cannot keep the same order in five days." },
      { input: "weights = [3,2,2,4,1,4], days = 3", output: "6", explanation: "Capacity 6 allows daily loads [3,2], [2,4], and [1,4]." }
    ],
    functionName: "shipWithinDaysCapacity",
    id: "external-ship-packages-days",
    prompt: "Return the minimum ship capacity needed to deliver all packages within the given number of days.",
    rating: 1725,
    source: { dislikes: 291, likes: 11056, slug: "capacity-to-ship-packages-within-d-days" },
    solver: (args) => shipWithinDaysCapacity(args[0] as number[], args[1] as number),
    starterArgs: "weights, days",
    title: "Ship Packages Within Days",
    topics: ["Binary Search", "Arrays"]
  },
  {
    cases: makeCases([[[1], 1], [[1, 2], 4], [[2, -1, 2], 3], [[84, -37, 32, 40, 95], 167], [[17, 85, 93, -45, -21], 150], [[1, -1, 5, -2, 3], 3], [[-1, -2, -3], 1], [[5, -10, 20], 15], [[3, -2, 5, -1], 6], [[10, -5, 2, 7], 9]], "finds shortest qualifying subarray"),
    constraints: ["nums may contain negative values.", "A subarray must be contiguous.", "Return -1 when no subarray has sum at least k."],
    difficulty: 5,
    examples: [
      { input: "nums = [1], k = 1", output: "1", explanation: "The only subarray has sum 1, which reaches k." },
      { input: "nums = [2,-1,2], k = 3", output: "3", explanation: "The whole array sums to 3; neither shorter subarray reaches the target." }
    ],
    functionName: "shortestSubarrayAtLeastK",
    id: "external-shortest-subarray-at-least-k",
    prompt: "Return the length of the shortest contiguous subarray whose sum is at least k.",
    rating: 2307,
    source: { dislikes: 145, likes: 5204, slug: "shortest-subarray-with-sum-at-least-k" },
    solver: (args) => shortestSubarrayAtLeastK(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Shortest Subarray With Sum At Least K",
    topics: ["Sliding Window", "Queues", "Prefix Sum"]
  },
  {
    cases: makeCases([[[100, 80, 60, 70, 60, 75, 85]], [[10, 4, 5, 20]], [[31, 41, 48, 59, 79]], [[5, 4, 3, 2, 1]], [[5, 5, 5]], [[30]], [[10, 20, 10, 30]], [[7, 6, 8, 9, 5, 10]], [[3, 1, 2, 4, 2]], [[90, 100, 80, 120, 110]]], "computes stock spans"),
    constraints: ["For each price, look backward while previous prices are less than or equal to it.", "The span includes the current day.", "Return one span value per input price."],
    difficulty: 4,
    examples: [
      { input: "prices = [100,80,60,70,60,75,85]", output: "[1,1,1,2,1,4,6]", explanation: "For price 85, the previous five prices 80, 60, 70, 60, and 75 are all at most 85, so its span is 6 including today." },
      { input: "prices = [10,4,5,20]", output: "[1,1,2,4]", explanation: "The final price 20 is at least every earlier price, so its span covers all four days." }
    ],
    functionName: "dailyStockSpans",
    id: "external-online-stock-span",
    prompt: "Return the stock span for each day in the price list.",
    rating: 1709,
    source: { dislikes: 505, likes: 7286, slug: "online-stock-span" },
    solver: (args) => dailyStockSpans(args[0] as number[]),
    starterArgs: "prices",
    title: "Daily Stock Spans",
    topics: ["Stacks", "Monotonic Stack", "Arrays"]
  },
  {
    cases: makeCases([[[6, 0, 8, 2, 1, 5]], [[9, 8, 1, 0, 1, 9, 4, 0, 4, 1]], [[1, 2, 3, 4]], [[4, 3, 2, 1]], [[5, 5, 5]], [[2, 0, 1]], [[7, 1, 5, 0, 6]], [[10, 3, 8, 9, 4, 6]], [[1]], [[8, 7, 6, 5, 9]]], "finds widest ramp"),
    constraints: ["A ramp is a pair i < j with nums[i] <= nums[j].", "The width is j - i.", "Return the maximum width, or 0 when no wider pair exists."],
    difficulty: 4,
    examples: [
      { input: "nums = [6,0,8,2,1,5]", output: "4", explanation: "The widest valid ramp is from index 1 value 0 to index 5 value 5, giving width 4." },
      { input: "nums = [9,8,1,0,1,9,4,0,4,1]", output: "7", explanation: "Index 2 value 1 can pair with index 9 value 1, so the width is 7." }
    ],
    functionName: "maxWidthRamp",
    id: "external-maximum-width-ramp",
    prompt: "Return the largest distance between two indexes i < j where nums[i] is at most nums[j].",
    rating: 1608,
    source: { dislikes: 98, likes: 2863, slug: "maximum-width-ramp" },
    solver: (args) => maxWidthRamp(args[0] as number[]),
    starterArgs: "nums",
    title: "Maximum Width Ramp",
    topics: ["Stacks", "Arrays", "Two Pointers"]
  },
  {
    cases: makeCases([["abcde", ["a", "bb", "acd", "ace"]], ["dsahjpjauf", ["ahjpjau", "ja", "ahbwzgqnuk", "tnmlanowax"]], ["aaaaa", ["a", "aa", "aaa", "aaaa", "aaaaa", "aaaaaa"]], ["abc", ["abc", "ac", "bc", "d"]], ["leetcode", ["let", "code", "leet", "toe", "eet"]], ["", ["", "a"]], ["banana", ["ban", "ana", "bna", "baa", "banana"]], ["subsequence", ["sue", "sqs", "sub", "sequence", "sun"]], ["xyz", ["x", "y", "z", "xy", "xz", "yz", "xyz"]], ["mississippi", ["msp", "sip", "miss", "ppi", "ssss"]]], "counts matching subsequences"),
    constraints: ["A word matches when all its letters can be found in s from left to right.", "Words may repeat and each copy counts.", "Return the number of matching words."],
    difficulty: 4,
    examples: [
      { input: 's = "abcde", words = ["a","bb","acd","ace"]', output: "3", explanation: "a, acd, and ace appear in order inside s; bb does not." },
      { input: 's = "dsahjpjauf", words = ["ahjpjau","ja","ahbwzgqnuk","tnmlanowax"]', output: "2", explanation: "ahjpjau and ja can be traced through s from left to right, while the other two cannot." }
    ],
    functionName: "countMatchingSubsequences",
    id: "external-number-of-matching-subsequences",
    prompt: "Return how many words are subsequences of the main string.",
    rating: 1695,
    source: { dislikes: 249, likes: 5823, slug: "number-of-matching-subsequences" },
    solver: (args) => countMatchingSubsequences(args[0] as string, args[1] as string[]),
    starterArgs: "s, words",
    title: "Number Of Matching Subsequences",
    topics: ["Hash Map", "Binary Search", "Strings"]
  },
  {
    cases: makeCases([["eleetminicoworoep"], ["leetcodeisgreat"], ["bcbcbc"], [""], ["aeiou"], ["aaaa"], ["id"], ["amntyyaw"], ["abcdeiouxyz"], ["uoieaqqaeiou"]], "finds even-vowel substring"),
    constraints: ["Only vowel parity matters; consonants do not change the parity state.", "A valid substring has even counts for a, e, i, o, and u.", "Return the longest valid substring length."],
    difficulty: 5,
    examples: [
      { input: 's = "eleetminicoworoep"', output: "13", explanation: "The substring leetminicowor has each vowel appearing an even number of times, and no longer substring works." },
      { input: 's = "leetcodeisgreat"', output: "5", explanation: "The substring leetc has even counts for all vowels, giving length 5." }
    ],
    functionName: "longestEvenVowelSubstring",
    id: "external-longest-even-vowel-substring",
    prompt: "Return the longest substring length where every vowel appears an even number of times.",
    rating: 2040,
    source: { dislikes: 142, likes: 2570, slug: "find-the-longest-substring-containing-vowels-in-even-counts" },
    solver: (args) => longestEvenVowelSubstring(args[0] as string),
    starterArgs: "s",
    title: "Longest Even-Vowel Substring",
    topics: ["Hash Map", "Bit Manipulation", "Prefix Sum"]
  },
  {
    cases: makeCases([[[2, 1, 4, 3], 2, 3], [[2, 9, 2, 5, 6], 2, 8], [[1, 1, 1], 1, 1], [[1, 2, 3], 4, 5], [[4, 5, 6], 2, 3], [[2, 2, 2], 2, 2], [[1, 3, 5, 2, 7, 5], 2, 5], [[10], 1, 9], [[3, 4, 1, 2], 2, 4], [[5, 1, 2, 3, 6], 3, 5]], "counts bounded subarrays"),
    constraints: ["Count contiguous subarrays.", "The maximum value in the subarray must be at least left and at most right.", "Return the total count."],
    difficulty: 4,
    examples: [
      { input: "nums = [2,1,4,3], left = 2, right = 3", output: "3", explanation: "The valid subarrays are [2], [2,1], and [3]; subarrays containing 4 exceed the bound." },
      { input: "nums = [2,9,2,5,6], left = 2, right = 8", output: "7", explanation: "The value 9 splits the array; all valid bounded subarrays come from the [2,5,6] side plus the first [2]." }
    ],
    functionName: "countBoundedMaxSubarrays",
    id: "external-bounded-maximum-subarrays",
    prompt: "Count subarrays whose maximum value lies between left and right inclusive.",
    rating: 1817,
    source: { dislikes: 136, likes: 2458, slug: "number-of-subarrays-with-bounded-maximum" },
    solver: (args) => countBoundedMaxSubarrays(args[0] as number[], args[1] as number, args[2] as number),
    starterArgs: "nums, left, right",
    title: "Subarrays With Bounded Maximum",
    topics: ["Two Pointers", "Arrays"]
  },
  {
    cases: makeCases([[1, 1, [[10, 10]]], [100, 1, [[10, 60], [20, 30], [30, 30], [60, 40]]], [100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]], [100, 50, [[25, 25], [50, 50]]], [1000, 299, [[13, 21], [26, 115], [100, 47], [225, 99], [299, 141], [444, 198], [608, 190], [636, 157], [647, 255], [841, 123]]], [10, 3, [[3, 3], [6, 4]]], [50, 10, [[10, 10], [20, 10], [30, 10], [40, 10]]], [25, 25, []], [30, 5, [[10, 10], [20, 5]]], [200, 50, [[25, 25], [50, 25], [100, 100]]]], "finds minimum refuels"),
    constraints: ["Start with startFuel units of fuel.", "Each station is [position, fuel].", "Return the fewest refuels needed to reach target, or -1 if impossible."],
    difficulty: 5,
    examples: [
      { input: "target = 1, startFuel = 1, stations = [[10,10]]", output: "0", explanation: "The car already has enough fuel to reach target before any station matters." },
      { input: "target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]]", output: "2", explanation: "Refuel at position 10, then later use the largest available station fuel to finish with two total stops." }
    ],
    functionName: "minRefuelStops",
    id: "external-minimum-refueling-stops",
    prompt: "Return the minimum number of refueling stops needed to reach the target distance.",
    rating: 2074,
    source: { dislikes: 94, likes: 4885, slug: "minimum-number-of-refueling-stops" },
    solver: (args) => minRefuelStops(args[0] as number, args[1] as number, args[2] as Array<[number, number]>),
    starterArgs: "target, startFuel, stations",
    title: "Minimum Refueling Stops",
    topics: ["Heap", "Greedy", "Dynamic Programming"]
  },
  {
    cases: makeCases([[[1, -2, 3, -2]], [[5, -3, 5]], [[-3, -2, -3]], [[1, 2, 3]], [[3, -1, 2, -1]], [[8, -1, 3, 4]], [[-1]], [[0, 0, 0]], [[10, -12, 11]], [[2, -2, 2, 7, 8, 0]]], "finds circular subarray sum"),
    constraints: ["Choose a non-empty subarray.", "The subarray may wrap from the end of nums back to the start.", "Return the largest possible sum."],
    difficulty: 4,
    examples: [
      { input: "nums = [1,-2,3,-2]", output: "3", explanation: "The best non-wrapping subarray is [3], and wrapping does not improve it." },
      { input: "nums = [5,-3,5]", output: "10", explanation: "Wrapping lets the subarray take the last 5 and first 5 while skipping -3." }
    ],
    functionName: "maxCircularSubarraySum",
    id: "external-maximum-sum-circular-subarray",
    prompt: "Return the maximum subarray sum when the chosen subarray is allowed to wrap around the array end.",
    rating: 1777,
    source: { dislikes: 349, likes: 7356, slug: "maximum-sum-circular-subarray" },
    solver: (args) => maxCircularSubarraySum(args[0] as number[]),
    starterArgs: "nums",
    title: "Maximum Circular Subarray Sum",
    topics: ["Arrays", "Dynamic Programming"]
  },
  {
    cases: makeCases([[[1, 0, 1, 0, 1], 2], [[0, 0, 0, 0, 0], 0], [[1, 1, 1], 2], [[1, 0, 0, 1, 0], 1], [[0, 1, 1, 0, 1], 2], [[1], 1], [[0], 1], [[1, 0, 1, 0, 0, 1], 2], [[0, 1, 0, 1, 0], 0], [[1, 1, 0, 1, 0, 1], 3]], "counts binary subarrays"),
    constraints: ["nums contains only 0 and 1.", "goal is a non-negative integer.", "Count contiguous subarrays whose sum equals goal."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,0,1,0,1], goal = 2", output: "4", explanation: "Four windows contain exactly two ones after the zero padding is considered." },
      { input: "nums = [0,0,0,0,0], goal = 0", output: "15", explanation: "Every non-empty subarray has sum zero." }
    ],
    functionName: "countBinarySubarraysWithSum",
    id: "external-binary-subarrays-with-sum",
    prompt: "Return how many contiguous subarrays in the binary array have sum exactly equal to goal.",
    rating: 1592,
    source: { dislikes: 169, likes: 4906, slug: "binary-subarrays-with-sum" },
    solver: (args) => countBinarySubarraysWithSum(args[0] as number[], args[1] as number),
    starterArgs: "nums, goal",
    title: "Binary Subarrays With Target Sum",
    topics: ["Hash Map", "Sliding Window", "Prefix Sum"]
  },
  {
    cases: makeCases([["abcd", "cdab", 2], ["aabbcc", "bbaacc", 3], ["abcd", "acbd", 2], ["leetcode", "codeleet", 2], ["aaaa", "aaaa", 4], ["abcabc", "abcabc", 3], ["abcabc", "bcabca", 3], ["xyzxyz", "zxyxyz", 2], ["abab", "baba", 2], ["abcdef", "fedcba", 3]], "checks chunk rearrangement"),
    constraints: ["s and target have the same length.", "k must divide the string length.", "Only whole equal-length chunks may be rearranged."],
    difficulty: 3,
    examples: [
      { input: 's = "abcd", target = "cdab", k = 2', output: "true", explanation: "Split into ab and cd, then swap the two chunks." },
      { input: 's = "abcd", target = "acbd", k = 2', output: "false", explanation: "The target chunks ac and bd are not the same multiset as ab and cd." }
    ],
    functionName: "canRearrangeKSubstrings",
    id: "external-rearrange-k-substrings",
    prompt: "Split both strings into k equal-length chunks and return true when s chunks can be rearranged to form target.",
    rating: 1514,
    source: { dislikes: 7, likes: 89, slug: "rearrange-k-substrings-to-form-target-string" },
    solver: (args) => canRearrangeKSubstrings(args[0] as string, args[1] as string, args[2] as number),
    starterArgs: "s, target, k",
    title: "Rearrange K Substrings",
    topics: ["Hash Map", "Strings", "Sorting"]
  },
  {
    cases: makeCases([[[4, 3, 1, 2, 4]], [[1, 10, 4]], [[0, 0, 0]], [[5, 5, 5, 5]], [[2, 3, 1, 6, 7]], [[7]], [[1, 2, 3, 4, 5]], [[8, 1, 9, 1, 8]], [[6, 6, 6]], [[10, 20, 30, 40]]], "counts beautiful subarrays"),
    constraints: ["Values are non-negative integers.", "A beautiful subarray has bitwise xor equal to 0.", "Return the number of contiguous beautiful subarrays."],
    difficulty: 3,
    examples: [
      { input: "nums = [4,3,1,2,4]", output: "2", explanation: "The zero-xor windows are [3,1,2] and the full array." },
      { input: "nums = [1,10,4]", output: "0", explanation: "No contiguous window has xor zero." }
    ],
    functionName: "countBeautifulSubarrays",
    id: "external-beautiful-subarrays",
    prompt: "Return the number of contiguous subarrays whose bitwise xor is zero.",
    rating: 1697,
    source: { dislikes: 23, likes: 563, slug: "count-the-number-of-beautiful-subarrays" },
    solver: (args) => countBeautifulSubarrays(args[0] as number[]),
    starterArgs: "nums",
    title: "Beautiful Zero-Xor Subarrays",
    topics: ["Hash Map", "Bit Manipulation", "Prefix"]
  },
  {
    cases: makeCases([[[12, 33, 4, 56, 22, 2, 34, 33, 22, 12, 34], [[1, 2, 4], [0, 11, 33], [0, 5, 22]]], [[1, 1, 1, 2, 2], [[0, 2, 1], [2, 4, 1], [0, 4, 2]]], [[5], [[0, 0, 5], [0, 0, 4]]], [[3, 4, 3, 4, 3], [[0, 4, 3], [1, 3, 4], [2, 2, 3]]], [[7, 8, 9, 7, 8, 9], [[0, 5, 9], [1, 4, 7]]], [[2, 2, 2, 2], [[1, 2, 2], [0, 3, 3]]], [[10, 20, 10, 30, 10], [[0, 4, 10], [2, 3, 10]]], [[1, 2, 3], [[0, 2, 4], [1, 1, 2]]], [[6, 6, 7, 7, 6, 7], [[0, 5, 6], [2, 5, 7]]], [[9, 1, 9, 1, 9], [[0, 4, 1], [1, 3, 9]]]], "answers range frequencies"),
    constraints: ["Each query is [left, right, value].", "left and right are inclusive indexes.", "Return one frequency per query."],
    difficulty: 3,
    examples: [
      { input: "arr = [12,33,4,56,22,2,34,33,22,12,34], queries = [[1,2,4],[0,11,33],[0,5,22]]", output: "[1,2,1]", explanation: "Each answer counts the requested value only inside the inclusive range." },
      { input: "arr = [1,1,1,2,2], queries = [[0,2,1],[2,4,1],[0,4,2]]", output: "[3,1,2]", explanation: "The index lists for 1 and 2 make each range count direct." }
    ],
    functionName: "rangeFrequencyValues",
    id: "external-range-frequency-queries",
    prompt: "For each query, count how many times value appears between left and right inclusive.",
    rating: 1702,
    source: { dislikes: 29, likes: 756, slug: "range-frequency-queries" },
    solver: (args) => rangeFrequencyValues(args[0] as number[], args[1] as Array<[number, number, number]>),
    starterArgs: "arr, queries",
    title: "Range Frequency Queries",
    topics: ["Hash Map", "Binary Search", "Design"]
  },
  {
    cases: makeCases([["1-2--3--4-5--6--7"], ["1-401--349---90--88"], ["10"], ["5-3--2--4-8--7--9"], ["1-2--3---4-5"], ["7-6--5---4----3"], ["9-8-7"], ["12-7--3--9-20--15--25"], ["1-2--3---4----5-6"], ["4-2--1--3-6--5--7"]], "recovers preorder tree"),
    constraints: ["Traversal uses dashes to mark depth.", "Node values are positive integers.", "Return the recovered tree as trimmed level-order values."],
    difficulty: 4,
    examples: [
      { input: 'traversal = "1-2--3--4-5--6--7"', output: "[1,2,5,3,4,6,7]", explanation: "Dash depth places 2 and 5 under 1, then their depth-two children fill the next level." },
      { input: 'traversal = "1-401--349---90--88"', output: "[1,401,null,349,88,90]", explanation: "The depth-three value 90 becomes the left child of 349 before 88 closes that branch." }
    ],
    functionName: "recoverPreorderLevelValues",
    id: "external-recover-tree-preorder",
    prompt: "Recover the binary tree encoded by preorder depth markers and return its trimmed level-order values.",
    rating: 1797,
    source: { dislikes: 70, likes: 2296, slug: "recover-a-tree-from-preorder-traversal" },
    solver: (args) => recoverPreorderLevelValues(args[0] as string),
    starterArgs: "traversal",
    title: "Recover Preorder Tree",
    topics: ["Trees", "DFS", "Strings"]
  },
  {
    cases: makeCases([[[5, 1, 2, 3, null, 6, 4], 3, 6], [[2, 1], 2, 1], [[1, 2, 3, 4], 4, 3], [[1, 2, 3, null, 4, 5, 6], 4, 6], [[10, 5, 15, 3, 7, 12, 18], 3, 18], [[7, 3, 9, 1, 5, 8, 10], 5, 8], [[1, null, 2, null, 3], 3, 2], [[4, 2, 6, 1, 3, 5, 7], 1, 7], [[8, 4, 12, 2, 6, 10, 14, null, 3], 3, 10], [[6, 2, 8, 1, 4, 7, 9, null, null, 3, 5], 5, 7]], "finds tree directions"),
    constraints: ["root is a level-order array with null for missing children.", "startValue and destValue exist in the tree.", "Return a string made from U, L, and R."],
    difficulty: 4,
    examples: [
      { input: "root = [5,1,2,3,null,6,4], startValue = 3, destValue = 6", output: "UURL", explanation: "Move up from 3 to 5, then go right to 2 and left to 6." },
      { input: "root = [2,1], startValue = 2, destValue = 1", output: "L", explanation: "The destination is the left child of the starting node." }
    ],
    functionName: "directionsBetweenTreeNodes",
    id: "external-step-directions-tree",
    prompt: "Return the directions needed to travel from startValue to destValue in the given binary tree.",
    rating: 1805,
    source: { dislikes: 171, likes: 3272, slug: "step-by-step-directions-from-a-binary-tree-node-to-another" },
    solver: (args) => directionsBetweenTreeNodes(args[0] as Array<number | null>, args[1] as number, args[2] as number),
    starterArgs: "root, startValue, destValue",
    title: "Directions Between Tree Nodes",
    topics: ["Trees", "DFS", "Strings"]
  },
  {
    cases: makeCases([[1], [2], [3], [5], [7], [9], [11], [13], [15], [17]], "counts full binary trees"),
    constraints: ["A full binary tree node has either zero or two children.", "Return the number of possible shapes for n nodes.", "Even n has no valid full binary tree."],
    difficulty: 4,
    examples: [
      { input: "n = 7", output: "5", explanation: "Splitting the remaining six nodes between left and right subtrees produces five ordered shapes." },
      { input: "n = 2", output: "0", explanation: "Two nodes cannot make every internal node have exactly two children." }
    ],
    functionName: "countFullBinaryTreeShapes",
    id: "external-full-binary-tree-count",
    prompt: "Return how many ordered full binary tree shapes can be built with exactly n nodes.",
    rating: 1784,
    source: { dislikes: 369, likes: 5262, slug: "all-possible-full-binary-trees" },
    solver: (args) => countFullBinaryTreeShapes(args[0] as number),
    starterArgs: "n",
    title: "Full Binary Tree Shape Count",
    topics: ["Trees", "Dynamic Programming", "Recursion"]
  },
  {
    cases: makeCases([[[[1, 1, 1, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 0, 1, 1]], [[1, 1, 1, 0, 0], [0, 0, 1, 1, 1], [0, 1, 0, 0, 0], [1, 0, 1, 1, 0], [0, 1, 0, 1, 0]]], [[[1]], [[1]]], [[[1]], [[0]]], [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], [[[1, 0], [0, 1]], [[1, 1], [0, 1]]], [[[1, 1, 0], [1, 1, 0], [0, 0, 1]], [[1, 0, 0], [1, 1, 0], [0, 0, 1]]], [[[1, 1, 1], [1, 0, 1], [1, 1, 1]], [[0, 1, 0], [1, 1, 1], [0, 1, 0]]], [[[0, 0], [0, 0]], [[1, 0], [0, 1]]], [[[1, 1, 1, 1]], [[1, 1, 0, 1]]], [[[1, 0, 1], [1, 1, 1]], [[1, 0, 1], [0, 1, 1]]]], "counts sub-islands"),
    constraints: ["grid1 and grid2 have the same dimensions.", "Cells use 1 for land and 0 for water.", "A grid2 island counts only when every cell is land in grid1."],
    difficulty: 3,
    examples: [
      { input: "grid1 = [[1,1,1,0,0],[0,1,1,1,1],[0,0,0,0,0],[1,0,0,0,0],[1,1,0,1,1]], grid2 = [[1,1,1,0,0],[0,0,1,1,1],[0,1,0,0,0],[1,0,1,1,0],[0,1,0,1,0]]", output: "3", explanation: "Three grid2 islands are fully covered by land in grid1." },
      { input: "grid1 = [[1]], grid2 = [[0]]", output: "0", explanation: "There is no land island to count in grid2." }
    ],
    functionName: "countSubIslands",
    id: "external-count-sub-islands",
    prompt: "Count islands in grid2 that are entirely contained inside land cells of grid1.",
    rating: 1679,
    source: { dislikes: 92, likes: 2656, slug: "count-sub-islands" },
    solver: (args) => countSubIslands(args[0] as number[][], args[1] as number[][]),
    starterArgs: "grid1, grid2",
    title: "Count Sub Islands",
    topics: ["Graphs", "DFS", "Grid"]
  },
  {
    cases: makeCases([[3, [[1, 2], [1, 0], [2, 0]], [[1, 0], [1, 2]]], [2, [[1, 0]], [[0, 1], [1, 0]]], [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [[0, 4], [1, 3], [3, 0]]], [4, [], [[0, 1], [2, 3]]], [4, [[0, 1], [2, 3]], [[0, 1], [2, 3], [0, 3]]], [6, [[0, 2], [2, 4], [1, 3], [3, 5]], [[0, 4], [1, 5], [0, 5]]], [3, [[0, 1], [1, 2], [0, 2]], [[0, 2], [2, 0]]], [5, [[1, 2], [2, 4], [1, 3], [3, 4]], [[1, 4], [2, 3]]], [1, [], [[0, 0]]], [4, [[0, 2], [1, 2], [2, 3]], [[0, 3], [1, 3], [3, 0]]]], "answers prerequisite queries"),
    constraints: ["Courses are numbered from 0 to numCourses - 1.", "Each prerequisite is [before, after].", "Return one boolean per query."],
    difficulty: 4,
    examples: [
      { input: "numCourses = 3, prerequisites = [[1,2],[1,0],[2,0]], queries = [[1,0],[1,2]]", output: "[true,true]", explanation: "Course 1 reaches both 2 and 0 through the prerequisite graph." },
      { input: "numCourses = 2, prerequisites = [[1,0]], queries = [[0,1],[1,0]]", output: "[false,true]", explanation: "The only known dependency direction is 1 before 0." }
    ],
    functionName: "courseSchedulePrerequisites",
    id: "external-course-schedule-iv",
    prompt: "For each query, return whether the first course is a prerequisite of the second course.",
    rating: 1693,
    source: { dislikes: 94, likes: 2149, slug: "course-schedule-iv" },
    solver: (args) => courseSchedulePrerequisites(args[0] as number, args[1] as Array<[number, number]>, args[2] as Array<[number, number]>),
    starterArgs: "numCourses, prerequisites, queries",
    title: "Course Schedule Prerequisite Queries",
    topics: ["Graphs", "Topological Sort", "DFS"]
  },
  {
    cases: makeCases([[3, [[1, 3], [2, 3]]], [3, [[1, 2], [2, 3], [3, 1]]], [5, [[1, 5], [2, 5], [3, 5], [3, 4], [4, 5]]], [1, []], [2, [[1, 2]]], [4, [[1, 2], [1, 3], [3, 4]]], [4, [[1, 2], [2, 4], [1, 3], [3, 4]]], [6, [[1, 4], [2, 4], [3, 5], [5, 6]]], [5, []], [4, [[1, 2], [2, 3], [1, 3], [3, 4]]]], "computes minimum semesters"),
    constraints: ["Courses are numbered from 1 to n.", "Each relation is [before, after].", "Return -1 when a cycle prevents completion."],
    difficulty: 4,
    examples: [
      { input: "n = 3, relations = [[1,3],[2,3]]", output: "2", explanation: "Take courses 1 and 2 first, then course 3." },
      { input: "n = 3, relations = [[1,2],[2,3],[3,1]]", output: "-1", explanation: "The cycle means no course order can finish all classes." }
    ],
    functionName: "minimumCourseSemesters",
    id: "external-parallel-courses",
    prompt: "Return the minimum number of semesters needed when any number of currently available courses may be taken together.",
    rating: 1710,
    source: { dislikes: 27, likes: 1225, slug: "parallel-courses" },
    solver: (args) => minimumCourseSemesters(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, relations",
    title: "Parallel Courses",
    topics: ["Graphs", "Topological Sort", "BFS"]
  },
  {
    cases: makeCases([[[1, 2, 3, 1, 2, 3, 1, 2], 2], [[1, 2, 1, 2, 1, 2, 1], 1], [[5, 5, 5, 5], 2], [[1, 2, 3, 4], 1], [[1, 1, 2, 2, 3, 3], 2], [[4, 4, 4, 1, 2, 3], 2], [[7], 1], [[1, 2, 1, 3, 1, 4, 1], 2], [[2, 3, 2, 3, 2, 3], 3], [[9, 8, 9, 8, 7, 7, 7], 2]], "finds longest capped-frequency window"),
    constraints: ["k is at least 1.", "Each distinct value may appear at most k times in the chosen subarray.", "Return the longest valid window length."],
    difficulty: 3,
    examples: [
      { input: "nums = [1,2,3,1,2,3,1,2], k = 2", output: "6", explanation: "The first six numbers keep each value at most twice." },
      { input: "nums = [1,2,1,2,1,2,1], k = 1", output: "2", explanation: "Any longer window repeats either 1 or 2." }
    ],
    functionName: "longestSubarrayAtMostKFrequency",
    id: "external-longest-subarray-at-most-k-frequency",
    prompt: "Return the length of the longest contiguous subarray where no value appears more than k times.",
    rating: 1535,
    source: { dislikes: 37, likes: 1197, slug: "length-of-longest-subarray-with-at-most-k-frequency" },
    solver: (args) => longestSubarrayAtMostKFrequency(args[0] as number[], args[1] as number),
    starterArgs: "nums, k",
    title: "Longest Subarray With Capped Frequency",
    topics: ["Sliding Window", "Hash Map", "Counting"]
  },
  {
    cases: makeCases([[[8, 2, 4, 7], 4], [[10, 1, 2, 4, 7, 2], 5], [[4, 2, 2, 2, 4, 4, 2, 2], 0], [[1, 5, 6, 7, 8, 10, 6, 5, 6], 4], [[1], 0], [[1, 2, 3, 4], 3], [[1, 10, 1, 10], 0], [[6, 6, 6], 0], [[3, 1, 2, 5, 4], 2], [[9, 7, 5, 3, 1], 4]], "finds limited-difference window"),
    constraints: ["Return a window length.", "The chosen subarray must have max minus min at most limit.", "Use contiguous elements only."],
    difficulty: 4,
    examples: [
      { input: "nums = [8,2,4,7], limit = 4", output: "2", explanation: "The window [2,4] has max-min equal to 2, while longer windows exceed the limit." },
      { input: "nums = [10,1,2,4,7,2], limit = 5", output: "4", explanation: "The window [2,4,7,2] stays within a spread of 5." }
    ],
    functionName: "longestContinuousLimitedSubarray",
    id: "external-longest-continuous-limited-subarray",
    prompt: "Return the longest contiguous subarray length whose maximum and minimum differ by at most limit.",
    rating: 1672,
    source: { dislikes: 229, likes: 4533, slug: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit" },
    solver: (args) => longestContinuousLimitedSubarray(args[0] as number[], args[1] as number),
    starterArgs: "nums, limit",
    title: "Longest Limited-Difference Subarray",
    topics: ["Sliding Window", "Heap", "Queues"]
  },
  {
    cases: makeCases([[[[5, 10], [6, 8], [1, 5], [2, 3], [1, 10]]], [[[1, 3], [5, 6], [8, 10], [11, 13]]], [[[1, 2], [2, 3], [3, 4]]], [[[1, 10]]], [[[1, 4], [2, 5], [7, 9]]], [[[3, 6], [1, 2], [2, 4], [8, 9]]], [[[1, 100], [2, 3], [4, 5], [6, 7]]], [[[10, 20], [1, 5], [6, 9], [9, 11]]], [[[1, 1], [1, 1], [2, 2]]], [[[4, 6], [6, 8], [8, 10], [1, 3]]]], "groups overlapping intervals"),
    constraints: ["Intervals are closed and inclusive.", "Intervals in the same group must not overlap.", "Return the minimum number of groups needed."],
    difficulty: 3,
    examples: [
      { input: "intervals = [[5,10],[6,8],[1,5],[2,3],[1,10]]", output: "3", explanation: "At most three closed intervals overlap at the same time." },
      { input: "intervals = [[1,3],[5,6],[8,10],[11,13]]", output: "1", explanation: "No intervals overlap, so one group can hold them all." }
    ],
    functionName: "minIntervalGroups",
    id: "external-divide-intervals-groups",
    prompt: "Return the fewest groups needed so no two intervals in a group overlap.",
    rating: 1713,
    source: { dislikes: 43, likes: 1469, slug: "divide-intervals-into-minimum-number-of-groups" },
    solver: (args) => minIntervalGroups(args[0] as Array<[number, number]>),
    starterArgs: "intervals",
    title: "Minimum Interval Groups",
    topics: ["Heap", "Intervals", "Sorting"]
  },
  {
    cases: makeCases([[2, [[0, 10], [1, 5], [2, 7], [3, 4]]], [3, [[1, 20], [2, 10], [3, 5], [4, 9], [6, 8]]], [1, [[0, 5], [1, 2], [2, 3]]], [2, [[0, 1], [1, 2], [2, 3], [3, 4]]], [3, [[0, 5], [0, 4], [0, 3]]], [4, [[1, 3], [2, 4], [3, 5], [4, 6], [5, 7]]], [2, [[5, 10], [6, 8], [7, 12]]], [3, [[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]]], [2, [[0, 100], [1, 2], [2, 3], [3, 4]]], [4, [[10, 20], [11, 12], [12, 13], [13, 14], [14, 15]]]], "finds busiest room"),
    constraints: ["Rooms are numbered from 0 to n - 1.", "Use the smallest available room number.", "When all rooms are busy, delay the meeting until the earliest room frees."],
    difficulty: 4,
    examples: [
      { input: "n = 2, meetings = [[0,10],[1,5],[2,7],[3,4]]", output: "0", explanation: "Room 0 hosts the most meetings after delayed assignments are applied." },
      { input: "n = 1, meetings = [[0,5],[1,2],[2,3]]", output: "0", explanation: "Only room 0 exists, so every meeting eventually uses it." }
    ],
    functionName: "mostBookedMeetingRoom",
    id: "external-meeting-rooms-iii",
    prompt: "Simulate room assignment and return the room number that hosts the most meetings.",
    rating: 2093,
    source: { dislikes: 141, likes: 2498, slug: "meeting-rooms-iii" },
    solver: (args) => mostBookedMeetingRoom(args[0] as number, args[1] as Array<[number, number]>),
    starterArgs: "n, meetings",
    title: "Most Booked Meeting Room",
    topics: ["Heap", "Sorting", "Simulation"]
  },
  {
    cases: makeCases([[[5, 2, 6, 3, 9, 1, 7, 3, 8, 4]], [[1, 1, 0, 6]], [[1, 2, 3, 4, 5]], [[1]], [[1, 2]], [[1, 2, 3]], [[1, 2, 3, 4]], [[10, 20, 30, 40, 50, 60]], [[7, 6, 5, 4, 3, 2, 1]], [[3, 1, 4, 1, 5, 9, 2]]], "reverses even node groups"),
    constraints: ["The input is the linked-list values in order.", "Group sizes increase as 1, 2, 3, and so on.", "Reverse only groups whose actual length is even."],
    difficulty: 4,
    examples: [
      { input: "values = [5,2,6,3,9,1,7,3,8,4]", output: "[5,6,2,3,9,1,4,8,3,7]", explanation: "Groups of lengths 2 and 4 are reversed, while odd-length groups keep their order." },
      { input: "values = [1,1,0,6]", output: "[1,0,1,6]", explanation: "The second group has length two, then the last one-node group remains unchanged." }
    ],
    functionName: "reverseEvenLengthGroups",
    id: "external-reverse-even-length-groups",
    prompt: "Given linked-list values, group nodes by increasing group size and reverse each group whose actual length is even.",
    rating: 1685,
    source: { dislikes: 376, likes: 894, slug: "reverse-nodes-in-even-length-groups" },
    solver: (args) => reverseEvenLengthGroups(args[0] as number[]),
    starterArgs: "values",
    title: "Reverse Even-Length Node Groups",
    topics: ["Linked Lists", "Arrays", "Simulation"]
  }
];

const GENERATED_FAMILIES: GeneratedFamily[] = [
  {
    buildCase: (_variant, index) => ({ args: [makeNumberList(2, index)], name: "counts even numbers" }),
    constraints: ["Return a number.", "Input values are integers.", "Do not mutate the original array."],
    count: 1,
    difficulty: 1,
    functionPrefix: "countEvenNumbers",
    prompt: () => "Return how many numbers in nums are even.",
    ratingBase: 1030,
    solver: (args) => (args[0] as number[]).filter((value) => value % 2 === 0).length,
    starterArgs: "nums",
    title: () => "Count Even Numbers",
    topics: ["Arrays", "Counting"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeNumberList(3, index)], name: "finds largest number" }),
    constraints: ["Return a number.", "Input contains at least one value.", "Do not sort the input."],
    count: 1,
    difficulty: 1,
    functionPrefix: "largestNumber",
    prompt: () => "Return the largest number in nums.",
    ratingBase: 1050,
    solver: (args) => Math.max(...(args[0] as number[])),
    starterArgs: "nums",
    title: () => "Largest Number",
    topics: ["Arrays", "Linear Scan"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeNumberList(4, index)], name: "sums odd numbers" }),
    constraints: ["Return a number.", "Ignore even values.", "Negative odd numbers count toward the sum."],
    count: 1,
    difficulty: 1,
    functionPrefix: "sumOddNumbers",
    prompt: () => "Return the sum of all odd numbers in nums.",
    ratingBase: 1070,
    solver: (args) => (args[0] as number[]).filter((value) => Math.abs(value % 2) === 1).reduce((sum, value) => sum + value, 0),
    starterArgs: "nums",
    title: () => "Sum Odd Numbers",
    topics: ["Arrays", "Math"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeString(2, index)], name: "reverses text" }),
    constraints: ["Return a string.", "Preserve casing.", "Spaces and punctuation should stay as characters."],
    count: 1,
    difficulty: 1,
    functionPrefix: "reverseText",
    prompt: () => "Return text with its characters in reverse order.",
    ratingBase: 1080,
    solver: (args) => [...String(args[0])].reverse().join(""),
    starterArgs: "text",
    title: () => "Reverse Text",
    topics: ["Strings", "Two Pointers"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeString(3, index)], name: "removes vowels" }),
    constraints: ["Return a string.", "Vowels are a, e, i, o, u.", "Remove uppercase and lowercase vowels."],
    count: 1,
    difficulty: 1,
    functionPrefix: "removeVowels",
    prompt: () => "Return text after removing every vowel.",
    ratingBase: 1100,
    solver: (args) => String(args[0]).replace(/[aeiou]/gi, ""),
    starterArgs: "text",
    title: () => "Remove Vowels",
    topics: ["Strings", "Filtering"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeNumberList(5, index)], name: "builds running sums" }),
    constraints: ["Return an array.", "Each output value is the sum from index 0 through that index.", "Do not mutate the input."],
    count: 1,
    difficulty: 1,
    functionPrefix: "runningSum",
    prompt: () => "Return an array where each position contains the running sum of nums up to that position.",
    ratingBase: 1110,
    solver: (args) => runningSum(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Running Sum",
    topics: ["Arrays", "Prefix Sum"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeNumberList(6, index)], name: "keeps positive numbers" }),
    constraints: ["Return an array.", "Keep the original order.", "Zero is not positive."],
    count: 1,
    difficulty: 1,
    functionPrefix: "filterPositive",
    prompt: () => "Return a new array containing only the positive numbers from nums.",
    ratingBase: 1130,
    solver: (args) => (args[0] as number[]).filter((value) => value > 0),
    starterArgs: "nums",
    title: () => "Filter Positive Numbers",
    topics: ["Arrays", "Filtering"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeString(4, index)], name: "finds most frequent character" }),
    constraints: ["Return a string.", "When tied, return the character that appears first in text.", "Input contains at least one character."],
    count: 1,
    difficulty: 1,
    functionPrefix: "mostFrequentChar",
    prompt: () => "Return the character that appears most often in text. If there is a tie, return the one that appears first.",
    ratingBase: 1140,
    solver: (args) => mostFrequentChar(String(args[0])),
    starterArgs: "text",
    title: () => "Most Frequent Character",
    topics: ["Hash Map", "Strings"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeNumberList(7, index)], name: "removes duplicate numbers" }),
    constraints: ["Return an array.", "Keep the first occurrence of each number.", "Preserve original order."],
    count: 1,
    difficulty: 1,
    functionPrefix: "uniqueNumbers",
    prompt: () => "Return a new array with duplicate numbers removed, keeping the first occurrence of each value.",
    ratingBase: 1150,
    solver: (args) => uniqueNumbers(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Unique Numbers",
    topics: ["Hash Set", "Arrays"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeString(5, index)], name: "checks balanced vowels" }),
    constraints: ["Return true or false.", "Compare the first half and second half of the string.", "For odd lengths, ignore the middle character."],
    count: 1,
    difficulty: 1,
    functionPrefix: "hasBalancedVowels",
    prompt: () => "Return true if the first half and second half of text contain the same number of vowels.",
    ratingBase: 1170,
    solver: (args) => hasBalancedVowels(String(args[0])),
    starterArgs: "text",
    title: () => "Balanced Vowels",
    topics: ["Strings", "Counting"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeProductList(index)], name: "builds products of other values" }),
    constraints: ["Return an array.", "Do not use division.", "Handle zero values correctly."],
    count: 1,
    difficulty: 2,
    functionPrefix: "productOfOthers",
    prompt: () => "Return an array where each index contains the product of every number in nums except the number at that index.",
    ratingBase: 1450,
    solver: (args) => productOfOthers(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Product Of Other Slots",
    topics: ["Arrays", "Prefix Product"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeBinaryList(index)], name: "finds longest balanced binary span" }),
    constraints: ["The input contains only 0 and 1.", "Return a length.", "The subarray must be contiguous."],
    count: 1,
    difficulty: 2,
    functionPrefix: "longestBalancedBinarySpan",
    prompt: () => "Return the length of the longest contiguous subarray with the same number of 0s and 1s.",
    ratingBase: 1630,
    solver: (args) => longestBalancedBinarySpan(args[0] as number[]),
    starterArgs: "bits",
    title: () => "Balanced Binary Span",
    topics: ["Hash Map", "Arrays", "Prefix Sum"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeTemperatureList(index)], name: "computes warmer-day waits" }),
    constraints: ["Return an array of wait counts.", "Use 0 when no warmer future value exists.", "Input values are integers."],
    count: 1,
    difficulty: 2,
    functionPrefix: "nextWarmerWaits",
    prompt: () => "For each temperature, return how many positions you must wait to see a warmer temperature. Return 0 if none appears later.",
    ratingBase: 1710,
    solver: (args) => nextWarmerWaits(args[0] as number[]),
    starterArgs: "temps",
    title: () => "Next Warmer Waits",
    topics: ["Stacks", "Arrays"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeRotatedSorted(index)], name: "finds rotated minimum" }),
    constraints: ["Values are unique.", "The array was sorted ascending before rotation.", "Return the minimum number."],
    count: 1,
    difficulty: 2,
    functionPrefix: "rotatedMinimum",
    prompt: () => "Return the minimum value in a sorted array that may have been rotated.",
    ratingBase: 1740,
    solver: (args) => Math.min(...(args[0] as number[])),
    starterArgs: "nums",
    title: () => "Rotated Minimum",
    topics: ["Binary Search", "Arrays"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makePeakList(index)], name: "finds any peak index" }),
    constraints: ["Return an index.", "A peak is greater than its immediate neighbors.", "Treat missing neighbors as negative infinity."],
    count: 1,
    difficulty: 2,
    functionPrefix: "findPeakIndex",
    prompt: () => "Return the index of any peak value. A peak is greater than the value immediately before and after it.",
    ratingBase: 1580,
    solver: (args) => findPeakIndex(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Find A Peak",
    topics: ["Binary Search", "Arrays"]
  },
  {
    buildCase: (_variant, index) => makeCoursePlan(index),
    constraints: ["Courses are numbered from 0 to courseCount - 1.", "Each pair is [course, prerequisite].", "Return false when prerequisites contain a cycle."],
    count: 1,
    difficulty: 3,
    functionPrefix: "canFinishPlan",
    prompt: () => "Return true if every course can be completed given prerequisite pairs.",
    ratingBase: 2110,
    solver: (args) => canFinishPlan(Number(args[0]), args[1] as Array<[number, number]>),
    starterArgs: "courseCount, prerequisites",
    title: () => "Course Plan Possible",
    topics: ["Graphs", "Topological Sort"]
  },
  {
    buildCase: (_variant, index) => makeComponentGraph(index),
    constraints: ["Nodes are numbered from 0 to n - 1.", "Edges are undirected.", "Return a number."],
    count: 1,
    difficulty: 3,
    functionPrefix: "connectedGroupCount",
    prompt: () => "Return how many connected groups exist in an undirected graph.",
    ratingBase: 1990,
    solver: (args) => connectedGroupCount(Number(args[0]), args[1] as Array<[number, number]>),
    starterArgs: "n, edges",
    title: () => "Connected Group Count",
    topics: ["Graphs", "DFS"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeGrid(index + 2, index)], name: "measures largest island" }),
    constraints: ["Grid cells are 0 or 1.", "Use four-directional adjacency.", "Do not mutate the original grid."],
    count: 1,
    difficulty: 3,
    functionPrefix: "largestIslandArea",
    prompt: () => "Return the size of the largest island of 1s in the grid.",
    ratingBase: 2030,
    solver: (args) => largestIslandArea(args[0] as number[][]),
    starterArgs: "grid",
    title: () => "Largest Island Area",
    topics: ["Graphs", "DFS", "Grid"]
  },
  {
    buildCase: (_variant, index) => makeWordBreakCase(index),
    constraints: ["Words may be reused.", "Return true or false.", "Dictionary entries are lowercase strings."],
    count: 1,
    difficulty: 3,
    functionPrefix: "canSegmentText",
    prompt: () => "Return true if text can be split into one or more dictionary words.",
    ratingBase: 2190,
    solver: (args) => canSegmentText(String(args[0]), args[1] as string[]),
    starterArgs: "text, dictionary",
    title: () => "Segment Text",
    topics: ["Dynamic Programming", "Strings"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeNonAdjacentRewards(index)], name: "maximizes non-adjacent rewards" }),
    constraints: ["Return a number.", "You may not choose adjacent values.", "Values are non-negative integers."],
    count: 1,
    difficulty: 2,
    explainExample: explainNonAdjacentRewardExample,
    functionPrefix: "maxNonAdjacentReward",
    prompt: () => "Return the largest sum you can collect when you cannot take adjacent numbers.",
    ratingBase: 1810,
    solver: (args) => maxNonAdjacentReward(args[0] as number[]),
    starterArgs: "rewards",
    title: () => "Non Adjacent Reward",
    topics: ["Dynamic Programming", "Arrays"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeDecodeString(index)], name: "counts message decodings" }),
    constraints: ["Digits map 1 through 26 to letters.", "0 cannot stand alone.", "Return a number."],
    count: 1,
    difficulty: 3,
    functionPrefix: "decodeMessageCount",
    prompt: () => "Return how many ways the digit string can be decoded when 1 maps to A and 26 maps to Z.",
    ratingBase: 2170,
    solver: (args) => decodeMessageCount(String(args[0])),
    starterArgs: "digits",
    title: () => "Decode Message Count",
    topics: ["Dynamic Programming", "Strings"]
  },
  {
    buildCase: (_variant, index) => makeMeetingCase(index),
    constraints: ["Each interval is [start, end].", "End time is exclusive.", "Return the minimum number of rooms."],
    count: 1,
    difficulty: 3,
    functionPrefix: "minimumRoomsNeeded",
    prompt: () => "Return the minimum number of rooms required to host all intervals.",
    ratingBase: 2070,
    solver: (args) => minimumRoomsNeeded(args[0] as number[][]),
    starterArgs: "intervals",
    title: () => "Minimum Rooms Needed",
    topics: ["Heap", "Intervals", "Sorting"]
  },
  {
    buildCase: (_variant, index) => makeOverlapCase(index),
    constraints: ["Each interval is [start, end].", "Touching intervals do not overlap.", "Return a number."],
    count: 1,
    difficulty: 3,
    functionPrefix: "removeOverlapCount",
    prompt: () => "Return the minimum number of intervals to remove so the remaining intervals do not overlap.",
    ratingBase: 1930,
    solver: (args) => removeOverlapCount(args[0] as number[][]),
    starterArgs: "intervals",
    title: () => "Remove Overlaps",
    topics: ["Intervals", "Greedy"]
  },
  {
    buildCase: (_variant, index) => ({ args: [index + 5], name: "counts set bits up to n" }),
    constraints: ["Return an array of length n + 1.", "The value at index i is the count of 1 bits in i.", "n is non-negative."],
    count: 1,
    difficulty: 1,
    functionPrefix: "bitCountsUpTo",
    prompt: () => "Return an array where result[i] is the number of 1 bits in the binary form of i for every value from 0 through n.",
    ratingBase: 1330,
    solver: (args) => bitCountsUpTo(Number(args[0])),
    starterArgs: "n",
    title: () => "Bit Counts Up To N",
    topics: ["Bit Manipulation", "Dynamic Programming"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeSingleNumberList(index)], name: "finds lone unpaired value" }),
    constraints: ["Every number appears exactly twice except one.", "Return the unpaired number.", "Use any correct approach."],
    count: 1,
    difficulty: 1,
    functionPrefix: "loneUnpairedNumber",
    prompt: () => "Return the one number that does not have a duplicate pair.",
    ratingBase: 1350,
    solver: (args) => loneUnpairedNumber(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Lone Unpaired Number",
    topics: ["Bit Manipulation", "Arrays"]
  },
  {
    buildCase: (_variant, index) => makePrefixCase(index),
    constraints: ["Return a number.", "Prefix comparison is case-sensitive.", "Words are strings."],
    count: 1,
    difficulty: 2,
    functionPrefix: "prefixMatchCount",
    prompt: () => "Return how many words start with the given prefix.",
    ratingBase: 1510,
    solver: (args) => prefixMatchCount(args[0] as string[], String(args[1])),
    starterArgs: "words, prefix",
    title: () => "Prefix Match Count",
    topics: ["Tries", "Strings"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeSmallUniqueList(index)], name: "creates all subsets" }),
    constraints: ["Return an array of arrays.", "Input values are unique.", "Order subsets by length, then lexicographically."],
    count: 1,
    difficulty: 3,
    functionPrefix: "orderedSubsets",
    prompt: () => "Return every subset of nums, sorted by subset length and then lexicographically.",
    ratingBase: 2250,
    solver: (args) => orderedSubsets(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Ordered Subsets",
    topics: ["Backtracking", "Arrays"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeTree(index)], name: "checks tree height balance" }),
    constraints: ["A null tree is balanced.", "Each node has val, left, and right.", "Return true or false."],
    count: 1,
    difficulty: 2,
    functionPrefix: "isHeightBalanced",
    prompt: () => "Return true if every node's left and right subtree heights differ by at most one.",
    ratingBase: 1660,
    solver: (args) => isHeightBalanced(args[0] as TreeNode | null),
    starterArgs: "root",
    title: () => "Height Balanced Tree",
    topics: ["Trees", "DFS"]
  },
  {
    buildCase: (_variant, index) => ({ args: [makeTree(index + 3)], name: "reads visible right side" }),
    constraints: ["Return an array of node values.", "Look at the tree one level at a time.", "Use the rightmost node on each level."],
    count: 1,
    difficulty: 2,
    functionPrefix: "rightSideValues",
    prompt: () => "Return the values visible when looking at the binary tree from the right side.",
    ratingBase: 1690,
    solver: (args) => rightSideValues(args[0] as TreeNode | null),
    starterArgs: "root",
    title: () => "Right Side Values",
    topics: ["Trees", "BFS"]
  },
  {
    buildCase: (_variant, index) => makeKthCase(index),
    constraints: ["Return a number.", "k is 1-based.", "Duplicates count as separate values."],
    count: 1,
    difficulty: 3,
    functionPrefix: "kthLargestScore",
    prompt: () => "Return the kth largest score from the list.",
    ratingBase: 1890,
    solver: (args) => kthLargestScore(args[0] as number[], Number(args[1])),
    starterArgs: "scores, k",
    title: () => "Kth Largest Score",
    topics: ["Heap", "Sorting"]
  },
  {
    buildCase: (_variant, index) => makeTargetSumCase(index),
    constraints: ["Each number may receive a plus or minus sign.", "Return the number of sign assignments.", "Input values are non-negative."],
    count: 1,
    difficulty: 4,
    functionPrefix: "targetExpressionCount",
    prompt: () => "Return how many ways to place plus or minus signs before each number so the expression equals target.",
    ratingBase: 2440,
    solver: (args) => targetExpressionCount(args[0] as number[], Number(args[1])),
    starterArgs: "nums, target",
    title: () => "Target Expression Count",
    topics: ["Dynamic Programming", "Backtracking"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 1, index)], name: "sums numbers above threshold" }),
    constraints: ["Return a number.", "Ignore negative values.", "Only include values greater than the threshold."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 1,
    functionPrefix: "sumAbove",
    prompt: (variant) => `Return the sum of all numbers in nums that are greater than ${variant}.`,
    ratingBase: 1090,
    solver: (args, variant) => (args[0] as number[]).filter((value) => value > variant).reduce((sum, value) => sum + value, 0),
    starterArgs: "nums",
    title: () => "Sum Above Threshold",
    topics: ["Arrays", "Math"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeString(variant, index)], name: "counts vowels" }),
    constraints: ["Vowels are a, e, i, o, u.", "Treat uppercase and lowercase as vowels.", "Return a number."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 1,
    functionPrefix: "countVowels",
    prompt: () => "Return the number of vowels in text.",
    ratingBase: 1160,
    solver: (args) => countVowels(String(args[0])),
    starterArgs: "text",
    title: () => "Count Vowels",
    topics: ["Strings", "Counting"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 2, index)], name: "finds first over threshold" }),
    constraints: ["Return -1 if no value qualifies.", "Scan from left to right.", "Do not sort the input."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 2,
    functionPrefix: "firstGreaterThan",
    prompt: (variant) => `Return the first number in nums that is greater than ${variant}. Return -1 if none exists.`,
    ratingBase: 1320,
    solver: (args, variant) => (args[0] as number[]).find((value) => value > variant) ?? -1,
    starterArgs: "nums",
    title: () => "First Greater Than Threshold",
    topics: ["Arrays", "Linear Scan"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 3, index)], name: "counts divisible sum pairs" }),
    constraints: ["Count index pairs i < j.", "Return a number.", "Modulo arithmetic is allowed."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 2,
    functionPrefix: "countModuloPairs",
    prompt: (variant) => `Return the number of index pairs whose sum is divisible by ${variant + 2}.`,
    ratingBase: 1480,
    solver: (args, variant) => countModuloPairs(args[0] as number[], variant + 2),
    starterArgs: "nums",
    title: () => "Modulo Pair Count",
    topics: ["Hash Map", "Arrays"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeString(variant + 1, index)], name: "compresses text" }),
    constraints: ["Compress consecutive equal characters.", "Use the character followed by its count.", "Return a string."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 2,
    functionPrefix: "runLengthEncode",
    prompt: () => "Return a run-length encoded string where each group is the character followed by the group count.",
    ratingBase: 1540,
    solver: (args) => runLengthEncode(String(args[0])),
    starterArgs: "text",
    title: () => "Run Length Encode",
    topics: ["Two Pointers", "Strings"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 4, index), variant + 5], name: "finds longest bounded window" }),
    constraints: ["Numbers are non-negative.", "Return a window length.", "Use any correct approach."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 3,
    functionPrefix: "longestSumAtMost",
    prompt: () => "Return the length of the longest contiguous subarray whose sum is at most limit.",
    ratingBase: 1780,
    solver: (args, variant) => longestSumAtMost(args[0] as number[], variant + 5),
    starterArgs: "nums, limit",
    title: () => "Longest Sum At Most Limit",
    topics: ["Sliding Window", "Arrays"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 5, index)], name: "finds maximum sorted gap" }),
    constraints: ["Sort a copy of the input.", "Return 0 for fewer than two numbers.", "Return the largest adjacent sorted difference."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 3,
    functionPrefix: "maxSortedGap",
    prompt: () => "Return the largest adjacent sorted gap after sorting nums ascending.",
    ratingBase: 1940,
    solver: (args) => maxSortedGap(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Max Sorted Gap",
    topics: ["Sorting", "Arrays"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeGrid(variant, index)], name: "counts islands" }),
    constraints: ["Grid cells are 0 or 1.", "Use four-directional adjacency.", "Do not mutate the original grid."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 3,
    functionPrefix: "countIslands",
    prompt: () => "Return the number of islands of 1s in grid using four-directional adjacency.",
    ratingBase: 2120,
    solver: (args) => countIslands(args[0] as number[][]),
    starterArgs: "grid",
    title: () => "Island Count",
    topics: ["Graphs", "DFS", "Grid"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 6, index)], name: "finds longest increasing subsequence" }),
    constraints: ["Return a length.", "Subsequence does not need to be contiguous.", "Use strict increasing order."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 4,
    functionPrefix: "lisLength",
    prompt: () => "Return the length of the longest strictly increasing subsequence.",
    ratingBase: 2380,
    solver: (args) => lisLength(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Increasing Subsequence",
    topics: ["Dynamic Programming", "Arrays"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeWeightedEdges(variant, index), "A", "E"], name: "finds cheapest path" }),
    constraints: ["Edges are [from, to, cost].", "Return -1 when target is unreachable.", "Costs are positive integers."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 4,
    functionPrefix: "cheapestPath",
    prompt: () => "Return the cheapest path cost from start to target in a directed weighted graph.",
    ratingBase: 2620,
    solver: (args) => cheapestPath(args[0] as Array<[string, string, number]>, String(args[1]), String(args[2])),
    starterArgs: "edges, start, target",
    title: () => "Cheapest Path",
    topics: ["Graphs", "Dijkstra"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeString(variant + 2, index), makeString(variant + 3, index + 1)], name: "computes edit distance" }),
    constraints: ["Insert, delete, and replace each cost 1.", "Return a number.", "Strings are short lowercase words."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 4,
    functionPrefix: "editDistance",
    prompt: () => "Return the minimum edit distance between wordA and wordB.",
    ratingBase: 2780,
    solver: (args) => editDistance(String(args[0]), String(args[1])),
    starterArgs: "wordA, wordB",
    title: () => "Edit Distance",
    topics: ["Dynamic Programming", "Strings"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 7, index), variant + 3], name: "splits array by largest sum" }),
    constraints: ["Preserve original order.", "Create at most k non-empty groups.", "Minimize the largest group sum."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 5,
    functionPrefix: "splitArrayLargestSum",
    prompt: () => "Split nums into at most k contiguous groups and return the minimized largest group sum.",
    ratingBase: 3100,
    solver: (args) => splitArrayLargestSum(args[0] as number[], Number(args[1])),
    starterArgs: "nums, k",
    title: () => "Split Array Largest Sum",
    topics: ["Binary Search", "Dynamic Programming"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 8, index)], name: "checks equal partition" }),
    constraints: ["Return true or false.", "Each number may be used once.", "The two groups must have equal sum."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 5,
    functionPrefix: "canPartitionEqual",
    prompt: () => "Return true if nums can be partitioned into two groups with equal sum.",
    ratingBase: 3300,
    solver: (args) => canPartitionEqual(args[0] as number[]),
    starterArgs: "nums",
    title: () => "Equal Partition",
    topics: ["Dynamic Programming", "Knapsack"]
  }
];

const externalRatedQuestions = EXTERNAL_RATED_QUESTION_SEEDS.map(createExternalRatedQuestion);
const generatedQuestions = createGeneratedQuestions();

export const questions: Question[] = [...curatedQuestions, ...externalRatedQuestions, ...generatedQuestions];

function createExternalRatedQuestion(seed: ExternalRatedQuestionSeed): Question {
  return {
    id: seed.id,
    title: seed.title,
    difficulty: seed.difficulty,
    rating: seed.rating,
    topics: seed.topics,
    functionName: seed.functionName,
    prompt: seed.prompt,
    constraints: seed.constraints,
    starter: `function ${seed.functionName}(${seed.starterArgs}) {\n  \n}`,
    examples: seed.examples,
    tests: seed.cases.map((test) => ({
      ...test,
      expected: seed.solver(test.args)
    }))
  };
}

function createGeneratedQuestion(family: GeneratedFamily, variant: number): Question {
  const tests = Array.from({ length: GENERATED_TEST_COUNT }, (_, index) => createGeneratedTest(family, variant, index));
  const functionName = getGeneratedFunctionName(family, variant);
  return {
    constraints: family.constraints,
    difficulty: family.difficulty,
    examples: [
      createGeneratedExample(family, variant, tests[0]),
      createGeneratedExample(family, variant, tests[1])
    ],
    functionName,
    id: family.count === 1 ? `generated-${family.functionPrefix}` : `generated-${family.functionPrefix}-${variant}`,
    prompt: family.prompt(variant),
    rating: family.ratingBase + variant * RATING_STEP,
    starter: `function ${functionName}(${family.starterArgs}) {\n  \n}`,
    tests,
    title: family.title(variant),
    topics: family.topics
  };
}

function getGeneratedFunctionName(family: GeneratedFamily, variant: number) {
  return family.count === 1 ? family.functionPrefix : `${family.functionPrefix}${variant}`;
}

function createGeneratedQuestions() {
  const maxCount = Math.max(...GENERATED_FAMILIES.map((family) => family.count));
  return Array.from({ length: maxCount }, (_row, index) => index + 1)
    .flatMap((variant) => GENERATED_FAMILIES.filter((family) => variant <= family.count).map((family) => createGeneratedQuestion(family, variant)));
}

function createGeneratedTest(family: GeneratedFamily, variant: number, index: number) {
  const test = family.buildCase(variant, index);
  return { ...test, expected: family.solver(test.args, variant) };
}

function createGeneratedExample(family: GeneratedFamily, variant: number, test: TestInput & { expected: unknown }) {
  const expected = JSON.stringify(test.expected);
  return {
    input: formatArgs(test.args),
    output: expected,
    explanation: family.explainExample?.(test, variant) || explainGeneratedExample(family.functionPrefix, test, variant)
  };
}

function explainGeneratedExample(functionPrefix: string, test: TestInput & { expected: unknown }, variant: number) {
  switch (functionPrefix) {
    case "countEvenNumbers": {
      const nums = test.args[0] as number[];
      const evens = nums.filter((value) => value % 2 === 0);
      return `The even values are ${formatValueList(evens)}, so there are ${formatValue(test.expected)} of them.`;
    }
    case "largestNumber": {
      const nums = test.args[0] as number[];
      const index = nums.indexOf(test.expected as number);
      return `Scanning left to right, the largest value is ${formatValue(test.expected)} at index ${index}.`;
    }
    case "sumOddNumbers": {
      const nums = test.args[0] as number[];
      const odds = nums.filter((value) => Math.abs(value % 2) === 1);
      return `The odd values are ${formatValueList(odds)}, and ${formatSumExpression(odds)} = ${formatValue(test.expected)}.`;
    }
    case "reverseText": {
      return `Reading ${formatValue(test.args[0])} from right to left gives ${formatValue(test.expected)}.`;
    }
    case "removeVowels": {
      const text = String(test.args[0]);
      const removed = [...text].filter((char) => /[aeiou]/i.test(char));
      return `Removing the vowels ${formatValueList(removed)} from ${formatValue(text)} leaves ${formatValue(test.expected)}.`;
    }
    case "runningSum": {
      const nums = test.args[0] as number[];
      const running = runningSum(nums);
      return `The prefix totals are ${running.map((value, index) => `${formatSumExpression(nums.slice(0, index + 1))} = ${value}`).join("; ")}.`;
    }
    case "filterPositive": {
      const nums = test.args[0] as number[];
      const positives = nums.filter((value) => value > 0);
      return `Only ${formatValueList(positives)} are greater than 0, so the filtered array is ${formatValue(test.expected)}.`;
    }
    case "mostFrequentChar": {
      const counts = countLetters(String(test.args[0]));
      const best = String(test.expected);
      return `${formatValue(best)} appears ${counts.get(best)} time(s), more than any earlier competing character.`;
    }
    case "uniqueNumbers": {
      const nums = test.args[0] as number[];
      const keptIndexes = getFirstOccurrenceIndexes(nums);
      return `Keep the first occurrences at indices ${keptIndexes.join(", ")}; those values form ${formatValue(test.expected)}.`;
    }
    case "hasBalancedVowels": {
      const text = String(test.args[0]);
      const midpoint = Math.floor(text.length / 2);
      const left = text.slice(0, midpoint);
      const right = text.slice(text.length - midpoint);
      return `The compared halves are ${formatValue(left)} and ${formatValue(right)}; the left has ${countVowels(left)} vowel(s) and the right has ${countVowels(right)}, so the comparison is ${formatValue(test.expected)}.`;
    }
    case "productOfOthers": {
      const nums = test.args[0] as number[];
      const details = nums.map((_value, index) => `index ${index}: ${formatProductExpression(nums.filter((_item, innerIndex) => innerIndex !== index))}`).join("; ");
      return `Multiply every other slot for each position: ${details}, giving ${formatValue(test.expected)}.`;
    }
    case "longestBalancedBinarySpan": {
      const span = getLongestBalancedBinarySpan(test.args[0] as number[]);
      return `The longest balanced span is indices ${span.start}-${span.end}: ${formatValue(span.values)}, with ${span.zeros} zero(s) and ${span.ones} one(s).`;
    }
    case "nextWarmerWaits": {
      const temps = test.args[0] as number[];
      const waits = test.expected as number[];
      const detail = waits.findIndex((value) => value > 0);
      if (detail >= 0) {
        return `At index ${detail}, ${temps[detail]} waits ${waits[detail]} day(s) until ${temps[detail + waits[detail]]}; applying that check to each index gives ${formatValue(test.expected)}.`;
      }
      return `No later temperature is warmer for any index, so every wait is 0.`;
    }
    case "rotatedMinimum": {
      const nums = test.args[0] as number[];
      return `The rotation wraps before index ${nums.indexOf(test.expected as number)}, where the smallest value is ${formatValue(test.expected)}.`;
    }
    case "findPeakIndex": {
      const nums = test.args[0] as number[];
      const index = Number(test.expected);
      return `Index ${index} is a peak because ${nums[index]} is greater than ${formatValue(nums[index - 1] ?? null)} on the left and ${formatValue(nums[index + 1] ?? null)} on the right.`;
    }
    case "canFinishPlan": {
      const courseCount = Number(test.args[0]);
      const order = getCourseCompletionOrder(courseCount, test.args[1] as Array<[number, number]>);
      return order.length === courseCount
        ? `Courses can be taken in order ${formatValue(order)}, so all ${courseCount} courses are reachable.`
        : `Only courses ${formatValue(order)} can be cleared before a cycle blocks the remaining prerequisites.`;
    }
    case "connectedGroupCount": {
      const groups = getConnectedGroups(Number(test.args[0]), test.args[1] as Array<[number, number]>);
      return `The connected groups are ${groups.map((group) => formatValue(group)).join(", ")}, so there are ${groups.length}.`;
    }
    case "largestIslandArea": {
      const island = getLargestIslandCells(test.args[0] as number[][]);
      return `The largest four-direction island contains cells ${formatGridCells(island)}, so its area is ${island.length}.`;
    }
    case "canSegmentText": {
      const segments = getWordSegments(String(test.args[0]), test.args[1] as string[]);
      return segments ? `${formatValue(test.args[0])} can be split as ${segments.map(formatValue).join(" + ")}.` : `${formatValue(test.args[0])} cannot be fully covered by the dictionary words.`;
    }
    case "decodeMessageCount": {
      const decodings = getShortDecodeExamples(String(test.args[0]));
      return `The valid decodings are ${formatValueList(decodings)}, so there are ${formatValue(test.expected)} way(s).`;
    }
    case "minimumRoomsNeeded": {
      const peak = getMeetingRoomPeak(test.args[0] as number[][]);
      return `The maximum overlap is ${peak.active} interval(s) at time ${peak.time}, so ${peak.active} room(s) are needed.`;
    }
    case "removeOverlapCount": {
      const result = getOverlapRemovalPlan(test.args[0] as number[][]);
      return `Keeping non-overlapping intervals ${formatValue(result.kept)} removes ${result.removed.length} interval(s): ${formatValue(result.removed)}.`;
    }
    case "bitCountsUpTo": {
      const n = Number(test.args[0]);
      return `Counting 1 bits from 0 through ${n} gives ${Array.from({ length: n + 1 }, (_value, index) => `${index}(${index.toString(2)})=${(test.expected as number[])[index]}`).join(", ")}.`;
    }
    case "loneUnpairedNumber": {
      return `Every duplicate cancels out except ${formatValue(test.expected)}, which appears once.`;
    }
    case "prefixMatchCount": {
      const [words, prefix] = test.args as [string[], string];
      const matches = words.filter((word) => word.startsWith(prefix));
      return `The words starting with ${formatValue(prefix)} are ${formatValueList(matches)}, so the count is ${matches.length}.`;
    }
    case "orderedSubsets": {
      const nums = test.args[0] as number[];
      return `${nums.length} unique values create 2^${nums.length} = ${(test.expected as unknown[]).length} subsets, sorted by size and value.`;
    }
    case "isHeightBalanced": {
      const root = test.args[0] as TreeNode | null;
      const issue = findUnbalancedNode(root);
      return issue ? `Node ${issue.val} has left height ${issue.leftHeight} and right height ${issue.rightHeight}, so the tree is not balanced.` : `Every node's left and right subtree heights differ by at most 1, so the tree is balanced.`;
    }
    case "rightSideValues": {
      const levels = getTreeLevels(test.args[0] as TreeNode | null);
      return `The rightmost values by level are ${levels.map((level) => level[level.length - 1]).join(", ")}, giving ${formatValue(test.expected)}.`;
    }
    case "kthLargestScore": {
      const [scores, k] = test.args as [number[], number];
      const sorted = [...scores].sort((left, right) => right - left);
      return `Sorted descending, the scores are ${formatValue(sorted)}; the #${k} score is ${formatValue(test.expected)}.`;
    }
    case "targetExpressionCount": {
      const [nums, target] = test.args as [number[], number];
      const expressions = getTargetExpressions(nums, target);
      return `The expressions that reach ${target} are ${formatValueList(expressions)}, so there are ${expressions.length}.`;
    }
    case "sumAbove": {
      const nums = test.args[0] as number[];
      const values = nums.filter((value) => value > variant);
      return `Values greater than ${variant} are ${formatValueList(values)}, and ${formatSumExpression(values)} = ${formatValue(test.expected)}.`;
    }
    case "countVowels": {
      const vowels = [...String(test.args[0])].filter((char) => /[aeiou]/i.test(char));
      return `The vowels in ${formatValue(test.args[0])} are ${formatValueList(vowels)}, so the count is ${formatValue(test.expected)}.`;
    }
    case "firstGreaterThan": {
      const nums = test.args[0] as number[];
      const index = nums.findIndex((value) => value > variant);
      return index >= 0 ? `The first value greater than ${variant} is ${nums[index]} at index ${index}.` : `No value is greater than ${variant}, so return -1.`;
    }
    case "countModuloPairs": {
      const divisor = variant + 2;
      const pairs = getModuloPairs(test.args[0] as number[], divisor);
      return `The pairs whose sum is divisible by ${divisor} are ${formatValueList(pairs)}, so the count is ${pairs.length}.`;
    }
    case "runLengthEncode": {
      return `The consecutive groups are ${formatValueList(getRunLengthGroups(String(test.args[0])))}, which encode to ${formatValue(test.expected)}.`;
    }
    case "longestSumAtMost": {
      const [nums, limit] = test.args as [number[], number];
      const window = getLongestSumAtMostWindow(nums, limit);
      return `The best window is indices ${window.start}-${window.end}: ${formatValue(window.values)}, whose non-negative sum is ${window.sum} <= ${limit}.`;
    }
    case "maxSortedGap": {
      const sorted = [...(test.args[0] as number[])].sort((left, right) => left - right);
      const gap = getMaxSortedGapPair(sorted);
      return `After sorting to ${formatValue(sorted)}, the largest adjacent gap is ${gap.right} - ${gap.left} = ${gap.gap}.`;
    }
    case "countIslands": {
      const islands = getAllIslandCells(test.args[0] as number[][]);
      return `The four-direction islands are ${islands.map(formatGridCells).join("; ")}, so the count is ${islands.length}.`;
    }
    case "lisLength": {
      const sequence = getLisSequence(test.args[0] as number[]);
      return `One longest increasing subsequence is ${formatValue(sequence)}, with length ${sequence.length}.`;
    }
    case "cheapestPath": {
      const [edges, start, target] = test.args as [Array<[string, string, number]>, string, string];
      const path = getCheapestPathDetails(edges, start, target);
      return path ? `The cheapest route is ${path.nodes.join(" -> ")} with edge costs ${path.costs.join(" + ")} = ${path.total}.` : `${start} cannot reach ${target}, so return -1.`;
    }
    case "editDistance": {
      const operations = getEditOperations(String(test.args[0]), String(test.args[1]));
      return operations.length ? `A minimum edit script is ${operations.join("; ")}, for ${operations.length} operation(s).` : `The two words already match, so no edits are needed.`;
    }
    case "splitArrayLargestSum": {
      const [nums, k] = test.args as [number[], number];
      const groups = getSplitGroups(nums, Number(test.expected));
      return `Using max group sum ${formatValue(test.expected)} gives groups ${formatValue(groups)}, which fits within k = ${k}.`;
    }
    case "canPartitionEqual": {
      const nums = test.args[0] as number[];
      const subset = getEqualPartitionSubset(nums);
      return subset ? `The positive total can split evenly; one side can use ${formatValue(subset)} for sum ${formatSum(subset)}.` : `The positive total is ${formatSum(nums.map((value) => Math.max(0, value)))}, which cannot be split into two equal reachable sums.`;
    }
    default:
      throw new Error(`Missing specific generated example explanation for ${functionPrefix}.`);
  }
}

function explainNonAdjacentRewardExample(test: TestInput & { expected: unknown }) {
  const rewards = test.args[0] as number[];
  const pickedIndexes = getMaxNonAdjacentRewardIndexes(rewards);
  const pickedValues = pickedIndexes.map((index) => rewards[index]);
  const sumExpression = pickedValues.join(" + ");
  const indexList = pickedIndexes.map((index) => String(index)).join(", ");
  const valueList = pickedValues.join(", ");
  return `Choose indices ${indexList}, which have rewards ${valueList}. They are not adjacent, and ${sumExpression} = ${JSON.stringify(test.expected)}.`;
}

function getMaxNonAdjacentRewardIndexes(rewards: number[]) {
  const bestFrom = Array.from({ length: rewards.length + 2 }, () => 0);
  for (let index = rewards.length - 1; index >= 0; index -= 1) {
    bestFrom[index] = Math.max(bestFrom[index + 1], rewards[index] + bestFrom[index + 2]);
  }

  const pickedIndexes: number[] = [];
  for (let index = 0; index < rewards.length;) {
    if (rewards[index] + bestFrom[index + 2] >= bestFrom[index + 1] && rewards[index] > 0) {
      pickedIndexes.push(index);
      index += 2;
    } else {
      index += 1;
    }
  }
  return pickedIndexes;
}

function formatValue(value: unknown) {
  return JSON.stringify(value);
}

function formatValueList(values: unknown[]) {
  return values.length ? values.map(formatValue).join(", ") : "none";
}

function formatSum(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}

function formatSumExpression(values: number[]) {
  return values.length ? values.map(String).join(" + ").replace(/\+ -/g, "- ") : "0";
}

function formatProductExpression(values: number[]) {
  return `${values.join(" * ") || "1"} = ${values.reduce((product, value) => product * value, 1)}`;
}

function getFirstOccurrenceIndexes(nums: number[]) {
  const seen = new Set<number>();
  const indexes: number[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    if (!seen.has(nums[index])) {
      seen.add(nums[index]);
      indexes.push(index);
    }
  }
  return indexes;
}

function getLongestBalancedBinarySpan(bits: number[]) {
  const firstSeen = new Map([[0, -1]]);
  let balance = 0;
  let bestStart = 0;
  let bestEnd = -1;
  for (let index = 0; index < bits.length; index += 1) {
    balance += bits[index] === 1 ? 1 : -1;
    if (firstSeen.has(balance)) {
      const start = (firstSeen.get(balance) ?? index) + 1;
      if (index - start > bestEnd - bestStart) {
        bestStart = start;
        bestEnd = index;
      }
    } else {
      firstSeen.set(balance, index);
    }
  }
  const values = bestEnd >= bestStart ? bits.slice(bestStart, bestEnd + 1) : [];
  return {
    end: bestEnd,
    ones: values.filter((value) => value === 1).length,
    start: bestStart,
    values,
    zeros: values.filter((value) => value === 0).length
  };
}

function getCourseCompletionOrder(courseCount: number, prerequisites: Array<[number, number]>) {
  const graph = Array.from({ length: courseCount }, () => [] as number[]);
  const indegree = Array.from({ length: courseCount }, () => 0);
  for (const [course, prerequisite] of prerequisites) {
    graph[prerequisite].push(course);
    indegree[course] += 1;
  }
  const queue = indegree.flatMap((count, course) => count === 0 ? [course] : []);
  const order: number[] = [];
  while (queue.length) {
    const course = queue.shift() ?? 0;
    order.push(course);
    for (const next of graph[course]) {
      indegree[next] -= 1;
      if (indegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  return order;
}

function getConnectedGroups(n: number, edges: Array<[number, number]>) {
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [left, right] of edges) {
    graph[left].push(right);
    graph[right].push(left);
  }
  const seen = new Set<number>();
  const groups: number[][] = [];
  for (let node = 0; node < n; node += 1) {
    if (seen.has(node)) {
      continue;
    }
    const group: number[] = [];
    const stack = [node];
    seen.add(node);
    while (stack.length) {
      const current = stack.pop() as number;
      group.push(current);
      for (const next of graph[current]) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
    groups.push(group.sort((left, right) => left - right));
  }
  return groups;
}

function getLargestIslandCells(grid: number[][]) {
  return getAllIslandCells(grid).sort((left, right) => right.length - left.length)[0] || [];
}

function getAllIslandCells(grid: number[][]) {
  const seen = grid.map((row) => row.map(() => false));
  const islands: Array<Array<[number, number]>> = [];
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      const cells = collectIslandCells(grid, seen, row, column);
      if (cells.length) {
        islands.push(cells);
      }
    }
  }
  return islands;
}

function collectIslandCells(grid: number[][], seen: boolean[][], row: number, column: number): Array<[number, number]> {
  if (!grid[row]?.[column] || seen[row][column]) {
    return [];
  }
  seen[row][column] = true;
  const cells: Array<[number, number]> = [[row, column]];
  cells.push(...collectIslandCells(grid, seen, row + 1, column));
  cells.push(...collectIslandCells(grid, seen, row - 1, column));
  cells.push(...collectIslandCells(grid, seen, row, column + 1));
  cells.push(...collectIslandCells(grid, seen, row, column - 1));
  return cells;
}

function formatGridCells(cells: Array<[number, number]>) {
  return cells.length ? cells.map(([row, column]) => `(${row},${column})`).join(", ") : "none";
}

function getWordSegments(text: string, dictionary: string[]) {
  const words = new Set(dictionary);
  const previous: Array<{ start: number; word: string } | null> = Array(text.length + 1).fill(null);
  previous[0] = { start: -1, word: "" };
  for (let end = 1; end <= text.length; end += 1) {
    for (let start = 0; start < end; start += 1) {
      const word = text.slice(start, end);
      if (previous[start] && words.has(word)) {
        previous[end] = { start, word };
        break;
      }
    }
  }
  if (!previous[text.length]) {
    return null;
  }
  const segments: string[] = [];
  for (let cursor = text.length; cursor > 0;) {
    const item = previous[cursor];
    if (!item) {
      return null;
    }
    segments.unshift(item.word);
    cursor = item.start;
  }
  return segments;
}

function getShortDecodeExamples(digits: string) {
  const examples: string[] = [];
  function walk(index: number, output: string) {
    if (index === digits.length) {
      examples.push(output);
      return;
    }
    const single = Number(digits[index]);
    if (single >= 1) {
      walk(index + 1, `${output}${String.fromCharCode(64 + single)}`);
    }
    const pair = Number(digits.slice(index, index + 2));
    if (index + 1 < digits.length && pair >= 10 && pair <= 26) {
      walk(index + 2, `${output}${String.fromCharCode(64 + pair)}`);
    }
  }
  walk(0, "");
  return examples;
}

function getMeetingRoomPeak(intervals: number[][]) {
  const events = intervals.flatMap(([start, end]) => [[start, 1], [end, -1]]);
  events.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
  let active = 0;
  let best = { active: 0, time: 0 };
  for (const [time, delta] of events) {
    active += delta;
    if (active > best.active) {
      best = { active, time };
    }
  }
  return best;
}

function getOverlapRemovalPlan(intervals: number[][]) {
  const sorted = [...intervals].sort((left, right) => left[1] - right[1]);
  const kept: number[][] = [];
  const removed: number[][] = [];
  let end = -Infinity;
  for (const interval of sorted) {
    if (interval[0] < end) {
      removed.push(interval);
    } else {
      kept.push(interval);
      end = interval[1];
    }
  }
  return { kept, removed };
}

function findUnbalancedNode(root: TreeNode | null | undefined): { leftHeight: number; rightHeight: number; val: number } | null {
  if (!root) {
    return null;
  }
  const left = getTreeHeight(root.left);
  const right = getTreeHeight(root.right);
  if (Math.abs(left - right) > 1) {
    return { leftHeight: left, rightHeight: right, val: root.val };
  }
  return findUnbalancedNode(root.left) || findUnbalancedNode(root.right);
}

function getTreeHeight(root: TreeNode | null | undefined): number {
  if (!root) {
    return 0;
  }
  return Math.max(getTreeHeight(root.left), getTreeHeight(root.right)) + 1;
}

function getTreeLevels(root: TreeNode | null) {
  const levels: number[][] = [];
  let level = root ? [root] : [];
  while (level.length) {
    levels.push(level.map((node) => node.val));
    level = level.flatMap((node) => [node.left, node.right].filter(Boolean) as TreeNode[]);
  }
  return levels;
}

function getTargetExpressions(nums: number[], target: number) {
  const expressions: string[] = [];
  function walk(index: number, sum: number, expression: string) {
    if (index === nums.length) {
      if (sum === target) {
        expressions.push(expression);
      }
      return;
    }
    walk(index + 1, sum + nums[index], `${expression}${expression ? " + " : ""}${nums[index]}`);
    walk(index + 1, sum - nums[index], `${expression}${expression ? " - " : "-"}${nums[index]}`);
  }
  walk(0, 0, "");
  return expressions;
}

function getModuloPairs(nums: number[], divisor: number) {
  const pairs: string[] = [];
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      if ((nums[left] + nums[right]) % divisor === 0) {
        pairs.push(`(${left},${right}) ${nums[left]}+${nums[right]}`);
      }
    }
  }
  return pairs;
}

function getRunLengthGroups(text: string) {
  const groups: string[] = [];
  let count = 1;
  for (let index = 1; index <= text.length; index += 1) {
    if (text[index] === text[index - 1]) {
      count += 1;
    } else if (text[index - 1]) {
      groups.push(`${text[index - 1]} x ${count}`);
      count = 1;
    }
  }
  return groups;
}

function getLongestSumAtMostWindow(nums: number[], limit: number) {
  let left = 0;
  let sum = 0;
  let best = { end: -1, start: 0, sum: 0, values: [] as number[] };
  for (let right = 0; right < nums.length; right += 1) {
    sum += Math.max(0, nums[right]);
    while (sum > limit) {
      sum -= Math.max(0, nums[left]);
      left += 1;
    }
    if (right - left + 1 > best.values.length) {
      best = { end: right, start: left, sum, values: nums.slice(left, right + 1) };
    }
  }
  return best;
}

function getMaxSortedGapPair(sorted: number[]) {
  let best = { gap: 0, left: sorted[0] ?? 0, right: sorted[0] ?? 0 };
  for (let index = 1; index < sorted.length; index += 1) {
    const gap = sorted[index] - sorted[index - 1];
    if (gap > best.gap) {
      best = { gap, left: sorted[index - 1], right: sorted[index] };
    }
  }
  return best;
}

function getLisSequence(nums: number[]) {
  const lengths = Array(nums.length).fill(1);
  const previous = Array(nums.length).fill(-1);
  for (let index = 0; index < nums.length; index += 1) {
    for (let before = 0; before < index; before += 1) {
      if (nums[before] < nums[index] && lengths[before] + 1 > lengths[index]) {
        lengths[index] = lengths[before] + 1;
        previous[index] = before;
      }
    }
  }
  let cursor = lengths.indexOf(Math.max(...lengths));
  const sequence: number[] = [];
  while (cursor >= 0) {
    sequence.unshift(nums[cursor]);
    cursor = previous[cursor];
  }
  return sequence;
}

function getCheapestPathDetails(edges: Array<[string, string, number]>, start: string, target: string) {
  const distances = new Map([[start, 0]]);
  const previous = new Map<string, { cost: number; node: string }>();
  const queue = [start];
  while (queue.length) {
    const node = queue.shift() || "";
    for (const [from, to, cost] of edges) {
      const nextCost = (distances.get(node) || 0) + cost;
      if (from === node && nextCost < (distances.get(to) ?? Infinity)) {
        distances.set(to, nextCost);
        previous.set(to, { cost, node });
        queue.push(to);
      }
    }
  }
  if (!distances.has(target)) {
    return null;
  }
  const nodes = [target];
  const costs: number[] = [];
  for (let cursor = target; cursor !== start;) {
    const item = previous.get(cursor);
    if (!item) {
      break;
    }
    costs.unshift(item.cost);
    nodes.unshift(item.node);
    cursor = item.node;
  }
  return { costs, nodes, total: distances.get(target) ?? 0 };
}

function getEditOperations(left: string, right: string) {
  const dp = Array.from({ length: left.length + 1 }, (_, row) => Array.from({ length: right.length + 1 }, (_value, column) => row + column));
  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      dp[row][column] = Math.min(dp[row - 1][column] + 1, dp[row][column - 1] + 1, dp[row - 1][column - 1] + cost);
    }
  }
  const operations: string[] = [];
  let row = left.length;
  let column = right.length;
  while (row || column) {
    if (row && column && left[row - 1] === right[column - 1]) {
      row -= 1;
      column -= 1;
    } else if (row && column && dp[row][column] === dp[row - 1][column - 1] + 1) {
      operations.unshift(`replace ${formatValue(left[row - 1])} with ${formatValue(right[column - 1])}`);
      row -= 1;
      column -= 1;
    } else if (column && dp[row][column] === dp[row][column - 1] + 1) {
      operations.unshift(`insert ${formatValue(right[column - 1])}`);
      column -= 1;
    } else {
      operations.unshift(`delete ${formatValue(left[row - 1])}`);
      row -= 1;
    }
  }
  return operations;
}

function getSplitGroups(nums: number[], limit: number) {
  const groups: number[][] = [];
  let current: number[] = [];
  let sum = 0;
  for (const value of nums) {
    if (current.length && sum + value > limit) {
      groups.push(current);
      current = [];
      sum = 0;
    }
    current.push(value);
    sum += value;
  }
  if (current.length) {
    groups.push(current);
  }
  return groups;
}

function getEqualPartitionSubset(nums: number[]) {
  const positives = nums.map((value) => Math.max(0, value));
  const total = formatSum(positives);
  if (total % 2) {
    return null;
  }
  const target = total / 2;
  const subsets = new Map<number, number[]>([[0, []]]);
  for (const value of positives) {
    for (const [sum, subset] of [...subsets]) {
      const next = sum + value;
      if (!subsets.has(next)) {
        subsets.set(next, [...subset, value]);
      }
    }
  }
  return subsets.get(target) || null;
}

function sentenceCase(text: string) {
  const trimmed = text.trim().replace(/\.$/, "");
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}.`;
}

function formatArgs(args: unknown[]) {
  return args.map((arg, index) => `arg${index + 1} = ${JSON.stringify(arg)}`).join(", ");
}

function makeNumberList(seed: number, index: number) {
  return Array.from({ length: 6 + (index % 5) }, (_, offset) => ((seed * 7 + index * 3 + offset * 5) % 19) - 6);
}

function makeString(seed: number, index: number) {
  const alphabet = "algorithmpractice";
  return Array.from({ length: 5 + (index % 6) }, (_, offset) => alphabet[(seed + index + offset * 3) % alphabet.length]).join("");
}

function makeProductList(index: number) {
  const base = makeNumberList(8, index).slice(0, 5).map((value) => Math.abs(value % 5));
  return index % 3 === 0 ? base : base.map((value) => value || 1);
}

function makeBinaryList(index: number) {
  return Array.from({ length: 8 + (index % 5) }, (_value, offset) => (index + offset * 2 + Math.floor(offset / 2)) % 2);
}

function makeTemperatureList(index: number) {
  return Array.from({ length: 7 + (index % 4) }, (_value, offset) => 55 + ((index * 3 + offset * offset + offset) % 24));
}

function makeRotatedSorted(index: number) {
  const sorted = Array.from({ length: 6 + (index % 4) }, (_value, offset) => index + offset * 3 + 1);
  const pivot = index % sorted.length;
  return sorted.slice(pivot).concat(sorted.slice(0, pivot));
}

function makePeakList(index: number) {
  const peak = 20 + index;
  return [index, index + 3, peak, index + 2, index + 1, index - 1];
}

function makeCoursePlan(index: number): TestInput {
  const courseCount = 4 + (index % 3);
  const acyclic: Array<[number, number]> = [[1, 0], [2, 1], [3, 1]];
  const cyclic: Array<[number, number]> = [[1, 0], [2, 1], [0, 2]];
  return { args: [courseCount, index % 4 === 0 ? cyclic : acyclic], name: "checks course plan feasibility" };
}

function makeComponentGraph(index: number): TestInput {
  const n = 6 + (index % 3);
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [3, 4]];
  if (index % 2 === 0) {
    edges.push([4, 5]);
  }
  return { args: [n, edges], name: "counts graph components" };
}

function makeWordBreakCase(index: number): TestInput {
  const cases: Array<[string, string[]]> = [
    ["codepath", ["code", "path", "pat", "h"]],
    ["applepenapple", ["apple", "pen"]],
    ["catsandog", ["cats", "dog", "sand", "and", "cat"]],
    ["aaaaaaa", ["aaaa", "aaa"]]
  ];
  const [text, dictionary] = cases[index % cases.length];
  return { args: [text, dictionary], name: "checks word segmentation" };
}

function makeNonAdjacentRewards(index: number) {
  return Array.from({ length: 6 + (index % 5) }, (_value, offset) => Math.abs((index * 5 + offset * 7) % 16));
}

function makeDecodeString(index: number) {
  const cases = ["12", "226", "06", "11106", "2611055971756562", "27", "2101", "101"];
  return cases[index % cases.length];
}

function makeMeetingCase(index: number): TestInput {
  const intervals = [[0, 30], [5, 10], [15, 20], [25, 35 + index % 5], [40, 50]];
  return { args: [index % 2 ? intervals.slice(1) : intervals], name: "computes meeting rooms" };
}

function makeOverlapCase(index: number): TestInput {
  const intervals = [[1, 3], [2, 4], [4, 6], [5, 7], [8, 9 + index % 4]];
  return { args: [index % 2 ? intervals.reverse() : intervals], name: "removes overlapping intervals" };
}

function makeSingleNumberList(index: number) {
  const lone = 20 + index;
  return [4, lone, 7, 4, 9, 7, 9, 3, 3];
}

function makePrefixCase(index: number): TestInput {
  const words = ["stone", "storm", "story", "stack", "graph", "grid", "greedy"];
  const prefixes = ["sto", "gr", "sta", "z"];
  return { args: [words, prefixes[index % prefixes.length]], name: "counts matching prefixes" };
}

function makeSmallUniqueList(index: number) {
  return [index % 4, (index % 4) + 2, (index % 4) + 5];
}

function makeTree(index: number): TreeNode | null {
  if (index % 6 === 0) {
    return null;
  }
  const leftChain = index % 4 === 0 ? { val: index + 4, left: { val: index + 5, left: null, right: null }, right: null } : { val: index + 2, left: null, right: null };
  return {
    val: index + 1,
    left: leftChain,
    right: { val: index + 3, left: index % 3 === 0 ? { val: index + 6, left: null, right: null } : null, right: { val: index + 7, left: null, right: null } }
  };
}

function makeKthCase(index: number): TestInput {
  const scores = makeNumberList(12, index).map((value) => value + 20);
  return { args: [scores, (index % 3) + 1], name: "finds kth largest score" };
}

function makeTargetSumCase(index: number): TestInput {
  const nums = [1, 1, 2 + (index % 3), 3, 1];
  return { args: [nums, index % 2 ? 2 : 4], name: "counts target expressions" };
}

function countVowels(text: string) {
  return [...text.toLowerCase()].filter((char) => "aeiou".includes(char)).length;
}

function productOfOthers(nums: number[]) {
  return nums.map((_value, index) => nums.reduce((product, value, innerIndex) => innerIndex === index ? product : product * value, 1));
}

function longestBalancedBinarySpan(bits: number[]) {
  const firstSeen = new Map([[0, -1]]);
  let balance = 0;
  let best = 0;
  for (let index = 0; index < bits.length; index += 1) {
    balance += bits[index] === 1 ? 1 : -1;
    if (firstSeen.has(balance)) {
      best = Math.max(best, index - (firstSeen.get(balance) ?? index));
    } else {
      firstSeen.set(balance, index);
    }
  }
  return best;
}

function nextWarmerWaits(temps: number[]) {
  return temps.map((temp, index) => {
    const next = temps.findIndex((candidate, nextIndex) => nextIndex > index && candidate > temp);
    return next === -1 ? 0 : next - index;
  });
}

function findPeakIndex(nums: number[]) {
  return nums.findIndex((value, index) => value > (nums[index - 1] ?? -Infinity) && value > (nums[index + 1] ?? -Infinity));
}

function canFinishPlan(courseCount: number, prerequisites: Array<[number, number]>) {
  const graph = Array.from({ length: courseCount }, () => [] as number[]);
  const indegree = Array.from({ length: courseCount }, () => 0);
  for (const [course, prerequisite] of prerequisites) {
    graph[prerequisite].push(course);
    indegree[course] += 1;
  }
  const queue = indegree.flatMap((count, course) => count === 0 ? [course] : []);
  let visited = 0;
  while (queue.length) {
    const course = queue.shift() ?? 0;
    visited += 1;
    for (const next of graph[course]) {
      indegree[next] -= 1;
      if (indegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  return visited === courseCount;
}

function connectedGroupCount(n: number, edges: Array<[number, number]>) {
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [left, right] of edges) {
    graph[left].push(right);
    graph[right].push(left);
  }
  const seen = new Set<number>();
  let groups = 0;
  for (let node = 0; node < n; node += 1) {
    if (!seen.has(node)) {
      groups += 1;
      visitComponent(node, graph, seen);
    }
  }
  return groups;
}

function visitComponent(node: number, graph: number[][], seen: Set<number>) {
  if (seen.has(node)) {
    return;
  }
  seen.add(node);
  for (const next of graph[node]) {
    visitComponent(next, graph, seen);
  }
}

function largestIslandArea(grid: number[][]) {
  const seen = grid.map((row) => row.map(() => false));
  let best = 0;
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      best = Math.max(best, islandArea(grid, seen, row, column));
    }
  }
  return best;
}

function islandArea(grid: number[][], seen: boolean[][], row: number, column: number): number {
  if (!grid[row]?.[column] || seen[row][column]) {
    return 0;
  }
  seen[row][column] = true;
  return 1 + islandArea(grid, seen, row + 1, column) + islandArea(grid, seen, row - 1, column) + islandArea(grid, seen, row, column + 1) + islandArea(grid, seen, row, column - 1);
}

function canSegmentText(text: string, dictionary: string[]) {
  const words = new Set(dictionary);
  const possible = Array.from({ length: text.length + 1 }, () => false);
  possible[0] = true;
  for (let end = 1; end <= text.length; end += 1) {
    for (let start = 0; start < end; start += 1) {
      possible[end] ||= possible[start] && words.has(text.slice(start, end));
    }
  }
  return possible[text.length];
}

function maxNonAdjacentReward(rewards: number[]) {
  let take = 0;
  let skip = 0;
  for (const reward of rewards) {
    [take, skip] = [skip + reward, Math.max(skip, take)];
  }
  return Math.max(take, skip);
}

function decodeMessageCount(digits: string) {
  const ways = Array.from({ length: digits.length + 1 }, () => 0);
  ways[0] = 1;
  for (let index = 1; index <= digits.length; index += 1) {
    if (digits[index - 1] !== "0") {
      ways[index] += ways[index - 1];
    }
    const pair = Number(digits.slice(index - 2, index));
    if (index > 1 && pair >= 10 && pair <= 26) {
      ways[index] += ways[index - 2];
    }
  }
  return ways[digits.length];
}

function minimumRoomsNeeded(intervals: number[][]) {
  const events = intervals.flatMap(([start, end]) => [[start, 1], [end, -1]]);
  events.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
  let active = 0;
  let best = 0;
  for (const [, delta] of events) {
    active += delta;
    best = Math.max(best, active);
  }
  return best;
}

function removeOverlapCount(intervals: number[][]) {
  const sorted = [...intervals].sort((left, right) => left[1] - right[1]);
  let removals = 0;
  let end = -Infinity;
  for (const [start, finish] of sorted) {
    if (start < end) {
      removals += 1;
    } else {
      end = finish;
    }
  }
  return removals;
}

function bitCountsUpTo(n: number) {
  return Array.from({ length: n + 1 }, (_value, index) => index.toString(2).replace(/0/g, "").length);
}

function loneUnpairedNumber(nums: number[]) {
  return nums.reduce((xor, value) => xor ^ value, 0);
}

function prefixMatchCount(words: string[], prefix: string) {
  return words.filter((word) => word.startsWith(prefix)).length;
}

function orderedSubsets(nums: number[]) {
  const subsets = nums.reduce<number[][]>((sets, value) => sets.concat(sets.map((set) => [...set, value])), [[]]);
  return subsets.map((set) => [...set].sort((left, right) => left - right)).sort(compareNumberArrays);
}

function compareNumberArrays(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return left.length - right.length;
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

function isHeightBalanced(root: TreeNode | null) {
  return getBalancedHeight(root) >= 0;
}

function getBalancedHeight(root: TreeNode | null | undefined): number {
  if (!root) {
    return 0;
  }
  const left = getBalancedHeight(root.left);
  const right = getBalancedHeight(root.right);
  if (left < 0 || right < 0 || Math.abs(left - right) > 1) {
    return -1;
  }
  return Math.max(left, right) + 1;
}

function rightSideValues(root: TreeNode | null) {
  const values: number[] = [];
  const queue = root ? [root] : [];
  while (queue.length) {
    const levelSize = queue.length;
    for (let index = 0; index < levelSize; index += 1) {
      const node = queue.shift();
      if (!node) {
        continue;
      }
      if (index === levelSize - 1) {
        values.push(node.val);
      }
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
  }
  return values;
}

function kthLargestScore(scores: number[], k: number) {
  return [...scores].sort((left, right) => right - left)[k - 1];
}

function targetExpressionCount(nums: number[], target: number) {
  let counts = new Map([[0, 1]]);
  for (const num of nums) {
    const next = new Map<number, number>();
    for (const [sum, count] of counts) {
      next.set(sum + num, (next.get(sum + num) || 0) + count);
      next.set(sum - num, (next.get(sum - num) || 0) + count);
    }
    counts = next;
  }
  return counts.get(target) || 0;
}

function runningSum(nums: number[]) {
  let total = 0;
  return nums.map((value) => {
    total += value;
    return total;
  });
}

function mostFrequentChar(text: string) {
  const counts = new Map<string, number>();
  let best = text[0] || "";
  for (const char of text) {
    const count = (counts.get(char) || 0) + 1;
    counts.set(char, count);
    if (count > (counts.get(best) || 0)) {
      best = char;
    }
  }
  return best;
}

function uniqueNumbers(nums: number[]) {
  const seen = new Set<number>();
  return nums.filter((value) => {
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

function hasBalancedVowels(text: string) {
  const midpoint = Math.floor(text.length / 2);
  const left = text.slice(0, midpoint);
  const right = text.slice(text.length - midpoint);
  return countVowels(left) === countVowels(right);
}

function countModuloPairs(nums: number[], divisor: number) {
  let count = 0;
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      if ((nums[left] + nums[right]) % divisor === 0) {
        count += 1;
      }
    }
  }
  return count;
}

function runLengthEncode(text: string) {
  if (!text) {
    return "";
  }
  let output = "";
  let count = 1;
  for (let index = 1; index <= text.length; index += 1) {
    if (text[index] === text[index - 1]) {
      count += 1;
    } else {
      output += `${text[index - 1]}${count}`;
      count = 1;
    }
  }
  return output;
}

function longestSumAtMost(nums: number[], limit: number) {
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right += 1) {
    sum += Math.max(0, nums[right]);
    while (sum > limit) {
      sum -= Math.max(0, nums[left]);
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function maxSortedGap(nums: number[]) {
  const sorted = [...nums].sort((left, right) => left - right);
  return sorted.slice(1).reduce((best, value, index) => Math.max(best, value - sorted[index]), 0);
}

function makeGrid(seed: number, index: number) {
  return Array.from({ length: 4 }, (_, row) => Array.from({ length: 5 }, (_, column) => Number((seed + index + row * 2 + column * 3) % 4 === 0)));
}

function countIslands(grid: number[][]) {
  const seen = grid.map((row) => row.map(() => false));
  let islands = 0;
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      if (grid[row][column] === 1 && !seen[row][column]) {
        islands += 1;
        flood(grid, seen, row, column);
      }
    }
  }
  return islands;
}

function flood(grid: number[][], seen: boolean[][], row: number, column: number) {
  if (!grid[row]?.[column] || seen[row][column]) {
    return;
  }
  seen[row][column] = true;
  flood(grid, seen, row + 1, column);
  flood(grid, seen, row - 1, column);
  flood(grid, seen, row, column + 1);
  flood(grid, seen, row, column - 1);
}

function lisLength(nums: number[]) {
  const piles: number[] = [];
  for (const value of nums) {
    const index = piles.findIndex((pile) => pile >= value);
    if (index === -1) {
      piles.push(value);
    } else {
      piles[index] = value;
    }
  }
  return piles.length;
}

function makeWeightedEdges(seed: number, index: number): Array<[string, string, number]> {
  return [["A", "B", seed % 5 + 1], ["A", "C", index % 4 + 2], ["B", "D", seed % 7 + 2], ["C", "D", index % 6 + 1], ["D", "E", seed % 3 + index % 3 + 1]];
}

function cheapestPath(edges: Array<[string, string, number]>, start: string, target: string) {
  const distances = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const node = queue.shift() || "";
    for (const [from, to, cost] of edges) {
      const nextCost = (distances.get(node) || 0) + cost;
      if (from === node && nextCost < (distances.get(to) ?? Infinity)) {
        distances.set(to, nextCost);
        queue.push(to);
      }
    }
  }
  return distances.get(target) ?? -1;
}

function editDistance(left: string, right: string) {
  const dp = Array.from({ length: left.length + 1 }, (_, row) => Array.from({ length: right.length + 1 }, (_value, column) => row + column));
  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      dp[row][column] = Math.min(dp[row - 1][column] + 1, dp[row][column - 1] + 1, dp[row - 1][column - 1] + cost);
    }
  }
  return dp[left.length][right.length];
}

function splitArrayLargestSum(nums: number[], k: number) {
  let low = Math.max(...nums);
  let high = nums.reduce((sum, value) => sum + value, 0);
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (canSplit(nums, k, mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

function canSplit(nums: number[], k: number, limit: number) {
  let groups = 1;
  let sum = 0;
  for (const value of nums) {
    if (sum + value > limit) {
      groups += 1;
      sum = 0;
    }
    sum += value;
  }
  return groups <= k;
}

function canPartitionEqual(nums: number[]) {
  const total = nums.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total % 2) {
    return false;
  }
  const reachable = new Set([0]);
  for (const value of nums.map((item) => Math.max(0, item))) {
    for (const sum of [...reachable]) {
      reachable.add(sum + value);
    }
  }
  return reachable.has(total / 2);
}

function minValueSetToHalveArray(arr: number[]) {
  const frequencies = new Map<number, number>();
  for (const value of arr) {
    frequencies.set(value, (frequencies.get(value) || 0) + 1);
  }
  const counts = [...frequencies.values()].sort((left, right) => right - left);
  let removed = 0;
  for (let index = 0; index < counts.length; index += 1) {
    removed += counts[index];
    if (removed >= arr.length / 2) {
      return index + 1;
    }
  }
  return 0;
}

function middleBalanceIndex(nums: number[]) {
  const total = nums.reduce((sum, value) => sum + value, 0);
  let left = 0;
  for (let index = 0; index < nums.length; index += 1) {
    if (left === total - left - nums[index]) {
      return index;
    }
    left += nums[index];
  }
  return -1;
}

function maxBinarySplitScore(s: string) {
  let rightOnes = [...s].filter((char) => char === "1").length;
  let leftZeroes = 0;
  let best = 0;
  for (let index = 0; index < s.length - 1; index += 1) {
    if (s[index] === "0") {
      leftZeroes += 1;
    } else {
      rightOnes -= 1;
    }
    best = Math.max(best, leftZeroes + rightOnes);
  }
  return best;
}

function maximumTruckUnits(boxTypes: number[][], truckSize: number) {
  let remaining = truckSize;
  let total = 0;
  for (const [count, units] of [...boxTypes].sort((left, right) => right[1] - left[1])) {
    const taken = Math.min(remaining, count);
    total += taken * units;
    remaining -= taken;
    if (remaining === 0) {
      break;
    }
  }
  return total;
}

function minOpsStrictlyIncreasing(nums: number[]) {
  let operations = 0;
  let previous = -Infinity;
  for (const value of nums) {
    const next = Math.max(value, previous + 1);
    operations += next - value;
    previous = next;
  }
  return operations;
}

function countZeroFilledSubarrays(nums: number[]) {
  let run = 0;
  let total = 0;
  for (const value of nums) {
    run = value === 0 ? run + 1 : 0;
    total += run;
  }
  return total;
}

function countAverageThresholdWindows(arr: number[], k: number, threshold: number) {
  let sum = 0;
  let count = 0;
  const target = k * threshold;
  for (let index = 0; index < arr.length; index += 1) {
    sum += arr[index];
    if (index >= k) {
      sum -= arr[index - k];
    }
    if (index >= k - 1 && sum >= target) {
      count += 1;
    }
  }
  return count;
}

function prefixCommonCounts(a: number[], b: number[]) {
  const seenA = new Set<number>();
  const seenB = new Set<number>();
  let common = 0;
  return a.map((value, index) => {
    seenA.add(value);
    if (seenB.has(value)) {
      common += 1;
    }
    seenB.add(b[index]);
    if (seenA.has(b[index]) && b[index] !== value) {
      common += 1;
    }
    return common;
  });
}

function rangeSumBstLevelOrder(values: Array<number | null>, low: number, high: number) {
  const root = buildTreeFromLevelOrder(values);
  const sum = (node: TreeNode | null): number => {
    if (!node) {
      return 0;
    }
    return (node.val >= low && node.val <= high ? node.val : 0) + sum(node.left || null) + sum(node.right || null);
  };
  return sum(root);
}

function countGoodLevelOrderNodes(values: Array<number | null>) {
  const root = buildTreeFromLevelOrder(values);
  const count = (node: TreeNode | null, best: number): number => {
    if (!node) {
      return 0;
    }
    const good = node.val >= best ? 1 : 0;
    const nextBest = Math.max(best, node.val);
    return good + count(node.left || null, nextBest) + count(node.right || null, nextBest);
  };
  return count(root, -Infinity);
}

function deepestLeavesTotal(values: Array<number | null>) {
  const root = buildTreeFromLevelOrder(values);
  if (!root) {
    return 0;
  }
  let level = [root];
  let total = root.val;
  while (level.length) {
    total = level.reduce((sum, node) => sum + node.val, 0);
    level = level.flatMap((node) => [node.left, node.right].filter(Boolean) as TreeNode[]);
  }
  return total;
}

function countPseudoPalindromePaths(values: Array<number | null>) {
  const root = buildTreeFromLevelOrder(values);
  const dfs = (node: TreeNode | null, mask: number): number => {
    if (!node) {
      return 0;
    }
    const nextMask = mask ^ (1 << node.val);
    if (!node.left && !node.right) {
      return (nextMask & (nextMask - 1)) === 0 ? 1 : 0;
    }
    return dfs(node.left || null, nextMask) + dfs(node.right || null, nextMask);
  };
  return dfs(root, 0);
}

function allSourceTargetPaths(graph: number[][]) {
  const target = graph.length - 1;
  const results: number[][] = [];
  const walk = (node: number, path: number[]) => {
    if (node === target) {
      results.push([...path]);
      return;
    }
    for (const next of graph[node] || []) {
      walk(next, [...path, next]);
    }
  };
  walk(0, [0]);
  return results;
}

function canVisitEveryRoom(rooms: number[][]) {
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const room = stack.pop() as number;
    for (const key of rooms[room] || []) {
      if (!seen.has(key)) {
        seen.add(key);
        stack.push(key);
      }
    }
  }
  return seen.size === rooms.length;
}

function minutesToRotAllOranges(grid: number[][]) {
  const copy = grid.map((row) => [...row]);
  const queue: Array<[number, number, number]> = [];
  let fresh = 0;
  for (let row = 0; row < copy.length; row += 1) {
    for (let column = 0; column < (copy[row]?.length || 0); column += 1) {
      if (copy[row][column] === 2) {
        queue.push([row, column, 0]);
      } else if (copy[row][column] === 1) {
        fresh += 1;
      }
    }
  }
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [row, column, minute] = queue[cursor];
    minutes = Math.max(minutes, minute);
    for (const [rowStep, columnStep] of directions) {
      const nextRow = row + rowStep;
      const nextColumn = column + columnStep;
      if (copy[nextRow]?.[nextColumn] !== 1) {
        continue;
      }
      copy[nextRow][nextColumn] = 2;
      fresh -= 1;
      queue.push([nextRow, nextColumn, minute + 1]);
    }
  }
  return fresh === 0 ? minutes : -1;
}

function containsEveryBinaryCode(s: string, k: number) {
  if (k > s.length) {
    return false;
  }
  const seen = new Set<string>();
  for (let index = 0; index + k <= s.length; index += 1) {
    seen.add(s.slice(index, index + k));
  }
  return seen.size === 2 ** k;
}

function sumSubarrayRanges(nums: number[]) {
  let total = 0;
  for (let start = 0; start < nums.length; start += 1) {
    let min = nums[start];
    let max = nums[start];
    for (let end = start; end < nums.length; end += 1) {
      min = Math.min(min, nums[end]);
      max = Math.max(max, nums[end]);
      total += max - min;
    }
  }
  return total;
}

function minDeletionsForUniqueFrequencies(s: string) {
  const counts = new Map<string, number>();
  for (const char of s) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  const used = new Set<number>();
  let deletions = 0;
  for (let count of [...counts.values()].sort((left, right) => right - left)) {
    while (count > 0 && used.has(count)) {
      count -= 1;
      deletions += 1;
    }
    if (count > 0) {
      used.add(count);
    }
  }
  return deletions;
}

function maximumUniqueSubarraySum(nums: number[]) {
  const seen = new Set<number>();
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right += 1) {
    while (seen.has(nums[right])) {
      seen.delete(nums[left]);
      sum -= nums[left];
      left += 1;
    }
    seen.add(nums[right]);
    sum += nums[right];
    best = Math.max(best, sum);
  }
  return best;
}

function minimumRescueBoats(people: number[], limit: number) {
  const sorted = [...people].sort((left, right) => left - right);
  let left = 0;
  let right = sorted.length - 1;
  let boats = 0;
  while (left <= right) {
    if (sorted[left] + sorted[right] <= limit) {
      left += 1;
    }
    right -= 1;
    boats += 1;
  }
  return boats;
}

function areCloseWords(word1: string, word2: string) {
  if (word1.length !== word2.length) {
    return false;
  }
  const first = countLetters(word1);
  const second = countLetters(word2);
  const firstLetters = [...first.keys()].sort().join("");
  const secondLetters = [...second.keys()].sort().join("");
  if (firstLetters !== secondLetters) {
    return false;
  }
  return [...first.values()].sort((left, right) => left - right).join(",") === [...second.values()].sort((left, right) => left - right).join(",");
}

function countLengthThreePalindromes(s: string) {
  const palindromes = new Set<string>();
  for (let code = 97; code <= 122; code += 1) {
    const edge = String.fromCharCode(code);
    const first = s.indexOf(edge);
    const last = s.lastIndexOf(edge);
    if (first === -1 || first >= last) {
      continue;
    }
    for (const middle of new Set(s.slice(first + 1, last))) {
      palindromes.add(`${edge}${middle}${edge}`);
    }
  }
  return palindromes.size;
}

function minDominoRotations(top: number[], bottom: number[]) {
  const candidates = new Set([top[0], bottom[0]]);
  let best = Infinity;
  for (const target of candidates) {
    let topRotations = 0;
    let bottomRotations = 0;
    let possible = true;
    for (let index = 0; index < top.length; index += 1) {
      if (top[index] !== target && bottom[index] !== target) {
        possible = false;
        break;
      }
      if (top[index] !== target) {
        topRotations += 1;
      }
      if (bottom[index] !== target) {
        bottomRotations += 1;
      }
    }
    if (possible) {
      best = Math.min(best, topRotations, bottomRotations);
    }
  }
  return best === Infinity ? -1 : best;
}

function removeAdjacentGroups(s: string, k: number) {
  const stack: Array<{ char: string; count: number }> = [];
  for (const char of s) {
    const top = stack[stack.length - 1];
    if (top?.char === char) {
      top.count += 1;
      if (top.count === k) {
        stack.pop();
      }
    } else {
      stack.push({ char, count: 1 });
    }
  }
  return stack.map((item) => item.char.repeat(item.count)).join("");
}

function maxAbsoluteSubarraySum(nums: number[]) {
  let prefix = 0;
  let minPrefix = 0;
  let maxPrefix = 0;
  let best = 0;
  for (const value of nums) {
    prefix += value;
    best = Math.max(best, Math.abs(prefix - minPrefix), Math.abs(prefix - maxPrefix));
    minPrefix = Math.min(minPrefix, prefix);
    maxPrefix = Math.max(maxPrefix, prefix);
  }
  return best;
}

function intervalIntersections(first: number[][], second: number[][]) {
  const intersections: number[][] = [];
  let left = 0;
  let right = 0;
  while (left < first.length && right < second.length) {
    const start = Math.max(first[left][0], second[right][0]);
    const end = Math.min(first[left][1], second[right][1]);
    if (start <= end) {
      intersections.push([start, end]);
    }
    if (first[left][1] < second[right][1]) {
      left += 1;
    } else {
      right += 1;
    }
  }
  return intersections;
}

function minEatingSpeed(piles: number[], h: number) {
  let low = 1;
  let high = Math.max(...piles);
  while (low < high) {
    const speed = Math.floor((low + high) / 2);
    const hours = piles.reduce((sum, pile) => sum + Math.ceil(pile / speed), 0);
    if (hours <= h) {
      high = speed;
    } else {
      low = speed + 1;
    }
  }
  return low;
}

function findOriginalFromDoubled(changed: number[]) {
  if (changed.length % 2) {
    return [];
  }
  const counts = new Map<number, number>();
  for (const value of changed) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  const original: number[] = [];
  for (const value of [...changed].sort((left, right) => Math.abs(left) - Math.abs(right))) {
    const count = counts.get(value) || 0;
    if (!count) {
      continue;
    }
    const double = value * 2;
    const doubleCount = counts.get(double) || 0;
    if (!doubleCount) {
      return [];
    }
    counts.set(value, count - 1);
    counts.set(double, doubleCount - 1);
    original.push(value);
  }
  return original.sort((left, right) => left - right);
}

function minOperationsToHalveSum(nums: number[]) {
  const values = [...nums].sort((left, right) => right - left);
  const targetReduction = nums.reduce((sum, value) => sum + value, 0) / 2;
  let reduced = 0;
  let operations = 0;
  while (reduced < targetReduction) {
    const value = values.shift() || 0;
    const half = value / 2;
    reduced += half;
    values.push(half);
    values.sort((left, right) => right - left);
    operations += 1;
  }
  return operations;
}

function maxDistinctWindowSum(nums: number[], k: number) {
  const counts = new Map<number, number>();
  let sum = 0;
  let best = 0;
  for (let index = 0; index < nums.length; index += 1) {
    counts.set(nums[index], (counts.get(nums[index]) || 0) + 1);
    sum += nums[index];
    if (index >= k) {
      const outgoing = nums[index - k];
      const nextCount = (counts.get(outgoing) || 0) - 1;
      if (nextCount) {
        counts.set(outgoing, nextCount);
      } else {
        counts.delete(outgoing);
      }
      sum -= outgoing;
    }
    if (index >= k - 1 && counts.size === k) {
      best = Math.max(best, sum);
    }
  }
  return best;
}

function longestTwoFruitBasket(fruits: number[]) {
  const counts = new Map<number, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < fruits.length; right += 1) {
    counts.set(fruits[right], (counts.get(fruits[right]) || 0) + 1);
    while (counts.size > 2) {
      const fruit = fruits[left];
      const count = (counts.get(fruit) || 0) - 1;
      if (count) {
        counts.set(fruit, count);
      } else {
        counts.delete(fruit);
      }
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function nextGreaterLinkedValues(values: number[]) {
  const result = Array(values.length).fill(0);
  const stack: number[] = [];
  for (let index = 0; index < values.length; index += 1) {
    while (stack.length && values[index] > values[stack[stack.length - 1]]) {
      const previous = stack.pop();
      if (previous !== undefined) {
        result[previous] = values[index];
      }
    }
    stack.push(index);
  }
  return result;
}

function removeZeroSumLinkedValues(values: number[]) {
  const prefixToIndex = new Map<number, number>();
  const prefixValues = [0];
  let prefix = 0;
  prefixToIndex.set(0, 0);
  for (let index = 0; index < values.length; index += 1) {
    prefix += values[index];
    prefixValues.push(prefix);
    prefixToIndex.set(prefix, index + 1);
  }
  const result: number[] = [];
  let index = 0;
  while (index < values.length) {
    const nextIndex = prefixToIndex.get(prefixValues[index]) ?? index;
    if (nextIndex > index) {
      index = nextIndex;
    } else {
      result.push(values[index]);
      index += 1;
    }
  }
  return result;
}

function linkedListPathInTree(listValues: number[], root: TreeNode | null) {
  if (!listValues.length) {
    return true;
  }
  const starts = [root];
  while (starts.length) {
    const node = starts.pop();
    if (!node) {
      continue;
    }
    if (matchesLinkedPath(node, listValues, 0)) {
      return true;
    }
    starts.push(node.left || null, node.right || null);
  }
  return false;
}

function matchesLinkedPath(node: TreeNode | null | undefined, values: number[], index: number): boolean {
  if (index === values.length) {
    return true;
  }
  if (!node || node.val !== values[index]) {
    return false;
  }
  return matchesLinkedPath(node.left, values, index + 1) || matchesLinkedPath(node.right, values, index + 1);
}

function deepestSubtreeRootValue(root: TreeNode | null) {
  return deepestSubtree(root).node?.val ?? null;
}

function deepestSubtree(node: TreeNode | null | undefined): { depth: number; node: TreeNode | null } {
  if (!node) {
    return { depth: 0, node: null };
  }
  const left = deepestSubtree(node.left);
  const right = deepestSubtree(node.right);
  if (left.depth === right.depth) {
    return { depth: left.depth + 1, node };
  }
  return left.depth > right.depth ? { depth: left.depth + 1, node: left.node } : { depth: right.depth + 1, node: right.node };
}

function bstInorderFromPreorder(preorder: number[]) {
  return [...preorder].sort((left, right) => left - right);
}

function treeLevelOrderFromDescriptions(descriptions: Array<[number, number, number]>) {
  if (!descriptions.length) {
    return [];
  }
  const nodes = new Map<number, TreeNode>();
  const children = new Set<number>();
  for (const [parentValue, childValue, isLeft] of descriptions) {
    const parent = getOrCreateTreeNode(nodes, parentValue);
    const child = getOrCreateTreeNode(nodes, childValue);
    if (isLeft) {
      parent.left = child;
    } else {
      parent.right = child;
    }
    children.add(childValue);
  }
  const rootValue = [...nodes.keys()].find((value) => !children.has(value));
  const root = rootValue === undefined ? null : nodes.get(rootValue) || null;
  return compactLevelOrder(root);
}

function getOrCreateTreeNode(nodes: Map<number, TreeNode>, value: number) {
  if (!nodes.has(value)) {
    nodes.set(value, { val: value });
  }
  return nodes.get(value) as TreeNode;
}

function compactLevelOrder(root: TreeNode | null) {
  if (!root) {
    return [];
  }
  const result: Array<number | null> = [];
  const queue: Array<TreeNode | null | undefined> = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      result.push(null);
      continue;
    }
    result.push(node.val);
    if (node.left || node.right) {
      queue.push(node.left || null, node.right || null);
    }
  }
  while (result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

function nodesDistanceK(root: TreeNode | null, target: number, k: number) {
  if (!root) {
    return [];
  }
  const graph = new Map<number, number[]>();
  buildTreeGraph(root, null, graph);
  if (!graph.has(target)) {
    return [];
  }
  const seen = new Set([target]);
  let frontier = [target];
  for (let distance = 0; distance < k; distance += 1) {
    const next: number[] = [];
    for (const value of frontier) {
      for (const neighbor of graph.get(value) || []) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }
  return frontier.sort((left, right) => left - right);
}

function buildTreeGraph(node: TreeNode | null | undefined, parent: number | null, graph: Map<number, number[]>) {
  if (!node) {
    return;
  }
  if (!graph.has(node.val)) {
    graph.set(node.val, []);
  }
  if (parent !== null) {
    graph.get(node.val)?.push(parent);
    graph.get(parent)?.push(node.val);
  }
  buildTreeGraph(node.left, node.val, graph);
  buildTreeGraph(node.right, node.val, graph);
}

function maxTreeSplitProduct(root: TreeNode | null) {
  const sums: number[] = [];
  const total = collectSubtreeSums(root, sums);
  let best = 0;
  for (const sum of sums) {
    if (sum !== total) {
      best = Math.max(best, sum * (total - sum));
    }
  }
  return best;
}

function collectSubtreeSums(node: TreeNode | null | undefined, sums: number[]): number {
  if (!node) {
    return 0;
  }
  const sum = node.val + collectSubtreeSums(node.left, sums) + collectSubtreeSums(node.right, sums);
  sums.push(sum);
  return sum;
}

function countUnreachablePairs(n: number, edges: Array<[number, number]>) {
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [left, right] of edges) {
    graph[left].push(right);
    graph[right].push(left);
  }
  const seen = new Set<number>();
  let seenCount = 0;
  let pairs = 0;
  for (let node = 0; node < n; node += 1) {
    if (seen.has(node)) {
      continue;
    }
    const size = getGraphComponentSize(node, graph, seen);
    pairs += size * seenCount;
    seenCount += size;
  }
  return pairs;
}

function getGraphComponentSize(start: number, graph: number[][], seen: Set<number>) {
  const stack = [start];
  seen.add(start);
  let size = 0;
  while (stack.length) {
    const node = stack.pop() as number;
    size += 1;
    for (const next of graph[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return size;
}

function isBipartiteGraph(graph: number[][]) {
  const colors = new Map<number, number>();
  for (let node = 0; node < graph.length; node += 1) {
    if (colors.has(node)) {
      continue;
    }
    colors.set(node, 0);
    const queue = [node];
    while (queue.length) {
      const current = queue.shift() as number;
      const nextColor = 1 - (colors.get(current) || 0);
      for (const neighbor of graph[current]) {
        if (!colors.has(neighbor)) {
          colors.set(neighbor, nextColor);
          queue.push(neighbor);
        } else if (colors.get(neighbor) !== nextColor) {
          return false;
        }
      }
    }
  }
  return true;
}

function cheapestFlightWithinStops(n: number, flights: Array<[number, number, number]>, src: number, dst: number, k: number) {
  if (src === dst) {
    return 0;
  }
  let costs = Array(n).fill(Infinity);
  costs[src] = 0;
  for (let step = 0; step <= k; step += 1) {
    const next = [...costs];
    for (const [from, to, price] of flights) {
      if (costs[from] !== Infinity && costs[from] + price < next[to]) {
        next[to] = costs[from] + price;
      }
    }
    costs = next;
  }
  return costs[dst] === Infinity ? -1 : costs[dst];
}

function visiblePeopleToRight(heights: number[]) {
  const result = Array(heights.length).fill(0);
  const stack: number[] = [];
  for (let index = heights.length - 1; index >= 0; index -= 1) {
    while (stack.length && heights[index] > stack[stack.length - 1]) {
      stack.pop();
      result[index] += 1;
    }
    if (stack.length) {
      result[index] += 1;
    }
    stack.push(heights[index]);
  }
  return result;
}

function longestArithmeticSubsequenceLength(nums: number[]) {
  const dp = nums.map(() => new Map<number, number>());
  let best = nums.length ? 1 : 0;
  for (let right = 0; right < nums.length; right += 1) {
    for (let left = 0; left < right; left += 1) {
      const diff = nums[right] - nums[left];
      const length = (dp[left].get(diff) || 1) + 1;
      dp[right].set(diff, Math.max(dp[right].get(diff) || 0, length));
      best = Math.max(best, length);
    }
  }
  return best;
}

function longestIdealSubsequenceLength(s: string, k: number) {
  const dp = Array(26).fill(0);
  for (const char of s) {
    const code = char.charCodeAt(0) - 97;
    let best = 0;
    for (let next = Math.max(0, code - k); next <= Math.min(25, code + k); next += 1) {
      best = Math.max(best, dp[next]);
    }
    dp[code] = Math.max(dp[code], best + 1);
  }
  return Math.max(0, ...dp);
}

function countVowelPermutationStrings(n: number) {
  const MOD = 1000000007;
  let a = 1;
  let e = 1;
  let i = 1;
  let o = 1;
  let u = 1;
  for (let length = 2; length <= n; length += 1) {
    [a, e, i, o, u] = [(e + i + u) % MOD, (a + i) % MOD, (e + o) % MOD, i % MOD, (i + o) % MOD];
  }
  return (a + e + i + o + u) % MOD;
}

function longestStringChainLength(words: string[]) {
  const sorted = [...words].sort((left, right) => left.length - right.length);
  const dp = new Map<string, number>();
  let best = 0;
  for (const word of sorted) {
    let length = 1;
    for (let index = 0; index < word.length; index += 1) {
      const previous = word.slice(0, index) + word.slice(index + 1);
      length = Math.max(length, (dp.get(previous) || 0) + 1);
    }
    dp.set(word, length);
    best = Math.max(best, length);
  }
  return best;
}

function eventualSafeGraphNodes(graph: number[][]) {
  const reverse = Array.from({ length: graph.length }, () => [] as number[]);
  const outdegree = graph.map((neighbors) => neighbors.length);
  for (let node = 0; node < graph.length; node += 1) {
    for (const next of graph[node]) {
      reverse[next].push(node);
    }
  }
  const queue = outdegree.map((degree, node) => degree === 0 ? node : -1).filter((node) => node >= 0);
  const safe = Array(graph.length).fill(false);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const node = queue[cursor];
    safe[node] = true;
    for (const previous of reverse[node]) {
      outdegree[previous] -= 1;
      if (outdegree[previous] === 0) {
        queue.push(previous);
      }
    }
  }
  return safe.map((isSafe, node) => isSafe ? node : -1).filter((node) => node >= 0);
}

function minDaysForBouquets(bloomDay: number[], m: number, k: number) {
  if (m * k > bloomDay.length) {
    return -1;
  }
  let left = Math.min(...bloomDay);
  let right = Math.max(...bloomDay);
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (canMakeBouquets(bloomDay, m, k, middle)) {
      right = middle;
    } else {
      left = middle + 1;
    }
  }
  return left;
}

function canMakeBouquets(bloomDay: number[], m: number, k: number, day: number) {
  let bouquets = 0;
  let run = 0;
  for (const bloom of bloomDay) {
    run = bloom <= day ? run + 1 : 0;
    if (run === k) {
      bouquets += 1;
      run = 0;
    }
  }
  return bouquets >= m;
}

function shipWithinDaysCapacity(weights: number[], days: number) {
  let left = Math.max(...weights);
  let right = weights.reduce((sum, value) => sum + value, 0);
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (countShipDays(weights, middle) <= days) {
      right = middle;
    } else {
      left = middle + 1;
    }
  }
  return left;
}

function countShipDays(weights: number[], capacity: number) {
  let days = 1;
  let load = 0;
  for (const weight of weights) {
    if (load + weight > capacity) {
      days += 1;
      load = 0;
    }
    load += weight;
  }
  return days;
}

function shortestSubarrayAtLeastK(nums: number[], k: number) {
  const prefix = [0];
  for (const num of nums) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
  const deque: number[] = [];
  let best = Infinity;
  for (let index = 0; index < prefix.length; index += 1) {
    while (deque.length && prefix[index] - prefix[deque[0]] >= k) {
      best = Math.min(best, index - (deque.shift() as number));
    }
    while (deque.length && prefix[index] <= prefix[deque[deque.length - 1]]) {
      deque.pop();
    }
    deque.push(index);
  }
  return Number.isFinite(best) ? best : -1;
}

function dailyStockSpans(prices: number[]) {
  const stack: Array<[number, number]> = [];
  return prices.map((price) => {
    let span = 1;
    while (stack.length && stack[stack.length - 1][0] <= price) {
      span += (stack.pop() as [number, number])[1];
    }
    stack.push([price, span]);
    return span;
  });
}

function maxWidthRamp(nums: number[]) {
  const stack: number[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    if (!stack.length || nums[index] < nums[stack[stack.length - 1]]) {
      stack.push(index);
    }
  }
  let best = 0;
  for (let right = nums.length - 1; right >= 0; right -= 1) {
    while (stack.length && nums[stack[stack.length - 1]] <= nums[right]) {
      best = Math.max(best, right - (stack.pop() as number));
    }
  }
  return best;
}

function countMatchingSubsequences(s: string, words: string[]) {
  const positions = new Map<string, number[]>();
  for (let index = 0; index < s.length; index += 1) {
    const char = s[index];
    positions.set(char, [...(positions.get(char) || []), index]);
  }
  return words.filter((word) => isSubsequenceByPositions(word, positions)).length;
}

function isSubsequenceByPositions(word: string, positions: Map<string, number[]>) {
  let current = -1;
  for (const char of word) {
    const indexes = positions.get(char) || [];
    const next = firstGreaterThan(indexes, current);
    if (next === -1) {
      return false;
    }
    current = next;
  }
  return true;
}

function firstGreaterThan(values: number[], target: number) {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (values[middle] > target) {
      right = middle;
    } else {
      left = middle + 1;
    }
  }
  return left < values.length ? values[left] : -1;
}

function longestEvenVowelSubstring(s: string) {
  const seen = new Map([[0, -1]]);
  const bitByVowel = new Map([["a", 1], ["e", 2], ["i", 4], ["o", 8], ["u", 16]]);
  let mask = 0;
  let best = 0;
  for (let index = 0; index < s.length; index += 1) {
    mask ^= bitByVowel.get(s[index]) || 0;
    if (!seen.has(mask)) {
      seen.set(mask, index);
    }
    best = Math.max(best, index - (seen.get(mask) as number));
  }
  return best;
}

function countBoundedMaxSubarrays(nums: number[], left: number, right: number) {
  return countSubarraysWithMaxAtMost(nums, right) - countSubarraysWithMaxAtMost(nums, left - 1);
}

function countSubarraysWithMaxAtMost(nums: number[], limit: number) {
  let run = 0;
  let total = 0;
  for (const num of nums) {
    run = num <= limit ? run + 1 : 0;
    total += run;
  }
  return total;
}

function minRefuelStops(target: number, startFuel: number, stations: Array<[number, number]>) {
  const fuels: number[] = [];
  let fuel = startFuel;
  let stops = 0;
  let index = 0;
  while (fuel < target) {
    while (index < stations.length && stations[index][0] <= fuel) {
      fuels.push(stations[index][1]);
      fuels.sort((left, right) => right - left);
      index += 1;
    }
    if (!fuels.length) {
      return -1;
    }
    fuel += fuels.shift() as number;
    stops += 1;
  }
  return stops;
}

function maxCircularSubarraySum(nums: number[]) {
  let total = 0;
  let maxEnding = 0;
  let minEnding = 0;
  let bestMax = -Infinity;
  let bestMin = Infinity;
  for (const num of nums) {
    maxEnding = Math.max(num, maxEnding + num);
    bestMax = Math.max(bestMax, maxEnding);
    minEnding = Math.min(num, minEnding + num);
    bestMin = Math.min(bestMin, minEnding);
    total += num;
  }
  return bestMax < 0 ? bestMax : Math.max(bestMax, total - bestMin);
}

function makeCases(argsList: unknown[][], label: string): TestInput[] {
  return argsList.map((args, index) => ({ args, name: `${label} ${index + 1}` }));
}

function countBinarySubarraysWithSum(nums: number[], goal: number) {
  const prefixCounts = new Map([[0, 1]]);
  let prefix = 0;
  let total = 0;
  for (const num of nums) {
    prefix += num;
    total += prefixCounts.get(prefix - goal) || 0;
    prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
  }
  return total;
}

function canRearrangeKSubstrings(s: string, target: string, k: number) {
  if (s.length !== target.length || k <= 0 || s.length % k !== 0) {
    return false;
  }
  const chunkLength = s.length / k;
  const counts = new Map<string, number>();
  for (let index = 0; index < s.length; index += chunkLength) {
    const chunk = s.slice(index, index + chunkLength);
    counts.set(chunk, (counts.get(chunk) || 0) + 1);
  }
  for (let index = 0; index < target.length; index += chunkLength) {
    const chunk = target.slice(index, index + chunkLength);
    const count = counts.get(chunk) || 0;
    if (!count) {
      return false;
    }
    count === 1 ? counts.delete(chunk) : counts.set(chunk, count - 1);
  }
  return counts.size === 0;
}

function countBeautifulSubarrays(nums: number[]) {
  const prefixCounts = new Map([[0, 1]]);
  let xor = 0;
  let total = 0;
  for (const num of nums) {
    xor ^= num;
    total += prefixCounts.get(xor) || 0;
    prefixCounts.set(xor, (prefixCounts.get(xor) || 0) + 1);
  }
  return total;
}

function rangeFrequencyValues(arr: number[], queries: Array<[number, number, number]>) {
  const positions = new Map<number, number[]>();
  arr.forEach((value, index) => {
    if (!positions.has(value)) {
      positions.set(value, []);
    }
    positions.get(value)?.push(index);
  });
  return queries.map(([left, right, value]) => {
    const indexes = positions.get(value) || [];
    return lowerBound(indexes, right + 1) - lowerBound(indexes, left);
  });
}

function recoverPreorderLevelValues(traversal: string) {
  const stack: Array<{ depth: number; node: TreeNode }> = [];
  let index = 0;
  let root: TreeNode | null = null;
  while (index < traversal.length) {
    let depth = 0;
    while (traversal[index] === "-") {
      depth += 1;
      index += 1;
    }
    let value = 0;
    while (index < traversal.length && traversal[index] !== "-") {
      value = value * 10 + Number(traversal[index]);
      index += 1;
    }
    const node: TreeNode = { val: value, left: null, right: null };
    while (stack.length > depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.node;
    if (!parent) {
      root = node;
    } else if (!parent.left) {
      parent.left = node;
    } else {
      parent.right = node;
    }
    stack.push({ depth, node });
  }
  return serializeLevelOrder(root);
}

function directionsBetweenTreeNodes(rootValues: Array<number | null>, startValue: number, destValue: number) {
  const root = buildTreeFromLevelOrder(rootValues);
  const startPath: string[] = [];
  const destPath: string[] = [];
  findTreePath(root, startValue, startPath);
  findTreePath(root, destValue, destPath);
  let shared = 0;
  while (shared < startPath.length && shared < destPath.length && startPath[shared] === destPath[shared]) {
    shared += 1;
  }
  return "U".repeat(startPath.length - shared) + destPath.slice(shared).join("");
}

function countFullBinaryTreeShapes(n: number) {
  if (n % 2 === 0) {
    return 0;
  }
  const ways = Array(n + 1).fill(0);
  ways[1] = 1;
  for (let nodes = 3; nodes <= n; nodes += 2) {
    for (let left = 1; left < nodes; left += 2) {
      ways[nodes] += ways[left] * ways[nodes - 1 - left];
    }
  }
  return ways[n];
}

function countSubIslands(grid1: number[][], grid2: number[][]) {
  const rows = grid2.length;
  const columns = grid2[0]?.length || 0;
  const seen = Array.from({ length: rows }, () => Array(columns).fill(false));
  let total = 0;
  const walk = (row: number, column: number): boolean => {
    if (row < 0 || column < 0 || row >= rows || column >= columns || grid2[row][column] === 0 || seen[row][column]) {
      return true;
    }
    seen[row][column] = true;
    let covered = grid1[row][column] === 1;
    covered = walk(row + 1, column) && covered;
    covered = walk(row - 1, column) && covered;
    covered = walk(row, column + 1) && covered;
    covered = walk(row, column - 1) && covered;
    return covered;
  };
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (grid2[row][column] === 1 && !seen[row][column] && walk(row, column)) {
        total += 1;
      }
    }
  }
  return total;
}

function courseSchedulePrerequisites(numCourses: number, prerequisites: Array<[number, number]>, queries: Array<[number, number]>) {
  const reachable = Array.from({ length: numCourses }, () => Array(numCourses).fill(false));
  for (const [before, after] of prerequisites) {
    reachable[before][after] = true;
  }
  for (let through = 0; through < numCourses; through += 1) {
    for (let from = 0; from < numCourses; from += 1) {
      if (!reachable[from][through]) {
        continue;
      }
      for (let to = 0; to < numCourses; to += 1) {
        reachable[from][to] = reachable[from][to] || reachable[through][to];
      }
    }
  }
  return queries.map(([before, after]) => reachable[before][after]);
}

function minimumCourseSemesters(n: number, relations: Array<[number, number]>) {
  const graph = Array.from({ length: n + 1 }, () => [] as number[]);
  const indegree = Array(n + 1).fill(0);
  for (const [before, after] of relations) {
    graph[before].push(after);
    indegree[after] += 1;
  }
  const queue = Array.from({ length: n }, (_value, index) => index + 1).filter((course) => indegree[course] === 0);
  let semester = 0;
  let taken = 0;
  for (let cursor = 0; cursor < queue.length;) {
    const levelSize = queue.length - cursor;
    semester += 1;
    for (let count = 0; count < levelSize; count += 1) {
      const course = queue[cursor++];
      taken += 1;
      for (const next of graph[course]) {
        indegree[next] -= 1;
        if (indegree[next] === 0) {
          queue.push(next);
        }
      }
    }
  }
  return taken === n ? semester : -1;
}

function longestSubarrayAtMostKFrequency(nums: number[], k: number) {
  const counts = new Map<number, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right += 1) {
    counts.set(nums[right], (counts.get(nums[right]) || 0) + 1);
    while ((counts.get(nums[right]) || 0) > k) {
      counts.set(nums[left], (counts.get(nums[left]) || 0) - 1);
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function longestContinuousLimitedSubarray(nums: number[], limit: number) {
  const maxDeque: number[] = [];
  const minDeque: number[] = [];
  let left = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right += 1) {
    while (maxDeque.length && nums[maxDeque[maxDeque.length - 1]] < nums[right]) {
      maxDeque.pop();
    }
    while (minDeque.length && nums[minDeque[minDeque.length - 1]] > nums[right]) {
      minDeque.pop();
    }
    maxDeque.push(right);
    minDeque.push(right);
    while (nums[maxDeque[0]] - nums[minDeque[0]] > limit) {
      left += 1;
      if (maxDeque[0] < left) {
        maxDeque.shift();
      }
      if (minDeque[0] < left) {
        minDeque.shift();
      }
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function minIntervalGroups(intervals: Array<[number, number]>) {
  const ends: number[] = [];
  let best = 0;
  for (const [start, end] of [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    if (ends.length && ends[0] < start) {
      ends.shift();
    }
    sortedInsert(ends, end);
    best = Math.max(best, ends.length);
  }
  return best;
}

function mostBookedMeetingRoom(n: number, meetings: Array<[number, number]>) {
  const free = Array.from({ length: n }, (_value, index) => index);
  const busy: Array<[number, number]> = [];
  const counts = Array(n).fill(0);
  for (const [start, end] of [...meetings].sort((a, b) => a[0] - b[0])) {
    while (busy.length && busy[0][0] <= start) {
      const [, room] = busy.shift() as [number, number];
      sortedInsert(free, room);
    }
    const duration = end - start;
    if (free.length) {
      const room = free.shift() as number;
      counts[room] += 1;
      sortedInsertPair(busy, [end, room]);
      continue;
    }
    const [availableAt, room] = busy.shift() as [number, number];
    counts[room] += 1;
    sortedInsertPair(busy, [availableAt + duration, room]);
  }
  return counts.reduce((bestRoom, count, room) => count > counts[bestRoom] ? room : bestRoom, 0);
}

function reverseEvenLengthGroups(values: number[]) {
  const result = [...values];
  let start = 0;
  let groupSize = 1;
  while (start < result.length) {
    const end = Math.min(start + groupSize, result.length);
    if ((end - start) % 2 === 0) {
      result.splice(start, end - start, ...result.slice(start, end).reverse());
    }
    start = end;
    groupSize += 1;
  }
  return result;
}

function lowerBound(nums: number[], target: number) {
  let left = 0;
  let right = nums.length;
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (nums[middle] < target) {
      left = middle + 1;
    } else {
      right = middle;
    }
  }
  return left;
}

function serializeLevelOrder(root: TreeNode | null) {
  if (!root) {
    return [] as Array<number | null>;
  }
  const result: Array<number | null> = [];
  const queue: Array<TreeNode | null> = [root];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const node = queue[cursor];
    if (!node) {
      result.push(null);
      continue;
    }
    result.push(node.val);
    queue.push(node.left || null, node.right || null);
  }
  while (result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

function findTreePath(node: TreeNode | null, target: number, path: string[]) {
  if (!node) {
    return false;
  }
  if (node.val === target) {
    return true;
  }
  path.push("L");
  if (findTreePath(node.left || null, target, path)) {
    return true;
  }
  path.pop();
  path.push("R");
  if (findTreePath(node.right || null, target, path)) {
    return true;
  }
  path.pop();
  return false;
}

function sortedInsert(nums: number[], value: number) {
  nums.splice(lowerBound(nums, value), 0, value);
}

function sortedInsertPair(pairs: Array<[number, number]>, pair: [number, number]) {
  let index = 0;
  while (index < pairs.length && (pairs[index][0] < pair[0] || (pairs[index][0] === pair[0] && pairs[index][1] < pair[1]))) {
    index += 1;
  }
  pairs.splice(index, 0, pair);
}

function isSpecialParityArray(nums: number[], queries: Array<[number, number]>) {
  const sameParityPrefix = Array(nums.length).fill(0);
  for (let index = 1; index < nums.length; index += 1) {
    sameParityPrefix[index] = sameParityPrefix[index - 1] + (Math.abs(nums[index] % 2) === Math.abs(nums[index - 1] % 2) ? 1 : 0);
  }
  return queries.map(([left, right]) => sameParityPrefix[right] === sameParityPrefix[left]);
}

function removeIntervalPieces(intervals: Array<[number, number]>, remove: [number, number]) {
  const [removeStart, removeEnd] = remove;
  const result: number[][] = [];
  for (const [start, end] of intervals) {
    if (end <= removeStart || start >= removeEnd) {
      result.push([start, end]);
      continue;
    }
    if (start < removeStart) {
      result.push([start, removeStart]);
    }
    if (end > removeEnd) {
      result.push([removeEnd, end]);
    }
  }
  return result;
}

function largestPolygonPerimeter(nums: number[]) {
  const sides = [...nums].sort((left, right) => left - right);
  let sum = sides.reduce((total, value) => total + value, 0);
  for (let index = sides.length - 1; index >= 2; index -= 1) {
    if (sum - sides[index] > sides[index]) {
      return sum;
    }
    sum -= sides[index];
  }
  return -1;
}

function doesPathCross(path: string) {
  let row = 0;
  let column = 0;
  const seen = new Set(["0,0"]);
  const moves: Record<string, [number, number]> = { E: [0, 1], N: [-1, 0], S: [1, 0], W: [0, -1] };
  for (const step of path) {
    const [dr, dc] = moves[step] || [0, 0];
    row += dr;
    column += dc;
    const key = `${row},${column}`;
    if (seen.has(key)) {
      return true;
    }
    seen.add(key);
  }
  return false;
}

function canBuildKPalindromes(s: string, k: number) {
  if (k > s.length) {
    return false;
  }
  const counts = new Map<string, number>();
  for (const char of s) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  return [...counts.values()].filter((count) => count % 2 === 1).length <= k;
}

function longestTwoLetterPalindrome(words: string[]) {
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  let length = 0;
  let hasCenter = false;
  for (const [word, count] of counts) {
    const reversed = `${word[1]}${word[0]}`;
    if (word[0] === word[1]) {
      length += Math.floor(count / 2) * 4;
      hasCenter ||= count % 2 === 1;
    } else if (word < reversed) {
      length += Math.min(count, counts.get(reversed) || 0) * 4;
    }
  }
  return length + (hasCenter ? 2 : 0);
}

function forestRootValuesAfterDeleting(levelOrder: Array<number | null>, toDelete: number[]) {
  const deleteSet = new Set(toDelete);
  const roots: number[] = [];
  const walk = (node: TreeNode | null | undefined, isRoot: boolean): TreeNode | null => {
    if (!node) {
      return null;
    }
    const deleted = deleteSet.has(node.val);
    if (isRoot && !deleted) {
      roots.push(node.val);
    }
    node.left = walk(node.left, deleted);
    node.right = walk(node.right, deleted);
    return deleted ? null : node;
  };
  walk(buildTreeFromLevelOrder(levelOrder), true);
  return roots.sort((left, right) => left - right);
}

function minutesToInformEmployees(n: number, headID: number, manager: number[], informTime: number[]) {
  const reports = Array.from({ length: n }, () => [] as number[]);
  for (let employee = 0; employee < n; employee += 1) {
    if (manager[employee] >= 0) {
      reports[manager[employee]].push(employee);
    }
  }
  const dfs = (employee: number): number => reports[employee].reduce((best, report) => Math.max(best, informTime[employee] + dfs(report)), 0);
  return dfs(headID);
}

function countGoodLeafPairs(levelOrder: Array<number | null>, distance: number) {
  let pairs = 0;
  const walk = (node: TreeNode | null | undefined): number[] => {
    if (!node) {
      return [];
    }
    if (!node.left && !node.right) {
      return [1];
    }
    const left = walk(node.left);
    const right = walk(node.right);
    for (const leftDistance of left) {
      for (const rightDistance of right) {
        if (leftDistance + rightDistance <= distance) {
          pairs += 1;
        }
      }
    }
    return [...left, ...right].map((value) => value + 1).filter((value) => value <= distance);
  };
  walk(buildTreeFromLevelOrder(levelOrder));
  return pairs;
}

function buildTreeFromLevelOrder(values: Array<number | null>) {
  if (!values.length || values[0] === null) {
    return null;
  }
  const root: TreeNode = { val: values[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift() as TreeNode;
    const left = values[index++];
    if (left !== undefined && left !== null) {
      node.left = { val: left, left: null, right: null };
      queue.push(node.left);
    }
    const right = values[index++];
    if (right !== undefined && right !== null) {
      node.right = { val: right, left: null, right: null };
      queue.push(node.right);
    }
  }
  return root;
}

function smallestSourceVertices(n: number, edges: Array<[number, number]>) {
  const hasIncoming = Array(n).fill(false);
  for (const [, to] of edges) {
    hasIncoming[to] = true;
  }
  return hasIncoming.flatMap((incoming, node) => incoming ? [] : [node]);
}

function nearestMazeExit(maze: string[][], entrance: [number, number]) {
  const rows = maze.length;
  const columns = maze[0]?.length || 0;
  const queue: Array<[number, number, number]> = [[entrance[0], entrance[1], 0]];
  const seen = Array.from({ length: rows }, () => Array(columns).fill(false));
  seen[entrance[0]][entrance[1]] = true;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [row, column, distance] = queue[cursor];
    if (distance > 0 && (row === 0 || column === 0 || row === rows - 1 || column === columns - 1)) {
      return distance;
    }
    for (const [dr, dc] of directions) {
      const nextRow = row + dr;
      const nextColumn = column + dc;
      if (nextRow < 0 || nextColumn < 0 || nextRow >= rows || nextColumn >= columns || seen[nextRow][nextColumn] || maze[nextRow][nextColumn] !== ".") {
        continue;
      }
      seen[nextRow][nextColumn] = true;
      queue.push([nextRow, nextColumn, distance + 1]);
    }
  }
  return -1;
}

function countEnclaveLand(grid: number[][]) {
  const rows = grid.length;
  const columns = grid[0]?.length || 0;
  const seen = Array.from({ length: rows }, () => Array(columns).fill(false));
  const stack: Array<[number, number]> = [];
  const push = (row: number, column: number) => {
    if (row >= 0 && column >= 0 && row < rows && column < columns && !seen[row][column] && grid[row][column] === 1) {
      seen[row][column] = true;
      stack.push([row, column]);
    }
  };
  for (let row = 0; row < rows; row += 1) {
    push(row, 0);
    push(row, columns - 1);
  }
  for (let column = 0; column < columns; column += 1) {
    push(0, column);
    push(rows - 1, column);
  }
  while (stack.length) {
    const [row, column] = stack.pop() as [number, number];
    push(row + 1, column);
    push(row - 1, column);
    push(row, column + 1);
    push(row, column - 1);
  }
  let enclaves = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (grid[row][column] === 1 && !seen[row][column]) {
        enclaves += 1;
      }
    }
  }
  return enclaves;
}

function countSquareSubmatrices(matrix: number[][]) {
  const dp = matrix.map((row) => row.map(() => 0));
  let total = 0;
  for (let row = 0; row < matrix.length; row += 1) {
    for (let column = 0; column < (matrix[0]?.length || 0); column += 1) {
      if (matrix[row][column] === 1) {
        dp[row][column] = row === 0 || column === 0 ? 1 : 1 + Math.min(dp[row - 1][column], dp[row][column - 1], dp[row - 1][column - 1]);
        total += dp[row][column];
      }
    }
  }
  return total;
}

function diceRollTargetWays(n: number, k: number, target: number) {
  const mod = 1_000_000_007;
  let previous = Array(target + 1).fill(0);
  previous[0] = 1;
  for (let dice = 0; dice < n; dice += 1) {
    const next = Array(target + 1).fill(0);
    for (let sum = 0; sum <= target; sum += 1) {
      if (!previous[sum]) {
        continue;
      }
      for (let face = 1; face <= k && sum + face <= target; face += 1) {
        next[sum + face] = (next[sum + face] + previous[sum]) % mod;
      }
    }
    previous = next;
  }
  return previous[target];
}

function longestOnesAfterFlips(nums: number[], k: number) {
  let left = 0;
  let zeroes = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right += 1) {
    zeroes += nums[right] === 0 ? 1 : 0;
    while (zeroes > k) {
      zeroes -= nums[left] === 0 ? 1 : 0;
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function flightBookingTotals(bookings: Array<[number, number, number]>, n: number) {
  const diff = Array(n + 1).fill(0);
  for (const [first, last, seats] of bookings) {
    diff[first - 1] += seats;
    diff[last] -= seats;
  }
  const result: number[] = [];
  let running = 0;
  for (let index = 0; index < n; index += 1) {
    running += diff[index];
    result.push(running);
  }
  return result;
}

function countFairRemovalWays(nums: number[]) {
  const total = nums.reduce((sums, value, index) => {
    sums[index % 2] += value;
    return sums;
  }, [0, 0]);
  const left = [0, 0];
  let ways = 0;
  for (let index = 0; index < nums.length; index += 1) {
    total[index % 2] -= nums[index];
    if (left[0] + total[1] === left[1] + total[0]) {
      ways += 1;
    }
    left[index % 2] += nums[index];
  }
  return ways;
}

function maximumOrderedTripletValue(nums: number[]) {
  let best = 0;
  let bestPrefix = nums[0] ?? 0;
  let bestDifference = -Infinity;
  for (let index = 1; index < nums.length; index += 1) {
    best = Math.max(best, bestDifference * nums[index]);
    bestDifference = Math.max(bestDifference, bestPrefix - nums[index]);
    bestPrefix = Math.max(bestPrefix, nums[index]);
  }
  return best;
}

function countBadIndexPairs(nums: number[]) {
  const counts = new Map<number, number>();
  let goodPairs = 0;
  for (let index = 0; index < nums.length; index += 1) {
    const key = nums[index] - index;
    goodPairs += counts.get(key) || 0;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return nums.length * (nums.length - 1) / 2 - goodPairs;
}

function universalWordSubsets(words1: string[], words2: string[]) {
  const required = Array(26).fill(0);
  for (const word of words2) {
    const counts = countLowercaseLetters(word);
    for (let index = 0; index < 26; index += 1) {
      required[index] = Math.max(required[index], counts[index]);
    }
  }
  return words1.filter((word) => {
    const counts = countLowercaseLetters(word);
    return required.every((count, index) => counts[index] >= count);
  });
}

function countLowercaseLetters(word: string) {
  const counts = Array(26).fill(0);
  for (const char of word) {
    counts[char.charCodeAt(0) - 97] += 1;
  }
  return counts;
}

function treeDiameterLength(edges: Array<[number, number]>) {
  if (!edges.length) {
    return 0;
  }
  const graph = new Map<number, number[]>();
  for (const [left, right] of edges) {
    graph.set(left, [...(graph.get(left) || []), right]);
    graph.set(right, [...(graph.get(right) || []), left]);
  }
  const first = farthestTreeNode(edges[0][0], graph).node;
  return farthestTreeNode(first, graph).distance;
}

function farthestTreeNode(start: number, graph: Map<number, number[]>) {
  const queue: Array<[number, number]> = [[start, 0]];
  const seen = new Set([start]);
  let best = { distance: 0, node: start };
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [node, distance] = queue[cursor];
    if (distance > best.distance) {
      best = { distance, node };
    }
    for (const next of graph.get(node) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push([next, distance + 1]);
      }
    }
  }
  return best;
}

function buildTreeLevelOrderFromPrePost(preorder: number[], postorder: number[]) {
  const postIndex = new Map(postorder.map((value, index) => [value, index]));
  const build = (preLeft: number, preRight: number, postLeft: number, postRight: number): TreeNode | null => {
    if (preLeft > preRight || postLeft > postRight) {
      return null;
    }
    const root: TreeNode = { val: preorder[preLeft], left: null, right: null };
    if (preLeft === preRight) {
      return root;
    }
    const leftRoot = preorder[preLeft + 1];
    const leftPostIndex = postIndex.get(leftRoot) ?? postLeft;
    const leftSize = leftPostIndex - postLeft + 1;
    root.left = build(preLeft + 1, preLeft + leftSize, postLeft, leftPostIndex);
    root.right = build(preLeft + leftSize + 1, preRight, leftPostIndex + 1, postRight - 1);
    return root;
  };
  return compactTreeLevelOrder(build(0, preorder.length - 1, 0, postorder.length - 1));
}

function compactTreeLevelOrder(root: TreeNode | null) {
  if (!root) {
    return [];
  }
  const result: Array<number | null> = [];
  const queue: Array<TreeNode | null> = [root];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const node = queue[cursor];
    if (!node) {
      result.push(null);
      continue;
    }
    result.push(node.val);
    if (node.left || node.right) {
      queue.push(node.left || null, node.right || null);
    }
  }
  while (result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

function countCompleteGraphComponents(n: number, edges: Array<[number, number]>) {
  const graph = Array.from({ length: n }, () => new Set<number>());
  for (const [left, right] of edges) {
    graph[left].add(right);
    graph[right].add(left);
  }
  const seen = Array(n).fill(false);
  let complete = 0;
  for (let start = 0; start < n; start += 1) {
    if (seen[start]) {
      continue;
    }
    const stack = [start];
    const nodes: number[] = [];
    seen[start] = true;
    while (stack.length) {
      const node = stack.pop() as number;
      nodes.push(node);
      for (const next of graph[node]) {
        if (!seen[next]) {
          seen[next] = true;
          stack.push(next);
        }
      }
    }
    const degreeSum = nodes.reduce((sum, node) => sum + graph[node].size, 0);
    if (degreeSum === nodes.length * (nodes.length - 1)) {
      complete += 1;
    }
  }
  return complete;
}

function openLockMoves(deadends: string[], target: string) {
  const blocked = new Set(deadends);
  if (blocked.has("0000")) {
    return -1;
  }
  const queue: Array<[string, number]> = [["0000", 0]];
  const seen = new Set(["0000"]);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [code, distance] = queue[cursor];
    if (code === target) {
      return distance;
    }
    for (let wheel = 0; wheel < 4; wheel += 1) {
      const digit = Number(code[wheel]);
      for (const delta of [-1, 1]) {
        const nextDigit = (digit + delta + 10) % 10;
        const next = `${code.slice(0, wheel)}${nextDigit}${code.slice(wheel + 1)}`;
        if (!blocked.has(next) && !seen.has(next)) {
          seen.add(next);
          queue.push([next, distance + 1]);
        }
      }
    }
  }
  return -1;
}

function countAlternatingBuildingWays(s: string) {
  let zeroesLeft = 0;
  let onesLeft = 0;
  let zeroesRight = [...s].filter((char) => char === "0").length;
  let onesRight = s.length - zeroesRight;
  let ways = 0;
  for (const char of s) {
    if (char === "0") {
      zeroesRight -= 1;
      ways += onesLeft * onesRight;
      zeroesLeft += 1;
    } else {
      onesRight -= 1;
      ways += zeroesLeft * zeroesRight;
      onesLeft += 1;
    }
  }
  return ways;
}

function maxExamConfusionRun(answerKey: string, k: number) {
  const longestFor = (target: string) => {
    let left = 0;
    let changes = 0;
    let best = 0;
    for (let right = 0; right < answerKey.length; right += 1) {
      changes += answerKey[right] === target ? 0 : 1;
      while (changes > k) {
        changes -= answerKey[left] === target ? 0 : 1;
        left += 1;
      }
      best = Math.max(best, right - left + 1);
    }
    return best;
  };
  return Math.max(longestFor("T"), longestFor("F"));
}

function maximumCandiesPerChild(candies: number[], k: number) {
  let left = 0;
  let right = Math.max(...candies);
  while (left < right) {
    const middle = Math.ceil((left + right) / 2);
    const pieces = candies.reduce((total, pile) => total + Math.floor(pile / middle), 0);
    if (pieces >= k) {
      left = middle;
    } else {
      right = middle - 1;
    }
  }
  return left;
}

function minimumTripCompletionTime(time: number[], totalTrips: number) {
  let left = 1;
  let right = Math.min(...time) * totalTrips;
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    const trips = time.reduce((total, value) => total + Math.floor(middle / value), 0);
    if (trips >= totalTrips) {
      right = middle;
    } else {
      left = middle + 1;
    }
  }
  return left;
}

function singleThreadedCpuOrder(tasks: Array<[number, number]>) {
  const indexed = tasks.map(([start, duration], index) => ({ duration, index, start })).sort((left, right) => left.start - right.start);
  const heap: typeof indexed = [];
  const result: number[] = [];
  let time = 0;
  let index = 0;
  while (index < indexed.length || heap.length) {
    if (!heap.length && time < indexed[index].start) {
      time = indexed[index].start;
    }
    while (index < indexed.length && indexed[index].start <= time) {
      heap.push(indexed[index]);
      index += 1;
    }
    heap.sort((left, right) => left.duration - right.duration || left.index - right.index);
    const task = heap.shift();
    if (task) {
      time += task.duration;
      result.push(task.index);
    }
  }
  return result;
}

function minimumPairMergesToSort(nums: number[]) {
  const values = [...nums];
  let operations = 0;
  const isSorted = () => values.every((value, index) => index === 0 || values[index - 1] <= value);
  while (!isSorted()) {
    let bestIndex = 0;
    let bestSum = values[0] + values[1];
    for (let index = 1; index < values.length - 1; index += 1) {
      const sum = values[index] + values[index + 1];
      if (sum < bestSum) {
        bestSum = sum;
        bestIndex = index;
      }
    }
    values.splice(bestIndex, 2, bestSum);
    operations += 1;
  }
  return operations;
}

function partitionDisjointIndex(nums: number[]) {
  let partitionEnd = 0;
  let leftMax = nums[0];
  let runningMax = nums[0];
  for (let index = 1; index < nums.length; index += 1) {
    runningMax = Math.max(runningMax, nums[index]);
    if (nums[index] < leftMax) {
      partitionEnd = index;
      leftMax = runningMax;
    }
  }
  return partitionEnd + 1;
}

function maximumDistancePairValues(nums1: number[], nums2: number[]) {
  let best = 0;
  let left = 0;
  let right = 0;
  while (left < nums1.length && right < nums2.length) {
    if (left <= right && nums1[left] <= nums2[right]) {
      best = Math.max(best, right - left);
      right += 1;
    } else {
      left += 1;
      if (right < left) {
        right = left;
      }
    }
  }
  return best;
}

function tupleSameProductCount(nums: number[]) {
  const counts = new Map<number, number>();
  let tuples = 0;
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      const product = nums[left] * nums[right];
      const previous = counts.get(product) || 0;
      tuples += previous * 8;
      counts.set(product, previous + 1);
    }
  }
  return tuples;
}

function xorTripletCount(arr: number[]) {
  const prefix = [0];
  for (const value of arr) {
    prefix.push(prefix[prefix.length - 1] ^ value);
  }
  let count = 0;
  for (let start = 0; start < arr.length; start += 1) {
    for (let end = start + 1; end < arr.length; end += 1) {
      if (prefix[start] === prefix[end + 1]) {
        count += end - start;
      }
    }
  }
  return count;
}

function minXorOperations(nums: number[], k: number) {
  const xor = nums.reduce((value, next) => value ^ next, 0) ^ k;
  return xor.toString(2).replace(/0/g, "").length;
}

function minimumLengthAfterDeletingSimilarEnds(s: string) {
  let left = 0;
  let right = s.length - 1;
  while (left < right && s[left] === s[right]) {
    const char = s[left];
    while (left <= right && s[left] === char) {
      left += 1;
    }
    while (left <= right && s[right] === char) {
      right -= 1;
    }
  }
  return Math.max(0, right - left + 1);
}

function numberOfSubstringsAllThree(s: string) {
  const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
  let left = 0;
  let total = 0;
  for (let right = 0; right < s.length; right += 1) {
    counts[s[right]] += 1;
    while (counts.a && counts.b && counts.c) {
      total += s.length - right;
      counts[s[left]] -= 1;
      left += 1;
    }
  }
  return total;
}

function maximumProductAfterIncrements(nums: number[], k: number) {
  const values = [...nums];
  const modulo = 1_000_000_007;
  for (let step = 0; step < k; step += 1) {
    values.sort((left, right) => left - right);
    values[0] += 1;
  }
  return values.reduce((product, value) => (product * value) % modulo, 1);
}

function minimumFallingPathSum(matrix: number[][]) {
  let dp = [...matrix[0]];
  for (let row = 1; row < matrix.length; row += 1) {
    dp = matrix[row].map((value, column) => {
      const bestAbove = Math.min(dp[column] ?? Infinity, dp[column - 1] ?? Infinity, dp[column + 1] ?? Infinity);
      return value + bestAbove;
    });
  }
  return Math.min(...dp);
}

function infectionMinutes(root: TreeNode | null, start: number) {
  const graph = new Map<number, number[]>();
  const addEdge = (left: number, right: number) => {
    graph.set(left, [...(graph.get(left) || []), right]);
    graph.set(right, [...(graph.get(right) || []), left]);
  };
  const walk = (node: TreeNode | null | undefined) => {
    if (!node) {
      return;
    }
    graph.set(node.val, graph.get(node.val) || []);
    if (node.left) {
      addEdge(node.val, node.left.val);
    }
    if (node.right) {
      addEdge(node.val, node.right.val);
    }
    walk(node.left);
    walk(node.right);
  };
  walk(root);
  const queue: Array<[number, number]> = [[start, 0]];
  const seen = new Set([start]);
  let minutes = 0;
  while (queue.length) {
    const [node, distance] = queue.shift() as [number, number];
    minutes = Math.max(minutes, distance);
    for (const next of graph.get(node) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push([next, distance + 1]);
      }
    }
  }
  return minutes;
}

function replaceCousinValues(root: TreeNode | null) {
  const clone = cloneTree(root);
  if (!clone) {
    return [];
  }
  clone.val = 0;
  let level = [clone];
  while (level.length) {
    const nextLevel = level.flatMap((node) => [node.left, node.right].filter(Boolean) as TreeNode[]);
    const levelSum = nextLevel.reduce((sum, node) => sum + node.val, 0);
    for (const node of level) {
      const children = [node.left, node.right].filter(Boolean) as TreeNode[];
      const siblingSum = children.reduce((sum, child) => sum + child.val, 0);
      for (const child of children) {
        child.val = levelSum - siblingSum;
      }
    }
    level = nextLevel;
  }
  return compactLevelOrder(clone);
}

function cloneTree(root: TreeNode | null | undefined): TreeNode | null {
  if (!root) {
    return null;
  }
  return { val: root.val, left: cloneTree(root.left), right: cloneTree(root.right) };
}

function isCompleteBinaryTree(root: TreeNode | null) {
  const queue = [root];
  let foundGap = false;
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      foundGap = true;
      continue;
    }
    if (foundGap) {
      return false;
    }
    queue.push(node.left || null, node.right || null);
  }
  return true;
}

function shortestAlternatingPaths(n: number, redEdges: Array<[number, number]>, blueEdges: Array<[number, number]>) {
  const graph = [
    Array.from({ length: n }, () => [] as number[]),
    Array.from({ length: n }, () => [] as number[])
  ];
  for (const [from, to] of redEdges) {
    graph[0][from].push(to);
  }
  for (const [from, to] of blueEdges) {
    graph[1][from].push(to);
  }
  const distances = Array.from({ length: n }, () => [Infinity, Infinity]);
  const queue: Array<[number, number]> = [
    [0, 0],
    [0, 1]
  ];
  distances[0][0] = 0;
  distances[0][1] = 0;
  while (queue.length) {
    const [node, color] = queue.shift() as [number, number];
    const nextColor = 1 - color;
    for (const next of graph[nextColor][node]) {
      if (distances[next][nextColor] === Infinity) {
        distances[next][nextColor] = distances[node][color] + 1;
        queue.push([next, nextColor]);
      }
    }
  }
  return distances.map(([red, blue]) => {
    const best = Math.min(red, blue);
    return best === Infinity ? -1 : best;
  });
}

function allAncestorsDag(n: number, edges: Array<[number, number]>) {
  const graph = Array.from({ length: n }, () => [] as number[]);
  const indegree = Array(n).fill(0);
  const ancestors = Array.from({ length: n }, () => new Set<number>());
  for (const [from, to] of edges) {
    graph[from].push(to);
    indegree[to] += 1;
  }
  const queue = indegree.flatMap((degree, node) => (degree === 0 ? [node] : []));
  while (queue.length) {
    const node = queue.shift() as number;
    for (const next of graph[node]) {
      ancestors[next].add(node);
      for (const ancestor of ancestors[node]) {
        ancestors[next].add(ancestor);
      }
      indegree[next] -= 1;
      if (indegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  return ancestors.map((values) => [...values].sort((left, right) => left - right));
}

function maxProbabilityPath(n: number, edges: Array<[number, number]>, succProb: number[], start: number, end: number) {
  const graph = Array.from({ length: n }, () => [] as Array<[number, number]>);
  for (let index = 0; index < edges.length; index += 1) {
    const [from, to] = edges[index];
    graph[from].push([to, succProb[index]]);
    graph[to].push([from, succProb[index]]);
  }
  const probabilities = Array(n).fill(0);
  probabilities[start] = 1;
  const queue: Array<[number, number]> = [[start, 1]];
  while (queue.length) {
    queue.sort((left, right) => right[1] - left[1]);
    const [node, probability] = queue.shift() as [number, number];
    if (node === end) {
      return probability;
    }
    if (probability < probabilities[node]) {
      continue;
    }
    for (const [next, edgeProbability] of graph[node]) {
      const candidate = probability * edgeProbability;
      if (candidate > probabilities[next]) {
        probabilities[next] = candidate;
        queue.push([next, candidate]);
      }
    }
  }
  return 0;
}

function canMergeTriplets(triplets: Array<[number, number, number]>, target: [number, number, number]) {
  const covered = [false, false, false];
  for (const triplet of triplets) {
    if (triplet.some((value, index) => value > target[index])) {
      continue;
    }
    for (let index = 0; index < 3; index += 1) {
      covered[index] = covered[index] || triplet[index] === target[index];
    }
  }
  return covered.every(Boolean);
}

function maximumMatrixAbsoluteSum(matrix: number[][]) {
  let sum = 0;
  let negatives = 0;
  let minAbs = Infinity;
  for (const row of matrix) {
    for (const value of row) {
      const abs = Math.abs(value);
      sum += abs;
      minAbs = Math.min(minAbs, abs);
      if (value < 0) {
        negatives += 1;
      }
    }
  }
  return negatives % 2 === 0 || minAbs === 0 ? sum : sum - minAbs * 2;
}

function scoreMatrixAfterFlips(grid: number[][]) {
  const rows = grid.length;
  const columns = grid[0].length;
  let score = rows * 2 ** (columns - 1);
  for (let column = 1; column < columns; column += 1) {
    let ones = 0;
    for (let row = 0; row < rows; row += 1) {
      const valueAfterRowFlip = grid[row][0] === 1 ? grid[row][column] : 1 - grid[row][column];
      ones += valueAfterRowFlip;
    }
    score += Math.max(ones, rows - ones) * 2 ** (columns - column - 1);
  }
  return score;
}

function subarraysDivisibleByK(nums: number[], k: number) {
  const counts = new Map<number, number>([[0, 1]]);
  let prefix = 0;
  let total = 0;
  for (const value of nums) {
    prefix = ((prefix + value) % k + k) % k;
    total += counts.get(prefix) || 0;
    counts.set(prefix, (counts.get(prefix) || 0) + 1);
  }
  return total;
}

function countNiceSubarrays(nums: number[], k: number) {
  return countSubarraysWithAtMostOdds(nums, k) - countSubarraysWithAtMostOdds(nums, k - 1);
}

function countSubarraysWithAtMostOdds(nums: number[], k: number) {
  if (k < 0) {
    return 0;
  }
  let left = 0;
  let odds = 0;
  let total = 0;
  for (let right = 0; right < nums.length; right += 1) {
    odds += nums[right] % 2;
    while (odds > k) {
      odds -= nums[left] % 2;
      left += 1;
    }
    total += right - left + 1;
  }
  return total;
}

function collectApplesTime(n: number, edges: Array<[number, number]>, hasApple: boolean[]) {
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [left, right] of edges) {
    graph[left].push(right);
    graph[right].push(left);
  }
  const dfs = (node: number, parent: number): number => {
    let time = 0;
    for (const next of graph[node]) {
      if (next === parent) {
        continue;
      }
      const childTime = dfs(next, node);
      if (childTime > 0 || hasApple[next]) {
        time += childTime + 2;
      }
    }
    return time;
  };
  return dfs(0, -1);
}

function distributeCoinsMoves(root: TreeNode | null) {
  let moves = 0;
  const balance = (node: TreeNode | null | undefined): number => {
    if (!node) {
      return 0;
    }
    const left = balance(node.left);
    const right = balance(node.right);
    moves += Math.abs(left) + Math.abs(right);
    return node.val + left + right - 1;
  };
  balance(root);
  return moves;
}

function closedIslandCount(grid: number[][]) {
  const copy = grid.map((row) => [...row]);
  const rows = copy.length;
  const columns = copy[0].length;
  const flood = (row: number, column: number): boolean => {
    if (row < 0 || column < 0 || row >= rows || column >= columns) {
      return false;
    }
    if (copy[row][column] === 1) {
      return true;
    }
    copy[row][column] = 1;
    const up = flood(row - 1, column);
    const down = flood(row + 1, column);
    const left = flood(row, column - 1);
    const right = flood(row, column + 1);
    return up && down && left && right;
  };
  let count = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (copy[row][column] === 0 && flood(row, column)) {
        count += 1;
      }
    }
  }
  return count;
}

function shortestBridgeLength(grid: number[][]) {
  const copy = grid.map((row) => [...row]);
  const rows = copy.length;
  const columns = copy[0].length;
  const queue: Array<[number, number, number]> = [];
  const markIsland = (row: number, column: number) => {
    if (row < 0 || column < 0 || row >= rows || column >= columns || copy[row][column] !== 1) {
      return;
    }
    copy[row][column] = 2;
    queue.push([row, column, 0]);
    markIsland(row + 1, column);
    markIsland(row - 1, column);
    markIsland(row, column + 1);
    markIsland(row, column - 1);
  };
  let marked = false;
  for (let row = 0; row < rows && !marked; row += 1) {
    for (let column = 0; column < columns && !marked; column += 1) {
      if (copy[row][column] === 1) {
        markIsland(row, column);
        marked = true;
      }
    }
  }
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  while (queue.length) {
    const [row, column, distance] = queue.shift() as [number, number, number];
    for (const [rowDelta, columnDelta] of directions) {
      const nextRow = row + rowDelta;
      const nextColumn = column + columnDelta;
      if (nextRow < 0 || nextColumn < 0 || nextRow >= rows || nextColumn >= columns || copy[nextRow][nextColumn] === 2) {
        continue;
      }
      if (copy[nextRow][nextColumn] === 1) {
        return distance;
      }
      copy[nextRow][nextColumn] = 2;
      queue.push([nextRow, nextColumn, distance + 1]);
    }
  }
  return 0;
}

function minCostTickets(days: number[], costs: [number, number, number]) {
  const durations = [1, 7, 30];
  const memo = new Map<number, number>();
  const dp = (index: number): number => {
    if (index >= days.length) {
      return 0;
    }
    if (memo.has(index)) {
      return memo.get(index) as number;
    }
    let best = Infinity;
    for (let pass = 0; pass < durations.length; pass += 1) {
      let next = index;
      const coveredUntil = days[index] + durations[pass];
      while (next < days.length && days[next] < coveredUntil) {
        next += 1;
      }
      best = Math.min(best, costs[pass] + dp(next));
    }
    memo.set(index, best);
    return best;
  };
  return dp(0);
}

function maxFrequencyAfterIncrements(nums: number[], k: number) {
  const sorted = [...nums].sort((left, right) => left - right);
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < sorted.length; right += 1) {
    sum += sorted[right];
    while (sorted[right] * (right - left + 1) - sum > k) {
      sum -= sorted[left];
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function kSizeSubarrayPowers(nums: number[], k: number) {
  const result: number[] = [];
  let runLength = 1;
  for (let index = 0; index < nums.length; index += 1) {
    if (index > 0) {
      runLength = nums[index] === nums[index - 1] + 1 ? runLength + 1 : 1;
    }
    if (index >= k - 1) {
      result.push(runLength >= k ? nums[index] : -1);
    }
  }
  return result;
}

function searchSuggestions(products: string[], searchWord: string) {
  const sorted = [...products].sort();
  const result: string[][] = [];
  let prefix = "";
  for (const char of searchWord) {
    prefix += char;
    result.push(sorted.filter((product) => product.startsWith(prefix)).slice(0, 3));
  }
  return result;
}

function furthestReachableBuilding(heights: number[], bricks: number, ladders: number) {
  const climbs: number[] = [];
  for (let index = 0; index < heights.length - 1; index += 1) {
    const climb = heights[index + 1] - heights[index];
    if (climb <= 0) {
      continue;
    }
    climbs.push(climb);
    climbs.sort((left, right) => left - right);
    if (climbs.length > ladders) {
      bricks -= climbs.shift() as number;
    }
    if (bricks < 0) {
      return index;
    }
  }
  return heights.length - 1;
}

function smallestChairForFriend(times: Array<[number, number]>, targetFriend: number) {
  const arrivals = times.map(([arrival, leaving], friend) => ({ arrival, friend, leaving })).sort((left, right) => left.arrival - right.arrival);
  const freeChairs: number[] = [];
  const occupied: Array<[number, number]> = [];
  let nextChair = 0;
  for (const { arrival, friend, leaving } of arrivals) {
    occupied.sort((left, right) => left[0] - right[0]);
    while (occupied.length && occupied[0][0] <= arrival) {
      freeChairs.push((occupied.shift() as [number, number])[1]);
    }
    freeChairs.sort((left, right) => left - right);
    const chair = freeChairs.length ? (freeChairs.shift() as number) : nextChair++;
    if (friend === targetFriend) {
      return chair;
    }
    occupied.push([leaving, chair]);
  }
  return -1;
}

function balancedBstLevelOrder(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  return compactLevelOrder(buildBalancedBst(sorted, 0, sorted.length - 1));
}

function buildBalancedBst(values: number[], left: number, right: number): TreeNode | null {
  if (left > right) {
    return null;
  }
  const middle = Math.floor((left + right) / 2);
  return { val: values[middle], left: buildBalancedBst(values, left, middle - 1), right: buildBalancedBst(values, middle + 1, right) };
}

function minLevelSortSwaps(root: TreeNode | null) {
  if (!root) {
    return 0;
  }
  let swaps = 0;
  let level = [root];
  while (level.length) {
    swaps += minSwapsToSort(level.map((node) => node.val));
    level = level.flatMap((node) => [node.left, node.right].filter(Boolean) as TreeNode[]);
  }
  return swaps;
}

function minSwapsToSort(values: number[]) {
  const indexed = values.map((value, index) => ({ index, value })).sort((left, right) => left.value - right.value || left.index - right.index);
  const seen = new Set<number>();
  let swaps = 0;
  for (let index = 0; index < indexed.length; index += 1) {
    if (seen.has(index) || indexed[index].index === index) {
      continue;
    }
    let cycle = 0;
    let cursor = index;
    while (!seen.has(cursor)) {
      seen.add(cursor);
      cursor = indexed[cursor].index;
      cycle += 1;
    }
    swaps += cycle - 1;
  }
  return swaps;
}

function kthPerfectSubtreeSize(root: TreeNode | null, k: number) {
  const sizes: number[] = [];
  perfectSubtreeInfo(root, sizes);
  sizes.sort((left, right) => right - left);
  return sizes[k - 1] ?? -1;
}

function perfectSubtreeInfo(node: TreeNode | null | undefined, sizes: number[]): { height: number; perfect: boolean; size: number } {
  if (!node) {
    return { height: 0, perfect: true, size: 0 };
  }
  const left = perfectSubtreeInfo(node.left, sizes);
  const right = perfectSubtreeInfo(node.right, sizes);
  const size = left.size + right.size + 1;
  const perfect = left.perfect && right.perfect && left.height === right.height;
  if (perfect) {
    sizes.push(size);
  }
  return { height: Math.max(left.height, right.height) + 1, perfect, size };
}

function maxSumBstSubtree(root: TreeNode | null) {
  let best = 0;
  function visit(node: TreeNode | null | undefined): { isBst: boolean; max: number; min: number; sum: number } {
    if (!node) {
      return { isBst: true, max: -Infinity, min: Infinity, sum: 0 };
    }
    const left = visit(node.left);
    const right = visit(node.right);
    if (left.isBst && right.isBst && node.val > left.max && node.val < right.min) {
      const sum = left.sum + right.sum + node.val;
      best = Math.max(best, sum);
      return { isBst: true, max: Math.max(right.max, node.val), min: Math.min(left.min, node.val), sum };
    }
    return { isBst: false, max: Infinity, min: -Infinity, sum: 0 };
  }
  visit(root);
  return best;
}

function longestZigzagPath(root: TreeNode | null) {
  let best = 0;
  function walk(node: TreeNode | null | undefined, lastMove: "left" | "right" | null, length: number) {
    if (!node) {
      return;
    }
    best = Math.max(best, length);
    walk(node.left, "left", lastMove === "right" ? length + 1 : 1);
    walk(node.right, "right", lastMove === "left" ? length + 1 : 1);
  }
  walk(root, null, 0);
  return best;
}

function makeNetworkConnected(n: number, connections: Array<[number, number]>) {
  if (connections.length < n - 1) {
    return -1;
  }
  return countGraphComponents(n, connections) - 1;
}

function countGraphComponents(n: number, edges: Array<[number, number]>) {
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [left, right] of edges) {
    graph[left].push(right);
    graph[right].push(left);
  }
  const seen = new Set<number>();
  let components = 0;
  for (let node = 0; node < n; node += 1) {
    if (!seen.has(node)) {
      components += 1;
      getGraphComponentSize(node, graph, seen);
    }
  }
  return components;
}

function minReorderRoutesToZero(n: number, connections: Array<[number, number]>) {
  const graph = Array.from({ length: n }, () => [] as Array<[number, number]>);
  for (const [from, to] of connections) {
    graph[from].push([to, 1]);
    graph[to].push([from, 0]);
  }
  const seen = new Set([0]);
  const stack = [0];
  let reversals = 0;
  while (stack.length) {
    const node = stack.pop() as number;
    for (const [next, cost] of graph[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        reversals += cost;
        stack.push(next);
      }
    }
  }
  return reversals;
}

function possibleBipartition(n: number, dislikes: Array<[number, number]>) {
  const graph = Array.from({ length: n + 1 }, () => [] as number[]);
  for (const [left, right] of dislikes) {
    graph[left].push(right);
    graph[right].push(left);
  }
  return isBipartiteGraph(graph.slice(1).map((neighbors) => neighbors.map((value) => value - 1)));
}

function shortestBinaryMatrixPath(grid: number[][]) {
  const size = grid.length;
  if (!size || grid[0][0] || grid[size - 1][size - 1]) {
    return -1;
  }
  const directions = [-1, 0, 1];
  const queue: Array<[number, number, number]> = [[0, 0, 1]];
  const seen = new Set(["0,0"]);
  while (queue.length) {
    const [row, column, distance] = queue.shift() as [number, number, number];
    if (row === size - 1 && column === size - 1) {
      return distance;
    }
    for (const rowStep of directions) {
      for (const columnStep of directions) {
        if (!rowStep && !columnStep) {
          continue;
        }
        const nextRow = row + rowStep;
        const nextColumn = column + columnStep;
        const key = `${nextRow},${nextColumn}`;
        if (nextRow >= 0 && nextColumn >= 0 && nextRow < size && nextColumn < size && !grid[nextRow][nextColumn] && !seen.has(key)) {
          seen.add(key);
          queue.push([nextRow, nextColumn, distance + 1]);
        }
      }
    }
  }
  return -1;
}

function countLetters(text: string) {
  const counts = new Map<string, number>();
  for (const char of text) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  return counts;
}
