import { fetchTrustedUtcTime } from './api.js';

let lastApiTime = 0;
let lastApiTimestamp = 0;
let pendingPromise = null;

/**
 * Returns trusted UTC time (ms since epoch), polling the API at most once every 15 seconds.
 * If called again within 15s, returns cached value. If first call or cache expired, polls API.
 * Returns a Promise<number>.
 */
export async function getTimeNow() {
  const now = Date.now();
  // If we have a recent API value (within 15s), return cached value + elapsed
  if (lastApiTime && (now - lastApiTimestamp < 15000)) {
    // Add elapsed time since last API poll
    return lastApiTime + (now - lastApiTimestamp);
  }
  // If a request is already pending, wait for it
  if (pendingPromise) {
    await pendingPromise;
    return lastApiTime + (Date.now() - lastApiTimestamp);
  }
  // Otherwise, poll the API
  pendingPromise = (async () => {
    try {
      const apiTime = await fetchTrustedUtcTime();
      // Validate API response
      if (typeof apiTime === 'number' && apiTime > 0) {
        lastApiTime = apiTime;
        lastApiTimestamp = Date.now();
      } else {
        throw new Error('Invalid API response: ' + apiTime);
      }
    } catch (e) {
      console.warn('Failed to fetch server time, using local time:', e.message);
      // Fallback to local time if API fails
      lastApiTime = Date.now();
      lastApiTimestamp = Date.now();
    } finally {
      pendingPromise = null;
    }
  })();
  await pendingPromise;
  return lastApiTime;
}

/**
 * Scale a base stat from level 1 to a target level.
 *
 * Growth is made of three parts:
 * 1. A fixed increase every level.
 * 2. An extra bonus increase every `bonusInterval` levels.
 * 3. A percentage of the base stat added each level.
 *
 * @param {number} base - Stat value at level 1.
 * @param {number} level - Target level (integer >= 1).
 * @param {number} increasePerLevel - Fixed increase applied each level.
 * @param {number} bonusInterval - Number of levels between each bonus increase.
 * @param {number} bonusIncrease - Extra increase applied every bonus interval.
 * @param {number} basePercentGain - Fraction of base added each level (e.g. 0.1 = 10%).
 * @returns {number} Stat value at the target level after scaling.
 */
export function scaleStat(
  base,
  level,
  increasePerLevel = 0,
  bonusInterval = 1,
  bonusIncrease = 0,
  basePercentGain = 0.3,
) {
  if (base <= 0) return 0; // Avoid scaling if base is zero or negative
  if (bonusInterval == 0) bonusInterval = 1; // Avoid division by zero
  if (level <= 1) return base;
  const levelsAboveOne = level - 1;

  // Percentage-based gain of the original base each level
  const percentGain = basePercentGain * base * levelsAboveOne;

  // Flat increase each level
  const flatGain = increasePerLevel * levelsAboveOne;

  // Bonus increases every bonusInterval levels
  const fullBonusCount = Math.floor(levelsAboveOne / bonusInterval);
  const bonusGain = fullBonusCount * bonusIncrease;

  return base + percentGain + flatGain + bonusGain;
}

/**
 * Monotonic stat scaling with diminishing slope applied only to incremental gains.
 *
 * Computes: base + base * sum_{k=2..level} (basePercentFn(k) * slopePercentFn(k))
 * where basePercentFn and slopePercentFn are step functions of level. This ensures
 * the value never decreases as level increases, while allowing the per-level
 * increment (slope) to diminish over time. The function optionally accepts
 * interval descriptors to jump across constant segments for performance.
 *
 * @param {number} base - Stat value at level 1.
 * @param {number} level - Target level (integer >= 1).
 * @param {(lvl:number)=>number} basePercentFn - Returns per-level percent-of-base gain at a level.
 * @param {(lvl:number)=>number} slopePercentFn - Returns diminishing factor at a level (fraction).
 * @param {{step:number, anchor?:number}[]=} baseIntervals - Optional intervals where basePercentFn changes.
 * @param {{step:number, anchor?:number}[]=} slopeIntervals - Optional intervals where slopePercentFn changes.
 * @returns {number}
 */
// Removed unused experimental monotonic helpers to simplify the codebase.

// Cache for adjusted monotonic series (minimal change from original stepwise XP)
const __adjustedMonotonicCache = new Map();

/**
 * Build or extend an adjusted monotonic series close to the original stepwise XP:
 * old(k) = levelBonus(k) * (1 + basePercentFn(k) * (k - 1)) * tierFn(k)
 * new(1) = old(1)
 * new(k) = max(old(k), new(k-1) + levelBonus(k) * basePercentFn(k) * tierFn(k))
 *
 * This enforces strictly increasing values while deviating minimally from the original.
 * Returns the normalized series (without baseAtLevel1 multiplier).
 *
 * @param {string} cacheId
 * @param {number} level
 * @param {(lvl:number)=>number} basePercentFn
 * @param {(lvl:number)=>number} levelBonusFn
 * @param {(lvl:number)=>number} tierFn
 * @returns {number[]} new series array (normalized)
 */
export function getAdjustedMonotonicSeries(
  cacheId,
  level,
  basePercentFn,
  levelBonusFn,
  tierFn,
) {
  let entry = __adjustedMonotonicCache.get(cacheId);
  if (!entry) {
    entry = { old: [0], neu: [0] };
    // Initialize level 1
    const old1 = (levelBonusFn(1) || 1) * (tierFn(1) || 0); // basePercent*(1-1)=0
    entry.old[1] = old1;
    entry.neu[1] = old1;
    __adjustedMonotonicCache.set(cacheId, entry);
  }
  const { old, neu } = entry;
  for (let k = old.length; k <= level; k++) {
    const lb = levelBonusFn(k) || 1;
    const bpRaw = k <= 1 ? 0 : (basePercentFn(k) || 0);
    const bp = bpRaw * XP_GOLD_GROWTH_MULTIPLIER;
    const tf = tierFn(k) || 0;
    const oldVal = lb * (1 + bp * (k - 1)) * tf;
    old[k] = oldVal;
    if (k > 1) {
      const inc = lb * bp * tf;
      const prev = neu[k - 1] || 0;
      neu[k] = Math.max(oldVal, prev + inc, prev + 1e-9);
    }
  }
  return entry.neu;
}

/**
 * Compute XP using the adjusted monotonic series (minimal change approach).
 * @param {number} baseAtLevel1
 * @param {number} level
 * @param {(lvl:number)=>number} basePercentFn
 * @param {(lvl:number)=>number} levelBonusFn
 * @param {(lvl:number)=>number} tierFn
 * @param {string} cacheId
 * @returns {number}
 */
export function computeXPAdjustedMonotonic(
  baseAtLevel1,
  level,
  basePercentFn,
  levelBonusFn,
  tierFn,
  cacheId,
) {
  if (baseAtLevel1 <= 0) return 0;
  const series = getAdjustedMonotonicSeries(cacheId, level, basePercentFn, levelBonusFn, tierFn);
  return baseAtLevel1 * (series[level] || 0);
}

/**
 * Global, single‑place XP diminishing factor used for all modes (boss, explore, rocky field).
 * Currently mirrors the previous stepwise reduction: 1% every 20 levels, floored at 2.5%.
 * Adjust here to tune XP scaling globally.
 */
export function xpDiminishingFactor(level) {
  return percentReducedByLevel(1, level, 20, 0.01, 0.025);
}

// Global multiplier to slow down XP/Gold growth from level scaling.
// 0.6 means ~40% reduction in the per-level growth slope.
export const XP_GOLD_GROWTH_MULTIPLIER = 0.6;

export function scaleDownFlat(
  level,
  start = 1,
  interval = 10,
  max_level = 200,
  final_percent = 0.2,
  flat,
  min,
) {
  if (flat === undefined) flat = (start * (1 - final_percent)) / (max_level / interval);
  if (min === undefined) min = start * final_percent;

  if (level <= 0) return 0;

  // How many intervals before reaching min
  const stepsToMin = Math.floor((start - min) / flat);
  const levelsToMin = stepsToMin * interval;
  if (level <= levelsToMin) {
    // All levels above min, use arithmetic series sum
    const k = Math.floor((level - 1) / interval);
    const rem = level - k * interval;
    // Sum for full intervals
    const sumFull = interval * k * (2 * start - flat * (k - 1)) / 2;
    // Sum for remaining levels
    const sumRem = rem * Math.max(start - flat * k, min);
    return sumFull + sumRem;
  } else {
    // Sum up to min, then add min for remaining levels
    const sumToMin = interval * stepsToMin * (2 * start - flat * (stepsToMin - 1)) / 2;
    const remLevels = level - levelsToMin;

    return sumToMin + remLevels * min;
  }
}

/**
 * Scale a value up with diminishing returns, similar to scaleDownFlat but for increasing values, with no cap.
 *
 * @param {number} level - The current level (integer >= 0).
 * @param {number} start - Starting value at level 1.
 * @param {number} interval - Number of levels between each flat increase.
 * @param {number} flat - Flat percent increase per interval (e.g. 0.1 for +10% per interval). Default: 0.1
 * @returns {number} The scaled value at the given level.
 */
export function scaleUpFlat(
  level,
  start = 1,
  interval = 10,
  flat = 0.1,
) {
  if (level <= 0) return 0;

  // k = number of full intervals completed
  const k = Math.floor((level - 1) / interval);
  const rem = level - k * interval;
  // Each interval increases the multiplier by flat
  // Sum for full intervals (arithmetic series of multipliers)
  const sumFull = interval * k * (2 * 1 + flat * (k - 1)) / 2;
  // Sum for remaining levels (all at last multiplier)
  const sumRem = rem * (1 + flat * k);
  return start * (sumFull + sumRem);
}

/**
 * Reduce a percentage in fixed steps per level interval.
 *
 * Example: startPercent=1 (100%), interval=20, reducePerInterval=0.01 (1%) ->
 * at level 1..20 returns 1.00, at level 21..40 returns 0.99, etc.
 *
 * @param {number} startPercent - Starting value (can be any numeric unit, e.g. 1.0 or 100).
 * @param {number} level - Target level (integer >= 1).
 * @param {number} interval - Number of levels per reduction step. Default 20.
 * @param {number} reducePerInterval - Fraction to subtract per interval (e.g. 0.01 = 1%). Default 0.01.
 * @param {number} minPercent - Minimum allowed percent (fraction). Default 0.
 * @returns {number} Reduced percentage as fraction, clamped to [minPercent, startPercent].
 */
export function percentReducedByLevel(
  startPercent,
  level,
  interval = 20,
  reducePerInterval = 0.01,
  minPercent = 0,
) {
  // startPercent may be any numeric starting value (not forced to be a fraction).
  if (interval <= 0) interval = 1; // avoid division by zero
  const sp = startPercent;
  const rpi = reducePerInterval;
  const mp = minPercent;

  // At level 1 return the starting value (but don't go below minPercent)
  if (level <= 1) return Math.max(mp, sp);

  const intervalsPassed = Math.floor((level - 1) / interval);
  const reduced = sp - intervalsPassed * rpi;
  // Clamp between minPercent and the original start value
  return Math.max(mp, Math.min(reduced, sp));
}

/**
 * Increase a percentage in fixed steps per level interval.
 *
 * Example: startPercent=1 (100%), interval=20, increasePerInterval=0.01 (1%) ->
 * at level 1..20 returns 1.00, at level 21..40 returns 1.01, etc., clamped to maxPercent.
 *
 * @param {number} startPercent - Starting value (can be any numeric unit, e.g. 1.0 or 100).
 * @param {number} level - Target level (integer >= 1).
 * @param {number} interval - Number of levels per increase step. Default 20.
 * @param {number} increasePerInterval - Fraction to add per interval (e.g. 0.01 = 1%). Default 0.01.
 *                     If provided as whole-percent (e.g. 1) it will be converted.
 * @param {number} maxPercent - Maximum allowed percent (fraction). Default 1.
 * @returns {number} Increased percentage as fraction, clamped to [startPercent, maxPercent].
 */
export function percentIncreasedByLevel(
  startPercent,
  level,
  interval = 20,
  increasePerInterval = 0.01,
  maxPercent = 1,
) {
  // startPercent may be any numeric starting value (not forced to be a fraction).
  if (interval <= 0) interval = 1; // avoid division by zero
  const sp = startPercent;
  const ipi = increasePerInterval;
  const mp = maxPercent;

  // At level 1 return the starting value (but don't exceed maxPercent)
  if (level <= 1) return Math.min(mp, sp);

  const intervalsPassed = Math.floor((level - 1) / interval);
  const increased = sp + intervalsPassed * ipi;
  // Clamp between original start value and maxPercent
  return Math.min(mp, Math.max(increased, sp));
}
