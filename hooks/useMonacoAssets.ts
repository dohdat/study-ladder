import { useEffect } from "react";
import { loader } from "@monaco-editor/react";

export function useMonacoAssets() {
  useEffect(() => {
    const monacoBaseUrl = getMonacoBaseUrl();
    (window as typeof window & {
      MonacoEnvironment?: { getWorkerUrl: (_workerId: string, _label: string) => string };
    }).MonacoEnvironment = {
      getWorkerUrl: () => `${monacoBaseUrl}/base/worker/workerMain.js`
    };
    loader.config({ paths: { vs: monacoBaseUrl } });
  }, []);
}

function getMonacoBaseUrl() {
  const runtime = (globalThis as typeof globalThis & {
    chrome?: { runtime?: { getURL?: (path: string) => string } };
  }).chrome?.runtime;
  if (runtime?.getURL) {
    return runtime.getURL("out/monaco/vs").replace(/\/$/, "");
  }
  return new URL("monaco/vs", window.location.href).toString().replace(/\/$/, "");
}
