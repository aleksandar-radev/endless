import {
  ITEM_ICONS,
  ITEM_RARITY,
  ITEM_STAT_POOLS,
  SLOT_REQUIREMENTS,
  TWO_HANDED_TYPES,
} from './constants/items.js';
import { STATS, getItemTierBonus } from './constants/stats/stats.js';
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { UNIQUE_PERCENT_CAP_MULTIPLIER } from './constants/uniqueSets.js';
import { options, ascension } from './globals.js';
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

const HANDED_ITEM_TYPES = new Set([
  ...SLOT_REQUIREMENTS.weapon,
  ...SLOT_REQUIREMENTS.offhand,
]);

export default class Item {
  constructor(type, level, rarity, tier = 1, existingStats = null, metaData = {}) {
    this.type = type;
    this.level = level;
    this.rarity = rarity.toUpperCase();
    this.tier = tier;
    // Only generate new stats if no existing stats provided
    this.metaData = metaData || {};
    this.nameKey = this.metaData.nameKey || null;
    this.descriptionKey = this.metaData.descriptionKey || null;
    this.uniqueId = this.metaData.uniqueId || null;
    this.setId = this.metaData.setId || null;
    this.setNameKey = this.metaData.setNameKey || null;
    this.stats = existingStats || this.generateStats();
    this.id = crypto.randomUUID();
  }

  isTwoHanded() {
    return TWO_HANDED_TYPES.includes(this.type);
  }

  getHandedLabel() {
    if (!HANDED_ITEM_TYPES.has(this.type)) return null;
    return this.isTwoHanded() ? t('item.twoHanded') : t('item.oneHanded');
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
    const handedMultiplier = this.isTwoHanded() ? 2 : 1;
    let val = baseValue * tierBonus * multiplier * scale * handedMultiplier;

    if (stat === 'attackSpeedPercent') {
      val *= 100;
    }

    val = Number(val.toFixed(decimals));

    const limitConfig = STATS[stat].item?.limit;
    let baseLimit = Infinity;
    if (typeof limitConfig === 'number') {
      baseLimit = limitConfig;
    } else if (limitConfig && typeof limitConfig === 'object') {
      baseLimit = limitConfig[this.type] ?? limitConfig.default ?? Infinity;
    }
    if (stat === 'attackSpeedPercent') {
      baseLimit *= 100;
    }
    if (Number.isFinite(baseLimit)) {
      baseLimit *= handedMultiplier;
    }
    const ascBonuses = ascension?.getBonuses?.() || {};
    const percentCapMultiplier = 1 + (ascBonuses.itemPercentCapPercent || 0);
    const uniquePercentCapMultiplier = this.metaData?.unique ? UNIQUE_PERCENT_CAP_MULTIPLIER : 1;
    const percentCap =
      this.tier * 100 * percentCapMultiplier * handedMultiplier * uniquePercentCapMultiplier;
    const limit = stat.toLowerCase().includes('percent')
      ? Math.min(baseLimit, percentCap)
      : baseLimit;
    val = Math.min(val, limit);

    this.metaData = this.metaData || {};
    if (!this.metaData.statRolls) {
      this.metaData.statRolls = {};
    }
    this.metaData.statRolls[stat] = {
      ...(this.metaData.statRolls[stat] || {}),
      baseValue,
    };

    return val;
  }

  /**
   * Calculate the min and max possible value for a given stat on this item.
   * @param {string} stat
   * @returns {{min: number, max: number}}
   */
  getStatMinMax(stat) {
    const decimals = STATS[stat]?.decimalPlaces || 0;
    const storedRoll = this.metaData?.statRolls?.[stat];
    if (storedRoll && typeof storedRoll.min === 'number' && typeof storedRoll.max === 'number') {
      return {
        min: Number(storedRoll.min.toFixed(decimals)),
        max: Number(storedRoll.max.toFixed(decimals)),
      };
    }
    const statConfig = AVAILABLE_STATS[stat];
    if (!statConfig) return { min: 0, max: 0 };
    const tierBonus = this.getTierBonus(stat);
    const multiplier = this.getMultiplier();
    const scale = this.getLevelScale(stat, this.level);
    const handedMultiplier = this.isTwoHanded() ? 2 : 1;
    const decimalsFromConfig = STATS[stat]?.decimalPlaces || 0;
    const limitConfig = STATS[stat].item?.limit;
    let baseLimit = Infinity;
    if (typeof limitConfig === 'number') {
      baseLimit = limitConfig;
    } else if (limitConfig && typeof limitConfig === 'object') {
      baseLimit = limitConfig[this.type] ?? limitConfig.default ?? Infinity;
    }
    if (stat === 'attackSpeedPercent') {
      baseLimit *= 100;
    }
    if (Number.isFinite(baseLimit)) {
      baseLimit *= handedMultiplier;
    }
    const ascBonuses = ascension?.getBonuses?.() || {};
    const percentCapMultiplier = 1 + (ascBonuses.itemPercentCapPercent || 0);
    const uniquePercentCapMultiplier = this.metaData?.unique ? UNIQUE_PERCENT_CAP_MULTIPLIER : 1;
    const percentCap =
      this.tier * 100 * percentCapMultiplier * handedMultiplier * uniquePercentCapMultiplier;
    const limit = stat.toLowerCase().includes('percent')
      ? Math.min(baseLimit, percentCap)
      : baseLimit;
    // Min value
    let minVal = statConfig.min * tierBonus * multiplier * scale * handedMultiplier;
    let maxVal = statConfig.max * tierBonus * multiplier * scale * handedMultiplier;
    if (stat === 'attackSpeedPercent') {
      minVal *= 100;
      maxVal *= 100;
    }
    minVal = Number(minVal.toFixed(decimalsFromConfig));
    maxVal = Number(maxVal.toFixed(decimalsFromConfig));
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
    if (this.metaData?.customName) return this.metaData.customName;
    if (this.nameKey) return t(this.nameKey);
    const rarityName = ITEM_RARITY[this.rarity]?.name || this.rarity;
    return `${rarityName} ${this.type}`;
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

    const handedLabel = this.getHandedLabel();
    const levelDetails = `${t('item.level')}: ${formatNumber(this.level)}, ${t('item.tier')}: ${formatNumber(this.tier)}${handedLabel ? `, ${handedLabel}` : ''}`;

    const tags = [];
    if (this.rarity === 'UNIQUE') {
      tags.push(`<span class="item-tag item-tag-unique">${t('item.tag.unique')}</span>`);
    } else if (this.rarity === 'SET') {
      tags.push(`<span class="item-tag item-tag-set">${t('item.tag.set')}</span>`);
    }

    const descriptionLine = this.descriptionKey
      ? `<div class="item-description">${t(this.descriptionKey)}</div>`
      : '';

    let setSection = '';
    if (this.setId) {
      const piecesEquipped = this.metaData?.setPiecesEquipped || 0;
      const totalPieces = this.metaData?.setTotalPieces || 0;
      const setName = this.setNameKey ? t(this.setNameKey) : '';
      const bonuses = Array.isArray(this.metaData?.setBonuses)
        ? [...this.metaData.setBonuses].sort((a, b) => (a.pieces || 0) - (b.pieces || 0))
        : [];
      const bonusHtml = bonuses
        .map((bonus) => {
          const activeClass = bonus.active ? ' active' : '';
          const bonusName = bonus.nameKey
            ? t(bonus.nameKey)
            : t('item.setBonusPieces', { pieces: bonus.pieces });
          const indicator = bonus.active
            ? '<span class="set-bonus-indicator active">★</span>'
            : '<span class="set-bonus-indicator">☆</span>';
          const statsHtml = Object.entries(bonus.stats || {})
            .map(([stat, value]) => {
              const decimals = STATS[stat]?.decimalPlaces || 0;
              const formattedValue = formatNumber(Number(value).toFixed(decimals));
              const percentSuffix = isPercentStat(stat) ? '%' : '';
              return `<div class="set-bonus-stat">${formatStatName(stat)}: ${formattedValue}${percentSuffix}</div>`;
            })
            .join('');
          return `<div class="set-bonus${activeClass}"><div class="set-bonus-name">${indicator}<span>${bonusName}</span></div>${statsHtml}</div>`;
        })
        .join('');
      setSection = `
        <div class="item-set-section">
          <div class="item-set-name">${setName} (${piecesEquipped}/${totalPieces})</div>
          ${bonusHtml}
        </div>
      `;
    }

    return html`
      <div class="item-tooltip">
        <div class="item-name" style="color: ${ITEM_RARITY[this.rarity].color};">
          ${isEquipped ? '(Equipped) ' : ''}${this.getDisplayName()}
        </div>
        ${tags.length ? `<div class="item-tags">${tags.join('')}</div>` : ''}
        <div class="item-level">${levelDetails}</div>
        ${descriptionLine}
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
          const minRaw = statMinMax[stat].min;
          const maxRaw = statMinMax[stat].max;
          if (options?.showRollPercentiles) {
            let pct = 100;
            if (maxRaw > minRaw) {
              pct = Math.max(0, Math.min(1, (value - minRaw) / (maxRaw - minRaw))) * 100;
            }
            const pctStr = `${Math.round(pct)}%`;
            adv = `<span class="item-ref-range" style="float:right; color:#aaa; text-align:right; min-width:60px;">${pctStr}</span>`;
          } else {
            const min = formatNumber(minRaw.toFixed(decimals));
            const max = formatNumber(maxRaw.toFixed(decimals));
            adv = `<span class="item-ref-range" style="float:right; color:#aaa; text-align:right; min-width:60px;">${min} - ${max}</span>`;
          }
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
        ${setSection}
      </div>
    `;
  }

  /**
   * Reverse-engineer the base (unscaled) stat values for this item.
   * @returns {Object} base stat values keyed by stat name
   */
  getBaseStatValues() {
    if (this.metaData) {
      if (this.metaData.statRolls && Object.keys(this.metaData.statRolls).length > 0) {
        const entries = Object.entries(this.metaData.statRolls).filter(
          ([, data]) => data && typeof data.baseValue === 'number',
        );
        if (entries.length) {
          return Object.fromEntries(entries.map(([stat, data]) => [stat, data.baseValue]));
        }
      }
      const legacyEntries = Object.entries(this.metaData).filter(
        ([key, data]) => key !== 'statRolls' && data && typeof data.baseValue === 'number',
      );
      if (legacyEntries.length) {
        return Object.fromEntries(legacyEntries.map(([stat, data]) => [stat, data.baseValue]));
      }
    }
    const baseValues = {};
    const multiplier = this.getMultiplier();
    for (const stat of Object.keys(this.stats)) {
      const scaling = this.getLevelScale(stat, this.level);
      const tierBonus = this.getTierBonus(stat);
      const value = this.stats[stat];
      const handedMultiplier = this.isTwoHanded() ? 2 : 1;
      let baseValue = value / (multiplier * scaling * tierBonus * handedMultiplier);
      if (stat === 'attackSpeedPercent') {
        baseValue /= 100;
      }
      baseValues[stat] = baseValue;
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
    if (Array.isArray(this.metaData?.setBonuses)) {
      const bonuses = this.metaData.setBonuses.map((bonus) => {
        if (!bonus || !bonus.baseValues) return bonus;
        const updatedStats = {};
        for (const [stat, baseValue] of Object.entries(bonus.baseValues)) {
          const scale = this.getLevelScale(stat, newLevel);
          const tierBonus = this.getTierBonus(stat);
          updatedStats[stat] = this.calculateStatValue({
            baseValue,
            tierBonus,
            multiplier,
            scale,
            stat,
          });
        }
        return { ...bonus, stats: updatedStats };
      });
      this.metaData.setBonuses = bonuses;
    }
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
    if (!this.metaData.statRolls) this.metaData.statRolls = {};
    this.metaData.statRolls[stat] = {
      ...(this.metaData.statRolls[stat] || {}),
      baseValue,
    };
    return stat;
  }
}
