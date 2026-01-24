import { fetchTrustedUtcTime } from './api.js';
import { XP_GOLD_GROWTH_MULTIPLIER } from './constants/common.js';
import { PER_LEVEL_SCALE } from './constants/ratios.js';
import { STATS } from './constants/stats/stats.js';

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
  if (lastApiTime && now - lastApiTimestamp < 15000) {
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

export function setStepFunctionMetadata(fn, interval, offset = 0) {
  if (typeof fn !== 'function') return fn;
  if (!Number.isFinite(interval) || interval <= 0) return fn;
  const meta = {
    interval,
    offset: Number.isFinite(offset) ? offset : 0,
  };
  Object.defineProperty(fn, '__stepMeta', {
    value: meta,
    configurable: true,
    writable: false,
  });
  return fn;
}

/**
 * Global, single‑place XP diminishing factor used for all modes (boss, explore, rocky field).
 * Currently mirrors the previous stepwise reduction: 1% every 20 levels, floored at 2.5%.
 * Adjust here to tune XP scaling globally.
 */
export function xpDiminishingFactor(level) {
  return percentReducedByLevel(1, level, 20, 0.01, 0.025);
}

export function computeScaledReward(baseAtLevel1, level, basePercent, levelBonus, diminishingFactor = 1) {
  if (!Number.isFinite(baseAtLevel1) || baseAtLevel1 <= 0) {
    return 0;
  }
  if (!Number.isFinite(level) || level <= 0) {
    return 0;
  }
  const safeLevel = Math.max(1, Math.floor(level));
  const percent = Number.isFinite(basePercent) ? Math.max(basePercent, 0) : 0;
  const growth = 1 + XP_GOLD_GROWTH_MULTIPLIER * percent * (safeLevel - 1);
  const levelScale = Number.isFinite(levelBonus) ? Math.max(levelBonus, 0) : 1;
  const diminishing = Number.isFinite(diminishingFactor) ? Math.max(diminishingFactor, 0) : 1;
  return baseAtLevel1 * levelScale * growth * diminishing;
}

export function scaleDownFlat(level, start = 1, interval = 10, max_level = 200, final_percent = 0.2, flat, min) {
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
    const sumFull = (interval * k * (2 * start - flat * (k - 1))) / 2;
    // Sum for remaining levels
    const sumRem = rem * Math.max(start - flat * k, min);
    return sumFull + sumRem;
  } else {
    // Sum up to min, then add min for remaining levels
    const sumToMin = (interval * stepsToMin * (2 * start - flat * (stepsToMin - 1))) / 2;
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
export function scaleUpFlat(level, start = 1, interval = 10, flat = 0.1) {
  if (level <= 0) return 0;

  // k = number of full intervals completed
  const k = Math.floor((level - 1) / interval);
  const rem = level - k * interval;
  // Each interval increases the multiplier by flat
  // Sum for full intervals (arithmetic series of multipliers)
  const sumFull = (interval * k * (2 * 1 + flat * (k - 1))) / 2;
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
export function percentReducedByLevel(startPercent, level, interval = 20, reducePerInterval = 0.01, minPercent = 0) {
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

export function createPercentScaleFunction(startPercent, interval, increasePerInterval, maxPercent) {
  const fn = (level) => percentIncreasedByLevel(startPercent, level, interval, increasePerInterval, maxPercent);
  return setStepFunctionMetadata(fn, interval, 1);
}

/**
 * Calculate percentage bonus with smooth transition from power curve to linear scaling.
 * Phase 1 (Early Game): Power curve (square root-like) for better retention than logarithmic
 * Phase 2 (End Game): Linear growth after softcap for infinite progression
 *
 * The function automatically calculates the growth factor to ensure a smooth transition
 * at the softcap level by matching the derivative of the power curve to the linear slope.
 *
 * @param {Object} params - Configuration object
 * @param {number} params.level - The current skill level (>= 1)
 * @param {number} [params.base=10] - The starting value at level 1
 * @param {number} [params.softcap=2000] - The level at which to transition to linear growth
 * @param {number} [params.linear=0.5] - The per-level increase after softcap
 * @param {number} [params.power=0.6] - Power factor (0.5 = square root, 0.7 = stronger feel)
 * @returns {number} The calculated percentage bonus
 */
export function getScalingPercent({
  level, base = 10, softcap = 2000, linear = 0.5, power = 0.6,
}) {
  if (level <= 0) return 0;
  if (level === 1) return base;

  // AUTO-CALCULATION:
  // Calculate 'growthFactor' automatically so the curve hits the exact
  // speed of 'linear' at the moment of the softcap.
  // This guarantees a perfectly smooth transition.
  // Formula derived from derivative matching: A = m / (p * S^(p-1))
  const growthFactor = linear / (power * Math.pow(softcap, power - 1));

  if (level <= softcap) {
    // Phase 1: Power Curve (Square Root)
    // Much better retention than Log()
    return base + growthFactor * (Math.pow(level, power) - 1);
  } else {
    // Phase 2: Linear growth
    // Calculate the exact value at softcap
    const valueAtSoftcap = base + growthFactor * (Math.pow(softcap, power) - 1);

    // Continue linearly from there
    return valueAtSoftcap + linear * (level - softcap);
  }
}

/**
 * Calculate flat stat with linear growth and milestone bonuses.
 * The value increases linearly each level, with additive bonuses at milestone intervals.
 *
 * @param {Object} params - Configuration object
 * @param {number} params.level - The current skill level (>= 1)
 * @param {number} [params.base=10] - The starting value at level 1
 * @param {number} [params.increment=1] - The flat increase per level
 * @param {number} [params.interval=50] - How often milestone bonuses occur (e.g., every 50 levels)
 * @param {number} [params.bonus=0.2] - The additive bonus per milestone (e.g., 0.2 for +20% per milestone)
 * @returns {number} The calculated flat value
 */
export function getScalingFlat({
  level, base = 10, increment = 1, interval = 50, bonus = 0.2,
}) {
  if (level <= 0) return 0;

  // 1. Calculate Standard Linear Value
  let value = base + (level - 1) * increment;

  // 2. Calculate Milestone Modifier linearly
  if (interval > 0 && level >= interval) {
    const milestonesPassed = Math.floor(level / interval);

    // Instead of Math.pow, we simply add the bonuses together
    // 5 milestones passed = 1 + (5 * 0.2) = 2.0x multiplier
    const totalMultiplier = 1 + (milestonesPassed * bonus);

    value *= totalMultiplier;
  }

  return value;
}

/**
 * Calculate chance-based stats (like crit chance) with linear scaling and a hard cap.
 *
 * @param {Object} params - Configuration object
 * @param {number} params.level - The current skill level (>= 1)
 * @param {number} [params.base=1] - The starting chance at level 1 (as a percentage, e.g., 1 for 1%)
 * @param {number} [params.levelsPerPoint=10] - How many levels for each increment (e.g., 10 levels per 1%)
 * @param {number} [params.cap=75] - The maximum chance cap (e.g., 75 for 75% max)
 * @returns {number} The calculated chance percentage
 */
export function getScalingChance({
  level, base = 1, levelsPerPoint = 10, cap = 75,
}) {
  if (level <= 0) return 0;

  const increments = Math.floor((level - 1) / levelsPerPoint);
  const chance = base + increments;

  return Math.min(chance, cap);
}

/**
 * Calculate synergy bonus from one skill to another.
 * Returns a percentage multiplier based on the source skill's level.
 *
 * @param {Object} params - Configuration object
 * @param {number} params.level - The level of the skill providing the synergy
 * @param {number} [params.base=1] - The starting bonus percentage at level 1 (e.g., 1 for 1%)
 * @param {number} [params.increment=1] - The bonus increase per level (e.g., 1 for +1% per level)
 * @param {number} [params.cap=100] - The maximum synergy bonus percentage (e.g., 100 for 100% = double effect)
 * @returns {number} The synergy bonus as a percentage (e.g., 50 means +50% effectiveness)
 */
export function getScalingSynergy({
  level, base = 1, increment = 1, cap = 100,
}) {
  if (level <= 0) return 0;

  const bonus = base + (level - 1) * increment;
  const result = Math.min(bonus, cap);

  return result;
}

/**
 * Calculate skill stat bonus using centralized configuration from STATS.
 * This function reads the skill type's bonuses from the stat definition and applies optional scaling.
 * Supports flat, percent, and chance stat types with their respective scaling formulas.
 *
 * @param {Object} params - Configuration object
 * @param {number} params.level - The current skill level (>= 1)
 * @param {string} params.statKey - The stat key from STATS (e.g., 'damage', 'armor', 'mana')
 * @param {string} params.skillType - The skill type (e.g., 'passive', 'toggle', 'instant', 'buff', 'summon')
 * @param {Object} [params.scale] - Optional scaling object to adjust base values and max values
 * @param {boolean|number} [params.perLevel=false] - If true/number, returns a "perLevel" variant (much smaller values).
 *                                                     If true: uses default scale (0.001 for flat, 0.01 for percent).
 *                                                     If number: multiplies default scale by that number (1 = true, 2 = double, 0.5 = half).
 * @returns {number} The calculated stat value at the given level
 */
export function getSkillStatBonus({
  level, statKey, skillType, scale = {}, perLevel = false,
}) {
  if (level <= 0) return 0;

  const stat = STATS[statKey];
  if (!stat || !stat.skills || !stat.skills[skillType]) {
    console.warn(`No skill bonus configuration found for stat: ${statKey}, skillType: ${skillType}`);
    return 0;
  }

  const config = stat.skills[skillType];
  let value;
  let uncappedValue;
  let maxValue;
  let perLevelConfig = { scale: PER_LEVEL_SCALE, divisor: 1 };

  if (config.statType === 'percent') {
    const base = config.base * (scale.base || 1);
    const softcap = config.softcap * (scale.softcap || 1);
    const linear = config.linear * (scale.linear || 1);
    const power = config.power * (scale.power || 1);

    value = getScalingPercent({
      level, base, softcap, linear, power,
    });
    uncappedValue = value;

    if (scale.limit !== undefined) {
      maxValue = scale.limit;
      value = Math.min(value, maxValue);
    } else if (config.max !== undefined) {
      maxValue = config.max * (scale.max || 1);
      value = Math.min(value, maxValue);
    }
    perLevelConfig = { scale: 0.01, divisor: 100 };
  } else if (config.statType === 'chance') {
    const base = config.base * (scale.base || 1);
    const levelsPerPoint = config.levelsPerPoint * (scale.levelsPerPoint || 1);
    let cap = config.cap * (scale.cap || 1);
    if (scale.limit !== undefined) {
      cap = Math.min(cap, scale.limit);
    }

    value = getScalingChance({
      level, base, levelsPerPoint, cap,
    });
    uncappedValue = getScalingChance({
      level, base, levelsPerPoint, cap: Infinity,
    });
    maxValue = cap;
    perLevelConfig = { scale: PER_LEVEL_SCALE, divisor: 100 };
  } else {
    // Flat
    const base = config.base * (scale.base || 1);
    const increment = config.increment * (scale.increment || 1);
    const interval = config.interval * (scale.interval || 1);
    const bonus = config.bonus * (scale.bonus || 1);

    value = getScalingFlat({
      level, base, increment, interval, bonus,
    });
    uncappedValue = value;

    if (scale.limit !== undefined) {
      maxValue = scale.limit;
      value = Math.min(value, maxValue);
    } else if (config.max !== undefined) {
      maxValue = config.max * (scale.max || 1);
      value = Math.min(value, maxValue);
    }
  }

  if (!perLevel) {
    const isCapped = maxValue !== undefined || config.statType === 'chance';
    if (isCapped) {
      return {
        _isStatBonus: true,
        value,
        uncappedValue,
        max: maxValue,
        valueOf() { return this.value; },
        toString() { return String(this.value); },
      };
    }

    return value;
  }

  // Per Level Calculation
  const perLevelMultiplier = typeof perLevel === 'number' ? perLevel : 1;
  return value * perLevelConfig.scale * perLevelMultiplier / perLevelConfig.divisor;
}

