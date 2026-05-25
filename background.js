const CODEX_HINT_HOST = "com.study_ladder.codex_hint";
const HINT_REQUEST_TYPE = "open-codex-hint";
const QUESTION_VARIANT_REQUEST_TYPE = "open-codex-question-variant";
const EXAMPLE_EXPLANATION_REQUEST_TYPE = "open-codex-example-explanation";
const SOLUTION_REVEAL_REQUEST_TYPE = "open-codex-solution-reveal";
const SYSTEM_DESIGN_SCORE_REQUEST_TYPE = "open-codex-system-design-score";
const WARM_REQUEST_TYPE = "warm-codex-hint";
const GET_BLOCKER_STATE_TYPE = "study-blocker-get-state";
const SAVE_BLOCKER_SETTINGS_TYPE = "study-blocker-save-settings";
const ADD_STUDY_TIME_TYPE = "study-blocker-add-study-ms";
const BLOCKER_SETTINGS_KEY = "study-ladder-blocker-settings-v1";
const BLOCKER_PROGRESS_KEY = "study-ladder-blocker-progress-v1";
const STUDY_PAGE = "pages/index.html";
const DEFAULT_BLOCKER_ENABLED = true;
const MS_PER_MINUTE = 60000;
const QUESTION_VARIANT_TIMEOUT_MS = 75000;
const EXAMPLE_EXPLANATION_TIMEOUT_MS = 45000;
const SOLUTION_REVEAL_TIMEOUT_MS = 75000;
const SYSTEM_DESIGN_SCORE_TIMEOUT_MS = 90000;
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
let nextQuestionVariantRequestId = 1;
let nextExampleExplanationRequestId = 1;
let nextSolutionRevealRequestId = 1;
let nextSystemDesignScoreRequestId = 1;
const questionVariantRequests = new Map();
const exampleExplanationRequests = new Map();
const solutionRevealRequests = new Map();
const systemDesignScoreRequests = new Map();

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
  if (message.type === QUESTION_VARIANT_REQUEST_TYPE) {
    return requestQuestionVariant(message, sendResponse);
  }
  if (message.type === EXAMPLE_EXPLANATION_REQUEST_TYPE) {
    return requestExampleExplanation(message, sendResponse);
  }
  if (message.type === SOLUTION_REVEAL_REQUEST_TYPE) {
    return requestSolutionReveal(message, sendResponse);
  }
  if (message.type === SYSTEM_DESIGN_SCORE_REQUEST_TYPE) {
    return requestSystemDesignScore(message, sendResponse);
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

function requestQuestionVariant(message, sendResponse) {
  if (!message.prompt || !message.questionId) {
    sendResponse({ ok: false, error: "Question variant prompt is missing." });
    return false;
  }

  const port = ensureHintPort();
  if (!port) {
    sendResponse({ ok: false, error: "Could not connect to Codex question helper." });
    return false;
  }

  const requestId = nextQuestionVariantRequestId;
  nextQuestionVariantRequestId += 1;
  const timeout = setTimeout(() => {
    const request = questionVariantRequests.get(requestId);
    questionVariantRequests.delete(requestId);
    if (request) {
      relayQuestionVariantMessage({ type: "codex-question-variant-error", questionId: request.questionId, error: "Timed out waiting for Codex question variant." });
    }
    sendResponse({ ok: false, error: "Timed out waiting for Codex question variant." });
  }, QUESTION_VARIANT_TIMEOUT_MS);
  questionVariantRequests.set(requestId, { questionId: message.questionId, sendResponse, timeout });
  port.postMessage({ type: "question-variant", prompt: message.prompt, questionId: message.questionId, requestId });
  return true;
}

function requestSolutionReveal(message, sendResponse) {
  if (!message.prompt || !message.questionId) {
    sendResponse({ ok: false, error: "Solution reveal prompt is missing." });
    return false;
  }

  const port = ensureHintPort();
  if (!port) {
    sendResponse({ ok: false, error: "Could not connect to Codex solution helper." });
    return false;
  }

  const requestId = nextSolutionRevealRequestId;
  nextSolutionRevealRequestId += 1;
  const timeout = setTimeout(() => {
    const request = solutionRevealRequests.get(requestId);
    solutionRevealRequests.delete(requestId);
    if (request) {
      request.sendResponse({ ok: false, error: "Timed out waiting for Codex solution." });
    }
  }, SOLUTION_REVEAL_TIMEOUT_MS);
  solutionRevealRequests.set(requestId, { sendResponse, timeout });
  port.postMessage({ type: "solution-reveal", prompt: message.prompt, questionId: message.questionId, requestId });
  return true;
}

function requestSystemDesignScore(message, sendResponse) {
  if (!message.prompt || !message.questionId) {
    sendResponse({ ok: false, error: "System design score prompt is missing." });
    return false;
  }

  const port = ensureHintPort();
  if (!port) {
    sendResponse({ ok: false, error: "Could not connect to Codex system design helper." });
    return false;
  }

  const requestId = nextSystemDesignScoreRequestId;
  nextSystemDesignScoreRequestId += 1;
  const timeout = setTimeout(() => {
    const request = systemDesignScoreRequests.get(requestId);
    systemDesignScoreRequests.delete(requestId);
    if (request) {
      request.sendResponse({ ok: false, error: "Timed out waiting for Codex system design score." });
    }
  }, SYSTEM_DESIGN_SCORE_TIMEOUT_MS);
  systemDesignScoreRequests.set(requestId, { sendResponse, timeout });
  port.postMessage({ type: "system-design-score", prompt: message.prompt, questionId: message.questionId, requestId });
  return true;
}

function requestExampleExplanation(message, sendResponse) {
  if (!message.prompt || !message.exampleKey) {
    sendResponse({ ok: false, error: "Example explanation prompt is missing." });
    return false;
  }

  const port = ensureHintPort();
  if (!port) {
    sendResponse({ ok: false, error: "Could not connect to Codex example helper." });
    return false;
  }

  const requestId = nextExampleExplanationRequestId;
  nextExampleExplanationRequestId += 1;
  const timeout = setTimeout(() => {
    const request = exampleExplanationRequests.get(requestId);
    exampleExplanationRequests.delete(requestId);
    if (request) {
      relayExampleExplanationMessage({ type: "codex-example-explanation-error", exampleKey: request.exampleKey, error: "Timed out waiting for Codex example explanation." });
    }
    sendResponse({ ok: false, error: "Timed out waiting for Codex example explanation." });
  }, EXAMPLE_EXPLANATION_TIMEOUT_MS);
  exampleExplanationRequests.set(requestId, { exampleKey: message.exampleKey, sendResponse, timeout });
  port.postMessage({ type: "example-explanation", prompt: message.prompt, exampleKey: message.exampleKey, requestId });
  return true;
}

function ensureHintPort() {
  if (hintPort) {
    return hintPort;
  }

  hintPort = chrome.runtime.connectNative(CODEX_HINT_HOST);
  function relayNativeMessage(nativeMessage) {
    if (nativeMessage.type === "codex-question-variant-chunk") {
      relayQuestionVariantChunk(nativeMessage);
      return;
    }
    if (nativeMessage.type === "codex-question-variant-done" || nativeMessage.type === "codex-question-variant-error") {
      resolveQuestionVariantRequest(nativeMessage);
      return;
    }
    if (nativeMessage.type === "codex-example-explanation-chunk") {
      relayExampleExplanationChunk(nativeMessage);
      return;
    }
    if (nativeMessage.type === "codex-example-explanation-done" || nativeMessage.type === "codex-example-explanation-error") {
      resolveExampleExplanationRequest(nativeMessage);
      return;
    }
    if (nativeMessage.type === "codex-solution-reveal-done" || nativeMessage.type === "codex-solution-reveal-error") {
      resolveSolutionRevealRequest(nativeMessage);
      return;
    }
    if (nativeMessage.type === "codex-system-design-score-done" || nativeMessage.type === "codex-system-design-score-error") {
      resolveSystemDesignScoreRequest(nativeMessage);
      return;
    }
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
    rejectPendingQuestionVariants(error || "Codex helper disconnected.");
    rejectPendingExampleExplanations(error || "Codex helper disconnected.");
    rejectPendingSolutionReveals(error || "Codex helper disconnected.");
    rejectPendingSystemDesignScores(error || "Codex helper disconnected.");
    hintRequestActive = false;
    hintPort = null;
  }

  hintPort.onMessage.addListener(relayNativeMessage);
  hintPort.onDisconnect.addListener(handleDisconnect);
  return hintPort;
}

function resolveQuestionVariantRequest(message) {
  const request = questionVariantRequests.get(message.requestId);
  if (!request) {
    return;
  }
  questionVariantRequests.delete(message.requestId);
  clearTimeout(request.timeout);
  if (message.type === "codex-question-variant-error") {
    relayQuestionVariantMessage({ type: "codex-question-variant-error", questionId: request.questionId, error: message.error || "Codex question variant failed." });
    request.sendResponse({ ok: false, error: message.error || "Codex question variant failed." });
    return;
  }
  relayQuestionVariantMessage({ type: "codex-question-variant-done", questionId: request.questionId, text: message.text || "" });
  request.sendResponse({ ok: true, text: message.text || "" });
}

function resolveSolutionRevealRequest(message) {
  const request = solutionRevealRequests.get(message.requestId);
  if (!request) {
    return;
  }
  solutionRevealRequests.delete(message.requestId);
  clearTimeout(request.timeout);
  if (message.type === "codex-solution-reveal-error") {
    request.sendResponse({ ok: false, error: message.error || "Codex solution failed." });
    return;
  }
  request.sendResponse({ ok: true, text: message.text || "" });
}

function resolveSystemDesignScoreRequest(message) {
  const request = systemDesignScoreRequests.get(message.requestId);
  if (!request) {
    return;
  }
  systemDesignScoreRequests.delete(message.requestId);
  clearTimeout(request.timeout);
  if (message.type === "codex-system-design-score-error") {
    request.sendResponse({ ok: false, error: message.error || "Codex system design scoring failed." });
    return;
  }
  request.sendResponse({ ok: true, text: message.text || "" });
}

function rejectPendingSystemDesignScores(error) {
  for (const [requestId, request] of systemDesignScoreRequests.entries()) {
    clearTimeout(request.timeout);
    request.sendResponse({ ok: false, error });
    systemDesignScoreRequests.delete(requestId);
  }
}

function rejectPendingSolutionReveals(error) {
  for (const [requestId, request] of solutionRevealRequests.entries()) {
    clearTimeout(request.timeout);
    request.sendResponse({ ok: false, error });
    solutionRevealRequests.delete(requestId);
  }
}

function resolveExampleExplanationRequest(message) {
  const request = exampleExplanationRequests.get(message.requestId);
  if (!request) {
    return;
  }
  exampleExplanationRequests.delete(message.requestId);
  clearTimeout(request.timeout);
  if (message.type === "codex-example-explanation-error") {
    relayExampleExplanationMessage({ type: "codex-example-explanation-error", exampleKey: request.exampleKey, error: message.error || "Codex example explanation failed." });
    request.sendResponse({ ok: false, error: message.error || "Codex example explanation failed." });
    return;
  }
  relayExampleExplanationMessage({ type: "codex-example-explanation-done", exampleKey: request.exampleKey, text: message.text || "" });
  request.sendResponse({ ok: true, text: message.text || "" });
}

function rejectPendingExampleExplanations(error) {
  for (const [requestId, request] of exampleExplanationRequests.entries()) {
    clearTimeout(request.timeout);
    relayExampleExplanationMessage({ type: "codex-example-explanation-error", exampleKey: request.exampleKey, error });
    request.sendResponse({ ok: false, error });
    exampleExplanationRequests.delete(requestId);
  }
}

function relayExampleExplanationChunk(message) {
  const request = exampleExplanationRequests.get(message.requestId);
  if (!request) {
    return;
  }
  relayExampleExplanationMessage({ type: "codex-example-explanation-chunk", exampleKey: request.exampleKey, text: message.text || "" });
}

function relayExampleExplanationMessage(message) {
  chrome.runtime.sendMessage(message, () => {
    void chrome.runtime.lastError;
  });
}

function rejectPendingQuestionVariants(error) {
  for (const [requestId, request] of questionVariantRequests.entries()) {
    clearTimeout(request.timeout);
    relayQuestionVariantMessage({ type: "codex-question-variant-error", questionId: request.questionId, error });
    request.sendResponse({ ok: false, error });
    questionVariantRequests.delete(requestId);
  }
}

function relayQuestionVariantChunk(message) {
  const request = questionVariantRequests.get(message.requestId);
  if (!request) {
    return;
  }
  relayQuestionVariantMessage({ type: "codex-question-variant-chunk", questionId: request.questionId, text: message.text || "" });
}

function relayQuestionVariantMessage(message) {
  chrome.runtime.sendMessage(message, () => {
    void chrome.runtime.lastError;
  });
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
