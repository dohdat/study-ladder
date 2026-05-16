import { useEffect } from "react";
import { loader } from "@monaco-editor/react";

export function useMonacoAssets() {
  useEffect(() => {
    const monacoBaseUrl = new URL("monaco/vs", window.location.href).toString().replace(/\/$/, "");
    (window as typeof window & {
      MonacoEnvironment?: { getWorkerUrl: (_workerId: string, _label: string) => string };
    }).MonacoEnvironment = {
      getWorkerUrl: () => `${monacoBaseUrl}/base/worker/workerMain.js`
    };
    loader.config({ paths: { vs: monacoBaseUrl } });
  }, []);
}
