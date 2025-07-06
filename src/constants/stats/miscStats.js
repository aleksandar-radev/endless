// Scaling multiplier for all misc stats
const FLAT_MULTIPLIER = 0.0025;
const PERCENT_MULTIPLIER = 0.0005;
const STAT_MULTIPLIER = 0.010;

const STATS_MIN = 3;
const STATS_MAX = 10;
const STATS_MIN_PERCENT = 6;
const STATS_MAX_PERCENT = 12;

// Generic scaling function for all misc stats
const miscScaling = (level, scaling = FLAT_MULTIPLIER, base = 1) => {
  return base + level * scaling;
};

// Miscellaneous stats
export const MISC_STATS = {
  // MANA
  mana: {
    base: 50,
    decimalPlaces: 0,
    levelUpBonus: 0,
    training: { cost: 250, bonus: 1, maxLevel: Infinity },
    item: { min: 5, max: 10, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  manaPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 3, max: 8, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry'],
  },
  // MANA REGEN
  manaRegen: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 500 },
    item: { min: 1, max: 4, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  manaRegenPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 4, max: 10, limit: 50, scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['jewelry'],
  },
  // MANA PER HIT
  manaPerHit: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 5, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  manaPerHitPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // STATS
  strength: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'stat'],
  },
  strengthPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc'],
  },
  agility: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'stat'],
  },
  agilityPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc'],
  },
  vitality: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'stat'],
  },
  vitalityPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc'],
  },
  wisdom: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  wisdomPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc', 'jewelry'],
  },
  endurance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  endurancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc', 'jewelry'],
  },
  dexterity: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  dexterityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc', 'jewelry'],
  },
  // BONUS GOLD
  bonusGoldPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 10, max: 40, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  // BONUS EXPERIENCE
  bonusExperiencePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 15, max: 30, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  // COOLDOWN REDUCTION
  cooldownReductionPercent: {
    base: 0,
    decimalPlaces: 1,
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
  },
  // ITEM BONUSES
  itemBonusesPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // Only from materials. permanent skill points
  skillPoints: {
    base: 0,
    decimalPlaces: 0,
    showInUI: true,
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
};
