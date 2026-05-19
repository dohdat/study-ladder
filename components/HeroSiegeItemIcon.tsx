import { Box } from "@mantine/core";
type StaticImageData = string;

import amuletArt from "../assets/hero_siege_items/amulet.png";
import armorArt from "../assets/hero_siege_items/armor.png";
import beltArt from "../assets/hero_siege_items/belt.png";
import bootsArt from "../assets/hero_siege_items/boots.png";
import charmRelicArt from "../assets/hero_siege_items/relic-charm.png";
import chestArt from "../assets/hero_siege_items/item-reward.png";
import glovesArt from "../assets/hero_siege_items/gloves.png";
import healthPotionArt from "../assets/hero_siege_items/health-potion.png";
import helmetArt from "../assets/hero_siege_items/helmet.png";
import manaPotionArt from "../assets/hero_siege_items/mana-potion.png";
import relicGlyphArt from "../assets/hero_siege_items/relic-glyph.png";
import relicOrbArt from "../assets/hero_siege_items/relic-orb.png";
import ringArt from "../assets/hero_siege_items/ring.png";
import shieldArt from "../assets/hero_siege_items/shield.png";
import swordArt from "../assets/hero_siege_items/weapon-sword.png";
import axeArt from "../assets/hero_siege_items/weapon-axe.png";
import aaronsStaffRelicArt from "../assets/hero_siege_relics/aarons-staff.png";
import allmightyFedoraRelicArt from "../assets/hero_siege_relics/allmighty-fedora.png";
import amazonsSpearsRelicArt from "../assets/hero_siege_relics/amazons-spears.png";
import amputationKitRelicArt from "../assets/hero_siege_relics/amputation-kit.png";
import ancientRockRelicArt from "../assets/hero_siege_relics/ancient-rock.png";
import angelStaffRelicArt from "../assets/hero_siege_relics/angel-staff.png";
import appleRelicArt from "../assets/hero_siege_relics/apple.png";
import balalaykaRelicArt from "../assets/hero_siege_relics/balalayka.png";
import barbedShieldRelicArt from "../assets/hero_siege_relics/barbed-shield.png";
import basiliskToothRelicArt from "../assets/hero_siege_relics/basilisk-tooth.png";
import blazingBootsRelicArt from "../assets/hero_siege_relics/blazing-boots.png";
import bombRelicArt from "../assets/hero_siege_relics/bomb.png";
import bonsaiTreeRelicArt from "../assets/hero_siege_relics/bonsai-tree.png";
import bookOfBelialRelicArt from "../assets/hero_siege_relics/book-of-belial.png";
import boomerangRelicArt from "../assets/hero_siege_relics/boomerang.png";
import bouncyRelicArt from "../assets/hero_siege_relics/bouncy.png";
import bossGemstoneOdinRelicArt from "../assets/hero_siege_relics/boss-gemstone-odin.png";
import bossGemstoneSatanRelicArt from "../assets/hero_siege_relics/boss-gemstone-satan.png";
import bracerLifeRelicArt from "../assets/hero_siege_relics/bracer-life.png";
import butterflyKnifeRelicArt from "../assets/hero_siege_relics/butterfly-knife.png";
import butchersKnifeRelicArt from "../assets/hero_siege_relics/butchers-knife.png";
import cactusRelicArt from "../assets/hero_siege_relics/cactus.png";
import cakeRelicArt from "../assets/hero_siege_relics/cake.png";
import candyCrusherRelicArt from "../assets/hero_siege_relics/candy-crusher.png";
import casinoDiceRelicArt from "../assets/hero_siege_relics/casino-dice.png";
import charmedBloodRelicArt from "../assets/hero_siege_relics/charmed-blood.png";
import cheeseBurgerRelicArt from "../assets/hero_siege_relics/cheese-burger.png";
import commandersSwordRelicArt from "../assets/hero_siege_relics/commanders-sword.png";
import cookiesMilkRelicArt from "../assets/hero_siege_relics/cookies-milk.png";
import damnedBucklerRelicArt from "../assets/hero_siege_relics/damned-buckler.png";
import deathsScytheRelicArt from "../assets/hero_siege_relics/deaths-scythe.png";
import deliciousPieRelicArt from "../assets/hero_siege_relics/delicious-pie.png";
import devilHornRelicArt from "../assets/hero_siege_relics/devil-horn.png";
import devilSkullRelicArt from "../assets/hero_siege_relics/devil-skull.png";
import dislocatedEyeRelicArt from "../assets/hero_siege_relics/dislocated-eye.png";
import dirgeRelicArt from "../assets/hero_siege_relics/dirge.png";
import doomFluteRelicArt from "../assets/hero_siege_relics/doom-flute.png";
import dragonShieldRelicArt from "../assets/hero_siege_relics/dragon-shield.png";
import dragonsHeadRelicArt from "../assets/hero_siege_relics/dragons-head.png";
import esEnergyRelicArt from "../assets/hero_siege_relics/es-energy.png";
import fetusRelicArt from "../assets/hero_siege_relics/fetus.png";
import fireIceRelicArt from "../assets/hero_siege_relics/fire-ice.png";
import flailRelicArt from "../assets/hero_siege_relics/flail.png";
import flySwatterRelicArt from "../assets/hero_siege_relics/fly-swatter.png";
import fortuneCardRelicArt from "../assets/hero_siege_relics/fortune-card.png";
import frostmourneRelicArt from "../assets/hero_siege_relics/frostmourne.png";
import frozenOrbRelicArt from "../assets/hero_siege_relics/frozen-orb.png";
import gemAngelicRelicArt from "../assets/hero_siege_relics/gem-angelic.png";
import gemChaosRelicArt from "../assets/hero_siege_relics/gem-chaos.png";
import gemMoonstoneRelicArt from "../assets/hero_siege_relics/gem-moonstone.png";
import gloveRelicArt from "../assets/hero_siege_relics/glove.png";
import guardianAngelRelicArt from "../assets/hero_siege_relics/guardian-angel.png";
import halfEatenMochiRelicArt from "../assets/hero_siege_relics/half-eaten-mochi.png";
import hellscreamAxeRelicArt from "../assets/hero_siege_relics/hellscream-axe.png";
import holyBibleRelicArt from "../assets/hero_siege_relics/holy-bible.png";
import holyGrailRelicArt from "../assets/hero_siege_relics/holy-grail.png";
import honeyBeeRelicArt from "../assets/hero_siege_relics/honey-bee.png";
import hornedMaskRelicArt from "../assets/hero_siege_relics/horned-mask.png";
import jarOfFliesRelicArt from "../assets/hero_siege_relics/jar-of-flies.png";
import jungleVialRelicArt from "../assets/hero_siege_relics/jungle-vial.png";
import kingsCrownRelicArt from "../assets/hero_siege_relics/kings-crown.png";
import lanternRelicArt from "../assets/hero_siege_relics/lantern.png";
import largeBeerRelicArt from "../assets/hero_siege_relics/large-beer.png";
import lightKatanaRelicArt from "../assets/hero_siege_relics/light-katana.png";
import lightColaRelicArt from "../assets/hero_siege_relics/light-cola.png";
import lightningGlobeRelicArt from "../assets/hero_siege_relics/lightning-globe.png";
import lootarangRelicArt from "../assets/hero_siege_relics/lootarang.png";
import magicMushroomRelicArt from "../assets/hero_siege_relics/magic-mushroom.png";
import magnetRelicArt from "../assets/hero_siege_relics/magnet.png";
import manaDicesRelicArt from "../assets/hero_siege_relics/mana-dices.png";
import maryosPipeRelicArt from "../assets/hero_siege_relics/maryos-pipe.png";
import meatHookRelicArt from "../assets/hero_siege_relics/meat-hook.png";
import metalDetectorRelicArt from "../assets/hero_siege_relics/metal-detector.png";
import midasHandRelicArt from "../assets/hero_siege_relics/midas-hand.png";
import mightySushiRelicArt from "../assets/hero_siege_relics/mighty-sushi.png";
import nunchucksRelicArt from "../assets/hero_siege_relics/nunchucks.png";
import necromancersFingerRelicArt from "../assets/hero_siege_relics/necromancers-finger.png";
import oddBookRelicArt from "../assets/hero_siege_relics/odd-book.png";
import ogreClubRelicArt from "../assets/hero_siege_relics/ogre-club.png";
import orbOfChaosRelicArt from "../assets/hero_siege_relics/orb-of-chaos.png";
import orbOfFireRelicArt from "../assets/hero_siege_relics/orb-of-fire.png";
import orbOfIceRelicArt from "../assets/hero_siege_relics/orb-of-ice.png";
import orbOfPoisonRelicArt from "../assets/hero_siege_relics/orb-of-poison.png";
import pickledBrainRelicArt from "../assets/hero_siege_relics/pickled-brain.png";
import rainbowGateRelicArt from "../assets/hero_siege_relics/rainbow-gate.png";
import razerBladeRelicArt from "../assets/hero_siege_relics/razer-blade.png";
import razorwireRelicArt from "../assets/hero_siege_relics/razorwire.png";
import rockBeltRelicArt from "../assets/hero_siege_relics/rock-belt.png";
import rocketBarrageRelicArt from "../assets/hero_siege_relics/rocket-barrage.png";
import rottenAppleRelicArt from "../assets/hero_siege_relics/rotten-apple.png";
import rubberDuckRelicArt from "../assets/hero_siege_relics/rubber-duck.png";
import satansEyeRelicArt from "../assets/hero_siege_relics/satans-eye.png";
import satansHornRelicArt from "../assets/hero_siege_relics/satans-horn.png";
import satansToothRelicArt from "../assets/hero_siege_relics/satans-tooth.png";
import shivRelicArt from "../assets/hero_siege_relics/shiv.png";
import shurikenRelicArt from "../assets/hero_siege_relics/shuriken.png";
import skullAxeRelicArt from "../assets/hero_siege_relics/skull-axe.png";
import snowballRelicArt from "../assets/hero_siege_relics/snowball-relic.png";
import soulBoxRelicArt from "../assets/hero_siege_relics/soul-box.png";
import spiritSkullRelicArt from "../assets/hero_siege_relics/spirit-skull.png";
import squishyRelicArt from "../assets/hero_siege_relics/squishy.png";
import steamSaleRelicArt from "../assets/hero_siege_relics/steam-sale.png";
import stormDaggerRelicArt from "../assets/hero_siege_relics/storm-dagger.png";
import symbolOfSunRelicArt from "../assets/hero_siege_relics/symbol-of-sun.png";
import templarShieldRelicArt from "../assets/hero_siege_relics/templar-shield.png";
import theEyeRelicArt from "../assets/hero_siege_relics/the-eye.png";
import tokenLuckRelicArt from "../assets/hero_siege_relics/token-luck.png";
import triforceRelicArt from "../assets/hero_siege_relics/triforce.png";
import vadjraRelicArt from "../assets/hero_siege_relics/vadjra.png";
import wizardsHatRelicArt from "../assets/hero_siege_relics/wizards-hat.png";
import zombiesFaceRelicArt from "../assets/hero_siege_relics/zombies-face.png";
import { getHeroSiegeQualityColor, getItemQuality, getRelicQualityLabel, ITEM_RARITY_TO_QUALITY } from "../lib/heroSiegeQuality";
import { RELIC_DEFINITIONS } from "../lib/relicCore";
import type { EquipmentSlot, InventoryItem, ItemRarity, Relic, ShopItem } from "../types/study";

const DEFAULT_ICON_SIZE = 34;
const DEFAULT_RELIC_ICON_SIZE = 36;
const DEFAULT_SHOP_ICON_SIZE = 58;
const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const ITEM_ICON_PADDING = 3;
const ITEM_IMAGE_SCALE = "82%";
const ITEM_FRAME_BG = "radial-gradient(circle at 45% 28%, rgba(68, 55, 34, 0.98), rgba(9, 8, 7, 0.98) 72%)";
const ITEM_FRAME_SHADOW = "inset 0 0 0 1px rgba(0, 0, 0, 0.82), 0 3px 8px rgba(0, 0, 0, 0.4)";

export const HERO_ITEM_RARITY_COLORS: Record<ItemRarity, string> = {
  common: getHeroSiegeQualityColor(ITEM_RARITY_TO_QUALITY.common),
  epic: getHeroSiegeQualityColor(ITEM_RARITY_TO_QUALITY.epic),
  legendary: getHeroSiegeQualityColor(ITEM_RARITY_TO_QUALITY.legendary),
  rare: getHeroSiegeQualityColor(ITEM_RARITY_TO_QUALITY.rare),
  uncommon: getHeroSiegeQualityColor(ITEM_RARITY_TO_QUALITY.uncommon)
} as const;

const EQUIPMENT_ASSETS: Record<EquipmentSlot, StaticImageData> = {
  armor: armorArt,
  backAccessory: beltArt,
  bodyAccessory: glovesArt,
  eyewear: ringArt,
  feet: bootsArt,
  headAccessory: amuletArt,
  headgear: helmetArt,
  mainHand: swordArt,
  offHand: shieldArt,
  ringTwo: ringArt
};

const RELIC_FALLBACK_ASSETS = [
  relicOrbArt,
  relicGlyphArt,
  charmRelicArt,
  chestArt,
  healthPotionArt,
  manaPotionArt,
  aaronsStaffRelicArt,
  amazonsSpearsRelicArt,
  allmightyFedoraRelicArt,
  amputationKitRelicArt,
  ancientRockRelicArt,
  angelStaffRelicArt,
  appleRelicArt,
  balalaykaRelicArt,
  barbedShieldRelicArt,
  basiliskToothRelicArt,
  blazingBootsRelicArt,
  bombRelicArt,
  bonsaiTreeRelicArt,
  bookOfBelialRelicArt,
  boomerangRelicArt,
  bouncyRelicArt,
  bossGemstoneOdinRelicArt,
  bossGemstoneSatanRelicArt,
  bracerLifeRelicArt,
  butterflyKnifeRelicArt,
  butchersKnifeRelicArt,
  cactusRelicArt,
  cakeRelicArt,
  candyCrusherRelicArt,
  casinoDiceRelicArt,
  charmedBloodRelicArt,
  cheeseBurgerRelicArt,
  commandersSwordRelicArt,
  cookiesMilkRelicArt,
  damnedBucklerRelicArt,
  deathsScytheRelicArt,
  deliciousPieRelicArt,
  devilHornRelicArt,
  devilSkullRelicArt,
  dislocatedEyeRelicArt,
  dirgeRelicArt,
  doomFluteRelicArt,
  dragonShieldRelicArt,
  dragonsHeadRelicArt,
  esEnergyRelicArt,
  fetusRelicArt,
  fireIceRelicArt,
  flailRelicArt,
  flySwatterRelicArt,
  fortuneCardRelicArt,
  frostmourneRelicArt,
  frozenOrbRelicArt,
  gemAngelicRelicArt,
  gemChaosRelicArt,
  gemMoonstoneRelicArt,
  gloveRelicArt,
  guardianAngelRelicArt,
  halfEatenMochiRelicArt,
  hellscreamAxeRelicArt,
  holyBibleRelicArt,
  holyGrailRelicArt,
  honeyBeeRelicArt,
  hornedMaskRelicArt,
  jarOfFliesRelicArt,
  jungleVialRelicArt,
  kingsCrownRelicArt,
  lanternRelicArt,
  largeBeerRelicArt,
  lightColaRelicArt,
  lightKatanaRelicArt,
  lightningGlobeRelicArt,
  lootarangRelicArt,
  magicMushroomRelicArt,
  magnetRelicArt,
  manaDicesRelicArt,
  maryosPipeRelicArt,
  meatHookRelicArt,
  metalDetectorRelicArt,
  midasHandRelicArt,
  mightySushiRelicArt,
  necromancersFingerRelicArt,
  nunchucksRelicArt,
  oddBookRelicArt,
  ogreClubRelicArt,
  orbOfChaosRelicArt,
  orbOfFireRelicArt,
  orbOfIceRelicArt,
  orbOfPoisonRelicArt,
  pickledBrainRelicArt,
  rainbowGateRelicArt,
  razerBladeRelicArt,
  razorwireRelicArt,
  rockBeltRelicArt,
  rocketBarrageRelicArt,
  rottenAppleRelicArt,
  rubberDuckRelicArt,
  satansEyeRelicArt,
  satansHornRelicArt,
  satansToothRelicArt,
  shivRelicArt,
  shurikenRelicArt,
  skullAxeRelicArt,
  snowballRelicArt,
  soulBoxRelicArt,
  spiritSkullRelicArt,
  squishyRelicArt,
  steamSaleRelicArt,
  stormDaggerRelicArt,
  symbolOfSunRelicArt,
  templarShieldRelicArt,
  theEyeRelicArt,
  tokenLuckRelicArt,
  triforceRelicArt,
  vadjraRelicArt,
  wizardsHatRelicArt,
  zombiesFaceRelicArt
] as const;

const RELIC_ASSET_INDEXES = new Map(RELIC_DEFINITIONS.map((relic, index) => [getRelicAssetKey(relic), index]));

export function HeroSiegeEquipmentIcon(props: { item: InventoryItem; size?: number; unframed?: boolean }) {
  return (
    <FramedItemAsset
      asset={props.item.wikiImagePath || getEquipmentAsset(props.item)}
      borderColor={getHeroSiegeQualityColor(getItemQuality(props.item))}
      filter={props.item.wikiImageFilter}
      size={props.size || DEFAULT_ICON_SIZE}
      unframed={props.unframed}
    />
  );
}

export function HeroSiegePotionIcon(props: { size?: number; type: Extract<ShopItem, { kind: "consumable" }>["type"]; unframed?: boolean }) {
  return (
    <FramedItemAsset
      asset={getPotionAsset(props.type)}
      borderColor={getPotionBorderColor(props.type)}
      size={props.size || DEFAULT_SHOP_ICON_SIZE}
      unframed={props.unframed}
    />
  );
}

function getPotionAsset(type: Extract<ShopItem, { kind: "consumable" }>["type"]) {
  if (type === "health") {
    return healthPotionArt;
  }
  return manaPotionArt;
}

function getPotionBorderColor(type: Extract<ShopItem, { kind: "consumable" }>["type"]) {
  if (type === "health") {
    return "#e03131";
  }
  return type === "mana" ? "#228be6" : "#f59f00";
}

export function HeroSiegeRelicIcon(props: { relic: Relic; size?: number; unframed?: boolean }) {
  return (
    <FramedItemAsset
      asset={props.relic.wikiImagePath || getRelicAsset(props.relic)}
      borderColor={getHeroSiegeQualityColor(getRelicQualityLabel(props.relic.rarity, props.relic.wikiRarityLabel))}
      filter={props.relic.wikiImageFilter}
      size={props.size || DEFAULT_RELIC_ICON_SIZE}
      unframed={props.unframed}
    />
  );
}

export function HeroSiegeRewardItemIcon(props: { size?: number }) {
  return <FramedItemAsset asset={chestArt} borderColor="#d6a94b" size={props.size || DEFAULT_ICON_SIZE} unframed />;
}

function FramedItemAsset(props: { asset: StaticImageData; borderColor: string; filter?: string; size: number; unframed?: boolean }) {
  const asset = normalizeAssetPath(props.asset);
  return (
    <Box
      aria-hidden="true"
      style={{
        alignItems: "center",
        background: props.unframed ? "transparent" : ITEM_FRAME_BG,
        border: props.unframed ? "none" : `1px solid ${props.borderColor}`,
        boxShadow: props.unframed ? "none" : ITEM_FRAME_SHADOW,
        display: "flex",
        flex: `0 0 ${props.size}px`,
        height: props.size,
        justifyContent: "center",
        padding: props.unframed ? undefined : ITEM_ICON_PADDING,
        width: props.size
      }}
    >
      <Box
        alt=""
        component="img"
        src={asset}
        style={{
          display: "block",
          filter: `${props.filter ? `${props.filter} ` : ""}drop-shadow(0 2px 0 rgba(0, 0, 0, 0.72))`,
          height: props.unframed ? "100%" : undefined,
          imageRendering: "pixelated",
          maxHeight: props.unframed ? "100%" : ITEM_IMAGE_SCALE,
          maxWidth: props.unframed ? "100%" : ITEM_IMAGE_SCALE,
          objectFit: "contain",
          width: props.unframed ? "100%" : undefined
        }}
      />
    </Box>
  );
}

function normalizeAssetPath(asset: StaticImageData) {
  return typeof asset === "string" ? asset.replace(/^\/hero_siege_wiki_items\//, "hero_siege_wiki_items/") : asset;
}

function getEquipmentAsset(item: InventoryItem) {
  const name = item.name.toLowerCase();
  if (item.slot === "mainHand") {
    if (matchesItemName(name, ["axe", "cleaver", "club", "cudgel", "devil star", "flail", "hammer", "mace", "maul", "morning star", "tabar"])) {
      return axeArt;
    }
    if (matchesItemName(name, ["staff", "wand"])) {
      return relicGlyphArt;
    }
    if (matchesItemName(name, ["dagger", "dirge", "kris", "thorn"])) {
      return stormDaggerRelicArt;
    }
    return swordArt;
  }
  if (item.slot === "offHand") {
    if (matchesItemName(name, ["globe", "orb", "stone"])) {
      return relicOrbArt;
    }
    if (matchesItemName(name, ["crest", "fetish", "head", "spirit ward", "totem"])) {
      return charmRelicArt;
    }
    return shieldArt;
  }
  if (item.slot === "bodyAccessory") {
    return matchesItemName(name, ["belt", "sash"]) ? beltArt : glovesArt;
  }
  if (item.slot === "headAccessory") {
    if (matchesItemName(name, ["band"])) {
      return ringArt;
    }
    if (matchesItemName(name, ["crest"])) {
      return helmetArt;
    }
    return amuletArt;
  }
  if (item.slot === "eyewear" || item.slot === "ringTwo") {
    if (matchesItemName(name, ["demon", "spectral", "wraith", "abyss", "bone", "chaos", "eye", "satanic"])) {
      return relicOrbArt;
    }
    if (matchesItemName(name, ["bloodstone", "stone", "crystal", "gem"])) {
      return gemChaosRelicArt;
    }
    return ringArt;
  }
  if (item.slot === "backAccessory") {
    return charmRelicArt;
  }
  return EQUIPMENT_ASSETS[item.slot];
}

function matchesItemName(name: string, keywords: string[]) {
  return keywords.some((keyword) => name.includes(keyword));
}

function getRelicAsset(relic: Relic) {
  const semanticAsset = getSemanticRelicAsset(relic);
  if (semanticAsset) {
    return semanticAsset;
  }
  const index = RELIC_ASSET_INDEXES.get(getRelicAssetKey(relic));
  return RELIC_FALLBACK_ASSETS[(index ?? hashString(getRelicAssetKey(relic))) % RELIC_FALLBACK_ASSETS.length];
}

function getSemanticRelicAsset(relic: Relic): StaticImageData | null {
  const name = relic.name.toLowerCase();
  if (matchesItemName(name, ["belt", "sash"])) {
    return rockBeltRelicArt;
  }
  if (matchesItemName(name, ["boot"])) {
    return blazingBootsRelicArt;
  }
  if (matchesItemName(name, ["eye", "snecko"])) {
    return theEyeRelicArt;
  }
  if (matchesItemName(name, ["skull"])) {
    return devilSkullRelicArt;
  }
  if (matchesItemName(name, ["blood", "vial"])) {
    return charmedBloodRelicArt;
  }
  if (matchesItemName(name, ["flower", "mushroom"])) {
    return magicMushroomRelicArt;
  }
  if (matchesItemName(name, ["coin", "gold", "midas"])) {
    return midasHandRelicArt;
  }
  if (matchesItemName(name, ["stone", "clay", "bark", "anchor"])) {
    return ancientRockRelicArt;
  }
  if (matchesItemName(name, ["crown"])) {
    return kingsCrownRelicArt;
  }
  if (matchesItemName(name, ["bell"])) {
    return devilHornRelicArt;
  }
  if (matchesItemName(name, ["bottle", "potion", "tea", "coffee"])) {
    return largeBeerRelicArt;
  }
  if (matchesItemName(name, ["chest", "box", "cage"])) {
    return chestArt;
  }
  return null;
}

function getRelicAssetKey(relic: Relic) {
  return `${relic.id}:${relic.rarity}`;
}

function hashString(value: string) {
  let hash = HASH_SEED;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return hash >>> 0;
}
