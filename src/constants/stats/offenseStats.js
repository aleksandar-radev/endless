// Offense stats
export const OFFENSE_STATS = {
  // DAMAGE
  damage: {
    base: 10,
    decimalPlaces: 0,
    training: { available: true, cost: 100, bonus: 1 },
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['offense'],
    showInUI: true,
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 10, scaling: 'capped' },
    itemTags: ['mace'],
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1.0,
    decimalPlaces: 2,
    training: { available: true, cost: 350, bonus: 0.01 },
    item: { min: 0.05, max: 0.2, scaling: 'capped' },
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
    training: { available: true, cost: 250, bonus: 0.1 },
    item: { min: 0.05, max: 0.3, scaling: 'capped' },
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
    training: { available: true, cost: 500, bonus: 0.01 },
    item: { min: 0.02, max: 0.1, scaling: 'capped' },
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
    training: { available: true, cost: 90, bonus: 10 },
    item: { min: 50, max: 150, scaling: 'full' },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  attackRatingPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 10, scaling: 'capped' },
    itemTags: ['offense', 'gloves'],
  },
  // LIFE STEAL
  lifeSteal: {
    base: 0,
    decimalPlaces: 2,
    training: { available: true, cost: 600, bonus: 0.01 },
    item: { min: 0.05, max: 0.2, scaling: 'capped' },
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
    item: { min: 1, max: 8, scaling: 'capped' },
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
    training: { available: true, cost: 60, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  fireDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 10, scaling: 'capped' },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  coldDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 10, scaling: 'capped' },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  airDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 10, scaling: 'capped' },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  earthDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 10, scaling: 'capped' },
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
};
