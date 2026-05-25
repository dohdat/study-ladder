import type { PlayerDebuff, PlayerDebuffId } from "../types/study";

const DEFAULT_STACKS = 1;
const DEFAULT_SUBMITS = 2;
const MAX_STACKS = 12;
const MIN_SUBMITS = 1;
const MAX_SUBMITS = 4;

export type PlayerDebuffApplication = {
  id: PlayerDebuffId;
  permanent?: boolean;
  remainingSubmits?: number;
  stacks?: number;
};

export type PlayerDebuffDefinition = {
  color: string;
  description: string;
  label: string;
};

export const PLAYER_DEBUFF_DEFINITIONS: Record<PlayerDebuffId, PlayerDebuffDefinition> = {
  confused: {
    color: "#f0df5f",
    description: "Correct-submit damage rolls between 70% and 130%, and hint costs are less predictable.",
    label: "Confused"
  },
  constricted: {
    color: "#d7b56d",
    description: "Incoming hits deal extra damage until the bind wears off.",
    label: "Constricted"
  },
  frail: {
    color: "#73c7ff",
    description: "Healing and enemy-damage mitigation are weaker.",
    label: "Frail"
  },
  hex: {
    color: "#ff4d8d",
    description: "Hints cost more while the curse is active.",
    label: "Hex"
  },
  parasite: {
    color: "#b56bff",
    description: "A run curse that reduces rewards until the run ends.",
    label: "Parasite"
  },
  slimed: {
    color: "#7cff7c",
    description: "The timer starts shorter while this sticky status is active.",
    label: "Slimed"
  },
  vulnerable: {
    color: "#ff4d4d",
    description: "Incoming monster damage is increased.",
    label: "Vulnerable"
  },
  weak: {
    color: "#c084fc",
    description: "Correct-submit damage is reduced.",
    label: "Weak"
  }
};

export function normalizePlayerDebuffs(debuffs: PlayerDebuff[] | undefined): PlayerDebuff[] {
  return mergePlayerDebuffs(debuffs || []);
}

export function clonePlayerDebuffs(debuffs: PlayerDebuff[] | undefined): PlayerDebuff[] {
  return normalizePlayerDebuffs(debuffs).map((debuff) => ({ ...debuff }));
}

export function mergePlayerDebuffs(debuffs: PlayerDebuffApplication[]): PlayerDebuff[] {
  const merged = new Map<PlayerDebuffId, PlayerDebuff>();
  for (const raw of debuffs) {
    if (!raw?.id || !PLAYER_DEBUFF_DEFINITIONS[raw.id]) {
      continue;
    }
    const stacks = clampStacks(raw.stacks ?? DEFAULT_STACKS);
    const permanent = Boolean(raw.permanent || raw.id === "parasite");
    const remainingSubmits = permanent ? undefined : clampSubmits(raw.remainingSubmits ?? DEFAULT_SUBMITS);
    const existing = merged.get(raw.id);
    if (!existing) {
      merged.set(raw.id, { id: raw.id, permanent, remainingSubmits, stacks });
      continue;
    }
    merged.set(raw.id, {
      id: raw.id,
      permanent: existing.permanent || permanent,
      remainingSubmits: existing.permanent || permanent ? undefined : Math.max(existing.remainingSubmits || MIN_SUBMITS, remainingSubmits || MIN_SUBMITS),
      stacks: clampStacks(existing.stacks + stacks)
    });
  }
  return [...merged.values()].sort((a, b) => getDebuffSortValue(a.id) - getDebuffSortValue(b.id));
}

export function addPlayerDebuffs(current: PlayerDebuff[] | undefined, additions: PlayerDebuffApplication[]) {
  return mergePlayerDebuffs([...normalizePlayerDebuffs(current), ...additions]);
}

export function tickPlayerDebuffsAfterSubmit(current: PlayerDebuff[] | undefined) {
  return normalizePlayerDebuffs(current)
    .map((debuff) => {
      if (debuff.permanent) {
        return debuff;
      }
      return { ...debuff, remainingSubmits: (debuff.remainingSubmits || MIN_SUBMITS) - 1 };
    })
    .filter((debuff) => debuff.permanent || (debuff.remainingSubmits || 0) > 0);
}

export function getPlayerDebuffStacks(debuffs: PlayerDebuff[] | undefined, id: PlayerDebuffId) {
  return normalizePlayerDebuffs(debuffs).find((debuff) => debuff.id === id)?.stacks || 0;
}

export function getPlayerDebuffLabel(id: PlayerDebuffId) {
  return PLAYER_DEBUFF_DEFINITIONS[id].label;
}

export function getPlayerDebuffDescription(debuff: PlayerDebuff) {
  const definition = PLAYER_DEBUFF_DEFINITIONS[debuff.id];
  const duration = debuff.permanent ? "Run curse" : `${debuff.remainingSubmits || 0} ${debuff.remainingSubmits === 1 ? "submit" : "submits"} left`;
  return `${definition.description} ${duration}.`;
}

export function formatPlayerDebuff(debuff: PlayerDebuffApplication | PlayerDebuff) {
  const stacks = debuff.stacks && debuff.stacks > 1 ? ` ${debuff.stacks}` : "";
  return `${getPlayerDebuffLabel(debuff.id)}${stacks}`;
}

function clampStacks(value: number) {
  return Math.max(1, Math.min(MAX_STACKS, Math.floor(Number.isFinite(value) ? value : DEFAULT_STACKS)));
}

function clampSubmits(value: number) {
  return Math.max(MIN_SUBMITS, Math.min(MAX_SUBMITS, Math.floor(Number.isFinite(value) ? value : DEFAULT_SUBMITS)));
}

function getDebuffSortValue(id: PlayerDebuffId) {
  return ["vulnerable", "weak", "frail", "hex", "slimed", "constricted", "confused", "parasite"].indexOf(id);
}
