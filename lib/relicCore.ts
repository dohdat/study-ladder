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
  "Focus Tap": { description: "damage dealt builds short-term reward momentum.", wikiStats: ["Trigger: onPlayerDamage.", "Tuning: successful submits improve gold and damage for the run."] },
  "Coupon Charm": { description: "all shop prices are reduced.", wikiStats: ["Trigger: shopEnter / getShopItemCost.", "Tuning: 10% discount."] },
  "Campfire Guard": { description: "after resting, gain shield for the next combat room.", wikiStats: ["Trigger: restEnter.", "Tuning: block first 5 damage next combat."] },
  "Small Bounty": { description: "enemy rooms grant extra gold.", wikiStats: ["Trigger: onRoomClear.", "Tuning: +5 gold on normal enemy room clear."] },
  "Error Cushion": { description: "first syntax/runtime error each room deals reduced damage.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: reduce incoming penalty by 50% once per room."] },
  "Unused Advice": { description: "unused free hint charges convert to gold.", wikiStats: ["Trigger: onRoomClear.", "Tuning: +6 gold per unused charge."] },
  "Mystery Reward": { description: "hidden topics increase room reward value.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: +5% gold and +3% meta currency per hidden topic at completion."] },
  "Opening Strike": { description: "first successful submit each room deals bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +25% damage on first hit."] },
  "No-Run Blade": { description: "if the player submits without pressing Run Code on that question, deal bonus damage.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +40% damage."] },
  "Frustration Engine": { description: "each failed submission in the current room adds a damage stack. Stacks clear on room exit.", wikiStats: ["Trigger: afterFailedSubmit and afterCorrectSubmit.", "Tuning: +12% damage per failure, max 5 stacks."] },
  "Pain Capacitor": { description: "taking damage charges the next successful attack.", wikiStats: ["Trigger: onIncomingDamage and afterCorrectSubmit.", "Tuning: next attack deals +50% of damage recently taken."] },
  "Overkill Spark": { description: "excess damage after killing an enemy carries to the next enemy in the same room.", wikiStats: ["Trigger: onPlayerDamage.", "Tuning: carry 50% of overkill damage."] },
  "Paid Insight": { description: "buying a hint empowers the next successful submit.", wikiStats: ["Trigger: buyHint and afterCorrectSubmit.", "Tuning: +30% damage on next submit after hint."] },
  "Revealing Lantern": { description: "buying a hint reveals all topics for the current question.", wikiStats: ["Trigger: buyHint.", "Tuning: reveal all current-question topics only."] },
  "Focused Tutoring": { description: "hints become cheaper and feed reward momentum.", wikiStats: ["Trigger: buyHint.", "Tuning: hints cost less and reward disciplined solves."] },
  "Gold Timer": { description: "time remaining converts into gold.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +1 gold per 90 seconds remaining, capped at +8."] },
  "Second Wind Timer": { description: "time remaining converts into healing.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: heal 1 per 90 seconds remaining, capped at 6."] },
  "Combo Quill": { description: "consecutive correct answers increase crit chance. A wrong answer resets the bonus.", wikiStats: ["Trigger: afterCorrectSubmit and afterFailedSubmit.", "Tuning: +3% crit per correct submit, max +15%."] },
  "Elite Brand": { description: "deal bonus damage to elites.", wikiStats: ["Trigger: onPlayerDamage.", "Tuning: +35% damage against elite rooms."] },
  "Merchant Shelf": { description: "shops show one extra relic.", wikiStats: ["Trigger: shopEnter.", "Tuning: +1 relic listing."] },
  "Campfire Tools": { description: "rest sites offer one extra action instead of a single fixed reward.", wikiStats: ["Trigger: restEnter.", "Tuning: choose heal, smith, or dig."] },
  "Treasure Compass": { description: "treasure rooms are more likely to offer relics instead of gold/potions.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: +35% relic chance."] },
  "Safe Curiosity": { description: "unknown rooms are safer but less rewarding.", wikiStats: ["Trigger: unknown room resolution.", "Tuning: remove elite outcome, reduce gold/relic rewards by 20%."] },
  "Challenger Banner": { description: "choosing an elite path grants temporary damage for that room.", wikiStats: ["Trigger: roomEnter.", "Tuning: +20% damage in elite rooms."] },
  "Heavy Purse": { description: "gold above a threshold increases damage.", wikiStats: ["Trigger: damage calculation.", "Tuning: every 50 gold above 100 gives +3% damage, max +18%."] },
  "Spending Rush": { description: "spending gold buffs the next combat room.", wikiStats: ["Trigger: shopPurchase.", "Tuning: +1% damage per 10 gold spent, max +25%, one room."] },
  "Long Bottle": { description: "potions last one extra room.", wikiStats: ["Trigger: potionApply.", "Tuning: +1 room duration."] },
  "Clean Draft": { description: "reward choices avoid duplicate modifier families when possible.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: reroll duplicate archetypes up to 5 attempts."] },
  "Second Heart": { description: "revive once per run instead of dying.", wikiStats: ["Trigger: runDeath.", "Tuning: revive at 40% max health."] },
  "Frozen Hourglass": { description: "first timeout each act pauses the question instead of failing it.", wikiStats: ["Trigger: timeout.", "Tuning: once per act, restore 30 seconds and pause fullscreen failure."] },
  "Golden Ticket": { description: "first shop purchase each act is free.", wikiStats: ["Trigger: shopPurchase.", "Tuning: item cost becomes 0 once per act."] },
  "Wide Offering": { description: "relic rewards show one extra option.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: choice count +1."] },
  "Polished Dice": { description: "once per act, reroll all relic choices.", wikiStats: ["Trigger: rewardChoice.", "Tuning: 1 charge per act."] },
  "Trophy Hunter": { description: "elite rooms offer two relic choices instead of one.", wikiStats: ["Trigger: onEliteClear.", "Tuning: generate 2 pick-1 relic reward rows or pick 1 from 4."] },
  "Reliquary Key": { description: "treasure rooms always offer relics.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: replace non-relic treasure rewards with relic choice."] },
  "Boss Grudge": { description: "bosses take increasing damage after each failed attempt.", wikiStats: ["Trigger: afterFailedSubmit and onPlayerDamage.", "Tuning: +15% boss damage per failed submit, max +75%."] },
  "Lesson Scar": { description: "wrong answers become temporary power.", wikiStats: ["Trigger: afterFailedSubmit.", "Tuning: after taking damage from a wrong answer, gain +10% damage until room clear."] },
  "Perfect Sprint": { description: "solving under 50% of the time limit grants a reroll charge.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: max 1 charge per room."] },
  "Recovery Tax": { description: "passing after at least one failed test grants bonus gold.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: +10 gold if the question had a failed submit first."] },
  "Silent Discipline": { description: "clearing a room without hints grants meta currency.", wikiStats: ["Trigger: onRoomClear.", "Tuning: +1 meta currency per combat room, +3 for elite, +5 for boss."] },
  "Iron Choice": { description: "skipping a relic grants max health for the current run.", wikiStats: ["Trigger: onRewardSkipped.", "Tuning: +5 max health and heal 5."] },
  "Ash Offering": { description: "skipping a relic grants meta currency.", wikiStats: ["Trigger: onRewardSkipped.", "Tuning: +3 meta currency for common/uncommon, +6 for rare, +10 for boss."] },
  "Smithing Shrine": { description: "rest sites can upgrade one current relic.", wikiStats: ["Trigger: restEnter.", "Tuning: pick 1 of 3 owned relics; upgrade numbers by 25% or improve charge count by 1."] },
  "Backroom Dice": { description: "shops sell relic rerolls.", wikiStats: ["Trigger: shopEnter.", "Tuning: reroll token costs 45 gold."] },
  "Alchemist's Menu": { description: "random potion becomes choose-one-of-three.", wikiStats: ["Trigger: potionRewardGenerated or potionUse.", "Tuning: show 3 potion options whenever a random potion would be generated."] },
  "No Rest Bonus": { description: "completing a floor segment without resting grants bonus reward.", wikiStats: ["Trigger: onFloorAdvanced or onActClear.", "Tuning: if no rest in last 4 rooms, next reward gets +1 rarity tier chance."] },
  "Window Shopper": { description: "completing an act without visiting a shop grants a rare relic.", wikiStats: ["Trigger: onActClear.", "Tuning: generate rare relic choice at act end."] },
  "Oracle Dagger": { description: "hints become attacks. Buying a hint immediately deals damage, then the next submit deals bonus damage.", wikiStats: ["Trigger: buyHint and afterCorrectSubmit.", "Tuning: hint deals 20% of enemy max health; next submit +25% damage."] },
  "Midas Core": { description: "gold becomes both damage and defense.", wikiStats: ["Trigger: damage calculation and onIncomingDamage.", "Tuning: every 50 gold gives +4% damage and reduces incoming damage by 1%, capped at 20%."] },
  "Speed Spiral": { description: "fast solves chain into increasing rewards.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: solving with 60%+ time remaining adds 1 speed stack. Each stack gives +5% gold and damage. Stack resets on fail or slow solve. Max 6."] },
  "Blind Submission": { description: "no-run submissions become the main damage engine.", wikiStats: ["Trigger: afterCorrectSubmit.", "Tuning: if no Run Code was used, deal +80% damage and gain +1 meta currency on room clear. If Run Code was used, deal -15% damage."] },
  "Red Ink Contract": { description: "every wrong answer increases power but raises danger.", wikiStats: ["Trigger: afterFailedSubmit and onIncomingDamage.", "Tuning: +18% damage per wrong answer, but incoming damage also +8%. Resets on room clear."] },
  "Elite Forge": { description: "elites are harder but permanently scale the run.", wikiStats: ["Trigger: roomEnter and onEliteClear.", "Tuning: elites have +30% health/damage. Each elite clear upgrades a random relic or grants +5% run damage."] },
  "Boss Ledger": { description: "weak early, massive boss scaling.", wikiStats: ["Trigger: runStart, roomEnter, onBossClear.", "Tuning: normal rooms deal -10% damage. Each boss clear grants +25% boss damage and +1 relic choice for boss rewards."] },
  "Campfire Crown": { description: "rest sites upgrade relics instead of only healing.", wikiStats: ["Trigger: restEnter.", "Tuning: choose heal or upgrade. Upgrade improves one relic by 25%."] },
  "Merchant Kingdom": { description: "merchants become primary power source.", wikiStats: ["Trigger: shopEnter and shopPurchase.", "Tuning: shops have +2 relics, all relics 15% cheaper, but non-shop room relic rewards are 25% less likely."] },
  "Topic Prism": { description: "repeated topics stack damage.", wikiStats: ["Trigger: questionStart and afterCorrectSubmit.", "Tuning: each time a topic appears in the run, gain +2% damage on future questions with that topic. Cap +20% per topic."] },
  "Archive Engine": { description: "mastered questions give less direct reward but stronger scaling.", wikiStats: ["Trigger: questionStart and onRoomClear.", "Tuning: mastered questions give -25% gold but +1 archive stack. Each archive stack gives +1% meta currency gain this run."] },
  "Frontier Compass": { description: "unsolved questions give big reward and meta payout.", wikiStats: ["Trigger: questionStart and onRoomClear.", "Tuning: first-time solves give +50% gold and +3 meta currency."] },
  "Shield Furnace": { description: "unused block converts to damage.", wikiStats: ["Trigger: onRoomClear or afterCorrectSubmit.", "Tuning: each unused shield point adds +2 damage to next attack, capped at +20."] },
  "Critical Snowball": { description: "every crit increases future crit chance until the player is hit.", wikiStats: ["Trigger: onPlayerDamage and onIncomingDamage.", "Tuning: +5% crit chance per crit, max +25%; resets on health damage."] },
  "Chain Lightning Thesis": { description: "excess damage keeps carrying between enemies.", wikiStats: ["Trigger: onPlayerDamage.", "Tuning: 75% overkill carries within room; 25% carries to next room."] },
  "Memory Seal": { description: "preserve one relic after beating an act.", wikiStats: ["Trigger: onActClear.", "Tuning: choose 1 current relic to add to next run's starter choices, or keep it for the next act only."] },
  "Mirror Reward": { description: "duplicate a relic reward once per run.", wikiStats: ["Trigger: rewardChoice.", "Tuning: when choosing a relic, spend the charge to gain a duplicate upgraded copy or a linked secondary relic."] },
  "Pattern Magnet": { description: "rewards favor current build archetype.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: if player has 2+ relics from an archetype, future rewards have +35% chance to include that archetype."] },
  "Polishing Stone": { description: "common relics upgrade after 3 room clears.", wikiStats: ["Trigger: onRoomClear.", "Tuning: track room clears per common relic, upgrade once at 3."] },
  "Glass Crown": { description: "huge damage, but shops cost more.", wikiStats: ["Trigger: damage calculation and getShopItemCost.", "Tuning: +40% damage; shop prices +25%."] },
  "Starved Focus": { description: "more damage, but healing is reduced.", wikiStats: ["Trigger: damage calculation and healing.", "Tuning: +20% damage; all healing -40%."] },
  "Dangerous Choice": { description: "more relic choices, but elites are stronger.", wikiStats: ["Trigger: onRewardGenerated and roomEnter.", "Tuning: relic choice count +1; elites +25% health/damage."] },
  "Phoenix Debt": { description: "revive once, but each act starts with lower health.", wikiStats: ["Trigger: runDeath and actStart.", "Tuning: revive once at 60% health; act start health capped at 70%."] },
  "Gold Hourglass": { description: "more gold, but timer is shorter.", wikiStats: ["Trigger: reward calculation and question timer.", "Tuning: +35% gold; -20% question time."] },
  "Oracle Chain": { description: "free hints, but hint use reduces rewards.", wikiStats: ["Trigger: buyHint and reward calculation.", "Tuning: 1 free hint per question; using any hint reduces room gold/meta by 30%."] },
  "Demon Writ": { description: "massive boss damage, but normal rooms hit harder.", wikiStats: ["Trigger: damage calculation and onIncomingDamage.", "Tuning: +60% boss damage; +25% incoming damage in non-boss combat."] },
  "Forbidden Trophy": { description: "rare rewards appear more often, but rest healing is disabled.", wikiStats: ["Trigger: onRewardGenerated and restEnter.", "Tuning: +25% rare/unique chance; rest can smith/dig only."] },
  "Elite Toll": { description: "elite clears give extra relics, but elite rooms require 3 questions.", wikiStats: ["Trigger: onEliteClear and roomEnter.", "Tuning: elite reward choice +1; elite room question count fixed at 3."] },
  "Volatile Relic Core": { description: "every future relic has stronger effects and stronger downsides.", wikiStats: ["Trigger: onRewardGenerated.", "Tuning: future relic positive numbers +30%; future relic downside numbers +30%; add downside to relics without one where possible."] },
  "Dry Flask": { description: "cannot buy potions, but every room heals slightly.", wikiStats: ["Trigger: shopEnter, potionRewardGenerated, onRoomClear.", "Tuning: remove potion stock/rewards; heal 4 after each room."] },
  "Veiled Map": { description: "hidden topics greatly increase rewards, but visible topics are reduced.", wikiStats: ["Trigger: questionStart and reward calculation.", "Tuning: show 0 topics by default; +20% reward per hidden topic on clear."] },
  "Merchant Token": { description: "shop discount.", wikiStats: ["Trigger: getShopItemCost.", "Tuning: 15% discount."] },
  "Extra Shelf": { description: "shops show one extra relic.", wikiStats: ["Trigger: shopEnter.", "Tuning: +1 relic listing."] },
  "Dice Vendor": { description: "shops sell relic rerolls.", wikiStats: ["Trigger: shopEnter.", "Tuning: add one reroll service for 45 gold."] },
  "Bundle Pricing": { description: "buying a non-relic item reduces relic prices for the rest of the shop.", wikiStats: ["Trigger: shopPurchase.", "Tuning: -10% relic price per equipment/potion purchase, max -30%."] },
  "Healing Purchase": { description: "buying a relic heals you.", wikiStats: ["Trigger: shopPurchase.", "Tuning: heal 8 health per relic purchase."] },
  "Hint Coupon": { description: "buying a hint discounts the next shop item.", wikiStats: ["Trigger: buyHint.", "Tuning: next shop purchase -20%."] },
  "First One Free": { description: "first shop purchase each act is free.", wikiStats: ["Trigger: shopPurchase.", "Tuning: one free purchase per act."] },
  "Blood Market": { description: "shop relics can include boss relics, but cost health.", wikiStats: ["Trigger: shopEnter and shopPurchase.", "Tuning: one boss relic listing; price is 20 max health or 40% current health."] },
  "Interest Charm": { description: "gold earns interest after each room.", wikiStats: ["Trigger: onRoomClear.", "Tuning: +8% current gold, capped at +20 per room."] },
  "Spending Temper": { description: "spending gold buffs next combat.", wikiStats: ["Trigger: shopPurchase and roomEnter.", "Tuning: gain +1% damage per 10 gold spent last shop, max +30%."] },
  "Risky Curiosity": { description: "unknown rooms become riskier but more rewarding.", wikiStats: ["Trigger: unknown room resolution.", "Tuning: +20% chance of elite/event danger; +35% rewards from unknown rooms."] },
  "Relic Transmuter": { description: "transform current relics into stronger random relics.", wikiStats: ["Trigger: eventChoice.", "Tuning: choose 1 owned relic; replace it with a random rare/unique relic."] },
  "Blood Relic": { description: "lose max health, gain a unique relic.", wikiStats: ["Trigger: eventChoice.", "Tuning: -10 max health; gain random unique relic."] },
  "Golden Mirror": { description: "give up gold to duplicate a relic.", wikiStats: ["Trigger: eventChoice.", "Tuning: pay 150 gold to duplicate or upgrade a current relic."] },
  "Ash Bargain": { description: "give up a relic to gain meta currency.", wikiStats: ["Trigger: eventChoice.", "Tuning: remove selected relic; gain 10-25 meta based on rarity."] },
  "Cursed Cache": { description: "gain a curse and a rare relic.", wikiStats: ["Trigger: eventChoice.", "Tuning: add one blight/curse; offer rare relic choice."] },
  "Upgrade Debt": { description: "skip next reward, upgrade all current relics.", wikiStats: ["Trigger: eventChoice and nextReward.", "Tuning: all owned relics get +15-20%; next reward screen auto-skips."] },
  "Duel Shrine": { description: "fight an optional elite for a unique relic.", wikiStats: ["Trigger: eventChoice.", "Tuning: enter immediate elite combat; on clear, offer unique relic."] },
  "Painful Tutoring": { description: "hints cost health instead of gold.", wikiStats: ["Trigger: buyHint.", "Tuning: hint costs 4 health; cannot use if it would kill the player."] },
  "Grave Lesson": { description: "first death each day gives bonus meta currency.", wikiStats: ["Trigger: runDeath.", "Tuning: +10 meta once per local day."] },
  "Short Fuse": { description: "timer is shorter.", wikiStats: ["Trigger: questionStart.", "Tuning: -15% question time."] },
  "Price Gouge": { description: "shops cost more.", wikiStats: ["Trigger: getShopItemCost.", "Tuning: +20% shop prices."] },
  "Withered Flask": { description: "healing reduced.", wikiStats: ["Trigger: healing.", "Tuning: -35% healing received."] },
  "Cold Campfire": { description: "rest sites cannot heal.", wikiStats: ["Trigger: restEnter.", "Tuning: remove heal option, keep smith/dig if available."] },
  "Elite Burden": { description: "elites require more questions.", wikiStats: ["Trigger: roomEnter.", "Tuning: elite rooms always have 3 questions."] },
  "Sharp Shadows": { description: "normal rooms hit harder.", wikiStats: ["Trigger: onIncomingDamage.", "Tuning: +20% incoming damage in non-elite, non-boss rooms."] },
  "Oracle Tax": { description: "rewards reduced after hint use.", wikiStats: ["Trigger: reward calculation.", "Tuning: -25% gold/meta if any hint was used in the room."] },
  "Heavy Coffers": { description: "hoarding gold increases boss damage taken.", wikiStats: ["Trigger: onBossEnter or onIncomingDamage.", "Tuning: bosses deal +1% damage per 25 gold, capped at +30%."] },
  "Weak Dawn": { description: "start each act at lower health.", wikiStats: ["Trigger: actStart.", "Tuning: current health capped at 70% max health."] },
  "Cursed Beginning": { description: "run starts with a curse for extra meta currency.", wikiStats: ["Trigger: runStart.", "Tuning: choose 1 curse; +20% meta currency for the run."] }
};

const COMMON_RELICS: Relic[] = [
  relic("Free Hint Token", "common", "Each room starts with one free hint charge.", { freeHintPerRoom: 1 }),
  relic("Wooden Buckler", "common", "Blocks the first incoming hit in each room.", { blockFirstHit: 1 }),
  relic("Sand Timer", "common", "Remaining question time increases submit damage.", { timerDamagePercent: 14 }),
  relic("Study Lens", "common", "More visible question topics improve damage.", { revealTopicCount: 1, enhancedDamagePercent: 8 }),
  relic("Scratch Notes", "common", "Reveal one extra topic to recover from early mistakes.", { revealTopicCount: 1 }),
  relic("Quick Guard", "common", "Fast confident rooms start protected.", { blockFirstHit: 1, damageReduction: 1 }),
  relic("Blood Spark", "common", "Critical hits and completions restore a little health.", { criticalChancePercent: 4, lifeOnKill: 2 }),
  relic("Focus Tap", "common", "Successful submits build reward momentum.", { enhancedDamagePercent: 6, goldFindPercent: 6 }),
  relic("Coupon Charm", "common", "Shop prices are reduced.", { shopDiscountPercent: 10 }),
  relic("Campfire Guard", "common", "Rest routes make the next fights safer.", { blockFirstHit: 1, maxLife: 4 }),
  relic("Small Bounty", "common", "Enemy clears pay slightly more gold.", { goldFindPercent: 12 }),
  relic("Error Cushion", "common", "The first mistakes in a room hurt less.", { reducedEnemyDamagePercent: 10 }),
  relic("Unused Advice", "common", "Free-hint runs can pivot into economy.", { freeHintPerRoom: 1, goldFindPercent: 8 }),
  relic("Mystery Reward", "common", "Unknown information improves room payouts.", { goldFindPercent: 12 }),
  relic("Opening Strike", "common", "Early successful submits hit harder.", { enhancedDamagePercent: 12 })
];

const UNCOMMON_RELICS: Relic[] = [
  relic("No-Run Blade", "uncommon", "Submitting without Run Code deals much more damage.", { noRunDamagePercent: 40 }),
  relic("Frustration Engine", "uncommon", "Wrong answers add temporary damage stacks for the room.", { submitFailDamageStackPercent: 12 }),
  relic("Pain Capacitor", "uncommon", "Damage taken converts into comeback pressure.", { bonusDamageWhileLowHealthPercent: 25, lifeOnKill: 4 }),
  relic("Overkill Spark", "uncommon", "Strong hits are more likely to chain.", { extraAttackChancePercent: 7, enhancedDamagePercent: 10 }),
  relic("Paid Insight", "uncommon", "Hints become part of your damage plan.", { freeHintPerRoom: 1, enhancedDamagePercent: 10 }),
  relic("Revealing Lantern", "uncommon", "Hints and question starts reveal more topics.", { revealTopicCount: 3 }),
  relic("Focused Tutoring", "uncommon", "Hints become cheaper and feed reward momentum.", { freeHintPerRoom: 1, goldFindPercent: 10 }),
  relic("Gold Timer", "uncommon", "Fast solves convert into better economy.", { timerDamagePercent: 10, goldFindPercent: 14 }),
  relic("Second Wind Timer", "uncommon", "Fast solves become sustain.", { timerDamagePercent: 10, lifeOnKill: 5 }),
  relic("Combo Quill", "uncommon", "Consecutive clean submits build critical pressure.", { criticalChancePercent: 7, criticalDamagePercent: 20 }),
  relic("Elite Brand", "uncommon", "Elite rooms take much more damage.", { bonusDamageVsElitesPercent: 35 }),
  relic("Merchant Shelf", "uncommon", "Merchants show one extra relic.", { shopRelicStock: 1 }),
  relic("Campfire Tools", "uncommon", "Rest routes are safer and more flexible.", { maxLife: 8, blockFirstHit: 1 }),
  relic("Treasure Compass", "uncommon", "Treasure rewards lean toward stronger relic offers.", { relicChoiceBonus: 1 }),
  relic("Safe Curiosity", "uncommon", "Unknown paths are safer but less explosive.", { damageReduction: 1, goldFindPercent: -8 }),
  relic("Challenger Banner", "uncommon", "Elite routes grant extra room damage.", { bonusDamageVsElitesPercent: 20, enhancedDamagePercent: 8 }),
  relic("Heavy Purse", "uncommon", "A strong economy also improves damage.", { goldFindPercent: 14, enhancedDamagePercent: 10 }),
  relic("Spending Rush", "uncommon", "Shopping helps prepare the next fights.", { shopDiscountPercent: 8, enhancedDamagePercent: 8 }),
  relic("Long Bottle", "uncommon", "Potion and healing builds last longer.", { increasedHealingReceivedPercent: 15, maxLife: 5 }),
  relic("Clean Draft", "uncommon", "Reward screens are easier to fix with rerolls.", { relicRerollBonus: 1 })
];

const RARE_RELICS: Relic[] = [
  relic("Second Heart", "rare", "Revive once per room at low health instead of dying.", { revivePercent: 40 }),
  relic("Frozen Hourglass", "rare", "The timer starts with a larger grace period.", { timerPauseSeconds: 60 }),
  relic("Golden Ticket", "rare", "Major shop discounts make merchant paths powerful.", { shopDiscountPercent: 25 }),
  relic("Wide Offering", "rare", "Relic rewards show one extra option.", { relicChoiceBonus: 1 }),
  relic("Polished Dice", "rare", "Relic rewards gain an extra reroll.", { relicRerollBonus: 1 }),
  relic("Trophy Hunter", "rare", "Elite rewards are wider and elites take more damage.", { relicChoiceBonus: 1, bonusDamageVsElitesPercent: 20 }),
  relic("Reliquary Key", "rare", "Treasure rooms become reliable relic accelerators.", { relicChoiceBonus: 1, magicFindPercent: 15 }),
  relic("Boss Grudge", "rare", "Failures against hard rooms become damage scaling.", { bonusDamageVsElitesPercent: 25, submitFailDamageStackPercent: 10 }),
  relic("Lesson Scar", "rare", "Wrong answers grant damage for the comeback.", { submitFailDamageStackPercent: 12, enhancedDamagePercent: 8 }),
  relic("Perfect Sprint", "rare", "Fast play grants damage and more reward control.", { timerDamagePercent: 24, relicRerollBonus: 1 }),
  relic("Recovery Tax", "rare", "Recovering after mistakes pays bonus gold.", { submitFailDamageStackPercent: 8, goldFindPercent: 18 }),
  relic("Silent Discipline", "rare", "Skipping help improves long-term progression.", { skipRelicMetaBonus: 3, goldFindPercent: 10 }),
  relic("Iron Choice", "rare", "Skipping relics makes the current run sturdier.", { skipRelicMetaBonus: 2, maxLife: 10 }),
  relic("Ash Offering", "rare", "Skipping relics grants much more insight.", { skipRelicMetaBonus: 6 }),
  relic("Smithing Shrine", "rare", "Rest routes refine your build instead of only healing.", { enhancedDamagePercent: 14, relicRerollBonus: 1 }),
  relic("Backroom Dice", "rare", "Shops and rewards offer more ways to reroll.", { shopRelicStock: 1, relicRerollBonus: 1 }),
  relic("Alchemist's Menu", "rare", "Potion-style sustain is stronger.", { increasedHealingReceivedPercent: 25, maxLife: 8 }),
  relic("No Rest Bonus", "rare", "Skipping recovery turns into pressure.", { maxLife: 8, enhancedDamagePercent: 14 }),
  relic("Window Shopper", "rare", "Avoiding shops pushes relic rewards higher.", { relicChoiceBonus: 1, magicFindPercent: 12 })
];

const UNIQUE_RELICS: Relic[] = [
  relic("Oracle Dagger", "unique", "Hints become offensive tools.", { freeHintPerRoom: 1, noRunDamagePercent: 25, enhancedDamagePercent: 12 }),
  relic("Midas Core", "unique", "Gold becomes both power and defense.", { goldFindPercent: 25, enhancedDamagePercent: 18, reducedEnemyDamagePercent: 10 }),
  relic("Speed Spiral", "unique", "Fast solves chain into damage and rewards.", { timerDamagePercent: 30, goldFindPercent: 18, enhancedDamagePercent: 12 }),
  relic("Blind Submission", "unique", "No-run submissions become the main damage engine.", { noRunDamagePercent: 80, enhancedDamagePercent: -10 }),
  relic("Red Ink Contract", "unique", "Wrong answers grant huge power but increase danger.", { submitFailDamageStackPercent: 18, incomingDamagePercent: 8 }),
  relic("Elite Forge", "unique", "Elite paths are harder but accelerate scaling.", { bonusDamageVsElitesPercent: 45, relicChoiceBonus: 1, incomingDamagePercent: 10 }),
  relic("Boss Ledger", "unique", "Accept weak normal-room damage for stronger boss rewards.", { enhancedDamagePercent: -10, bonusDamageVsElitesPercent: 35, relicChoiceBonus: 1 }),
  relic("Campfire Crown", "unique", "Rest routes become relic-development routes.", { relicRerollBonus: 1, maxLife: 14 }),
  relic("Merchant Kingdom", "unique", "Merchants become the primary power source.", { shopRelicStock: 2, shopDiscountPercent: 15, relicChoiceBonus: -1 }),
  relic("Topic Prism", "unique", "Topic visibility turns into damage identity.", { revealTopicCount: 2, enhancedDamagePercent: 16 }),
  relic("Archive Engine", "unique", "Mastered knowledge turns into long-run progression.", { goldFindPercent: 15, skipRelicMetaBonus: 2 }),
  relic("Frontier Compass", "unique", "First-time progress pays extra rewards.", { goldFindPercent: 28, skipRelicMetaBonus: 2 }),
  relic("Shield Furnace", "unique", "Unused defense becomes offense.", { blockFirstHit: 1, enhancedDamagePercent: 18 }),
  relic("Critical Snowball", "unique", "Crits build momentum until the run is interrupted.", { criticalChancePercent: 15, criticalDamagePercent: 45 }),
  relic("Chain Lightning Thesis", "unique", "Excess pressure carries between enemies.", { lightningDamage: 18, extraAttackChancePercent: 12 }),
  relic("Memory Seal", "unique", "Act clears preserve more build agency.", { relicChoiceBonus: 1, relicRerollBonus: 1 }),
  relic("Mirror Reward", "unique", "Reward screens can be copied or rebuilt.", { relicChoiceBonus: 1, relicRerollBonus: 2 }),
  relic("Pattern Magnet", "unique", "Future rewards favor your current build shape.", { relicChoiceBonus: 1, magicFindPercent: 18 }),
  relic("Polishing Stone", "unique", "Common relics stay relevant through room clears.", { enhancedDamagePercent: 16, relicRerollBonus: 1 })
];

const BOSS_RELICS: Relic[] = [
  relic("Glass Crown", "boss", "Huge damage, but shops cost more.", { enhancedDamagePercent: 40, shopPriceIncreasePercent: 25 }),
  relic("Starved Focus", "boss", "More damage, but healing is reduced.", { enhancedDamagePercent: 20, increasedHealingReceivedPercent: -40 }),
  relic("Dangerous Choice", "boss", "More relic choices, but incoming damage rises.", { relicChoiceBonus: 1, incomingDamagePercent: 25 }),
  relic("Phoenix Debt", "boss", "A stronger revive with a max-life debt.", { revivePercent: 60, maxLife: -8 }),
  relic("Gold Hourglass", "boss", "More gold under a shorter timer.", { goldFindPercent: 35, timerPenaltyPercent: 20 }),
  relic("Oracle Chain", "boss", "Free hints, but room rewards are weaker.", { freeHintPerRoom: 1, goldFindPercent: -30 }),
  relic("Demon Writ", "boss", "Boss and elite damage is massive, but normal danger rises.", { bonusDamageVsElitesPercent: 60, incomingDamagePercent: 25 }),
  relic("Forbidden Trophy", "boss", "Rare rewards appear more often, but sustain is thinner.", { increasedRareDropChancePercent: 25, increasedHealingReceivedPercent: -25 }),
  relic("Elite Toll", "boss", "Elite rewards are better, but elites are more punishing.", { relicChoiceBonus: 1, bonusDamageVsElitesPercent: 25, incomingDamagePercent: 12 }),
  relic("Volatile Relic Core", "boss", "All future power is sharper and riskier.", { enhancedDamagePercent: 30, incomingDamagePercent: 15 }),
  relic("Dry Flask", "boss", "Rooms heal you, but potion sustain matters less.", { healthRegen: 4, increasedHealingReceivedPercent: -20 }),
  relic("Veiled Map", "boss", "Hidden information increases rewards under time pressure.", { revealTopicCount: -1, goldFindPercent: 20, timerPenaltyPercent: 10 })
];

const SHOP_RELICS: Relic[] = [
  relic("Merchant Token", "shop", "Shop prices are reduced.", { shopDiscountPercent: 15 }),
  relic("Extra Shelf", "shop", "Shops show one extra relic.", { shopRelicStock: 1 }),
  relic("Dice Vendor", "shop", "Reward rerolls become easier to find.", { relicRerollBonus: 1 }),
  relic("Bundle Pricing", "shop", "Buying support tools makes relics cheaper.", { shopDiscountPercent: 10, maxLife: 4 }),
  relic("Healing Purchase", "shop", "Buying relics supports survival.", { lifeOnKill: 8, increasedHealingReceivedPercent: 10 }),
  relic("Hint Coupon", "shop", "Learning tools feed merchant discounts.", { freeHintPerRoom: 1, shopDiscountPercent: 8 }),
  relic("First One Free", "shop", "The first shop purchase each act is heavily discounted.", { shopDiscountPercent: 35 }),
  relic("Blood Market", "shop", "Boss-tier shop offers cost health and risk.", { shopRelicStock: 1, maxLife: -8, relicChoiceBonus: 1 }),
  relic("Interest Charm", "shop", "Held gold grows between rooms.", { goldFindPercent: 22 }),
  relic("Spending Temper", "shop", "Shopping becomes pre-combat preparation.", { shopDiscountPercent: 8, enhancedDamagePercent: 10 })
];

const EVENT_RELICS: Relic[] = [
  relic("Risky Curiosity", "event", "Unknown rooms become riskier but more rewarding.", { incomingDamagePercent: 20, goldFindPercent: 35 }),
  relic("Relic Transmuter", "event", "Transform weak relic offers into stronger ones.", { relicRerollBonus: 2 }),
  relic("Blood Relic", "event", "Lose max health for access to strange power.", { maxLife: -10, relicChoiceBonus: 1 }),
  relic("Golden Mirror", "event", "Spend gold to copy reward power.", { relicChoiceBonus: 1, relicRerollBonus: 1 }),
  relic("Ash Bargain", "event", "Give up relic power for insight.", { skipRelicMetaBonus: 10 }),
  relic("Cursed Cache", "event", "Gain rare rewards while carrying more danger.", { incomingDamagePercent: 15, increasedRareDropChancePercent: 18 }),
  relic("Upgrade Debt", "event", "Future rewards are delayed for immediate power.", { enhancedDamagePercent: 18, relicRerollBonus: 1 }),
  relic("Duel Shrine", "event", "Optional elite fights lead to unique power.", { bonusDamageVsElitesPercent: 30, relicChoiceBonus: 1 }),
  relic("Painful Tutoring", "event", "Hints become easier to access, but mistakes matter.", { freeHintPerRoom: 1, incomingDamagePercent: 8 }),
  relic("Grave Lesson", "event", "Death and near-death become progression.", { revivePercent: 25, skipRelicMetaBonus: 4 })
];

const BLIGHT_RELICS: Relic[] = [
  relic("Short Fuse", "blight", "Question timers are shorter.", { timerPenaltyPercent: 15 }),
  relic("Price Gouge", "blight", "Shop prices are higher.", { shopPriceIncreasePercent: 20 }),
  relic("Withered Flask", "blight", "Healing is reduced.", { increasedHealingReceivedPercent: -35 }),
  relic("Cold Campfire", "blight", "Rest routes are less reliable.", { healthRegen: -4 }),
  relic("Elite Burden", "blight", "Elite routes are more dangerous.", { incomingDamagePercent: 12, bonusDamageVsElitesPercent: -10 }),
  relic("Sharp Shadows", "blight", "Normal rooms hit harder.", { incomingDamagePercent: 20 }),
  relic("Oracle Tax", "blight", "Hints reduce reward momentum.", { freeHintPerRoom: 1, goldFindPercent: -25 }),
  relic("Heavy Coffers", "blight", "Hoarded gold attracts danger.", { goldFindPercent: 15, incomingDamagePercent: 10 }),
  relic("Weak Dawn", "blight", "Each act starts from a weaker position.", { maxLife: -10 }),
  relic("Cursed Beginning", "blight", "Start cursed for a bigger insight payout.", { incomingDamagePercent: 10, skipRelicMetaBonus: 6 })
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
    .map((id) => knownById.get(id))
    .filter(Boolean) as Relic[];
}

export function grantRelic(state: StudyState, relicItem: Relic): StudyState {
  if (getOwnedRelicIds(state).has(relicItem.id)) {
    return state;
  }
  return { ...state, profile: { ...state.profile, relics: [...state.profile.relics, relicItem] } };
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
  return allowed[Math.floor(getRelicSeedRoll(seed) * allowed.length)];
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
