import { useCallback, useEffect, useState } from "react";

const GET_BLOCKER_STATE_TYPE = "study-blocker-get-state";
const SAVE_BLOCKER_SETTINGS_TYPE = "study-blocker-save-settings";
const ADD_STUDY_TIME_TYPE = "study-blocker-add-study-ms";
const TRACK_INTERVAL_MS = 1000;
const REFRESH_INTERVAL_MS = 5000;

export const STUDY_BLOCKER_MS_PER_MINUTE = 60000;

export type StudyBlockerSettings = {
  dailyMinutes: number;
  distractingSites: string[];
  enabled: boolean;
};

export type StudyBlockerProgress = {
  dateKey: string;
  studiedMs: number;
};

type BlockerStateResponse = {
  ok: boolean;
  progress?: StudyBlockerProgress;
  settings?: StudyBlockerSettings;
};

const FALLBACK_SETTINGS: StudyBlockerSettings = {
  dailyMinutes: 30,
  distractingSites: ["reddit.com", "facebook.com", "youtube.com", "x.com", "twitter.com", "instagram.com", "tiktok.com", "netflix.com"],
  enabled: true
};

const FALLBACK_PROGRESS: StudyBlockerProgress = {
  dateKey: "",
  studiedMs: 0
};

export function useStudyBlockerSettings() {
  const [settings, setSettings] = useState<StudyBlockerSettings>(FALLBACK_SETTINGS);
  const [progress, setProgress] = useState<StudyBlockerProgress>(FALLBACK_PROGRESS);

  const refresh = useCallback(() => {
    sendRuntimeMessage({ type: GET_BLOCKER_STATE_TYPE }).then((response) => {
      setSettings(response.settings || FALLBACK_SETTINGS);
      setProgress(response.progress || FALLBACK_PROGRESS);
    });
  }, []);

  const updateSettings = useCallback((nextSettings: StudyBlockerSettings) => {
    setSettings(nextSettings);
    sendRuntimeMessage({ type: SAVE_BLOCKER_SETTINGS_TYPE, settings: nextSettings }).then((response) => {
      if (response.settings) {
        setSettings(response.settings);
      }
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { progress, refresh, settings, updateSettings };
}

export function useStudyTimeTracker(active: boolean) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      sendRuntimeMessage({ type: ADD_STUDY_TIME_TYPE, ms: TRACK_INTERVAL_MS });
    }, TRACK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [active]);
}

function sendRuntimeMessage(message: unknown) {
  const runtime = (globalThis as typeof globalThis & {
    chrome?: {
      runtime?: {
        lastError?: { message?: string };
        sendMessage?: (message: unknown, callback: (response?: BlockerStateResponse) => void) => void;
      };
    };
  }).chrome?.runtime;
  if (!runtime?.sendMessage) {
    return Promise.resolve({ ok: false } as BlockerStateResponse);
  }

  return new Promise<BlockerStateResponse>((resolve) => {
    runtime.sendMessage?.(message, (response) => {
      if (runtime.lastError) {
        resolve({ ok: false });
        return;
      }
      resolve(response || { ok: false });
    });
  });
}
