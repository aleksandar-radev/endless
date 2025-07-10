// Scaling multiplier for all defense stats
const FLAT_MULTIPLIER = 0.035;
const PERCENT_MULTIPLIER = 0.0025;
const CHANCE_MULTIPLIER = 0.0008;

// Generic scaling function for all defense stats
const defenseScaling = (level, scaling = FLAT_MULTIPLIER, base = 1) => {
  return base + level * scaling;
};

// Defense stats
export const DEFENSE_STATS = {
  // LIFE
  life: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 1,
    training: { cost: 80, bonus: 5, maxLevel: Infinity },
    item: { min: 30, max: 80, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense'],
    showInUI: true,
  },
  lifePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 6, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['belt', 'pants'],
  },
  // ARMOR
  armor: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense'],
    showInUI: true,
  },
  armorPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['armor', 'shield'],
  },
  // BLOCK CHANCE
  blockChance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 500, bonus: 0.1, maxLevel: 400 }, // max bonus: 40
    item: { min: 4, max: 12, limit: 40, scaling: (level) => defenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['shield'],
    showInUI: true,
  },
  blockChancePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // LIFE REGEN
  lifeRegen: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 250, bonus: 0.1, maxLevel: Infinity },
    item: { min: 3, max: 8, scaling: (level) => defenseScaling(level) },
    itemTags: ['belt', 'pants'],
    showInUI: true,
  },
  lifeRegenPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['belt'],
  },
  // THORNS
  thornsDamage: {
    base: 0,
    decimalPlaces: 1,
  },
  thornsDamagePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // RESURRECTION
  resurrectionChance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 3, max: 8, limit: 40, scaling: (level) => defenseScaling(level, CHANCE_MULTIPLIER) },
    itemTags: ['amulet'],
    showInUI: true,
  },
  reflectFireDamage: {
    base: 0,
    decimalPlaces: 0,
  },
  // EVASION
  evasion: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 300, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense'],
    showInUI: true,
  },
  evasionPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['boots', 'helmet'],
  },
  // ELEMENTAL RESISTANCES
  fireResistance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 150 },
    item: { min: 2, max: 6, limit: 30,scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  coldResistance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 150 },
    item: { min: 2, max: 6, limit: 30,scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  airResistance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 150 },
    item: { min: 2, max: 6, limit: 30, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  earthResistance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 150 },
    item: { min: 2, max: 6, limit: 30, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  lightningResistance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 150 },
    item: { min: 2, max: 6, limit: 30, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  waterResistance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 800, bonus: 0.1, maxLevel: 150 },
    item: { min: 2, max: 6, limit: 30, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  manaShieldPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  lifeRegenOfTotalPercent: {
    base: 0,
    decimalPlaces: 2,
    item: { min: 0.01, max: 0.05, max: 1, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['belt'],
  },
};
