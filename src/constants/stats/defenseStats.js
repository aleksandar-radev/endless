import { scaleDownFlatSum } from './stats.js';

const FLAT_MULTIPLIER = 0.018;
const PERCENT_MULTIPLIER = 0.001;
const CHANCE_MULTIPLIER = 0.0006;

const defenseScaling = (level, scaling = FLAT_MULTIPLIER, base = 1) => {
  const total = scaleDownFlatSum(level);
  return base + scaling * total;
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
    training: {
      cost: 400,
      costIncrease: 600,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.05,
      maxLevel: 300,
    }, // max bonus: 15
    item: { min: 2, max: 5, limit: 25, scaling: (level) => defenseScaling(level, CHANCE_MULTIPLIER) },
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
    training: { cost: 50, bonus: 0.25, maxLevel: Infinity },
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
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 15, max: 45, scaling: (level) => defenseScaling(level) },
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
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  fireResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
  },
  coldResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  coldResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
  },
  airResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  airResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
  },
  earthResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  earthResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
  },
  lightningResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  lightningResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
  },
  waterResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  waterResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
  },
  allResistance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 5, max: 15, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense', 'jewelry'],
  },
  allElementalResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 7, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['defense', 'jewelry'],
  },
  manaShieldPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  lifeRegenOfTotalPercent: {
    base: 0,
    decimalPlaces: 2,
    training: { cost: 1000, bonus: 0.01, maxLevel: 100 },
    item: { min: 0.01, max: 0.05, limit: 1.23, scaling: (level) => defenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['belt'],
  },
};
