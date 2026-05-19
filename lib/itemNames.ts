import type { CharacterStatKey, EquipmentSlot } from "../types/study";
import { HERO_SIEGE_ITEM_NAME_COUNT, HERO_SIEGE_ITEM_NAMES_BY_SLOT } from "./heroSiegeItemCatalog";

export const ITEM_BASE_NAMES: Record<EquipmentSlot, string[]> = {
  ...HERO_SIEGE_ITEM_NAMES_BY_SLOT,
  ringTwo: HERO_SIEGE_ITEM_NAMES_BY_SLOT.eyewear
};

export const STAT_NAME_AFFIXES: Record<CharacterStatKey, { prefixes: string[]; suffixes: string[] }> = {
  constitution: {
    prefixes: ["Stalwart", "Rugged", "Dragon", "Saintly", "Titan", "Iron", "Stone", "Guardian"],
    suffixes: ["of the Bear", "of the Titan", "of Stability", "of Defiance", "of the Whale", "of the Colossus"]
  },
  intelligence: {
    prefixes: ["Mystic", "Arcane", "Sage", "Glyph", "Rune", "Oracle", "Celestial", "Eldritch"],
    suffixes: ["of the Magus", "of Wizardry", "of the Mind", "of Sorcery", "of Enlightenment", "of the Archmage"]
  },
  perception: {
    prefixes: ["Keen", "Eagle", "Raven", "Viper", "Hawkeye", "Seeker", "Farsight", "Amber"],
    suffixes: ["of Fortune", "of the Fox", "of Precision", "of Luck", "of the Eagle", "of Discovery"]
  },
  strength: {
    prefixes: ["Brutal", "Cruel", "Savage", "Berserker", "King's", "Ferocious", "Merciless", "Blood"],
    suffixes: ["of the Tiger", "of Carnage", "of Slaying", "of the Giant", "of Might", "of Evisceration"]
  }
};

export const RARE_NAME_WORDS = [
  "Bitter", "Blood", "Bone", "Carrion", "Chaos", "Demon", "Dire", "Doom", "Dread", "Eagle",
  "Ghoul", "Glyph", "Grim", "Havoc", "Plague", "Raven", "Rune", "Shadow", "Skull", "Soul",
  "Storm", "Viper", "Wraith", "Wrath"
];

export const ITEM_NAME_POOL_COUNT = HERO_SIEGE_ITEM_NAME_COUNT;
