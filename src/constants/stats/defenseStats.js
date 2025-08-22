import { itemLevelScaling } from './itemScaling.js';

// Base scaling configurations. Values are slowly reduced towards `end` over the
// first 2000 levels to provide diminishing returns. Higher tier items receive a
// bonus via itemLevelScaling's tier handling.
const FLAT_SCALING = { start: 0.05, end: 0.01 };
const PERCENT_SCALING = { start: 0.002, end: 0.0005 };
const CHANCE_SCALING = { start: 0.0012, end: 0.0003 };

const defenseScaling = (level, tier, config = FLAT_SCALING) =>
  itemLevelScaling(level, tier, config);

// Defense stats
export const DEFENSE_STATS = {
  // LIFE
  life: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 1,
    training: { cost: 80, bonus: 5, maxLevel: Infinity },
    item: { min: 30, max: 80, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense'],
    showInUI: true,
    subcategory: 'defense',
  },
  lifePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 6, max: 15, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['belt', 'pants'],
  },
  // ARMOR
  armor: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 4, maxLevel: Infinity },
    item: { min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense'],
    showInUI: true,
    subcategory: 'defense',
  },
  armorPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['armor', 'shield'],
    subcategory: 'defense',
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
    item: { min: 2, max: 5, limit: 25, scaling: (level, tier) => defenseScaling(level, tier, CHANCE_SCALING) },
    itemTags: ['shield'],
    showInUI: true,
    subcategory: 'defense',
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
    item: { min: 3, max: 8, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['belt', 'pants'],
    showInUI: true,
    subcategory: 'defense',
  },
  lifeRegenPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['belt'],
  },
  lifeRegenOfTotalPercent: {
    base: 0,
    decimalPlaces: 2,
    training: { cost: 1000, bonus: 0.01, maxLevel: 100 },
    item: { min: 0.01, max: 0.05, limit: 1.23, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
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
    item: { min: 3, max: 8, limit: 40, scaling: (level, tier) => defenseScaling(level, tier, CHANCE_SCALING) },
    itemTags: ['amulet'],
    showInUI: true,
    subcategory: 'defense',
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
    item: { min: 30, max: 75, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense'],
    showInUI: true,
    subcategory: 'defense',
  },
  evasionPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['boots', 'helmet'],
    subcategory: 'defense',
  },
  // ELEMENTAL RESISTANCES
  fireResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
    subcategory: 'elemental',
  },
  fireResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  coldResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
    subcategory: 'elemental',
  },
  coldResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  airResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
    subcategory: 'elemental',
  },
  airResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  earthResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
    subcategory: 'elemental',
  },
  earthResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  lightningResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
    subcategory: 'elemental',
  },
  lightningResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  waterResistance: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, maxLevel: Infinity },
    item: { min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
    subcategory: 'elemental',
  },
  waterResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 8, max: 18, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  allResistance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 8, max: 20, scaling: (level, tier) => defenseScaling(level, tier) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  allResistancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 7, scaling: (level, tier) => defenseScaling(level, tier, PERCENT_SCALING) },
    itemTags: ['defense', 'jewelry'],
    subcategory: 'elemental',
  },
  manaShieldPercent: {
    base: 0,
    decimalPlaces: 1,
  },
};
