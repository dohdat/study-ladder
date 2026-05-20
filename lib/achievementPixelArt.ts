import type { Achievement } from "./achievementCore";

const SPRITE_SIZE = 10;
const DECORATION_COUNT = 3;
const DECORATION_RANGE = 4;
const DECORATION_OFFSET = 3;
const SIGNATURE_BOTTOM_INNER_OFFSET = 2;
const SIGNATURE_ROW_TOP = 0;
const SIGNATURE_ROW_TOP_INNER = 1;
const SIGNATURE_ROW_BOTTOM_INNER = SPRITE_SIZE - SIGNATURE_BOTTOM_INNER_OFFSET;
const SIGNATURE_ROW_BOTTOM = SPRITE_SIZE - 1;
const SIGNATURE_ROWS = [SIGNATURE_ROW_TOP, SIGNATURE_ROW_TOP_INNER, SIGNATURE_ROW_BOTTOM_INNER, SIGNATURE_ROW_BOTTOM];
const SIGNATURE_LIGHT_THRESHOLD = 0.35;
const SIGNATURE_ACCENT_THRESHOLD = 0.7;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const EMPTY_PIXEL = ".";
const LIGHT_PIXEL = "L";
const ACCENT_PIXEL = "A";

type Pixel = "." | "O" | "M" | typeof LIGHT_PIXEL | typeof ACCENT_PIXEL;
type Sprite = Pixel[][];

const BASE_SPRITES: Record<Achievement["metric"], string[]> = {
  allStats: [
    "..........",
    "..OOOOOO..",
    ".OMLAMLLO.",
    ".OMMMMMMO.",
    ".OMLAMLLO.",
    ".OMMMMMMO.",
    ".OMLAMLLO.",
    "..OOOOOO..",
    "....OO....",
    ".........."
  ],
  coins: [
    "..........",
    "...OOOO...",
    "..OLLLLO..",
    ".OLAMALLO.",
    ".OMMMMMMO.",
    "..OLLLLO..",
    ".OOOMOOOO.",
    ".OMMMLMMO.",
    "..OOOOOO..",
    ".........."
  ],
  defeats: [
    "..........",
    "......OO..",
    ".....OLMO.",
    "..OOOLMO..",
    ".OLLLMO...",
    "..OMMO....",
    "..OMAO....",
    ".OO..OO...",
    "..........",
    ".........."
  ],
  hints: [
    "..........",
    "....AA....",
    "...ALLA...",
    "..AOMMOA..",
    "...OMMO...",
    "...OMMO...",
    "....OO....",
    "....AA....",
    "..........",
    ".........."
  ],
  level: [
    "..........",
    "....AA....",
    "...ALLA...",
    "..ALLLLA..",
    ".AALMMLAA.",
    "...OMMO...",
    "...OMMO...",
    "...OOOO...",
    "..........",
    ".........."
  ],
  mastered: [
    "..........",
    "..OOOOOO..",
    ".OLLLLLO..",
    ".OMAAAOO..",
    ".OMMMMOO..",
    ".OMLLLO...",
    ".OMMMMO...",
    "..OOOOO...",
    "..........",
    ".........."
  ],
  metaCurrency: [
    "..........",
    "....OO....",
    "...OLLO...",
    "..OLLLLO..",
    ".OLALALLO.",
    "..OMMMMO..",
    "...OMMO...",
    "....OO....",
    "..........",
    ".........."
  ],
  metaTotalEarned: [
    "..........",
    "..OOOOOO..",
    ".OLLLLLLO.",
    ".OMOOOOMO.",
    ".OMOAAOMO.",
    ".OMOOOOMO.",
    ".OLLLLLLO.",
    "..OOMMOO..",
    "...OOOO...",
    ".........."
  ],
  metaUpgrades: [
    "..........",
    "...OOOO...",
    "..OLLLLO..",
    ".OOMAMOO..",
    ".OMMMMMO..",
    ".OMMMMMO..",
    "..OMMMO...",
    "..OO.OO...",
    "..........",
    ".........."
  ],
  ratingSolved: [
    "..........",
    "..OOOOOO..",
    ".OMAAAOO..",
    ".OMMMMO...",
    ".OMOLMO...",
    ".OMMMMO...",
    ".OMAAAOO..",
    "..OOOOOO..",
    "..........",
    ".........."
  ],
  relics: [
    "..........",
    "...OOOO...",
    "..OLLLLO..",
    ".OLAAALO..",
    ".OMMMMMO..",
    "..OMMMO...",
    "..OLALO...",
    "...OOO....",
    "..........",
    ".........."
  ],
  solved: [
    "..........",
    "....OO....",
    "...OLLO...",
    "..OLMMLO..",
    ".OLMMMMLO.",
    ".OMMAAMO.",
    "..OMMMO...",
    "...OOOO...",
    "..........",
    ".........."
  ],
  stat: [
    "..........",
    "...OOOO...",
    "..OLLLLO..",
    "..OMAMO...",
    ".OOMMMOO..",
    ".AOMMMOA..",
    "...OMMO...",
    "...O..O...",
    "..........",
    ".........."
  ],
  streak: [
    "..........",
    "....AA....",
    "...ALMA...",
    "..ALMMO...",
    "..OMMMOA..",
    ".OMMMMLO..",
    "..OMMLO...",
    "...OOO....",
    "..........",
    ".........."
  ]
};

export function getAchievementPixelArt(achievement: Achievement) {
  const sprite = cloneSprite(BASE_SPRITES[achievement.metric]);
  addAchievementDecorations(sprite, achievement);
  addAchievementSignature(sprite, achievement);
  return sprite.map((row) => row.join(""));
}

function cloneSprite(rows: string[]): Sprite {
  return rows.map((row) => row.split("") as Pixel[]);
}

function addAchievementDecorations(sprite: Sprite, achievement: Achievement) {
  for (let index = 0; index < DECORATION_COUNT; index += 1) {
    const seed = `${achievement.id}:${achievement.target}:${index}`;
    const x = DECORATION_OFFSET + Math.floor(seededRandom(`${seed}:x`) * DECORATION_RANGE);
    const y = DECORATION_OFFSET + Math.floor(seededRandom(`${seed}:y`) * DECORATION_RANGE);
    sprite[y][x] = ACCENT_PIXEL;
    sprite[Math.min(SPRITE_SIZE - 1, y + 1)][x] = LIGHT_PIXEL;
  }
}

function addAchievementSignature(sprite: Sprite, achievement: Achievement) {
  SIGNATURE_ROWS.forEach((row) => {
    sprite[row].fill(EMPTY_PIXEL);
    for (let column = 0; column < SPRITE_SIZE; column += 1) {
      sprite[row][column] = getSignaturePixel(achievement, row, column);
    }
  });
}

function getSignaturePixel(achievement: Achievement, row: number, column: number): Pixel {
  const roll = seededRandom(`${achievement.id}:${achievement.badge}:signature:${row}:${column}`);
  if (roll > SIGNATURE_ACCENT_THRESHOLD) {
    return ACCENT_PIXEL;
  }
  return roll > SIGNATURE_LIGHT_THRESHOLD ? LIGHT_PIXEL : EMPTY_PIXEL;
}

function seededRandom(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}
