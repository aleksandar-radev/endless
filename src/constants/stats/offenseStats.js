import { scaleDownFlatSum } from './stats.js';

const FLAT_MULTIPLIER = 0.015;
const PERCENT_MULTIPLIER = 0.001;
const CHANCE_MULTIPLIER = 0.0006;

const ELEMENTAL_DAMAGE_MIN = 4;
const ELEMENTAL_DAMAGE_MAX = 14;
const ELEMENTAL_DAMAGE_PERCENT_MIN = 5;
const ELEMENTAL_DAMAGE_PERCENT_MAX = 15;

const offenseScaling = (level, scaling = FLAT_MULTIPLIER, base = 1) => {
  const total = scaleDownFlatSum(level);
  return base + scaling * total;
};

// Offense stats
export const OFFENSE_STATS = {
  // DAMAGE
  damage: {
    base: 10,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 1, maxLevel: Infinity },
    item: { min: 5, max: 12, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense'],
    showInUI: true,
  },
  damagePerLevel: {
    base: 0,
    decimalPlaces: 1,
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 24, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'gloves'],
  },
  totalDamagePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1,
    decimalPlaces: 2,
    training: { cost: 500, bonus: 0.01, maxLevel: 500 },
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
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    showInUI: true,
  },
  critChancePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // CRIT DAMAGE
  critDamage: {
    base: 1.33,
    decimalPlaces: 2,
    training: { cost: 1500, bonus: 0.01, maxLevel: 300 }, // max bonus: 3
    item: { min: 0.02, max: 0.1, limit: 2, scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
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
    training: { cost: 240, bonus: 10, maxLevel: Infinity },
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
    item: { min: 0.5, max: 1.25, limit: 5, scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['offense'],
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
    itemTags: ['offense'],
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
    training: { cost: 120, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
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
    itemTags: ['sword', 'jewelry', 'gloves', 'magic'],
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 120, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
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
    itemTags: ['sword', 'jewelry', 'gloves', 'magic'],
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 120, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
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
    itemTags: ['sword', 'jewelry', 'gloves', 'magic'],
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 120, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
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
    itemTags: ['sword', 'jewelry', 'gloves', 'magic'],
  },
  // LIGHTNING DAMAGE
  lightningDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 120, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
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
    itemTags: ['sword', 'jewelry', 'gloves', 'magic'],
  },
  // WATER DAMAGE
  waterDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 120, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
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
    itemTags: ['sword', 'jewelry', 'gloves', 'magic'],
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
    itemTags: ['offense', 'gloves', 'jewelry', 'wand'],
    showInUI: true,
  },
  // ELEMENTAL DAMAGE PERCENT
  elementalDamage: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 3, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
  },
  elementalDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 7, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
  },
  percentOfPlayerDamage: {
    base: 0,
    decimalPlaces: 1,
  },
  armorPenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  armorPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  firePenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  firePenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  coldPenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  coldPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  airPenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  airPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  earthPenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  earthPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  lightningPenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  lightningPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  waterPenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  waterPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  elementalPenetration: {
    base: 0,
    decimalPlaces: 0,
  },
  elementalPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  ignoreEnemyArmor: {
    base: 0,
    decimalPlaces: 0,
  },
  ignoreAllEnemyResistances: {
    base: 0,
    decimalPlaces: 0,
  },
  attackNeverMiss: {
    base: 0,
    decimalPlaces: 0,
  },
  reduceEnemyDamagePercent: {
    base: 0,
    decimalPlaces: 2,
  },
  reduceEnemyHpPercent: {
    base: 0,
    decimalPlaces: 2,
  },
  reduceEnemyAttackSpeedPercent: {
    base: 0,
    decimalPlaces: 2,
  },
  extraDamageFromLifePercent: {
    base: 0,
    decimalPlaces: 2,
  },
  extraDamageFromManaPercent: {
    base: 0,
    decimalPlaces: 2,
  },
};
