// Defense stats
export const DEFENSE_STATS = {
  // LIFE
  life: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 1,
    training: { available: true, cost: 80, bonus: 5 },
    item: { min: 30, max: 80, scaling: 'full' },
    itemTags: ['defense'],
    showInUI: true,
  },
  lifePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 10, scaling: 'capped' },
    itemTags: ['pants'],
  },
  // ARMOR
  armor: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 100, bonus: 3 },
    item: { min: 10, max: 30, scaling: 'full' },
    itemTags: ['defense'],
    showInUI: true,
  },
  armorPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 9, scaling: 'capped' },
    itemTags: ['armor'],
  },
  // BLOCK CHANCE
  blockChance: {
    base: 0,
    decimalPlaces: 1,
    training: { available: true, cost: 400, bonus: 0.1 },
    item: { min: 2, max: 6, scaling: 'capped' },
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
    training: { available: true, cost: 200, bonus: 0.1 },
    item: { min: 1, max: 10, scaling: 'full' },
    itemTags: ['belt'],
    showInUI: true,
  },
  lifeRegenPercent: {
    base: 0,
    decimalPlaces: 1,
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
    item: { min: 1, max: 5, scaling: 'capped' },
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
    training: { available: true, cost: 300, bonus: 0.1 },
    item: { min: 1, max: 8, scaling: 'capped' },
    itemTags: ['defense', 'boots'],
    showInUI: true,
  },
  // ELEMENTAL RESISTANCES
  fireResistance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 15, scaling: 'capped' },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  coldResistance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 15, scaling: 'capped' },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  airResistance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 15, scaling: 'capped' },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
  earthResistance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 15, scaling: 'capped' },
    itemTags: ['defense', 'jewelry'],
    showInUI: true,
  },
};
