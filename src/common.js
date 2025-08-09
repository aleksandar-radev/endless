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
      lastApiTime = apiTime;
      lastApiTimestamp = Date.now();
    } catch (e) {
      // Fallback to local time if API fails
      lastApiTime = Date.now();
      lastApiTimestamp = lastApiTime;
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

export function scaleDownFlat(
  level,
  start = 1,
  interval = 10,
  max_level = 200,
  final_percent = 0.2,
  flat,
  min,
) {
  if (flat === undefined) flat = (1 - final_percent) / (max_level / 10);
  if (min === undefined) min = final_percent;

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