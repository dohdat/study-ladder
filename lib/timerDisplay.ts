import { getQuestionTimeLimitMs } from "./studyCore";
import type { Question } from "../types/study";

const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTE_MS = SECONDS_PER_MINUTE * SECOND_MS;
const TIMER_PAD = 2;
const PERCENT_MAX = 100;

export function getTimerDisplay(currentQuestion: Question | null, timeRemainingMs: number, modifiedTimeLimitMs?: number) {
  const totalTimeLimitMs = currentQuestion ? modifiedTimeLimitMs ?? getQuestionTimeLimitMs(currentQuestion) : 0;
  const timeUsedPercent = totalTimeLimitMs ? ((totalTimeLimitMs - timeRemainingMs) / totalTimeLimitMs) * PERCENT_MAX : 0;
  const minutes = Math.floor(timeRemainingMs / MINUTE_MS);
  const seconds = Math.floor((timeRemainingMs % MINUTE_MS) / SECOND_MS);
  return {
    timeUsedPercent,
    timerLabel: `${minutes}:${String(seconds).padStart(TIMER_PAD, "0")}`,
    timerColor: timeRemainingMs <= MINUTE_MS ? "red" : "blue"
  };
}
