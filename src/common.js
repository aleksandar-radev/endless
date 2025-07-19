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