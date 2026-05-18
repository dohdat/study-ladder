const CODEX_HINT_HOST = "com.study_ladder.codex_hint";
const HINT_REQUEST_TYPE = "open-codex-hint";
const WARM_REQUEST_TYPE = "warm-codex-hint";
const GET_BLOCKER_STATE_TYPE = "study-blocker-get-state";
const SAVE_BLOCKER_SETTINGS_TYPE = "study-blocker-save-settings";
const ADD_STUDY_TIME_TYPE = "study-blocker-add-study-ms";
const BLOCKER_SETTINGS_KEY = "study-ladder-blocker-settings-v1";
const BLOCKER_PROGRESS_KEY = "study-ladder-blocker-progress-v1";
const STUDY_PAGE = "index.html";
const DEFAULT_BLOCKER_ENABLED = true;
const MS_PER_MINUTE = 60000;
const DEFAULT_DAILY_MINUTES = 30;
const DEFAULT_DISTRACTING_SITES = [
  "reddit.com",
  "facebook.com",
  "youtube.com",
  "x.com",
  "twitter.com",
  "instagram.com",
  "tiktok.com",
  "netflix.com"
];

let hintPort = null;
let hintRequestActive = false;

function getStudyPageUrl() {
  return /^https?:\/\//.test(STUDY_PAGE) ? STUDY_PAGE : chrome.runtime.getURL(STUDY_PAGE);
}

function openStudyPage() {
  chrome.tabs.create({
    url: getStudyPageUrl()
  });
}

function handleMessage(message, _sender, sendResponse) {
  if (!message?.type) {
    return false;
  }

  if (message.type === WARM_REQUEST_TYPE) {
    return warmHintHost(sendResponse);
  }
  if (message.type === HINT_REQUEST_TYPE) {
    return requestHint(message, _sender, sendResponse);
  }
  if (message.type === GET_BLOCKER_STATE_TYPE) {
    return getBlockerState(sendResponse);
  }
  if (message.type === SAVE_BLOCKER_SETTINGS_TYPE) {
    return saveBlockerSettings(message.settings, sendResponse);
  }
  if (message.type === ADD_STUDY_TIME_TYPE) {
    return addStudyTime(message.ms, sendResponse);
  }

  return false;
}

function warmHintHost(sendResponse) {
  const port = ensureHintPort();
  if (!port) {
    sendResponse({ ok: false, error: "Could not connect to Codex hint helper." });
    return false;
  }
  port.postMessage({ type: "warm" });
  sendResponse({ ok: true });
  return false;
}

function requestHint(message, sender, sendResponse) {
  if (!message.prompt) {
    sendResponse({ ok: false, error: "Hint prompt is missing." });
    return false;
  }

  const port = ensureHintPort();
  if (!port) {
    sendResponse({ ok: false, error: "Could not connect to Codex hint helper." });
    return false;
  }

  hintRequestActive = true;
  port.postMessage({ type: "hint", prompt: message.prompt });
  sendResponse({ ok: true });
  return false;
}

function ensureHintPort() {
  if (hintPort) {
    return hintPort;
  }

  hintPort = chrome.runtime.connectNative(CODEX_HINT_HOST);
  function relayNativeMessage(nativeMessage) {
    if (hintRequestActive) {
      relayHintMessage(nativeMessage);
    }
    if (nativeMessage.type === "codex-hint-done" || nativeMessage.type === "codex-hint-error") {
      hintRequestActive = false;
    }
  }
  function handleDisconnect() {
    const error = chrome.runtime.lastError?.message;
    if (error && hintRequestActive) {
      relayHintMessage({ type: "codex-hint-error", error });
    }
    hintRequestActive = false;
    hintPort = null;
  }

  hintPort.onMessage.addListener(relayNativeMessage);
  hintPort.onDisconnect.addListener(handleDisconnect);
  return hintPort;
}

function relayHintMessage(message) {
  chrome.runtime.sendMessage(message, () => {
    void chrome.runtime.lastError;
  });
}

function getDefaultBlockerSettings() {
  return {
    dailyMinutes: DEFAULT_DAILY_MINUTES,
    distractingSites: DEFAULT_DISTRACTING_SITES,
    enabled: DEFAULT_BLOCKER_ENABLED
  };
}

function getTodayKey() {
  return new Date().toLocaleDateString("en-CA");
}

function normalizeSettings(settings) {
  const fallback = getDefaultBlockerSettings();
  if (!settings || typeof settings !== "object") {
    return fallback;
  }
  const dailyMinutes = Number(settings.dailyMinutes);
  const distractingSites = Array.isArray(settings.distractingSites) && settings.distractingSites.length > 0
    ? settings.distractingSites.filter((site) => typeof site === "string" && site.trim()).map((site) => site.trim().toLowerCase())
    : fallback.distractingSites;
  return {
    dailyMinutes: Number.isFinite(dailyMinutes) ? Math.max(0, Math.round(dailyMinutes)) : fallback.dailyMinutes,
    distractingSites,
    enabled: settings.enabled !== false
  };
}

function normalizeProgress(progress) {
  const todayKey = getTodayKey();
  if (!progress || progress.dateKey !== todayKey) {
    return { dateKey: todayKey, studiedMs: 0 };
  }
  return { dateKey: todayKey, studiedMs: Math.max(0, Number(progress.studiedMs) || 0) };
}

function loadBlockerState(callback) {
  chrome.storage.local.get([BLOCKER_SETTINGS_KEY, BLOCKER_PROGRESS_KEY], (stored) => {
    callback({
      progress: normalizeProgress(stored[BLOCKER_PROGRESS_KEY]),
      settings: normalizeSettings(stored[BLOCKER_SETTINGS_KEY])
    });
  });
}

function getBlockerState(sendResponse) {
  loadBlockerState((state) => sendResponse({ ok: true, ...state }));
  return true;
}

function saveBlockerSettings(settings, sendResponse) {
  const nextSettings = normalizeSettings(settings);
  chrome.storage.local.set({ [BLOCKER_SETTINGS_KEY]: nextSettings }, () => {
    sendResponse({ ok: true, settings: nextSettings });
  });
  return true;
}

function addStudyTime(ms, sendResponse) {
  const incrementMs = Math.max(0, Number(ms) || 0);
  loadBlockerState((state) => {
    const nextProgress = {
      dateKey: state.progress.dateKey,
      studiedMs: state.progress.studiedMs + incrementMs
    };
    chrome.storage.local.set({ [BLOCKER_PROGRESS_KEY]: nextProgress }, () => {
      sendResponse({ ok: true, progress: nextProgress, settings: state.settings });
    });
  });
  return true;
}

function shouldRedirectUrl(url, settings, progress) {
  if (!settings.enabled || settings.dailyMinutes <= 0 || progress.studiedMs >= settings.dailyMinutes * MS_PER_MINUTE) {
    return false;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }
  const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
  return settings.distractingSites.some((site) => hostname === site || hostname.endsWith(`.${site}`));
}

function redirectIfBlocked(tabId, url) {
  if (!url) {
    return;
  }
  loadBlockerState((state) => {
    if (shouldRedirectUrl(url, state.settings, state.progress)) {
      chrome.tabs.update(tabId, { url: getStudyPageUrl() });
    }
  });
}

chrome.action.onClicked.addListener(openStudyPage);
chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => redirectIfBlocked(tabId, changeInfo.url || tab.url));
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!chrome.runtime.lastError) {
      redirectIfBlocked(activeInfo.tabId, tab.url);
    }
  });
});
