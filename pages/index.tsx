/* eslint-disable max-lines */
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Stack } from "@mantine/core";
import type { OnMount } from "@monaco-editor/react";

import { AppHeader } from "../components/AppHeader";
import { PracticeArea, type PracticePanelActions } from "../components/PracticePanels";
import { DeathResetModal } from "../components/DeathResetModal";
import type { MonsterDamagePop } from "../components/MonsterEncounter";
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
import { beautifyCode } from "../lib/codeFormat";
import { applyPassedCombatResult } from "../lib/combatCore";
import { getMonsterAttackProfile } from "../lib/monsterCore";
import { getTimerDisplay } from "../lib/timerDisplay";
import { chooseNextSpireQuestion, completeSpireQuestion, getCurrentRoundQuestion, getCurrentSpireNode, isCombatNode as isSpireCombatNode } from "../lib/spireMapCore";
import {
  HINT_COST, applyHealthPenalty, applyScheduleResult, buyHint, canBuyHint, cloneState, defaultState, getCard,
  getHealthLoss, getMonsterDamageRoll, getQuestionTimeLimitMs, isQuestionInRecommendedRange, normalizeStudyState, setCard
} from "../lib/studyCore";
import { createHintPrompt } from "../lib/hintPrompt";
import { createLocalHint } from "../lib/localHint";
import { RUNNER_FRAME, STATUS_COLOR, type StatusTone } from "../lib/practiceStatus";
import { migrateLocalStorageState, saveStudyState } from "../lib/studyDb";
import type { ConsoleRunResult, Question, RunResult, StudyState } from "../types/study";

const RUN_TIMEOUT_MS = 2500, SECOND_MS = 1000;
const TIMER_PAD = 2, NUMBER_BASE_HEX = 16;
const VISIBLE_RUN_CASE_COUNT = 3;
const DAMAGE_POP_TIMEOUT_MS = 840;
const TIME_DAMAGE_FREE_RATIO = 0.18;
const TIME_DAMAGE_MIN_RATIO = 0.18;
const TIME_DAMAGE_RATIO_RANGE = 0.82;

type TestRunnerMessage = { type: "run-result"; runId: string; ok: boolean; error?: string; results: RunResult[]; runtimeMs?: number };
type CodeRunMessage = { type: "code-run-result"; runId: string; ok: boolean; error?: string; output: string[]; results?: RunResult[]; runtimeMs?: number };
type RunnerReadyMessage = { type: "runner-ready" };
type RunnerMessage = TestRunnerMessage | CodeRunMessage | RunnerReadyMessage;

type FailAndAdvance = (message: string, draft?: string) => void;

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
    setTimeRemainingMs(getQuestionTimeLimitMs(params.currentQuestion));
  }, [params.currentQuestion]);
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
  params.failAndAdvance("Time expired. Moving to next question.", params.code);
}

function useRunnerMessages(params: {
  code: string;
  currentQuestion: Question | null;
  failAndAdvance: FailAndAdvance;
  showHealthLoss: (amount?: number, hitCount?: number) => void;
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
    params.failAndAdvance(message.error);
    return;
  }
  if (!message.ok) {
    const attack = getMonsterAttackProfile(question, getMonsterDamageRoll(question));
    const healthLoss = getHealthLoss(params.state, attack.damage, attack.element);
    params.showHealthLoss(healthLoss, attack.hitCount);
    params.setState((previous) => applyHealthPenalty(previous, attack.damage, attack.manaDamage, question.id, params.code, Date.now(), attack.element));
    params.setResults([]);
    params.setConsoleRunResult({ ok: false, output: [], results: message.results.slice(VISIBLE_RUN_CASE_COUNT), runtimeMs: message.runtimeMs });
    params.setTone("fail");
    params.setStatus(getFailStatus(attack));
    return;
  }
  completePassedSubmit(params, question);
}

function completePassedSubmit(params: Parameters<typeof useRunnerMessages>[0], question: Question) {
  const now = Date.now();
  const combat = applyPassedCombatResult(params.state, question.id, params.code, now);
  if (combat.hit) {
    params.showMonsterDamage({
      amount: combat.hit.damage,
      critical: combat.hit.critical,
      hitCount: combat.hit.hitCount,
      id: `${question.id}-${now}-${combat.hit.damage}`
    });
  }
  const timed = applyElapsedCombatDamage(combat.state, question, params.timeRemainingMs, now);
  if (timed.healthLoss > 0) {
    params.showHealthLoss(timed.healthLoss, timed.attack.hitCount);
  }
  const progressed = completeSpireQuestion(timed.state, question, now);
  const picked = chooseNextSpireQuestion(progressed, question);
  const nextState = { ...progressed, currentId: picked.id };
  params.showRewards(question, params.state, now);
  params.setResults([]);
  params.setConsoleRunResult(null);
  params.setState(nextState);
  params.setCurrentQuestion(picked);
  params.setCode(picked.starter);
  params.setSessionStarted(false);
  params.setQuestionFinished(false);
  params.clearHint();
  if (progressed.profile.spireRun.mapOpen) {
    params.setTone("pass");
    params.setStatus(`${getTimeDamageStatus(timed)}Room cleared. Choose the next path on the map.`);
    return;
  }
  if (combat.hit?.defeated) {
    params.setTone("pass");
    params.setStatus(`Monster defeated. ${formatHitStatus(combat.hit)} ${getTimeDamageStatus(timed)}Next question loaded.`);
    return;
  }
  params.setTone("pass");
  params.setStatus(`${combat.hit ? formatHitStatus(combat.hit) : "Hit for 0."} ${getTimeDamageStatus(timed)}Enemy health ${combat.hit?.remainingHealth}/${combat.hit?.maxHealth}. Next question loaded.`);
}

function applyElapsedCombatDamage(state: StudyState, question: Question, timeRemainingMs: number, now: number) {
  const attack = getElapsedMonsterAttack(question, timeRemainingMs, now);
  const healthLoss = attack.damage > 0 ? getHealthLoss(state, attack.damage, attack.element) : 0;
  if (healthLoss <= 0 && attack.manaDamage <= 0) {
    return { attack, healthLoss, state };
  }
  return {
    attack,
    healthLoss,
    state: {
      ...state,
      profile: {
        ...state.profile,
        health: Math.max(0, state.profile.health - healthLoss),
        mana: state.profile.godMode ? state.profile.mana : Math.max(0, state.profile.mana - attack.manaDamage)
      }
    }
  };
}

function getElapsedMonsterAttack(question: Question, timeRemainingMs: number, now: number) {
  const timeLimitMs = getQuestionTimeLimitMs(question);
  const elapsedRatio = timeLimitMs > 0 ? Math.min(1, Math.max(0, (timeLimitMs - timeRemainingMs) / timeLimitMs)) : 0;
  const damageRatio = getElapsedDamageRatio(elapsedRatio);
  const attack = getMonsterAttackProfile(question, getMonsterDamageRoll(question, now), now);
  return {
    ...attack,
    damage: Math.floor(attack.damage * damageRatio),
    manaDamage: Math.floor(attack.manaDamage * damageRatio),
    perHitDamage: Math.max(0, Math.floor(attack.perHitDamage * damageRatio))
  };
}

function getElapsedDamageRatio(elapsedRatio: number) {
  if (elapsedRatio <= TIME_DAMAGE_FREE_RATIO) {
    return 0;
  }
  const pressureRatio = (elapsedRatio - TIME_DAMAGE_FREE_RATIO) / (1 - TIME_DAMAGE_FREE_RATIO);
  return Math.min(1, TIME_DAMAGE_MIN_RATIO + pressureRatio * TIME_DAMAGE_RATIO_RANGE);
}

function getTimeDamageStatus(result: ReturnType<typeof applyElapsedCombatDamage>) {
  if (result.healthLoss <= 0) {
    return "";
  }
  const hitCount = result.attack.hitCount > 1 ? ` x${result.attack.hitCount}` : "";
  const manaBurn = result.attack.manaDamage ? ` Mana Burn drained ${result.attack.manaDamage}.` : "";
  return `Time pressure hit${hitCount} for ${result.healthLoss}.${manaBurn} `;
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

function getFailStatus(attack: ReturnType<typeof getMonsterAttackProfile>) {
  const prefix = attack.hitCount > 1 ? `Multi-Shot hit ${attack.hitCount} times` : "Monster hit";
  const element = attack.element ? ` ${attack.element[0].toUpperCase()}${attack.element.slice(1)}` : "";
  const manaBurn = attack.manaDamage ? ` Mana Burn drained ${attack.manaDamage}.` : "";
  return `${prefix} for ${attack.damage}${element} damage.${manaBurn} Wrong Answer`;
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
    if (!question || !canBuyHint(params.state)) {
      params.setTone("fail");
      params.setStatus(`You need ${HINT_COST} coins to buy a hint.`);
      return;
    }
    const prompt = createHintPrompt(question, params.code);
    params.setState((previous) => buyHint(previous));
    params.setTone("default");
    params.setStatus("Asking Codex for one next step.");
    params.startHint(prompt, createLocalHint(question));
    navigator.clipboard?.writeText(prompt).catch(() => undefined);
  }, [params]);
}

function useStartQuestion(params: Parameters<typeof usePracticeActions>[0]) {
  return useCallback(() => {
    if (!params.currentQuestion || params.state.mode !== "leetcode" || params.state.profile.spireRun.mapOpen) {
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
  params.failAndAdvance("Timed out. Moving to next question.", formattedCode);
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
}) {
  const { activeRunId, code, currentQuestion, runTimer, setCode, setConsoleRunResult, setCurrentQuestion, setResults, setRunning, setSessionStarted, setState, setStatus, setTone, state } = params;
  return useCallback((message: string, draft = code) => {
    if (!currentQuestion) {
      return;
    }
    const monsterDamage = getMonsterDamageRoll(currentQuestion);
    const attack = getMonsterAttackProfile(currentQuestion, monsterDamage);
    const healthLoss = getHealthLoss(state, attack.damage, attack.element);
    const scheduled = applyScheduleResult(state, currentQuestion.id, false, draft, Date.now(), attack.damage, attack.manaDamage, attack.element);
    const picked = chooseNextSpireQuestion(scheduled, currentQuestion);
    const nextState = { ...scheduled, currentId: picked.id };
    activeRunId.current = null;
    clearRunTimer(runTimer);
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
  currentQuestion: Question | null;
  sessionStarted: boolean;
  setCode: (code: string) => void;
  setCurrentQuestion: (question: Question) => void;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  state: StudyState;
}) {
  useEffect(() => {
    if (params.sessionStarted || params.state.profile.spireRun.mapOpen) {
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
  usePersistStudy(state, hydrated, setRunTone, setRunStatus);
  const failAndAdvance = useFailAndAdvance({ code, currentQuestion, setCode, setCurrentQuestion, setConsoleRunResult, setResults, setRunning, setSessionStarted, setState, setStatus: setRunStatus, setTone: setRunTone, state, activeRunId, runTimer, clearHint: hints.clearHint, showHealthLoss });
  const timer = useQuestionTimer({ code, currentQuestion, failAndAdvance, sessionStarted, mode: state.mode, setConsoleRunResult, setResults, setRunning, setState, setStatus: setRunStatus, setTone: setRunTone, activeRunId, runTimer });
  const actions = usePracticeActions({ code, currentQuestion, failAndAdvance, runnerReady, setCode, setCurrentQuestion, setQuestionFinished: timer.setQuestionFinished, setConsoleRunResult, setResults, setRunnerReady, setRunning, setSessionStarted, setState, setStatus: setRunStatus, setTone: setRunTone, state, activeRunId, runTimer, runnerFrame, clearHint: hints.clearHint, startHint: hints.startHint, showHealthLoss, showRewards, showMonsterDamage, timeRemainingMs: timer.timeRemainingMs });
  const resetAfterDeath = useCallback(() => {
    const freshState = defaultState();
    freshState.profile.unlockedAchievementIds = state.profile.unlockedAchievementIds;
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
    setRunStatus("Character reset to level 1.");
    hints.clearHint();
  }, [hints, runTimer, state.profile.unlockedAchievementIds]);
  const pauseQuestionForFocusLoss = useCallback(() => { activeRunId.current = null; clearRunTimer(runTimer); setRunning(false); setResults([]); setConsoleRunResult(null); setSessionStarted(false); hints.clearHint(); }, [hints, runTimer]);
  const isDead = state.profile.health <= 0;
  useStudyTimeTracker(state.mode === "leetcode" && Boolean(currentQuestion) && sessionStarted && !timer.questionFinished && !isDead);
  useFullscreenGuard({ active: state.mode === "leetcode" && Boolean(currentQuestion) && sessionStarted && !timer.questionFinished && !isDead, pauseQuestion: pauseQuestionForFocusLoss, setStatus: setRunStatus, setTone: setRunTone });
  const headerStats = useHeaderStats(state);
  const timerDisplay = getTimerDisplay(currentQuestion, timer.timeRemainingMs);
  const currentSpireNode = getCurrentSpireNode(state);
  const mapOpen = state.profile.spireRun.mapOpen;
  const showPractice = !mapOpen && isSpireCombatNode(currentSpireNode);
  useSyncSpireQuestion({ currentQuestion, sessionStarted, setCode, setCurrentQuestion, setState, state });
  return (
    <>
      <RewardNotifications items={rewardNotifications} />
      <DeathResetModal opened={isDead} onReset={resetAfterDeath} />
      <Container fluid px="md" py="md" w={{ base: "100%", lg: "70%" }} style={mapOpen ? { height: "100vh", overflow: "hidden" } : undefined}>
        <Stack gap="md" style={mapOpen ? { height: "100%", minHeight: 0 } : undefined}>
          <AppHeader
            coins={state.profile.coins}
            currentExperience={headerStats.levelProgress.currentExperience}
            health={state.profile.health}
            hidePlayerStatus={mapOpen}
            level={headerStats.levelProgress.level}
            mana={state.profile.mana}
            maxHealth={headerStats.maxHealth}
            maxMana={headerStats.maxMana}
            modeValue={state.mode}
            nextLevelExperience={headerStats.levelProgress.nextLevelExperience}
            rating={headerStats.estimatedRating}
            state={state}
            stats={headerStats.characterStats}
            setState={setState}
            useActiveSkill={actions.useActiveSkill}
          />
          <SpireMapPanel fillAvailableHeight={mapOpen} state={state} setState={setState} />
          {showPractice && <PracticeArea actions={actions} currentQuestion={currentQuestion} damagePop={monsterDamagePop} editorProps={{ canBuyHint: canBuyHint(state), code, consoleRunResult, hintCost: HINT_COST, hintError: hints.hintError, hintStreaming: hints.hintStreaming, hintText: hints.hintText, questionFinished: timer.questionFinished, results, runnerReady, running, runStatus, sessionStarted, statusColor: STATUS_COLOR[runTone], timeRemainingMs: timer.timeRemainingMs, ...timerDisplay }} mode={state.mode} state={state} />}
        </Stack>
      </Container>
      <iframe ref={runnerFrame} src={RUNNER_FRAME} title="JavaScript runner" hidden onLoad={() => setRunnerReady(true)} />
    </>
  );
}
