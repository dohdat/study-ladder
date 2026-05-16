export const RUNNER_FRAME = "sandbox.html";

export const STATUS_COLOR = {
  default: "gray",
  pass: "green",
  fail: "red"
} as const;

export type StatusTone = keyof typeof STATUS_COLOR;
