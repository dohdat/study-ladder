import { questions } from "../data/questions";
import type { CardState, Question, StudyState } from "../types/study";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const EASY_MAX_DIFFICULTY = 2;
const MEDIUM_MAX_DIFFICULTY = 4;
const EASY_MINUTES = 10;
const MEDIUM_MINUTES = 20;
const HARD_MINUTES = 25;
const MAX_DIFFICULTY = 5;
const CORRECTS_PER_DIFFICULTY = 3;
const MISSING_INDEX = -1;
const PERCENT = 100;
const SECOND_REVIEW_REPS = 2;
const SECOND_REVIEW_INTERVAL_DAYS = 3;
const MAX_EASE = 3.2;
const PASS_EASE_BONUS = 0.08;
const MIN_EASE = 1.4;
const FAIL_EASE_PENALTY = 0.22;
const FAIL_REVIEW_DELAY_MINUTES = 10;
const COINS_PER_DIFFICULTY = 10;
const EXPERIENCE_PER_DIFFICULTY = 15;

export const DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;
export const MASTERED_REPS = 3;
export const HINT_COST = 0;
export const MAX_HEALTH = 50;
export const HEALTH_LOSS_PER_FAIL = 5;
export const EXPERIENCE_PER_LEVEL = 150;

export const difficultyLabels: Record<Question["difficulty"], string> = {
  1: "Easy",
  2: "Easy+",
  3: "Medium",
  4: "Medium+",
  5: "Hard"
};

export const getQuestionTimeLimitMs = (question: Question) => {
  if (question.difficulty <= EASY_MAX_DIFFICULTY) {
    return EASY_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  }

  if (question.difficulty <= MEDIUM_MAX_DIFFICULTY) {
    return MEDIUM_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  }

  return HARD_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
};

export const defaultState = (): StudyState => ({
  mode: "leetcode",
  currentId: null,
  totalCorrect: 0,
  streak: 0,
  profile: {
    coins: 0,
    experience: 0,
    health: MAX_HEALTH,
    hintsBought: 0,
    startedAt: Date.now(),
    lastStudiedAt: null
  },
  cards: {}
});

export const defaultCard = (): CardState => ({
  dueAt: 0,
  intervalDays: 0,
  ease: 2.4,
  reps: 0,
  attempts: 0,
  correct: 0,
  lastResult: null
});

export const cloneState = (state: StudyState): StudyState => ({
  ...state,
  profile: { ...state.profile },
  cards: Object.fromEntries(Object.entries(state.cards).map(([id, card]) => [id, { ...card }]))
});

export const normalizeStudyState = (stored: Partial<StudyState> | null | undefined): StudyState => {
  const fallback = defaultState();
  if (!stored?.cards) {
    return fallback;
  }

  return {
    ...fallback,
    ...stored,
    profile: {
      ...fallback.profile,
      ...(stored.profile || {}),
      health: Math.min(MAX_HEALTH, Math.max(0, stored.profile?.health ?? fallback.profile.health)),
      experience: Math.max(0, stored.profile?.experience ?? fallback.profile.experience)
    },
    cards: stored.cards
  };
};

export const getCard = (state: StudyState, questionId: string): CardState => {
  return state.cards[questionId] || defaultCard();
};

export const setCard = (state: StudyState, questionId: string, card: CardState) => {
  state.cards[questionId] = card;
};

export const isMasteredCard = (card: CardState) => card.correct >= MASTERED_REPS && card.reps >= MASTERED_REPS;

export const getCoinReward = (question: Question) => question.difficulty * COINS_PER_DIFFICULTY;

export const getExperienceReward = (question: Question) => question.difficulty * EXPERIENCE_PER_DIFFICULTY;

export const getLevelProgress = (state: StudyState) => {
  const totalExperience = state.profile.experience;
  return {
    level: Math.floor(totalExperience / EXPERIENCE_PER_LEVEL) + 1,
    currentExperience: totalExperience % EXPERIENCE_PER_LEVEL,
    nextLevelExperience: EXPERIENCE_PER_LEVEL
  };
};

export const applyHealthPenalty = (state: StudyState, amount = HEALTH_LOSS_PER_FAIL): StudyState => {
  const next = cloneState(state);
  next.profile.health = Math.max(0, next.profile.health - amount);
  return next;
};

export const canBuyHint = (state: StudyState) => state.profile.coins >= HINT_COST;

export const buyHint = (state: StudyState) => {
  if (!canBuyHint(state)) {
    return state;
  }

  return {
    ...state,
    profile: {
      ...state.profile,
      coins: state.profile.coins - HINT_COST,
      hintsBought: state.profile.hintsBought + 1
    }
  };
};

export const getRecommendedDifficulty = (state: StudyState) => {
  return Math.min(MAX_DIFFICULTY, 1 + Math.floor(state.totalCorrect / CORRECTS_PER_DIFFICULTY)) as Question["difficulty"];
};

export const getDueQuestions = (state: StudyState, now = Date.now()) => {
  return questions.filter((question) => getCard(state, question.id).dueAt <= now);
};

export const pickQuestion = (state: StudyState, currentQuestion: Question | null, preferNext = false, now = Date.now()) => {
  const recommended = getRecommendedDifficulty(state);
  const currentIndex = currentQuestion ? questions.findIndex((question) => question.id === currentQuestion.id) : MISSING_INDEX;
  const sorted = [...questions].sort((a, b) => {
    const cardA = getCard(state, a.id);
    const cardB = getCard(state, b.id);
    return cardA.dueAt - cardB.dueAt || a.difficulty - b.difficulty;
  });

  const due = sorted.filter((question) => getCard(state, question.id).dueAt <= now);
  const unseenWithinLevel = sorted.filter((question) => {
    const card = getCard(state, question.id);
    return card.attempts === 0 && question.difficulty <= recommended;
  });

  let picked = unseenWithinLevel[0] || due.find((question) => question.difficulty <= recommended) || due[0];
  if (preferNext) {
    const nextInOrder = questions
      .slice(currentIndex + 1)
      .concat(questions.slice(0, Math.max(0, currentIndex + 1)))
      .find((question) => question.id !== currentQuestion?.id && question.difficulty <= recommended + 1);
    picked = nextInOrder || picked;
  }

  return picked || sorted[0];
};

export const getProfileStats = (state: StudyState, now = Date.now()) => {
  const attempted = questions.filter((question) => getCard(state, question.id).attempts > 0).length;
  const solved = questions.filter((question) => getCard(state, question.id).correct > 0).length;
  const mastered = questions.filter((question) => isMasteredCard(getCard(state, question.id))).length;
  const due = questions.filter((question) => getCard(state, question.id).dueAt <= now).length;
  const totalAttempts = questions.reduce((sum, question) => sum + getCard(state, question.id).attempts, 0);
  const totalPasses = questions.reduce((sum, question) => sum + getCard(state, question.id).correct, 0);
  const accuracy = totalAttempts ? Math.round((totalPasses / totalAttempts) * PERCENT) : 0;

  return { attempted, solved, mastered, due, totalAttempts, totalPasses, accuracy };
};

export const getTopicStats = (state: StudyState) => {
  const topicMap = new Map<string, { topic: string; total: number; attempted: number; solved: number; mastered: number }>();

  for (const question of questions) {
    for (const topic of question.topics) {
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { topic, total: 0, attempted: 0, solved: 0, mastered: 0 });
      }

      const row = topicMap.get(topic);
      if (!row) {
        continue;
      }

      const card = getCard(state, question.id);
      row.total += 1;
      row.attempted += card.attempts > 0 ? 1 : 0;
      row.solved += card.correct > 0 ? 1 : 0;
      row.mastered += isMasteredCard(card) ? 1 : 0;
    }
  }

  return [...topicMap.values()].sort((a, b) => {
    return b.mastered - a.mastered || b.solved - a.solved || a.topic.localeCompare(b.topic);
  });
};

export const applyScheduleResult = (state: StudyState, questionId: string, passed: boolean, draft: string, now = Date.now()) => {
  const next = cloneState(state);
  const card = { ...getCard(next, questionId) };
  const wasMastered = isMasteredCard(card);

  card.attempts += 1;
  card.lastResult = passed ? "pass" : "fail";
  card.lastAttemptAt = now;
  card.draft = draft;
  next.profile.lastStudiedAt = now;

  if (passed) {
    const question = questions.find((row) => row.id === questionId);
    card.correct += 1;
    card.reps += 1;
    next.totalCorrect += 1;
    next.streak += 1;
    next.profile.coins += question ? getCoinReward(question) : 0;
    next.profile.experience += question ? getExperienceReward(question) : 0;
    if (card.reps === 1) {
      card.intervalDays = 1;
    } else if (card.reps === SECOND_REVIEW_REPS) {
      card.intervalDays = SECOND_REVIEW_INTERVAL_DAYS;
    } else {
      card.intervalDays = Math.ceil(card.intervalDays * card.ease);
    }
    card.ease = Math.min(MAX_EASE, card.ease + PASS_EASE_BONUS);
    card.dueAt = now + card.intervalDays * DAY;
    if (!wasMastered && isMasteredCard(card)) {
      card.masteredAt = now;
    }
  } else {
    next.profile.health = Math.max(0, next.profile.health - HEALTH_LOSS_PER_FAIL);
    next.streak = 0;
    card.reps = Math.max(0, card.reps - 1);
    card.ease = Math.max(MIN_EASE, card.ease - FAIL_EASE_PENALTY);
    card.intervalDays = 0;
    card.dueAt = now + FAIL_REVIEW_DELAY_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  }

  setCard(next, questionId, card);
  return next;
};
