import type { CharacterStatKey, EquipmentSlot } from "../types/study";

export const ITEM_BASE_NAMES: Record<EquipmentSlot, string[]> = {
  mainHand: [
    "Short Sword", "Scimitar", "Sabre", "Falchion", "Crystal Blade", "Broad Sword", "Rune Sword", "Ancient Sword",
    "War Axe", "Battle Axe", "Great Axe", "Cleaver", "Double Axe", "Tabar", "Gothic Axe", "Champion Axe",
    "Mace", "Morning Star", "Flail", "War Hammer", "Maul", "Great Maul", "Cudgel", "Devil Star",
    "Spear", "Pike", "Lance", "War Staff", "Rune Staff", "Grim Wand"
  ],
  offHand: [
    "Buckler", "Small Shield", "Kite Shield", "Tower Shield", "Gothic Shield", "Bone Shield", "Spiked Shield", "Round Shield",
    "Scutum", "Dragon Shield", "Monarch Guard", "Aegis", "Ward", "Defender", "Heater", "Pavise",
    "Targe", "Rondache", "Vortex Ward", "Totem", "Fetish", "Shrunken Head", "Demon Crest", "Spirit Ward",
    "Orb", "Globe", "Eagle Orb", "Sacred Globe", "Clasped Orb", "Dragon Stone"
  ],
  headgear: [
    "Cap", "Skull Cap", "Helm", "Full Helm", "Great Helm", "Crown", "Mask", "Bone Helm",
    "War Hat", "Sallet", "Casque", "Basinet", "Winged Helm", "Grim Helm", "Death Mask", "Demonhead",
    "Circlet", "Coronet", "Tiara", "Diadem", "Horned Helm", "Rage Mask", "Fury Visor", "Destroyer Helm",
    "Totemic Mask", "Spirit Mask", "Alpha Helm", "Falcon Mask", "Sun Crown", "Dread Visage"
  ],
  armor: [
    "Quilted Armor", "Leather Armor", "Hard Leather", "Studded Leather", "Ring Mail", "Scale Mail", "Chain Mail", "Splint Mail",
    "Breast Plate", "Plate Mail", "Field Plate", "Gothic Plate", "Full Plate", "Ancient Armor", "Light Plate", "Mage Plate",
    "Sharkskin Armor", "Serpentskin Armor", "Demonhide Armor", "Trellised Armor", "Cuirass", "Russet Armor", "Templar Coat", "Hellforge Plate",
    "Archon Plate", "Kraken Shell", "Sacred Armor", "Shadow Plate", "Wire Fleece", "Dusk Shroud"
  ],
  headAccessory: [
    "Ruby Circlet", "Sapphire Circlet", "Emerald Circlet", "Topaz Circlet", "Amethyst Circlet", "Skull Circlet", "Rune Circlet", "Moon Circlet",
    "Sun Circlet", "Blood Circlet", "Storm Circlet", "Dragon Circlet", "Wraith Circlet", "Grim Circlet", "Saintly Circlet", "Viper Circlet",
    "Eagle Circlet", "Raven Circlet", "Doom Circlet", "Dread Circlet", "Bitter Circlet", "Ghoul Circlet", "Havoc Circlet", "Plague Circlet",
    "Carrion Circlet", "Dire Circlet", "Glyph Circlet", "Chaos Circlet", "Rune Band", "Jewel Crest"
  ],
  eyewear: [
    "Seer Lens", "Sage Lens", "Oracle Lens", "Runic Lens", "Demon Lens", "Spectral Lens", "Grim Lens", "Moon Lens",
    "Sun Lens", "Dragon Lens", "Crystal Lens", "Amber Lens", "Obsidian Lens", "Silver Lens", "Golden Lens", "Blood Lens",
    "Storm Lens", "Viper Lens", "Raven Lens", "Eagle Lens", "Dread Lens", "Wraith Lens", "Arcane Lens", "Mystic Lens",
    "Farsight Lens", "Night Lens", "Abyss Lens", "Glyph Lens", "Bone Lens", "Chaos Lens"
  ],
  bodyAccessory: [
    "Sash", "Light Belt", "Belt", "Heavy Belt", "Plated Belt", "Demonhide Sash", "Sharkskin Belt", "Mesh Belt",
    "Battle Belt", "War Belt", "Vambraces", "Heavy Bracers", "Chain Gloves", "Light Gauntlets", "Gauntlets", "War Gauntlets",
    "Demonhide Gloves", "Sharkskin Gloves", "Heavy Gloves", "Vampirebone Gloves", "Bramble Mitts", "Crusader Gauntlets", "Ogre Gauntlets", "Wyrmhide Gloves"
  ],
  backAccessory: [
    "Traveler Cloak", "Raven Cloak", "Wolf Cloak", "Serpent Cloak", "Demon Cloak", "Wraith Cloak", "Moon Cloak", "Sun Cloak",
    "Grim Cloak", "Rune Cloak", "Dragon Mantle", "Storm Mantle", "Blood Mantle", "Dread Mantle", "Ghoul Mantle", "Plague Mantle",
    "Saintly Mantle", "Eagle Mantle", "Viper Mantle", "Chaos Mantle", "Bone Mantle", "Shadow Mantle", "Abyss Mantle", "Arcane Mantle",
    "War Cape", "Great Cape", "Ancient Cape", "Mystic Cape", "Doom Cape", "Havoc Cape"
  ],
  feet: [
    "Boots", "Heavy Boots", "Chain Boots", "Light Plated Boots", "Greaves", "War Boots", "Demonhide Boots", "Sharkskin Boots",
    "Mesh Boots", "Battle Boots", "Mirrored Boots", "Wyrmhide Boots", "Scarabshell Boots", "Boneweave Boots", "Myrmidon Greaves", "Sabatons",
    "Sigon's Sabot", "Vidala's Fetlock", "Goblin Toe", "Treads of Cthon", "Infernostride", "Waterwalk", "Silkweave", "War Traveler",
    "Gore Rider", "Sandstorm Trek", "Marrowwalk", "Shadow Dancer", "Aldur's Advance", "Natalya's Soul"
  ]
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

export const ITEM_NAME_POOL_COUNT = Object.values(ITEM_BASE_NAMES).reduce((total, names) => total + names.length, 0);
