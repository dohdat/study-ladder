import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { RewardNotification } from "../components/RewardNotifications";
import { getAchievements } from "../lib/achievementCore";
import { getCoinReward, getExperienceReward, getManaReward, getQuestionDrop, HEALTH_LOSS_PER_FAIL } from "../lib/studyCore";
import type { Question, StudyState } from "../types/study";

const REWARD_TOAST_TIMEOUT_MS = 2400;
const SINGLE_HIT = 1;
const FIRST_HIT_INDEX = 0;

export function useStudyNotifications(state: StudyState, hydrated: boolean, setRewardNotifications: Dispatch<SetStateAction<RewardNotification[]>>) {
  const unlockedAchievementIds = useRef<Set<string> | null>(null);
  const pushNotifications = usePushNotifications(setRewardNotifications);

  useEffect(() => {
    const unlocked = new Set(getAchievements(state).filter((achievement) => achievement.unlocked).map((achievement) => achievement.id));
    if (!hydrated) {
      unlockedAchievementIds.current = unlocked;
      return;
    }
    if (!unlockedAchievementIds.current) {
      unlockedAchievementIds.current = unlocked;
      return;
    }
    const previous = unlockedAchievementIds.current;
    const newAchievements = getAchievements(state).filter((achievement) => achievement.unlocked && !previous.has(achievement.id));
    unlockedAchievementIds.current = unlocked;
    if (newAchievements.length) {
      pushNotifications(newAchievements.map((achievement) => ({ achievementTitle: achievement.title, id: `achievement-${achievement.id}-${Date.now()}`, kind: "achievement" })));
    }
  }, [hydrated, pushNotifications, state]);

  const showRewards = useCallback((question: Question, state: StudyState, createdAt = Date.now()) => {
    const drop = getQuestionDrop(question, state, createdAt);
    const items: RewardNotification[] = [
      { amount: getCoinReward(question, state), id: `${question.id}-gold-${createdAt}`, kind: "gold" },
      { amount: getExperienceReward(question, state), id: `${question.id}-experience-${createdAt}`, kind: "experience" },
      { amount: getManaReward(question, state), id: `${question.id}-mana-${createdAt}`, kind: "mana" }
    ];
    if (drop) {
      items.push({ id: `${question.id}-item-${createdAt}`, itemName: drop.name, kind: "item" });
    }
    pushNotifications(items);
  }, [pushNotifications]);

  const showHealthLoss = useCallback((amount = HEALTH_LOSS_PER_FAIL, hitCount = SINGLE_HIT) => {
    const createdAt = Date.now();
    const hits = splitHealthLoss(amount, hitCount);
    pushNotifications(hits.map((hitAmount, index) => ({
      amount: hitAmount,
      id: `health-${createdAt}-${index}`,
      kind: "health"
    })));
  }, [pushNotifications]);

  return { showHealthLoss, showRewards };
}

function splitHealthLoss(amount: number, hitCount: number) {
  const count = Math.max(SINGLE_HIT, Math.floor(hitCount));
  const base = Math.floor(amount / count);
  const remainder = amount % count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0)).filter((value) => value > FIRST_HIT_INDEX);
}

function usePushNotifications(setRewardNotifications: Dispatch<SetStateAction<RewardNotification[]>>) {
  return useCallback((items: RewardNotification[]) => {
    const itemIds = new Set(items.map((item) => item.id));
    setRewardNotifications((current) => [...current, ...items]);
    window.setTimeout(() => {
      setRewardNotifications((current) => current.filter((item) => !itemIds.has(item.id)));
    }, REWARD_TOAST_TIMEOUT_MS);
  }, [setRewardNotifications]);
}
