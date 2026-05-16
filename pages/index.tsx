import dynamic from "next/dynamic";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  List,
  Paper,
  Progress,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconArrowRight, IconCheck, IconCode, IconPlayerPlay, IconRefresh, IconUser, IconWand } from "@tabler/icons-react";
import { loader } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";

import { questions } from "../data/questions";
import { beautifyCode } from "../lib/codeFormat";
import {
  applyScheduleResult,
  cloneState,
  defaultState,
  difficultyLabels,
  getCard,
  getDueQuestions,
  getProfileStats,
  getQuestionTimeLimitMs,
  getRecommendedDifficulty,
  normalizeStudyState,
  pickQuestion,
  setCard
} from "../lib/studyCore";
import { migrateLocalStorageState, saveStudyState } from "../lib/studyDb";
import type { Question, RunResult, StudyState } from "../types/study";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const RUN_TIMEOUT_MS = 2500;
const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTE_MS = SECONDS_PER_MINUTE * SECOND_MS;
const WARNING_MS = MINUTE_MS;
const TIMER_PAD = 2;
const NUMBER_BASE_HEX = 16;
const PERCENT_MAX = 100;
const ICON_XS = 12;
const ICON_SM = 14;
const ICON_MD = 16;
const ICON_LG = 18;
const RESULT_ICON_SIZE = 20;
const EDITOR_FONT_SIZE = 13;
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

type TimerControls = {
  timeRemainingMs: number;
  questionFinished: boolean;
  setQuestionFinished: (finished: boolean) => void;
};

type PracticeActions = {
  updateDraft: (nextCode: string) => void;
  beautifyCurrentCode: (source?: string) => void;
  handleEditorMount: OnMount;
  chooseQuestion: (preferNext: boolean) => void;
  submitCode: () => void;
};

function useMonacoAssets() {
  useEffect(() => {
    const monacoBaseUrl = new URL("monaco/vs", window.location.href).toString().replace(/\/$/, "");
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
        setCode(getCard(saved, initialQuestion.id).draft || initialQuestion.starter);
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
    if (!params.currentQuestion || params.mode !== "leetcode" || params.questionFinished) {
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
  params.setTone("fail");
  params.setStatus("Time expired. Card remains due soon.");
  params.setQuestionFinished(true);
  params.setState((previous) => applyScheduleResult(previous, question.id, false, params.code));
}

function useRunnerMessages(params: {
  currentQuestion: Question | null;
  updateSchedule: (passed: boolean, draft?: string) => void;
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
  if (message.error) {
    params.updateSchedule(false);
    params.setTone("fail");
    params.setStatus(message.error);
    params.setResults([]);
    return;
  }
  params.setResults(message.results);
  params.updateSchedule(message.ok);
  params.setTone(message.ok ? "pass" : "fail");
  params.setStatus(message.ok ? "All tests passed. Card scheduled." : "Some tests failed. Card remains due soon.");
  if (message.ok) {
    params.setQuestionFinished(true);
  }
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
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  setStatus: (status: string) => void;
  setTone: (tone: StatusTone) => void;
  state: StudyState;
  activeRunId: React.MutableRefObject<string | null>;
  runTimer: React.MutableRefObject<number | null>;
  runnerFrame: React.MutableRefObject<HTMLIFrameElement | null>;
}): PracticeActions {
  const updateDraft = useUpdateDraft(params);
  const beautifyCurrentCode = useCallback((source = params.code) => updateDraft(beautifyCode(source)), [params.code, updateDraft]);
  const handleEditorMount = useEditorMount(beautifyCurrentCode);
  const updateSchedule = useUpdateSchedule(params.currentQuestion, params.code, params.setState);
  useRunnerMessages({ ...params, updateSchedule });
  const chooseQuestion = useChooseQuestion(params, updateDraft);
  const submitCode = useSubmitCode({ ...params, updateDraft, updateSchedule });
  return { updateDraft, beautifyCurrentCode, handleEditorMount, chooseQuestion, submitCode };
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

function useEditorMount(beautifyCurrentCode: (source?: string) => void): OnMount {
  return useCallback((editor, monaco) => {
    editor.addAction({
      id: "study-ladder-beautify",
      label: "Beautify Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: () => beautifyCurrentCode(editor.getValue())
    });
  }, [beautifyCurrentCode]);
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
    updateDraft(getCard(params.state, picked.id).draft || picked.starter);
    params.setResults([]);
    params.setTone("default");
    params.setStatus("Ready");
    params.setQuestionFinished(false);
  }, [params, updateDraft]);
}

function useSubmitCode(params: Parameters<typeof usePracticeActions>[0] & {
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
  params.updateSchedule(false, formattedCode);
  params.setTone("fail");
  params.setStatus("Timed out. Check for infinite loops.");
  if (params.runnerFrame.current) {
    params.setRunnerReady(false);
    params.runnerFrame.current.src = RUNNER_FRAME;
  }
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

function AppHeader(props: { modeValue: string; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  return (
    <Group justify="space-between" align="flex-start">
      <Box>
        <Title order={2}>Study Ladder</Title>
        <Text c="dimmed" size="sm">JavaScript practice</Text>
      </Box>
      <Group>
        <SegmentedControl
          value={props.modeValue}
          onChange={(value) => props.setState((previous) => ({ ...previous, mode: value as StudyState["mode"] }))}
          data={[{ label: "LeetCode", value: "leetcode" }, { label: "System Design", value: "system" }]}
        />
        <Button component="a" href="profile.html" variant="default" leftSection={<IconUser size={ICON_MD} />}>Profile</Button>
      </Group>
    </Group>
  );
}

function SummaryCards(props: { dueCount: number; mastered: number; recommended: Question["difficulty"]; streak: number; timerLabel: string }) {
  const cards = [
    { label: "Due", value: props.dueCount },
    { label: "Mastered", value: `${props.mastered}/${questions.length}` },
    { label: "Streak", value: props.streak },
    { label: "Current", value: difficultyLabels[props.recommended] },
    { label: "Timer", value: props.timerLabel }
  ];
  return (
    <SimpleGrid cols={{ base: 2, sm: 5 }}>
      {cards.map((card) => (
        <Paper key={card.label} withBorder p="md">
          <Text size="xs" c="dimmed">{card.label}</Text>
          <Title order={3}>{card.value}</Title>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

function ProblemCard(props: { currentQuestion: Question; chooseQuestion: (preferNext: boolean) => void }) {
  return (
    <Card withBorder>
      <Group justify="space-between" align="flex-start">
        <Box>
          <Badge variant="light">{difficultyLabels[props.currentQuestion.difficulty]}</Badge>
          <Title order={3} mt="xs">{props.currentQuestion.title}</Title>
          <Group gap={6} mt="xs">
            {props.currentQuestion.topics.map((topic) => <Badge key={topic} size="sm" variant="outline">{topic}</Badge>)}
          </Group>
        </Box>
        <ActionIcon variant="light" size="lg" aria-label="Next question" onClick={() => props.chooseQuestion(true)}>
          <IconArrowRight size={ICON_LG} />
        </ActionIcon>
      </Group>
      <Text mt="md">{props.currentQuestion.prompt}</Text>
      <Divider my="md" />
      <Title order={5}>Examples</Title>
      <List mt="xs" size="sm">
        {props.currentQuestion.examples.map((example) => <List.Item key={example.input}>{example.input} =&gt; {example.output}</List.Item>)}
      </List>
      <Title order={5} mt="md">Constraints</Title>
      <List mt="xs" size="sm">
        {props.currentQuestion.constraints.map((constraint) => <List.Item key={constraint}>{constraint}</List.Item>)}
      </List>
    </Card>
  );
}

function EditorCard(props: {
  actions: PracticeActions;
  code: string;
  currentQuestion: Question;
  questionFinished: boolean;
  results: RunResult[];
  runnerReady: boolean;
  running: boolean;
  runStatus: string;
  statusColor: string;
  timeRemainingMs: number;
  timerColor: string;
  timerLabel: string;
  timeUsedPercent: number;
}) {
  return (
    <Card withBorder p={0}>
      <EditorToolbar {...props} />
      <Progress value={props.timeUsedPercent} color={props.timerColor} radius={0} />
      <Box h={360}>
        <MonacoEditor height="360px" language="javascript" theme="vs-dark" value={props.code} onChange={(value) => props.actions.updateDraft(value || "")} onMount={props.actions.handleEditorMount} options={{ minimap: { enabled: false }, fontSize: EDITOR_FONT_SIZE, tabSize: 2, wordWrap: "on", scrollBeyondLastLine: false, automaticLayout: true, formatOnPaste: true, formatOnType: true }} />
      </Box>
      <Paper radius={0} p="sm" bg={`${props.statusColor}.0`}>
        <Text size="sm" c={`${props.statusColor}.8`}>{props.runStatus}</Text>
      </Paper>
      <TestResults results={props.results} />
    </Card>
  );
}

function EditorToolbar(props: Parameters<typeof EditorCard>[0]) {
  return (
    <Group justify="space-between" p="sm">
      <Group gap="xs">
        <Badge leftSection={<IconCode size={ICON_XS} />} variant="light">{props.currentQuestion.functionName}()</Badge>
        <Badge color={props.timerColor} variant="light">{props.timerLabel}</Badge>
      </Group>
      <Group gap="xs">
        <Button size="xs" variant="default" leftSection={<IconRefresh size={ICON_SM} />} onClick={() => props.actions.updateDraft(props.currentQuestion.starter)}>Reset</Button>
        <Button size="xs" variant="default" leftSection={<IconWand size={ICON_SM} />} onClick={() => props.actions.beautifyCurrentCode()}>Beautify</Button>
        <Button size="xs" leftSection={<IconPlayerPlay size={ICON_SM} />} loading={props.running} disabled={!props.runnerReady || props.questionFinished || props.timeRemainingMs <= 0} onClick={props.actions.submitCode}>Submit</Button>
      </Group>
    </Group>
  );
}

function TestResults(props: { results: RunResult[] }) {
  if (props.results.length === 0) {
    return null;
  }
  return (
    <ScrollArea.Autosize mah={150}>
      <List p="sm" size="sm" spacing={4}>
        {props.results.map((result) => (
          <List.Item key={result.name} icon={<ThemeIcon color={result.pass ? "green" : "red"} size={RESULT_ICON_SIZE} radius="xl"><IconCheck size={ICON_XS} /></ThemeIcon>}>
            {result.pass ? `${result.name}: passed` : `${result.name}: expected ${result.expected}, got ${result.actual}`}
          </List.Item>
        ))}
      </List>
    </ScrollArea.Autosize>
  );
}

function PracticeArea(props: { actions: PracticeActions; currentQuestion: Question | null; editorProps: Omit<Parameters<typeof EditorCard>[0], "actions" | "currentQuestion">; mode: StudyState["mode"] }) {
  if (props.mode === "system") {
    return (
      <Card withBorder>
        <Title order={3}>System Design</Title>
        <Text c="dimmed" mt="xs">Track placeholder is ready. LeetCode cards are active first.</Text>
      </Card>
    );
  }
  if (!props.currentQuestion) {
    return null;
  }
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <ProblemCard currentQuestion={props.currentQuestion} chooseQuestion={props.actions.chooseQuestion} />
      <EditorCard {...props.editorProps} actions={props.actions} currentQuestion={props.currentQuestion} />
    </SimpleGrid>
  );
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
  const activeRunId = useRef<string | null>(null);
  const runTimer = useRef<number | null>(null);
  const runnerFrame = useRef<HTMLIFrameElement | null>(null);
  useMonacoAssets();
  const hydrated = useHydrateStudy(setState, setCurrentQuestion, setCode);
  usePersistStudy(state, hydrated, setRunTone, setRunStatus);
  const timer = useQuestionTimer({ code, currentQuestion, mode: state.mode, setResults, setRunning, setState, setStatus: setRunStatus, setTone: setRunTone, activeRunId, runTimer });
  const actions = usePracticeActions({ code, currentQuestion, runnerReady, setCode, setCurrentQuestion, setQuestionFinished: timer.setQuestionFinished, setResults, setRunnerReady, setRunning, setState, setStatus: setRunStatus, setTone: setRunTone, state, activeRunId, runTimer, runnerFrame });
  const profile = useMemo(() => getProfileStats(state), [state]);
  const dueCount = useMemo(() => getDueQuestions(state).length, [state]);
  const timerDisplay = getTimerDisplay(currentQuestion, timer.timeRemainingMs);
  return (
    <>
      <Head><title>Study Ladder</title></Head>
      <Container size="xl" px="md" py="md">
        <Stack gap="md">
          <AppHeader modeValue={state.mode} setState={setState} />
          <SummaryCards dueCount={dueCount} mastered={profile.mastered} recommended={getRecommendedDifficulty(state)} streak={state.streak} timerLabel={timerDisplay.timerLabel} />
          <PracticeArea actions={actions} currentQuestion={currentQuestion} editorProps={{ code, questionFinished: timer.questionFinished, results, runnerReady, running, runStatus, statusColor: STATUS_COLOR[runTone], timeRemainingMs: timer.timeRemainingMs, ...timerDisplay }} mode={state.mode} />
        </Stack>
      </Container>
      <iframe ref={runnerFrame} src={RUNNER_FRAME} title="JavaScript runner" hidden onLoad={() => setRunnerReady(true)} />
    </>
  );
}
