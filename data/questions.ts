import type { Question } from "../types/study";

export const questions: Question[] = [
  {
    id: "array-first-duplicate",
    title: "First Duplicate",
    difficulty: 1,
    topics: ["Arrays", "Hash Set"],
    functionName: "firstDuplicate",
    prompt: "Return the first number that appears twice while scanning left to right. If no number repeats, return -1.",
    constraints: ["Input length is between 0 and 1000.", "Numbers are integers.", "Keep the original array unchanged."],
    starter: "function firstDuplicate(nums) {\n  \n}",
    examples: [
      { input: "firstDuplicate([2, 1, 3, 5, 3, 2])", output: "3" },
      { input: "firstDuplicate([1, 2, 3])", output: "-1" }
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
    topics: ["Strings", "Two Pointers"],
    functionName: "isCleanPalindrome",
    prompt: "Return true when the text is a palindrome after ignoring spaces, punctuation, and letter casing.",
    constraints: ["Only compare letters and digits.", "An empty cleaned string is a palindrome."],
    starter: "function isCleanPalindrome(text) {\n  \n}",
    examples: [
      { input: "isCleanPalindrome('A man, a plan, a canal: Panama')", output: "true" },
      { input: "isCleanPalindrome('race a car')", output: "false" }
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
    topics: ["Arrays", "Hash Map"],
    functionName: "twoSum",
    prompt: "Return the indices of two different numbers whose sum equals the target. Return the smaller index first. There is exactly one answer.",
    constraints: ["Input length is between 2 and 2000.", "Do not use the same element twice.", "Return an array like [0, 2]."],
    starter: "function twoSum(nums, target) {\n  \n}",
    examples: [
      { input: "twoSum([2, 7, 11, 15], 9)", output: "[0, 1]" },
      { input: "twoSum([3, 2, 4], 6)", output: "[1, 2]" }
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
    topics: ["Strings", "Sliding Window", "Hash Map"],
    functionName: "longestUniqueSubstring",
    prompt: "Return the length of the longest substring that contains no repeated characters.",
    constraints: ["Input length is between 0 and 5000.", "Characters are case-sensitive."],
    starter: "function longestUniqueSubstring(s) {\n  \n}",
    examples: [
      { input: "longestUniqueSubstring('abcabcbb')", output: "3" },
      { input: "longestUniqueSubstring('bbbbb')", output: "1" }
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
    topics: ["Arrays", "Sorting", "Intervals"],
    functionName: "mergeIntervals",
    prompt: "Merge overlapping intervals and return them sorted by start time.",
    constraints: ["Each interval is [start, end].", "Touching intervals like [1, 3] and [3, 5] should merge.", "Do not mutate the original interval arrays."],
    starter: "function mergeIntervals(intervals) {\n  \n}",
    examples: [
      { input: "mergeIntervals([[1,3],[2,6],[8,10]])", output: "[[1,6],[8,10]]" },
      { input: "mergeIntervals([[1,4],[4,5]])", output: "[[1,5]]" }
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
    topics: ["Stacks", "Strings"],
    functionName: "validBrackets",
    prompt: "Return true if every opening bracket is closed by the same type of bracket in the correct order.",
    constraints: ["The string contains only (), {}, and [].", "An empty string is valid."],
    starter: "function validBrackets(s) {\n  \n}",
    examples: [
      { input: "validBrackets('()[]{}')", output: "true" },
      { input: "validBrackets('(]')", output: "false" }
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
    topics: ["Dynamic Programming"],
    functionName: "minClimbCost",
    prompt: "You can climb one or two steps at a time. Each step has a cost paid when you step on it. Return the minimum cost to reach just beyond the final step.",
    constraints: ["Input length is between 2 and 1000.", "Costs are non-negative integers.", "You may start on step 0 or step 1."],
    starter: "function minClimbCost(cost) {\n  \n}",
    examples: [
      { input: "minClimbCost([10, 15, 20])", output: "15" },
      { input: "minClimbCost([1,100,1,1,1,100,1,1,100,1])", output: "6" }
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
    topics: ["Binary Search", "Arrays"],
    functionName: "searchRotated",
    prompt: "Return the index of target in a sorted array that was rotated at an unknown pivot. Return -1 when target is missing.",
    constraints: ["All numbers are unique.", "Aim for O(log n) time.", "Input length is between 0 and 5000."],
    starter: "function searchRotated(nums, target) {\n  \n}",
    examples: [
      { input: "searchRotated([4,5,6,7,0,1,2], 0)", output: "4" },
      { input: "searchRotated([4,5,6,7,0,1,2], 3)", output: "-1" }
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
    topics: ["Trees", "Queue", "BFS"],
    functionName: "levelOrderValues",
    prompt: "Given a binary tree object with val, left, and right fields, return an array of values grouped by depth.",
    constraints: ["Return [] for a null root.", "Keep values left-to-right within each level."],
    starter: "function levelOrderValues(root) {\n  \n}",
    examples: [
      { input: "levelOrderValues({ val: 1, left: { val: 2 }, right: { val: 3 } })", output: "[[1],[2,3]]" }
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
    topics: ["Hash Map", "Sorting"],
    functionName: "topKFrequent",
    prompt: "Return the k most frequent numbers. When frequencies tie, the smaller number should come first.",
    constraints: ["Return the result sorted by frequency descending, then value ascending.", "Input length is between 1 and 5000."],
    starter: "function topKFrequent(nums, k) {\n  \n}",
    examples: [
      { input: "topKFrequent([1,1,1,2,2,3], 2)", output: "[1,2]" },
      { input: "topKFrequent([4,4,1,1,2], 2)", output: "[1,4]" }
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
    topics: ["Graphs", "BFS", "Queue"],
    functionName: "shortestPathLength",
    prompt: "Given directed edges [from, to], return the fewest edges needed to travel from start to target. Return -1 if target is unreachable.",
    constraints: ["Nodes are strings.", "Edges are unweighted.", "The graph may contain cycles."],
    starter: "function shortestPathLength(edges, start, target) {\n  \n}",
    examples: [
      { input: "shortestPathLength([['A','B'],['B','C']], 'A', 'C')", output: "2" },
      { input: "shortestPathLength([['A','B']], 'B', 'A')", output: "-1" }
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
    topics: ["Dynamic Programming"],
    functionName: "coinChange",
    prompt: "Return the fewest number of coins needed to make the amount. Return -1 when the amount cannot be made.",
    constraints: ["You may use each coin value unlimited times.", "Amount is between 0 and 10000.", "Coin values are positive integers."],
    starter: "function coinChange(coins, amount) {\n  \n}",
    examples: [
      { input: "coinChange([1, 2, 5], 11)", output: "3" },
      { input: "coinChange([2], 3)", output: "-1" }
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
