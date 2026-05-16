const CODEX_HINT_HOST = "com.study_ladder.codex_hint";
const HINT_REQUEST_TYPE = "open-codex-hint";
const WARM_REQUEST_TYPE = "warm-codex-hint";

let hintPort = null;
let activeHintTabId = null;

function openStudyPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html")
  });
}

function handleMessage(message, _sender, sendResponse) {
  if (!message || (message.type !== HINT_REQUEST_TYPE && message.type !== WARM_REQUEST_TYPE)) {
    return false;
  }

  if (message.type === WARM_REQUEST_TYPE) {
    return warmHintHost(sendResponse);
  }

  return requestHint(message, _sender, sendResponse);
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
  const tabId = sender.tab?.id;
  if (!tabId || !message.prompt) {
    sendResponse({ ok: false, error: "Practice tab or hint prompt is missing." });
    return false;
  }

  const port = ensureHintPort();
  if (!port) {
    sendResponse({ ok: false, error: "Could not connect to Codex hint helper." });
    return false;
  }

  activeHintTabId = tabId;
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
    if (activeHintTabId) {
      relayHintMessage(nativeMessage);
    }
    if (nativeMessage.type === "codex-hint-done" || nativeMessage.type === "codex-hint-error") {
      activeHintTabId = null;
    }
  }
  function handleDisconnect() {
    const error = chrome.runtime.lastError?.message;
    if (error && activeHintTabId) {
      relayHintMessage({ type: "codex-hint-error", error });
    }
    activeHintTabId = null;
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

chrome.action.onClicked.addListener(openStudyPage);
chrome.runtime.onMessage.addListener(handleMessage);
