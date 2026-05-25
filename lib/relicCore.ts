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
  Magic: { max: 3, min: 1 },
  Normal: { max: 3, min: 1 },
  Rare: { max: 4, min: 1 },
  Set: { max: 4, min: 1 },
  Unique: { max: 5, min: 1 }
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
  description: ROGUELIKE_RELIC_SOURCE_DETAILS[name]?.description || description,
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  modifiers: Object.entries(modifiers).map(([key, value]) => ({ key: key as ItemModifierKey, value: value || 0 })).filter((modifier) => modifier.value !== 0),
  name,
  rarity,
  source,
  wikiRarityLabel: getRelicQualityLabel(rarity),
  wikiStats: ROGUELIKE_RELIC_SOURCE_DETAILS[name]?.wikiStats
});

const STARTER_RELICS: Relic[] = [];

const ROGUELIKE_RELIC_SOURCE_DETAILS: Record<string, { description: string; wikiStats: string[] }> = {
  "Free Hint Token": { description: "each combat room grants 1 free hint charge. The first hint in that room costs 0 gold.", wikiStats: ["Trigger: roomEnter and buyHint.", "Tuning: 1 charge per room."] },
  "Wooden Buckler": { description: "block the first health loss event in each combat room.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: blocks health damage once per room."] },
  "Sand Timer": { description: "remaining question time adds bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +1 damage per 60 seconds remaining, capped at +8."] },
  "Study Lens": { description: "each visible topic increases damage against that question.", wikiStats: ["Trigger: questionStart.", "Tuning: +5% damage per visible topic."] },
  "Scratch Notes": { description: "first wrong answer on a question reveals 1 hidden topic.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: 1 reveal per question."] },
  "Quick Guard": { description: "if submitted with at least 80% time remaining, gain shield for the next enemy attack.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: shield blocks 3-5 health damage."] },
  "Blood Spark": { description: "critical hits restore a small amount of health.", wikiStats: ["Trigger: onPlayerDamage.", "Tuning: restore 2 health per crit."] },
  "Small Bounty": { description: "extra gold also makes treasure rooms more likely to become relic offers.", wikiStats: ["Trigger: onRoomClear and treasureReward.", "Tuning: gold find and treasure relic chance improve while owned."] },
  "Error Cushion": { description: "first syntax/runtime error each room deals reduced damage.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: reduce incoming penalty by 50% once per room."] },
  "Opening Strike": { description: "first successful submit each room deals bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +25% damage on first hit."] },
  "Lucky Token": { description: "future relic rewards are luckier and easier to fish for.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: rare relic chance, treasure relic chance, and relic rerolls improve while owned."] },
  "Cracked Lens": { description: "failed submissions reveal one hidden failing test case.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: reveal 1 failed submit test case while owned."] },
  "Practice Blade": { description: "steady physical damage and accuracy for straightforward rooms.", wikiStats: ["Trigger: damage calculation.", "Tuning: small flat physical damage and improved accuracy."] },
  "Ember Chip": { description: "fast solves add a little fire pressure.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: fire damage scales with remaining timer pressure."] },
  "Frost Bookmark": { description: "cold damage softens enemy attacks while studying.", wikiStats: ["Trigger: damage calculation and onIncomingDamage.", "Tuning: small cold damage and minor enemy damage reduction."] },
  "Static Note": { description: "small lightning hits can create extra attack momentum.", wikiStats: ["Trigger: onPlayerDamage.", "Tuning: lightning damage with a small extra hit chance and accuracy."] },
  "Toxin Scratch": { description: "poison helps finish weakened enemies.", wikiStats: ["Trigger: damage calculation.", "Tuning: poison damage and a small execute chance."] },
  "Guard Chalk": { description: "basic defense reduces chip damage from mistakes.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: block chance and flat damage reduction."] },
  "Clean Syntax": { description: "accurate answers crit slightly more often.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: accuracy and crit chance improve clean submissions."] },
  "Salvage Pouch": { description: "combat rewards lean more toward extra drops and gold.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: small loot and gold reward increase."] },
  "Beginner's Map": { description: "combat starts with more readable question information.", wikiStats: ["Trigger: questionStart and buyHint.", "Tuning: reveal one topic and grant one free hint charge."] },
  "Red Thread": { description: "extra life and stronger healing make routes safer.", wikiStats: ["Trigger: healing and max health calculation.", "Tuning: modest max life, healing received, and damage reduction."] },
  "Armor Needle": { description: "small weapon pressure pierces sturdier monsters.", wikiStats: ["Trigger: damage calculation.", "Tuning: physical damage and armor penetration."] },
  "Calm Breath": { description: "rooms begin with a little more breathing room.", wikiStats: ["Trigger: questionStart and onIncomingDamage.", "Tuning: timer grace and minor enemy damage reduction."] },
  "Smoke Step": { description: "dodging rewards confident no-run submissions.", wikiStats: ["Trigger: onIncomingDamage and afterCorrectSubmit.", "Tuning: small dodge chance and no-run submit damage."] },
  "Warm Rations": { description: "clearing rooms restores a little more health.", wikiStats: ["Trigger: onRoomClear and healing.", "Tuning: small life on room clear plus healing received and max life."] },
  "No-Run Blade": { description: "if the player submits without pressing Run Code on that question, deal bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +40% damage."] },
  "Frustration Engine": { description: "each failed submission in the current room adds a damage stack. Stacks clear on room exit.", wikiStats: ["Trigger: afterFailedSubmit and afterCorrectSubmit.", "Tuning: +12% damage per failure, max 5 stacks."] },
  "Pain Capacitor": { description: "taking damage charges the next successful attack.", wikiStats: ["Trigger: onIncomingDamage and afterCorrectSubmit.", "Tuning: next attack deals +50% of damage recently taken."] },
  "Overkill Spark": { description: "excess damage after killing an enemy carries to the next enemy in the same room.", wikiStats: ["Trigger: onPlayerDamage.", "Tuning: carry 50% of overkill damage."] },
  "Paid Insight": { description: "buying a hint empowers the next successful submit.", wikiStats: ["Trigger: buyHint and afterCorrectSubmit.", "Tuning: +30% damage on next submit after hint."] },
  "Gold Timer": { description: "time remaining converts into gold.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +1 gold per 90 seconds remaining, capped at +8."] },
  "Second Wind Timer": { description: "time remaining converts into healing.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: heal 1 per 90 seconds remaining, capped at 6."] },
  "Combo Quill": { description: "consecutive correct answers increase crit chance. A wrong answer resets the bonus.", wikiStats: ["Trigger: afterCorrectSubmit and afterFailedSubmit.", "Tuning: +3% crit per correct submit, max +15%."] },
  "Elite Brand": { description: "elite fights become both easier and more rewarding.", wikiStats: ["Trigger: onPlayerDamage and onEliteClear.", "Tuning: elite damage and elite-only relic choices improve."] },
  "Merchant Shelf": { description: "shops show one extra relic and price it slightly lower.", wikiStats: ["Trigger: shopEnter and getShopItemCost.", "Tuning: shop relic stock and shop discounts improve while owned."] },
  "Campfire Tools": { description: "rest routes leave the next room protected.", wikiStats: ["Trigger: restEnter and nextCombat.", "Tuning: max life and first-hit block improve while owned."] },
  "Challenger Banner": { description: "choosing an elite path grants temporary damage for that room.", wikiStats: ["Trigger: roomEnter.", "Tuning: +20% damage in elite rooms."] },
  "Polished Clover": { description: "luck improves and relic rewards can be rerolled more often.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: +10% rare relic chance and +1 relic reroll."] },
  "Second Heart": { description: "gain 1 revive for the run.", wikiStats: ["Trigger: runDeath.", "Tuning: revive once at partial health."] },
  "Frozen Hourglass": { description: "rooms begin with extra time and the first mistake is guarded.", wikiStats: ["Trigger: questionStart and onIncomingDamage.", "Tuning: timer grace and first-hit block improve while owned."] },
  "Wide Offering": { description: "relic rewards show one extra option and treasure rooms tilt toward relics.", wikiStats: ["Trigger: onRewardGenerated and treasureReward.", "Tuning: choice count and treasure relic chance improve while owned."] },
  "Trophy Hunter": { description: "elite rooms offer wider relic choices and better elite loot.", wikiStats: ["Trigger: onEliteClear.", "Tuning: elite-only relic choice count and elite drop bonus improve."] },
  "Boss Grudge": { description: "bosses take increasing damage after each failed attempt.", wikiStats: ["Trigger: afterFailedSubmit and onPlayerDamage.", "Tuning: +15% boss damage per failed submit, max +75%."] },
  "Lesson Scar": { description: "wrong answers become temporary power.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: after taking damage from a wrong answer, gain +10% damage until room clear."] },
  "Perfect Sprint": { description: "solving under 50% of the time limit grants a reroll charge.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: max 1 charge per room."] },
  "Recovery Tax": { description: "passing after at least one failed test grants bonus gold.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +10 gold if the question had a failed submit first."] },
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
  "Parry Drill": { description: "defensive timing feeds critical openings.", wikiStats: ["Trigger: onIncomingDamage and damage calculation.", "Tuning: parry, block, and crit chance."] },
  "Last Stand Ink": { description: "low-health runs gain comeback damage and sustain.", wikiStats: ["Trigger: damage calculation and healing.", "Tuning: low-health damage, life steal, and enhanced damage."] },
  "Gold Compass": { description: "reward rooms favor gold and item drops.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: magic find, loot chance, and gold find."] },
  "Elite Receipt": { description: "elite routes pay better and die faster.", wikiStats: ["Trigger: roomEnter and onRewardGenerated.", "Tuning: elite damage, elite rewards, and magic find."] },
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
  "Critical Snowball": { description: "every crit increases future crit chance until the player is hit.", wikiStats: ["Trigger: onPlayerDamage and onIncomingDamage.", "Tuning: +5% crit chance per crit, max +25%; resets on health damage."] },
  "Chain Lightning Thesis": { description: "lightning builds chain into speed pressure.", wikiStats: ["Trigger: onPlayerDamage and afterCorrectSubmit.", "Tuning: lightning damage, extra-hit chance, and timer damage improve while owned."] },
  "Glass Crown": { description: "huge damage, but shops cost more.", wikiStats: ["Trigger: damage calculation and getShopItemCost.", "Tuning: +40% damage; shop prices +25%."] },
  "Starved Focus": { description: "more damage, but healing is reduced.", wikiStats: ["Trigger: damage calculation and healing.", "Tuning: +20% damage; all healing -40%."] },
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
  "Blood Relic": { description: "lose max health for wider future relic rewards.", wikiStats: ["Trigger: eventChoice and onRewardGenerated.", "Tuning: max life drops and relic choice count improves while owned."] },
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
  relic("Free Hint Token", "common", "Each room starts with one free hint charge.", { freeHintPerRoom: 1 }),
  relic("Wooden Buckler", "common", "Blocks the first incoming hit in each room.", { blockFirstHit: 1 }),
  relic("Sand Timer", "common", "Fast solves increase submit damage.", { timerDamagePercent: 16 }),
  relic("Study Lens", "common", "Visible topics make each question easier to exploit.", { revealTopicCount: 1, enhancedDamagePercent: 8 }),
  relic("Scratch Notes", "common", "Mistakes reveal information and set up a comeback.", { revealTopicCount: 1, submitFailDamageStackPercent: 5 }),
  relic("Quick Guard", "common", "Fast confident rooms start protected.", { blockFirstHit: 1, timerDamagePercent: 6 }),
  relic("Blood Spark", "common", "Critical hits and room clears restore a little health.", { criticalChancePercent: 4, lifeOnKill: 2 }),
  relic("Small Bounty", "common", "Enemy clears pay more gold and make treasure more relic-heavy.", { goldFindPercent: 10, treasureRelicChancePercent: 10 }),
  relic("Error Cushion", "common", "Mistakes hurt less while you learn the room.", { reducedEnemyDamagePercent: 10, damageReduction: 1 }),
  relic("Opening Strike", "common", "Early successful submits hit harder.", { bonusDamageWhileFullHealthPercent: 10, enhancedDamagePercent: 6 }),
  relic("Lucky Token", "common", "Future relic rewards are luckier and easier to fish for.", { increasedRareDropChancePercent: 6, relicRerollBonus: 1, treasureRelicChancePercent: 5 }),
  relic("Cracked Lens", "common", "Failed submissions reveal one hidden failing test.", { revealSubmitTestCount: 1 }),
  relic("Practice Blade", "common", "Steady physical damage and accuracy.", { physicalDamage: 6, accuracyPercent: 6 }),
  relic("Ember Chip", "common", "Fast solves add fire pressure.", { fireDamage: 5, timerDamagePercent: 6 }),
  relic("Frost Bookmark", "common", "Cold damage makes enemy hits softer.", { coldDamage: 5, reducedEnemyDamagePercent: 4 }),
  relic("Static Note", "common", "Lightning can add extra attack momentum.", { lightningDamage: 5, extraAttackChancePercent: 3, accuracyPercent: 4 }),
  relic("Toxin Scratch", "common", "Poison helps finish weakened rooms.", { poisonDamage: 5, executeChancePercent: 3 }),
  relic("Guard Chalk", "common", "Basic defense reduces chip damage.", { blockChancePercent: 4, damageReduction: 1 }),
  relic("Clean Syntax", "common", "Accurate answers crit slightly more often.", { accuracyPercent: 8, criticalChancePercent: 3 }),
  relic("Salvage Pouch", "common", "Combat rewards lean richer.", { increasedLootDropChancePercent: 8, goldFindPercent: 6 }),
  relic("Beginner's Map", "common", "Start rooms with more readable information.", { revealTopicCount: 1, freeHintPerRoom: 1 }),
  relic("Red Thread", "common", "Extra life and stronger healing.", { maxLife: 6, increasedHealingReceivedPercent: 8, damageReduction: 1 }),
  relic("Armor Needle", "common", "Small weapon pressure pierces monsters.", { physicalDamage: 5, armorPenetrationPercent: 8 }),
  relic("Calm Breath", "common", "Rooms begin with more breathing room.", { timerPauseSeconds: 20, reducedEnemyDamagePercent: 3 }),
  relic("Smoke Step", "common", "Dodging rewards confident no-run submissions.", { dodgeChancePercent: 5, noRunDamagePercent: 15 }),
  relic("Warm Rations", "common", "Room clears restore more health.", { lifeOnKill: 3, increasedHealingReceivedPercent: 6, maxLife: 4 })
];

const UNCOMMON_RELICS: Relic[] = [
  relic("No-Run Blade", "uncommon", "Submitting without Run Code deals much more damage.", { noRunDamagePercent: 40 }),
  relic("Frustration Engine", "uncommon", "Wrong answers add temporary damage stacks for the room.", { submitFailDamageStackPercent: 12 }),
  relic("Pain Capacitor", "uncommon", "Damage taken converts into comeback pressure.", { bonusDamageWhileLowHealthPercent: 25, lifeOnKill: 4 }),
  relic("Overkill Spark", "uncommon", "Strong hits are more likely to chain.", { extraAttackChancePercent: 7, enhancedDamagePercent: 10 }),
  relic("Paid Insight", "uncommon", "Hints become part of your damage plan.", { freeHintPerRoom: 1, enhancedDamagePercent: 12 }),
  relic("Gold Timer", "uncommon", "Fast solves convert into economy.", { timerDamagePercent: 12, goldFindPercent: 14 }),
  relic("Second Wind Timer", "uncommon", "Fast solves become sustain.", { timerDamagePercent: 12, lifeOnKill: 5 }),
  relic("Combo Quill", "uncommon", "Consecutive clean submits build critical pressure.", { criticalChancePercent: 7, criticalDamagePercent: 20 }),
  relic("Elite Brand", "uncommon", "Elite rooms take more damage and offer wider relic rewards.", { bonusDamageVsElitesPercent: 25, eliteRelicChoiceBonus: 1 }),
  relic("Merchant Shelf", "uncommon", "Merchants show one extra relic at a slight discount.", { shopRelicStock: 1, shopDiscountPercent: 4 }),
  relic("Campfire Tools", "uncommon", "Rest routes are safer and more flexible.", { maxLife: 8, blockFirstHit: 1 }),
  relic("Challenger Banner", "uncommon", "Elite routes grant extra room damage.", { bonusDamageVsElitesPercent: 20, enhancedDamagePercent: 8 }),
  relic("Polished Clover", "uncommon", "Luck improves and relic rewards can be rerolled more often.", { increasedRareDropChancePercent: 10, relicRerollBonus: 1 }),
  relic("Flame Margin", "uncommon", "Fire damage comes with fire resistance.", { fireDamage: 10, fireResistPercent: 15, enhancedDamagePercent: 6 }),
  relic("Cold Margin", "uncommon", "Cold builds gain defensive control.", { coldDamage: 10, coldResistPercent: 15, criticalChancePercent: 4 }),
  relic("Storm Margin", "uncommon", "Lightning builds chain more often.", { lightningDamage: 10, lightningResistPercent: 15, extraAttackChancePercent: 5 }),
  relic("Venom Margin", "uncommon", "Poison builds execute low-health enemies.", { poisonDamage: 10, poisonResistPercent: 15, executeChancePercent: 5 }),
  relic("Piercing Thesis", "uncommon", "Armor-heavy enemies lose protection faster.", { armorPenetrationPercent: 18, reducedEnemyArmorPercent: 12, executeChancePercent: 5 }),
  relic("Parry Drill", "uncommon", "Defensive timing feeds critical openings.", { parryChancePercent: 6, blockChancePercent: 5, criticalChancePercent: 4 }),
  relic("Last Stand Ink", "uncommon", "Low-health runs gain comeback pressure.", { bonusDamageWhileLowHealthPercent: 20, lifeStealPercent: 4, enhancedDamagePercent: 6 }),
  relic("Gold Compass", "uncommon", "Reward rooms favor gold and item drops.", { magicFindPercent: 12, increasedLootDropChancePercent: 12, goldFindPercent: 10 }),
  relic("Elite Receipt", "uncommon", "Elite routes pay better and die faster.", { bonusDamageVsElitesPercent: 18, eliteDropBonusPercent: 12, magicFindPercent: 8 }),
  relic("Iron Posture", "uncommon", "Armor and resistance reduce punishment.", { armor: 8, physicalResistPercent: 12, damageReduction: 2 }),
  relic("Deadline Dancer", "uncommon", "Fast solves become safer damage.", { timerDamagePercent: 14, dodgeChancePercent: 5, accuracyPercent: 6 }),
  relic("Hint Furnace", "uncommon", "Help and mistakes become comeback pressure.", { freeHintPerRoom: 1, submitFailDamageStackPercent: 7, revealSubmitTestCount: 1 })
];

const RARE_RELICS: Relic[] = [
  relic("Second Heart", "rare", "Gain 1 revive for the run.", { revivePercent: 40 }),
  relic("Frozen Hourglass", "rare", "Rooms begin with extra time and the first mistake is guarded.", { timerPauseSeconds: 60, blockFirstHit: 1 }),
  relic("Wide Offering", "rare", "Relic rewards widen and treasure leans toward relics.", { relicChoiceBonus: 1, treasureRelicChancePercent: 15 }),
  relic("Trophy Hunter", "rare", "Elite rewards are wider and richer.", { eliteRelicChoiceBonus: 2, eliteDropBonusPercent: 15 }),
  relic("Boss Grudge", "rare", "Failures against hard rooms become damage scaling.", { bonusDamageVsElitesPercent: 25, submitFailDamageStackPercent: 10 }),
  relic("Lesson Scar", "rare", "Wrong answers grant damage for the comeback.", { submitFailDamageStackPercent: 12, enhancedDamagePercent: 8 }),
  relic("Perfect Sprint", "rare", "Fast play grants damage and more reward control.", { timerDamagePercent: 24, relicRerollBonus: 1 }),
  relic("Recovery Tax", "rare", "Recovering after mistakes pays bonus gold.", { submitFailDamageStackPercent: 8, goldFindPercent: 18 }),
  relic("Silent Discipline", "rare", "Skipping help and rewards improves long-term progression.", { skipRelicMetaBonus: 3, noRunDamagePercent: 25 }),
  relic("Iron Choice", "rare", "Skipping relics makes the current run sturdier.", { skipRelicMaxLife: 6, damageReduction: 1 }),
  relic("Ash Offering", "rare", "Skipping relics grants insight and another chance later.", { skipRelicMetaBonus: 6, relicRerollBonus: 1 }),
  relic("Smithing Shrine", "rare", "Passing on relics forges sturdier future choices.", { skipRelicMaxLife: 4, relicRerollBonus: 1 }),
  relic("Backroom Dice", "rare", "Shops and rewards offer more ways to reroll.", { shopRelicStock: 1, relicRerollBonus: 1, shopDiscountPercent: 5 }),
  relic("Alchemist's Menu", "rare", "Potion-style sustain lasts longer.", { potionDurationBonus: 2, increasedHealingReceivedPercent: 18, maxLife: 6 }),
  relic("Fortune Thread", "rare", "Luckier relic rewards also show a wider offering.", { increasedRareDropChancePercent: 18, relicChoiceBonus: 1 }),
  relic("Answer Lantern", "rare", "Failed submissions reveal more hidden cases.", { revealSubmitTestCount: 2, freeHintPerRoom: 1 })
];

const UNIQUE_RELICS: Relic[] = [
  relic("Oracle Dagger", "unique", "Hints become offensive tools.", { freeHintPerRoom: 1, noRunDamagePercent: 25, enhancedDamagePercent: 12 }),
  relic("Midas Core", "unique", "Gold becomes both power and defense.", { goldFindPercent: 25, enhancedDamagePercent: 18, reducedEnemyDamagePercent: 10 }),
  relic("Speed Spiral", "unique", "Fast solves chain into damage and rewards.", { timerDamagePercent: 30, goldFindPercent: 18, enhancedDamagePercent: 12 }),
  relic("Blind Submission", "unique", "No-run submissions become the main damage engine.", { noRunDamagePercent: 80, enhancedDamagePercent: -10 }),
  relic("Unaided Thesis", "unique", "Submit damage is higher until a hint is used on that question.", { noHintDamagePercent: 45, enhancedDamagePercent: 8 }),
  relic("Red Ink Contract", "unique", "Wrong answers grant huge power but increase danger.", { submitFailDamageStackPercent: 18, incomingDamagePercent: 8 }),
  relic("Elite Forge", "unique", "Elite paths are harder but elite rewards widen.", { bonusDamageVsElitesPercent: 45, eliteRelicChoiceBonus: 1, incomingDamagePercent: 10 }),
  relic("Boss Ledger", "unique", "Accept weak normal-room damage for stronger boss rewards.", { enhancedDamagePercent: -10, bonusDamageVsElitesPercent: 35, bossRelicChoiceBonus: 1 }),
  relic("Merchant Kingdom", "unique", "Merchants become the primary power source.", { shopRelicStock: 2, shopDiscountPercent: 15, relicChoiceBonus: -1 }),
  relic("Topic Prism", "unique", "Topic visibility turns into damage identity.", { revealTopicCount: 2, enhancedDamagePercent: 16, criticalChancePercent: 5 }),
  relic("Shield Furnace", "unique", "Unused defense becomes offense.", { blockFirstHit: 1, enhancedDamagePercent: 18 }),
  relic("Critical Snowball", "unique", "Crits build momentum until the run is interrupted.", { criticalChancePercent: 15, criticalDamagePercent: 45, extraAttackChancePercent: 6 }),
  relic("Chain Lightning Thesis", "unique", "Lightning builds chain into speed pressure.", { lightningDamage: 18, extraAttackChancePercent: 12, timerDamagePercent: 12 })
];

const BOSS_RELICS: Relic[] = [
  relic("Glass Crown", "boss", "Huge damage, but shops cost more.", { enhancedDamagePercent: 40, shopPriceIncreasePercent: 25 }),
  relic("Starved Focus", "boss", "More damage, but healing is reduced.", { enhancedDamagePercent: 20, increasedHealingReceivedPercent: -40 }),
  relic("Dangerous Choice", "boss", "More relic choices, but incoming damage rises.", { relicChoiceBonus: 1, incomingDamagePercent: 25 }),
  relic("Phoenix Debt", "boss", "Gain 1 stronger revive with a max-life debt.", { revivePercent: 60, maxLife: -8 }),
  relic("Gold Hourglass", "boss", "More gold under a shorter timer.", { goldFindPercent: 35, timerPenaltyPercent: 20 }),
  relic("Oracle Chain", "boss", "Free hints, but room rewards are weaker.", { freeHintPerRoom: 1, goldFindPercent: -30 }),
  relic("Demon Writ", "boss", "Boss and elite damage is massive, but normal danger rises.", { bonusDamageVsElitesPercent: 60, incomingDamagePercent: 25 }),
  relic("Forbidden Trophy", "boss", "Rare rewards appear more often, but sustain is thinner.", { increasedRareDropChancePercent: 25, increasedHealingReceivedPercent: -25 }),
  relic("Elite Toll", "boss", "Elite rewards are better, but elites are more punishing.", { eliteRelicChoiceBonus: 1, bonusDamageVsElitesPercent: 25, incomingDamagePercent: 12, timerPenaltyPercent: 10 }),
  relic("Volatile Relic Core", "boss", "All future power is sharper and riskier.", { enhancedDamagePercent: 30, incomingDamagePercent: 15 })
];

const SHOP_RELICS: Relic[] = [
  relic("Merchant Token", "shop", "Shop prices are reduced and rewards reroll more often.", { shopDiscountPercent: 15, relicRerollBonus: 1 }),
  relic("Extra Shelf", "shop", "Shops show one extra relic.", { shopRelicStock: 1, relicRerollBonus: 1 }),
  relic("Blood Market", "shop", "Boss-tier shop offers cost health and risk.", { bossShopRelicStock: 1, maxLife: -8, shopPriceIncreasePercent: 8 }),
  relic("Interest Charm", "shop", "Held gold grows between rooms.", { goldFindPercent: 22, shopDiscountPercent: 6 }),
  relic("Spending Temper", "shop", "Shopping becomes pre-combat preparation.", { shopDiscountPercent: 8, enhancedDamagePercent: 10 })
];

const EVENT_RELICS: Relic[] = [
  relic("Risky Curiosity", "event", "Unknown rooms become riskier but more rewarding.", { incomingDamagePercent: 20, goldFindPercent: 35 }),
  relic("Blood Relic", "event", "Lose max health for wider future relic rewards.", { maxLife: -10, relicChoiceBonus: 1, treasureRelicChancePercent: 20 }),
  relic("Golden Mirror", "event", "Spend gold to copy reward power.", { relicChoiceBonus: 1, relicRerollBonus: 1 }),
  relic("Ash Bargain", "event", "Give up relic power for insight.", { skipRelicMetaBonus: 10, maxLife: -5, goldFindPercent: -10 }),
  relic("Duel Shrine", "event", "Optional elite fights lead to unique power.", { bonusDamageVsElitesPercent: 30, eliteRelicChoiceBonus: 1, incomingDamagePercent: 8, timerDamagePercent: 8 })
];

const BLIGHT_RELICS: Relic[] = [
  relic("Short Fuse", "blight", "Question timers are shorter.", { timerPenaltyPercent: 15 }),
  relic("Price Gouge", "blight", "Shop prices are higher.", { shopPriceIncreasePercent: 20 }),
  relic("Withered Flask", "blight", "Healing is reduced.", { increasedHealingReceivedPercent: -35 }),
  relic("Sharp Shadows", "blight", "Normal rooms hit harder.", { incomingDamagePercent: 20 }),
  relic("Cold Campfire", "blight", "Healing and max life are lower.", { increasedHealingReceivedPercent: -20, maxLife: -5, timerPenaltyPercent: 5 }),
  relic("Elite Burden", "blight", "Elites are harder to burst down.", { bonusDamageVsElitesPercent: -20, incomingDamagePercent: 8, timerPenaltyPercent: 5 }),
  relic("Oracle Tax", "blight", "Rewards shrink when relying on help.", { goldFindPercent: -20, freeHintPerRoom: -1, shopPriceIncreasePercent: 8 }),
  relic("Heavy Coffers", "blight", "Power drops while shops get pricier.", { enhancedDamagePercent: -8, shopPriceIncreasePercent: 10, timerDamagePercent: -8 }),
  relic("Weak Dawn", "blight", "Start weaker with less max life.", { maxLife: -12 }),
  relic("Cursed Beginning", "blight", "Relic control drops and timers tighten.", { relicRerollBonus: -1, timerPenaltyPercent: 8 }),
  relic("Narrow Offering", "blight", "Relic choices are narrower and rooms are more dangerous.", { relicChoiceBonus: -1, incomingDamagePercent: 5, relicRerollBonus: -1 }),
  relic("Dull Blade", "blight", "Critical builds lose sharpness.", { accuracyPercent: -8, criticalChancePercent: -6, criticalDamagePercent: -20 }),
  relic("Brittle Shield", "blight", "Enemy damage mitigation is weaker.", { blockChancePercent: -6, damageReduction: -2, reducedEnemyDamagePercent: -8 }),
  relic("Blind Map", "blight", "Less information is visible and damage is weaker.", { revealTopicCount: -1, enhancedDamagePercent: -5, revealSubmitTestCount: -1 }),
  relic("Expensive Lessons", "blight", "Shops cost more and skipped relics pay less.", { skipRelicMetaBonus: -2, shopPriceIncreasePercent: 12 }),
  relic("Leaking Flask", "blight", "Sustain effects are weaker.", { lifeOnKill: -3, increasedHealingReceivedPercent: -15 }),
  relic("Rusty Coin", "blight", "Gold rewards shrink.", { goldFindPercent: -25, magicFindPercent: -10 }),
  relic("Slow Mind", "blight", "Timer grace and speed damage are reduced.", { timerPauseSeconds: -20, timerDamagePercent: -10 })
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
  return (getRelicModifierTotals(state).increasedRareDropChancePercent || 0) + metaLuck;
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
