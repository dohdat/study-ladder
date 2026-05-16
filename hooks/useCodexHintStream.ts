import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { CODEX_HINT_CHUNK, CODEX_HINT_DONE, CODEX_HINT_ERROR, requestCodexHint, warmCodexHint } from "../lib/hintPrompt";
import type { CodexHintStreamMessage } from "../lib/hintPrompt";

type StatusTone = "default" | "pass" | "fail";

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
  const clearHint = useCallback(() => {
    setHintText("");
    setHintError("");
    setHintStreaming(false);
  }, []);
  const startHint = useCallback((prompt: string) => {
    setHintText("");
    setHintError("");
    setHintStreaming(true);
    requestCodexHint(prompt).then((response) => handleHintStartResponse(response, setHintStreaming, setStatus, setTone));
  }, [setStatus, setTone]);

  useEffect(() => {
    const runtime = getChromeRuntime();
    if (!runtime?.onMessage) {
      return undefined;
    }
    function handleRuntimeMessage(message: unknown) {
      if (!isHintMessage(message)) {
        return;
      }
      handleHintStreamMessage(message, { setHintError, setHintStreaming, setHintText, setStatus, setTone });
    }
    runtime.onMessage.addListener(handleRuntimeMessage);
    return () => runtime.onMessage?.removeListener(handleRuntimeMessage);
  }, [setStatus, setTone]);

  useEffect(() => {
    warmCodexHint();
  }, []);

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
  setHintStreaming: (streaming: boolean) => void,
  setStatus: (status: string) => void,
  setTone: (tone: StatusTone) => void
) {
  if (response.ok) {
    return;
  }
  setHintStreaming(false);
  setTone("fail");
  setStatus(response.error || "Could not start Codex hint helper.");
}

function handleHintStreamMessage(
  message: CodexHintStreamMessage,
  setters: {
    setHintError: (error: string) => void;
    setHintStreaming: (streaming: boolean) => void;
    setHintText: Dispatch<SetStateAction<string>>;
    setStatus: (status: string) => void;
    setTone: (tone: StatusTone) => void;
  }
) {
  if (message.type === CODEX_HINT_CHUNK && message.text) {
    setters.setHintText((current) => `${current}${message.text}`);
    return;
  }
  if (message.type === CODEX_HINT_DONE) {
    if (message.text) {
      setters.setHintText((current) => current || message.text || "");
    }
    setters.setHintStreaming(false);
    setters.setTone("default");
    setters.setStatus("Codex hint ready.");
    return;
  }
  if (message.type === CODEX_HINT_ERROR) {
    setters.setHintStreaming(false);
    setters.setHintError(message.error || "Codex hint failed.");
    setters.setTone("fail");
    setters.setStatus(message.error || "Codex hint failed.");
  }
}
