import dynamic from "next/dynamic";
import {
  ActionIcon,
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
  Text,
  ThemeIcon,
  Tooltip,
  Title
} from "@mantine/core";
import { IconArrowRight, IconBulb, IconCheck, IconCode, IconPlayerPlay, IconRefresh, IconWand } from "@tabler/icons-react";
import type { OnMount } from "@monaco-editor/react";

import { HighlightedCode } from "./HighlightedCode";
import { difficultyLabels } from "../lib/studyCore";
import type { Question, RunResult, StudyState } from "../types/study";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const ICON_XS = 12;
const ICON_SM = 14;
const ICON_LG = 18;
const RESULT_ICON_SIZE = 20;
const EDITOR_FONT_SIZE = 13;
const EDITOR_HEIGHT = 360;
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

type HintSegment = {
  content: string;
  kind: "code" | "text";
};

export type PracticePanelActions = {
  updateDraft: (nextCode: string) => void;
  beautifyCurrentCode: (source?: string) => void;
  handleEditorMount: OnMount;
  chooseQuestion: (preferNext: boolean) => void;
  buyHint: () => void;
  startQuestion: () => void;
  submitCode: () => void;
};

type EditorProps = {
  code: string;
  questionFinished: boolean;
  results: RunResult[];
  runnerReady: boolean;
  running: boolean;
  runStatus: string;
  sessionStarted: boolean;
  statusColor: string;
  canBuyHint: boolean;
  hintCost: number;
  hintError: string;
  hintStreaming: boolean;
  hintText: string;
  timeRemainingMs: number;
  timerColor: string;
  timerLabel: string;
  timeUsedPercent: number;
};

export function PracticeArea(props: {
  actions: PracticePanelActions;
  currentQuestion: Question | null;
  editorProps: EditorProps;
  mode: StudyState["mode"];
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
        />
      </Grid.Col>
      <Grid.Col span={{ base: LAYOUT_COLUMNS, md: EDITOR_COLUMN_SPAN }}>
        <EditorCard {...props.editorProps} actions={props.actions} currentQuestion={props.currentQuestion} />
      </Grid.Col>
    </Grid>
  );
}

function ProblemCard(props: { canMoveNext: boolean; currentQuestion: Question; chooseQuestion: (preferNext: boolean) => void }) {
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
        <Tooltip label={props.canMoveNext ? "Move to the next question" : "Pass all tests before moving on"} withArrow>
          <ActionIcon variant="light" size="lg" aria-label="Next question" disabled={!props.canMoveNext} onClick={() => props.chooseQuestion(true)}>
            <IconArrowRight size={ICON_LG} />
          </ActionIcon>
        </Tooltip>
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

function EditorCard(props: EditorProps & { actions: PracticePanelActions; currentQuestion: Question }) {
  return (
    <Card withBorder p={0}>
      <EditorToolbar {...props} />
      <Progress value={props.timeUsedPercent} color={props.timerColor} radius={0} />
      <Box h={EDITOR_HEIGHT} pos="relative">
        <MonacoEditor height={`${EDITOR_HEIGHT}px`} language="javascript" theme="vs-dark" value={props.code} onChange={(value) => props.actions.updateDraft(value || "")} onMount={props.actions.handleEditorMount} options={{ minimap: { enabled: false }, fontSize: EDITOR_FONT_SIZE, tabSize: TAB_SIZE, wordWrap: "on", scrollBeyondLastLine: false, automaticLayout: true, formatOnPaste: true, formatOnType: true, readOnly: !props.sessionStarted, readOnlyMessage: EDITOR_READ_ONLY_MESSAGE }} />
        {!props.sessionStarted && <LockedEditorOverlay />}
      </Box>
      <Paper radius={0} p="sm" bg={`${props.statusColor}.0`}>
        <Text size="sm" c={`${props.statusColor}.8`} style={{ whiteSpace: "pre-wrap" }}>{props.runStatus}</Text>
      </Paper>
      <HintPanel hintError={props.hintError} hintStreaming={props.hintStreaming} hintText={props.hintText} />
      <TestResults results={props.results} />
    </Card>
  );
}

function LockedEditorOverlay() {
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
          <IconPlayerPlay size={ICON_SM} />
          <Text size="sm" fw={600}>Press Start to unlock the editor.</Text>
        </Group>
        <Text size="xs" c="dimmed" mt={4} ta="center">Timer and fullscreen guard start together.</Text>
      </Paper>
    </Box>
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
        <Tooltip label="Start timer and enter fullscreen" withArrow>
          <Box component="span">
            <Button size="xs" variant="default" leftSection={<IconPlayerPlay size={ICON_SM} />} disabled={props.questionFinished || props.sessionStarted} onClick={props.actions.startQuestion}>Start</Button>
          </Box>
        </Tooltip>
        <Tooltip label="Restore the starter code" withArrow>
          <Button size="xs" variant="default" leftSection={<IconRefresh size={ICON_SM} />} disabled={!props.sessionStarted} onClick={() => props.actions.updateDraft(props.currentQuestion.starter)}>Reset</Button>
        </Tooltip>
        <Tooltip label="Format JavaScript code (Ctrl+S)" withArrow>
          <Button size="xs" variant="default" leftSection={<IconWand size={ICON_SM} />} disabled={!props.sessionStarted} onClick={() => props.actions.beautifyCurrentCode()}>Beautify</Button>
        </Tooltip>
        <Tooltip label={`Buy one next-step hint (${props.hintCost} coins)`} withArrow>
          <Box component="span">
            <Button size="xs" variant="default" leftSection={<IconBulb size={ICON_SM} />} disabled={!props.sessionStarted || !props.canBuyHint} onClick={props.actions.buyHint}>Hint</Button>
          </Box>
        </Tooltip>
        <Tooltip label="Run code against hidden tests (Ctrl+Enter)" withArrow>
          <Box component="span">
            <Button size="xs" leftSection={<IconCheck size={ICON_SM} />} loading={props.running} disabled={!props.runnerReady || props.questionFinished || !props.sessionStarted || props.timeRemainingMs <= 0} onClick={props.actions.submitCode}>Submit</Button>
          </Box>
        </Tooltip>
      </Group>
    </Group>
  );
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

  return <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{props.segment.content}</Text>;
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
