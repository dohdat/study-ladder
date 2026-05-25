import type { EnemyDebuff, EnemyDebuffId } from "../types/study";

const DEFAULT_STACKS = 1;
const DEFAULT_SUBMITS = 2;
const MAX_STACKS = 6;
const MIN_SUBMITS = 1;
const MAX_SUBMITS = 5;

export type EnemyDebuffApplication = {
  id: EnemyDebuffId;
  remainingSubmits?: number;
  stacks?: number;
};

export type EnemyDebuffDefinition = {
  color: string;
  description: string;
  label: string;
};

export const ENEMY_DEBUFF_DEFINITIONS: Record<EnemyDebuffId, EnemyDebuffDefinition> = {
  vulnerable: {
    color: "#ff9b4a",
    description: "Takes more submit damage.",
    label: "Vulnerable"
  },
  weak: {
    color: "#b987ff",
    description: "Deals less damage.",
    label: "Weak"
  }
};

export function normalizeEnemyDebuffs(debuffs: EnemyDebuff[] | undefined): EnemyDebuff[] {
  return mergeEnemyDebuffs(debuffs || []);
}

export function cloneEnemyDebuffs(debuffs: EnemyDebuff[] | undefined): EnemyDebuff[] {
  return normalizeEnemyDebuffs(debuffs).map((debuff) => ({ ...debuff }));
}

export function mergeEnemyDebuffs(debuffs: EnemyDebuffApplication[]): EnemyDebuff[] {
  const merged = new Map<EnemyDebuffId, EnemyDebuff>();
  for (const raw of debuffs) {
    if (!raw?.id || !ENEMY_DEBUFF_DEFINITIONS[raw.id]) {
      continue;
    }
    const incoming: EnemyDebuff = {
      id: raw.id,
      remainingSubmits: clampSubmits(raw.remainingSubmits ?? DEFAULT_SUBMITS),
      stacks: clampStacks(raw.stacks ?? DEFAULT_STACKS)
    };
    const existing = merged.get(raw.id);
    if (!existing) {
      merged.set(raw.id, incoming);
      continue;
    }
    merged.set(raw.id, {
      id: raw.id,
      remainingSubmits: Math.max(existing.remainingSubmits, incoming.remainingSubmits),
      stacks: clampStacks(existing.stacks + incoming.stacks)
    });
  }
  return [...merged.values()].sort((a, b) => getDebuffSortValue(a.id) - getDebuffSortValue(b.id));
}

export function addEnemyDebuffs(current: EnemyDebuff[] | undefined, additions: EnemyDebuffApplication[]) {
  return mergeEnemyDebuffs([...normalizeEnemyDebuffs(current), ...additions]);
}

export function tickEnemyDebuffs(current: EnemyDebuff[] | undefined, ids: EnemyDebuffId[]) {
  const ticking = new Set(ids);
  return normalizeEnemyDebuffs(current)
    .map((debuff) => ticking.has(debuff.id) ? { ...debuff, remainingSubmits: debuff.remainingSubmits - 1 } : debuff)
    .filter((debuff) => debuff.remainingSubmits > 0);
}

export function getEnemyDebuffStacks(debuffs: EnemyDebuff[] | undefined, id: EnemyDebuffId) {
  return normalizeEnemyDebuffs(debuffs).find((debuff) => debuff.id === id)?.stacks || 0;
}

export function getEnemyDebuffDescription(debuff: EnemyDebuff) {
  const definition = ENEMY_DEBUFF_DEFINITIONS[debuff.id];
  return `${definition.description} ${debuff.remainingSubmits} ${debuff.remainingSubmits === 1 ? "submit" : "submits"} left.`;
}

export function formatEnemyDebuff(debuff: EnemyDebuffApplication | EnemyDebuff) {
  const stacks = debuff.stacks && debuff.stacks > 1 ? ` ${debuff.stacks}` : "";
  return `${ENEMY_DEBUFF_DEFINITIONS[debuff.id].label}${stacks}`;
}

function clampStacks(value: number) {
  return Math.max(1, Math.min(MAX_STACKS, Math.floor(Number.isFinite(value) ? value : DEFAULT_STACKS)));
}

function clampSubmits(value: number) {
  return Math.max(MIN_SUBMITS, Math.min(MAX_SUBMITS, Math.floor(Number.isFinite(value) ? value : DEFAULT_SUBMITS)));
}

function getDebuffSortValue(id: EnemyDebuffId) {
  return ["vulnerable", "weak"].indexOf(id);
}
