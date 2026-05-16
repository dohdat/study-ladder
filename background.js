const CODEX_HINT_HOST = "com.study_ladder.codex_hint";
const HINT_REQUEST_TYPE = "open-codex-hint";

function openStudyPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("out/index.html")
  });
}

function handleMessage(message, _sender, sendResponse) {
  if (!message || message.type !== HINT_REQUEST_TYPE) {
    return false;
  }

  return connectHintHost(message, _sender, sendResponse);
}

function connectHintHost(message, sender, sendResponse) {
  const tabId = sender.tab?.id;
  if (!tabId || !message.prompt) {
    sendResponse({ ok: false, error: "Practice tab or hint prompt is missing." });
    return false;
  }

  const port = chrome.runtime.connectNative(CODEX_HINT_HOST);
  function relayNativeMessage(nativeMessage) {
    chrome.tabs.sendMessage(tabId, nativeMessage);
    if (nativeMessage.type === "codex-hint-done" || nativeMessage.type === "codex-hint-error") {
      port.disconnect();
    }
  }
  function handleDisconnect() {
    const error = chrome.runtime.lastError?.message;
    if (error) {
      chrome.tabs.sendMessage(tabId, { type: "codex-hint-error", error });
    }
  }

  port.onMessage.addListener(relayNativeMessage);
  port.onDisconnect.addListener(handleDisconnect);
  port.postMessage({ type: "hint", prompt: message.prompt });
  sendResponse({ ok: true });
  return true;
}

chrome.action.onClicked.addListener(openStudyPage);
chrome.runtime.onMessage.addListener(handleMessage);
