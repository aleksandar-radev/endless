// Scaling multiplier for all offense stats
const FLAT_MULTIPLIER = 0.035;
const PERCENT_MULTIPLIER = 0.0025;
const CHANCE_MULTIPLIER = 0.0008;

const ELEMENTAL_DAMAGE_MIN = 5;
const ELEMENTAL_DAMAGE_MAX = 18;
const ELEMENTAL_DAMAGE_PERCENT_MIN = 7;
const ELEMENTAL_DAMAGE_PERCENT_MAX = 22;

// Generic scaling function for all offense stats
const offenseScaling = (level, scaling = FLAT_MULTIPLIER, base = 1) => {
  return base + level * scaling;
};

// Offense stats
export const OFFENSE_STATS = {
  // DAMAGE
  damage: {
    base: 10,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 1, maxLevel: Infinity },
    item: { min: 3, max: 10, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense'],
    showInUI: true,
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 20, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['mace'],
  },
  totalDamagePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1,
    decimalPlaces: 2,
    training: { cost: 400, bonus: 0.01, maxLevel: Infinity },
    item: { min: 0.08, max: 0.14, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'gloves'],
    showInUI: true,
  },
  attackSpeedPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // CRIT CHANCE
  critChance: {
    base: 5,
    decimalPlaces: 2,
    training: { cost: 800, bonus: 0.1, maxLevel: 250 }, // max bonus: 25
    item: {
      min: 1,
      max: 5,
      limit: 20,
      scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER),
    },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  critChancePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // CRIT DAMAGE
  critDamage: {
    base: 1.5,
    decimalPlaces: 2,
    training: { cost: 2000, bonus: 0.01, maxLevel: 500 }, // max bonus: 5
    item: { min: 0.02, max: 0.1, limit: 2, scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  critDamagePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // ATTACK RATING
  attackRating: {
    base: 100,
    decimalPlaces: 0,
    training: { cost: 120, bonus: 10, maxLevel: Infinity },
    item: { min: 30, max: 100, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  attackRatingPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 20, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'gloves'],
  },
  // LIFE STEAL
  lifeSteal: {
    base: 0,
    decimalPlaces: 2,
    training: { cost: 800, bonus: 0.01, maxLevel: 500 }, // max bonus: 5
    item: { min: 1, max: 2.5, limit: 5, scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['axe'],
    showInUI: true,
  },
  lifeStealPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // LIFE PER HIT
  lifePerHit: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 7, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['axe'],
    showInUI: true,
  },
  lifePerHitPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // FIRE DAMAGE
  fireDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 80, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  fireDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: ELEMENTAL_DAMAGE_PERCENT_MIN,
      max: ELEMENTAL_DAMAGE_PERCENT_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 80, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  coldDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: ELEMENTAL_DAMAGE_PERCENT_MIN,
      max: ELEMENTAL_DAMAGE_PERCENT_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 80, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  airDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: ELEMENTAL_DAMAGE_PERCENT_MIN,
      max: ELEMENTAL_DAMAGE_PERCENT_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 80, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  earthDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: ELEMENTAL_DAMAGE_PERCENT_MIN,
      max: ELEMENTAL_DAMAGE_PERCENT_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // LIGHTNING DAMAGE
  lightningDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 80, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  lightningDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: ELEMENTAL_DAMAGE_PERCENT_MIN,
      max: ELEMENTAL_DAMAGE_PERCENT_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // WATER DAMAGE
  waterDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 80, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  waterDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: {
      min: ELEMENTAL_DAMAGE_PERCENT_MIN,
      max: ELEMENTAL_DAMAGE_PERCENT_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER),
    },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // DOUBLE DAMAGE
  doubleDamageChance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 200 }, // max bonus: 20
    item: {
      min: 2,
      max: 5,
      limit: 25,
      scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER),
    },
    itemTags: ['offense', 'gloves'],
    showInUI: true,
  },
  // ELEMENTAL DAMAGE PERCENT
  elementalDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 4, max: 16, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'jewelry', 'gloves'],
  },
  percentOfPlayerDamage: {
    base: 0,
    decimalPlaces: 1,
  },
};
