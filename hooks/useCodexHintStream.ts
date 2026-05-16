import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { CODEX_HINT_CHUNK, CODEX_HINT_DONE, CODEX_HINT_ERROR, requestCodexHint, warmCodexHint } from "../lib/hintPrompt";
import type { CodexHintStreamMessage } from "../lib/hintPrompt";

type StatusTone = "default" | "pass" | "fail";

const HINT_FALLBACK_MS = 2500;

type ChromeRuntime = {
  onMessage?: {
    addListener: (listener: (message: unknown) => void) => void;
    removeListener: (listener: (message: unknown) => void) => void;
  };
};

export function useCodexHintStream(setStatus: (status: string) => void, setTone: (tone: StatusTone) => void) {
  const [hintText, setHintText] = useState("");
  const [hintStreaming, setHintStreaming] = useState(false);
  const [hintError, setHintError] = useState("");
  const fallbackHint = useRef("");
  const fallbackShown = useRef(false);
  const hintTextRef = useRef("");
  const fallbackTimer = useRef<number | null>(null);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimer.current) {
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  }, []);

  const showFallbackHint = useCallback((status = "Hint ready.") => {
    if (!fallbackHint.current) {
      return false;
    }
    clearFallbackTimer();
    fallbackShown.current = true;
    hintTextRef.current = fallbackHint.current;
    setHintText(fallbackHint.current);
    setHintError("");
    setHintStreaming(false);
    setTone("default");
    setStatus(status);
    return true;
  }, [clearFallbackTimer, setStatus, setTone]);

  const clearHint = useCallback(() => {
    clearFallbackTimer();
    fallbackHint.current = "";
    fallbackShown.current = false;
    hintTextRef.current = "";
    setHintText("");
    setHintError("");
    setHintStreaming(false);
  }, [clearFallbackTimer]);
  const startHint = useCallback((prompt: string, localHint = "") => {
    clearFallbackTimer();
    fallbackHint.current = localHint;
    fallbackShown.current = false;
    hintTextRef.current = "";
    setHintText("");
    setHintError("");
    setHintStreaming(true);
    if (localHint) {
      fallbackTimer.current = window.setTimeout(() => {
        if (!hintTextRef.current) {
          showFallbackHint("Hint ready.");
        }
      }, HINT_FALLBACK_MS);
    }
    requestCodexHint(prompt).then((response) => handleHintStartResponse(response, {
      setHintStreaming,
      setStatus,
      setTone,
      showFallbackHint
    }));
  }, [clearFallbackTimer, setStatus, setTone, showFallbackHint]);

  useEffect(() => {
    const runtime = getChromeRuntime();
    if (!runtime?.onMessage) {
      return undefined;
    }
    function handleRuntimeMessage(message: unknown) {
      if (!isHintMessage(message)) {
        return;
      }
      if (fallbackShown.current) {
        return;
      }
      handleHintStreamMessage(message, { clearFallbackTimer, hintTextRef, showFallbackHint, setHintError, setHintStreaming, setHintText, setStatus, setTone });
    }
    runtime.onMessage.addListener(handleRuntimeMessage);
    return () => runtime.onMessage?.removeListener(handleRuntimeMessage);
  }, [clearFallbackTimer, setStatus, setTone, showFallbackHint]);

  useEffect(() => {
    warmCodexHint();
  }, []);

  useEffect(() => clearFallbackTimer, [clearFallbackTimer]);

  return { clearHint, hintError, hintStreaming, hintText, startHint };
}

function getChromeRuntime() {
  return (globalThis as typeof globalThis & { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
}

function isHintMessage(message: unknown): message is CodexHintStreamMessage {
  if (!message || typeof message !== "object" || !("type" in message)) {
    return false;
  }
  const type = (message as CodexHintStreamMessage).type;
  return type === CODEX_HINT_CHUNK || type === CODEX_HINT_DONE || type === CODEX_HINT_ERROR;
}

function handleHintStartResponse(
  response: { ok: boolean; error?: string },
  setters: {
    setHintStreaming: (streaming: boolean) => void;
    setStatus: (status: string) => void;
    setTone: (tone: StatusTone) => void;
    showFallbackHint: (status?: string) => boolean;
  }
) {
  if (response.ok) {
    return;
  }
  if (setters.showFallbackHint("Hint ready.")) {
    return;
  }
  setters.setHintStreaming(false);
  setters.setTone("fail");
  setters.setStatus(response.error || "Could not start Codex hint helper.");
}

function handleHintStreamMessage(
  message: CodexHintStreamMessage,
  setters: {
    clearFallbackTimer: () => void;
    hintTextRef: MutableRefObject<string>;
    setHintError: (error: string) => void;
    setHintStreaming: (streaming: boolean) => void;
    setHintText: Dispatch<SetStateAction<string>>;
    setStatus: (status: string) => void;
    setTone: (tone: StatusTone) => void;
    showFallbackHint: (status?: string) => boolean;
  }
) {
  if (message.type === CODEX_HINT_CHUNK && message.text) {
    setters.clearFallbackTimer();
    setters.setHintText((current) => {
      const next = `${current}${message.text}`;
      setters.hintTextRef.current = next;
      return next;
    });
    return;
  }
  if (message.type === CODEX_HINT_DONE) {
    setters.clearFallbackTimer();
    if (message.text) {
      setters.setHintText((current) => {
        const next = current || message.text || "";
        setters.hintTextRef.current = next;
        return next;
      });
    }
    setters.setHintStreaming(false);
    setters.setTone("default");
    setters.setStatus("Codex hint ready.");
    return;
  }
  if (message.type === CODEX_HINT_ERROR) {
    setters.clearFallbackTimer();
    if (setters.hintTextRef.current || setters.showFallbackHint("Hint ready.")) {
      return;
    }
    setters.setHintStreaming(false);
    setters.setHintError(message.error || "Codex hint failed.");
    setters.setTone("fail");
    setters.setStatus(message.error || "Codex hint failed.");
  }
}
