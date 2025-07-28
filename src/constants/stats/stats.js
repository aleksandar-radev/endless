import { OFFENSE_STATS } from './offenseStats.js';
import { DEFENSE_STATS } from './defenseStats.js';
import { MISC_STATS } from './miscStats.js';

export const STATS = {
  ...OFFENSE_STATS,
  ...DEFENSE_STATS,
  ...MISC_STATS,
};

// Linear decay parameters
const MAX_LEVEL = 50000;
const FINAL_PERCENT = .05; // 5% of original multiplier at MAX_LEVEL

export function scaleDownFlatSum(level, start = 1, flat = (1 - FINAL_PERCENT) / (MAX_LEVEL / 10), interval = 10, min = FINAL_PERCENT) {
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