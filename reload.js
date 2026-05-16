function getStatusElement(doc = globalThis.document) {
  return doc?.querySelector?.('[data-test-study-ladder="extension-reload-status"]') ?? null;
}

function setReloadStatus(message, doc = globalThis.document) {
  const statusElement = getStatusElement(doc);
  if (statusElement) {
    statusElement.textContent = message;
  }
}

export function reloadExtension(runtime = globalThis.chrome?.runtime, doc = globalThis.document) {
  if (!runtime || typeof runtime.reload !== "function") {
    setReloadStatus("chrome.runtime.reload is unavailable in this context.", doc);
    return false;
  }

  setReloadStatus("Reloading extension.", doc);
  runtime.reload();
  return true;
}

reloadExtension();
