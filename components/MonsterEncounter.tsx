import { Badge, Box, Group, Paper, Progress, Text } from "@mantine/core";

import type { Difficulty, Question, StudyState } from "../types/study";

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
const AVATAR_SIZE = 88;
const PIXEL_SIZE = 3;
const GRID_CELLS = 24;
const PIXEL_GAP = 0;
const AVATAR_BORDER_WIDTH = 2;
const AVATAR_SHADOW_WIDTH = 2;

type MonsterKind = "brute" | "demon" | "dragon" | "ranger" | "reaper" | "skeleton" | "slime" | "snake";

type MonsterPalette = {
  accent: string;
  light: string;
  mid: string;
  outline: string;
  shade: string;
};

type MonsterDefinition = {
  form: string[];
  name: string;
  palette: MonsterPalette;
};

const PIXEL_COLOR_KEYS: Record<string, keyof MonsterPalette> = {
  A: "accent",
  L: "light",
  M: "mid",
  O: "outline",
  S: "shade"
};

const QUESTION_MONSTERS: Record<string, MonsterKind> = {
  "array-first-duplicate": "slime",
  "array-merge-intervals": "brute",
  "array-two-sum": "ranger",
  "binary-search-rotated": "reaper",
  "dp-climb-cost": "brute",
  "dp-coin-change": "dragon",
  "graph-shortest-path": "reaper",
  "heap-top-k": "demon",
  "stack-valid-brackets": "skeleton",
  "string-longest-unique": "snake",
  "string-valid-palindrome": "skeleton",
  "tree-level-order": "demon"
};

const FALLBACK_MONSTERS: Record<Difficulty, MonsterKind> = {
  1: "slime",
  2: "ranger",
  3: "brute",
  4: "demon",
  5: "dragon"
};

const MONSTERS: Record<MonsterKind, MonsterDefinition> = {
  slime: {
    name: "Moss Slime",
    palette: palette("#17351f", "#225f34", "#45a54b", "#8de96f", "#7b1f32"),
    form: frame([
      "........OOOOOO........",
      "......OOOLLLLOO.......",
      ".....OOLLLLLLLOO......",
      "....OOLLLLLLLLLLO.....",
      "...OOLLLLLLLLLLLLO....",
      "...OLLLLLAAALLLLLO....",
      "..OLLLLLAAMMALLLLO....",
      "..OLLLLLAAMMALLLLO....",
      ".OLLLLLMMMMMSSLLLO....",
      ".OLLLLMMMMSSSSSLLO....",
      ".OLLLMMMSSSSSSSMO.....",
      "..OLMMMSSSSSSMMO......",
      "...OOMMMMMMMOOO.......",
      ".....OOOMMMOO.........",
      "......OO..OO..........",
      ".....OO....OO.........",
      "......................",
      "......................",
      "......................",
      "......................"
    ])
  },
  ranger: {
    name: "Goblin Ranger",
    palette: palette("#10251a", "#1f6a37", "#35b34a", "#79ef61", "#c46b22"),
    form: frame([
      "............AA........",
      "...........AA.........",
      ".......OOOOAA.........",
      "......OMMOOA..........",
      ".....OMLLMO...........",
      "....OMLAALMO..........",
      "....OMMMMOO....A......",
      "...OOMMSMMOO..AA......",
      "...OMMSSSMMOOAA.......",
      "....OMSSSSMMOA........",
      ".....OMMMMMOA.........",
      "....OOOMMMOO..........",
      "...OO..MMM..OO........",
      ".......MSSM...........",
      "......OO..OO..........",
      ".....OO....OO.........",
      "......................",
      "......................",
      "......................",
      "......................"
    ])
  },
  snake: {
    name: "Coil Viper",
    palette: palette("#2c160f", "#773a2b", "#c97848", "#ffbf87", "#ffec99"),
    form: frame([
      "..............OOOO....",
      "............OOLAAO....",
      "...........OLLLMMO....",
      "..........OLLLSSO.....",
      ".........OLLLSO.......",
      "........OLLLSO........",
      ".......OLLLSO.........",
      "......OLLLSO..........",
      ".....OLLLSO...........",
      "....OLLLSOOO..........",
      "...OLLLSOOMMOO........",
      "..OLLLSOOMSSMMO.......",
      "..OLLSOOMSSSSMO.......",
      "...OOOMMSSSSMMO.......",
      ".....OOMMMMMOO........",
      ".......OOSSOO.........",
      "......................",
      "......................",
      "......................",
      "......................"
    ])
  },
  skeleton: {
    name: "Bone Soldier",
    palette: palette("#191527", "#6f6680", "#b9b0a4", "#f0e8d8", "#8fb3ff"),
    form: frame([
      "........OOOOOO........",
      ".......OLLLLLO........",
      "......OLMAAMLO........",
      "......OLMMMLOO....A...",
      ".......OLMMO......A...",
      ".....OOOMMMOO.....A...",
      "....OMMOMMMOMM....A...",
      "...OMMOOMMMOOMM...A...",
      "..OMMO..MMM..MMO.AA...",
      ".......OMMMO...AAA....",
      "........MMMO..........",
      ".......OMMMO..........",
      "......OM...MO.........",
      ".....OM.....MO........",
      "....OO.......OO.......",
      "...OO.........OO......",
      "......................",
      "......................",
      "......................",
      "......................"
    ])
  },
  brute: {
    name: "Stone Brute",
    palette: palette("#2a2430", "#625957", "#a89a93", "#d8cec8", "#ffcf5a"),
    form: frame([
      ".......OOOOOOOO.......",
      ".....OOOMMMMMMOO......",
      "....OOMMLLLLMMMOO.....",
      "...OMMLSSSSSLLMMO.....",
      "..OMMMSLAAALSMMMO.....",
      "..OMMMLLLLLLLMMMO.....",
      ".OMMMMLSSSSSLMMMOO....",
      ".OMMMLLLLLLLLLMMO.....",
      "OMMMSSLLLLLLSSMMMO....",
      "OMMS..LLLLLL..SMMO....",
      ".OO...LSSSSL...OO.....",
      "......LSSSSL..........",
      ".....OMMMMMMO.........",
      "....OO.....OO.........",
      "...OO.......OO........",
      "......................",
      "......................",
      "......................",
      "......................",
      "......................"
    ])
  },
  demon: {
    name: "Horned Fiend",
    palette: palette("#24090b", "#761616", "#c92a2a", "#ff6b6b", "#ffd35a"),
    form: frame([
      "O....................O",
      ".O......OOOO......O...",
      "..O...OOMMMOO...O.....",
      "...O.OMSSSSMO.O.......",
      "....OMMLLLLMMO........",
      "...OMMLAAALLMMO.......",
      "..OMMMMMMMMMMMMO......",
      ".OMMMMAAAAAMMMMOO.....",
      "OMMMMLSSSSLMMMMOA.....",
      "OMMMMMLLLLMMMMMOA.....",
      ".OMMMMMMMMMMMMO.AA....",
      "..OMMSSMMSSMMO.AA.....",
      "...OOMMMMMMOO.AA......",
      "..OO.MM..MM.OO........",
      ".....SS..SS...........",
      "....OO....OO..........",
      "...OO......OO.........",
      "......................",
      "......................",
      "......................"
    ])
  },
  reaper: {
    name: "Moon Reaper",
    palette: palette("#0b0616", "#1f1238", "#4c1d95", "#8b5cf6", "#93c5fd"),
    form: frame([
      ".............AAAAA....",
      "...........AALLLLA....",
      "..........AA....LA....",
      ".......OOOOO.....A....",
      "......OMMMMOO....A....",
      ".....OMMSSMMMO...A....",
      "....OMMSAASMMOAAAA....",
      "....OMMSSSSMMO........",
      "...OMMSSLLSSMMO.......",
      "...OMMLLSSLLMMO.......",
      "....OMMMMMMMMMO.......",
      ".....OMMSSMMMO........",
      "......OMMMMMO.........",
      ".....OO.MMM.OO........",
      "....OO..SSS..OO.......",
      "........S.S...........",
      ".......OO.OO..........",
      "......................",
      "......................",
      "......................"
    ])
  },
  dragon: {
    name: "Void Dragon",
    palette: palette("#100318", "#3b0a45", "#862e9c", "#f06595", "#66d9e8"),
    form: frame([
      "O........AAA........O.",
      ".O......ALLA......O...",
      "..O...OALLLLAO...O....",
      "...O.OMSSSSMMO.O......",
      "....OMMLLLLMMO........",
      "...OMMLAAALLMMO.......",
      "..OMMMMMMMMMMMO.......",
      ".OMMMMAAAAAMMMMOO.....",
      "OMMMMLSSSSLMMMMOA.....",
      "OMMMMMLLLLMMMMMOA.....",
      "OMMMMMMMMMMMMMMOA.....",
      ".OMSSSSMMSSSSMO.AA....",
      "A.OOMMMMMMMMOO.AA.....",
      "AAO.MMSSMMSS.OAA......",
      ".A..MM..MM..M.A.......",
      "....SS..SS..S.........",
      "...OO....OO..OO.......",
      "..OO......OO..OO......",
      "......................",
      "......................"
    ])
  }
};

export function MonsterEncounter(props: { question: Question; state: StudyState }) {
  const health = getMonsterHealth(props.question);
  const monster = getMonsterDefinition(props.question);
  return (
    <Paper withBorder p="xs" mt="md" bg="dark.7">
      <Group gap="sm" wrap="nowrap" align="center">
        <MonsterAvatar monster={monster} />
        <Box flex={1}>
          <Group justify="space-between" gap="xs" mb={4}>
            <Box>
              <Text size="sm" fw={800}>{monster.name}</Text>
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

function MonsterAvatar(props: { monster: MonsterDefinition }) {
  const colors = props.monster.palette;
  const pixels = getMonsterPixels(props.monster);
  return (
    <Box
      aria-hidden
      style={{
        background: colors.outline,
        border: `${AVATAR_BORDER_WIDTH}px solid ${colors.light}`,
        boxShadow: `0 0 0 ${AVATAR_SHADOW_WIDTH}px ${colors.outline}`,
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

function palette(outline: string, shade: string, mid: string, light: string, accent: string): MonsterPalette {
  return { accent, light, mid, outline, shade };
}

function frame(rows: string[]) {
  return ["........................", "........................", ...rows.map((row) => `.${row}.`), "........................", "........................"];
}

function getMonsterDefinition(question: Question) {
  return MONSTERS[QUESTION_MONSTERS[question.id] || FALLBACK_MONSTERS[question.difficulty]];
}

function getMonsterPixels(monster: MonsterDefinition) {
  return monster.form.join("").split("");
}

function getPixelColor(pixel: string, colors: MonsterPalette) {
  const colorKey = PIXEL_COLOR_KEYS[pixel];
  return colorKey ? colors[colorKey] : "transparent";
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
