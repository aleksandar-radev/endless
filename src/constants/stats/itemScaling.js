/**
 * Sum diminishing flat bonuses until a minimum value then
 * continue adding that minimum for remaining levels.
 */
function scaleDownFlat(
  level,
  start = 1,
  interval = 10,
  max_level = 200,
  final_percent = 0.2,
  flat,
  min,
) {
  if (flat === undefined)
    flat = (start * (1 - final_percent)) / (max_level / interval);
  if (min === undefined) min = start * final_percent;

  if (level <= 0) return 0;

  const stepsToMin = Math.floor((start - min) / flat);
  const levelsToMin = stepsToMin * interval;
  if (level <= levelsToMin) {
    const k = Math.floor((level - 1) / interval);
    const rem = level - k * interval;
    const sumFull = (interval * k * (2 * start - flat * (k - 1))) / 2;
    const sumRem = rem * Math.max(start - flat * k, min);
    return sumFull + sumRem;
  } else {
    const sumToMin =
      (interval * stepsToMin * (2 * start - flat * (stepsToMin - 1))) / 2;
    const remLevels = level - levelsToMin;
    return sumToMin + remLevels * min;
  }
}

/**
 * Compute a scaling multiplier for item stats by accumulating diminishing
 * flat bonuses from `start` toward `end`, adjusted by item tier.
 *
 * @param {number} level - Item level.
 * @param {number} [tier=1] - Item tier (1-based).
 * @param {object} [config]
 * @param {number} [config.start=0.04] - Initial flat bonus per level.
 * @param {number} [config.end=0.01] - Final flat bonus after maxLevel.
 * @param {number} [config.interval=1] - Levels per flat bonus step.
 * @param {number} [config.maxLevel=2000] - Levels over which start to end transition occurs.
 * @param {number} [config.tierStart=0.1] - Multiplier applied to `start` per tier above 1.
 * @param {number} [config.tierEnd=0.1] - Multiplier applied to `end` per tier above 1.
 * @returns {number} Scaling factor to multiply base stat values by.
 */
export function itemLevelScaling(
  level,
  tier = 1,
  {
    start = 0.04,
    end = 0.01,
    interval = 1,
    maxLevel = 2000,
    tierStart = 0.1,
    tierEnd = 0.1,
  } = {},
) {
  if (level <= 0) return 1;

  // Adjust starting and ending values based on tier with separate scaling.
  const s = start * (1 + (tier - 1) * tierStart);
  const e = end * (1 + (tier - 1) * tierEnd);

  // Accumulate diminishing increases from `s` to `e`.
  const total = scaleDownFlat(level, s, interval, maxLevel, e / s);

  // Base multiplier is 1; add accumulated increases.
  return 1 + total;
}
