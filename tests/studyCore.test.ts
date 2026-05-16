import { describe, expect, it } from "vitest";

import { questions } from "../data/questions";
import {
  DAY,
  EXPERIENCE_PER_LEVEL,
  HEALTH_LOSS_PER_FAIL,
  HINT_COST,
  MAX_HEALTH,
  applyScheduleResult,
  applyHealthPenalty,
  buyHint,
  canBuyHint,
  cloneState,
  defaultCard,
  defaultState,
  difficultyLabels,
  getCard,
  getCoinReward,
  getDueQuestions,
  getExperienceReward,
  getLevelProgress,
  getProfileStats,
  getQuestionTimeLimitMs,
  getRecommendedDifficulty,
  getTopicStats,
  isMasteredCard,
  normalizeStudyState,
  pickQuestion,
  setCard
} from "../lib/studyCore";

describe("studyCore", () => {
  it("normalizes empty and partial persisted state", () => {
    const empty = normalizeStudyState(null);
    expect(empty.mode).toBe("leetcode");
    expect(empty.cards).toEqual({});

    const partial = normalizeStudyState({
      mode: "system",
      cards: {
        [questions[0].id]: { ...defaultCard(), attempts: 1 }
      }
    });
    expect(partial.mode).toBe("system");
    expect(partial.profile.startedAt).toEqual(expect.any(Number));
    expect(partial.profile.health).toBe(MAX_HEALTH);
    expect(partial.profile.experience).toBe(0);
    expect(getCard(partial, questions[0].id).attempts).toBe(1);
  });

  it("clones and sets card state without mutating the original", () => {
    const state = defaultState();
    const card = { ...defaultCard(), attempts: 2 };
    setCard(state, questions[0].id, card);

    const copy = cloneState(state);
    copy.cards[questions[0].id].attempts = 7;

    expect(state.cards[questions[0].id].attempts).toBe(2);
    expect(getCard(state, "missing")).toMatchObject(defaultCard());
  });

  it("computes recommended difficulty and due questions", () => {
    const state = defaultState();
    expect(getRecommendedDifficulty(state)).toBe(1);
    state.totalCorrect = 12;
    expect(getRecommendedDifficulty(state)).toBe(5);

    const now = 1000;
    setCard(state, questions[0].id, { ...defaultCard(), dueAt: now + DAY });
    expect(getDueQuestions(state, now).some((question) => question.id === questions[0].id)).toBe(false);
  });

  it("picks unseen due questions and supports next-question navigation", () => {
    const state = defaultState();
    const first = pickQuestion(state, null, false, 1000);
    expect(first.id).toBe(questions[0].id);

    const next = pickQuestion(state, first, true, 1000);
    expect(next.id).toBe(questions[1].id);

    for (const question of questions) {
      setCard(state, question.id, { ...defaultCard(), attempts: 1, dueAt: 5000 });
    }
    setCard(state, questions[3].id, { ...defaultCard(), attempts: 1, dueAt: 1000 });
    expect(pickQuestion(state, null, false, 1000).id).toBe(questions[3].id);
  });

  it("applies pass schedule intervals and marks cards mastered", () => {
    const question = questions[0];
    let state = defaultState();

    state = applyScheduleResult(state, question.id, true, "draft", 1000);
    expect(getCard(state, question.id)).toMatchObject({
      attempts: 1,
      correct: 1,
      reps: 1,
      intervalDays: 1,
      draft: "draft",
      lastResult: "pass"
    });
    expect(getCard(state, question.id).dueAt).toBe(1000 + DAY);
    expect(state.profile.coins).toBe(getCoinReward(question));
    expect(state.profile.experience).toBe(getExperienceReward(question));

    state = applyScheduleResult(state, question.id, true, "draft", 2000);
    expect(getCard(state, question.id).intervalDays).toBe(3);

    state = applyScheduleResult(state, question.id, true, "draft", 3000);
    expect(isMasteredCard(getCard(state, question.id))).toBe(true);
    expect(getCard(state, question.id).masteredAt).toBe(3000);
  });

  it("applies fail schedule and lowers reps/ease", () => {
    const question = questions[0];
    let state = defaultState();
    setCard(state, question.id, { ...defaultCard(), reps: 2, ease: 2.4, correct: 1 });

    state = applyScheduleResult(state, question.id, false, "bad", 1000);
    const card = getCard(state, question.id);

    expect(card.lastResult).toBe("fail");
    expect(card.reps).toBe(1);
    expect(card.ease).toBeCloseTo(2.18);
    expect(card.dueAt).toBe(1000 + 10 * 60 * 1000);
    expect(state.streak).toBe(0);
    expect(state.profile.coins).toBe(0);
    expect(state.profile.health).toBe(MAX_HEALTH - HEALTH_LOSS_PER_FAIL);
  });

  it("applies failed-submit health penalties without changing cards", () => {
    const question = questions[0];
    const state = defaultState();
    const penalized = applyHealthPenalty(state);

    expect(penalized.profile.health).toBe(MAX_HEALTH - HEALTH_LOSS_PER_FAIL);
    expect(getCard(penalized, question.id)).toMatchObject(defaultCard());
    expect(state.profile.health).toBe(MAX_HEALTH);
  });

  it("computes level progress from total experience", () => {
    const state = defaultState();
    state.profile.experience = EXPERIENCE_PER_LEVEL + 12;

    expect(getLevelProgress(state)).toEqual({
      level: 2,
      currentExperience: 12,
      nextLevelExperience: EXPERIENCE_PER_LEVEL
    });
  });

  it("allows free hints for local hint testing", () => {
    let state = defaultState();

    expect(canBuyHint(state)).toBe(true);
    state = buyHint(state);

    expect(HINT_COST).toBe(0);
    expect(state.profile.coins).toBe(0);
    expect(state.profile.hintsBought).toBe(1);
    expect(canBuyHint(state)).toBe(true);
  });

  it("does not spend coins when a state is below the hint threshold", () => {
    const state = defaultState();
    state.profile.coins = -1;

    expect(canBuyHint(state)).toBe(false);
    expect(buyHint(state)).toBe(state);
  });

  it("computes profile and topic stats", () => {
    let state = defaultState();
    state = applyScheduleResult(state, questions[0].id, true, "", 1000);
    state = applyScheduleResult(state, questions[0].id, true, "", 2000);
    state = applyScheduleResult(state, questions[0].id, true, "", 3000);
    state = applyScheduleResult(state, questions[1].id, false, "", 4000);

    const profile = getProfileStats(state, 5000);
    expect(profile).toMatchObject({
      attempted: 2,
      solved: 1,
      mastered: 1,
      totalAttempts: 4,
      totalPasses: 3,
      accuracy: 75
    });

    const topics = getTopicStats(state);
    expect(topics.find((topic) => topic.topic === "Arrays")).toMatchObject({ mastered: 1 });
    expect(topics.find((topic) => topic.topic === "Strings")).toMatchObject({ attempted: 1, solved: 0 });
  });

  it("exports difficulty labels for UI display", () => {
    expect(difficultyLabels[1]).toBe("Easy");
    expect(difficultyLabels[5]).toBe("Hard");
  });

  it("maps question difficulty to timed sessions", () => {
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 1 })).toBe(10 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 2 })).toBe(10 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 3 })).toBe(20 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 4 })).toBe(20 * 60 * 1000);
    expect(getQuestionTimeLimitMs({ ...questions[0], difficulty: 5 })).toBe(25 * 60 * 1000);
  });
});
