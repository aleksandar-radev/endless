export { itemLevelScaling } from './itemScaling.js';
import { OFFENSE_STATS } from './offenseStats.js';
import { DEFENSE_STATS } from './defenseStats.js';
import { MISC_STATS } from './miscStats.js';

export const STATS = {
  ...OFFENSE_STATS,
  ...DEFENSE_STATS,
  ...MISC_STATS,
};

export function getDivisor(statKey) {
  const divisor = STATS?.[statKey]?.divisor;
  if (typeof divisor === 'number' && Number.isFinite(divisor) && divisor > 0) return divisor;
  return 1;
}

export function getStatDecimalPlaces(statKey, fallback = 0) {
  const decimals = STATS?.[statKey]?.decimalPlaces;
  return decimals === undefined ? fallback : decimals;
}

// Base tier bonus configuration by stat bonus type.
// Higher tiers receive significantly larger multipliers.
const ITEM_BASE_BONUS = {
  flat: { base: 1, step: 1, growth: 0.2 },
  percent: { base: 0.4, step: 0.2, growth: 0.06 },
  chance: { base: 0.6, step: 0.6, growth: 0.12 },
};

/**
 * Calculate base item bonus for a given tier and bonus type.
 * Uses an increasing arithmetic series with a small growth factor
 * so higher tiers get disproportionately larger bonuses.
 */
export function calculateItemBaseBonus(tier, type = 'flat') {
  const cfg = ITEM_BASE_BONUS[type] || ITEM_BASE_BONUS.flat;
  const { base, step, growth } = cfg;
  if (!tier || tier <= 1) return base;
  const steps = tier - 1;
  const constPart = steps * step;
  const growingPart = growth * ((steps - 1) * steps) / 2;
  return Number((base + constPart + growingPart).toFixed(3));
}

function getBonusType(stat) {
  const s = stat.toLowerCase();
  if (s.includes('percent')) return 'percent';
  if (s.includes('chance') || s.includes('steal')) return 'chance';
  return 'flat';
}

// Public helper to fetch tier bonus for a given stat
export function getItemTierBonus(stat, tier) {
  return calculateItemBaseBonus(tier, getBonusType(stat));
}

// Linear decay parameters
const MAX_LEVEL = 50000;
const FINAL_PERCENT = 0.05; // 5% of original multiplier at MAX_LEVEL

/**
 * Sum of diminishing flat bonuses until a minimum value,
 * then adds that minimum for remaining levels.
 */
export function scaleDownFlatSum(
  level,
  start = 1,
  flat = (1 - FINAL_PERCENT) / (MAX_LEVEL / 10),
  interval = 10,
  min = FINAL_PERCENT,
) {
  if (level <= 0) return 0;
  // How many intervals before reaching min
  const stepsToMin = Math.floor((start - min) / flat);
  const levelsToMin = stepsToMin * interval;
  if (level <= levelsToMin) {
    // All levels above min, use arithmetic series sum
    const k = Math.floor((level - 1) / interval);
    const rem = level - k * interval;
    // Sum for full intervals
    const sumFull = (interval * k * (2 * start - flat * (k - 1))) / 2;
    // Sum for remaining levels
    const sumRem = rem * Math.max(start - flat * k, min);
    return sumFull + sumRem;
  } else {
    // Sum up to min, then add min for remaining levels
    const sumToMin =
      (interval * stepsToMin * (2 * start - flat * (stepsToMin - 1))) / 2;
    const remLevels = level - levelsToMin;
    return sumToMin + remLevels * min;
  }
}
