import { useState } from "react";

import { Badge, Box, Group, Progress, Stack, Tabs, Text, Tooltip } from "@mantine/core";

import { HeroSiegeButton } from "./HeroSiegeUi";
import { HeroSiegeSkillIcon } from "./HeroSiegeSkillIcon";
import { canSpendWarriorSkillPoint, getAvailableWarriorSkillPoints, getWarriorSkillRank, getWarriorSkillTooltipBreakdown, resetWarriorSkillPoints, spendWarriorSkillPoint, WARRIOR_SKILLS } from "../lib/skillCore";
import { getLevelProgress } from "../lib/studyCore";
import type { StudyState, WarriorSkillId } from "../types/study";

const BRANCH_ICONS = {
  "Combat Masteries": "swordMastery",
  "Combat Skills": "whirlwind",
  Warcries: "battleOrders"
} as const;
const TREE_BG = "radial-gradient(circle at 50% 12%, rgba(92, 20, 24, 0.55), rgba(35, 8, 11, 0.98) 44%, #070303 100%)";
const TREE_BORDER = "2px solid #8a1744";
const TREE_INNER_BORDER = "1px solid rgba(205, 36, 83, 0.82)";
const TREE_PANEL_BG = "linear-gradient(180deg, rgba(37, 6, 9, 0.72), rgba(11, 4, 5, 0.9))";
const TREE_TITLE_BG = "linear-gradient(180deg, rgba(13, 11, 12, 0.98), rgba(4, 3, 4, 0.98))";
const NODE_BG = "radial-gradient(circle at 42% 28%, rgba(94, 32, 17, 0.9), rgba(9, 6, 5, 0.98) 72%)";
const NODE_LOCKED_BG = "linear-gradient(145deg, #080808, #141211)";
const NODE_BORDER = "2px solid #a45c16";
const NODE_ACTIVE_BORDER = "2px solid #f6a21d";
const NODE_LOCKED_BORDER = "2px solid #27211b";
const TOOLTIP_BG = "#120608";
const TOOLTIP_BORDER = "1px solid #9f2d4e";
const TOOLTIP_TEXT = "#f3ead7";
const SKILL_BRANCHES = ["Combat Skills", "Combat Masteries", "Warcries"] as const;
const PROGRESS_MAX = 100;
const TREE_ROWS = 6;
const TREE_COLUMNS = 4;
const TREE_HEIGHT = 640;
const TREE_X_GUTTER_PERCENT = 12;
const TREE_Y_GUTTER_PERCENT = 10;
const SKILL_NODE_WIDTH = 62;
const SKILL_NODE_HEIGHT = 62;
const SKILL_ICON_SIZE = 56;
const LOCKED_NODE_OPACITY = 0.52;
const ARROW_COLOR = "#b42050";
const ARROW_LOCKED_COLOR = "#4b1828";
const ARROW_MIDPOINT_DIVISOR = 2;
const ARROW_NODE_X_OFFSET = 3.8;
const ARROW_NODE_Y_OFFSET = 4.8;
const SAME_ROW_THRESHOLD = 0.2;
const RANK_BADGE_SIZE = 21;
const EMPTY_SOCKET_SIZE = 26;

type WarriorSkillBranch = typeof SKILL_BRANCHES[number];
type SkillPosition = { column: number; row: number };
type SkillNode = { skill: (typeof WARRIOR_SKILLS)[number]; position: SkillPosition };
type SkillArrow = { active: boolean; from: SkillPosition; key: string; to: SkillPosition };

const SKILL_LAYOUTS: Record<WarriorSkillBranch, Partial<Record<WarriorSkillId, SkillPosition>>> = {
  "Combat Skills": {
    bash: { column: 2.5, row: 1 },
    powerStrike: { column: 1.25, row: 2 },
    doubleSwing: { column: 2.5, row: 2 },
    cleave: { column: 1.25, row: 3 },
    tripleStrike: { column: 2.5, row: 3 },
    concentrate: { column: 3.75, row: 3 },
    frenzy: { column: 1.25, row: 4 },
    sureCrit: { column: 3.75, row: 4 },
    bloodlust: { column: 1.25, row: 5 },
    whirlwind: { column: 3.75, row: 5 },
    execute: { column: 1, row: 6 },
    bloodForBlood: { column: 2, row: 6 },
    whirlwindAssault: { column: 3.75, row: 6 }
  },
  "Combat Masteries": {
    swordMastery: { column: 1, row: 1 },
    axeMastery: { column: 2, row: 1 },
    findPotion: { column: 4, row: 1 },
    shieldMastery: { column: 1, row: 2 },
    arcaneFocus: { column: 3, row: 2 },
    quickRecovery: { column: 1, row: 3 },
    battleTrance: { column: 3, row: 3 },
    treasureSense: { column: 4, row: 3 },
    ironSkin: { column: 1.5, row: 4 },
    burningPact: { column: 3, row: 5 },
    demonForm: { column: 3, row: 6 },
    naturalResistance: { column: 1.5, row: 6 }
  },
  Warcries: {
    howl: { column: 2.5, row: 1 },
    taunt: { column: 1, row: 2 },
    shout: { column: 4, row: 2 },
    battleCry: { column: 1, row: 3 },
    findItem: { column: 2, row: 3 },
    shockwave: { column: 1, row: 4 },
    grimWard: { column: 2, row: 4 },
    battleOrders: { column: 3.25, row: 4 },
    battleCommand: { column: 2.5, row: 5 },
    warCry: { column: 4, row: 5 }
  }
};


export function WarriorSkillTree(props: { state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const [activeBranch, setActiveBranch] = useState<WarriorSkillBranch>("Combat Skills");
  const level = getLevelProgress(props.state).level;
  const availablePoints = getAvailableWarriorSkillPoints(props.state, level);
  const hasSpentSkillPoints = hasSpentWarriorSkillPoints(props.state);
  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Box>
          <Text size="sm" fw={800}>Warrior Skill Tree</Text>
          <Text size="xs" c="dimmed">Level {level} warrior</Text>
        </Box>
        <Group gap="xs">
          <HeroSiegeButton height={24} minWidth={92} disabled={!hasSpentSkillPoints} onClick={() => props.setState((previous) => resetWarriorSkillPoints(previous))}>Reset Skills</HeroSiegeButton>
          <Badge color={availablePoints > 0 ? "yellow" : "gray"} variant="light">{availablePoints} skill points</Badge>
        </Group>
      </Group>
      <Box p="md" style={{ background: TREE_BG, border: TREE_BORDER, boxShadow: "inset 0 0 0 2px #080304, 0 16px 42px rgba(0, 0, 0, 0.58)" }}>
        <Tabs value={activeBranch} onChange={(value) => value && setActiveBranch(value as WarriorSkillBranch)} keepMounted={false}>
          <Tabs.List grow mb="md" style={{ borderColor: "rgba(205, 36, 83, 0.62)", gap: 10 }}>
            {SKILL_BRANCHES.map((branch) => {
              return (
                <Tabs.Tab
                  key={branch}
                  value={branch}
                  leftSection={<HeroSiegeSkillIcon skillId={BRANCH_ICONS[branch]} size={24} />}
                  styles={{
                    tab: {
                      background: branch === activeBranch ? "linear-gradient(180deg, #3d1017, #130607)" : TREE_TITLE_BG,
                      border: branch === activeBranch ? "1px solid #d94467" : "1px solid #332025",
                      color: "#f1dfad",
                      fontWeight: 900,
                      textTransform: "uppercase"
                    }
                  }}
                >
                  {branch}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
          {SKILL_BRANCHES.map((branch) => (
            <Tabs.Panel key={branch} value={branch}>
              <SkillBranchTree branch={branch} state={props.state} setState={props.setState} level={level} />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Box>
    </Stack>
  );
}

function SkillBranchTree(props: { branch: WarriorSkillBranch; level: number; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const skills = WARRIOR_SKILLS
    .filter((skill) => skill.branch === props.branch)
    .map((skill) => ({ skill, position: getSkillPosition(props.branch, skill.id, skill.row) }));
  const nodesById = new Map(skills.map((node) => [node.skill.id, node]));
  const arrows = skills.flatMap((node) => (node.skill.requires || []).flatMap((requiredId) => {
    const source = nodesById.get(requiredId);
    if (!source) {
      return [];
    }
    return [{
      active: getWarriorSkillRank(props.state.profile.skillRanks, requiredId) > 0,
      from: source.position,
      key: `${requiredId}-${node.skill.id}`,
      to: node.position
    }];
  }));

  return (
    <Box style={{ background: TREE_PANEL_BG, border: TREE_INNER_BORDER, boxShadow: "inset 0 0 0 2px rgba(7, 2, 3, 0.92)", overflow: "hidden", padding: 14 }}>
      <Group justify="center" mb="md">
        <Box style={{ alignItems: "center", background: TREE_TITLE_BG, border: "1px solid rgba(205, 36, 83, 0.72)", boxShadow: "inset 0 0 0 2px #050203, 0 4px 14px rgba(0, 0, 0, 0.55)", display: "flex", gap: 12, justifyContent: "center", minWidth: 340, padding: "8px 18px" }}>
          <HeroSiegeSkillIcon skillId={BRANCH_ICONS[props.branch]} size={34} />
          <Text fw={900} size="xl" style={{ color: "#f1dfad", letterSpacing: 0, textShadow: "0 2px 0 #000", textTransform: "uppercase" }}>{props.branch}</Text>
        </Box>
      </Group>
      <Box style={{ height: TREE_HEIGHT, position: "relative", width: "100%" }}>
        <SkillSockets />
        <DependencyArrows arrows={arrows} />
        {skills.map((node) => (
          <SkillNodeButton key={node.skill.id} level={props.level} node={node} state={props.state} setState={props.setState} />
        ))}
      </Box>
    </Box>
  );
}

function SkillNodeButton(props: { level: number; node: SkillNode; state: StudyState; setState: React.Dispatch<React.SetStateAction<StudyState>> }) {
  const { skill, position } = props.node;
  const rank = getWarriorSkillRank(props.state.profile.skillRanks, skill.id);
  const canSpend = canSpendWarriorSkillPoint(props.state, skill.id, props.level);
  const locked = rank === 0 && !canSpend;
  return (
    <Tooltip
      label={<SkillTooltip state={props.state} skill={skill} level={props.level} />}
      withArrow
      multiline
      w={340}
      styles={{ tooltip: { background: TOOLTIP_BG, border: TOOLTIP_BORDER, color: TOOLTIP_TEXT }, arrow: { borderColor: TOOLTIP_BG } }}
    >
      <span
        style={{
          height: SKILL_NODE_HEIGHT,
          left: `${getCoordinatePercent(position.column, TREE_COLUMNS, TREE_X_GUTTER_PERCENT)}%`,
          position: "absolute",
          top: `${getCoordinatePercent(position.row, TREE_ROWS, TREE_Y_GUTTER_PERCENT)}%`,
          transform: "translate(-50%, -50%)",
          width: SKILL_NODE_WIDTH
        }}
      >
        <button
          type="button"
          disabled={!canSpend}
          onClick={() => props.setState((previous) => spendWarriorSkillPoint(previous, skill.id, props.level))}
          style={{
            background: locked ? NODE_LOCKED_BG : NODE_BG,
            border: getNodeBorder(rank, locked),
            color: "#f3ead7",
            cursor: canSpend ? "pointer" : "default",
            height: "100%",
            opacity: locked ? LOCKED_NODE_OPACITY : 1,
            padding: 2,
            position: "relative",
            width: "100%"
          }}
        >
          <Stack align="center" gap={0} justify="center" style={{ height: "100%" }}>
            <SkillPixelIcon locked={locked} skillId={skill.id} />
          </Stack>
          <Box
            component="span"
            style={{
              alignItems: "center",
              background: "linear-gradient(180deg, #252026, #080708)",
              border: "1px solid #6d5a61",
              bottom: -8,
              boxShadow: "0 2px 0 #000",
              color: "#f1dfad",
              display: "flex",
              fontSize: 12,
              fontWeight: 900,
              height: RANK_BADGE_SIZE,
              justifyContent: "center",
              left: -8,
              lineHeight: 1,
              position: "absolute",
              width: RANK_BADGE_SIZE
            }}
          >
            {rank}
          </Box>
        </button>
      </span>
    </Tooltip>
  );
}

function hasSpentWarriorSkillPoints(state: StudyState) {
  return WARRIOR_SKILLS.some((skill) => getWarriorSkillRank(state.profile.skillRanks, skill.id) > 0);
}

function SkillSockets() {
  const sockets = [
    { column: 1, row: 1.75 },
    { column: 2, row: 1.75 },
    { column: 3, row: 1.75 },
    { column: 4, row: 1.75 },
    { column: 1, row: 3.35 },
    { column: 2, row: 3.35 },
    { column: 3, row: 3.35 },
    { column: 4, row: 3.35 },
    { column: 1, row: 5.25 },
    { column: 2, row: 5.25 },
    { column: 3, row: 5.25 },
    { column: 4, row: 5.25 }
  ];
  return (
    <>
      {sockets.map((socket) => (
        <Box
          key={`${socket.column}-${socket.row}`}
          style={{
            background: "linear-gradient(145deg, #060707, #11120f)",
            border: "1px solid #242522",
            boxShadow: "inset 0 0 0 2px #020202, 0 2px 3px rgba(0, 0, 0, 0.55)",
            height: EMPTY_SOCKET_SIZE,
            left: `${getCoordinatePercent(socket.column, TREE_COLUMNS, TREE_X_GUTTER_PERCENT)}%`,
            opacity: 0.58,
            position: "absolute",
            top: `${getCoordinatePercent(socket.row, TREE_ROWS, TREE_Y_GUTTER_PERCENT)}%`,
            transform: "translate(-50%, -50%)",
            width: EMPTY_SOCKET_SIZE
          }}
        />
      ))}
    </>
  );
}

function DependencyArrows(props: { arrows: SkillArrow[] }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height: "100%", inset: 0, overflow: "visible", pointerEvents: "none", position: "absolute", width: "100%" }}>
      <defs>
        <filter id="skill-arrow-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.55" floodColor="#b42050" floodOpacity="0.55" />
        </filter>
      </defs>
      {props.arrows.map((arrow) => {
        const from = getArrowPoint(arrow.from);
        const to = getArrowPoint(arrow.to);
        const color = arrow.active ? ARROW_COLOR : ARROW_LOCKED_COLOR;
        return (
          <path
            key={arrow.key}
            d={getArrowPath(from, to)}
            fill="none"
            filter={arrow.active ? "url(#skill-arrow-glow)" : undefined}
            stroke={color}
            strokeLinecap="round"
            strokeWidth={1.7}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

function SkillTooltip(props: { level: number; skill: (typeof WARRIOR_SKILLS)[number]; state: StudyState }) {
  const currentRank = getWarriorSkillRank(props.state.profile.skillRanks, props.skill.id);
  const breakdown = getWarriorSkillTooltipBreakdown(props.state.profile.skillRanks, props.skill.id);
  return (
    <Stack gap={5}>
      <Group justify="space-between" gap="xs">
        <Text size="sm" fw={900} c="blue.3" tt="uppercase">{props.skill.name}</Text>
        <Badge size="xs" color={props.level >= props.skill.levelRequired ? "blue" : "gray"} variant="light">Lvl {props.skill.levelRequired}</Badge>
      </Group>
      <Text size="xs" c="red.2" fw={700}>{props.skill.description}</Text>
      {breakdown.activeCost ? (
        <Stack gap={1}>
          <Text size="xs" c="red.2" fw={800}>Mana Cost: {breakdown.activeCost.mana}</Text>
          {breakdown.activeCost.health ? <Text size="xs" c="red.2" fw={800}>Life Cost: {breakdown.activeCost.health}</Text> : null}
        </Stack>
      ) : (
        <Text size="xs" c="green.3" fw={800}>Passive. No mana cost.</Text>
      )}
      <Text size="xs" c="gray.1" fw={800}>Current Skill Level: {currentRank} / {props.skill.maxRank}</Text>
      <SkillTooltipSection color="blue.2" lines={breakdown.effects} title="Current Effects" />
      <SkillTooltipSection color="green.3" lines={breakdown.receivesBonusesFrom} title="Receives Bonuses From" />
      <SkillTooltipSection color="yellow.3" lines={breakdown.grantsBonusesTo} title="Grants Bonuses To" />
      <Text size="xs" c="gray.3">{getRequirementText(props.state, props.skill, props.level)}</Text>
      <Progress size="xs" color="yellow" value={(currentRank / props.skill.maxRank) * PROGRESS_MAX} />
    </Stack>
  );
}

function SkillTooltipSection(props: { color: string; lines: string[]; title: string }) {
  if (!props.lines.length) {
    return null;
  }
  return (
    <Stack gap={1}>
      <Text size="xs" c={props.color} fw={900}>{props.title}:</Text>
      {props.lines.map((line) => (
        <Text key={line} size="xs" c={props.color}>{line}</Text>
      ))}
    </Stack>
  );
}

function SkillPixelIcon(props: { locked: boolean; skillId: WarriorSkillId }) {
  return <HeroSiegeSkillIcon locked={props.locked} skillId={props.skillId} size={SKILL_ICON_SIZE} />;
}

function getNodeBorder(rank: number, locked: boolean) {
  if (rank) {
    return NODE_ACTIVE_BORDER;
  }
  return locked ? NODE_LOCKED_BORDER : NODE_BORDER;
}

function getArrowPoint(position: SkillPosition) {
  return {
    x: getCoordinatePercent(position.column, TREE_COLUMNS, TREE_X_GUTTER_PERCENT),
    y: getCoordinatePercent(position.row, TREE_ROWS, TREE_Y_GUTTER_PERCENT)
  };
}

function getArrowPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  if (Math.abs(from.y - to.y) <= SAME_ROW_THRESHOLD) {
    const startX = offsetX(from.x, to.x);
    const endX = offsetX(to.x, from.x);
    return `M ${startX} ${from.y} L ${endX} ${to.y}`;
  }
  const startY = offsetY(from.y, to.y);
  const endY = offsetY(to.y, from.y);
  if (from.x === to.x) {
    return `M ${from.x} ${startY} L ${to.x} ${endY}`;
  }
  const startX = from.x;
  const endX = to.x;
  const midY = from.y + (to.y - from.y) / ARROW_MIDPOINT_DIVISOR;
  return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
}

function getCoordinatePercent(value: number, max: number, gutter: number) {
  return gutter + ((value - 1) / (max - 1)) * (PROGRESS_MAX - gutter * ARROW_MIDPOINT_DIVISOR);
}

function offsetX(value: number, target: number) {
  return target > value ? value + ARROW_NODE_X_OFFSET : value - ARROW_NODE_X_OFFSET;
}

function offsetY(value: number, target: number) {
  return target > value ? value + ARROW_NODE_Y_OFFSET : value - ARROW_NODE_Y_OFFSET;
}

function getSkillPosition(branch: WarriorSkillBranch, id: WarriorSkillId, fallbackRow: number): SkillPosition {
  return SKILL_LAYOUTS[branch][id] || { column: 2, row: fallbackRow };
}

function getSkillName(id: (typeof WARRIOR_SKILLS)[number]["id"]) {
  return WARRIOR_SKILLS.find((row) => row.id === id)?.name || id;
}

function getRequirementText(state: StudyState, skill: (typeof WARRIOR_SKILLS)[number], level: number) {
  const levelText = level >= skill.levelRequired ? "" : `Requires level ${skill.levelRequired}. `;
  const missing = (skill.requires || []).filter((id) => getWarriorSkillRank(state.profile.skillRanks, id) === 0).map(getSkillName);
  return `${levelText}${missing.length ? `Requires ${missing.join(", ")}.` : "Spend a skill point to unlock this rank."}`;
}

