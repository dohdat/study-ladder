import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Group, Paper, Progress, Text, Tooltip } from "@mantine/core";
type StaticImageData = string;

import { getMonsterCurrentHealth } from "../lib/combatCore";
import { getMonsterAttackType, getMonsterMaxHealth, getMonsterResistances, getUniqueMonsterBonusDescription, getUniqueMonsterBonuses, getUniqueMonsterName } from "../lib/monsterCore";
import type { DamageType, Difficulty, Question, StudyState } from "../types/study";
import batArt from "../assets/hero_siege_monsters/bat.png";
import bigEntArt from "../assets/hero_siege_monsters/big-ent.png";
import bogMushroomArt from "../assets/hero_siege_monsters/bog-mushroom.png";
import caveSlimeArt from "../assets/hero_siege_monsters/cave-slime.png";
import cryptDollArt from "../assets/hero_siege_monsters/crypt-doll.png";
import cursedDollArt from "../assets/hero_siege_monsters/cursed-doll.png";
import cyclopsArt from "../assets/hero_siege_monsters/cyclops.png";
import cyclopsGhostArt from "../assets/hero_siege_monsters/cyclops-ghost.png";
import demonKingArt from "../assets/hero_siege_monsters/demon-king.png";
import demonZealotArt from "../assets/hero_siege_monsters/demon-zealot.png";
import desertBeastArt from "../assets/hero_siege_monsters/desert-beast.png";
import entArt from "../assets/hero_siege_monsters/ent.png";
import entBossArt from "../assets/hero_siege_monsters/ent-boss.png";
import frostGoblinArt from "../assets/hero_siege_monsters/frost-goblin.png";
import frostSkeletonArt from "../assets/hero_siege_monsters/frost-skeleton.png";
import ghostArcherArt from "../assets/hero_siege_monsters/ghost-archer.png";
import goblinArt from "../assets/hero_siege_monsters/goblin.png";
import goblinBomberArt from "../assets/hero_siege_monsters/goblin-bomber.png";
import goblinShamanArt from "../assets/hero_siege_monsters/goblin-shaman.png";
import graveZombieArt from "../assets/hero_siege_monsters/grave-zombie.png";
import hellBeastArt from "../assets/hero_siege_monsters/hell-beast.png";
import samuraiSkeletonArt from "../assets/hero_siege_monsters/samurai-skeleton.png";
import sandWaspArt from "../assets/hero_siege_monsters/sand-wasp.png";
import sheepKingArt from "../assets/hero_siege_monsters/sheep-king.png";
import skeletonGhostArt from "../assets/hero_siege_monsters/skeleton-ghost.png";
import skeletonMageArt from "../assets/hero_siege_monsters/skeleton-mage.png";
import smallSpiderArt from "../assets/hero_siege_monsters/small-spider.png";
import spiderCritterArt from "../assets/hero_siege_monsters/spider-critter.png";
import steveBossArt from "../assets/hero_siege_monsters/steve-boss.png";
import zombieArt from "../assets/hero_siege_monsters/zombie.png";
import zombieCrawlerArt from "../assets/hero_siege_monsters/zombie-crawler.png";

const RATING_MAX = 3500;
const PERCENT_MAX = 100;
const RED_RATING_MIN = 3000;
const ORANGE_RATING_MIN = 2400;
const YELLOW_RATING_MIN = 1800;
const BLUE_RATING_MIN = 1400;
const AVATAR_SIZE = 88;
const AVATAR_BORDER_WIDTH = 2;
const AVATAR_SHADOW_WIDTH = 2;
const AVATAR_BACKGROUND = "#08070b";
const AVATAR_BORDER_COLOR = "#8a744c";
const AVATAR_SHADOW_COLOR = "#1f111a";
const HASH_INITIAL = 7;
const HASH_MULTIPLIER = 31;
const HASH_MODULUS = 1000000007;
const DAMAGE_POP_TOP = 4;
const DAMAGE_POP_RIGHT = 2;
const HEALTH_ANIMATION_START_DELAY_MS = 40;

type MonsterDefinition = {
  art: StaticImageData;
  filter?: string;
  name: string;
};

export type MonsterWikiEntry = MonsterDefinition & {
  difficulty: Difficulty;
  id: string;
  rating: number;
};

export type CombatImpactType = DamageType | "bleed";

export type MonsterDamagePop = {
  amount: number;
  critical: boolean;
  damageTypes: CombatImpactType[];
  hitCount: number;
  id: string;
  maxHealth: number;
  questionId: string;
  remainingHealth: number;
};

export type CombatImpactVisual = {
  amount?: number;
  damageTypes: CombatImpactType[];
  hitCount?: number;
  id: string;
};

const MONSTER_VARIANTS = [
  { filter: "none", idPrefix: "", namePrefix: "" },
  { filter: "hue-rotate(38deg) saturate(1.22) brightness(1.08)", idPrefix: "ember", namePrefix: "Ember" },
  { filter: "hue-rotate(215deg) saturate(1.35) brightness(0.94)", idPrefix: "void", namePrefix: "Void" }
] as const;

const BASE_MONSTERS = {
  arcaneCube: { art: cursedDollArt, name: "Cursed Doll" },
  bladeImp: { art: demonZealotArt, name: "Demon Zealot" },
  bloodOoze: { art: graveZombieArt, name: "Grave Zombie" },
  boneSoldier: { art: skeletonMageArt, name: "Skeleton Mage" },
  carrionCrawler: { art: zombieCrawlerArt, name: "Zombie Crawler" },
  caveSpider: { art: smallSpiderArt, name: "Small Spider" },
  coilViper: { art: sandWaspArt, name: "Sand Wasp" },
  coralCrusher: { art: desertBeastArt, name: "Desert Beast" },
  emberSkull: { art: batArt, name: "Bat" },
  frostWraith: { art: frostSkeletonArt, name: "Frost Skeleton" },
  gildedMinotaur: { art: cyclopsArt, name: "Cyclops" },
  goblinRanger: { art: goblinArt, name: "Goblin" },
  haloSeraph: { art: steveBossArt, name: "Steve Boss" },
  hornedFiend: { art: demonKingArt, name: "Demon King" },
  livingTome: { art: bogMushroomArt, name: "Bog Mushroom" },
  manyEyedHorror: { art: cryptDollArt, name: "Crypt Doll" },
  moonReaper: { art: ghostArcherArt, name: "Ghost Archer" },
  mossSlime: { art: caveSlimeArt, name: "Cave Slime" },
  ogreMystic: { art: cyclopsGhostArt, name: "Cyclops Ghost" },
  reefStalker: { art: hellBeastArt, name: "Hell Beast" },
  runeGolem: { art: entBossArt, name: "Ent Boss" },
  scarabHusk: { art: spiderCritterArt, name: "Spider Critter" },
  shellWarlock: { art: skeletonGhostArt, name: "Skeleton Ghost" },
  shieldCaptain: { art: samuraiSkeletonArt, name: "Samurai Skeleton" },
  stoneBrute: { art: bigEntArt, name: "Big Ent" },
  swampLurker: { art: zombieArt, name: "Zombie" },
  thornBeast: { art: entArt, name: "Ent" },
  venomWasp: { art: frostGoblinArt, name: "Frost Goblin" },
  voidDragon: { art: sheepKingArt, name: "Sheep King" },
  voidTentacle: { art: goblinBomberArt, name: "Goblin Bomber" },
  watcherOrb: { art: goblinShamanArt, name: "Goblin Shaman" }
} satisfies Record<string, MonsterDefinition>;

type BaseMonsterKind = keyof typeof BASE_MONSTERS;
type MonsterKind = string;

const QUESTION_MONSTERS: Record<string, MonsterKind> = {
  "array-first-duplicate": "mossSlime",
  "array-merge-intervals": "stoneBrute",
  "array-two-sum": "goblinRanger",
  "binary-search-rotated": "moonReaper",
  "dp-climb-cost": "shieldCaptain",
  "dp-coin-change": "voidDragon",
  "graph-shortest-path": "moonReaper",
  "heap-top-k": "hornedFiend",
  "stack-valid-brackets": "boneSoldier",
  "string-longest-unique": "coilViper",
  "string-valid-palindrome": "boneSoldier",
  "tree-level-order": "hornedFiend"
};

const BASE_MONSTER_POOLS: Record<Difficulty, BaseMonsterKind[]> = {
  1: ["mossSlime", "scarabHusk", "bloodOoze", "carrionCrawler", "coilViper", "bladeImp"],
  2: ["goblinRanger", "caveSpider", "venomWasp", "reefStalker", "swampLurker", "watcherOrb"],
  3: ["stoneBrute", "coralCrusher", "shieldCaptain", "shellWarlock", "emberSkull", "thornBeast", "livingTome"],
  4: ["hornedFiend", "moonReaper", "boneSoldier", "frostWraith", "voidTentacle", "ogreMystic"],
  5: ["voidDragon", "gildedMinotaur", "manyEyedHorror", "runeGolem", "arcaneCube", "haloSeraph"]
};

const MONSTER_POOLS: Record<Difficulty, MonsterKind[]> = {
  1: expandMonsterPool(BASE_MONSTER_POOLS[1]),
  2: expandMonsterPool(BASE_MONSTER_POOLS[2]),
  3: expandMonsterPool(BASE_MONSTER_POOLS[3]),
  4: expandMonsterPool(BASE_MONSTER_POOLS[4]),
  5: expandMonsterPool(BASE_MONSTER_POOLS[5])
};
const WIKI_RATINGS_BY_DIFFICULTY: Record<Difficulty, number> = { 1: 1100, 2: 1500, 3: 2000, 4: 2600, 5: 3200 };
const MONSTERS: Record<MonsterKind, MonsterDefinition> = createMonsterCatalog(BASE_MONSTERS);
export const MONSTER_WIKI_ENTRIES: MonsterWikiEntry[] = Object.entries(MONSTERS).map(([id, monster]) => {
  const difficulty = getWikiMonsterDifficulty(id);
  return { difficulty, id, rating: WIKI_RATINGS_BY_DIFFICULTY[difficulty], ...monster };
});

export function MonsterEncounter(props: { damagePop?: MonsterDamagePop | null; question: Question; state: StudyState }) {
  const maxHealth = getMonsterMaxHealth(props.question);
  const currentHealth = getMonsterCurrentHealth(props.state, props.question);
  const activeDamage = props.damagePop?.questionId === props.question.id ? props.damagePop : null;
  const health = useAnimatedMonsterHealth({ currentHealth, damagePop: activeDamage, maxHealth });
  const monster = getMonsterDefinition(props.question);
  const uniqueName = getUniqueMonsterName(props.question);
  const bonuses = getUniqueMonsterBonuses(props.question);
  const attackType = getMonsterAttackType(props.question, bonuses);
  const resistances = getMonsterResistances(props.question);
  return (
    <Paper withBorder p="xs" mt="md" bg="dark.7" style={{ overflow: "visible" }}>
      <Group gap="sm" wrap="nowrap" align="center" style={{ overflow: "visible" }}>
        <MonsterAvatar damagePop={activeDamage} monster={monster} />
        <Box flex={1} style={{ overflow: "visible" }}>
          <Group justify="space-between" gap="xs" mb={4}>
            <Box>
              <Text size="sm" fw={800} style={{ color: "#f1f3f5" }}>{uniqueName}</Text>
              <Text size="xs" c="dimmed">{monster.name}</Text>
            </Box>
          </Group>
          <Group gap={4} mb={6}>
            <Badge size="xs" variant="filled" color={getDamageTypeBadgeColor(attackType)}>Attack: {formatDamageType(attackType)}</Badge>
            {Object.entries(resistances).filter(([, value]) => value > 0).map(([type, value]) => (
              <Badge key={type} size="xs" variant="outline" color={getDamageTypeBadgeColor(type)}>{formatDamageType(type)} Res {value}%</Badge>
            ))}
          </Group>
          <UniqueBonusBadges bonuses={bonuses} color={getRatingColor(props.question.rating)} />
          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="xs" c="dimmed" fw={700}>Enemy Health</Text>
            <Text size="xs" fw={700}>{Math.round(health)}/{maxHealth}</Text>
          </Group>
          <Progress value={(health / maxHealth) * PERCENT_MAX} color="red" size="sm" styles={{ section: { transition: "width 620ms cubic-bezier(0.2, 0.9, 0.22, 1)" } }} />
        </Box>
      </Group>
    </Paper>
  );
}

function formatDamageType(type: string) {
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function getDamageTypeBadgeColor(type: string) {
  if (type === "fire") {
    return "orange";
  }
  if (type === "cold") {
    return "cyan";
  }
  if (type === "lightning") {
    return "yellow";
  }
  if (type === "poison") {
    return "green";
  }
  return "gray";
}

function useAnimatedMonsterHealth(params: { currentHealth: number; damagePop: MonsterDamagePop | null; maxHealth: number }) {
  const targetHealth = params.damagePop ? params.damagePop.remainingHealth : params.currentHealth;
  const startHealth = useMemo(() => {
    if (!params.damagePop) {
      return targetHealth;
    }
    return Math.min(params.maxHealth, params.damagePop.remainingHealth + params.damagePop.amount);
  }, [params.damagePop, params.maxHealth, targetHealth]);
  const [health, setHealth] = useState(targetHealth);

  useEffect(() => {
    if (!params.damagePop) {
      setHealth(params.currentHealth);
      return undefined;
    }
    setHealth(startHealth);
    const timer = window.setTimeout(() => setHealth(targetHealth), HEALTH_ANIMATION_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [params.currentHealth, params.damagePop, startHealth, targetHealth]);

  return health;
}

function UniqueBonusBadges(props: { bonuses: string[]; color: string }) {
  if (!props.bonuses.length) {
    return null;
  }
  return (
    <Group gap={4} mb={6} style={{ overflow: "visible" }}>
      {props.bonuses.map((bonus) => (
        <UniqueBonusBadge key={bonus} bonus={bonus} color={props.color} />
      ))}
    </Group>
  );
}

function UniqueBonusBadge(props: { bonus: string; color: string }) {
  const description = getUniqueMonsterBonusDescription(props.bonus);
  return (
    <Tooltip label={description} multiline withArrow withinPortal={false}>
      <Box component="span" style={{ display: "inline-flex" }} tabIndex={0}>
        <Badge color={props.color} size="xs" variant="outline" style={{ cursor: "help" }}>{props.bonus}</Badge>
      </Box>
    </Tooltip>
  );
}

function MonsterAvatar(props: { damagePop?: MonsterDamagePop | null; monster: MonsterDefinition }) {
  const damageTypes = props.damagePop?.damageTypes || [];
  return (
    <Box
      aria-hidden
      style={{
        alignItems: "center",
        background: AVATAR_BACKGROUND,
        border: `${AVATAR_BORDER_WIDTH}px solid ${AVATAR_BORDER_COLOR}`,
        boxShadow: `0 0 0 ${AVATAR_SHADOW_WIDTH}px ${AVATAR_SHADOW_COLOR}`,
        display: "flex",
        flex: `0 0 ${AVATAR_SIZE}px`,
        height: AVATAR_SIZE,
        justifyContent: "center",
        padding: 0,
        position: "relative",
        width: AVATAR_SIZE
      }}
    >
      <Box
        alt=""
        component="img"
        src={props.monster.art}
        style={{
          display: "block",
          filter: props.monster.filter,
          height: "100%",
          imageRendering: "pixelated",
          objectFit: "contain",
          width: "100%"
        }}
      />
      {props.damagePop && <ImpactEffects key={`${props.damagePop.id}-effects`} damageTypes={damageTypes} />}
      {props.damagePop && <DamagePop key={props.damagePop.id} damage={props.damagePop} />}
    </Box>
  );
}

export function ImpactEffects(props: { damageTypes: CombatImpactType[] }) {
  const fallbackTypes: CombatImpactType[] = ["physical"];
  const uniqueTypes = Array.from(new Set(props.damageTypes.length ? props.damageTypes : fallbackTypes));
  return (
    <>
      {uniqueTypes.includes("physical") && <HitSlash />}
      {uniqueTypes.map((type) => type === "physical" ? null : <ElementalImpact key={type} type={type} />)}
    </>
  );
}

function HitSlash() {
  return (
    <Box
      style={{
        animation: "monster-hit-slash 460ms ease-out both",
        background: "linear-gradient(90deg, transparent 0%, rgba(255, 37, 37, 0.1) 10%, #ff2020 38%, #fff1f1 50%, #ff2020 62%, rgba(255, 37, 37, 0.1) 90%, transparent 100%)",
        boxShadow: "0 0 10px rgba(255, 0, 0, 0.82)",
        height: 8,
        left: 6,
        pointerEvents: "none",
        position: "absolute",
        top: 40,
        transform: "rotate(-28deg)",
        transformOrigin: "center",
        width: 78,
        zIndex: 4
      }}
    />
  );
}

function ElementalImpact(props: { type: CombatImpactType }) {
  const style = getElementalImpactStyle(props.type);
  return (
    <Box
      style={{
        animation: `${style.animation} 620ms ease-out both`,
        background: style.background,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        height: style.height,
        left: style.left,
        mixBlendMode: "screen",
        opacity: 0,
        pointerEvents: "none",
        position: "absolute",
        top: style.top,
        transform: style.transform,
        width: style.width,
        zIndex: 5
      }}
    />
  );
}

function getElementalImpactStyle(type: CombatImpactType) {
  if (type === "fire") {
    return { animation: "combat-impact-burn", background: "radial-gradient(circle, rgba(255, 236, 130, 0.92) 0%, rgba(255, 103, 24, 0.78) 38%, rgba(170, 18, 8, 0) 72%)", borderRadius: "50%", boxShadow: "0 0 18px rgba(255, 71, 18, 0.9)", height: 72, left: 8, top: 8, transform: "scale(0.6)", width: 72 };
  }
  if (type === "cold") {
    return { animation: "combat-impact-freeze", background: "linear-gradient(135deg, rgba(205, 248, 255, 0.9), rgba(67, 187, 255, 0.55) 45%, rgba(12, 39, 76, 0))", borderRadius: 6, boxShadow: "0 0 16px rgba(120, 229, 255, 0.9)", height: 78, left: 6, top: 5, transform: "scale(0.8)", width: 78 };
  }
  if (type === "lightning") {
    return { animation: "combat-impact-lightning", background: "linear-gradient(110deg, transparent 0%, #fff8a6 28%, #f4d91e 36%, transparent 43%, transparent 55%, #fff 60%, #70d7ff 68%, transparent 78%)", borderRadius: 0, boxShadow: "0 0 14px rgba(255, 238, 79, 0.95)", height: 86, left: 16, top: 0, transform: "skewX(-18deg)", width: 48 };
  }
  if (type === "poison") {
    return { animation: "combat-impact-poison", background: "radial-gradient(circle, rgba(165, 255, 77, 0.82) 0%, rgba(55, 204, 58, 0.58) 42%, rgba(18, 102, 31, 0) 74%)", borderRadius: "50%", boxShadow: "0 0 16px rgba(89, 255, 91, 0.82)", height: 74, left: 7, top: 7, transform: "scale(0.55)", width: 74 };
  }
  return { animation: "combat-impact-bleed", background: "linear-gradient(90deg, transparent, rgba(255, 0, 24, 0.9), transparent)", borderRadius: 999, boxShadow: "0 0 12px rgba(255, 0, 30, 0.9)", height: 8, left: 6, top: 40, transform: "rotate(-28deg)", width: 78 };
}

function DamagePop(props: { damage: MonsterDamagePop }) {
  const hitCount = props.damage.hitCount > 1 ? ` x${props.damage.hitCount}` : "";
  return (
    <Box
      style={{
        animation: "monster-damage-pop 820ms ease-out both",
        color: props.damage.critical ? "#fff0a8" : "#ff4d4d",
        fontSize: props.damage.critical ? 22 : 18,
        fontWeight: 900,
        pointerEvents: "none",
        position: "absolute",
        right: DAMAGE_POP_RIGHT,
        textShadow: props.damage.critical ? "0 2px 0 #000, 0 0 8px #ff2a2a" : "0 2px 0 #000, 0 0 6px rgba(255, 0, 0, 0.78)",
        top: DAMAGE_POP_TOP,
        transform: "translateY(0)",
        zIndex: 3
      }}
    >
      -{props.damage.amount}{hitCount}
    </Box>
  );
}

function getMonsterDefinition(question: Question) {
  return MONSTERS[QUESTION_MONSTERS[question.id] || pickMonsterKind(question.id, MONSTER_POOLS[question.difficulty])];
}

function createMonsterCatalog(baseMonsters: Record<BaseMonsterKind, MonsterDefinition>) {
  return Object.fromEntries(
    Object.entries(baseMonsters).flatMap(([id, monster]) => MONSTER_VARIANTS.map((variant) => [
      getVariantMonsterId(variant.idPrefix, id),
      {
        ...monster,
        filter: variant.filter,
        name: getVariantMonsterName(variant.namePrefix, monster.name)
      }
    ]))
  );
}

function expandMonsterPool(pool: BaseMonsterKind[]) {
  return pool.flatMap((id) => MONSTER_VARIANTS.map((variant) => getVariantMonsterId(variant.idPrefix, id)));
}

function getWikiMonsterDifficulty(id: MonsterKind): Difficulty {
  const baseId = getBaseMonsterId(id);
  return (Object.entries(BASE_MONSTER_POOLS).find(([, pool]) => pool.includes(baseId))?.[0] || "1") as unknown as Difficulty;
}

function getBaseMonsterId(id: MonsterKind): BaseMonsterKind {
  const normalized = id.replace(/^(ember|void)([A-Z])/, (_match, _prefix, firstLetter: string) => firstLetter.toLowerCase());
  return normalized as BaseMonsterKind;
}

function getVariantMonsterId(prefix: string, id: string) {
  return prefix ? `${prefix}${id[0].toUpperCase()}${id.slice(1)}` : id;
}

function getVariantMonsterName(prefix: string, name: string) {
  return prefix ? `${prefix} ${name}` : name;
}

function pickMonsterKind(seed: string, pool: MonsterKind[]) {
  const hash = [...seed].reduce((total, character) => ((total * HASH_MULTIPLIER) + character.charCodeAt(0)) % HASH_MODULUS, HASH_INITIAL);
  return pool[hash % pool.length] || pool[0];
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
