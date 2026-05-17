import { questions } from "../data/questions";
import type { StudyState } from "../types/study";

export const DEFAULT_PLAYER_RATING = 1000;

const ELO_SCALE = 400;
const ELO_BASE = 10;
const ELO_K_FACTOR = 32;
const PASS_SCORE = 1;
const FAIL_SCORE = 0;
const FAILED_SUBMISSION_PASS_PENALTY = 0.08;
const MAX_PASS_SCORE_PENALTY = 0.35;
const ZERO = 0;

export const getEstimatedRating = (state: StudyState) => {
  if (Number.isFinite(state.profile.rating)) {
    return Math.round(state.profile.rating);
  }
  return reconstructRatingFromCards(state);
};

export const applyEloResult = (currentRating: number, questionRating: number, passed: boolean, failedSubmissions = ZERO) => {
  const expected = getExpectedScore(currentRating, questionRating);
  const score = passed ? getPassScore(failedSubmissions) : FAIL_SCORE;
  return Math.max(DEFAULT_PLAYER_RATING, Math.round(currentRating + ELO_K_FACTOR * (score - expected)));
};

function getPassScore(failedSubmissions: number) {
  return PASS_SCORE - Math.min(MAX_PASS_SCORE_PENALTY, Math.max(ZERO, failedSubmissions) * FAILED_SUBMISSION_PASS_PENALTY);
}

function getExpectedScore(playerRating: number, questionRating: number) {
  return PASS_SCORE / (PASS_SCORE + Math.pow(ELO_BASE, (questionRating - playerRating) / ELO_SCALE));
}

function reconstructRatingFromCards(state: StudyState) {
  return questions.reduce((rating, question) => {
    const card = state.cards[question.id];
    if (!card) {
      return rating;
    }
    const failedSubmissions = card.failedSubmissions || ZERO;
    const afterFailures = Array.from({ length: failedSubmissions }).reduce((nextRating) => {
      return applyEloResult(nextRating as number, question.rating, false);
    }, rating);
    return card.correct > ZERO ? applyEloResult(afterFailures as number, question.rating, true, failedSubmissions) : afterFailures as number;
  }, DEFAULT_PLAYER_RATING);
}
