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

type RunnerMessage = {
  type: "run-result";
  runId: string;
  ok: boolean;
  error?: string;
  results: RunResult[];
};

export default function Home() {
  const [state, setState] = useState<StudyState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [runStatus, setRunStatus] = useState("Ready");
  const [runTone, setRunTone] = useState<"default" | "pass" | "fail">("default");
  const [results, setResults] = useState<RunResult[]>([]);
  const [running, setRunning] = useState(false);
  const [runnerReady, setRunnerReady] = useState(false);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [questionFinished, setQuestionFinished] = useState(false);
  const activeRunId = useRef<string | null>(null);
  const runTimer = useRef<number | null>(null);
  const runnerFrame = useRef<HTMLIFrameElement | null>(null);
  const timedOutQuestionId = useRef<string | null>(null);

  useEffect(() => {
    const monacoBaseUrl = new URL("monaco/vs", window.location.href).toString().replace(/\/$/, "");
    loader.config({
      paths: {
        vs: monacoBaseUrl
      }
    });
  }, []);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const stored = await migrateLocalStorageState();
      const saved = normalizeStudyState(stored);
      const initialQuestion = questions.find((question) => question.id === saved.currentId) || pickQuestion(saved, null);

      if (!active) {
        return;
      }

      setState(saved);
      setCurrentQuestion(initialQuestion);
      setCode(getCard(saved, initialQuestion.id).draft || initialQuestion.starter);
      setHydrated(true);
    };

    hydrate().catch(() => {
      if (!active) {
        return;
      }

      const saved = defaultState();
      const initialQuestion = pickQuestion(saved, null);
      setState(saved);
      setCurrentQuestion(initialQuestion);
      setCode(initialQuestion.starter);
      setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveStudyState(state).catch(() => {
      setRunTone("fail");
      setRunStatus("Could not save progress to IndexedDB.");
    });
  }, [hydrated, state]);

  useEffect(() => {
    if (!currentQuestion) {
      setTimeRemainingMs(0);
      return;
    }

    timedOutQuestionId.current = null;
    setQuestionFinished(false);
    setTimeRemainingMs(getQuestionTimeLimitMs(currentQuestion));
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (!currentQuestion || state.mode !== "leetcode" || questionFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeRemainingMs((remaining) => {
        if (remaining <= 1000) {
          if (timedOutQuestionId.current !== currentQuestion.id) {
            timedOutQuestionId.current = currentQuestion.id;
            activeRunId.current = null;
            if (runTimer.current) {
              window.clearTimeout(runTimer.current);
              runTimer.current = null;
            }
            setRunning(false);
            setResults([]);
            setRunTone("fail");
            setRunStatus("Time expired. Card remains due soon.");
            setQuestionFinished(true);
            setState((previous) => applyScheduleResult(previous, currentQuestion.id, false, code));
          }

          return 0;
        }

        return remaining - 1000;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [code, currentQuestion, questionFinished, state.mode]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<RunnerMessage>) => {
      const message = event.data;
      if (!message || message.type !== "run-result" || message.runId !== activeRunId.current || !currentQuestion) {
        return;
      }

      if (runTimer.current) {
        window.clearTimeout(runTimer.current);
        runTimer.current = null;
      }

      activeRunId.current = null;
      setRunning(false);

      if (message.error) {
        updateSchedule(false);
        setRunTone("fail");
        setRunStatus(message.error);
        setResults([]);
        return;
      }

      setResults(message.results);
      updateSchedule(message.ok);
      setRunTone(message.ok ? "pass" : "fail");
      setRunStatus(message.ok ? "All tests passed. Card scheduled." : "Some tests failed. Card remains due soon.");
      if (message.ok) {
        setQuestionFinished(true);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  const profile = useMemo(() => getProfileStats(state), [state]);
  const dueCount = useMemo(() => getDueQuestions(state).length, [state]);
  const recommended = getRecommendedDifficulty(state);

  const updateDraft = useCallback((nextCode: string) => {
    setCode(nextCode);
    if (!currentQuestion) {
      return;
    }

    setState((previous) => {
      const next = cloneState(previous);
      setCard(next, currentQuestion.id, {
        ...getCard(next, currentQuestion.id),
        draft: nextCode
      });
      return next;
    });
  }, [currentQuestion]);

  const beautifyCurrentCode = useCallback((source = code) => {
    updateDraft(beautifyCode(source));
  }, [code, updateDraft]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editor.addAction({
      id: "study-ladder-beautify",
      label: "Beautify Code",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF
      ],
      run: () => {
        beautifyCurrentCode(editor.getValue());
      }
    });
  }, [beautifyCurrentCode]);

  const updateSchedule = useCallback((passed: boolean, draft = code) => {
    if (!currentQuestion) {
      return;
    }

    setState((previous) => {
      return applyScheduleResult(previous, currentQuestion.id, passed, draft);
    });
  }, [code, currentQuestion]);

  const chooseQuestion = (preferNext: boolean) => {
    const picked = pickQuestion(state, currentQuestion, preferNext);
    setCurrentQuestion(picked);
    setState((previous) => ({
      ...previous,
      currentId: picked.id
    }));
    setCode(getCard(state, picked.id).draft || picked.starter);
    setResults([]);
    setRunTone("default");
    setRunStatus("Ready");
    setQuestionFinished(false);
  };

  const submitCode = () => {
    if (!currentQuestion || !runnerFrame.current?.contentWindow) {
      return;
    }

    if (!runnerReady) {
      setRunTone("fail");
      setRunStatus("Runner is still loading. Try again in a second.");
      return;
    }

    const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const formattedCode = beautifyCode(code);
    if (formattedCode !== code) {
      updateDraft(formattedCode);
    }
    activeRunId.current = runId;
    setRunning(true);
    setRunTone("default");
    setRunStatus("Running tests");
    setResults([]);

    if (runTimer.current) {
      window.clearTimeout(runTimer.current);
    }

    runTimer.current = window.setTimeout(() => {
      if (activeRunId.current !== runId) {
        return;
      }
      activeRunId.current = null;
      setRunning(false);
      updateSchedule(false, formattedCode);
      setRunTone("fail");
      setRunStatus("Timed out. Check for infinite loops.");
      if (runnerFrame.current) {
        setRunnerReady(false);
        runnerFrame.current.src = "sandbox.html";
      }
    }, RUN_TIMEOUT_MS);

    runnerFrame.current.contentWindow.postMessage({
      type: "run-tests",
      runId,
      code: formattedCode,
      functionName: currentQuestion.functionName,
      tests: currentQuestion.tests
    }, "*");
  };

  const modeValue = state.mode === "leetcode" ? "leetcode" : "system";
  const statusColor = runTone === "pass" ? "green" : runTone === "fail" ? "red" : "gray";
  const totalTimeLimitMs = currentQuestion ? getQuestionTimeLimitMs(currentQuestion) : 0;
  const timeUsedPercent = totalTimeLimitMs ? ((totalTimeLimitMs - timeRemainingMs) / totalTimeLimitMs) * 100 : 0;
  const minutes = Math.floor(timeRemainingMs / 60000);
  const seconds = Math.floor((timeRemainingMs % 60000) / 1000);
  const timerLabel = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <>
      <Head>
        <title>Study Ladder</title>
      </Head>

      <Container size="xl" px="md" py="md">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={2}>Study Ladder</Title>
              <Text c="dimmed" size="sm">
                JavaScript practice
              </Text>
            </Box>
            <Group>
              <SegmentedControl
                value={modeValue}
                onChange={(value) => setState((previous) => ({ ...previous, mode: value as StudyState["mode"] }))}
                data={[
                  { label: "LeetCode", value: "leetcode" },
                  { label: "System Design", value: "system" }
                ]}
              />
              <Button component="a" href="profile.html" variant="default" leftSection={<IconUser size={16} />}>
                Profile
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 2, sm: 5 }}>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Due</Text>
              <Title order={3}>{dueCount}</Title>
            </Paper>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Mastered</Text>
              <Title order={3}>{profile.mastered}/{questions.length}</Title>
            </Paper>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Streak</Text>
              <Title order={3}>{state.streak}</Title>
            </Paper>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Current</Text>
              <Title order={3}>{difficultyLabels[recommended]}</Title>
            </Paper>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Timer</Text>
              <Title order={3}>{timerLabel}</Title>
            </Paper>
          </SimpleGrid>

          {state.mode === "system" ? (
            <Card withBorder>
              <Title order={3}>System Design</Title>
              <Text c="dimmed" mt="xs">Track placeholder is ready. LeetCode cards are active first.</Text>
            </Card>
          ) : currentQuestion ? (
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Card withBorder>
                <Group justify="space-between" align="flex-start">
                  <Box>
                    <Badge variant="light">{difficultyLabels[currentQuestion.difficulty]}</Badge>
                    <Title order={3} mt="xs">{currentQuestion.title}</Title>
                    <Group gap={6} mt="xs">
                      {currentQuestion.topics.map((topic) => (
                        <Badge key={topic} size="sm" variant="outline">{topic}</Badge>
                      ))}
                    </Group>
                  </Box>
                  <ActionIcon variant="light" size="lg" aria-label="Next question" onClick={() => chooseQuestion(true)}>
                    <IconArrowRight size={18} />
                  </ActionIcon>
                </Group>

                <Text mt="md">{currentQuestion.prompt}</Text>

                <Divider my="md" />
                <Title order={5}>Examples</Title>
                <List mt="xs" size="sm">
                  {currentQuestion.examples.map((example) => (
                    <List.Item key={example.input}>{example.input} =&gt; {example.output}</List.Item>
                  ))}
                </List>

                <Title order={5} mt="md">Constraints</Title>
                <List mt="xs" size="sm">
                  {currentQuestion.constraints.map((constraint) => (
                    <List.Item key={constraint}>{constraint}</List.Item>
                  ))}
                </List>
              </Card>

              <Card withBorder p={0}>
                <Group justify="space-between" p="sm">
                  <Group gap="xs">
                    <Badge leftSection={<IconCode size={12} />} variant="light">
                      {currentQuestion.functionName}()
                    </Badge>
                    <Badge color={timeRemainingMs <= 60 * 1000 ? "red" : "blue"} variant="light">
                      {timerLabel}
                    </Badge>
                  </Group>
                  <Group gap="xs">
                    <Button size="xs" variant="default" leftSection={<IconRefresh size={14} />} onClick={() => updateDraft(currentQuestion.starter)}>
                      Reset
                    </Button>
                    <Button size="xs" variant="default" leftSection={<IconWand size={14} />} onClick={() => beautifyCurrentCode()}>
                      Beautify
                    </Button>
                    <Button size="xs" leftSection={<IconPlayerPlay size={14} />} loading={running} disabled={!runnerReady || questionFinished || timeRemainingMs <= 0} onClick={submitCode}>
                      Submit
                    </Button>
                  </Group>
                </Group>
                <Progress value={timeUsedPercent} color={timeRemainingMs <= 60 * 1000 ? "red" : "blue"} radius={0} />

                <Box h={360}>
                  <MonacoEditor
                    height="360px"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => updateDraft(value || "")}
                    onMount={handleEditorMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      tabSize: 2,
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true
                    }}
                  />
                </Box>

                <Paper radius={0} p="sm" bg={`${statusColor}.0`}>
                  <Text size="sm" c={`${statusColor}.8`}>{runStatus}</Text>
                </Paper>

                {results.length > 0 && (
                  <ScrollArea.Autosize mah={150}>
                    <List p="sm" size="sm" spacing={4}>
                      {results.map((result) => (
                        <List.Item
                          key={result.name}
                          icon={
                            <ThemeIcon color={result.pass ? "green" : "red"} size={20} radius="xl">
                              <IconCheck size={12} />
                            </ThemeIcon>
                          }
                        >
                          {result.pass ? `${result.name}: passed` : `${result.name}: expected ${result.expected}, got ${result.actual}`}
                        </List.Item>
                      ))}
                    </List>
                  </ScrollArea.Autosize>
                )}
              </Card>
            </SimpleGrid>
          ) : null}
        </Stack>
      </Container>

      <iframe ref={runnerFrame} src="sandbox.html" title="JavaScript runner" hidden onLoad={() => setRunnerReady(true)} />
    </>
  );
}
