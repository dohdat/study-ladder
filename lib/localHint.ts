import type { Question } from "../types/study";

const QUESTION_HINTS: Record<string, string> = {
  "array-first-duplicate": [
    "Scan left to right and keep a set of values you already saw.",
    "```js",
    "if (seen.has(num)) return num;",
    "```"
  ].join("\n"),
  "string-valid-palindrome": [
    "Use two pointers and skip anything that is not a letter or digit before comparing.",
    "```js",
    "while (left < right && !/[a-z0-9]/i.test(text[left])) left++;",
    "```"
  ].join("\n"),
  "array-two-sum": [
    "Store each number's index, then look for the complement before saving the current number.",
    "```js",
    "const need = target - nums[i];",
    "```"
  ].join("\n"),
  "string-longest-unique": [
    "Keep a left boundary and move it past the last seen index when a character repeats.",
    "```js",
    "left = Math.max(left, lastSeen.get(ch) + 1);",
    "```"
  ].join("\n"),
  "array-merge-intervals": [
    "Sort copied intervals by start, then extend the previous merged interval when they overlap.",
    "```js",
    "if (start <= last[1]) last[1] = Math.max(last[1], end);",
    "```"
  ].join("\n"),
  "stack-valid-brackets": [
    "Push expected closing brackets onto a stack, then every closer must match the top.",
    "```js",
    "if (stack.pop() !== ch) return false;",
    "```"
  ].join("\n"),
  "dp-climb-cost": [
    "Track the cheapest cost to stand on the previous two steps, then roll them forward.",
    "```js",
    "const next = cost[i] + Math.min(prev1, prev2);",
    "```"
  ].join("\n"),
  "binary-search-rotated": [
    "Binary search still works if each step detects which half is currently sorted.",
    "```js",
    "if (nums[left] <= nums[mid]) {",
    "```"
  ].join("\n"),
  "tree-level-order": [
    "Process the queue one level at a time by reading its size before the inner loop.",
    "```js",
    "const levelSize = queue.length;",
    "```"
  ].join("\n"),
  "heap-top-k": [
    "Count frequencies first, then sort unique values by frequency descending and value ascending.",
    "```js",
    "items.sort((a, b) => counts.get(b) - counts.get(a) || a - b);",
    "```"
  ].join("\n"),
  "graph-shortest-path": [
    "Build an adjacency map, then BFS from start while tracking distance and visited nodes.",
    "```js",
    "queue.push([neighbor, distance + 1]);",
    "```"
  ].join("\n"),
  "dp-coin-change": [
    "Let dp[x] mean the fewest coins for amount x, and relax each coin from smaller amounts.",
    "```js",
    "dp[value] = Math.min(dp[value], dp[value - coin] + 1);",
    "```"
  ].join("\n")
};

export function createLocalHint(question: Question) {
  return question.hint || QUESTION_HINTS[question.id] || [
    `Focus on the ${question.topics[0]?.toLowerCase() || "core"} pattern before writing the full solution.`,
    "```js",
    "// write the smallest state you need first",
    "```"
  ].join("\n");
}
