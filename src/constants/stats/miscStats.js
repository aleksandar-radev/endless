// Scaling multiplier for all misc stats
const FLAT_MULTIPLIER = 0.002;
const PERCENT_MULTIPLIER = 0.00035;
const STAT_MULTIPLIER = 0.05;

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
    itemTags: ['misc', 'jewelry', 'magic'],
    showInUI: true,
  },
  manaPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 3, max: 8, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry', 'magic'],
  },
  // MANA REGEN
  manaRegen: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 500, bonus: 0.1, maxLevel: 5000 },
    item: { min: 1, max: 3, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry', 'magic'],
    showInUI: true,
  },
  manaRegenPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 4, max: 10, limit: 50, scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['jewelry', 'magic'],
  },
  // MANA PER HIT
  manaPerHit: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 5, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry', 'magic'],
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
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
  },
  wisdomPercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
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
  intelligence: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
  },
  intelligencePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: STATS_MIN_PERCENT,
      max: STATS_MAX_PERCENT,
      scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
  },
  perseverance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: STATS_MIN, max: STATS_MAX, scaling: (level) => miscScaling(level, STAT_MULTIPLIER) },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  perseverancePercent: {
    base: 0,
    decimalPlaces: 1,
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
    item: { min: 5, max: 20, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  // BONUS EXPERIENCE
  bonusExperiencePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => miscScaling(level) },
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
  // ITEM QUANTITY
  itemQuantityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 4, max: 13, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry', 'gloves'],
    showInUI: true,
  },
  // ITEM RARITY
  itemRarityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 4, max: 13, scaling: (level) => miscScaling(level) },
    itemTags: ['misc', 'jewelry', 'gloves'],
    showInUI: true,
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
  manaRegenOfTotalPercent: {
    base: 0,
    decimalPlaces: 2,
    training: { cost: 1000, bonus: 0.01, maxLevel: 100 },
    item: { min: 0.01, max: 0.05, max: 1, scaling: (level) => miscScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['staff'],
  },
  allAttributes: {
    base: 0,
    decimalPlaces: 0,
  },
  allAttributesPercent: {
    base: 0,
    decimalPlaces: 1,
  },
};
