import { useEffect, useRef } from "react";

const STARTUP_GRACE_MS = 750;

type GuardTone = "default" | "pass" | "fail";

type FullscreenGuardParams = {
  active: boolean;
  pauseQuestion: () => void;
  setStatus: (status: string) => void;
  setTone: (tone: GuardTone) => void;
};

export function useFullscreenGuard(params: FullscreenGuardParams) {
  const activatedAtRef = useRef(0);
  const pauseQuestionRef = useRef(params.pauseQuestion);
  const setStatusRef = useRef(params.setStatus);
  const setToneRef = useRef(params.setTone);

  useEffect(() => {
    pauseQuestionRef.current = params.pauseQuestion;
    setStatusRef.current = params.setStatus;
    setToneRef.current = params.setTone;
  }, [params.pauseQuestion, params.setStatus, params.setTone]);

  useEffect(() => {
    if (!params.active) {
      return undefined;
    }
    activatedAtRef.current = Date.now();
    function handleGuardChange() {
      if (isFullscreenFocused()) {
        setToneRef.current("default");
        setStatusRef.current("Keep going.");
        return;
      }
      if (Date.now() - activatedAtRef.current < STARTUP_GRACE_MS) {
        return;
      }
      setToneRef.current("fail");
      setStatusRef.current("Focus lost. Press Start to resume this question.");
      pauseQuestionRef.current();
    }
    window.addEventListener("blur", handleGuardChange);
    window.addEventListener("focus", handleGuardChange);
    document.addEventListener("visibilitychange", handleGuardChange);
    document.addEventListener("fullscreenchange", handleGuardChange);
    handleGuardChange();
    return () => {
      window.removeEventListener("blur", handleGuardChange);
      window.removeEventListener("focus", handleGuardChange);
      document.removeEventListener("visibilitychange", handleGuardChange);
      document.removeEventListener("fullscreenchange", handleGuardChange);
    };
  }, [params.active]);
}

function isFullscreenFocused() {
  return Boolean(document.fullscreenElement) && document.visibilityState === "visible" && document.hasFocus();
}
