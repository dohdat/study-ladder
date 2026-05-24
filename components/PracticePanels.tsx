import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Progress,
  ScrollArea,
  Tabs,
  Text,
  ThemeIcon,
  Tooltip,
  Title
} from "@mantine/core";
import { IconArrowRight, IconBulb, IconCheck, IconCode, IconEye, IconLock, IconPlayerPlay, IconRefresh, IconTerminal2, IconWand, IconX } from "@tabler/icons-react";
import MonacoEditor, { type OnMount } from "@monaco-editor/react";

import { HeroSiegeButton } from "./HeroSiegeUi";
import { HighlightedCode } from "./HighlightedCode";
import { MonsterEncounter, type MonsterDamagePop } from "./MonsterEncounter";
import { FRONTEND_APP_FILE, FRONTEND_CSS_FILE, type FrontendFileName, createInitialQuestionDraft, isFrontendChallenge, parseFrontendDraft, serializeFrontendDraft } from "../lib/frontendChallenge";
import {
  CODEX_EXAMPLE_EXPLANATION_CHUNK,
  CODEX_EXAMPLE_EXPLANATION_DONE,
  CODEX_EXAMPLE_EXPLANATION_ERROR,
  createExampleExplanationPrompt,
  createSolutionRevealPrompt,
  requestCodexExampleExplanation,
  requestCodexSolutionReveal,
  type CodexExampleExplanationStreamMessage
} from "../lib/hintPrompt";
import { difficultyLabels, getVisibleQuestionTopics } from "../lib/studyCore";
import { RUNNER_FRAME } from "../lib/practiceStatus";
import type { ActiveWarriorSkillId, ConsoleRunResult, Question, RunResult, StudyState } from "../types/study";

const ICON_XS = 12;
const ICON_SM = 14;
const ICON_LG = 18;
const RESULT_ICON_SIZE = 20;
const EDITOR_FONT_SIZE = 16;
const EDITOR_HEIGHT = 560;
const FRONTEND_WORKSPACE_HEIGHT = "max(560px, calc(100vh - 250px))";
const EDITOR_READ_ONLY_MESSAGE = { value: "Press Start to edit this solution." };
const LOCKED_OVERLAY_BG = "#2b2b2b";
const LOCKED_OVERLAY_PANEL_MAX_WIDTH = 360;
const LOCKED_OVERLAY_Z_INDEX = 10;
const TEST_RESULTS_MAX_HEIGHT = 300;
const TAB_SIZE = 2;
const LAYOUT_COLUMNS = 10;
const QUESTION_COLUMN_SPAN = 3;
const EDITOR_COLUMN_SPAN = 7;
const CODE_FENCE = "```";
const HINT_CONTENT_GAP = 10;
const EXAMPLE_BLOCK_GAP = 14;
const EXAMPLE_ROW_GAP = 4;
const EXAMPLE_BLOCK_PADDING_LEFT = 14;
const EXAMPLE_BLOCK_BORDER = "2px solid rgba(255, 255, 255, 0.18)";
const EXAMPLE_FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const COMPACT_EXAMPLE_JSON_MAX_LENGTH = 80;
const CASE_TAB_MIN_WIDTH = 92;
const RUN_PANEL_MAX_HEIGHT = 720;
const RUN_BLOCK_BG = "#303030";
const RUN_SECTION_GAP = 14;
const RUN_VALUE_PADDING = 14;
const RUN_BLOCK_RADIUS = 8;
const RUN_LABEL_MARGIN_BOTTOM = 6;
const RUN_VALUE_FONT_SIZE = "13px";
const RUN_VALUE_LINE_HEIGHT = 1.65;
const RUN_TITLE_ORDER = 3;
const PREVIEW_BG = "#f8fafc";
const PREVIEW_BORDER = "1px solid #cbd5e1";
const PREVIEW_MUTED = "#64748b";
const PREVIEW_TEXT = "#0f172a";
const PREVIEW_ACCENT = "#2563eb";
const PREVIEW_SUCCESS = "#16a34a";
const PREVIEW_TODO_DONE_BG = "#dcfce7";
const FIRST_CASE_INDEX = 0;
const ARG_INDEX_OFFSET = 1;
const FUNCTION_SIGNATURE_GROUP = 1;
const EXAMPLE_EXPLANATION_MIN_HEIGHT = 42;

type HintSegment = {
  content: string;
  kind: "code" | "text";
};

type QuestionExample = Question["examples"][number];
type ExampleExplanationState = Record<string, { error: string; loading: boolean; text: string }>;
type PreviewEvent = { time: number; value: string };
type PreviewTodo = { completed: boolean; id: string; text: string };
type PreviewTab = { id: string; title: string };

export type PracticePanelActions = {
  updateDraft: (nextCode: string) => void;
  beautifyCurrentCode: (source?: string) => void;
  handleEditorMount: OnMount;
  markSolutionRevealed: () => void;
  chooseQuestion: (preferNext: boolean) => void;
  buyHint: () => void;
  runCode: () => void;
  startQuestion: () => void;
  submitCode: () => void;
  useActiveSkill: (skillId: ActiveWarriorSkillId) => void;
};

type EditorProps = {
  code: string;
  consoleRunResult: ConsoleRunResult | null;
  questionFinished: boolean;
  questionVariantReady: boolean;
  results: RunResult[];
  runnerReady: boolean;
  running: boolean;
  runStatus: string;
  sessionStarted: boolean;
  statusColor: string;
  canBuyHint: boolean;
  hintCost: number;
  hintDisabled: boolean;
  hintError: string;
  hintStreaming: boolean;
  hintText: string;
  runCodeDisabled: boolean;
  timeRemainingMs: number;
  timerColor: string;
  timerLabel: string;
  timeUsedPercent: number;
  runnerFrame: React.MutableRefObject<HTMLIFrameElement | null>;
};

export function PracticeArea(props: {
  actions: PracticePanelActions;
  currentQuestion: Question | null;
  damagePop?: MonsterDamagePop | null;
  editorProps: EditorProps;
  mode: StudyState["mode"];
  state: StudyState;
}) {
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
    <Grid columns={LAYOUT_COLUMNS} gutter="md" align="flex-start">
      <Grid.Col span={{ base: LAYOUT_COLUMNS, md: QUESTION_COLUMN_SPAN }}>
        <ProblemCard
          canMoveNext={!props.editorProps.sessionStarted || props.editorProps.questionFinished}
          currentQuestion={props.currentQuestion}
          chooseQuestion={props.actions.chooseQuestion}
          damagePop={props.damagePop}
          questionVariantReady={props.editorProps.questionVariantReady}
          sessionStarted={props.editorProps.sessionStarted}
          state={props.state}
        />
      </Grid.Col>
      <Grid.Col span={{ base: LAYOUT_COLUMNS, md: EDITOR_COLUMN_SPAN }}>
        <EditorCard {...props.editorProps} actions={props.actions} currentQuestion={props.currentQuestion} state={props.state} />
      </Grid.Col>
    </Grid>
  );
}

function ProblemCard(props: { canMoveNext: boolean; currentQuestion: Question; chooseQuestion: (preferNext: boolean) => void; damagePop?: MonsterDamagePop | null; questionVariantReady: boolean; sessionStarted: boolean; state: StudyState }) {
  return (
    <Card withBorder>
      <Group justify="space-between" align="flex-start">
        {props.sessionStarted ? <ProblemHeader currentQuestion={props.currentQuestion} state={props.state} /> : <LockedProblemHeader />}
        <Tooltip label={props.canMoveNext ? "Move to the next question" : "Pass all tests before moving on"} withArrow>
          <Box component="span">
            <HeroSiegeButton aria-label="Next question" disabled={!props.canMoveNext} height={35} minWidth={44} onClick={() => props.chooseQuestion(true)} style={{ padding: 0, width: 44 }}>
            <IconArrowRight size={ICON_LG} />
            </HeroSiegeButton>
          </Box>
        </Tooltip>
      </Group>
      {props.sessionStarted ? <ProblemDetails currentQuestion={props.currentQuestion} damagePop={props.damagePop} state={props.state} /> : <LockedProblemDetails questionVariantReady={props.questionVariantReady} />}
    </Card>
  );
}

function ProblemHeader(props: { currentQuestion: Question; state: StudyState }) {
  const visibleTopics = getVisibleQuestionTopics(props.state, props.currentQuestion);
  const hiddenTopicCount = Math.max(0, props.currentQuestion.topics.length - visibleTopics.length);
  return (
    <Box>
      <Group gap={6}>
        <Badge variant="light">{difficultyLabels[props.currentQuestion.difficulty]}</Badge>
        <Badge color="yellow" variant="light">Rating {props.currentQuestion.rating}</Badge>
      </Group>
      <Title order={3} mt="xs">{props.currentQuestion.title}</Title>
      <Group gap={6} mt="xs">
        {visibleTopics.map((topic) => <Badge key={topic} size="sm" variant="outline">{topic}</Badge>)}
        {hiddenTopicCount > 0 && <Badge size="sm" color="gray" variant="outline">+{hiddenTopicCount} hidden</Badge>}
      </Group>
    </Box>
  );
}

function LockedProblemHeader() {
  return (
    <Box>
      <Badge leftSection={<IconLock size={ICON_XS} />} variant="light">Locked</Badge>
      <Title order={3} mt="xs">Question hidden</Title>
    </Box>
  );
}

function ProblemDetails(props: { currentQuestion: Question; damagePop?: MonsterDamagePop | null; state: StudyState }) {
  const { explainExample, explanations } = useExampleExplanations(props.currentQuestion);
  const frontend = isFrontendChallenge(props.currentQuestion);
  return (
    <>
      <MonsterEncounter damagePop={props.damagePop} question={props.currentQuestion} state={props.state} />
      <Text mt="md">{props.currentQuestion.prompt}</Text>
      <Divider my="md" />
      {frontend && props.currentQuestion.frontend?.wireframe?.length ? (
        <FrontendWireframe lines={props.currentQuestion.frontend.wireframe} />
      ) : null}
      {!frontend && (
        <>
          <Title order={5}>Examples</Title>
          <Box mt="xs" style={{ display: "grid", gap: EXAMPLE_BLOCK_GAP }}>
            {props.currentQuestion.examples.map((example, index) => {
              const exampleKey = getExampleKey(props.currentQuestion, example, index);
              return (
                <ExampleBlock
                  key={exampleKey}
                  example={example}
                  explanation={explanations[exampleKey]}
                  index={index}
                  onExplain={() => explainExample(example, index)}
                />
              );
            })}
          </Box>
        </>
      )}
      <Title order={5} mt={frontend ? 0 : "md"}>{frontend ? "Requirements" : "Constraints"}</Title>
      <List mt="xs" size="sm">
        {props.currentQuestion.constraints.map((constraint) => <List.Item key={constraint}>{constraint}</List.Item>)}
      </List>
    </>
  );
}

function FrontendWireframe(props: { lines: string[] }) {
  return (
    <Box mb="md">
      <Title order={5}>Wireframe</Title>
      <Box mt="xs" p={RUN_VALUE_PADDING} style={{ background: RUN_BLOCK_BG, border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: RUN_BLOCK_RADIUS }}>
        <Text style={{ fontFamily: EXAMPLE_FONT_FAMILY, fontSize: RUN_VALUE_FONT_SIZE, lineHeight: RUN_VALUE_LINE_HEIGHT, whiteSpace: "pre", overflowX: "auto" }}>
          {props.lines.join("\n")}
        </Text>
      </Box>
    </Box>
  );
}

function LockedProblemDetails(props: { questionVariantReady: boolean }) {
  return (
    <>
      <Divider my="md" />
      <Group gap="xs" c="dimmed">
        {props.questionVariantReady ? <IconPlayerPlay size={ICON_SM} /> : <IconLock size={ICON_SM} />}
        <Text size="sm">{props.questionVariantReady ? "Press Start to reveal the question." : "Codex CLI is generating a fresh version of this question."}</Text>
      </Group>
    </>
  );
}

function ExampleBlock(props: { example: QuestionExample; explanation?: ExampleExplanationState[string]; index: number; onExplain: () => void }) {
  return (
    <Box>
      <Group justify="space-between" gap="xs">
        <Text size="sm" fw={700}>Example {props.index + 1}:</Text>
        <Button
          leftSection={<IconBulb size={ICON_XS} />}
          loading={props.explanation?.loading}
          onClick={props.onExplain}
          size="compact-xs"
          variant="light"
        >
          Explain
        </Button>
      </Group>
      <Box mt="xs" pl={EXAMPLE_BLOCK_PADDING_LEFT} style={{ borderLeft: EXAMPLE_BLOCK_BORDER, display: "grid", gap: EXAMPLE_ROW_GAP }}>
        <ExampleRow label="Input" value={props.example.input} />
        <ExampleRow label="Output" value={props.example.output} />
        {props.example.explanation && <ExampleRow label="Explanation" value={props.example.explanation} />}
        {(props.explanation?.text || props.explanation?.error || props.explanation?.loading) && (
          <Paper withBorder p="xs" mt={4} bg="dark.7" mih={EXAMPLE_EXPLANATION_MIN_HEIGHT}>
            {props.explanation?.error ? (
              <Text size="sm" c="red.3" style={{ whiteSpace: "pre-wrap" }}>{props.explanation.error}</Text>
            ) : (
              <HintContent content={props.explanation?.text || "Codex is working through the example..."} />
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}

function useExampleExplanations(question: Question) {
  const [explanations, setExplanations] = useState<ExampleExplanationState>({});

  useEffect(() => {
    const runtime = getChromeRuntime();
    if (!runtime?.onMessage) {
      return undefined;
    }
    function handleRuntimeMessage(message: unknown) {
      if (!isExampleExplanationMessage(message) || !message.exampleKey) {
        return;
      }
      const exampleKey = message.exampleKey;
      setExplanations((current) => {
        const previous = current[exampleKey] || { error: "", loading: false, text: "" };
        if (message.type === CODEX_EXAMPLE_EXPLANATION_CHUNK) {
          return { ...current, [exampleKey]: { error: "", loading: true, text: `${previous.text}${message.text || ""}` } };
        }
        if (message.type === CODEX_EXAMPLE_EXPLANATION_DONE) {
          return { ...current, [exampleKey]: { error: "", loading: false, text: previous.text || message.text || "" } };
        }
        return { ...current, [exampleKey]: { error: message.error || "Codex could not explain this example.", loading: false, text: previous.text } };
      });
    }
    runtime.onMessage.addListener(handleRuntimeMessage);
    return () => runtime.onMessage?.removeListener(handleRuntimeMessage);
  }, []);

  const explainExample = useCallback((example: QuestionExample, index: number) => {
    const exampleKey = getExampleKey(question, example, index);
    setExplanations((current) => ({ ...current, [exampleKey]: { error: "", loading: true, text: "" } }));
    const prompt = createExampleExplanationPrompt(question, example, index + 1);
    requestCodexExampleExplanation(exampleKey, prompt).then((response) => {
      if (response.ok) {
        return;
      }
      setExplanations((current) => ({
        ...current,
        [exampleKey]: {
          error: response.error || "Could not start Codex example explanation.",
          loading: false,
          text: current[exampleKey]?.text || ""
        }
      }));
    });
  }, [question]);

  return { explainExample, explanations };
}

function getChromeRuntime() {
  return (globalThis as typeof globalThis & { chrome?: { runtime?: { onMessage?: { addListener: (listener: (message: unknown) => void) => void; removeListener: (listener: (message: unknown) => void) => void } } } }).chrome?.runtime;
}

function isExampleExplanationMessage(message: unknown): message is CodexExampleExplanationStreamMessage {
  if (!message || typeof message !== "object" || !("type" in message)) {
    return false;
  }
  const type = (message as CodexExampleExplanationStreamMessage).type;
  return type === CODEX_EXAMPLE_EXPLANATION_CHUNK || type === CODEX_EXAMPLE_EXPLANATION_DONE || type === CODEX_EXAMPLE_EXPLANATION_ERROR;
}

function getExampleKey(question: Question, example: QuestionExample, index: number) {
  return `${question.id}:${index}:${example.input}:${example.output}`;
}

function ExampleRow(props: { label: string; value: string }) {
  const value = formatExampleValue(props.value);
  const multiline = value.includes("\n");
  return (
    <Text size="sm" style={{ fontFamily: EXAMPLE_FONT_FAMILY, whiteSpace: "pre-wrap" }}>
      <Text span fw={700}>{props.label}:</Text>{multiline ? `\n${value}` : ` ${value}`}
    </Text>
  );
}

function formatExampleValue(value: string) {
  const trimmed = value.trim();
  if (!/^[{[]/.test(trimmed)) {
    return value;
  }
  try {
    const parsed = JSON.parse(trimmed);
    const compact = JSON.stringify(parsed);
    if (Array.isArray(parsed) && isFlatJsonArray(parsed) && compact.length <= COMPACT_EXAMPLE_JSON_MAX_LENGTH) {
      return compact;
    }
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

function isFlatJsonArray(value: unknown[]) {
  return value.every((item) => item === null || ["boolean", "number", "string"].includes(typeof item));
}

function EditorCard(props: EditorProps & { actions: PracticePanelActions; currentQuestion: Question; state: StudyState }) {
  const frontend = isFrontendChallenge(props.currentQuestion);
  const [activeFile, setActiveFile] = useState<FrontendFileName>(FRONTEND_APP_FILE);
  useEffect(() => {
    setActiveFile(FRONTEND_APP_FILE);
  }, [props.currentQuestion.id]);
  const frontendFiles = frontend ? parseFrontendDraft(props.currentQuestion, props.code) : null;
  const editorValue = frontendFiles ? frontendFiles[activeFile] : props.code;
  const editorLanguage = frontend ? activeFile === FRONTEND_CSS_FILE ? "css" : "typescript" : "javascript";
  const editorPath = frontend ? `file:///${activeFile}` : undefined;
  const updateEditorDraft = (value: string) => {
    if (!frontendFiles) {
      props.actions.updateDraft(value);
      return;
    }
    props.actions.updateDraft(serializeFrontendDraft({ ...frontendFiles, [activeFile]: value }));
  };
  return (
    <Card withBorder p={0}>
      <EditorToolbar {...props} frontend={frontend} />
      {frontendFiles && <FrontendFileTabs activeFile={activeFile} setActiveFile={setActiveFile} />}
      <Progress value={props.timeUsedPercent} color={props.timerColor} radius={0} />
      <EditorWorkspace
        editorLanguage={editorLanguage}
        editorPath={editorPath}
        editorValue={editorValue}
        frontend={frontend}
        handleEditorMount={props.actions.handleEditorMount}
        questionVariantReady={props.questionVariantReady}
        runnerFrame={props.runnerFrame}
        sessionStarted={props.sessionStarted}
        updateEditorDraft={updateEditorDraft}
      />
      <Paper radius={0} p="sm" bg={`${props.statusColor}.0`}>
        <Text size="sm" c={`${props.statusColor}.8`} style={{ whiteSpace: "pre-wrap" }}>{props.runStatus}</Text>
      </Paper>
      <HintPanel hintError={props.hintError} hintStreaming={props.hintStreaming} hintText={props.hintText} />
      <ConsoleOutputPanel code={props.code} currentQuestion={props.currentQuestion} markSolutionRevealed={props.actions.markSolutionRevealed} result={props.consoleRunResult} />
      <TestResults results={props.results} />
    </Card>
  );
}

function EditorWorkspace(props: {
  editorLanguage: string;
  editorPath?: string;
  editorValue: string;
  frontend: boolean;
  handleEditorMount: OnMount;
  questionVariantReady: boolean;
  runnerFrame: React.MutableRefObject<HTMLIFrameElement | null>;
  sessionStarted: boolean;
  updateEditorDraft: (value: string) => void;
}) {
  const editor = (
    <Box h="100%" pos="relative" style={{ minWidth: 0 }}>
      <MonacoEditor height="100%" language={props.editorLanguage} path={props.editorPath} theme="vs-dark" value={props.editorValue} onChange={(value) => props.updateEditorDraft(value || "")} onMount={props.handleEditorMount} options={{ minimap: { enabled: false }, fontSize: EDITOR_FONT_SIZE, tabSize: TAB_SIZE, wordWrap: "on", scrollBeyondLastLine: false, automaticLayout: true, formatOnPaste: true, formatOnType: true, quickSuggestions: false, suggestOnTriggerCharacters: false, parameterHints: { enabled: false }, readOnly: !props.sessionStarted, readOnlyMessage: EDITOR_READ_ONLY_MESSAGE }} />
      {!props.sessionStarted && <LockedEditorOverlay questionVariantReady={props.questionVariantReady} />}
    </Box>
  );

  if (!props.frontend) {
    return (
      <>
        <Box h={EDITOR_HEIGHT} pos="relative">
          {editor}
        </Box>
        <RunnerFrame frameRef={props.runnerFrame} visible={false} />
      </>
    );
  }

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 3fr) minmax(320px, 2fr)",
        height: FRONTEND_WORKSPACE_HEIGHT,
        minWidth: 0,
        overflowX: "auto"
      }}
    >
      {editor}
      <RunnerFrame frameRef={props.runnerFrame} visible />
    </Box>
  );
}

function FrontendFileTabs(props: { activeFile: FrontendFileName; setActiveFile: (file: FrontendFileName) => void }) {
  return (
    <Group gap="xs" px="sm" pb="sm">
      {([FRONTEND_APP_FILE, FRONTEND_CSS_FILE] as FrontendFileName[]).map((file) => (
        <HeroSiegeButton key={file} active={props.activeFile === file} minWidth={96} onClick={() => props.setActiveFile(file)}>
          {file}
        </HeroSiegeButton>
      ))}
    </Group>
  );
}

function RunnerFrame(props: { frameRef: React.MutableRefObject<HTMLIFrameElement | null>; visible: boolean }) {
  return (
    <Box style={props.visible ? { background: "#0f172a", borderLeft: "1px solid rgba(255, 255, 255, 0.14)", height: "100%", minWidth: 0 } : { height: 0, overflow: "hidden" }}>
      <iframe
        ref={props.frameRef}
        src={RUNNER_FRAME}
        title={props.visible ? "Frontend preview" : "JavaScript runner"}
        style={{ border: 0, display: "block", height: props.visible ? "100%" : 0, width: "100%" }}
      />
    </Box>
  );
}

function LockedEditorOverlay(props: { questionVariantReady: boolean }) {
  const title = props.questionVariantReady ? "Press Start to unlock the editor." : "Waiting for Codex CLI to generate a variation.";
  const description = props.questionVariantReady ? "Timer and fullscreen guard start together." : "Start unlocks after the generated question is ready.";
  return (
    <Box
      pos="absolute"
      inset={0}
      style={{
        alignItems: "center",
        backgroundColor: LOCKED_OVERLAY_BG,
        cursor: "not-allowed",
        display: "flex",
        justifyContent: "center",
        zIndex: LOCKED_OVERLAY_Z_INDEX
      }}
    >
      <Paper withBorder shadow="sm" p="md" maw={LOCKED_OVERLAY_PANEL_MAX_WIDTH}>
        <Group gap="xs" justify="center">
          {props.questionVariantReady ? <IconPlayerPlay size={ICON_SM} /> : <IconLock size={ICON_SM} />}
          <Text size="sm" fw={600}>{title}</Text>
        </Group>
        <Text size="xs" c="dimmed" mt={4} ta="center">{description}</Text>
      </Paper>
    </Box>
  );
}

function EditorToolbar(props: Parameters<typeof EditorCard>[0] & { frontend: boolean }) {
  return (
    <Group justify="space-between" p="sm">
      <Group gap="xs">
        <QuestionFunctionBadge currentQuestion={props.currentQuestion} sessionStarted={props.sessionStarted} />
        <Badge color={props.timerColor} variant="light">{props.timerLabel}</Badge>
      </Group>
      <Group gap="xs">
        <SetupToolbarActions {...props} />
        <RunToolbarActions {...props} />
      </Group>
    </Group>
  );
}

function SetupToolbarActions(props: Parameters<typeof EditorCard>[0] & { frontend: boolean }) {
  const startDisabled = props.sessionStarted || !props.questionVariantReady;
  return (
    <>
      <Tooltip label={props.questionVariantReady ? "Start timer and enter fullscreen" : "Waiting for Codex CLI to rewrite this question"} withArrow>
        <Box component="span">
          <HeroSiegeButton leftSection={<IconPlayerPlay size={ICON_SM} />} disabled={startDisabled} onClick={props.actions.startQuestion}>Start</HeroSiegeButton>
        </Box>
      </Tooltip>
      <Tooltip label="Restore the starter code" withArrow>
        <HeroSiegeButton leftSection={<IconRefresh size={ICON_SM} />} disabled={!props.sessionStarted} onClick={() => props.actions.updateDraft(createInitialQuestionDraft(props.currentQuestion))}>Reset</HeroSiegeButton>
      </Tooltip>
      {!props.frontend ? (
        <Tooltip label="Format JavaScript code (Ctrl+S)" withArrow>
          <HeroSiegeButton leftSection={<IconWand size={ICON_SM} />} disabled={!props.sessionStarted} onClick={() => props.actions.beautifyCurrentCode()}>Beautify</HeroSiegeButton>
        </Tooltip>
      ) : null}
      {!props.hintDisabled ? (
        <Tooltip label={props.hintCost > 0 ? `Buy one next-step hint for ${props.hintCost} gold` : "Use your free room hint"} withArrow>
          <Box component="span">
            <HeroSiegeButton leftSection={<IconBulb size={ICON_SM} />} disabled={!props.sessionStarted || !props.canBuyHint} onClick={props.actions.buyHint}>{props.hintCost > 0 ? `Hint ${props.hintCost}` : "Hint Free"}</HeroSiegeButton>
          </Box>
        </Tooltip>
      ) : null}
    </>
  );
}

function RunToolbarActions(props: Parameters<typeof EditorCard>[0] & { frontend: boolean }) {
  const disabled = !props.runnerReady || props.questionFinished || !props.sessionStarted || props.timeRemainingMs <= 0;
  return (
    <>
      {!props.runCodeDisabled ? (
        <Tooltip label={props.frontend ? "Render the React preview" : "Run code and show console.log output (Ctrl+')"} withArrow>
          <Box component="span">
            <HeroSiegeButton leftSection={<IconTerminal2 size={ICON_SM} />} loading={props.running} disabled={disabled} onClick={props.actions.runCode}>{props.frontend ? "Preview" : "Run"}</HeroSiegeButton>
          </Box>
        </Tooltip>
      ) : null}
      <Tooltip label="Submit code against hidden tests (Ctrl+Enter)" withArrow>
        <Box component="span">
          <HeroSiegeButton leftSection={<IconCheck size={ICON_SM} />} loading={props.running} disabled={disabled} onClick={props.actions.submitCode}>Submit</HeroSiegeButton>
        </Box>
      </Tooltip>
    </>
  );
}

function ConsoleOutputPanel(props: { code: string; currentQuestion: Question; markSolutionRevealed: () => void; result: ConsoleRunResult | null }) {
  if (!props.result) {
    return null;
  }
  if (props.result.hiddenTestCount && !props.result.results?.length) {
    return <HiddenSubmitPanel code={props.code} currentQuestion={props.currentQuestion} markSolutionRevealed={props.markSolutionRevealed} result={props.result} />;
  }
  if (props.result.results?.length) {
    return <RunCasePanel code={props.code} currentQuestion={props.currentQuestion} markSolutionRevealed={props.markSolutionRevealed} result={props.result} />;
  }
  const output = props.result.output.length > 0 ? props.result.output.join("\n") : "(no console output)";
  const content = props.result.error ? `${output}\nError: ${props.result.error}` : output;
  return (
    <Paper radius={0} p="sm" bg="dark.7">
      <Group gap="xs" align="flex-start">
        <IconTerminal2 size={ICON_SM} />
        <Box flex={1}>
          <Text size="xs" c="dimmed" fw={700}>Console</Text>
          <Text size="sm" style={{ fontFamily: EXAMPLE_FONT_FAMILY, whiteSpace: "pre-wrap" }}>{content}</Text>
        </Box>
      </Group>
    </Paper>
  );
}

function HiddenSubmitPanel(props: { code: string; currentQuestion: Question; markSolutionRevealed: () => void; result: ConsoleRunResult }) {
  return (
    <Paper radius={0} p="md" bg="dark.8">
      <Group gap="sm" align="baseline" mb={4}>
        <Title order={RUN_TITLE_ORDER} c="red.5">Wrong Answer</Title>
        {typeof props.result.runtimeMs === "number" && <Text size="sm" c="blue.3">Runtime: {props.result.runtimeMs} ms</Text>}
      </Group>
      <Text size="sm" c="gray.3">
        Failed hidden submission tests. Details are hidden unless a relic or mirror upgrade reveals them.
      </Text>
      <SolutionRevealPanel code={props.code} currentQuestion={props.currentQuestion} markSolutionRevealed={props.markSolutionRevealed} />
    </Paper>
  );
}

function RunCasePanel(props: { code: string; currentQuestion: Question; markSolutionRevealed: () => void; result: ConsoleRunResult }) {
  const [activeIndex, setActiveIndex] = useState(FIRST_CASE_INDEX);
  const results = props.result.results || [];
  const selectedIndex = Math.min(activeIndex, results.length - ARG_INDEX_OFFSET);
  const selected = results[selectedIndex];
  const argNames = getArgumentNames(props.currentQuestion);
  const tone = props.result.ok ? "green" : "red";
  return (
    <Paper radius={0} p="md" bg="dark.8">
      <Group gap="sm" align="baseline" mb="md">
        <Title order={RUN_TITLE_ORDER} c={`${tone}.5`}>{props.result.ok ? "Accepted" : "Wrong Answer"}</Title>
        {typeof props.result.runtimeMs === "number" && <Text size="sm" c="blue.3">Runtime: {props.result.runtimeMs} ms</Text>}
      </Group>
      {props.result.hiddenTestCount ? (
        <Text size="sm" c="gray.3" mb="md">
          Failed hidden submission tests. Revealing {props.result.revealedTestCount || results.length} of {props.result.hiddenTestCount}.
        </Text>
      ) : null}
      <Group gap="sm" mb="md">
        {results.map((result, index) => (
          <HeroSiegeButton
            key={`${result.name}-${index}`}
            active={index === selectedIndex}
            leftSection={result.pass ? <IconCheck size={ICON_XS} /> : <IconX size={ICON_XS} />}
            minWidth={CASE_TAB_MIN_WIDTH}
            onClick={() => setActiveIndex(index)}
          >
            {result.name}
          </HeroSiegeButton>
        ))}
      </Group>
      <ScrollArea.Autosize mah={RUN_PANEL_MAX_HEIGHT}>
        {selected && <RunCaseDetails argNames={argNames} currentQuestion={props.currentQuestion} result={selected} />}
      </ScrollArea.Autosize>
      {props.result.hiddenTestCount ? <SolutionRevealPanel code={props.code} currentQuestion={props.currentQuestion} markSolutionRevealed={props.markSolutionRevealed} /> : null}
    </Paper>
  );
}

function SolutionRevealPanel(props: { code: string; currentQuestion: Question; markSolutionRevealed: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [solutionText, setSolutionText] = useState("");

  useEffect(() => {
    setConfirming(false);
    setLoading(false);
    setError("");
    setSolutionText("");
  }, [props.currentQuestion.id]);

  const revealSolution = useCallback(() => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    setError("");
    props.markSolutionRevealed();
    requestCodexSolutionReveal(props.currentQuestion.id, createSolutionRevealPrompt(props.currentQuestion, props.code)).then((response) => {
      setLoading(false);
      if (!response.ok || !response.text) {
        setError(response.error || "Codex could not reveal a solution.");
        return;
      }
      setSolutionText(response.text);
    });
  }, [confirming, props]);

  const sections = parseSolutionSections(solutionText);
  return (
    <Paper withBorder mt="md" p="sm" bg="dark.7">
      <Group justify="space-between" gap="sm" mb={solutionText || error || loading ? "sm" : 0}>
        <Box>
          <Text size="sm" fw={700}>Need the answer?</Text>
          <Text size="xs" c="dimmed">Revealing marks this question as spoiled for review.</Text>
        </Box>
        <Button
          color={confirming ? "red" : "yellow"}
          leftSection={<IconEye size={ICON_SM} />}
          loading={loading}
          onClick={revealSolution}
          size="xs"
          variant={confirming ? "filled" : "light"}
        >
          {confirming ? "Confirm reveal" : solutionText ? "Regenerate" : "Reveal solution"}
        </Button>
      </Group>
      {error && <Text size="sm" c="red.3">{error}</Text>}
      {loading && !solutionText && <Text size="sm" c="gray.3">Codex is preparing the solution...</Text>}
      {solutionText && (
        <Tabs defaultValue="approach" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="approach">Approach</Tabs.Tab>
            <Tabs.Tab value="code">Code</Tabs.Tab>
            <Tabs.Tab value="complexity">Complexity</Tabs.Tab>
            <Tabs.Tab value="compare">Compare</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="approach" pt="sm"><HintContent content={sections.approach} /></Tabs.Panel>
          <Tabs.Panel value="code" pt="sm"><HighlightedCode code={extractSolutionCode(sections.code)} /></Tabs.Panel>
          <Tabs.Panel value="complexity" pt="sm"><HintContent content={sections.complexity} /></Tabs.Panel>
          <Tabs.Panel value="compare" pt="sm"><HintContent content={sections.compare} /></Tabs.Panel>
        </Tabs>
      )}
    </Paper>
  );
}

function parseSolutionSections(markdown: string) {
  const sections = {
    approach: "",
    code: "",
    complexity: "",
    compare: ""
  };
  let current: keyof typeof sections = "approach";
  for (const line of markdown.split("\n")) {
    const normalized = line.replace(/^#+\s*/, "").trim().toLowerCase();
    if (normalized === "approach") {
      current = "approach";
      continue;
    }
    if (normalized === "code") {
      current = "code";
      continue;
    }
    if (normalized === "complexity") {
      current = "complexity";
      continue;
    }
    if (normalized === "compare with my code") {
      current = "compare";
      continue;
    }
    sections[current] = `${sections[current]}${line}\n`;
  }
  return {
    approach: sections.approach.trim() || markdown.trim(),
    code: sections.code.trim() || markdown.trim(),
    complexity: sections.complexity.trim() || "Complexity was not provided.",
    compare: sections.compare.trim() || "No comparison was provided."
  };
}

function extractSolutionCode(markdown: string) {
  const match = markdown.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  return (match?.[FUNCTION_SIGNATURE_GROUP] || markdown).trim();
}

function RunCaseDetails(props: { argNames: string[]; currentQuestion: Question; result: RunResult }) {
  return (
    <Box style={{ display: "grid", gap: RUN_SECTION_GAP }}>
      <RunSection label="Input" value={formatRunInput(props.result.args, props.argNames)} />
      <RunSection label="Stdout" value={formatStdout(props.result.stdout)} />
      <RunSection color={props.result.pass ? "green.4" : "red.4"} label="Output" value={props.result.actual} />
      <RunSection color="green.4" label="Expected" value={props.result.expected} />
      <FrontendRunPreview currentQuestion={props.currentQuestion} result={props.result} />
    </Box>
  );
}

function RunSection(props: { color?: string; label: string; value: string }) {
  return (
    <Box>
      <Text size="sm" fw={700} c="dimmed" mb={RUN_LABEL_MARGIN_BOTTOM}>{props.label}</Text>
      <Box p={RUN_VALUE_PADDING} style={{ background: RUN_BLOCK_BG, borderRadius: RUN_BLOCK_RADIUS }}>
        <Text c={props.color} style={{ fontFamily: EXAMPLE_FONT_FAMILY, fontSize: RUN_VALUE_FONT_SIZE, lineHeight: RUN_VALUE_LINE_HEIGHT, whiteSpace: "pre-wrap" }}>{props.value}</Text>
      </Box>
    </Box>
  );
}

function formatRunInput(args: string, argNames: string[]) {
  const parsed = parseArgs(args);
  return parsed.map((value, index) => `${argNames[index] || `arg${index + ARG_INDEX_OFFSET}`} = ${formatRunValue(value)}`).join("\n");
}

function formatStdout(stdout: string[] | undefined) {
  return stdout?.length ? stdout.join("\n") : "(no console output)";
}

function parseArgs(args: string) {
  try {
    const parsed = JSON.parse(args);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [args];
  }
}

function formatRunValue(value: unknown) {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "undefined") {
    return "undefined";
  }
  return JSON.stringify(value);
}

function FrontendRunPreview(props: { currentQuestion: Question; result: RunResult }) {
  const value = parsePreviewValue(props.result.actual);
  if (!value) {
    return null;
  }
  if (props.currentQuestion.id === "frontend-debounce-events" && isPreviewEventList(value)) {
    return <DebouncePreview events={value} />;
  }
  if (props.currentQuestion.id === "frontend-todo-reducer" && isPreviewTodoList(value)) {
    return <TodoPreview todos={value} />;
  }
  if (props.currentQuestion.id === "frontend-tabs-state" && isPreviewTabsState(value)) {
    return <TabsPreview activeId={value.activeId} tabs={value.tabs} />;
  }
  return null;
}

function parsePreviewValue(actual: string) {
  if (!actual || actual === "undefined" || actual === "NaN") {
    return null;
  }
  try {
    return JSON.parse(actual);
  } catch {
    return null;
  }
}

function isPreviewEventList(value: unknown): value is PreviewEvent[] {
  return Array.isArray(value) && value.every((event) => {
    return Boolean(event && typeof event === "object" && typeof (event as PreviewEvent).time === "number" && typeof (event as PreviewEvent).value === "string");
  });
}

function isPreviewTodoList(value: unknown): value is PreviewTodo[] {
  return Array.isArray(value) && value.every((todo) => {
    return Boolean(todo && typeof todo === "object" && typeof (todo as PreviewTodo).id === "string" && typeof (todo as PreviewTodo).text === "string" && typeof (todo as PreviewTodo).completed === "boolean");
  });
}

function isPreviewTabsState(value: unknown): value is { activeId: string | null; tabs: PreviewTab[] } {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as { activeId?: unknown; tabs?: unknown };
  return (typeof record.activeId === "string" || record.activeId === null) && Array.isArray(record.tabs) && record.tabs.every((tab) => {
    return Boolean(tab && typeof tab === "object" && typeof (tab as PreviewTab).id === "string" && typeof (tab as PreviewTab).title === "string");
  });
}

function PreviewShell(props: { children: React.ReactNode; title: string }) {
  return (
    <Box>
      <Text size="sm" fw={700} c="dimmed" mb={RUN_LABEL_MARGIN_BOTTOM}>Preview</Text>
      <Box p="md" style={{ background: PREVIEW_BG, border: PREVIEW_BORDER, borderRadius: RUN_BLOCK_RADIUS, color: PREVIEW_TEXT }}>
        <Text size="sm" fw={800} mb="sm" style={{ color: PREVIEW_TEXT }}>{props.title}</Text>
        {props.children}
      </Box>
    </Box>
  );
}

function DebouncePreview(props: { events: PreviewEvent[] }) {
  const latest = props.events.at(-1);
  return (
    <PreviewShell title="Search">
      <Box p="sm" mb="sm" style={{ background: "#ffffff", border: PREVIEW_BORDER, borderRadius: 6 }}>
        <Text size="xs" fw={700} mb={4} style={{ color: PREVIEW_MUTED }}>Search query</Text>
        <Text size="md" fw={700} style={{ color: PREVIEW_TEXT }}>{latest?.value || ""}</Text>
      </Box>
      <Box style={{ display: "grid", gap: 8 }}>
        {props.events.length === 0 ? (
          <Text size="sm" style={{ color: PREVIEW_MUTED }}>No debounced search request fired.</Text>
        ) : props.events.map((event, index) => (
          <Group key={`${event.time}-${event.value}-${index}`} justify="space-between" p="xs" style={{ background: "#e0f2fe", borderRadius: 6 }}>
            <Text size="sm" fw={700} style={{ color: PREVIEW_TEXT }}>{event.value}</Text>
            <Text size="xs" fw={700} style={{ color: PREVIEW_ACCENT }}>{event.time} ms</Text>
          </Group>
        ))}
      </Box>
    </PreviewShell>
  );
}

function TodoPreview(props: { todos: PreviewTodo[] }) {
  const openCount = props.todos.filter((todo) => !todo.completed).length;
  return (
    <PreviewShell title="Todo List">
      <Group justify="space-between" mb="sm">
        <Box p="xs" flex={1} style={{ background: "#ffffff", border: PREVIEW_BORDER, borderRadius: 6 }}>
          <Text size="sm" style={{ color: PREVIEW_MUTED }}>Add a task...</Text>
        </Box>
        <Box px="sm" py={7} style={{ background: PREVIEW_ACCENT, borderRadius: 6 }}>
          <Text size="xs" fw={800} c="white">Add</Text>
        </Box>
      </Group>
      <Box style={{ display: "grid", gap: 8 }}>
        {props.todos.length === 0 ? (
          <Text size="sm" style={{ color: PREVIEW_MUTED }}>No todos left.</Text>
        ) : props.todos.map((todo) => (
          <Group key={todo.id} justify="space-between" p="xs" style={{ background: todo.completed ? PREVIEW_TODO_DONE_BG : "#ffffff", border: PREVIEW_BORDER, borderRadius: 6 }}>
            <Group gap="xs">
              <Box style={{ alignItems: "center", background: todo.completed ? PREVIEW_SUCCESS : "#ffffff", border: `2px solid ${todo.completed ? PREVIEW_SUCCESS : "#94a3b8"}`, borderRadius: 4, color: "#ffffff", display: "flex", height: 18, justifyContent: "center", width: 18 }}>
                {todo.completed ? <IconCheck size={ICON_XS} /> : null}
              </Box>
              <Text size="sm" fw={700} style={{ color: PREVIEW_TEXT, textDecoration: todo.completed ? "line-through" : "none" }}>{todo.text}</Text>
            </Group>
            <Text size="xs" fw={700} style={{ color: PREVIEW_MUTED }}>{todo.id}</Text>
          </Group>
        ))}
      </Box>
      <Text size="xs" mt="sm" style={{ color: PREVIEW_MUTED }}>{openCount} open / {props.todos.length} total</Text>
    </PreviewShell>
  );
}

function TabsPreview(props: { activeId: string | null; tabs: PreviewTab[] }) {
  const activeTab = props.tabs.find((tab) => tab.id === props.activeId) || null;
  return (
    <PreviewShell title="Tabs">
      <Group gap={0} mb="sm" wrap="nowrap" style={{ overflow: "hidden" }}>
        {props.tabs.map((tab) => {
          const active = tab.id === props.activeId;
          return (
            <Box key={tab.id} px="sm" py={8} style={{ background: active ? "#ffffff" : "#e2e8f0", border: PREVIEW_BORDER, borderBottomColor: active ? "#ffffff" : "#cbd5e1", color: active ? PREVIEW_ACCENT : PREVIEW_MUTED, fontWeight: 800 }}>
              <Text size="sm">{tab.title}</Text>
            </Box>
          );
        })}
      </Group>
      <Box p="md" style={{ background: "#ffffff", border: PREVIEW_BORDER, borderRadius: 6, minHeight: 96 }}>
        {activeTab ? (
          <>
            <Text size="lg" fw={900} style={{ color: PREVIEW_TEXT }}>{activeTab.title}</Text>
            <Text size="sm" mt={4} style={{ color: PREVIEW_MUTED }}>Active tab id: {activeTab.id}</Text>
          </>
        ) : (
          <Text size="sm" style={{ color: PREVIEW_MUTED }}>No active tab.</Text>
        )}
      </Box>
    </PreviewShell>
  );
}

function getArgumentNames(question: Question) {
  const match = question.starter.match(/\(([^)]*)\)/);
  if (!match?.[FUNCTION_SIGNATURE_GROUP]) {
    return [];
  }
  return match[FUNCTION_SIGNATURE_GROUP].split(",").map((name) => name.trim()).filter(Boolean);
}

function QuestionFunctionBadge(props: { currentQuestion: Question; sessionStarted: boolean }) {
  if (!props.sessionStarted) {
    return <Badge leftSection={<IconLock size={ICON_XS} />} variant="light">Question locked</Badge>;
  }
  if (isFrontendChallenge(props.currentQuestion)) {
    return <Badge leftSection={<IconCode size={ICON_XS} />} variant="light">React / TypeScript</Badge>;
  }
  return <Badge leftSection={<IconCode size={ICON_XS} />} variant="light">{props.currentQuestion.functionName}()</Badge>;
}

function HintPanel(props: { hintError: string; hintStreaming: boolean; hintText: string }) {
  if (!props.hintStreaming && !props.hintText && !props.hintError) {
    return null;
  }
  const content = props.hintError || props.hintText || "Thinking...";
  return (
    <Paper radius={0} p="sm" bg="dark.6">
      <Group gap="xs" align="flex-start">
        <IconBulb size={ICON_SM} />
        <Box flex={1}>
          <Text size="xs" c="dimmed" fw={700}>Codex hint</Text>
          <HintContent content={content} />
        </Box>
      </Group>
    </Paper>
  );
}

function HintContent(props: { content: string }) {
  return (
    <Box mt={4} style={{ display: "grid", gap: HINT_CONTENT_GAP }}>
      {splitHintMarkdown(props.content).map((segment, index) => <HintSegmentView key={`${segment.kind}-${index}`} segment={segment} />)}
    </Box>
  );
}

function HintSegmentView(props: { segment: HintSegment }) {
  if (props.segment.kind === "code") {
    return <HighlightedCode code={props.segment.content} />;
  }

  return <FormattedTextBlock content={props.segment.content} />;
}

function FormattedTextBlock(props: { content: string }) {
  const lines = props.content.split("\n");
  return (
    <Box style={{ display: "grid", gap: 4 }}>
      {lines.map((line, index) => <FormattedLine key={`${line}-${index}`} line={line} />)}
    </Box>
  );
}

function FormattedLine(props: { line: string }) {
  const bullet = props.line.match(/^\s*-\s+(.*)$/);
  if (bullet) {
    return (
      <Group align="flex-start" gap={6} wrap="nowrap">
        <Text size="sm" c="gray.5">-</Text>
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{formatInlineMarkdown(bullet[FUNCTION_SIGNATURE_GROUP])}</Text>
      </Group>
    );
  }
  return <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{formatInlineMarkdown(props.line)}</Text>;
}

function formatInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <Text key={`${part}-${index}`} span fw={700}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <Text key={`${part}-${index}`} span c="blue.2" style={{ fontFamily: EXAMPLE_FONT_FAMILY }}>{part.slice(1, -1)}</Text>;
    }
    return part;
  });
}

function splitHintMarkdown(content: string) {
  const segments: HintSegment[] = [];
  const textLines: string[] = [];
  const codeLines: string[] = [];
  let inCodeBlock = false;

  for (const line of content.split("\n")) {
    if (line.trim().startsWith(CODE_FENCE)) {
      pushHintSegment(segments, inCodeBlock ? codeLines : textLines, inCodeBlock ? "code" : "text");
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
    } else {
      textLines.push(line);
    }
  }

  pushHintSegment(segments, inCodeBlock ? codeLines : textLines, inCodeBlock ? "code" : "text");
  return segments;
}

function pushHintSegment(segments: HintSegment[], lines: string[], kind: HintSegment["kind"]) {
  const content = lines.join("\n").trim();
  lines.length = 0;
  if (content) {
    segments.push({ content, kind });
  }
}

function TestResults(props: { results: RunResult[] }) {
  if (props.results.length === 0) {
    return null;
  }
  return (
    <ScrollArea.Autosize mah={TEST_RESULTS_MAX_HEIGHT}>
      <List p="sm" size="sm" spacing={4}>
        {props.results.map((result) => (
          <List.Item key={result.name} icon={<ThemeIcon color={result.pass ? "green" : "red"} size={RESULT_ICON_SIZE} radius="xl"><IconCheck size={ICON_XS} /></ThemeIcon>}>
            <TestResultText result={result} />
          </List.Item>
        ))}
      </List>
    </ScrollArea.Autosize>
  );
}

function TestResultText(props: { result: RunResult }) {
  if (props.result.pass) {
    return <Text size="sm">{props.result.name}: passed</Text>;
  }
  return (
    <Box>
      <Text size="sm" fw={700}>{props.result.name}</Text>
      <Text size="xs" c="dimmed">Input: {props.result.args}</Text>
      <Text size="xs" c="dimmed">Expected: {props.result.expected}</Text>
      <Text size="xs" c="dimmed">Actual: {props.result.actual}</Text>
    </Box>
  );
}
