const CODEX_HINT_HOST = "com.study_ladder.codex_hint";
const HINT_REQUEST_TYPE = "open-codex-hint";
const WARM_REQUEST_TYPE = "warm-codex-hint";

let hintPort = null;
let hintRequestActive = false;

function openStudyPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("out/index.html")
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

chrome.action.onClicked.addListener(openStudyPage);
chrome.runtime.onMessage.addListener(handleMessage);
