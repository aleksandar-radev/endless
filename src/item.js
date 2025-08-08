import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS } from './constants/items.js';
import { getRegionByTier } from './constants/regions.js';
import { STATS } from './constants/stats/stats.js';
import { formatStatName } from './ui/ui.js';

// Dynamically generate AVAILABLE_STATS from STATS
export const AVAILABLE_STATS = Object.fromEntries(
  Object.entries(STATS)
    .filter(([_, config]) => config.item)
    .map(([stat, config]) => [stat, config.item]),
);

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
    const rarityData = ITEM_RARITY[this.rarity];
    if (!rarityData) {
      console.warn(`Invalid rarity '${this.rarity}' for item, using NORMAL rarity`);
      return ITEM_RARITY.NORMAL.statMultiplier;
    }
    return rarityData.statMultiplier;
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

    for (let i = 0; i < remainingStats && availableStats.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableStats.length);
      const stat = availableStats.splice(randomIndex, 1)[0];
      const range = AVAILABLE_STATS[stat];
      const baseValue = Math.random() * (range.max - range.min) + range.min;
      stats[stat] = calculateStatValue(stat, baseValue);
    }

    return stats;
  }

  getIcon() {
    return ITEM_ICONS[this.type] || '❓';
  }

  getDisplayName() {
    const rarityData = ITEM_RARITY[this.rarity];
    if (!rarityData) {
      console.warn(`Invalid rarity '${this.rarity}' for item, using NORMAL rarity`);
      return `${ITEM_RARITY.NORMAL.name} ${this.type}`;
    }
    return `${rarityData.name} ${this.type}`;
  }

  getTooltipHTML(isEquipped = false) {
    const html = String.raw;

    const isPercentStat = (stat) => {
      return stat.endsWith('Percent') || stat === 'critChance' || stat === 'blockChance' || stat === 'lifeSteal';
    };

    const rarityData = ITEM_RARITY[this.rarity] || ITEM_RARITY.NORMAL;
    if (!ITEM_RARITY[this.rarity]) {
      console.warn(`Invalid rarity '${this.rarity}' for item tooltip, using NORMAL rarity`);
    }

    return html`
      <div class="item-tooltip">
        <div class="item-name" style="color: ${rarityData.color};">
          ${isEquipped ? '(Equipped) ' : ''}${this.getDisplayName()}
        </div>
        <div class="item-level">Level ${this.level}, Tier ${this.tier}</div>
        <div class="item-stats">
          ${Object.entries(this.stats)
    .map(([stat, value]) => {
      const decimals = STATS[stat].decimalPlaces || 0;
      const formattedValue = value.toFixed(decimals);
      return `<div>${formatStatName(stat)}: ${formattedValue}${isPercentStat(stat) ? '%' : ''}</div>`;
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
    const stat = availableStats[Math.floor(Math.random() * availableStats.length)];
    // Generate a base value for the stat (simple random, you may want to use your stat generation logic)
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
