import { useCallback, useEffect, useRef } from "react";

const FOCUS_GRACE_MS = 5000;
const FOCUS_GRACE_SECONDS = 5;
const COUNTDOWN_STEP_MS = 1000;

type GuardTone = "default" | "pass" | "fail";

type FullscreenGuardParams = {
  active: boolean;
  failQuestion: (message: string) => void;
  setStatus: (status: string) => void;
  setTone: (tone: GuardTone) => void;
};

export function useFullscreenGuard(params: FullscreenGuardParams) {
  const { active, failQuestion, setStatus, setTone } = params;
  const graceTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const clearGraceTimer = useCallback(() => {
    if (graceTimer.current) {
      window.clearTimeout(graceTimer.current);
      graceTimer.current = null;
    }
    if (countdownTimer.current) {
      window.clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);
  const startGraceTimer = useCallback(() => {
    if (graceTimer.current) {
      return;
    }
    let remainingSeconds = FOCUS_GRACE_SECONDS;
    setTone("fail");
    setStatus(getCountdownStatus(remainingSeconds));
    countdownTimer.current = window.setInterval(() => {
      remainingSeconds -= 1;
      setStatus(getCountdownStatus(remainingSeconds));
    }, COUNTDOWN_STEP_MS);
    graceTimer.current = window.setTimeout(() => {
      graceTimer.current = null;
      clearGraceTimer();
      failQuestion("Left fullscreen or changed focus. Card remains due soon.");
    }, FOCUS_GRACE_MS);
  }, [clearGraceTimer, failQuestion, setStatus, setTone]);
  useEffect(() => {
    if (!active) {
      clearGraceTimer();
      return undefined;
    }
    function handleGuardChange() {
      if (isFullscreenFocused()) {
        clearGraceTimer();
        setTone("default");
        setStatus("Keep going.");
        return;
      }
      startGraceTimer();
    }
    window.addEventListener("blur", handleGuardChange);
    window.addEventListener("focus", handleGuardChange);
    document.addEventListener("visibilitychange", handleGuardChange);
    document.addEventListener("fullscreenchange", handleGuardChange);
    handleGuardChange();
    return () => {
      clearGraceTimer();
      window.removeEventListener("blur", handleGuardChange);
      window.removeEventListener("focus", handleGuardChange);
      document.removeEventListener("visibilitychange", handleGuardChange);
      document.removeEventListener("fullscreenchange", handleGuardChange);
    };
  }, [active, clearGraceTimer, setStatus, setTone, startGraceTimer]);
}

function isFullscreenFocused() {
  return Boolean(document.fullscreenElement) && document.visibilityState === "visible" && document.hasFocus();
}

function getCountdownStatus(remainingSeconds: number) {
  return `Return to fullscreen in ${remainingSeconds} seconds or this question fails.`;
}
