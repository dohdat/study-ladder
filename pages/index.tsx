import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Group,
  SegmentedControl,
  Stack
} from "@mantine/core";
import { loader } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";

import { PracticeArea } from "../components/PracticePanels";
import type { PracticePanelActions } from "../components/PracticePanels";
import { PlayerStatus } from "../components/PlayerStatus";
import { RewardNotifications } from "../components/RewardNotifications";
import type { RewardNotification } from "../components/RewardNotifications";
import { SummaryCards } from "../components/SummaryCards";
import { UserMenu } from "../components/UserMenu";
import { questions } from "../data/questions";
import { useCodexHintStream } from "../hooks/useCodexHintStream";
import { useFullscreenGuard } from "../hooks/useFullscreenGuard";
import { beautifyCode } from "../lib/codeFormat";
import {
  applyScheduleResult,
  applyHealthPenalty,
  buyHint,
  canBuyHint,
  cloneState,
  defaultState,
  getCard,
  getDueQuestions,
  getCoinReward,
  getExperienceReward,
  getLevelProgress,
  getProfileStats,
  getQuestionTimeLimitMs,
  HINT_COST,
  normalizeStudyState,
  pickQuestion,
  setCard
} from "../lib/studyCore";
import { createHintPrompt } from "../lib/hintPrompt";
import { createLocalHint } from "../lib/localHint";
import { migrateLocalStorageState, saveStudyState } from "../lib/studyDb";
import type { Question, RunResult, StudyState } from "../types/study";

const RUN_TIMEOUT_MS = 2500;
const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTE_MS = SECONDS_PER_MINUTE * SECOND_MS;
const WARNING_MS = MINUTE_MS;
const TIMER_PAD = 2;
const NUMBER_BASE_HEX = 16;
const PERCENT_MAX = 100;
const MAX_FAILED_TESTS_IN_STATUS = 3;
const REWARD_TOAST_TIMEOUT_MS = 2400;
const RUNNER_FRAME = "sandbox.html";
const STATUS_COLOR = {
  default: "gray",
  pass: "green",
  fail: "red"
} as const;

type RunnerMessage = {
  type: "run-result";
  runId: string;
  ok: boolean;
  error?: string;
  results: RunResult[];
};

type StatusTone = keyof typeof STATUS_COLOR;
type FailAndAdvance = (message: string, draft?: string) => void;

type TimerControls = {
  timeRemainingMs: number;
  questionFinished: boolean;
  setQuestionFinished: (finished: boolean) => void;
};

type PracticeActions = PracticePanelActions;

function useMonacoAssets() {
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

function useHydrateStudy(setState: (state: StudyState) => void, setQuestion: (question: Question) => void, setCode: (code: string) => void) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    async function hydrate() {
      const saved = normalizeStudyState(await migrateLocalStorageState());
      const initialQuestion = questions.find((question) => question.id === saved.currentId) || pickQuestion(saved, null);
      if (active) {
        setState(saved);
        setQuestion(initialQuestion);
        setCode(initialQuestion.starter);
        setHydrated(true);
      }
    }
    hydrate().catch(() => {
      const saved = defaultState();
      const initialQuestion = pickQuestion(saved, null);
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
  params.failAndAdvance("Time expired. Moving to next question.", params.code);
}

function useRunnerMessages(params: {
  currentQuestion: Question | null;
  failAndAdvance: FailAndAdvance;
  showRewards: (question: Question) => void;
  updateSchedule: (passed: boolean, draft?: string) => void;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  setQuestionFinished: (finished: boolean) => void;
  setResults: (results: RunResult[]) => void;
  setRunning: (running: boolean) => void;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  activeRunId: React.MutableRefObject<string | null>;
  runTimer: React.MutableRefObject<number | null>;
}) {
  useEffect(() => {
    function onMessage(event: MessageEvent<RunnerMessage>) {
      const message = event.data;
      if (!message || message.type !== "run-result" || message.runId !== params.activeRunId.current || !params.currentQuestion) {
        return;
      }
      clearRunTimer(params.runTimer);
      params.activeRunId.current = null;
      params.setRunning(false);
      handleRunMessage(message, params);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [params]);
}

function handleRunMessage(message: RunnerMessage, params: Parameters<typeof useRunnerMessages>[0]) {
  const question = params.currentQuestion;
  if (!question) {
    return;
  }
  if (message.error) {
    params.failAndAdvance(message.error);
    return;
  }
  if (!message.ok) {
    const failedResults = message.results.filter((result) => !result.pass);
    params.setState((previous) => applyHealthPenalty(previous));
    params.setResults(failedResults);
    params.setTone("fail");
    params.setStatus(`${getFailedTestsSummary(failedResults)} Health -5. Fix this question before moving on.`);
    return;
  }
  params.setResults(message.results);
  params.showRewards(question);
  params.updateSchedule(true);
  params.setTone("pass");
  params.setStatus("All tests passed. Card scheduled.");
  params.setQuestionFinished(true);
}

function getFailedTestsSummary(failedResults: RunResult[]) {
  if (failedResults.length === 0) {
    return "Tests failed, but the runner did not return failed test details.";
  }
  const shown = failedResults.slice(0, MAX_FAILED_TESTS_IN_STATUS).map((result) => {
    return `${result.name}: expected ${result.expected}, got ${result.actual}`;
  });
  const remaining = failedResults.length - shown.length;
  if (remaining > 0) {
    shown.push(`${remaining} more failed`);
  }
  return `Failed ${failedResults.length} test(s): ${shown.join("; ")}`;
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
  showRewards: (question: Question) => void;
}): PracticeActions {
  const updateDraft = useUpdateDraft(params);
  const beautifyCurrentCode = useCallback((source = params.code) => updateDraft(beautifyCode(source)), [params.code, updateDraft]);
  const updateSchedule = useUpdateSchedule(params.currentQuestion, params.code, params.setState);
  useRunnerMessages({ ...params, updateSchedule });
  const chooseQuestion = useChooseQuestion(params, updateDraft);
  const buyHintAction = useBuyHint(params);
  const startQuestion = useStartQuestion(params);
  const submitCode = useSubmitCode({ ...params, updateDraft, updateSchedule });
  const handleEditorMount = useEditorMount(beautifyCurrentCode, submitCode);
  return { updateDraft, beautifyCurrentCode, handleEditorMount, chooseQuestion, buyHint: buyHintAction, startQuestion, submitCode };
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

function useEditorMount(beautifyCurrentCode: (source?: string) => void, submitCode: () => void): OnMount {
  return useCallback((editor, monaco) => {
    editor.addAction({
      id: "study-ladder-beautify",
      label: "Beautify Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => beautifyCurrentCode(editor.getValue())
    });
    editor.addAction({
      id: "study-ladder-submit",
      label: "Submit Solution",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: submitCode
    });
  }, [beautifyCurrentCode, submitCode]);
}

function useUpdateSchedule(currentQuestion: Question | null, code: string, setState: React.Dispatch<React.SetStateAction<StudyState>>) {
  return useCallback((passed: boolean, draft = code) => {
    if (currentQuestion) {
      setState((previous) => applyScheduleResult(previous, currentQuestion.id, passed, draft));
    }
  }, [code, currentQuestion, setState]);
}

function useChooseQuestion(params: Parameters<typeof usePracticeActions>[0], updateDraft: (code: string) => void) {
  return useCallback((preferNext: boolean) => {
    const picked = pickQuestion(params.state, params.currentQuestion, preferNext);
    params.setCurrentQuestion(picked);
    params.setState((previous) => ({ ...previous, currentId: picked.id }));
    updateDraft(picked.starter);
    params.setResults([]);
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
    if (!params.currentQuestion || params.state.mode !== "leetcode") {
      return;
    }
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
  updateSchedule: (passed: boolean, draft?: string) => void;
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

function startRun(runId: string, formattedCode: string, params: Parameters<typeof useSubmitCode>[0]) {
  params.activeRunId.current = runId;
  params.setRunning(true);
  params.setTone("default");
  params.setStatus("Running tests");
  params.setResults([]);
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

function handleRunTimeout(runId: string, formattedCode: string, params: Parameters<typeof useSubmitCode>[0]) {
  if (params.activeRunId.current !== runId) {
    return;
  }
  params.activeRunId.current = null;
  params.setRunning(false);
  params.failAndAdvance("Timed out. Moving to next question.", formattedCode);
  params.runnerFrame.current?.contentWindow?.postMessage({ type: "reset-runner" }, "*");
}

function useFailAndAdvance(params: {
  code: string;
  currentQuestion: Question | null;
  setCode: (code: string) => void;
  setCurrentQuestion: (question: Question) => void;
  setResults: (results: RunResult[]) => void;
  setRunning: (running: boolean) => void;
  setSessionStarted: (started: boolean) => void;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  state: StudyState;
  activeRunId: React.MutableRefObject<string | null>;
  runTimer: React.MutableRefObject<number | null>;
  clearHint: () => void;
}) {
  const { activeRunId, code, currentQuestion, runTimer, setCode, setCurrentQuestion, setResults, setRunning, setSessionStarted, setState, setStatus, setTone, state } = params;
  return useCallback((message: string, draft = code) => {
    if (!currentQuestion) {
      return;
    }
    const scheduled = applyScheduleResult(state, currentQuestion.id, false, draft);
    const picked = pickQuestion(scheduled, currentQuestion, true);
    const nextState = { ...scheduled, currentId: picked.id };
    activeRunId.current = null;
    clearRunTimer(runTimer);
    setRunning(false);
    setResults([]);
    setTone("fail");
    setStatus(`${message} Next question loaded.`);
    setSessionStarted(false);
    setState(nextState);
    setCurrentQuestion(picked);
    setCode(picked.starter);
    params.clearHint();
  }, [activeRunId, code, currentQuestion, params, runTimer, setCode, setCurrentQuestion, setResults, setRunning, setSessionStarted, setState, setStatus, setTone, state]);
}

function getTimerDisplay(currentQuestion: Question | null, timeRemainingMs: number) {
  const totalTimeLimitMs = currentQuestion ? getQuestionTimeLimitMs(currentQuestion) : 0;
  const timeUsedPercent = totalTimeLimitMs ? ((totalTimeLimitMs - timeRemainingMs) / totalTimeLimitMs) * PERCENT_MAX : 0;
  const minutes = Math.floor(timeRemainingMs / MINUTE_MS);
  const seconds = Math.floor((timeRemainingMs % MINUTE_MS) / SECOND_MS);
  return {
    timeUsedPercent,
    timerLabel: `${minutes}:${String(seconds).padStart(TIMER_PAD, "0")}`,
    timerColor: timeRemainingMs <= WARNING_MS ? "red" : "blue"
  };
}

function AppHeader(props: {
  coins: number;
  currentExperience: number;
  health: number;
  level: number;
  modeValue: string;
  nextLevelExperience: number;
  state: StudyState;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
}) {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap">
      <Group align="flex-start" gap="md" wrap="wrap">
        <PlayerStatus
          coins={props.coins}
          currentExperience={props.currentExperience}
          health={props.health}
          level={props.level}
          nextLevelExperience={props.nextLevelExperience}
        />
      </Group>
      <Group>
        <SegmentedControl
          value={props.modeValue}
          onChange={(value) => props.setState((previous) => ({ ...previous, mode: value as StudyState["mode"] }))}
          data={[{ label: "LeetCode", value: "leetcode" }, { label: "System Design", value: "system" }]}
        />
        <UserMenu state={props.state} />
      </Group>
    </Group>
  );
}

function useRewardNotifications(setRewardNotifications: React.Dispatch<React.SetStateAction<RewardNotification[]>>) {
  return useCallback((question: Question) => {
    const createdAt = Date.now();
    const items: RewardNotification[] = [
      { amount: getCoinReward(question), id: `${question.id}-gold-${createdAt}`, kind: "gold" },
      { amount: getExperienceReward(question), id: `${question.id}-experience-${createdAt}`, kind: "experience" }
    ];
    const itemIds = new Set(items.map((item) => item.id));
    setRewardNotifications((current) => [...current, ...items]);
    window.setTimeout(() => {
      setRewardNotifications((current) => current.filter((item) => !itemIds.has(item.id)));
    }, REWARD_TOAST_TIMEOUT_MS);
  }, [setRewardNotifications]);
}

export default function Home() {
  const [state, setState] = useState<StudyState>(() => defaultState());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [runStatus, setRunStatus] = useState("Ready");
  const [runTone, setRunTone] = useState<StatusTone>("default");
  const [results, setResults] = useState<RunResult[]>([]);
  const [running, setRunning] = useState(false);
  const [runnerReady, setRunnerReady] = useState(false);
  const [rewardNotifications, setRewardNotifications] = useState<RewardNotification[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const activeRunId = useRef<string | null>(null);
  const runTimer = useRef<number | null>(null);
  const runnerFrame = useRef<HTMLIFrameElement | null>(null);
  const hints = useCodexHintStream(setRunStatus, setRunTone);
  const showRewards = useRewardNotifications(setRewardNotifications);
  useMonacoAssets();
  const hydrated = useHydrateStudy(setState, setCurrentQuestion, setCode);
  usePersistStudy(state, hydrated, setRunTone, setRunStatus);
  const failAndAdvance = useFailAndAdvance({ code, currentQuestion, setCode, setCurrentQuestion, setResults, setRunning, setSessionStarted, setState, setStatus: setRunStatus, setTone: setRunTone, state, activeRunId, runTimer, clearHint: hints.clearHint });
  const timer = useQuestionTimer({ code, currentQuestion, failAndAdvance, sessionStarted, mode: state.mode, setResults, setRunning, setState, setStatus: setRunStatus, setTone: setRunTone, activeRunId, runTimer });
  const actions = usePracticeActions({ code, currentQuestion, failAndAdvance, runnerReady, setCode, setCurrentQuestion, setQuestionFinished: timer.setQuestionFinished, setResults, setRunnerReady, setRunning, setSessionStarted, setState, setStatus: setRunStatus, setTone: setRunTone, state, activeRunId, runTimer, runnerFrame, clearHint: hints.clearHint, startHint: hints.startHint, showRewards });
  useFullscreenGuard({ active: state.mode === "leetcode" && Boolean(currentQuestion) && sessionStarted && !timer.questionFinished, failQuestion: failAndAdvance, setStatus: setRunStatus, setTone: setRunTone });
  const profile = useMemo(() => getProfileStats(state), [state]);
  const dueCount = useMemo(() => getDueQuestions(state).length, [state]);
  const levelProgress = useMemo(() => getLevelProgress(state), [state]);
  const timerDisplay = getTimerDisplay(currentQuestion, timer.timeRemainingMs);
  return (
    <>
      <Head><title>Study Ladder</title></Head>
      <RewardNotifications items={rewardNotifications} />
      <Container fluid px="md" py="md" w={{ base: "100%", lg: "70%" }}>
        <Stack gap="md">
          <AppHeader
            coins={state.profile.coins}
            currentExperience={levelProgress.currentExperience}
            health={state.profile.health}
            level={levelProgress.level}
            modeValue={state.mode}
            nextLevelExperience={levelProgress.nextLevelExperience}
            state={state}
            setState={setState}
          />
          <SummaryCards dueCount={dueCount} mastered={profile.mastered} streak={state.streak} />
          <PracticeArea actions={actions} currentQuestion={currentQuestion} editorProps={{ canBuyHint: canBuyHint(state), code, hintCost: HINT_COST, hintError: hints.hintError, hintStreaming: hints.hintStreaming, hintText: hints.hintText, questionFinished: timer.questionFinished, results, runnerReady, running, runStatus, sessionStarted, statusColor: STATUS_COLOR[runTone], timeRemainingMs: timer.timeRemainingMs, ...timerDisplay }} mode={state.mode} />
        </Stack>
      </Container>
      <iframe ref={runnerFrame} src={RUNNER_FRAME} title="JavaScript runner" hidden onLoad={() => setRunnerReady(true)} />
    </>
  );
}
