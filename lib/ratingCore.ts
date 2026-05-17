import { questions } from "../data/questions";
import type { StudyState } from "../types/study";

const BASE_RATING_ESTIMATE = 1000;
const MASTERED_REPS = 3;
const SOLVED_RATING_WEIGHT = 0.72;
const BREADTH_RATING_BONUS = 12;
const MASTERY_RATING_BONUS = 18;
const STREAK_RATING_BONUS = 4;
const MAX_STREAK_RATING_BONUS = 80;

export const getEstimatedRating = (state: StudyState) => {
  const profile = getRatingProfile(state);
  const highestSolvedRating = questions.reduce((highest, question) => {
    return state.cards[question.id]?.correct > 0 ? Math.max(highest, question.rating) : highest;
  }, BASE_RATING_ESTIMATE);
  const solvedRatingGain = Math.max(0, highestSolvedRating - BASE_RATING_ESTIMATE) * SOLVED_RATING_WEIGHT;
  const breadthBonus = profile.solved * BREADTH_RATING_BONUS;
  const masteryBonus = profile.mastered * MASTERY_RATING_BONUS;
  const streakBonus = Math.min(MAX_STREAK_RATING_BONUS, state.streak * STREAK_RATING_BONUS);
  return Math.round(BASE_RATING_ESTIMATE + solvedRatingGain + breadthBonus + masteryBonus + streakBonus);
};

function getRatingProfile(state: StudyState) {
  return questions.reduce((profile, question) => {
    const card = state.cards[question.id];
    return {
      mastered: profile.mastered + (card?.correct >= MASTERED_REPS && card.reps >= MASTERED_REPS ? 1 : 0),
      solved: profile.solved + (card?.correct > 0 ? 1 : 0)
    };
  }, { mastered: 0, solved: 0 });
}
