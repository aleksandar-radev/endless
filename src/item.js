import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS } from './constants/items.js';
import { STATS, getItemTierBonus } from './constants/stats/stats.js';
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { options } from './globals.js';
import { formatStatName, formatNumber } from './ui/ui.js';
import { t } from './i18n.js';

const BASE = import.meta.env.VITE_BASE_PATH;

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
  'allResistancePercent',
];

const ATTRIBUTE_STATS = [
  ...Object.keys(ATTRIBUTES),
  ...Object.keys(ATTRIBUTES).map((a) => `${a}Percent`),
  'allAttributes',
  'allAttributesPercent',
];

// Predefined order of stats within groups
const OFFENSE_ORDER = Object.keys(OFFENSE_STATS);
const RESISTANCE_ORDER = RESISTANCE_STATS;
const DEFENSE_ORDER = Object.keys(DEFENSE_STATS).filter((s) => !RESISTANCE_ORDER.includes(s));
const ATTRIBUTE_ORDER = ATTRIBUTE_STATS;
const MISC_ORDER = Object.keys(MISC_STATS).filter((s) => !ATTRIBUTE_ORDER.includes(s));

// Group ordering for tooltip display
const STAT_GROUPS = [
  { name: 'offense', order: OFFENSE_ORDER },
  { name: 'defense', order: DEFENSE_ORDER },
  { name: 'resistance', order: RESISTANCE_ORDER },
  { name: 'attribute', order: ATTRIBUTE_ORDER },
  { name: 'misc', order: MISC_ORDER },
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
    const scalingFn = AVAILABLE_STATS[stat].scaling;
    return typeof scalingFn === 'function' ? scalingFn(level, this.tier) : 1;
  }

  getTierBonus(stat) {
    return getItemTierBonus(stat, this.tier);
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
    const tierBonus = this.getTierBonus(stat);
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
    const calculateStatValue = (stat, baseValue) => {
      const scale = this.getLevelScale(stat, this.level);
      const tierBonus = this.getTierBonus(stat);
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
    return ITEM_ICONS[this.type] || `<img src="${BASE}/icons/help.svg" class="icon" alt="?"/>`;
  }

  getDisplayName() {
    return `${ITEM_RARITY[this.rarity].name} ${this.type}`;
  }

  getTooltipHTML(isEquipped = false) {
    const html = String.raw;

    const isPercentStat = (stat) => {
      return (
        stat.endsWith('Percent') ||
        stat === 'critChance' ||
        stat === 'blockChance' ||
        stat === 'lifeSteal' ||
        stat === 'manaSteal' ||
        stat === 'omniSteal'
      );
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
        <div class="item-level">${t('item.level')}: ${formatNumber(this.level)}, ${t('item.tier')}: ${formatNumber(this.tier)}</div>
        <div class="item-stats">
          ${STAT_GROUPS.map((group) => {
    const stats = group.order.filter((s) => this.stats[s] !== undefined);
    if (stats.length === 0) return null;
    const groupHtml = stats
      .map((stat) => {
        const value = this.stats[stat];
        const decimals = STATS[stat].decimalPlaces || 0;
        const formattedValue = formatNumber(value.toFixed(decimals));
        let adv = '';
        if (showAdvanced && statMinMax[stat]) {
          const min = formatNumber(statMinMax[stat].min.toFixed(decimals));
          const max = formatNumber(statMinMax[stat].max.toFixed(decimals));
          adv = `<span class="item-ref-range" style="float:right; color:#aaa; text-align:right; min-width:60px;">${min} - ${max}</span>`;
        }
        return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <span>${formatStatName(stat)}: ${formattedValue}${isPercentStat(stat) ? '%' : ''}</span>
          ${adv}
        </div>`;
      })
      .join('');
    return groupHtml;
  })
    .filter(Boolean)
    .join('<hr class="item-tooltip-separator" />')}
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
    const multiplier = this.getMultiplier();
    for (const stat of Object.keys(this.stats)) {
      const scaling = this.getLevelScale(stat, this.level);
      const tierBonus = this.getTierBonus(stat);
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
    const multiplier = this.getMultiplier();
    for (const stat of Object.keys(this.stats)) {
      const scale = this.getLevelScale(stat, newLevel);
      const tierBonus = this.getTierBonus(stat);
      this.stats[stat] = this.calculateStatValue({ baseValue: baseValues[stat], tierBonus, multiplier, scale, stat });
    }
    this.level = newLevel;
  }

  addRandomStat(excludeStat = null) {
    const pool = ITEM_STAT_POOLS[this.type];
    if (!pool) return;
    // Exclude already present stats
    let availableStats = pool.possible.filter((stat) => !(stat in this.stats));
    if (excludeStat) availableStats = availableStats.filter((stat) => stat !== excludeStat);
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
    const multiplier = this.getMultiplier();
    const scale = this.getLevelScale(stat, this.level);
    const tierBonus = this.getTierBonus(stat);
    this.stats[stat] = this.calculateStatValue({
      baseValue,
      tierBonus,
      multiplier,
      scale,
      stat,
    });
    if (!this.metaData) this.metaData = {};
    this.metaData[stat] = { baseValue };
    return stat;
  }
}
