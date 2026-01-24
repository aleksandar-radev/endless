// Base value represents the average "Damage" value for an item at the base tier/level.
// Current average damage is ~10.5 (min 5, max 16).
export const ITEM_BASE_VALUE = 10.5;

export const PER_LEVEL_SCALE = 0.00087;
export const SKILL_BASE_VALUE = 3;
export const SKILL_INCREMENT_RATIO = 0.33; // Increment is approx 1/3 of base for Damage
export const SKILL_INTERVAL = 50;
export const SKILL_BONUS_VALUE = 0.1;

// Ratios relative to Damage (1.0).
// If life is 5.25, it means 1 Damage is equivalent to 5.25 Life in terms of item budget.
const damage = 1;

export const STAT_RATIOS = {
  damage: damage,
  life: damage * 5.25,
  armor: damage * 10,
  evasion: damage * 9,
  allResistance: damage * 2.6,
  elementalResistance: damage * 4.0,
  mana: damage * 4.5,
  lifeRegen: damage * 0.5,
  thornsDamage: damage * 2.6,
  reflectFireDamage: damage * 2.6,
  manaRegen: damage * 0.3,
  manaPerHit: damage * 0.45,
  elementalDamage: damage * 1.11,
  elementalPenetration: damage * 1.67,

  attackRating: damage * 9.3,
  armorPenetration: damage * 8.5,
  lifePerHit: damage * 0.4,

  allAttributes: damage * 0.5,
  strength: damage * 1.25,
  agility: damage * 1.25,
  vitality: damage * 1.25,
  wisdom: damage * 1.25,
  endurance: damage * 1.25,
  dexterity: damage * 1.25,
  intelligence: damage * 1.25,
  perseverance: damage * 1.25,
};

// Variance factors for items.
// Min = Avg * (1 - VARIANCE)
// Max = Avg * (1 + VARIANCE)
// Current Damage: 5 to 16. Avg 10.5. Range +/- 5.5.
// 5.5 / 10.5 = 0.52.
const ITEM_VARIANCE = 0.5;

export const getItemMin = (stat, multiplier = 1) => {
  const ratio = STAT_RATIOS[stat] || 1;
  const avg = ratio * ITEM_BASE_VALUE * multiplier;
  return Math.round(avg * (1 - ITEM_VARIANCE));
};

export const getItemMax = (stat, multiplier = 1) => {
  const ratio = STAT_RATIOS[stat] || 1;
  const avg = ratio * ITEM_BASE_VALUE * multiplier;
  return Math.round(avg * (1 + ITEM_VARIANCE));
};

export const getItemRange = (stat, multiplier = 1) => {
  return {
    min: getItemMin(stat, multiplier),
    max: getItemMax(stat, multiplier),
  };
};

export const getSkillFlatBase = (stat, multiplier = 1) => {
  const ratio = STAT_RATIOS[stat] || 1;
  return parseFloat((ratio * SKILL_BASE_VALUE * multiplier).toFixed(1));
};

export const getSkillFlatIncrement = (stat, multiplier = 1) => {
  const base = getSkillFlatBase(stat, multiplier);
  return parseFloat((base * SKILL_INCREMENT_RATIO).toFixed(1));
};

export const getSkillFlatBonus = (stat, multiplier = 1) => {
  return parseFloat((SKILL_BONUS_VALUE * multiplier).toFixed(2));
};

export const TRAINING_BASE_VALUE = 1;

export const getTrainingBonus = (stat, multiplier = 1) => {
  const ratio = STAT_RATIOS[stat] || 1;
  return parseFloat((ratio * TRAINING_BASE_VALUE * multiplier).toFixed(2));
};
