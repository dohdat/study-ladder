import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { RewardNotification } from "../components/RewardNotifications";
import { getCoinReward, getExperienceReward, HEALTH_LOSS_PER_FAIL } from "../lib/studyCore";
import type { Question } from "../types/study";

const REWARD_TOAST_TIMEOUT_MS = 2400;

export function useStudyNotifications(setRewardNotifications: Dispatch<SetStateAction<RewardNotification[]>>) {
  const showRewards = useCallback((question: Question) => {
    const createdAt = Date.now();
    const items: RewardNotification[] = [
      { amount: getCoinReward(question), id: `${question.id}-gold-${createdAt}`, kind: "gold" },
      { amount: getExperienceReward(question), id: `${question.id}-experience-${createdAt}`, kind: "experience" }
    ];
    const itemIds = new Set(items.map((item) => item.id));
    setRewardNotifications((current) => [...current, ...items]);
    window.setTimeout(() => {
      setRewardNotifications((current) => current.filter((item) => !itemIds.has(item.id)));
    }, REWARD_TOAST_TIMEOUT_MS);
  }, [setRewardNotifications]);

  const showHealthLoss = useCallback(() => {
    const item: RewardNotification = {
      amount: HEALTH_LOSS_PER_FAIL,
      id: `health-${Date.now()}`,
      kind: "health"
    };
    setRewardNotifications((current) => [...current, item]);
    window.setTimeout(() => {
      setRewardNotifications((current) => current.filter((currentItem) => currentItem.id !== item.id));
    }, REWARD_TOAST_TIMEOUT_MS);
  }, [setRewardNotifications]);

  return { showHealthLoss, showRewards };
}
