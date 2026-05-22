/* eslint-disable max-lines */
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Stack } from "@mantine/core";
import type { OnMount } from "@monaco-editor/react";

import { AppHeader } from "../components/AppHeader";
import { PracticeArea, type PracticePanelActions } from "../components/PracticePanels";
import { DeathResetModal } from "../components/DeathResetModal";
import type { CombatImpactVisual, MonsterDamagePop } from "../components/MonsterEncounter";
import { RewardNotifications, type RewardNotification } from "../components/RewardNotifications";
import { SpireMapPanel } from "../components/SpireMapPanel";
import { questions } from "../data/questions";
import { useCodexHintStream } from "../hooks/useCodexHintStream";
import { useActiveWarriorSkillAction } from "../hooks/useActiveWarriorSkillAction";
import { useFullscreenGuard } from "../hooks/useFullscreenGuard";
import { useHeaderStats } from "../hooks/useHeaderStats";
import { useMonacoAssets } from "../hooks/useMonacoAssets";
import { useStudyTimeTracker } from "../hooks/useStudyBlocker";
import { usePersistAchievements } from "../hooks/usePersistAchievements";
import { useStudyNotifications } from "../hooks/useStudyNotifications";
import { areHintsDisabledByHeat, isRunCodeDisabledByHeat } from "../lib/campaignCore";
import { beautifyCode } from "../lib/codeFormat";
import { applyPassedCombatResult, getElapsedPressureRatio, getTimedMonsterAttack, isMonsterEnraged } from "../lib/combatCore";
import { getTimerDisplay } from "../lib/timerDisplay";
import { chooseNextSpireQuestion, completeSpireQuestion, getCurrentRoundQuestion, getCurrentSpireNode, isCombatNode as isSpireCombatNode } from "../lib/spireMapCore";
import {
  HINT_COST, applyHealthPenalty, applyIncomingDamage, applyScheduleResult, buyHint, canBuyHint, cloneState, defaultState, getCard,
  getHintCost, getIncomingDamageEffect, getMaxHealth, getMetaStartingGoldBonus, getModifiedQuestionTimeLimitMs, getRunModifierTotals, isQuestionInRecommendedRange, markQuestionRunCode, normalizeStudyState, setCard, setSpireMinimumRating
} from "../lib/studyCore";
import { CODEX_QUESTION_VARIANT_CHUNK, CODEX_QUESTION_VARIANT_DONE, CODEX_QUESTION_VARIANT_ERROR, createHintPrompt, requestCodexQuestionVariant } from "../lib/hintPrompt";
import { createLocalHint } from "../lib/localHint";
import { RUNNER_FRAME, STATUS_COLOR, type StatusTone } from "../lib/practiceStatus";
import { createQuestionVariant, createQuestionVariantPrompt } from "../lib/questionVariant";
import { migrateLocalStorageState, saveStudyState } from "../lib/studyDb";
import type { ConsoleRunResult, Question, RunResult, StudyState } from "../types/study";

const RUN_TIMEOUT_MS = 2500, SECOND_MS = 1000;
const TIMER_PAD = 2, NUMBER_BASE_HEX = 16;
const VISIBLE_RUN_CASE_COUNT = 3;
const DAMAGE_POP_TIMEOUT_MS = 840;
const PLAYER_IMPACT_TIMEOUT_MS = 2200;
const COMBAT_ADVANCE_DELAY_MS = 680;
const QUESTION_VARIANT_RETRY_MS = 5000;

type TestRunnerMessage = { type: "run-result"; runId: string; ok: boolean; error?: string; results: RunResult[]; runtimeMs?: number };
type CodeRunMessage = { type: "code-run-result"; runId: string; ok: boolean; error?: string; output: string[]; results?: RunResult[]; runtimeMs?: number };
type RunnerReadyMessage = { type: "runner-ready" };
type RunnerMessage = TestRunnerMessage | CodeRunMessage | RunnerReadyMessage;
type QuestionVariantStreamMessage = {
  error?: string;
  questionId?: string;
  text?: string;
  type: typeof CODEX_QUESTION_VARIANT_CHUNK | typeof CODEX_QUESTION_VARIANT_DONE | typeof CODEX_QUESTION_VARIANT_ERROR;
};
type QuestionVariantChromeRuntime = {
  onMessage?: {
    addListener: (listener: (message: unknown) => void) => void;
    removeListener: (listener: (message: unknown) => void) => void;
  };
};

type FailAndAdvance = (message: string, draft?: string, timeRemainingMs?: number) => void;

type TimerControls = { timeRemainingMs: number; questionFinished: boolean; setQuestionFinished: (finished: boolean) => void };

type PracticeActions = PracticePanelActions;

function useHydrateStudy(setState: (state: StudyState) => void, setQuestion: (question: Question) => void, setCode: (code: string) => void) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    async function hydrate() {
      const saved = normalizeStudyState(await migrateLocalStorageState());
      const savedQuestion = questions.find((question) => question.id === saved.currentId);
      const initialQuestion = getCurrentRoundQuestion(saved, savedQuestion && isQuestionInRecommendedRange(saved, savedQuestion, true) ? savedQuestion : null);
      if (active) {
        setState({ ...saved, currentId: initialQuestion.id });
        setQuestion(initialQuestion);
        setCode(initialQuestion.starter);
        setHydrated(true);
      }
    }
    hydrate().catch(() => {
      const saved = defaultState();
      const initialQuestion = getCurrentRoundQuestion(saved, null);
      if (active) {
        setState(saved);
        setQuestion(initialQuestion);
        setCode(initialQuestion.starter);
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, [setCode, setQuestion, setState]);
  return hydrated;
}

function usePersistStudy(state: StudyState, hydrated: boolean, setTone: (tone: StatusTone) => void, setStatus: (status: string) => void) {
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveStudyState(state).catch(() => {
      setTone("fail");
      setStatus("Could not save progress to IndexedDB.");
    });
  }, [hydrated, setStatus, setTone, state]);
}

function useQuestionTimer(params: {
  code: string;
  currentQuestion: Question | null;
  failAndAdvance: FailAndAdvance;
  sessionStarted: boolean;
  mode: StudyState["mode"];
  setResults: (results: RunResult[]) => void;
  setConsoleRunResult: (result: ConsoleRunResult | null) => void;
  setRunning: (running: boolean) => void;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  activeRunId: React.MutableRefObject<string | null>;
  runTimer: React.MutableRefObject<number | null>;
  questionTimeLimitMs: number;
}): TimerControls {
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [questionFinished, setQuestionFinished] = useState(false);
  const timedOutQuestionId = useRef<string | null>(null);
  useEffect(() => {
    if (!params.currentQuestion) {
      setTimeRemainingMs(0);
      return;
    }
    timedOutQuestionId.current = null;
    setQuestionFinished(false);
    setTimeRemainingMs(params.questionTimeLimitMs);
  }, [params.currentQuestion, params.questionTimeLimitMs]);
  useTimerInterval({ ...params, questionFinished, setQuestionFinished, setTimeRemainingMs, timedOutQuestionId });
  return { timeRemainingMs, questionFinished, setQuestionFinished };
}

function useTimerInterval(params: Parameters<typeof useQuestionTimer>[0] & {
  questionFinished: boolean;
  setQuestionFinished: (finished: boolean) => void;
  setTimeRemainingMs: React.Dispatch<React.SetStateAction<number>>;
  timedOutQuestionId: React.MutableRefObject<string | null>;
}) {
  useEffect(() => {
    if (!params.currentQuestion || params.mode !== "leetcode" || params.questionFinished || !params.sessionStarted) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      params.setTimeRemainingMs((remaining) => nextRemainingTime(remaining, params));
    }, SECOND_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [params]);
}

function nextRemainingTime(remaining: number, params: Parameters<typeof useTimerInterval>[0]) {
  if (remaining > SECOND_MS) {
    return remaining - SECOND_MS;
  }
  if (params.currentQuestion && params.timedOutQuestionId.current !== params.currentQuestion.id) {
    expireQuestion(params);
  }
  return 0;
}

function expireQuestion(params: Parameters<typeof useTimerInterval>[0]) {
  const question = params.currentQuestion;
  if (!question) {
    return;
  }
  params.timedOutQuestionId.current = question.id;
  params.activeRunId.current = null;
  if (params.runTimer.current) {
    window.clearTimeout(params.runTimer.current);
    params.runTimer.current = null;
  }
  params.setRunning(false);
  params.setResults([]);
  params.setConsoleRunResult(null);
  params.failAndAdvance("Time expired. Moving to next question.", params.code, 0);
}

function useRunnerMessages(params: {
  code: string;
  currentQuestion: Question | null;
  failAndAdvance: FailAndAdvance;
  showHealthLoss: (amount?: number, hitCount?: number) => void;
  showPlayerImpact: (impact: CombatImpactVisual) => void;
  showRewards: (question: Question, state: StudyState, now?: number) => void; runnerReady: boolean; runnerFrame: React.MutableRefObject<HTMLIFrameElement | null>;
  showMonsterDamage: (damage: MonsterDamagePop) => void;
  state: StudyState;
  timeRemainingMs: number;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  setQuestionFinished: (finished: boolean) => void;
  setCode: (code: string) => void;
  setCurrentQuestion: (question: Question) => void;
  setConsoleRunResult: (result: ConsoleRunResult | null) => void;
  setResults: (results: RunResult[]) => void;
  setRunning: (running: boolean) => void;
  setRunnerReady: (ready: boolean) => void;
  setSessionStarted: (started: boolean) => void;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  activeRunId: React.MutableRefObject<string | null>;
  runTimer: React.MutableRefObject<number | null>;
  clearHint: () => void;
}) {
  useEffect(() => {
    function onMessage(event: MessageEvent<RunnerMessage>) {
      const message = event.data;
      if (message?.type === "runner-ready") {
        params.setRunnerReady(true);
        return;
      }
      if (!message || message.runId !== params.activeRunId.current || !params.currentQuestion) {
        return;
      }
      clearRunTimer(params.runTimer);
      params.activeRunId.current = null;
      params.setRunning(false);
      if (message.type === "code-run-result") {
        handleCodeRunMessage(message, params);
        return;
      }
      handleRunMessage(message, params);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [params]);
  useEffect(() => { if (params.runnerReady) { return undefined; } const timer = window.setInterval(() => params.runnerFrame.current?.contentWindow?.postMessage({ type: "runner-ping" }, "*"), SECOND_MS); return () => window.clearInterval(timer); }, [params]);
}

function handleRunMessage(message: TestRunnerMessage, params: Parameters<typeof useRunnerMessages>[0]) {
  const question = params.currentQuestion;
  if (!question) {
    return;
  }
  if (params.state.profile.godMode) {
    completePassedSubmit(params, question);
    return;
  }
  if (message.error) {
    params.failAndAdvance(message.error, params.code, params.timeRemainingMs);
    return;
  }
  if (!message.ok) {
    const now = Date.now();
    const attack = getTimedMonsterAttack(question, params.timeRemainingMs, now, "retaliation", { enraged: isMonsterEnraged(params.state, question) });
    const healthLoss = getIncomingDamageEffect(params.state, attack.damage, attack.manaDamage, question.id, attack.element).healthLoss;
    if (healthLoss > 0) {
      params.showPlayerImpact(createPlayerImpact(question, attack, healthLoss, now));
    }
    params.showHealthLoss(healthLoss, attack.hitCount);
    params.setState((previous) => applyHealthPenalty(previous, attack.damage, attack.manaDamage, question.id, params.code, now, attack.element));
    const submitResult = createHiddenSubmitResult(params.state, message.results, message.runtimeMs);
    params.setResults([]);
    params.setConsoleRunResult(submitResult);
    params.setTone("fail");
    params.setStatus(getFailStatus(attack));
    return;
  }
  completePassedSubmit(params, question);
}

function createHiddenSubmitResult(state: StudyState, results: RunResult[], runtimeMs: number | undefined): ConsoleRunResult {
  const failedResults = results.filter((result) => !result.pass);
  const revealCount = Math.max(0, Math.floor(getRunModifierTotals(state).revealSubmitTestCount || 0));
  const revealed = failedResults.slice(0, revealCount);
  return {
    hiddenTestCount: failedResults.length || results.length,
    ok: false,
    output: [],
    results: revealed,
    revealedTestCount: revealed.length,
    runtimeMs
  };
}

function completePassedSubmit(params: Parameters<typeof useRunnerMessages>[0], question: Question) {
  const now = Date.now();
  const timePressureRatio = getElapsedPressureRatio(question, params.timeRemainingMs);
  const timeLimitMs = getModifiedQuestionTimeLimitMs(params.state, question);
  const timeRemainingRatio = timeLimitMs > 0 ? Math.max(0, Math.min(1, params.timeRemainingMs / timeLimitMs)) : 0;
  const usedRunCode = params.state.profile.spireRun.runCodeQuestionIds.includes(question.id);
  const combat = applyPassedCombatResult(params.state, question.id, params.code, now, { timePressureRatio, timeRemainingRatio, usedRunCode });
  if (combat.hit) {
    params.showMonsterDamage({
      amount: combat.hit.damage,
      critical: combat.hit.critical,
      damageTypes: combat.hit.damageTypes,
      hitCount: combat.hit.hitCount,
      id: `${question.id}-${now}-${combat.hit.damage}`,
      maxHealth: combat.hit.maxHealth,
      questionId: question.id,
      remainingHealth: combat.hit.remainingHealth,
      statusEffects: getHitStatusEffects(combat.hit)
    });
  }
  const timed = applyElapsedCombatDamage(combat.state, question, params.timeRemainingMs, now);
  if (timed.healthLoss > 0) {
    params.showPlayerImpact(createPlayerImpact(question, timed.attack, timed.healthLoss, now));
    params.showHealthLoss(timed.healthLoss, timed.attack.hitCount);
  }
  params.setResults([]);
  params.setConsoleRunResult(null);
  params.clearHint();
  if (combat.hit) {
    params.setQuestionFinished(true);
    params.setState(timed.state);
    params.setStatus(`${formatHitStatus(combat.hit)} ${getTimeDamageStatus(timed)}`);
    window.setTimeout(() => finishPassedSubmit(params, question, timed.state, now, combat.hit), COMBAT_ADVANCE_DELAY_MS);
    return;
  }
  finishPassedSubmit(params, question, timed.state, now, combat.hit);
}

function finishPassedSubmit(params: Parameters<typeof useRunnerMessages>[0], question: Question, state: StudyState, now: number, hit: ReturnType<typeof applyPassedCombatResult>["hit"]) {
  const progressed = completeSpireQuestion(state, question, now);
  const picked = chooseNextSpireQuestion(progressed, question);
  const nextState = { ...progressed, currentId: picked.id };
  params.showRewards(question, params.state, now);
  params.setState(nextState);
  params.setCurrentQuestion(picked);
  params.setCode(picked.starter);
  params.setSessionStarted(false);
  params.setQuestionFinished(false);
  if (progressed.profile.spireRun.mapOpen) {
    params.setTone("pass");
    params.setStatus("Room cleared. Choose the next path on the map.");
    return;
  }
  if (hit?.defeated) {
    params.setTone("pass");
    params.setStatus(`Monster defeated. ${formatHitStatus(hit)} Next question loaded.`);
    return;
  }
  params.setTone("pass");
  params.setStatus(`${hit ? formatHitStatus(hit) : "Hit for 0."} Enemy health ${hit?.remainingHealth}/${hit?.maxHealth}. Next question loaded.`);
}

function applyElapsedCombatDamage(state: StudyState, question: Question, timeRemainingMs: number, now: number) {
  const attack = getElapsedMonsterAttack(state, question, timeRemainingMs, now);
  const result = applyIncomingDamage(state, attack.damage, attack.manaDamage, question.id, attack.element);
  return { attack, healthLoss: result.healthLoss, state: result.state };
}

function getElapsedMonsterAttack(state: StudyState, question: Question, timeRemainingMs: number, now: number) {
  return getTimedMonsterAttack(question, timeRemainingMs, now, "elapsed", { enraged: isMonsterEnraged(state, question) });
}

function getTimeDamageStatus(result: ReturnType<typeof applyElapsedCombatDamage>) {
  if (result.healthLoss <= 0) {
    return "";
  }
  const hitCount = result.attack.hitCount > 1 ? ` x${result.attack.hitCount}` : "";
  return `Time pressure hit${hitCount} for ${result.healthLoss}. `;
}

function handleCodeRunMessage(message: CodeRunMessage, params: Parameters<typeof useRunnerMessages>[0]) {
  params.setResults([]);
  params.setConsoleRunResult({ ok: message.ok, output: message.output, error: message.error, results: message.results, runtimeMs: message.runtimeMs });
  params.setTone(message.ok ? "pass" : "fail");
  params.setStatus(message.ok ? "Accepted" : "Wrong Answer");
}

function formatHitStatus(hit: NonNullable<ReturnType<typeof applyPassedCombatResult>["hit"]>) {
  const skill = hit.activeSkillName ? `${hit.activeSkillName} ` : "";
  const hitCount = hit.hitCount > 1 ? ` x${hit.hitCount}` : "";
  const effects = hit.effects.length ? ` ${hit.effects.join(", ")}.` : "";
  const restored = hit.lifeRestored ? ` Restored ${hit.lifeRestored} health.` : "";
  return hit.critical ? `${skill}critical hit${hitCount} for ${hit.damage}.${effects}${restored}` : `${skill}hit${hitCount} for ${hit.damage}.${effects}${restored}`;
}

function getFailStatus(attack: ReturnType<typeof getTimedMonsterAttack>) {
  const prefix = attack.hitCount > 1 ? `Multi-Shot hit ${attack.hitCount} times` : "Monster hit";
  const element = attack.element ? ` ${attack.element[0].toUpperCase()}${attack.element.slice(1)}` : "";
  const effects = attack.effects?.length ? ` ${attack.effects.join(", ")}.` : "";
  return `${prefix} for ${attack.damage}${element} damage.${effects} Wrong Answer`;
}

function clearRunTimer(runTimer: React.MutableRefObject<number | null>) {
  if (runTimer.current) {
    window.clearTimeout(runTimer.current);
    runTimer.current = null;
  }
}

function usePracticeActions(params: {
  code: string;
  currentQuestion: Question | null;
  questionVariantReady: boolean;
  runnerReady: boolean;
  setCode: (code: string) => void;
  setCurrentQuestion: (question: Question) => void;
  setQuestionFinished: (finished: boolean) => void;
  setConsoleRunResult: (result: ConsoleRunResult | null) => void;
  setResults: (results: RunResult[]) => void;
  setRunnerReady: (ready: boolean) => void;
  setRunning: (running: boolean) => void;
  setSessionStarted: (started: boolean) => void;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  state: StudyState;
  failAndAdvance: FailAndAdvance;
  activeRunId: React.MutableRefObject<string | null>;
  runTimer: React.MutableRefObject<number | null>;
  runnerFrame: React.MutableRefObject<HTMLIFrameElement | null>;
  clearHint: () => void;
  startHint: (prompt: string, localHint?: string) => void;
  showHealthLoss: (amount?: number, hitCount?: number) => void;
  showPlayerImpact: (impact: CombatImpactVisual) => void;
  showRewards: (question: Question, state: StudyState, now?: number) => void;
  showMonsterDamage: (damage: MonsterDamagePop) => void;
  timeRemainingMs: number;
}): PracticeActions {
  const updateDraft = useUpdateDraft(params);
  const beautifyCurrentCode = useCallback((source = params.code) => updateDraft(beautifyCode(source)), [params.code, updateDraft]);
  useRunnerMessages(params);
  const chooseQuestion = useChooseQuestion(params, updateDraft);
  const buyHintAction = useBuyHint(params);
  const startQuestion = useStartQuestion(params);
  const submitCode = useSubmitCode({ ...params, updateDraft });
  const runCode = useRunCode({ ...params, updateDraft });
  const useActiveSkill = useActiveWarriorSkillAction({ setState: params.setState, setStatus: params.setStatus, setTone: params.setTone, state: params.state });
  const handleEditorMount = useEditorMount(beautifyCurrentCode, runCode, submitCode);
  return { updateDraft, beautifyCurrentCode, handleEditorMount, chooseQuestion, buyHint: buyHintAction, runCode, startQuestion, submitCode, useActiveSkill };
}

function useUpdateDraft(params: { currentQuestion: Question | null; setCode: (code: string) => void; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return useCallback((nextCode: string) => {
    params.setCode(nextCode);
    if (!params.currentQuestion) {
      return;
    }
    const question = params.currentQuestion;
    params.setState((previous) => {
      const next = cloneState(previous);
      setCard(next, question.id, { ...getCard(next, question.id), draft: nextCode });
      return next;
    });
  }, [params]);
}

function useEditorMount(beautifyCurrentCode: (source?: string) => void, runCode: () => void, submitCode: () => void): OnMount {
  const beautifyRef = useRef(beautifyCurrentCode);
  const runRef = useRef(runCode);
  const submitRef = useRef(submitCode);

  useEffect(() => {
    beautifyRef.current = beautifyCurrentCode;
    runRef.current = runCode;
    submitRef.current = submitCode;
  }, [beautifyCurrentCode, runCode, submitCode]);

  return useCallback((editor, monaco) => {
    editor.addAction({
      id: "study-ladder-beautify",
      label: "Beautify Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => beautifyRef.current(editor.getValue())
    });
    editor.addAction({
      id: "study-ladder-run",
      label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote],
      run: () => runRef.current()
    });
    editor.addAction({
      id: "study-ladder-submit",
      label: "Submit Solution",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => submitRef.current()
    });
  }, []);
}

function useChooseQuestion(params: Parameters<typeof usePracticeActions>[0], updateDraft: (code: string) => void) {
  return useCallback((preferNext: boolean) => {
    const picked = preferNext ? chooseNextSpireQuestion(params.state, params.currentQuestion) : getCurrentRoundQuestion(params.state, params.currentQuestion);
    params.setCurrentQuestion(picked);
    params.setState((previous) => ({ ...previous, currentId: picked.id }));
    updateDraft(picked.starter);
    params.setResults([]);
    params.setConsoleRunResult(null);
    params.setTone("default");
    params.setStatus("Ready");
    params.setQuestionFinished(false);
    params.setSessionStarted(false);
    params.clearHint();
  }, [params, updateDraft]);
}

function useBuyHint(params: Parameters<typeof usePracticeActions>[0]) {
  return useCallback(() => {
    const question = params.currentQuestion;
    if (areHintsDisabledByHeat(params.state.profile.spireRun)) {
      params.setTone("fail");
      params.setStatus("Silent Oath is active. Hints are disabled for this run.");
      return;
    }
    if (!question || !canBuyHint(params.state, question.id)) {
      params.setTone("fail");
      params.setStatus(`You need ${question ? getHintCost(params.state, question.id) : HINT_COST} gold to buy a hint.`);
      return;
    }
    const prompt = createHintPrompt(question, params.code);
    const cost = getHintCost(params.state, question.id);
    params.setState((previous) => buyHint(previous, question.id));
    params.setTone("default");
    params.setStatus(cost > 0 ? `Spent ${cost} gold. Asking Codex for one next step.` : "Used your free room hint. Asking Codex for one next step.");
    params.startHint(prompt, createLocalHint(question));
    navigator.clipboard?.writeText(prompt).catch(() => undefined);
  }, [params]);
}

function useStartQuestion(params: Parameters<typeof usePracticeActions>[0]) {
  return useCallback(() => {
    if (!params.currentQuestion || params.state.mode !== "leetcode" || params.state.profile.spireRun.mapOpen) {
      return;
    }
    if (!params.questionVariantReady) {
      params.setTone("default");
      params.setStatus("Waiting for Codex CLI to rewrite this question.");
      return;
    }
    params.runnerFrame.current?.contentWindow?.postMessage({ type: "runner-ping" }, "*");
    params.setQuestionFinished(false);
    params.setSessionStarted(true);
    params.setTone("default");
    params.setStatus("Starting fullscreen guard.");
    document.documentElement.requestFullscreen()
      .then(() => {
        params.setTone("default");
        params.setStatus("Keep going.");
      })
      .catch(() => {
        params.setTone("fail");
        params.setStatus("Could not enter fullscreen. Return to fullscreen or this question fails.");
      });
  }, [params]);
}

function useSubmitCode(params: Parameters<typeof usePracticeActions>[0] & {
  failAndAdvance: FailAndAdvance;
  updateDraft: (code: string) => void;
}) {
  return useCallback(() => {
    if (!params.currentQuestion || !params.runnerFrame.current?.contentWindow) {
      return;
    }
    if (!params.runnerReady) {
      params.setTone("fail");
      params.setStatus("Runner is still loading. Try again in a second.");
      return;
    }
    if (isRunCodeDisabledByHeat(params.state.profile.spireRun)) {
      params.setTone("fail");
      params.setStatus("Blind Trial is active. Run Code is disabled for this run.");
      return;
    }
    const runId = `${Date.now()}-${Math.random().toString(NUMBER_BASE_HEX).slice(TIMER_PAD)}`;
    const formattedCode = beautifyCode(params.code);
    if (formattedCode !== params.code) {
      params.updateDraft(formattedCode);
    }
    startRun(runId, formattedCode, params);
  }, [params]);
}

function useRunCode(params: Parameters<typeof usePracticeActions>[0] & {
  updateDraft: (code: string) => void;
}) {
  return useCallback(() => {
    if (!params.currentQuestion || !params.runnerFrame.current?.contentWindow) {
      return;
    }
    if (!params.runnerReady) {
      params.setTone("fail");
      params.setStatus("Runner is still loading. Try again in a second.");
      return;
    }
    const runId = `${Date.now()}-${Math.random().toString(NUMBER_BASE_HEX).slice(TIMER_PAD)}`;
    const formattedCode = beautifyCode(params.code);
    if (formattedCode !== params.code) {
      params.updateDraft(formattedCode);
    }
    params.setState((previous) => params.currentQuestion ? markQuestionRunCode(previous, params.currentQuestion.id) : previous);
    startConsoleRun(runId, formattedCode, params);
  }, [params]);
}

function startRun(runId: string, formattedCode: string, params: Parameters<typeof useSubmitCode>[0]) {
  params.activeRunId.current = runId;
  params.setRunning(true);
  params.setTone("default");
  params.setStatus("Running tests");
  params.setResults([]);
  params.setConsoleRunResult(null);
  clearRunTimer(params.runTimer);
  params.runTimer.current = window.setTimeout(() => handleRunTimeout(runId, formattedCode, params), RUN_TIMEOUT_MS);
  params.runnerFrame.current?.contentWindow?.postMessage({
    type: "run-tests",
    runId,
    code: formattedCode,
    functionName: params.currentQuestion?.functionName,
    tests: params.currentQuestion?.tests
  }, "*");
}

function startConsoleRun(runId: string, formattedCode: string, params: Parameters<typeof useRunCode>[0]) {
  params.activeRunId.current = runId;
  params.setRunning(true);
  params.setTone("default");
  params.setStatus("Running code");
  params.setResults([]);
  params.setConsoleRunResult(null);
  clearRunTimer(params.runTimer);
  params.runTimer.current = window.setTimeout(() => handleConsoleRunTimeout(runId, params), RUN_TIMEOUT_MS);
  params.runnerFrame.current?.contentWindow?.postMessage({
    type: "run-code",
    runId,
    code: formattedCode,
    functionName: params.currentQuestion?.functionName,
    tests: params.currentQuestion?.tests.slice(0, VISIBLE_RUN_CASE_COUNT)
  }, "*");
}

function handleRunTimeout(runId: string, formattedCode: string, params: Parameters<typeof useSubmitCode>[0]) {
  if (params.activeRunId.current !== runId) {
    return;
  }
  params.activeRunId.current = null;
  params.runTimer.current = null;
  params.setRunning(false);
  params.failAndAdvance("Timed out. Moving to next question.", formattedCode, params.timeRemainingMs);
  params.runnerFrame.current?.contentWindow?.postMessage({ type: "reset-runner" }, "*");
}

function handleConsoleRunTimeout(runId: string, params: Parameters<typeof useRunCode>[0]) {
  if (params.activeRunId.current !== runId) {
    return;
  }
  params.activeRunId.current = null;
  params.runTimer.current = null;
  params.setRunning(false);
  params.setTone("fail");
  params.setStatus("Run timed out.");
  params.setConsoleRunResult({ ok: false, output: [], error: "Timed out while running code." });
  params.runnerFrame.current?.contentWindow?.postMessage({ type: "reset-runner" }, "*");
}

function useFailAndAdvance(params: {
  code: string;
  currentQuestion: Question | null;
  setCode: (code: string) => void;
  setCurrentQuestion: (question: Question) => void;
  setResults: (results: RunResult[]) => void;
  setConsoleRunResult: (result: ConsoleRunResult | null) => void;
  setRunning: (running: boolean) => void;
  setSessionStarted: (started: boolean) => void;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  state: StudyState;
  activeRunId: React.MutableRefObject<string | null>;
  runTimer: React.MutableRefObject<number | null>;
  clearHint: () => void;
  showHealthLoss: (amount?: number, hitCount?: number) => void;
  showPlayerImpact: (impact: CombatImpactVisual) => void;
}) {
  const { activeRunId, code, currentQuestion, runTimer, setCode, setConsoleRunResult, setCurrentQuestion, setResults, setRunning, setSessionStarted, setState, setStatus, setTone, state } = params;
  return useCallback((message: string, draft = code, timeRemainingMs?: number) => {
    if (!currentQuestion) {
      return;
    }
    const now = Date.now();
    const attack = getTimedMonsterAttack(currentQuestion, timeRemainingMs ?? getModifiedQuestionTimeLimitMs(state, currentQuestion), now, "retaliation", { enraged: isMonsterEnraged(state, currentQuestion) });
    const healthLoss = getIncomingDamageEffect(state, attack.damage, attack.manaDamage, currentQuestion.id, attack.element).healthLoss;
    const scheduled = applyScheduleResult(state, currentQuestion.id, false, draft, now, attack.damage, attack.manaDamage, attack.element);
    const picked = chooseNextSpireQuestion(scheduled, currentQuestion);
    const nextState = { ...scheduled, currentId: picked.id };
    activeRunId.current = null;
    clearRunTimer(runTimer);
    if (healthLoss > 0) {
      params.showPlayerImpact(createPlayerImpact(currentQuestion, attack, healthLoss, now));
    }
    params.showHealthLoss(healthLoss, attack.hitCount);
    setRunning(false);
    setResults([]);
    setConsoleRunResult(null);
    setTone("fail");
    setStatus(`${message} ${getFailStatus(attack)} Next question loaded.`);
    setSessionStarted(false);
    setState(nextState);
    setCurrentQuestion(picked);
    setCode(picked.starter);
    params.clearHint();
  }, [activeRunId, code, currentQuestion, params, runTimer, setCode, setConsoleRunResult, setCurrentQuestion, setResults, setRunning, setSessionStarted, setState, setStatus, setTone, state]);
}

function useSyncSpireQuestion(params: {
  active: boolean;
  currentQuestion: Question | null;
  sessionStarted: boolean;
  setCode: (code: string) => void;
  setCurrentQuestion: (question: Question) => void;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  state: StudyState;
}) {
  useEffect(() => {
    if (!params.active || params.sessionStarted || params.state.profile.spireRun.mapOpen) {
      return;
    }
    const nextQuestion = getCurrentRoundQuestion(params.state, params.currentQuestion);
    if (nextQuestion.id !== params.currentQuestion?.id) {
      params.setCurrentQuestion(nextQuestion);
      params.setCode(nextQuestion.starter);
      params.setState((previous) => ({ ...previous, currentId: nextQuestion.id }));
    }
  }, [params]);
}

function useQuestionDisplayVariant(params: {
  currentQuestion: Question | null;
  hydrated: boolean;
  sessionStarted: boolean;
  state: StudyState;
}) {
  const cache = useRef(new Map<string, Question>());
  const inFlight = useRef(new Set<string>());
  const retryTimers = useRef(new Map<string, number>());
  const streamTextByQuestionId = useRef(new Map<string, string>());
  const sessionStartedRef = useRef(params.sessionStarted);
  const [displayQuestion, setDisplayQuestion] = useState<Question | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    sessionStartedRef.current = params.sessionStarted;
  }, [params.sessionStarted]);

  const requestVariant = useCallback((question: Question) => {
    if (cache.current.has(question.id) || inFlight.current.has(question.id)) {
      return;
    }
    const retryTimer = retryTimers.current.get(question.id);
    if (retryTimer) {
      window.clearTimeout(retryTimer);
      retryTimers.current.delete(question.id);
    }
    inFlight.current.add(question.id);
    streamTextByQuestionId.current.set(question.id, "Codex CLI request started. Waiting for first token...");
    setRevision((current) => current + 1);
    const scheduleRetry = (message: string) => {
      streamTextByQuestionId.current.set(question.id, message);
      const nextRetry = window.setTimeout(() => {
        retryTimers.current.delete(question.id);
        setRevision((current) => current + 1);
        requestVariant(question);
      }, QUESTION_VARIANT_RETRY_MS);
      retryTimers.current.set(question.id, nextRetry);
      setRevision((current) => current + 1);
    };
    requestCodexQuestionVariant(question.id, createQuestionVariantPrompt(question))
      .then((response) => {
        if (!response.ok || !response.text) {
          scheduleRetry(`Codex CLI retrying in ${Math.round(QUESTION_VARIANT_RETRY_MS / SECOND_MS)}s: ${response.error || "empty rewrite response"}`);
          return;
        }
        const variant = createQuestionVariant(question, response.text);
        if (!variant) {
          scheduleRetry(`Codex draft did not match the question format. Retrying in ${Math.round(QUESTION_VARIANT_RETRY_MS / SECOND_MS)}s...`);
          return;
        }
        const queuedRetry = retryTimers.current.get(question.id);
        if (queuedRetry) {
          window.clearTimeout(queuedRetry);
          retryTimers.current.delete(question.id);
        }
        cache.current.set(question.id, variant);
        setRevision((current) => current + 1);
        setDisplayQuestion((current) => {
          if (sessionStartedRef.current || current?.id !== question.id) {
            return current;
          }
          return variant;
        });
      })
      .finally(() => {
        inFlight.current.delete(question.id);
        setRevision((current) => current + 1);
      });
  }, []);

  useEffect(() => {
    const timers = retryTimers.current;
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  useEffect(() => {
    const runtime = getQuestionVariantRuntime();
    if (!runtime?.onMessage) {
      return undefined;
    }
    function handleRuntimeMessage(message: unknown) {
      if (!isQuestionVariantStreamMessage(message) || !message.questionId) {
        return;
      }
      if (message.type === CODEX_QUESTION_VARIANT_CHUNK && message.text) {
        const current = streamTextByQuestionId.current.get(message.questionId) || "";
        streamTextByQuestionId.current.set(message.questionId, `${current}${message.text}`);
        setRevision((value) => value + 1);
        return;
      }
      if (message.type === CODEX_QUESTION_VARIANT_DONE) {
        streamTextByQuestionId.current.set(message.questionId, "Codex CLI rewrite complete. Parsing question...");
        setRevision((value) => value + 1);
        return;
      }
      if (message.type === CODEX_QUESTION_VARIANT_ERROR) {
        streamTextByQuestionId.current.set(message.questionId, `Codex CLI error: ${message.error || "rewrite failed"}`);
        setRevision((value) => value + 1);
      }
    }
    runtime.onMessage.addListener(handleRuntimeMessage);
    return () => runtime.onMessage?.removeListener(handleRuntimeMessage);
  }, []);

  useEffect(() => {
    if (!params.currentQuestion) {
      setDisplayQuestion(null);
      return;
    }
    setDisplayQuestion(cache.current.get(params.currentQuestion.id) || params.currentQuestion);
  }, [params.currentQuestion?.id]);

  useEffect(() => {
    if (!params.hydrated || !params.currentQuestion || params.state.mode !== "leetcode") {
      return;
    }
    requestVariant(params.currentQuestion);
  }, [params.currentQuestion, params.hydrated, params.state.mode, requestVariant]);

  useEffect(() => {
    if (!params.hydrated || !params.currentQuestion || params.state.mode !== "leetcode" || params.state.profile.spireRun.mapOpen) {
      return;
    }
    const nextQuestion = chooseNextSpireQuestion(params.state, params.currentQuestion);
    if (nextQuestion.id !== params.currentQuestion.id) {
      requestVariant(nextQuestion);
    }
  }, [params.currentQuestion, params.hydrated, params.state, requestVariant]);

  if (!params.currentQuestion) {
    return { loading: false, question: null, ready: false, streamText: "" };
  }
  const cached = cache.current.get(params.currentQuestion.id);
  const loading = inFlight.current.has(params.currentQuestion.id) || retryTimers.current.has(params.currentQuestion.id);
  return {
    loading,
    question: cached || (displayQuestion?.id === params.currentQuestion.id ? displayQuestion : params.currentQuestion),
    ready: Boolean(cached),
    revision,
    streamText: streamTextByQuestionId.current.get(params.currentQuestion.id) || ""
  };
}

function getQuestionVariantRuntime() {
  return (globalThis as typeof globalThis & { chrome?: { runtime?: QuestionVariantChromeRuntime } }).chrome?.runtime;
}

function isQuestionVariantStreamMessage(message: unknown): message is QuestionVariantStreamMessage {
  if (!message || typeof message !== "object" || !("type" in message)) {
    return false;
  }
  const type = (message as QuestionVariantStreamMessage).type;
  return type === CODEX_QUESTION_VARIANT_CHUNK || type === CODEX_QUESTION_VARIANT_DONE || type === CODEX_QUESTION_VARIANT_ERROR;
}

function formatQuestionVariantStreamStatus(text: string) {
  const compact = text.replace(/\s+/g, " ").trim().toLowerCase();
  if (!compact) {
    return "Preparing a fresh question...\nStarting Codex CLI.";
  }
  if (compact.includes("retrying in")) {
    return "Preparing a fresh question...\nCodex sent a draft that needs cleanup. Asking again in a few seconds.";
  }
  if (compact.includes("rewrite complete") || compact.includes("parsing question")) {
    return "Preparing a fresh question...\nChecking the final draft.";
  }
  if (compact.includes("waiting for codex response")) {
    return "Preparing a fresh question...\nCodex is writing a twisted version now.";
  }
  if (compact.includes("codex draft") || compact.includes("{")) {
    return "Preparing a fresh question...\nReviewing the Codex draft.";
  }
  if (compact.includes("submitting rewrite prompt") || compact.includes("session ready")) {
    return "Preparing a fresh question...\nSending the rewrite request to Codex.";
  }
  if (compact.includes("existing codex session")) {
    return "Preparing a fresh question...\nReusing the active Codex session.";
  }
  if (compact.includes("app-server") || compact.includes("websocket") || compact.includes("initialized") || compact.includes("thread ready")) {
    return "Preparing a fresh question...\nConnecting to Codex.";
  }
  if (compact.includes("error") || compact.includes("timed out") || compact.includes("failed")) {
    return "Preparing a fresh question...\nCodex is taking too long. Retrying automatically.";
  }
  return "Preparing a fresh question...\nStarting Codex CLI.";
}

function useMonsterDamagePop(setMonsterDamagePop: React.Dispatch<React.SetStateAction<MonsterDamagePop | null>>) {
  const clearTimer = useRef<number | null>(null);
  useEffect(() => () => clearRunTimer(clearTimer), [clearTimer]);

  return useCallback((damage: MonsterDamagePop) => {
    clearRunTimer(clearTimer);
    setMonsterDamagePop(damage);
    clearTimer.current = window.setTimeout(() => {
      setMonsterDamagePop(null);
      clearTimer.current = null;
    }, DAMAGE_POP_TIMEOUT_MS);
  }, [setMonsterDamagePop]);
}

function usePlayerImpact(setPlayerImpact: React.Dispatch<React.SetStateAction<CombatImpactVisual | null>>) {
  const clearTimer = useRef<number | null>(null);
  useEffect(() => () => clearRunTimer(clearTimer), [clearTimer]);

  return useCallback((impact: CombatImpactVisual) => {
    clearRunTimer(clearTimer);
    setPlayerImpact(impact);
    clearTimer.current = window.setTimeout(() => {
      setPlayerImpact(null);
      clearTimer.current = null;
    }, PLAYER_IMPACT_TIMEOUT_MS);
  }, [setPlayerImpact]);
}

function createPlayerImpact(question: Question, attack: ReturnType<typeof getTimedMonsterAttack>, amount: number, now: number): CombatImpactVisual {
  return {
    amount,
    damageTypes: [attack.element],
    hitCount: attack.hitCount,
    id: `${question.id}-${now}-${attack.element}-${amount}-${attack.hitCount}`,
    statusEffects: getAttackStatusEffects(attack)
  };
}

function getAttackStatusEffects(attack: ReturnType<typeof getTimedMonsterAttack>) {
  return Array.from(new Set([
    ...(attack.element && attack.element !== "physical" ? [formatDamageStatus(attack.element)] : []),
    ...(attack.effects || []),
    ...(attack.bonuses || []).filter(isVisibleAttackStatus)
  ])).slice(0, 4);
}

function getHitStatusEffects(hit: NonNullable<ReturnType<typeof applyPassedCombatResult>["hit"]>) {
  return Array.from(new Set([
    ...hit.damageTypes.filter((type) => type !== "physical").map(formatDamageStatus),
    ...hit.effects
  ])).slice(0, 4);
}

function formatDamageStatus(element: string) {
  return `${element[0].toUpperCase()}${element.slice(1)}`;
}

function isVisibleAttackStatus(status: string) {
  return [
    "Aura Enchanted",
    "Cold Enchanted",
    "Cursed",
    "Extra Fast",
    "Extra Strong",
    "Fire Enchanted",
    "Lightning Enchanted",
    "Multi-Shot",
    "Spectral Hit"
  ].includes(status);
}

// eslint-disable-next-line max-lines-per-function, complexity
export default function Home() {
  const [state, setState] = useState<StudyState>(() => defaultState());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [runStatus, setRunStatus] = useState("Ready");
  const [runTone, setRunTone] = useState<StatusTone>("default");
  const [results, setResults] = useState<RunResult[]>([]);
  const [consoleRunResult, setConsoleRunResult] = useState<ConsoleRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [runnerReady, setRunnerReady] = useState(false);
  const [rewardNotifications, setRewardNotifications] = useState<RewardNotification[]>([]);
  const [monsterDamagePop, setMonsterDamagePop] = useState<MonsterDamagePop | null>(null);
  const [playerImpact, setPlayerImpact] = useState<CombatImpactVisual | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const activeRunId = useRef<string | null>(null);
  const runTimer = useRef<number | null>(null);
  const runnerFrame = useRef<HTMLIFrameElement | null>(null);
  const hints = useCodexHintStream(setRunStatus, setRunTone);
  useMonacoAssets();
  const hydrated = useHydrateStudy(setState, setCurrentQuestion, setCode);
  usePersistAchievements(state, hydrated, setState);
  const { showHealthLoss, showRewards } = useStudyNotifications(state, hydrated, setRewardNotifications);
  const showMonsterDamage = useMonsterDamagePop(setMonsterDamagePop);
  const showPlayerImpact = usePlayerImpact(setPlayerImpact);
  usePersistStudy(state, hydrated, setRunTone, setRunStatus);
  const questionVariant = useQuestionDisplayVariant({ currentQuestion, hydrated, sessionStarted, state });
  const activeQuestion = questionVariant.question;
  useEffect(() => {
    if (!hydrated || sessionStarted || state.mode !== "leetcode" || state.profile.spireRun.mapOpen || !currentQuestion) {
      return;
    }
    if (questionVariant.ready) {
      setRunTone("default");
      setRunStatus("Codex question ready.");
      return;
    }
    setRunTone("default");
    setRunStatus(questionVariant.loading ? formatQuestionVariantStreamStatus(questionVariant.streamText) : "Preparing Codex CLI rewrite.");
  }, [currentQuestion, hydrated, questionVariant.loading, questionVariant.ready, questionVariant.streamText, sessionStarted, state.mode, state.profile.spireRun.mapOpen]);
  const failAndAdvance = useFailAndAdvance({ code, currentQuestion: activeQuestion, setCode, setCurrentQuestion, setConsoleRunResult, setResults, setRunning, setSessionStarted, setState, setStatus: setRunStatus, setTone: setRunTone, state, activeRunId, runTimer, clearHint: hints.clearHint, showHealthLoss, showPlayerImpact });
  const questionTimeLimitMs = activeQuestion ? getModifiedQuestionTimeLimitMs(state, activeQuestion) : 0;
  const timer = useQuestionTimer({ code, currentQuestion: activeQuestion, failAndAdvance, sessionStarted, mode: state.mode, setConsoleRunResult, setResults, setRunning, setState, setStatus: setRunStatus, setTone: setRunTone, activeRunId, runTimer, questionTimeLimitMs });
  const actions = usePracticeActions({ code, currentQuestion: activeQuestion, questionVariantReady: questionVariant.ready, failAndAdvance, runnerReady, setCode, setCurrentQuestion, setQuestionFinished: timer.setQuestionFinished, setConsoleRunResult, setResults, setRunnerReady, setRunning, setSessionStarted, setState, setStatus: setRunStatus, setTone: setRunTone, state, activeRunId, runTimer, runnerFrame, clearHint: hints.clearHint, startHint: hints.startHint, showHealthLoss, showPlayerImpact, showRewards, showMonsterDamage, timeRemainingMs: timer.timeRemainingMs });
  const resetAfterDeath = useCallback(() => {
    let freshState = defaultState();
    freshState.cards = state.cards;
    freshState.totalCorrect = state.totalCorrect;
    freshState.profile.trackedAchievementIds = state.profile.trackedAchievementIds;
    freshState.profile.unlockedAchievementIds = state.profile.unlockedAchievementIds;
    freshState.profile.metaProgress = {
      ...state.profile.metaProgress,
      upgrades: { ...state.profile.metaProgress.upgrades }
    };
    freshState.profile.spireRun = {
      ...freshState.profile.spireRun,
      heatConditions: { ...state.profile.spireRun.heatConditions },
      heatSetupOpen: true
    };
    freshState = setSpireMinimumRating(freshState, state.profile.spireMinRating);
    freshState.profile.coins = getMetaStartingGoldBonus(freshState);
    freshState.profile.health = getMaxHealth(freshState);
    const picked = getCurrentRoundQuestion(freshState, null);
    activeRunId.current = null;
    clearRunTimer(runTimer);
    setRunning(false);
    setResults([]);
    setConsoleRunResult(null);
    setSessionStarted(false);
    setRewardNotifications([]);
    setState({ ...freshState, currentId: picked.id });
    setCurrentQuestion(picked);
    setCode(picked.starter);
    setRunTone("default");
    setRunStatus("Run ended. Preserved question progress and prepared the next attempt.");
    hints.clearHint();
  }, [hints, runTimer, state.cards, state.profile.metaProgress, state.profile.spireMinRating, state.profile.spireRun.heatConditions, state.profile.trackedAchievementIds, state.profile.unlockedAchievementIds, state.totalCorrect]);
  const failQuestionForFocusLoss = useCallback(() => {
    activeRunId.current = null;
    clearRunTimer(runTimer);
    setRunning(false);
    setResults([]);
    setConsoleRunResult(null);
    hints.clearHint();
    failAndAdvance("Focus lost for 10 seconds.", code, timer.timeRemainingMs);
  }, [code, failAndAdvance, hints, runTimer, timer.timeRemainingMs]);
  const isDead = state.profile.health <= 0;
  useStudyTimeTracker(state.mode === "leetcode" && Boolean(activeQuestion) && sessionStarted && !timer.questionFinished && !isDead);
  useFullscreenGuard({ active: state.mode === "leetcode" && Boolean(activeQuestion) && sessionStarted && !timer.questionFinished && !isDead, failQuestion: failQuestionForFocusLoss, setStatus: setRunStatus, setTone: setRunTone });
  const headerStats = useHeaderStats(state);
  const timerDisplay = getTimerDisplay(activeQuestion, timer.timeRemainingMs, questionTimeLimitMs);
  const currentSpireNode = getCurrentSpireNode(state);
  const mapOpen = state.profile.spireRun.mapOpen;
  const showPractice = !mapOpen && isSpireCombatNode(currentSpireNode);
  useSyncSpireQuestion({ active: hydrated, currentQuestion, sessionStarted, setCode, setCurrentQuestion, setState, state });
  const runnerFrameElement = <iframe ref={runnerFrame} src={RUNNER_FRAME} title="JavaScript runner" hidden onLoad={() => setRunnerReady(true)} />;

  if (!hydrated) {
    return (
      <>
        <Container fluid px="md" py="md" w={{ base: "100%", lg: "70%" }} style={{ height: "100vh", overflow: "hidden" }}>
          <Stack gap="md" style={{ height: "100%", minHeight: 0 }}>
            <div aria-label="Loading study map" style={{ background: "#08090d", border: "1px solid rgba(195, 148, 56, 0.28)", height: "100%", minHeight: 0 }} />
          </Stack>
        </Container>
        {runnerFrameElement}
      </>
    );
  }

  return (
    <>
      <RewardNotifications items={rewardNotifications} />
      <DeathResetModal opened={isDead} onReset={resetAfterDeath} />
      <Container fluid px="md" py="md" w={{ base: "100%", lg: "70%" }} style={mapOpen ? { height: "100vh", overflow: "hidden" } : undefined}>
        <Stack gap="md" style={mapOpen ? { height: "100%", minHeight: 0 } : undefined}>
          <AppHeader
            coins={state.profile.coins}
            health={state.profile.health}
            hidePlayerStatus={mapOpen}
            maxHealth={headerStats.maxHealth}
            modeValue={state.mode}
            playerImpact={playerImpact}
            rating={headerStats.estimatedRating}
            state={state}
            setState={setState}
            useActiveSkill={actions.useActiveSkill}
          />
          <SpireMapPanel fillAvailableHeight={mapOpen} state={state} setState={setState} />
          {showPractice && <PracticeArea actions={actions} currentQuestion={activeQuestion} damagePop={monsterDamagePop} editorProps={{ canBuyHint: activeQuestion ? canBuyHint(state, activeQuestion.id) : false, code, consoleRunResult, hintCost: activeQuestion ? getHintCost(state, activeQuestion.id) : HINT_COST, hintDisabled: areHintsDisabledByHeat(state.profile.spireRun), hintError: hints.hintError, hintStreaming: hints.hintStreaming, hintText: hints.hintText, questionFinished: timer.questionFinished, questionVariantReady: questionVariant.ready, results, runCodeDisabled: isRunCodeDisabledByHeat(state.profile.spireRun), runnerReady, running, runStatus, sessionStarted, statusColor: STATUS_COLOR[runTone], timeRemainingMs: timer.timeRemainingMs, ...timerDisplay }} mode={state.mode} state={state} />}
        </Stack>
      </Container>
      {runnerFrameElement}
    </>
  );
}
