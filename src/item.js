import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS } from './constants/items.js';
import { getRegionByTier } from './constants/regions.js';
import { STATS } from './constants/stats/stats.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { options } from './globals.js';
import { formatStatName } from './ui/ui.js';

// Dynamically generate AVAILABLE_STATS from STATS
export const AVAILABLE_STATS = Object.fromEntries(
  Object.entries(STATS)
    .filter(([_, config]) => config.item)
    .map(([stat, config]) => [stat, config.item]),
);

const RESISTANCE_STATS = [
  'fireResistance',
  'coldResistance',
  'airResistance',
  'earthResistance',
  'lightningResistance',
  'waterResistance',
  'fireResistancePercent',
  'coldResistancePercent',
  'airResistancePercent',
  'earthResistancePercent',
  'lightningResistancePercent',
  'waterResistancePercent',
  'allResistance',
  'allElementalResistancePercent',
];

const ATTRIBUTE_STATS = [
  ...Object.keys(ATTRIBUTES),
  ...Object.keys(ATTRIBUTES).map((a) => `${a}Percent`),
  'allAttributes',
  'allAttributesPercent',
];

export default class Item {
  constructor(type, level, rarity, tier = 1, existingStats = null, metaData = {}) {
    this.type = type;
    this.level = level;
    this.rarity = rarity.toUpperCase();
    this.tier = tier;
    // Only generate new stats if no existing stats provided
    this.metaData = metaData;
    this.stats = existingStats || this.generateStats();
    this.id = crypto.randomUUID();
  }

  getLevelScale(stat, level) {
    const scaling = AVAILABLE_STATS[stat].scaling(level);
    return scaling;
  }

  getTierBonus() {
    return getRegionByTier(this.tier).itemBaseBonus;
  }

  getMultiplier() {
    return ITEM_RARITY[this.rarity].statMultiplier;
  }

  calculateStatValue({ baseValue, tierBonus, multiplier, scale, stat }) {
    const decimals = STATS[stat].decimalPlaces || 0;
    let val = Number((baseValue * tierBonus * multiplier * scale).toFixed(decimals));

    const limit = STATS[stat].item?.limit || Infinity;
    val = Math.min(val, limit);

    this.metaData = this.metaData || {};
    this.metaData[stat] = { baseValue };

    return val;
  }

  /**
   * Calculate the min and max possible value for a given stat on this item.
   * @param {string} stat
   * @returns {{min: number, max: number}}
   */
  getStatMinMax(stat) {
    const statConfig = AVAILABLE_STATS[stat];
    if (!statConfig) return { min: 0, max: 0 };
    const tierBonus = this.getTierBonus();
    const multiplier = this.getMultiplier();
    const scale = this.getLevelScale(stat, this.level);
    const decimals = STATS[stat].decimalPlaces || 0;
    const limit = STATS[stat].item?.limit || Infinity;
    // Min value
    let minVal = Number((statConfig.min * tierBonus * multiplier * scale).toFixed(decimals));
    let maxVal = Number((statConfig.max * tierBonus * multiplier * scale).toFixed(decimals));
    minVal = Math.min(minVal, limit);
    maxVal = Math.min(maxVal, limit);
    return { min: minVal, max: maxVal };
  }

  /**
   * Get min/max for all stats on this item.
   * @returns {Object} { stat: {min, max}, ... }
   */
  getAllStatsMinMax() {
    const result = {};
    for (const stat of Object.keys(this.stats)) {
      result[stat] = this.getStatMinMax(stat);
    }
    return result;
  }

  generateStats() {
    const stats = {};
    const itemPool = ITEM_STAT_POOLS[this.type];
    const totalStatsNeeded = ITEM_RARITY[this.rarity].totalStats;
    const multiplier = this.getMultiplier();
    const tierBonus = this.getTierBonus();
    const calculateStatValue = (stat, baseValue) => {
      const scale = this.getLevelScale(stat, this.level);
      return this.calculateStatValue({ baseValue, tierBonus, multiplier, scale, stat });
    };

    // Add mandatory stats first
    itemPool.mandatory.forEach((stat) => {
      const range = AVAILABLE_STATS[stat];
      const baseValue = Math.random() * (range.max - range.min) + range.min;
      stats[stat] = calculateStatValue(stat, baseValue);
    });

    // Add random stats from possible pool until totalStatsNeeded
    const remainingStats = totalStatsNeeded - itemPool.mandatory.length;
    const availableStats = [...itemPool.possible].filter((stat) => !itemPool.mandatory.includes(stat));
    let resistanceCount = Object.keys(stats).filter((s) => RESISTANCE_STATS.includes(s)).length;
    let attributeCount = Object.keys(stats).filter((s) => ATTRIBUTE_STATS.includes(s)).length;

    for (let i = 0; i < remainingStats && availableStats.length > 0; ) {
      const eligibleStats = availableStats.filter(
        (s) =>
          !(RESISTANCE_STATS.includes(s) && resistanceCount >= 3) &&
          !(ATTRIBUTE_STATS.includes(s) && attributeCount >= 3),
      );
      if (eligibleStats.length === 0) break;
      const stat = eligibleStats[Math.floor(Math.random() * eligibleStats.length)];
      availableStats.splice(availableStats.indexOf(stat), 1);
      const range = AVAILABLE_STATS[stat];
      const baseValue = Math.random() * (range.max - range.min) + range.min;
      stats[stat] = calculateStatValue(stat, baseValue);
      if (RESISTANCE_STATS.includes(stat)) resistanceCount++;
      if (ATTRIBUTE_STATS.includes(stat)) attributeCount++;
      i++;
    }

    return stats;
  }

  getIcon() {
    return ITEM_ICONS[this.type] || '❓';
  }

  getDisplayName() {
    return `${ITEM_RARITY[this.rarity].name} ${this.type}`;
  }

  getTooltipHTML(isEquipped = false) {
    const html = String.raw;

    const isPercentStat = (stat) => {
      return stat.endsWith('Percent') || stat === 'critChance' || stat === 'blockChance' || stat === 'lifeSteal';
    };

    // Check global options for advanced tooltips
    let showAdvanced = false;
    try {
      if (options.showAdvancedTooltips) {
        showAdvanced = true;
      }
    } catch (e) {}

    // Precompute min/max for all stats if needed
    let statMinMax = {};
    if (showAdvanced) {
      statMinMax = this.getAllStatsMinMax();
    }

    return html`
      <div class="item-tooltip">
        <div class="item-name" style="color: ${ITEM_RARITY[this.rarity].color};">
          ${isEquipped ? '(Equipped) ' : ''}${this.getDisplayName()}
        </div>
        <div class="item-level">Level ${this.level}, Tier ${this.tier}</div>
        <div class="item-stats">
          ${Object.entries(this.stats)
    .map(([stat, value]) => {
      const decimals = STATS[stat].decimalPlaces || 0;
      const formattedValue = value.toFixed(decimals);
      let adv = '';
      if (showAdvanced && statMinMax[stat]) {
        const min = statMinMax[stat].min.toFixed(decimals);
        const max = statMinMax[stat].max.toFixed(decimals);
        adv = `<span class="item-ref-range" style="float:right; color:#aaa; text-align:right; min-width:60px;">${min} - ${max}</span>`;
      }
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <span>${formatStatName(stat)}: ${formattedValue}${isPercentStat(stat) ? '%' : ''}</span>
        ${adv}
      </div>`;
    })
    .join('')}
        </div>
      </div>
    `;
  }

  /**
   * Reverse-engineer the base (unscaled) stat values for this item.
   * @returns {Object} base stat values keyed by stat name
   */
  getBaseStatValues() {
    if (this.metaData && Object.keys(this.metaData).length > 0) {
      // If metaData exists, use it to get base values directly
      return Object.fromEntries(Object.entries(this.metaData).map(([stat, data]) => [stat, data.baseValue]));
    }
    const baseValues = {};
    const tierBonus = this.getTierBonus();
    const multiplier = this.getMultiplier();
    for (const stat of Object.keys(this.stats)) {
      const scaling = this.getLevelScale(stat, this.level);
      const value = this.stats[stat];
      baseValues[stat] = value / (multiplier * scaling * tierBonus);
    }
    return baseValues;
  }

  /**
   * Apply a new level to the item, scaling all stats from the provided base values.
   * @param {Object} baseValues - base stat values keyed by stat name
   * @param {number} newLevel
   */
  applyLevelToStats(newLevel) {
    const baseValues = this.getBaseStatValues();
    const tierBonus = this.getTierBonus();
    const multiplier = this.getMultiplier();
    for (const stat of Object.keys(this.stats)) {
      const scale = this.getLevelScale(stat, newLevel);
      this.stats[stat] = this.calculateStatValue({ baseValue: baseValues[stat], tierBonus, multiplier, scale, stat });
    }
    this.level = newLevel;
  }

  addRandomStat() {
    const pool = ITEM_STAT_POOLS[this.type];
    if (!pool) return;
    // Exclude already present stats
    const availableStats = pool.possible.filter(stat => !(stat in this.stats));
    if (availableStats.length === 0) return;
    const resistanceCount = Object.keys(this.stats).filter((s) => RESISTANCE_STATS.includes(s)).length;
    const attributeCount = Object.keys(this.stats).filter((s) => ATTRIBUTE_STATS.includes(s)).length;
    const eligibleStats = availableStats.filter(
      (s) =>
        !(RESISTANCE_STATS.includes(s) && resistanceCount >= 3) &&
        !(ATTRIBUTE_STATS.includes(s) && attributeCount >= 3),
    );
    if (eligibleStats.length === 0) return;
    const stat = eligibleStats[Math.floor(Math.random() * eligibleStats.length)];
    const range = AVAILABLE_STATS[stat];
    const baseValue = Math.random() * (range.max - range.min) + range.min;
    const tierBonus = this.getTierBonus();
    const multiplier = this.getMultiplier();
    const scale = this.getLevelScale(stat, this.level);
    this.stats[stat] = this.calculateStatValue({
      baseValue,
      tierBonus,
      multiplier,
      scale,
      stat,
    });
    if (!this.metaData) this.metaData = {};
    this.metaData[stat] = { baseValue };
  }
}
