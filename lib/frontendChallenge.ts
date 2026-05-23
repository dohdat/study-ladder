import type { Question } from "../types/study";

export const FRONTEND_APP_FILE = "App.tsx";
export const FRONTEND_CSS_FILE = "styles.css";

export type FrontendFileName = typeof FRONTEND_APP_FILE | typeof FRONTEND_CSS_FILE;
export type FrontendDraftFiles = Record<FrontendFileName, string>;

type SerializedFrontendDraft = {
  files: FrontendDraftFiles;
  kind: "frontend-draft";
  version: 1;
};

export function isFrontendChallenge(question: Question | null | undefined) {
  return Boolean(question?.frontend);
}

export function createInitialQuestionDraft(question: Question) {
  if (!question.frontend) {
    return question.starter;
  }
  return serializeFrontendDraft({
    [FRONTEND_APP_FILE]: question.frontend.files[FRONTEND_APP_FILE],
    [FRONTEND_CSS_FILE]: question.frontend.files[FRONTEND_CSS_FILE]
  });
}

export function parseFrontendDraft(question: Question, code: string): FrontendDraftFiles {
  const fallback = question.frontend?.files || { [FRONTEND_APP_FILE]: question.starter, [FRONTEND_CSS_FILE]: "" };
  try {
    const parsed = JSON.parse(code) as Partial<SerializedFrontendDraft>;
    if (parsed?.kind === "frontend-draft" && parsed.files) {
      return {
        [FRONTEND_APP_FILE]: typeof parsed.files[FRONTEND_APP_FILE] === "string" ? parsed.files[FRONTEND_APP_FILE] : fallback[FRONTEND_APP_FILE],
        [FRONTEND_CSS_FILE]: typeof parsed.files[FRONTEND_CSS_FILE] === "string" ? parsed.files[FRONTEND_CSS_FILE] : fallback[FRONTEND_CSS_FILE]
      };
    }
  } catch {
    return {
      [FRONTEND_APP_FILE]: code || fallback[FRONTEND_APP_FILE],
      [FRONTEND_CSS_FILE]: fallback[FRONTEND_CSS_FILE]
    };
  }
  return fallback;
}

export function serializeFrontendDraft(files: FrontendDraftFiles) {
  return JSON.stringify({ files, kind: "frontend-draft", version: 1 }, null, 2);
}
