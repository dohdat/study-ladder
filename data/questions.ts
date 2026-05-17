import type { Question } from "../types/study";

const curatedQuestions: Question[] = [
  {
    id: "array-first-duplicate",
    title: "First Duplicate",
    difficulty: 1,
    rating: 1050,
    topics: ["Arrays", "Hash Set"],
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
    topics: ["Strings", "Two Pointers"],
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
    topics: ["Arrays", "Hash Map"],
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
    topics: ["Strings", "Sliding Window", "Hash Map"],
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
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "The target 0 appears at index 4." },
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

type GeneratedFamily = {
  buildCase: (variant: number, testIndex: number) => TestInput;
  constraints: string[];
  count: number;
  difficulty: Question["difficulty"];
  functionPrefix: string;
  prompt: (variant: number) => string;
  ratingBase: number;
  solver: (args: unknown[], variant: number) => unknown;
  starterArgs: string;
  title: (variant: number) => string;
  topics: string[];
};

const GENERATED_TEST_COUNT = 10;
const GENERATED_FAMILY_COUNT = 10;
const RATING_STEP = 17;
const GENERATED_FAMILIES: GeneratedFamily[] = [
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant, index)], name: `counts values at least ${variant}` }),
    constraints: ["Return a number.", "Input values are integers.", "Do not mutate the original array."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 1,
    functionPrefix: "countAtLeast",
    prompt: (variant) => `Return how many numbers in nums are greater than or equal to ${variant}.`,
    ratingBase: 1030,
    solver: (args, variant) => (args[0] as number[]).filter((value) => value >= variant).length,
    starterArgs: "nums",
    title: (variant) => `Count At Least ${variant}`,
    topics: ["Arrays", "Counting"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 1, index)], name: `sums positives with floor ${variant}` }),
    constraints: ["Return a number.", "Ignore negative values.", "Only include values greater than the threshold."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 1,
    functionPrefix: "sumAbove",
    prompt: (variant) => `Return the sum of all numbers in nums that are greater than ${variant}.`,
    ratingBase: 1090,
    solver: (args, variant) => (args[0] as number[]).filter((value) => value > variant).reduce((sum, value) => sum + value, 0),
    starterArgs: "nums",
    title: (variant) => `Sum Above ${variant}`,
    topics: ["Arrays", "Math"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeString(variant, index)], name: `checks vowel count ${variant}` }),
    constraints: ["Vowels are a, e, i, o, u.", "Treat uppercase and lowercase as vowels.", "Return a number."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 1,
    functionPrefix: "countVowels",
    prompt: (variant) => `Return the number of vowels in text, then add ${variant - 1}.`,
    ratingBase: 1160,
    solver: (args, variant) => countVowels(String(args[0])) + variant - 1,
    starterArgs: "text",
    title: (variant) => `Vowel Score ${variant}`,
    topics: ["Strings", "Counting"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 2, index)], name: `finds first over ${variant}` }),
    constraints: ["Return -1 if no value qualifies.", "Scan from left to right.", "Do not sort the input."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 2,
    functionPrefix: "firstGreaterThan",
    prompt: (variant) => `Return the first number in nums that is greater than ${variant}. Return -1 if none exists.`,
    ratingBase: 1320,
    solver: (args, variant) => (args[0] as number[]).find((value) => value > variant) ?? -1,
    starterArgs: "nums",
    title: (variant) => `First Greater Than ${variant}`,
    topics: ["Arrays", "Linear Scan"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 3, index), variant], name: `counts pairs divisible by ${variant + 2}` }),
    constraints: ["Count index pairs i < j.", "Return a number.", "Modulo arithmetic is allowed."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 2,
    functionPrefix: "countModuloPairs",
    prompt: (variant) => `Return the number of index pairs whose sum is divisible by ${variant + 2}.`,
    ratingBase: 1480,
    solver: (args, variant) => countModuloPairs(args[0] as number[], variant + 2),
    starterArgs: "nums, marker",
    title: (variant) => `Modulo Pair Count ${variant + 2}`,
    topics: ["Arrays", "Hash Map"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeString(variant + 1, index)], name: `compresses text variant ${variant}` }),
    constraints: ["Compress consecutive equal characters.", "Use the character followed by its count.", "Return a string."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 2,
    functionPrefix: "runLengthEncode",
    prompt: () => "Return a run-length encoded string where each group is the character followed by the group count.",
    ratingBase: 1540,
    solver: (args) => runLengthEncode(String(args[0])),
    starterArgs: "text",
    title: (variant) => `Run Length Encode ${variant}`,
    topics: ["Strings", "Two Pointers"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 4, index), variant + 5], name: `finds longest window sum ${variant + 5}` }),
    constraints: ["Numbers are non-negative.", "Return a window length.", "Use any correct approach."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 3,
    functionPrefix: "longestSumAtMost",
    prompt: (variant) => `Return the length of the longest contiguous subarray whose sum is at most ${variant + 5}.`,
    ratingBase: 1780,
    solver: (args, variant) => longestSumAtMost(args[0] as number[], variant + 5),
    starterArgs: "nums, limit",
    title: (variant) => `Longest Sum At Most ${variant + 5}`,
    topics: ["Arrays", "Sliding Window"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 5, index)], name: `max gap variant ${variant}` }),
    constraints: ["Sort a copy of the input.", "Return 0 for fewer than two numbers.", "Return the largest adjacent sorted difference."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 3,
    functionPrefix: "maxSortedGap",
    prompt: () => "Return the largest gap between adjacent values after sorting nums ascending.",
    ratingBase: 1940,
    solver: (args) => maxSortedGap(args[0] as number[]),
    starterArgs: "nums",
    title: (variant) => `Max Sorted Gap ${variant}`,
    topics: ["Sorting", "Arrays"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeGrid(variant, index)], name: `counts islands variant ${variant}` }),
    constraints: ["Grid cells are 0 or 1.", "Use four-directional adjacency.", "Do not mutate the original grid."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 3,
    functionPrefix: "countIslands",
    prompt: () => "Return the number of islands of 1s in the grid using four-directional adjacency.",
    ratingBase: 2120,
    solver: (args) => countIslands(args[0] as number[][]),
    starterArgs: "grid",
    title: (variant) => `Island Count ${variant}`,
    topics: ["Graphs", "DFS", "Grid"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 6, index)], name: `lis variant ${variant}` }),
    constraints: ["Return a length.", "Subsequence does not need to be contiguous.", "Use strict increasing order."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 4,
    functionPrefix: "lisLength",
    prompt: () => "Return the length of the longest strictly increasing subsequence in nums.",
    ratingBase: 2380,
    solver: (args) => lisLength(args[0] as number[]),
    starterArgs: "nums",
    title: (variant) => `Increasing Subsequence ${variant}`,
    topics: ["Dynamic Programming", "Arrays"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeWeightedEdges(variant, index), "A", "E"], name: `cheapest path variant ${variant}` }),
    constraints: ["Edges are [from, to, cost].", "Return -1 when target is unreachable.", "Costs are positive integers."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 4,
    functionPrefix: "cheapestPath",
    prompt: () => "Return the cheapest path cost from start to target in a directed weighted graph.",
    ratingBase: 2620,
    solver: (args) => cheapestPath(args[0] as Array<[string, string, number]>, String(args[1]), String(args[2])),
    starterArgs: "edges, start, target",
    title: (variant) => `Cheapest Path ${variant}`,
    topics: ["Graphs", "Dijkstra"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeString(variant + 2, index), makeString(variant + 3, index + 1)], name: `edit distance variant ${variant}` }),
    constraints: ["Insert, delete, and replace each cost 1.", "Return a number.", "Strings are short lowercase words."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 4,
    functionPrefix: "editDistance",
    prompt: () => "Return the minimum edit distance between wordA and wordB.",
    ratingBase: 2780,
    solver: (args) => editDistance(String(args[0]), String(args[1])),
    starterArgs: "wordA, wordB",
    title: (variant) => `Edit Distance ${variant}`,
    topics: ["Dynamic Programming", "Strings"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 7, index), variant + 3], name: `split array variant ${variant}` }),
    constraints: ["Preserve original order.", "Create at most k non-empty groups.", "Minimize the largest group sum."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 5,
    functionPrefix: "splitArrayLargestSum",
    prompt: () => "Split nums into at most k contiguous groups and return the minimized largest group sum.",
    ratingBase: 3100,
    solver: (args) => splitArrayLargestSum(args[0] as number[], Number(args[1])),
    starterArgs: "nums, k",
    title: (variant) => `Split Array Limit ${variant}`,
    topics: ["Binary Search", "Dynamic Programming"]
  },
  {
    buildCase: (variant, index) => ({ args: [makeNumberList(variant + 8, index)], name: `partition variant ${variant}` }),
    constraints: ["Return true or false.", "Each number may be used once.", "The two groups must have equal sum."],
    count: GENERATED_FAMILY_COUNT,
    difficulty: 5,
    functionPrefix: "canPartitionEqual",
    prompt: () => "Return true if nums can be partitioned into two groups with equal sum.",
    ratingBase: 3300,
    solver: (args) => canPartitionEqual(args[0] as number[]),
    starterArgs: "nums",
    title: (variant) => `Equal Partition ${variant}`,
    topics: ["Dynamic Programming", "Knapsack"]
  }
];

const generatedQuestions = GENERATED_FAMILIES.flatMap((family) => {
  return Array.from({ length: family.count }, (_, index) => createGeneratedQuestion(family, index + 1));
});

export const questions: Question[] = [...curatedQuestions, ...generatedQuestions];

function createGeneratedQuestion(family: GeneratedFamily, variant: number): Question {
  const tests = Array.from({ length: GENERATED_TEST_COUNT }, (_, index) => createGeneratedTest(family, variant, index));
  return {
    constraints: family.constraints,
    difficulty: family.difficulty,
    examples: [
      { input: formatArgs(tests[0].args), output: JSON.stringify(tests[0].expected), explanation: "The expected output follows directly from the rule in the prompt." },
      { input: formatArgs(tests[1].args), output: JSON.stringify(tests[1].expected), explanation: "This second case covers a different input shape for the same rule." }
    ],
    functionName: `${family.functionPrefix}${variant}`,
    id: `generated-${family.functionPrefix}-${variant}`,
    prompt: family.prompt(variant),
    rating: family.ratingBase + variant * RATING_STEP,
    starter: `function ${family.functionPrefix}${variant}(${family.starterArgs}) {\n  \n}`,
    tests,
    title: family.title(variant),
    topics: family.topics
  };
}

function createGeneratedTest(family: GeneratedFamily, variant: number, index: number) {
  const test = family.buildCase(variant, index);
  return { ...test, expected: family.solver(test.args, variant) };
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

function countVowels(text: string) {
  return [...text.toLowerCase()].filter((char) => "aeiou".includes(char)).length;
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
