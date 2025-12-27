import { OFFENSE_STATS } from './offenseStats.js';
import { DEFENSE_STATS } from './defenseStats.js';
import { MISC_STATS } from './miscStats.js';
import { ITEM_FLAT_REGION_SCALING_MULTIPLIER, ITEM_FLAT_STAGE_SCALING_PERCENT } from '../enemies.js';

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
  return decimals === undefined ? fallback : decimals;
}

export function itemTierScaling(tier = 1) {
  return ITEM_FLAT_REGION_SCALING_MULTIPLIER ** Math.max(0, tier - 1);
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
    scaling[t] = Number(value.toFixed(2));
  }
  return scaling;
}

export function itemLevelScaling(level, tier = 1) {
  const tierScale = itemTierScaling(tier);
  if (level <= 1) return tierScale;
  const levelScale = 1 + (level - 1) * ITEM_FLAT_STAGE_SCALING_PERCENT;
  return tierScale * levelScale;
}
