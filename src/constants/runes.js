import { isChanceStat } from './stats/stats.js';

const BASE = import.meta.env.VITE_BASE_PATH;

// Re-export isChanceStat for convenience
export { isChanceStat };

// Rune stage scaling (2x item flat scaling = 0.01 * 2 = 0.02 = 2% per stage)
export const RUNE_FLAT_STAGE_SCALING_PERCENT = 0.02;
export const RUNE_PERCENT_STAGE_SCALING_PERCENT = 0.008; // 0.8% per stage for percent stats

// Tier multipliers for flat stats based on zone
// Each tier is 20x stronger than the previous for flat stats
export const RUNE_FLAT_TIER_MULTIPLIER = 20;
export const RUNE_TIERS = {
  1: { multiplier: 1, zones: ['outskirts'] },
  2: { multiplier: RUNE_FLAT_TIER_MULTIPLIER, zones: ['boulders'] },
  3: { multiplier: RUNE_FLAT_TIER_MULTIPLIER ** 2, zones: ['caves'] },
  4: { multiplier: RUNE_FLAT_TIER_MULTIPLIER ** 3, zones: ['cliffs'] },
  5: { multiplier: RUNE_FLAT_TIER_MULTIPLIER ** 4, zones: ['valley'] },
  6: { multiplier: RUNE_FLAT_TIER_MULTIPLIER ** 5, zones: ['summit'] },
};

// Separate tier multipliers for percent stats (much lower scaling)
// Each tier is 2x stronger than the previous for percent stats
export const RUNE_PERCENT_TIER_MULTIPLIER = 2;
export const RUNE_PERCENT_TIERS = {
  1: { multiplier: 1 },
  2: { multiplier: RUNE_PERCENT_TIER_MULTIPLIER },
  3: { multiplier: RUNE_PERCENT_TIER_MULTIPLIER ** 2 },
  4: { multiplier: RUNE_PERCENT_TIER_MULTIPLIER ** 3 },
  5: { multiplier: RUNE_PERCENT_TIER_MULTIPLIER ** 4 },
  6: { multiplier: RUNE_PERCENT_TIER_MULTIPLIER ** 5 },
};

// Get tier for a zone
export const getTierForZone = (zoneId) => {
  for (const [tier, data] of Object.entries(RUNE_TIERS)) {
    if (data.zones.includes(zoneId)) {
      return Number(tier);
    }
  }
  return 1;
};

// Get flat stat multiplier for a tier
export const getTierMultiplier = (tier) => {
  return RUNE_TIERS[tier]?.multiplier || 1.0;
};

// Get percent stat multiplier for a tier
export const getPercentTierMultiplier = (tier) => {
  return RUNE_PERCENT_TIERS[tier]?.multiplier || 1.0;
};

/**
 * Calculate rune stat scaling based on tier and stage.
 * @param {number} baseValue - Base stat value from rune definition
 * @param {string} statKey - The stat key to determine scaling type
 * @param {number} tier - Rune tier (1-6)
 * @param {number} stage - Rocky field stage
 * @returns {number} Scaled stat value
 */
export const calculateRuneStatValue = (baseValue, statKey, tier, stage = 1) => {
  // Chance stats don't scale with tier
  if (isChanceStat(statKey)) {
    return baseValue;
  }

  const tierMultiplier = getTierMultiplier(tier);
  const isFlatStat = !statKey.endsWith('Percent') && !statKey.endsWith('Chance');
  const stageScaling = isFlatStat
    ? RUNE_FLAT_STAGE_SCALING_PERCENT
    : RUNE_PERCENT_STAGE_SCALING_PERCENT;
  const stageMultiplier = 1 + (stage - 1) * stageScaling;

  return baseValue * tierMultiplier * stageMultiplier;
};

// All runes defined as an object with ID keys
export const RUNES = {
  skill_points: {
    id: 'skill_points',
    nameKey: 'rune.skillPoints.name',
    descKey: 'rune.skillPoints.desc',
    stats: { skillPointsPerLevel: 1 },
    attributes: 1,
    weight: 100,
    icon: `${BASE}/icons/star.svg`,
    unique: true,
  },
  training_cost: {
    id: 'training_cost',
    nameKey: 'rune.trainingCost.name',
    descKey: 'rune.trainingCost.desc',
    stats: { trainingCostReduction: 0.25 },
    attributes: 1,
    weight: 100,
    icon: `${BASE}/icons/gold.png`,
    unique: true,
  },
  soul_shop_cost: {
    id: 'soul_shop_cost',
    nameKey: 'rune.soulShopCost.name',
    descKey: 'rune.soulShopCost.desc',
    stats: { soulShopCostReduction: 0.25 },
    attributes: 1,
    weight: 100,
    icon: `${BASE}/icons/soul.png`,
    unique: true,
  },
  arena_boss_skip: {
    id: 'arena_boss_skip',
    nameKey: 'rune.bossSkip.name',
    descKey: 'rune.bossSkip.desc',
    stats: { arenaBossSkip: 1 },
    attributes: 1,
    weight: 100,
    icon: `${BASE}/icons/skull.png`,
    unique: true,
  },
  crystal_gain: {
    id: 'crystal_gain',
    nameKey: 'rune.crystalGain.name',
    descKey: 'rune.crystalGain.desc',
    stats: { crystalGainPercent: 1 },
    attributes: 1,
    weight: 100,
    icon: `${BASE}/icons/crystal.png`,
    unique: true,
  },
  empowering_rune: {
    id: 'empowering_rune',
    nameKey: 'rune.empoweringRune.name',
    descKey: 'rune.empoweringRune.desc',
    stats: {
      damage: [5, 15],
      damagePerLevel: [5, 15],
      life: [50, 150],
      armor: [20, 60],
      attackRating: [30, 90],
      evasion: [20, 60],
      armorPenetration: [10, 30],
      elementalPenetration: [10, 30],
      lifePerHit: [2, 8],
      mana: [20, 60],
      manaRegen: [1, 5],
      lifeRegen: [5, 20],
    },
    attributes: 1,
    weight: 50000,
    icon: `${BASE}/icons/empowering-rune.png`,
    unique: false,
  },
};

// Derived arrays for Rocky Field rune drops
export const ROCKY_FIELD_ALL_RUNES = Object.keys(RUNES);
export const ROCKY_FIELD_COMMON_RUNES = Object.values(RUNES)
  .filter((rune) => !rune.unique)
  .map((rune) => rune.id);

export default RUNES;
