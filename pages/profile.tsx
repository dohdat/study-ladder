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

import { questions } from "../data/questions";
import { defaultState, getCard, getProfileStats, getTopicStats, isMasteredCard, normalizeStudyState } from "../lib/studyCore";
import { migrateLocalStorageState } from "../lib/studyDb";
import type { StudyState } from "../types/study";

export default function Profile() {
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

  const profile = useMemo(() => getProfileStats(state), [state]);
  const topics = useMemo(() => getTopicStats(state), [state]);

  return (
    <>
      <Head>
        <title>Study Ladder Profile</title>
      </Head>

      <Container size="xl" px="md" py="md">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={2}>Profile</Title>
              <Text c="dimmed" size="sm">
                {loaded ? "Progress and topic mastery" : "Loading progress"}
              </Text>
            </Box>
            <Button component="a" href="index.html" variant="default" leftSection={<IconArrowLeft size={16} />}>
              Practice
            </Button>
          </Group>

          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Attempted</Text>
              <Title order={3}>{profile.attempted}</Title>
            </Paper>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Solved</Text>
              <Title order={3}>{profile.solved}</Title>
            </Paper>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Mastered</Text>
              <Title order={3}>{profile.mastered}/{questions.length}</Title>
            </Paper>
            <Paper withBorder p="md">
              <Text size="xs" c="dimmed">Pass Rate</Text>
              <Title order={3}>
                <NumberFormatter value={profile.accuracy} suffix="%" />
              </Title>
            </Paper>
          </SimpleGrid>

          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Box>
                <Title order={4}>Topic Mastery</Title>
                <Text c="dimmed" size="sm">{profile.due} questions due for review</Text>
              </Box>
              <Badge variant="light">{state.streak} streak</Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {topics.map((topic) => (
                <Box key={topic.topic}>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={600}>{topic.topic}</Text>
                    <Text size="xs" c="dimmed">{topic.mastered}/{topic.total} mastered</Text>
                  </Group>
                  <Progress value={(topic.mastered / topic.total) * 100} />
                </Box>
              ))}
            </SimpleGrid>
          </Card>

          <Card withBorder>
            <Title order={4} mb="md">Question History</Title>
            <Table.ScrollContainer minWidth={720}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Question</Table.Th>
                    <Table.Th>Topics</Table.Th>
                    <Table.Th>Attempts</Table.Th>
                    <Table.Th>Passed</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {questions.map((question) => {
                    const card = getCard(state, question.id);
                    const mastered = isMasteredCard(card);
                    return (
                      <Table.Tr key={question.id}>
                        <Table.Td>{question.title}</Table.Td>
                        <Table.Td>{question.topics.join(", ")}</Table.Td>
                        <Table.Td>{card.attempts}</Table.Td>
                        <Table.Td>{card.correct}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={mastered ? "green" : card.correct > 0 ? "blue" : "gray"}>
                            {mastered ? "Mastered" : card.correct > 0 ? "Solved" : "New"}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
