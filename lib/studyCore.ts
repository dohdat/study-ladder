import { questions } from "../data/questions";
import type { CardState, Question, StudyState } from "../types/study";

export const DAY = 24 * 60 * 60 * 1000;
export const MASTERED_REPS = 3;

export const difficultyLabels: Record<Question["difficulty"], string> = {
  1: "Easy",
  2: "Easy+",
  3: "Medium",
  4: "Medium+",
  5: "Hard"
};

export const getQuestionTimeLimitMs = (question: Question) => {
  if (question.difficulty <= 2) {
    return 10 * 60 * 1000;
  }

  if (question.difficulty <= 4) {
    return 20 * 60 * 1000;
  }

  return 25 * 60 * 1000;
};

export const defaultState = (): StudyState => ({
  mode: "leetcode",
  currentId: null,
  totalCorrect: 0,
  streak: 0,
  profile: {
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
      ...(stored.profile || {})
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

export const getRecommendedDifficulty = (state: StudyState) => {
  return Math.min(5, 1 + Math.floor(state.totalCorrect / 3)) as Question["difficulty"];
};

export const getDueQuestions = (state: StudyState, now = Date.now()) => {
  return questions.filter((question) => getCard(state, question.id).dueAt <= now);
};

export const pickQuestion = (state: StudyState, currentQuestion: Question | null, preferNext = false, now = Date.now()) => {
  const recommended = getRecommendedDifficulty(state);
  const currentIndex = currentQuestion ? questions.findIndex((question) => question.id === currentQuestion.id) : -1;
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
  const accuracy = totalAttempts ? Math.round((totalPasses / totalAttempts) * 100) : 0;

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
    card.correct += 1;
    card.reps += 1;
    next.totalCorrect += 1;
    next.streak += 1;
    if (card.reps === 1) {
      card.intervalDays = 1;
    } else if (card.reps === 2) {
      card.intervalDays = 3;
    } else {
      card.intervalDays = Math.ceil(card.intervalDays * card.ease);
    }
    card.ease = Math.min(3.2, card.ease + 0.08);
    card.dueAt = now + card.intervalDays * DAY;
    if (!wasMastered && isMasteredCard(card)) {
      card.masteredAt = now;
    }
  } else {
    next.streak = 0;
    card.reps = Math.max(0, card.reps - 1);
    card.ease = Math.max(1.4, card.ease - 0.22);
    card.intervalDays = 0;
    card.dueAt = now + 10 * 60 * 1000;
  }

  setCard(next, questionId, card);
  return next;
};
