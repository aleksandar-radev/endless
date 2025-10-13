import { itemLevelScaling } from './itemScaling.js';

// Misc stat scaling values. These follow the same diminishing pattern used for
// other item stats, starting higher and slowly tapering off.
const FLAT_SCALING = {
  start: 0.0012 * 2,
  end: 0.0012 * 0.5,
  tierStart: 0.1,
  tierEnd: 0.05,
};
const PERCENT_SCALING = {
  start: 0.00025 * 2,
  end: 0.00025 * 0.5,
  tierStart: 0.1,
  tierEnd: 0.05,
};
const STAT_SCALING = {
  start: 0.006,
  end: 0.001,
  tierStart: 0.1,
  tierEnd: 0.05,
};

const STATS_MIN = 8;
const STATS_MAX = 15;
const STATS_MIN_PERCENT = 6;
const STATS_MAX_PERCENT = 12;

const miscScaling = (level, tier, config = FLAT_SCALING) =>
  itemLevelScaling(level, tier, config);

// Miscellaneous stats
export const MISC_STATS = {
  // MANA
  mana: {
    base: 50,
    decimalPlaces: 0,
    levelUpBonus: 0,
    training: { cost: 50, bonus: 1, maxLevel: Infinity },
    item: { min: 25, max: 70, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry', 'magic'],
    showInUI: true,
    subcategory: 'resources',
  },
  manaPerLevel: {
    base: 0,
    decimalPlaces: 1,
  },
  manaPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 3, max: 8, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry', 'magic'],
  },
  // MANA REGEN
  manaRegen: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 300, bonus: 0.1, maxLevel: 8000 },
    item: { min: 2, max: 4, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry', 'magic'],
    showInUI: true,
    subcategory: 'resources',
  },
  manaRegenPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 4, max: 10, limit: 50, scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['jewelry', 'magic'],
  },
  // MANA PER HIT
  manaPerHit: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 3, max: 6, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry', 'magic'],
    showInUI: true,
    subcategory: 'resources',
  },
  manaPerHitPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // STATS
  strength: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
  },
  strengthPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc', 'axe', 'mace'],
  },
  agility: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
  },
  agilityPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc', 'axe', 'mace'],
  },
  vitality: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'stat'],
  },
  vitalityPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc'],
  },
  wisdom: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
  },
  wisdomPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
  },
  endurance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  endurancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc', 'jewelry'],
  },
  dexterity: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  dexterityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc', 'jewelry'],
  },
  intelligence: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
  },
  intelligencePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
  },
  perseverance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING) },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  perseverancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING),
    },
    itemTags: ['misc', 'jewelry'],
  },
  enduranceThornsDamagePerPoint: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'defense',
  },
  // BONUS GOLD
  bonusGoldPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 20, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
    subcategory: 'rewards',
  },
  // BONUS EXPERIENCE
  bonusExperiencePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
    subcategory: 'rewards',
  },
  // COOLDOWN REDUCTION
  cooldownReductionPercent: {
    base: 0,
    decimalPlaces: 1,
    showInUI: true,
    subcategory: 'misc',
  },
  // MANA COST REDUCTION
  manaCostReductionPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // BUFF DURATION
  buffDurationPercent: {
    base: 0,
    decimalPlaces: 1,
    showInUI: true,
    subcategory: 'misc',
  },
  // ITEM BONUSES
  itemBonusesPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // ITEM QUANTITY
  itemQuantityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 4, max: 13, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry', 'gloves'],
    showInUI: true,
    subcategory: 'rewards',
  },
  // ITEM RARITY
  itemRarityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 4, max: 13, scaling: (level, tier) => miscScaling(level, tier) },
    itemTags: ['misc', 'jewelry', 'gloves'],
    showInUI: true,
    subcategory: 'rewards',
  },
  // Only from materials. permanent skill points
  skillPoints: {
    base: 0,
    decimalPlaces: 0,
    showInUI: true,
    subcategory: 'rewards',
  },
  /**
   * Chance (%) to drop extra materials on enemy kill.
   * Only increased via Soul Shop.
   */
  extraMaterialDropPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  /**
   * Max number of extra materials dropped per enemy kill.
   * Only increased via Soul Shop.
   */
  extraMaterialDropMax: {
    base: 1,
    decimalPlaces: 0,
  },
  manaRegenOfTotalPercent: {
    base: 0,
    decimalPlaces: 2,
    training: { cost: 1000, bonus: 0.01, maxLevel: 100 },
    item: { min: 0.01, max: 0.05, max: 1, scaling: (level, tier) => miscScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['staff'],
  },
  allAttributes: {
    base: 0,
    decimalPlaces: 0,
    item: {
      min: 4,
      max: 8,
      limit: Infinity,
      scaling: (level, tier) => miscScaling(level, tier, STAT_SCALING),
    },
    itemTags: ['defense', 'jewelry', 'gloves', 'misc'],
  },
  allAttributesPercent: {
    base: 0,
    decimalPlaces: 1,
  },
};
