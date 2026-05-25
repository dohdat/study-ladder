import { ALL_MODIFIER_KEYS } from "./modifierAffixes";
import { getRelicQualityLabel, type HeroSiegeQuality } from "./heroSiegeQuality";
import type { ItemModifierKey, Relic, RelicRarity, StudyState } from "../types/study";

const HASH_SEED = 2166136261;
const HASH_MULTIPLIER = 16777619;
const HASH_DIVISOR = 4294967296;
const COMMON_COST = 120;
const UNCOMMON_COST = 170;
const RARE_COST = 240;
const UNIQUE_COST = 300;
const SHOP_COST = 260;
const BOSS_COST = 320;
const EVENT_COST = 210;
const BLIGHT_COST = 1;

export const RELIC_MOD_RULES: Record<HeroSiegeQuality, { max: number; min: number }> = {
  Magic: { max: 1, min: 1 },
  Normal: { max: 1, min: 1 },
  Rare: { max: 1, min: 1 },
  Set: { max: 1, min: 1 },
  Unique: { max: 1, min: 1 }
};

const RELIC_TOTAL_KEYS: ItemModifierKey[] = ALL_MODIFIER_KEYS;
const DEFAULT_REWARD_RARITIES: RelicRarity[] = ["common", "uncommon", "rare"];
const NON_RANDOM_RARITIES = new Set<RelicRarity>(["blight", "event", "shop", "boss", "special", "starter"]);
const BASE_RELIC_RARITY_WEIGHTS: Partial<Record<RelicRarity, number>> = {
  common: 58,
  event: 15,
  rare: 12,
  shop: 14,
  uncommon: 30,
  unique: 6
};
const RARE_LUCK_DIVISOR = 2;
const UNIQUE_LUCK_DIVISOR = 6;
const COMMON_LUCK_PENALTY_DIVISOR = 2;
const UNCOMMON_LUCK_PENALTY_DIVISOR = 4;
const META_OLYMPIAN_FAVOR_LUCK_PERCENT = 4;
const META_RELIC_LUCK_PERCENT = 6;
const RELIC_UPGRADE_BONUS_MULTIPLIER = 1.2;
const RELIC_UPGRADE_RARITY_ORDER: RelicRarity[] = ["common", "uncommon", "rare", "unique"];

const relic = (name: string, rarity: RelicRarity, description: string, modifiers: Partial<Record<ItemModifierKey, number>>, source: Relic["source"] = "any"): Relic => ({
  description,
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  modifiers: Object.entries(modifiers).map(([key, value]) => ({ key: key as ItemModifierKey, value: value || 0 })).filter((modifier) => modifier.value !== 0),
  name,
  rarity,
  source,
  wikiRarityLabel: getRelicQualityLabel(rarity),
  wikiStats: createFallbackRelicStats(description, modifiers)
});

function createFallbackRelicStats(description: string, modifiers: Partial<Record<ItemModifierKey, number>>) {
  const trigger = description.match(/^(.*?)(?:\.|$)/)?.[1] || "Relic effect";
  const keys = Object.keys(modifiers).filter((key) => modifiers[key as ItemModifierKey]);
  return [`Trigger: ${trigger}.`, `Tuning: ${keys.length ? keys.join(", ") : "special relic effect"}.`];
}

const STARTER_RELICS: Relic[] = [];

const ROGUELIKE_RELIC_SOURCE_DETAILS: Record<string, { description: string; wikiStats: string[] }> = {
  "Free Hint Token": { description: "each combat room grants 1 free hint charge. The first hint in that room costs 0 gold.", wikiStats: ["Trigger: roomEnter and buyHint.", "Tuning: 1 charge per room."] },
  "Wooden Buckler": { description: "block the first health loss event in each combat room.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: blocks health damage once per room."] },
  "Sand Timer": { description: "remaining question time adds bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +1 damage per 60 seconds remaining, capped at +8."] },
  "Quick Guard": { description: "if submitted with at least 80% time remaining, gain shield for the next enemy attack.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: shield blocks 3-5 health damage."] },
  "Centennial Puzzle": { description: "the first mistake becomes information and retaliation.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: reveal a failed submit test and deal thorns damage while owned."] },
  "Small Bounty": { description: "treasure rooms are more likely to become relic offers.", wikiStats: ["Trigger: treasureReward.", "Tuning: treasure relic chance and relic rerolls improve while owned."] },
  "Orichalcum Notes": { description: "the first incoming hit is guarded and enemy debuffs are less reliable.", wikiStats: ["Trigger: onIncomingDamage and afterFailedSubmit.", "Tuning: block first hit and resist enemy debuffs while owned."] },
  "Opening Strike": { description: "first successful submit each room deals bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: first submit damage improves while owned."] },
  "Lucky Token": { description: "future relic rewards are luckier and easier to fish for.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: rare relic chance, treasure relic chance, and relic rerolls improve while owned."] },
  "Cracked Lens": { description: "failed submissions reveal one hidden failing test case.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: reveal 1 failed submit test case while owned."] },
  "Clean Amulet": { description: "enemy debuffs can be resisted, and mistakes reveal a little more information.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: debuff resistance and failed submit reveal improve while owned."] },
  "Thorn Notes": { description: "wrong-submit damage retaliates against the enemy.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: deal thorns damage back while owned."] },
  "Drill Bit": { description: "breaking enemy block turns part of that block into health damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: block break damage and guard penetration improve while owned."] },
  "Fifth Proof": { description: "every fifth submit becomes a burst hit.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: submit counter grants periodic bonus damage while owned."] },
  "Quiet Bracelet": { description: "unknown routes are safer and lean more toward treasure.", wikiStats: ["Trigger: unknownRoute and treasureReward.", "Tuning: treasure relic chance and debuff resistance improve while owned."] },
  "Error Clay": { description: "getting hit scratches the enemy back.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: thorns damage and block chance improve while owned."] },
  "Salvage Pouch": { description: "combat rewards lean toward relic routes instead of plain payout.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: treasure relic chance and rare reward chance improve while owned."] },
  "Beginner's Map": { description: "combat starts with more readable question information.", wikiStats: ["Trigger: questionStart and buyHint.", "Tuning: reveal one topic and grant one free hint charge."] },
  "Rest Tea": { description: "rooms begin with more time and a better opener.", wikiStats: ["Trigger: questionStart and afterCorrectSubmit.", "Tuning: timer grace and first submit damage improve while owned."] },
  "The Boot": { description: "correct submits always punch through for real health damage after block.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: minimum post-block health damage and block-break damage improve while owned."] },
  "Boss Pillow": { description: "entering a boss room restores health before the fight starts.", wikiStats: ["Trigger: bossRoomEnter.", "Tuning: heal before boss rooms while owned."] },
  "Smoke Step": { description: "dodging rewards confident no-run submissions.", wikiStats: ["Trigger: onIncomingDamage and afterCorrectSubmit.", "Tuning: small dodge chance and no-run submit damage."] },
  "Meal Ticket": { description: "boss routes start healthier and healing matters more.", wikiStats: ["Trigger: bossRoomEnter and healing.", "Tuning: boss-entry healing and healing received improve while owned."] },
  "No-Run Blade": { description: "if the player submits without pressing Run Code on that question, deal bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +40% damage."] },
  "Frustration Engine": { description: "each failed submission in the current room adds a damage stack. Stacks clear on room exit.", wikiStats: ["Trigger: afterFailedSubmit and afterCorrectSubmit.", "Tuning: +12% damage per failure, max 5 stacks."] },
  "Pain Capacitor": { description: "taking damage charges the next successful attack.", wikiStats: ["Trigger: onIncomingDamage and afterCorrectSubmit.", "Tuning: next attack deals +50% of damage recently taken."] },
  "Paid Insight": { description: "buying a hint empowers the next successful submit.", wikiStats: ["Trigger: buyHint and afterCorrectSubmit.", "Tuning: +30% damage on next submit after hint."] },
  "Maw Bank": { description: "fast solves bank momentum into better future relic choices.", wikiStats: ["Trigger: afterCorrectSubmit and rewardChoice.", "Tuning: timer damage and relic rerolls improve while owned."] },
  "Second Wind Timer": { description: "time remaining sets up a stronger first answer.", wikiStats: ["Trigger: questionStart and afterCorrectSubmit.", "Tuning: timer damage and first submit damage improve while owned."] },
  "Elite Brand": { description: "elite fights become both easier and more rewarding.", wikiStats: ["Trigger: onPlayerDamage and onEliteClear.", "Tuning: elite damage and elite-only relic choices improve."] },
  "Merchant Shelf": { description: "shops show one extra relic and price it slightly lower.", wikiStats: ["Trigger: shopEnter and getShopItemCost.", "Tuning: shop relic stock and shop discounts improve while owned."] },
  "Campfire Tools": { description: "rest routes leave the next room protected.", wikiStats: ["Trigger: restEnter and nextCombat.", "Tuning: max life and first-hit block improve while owned."] },
  "Challenger Banner": { description: "choosing an elite path grants temporary damage for that room.", wikiStats: ["Trigger: roomEnter.", "Tuning: +20% damage in elite rooms."] },
  "Question Card": { description: "relic rewards show a wider hand.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: relic choice count and relic rerolls improve while owned."] },
  "Second Heart": { description: "gain 1 revive for the run.", wikiStats: ["Trigger: runDeath.", "Tuning: revive once at partial health."] },
  "Frozen Hourglass": { description: "rooms begin with extra time and the first mistake is guarded.", wikiStats: ["Trigger: questionStart and onIncomingDamage.", "Tuning: timer grace and first-hit block improve while owned."] },
  "Wide Offering": { description: "relic rewards show one extra option and treasure rooms tilt toward relics.", wikiStats: ["Trigger: onRewardGenerated and treasureReward.", "Tuning: choice count and treasure relic chance improve while owned."] },
  "Trophy Hunter": { description: "elite rooms offer wider relic choices and better elite loot.", wikiStats: ["Trigger: onEliteClear.", "Tuning: elite-only relic choice count and elite drop bonus improve."] },
  "Boss Grudge": { description: "bosses take increasing damage after each failed attempt.", wikiStats: ["Trigger: afterFailedSubmit and onPlayerDamage.", "Tuning: +15% boss damage per failed submit, max +75%."] },
  "Lesson Scar": { description: "wrong answers become temporary power.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: after taking damage from a wrong answer, gain +10% damage until room clear."] },
  "Perfect Sprint": { description: "solving under 50% of the time limit grants a reroll charge.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: max 1 charge per room."] },
  "Blue Candle": { description: "mistake-heavy rooms convert debuff pressure into comeback damage and recovery.", wikiStats: ["Trigger: afterFailedSubmit and onRoomClear.", "Tuning: failure damage stacks, debuff resistance, and wounded clear healing improve while owned."] },
  "Silent Discipline": { description: "skipping help and rewards turns into long-term progress.", wikiStats: ["Trigger: rewardChoice and afterCorrectSubmit.", "Tuning: no-run damage and skip insight improve while owned."] },
  "Iron Choice": { description: "skipping a relic hardens the current run.", wikiStats: ["Trigger: onRewardSkipped.", "Tuning: gain max life and healing when a relic reward is skipped."] },
  "Ash Offering": { description: "skipping a relic grants insight and another chance to find a better relic.", wikiStats: ["Trigger: onRewardSkipped and rewardChoice.", "Tuning: skip insight and relic rerolls improve while owned."] },
  "Smithing Shrine": { description: "passing on a relic turns into sturdier future choices.", wikiStats: ["Trigger: onRewardSkipped and rewardChoice.", "Tuning: skip max life and relic rerolls improve while owned."] },
  "Backroom Dice": { description: "shops carry extra relics and make reward rerolls easier.", wikiStats: ["Trigger: shopEnter and rewardChoice.", "Tuning: shop relic stock, relic rerolls, and shop discounts improve while owned."] },
  "Alchemist's Menu": { description: "random potions last longer and healing scales better.", wikiStats: ["Trigger: potionUse and healing.", "Tuning: potion duration, max life, and healing received improve while owned."] },
  "Fortune Thread": { description: "luckier relic rewards also show a wider offering.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: +18% rare relic chance and +1 relic choice."] },
  "Answer Lantern": { description: "failed submissions reveal more hidden cases without giving direct hints.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: reveal 2 failed submit test cases while owned."] },
  "Flame Margin": { description: "fire damage comes with fire resistance for safer aggressive rooms.", wikiStats: ["Trigger: damage calculation and resistance calculation.", "Tuning: fire damage, fire resistance, and small enhanced damage."] },
  "Cold Margin": { description: "cold builds gain defensive control and better crit setup.", wikiStats: ["Trigger: damage calculation and resistance calculation.", "Tuning: cold damage, cold resistance, and crit chance."] },
  "Storm Margin": { description: "lightning builds chain more often while resisting lightning rooms.", wikiStats: ["Trigger: damage calculation and resistance calculation.", "Tuning: lightning damage, lightning resistance, and extra attack chance."] },
  "Venom Margin": { description: "poison builds execute low-health enemies more reliably.", wikiStats: ["Trigger: damage calculation and resistance calculation.", "Tuning: poison damage, poison resistance, and execute chance."] },
  "Piercing Thesis": { description: "armor-heavy enemies lose protection faster.", wikiStats: ["Trigger: damage calculation.", "Tuning: armor penetration, reduced enemy armor, and execute chance."] },
  "Self-Forming Clay": { description: "getting hurt turns into retaliation and a safer recovery window.", wikiStats: ["Trigger: onIncomingDamage and onRoomClear.", "Tuning: thorns and wounded clear healing improve while owned."] },
  "Meat on the Bone": { description: "clearing a fight while wounded triggers a comeback heal.", wikiStats: ["Trigger: onRoomClear.", "Tuning: heal when below half life and improve low-life submit damage while owned."] },
  "Tiny Chest": { description: "treasure routes become real relic spikes.", wikiStats: ["Trigger: treasureReward and onRewardGenerated.", "Tuning: treasure relic chance and relic choice count improve while owned."] },
  "Black Star": { description: "elite routes become the main relic-farming plan.", wikiStats: ["Trigger: onEliteClear.", "Tuning: elite relic choices, elite damage, and elite reward chance improve while owned."] },
  "Iron Posture": { description: "armor and physical resistance reduce punishment from failed rooms.", wikiStats: ["Trigger: onIncomingDamage and resistance calculation.", "Tuning: armor, physical resistance, and damage reduction."] },
  "Deadline Dancer": { description: "speed and movement turn fast solves into safer damage.", wikiStats: ["Trigger: afterCorrectSubmit and onIncomingDamage.", "Tuning: timer damage, dodge, and accuracy."] },
  "Hint Furnace": { description: "hints and failed submissions become a comeback engine.", wikiStats: ["Trigger: buyHint and afterFailedSubmit.", "Tuning: free hint, failed-submit damage stack, and hidden test reveal."] },
  "Oracle Dagger": { description: "hints become attacks. Buying a hint immediately deals damage, then the next submit deals bonus damage.", wikiStats: ["Trigger: buyHint and afterCorrectSubmit.", "Tuning: hint deals 20% of enemy max health; next submit +25% damage."] },
  "Midas Core": { description: "gold becomes both damage and defense.", wikiStats: ["Trigger: damage calculation and onIncomingDamage.", "Tuning: every 50 gold gives +4% damage and reduces incoming damage by 1%, capped at 20%."] },
  "Speed Spiral": { description: "fast solves chain into increasing rewards.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: solving with 60%+ time remaining adds 1 speed stack. Each stack gives +5% gold and damage. Stack resets on fail or slow solve. Max 6."] },
  "Blind Submission": { description: "no-run submissions become the main damage engine.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: if no Run Code was used, deal +80% damage and gain +1 meta currency on room clear. If Run Code was used, deal -15% damage."] },
  "Unaided Thesis": { description: "solves hit harder until a hint is used on that question.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: submit damage increases while current-question hint count is 0."] },
  "Red Ink Contract": { description: "every wrong answer increases power but raises danger.", wikiStats: ["Trigger: afterFailedSubmit and onIncomingDamage.", "Tuning: +18% damage per wrong answer, but incoming damage also +8%. Resets on room clear."] },
  "Elite Forge": { description: "elite paths are harder but elite rewards become wider.", wikiStats: ["Trigger: roomEnter and onEliteClear.", "Tuning: elite damage, elite-only relic choices, and incoming damage all rise."] },
  "Boss Ledger": { description: "accept weaker normal damage for wider boss rewards.", wikiStats: ["Trigger: damage calculation and onBossClear.", "Tuning: normal damage drops, elite/boss pressure rises, and boss-only relic choices improve."] },
  "Merchant Kingdom": { description: "merchants become primary power source.", wikiStats: ["Trigger: shopEnter and shopPurchase.", "Tuning: shops have +2 relics, all relics 15% cheaper, but non-shop room relic rewards are 25% less likely."] },
  "Topic Prism": { description: "repeated topics stack damage.", wikiStats: ["Trigger: questionStart and afterCorrectSubmit.", "Tuning: each time a topic appears in the run, gain +2% damage on future questions with that topic. Cap +20% per topic."] },
  "Shield Furnace": { description: "unused block converts to damage.", wikiStats: ["Trigger: onRoomClear or afterCorrectSubmit.", "Tuning: each unused shield point adds +2 damage to next attack, capped at +20."] },
  "Chain Lightning Thesis": { description: "lightning builds chain into speed pressure.", wikiStats: ["Trigger: onPlayerDamage and afterCorrectSubmit.", "Tuning: lightning damage, extra-hit chance, and timer damage improve while owned."] },
  "Glass Crown": { description: "huge damage, but shops cost more.", wikiStats: ["Trigger: damage calculation and getShopItemCost.", "Tuning: +40% damage; shop prices +25%."] },
  "Starved Focus": { description: "focused recovery makes every heal stronger.", wikiStats: ["Trigger: healing.", "Tuning: all healing +40%."] },
  "Dangerous Choice": { description: "more relic choices, but incoming punishment rises.", wikiStats: ["Trigger: onRewardGenerated and onIncomingDamage.", "Tuning: relic choice count and incoming damage both rise."] },
  "Phoenix Debt": { description: "gain 1 stronger revive, but each act starts with lower health.", wikiStats: ["Trigger: runDeath and actStart.", "Tuning: revive once; act start health capped at 70%."] },
  "Gold Hourglass": { description: "more gold, but timer is shorter.", wikiStats: ["Trigger: reward calculation and question timer.", "Tuning: +35% gold; -20% question time."] },
  "Oracle Chain": { description: "free hints, but hint use reduces rewards.", wikiStats: ["Trigger: buyHint and reward calculation.", "Tuning: 1 free hint per question; using any hint reduces room gold/meta by 30%."] },
  "Demon Writ": { description: "massive boss damage, but normal rooms hit harder.", wikiStats: ["Trigger: damage calculation and onIncomingDamage.", "Tuning: +60% boss damage; +25% incoming damage in non-boss combat."] },
  "Forbidden Trophy": { description: "rare rewards appear more often, but rest healing is disabled.", wikiStats: ["Trigger: onRewardGenerated and restEnter.", "Tuning: +25% rare/unique chance; rest can smith or attune relics only."] },
  "Elite Toll": { description: "elite rewards are better but elites are more punishing.", wikiStats: ["Trigger: onEliteClear and roomEnter.", "Tuning: elite-only relic choices improve; incoming damage and timer pressure rise."] },
  "Volatile Relic Core": { description: "every future relic has stronger effects and stronger downsides.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: future relic positive numbers +30%; future relic downside numbers +30%; add downside to relics without one where possible."] },
  "Merchant Token": { description: "shop prices are reduced and reward rerolls are easier to afford.", wikiStats: ["Trigger: getShopItemCost and rewardChoice.", "Tuning: shop discount and relic rerolls improve while owned."] },
  "Extra Shelf": { description: "shops show one extra relic.", wikiStats: ["Trigger: shopEnter.", "Tuning: +1 relic listing."] },
  "Blood Market": { description: "shops can sell boss relics, but the run pays in max life.", wikiStats: ["Trigger: shopEnter.", "Tuning: one boss relic listing appears; max life is reduced while owned."] },
  "Interest Charm": { description: "gold earns interest after each room.", wikiStats: ["Trigger: onRoomClear.", "Tuning: +8% current gold, capped at +20 per room."] },
  "Spending Temper": { description: "spending gold buffs next combat.", wikiStats: ["Trigger: shopPurchase and roomEnter.", "Tuning: gain +1% damage per 10 gold spent last shop, max +30%."] },
  "Risky Curiosity": { description: "unknown rooms become riskier but more rewarding.", wikiStats: ["Trigger: unknown room resolution.", "Tuning: +20% chance of elite/event danger; +35% rewards from unknown rooms."] },
  "Bloody Idol": { description: "gold offerings restore a little life.", wikiStats: ["Trigger: goldGain.", "Tuning: heal whenever gold is gained while owned."] },
  "Golden Mirror": { description: "reward offers become wider and easier to reroll.", wikiStats: ["Trigger: rewardChoice.", "Tuning: relic choice count and relic rerolls improve while owned."] },
  "Ash Bargain": { description: "give up a relic to gain meta currency.", wikiStats: ["Trigger: eventChoice.", "Tuning: remove selected relic; gain 10-25 meta based on rarity."] },
  "Duel Shrine": { description: "elite-style rewards become sharper and more dangerous.", wikiStats: ["Trigger: rewardChoice and onIncomingDamage.", "Tuning: elite damage, relic choices, incoming damage, and timer damage all rise."] },
  "Short Fuse": { description: "timer is shorter.", wikiStats: ["Trigger: questionStart.", "Tuning: -15% question time."] },
  "Price Gouge": { description: "shops cost more.", wikiStats: ["Trigger: getShopItemCost.", "Tuning: +20% shop prices."] },
  "Withered Flask": { description: "healing reduced.", wikiStats: ["Trigger: healing.", "Tuning: -35% healing received."] },
  "Cold Campfire": { description: "rest sites cannot heal.", wikiStats: ["Trigger: restEnter.", "Tuning: remove heal option, keep smith/attune if available."] },
  "Elite Burden": { description: "elites require more questions.", wikiStats: ["Trigger: roomEnter.", "Tuning: elite rooms always have 3 questions."] },
  "Sharp Shadows": { description: "normal rooms hit harder.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: +20% incoming damage in non-elite, non-boss rooms."] },
  "Oracle Tax": { description: "rewards reduced after hint use.", wikiStats: ["Trigger: reward calculation.", "Tuning: -25% gold/meta if any hint was used in the room."] },
  "Heavy Coffers": { description: "hoarding gold increases boss damage taken.", wikiStats: ["Trigger: onBossEnter or onIncomingDamage.", "Tuning: bosses deal +1% damage per 25 gold, capped at +30%."] },
  "Weak Dawn": { description: "start each act at lower health.", wikiStats: ["Trigger: actStart.", "Tuning: current health capped at 70% max health."] },
  "Cursed Beginning": { description: "run starts with a curse for extra meta currency.", wikiStats: ["Trigger: runStart.", "Tuning: choose 1 curse; +20% meta currency for the run."] },
  "Narrow Offering": { description: "relic choices are narrower and rooms are more dangerous.", wikiStats: ["Trigger: rewardChoice and onIncomingDamage.", "Tuning: -1 relic choice; +5% incoming damage."] },
  "Dull Blade": { description: "critical builds lose sharpness.", wikiStats: ["Trigger: damage calculation.", "Tuning: lower crit chance and crit damage."] },
  "Brittle Shield": { description: "enemy damage mitigation is weaker.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: more damage taken from enemy hits."] },
  "Blind Map": { description: "less question information is visible and damage is weaker.", wikiStats: ["Trigger: questionStart and damage calculation.", "Tuning: hide one extra topic and reduce damage."] },
  "Expensive Lessons": { description: "shops cost more and skipping rewards pays less insight.", wikiStats: ["Trigger: getShopItemCost and skipRelicReward.", "Tuning: +12% shop prices; -2 skip insight."] },
  "Leaking Flask": { description: "sustain effects are weaker.", wikiStats: ["Trigger: healing and room clear.", "Tuning: less healing received and less life on completion."] },
  "Rusty Coin": { description: "gold rewards shrink.", wikiStats: ["Trigger: reward calculation.", "Tuning: -25% gold find."] },
  "Slow Mind": { description: "timer grace and speed damage are reduced.", wikiStats: ["Trigger: questionStart and damage calculation.", "Tuning: -20 seconds timer grace and weaker time damage."] }
};

const COMMON_RELICS: Relic[] = [
  relic("Sand Timer", "common", "Fast solves increase submit damage.", { timerDamagePercent: 16 }),
  relic("Centennial Puzzle", "common", "The first mistake in a fight exposes one hidden failing case.", { revealSubmitTestCount: 1 }),
  relic("Small Bounty", "common", "Treasure paths are more likely to become relic offers.", { treasureRelicChancePercent: 22 }),
  relic("Thorn Notes", "common", "Wrong-submit damage retaliates against the enemy.", { thornsDamage: 5 }),
  relic("Blood Vial", "common", "A tiny vial of warm red glass clicks softly at the start of a fight.", { combatStartHeal: 6 }),
  relic("Anchor", "common", "Heavy enough to make the opening blow glance away.", { combatStartBlock: 10 }),
  relic("Array Compass", "common", "Its needle points straight through indexed patterns.", { damageVsArraysPercent: 30 }),
  relic("String Rosary", "common", "Each bead catches the shape of a repeated character.", { damageVsStringsPercent: 30 }),
  relic("Cracked Shield", "common", "The split in the shield points exactly where the guard will fail.", { blockedEnemyDamagePercent: 35 }),
  relic("Rest Tea", "common", "Each room starts with extra timer grace.", { timerPauseSeconds: 45 }),
  relic("Smoke Step", "common", "The next incoming hit is easier to evade.", { dodgeChancePercent: 10 }),
  relic("Maw Bank", "common", "Relic rewards can be rerolled one extra time.", { relicRerollBonus: 1 }),
  relic("Question Card", "common", "Relic rewards show a wider hand.", { relicChoiceBonus: 1 }),
  relic("Silent Discipline", "common", "Skipping relic rewards grants more long-term insight.", { skipRelicMetaBonus: 3 }),
  relic("Iron Choice", "common", "Skipping relics makes the current run sturdier.", { skipRelicMaxLife: 6 }),
  relic("Fortune Thread", "common", "Rare relic rewards appear more often.", { increasedRareDropChancePercent: 18 }),
  relic("Tree Root", "common", "Every branch leads back to one clean strike.", { damageVsTreesPercent: 35 }),
  relic("Graph Compass", "common", "No edge is wasted once the map is known.", { damageVsGraphsPercent: 35 })
];

const UNCOMMON_RELICS: Relic[] = [
  relic("Opening Strike", "uncommon", "The first successful submit in each room hits much harder.", { firstSubmitDamagePercent: 45 }),
  relic("Frustration Engine", "uncommon", "Wrong answers add temporary damage stacks for the room.", { submitFailDamageStackPercent: 12 }),
  relic("Pain Capacitor", "uncommon", "Wounded runs deal stronger submit damage.", { bonusDamageWhileLowHealthPercent: 25 }),
  relic("Root Charm", "uncommon", "A little life returns after each cleared room.", { healthRegen: 3 }),
  relic("Guard Siphon", "uncommon", "Breaking enemy Block restores a small amount of health.", { lifeStealPercent: 4 }),
  relic("Tenth Test", "uncommon", "Repeated test runs can finish low-health enemies.", { executeChancePercent: 8 }),
  relic("Hand Drill", "uncommon", "Enemy armor is easier to crack open.", { reducedEnemyArmorPercent: 12 }),
  relic("Drill Bit", "uncommon", "Breaking enemy Block converts part of that Block into health damage.", { blockBreakDamagePercent: 55 }),
  relic("Boss Pillow", "uncommon", "Entering a boss room restores health before the fight starts.", { bossEntryHeal: 18 }),
  relic("Bag of Marbles", "uncommon", "Enemies start each fight exposed and easier to punish.", { enemyVulnerableSubmits: 2 }),
  relic("Hash Map Cipher", "uncommon", "A paired key opens the enemy's weak side.", { damageVsHashMapPercent: 30 }),
  relic("Depth Charm", "uncommon", "It grows heavier the deeper the search goes.", { damageVsDfsPercent: 35 }),
  relic("Breadth Lantern", "uncommon", "A pale light spreads evenly across the frontier.", { damageVsBfsPercent: 35 }),
  relic("Gremlin Horn", "uncommon", "A shrill horn sounds as the enemy falls.", { monsterDefeatHeal: 8 }),
  relic("Small Mistake Filter", "uncommon", "Small hits are softened before health is lost.", { damageReduction: 2 }),
  relic("Meat on the Bone", "uncommon", "Clearing a fight while wounded triggers a comeback heal.", { lowHealthClearHeal: 14 }),
  relic("Preserved Insect", "uncommon", "The shell twitches whenever an elite blocks the path.", { eliteStartHealthReductionPercent: 25 }),
  relic("Dynamic Engine", "uncommon", "Solved subproblems hum beneath the blade.", { damageVsDynamicProgrammingPercent: 40 }),
  relic("Trophy Hunter", "uncommon", "Elite rewards show more relic choices.", { eliteRelicChoiceBonus: 2 }),
  relic("Boss Grudge", "uncommon", "Elite and boss rooms take heavier submit damage.", { bonusDamageVsElitesPercent: 25 }),
  relic("Alchemist's Menu", "uncommon", "Potion-style sustain lasts longer.", { potionDurationBonus: 2 }),
  relic("Ginger", "uncommon", "A spicy root clears the fog before it can settle in.", { hexConfusedImmune: 1 }),
  relic("Turnip", "uncommon", "You cannot tell whether it is lucky, stubborn, or both.", { vulnerableConstrictedImmune: 1 })
];

const RARE_RELICS: Relic[] = [
  relic("Orichalcum Notes", "rare", "The first health hit in each room is blocked.", { blockFirstHit: 1 }),
  relic("Clean Amulet", "rare", "Enemy debuffs are almost completely shut down.", { debuffResistPercent: 90 }),
  relic("Fifth Proof", "rare", "Every fifth submit lands as a burst hit.", { fifthSubmitDamagePercent: 100 }),
  relic("The Boot", "rare", "Correct submits always punch through for real health damage.", { minimumSubmitDamage: 12 }),
  relic("Midas Core", "rare", "Gold payouts become a major power source.", { goldFindPercent: 25 }),
  relic("No-Run Blade", "rare", "Submitting without Run Code deals much more damage.", { noRunDamagePercent: 55 }),
  relic("Unaided Thesis", "rare", "Submit damage is higher until a hint is used on that question.", { noHintDamagePercent: 45 }),
  relic("Boss Ledger", "rare", "Boss clears show more relic choices.", { bossRelicChoiceBonus: 1 }),
  relic("Merchant Kingdom", "rare", "Merchants stock extra relics.", { shopRelicStock: 2 }),
  relic("Topic Prism", "rare", "Questions reveal more topic information up front.", { revealTopicCount: 3 }),
  relic("Curse Pearl", "rare", "Maximum life rises for the rest of the run.", { maxLife: 12 })
];

const UNIQUE_RELICS: Relic[] = [
  relic("Second Heart", "unique", "Gain 1 revive for the run.", { revivePercent: 40 }),
  relic("Fossilized Helix", "unique", "Seemingly indestructible, you wonder what kind of creature this belonged to.", { preventFirstHpLoss: 1 }),
  relic("Torii", "unique", "A small gate catches the blows that should have barely mattered.", { smallHitToOneThreshold: 5 }),
  relic("Black Star", "unique", "Elite clears are more likely to drop extra rewards.", { eliteDropBonusPercent: 20 })
];

const BOSS_RELICS: Relic[] = [
  relic("Glass Crown", "boss", "All submit damage is massively increased.", { enhancedDamagePercent: 40 }),
  relic("Starved Focus", "boss", "Focused recovery makes every heal stronger.", { increasedHealingReceivedPercent: 40 }),
  relic("Dangerous Choice", "boss", "Staying untouched turns into a high-risk damage spike.", { bonusDamageWhileFullHealthPercent: 45 }),
  relic("Gold Hourglass", "boss", "Late solves pierce enemy resistance.", { resistancePenetrationPercent: 18 }),
  relic("Forbidden Trophy", "boss", "Combat rewards are more likely to upgrade.", { increasedLootDropChancePercent: 25 })
];

const SHOP_RELICS: Relic[] = [
  relic("Blood Market", "shop", "Shops can sell one boss-tier relic.", { bossShopRelicStock: 1 }),
  relic("Smiling Mask", "shop", "Shop relic prices are reduced.", { shopDiscountPercent: 50 })
];

const EVENT_RELICS: Relic[] = [
  relic("Bloody Idol", "event", "Its grin widens whenever coins touch your hand.", { goldGainHeal: 4 }),
  relic("Red Mask", "event", "Enemies begin combat rattled behind their own disguise.", { enemyWeakSubmits: 2 }),
  relic("Ash Bargain", "event", "The ash cools into a lesson after each fight.", { combatClearMeta: 1 })
];

const BLIGHT_RELICS: Relic[] = [
  relic("Short Fuse", "blight", "Question timers are shorter.", { timerPenaltyPercent: 15 }),
  relic("Price Gouge", "blight", "Shop prices are higher.", { shopPriceIncreasePercent: 20 }),
  relic("Withered Flask", "blight", "Poison resistance is reduced.", { poisonResistPercent: -15 }),
  relic("Sharp Shadows", "blight", "Enemy damage reduction is weaker.", { reducedEnemyDamagePercent: -10 }),
  relic("Cold Campfire", "blight", "Fire resistance is reduced.", { fireResistPercent: -15 }),
  relic("Elite Burden", "blight", "Armor penetration is reduced.", { armorPenetrationPercent: -12 }),
  relic("Oracle Tax", "blight", "Enemy punishment rises after you lean on the oracle.", { incomingDamagePercent: 12 }),
  relic("Heavy Coffers", "blight", "Physical submit damage drops.", { physicalDamage: -4 }),
  relic("Weak Dawn", "blight", "Physical resistance is reduced.", { physicalResistPercent: -12 }),
  relic("Cursed Beginning", "blight", "Parry chance is reduced.", { parryChancePercent: -6 }),
  relic("Narrow Offering", "blight", "Critical strike damage is reduced.", { criticalDamagePercent: -20 }),
  relic("Dull Blade", "blight", "Accuracy is reduced.", { accuracyPercent: -8 }),
  relic("Brittle Shield", "blight", "Block chance is reduced.", { blockChancePercent: -6 }),
  relic("Blind Map", "blight", "Critical strike chance is reduced.", { criticalChancePercent: -6 }),
  relic("Expensive Lessons", "blight", "Cold resistance is reduced.", { coldResistPercent: -15 }),
  relic("Leaking Flask", "blight", "Lightning resistance is reduced.", { lightningResistPercent: -15 }),
  relic("Rusty Coin", "blight", "Magic find is reduced.", { magicFindPercent: -10 }),
  relic("Slow Mind", "blight", "Extra-hit chance is reduced.", { extraAttackChancePercent: -6 })
];

export const ROGUELIKE_RELIC_RARITY_COUNTS = {
  blight: BLIGHT_RELICS.length,
  boss: BOSS_RELICS.length,
  common: COMMON_RELICS.length,
  event: EVENT_RELICS.length,
  rare: RARE_RELICS.length,
  shop: SHOP_RELICS.length,
  uncommon: UNCOMMON_RELICS.length,
  unique: UNIQUE_RELICS.length
} as const;

export const RELIC_DEFINITIONS: Relic[] = [
  ...STARTER_RELICS,
  ...COMMON_RELICS,
  ...UNCOMMON_RELICS,
  ...RARE_RELICS,
  ...UNIQUE_RELICS,
  ...BOSS_RELICS,
  ...SHOP_RELICS,
  ...EVENT_RELICS,
  ...BLIGHT_RELICS
].map(addRelicIconFilter);

export function getOwnedRelicIds(state: StudyState) {
  return new Set(state.profile.relics.map((relicItem) => relicItem.id));
}

export function getRelicModifierTotals(state: StudyState) {
  const totals = Object.fromEntries(RELIC_TOTAL_KEYS.map((key) => [key, 0])) as Record<ItemModifierKey, number>;
  for (const relicItem of state.profile.relics) {
    for (const modifier of relicItem.modifiers || []) {
      totals[modifier.key] = (totals[modifier.key] || 0) + modifier.value;
    }
  }
  return totals;
}

export function normalizeRelics(relics: Relic[] | undefined) {
  const knownById = new Map(RELIC_DEFINITIONS.map((row) => [row.id, row]));
  return Array.from(new Set((relics || []).map((row) => row.id)))
    .map((id) => {
      const source = (relics || []).find((row) => row.id === id);
      const known = knownById.get(id);
      if (!known) {
        return null;
      }
      const rarity = isUpgradeableRelicRarity(source?.rarity) ? source?.rarity || known.rarity : known.rarity;
      return {
        ...known,
        modifiers: source?.modifiers?.length ? source.modifiers.map((modifier) => ({ ...modifier })) : known.modifiers,
        rarity,
        wikiRarityLabel: getRelicQualityLabel(rarity)
      };
    })
    .filter(Boolean) as Relic[];
}

export function grantRelic(state: StudyState, relicItem: Relic): StudyState {
  if (getOwnedRelicIds(state).has(relicItem.id)) {
    return state;
  }
  return { ...state, profile: { ...state.profile, relics: [...state.profile.relics, relicItem] } };
}

export function getPomEligibleRelics(state: StudyState) {
  return state.profile.relics.filter((relicItem) => getNextRelicRarity(relicItem.rarity));
}

export function upgradeRelicRarity(relicItem: Relic): Relic {
  const nextRarity = getNextRelicRarity(relicItem.rarity);
  if (!nextRarity) {
    return relicItem;
  }
  return {
    ...relicItem,
    modifiers: (relicItem.modifiers || []).map((modifier) => ({
      ...modifier,
      value: modifier.value > 0 ? Math.max(modifier.value + 1, Math.ceil(modifier.value * RELIC_UPGRADE_BONUS_MULTIPLIER)) : modifier.value
    })),
    rarity: nextRarity,
    wikiRarityLabel: getRelicQualityLabel(nextRarity)
  };
}

function getNextRelicRarity(rarity: RelicRarity) {
  const index = RELIC_UPGRADE_RARITY_ORDER.indexOf(rarity);
  if (index < 0 || index >= RELIC_UPGRADE_RARITY_ORDER.length - 1) {
    return null;
  }
  return RELIC_UPGRADE_RARITY_ORDER[index + 1];
}

function isUpgradeableRelicRarity(rarity: RelicRarity | undefined): rarity is RelicRarity {
  return Boolean(rarity && RELIC_UPGRADE_RARITY_ORDER.includes(rarity));
}

export function rollRelic(state: StudyState, seed: string, options: { includeBlights?: boolean; includeEvents?: boolean; includeShop?: boolean; maxItemLevel?: number; minRarity?: RelicRarity[] } = {}) {
  const owned = getOwnedRelicIds(state);
  const allowedRarities = options.minRarity || DEFAULT_REWARD_RARITIES;
  const allowed = RELIC_DEFINITIONS.filter((relicItem) => {
    if (owned.has(relicItem.id)) {
      return false;
    }
    if (relicItem.source !== "any" && relicItem.source !== "ironclad") {
      return false;
    }
    if (!allowedRarities.includes(relicItem.rarity)) {
      return false;
    }
    if (!options.includeShop && relicItem.rarity === "shop") {
      return false;
    }
    if (!options.includeEvents && relicItem.rarity === "event") {
      return false;
    }
    if (!options.includeBlights && relicItem.rarity === "blight") {
      return false;
    }
    return !NON_RANDOM_RARITIES.has(relicItem.rarity) || allowedRarities.includes(relicItem.rarity);
  });
  if (!allowed.length) {
    return RELIC_DEFINITIONS.find((relicItem) => relicItem.id === "free-hint-token") || RELIC_DEFINITIONS[0];
  }
  const rarity = rollRelicRarity(allowed, seed, getRelicRollLuckPercent(state));
  const candidates = allowed.filter((relicItem) => relicItem.rarity === rarity);
  const pool = candidates.length ? candidates : allowed;
  return pool[Math.floor(getRelicSeedRoll(`${seed}:item`) * pool.length)];
}

function rollRelicRarity(allowed: Relic[], seed: string, luckPercent: number) {
  const availableRarities = Array.from(new Set(allowed.map((relicItem) => relicItem.rarity)));
  const luck = Math.max(0, Math.floor(luckPercent || 0));
  const weights = availableRarities.map((rarity) => ({
    rarity,
    weight: getRelicRarityWeight(rarity, luck)
  }));
  const totalWeight = weights.reduce((sum, row) => sum + row.weight, 0);
  let cursor = getRelicSeedRoll(`${seed}:rarity`) * totalWeight;
  for (const row of weights) {
    cursor -= row.weight;
    if (cursor <= 0) {
      return row.rarity;
    }
  }
  return weights[weights.length - 1]?.rarity || allowed[0].rarity;
}

function getRelicRollLuckPercent(state: StudyState) {
  const upgrades = state.profile?.metaProgress?.upgrades;
  const metaLuck = (Math.max(0, upgrades?.olympianFavor || 0) * META_OLYMPIAN_FAVOR_LUCK_PERCENT)
    + (Math.max(0, upgrades?.relicLuck || 0) * META_RELIC_LUCK_PERCENT);
  const relicModifiers = getRelicModifierTotals(state);
  return (relicModifiers.increasedRareDropChancePercent || 0)
    + Math.floor((relicModifiers.increasedLootDropChancePercent || 0) / 2)
    + Math.floor((relicModifiers.magicFindPercent || 0) / 2)
    + metaLuck;
}

function getRelicRarityWeight(rarity: RelicRarity, luck: number) {
  const base = BASE_RELIC_RARITY_WEIGHTS[rarity] || 1;
  if (rarity === "unique") {
    return base + Math.floor(luck / UNIQUE_LUCK_DIVISOR);
  }
  if (rarity === "rare" || rarity === "event" || rarity === "shop") {
    return base + Math.floor(luck / RARE_LUCK_DIVISOR);
  }
  if (rarity === "common") {
    return Math.max(5, base - Math.floor(luck / COMMON_LUCK_PENALTY_DIVISOR));
  }
  if (rarity === "uncommon") {
    return Math.max(8, base - Math.floor(luck / UNCOMMON_LUCK_PENALTY_DIVISOR));
  }
  return base;
}

export function getRelicCost(relicItem: Relic) {
  if (relicItem.rarity === "common" || relicItem.rarity === "starter") {
    return COMMON_COST;
  }
  if (relicItem.rarity === "uncommon") {
    return UNCOMMON_COST;
  }
  if (relicItem.rarity === "rare") {
    return RARE_COST;
  }
  if (relicItem.rarity === "unique") {
    return UNIQUE_COST;
  }
  if (relicItem.rarity === "shop") {
    return SHOP_COST;
  }
  if (relicItem.rarity === "boss") {
    return BOSS_COST;
  }
  if (relicItem.rarity === "blight") {
    return BLIGHT_COST;
  }
  return EVENT_COST;
}

export function getRelicSeedRoll(seed: string) {
  let hash = HASH_SEED;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }
  return (hash >>> 0) / HASH_DIVISOR;
}

function addRelicIconFilter(relicItem: Relic, index: number): Relic {
  return {
    ...relicItem,
    modifiers: (relicItem.modifiers || []).slice(0, RELIC_MOD_RULES[getRelicQualityLabel(relicItem.rarity, relicItem.wikiRarityLabel)].max),
    wikiImageFilter: relicItem.wikiImageFilter || getRelicIconFilter(relicItem.id, index)
  };
}

function getRelicIconFilter(id: string, index: number) {
  const hue = Math.round(getRelicSeedRoll(`${id}:${index}:icon-filter`) * 360);
  const saturation = 1.04 + ((index % 5) * 0.08);
  const brightness = 0.92 + ((index % 4) * 0.06);
  const contrast = 0.98 + ((index % 17) * 0.01);
  return `hue-rotate(${hue}deg) saturate(${saturation.toFixed(2)}) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)})`;
}
