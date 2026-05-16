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
  Title
} from "@mantine/core";
import { IconArrowRight, IconCheck, IconCode, IconPlayerPlay, IconRefresh, IconWand } from "@tabler/icons-react";
import type { OnMount } from "@monaco-editor/react";

import { difficultyLabels } from "../lib/studyCore";
import type { Question, RunResult, StudyState } from "../types/study";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const ICON_XS = 12;
const ICON_SM = 14;
const ICON_LG = 18;
const RESULT_ICON_SIZE = 20;
const EDITOR_FONT_SIZE = 13;
const EDITOR_HEIGHT = 360;
const TEST_RESULTS_MAX_HEIGHT = 150;
const TAB_SIZE = 2;
const LAYOUT_COLUMNS = 10;
const QUESTION_COLUMN_SPAN = 3;
const EDITOR_COLUMN_SPAN = 7;

export type PracticePanelActions = {
  updateDraft: (nextCode: string) => void;
  beautifyCurrentCode: (source?: string) => void;
  handleEditorMount: OnMount;
  chooseQuestion: (preferNext: boolean) => void;
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
        <ProblemCard currentQuestion={props.currentQuestion} chooseQuestion={props.actions.chooseQuestion} />
      </Grid.Col>
      <Grid.Col span={{ base: LAYOUT_COLUMNS, md: EDITOR_COLUMN_SPAN }}>
        <EditorCard {...props.editorProps} actions={props.actions} currentQuestion={props.currentQuestion} />
      </Grid.Col>
    </Grid>
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

function EditorCard(props: EditorProps & { actions: PracticePanelActions; currentQuestion: Question }) {
  return (
    <Card withBorder p={0}>
      <EditorToolbar {...props} />
      <Progress value={props.timeUsedPercent} color={props.timerColor} radius={0} />
      <Box h={EDITOR_HEIGHT}>
        <MonacoEditor height={`${EDITOR_HEIGHT}px`} language="javascript" theme="vs-dark" value={props.code} onChange={(value) => props.actions.updateDraft(value || "")} onMount={props.actions.handleEditorMount} options={{ minimap: { enabled: false }, fontSize: EDITOR_FONT_SIZE, tabSize: TAB_SIZE, wordWrap: "on", scrollBeyondLastLine: false, automaticLayout: true, formatOnPaste: true, formatOnType: true }} />
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
        <Button size="xs" variant="default" leftSection={<IconPlayerPlay size={ICON_SM} />} disabled={props.questionFinished} onClick={props.actions.startQuestion}>Start</Button>
        <Button size="xs" variant="default" leftSection={<IconRefresh size={ICON_SM} />} onClick={() => props.actions.updateDraft(props.currentQuestion.starter)}>Reset</Button>
        <Button size="xs" variant="default" leftSection={<IconWand size={ICON_SM} />} onClick={() => props.actions.beautifyCurrentCode()}>Beautify</Button>
        <Button size="xs" leftSection={<IconCheck size={ICON_SM} />} loading={props.running} disabled={!props.runnerReady || props.questionFinished || !props.sessionStarted || props.timeRemainingMs <= 0} onClick={props.actions.submitCode}>Submit</Button>
      </Group>
    </Group>
  );
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
            {result.pass ? `${result.name}: passed` : `${result.name}: expected ${result.expected}, got ${result.actual}`}
          </List.Item>
        ))}
      </List>
    </ScrollArea.Autosize>
  );
}
