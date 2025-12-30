import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS, RARITY_KEYS, SLOT_REQUIREMENTS, TWO_HANDED_TYPES } from './constants/items.js';
import { getDivisor, getStatDecimalPlaces, STATS } from './constants/stats/stats.js';
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { SET_ITEMS } from './constants/setItems.js';
import { UNIQUE_ITEMS } from './constants/uniqueItems.js';
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
  constructor({
    type,
    subtype = null,
    level,
    rarity,
    tier = 1,
    existingStats = null,
    metaData = {},
  }) {
    this.type = type;
    this.level = level;
    this.rarity = rarity.toUpperCase();
    this.tier = tier;
    this.metaData = metaData || {};
    this.metaData.baseStats = this.metaData.baseStats || {};
    this.subtype = subtype || type;
    this.stats = existingStats || this.generateStats();
    this.id = crypto.randomUUID();

    // handle legacy items
    if (!Object.keys(this.metaData.baseStats).length) {
      // !That rerolls the actual values
      this.setBaseStatValues();
    }
    //cleanup
    if (this.metaData.statRolls) {
      delete this.metaData.statRolls;
    }
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
    this.metaData.baseStats[stat] = flatScaled;
    return flatScaled * statConfig.scaling(level, this.tier);
  }

  getRarityMultiplier() {
    return ITEM_RARITY[this.rarity].statMultiplier;
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
      statDefinition = UNIQUE_ITEMS[uniqueId]?.stats?.[stat];
    }

    // handle set piece special ranges
    const setId = this.metaData?.setId;
    const pieceId = this.metaData?.setPieceId;
    if (setId && pieceId) {
      const set = SET_ITEMS[setId];
      const piece = set?.items?.find((i) => i.id === pieceId);
      statDefinition = piece?.stats?.[stat];
    }

    if (statDefinition) {
      if (statDefinition.minMultiplier !== undefined) {
        min *= statDefinition.minMultiplier;
      }

      if (statDefinition.maxMultiplier !== undefined) {
        max *= statDefinition.maxMultiplier;
      }
    }

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

    return { min, max };
  }

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

    itemStatPool.mandatory.forEach((stat) => {
      if (disabledStats.has(stat)) return;
      stats[stat] = this.scaleStat({ stat });
    });

    let currentStatCount = Object.keys(stats).length;

    while (currentStatCount < totalStatsNeeded) {
      const stat = this.selectRandomStat(this.type, this.subtypeData, stats);
      if (!stat) break;

      stats[stat] = this.scaleStat({ stat });
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
    if (this.rarity === RARITY_KEYS.UNIQUE) {
      tags.push(`<span class="item-tag item-tag-unique">${t('item.tag.unique')}</span>`);
    } else if (this.rarity === RARITY_KEYS.SET) {
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

  // Iterate all stats and populate the metaData.baseStats[stat] through the scaleStat method
  setBaseStatValues() {
    Object.keys(this.stats).forEach((stat) => {
      this.scaleStat({ stat });
    });
  }

  applyLevelToStats(newLevel) {
    Object.keys(this.stats).forEach((stat) => {
      const statConfig = AVAILABLE_STATS[stat];
      if (statConfig.tierScalingMaxPercent) return; // skip percentage based stats
      this.stats[stat] = this.metaData.baseStats[stat] * statConfig.scaling(newLevel, this.tier);
    });
    this.level = newLevel;
  }

  addRandomStat(excludeStat = null) {
    const stat = this.selectRandomStat(this.type, this.subtypeData, this.stats, excludeStat);
    if (!stat) return;

    this.stats[stat] = this.scaleStat({ stat });
    return stat;
  }

  selectRandomStat(type, subtypeData, currentStats, excludeStat = null) {
    const itemStatPool = ITEM_STAT_POOLS[type];
    if (!itemStatPool) return null;

    const disabledStats = new Set(subtypeData.disabledStats || []);
    const additionalStats = (subtypeData.additionalStats || []).filter((s) => !disabledStats.has(s));
    const preferredStats = new Set(subtypeData.preferredStats || []);

    // Base pool: possible + additional
    // Exclude mandatory (assumed added) and disabled
    let availableStats = [...new Set([...itemStatPool.possible, ...additionalStats])].filter(
      (stat) => !itemStatPool.mandatory.includes(stat) && !disabledStats.has(stat),
    );

    // Filter out existing stats and excluded stat
    availableStats = availableStats.filter((stat) => !currentStats[stat] && stat !== excludeStat);

    if (availableStats.length === 0) return null;

    const currentStatKeys = Object.keys(currentStats);
    const resistanceCount = currentStatKeys.filter((s) => RESISTANCE_STATS.includes(s)).length;
    const attributeCount = currentStatKeys.filter((s) => ATTRIBUTE_STATS.includes(s)).length;

    // Filter eligibility based on constraints (max 3 res, max 3 attr)
    const eligibleStats = availableStats.filter(
      (s) =>
        !(RESISTANCE_STATS.includes(s) && resistanceCount >= 3) &&
      !(ATTRIBUTE_STATS.includes(s) && attributeCount >= 3),
    );

    if (eligibleStats.length === 0) return null;

    const weightedStats = eligibleStats.flatMap((stat) => {
      const weight = preferredStats.has(stat) ? 3 : 1;
      return Array(weight).fill(stat);
    });

    return weightedStats[Math.floor(Math.random() * weightedStats.length)];
  }
}
