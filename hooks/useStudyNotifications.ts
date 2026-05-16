import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { RewardNotification } from "../components/RewardNotifications";
import { getCoinReward, getExperienceReward, getManaReward, getQuestionDrop, HEALTH_LOSS_PER_FAIL } from "../lib/studyCore";
import type { Question, StudyState } from "../types/study";

const REWARD_TOAST_TIMEOUT_MS = 2400;

export function useStudyNotifications(setRewardNotifications: Dispatch<SetStateAction<RewardNotification[]>>) {
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
    const itemIds = new Set(items.map((item) => item.id));
    setRewardNotifications((current) => [...current, ...items]);
    window.setTimeout(() => {
      setRewardNotifications((current) => current.filter((item) => !itemIds.has(item.id)));
    }, REWARD_TOAST_TIMEOUT_MS);
  }, [setRewardNotifications]);

  const showHealthLoss = useCallback((amount = HEALTH_LOSS_PER_FAIL) => {
    const item: RewardNotification = {
      amount,
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
