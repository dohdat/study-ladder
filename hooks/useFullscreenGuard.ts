import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

const STARTUP_GRACE_MS = 750;
const FOCUS_FAIL_GRACE_MS = 10000;
const SECOND_MS = 1000;

type GuardTone = "default" | "pass" | "fail";

type FullscreenGuardParams = {
  active: boolean;
  failQuestion: () => void;
  setStatus: (status: string) => void;
  setTone: (tone: GuardTone) => void;
};

export function useFullscreenGuard(params: FullscreenGuardParams) {
  const activatedAtRef = useRef(0);
  const failQuestionRef = useRef(params.failQuestion);
  const setStatusRef = useRef(params.setStatus);
  const setToneRef = useRef(params.setTone);
  const focusDeadlineRef = useRef(0);
  const focusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    failQuestionRef.current = params.failQuestion;
    setStatusRef.current = params.setStatus;
    setToneRef.current = params.setTone;
  }, [params.failQuestion, params.setStatus, params.setTone]);

  useEffect(() => {
    if (!params.active) {
      clearFocusTimer(focusTimerRef);
      return undefined;
    }
    activatedAtRef.current = Date.now();
    function handleGuardChange() {
      if (isFullscreenFocused()) {
        clearFocusTimer(focusTimerRef);
        setToneRef.current("default");
        setStatusRef.current("Keep going.");
        return;
      }
      if (Date.now() - activatedAtRef.current < STARTUP_GRACE_MS) {
        return;
      }
      startFocusTimer(focusDeadlineRef, focusTimerRef, setStatusRef, setToneRef, failQuestionRef);
    }
    window.addEventListener("blur", handleGuardChange);
    window.addEventListener("focus", handleGuardChange);
    document.addEventListener("visibilitychange", handleGuardChange);
    document.addEventListener("fullscreenchange", handleGuardChange);
    handleGuardChange();
    return () => {
      clearFocusTimer(focusTimerRef);
      window.removeEventListener("blur", handleGuardChange);
      window.removeEventListener("focus", handleGuardChange);
      document.removeEventListener("visibilitychange", handleGuardChange);
      document.removeEventListener("fullscreenchange", handleGuardChange);
    };
  }, [params.active]);
}

function startFocusTimer(
  focusDeadlineRef: MutableRefObject<number>,
  focusTimerRef: MutableRefObject<number | null>,
  setStatusRef: MutableRefObject<(status: string) => void>,
  setToneRef: MutableRefObject<(tone: GuardTone) => void>,
  failQuestionRef: MutableRefObject<() => void>
) {
  if (focusTimerRef.current) {
    updateFocusCountdown(focusDeadlineRef, focusTimerRef, setStatusRef, setToneRef, failQuestionRef);
    return;
  }
  focusDeadlineRef.current = Date.now() + FOCUS_FAIL_GRACE_MS;
  setToneRef.current("fail");
  updateFocusCountdown(focusDeadlineRef, focusTimerRef, setStatusRef, setToneRef, failQuestionRef);
  focusTimerRef.current = window.setInterval(() => {
    updateFocusCountdown(focusDeadlineRef, focusTimerRef, setStatusRef, setToneRef, failQuestionRef);
  }, SECOND_MS);
}

function updateFocusCountdown(
  focusDeadlineRef: MutableRefObject<number>,
  focusTimerRef: MutableRefObject<number | null>,
  setStatusRef: MutableRefObject<(status: string) => void>,
  setToneRef: MutableRefObject<(tone: GuardTone) => void>,
  failQuestionRef: MutableRefObject<() => void>
) {
  if (isFullscreenFocused()) {
    clearFocusTimer(focusTimerRef);
    setToneRef.current("default");
    setStatusRef.current("Keep going.");
    return;
  }
  const secondsRemaining = Math.max(0, Math.ceil((focusDeadlineRef.current - Date.now()) / SECOND_MS));
  if (secondsRemaining <= 0) {
    clearFocusTimer(focusTimerRef);
    setToneRef.current("fail");
    setStatusRef.current("Focus lost for 10 seconds. Question failed.");
    failQuestionRef.current();
    return;
  }
  setToneRef.current("fail");
  setStatusRef.current(`Focus lost. Return to fullscreen in ${secondsRemaining}s or this question fails.`);
}

function clearFocusTimer(focusTimerRef: MutableRefObject<number | null>) {
  if (!focusTimerRef.current) {
    return;
  }
  window.clearInterval(focusTimerRef.current);
  focusTimerRef.current = null;
}

function isFullscreenFocused() {
  return Boolean(document.fullscreenElement) && document.visibilityState === "visible" && document.hasFocus();
}
