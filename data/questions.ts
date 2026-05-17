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
    topics: ["Strings", "Hash Map"]
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
    topics: ["Arrays", "Hash Set"]
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
    topics: ["Arrays", "Hash Map", "Prefix Sum"]
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
    topics: ["Intervals", "Sorting", "Heap"]
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

const generatedQuestions = createGeneratedQuestions();

export const questions: Question[] = [...curatedQuestions, ...generatedQuestions];

function createGeneratedQuestion(family: GeneratedFamily, variant: number): Question {
  const tests = Array.from({ length: GENERATED_TEST_COUNT }, (_, index) => createGeneratedTest(family, variant, index));
  const functionName = getGeneratedFunctionName(family, variant);
  return {
    constraints: family.constraints,
    difficulty: family.difficulty,
    examples: [
      { input: formatArgs(tests[0].args), output: JSON.stringify(tests[0].expected), explanation: "The expected output follows directly from the rule in the prompt." },
      { input: formatArgs(tests[1].args), output: JSON.stringify(tests[1].expected), explanation: "This second case covers a different input shape for the same rule." }
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
