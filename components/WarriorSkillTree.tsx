import { useState } from "react";

import { Badge, Box, Group, Progress, Stack, Tabs, Text, Tooltip } from "@mantine/core";

import { HeroSiegeSkillIcon } from "./HeroSiegeSkillIcon";
import { canSpendWarriorSkillPoint, getActiveWarriorSkillByTreeId, getAvailableWarriorSkillPoints, getWarriorSkillRank, spendWarriorSkillPoint, WARRIOR_SKILLS } from "../lib/skillCore";
import { getLevelProgress } from "../lib/studyCore";
import type { StudyState, WarriorSkillId } from "../types/study";

const BRANCH_ICONS = {
  "Combat Masteries": "swordMastery",
  "Combat Skills": "whirlwind",
  Warcries: "battleOrders"
} as const;
const TREE_BG = "radial-gradient(circle at 50% 10%, #34291f 0%, #191714 48%, #090909 100%)";
const TREE_BORDER = "2px solid #8a744c";
const NODE_BG = "linear-gradient(145deg, #18130d, #2d2519)";
const NODE_LOCKED_BG = "linear-gradient(145deg, #080808, #181818)";
const NODE_BORDER = "1px solid #7b6845";
const NODE_ACTIVE_BORDER = "1px solid #c8a96a";
const NODE_LOCKED_BORDER = "1px solid #3d3527";
const TOOLTIP_BG = "#12100d";
const TOOLTIP_BORDER = "1px solid #8a744c";
const TOOLTIP_TEXT = "#f3ead7";
const SKILL_BRANCHES = ["Combat Skills", "Combat Masteries", "Warcries"] as const;
const PROGRESS_MAX = 100;
const TREE_ROWS = 6;
const TREE_COLUMNS = 4;
const TREE_HEIGHT = 600;
const TREE_X_GUTTER_PERCENT = 14;
const TREE_Y_GUTTER_PERCENT = 8;
const SKILL_NODE_WIDTH = 118;
const SKILL_NODE_HEIGHT = 68;
const SKILL_ICON_SIZE = 30;
const LOCKED_NODE_OPACITY = 0.68;
const ARROW_COLOR = "#8a744c";
const ARROW_LOCKED_COLOR = "#433b2d";
const ARROW_MIDPOINT_DIVISOR = 2;
const ARROW_NODE_X_OFFSET = 7;
const ARROW_NODE_Y_OFFSET = 6.4;
const SAME_ROW_THRESHOLD = 0.2;

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
  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Box>
          <Text size="sm" fw={800}>Warrior Skill Tree</Text>
          <Text size="xs" c="dimmed">Level {level} warrior</Text>
        </Box>
        <Badge color={availablePoints > 0 ? "yellow" : "gray"} variant="light">{availablePoints} skill points</Badge>
      </Group>
      <Box p="md" style={{ background: TREE_BG, border: TREE_BORDER, boxShadow: "inset 0 0 0 2px #111" }}>
        <Tabs value={activeBranch} onChange={(value) => value && setActiveBranch(value as WarriorSkillBranch)} keepMounted={false}>
          <Tabs.List grow mb="md" style={{ borderColor: "#6b5736" }}>
            {SKILL_BRANCHES.map((branch) => {
              return (
                <Tabs.Tab key={branch} value={branch} leftSection={<HeroSiegeSkillIcon skillId={BRANCH_ICONS[branch]} size={20} />}>
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
    <Box style={{ overflow: "hidden" }}>
      <Box style={{ height: TREE_HEIGHT, position: "relative", width: "100%" }}>
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
      w={260}
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
            padding: 6,
            width: "100%"
          }}
        >
          <Stack align="center" gap={4}>
            <SkillPixelIcon locked={locked} skillId={skill.id} />
            <Text component="span" size="xs" fw={800} lh={1.05} ta="center" c={locked ? "dimmed" : "gray.1"}>{skill.name}</Text>
            <Badge size="xs" color={rank ? "yellow" : "gray"} variant="light">{rank}/{skill.maxRank}</Badge>
          </Stack>
        </button>
      </span>
    </Tooltip>
  );
}

function DependencyArrows(props: { arrows: SkillArrow[] }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height: "100%", inset: 0, overflow: "visible", pointerEvents: "none", position: "absolute", width: "100%" }}>
      <defs>
        <marker id="skill-arrow-active" markerHeight="5" markerWidth="5" orient="auto" refX="4" refY="2.5">
          <path d="M0,0 L5,2.5 L0,5 Z" fill={ARROW_COLOR} />
        </marker>
        <marker id="skill-arrow-locked" markerHeight="5" markerWidth="5" orient="auto" refX="4" refY="2.5">
          <path d="M0,0 L5,2.5 L0,5 Z" fill={ARROW_LOCKED_COLOR} />
        </marker>
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
            markerEnd={`url(#${arrow.active ? "skill-arrow-active" : "skill-arrow-locked"})`}
            stroke={color}
            strokeLinecap="round"
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

function SkillTooltip(props: { level: number; skill: (typeof WARRIOR_SKILLS)[number]; state: StudyState }) {
  return (
    <Stack gap={4}>
      <Group justify="space-between" gap="xs">
        <Text size="sm" fw={800}>{props.skill.name}</Text>
        <Badge size="xs" color={props.level >= props.skill.levelRequired ? "blue" : "gray"} variant="light">Lvl {props.skill.levelRequired}</Badge>
      </Group>
      <Text size="xs">{props.skill.description}</Text>
      <SkillCostText skillId={props.skill.id} />
      {props.skill.synergy && <Text size="xs" c="yellow.3">{props.skill.synergy}</Text>}
      <Text size="xs" c="gray.3">{getRequirementText(props.state, props.skill, props.level)}</Text>
      <Progress size="xs" color="yellow" value={(getWarriorSkillRank(props.state.profile.skillRanks, props.skill.id) / props.skill.maxRank) * PROGRESS_MAX} />
    </Stack>
  );
}

function SkillCostText(props: { skillId: WarriorSkillId }) {
  const active = getActiveWarriorSkillByTreeId(props.skillId);
  return active ? <Text size="xs" c="blue.3">Active. Costs {active.cost} mana when used from the toolbar.</Text> : <Text size="xs" c="green.3">Passive. No mana cost.</Text>;
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

