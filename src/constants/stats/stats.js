import { OFFENSE_STATS } from './offenseStats.js';
import { DEFENSE_STATS } from './defenseStats.js';
import { MISC_STATS } from './miscStats.js';
import { ITEM_FLAT_TIER_SCALING_MULTIPLIER, ITEM_FLAT_STAGE_SCALING_PERCENT } from '../enemies.js';

export const STATS = {
  ...OFFENSE_STATS,
  ...DEFENSE_STATS,
  ...MISC_STATS,
};

// sub -> subcategory
// div -> divisor
// dec -> decimalPlaces
export function createStat(props = {}) {
  const {
    sub, div, dec, show, ...rest
  } = props;
  return {
    base: 0,
    ...(sub && { subcategory: sub }),
    ...(div && { divisor: div }),
    ...(dec !== undefined && { decimalPlaces: dec }),
    ...(show && { showInUI: show }),
    ...rest,
  };
}

export function createPercentStat(props = {}) {
  return createStat({
    div: 100,
    dec: 1,
    isPercentStat: true,
    ...props,
  });
}

export function createChanceStat(props = {}) {
  return createStat({
    div: 100,
    dec: 1,
    isChanceStat: true,
    ...props,
  });
}

export function createHiddenStat(props = {}) {
  return createStat({
    showValue: false,
    displayed: false,
    ...props,
  });
}

export function getDivisor(statKey) {
  const divisor = STATS?.[statKey]?.divisor;
  if (typeof divisor === 'number' && Number.isFinite(divisor) && divisor > 0) return divisor;
  return 1;
}

export function getStatDecimalPlaces(statKey, fallback = 0) {
  const decimals = STATS?.[statKey]?.decimalPlaces;
  if (decimals !== undefined) return decimals;
  if (statKey.endsWith('PerLevel')) return 3;
  return fallback;
}

export function isPercentStat(statKey) {
  if (STATS?.[statKey]?.isPercentStat) return true;
  return statKey.endsWith('Percent');
}

export function isChanceStat(statKey) {
  if (STATS?.[statKey]?.isChanceStat) return true;
  return statKey.endsWith('Chance');
}

/**
 * Generate a tier scaling map (1-12) by interpolating between start and end values.
 * @param {number} start - Max value at Tier 1.
 * @param {number} end - Max value at Tier 12.
 * @param {number} [power=1] - Curve factor (1 = linear, >1 = exponential growth, <1 = diminishing growth).
 * @returns {Object} A map of tier numbers to max percentages.
 */
export function createTierScaling(start, end, power = 1) {
  const scaling = {};
  for (let t = 1; t <= 12; t++) {
    const progress = (t - 1) / 11;
    const value = start + (end - start) * (progress ** power);
    scaling[t] = Math.round(value * 100) / 100;
  }
  return scaling;
}

export function itemTierScaling(tier = 1) {
  return ITEM_FLAT_TIER_SCALING_MULTIPLIER ** Math.max(0, tier - 1);
}

export function itemStatScaleFactor(level, tier = 1) {
  const tierScale = itemTierScaling(tier);
  if (level <= 1) return tierScale;
  const levelScale = 1 + (level - 1) * ITEM_FLAT_STAGE_SCALING_PERCENT;
  return tierScale * levelScale;
}

export function isFlatStat(stat) {
  return !stat.endsWith('Percent') && !stat.endsWith('Chance');
}

/**
 * Create a skill bonus configuration for flat stats.
 *
 * @param {Object} params - Configuration object
 * @param {string} params.type - The skill type (passive, toggle, instant, buff, summon)
 * @param {number} params.base - The starting value at level 1
 * @param {number} params.increment - The flat increase per level
 * @param {number} params.interval - How often milestone bonuses occur (e.g., every 50 levels)
 * @param {number} params.bonus - The additive bonus per milestone (e.g., 0.2 for +20% per milestone)
 * @param {number} [params.max] - Optional maximum value cap
 * @returns {Object} Skill bonus configuration object for flat stats
 */
export function getSkillBonusesFlat({
  type, base, increment, interval, bonus, max,
}) {
  return {
    statType: 'flat',
    base,
    increment,
    interval,
    bonus,
    ...(max !== undefined && { max }),
  };
}

/**
 * Create a skill bonus configuration for percent stats.
 *
 * @param {Object} params - Configuration object
 * @param {string} params.type - The skill type (passive, toggle, instant, buff, summon)
 * @param {number} params.base - The starting percentage at level 1
 * @param {number} [params.softcap=2000] - The level at which growth transitions from power to linear
 * @param {number} [params.linear=0.5] - The linear growth rate after softcap
 * @param {number} [params.power=0.6] - The power curve exponent before softcap
 * @param {number} [params.max] - Optional maximum percentage cap
 * @returns {Object} Skill bonus configuration object for percent stats
 */
export function getSkillBonusesPercent({
  type, base, softcap = 2000, linear = 0.5, power = 0.6, max,
}) {
  return {
    statType: 'percent',
    base,
    softcap,
    linear,
    power,
    ...(max !== undefined && { max }),
  };
}

/**
 * Create a skill bonus configuration for chance stats.
 *
 * @param {Object} params - Configuration object
 * @param {string} params.type - The skill type (passive, toggle, instant, buff, summon)
 * @param {number} params.base - The starting chance percentage at level 1
 * @param {number} [params.levelsPerPoint=10] - How many levels for each increment
 * @param {number} [params.cap=75] - The maximum chance cap
 * @returns {Object} Skill bonus configuration object for chance stats
 */
export function getSkillBonusesChance({
  type, base, levelsPerPoint = 10, cap = 75,
}) {
  return {
    statType: 'chance',
    base,
    levelsPerPoint,
    cap,
  };
}

