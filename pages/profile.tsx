import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  NumberFormatter,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

import { CoinAmount } from "../components/CoinIcon";
import { questions } from "../data/questions";
import { defaultState, getCard, getProfileStats, getTopicStats, isMasteredCard, normalizeStudyState } from "../lib/studyCore";
import { migrateLocalStorageState } from "../lib/studyDb";
import type { CardState, StudyState } from "../types/study";

const PROGRESS_PERCENT_MAX = 100;
const ICON_SIZE = 16;
const QUESTION_TABLE_MIN_WIDTH = 720;

type QuestionStatus = {
  color: string;
  label: string;
};

export default function Profile() {
  const { loaded, state } = useProfileState();
  const profile = useMemo(() => getProfileStats(state), [state]);
  const topics = useMemo(() => getTopicStats(state), [state]);
  return (
    <>
      <Head>
        <title>Study Ladder Profile</title>
      </Head>
      <Container size="xl" px="md" py="md">
        <Stack gap="md">
          <ProfileHeader loaded={loaded} />
          <ProfileStats attempted={profile.attempted} solved={profile.solved} mastered={profile.mastered} accuracy={profile.accuracy} coins={state.profile.coins} hintsBought={state.profile.hintsBought} />
          <TopicMasteryCard due={profile.due} streak={state.streak} topics={topics} />
          <QuestionHistoryCard state={state} />
        </Stack>
      </Container>
    </>
  );
}

function useProfileState() {
  const [state, setState] = useState<StudyState>(() => defaultState());
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    migrateLocalStorageState()
      .then((stored) => {
        if (!active) {
          return;
        }
        setState(normalizeStudyState(stored));
        setLoaded(true);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setState(defaultState());
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return { loaded, state };
}

function ProfileHeader(props: { loaded: boolean }) {
  return (
    <Group justify="space-between" align="flex-start">
      <Box>
        <Title order={2}>Profile</Title>
        <Text c="dimmed" size="sm">
          {props.loaded ? "Progress and topic mastery" : "Loading progress"}
        </Text>
      </Box>
      <Button component="a" href="index.html" variant="default" leftSection={<IconArrowLeft size={ICON_SIZE} />}>
        Practice
      </Button>
    </Group>
  );
}

function ProfileStats(props: { accuracy: number; attempted: number; coins: number; hintsBought: number; mastered: number; solved: number }) {
  const cards = [
    { label: "Coins", value: <CoinAmount value={props.coins} /> },
    { label: "Hints Bought", value: props.hintsBought },
    { label: "Attempted", value: props.attempted },
    { label: "Solved", value: props.solved },
    { label: "Mastered", value: `${props.mastered}/${questions.length}` },
    { label: "Pass Rate", value: <NumberFormatter value={props.accuracy} suffix="%" /> }
  ];
  return (
    <SimpleGrid cols={{ base: 2, sm: 6 }}>
      {cards.map((card) => (
        <Paper key={card.label} withBorder p="md">
          <Text size="xs" c="dimmed">{card.label}</Text>
          <Title order={3}>{card.value}</Title>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

function TopicMasteryCard(props: { due: number; streak: number; topics: ReturnType<typeof getTopicStats> }) {
  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Box>
          <Title order={4}>Topic Mastery</Title>
          <Text c="dimmed" size="sm">{props.due} questions due for review</Text>
        </Box>
        <Badge variant="light">{props.streak} streak</Badge>
      </Group>
      <TopicProgressList topics={props.topics} />
    </Card>
  );
}

function TopicProgressList(props: { topics: ReturnType<typeof getTopicStats> }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      {props.topics.map((topic) => (
        <Box key={topic.topic}>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={600}>{topic.topic}</Text>
            <Text size="xs" c="dimmed">{topic.mastered}/{topic.total} mastered</Text>
          </Group>
          <Progress value={(topic.mastered / topic.total) * PROGRESS_PERCENT_MAX} />
        </Box>
      ))}
    </SimpleGrid>
  );
}

function QuestionHistoryCard(props: { state: StudyState }) {
  return (
    <Card withBorder>
      <Title order={4} mb="md">Question History</Title>
      <Table.ScrollContainer minWidth={QUESTION_TABLE_MIN_WIDTH}>
        <Table striped highlightOnHover>
          <QuestionHistoryHead />
          <Table.Tbody>
            {questions.map((question) => {
              const card = getCard(props.state, question.id);
              const status = getQuestionStatus(card);
              return (
                <Table.Tr key={question.id}>
                  <Table.Td>{question.title}</Table.Td>
                  <Table.Td>{question.topics.join(", ")}</Table.Td>
                  <Table.Td>{card.attempts}</Table.Td>
                  <Table.Td>{card.correct}</Table.Td>
                  <Table.Td><Badge variant="light" color={status.color}>{status.label}</Badge></Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}

function QuestionHistoryHead() {
  return (
    <Table.Thead>
      <Table.Tr>
        <Table.Th>Question</Table.Th>
        <Table.Th>Topics</Table.Th>
        <Table.Th>Attempts</Table.Th>
        <Table.Th>Passed</Table.Th>
        <Table.Th>Status</Table.Th>
      </Table.Tr>
    </Table.Thead>
  );
}

function getQuestionStatus(card: CardState): QuestionStatus {
  if (isMasteredCard(card)) {
    return { color: "green", label: "Mastered" };
  }
  if (card.correct > 0) {
    return { color: "blue", label: "Solved" };
  }
  return { color: "gray", label: "New" };
}
