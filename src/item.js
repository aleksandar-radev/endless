import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS, SLOT_REQUIREMENTS, TWO_HANDED_TYPES } from './constants/items.js';
import { getDivisor, getStatDecimalPlaces, STATS } from './constants/stats/stats.js';
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { UNIQUE_ITEMS, ITEM_SETS } from './constants/uniqueSets.js';
import { options, ascension } from './globals.js';
import { formatStatName, formatNumber } from './ui/ui.js';
import { t } from './i18n.js';
import { getSubtypeConfig } from './constants/itemSubtypes.js';
import { ELEMENTS } from './constants/common.js';

const BASE = import.meta.env.VITE_BASE_PATH;

// Dynamically generate AVAILABLE_STATS from STATS
export const AVAILABLE_STATS = Object.fromEntries(
  Object.entries(STATS)
    .filter(([_, config]) => config.item)
    .map(([stat, config]) => [stat, config.item]),
);

// Precompute lookup tables so we can recover stat bounds for legacy unique/set items
// that may lack stored roll metadata.
const UNIQUE_ITEM_STATS = new Map(
  UNIQUE_ITEMS.map((item) => [item.id, new Map((item.stats || []).map((entry) => [entry.stat, entry]))]),
);

const ITEM_SET_LOOKUP = new Map(
  ITEM_SETS.map((set) => [
    set.id,
    new Map(
      (set.items || []).map((piece) => [piece.id, new Map((piece.stats || []).map((entry) => [entry.stat, entry]))]),
    ),
  ]),
);

const RESISTANCE_STATS = [
  ...Object.keys(ELEMENTS).map((element) => `${element}Resistance`),
  ...Object.keys(ELEMENTS).map((element) => `${element}ResistancePercent`),
  'allResistance',
  'allResistancePercent',
];

const ATTRIBUTE_STATS = [
  ...Object.keys(ATTRIBUTES),
  ...Object.keys(ATTRIBUTES).map((a) => `${a}Percent`),
  'allAttributes',
  'allAttributesPercent',
];

// Group ordering for tooltip display
const STAT_GROUPS = [
  { name: 'offense', order: Object.keys(OFFENSE_STATS) },
  { name: 'defense', order: Object.keys(DEFENSE_STATS).filter((s) => !RESISTANCE_STATS.includes(s)) },
  { name: 'resistance', order: RESISTANCE_STATS },
  { name: 'attribute', order: ATTRIBUTE_STATS },
  { name: 'misc', order: Object.keys(MISC_STATS).filter((s) => !ATTRIBUTE_STATS.includes(s)) },
];

const HANDED_ITEM_TYPES = new Set([...SLOT_REQUIREMENTS.weapon, ...SLOT_REQUIREMENTS.offhand]);

export default class Item {
  constructor(type, level, rarity, tier = 1, existingStats = null, metaData = {}) {
    this.type = type;
    this.level = level;
    this.rarity = rarity.toUpperCase();
    this.tier = tier;
    this.metaData = metaData || {};
    this.subtype = this.metaData.subtype || this.type;
    this.stats = existingStats || this.generateStats();
    this.id = crypto.randomUUID();
  }

  get subtypeData() {
    return this.subtype ? getSubtypeConfig(this.type, this.subtype) : null;
  }

  get nameKey() {
    return this.metaData.nameKey || null;
  }

  get descriptionKey() {
    return this.metaData.descriptionKey || null;
  }

  get uniqueId() {
    return this.metaData.uniqueId || null;
  }

  get setId() {
    return this.metaData.setId || null;
  }

  get setNameKey() {
    return this.metaData.setNameKey || null;
  }

  isTwoHanded() {
    // Check subtype override first
    if (this.subtypeData?.twoHanded !== undefined) {
      return this.subtypeData.twoHanded;
    }
    return TWO_HANDED_TYPES.includes(this.type);
  }

  getHandedLabel() {
    if (!HANDED_ITEM_TYPES.has(this.type)) return null;
    return this.isTwoHanded() ? t('item.twoHanded') : t('item.oneHanded');
  }

  scaleStat({ stat, level = this.level }) {
    const statConfig = AVAILABLE_STATS[stat];

    const { min, max } = this.getStatRange(stat);

      if (statConfig.tierScalingMaxPercent) {
        const percentStatScaled = (Math.random() * (max * this.getRarityMultiplier() - 1) + 1);
        return percentStatScaled;
      }

    const flatScaled =  Math.random() * (max - min) + min;
    return flatScaled * statConfig.scaling(level, this.tier);
  }

  getRarityMultiplier() {
    return ITEM_RARITY[this.rarity].statMultiplier;
  }

  calculateStatValue({
    baseValue, multiplier, scale, stat,
  }) {
    const decimals = getStatDecimalPlaces(stat);
    const handedMultiplier = this.isTwoHanded() ? 2 : 1;
    let val = baseValue * multiplier * scale * handedMultiplier;

    val = Number(val.toFixed(decimals));

    const statConfig = STATS[stat];
    const limitConfig = statConfig.item?.limit;
    const typeOverrides = statConfig.item?.overrides?.[this.type];

    // Get per-stat cap (new system)
    let baseCap = statConfig.item?.cap ?? Infinity;

    // Check for per-type cap override
    if (typeOverrides?.cap !== undefined) {
      baseCap = typeOverrides.cap;
    }

    // Apply subtype multiplier to cap if applicable
    if (this.subtypeData?.statMultipliers?.[stat]) {
      const multiplier = this.subtypeData.statMultipliers[stat];
      const capMultiplier = multiplier.min || 1; // Use min multiplier for cap
      baseCap *= capMultiplier;
    }

    // For backward compatibility, still check limit config
    let baseLimit = Infinity;
    if (typeOverrides?.limit !== undefined) {
      baseLimit = typeOverrides.limit;
    } else if (typeof limitConfig === 'number') {
      baseLimit = limitConfig;
    } else if (limitConfig && typeof limitConfig === 'object') {
      baseLimit = limitConfig[this.type] ?? limitConfig.default ?? Infinity;
    }

    if (Number.isFinite(baseLimit)) {
      baseLimit *= handedMultiplier;
    }
    if (Number.isFinite(baseCap)) {
      baseCap *= handedMultiplier;
    }

    // Use per-stat cap for percent stats, otherwise use old system
    if (stat.toLowerCase().includes('percent') || stat.toLowerCase().includes('chance')) {
      // Use per-stat cap (no ascension multiplier anymore)
      val = Math.min(val, Math.min(baseLimit, baseCap));
    } else {
      // Flat stats - use limit only
      val = Math.min(val, baseLimit);
    }

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
   * Get the stat range for this item type, considering overrides.
   * @param {string} stat
   * @returns {{min: number, max: number}}
   */
  getStatRange(stat) {
    const statConfig = AVAILABLE_STATS[stat];
    if (!statConfig) return null;

    const typeOverrides = statConfig.overrides?.[this.type];

    let min = (typeOverrides?.min ?? statConfig.min) || 1;
    let max = (typeOverrides?.max ?? statConfig.max) || statConfig.tierScalingMaxPercent[this.tier];

    let statDefinition;
    // handle unique special ranges
      const uniqueId = this.metaData?.uniqueId;
      if (uniqueId) {
        statDefinition = UNIQUE_ITEM_STATS.get(uniqueId)?.get(stat);
      }

      // handle set piece special ranges
      const setId = this.metaData?.setId;
      const pieceId = this.metaData?.setPieceId;
      if (setId || pieceId) {
        const pieceStats = ITEM_SET_LOOKUP.get(setId);
        statDefinition = pieceStats.get(pieceId)?.get(stat);
      };

      if (statDefinition) {
        min = statDefinition.min;
        max = statDefinition.max;
      };

    // Apply subtype multipliers if present
    if (this.subtypeData?.statMultipliers?.[stat]) {
      const multiplier = this.subtypeData.statMultipliers[stat];
      min = min * (multiplier.min || 1);
      max = max * (multiplier.max || 1);
    }

    // handles 2h weapons
    min *= this.subtypeData?.allStatMultiplier || 1;
    max *= this.subtypeData?.allStatMultiplier || 1;

    // handle percentage increase from ascension
    const ascBonuses = ascension?.getBonuses?.() || {};
    const percentCapMultiplier = 1 + (ascBonuses.itemPercentCapPercent || 0);
    max *= percentCapMultiplier;

    // handle unique item cap increase
    const uniquePercentCapMultiplier = this.metaData?.unique ? UNIQUE_PERCENT_CAP_MULTIPLIER : 1;
    max *= uniquePercentCapMultiplier;

    return { min, max };
  }

  /**
   * Get min/max for all stats on this item.
   * @returns {Object} { stat: {min, max}, ... }
   */
  getAllStatsRanges() {
    const result = {};
    for (const stat of Object.keys(this.stats)) {
      result[stat] = this.getStatRange(stat);
    }
    return result;
  }

  generateStats() {
    const stats = {};
    const itemStatPool = ITEM_STAT_POOLS[this.type];
    const totalStatsNeeded = ITEM_RARITY[this.rarity].totalStats;
    const disabledStats = new Set(this.subtypeData.disabledStats || []);
    const additionalStats = (this.subtypeData.additionalStats || []).filter((s) => !disabledStats.has(s));
    const preferredStats = new Set(this.subtypeData.preferredStats || []);

    itemStatPool.mandatory.forEach((stat) => {
      if (disabledStats.has(stat)) return;
      stats[stat] = this.scaleStat({ stat });
    });

    // use a Set to avoid duplicates
    let availableStats =[...new Set([...itemStatPool.possible, ...additionalStats])].filter(
      (stat) => !itemStatPool.mandatory.includes(stat) && !disabledStats.has(stat),
    );

    let currentStatCount = Object.keys(stats).length;
    let resistanceCount = Object.keys(stats).filter((s) => RESISTANCE_STATS.includes(s)).length;
    let attributeCount = Object.keys(stats).filter((s) => ATTRIBUTE_STATS.includes(s)).length;

    while (currentStatCount < totalStatsNeeded && availableStats.length > 0) {
      // Filter eligibility based on constraints (max 3 res, max 3 attr)
      const eligibleStats = availableStats.filter(
        (s) =>
          !(RESISTANCE_STATS.includes(s) && resistanceCount >= 3) &&
          !(ATTRIBUTE_STATS.includes(s) && attributeCount >= 3),
      );

      if (eligibleStats.length === 0) break;

      const weightedStats = eligibleStats.flatMap((stat) => {
        const weight = preferredStats.has(stat) ? 3 : 1;
        return Array(weight).fill(stat);
      });

      const stat = weightedStats[Math.floor(Math.random() * weightedStats.length)];

      // Remove chosen stat from available pool so it's not picked again
      availableStats = availableStats.filter((s) => s !== stat);

      stats[stat] = this.scaleStat({ stat });

      if (RESISTANCE_STATS.includes(stat)) resistanceCount++;
      if (ATTRIBUTE_STATS.includes(stat)) attributeCount++;

      currentStatCount++;
    }

    return stats;
  }

  getIcon() {
    if (this.subtypeData?.icon) {
      return this.subtypeData.icon;
    }
    return ITEM_ICONS[this.type] || `<img src="${BASE}/icons/help.svg" class="icon" alt="?"/>`;
  }

  getDisplayName() {
    if (this.metaData?.customName) return this.metaData.customName;
    if (this.nameKey) return t(this.nameKey);
    const rarityTranslationKey = `rarity.${String(this.rarity).toLowerCase()}`;
    const rarityName =
      t(rarityTranslationKey) !== rarityTranslationKey
        ? t(rarityTranslationKey)
        : ITEM_RARITY[this.rarity]?.name || this.rarity;

    const typeName = t(this.type) !== this.type ? t(this.type) : this.type;

    // Add subtype name if present, but ignore if it's the same as the base type to avoid "Sword Sword"
    const subtypeName = this.subtypeData?.nameKey && this.subtype !== this.type ? t(this.subtypeData.nameKey) : null;

    if (subtypeName) {
      return `${rarityName} ${subtypeName} ${typeName}`;
    }

    return `${rarityName} ${typeName}`;
  }

  getTooltipHTML(isEquipped = false) {
    const html = String.raw;

    const isPercentStat = (stat) => {
      return getDivisor(stat) !== 1;
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
      statMinMax = this.getAllStatsRanges();
    }

    const handedLabel = this.getHandedLabel();
    const levelDetails = `${t('item.level')}: ${formatNumber(this.level)}, ${t('item.tier')}: ${formatNumber(this.tier)}${handedLabel ? `, ${handedLabel}` : ''}`;

    const tags = [];
    if (this.rarity === 'UNIQUE') {
      tags.push(`<span class="item-tag item-tag-unique">${t('item.tag.unique')}</span>`);
    } else if (this.rarity === 'SET') {
      tags.push(`<span class="item-tag item-tag-set">${t('item.tag.set')}</span>`);
    }

    const descriptionLine = this.descriptionKey ? `<div class="item-description">${t(this.descriptionKey)}</div>` : '';

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
          const bonusName = bonus.nameKey ? t(bonus.nameKey) : t('item.setBonusPieces', { pieces: bonus.pieces });
          const indicator = bonus.active
            ? '<span class="set-bonus-indicator active">★</span>'
            : '<span class="set-bonus-indicator">☆</span>';
          const statsHtml = Object.entries(bonus.stats || {})
            .map(([stat, value]) => {
              const statDef = STATS[stat] || {};
              if (statDef.showValue === false) {
                return `<div class="set-bonus-stat">${formatStatName(stat)}</div>`;
              }
              const decimals = getStatDecimalPlaces(stat);
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
        const statDef = STATS[stat] || {};
        if (statDef.showValue === false) {
          return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <span>${formatStatName(stat)}</span>
                  </div>`;
        }
        const decimals = getStatDecimalPlaces(stat);
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
    const rarityMultiplier = this.getRarityMultiplier();
    for (const stat of Object.keys(this.stats)) {
      const scaling = this.scaleStat([{ stat }]);
      const value = this.stats[stat];
      const handedMultiplier = this.isTwoHanded() ? 2 : 1;
      let baseValue = value / (rarityMultiplier * scaling * handedMultiplier);
      baseValues[stat] = baseValue;
    }
    return baseValues;
  }

  /**
   * Apply a new level to the item, scaling all stats from the provided base values.
   * @param {number} newLevel
   */
  applyLevelToStats(newLevel) {
    const baseValues = this.getBaseStatValues();
    const rarityMultiplier = this.getRarityMultiplier();
    for (const stat of Object.keys(this.stats)) {
      const scale = this.scaleStat(stat, newLevel);
      this.stats[stat] = this.calculateStatValue({
        baseValue: baseValues[stat], rarityMultiplier, scale, stat,
      });
    }
    this.level = newLevel;
    if (Array.isArray(this.metaData?.setBonuses)) {
      const bonuses = this.metaData.setBonuses.map((bonus) => {
        if (!bonus || !bonus.baseValues) return bonus;
        const updatedStats = {};
        for (const [stat, baseValue] of Object.entries(bonus.baseValues)) {
          const scale = this.scaleStat(stat, newLevel);
          updatedStats[stat] = this.calculateStatValue({
            baseValue,
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
        !(RESISTANCE_STATS.includes(s) && resistanceCount >= 3) && !(ATTRIBUTE_STATS.includes(s) && attributeCount >= 3),
    );
    if (eligibleStats.length === 0) return;
    const stat = eligibleStats[Math.floor(Math.random() * eligibleStats.length)];
    const range = this.getStatRange(stat);
    if (!range) return;
    const baseValue = Math.random() * (range.max - range.min) + range.min;
    const rarityMultiplier = this.getRarityMultiplier();
    const scale = this.scaleStat(stat, this.level);
    this.stats[stat] = this.calculateStatValue({
      baseValue,
      rarityMultiplier,
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
