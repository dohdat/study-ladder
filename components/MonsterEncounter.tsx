import { Badge, Box, Group, Paper, Progress, Text } from "@mantine/core";

import type { Difficulty, Question } from "../types/study";

const RATING_MIN = 1000;
const RATING_MAX = 3500;
const BASE_HEALTH = 30;
const HEALTH_PER_DIFFICULTY = 18;
const HEALTH_RATING_DIVISOR = 25;
const PERCENT_MAX = 100;
const RED_RATING_MIN = 3000;
const ORANGE_RATING_MIN = 2400;
const YELLOW_RATING_MIN = 1800;
const BLUE_RATING_MIN = 1400;
const AVATAR_SIZE = 66;
const PIXEL_SIZE = 6;
const GRID_CELLS = 11;
const PIXEL_GAP = 0;
const ENEMY_NAMES: Record<Difficulty, string> = {
  1: "Buglet",
  2: "Bit Imp",
  3: "Rune Brute",
  4: "Abyss Knight",
  5: "Void Dragon"
};

const ENEMY_COLORS: Record<Difficulty, { accent: string; body: string; eye: string; horn: string; shadow: string }> = {
  1: { accent: "#8ce99a", body: "#40c057", eye: "#fff3bf", horn: "#d8f5a2", shadow: "#2b8a3e" },
  2: { accent: "#66d9e8", body: "#1098ad", eye: "#ffd43b", horn: "#99e9f2", shadow: "#0b7285" },
  3: { accent: "#c084fc", body: "#7e22ce", eye: "#ffec99", horn: "#e9d5ff", shadow: "#581c87" },
  4: { accent: "#ff8787", body: "#c92a2a", eye: "#ffe066", horn: "#ffa8a8", shadow: "#801515" },
  5: { accent: "#f06595", body: "#862e9c", eye: "#fff3bf", horn: "#ffdeeb", shadow: "#3b0a45" }
};

export function MonsterEncounter(props: { question: Question }) {
  const health = getMonsterHealth(props.question);
  return (
    <Paper withBorder p="xs" mt="md" bg="dark.7">
      <Group gap="sm" wrap="nowrap" align="center">
        <MonsterAvatar difficulty={props.question.difficulty} />
        <Box flex={1}>
          <Group justify="space-between" gap="xs" mb={4}>
            <Box>
              <Text size="sm" fw={800}>{ENEMY_NAMES[props.question.difficulty]}</Text>
              <Text size="xs" c="dimmed">Question Rating {props.question.rating}</Text>
            </Box>
            <Badge color={getRatingColor(props.question.rating)} variant="light">{props.question.rating}</Badge>
          </Group>
          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="xs" c="dimmed" fw={700}>Enemy Health</Text>
            <Text size="xs" fw={700}>{health}/{health}</Text>
          </Group>
          <Progress value={PERCENT_MAX} color="red" size="sm" />
        </Box>
      </Group>
    </Paper>
  );
}

function MonsterAvatar(props: { difficulty: Difficulty }) {
  const colors = ENEMY_COLORS[props.difficulty];
  const pixels = getMonsterPixels(props.difficulty);
  return (
    <Box
      aria-hidden
      style={{
        background: `linear-gradient(135deg, ${colors.shadow}, ${colors.body})`,
        border: `2px solid ${colors.accent}`,
        boxShadow: `0 0 0 2px ${colors.shadow}`,
        display: "grid",
        flex: `0 0 ${AVATAR_SIZE}px`,
        gap: PIXEL_GAP,
        gridTemplateColumns: `repeat(${GRID_CELLS}, ${PIXEL_SIZE}px)`,
        height: AVATAR_SIZE,
        padding: 0,
        placeContent: "center",
        width: AVATAR_SIZE
      }}
    >
      {pixels.map((pixel, index) => (
        <Box
          key={`${pixel}-${index}`}
          style={{
            backgroundColor: getPixelColor(pixel, colors),
            height: PIXEL_SIZE,
            width: PIXEL_SIZE
          }}
        />
      ))}
    </Box>
  );
}

function getMonsterPixels(difficulty: Difficulty) {
  const forms: Record<Difficulty, string[]> = {
    1: [
      "...........",
      "...........",
      "...BBBBB...",
      "..BBBBBBB..",
      "..BEEBEEB..",
      "..BBBBBBB..",
      "...BTTTB...",
      "..BBBBBBB..",
      ".BB.....BB.",
      "...........",
      "..........."
    ],
    2: [
      "...........",
      "..H.....H..",
      "...BBBBB...",
      "..BBBBBBB..",
      ".BBEBBEBB.",
      ".BBBBBBBBB.",
      "..BBTTTBB..",
      "...BBBBB...",
      "..BB...BB..",
      ".BB.....BB.",
      "..........."
    ],
    3: [
      ".H.......H.",
      "..H.....H..",
      "...BBBBB...",
      ".BBBBBBBBB.",
      ".BBEBBEBB.",
      "BBBBBBBBBBB",
      "..BBTTTBB..",
      ".BBBBBBBBB.",
      ".BB.BBB.BB.",
      "BB.......BB",
      "..........."
    ],
    4: [
      "H.........H",
      ".H.......H.",
      "..BBBBBBB..",
      ".BBBBBBBBB.",
      "BBBEBBBEBBB",
      "BBBBBBBBBBB",
      ".BBTTTTTBB.",
      "..BBBBBBB..",
      ".BBB.B.BBB.",
      "BB.B...B.BB",
      "..........."
    ],
    5: [
      "H...BBB...H",
      ".H.BBBBB.H.",
      "H.BBBBBBB.H",
      ".BBBBBBBBB.",
      "BBBEBBBEBBB",
      "BBBBBBBBBBB",
      "BBTTTTTTTBB",
      ".BBBBBBBBB.",
      "BBBB.B.BBBB",
      "BB.BB.BB.BB",
      "W.........W"
    ]
  };
  return forms[difficulty].join("").split("");
}

function getPixelColor(pixel: string, colors: (typeof ENEMY_COLORS)[Difficulty]) {
  if (pixel === "B") {
    return colors.body;
  }
  if (pixel === "E") {
    return colors.eye;
  }
  if (pixel === "H") {
    return colors.horn;
  }
  if (pixel === "T") {
    return "#f8f9fa";
  }
  if (pixel === "W") {
    return colors.accent;
  }
  return "transparent";
}

function getMonsterHealth(question: Question) {
  return BASE_HEALTH + question.difficulty * HEALTH_PER_DIFFICULTY + Math.round((question.rating - RATING_MIN) / HEALTH_RATING_DIVISOR);
}

function getRatingColor(rating: number) {
  if (rating >= RATING_MAX) {
    return "grape";
  }
  if (rating >= RED_RATING_MIN) {
    return "red";
  }
  if (rating >= ORANGE_RATING_MIN) {
    return "orange";
  }
  if (rating >= YELLOW_RATING_MIN) {
    return "yellow";
  }
  if (rating >= BLUE_RATING_MIN) {
    return "blue";
  }
  return "green";
}
