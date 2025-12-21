import {
  SCALING_SYSTEM,
  ITEM_FLAT_REGION_SCALING_MULTIPLIER,
  ITEM_PERCENT_REGION_SCALING_MULTIPLIER,
  ITEM_FLAT_STAGE_SCALING_PERCENT,
  ITEM_PERCENT_STAGE_SCALING_PERCENT,
} from '../scaling.js';

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
 * Compute a scaling multiplier for item stats.
 * 
 * For the simple scaling system:
 * - Flat values: scale by tier (2x per tier) and level (0.8% per level)
 * - Percent values: scale by tier (1.3x per tier) and level (0.1% per level)
 * 
 * For the legacy scaling system:
 * - Uses diminishing flat bonuses from start toward end, adjusted by item tier
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
 * @param {boolean} [config.isPercent=false] - Whether this is a percent stat (affects simple scaling).
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
    isPercent = false,
  } = {},
) {
  if (level <= 0) return 1;

  if (SCALING_SYSTEM === 'simple') {
    // New simple scaling system
    // Tier scaling: multiply by the appropriate multiplier for each tier above 1
    const tierMultiplier = isPercent
      ? ITEM_PERCENT_REGION_SCALING_MULTIPLIER
      : ITEM_FLAT_REGION_SCALING_MULTIPLIER;
    const tierScale = Math.pow(tierMultiplier, tier - 1);

    // Level scaling: percentage increase per level from base
    const levelPercent = isPercent
      ? ITEM_PERCENT_STAGE_SCALING_PERCENT
      : ITEM_FLAT_STAGE_SCALING_PERCENT;
    const levelScale = 1 + (level - 1) * levelPercent;

    return tierScale * levelScale;
  }

  // Legacy scaling system
  // Adjust starting and ending values based on tier with separate scaling.
  const s = start * (1 + (tier - 1) * tierStart);
  const e = end * (1 + (tier - 1) * tierEnd);

  // Accumulate diminishing increases from `s` to `e`.
  const total = scaleDownFlat(level, s, interval, maxLevel, e / s);

  // Apply a small overall multiplier based on tier. Tier 2 is treated as the
  // baseline, tier 1 is slightly slower and higher tiers scale a bit faster.
  const tierMult = 1 + (Math.max(tier, 1) - 2) * 0.05;

  // Base multiplier is 1; add accumulated increases adjusted by tier.
  return 1 + total * tierMult;
}
