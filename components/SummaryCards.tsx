import { Paper, SimpleGrid, Text } from "@mantine/core";

import { questions } from "../data/questions";

export function SummaryCards(props: { dueCount: number; mastered: number; streak: number }) {
  const cards = [
    { label: "Due", value: props.dueCount },
    { label: "Mastered", value: `${props.mastered}/${questions.length}` },
    { label: "Streak", value: props.streak }
  ];

  return (
    <SimpleGrid cols={{ base: 3, sm: 3 }} spacing="xs">
      {cards.map((card) => (
        <Paper
          key={card.label}
          withBorder
          px="sm"
          py={7}
          style={{ alignItems: "center", display: "flex", justifyContent: "space-between", minHeight: 42 }}
        >
          <Text size="xs" c="dimmed" lh={1}>{card.label}</Text>
          {typeof card.value === "number" || typeof card.value === "string" ? (
            <Text fw={700} size="lg" lh={1}>{card.value}</Text>
          ) : (
            card.value
          )}
        </Paper>
      ))}
    </SimpleGrid>
  );
}
