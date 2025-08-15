import { scaleDownFlatSum } from './stats.js';

const FLAT_MULTIPLIER = 0.018;
const PERCENT_MULTIPLIER = 0.001;
const CHANCE_MULTIPLIER = 0.0006;

const ELEMENTAL_DAMAGE_MIN = 3;
const ELEMENTAL_DAMAGE_MAX = 12;
const ELEMENTAL_DAMAGE_PERCENT_MIN = 4;
const ELEMENTAL_DAMAGE_PERCENT_MAX = 13;

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
    item: { min: 10, max: 28, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense'],
    showInUI: true,
    subcategory: 'attack',
  },
  damagePerLevel: {
    base: 0,
    decimalPlaces: 1,
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 15, max: 36, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'gloves'],
    subcategory: 'attack',
  },
  totalDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'attack',
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1,
    decimalPlaces: 2,
    training: {
      cost: 400,
      costIncrease: 600,
      costIncreaseMultiplier: 1.08,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.05 }],
      bonus: 0.01,
      maxLevel: 100,
    }, // max bonus: 25
    item: { min: 0.08, max: 0.14, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'gloves'],
    showInUI: true,
    subcategory: 'attack',
  },
  attackSpeedPercent: {
    base: 0,
    decimalPlaces: 1,
    forceNotShow: true,
  },
  // CRIT CHANCE
  critChance: {
    base: 5,
    decimalPlaces: 2,
    training: {
      cost: 550,
      costIncrease: 600,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.1,
      maxLevel: 250,
    }, // max bonus: 25
    item: {
      min: 1,
      max: 5,
      limit: 20,
      scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER),
    },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
    subcategory: 'attack',
  },
  critChancePercent: {
    base: 0,
    decimalPlaces: 1,
    forceNotShow: true,
  },
  // CRIT DAMAGE
  critDamage: {
    base: 1.33,
    decimalPlaces: 2,
    training: {
      cost: 750,
      costIncrease: 800,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.01,
      maxLevel: 250,
    }, // max bonus: 2.5
    item: { min: 0.02, max: 0.1, limit: 2, scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
    subcategory: 'attack',
  },
  critDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    forceNotShow: true,
  },
  // ATTACK RATING
  attackRating: {
    base: 100,
    decimalPlaces: 0,
    training: { cost: 240, bonus: 10, maxLevel: Infinity },
    item: { min: 30, max: 100, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
    subcategory: 'attack',
  },
  attackRatingPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 20, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'gloves'],
    subcategory: 'attack',
  },
  // LIFE STEAL
  lifeSteal: {
    base: 0,
    decimalPlaces: 2,
    training: { cost: 800, bonus: 0.01, maxLevel: 500 }, // max bonus: 5
    item: { min: 0.5, max: 1.25, limit: 5, scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['offense'],
    showInUI: true,
    subcategory: 'attack',
  },
  lifeStealPercent: {
    base: 0,
    decimalPlaces: 1,
    forceNotShow: true,
  },
  // LIFE PER HIT
  lifePerHit: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 7, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense'],
    showInUI: true,
    subcategory: 'attack',
  },
  lifePerHitPercent: {
    base: 0,
    decimalPlaces: 1,
    forceNotShow: true,
  },
  // FIRE DAMAGE
  fireDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 180, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
    showInUI: true,
    subcategory: 'elemental',
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
    subcategory: 'elemental',
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 180, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
    showInUI: true,
    subcategory: 'elemental',
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
    subcategory: 'elemental',
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 180, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
    showInUI: true,
    subcategory: 'elemental',
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
    subcategory: 'elemental',
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 180, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
    showInUI: true,
    subcategory: 'elemental',
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
    subcategory: 'elemental',
  },
  // LIGHTNING DAMAGE
  lightningDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 180, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
    showInUI: true,
    subcategory: 'elemental',
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
    subcategory: 'elemental',
  },
  // WATER DAMAGE
  waterDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 180, bonus: 1, maxLevel: Infinity },
    item: {
      min: ELEMENTAL_DAMAGE_MIN,
      max: ELEMENTAL_DAMAGE_MAX,
      limit: Infinity,
      scaling: (level) => offenseScaling(level),
    },
    itemTags: ['sword', 'gloves', 'magic'],
    showInUI: true,
    subcategory: 'elemental',
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
    subcategory: 'elemental',
  },
  // DOUBLE DAMAGE
  doubleDamageChance: {
    base: 0,
    decimalPlaces: 1,
    training: {
      cost: 550,
      costIncrease: 600,
      costIncreaseMultiplier: 1.012,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.025 }],
      bonus: 0.1,
      maxLevel: 200,
    }, // max bonus: 20
    item: {
      min: 2,
      max: 5,
      limit: 25,
      scaling: (level) => offenseScaling(level, CHANCE_MULTIPLIER),
    },
    itemTags: ['offense', 'gloves', 'jewelry', 'wand'],
    showInUI: true,
    subcategory: 'attack',
  },
  // ELEMENTAL DAMAGE PERCENT
  elementalDamage: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 3, limit: Infinity, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    subcategory: 'elemental',
  },
  elementalDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 7, limit: Infinity, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    subcategory: 'elemental',
  },
  percentOfPlayerDamage: {
    base: 0,
    decimalPlaces: 1,
    forceNotShow: true,
  },
  armorPenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'attack',
  },
  armorPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'attack',
  },
  firePenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'elemental',
  },
  firePenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'elemental',
  },
  coldPenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'elemental',
  },
  coldPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'elemental',
  },
  airPenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'elemental',
  },
  airPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'elemental',
  },
  earthPenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'elemental',
  },
  earthPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'elemental',
  },
  lightningPenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'elemental',
  },
  lightningPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'elemental',
  },
  waterPenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'elemental',
  },
  waterPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'elemental',
  },
  elementalPenetration: {
    base: 0,
    decimalPlaces: 0,
    subcategory: 'elemental',
  },
  elementalPenetrationPercent: {
    base: 0,
    decimalPlaces: 1,
    subcategory: 'elemental',
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
  extraDamageFromArmorPercent: {
    base: 0,
    decimalPlaces: 2,
  },
  extraDamageFromManaPercent: {
    base: 0,
    decimalPlaces: 2,
  },
  extraDamageFromLifeRegenPercent: {
    base: 0,
    decimalPlaces: 2,
  },
  extraDamageFromEvasionPercent: {
    base: 0,
    decimalPlaces: 2,
  },
  extraDamageFromAttackRatingPercent: {
    base: 0,
    decimalPlaces: 2,
  },
};
