import { initializeSkillTreeStructure, updatePlayerLife, updateResources, updateTabIndicators } from './ui/ui.js';
import {
  game,
  inventory,
  training,
  skillTree,
  statistics,
  soulShop,
  dataManager,
  prestige,
  ascension,
  crystalShop,
  runes,
} from './globals.js';
import { calculateArmorReduction, calculateResistanceReduction, createCombatText, createDamageNumber } from './combat.js';
import { handleSavedData } from './functions.js';
import { updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { SOUL_UPGRADE_CONFIG } from './soulShop.js';
import { ELEMENTS } from './constants/common.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { STATS, getDivisor, getStatDecimalPlaces } from './constants/stats/stats.js';
import { AILMENTS } from './constants/ailments.js';

const ELEMENT_IDS = Object.keys(ELEMENTS);
const ATTRIBUTE_KEYS = Object.keys(ATTRIBUTES);
const ATTRIBUTE_SET = new Set(ATTRIBUTE_KEYS);
const RESISTANCE_KEYS = [
  'fireResistance',
  'coldResistance',
  'airResistance',
  'earthResistance',
  'lightningResistance',
  'waterResistance',
];
const RESISTANCE_SET = new Set(RESISTANCE_KEYS);
const STAT_KEYS = Object.keys(STATS);

export const STATS_ON_LEVEL_UP = 3;

const BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL = 500;

function getResourceExtraDamagePhysicalShare() {
  if (typeof training?.getResourceExtraDamagePhysicalShare === 'function') {
    const share = Number(training.getResourceExtraDamagePhysicalShare());
    if (Number.isFinite(share)) return Math.max(0, Math.min(1, share));
  }
  return 0.5;
}

function getElementalShareMap() {
  let shareMap = null;
  if (typeof training?.getElementalDistributionShares === 'function') {
    shareMap = training.getElementalDistributionShares();
  }
  if (!shareMap || typeof shareMap !== 'object') {
    const equalShare = ELEMENT_IDS.length > 0 ? 1 / ELEMENT_IDS.length : 0;
    shareMap = {};
    ELEMENT_IDS.forEach((elementId) => {
      shareMap[`${elementId}Damage`] = equalShare;
    });
  }
  return shareMap;
}

function distributeElementalAmount(total, shareMap = null) {
  const distribution = {};
  if (total <= 0) return distribution;
  const shares = shareMap && typeof shareMap === 'object' ? shareMap : getElementalShareMap();
  let distributed = 0;
  ELEMENT_IDS.forEach((elementId) => {
    const statKey = `${elementId}Damage`;
    const share = Number(shares[statKey]) || 0;
    if (share <= 0) return;
    const amount = total * share;
    distributed += amount;
    distribution[statKey] = amount;
  });
  const remainder = total - distributed;
  if (remainder > 1e-6 && ELEMENT_IDS.length > 0) {
    const fallbackKey = `${ELEMENT_IDS[0]}Damage`;
    distribution[fallbackKey] = (distribution[fallbackKey] || 0) + remainder;
  }
  return distribution;
}

function xpRequiredForLevels(startLevel, levels) {
  if (levels <= 0) return 0;

  const n = levels;
  const baseLevel = startLevel;
  const nMinus1 = n - 1;

  const linearSum = n * baseLevel + (nMinus1 * n) / 2;
  const squaresSum =
    n * baseLevel * baseLevel +
    baseLevel * n * nMinus1 +
    (nMinus1 * n * (2 * n - 1)) / 6;

  const total = 10 * n + 30 * linearSum + 2 * squaresSum;
  if (!Number.isFinite(total)) return Number.POSITIVE_INFINITY;
  return Math.round(total);
}

function levelsAffordable(startLevel, availableExp) {
  if (availableExp <= 0) return 0;
  const firstLevelCost = xpRequiredForLevels(startLevel, 1);
  if (availableExp < firstLevelCost) return 0;

  let low = 0;
  let high = 1;
  while (true) {
    const needed = xpRequiredForLevels(startLevel, high);
    if (!Number.isFinite(needed) || needed > availableExp) break;
    low = high;
    if (high >= Number.MAX_SAFE_INTEGER / 2) {
      high = Number.MAX_SAFE_INTEGER;
      break;
    }
    high *= 2;
  }

  let left = low;
  let right = high;
  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    const needed = xpRequiredForLevels(startLevel, mid);
    if (Number.isFinite(needed) && needed <= availableExp) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }

  return left;
}

export default class Hero {
  constructor(savedData = null) {
    this._recalcScheduled = false;
    this.ailments = {}; // Track hero ailments
    this.setBaseStats(savedData);
  }

  setBaseStats(savedData = null) {
    this.level = 1;
    this.gold = 0;
    this.crystals = 0;
    this.exp = 0;

    this.statPoints = 0;
    this.souls = 0;
    this.bossLevel = 1;

    this.primaryStats = {
      strength: 0,
      agility: 0,
      vitality: 0,
      wisdom: 0,
      endurance: 0,
      dexterity: 0,
      intelligence: 0,
      perseverance: 0,
    };

    // persistent stats, that are not being reset (usually from elixirs, achievements, etc.)
    this.permaStats = {};
    for (const [stat, config] of Object.entries(STATS)) {
      this.permaStats[stat] = 0;
    }

    // Gets recalculated every time something changes
    this.stats = {};
    for (const [stat, config] of Object.entries(STATS)) {
      this.stats[stat] = config.base;
    }
    // Holds breakdown of stat sources for tooltips
    this.statBreakdown = {};
    // Optionally, set currentLife and currentMana to their max values:
    this.stats.currentLife = this.stats.life;
    this.stats.currentMana = this.stats.mana;

    // Track flat-only damage values for later calculations
    this.baseDamages = { physical: 0, elemental: 0 };
    ELEMENT_IDS.forEach((id) => {
      this.baseDamages[id] = 0;
    });
    this.elementalDamageFromResources = 0;
    this.physicalDamageFromResources = 0;
    this.totalExtraDamageFromResources = 0;

    this.damageConversionDeltas = {};

    this.attributeElementalDamageFromIntelligence = 0;

    handleSavedData(savedData, this);
  }

  /**
   * Calculates the experience required to reach the next level.
   * @returns {number} EXP required for next level
   */
  getExpToNextLevel() {
    let xp = 10;
    xp += 30 * this.level;
    xp += 2 * this.level ** 2;
    return xp;
  }

  gainExp(amount) {
    this.exp += amount;
    let didLevelUp = false;
    document.dispatchEvent(new CustomEvent('xpGained', { detail: amount }));
    const totalExp = this.exp;
    const currentLevel = this.level;
    const levelsGained = levelsAffordable(currentLevel, totalExp);

    if (levelsGained > 0) {
      const xpConsumed = xpRequiredForLevels(currentLevel, levelsGained);
      const remainder = Math.max(0, totalExp - xpConsumed);
      this.levelUp(levelsGained);
      this.exp = remainder;
      didLevelUp = true;
    }

    if (didLevelUp) {
      this.recalculateFromAttributes();
      updatePlayerLife();
      createCombatText(`LEVEL UP! (${this.level})`);
      updateStatsAndAttributesUI();
      initializeSkillTreeStructure();
      dataManager.saveGame();
      updateRegionUI();
      updateTabIndicators();
      statistics.updateStatisticsUI();
    }
  }

  gainGold(amount) {
    statistics.increment('totalGoldEarned', null, amount);
    this.gold += amount;
    if (game.activeTab === 'training') {
      training.updateTrainingAffordability('gold-upgrades');
    }
    updateResources();
  }

  gainCrystals(amount) {
    const bonuses = runes?.getBonusEffects?.() || {};
    const ascBonuses = ascension?.getBonuses?.() || {};
    const runeBonus = bonuses.crystalGainPercent || 0;
    const ascensionBonus = ascBonuses.crystalGainPercent || 0;
    const finalAmount = Math.floor(amount * (1 + runeBonus + ascensionBonus));
    statistics.increment('totalCrystalsEarned', null, finalAmount);
    this.crystals += finalAmount;
    if (game.activeTab === 'crystalShop') {
      crystalShop.updateCrystalShopAffordability();
    }
    if (game.activeTab === 'training') {
      training.updateTrainingAffordability('crystal-upgrades');
    }
    updateResources();
  }

  gainSouls(amount) {
    statistics.increment('totalSoulsEarned', null, amount);
    this.souls += amount;
    if (game.activeTab === 'soulShop') {
      soulShop.updateSoulShopAffordability();
    }
    updateResources();
  }

  levelUp(levels) {
    this.exp = 0;
    this.level += levels;
    statistics.heroLevel = this.level;

    const ascBonuses = ascension?.getBonuses() || {};
    const attributesPerLevel = STATS_ON_LEVEL_UP + (ascBonuses.attributesPerLevel || 0);
    this.statPoints += attributesPerLevel * levels;

    const runeBonuses = runes?.getBonusEffects?.() || {};
    const skillPointsPerLevel =
      1 + (ascBonuses.skillPointsPerLevel || 0) + (runeBonuses.skillPointsPerLevel || 0);
    skillTree.addSkillPoints(levels * skillPointsPerLevel);

    // Dispatch a custom event for UI updates (e.g., prestige tab)
    document.dispatchEvent(new CustomEvent('heroLevelUp', { detail: { level: this.level } }));
  }

  /**
   * Allocates multiple stat points at once efficiently.
   * Only recalculates stats once at the end instead of after each allocation.
   * @param {string} stat - The stat to allocate points to
   * @param {number} count - Number of points to allocate
   * @returns {number} - Number of points actually allocated
   */
  allocateStatBulk(stat, count) {
    if (this.primaryStats[stat] === undefined) return 0;

    const pointsToAllocate = Math.min(count, this.statPoints);
    if (pointsToAllocate <= 0) return 0;

    this.primaryStats[stat] += pointsToAllocate;
    this.statPoints -= pointsToAllocate;

    // Only recalculate once at the end
    this.recalculateFromAttributes();

    if (stat === 'vitality' && !game.gameStarted) {
      this.stats.currentLife = this.stats.life;
    }

    dataManager.saveGame();
    updateTabIndicators();

    return pointsToAllocate;
  }

  queueRecalculateFromAttributes() {
    if (this._recalcScheduled) return;
    this._recalcScheduled = true;
    requestAnimationFrame(() => {
      this._recalcScheduled = false;
      this.recalculateFromAttributes();
    });
  }

  recalculateFromAttributes() {
    const skillTreeBonuses = skillTree.getAllSkillTreeBonuses();
    const weaponEffectiveness = skillTreeBonuses.weaponEffectiveness || 0;
    const shieldEffectiveness = skillTreeBonuses.shieldEffectiveness || 0;
    const jewelryEffectiveness = skillTreeBonuses.jewelryEffectiveness || 0;
    const itemLifeEffectivenessPercent = skillTreeBonuses.itemLifeEffectivenessPercent || 0;
    const itemArmorEffectivenessPercent = skillTreeBonuses.itemArmorEffectivenessPercent || 0;
    const equipmentBonuses = inventory.getEquipmentBonuses(
      weaponEffectiveness,
      itemLifeEffectivenessPercent,
      itemArmorEffectivenessPercent,
      shieldEffectiveness,
      jewelryEffectiveness,
    );
    const trainingBonuses = training.getTrainingBonuses();
    const soulBonuses = this.getSoulShopBonuses();
    const prestigeBonuses = prestige?.bonuses || {};
    this.statBreakdown = {};

    // 1) Build primary (flat) stats
    this.calculatePrimaryStats(skillTreeBonuses, equipmentBonuses, trainingBonuses);

    // 2) Get base flatValues & percentBonuses WITHOUT any attributeEffects
    const baseFlat = this.calculateFlatValues(
      /* attributeEffects */ {},
      skillTreeBonuses,
      equipmentBonuses,
      trainingBonuses,
    );
    const basePercent = this.calculatePercentBonuses(
      /* attributeEffects */ {},
      skillTreeBonuses,
      equipmentBonuses,
      trainingBonuses,
    );

    // 3) “Lock in” each attribute (STR, VIT, etc.) so that attributeEffects sees the %-increased value
    ATTRIBUTE_KEYS.forEach((attr) => {
      const pct = basePercent[`${attr}Percent`] || 0;
      let v = baseFlat[attr] * (1 + pct);
      const decimals = getStatDecimalPlaces(attr);
      this.stats[attr] = decimals > 0 ? Number(v.toFixed(decimals)) : Math.floor(v);
    });

    // 4) Now calculate all attributeEffects off those updated attribute stats
    const attributeEffects = this.calculateAttributeEffects(skillTreeBonuses);

    // 5) Normal flat+% pass
    const flatValues = this.calculateFlatValues(
      attributeEffects,
      skillTreeBonuses,
      equipmentBonuses,
      trainingBonuses,
    );
    if (runes) {
      runes.applyBonuses(flatValues);
    }
    const percentBonuses = this.calculatePercentBonuses(
      attributeEffects,
      skillTreeBonuses,
      equipmentBonuses,
      trainingBonuses,
    );

    ATTRIBUTE_KEYS.forEach((attr) => {
      const base = (STATS[attr]?.base || 0) + (STATS[attr]?.levelUpBonus || 0) * (this.level - 1);
      const allocated = this.primaryStats[attr] || 0;
      const prestigeFlat = (prestigeBonuses[attr] || 0) + (prestigeBonuses.allAttributes || 0);
      const prestigePercent =
        (prestigeBonuses[`${attr}Percent`] || 0) + (prestigeBonuses.allAttributesPercent || 0);
      const permaFlat =
        (this.permaStats[attr] || 0) + (this.permaStats.allAttributes || 0) - prestigeFlat;
      const permaPercent =
        (this.permaStats[`${attr}Percent`] || 0) +
        (this.permaStats.allAttributesPercent || 0) -
        prestigePercent;
      const itemsFlat = (equipmentBonuses[attr] || 0) + (equipmentBonuses.allAttributes || 0);
      const itemsPercent =
        (equipmentBonuses[`${attr}Percent`] || 0) / getDivisor(`${attr}Percent`) +
        (equipmentBonuses.allAttributesPercent || 0) / getDivisor('allAttributesPercent');
      const skillsFlat = (skillTreeBonuses[attr] || 0) + (skillTreeBonuses.allAttributes || 0);
      const skillsPercent =
        (skillTreeBonuses[`${attr}Percent`] || 0) / getDivisor(`${attr}Percent`) +
        (skillTreeBonuses.allAttributesPercent || 0) / getDivisor('allAttributesPercent');
      const trainingFlat = (trainingBonuses[attr] || 0) + (trainingBonuses.allAttributes || 0);
      const trainingPercent =
        (trainingBonuses[`${attr}Percent`] || 0) / getDivisor(`${attr}Percent`) +
        (trainingBonuses.allAttributesPercent || 0) / getDivisor('allAttributesPercent');
      const soulFlat = (soulBonuses[attr] || 0) + (soulBonuses.allAttributes || 0);
      const soulPercent =
        (soulBonuses[`${attr}Percent`] || 0) + (soulBonuses.allAttributesPercent || 0);

      this.statBreakdown[attr] = {
        base,
        allocated,
        perma: permaFlat,
        prestige: prestigeFlat,
        items: itemsFlat,
        skills: skillsFlat,
        training: trainingFlat,
        soul: soulFlat,
        percent: {
          perma: permaPercent,
          prestige: prestigePercent,
          items: itemsPercent,
          skills: skillsPercent,
          training: trainingPercent,
          soul: soulPercent,
        },
      };
    });

    this.applyFinalCalculations(flatValues, percentBonuses, soulBonuses);

    updatePlayerLife();
    updateStatsAndAttributesUI();
    dataManager.saveGame();
  }

  calculatePrimaryStats(skillTreeBonuses, equipmentBonuses, trainingBonuses) {
    const sharedFlatAttributes =
      (this.permaStats.allAttributes || 0) +
      (equipmentBonuses.allAttributes || 0) +
      (skillTreeBonuses.allAttributes || 0) +
      (trainingBonuses.allAttributes || 0);

    ATTRIBUTE_KEYS.forEach((attr) => {
      this.stats[attr] =
        (this.primaryStats[attr] || 0) +
        (this.permaStats[attr] || 0) +
        (equipmentBonuses[attr] || 0) +
        (skillTreeBonuses[attr] || 0) +
        (trainingBonuses[attr] || 0) +
        sharedFlatAttributes;
    });
  }

  calculateAttributeEffects(skillTreeBonuses = {}) {
    const effects = {};
    const ascensionBonuses = ascension?.getBonuses() || {};

    let intelligenceElementalDamage = 0;

    // Loop through all stats in STATS
    for (const stat of STAT_KEYS) {
      // Flat bonuses: look for {stat}Flat in attribute effects
      let flatBonus = 0;
      let percentBonus = 0;

      // Check each attribute for contributions to this stat
      for (const attr of ATTRIBUTE_KEYS) {
        const attrEffects = ATTRIBUTES[attr].effects;
        if (!attrEffects) continue;
        const attrMultiplier = 1 + (ascensionBonuses[`${attr}EffectPercent`] || 0);

        // Flat per-point bonus (e.g., damagePerPoint, lifePerPoint, etc.)
        const flatKey = stat + 'PerPoint';
        const hasFlatKey = flatKey in attrEffects;
        const extraPerPoint =
          attr === 'endurance' && stat === 'thornsDamage'
            ? skillTreeBonuses.enduranceThornsDamagePerPoint || 0
            : 0;
        if (hasFlatKey || extraPerPoint !== 0) {
          const basePerPoint = hasFlatKey ? attrEffects[flatKey] : 0;
          const perPoint = (basePerPoint + extraPerPoint) * attrMultiplier;
          const points = this.stats[attr] || 0;
          const amount = points * perPoint;
          flatBonus += amount;
          if (stat === 'elementalDamage' && attr === 'intelligence' && hasFlatKey) {
            intelligenceElementalDamage += amount;
          }
        }

        // Percent per N points bonus (e.g., damagePercentPer, lifePercentPer, etc.)
        const percentKey = stat + 'PercentPer';
        if (percentKey in attrEffects && attrEffects[percentKey].enabled) {
          const value = attrEffects[percentKey].value * attrMultiplier;
          percentBonus +=
            Math.floor((this.stats[attr] || 0) / attrEffects[percentKey].points) * value;
        }
      }

      // Assign to effects object
      if (flatBonus !== 0) effects[stat] = flatBonus;
      if (percentBonus !== 0) effects[stat + 'Percent'] = percentBonus;
    }

    const elementCount = ELEMENT_IDS.length || 1;
    const distributedIntelligenceElementalDamage = intelligenceElementalDamage * elementCount;
    this.attributeElementalDamageFromIntelligence = distributedIntelligenceElementalDamage;

    if (distributedIntelligenceElementalDamage > 0) {
      const shareMap = getElementalShareMap();
      const distribution = distributeElementalAmount(
        distributedIntelligenceElementalDamage,
        shareMap,
      );
      Object.entries(distribution).forEach(([statKey, amount]) => {
        effects[statKey] = (effects[statKey] || 0) + amount;
      });

      if (effects.elementalDamage !== undefined) {
        const remaining = effects.elementalDamage - intelligenceElementalDamage;
        if (remaining > 1e-6) {
          effects.elementalDamage = remaining;
        } else {
          delete effects.elementalDamage;
        }
      }
    }

    return effects;
  }

  calculateFlatValues(attributeEffects, skillTreeBonuses, equipmentBonuses, trainingBonuses) {
    const flatValues = {};
    const sharedFlatAttributes =
      (this.permaStats.allAttributes || 0) +
      (equipmentBonuses.allAttributes || 0) +
      (skillTreeBonuses.allAttributes || 0) +
      (trainingBonuses.allAttributes || 0);

    for (const stat of STAT_KEYS) {
      let value =
        (this.primaryStats[stat] ?? 0) +
        (this.permaStats[stat] ?? 0) +
        (STATS[stat].base ?? 0) +
        (attributeEffects[stat] ?? 0) +
        (STATS[stat].levelUpBonus ?? 0) * (this.level - 1) +
        (trainingBonuses[stat] ?? 0) +
        (equipmentBonuses[stat] ?? 0) +
        (skillTreeBonuses[stat] ?? 0);

      if (ATTRIBUTE_SET.has(stat)) {
        value += sharedFlatAttributes;
      }

      if (RESISTANCE_SET.has(stat)) {
        value += this.permaStats.allResistance || 0;
      }

      flatValues[stat] = value;
    }
    return flatValues;
  }

  calculatePercentBonuses(attributeEffects, skillTreeBonuses, equipmentBonuses, trainingBonuses) {
    const percentBonuses = {};
    const ascensionBonuses = ascension?.getBonuses() || {};
    const prestigeBonuses = prestige?.bonuses || {};
    const prestigeAllAttributesPercent = prestigeBonuses.allAttributesPercent || 0;
    const sharedPercentAttributesRaw =
      (this.primaryStats.allAttributesPercent ?? 0) +
      ((this.permaStats.allAttributesPercent || 0) - prestigeAllAttributesPercent) +
      (equipmentBonuses.allAttributesPercent || 0) +
      (skillTreeBonuses.allAttributesPercent || 0) +
      (trainingBonuses.allAttributesPercent || 0);
    const sharedPercentAttributes =
      sharedPercentAttributesRaw / getDivisor('allAttributesPercent') +
      prestigeAllAttributesPercent;
    for (const stat of STAT_KEYS) {
      if (stat.endsWith('Percent')) {
        const statName = stat.replace('Percent', '');
        const prestigePercent = prestigeBonuses[stat] || 0;
        const raw =
          (STATS[stat]?.base || 0) +
          (attributeEffects[stat] || 0) +
          (this.primaryStats[stat] ?? 0) +
          ((this.permaStats[stat] || 0) - prestigePercent) +
          (skillTreeBonuses[stat] || 0) +
          (equipmentBonuses[stat] || 0) +
          (trainingBonuses[stat] || 0);
        let value = raw / getDivisor(stat);
        if (ATTRIBUTE_SET.has(statName)) {
          value += sharedPercentAttributes;
        }
        value += prestigePercent;
        value += ascensionBonuses[stat] || 0;
        percentBonuses[stat] = value;
      }
    }
    return percentBonuses;
  }

  /**
   * Returns all soul shop bonuses as an object, mapping stat names to their total bonus.
   * Handles both percent and flat bonuses.
   * @returns {Object} soulShopBonuses
   */
  getSoulShopBonuses() {
    const bonuses = {};
    if (!soulShop || !soulShop.soulUpgrades) return bonuses;
    const { soulUpgrades } = soulShop;
    const config = SOUL_UPGRADE_CONFIG;
    for (const [upgradeKey, upgradeConfig] of Object.entries(config)) {
      if (
        upgradeConfig &&
        typeof upgradeConfig.bonus === 'number' &&
        typeof upgradeConfig.stat === 'string' &&
        soulUpgrades[upgradeKey]
      ) {
        bonuses[upgradeConfig.stat] =
          (bonuses[upgradeConfig.stat] || 0) + soulUpgrades[upgradeKey] * upgradeConfig.bonus;
      }
    }

    return bonuses;
  }

  applyFinalCalculations(flatValues, percentBonuses, soulBonuses) {
    // Apply percent bonuses to all stats that have them
    const ascensionBonuses = ascension?.getBonuses() || {};
    const prestigeBonuses = prestige?.bonuses || {};
    this.damageConversionDeltas = {};

    // Stormcaller: scale lightning damage bonuses at the stat level so the Stats UI reflects the effect.
    // This applies to the aggregated lightningDamage (flat) and lightningDamagePercent (fraction).
    const lightningBonusEffectiveness =
      (percentBonuses.lightningEffectivenessPercent || 0) +
      (soulBonuses.lightningEffectivenessPercent || 0);
    const lightningBonusEffectivenessMultiplier = Math.max(0, 1 + (lightningBonusEffectiveness || 0));
    if (Math.abs(lightningBonusEffectivenessMultiplier - 1) > 1e-9) {
      if (Number.isFinite(flatValues.lightningDamage)) {
        flatValues.lightningDamage *= lightningBonusEffectivenessMultiplier;
      }

      const pLightning = percentBonuses.lightningDamagePercent || 0;
      const sLightning = soulBonuses.lightningDamagePercent || 0;
      const pShared = (percentBonuses.elementalDamagePercent || 0) + (percentBonuses.totalDamagePercent || 0);
      const sShared = (soulBonuses.elementalDamagePercent || 0) + (soulBonuses.totalDamagePercent || 0);
      const sharedBase = pShared + sShared;

      percentBonuses.lightningDamagePercent =
        pLightning * lightningBonusEffectivenessMultiplier +
        (sLightning + sharedBase) * (lightningBonusEffectivenessMultiplier - 1);
    }

    for (const stat of STAT_KEYS) {
      if (stat.endsWith('Percent')) {
        let percentValue = percentBonuses[stat] || 0;
        percentValue += soulBonuses[stat] || 0;
        this.stats[stat] = percentValue;
        percentBonuses[stat] = percentValue;
      }
    }

    for (const stat of STAT_KEYS) {
      let value;
      if (!stat.endsWith('Percent')) {
        // Use Math.floor for integer stats, Number.toFixed for decimals
        if (stat === 'attackSpeed') {
          // Attack speed percent bonuses scale the pre-percent total (base 1.0 plus flat additions).
          const flatBase = flatValues.attackSpeed + (ascensionBonuses.attackSpeed || 0);
          const attackSpeedPercent = percentBonuses.attackSpeedPercent || 0;
          value = flatBase * (1 + attackSpeedPercent);
        } else {
          let percent = percentBonuses[stat + 'Percent'] || 0;
          if (RESISTANCE_SET.has(stat)) {
            percent += this.stats.allResistancePercent || 0;
          }

          if (
            (stat === 'armorPenetration' || stat === 'elementalPenetration') &&
            this.stats.flatPenetrationPercent
          ) {
            percent += this.stats.flatPenetrationPercent;
          }

          value = flatValues[stat] + (ascensionBonuses[stat] || 0);
          if (percent) value *= 1 + percent;
        }
        if (stat === 'mana') {
          value += (this.stats.manaPerLevel || 0) * (this.level - 1);
        }

        // Apply soul shop bonuses (flat only, percent handled in first loop)
        if (soulBonuses[stat]) {
          value += soulBonuses[stat];
        }
      } else {
        value = (percentBonuses[stat] || 0) * getDivisor(stat);
      }

      // Apply decimal places
      const decimals = getStatDecimalPlaces(stat);
      value = decimals > 0 ? Number(value.toFixed(decimals)) : Math.floor(value);

      // Apply caps
      let cap = STATS[stat]?.cap;
      if (stat === 'blockChance') {
        cap = (cap || 50) + ((ascensionBonuses.blockChanceCap || 0) | 0);
      }
      if (stat === 'critChance') {
        cap = (flatValues.critChanceCap || cap || 50) + (ascensionBonuses.critChanceCap || 0);
      }
      if (stat === 'attackSpeed') {
        if (this.stats.uncappedAttackSpeed) {
          cap = Infinity;
        } else {
          cap = (cap || 5) + (ascensionBonuses.attackSpeedCap || 0);
        }
      }

      if (cap !== undefined && Number.isFinite(cap)) {
        value = Math.min(value, cap);
      }

      if (stat === 'extraMaterialDropMax') value = Math.max(value, 1); // Always at least 1

      const divisor = getDivisor(stat);
      const prestigeBonus = prestigeBonuses[stat] || 0;
      if (divisor !== 1) {
        // Prestige bonuses are stored as fractions already (e.g. 0.05 for 5%),
        // so exclude them from divisor scaling and add them back after scaling.
        this.stats[stat] = prestigeBonus ? (value - prestigeBonus) / divisor + prestigeBonus : value / divisor;
      } else {
        this.stats[stat] = value;
      }
    }

    // Apply specific stat interactions
    // Bloodmage: convert mana pool into life pool. Mana bonuses apply to mana first, then convert.
    // Life% bonuses apply only to base life (not the converted mana).
    let convertedManaForBloodmage = 0;
    const conversionPercent = (this.stats.convertManaToLifePercent || 0);

    if (conversionPercent > 0) {
      const manaToConvert = this.stats.mana || 0;
      convertedManaForBloodmage = manaToConvert * conversionPercent;

      if (convertedManaForBloodmage > 0) {
        this.stats.life += convertedManaForBloodmage;
        this.stats.mana -= convertedManaForBloodmage;
        if (this.stats.mana < 0) this.stats.mana = 0;
      }
    } else if (this.stats.manaToLifeTransferPercent > 0) {
      const transfer = this.stats.mana * this.stats.manaToLifeTransferPercent;
      this.stats.life += transfer;
      this.stats.mana = Math.max(0, this.stats.mana - transfer);
    }

    if (this.stats.extraEvasionFromLifePercent > 0) {
      this.stats.evasion += this.stats.life * this.stats.extraEvasionFromLifePercent;
    }

    const baseElementResistances = {};
    ELEMENT_IDS.forEach((id) => {
      const key = `${id}Resistance`;
      baseElementResistances[key] = this.stats[key] || 0;
    });

    const initialAllRes = this.stats.allResistance || 0;
    const initialAllResPercent = this.stats.allResistancePercent || 0;
    const initialAllResBonus = initialAllRes * (1 + initialAllResPercent);

    ELEMENT_IDS.forEach((id) => {
      const key = `${id}Resistance`;
      this.stats[key] = Math.max((this.stats[key] || 0) + initialAllResBonus, 0);
    });

    const manaForRegenOfTotal = this.stats.mana + convertedManaForBloodmage;
    this.stats.manaRegen += this.stats.manaRegenOfTotalPercent * manaForRegenOfTotal;
    this.stats.lifeRegen += this.stats.lifeRegenOfTotalPercent * this.stats.life;

    if (conversionPercent > 0) {
      const manaRegenToConvert = this.stats.manaRegen || 0;
      const convertedRegen = manaRegenToConvert * conversionPercent;
      if (convertedRegen > 0) {
        this.stats.lifeRegen += convertedRegen;
        this.stats.manaRegen -= convertedRegen;
        if (this.stats.manaRegen < 0) this.stats.manaRegen = 0;
      }
    }

    let pendingDamageAdditions = {};
    if (runes && typeof runes.applyPreDamageConversions === 'function') {
      pendingDamageAdditions = runes.applyPreDamageConversions(this.stats) || {};
    }

    const computeResourceExtraDamage = (statsSnapshot, shareMap, physicalShare = 0.5) => {
      if (!statsSnapshot) return { physical: 0, elemental: 0, perElement: {} };

      const resourceCapPerLevel = Math.max(
        0,
        BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL +
          (ascensionBonuses.extraResourceDamageCapPerLevel || 0),
      );
      const maxResourceAmount = Math.max(0, this.level * resourceCapPerLevel);
      if (maxResourceAmount <= 0) return { physical: 0, elemental: 0, perElement: {} };

      const capResource = (value) => Math.min(Math.max(value || 0, 0), maxResourceAmount);

      const life = capResource(statsSnapshot.life);
      const armor = capResource(statsSnapshot.armor);
      const isBloodmage = (statsSnapshot.convertManaToLifePercent || 0) >= 1;
      const mana = capResource(isBloodmage ? statsSnapshot.life : statsSnapshot.mana);
      const lifeRegen = capResource(statsSnapshot.lifeRegen);
      const evasion = capResource(statsSnapshot.evasion);
      const attackRating = capResource(statsSnapshot.attackRating);
      const allResistancesValue = RESISTANCE_KEYS.reduce((sum, key) => sum + (statsSnapshot[key] || 0), 0);
      const allResistances = capResource(allResistancesValue);

      const totalExtra =
        (statsSnapshot.extraDamageFromLifePercent || 0) * life +
        (statsSnapshot.extraDamageFromArmorPercent || 0) * armor +
        (statsSnapshot.extraDamageFromManaPercent || 0) * mana +
        (statsSnapshot.extraDamageFromLifeRegenPercent || 0) * lifeRegen +
        (statsSnapshot.extraDamageFromEvasionPercent || 0) * evasion +
        (statsSnapshot.extraDamageFromAttackRatingPercent || 0) * attackRating +
        (statsSnapshot.extraDamageFromAllResistancesPercent || 0) * allResistances;

      if (!totalExtra) return { physical: 0, elemental: 0, perElement: {} };

      const clampedShare = Math.max(0, Math.min(1, Number(physicalShare) || 0));
      const physical = totalExtra * clampedShare;
      const totalElemental = totalExtra - physical;
      const perElement = distributeElementalAmount(totalElemental, shareMap);

      return { physical, elemental: totalElemental, perElement };
    };

    const baseFlatDamageBeforeResources = flatValues.damage;
    const baseFlatElementalBeforeResources = flatValues.elementalDamage;

    const elementalShareMap = getElementalShareMap();
    const resourceExtraPhysicalShare = getResourceExtraDamagePhysicalShare();
    const initialResourceExtraDamage = computeResourceExtraDamage(
      this.stats,
      elementalShareMap,
      resourceExtraPhysicalShare,
    );

    if (initialResourceExtraDamage.physical) {
      flatValues.damage += initialResourceExtraDamage.physical;
    }
    Object.entries(initialResourceExtraDamage.perElement).forEach(([statKey, amount]) => {
      if (!amount) return;
      flatValues[statKey] = (flatValues[statKey] || 0) + amount;
    });

    // Store flat-only values for later damage calculations
    this.baseDamages.physical = Math.floor(
      flatValues.damage +
        (ascensionBonuses.damage || 0) +
        (this.stats.damagePerLevel || 0) * this.level,
    );
    this.baseDamages.elemental = Math.floor(
      flatValues.elementalDamage + (ascensionBonuses.elementalDamage || 0),
    );
    ELEMENT_IDS.forEach((id) => {
      this.baseDamages[id] = Math.floor(
        (flatValues[`${id}Damage`] || 0) + (ascensionBonuses[`${id}Damage`] || 0),
      );
    });

    const flatThornsDamage = Math.max(
      0,
      (flatValues.thornsDamage || 0) + (ascensionBonuses.thornsDamage || 0),
    );
    const combinedThornsPercent =
      (this.stats.thornsDamagePercent || 0) +
      (this.stats.damagePercent || 0) +
      (this.stats.totalDamagePercent || 0);
    const thornsMultiplier = Math.max(0, 1 + combinedThornsPercent);
    let effectiveThorns = flatThornsDamage * thornsMultiplier;
    const thornsDecimals = getStatDecimalPlaces('thornsDamage');
    if (thornsDecimals > 0) {
      effectiveThorns = Number(effectiveThorns.toFixed(thornsDecimals));
    } else {
      effectiveThorns = Math.floor(effectiveThorns);
    }
    this.stats.thornsDamage = effectiveThorns;

    this.stats.damage = Math.floor(
      this.baseDamages.physical *
        (1 + this.stats.totalDamagePercent + this.stats.damagePercent),
    );

    // Special handling for elemental damages
    ELEMENT_IDS.forEach((id) => {
      const base = this.baseDamages[id] + this.baseDamages.elemental;
      this.stats[`${id}Damage`] = Math.floor(
        base *
          (1 +
            this.stats.elementalDamagePercent +
            this.stats[`${id}DamagePercent`] +
            this.stats.totalDamagePercent),
      );

      // reflect damage calculation
      const reflectKey = `reflect${id.charAt(0).toUpperCase()}${id.slice(1)}Damage`;
      if (flatValues[reflectKey] > 0) {
        this.stats[reflectKey] = Math.floor(
          (flatValues[reflectKey] + base) *
          (1 +
            this.stats.totalDamagePercent +
            this.stats[`${id}DamagePercent`] +
            this.stats.elementalDamagePercent),
        );
      }
    });

    const preConversionDamage = {
      damage: this.stats.damage,
    };
    ELEMENT_IDS.forEach((id) => {
      preConversionDamage[`${id}Damage`] = this.stats[`${id}Damage`];
    });

    Object.entries(pendingDamageAdditions).forEach(([stat, amount]) => {
      if (!amount) return;
      const baseValue = this.stats[stat] || 0;
      const next = baseValue + amount;
      this.stats[stat] = next > 0 ? next : 0;
    });

    if (runes && typeof runes.applyPostDamageConversions === 'function') {
      runes.applyPostDamageConversions(this.stats);
    }

    const finalResourceExtraDamage = computeResourceExtraDamage(
      this.stats,
      elementalShareMap,
      resourceExtraPhysicalShare,
    );
    const basePhysicalFlatWithoutResources =
      baseFlatDamageBeforeResources +
      (ascensionBonuses.damage || 0) +
      (this.stats.damagePerLevel || 0) * this.level;
    const baseElementalFlatWithoutResources =
      baseFlatElementalBeforeResources + (ascensionBonuses.elementalDamage || 0);

    this.baseDamages.physical = Math.floor(
      Math.max(0, basePhysicalFlatWithoutResources + finalResourceExtraDamage.physical),
    );
    this.baseDamages.elemental = Math.floor(Math.max(0, baseElementalFlatWithoutResources));
    this.elementalDamageFromResources = finalResourceExtraDamage.elemental;
    this.physicalDamageFromResources = finalResourceExtraDamage.physical;
    this.totalExtraDamageFromResources =
      finalResourceExtraDamage.physical + finalResourceExtraDamage.elemental;

    const deltaPhysicalFlat =
      finalResourceExtraDamage.physical - initialResourceExtraDamage.physical;

    if (Math.abs(deltaPhysicalFlat) > 1e-9) {
      const physicalMultiplier =
        1 + (this.stats.totalDamagePercent || 0) + (this.stats.damagePercent || 0);
      const deltaPhysicalFinal = deltaPhysicalFlat * physicalMultiplier;
      this.stats.damage = (this.stats.damage || 0) + deltaPhysicalFinal;
      preConversionDamage.damage = (preConversionDamage.damage || 0) + deltaPhysicalFinal;
    }

    ELEMENT_IDS.forEach((id) => {
      const statKey = `${id}Damage`;
      const initialFlat = initialResourceExtraDamage.perElement[statKey] || 0;
      const finalFlat = finalResourceExtraDamage.perElement[statKey] || 0;
      const deltaElementalFlat = finalFlat - initialFlat;
      if (Math.abs(deltaElementalFlat) <= 1e-9) return;
      const multiplier =
        1 +
        (this.stats.totalDamagePercent || 0) +
        (this.stats.elementalDamagePercent || 0) +
        (this.stats[`${id}DamagePercent`] || 0);
      const deltaFinal = deltaElementalFlat * multiplier;
      this.stats[statKey] = (this.stats[statKey] || 0) + deltaFinal;
      preConversionDamage[statKey] = (preConversionDamage[statKey] || 0) + deltaFinal;
    });

    const updatedAllRes = this.stats.allResistance || 0;
    const updatedAllResPercent = this.stats.allResistancePercent || 0;
    const updatedAllResBonus = updatedAllRes * (1 + updatedAllResPercent);

    if (Math.abs(updatedAllResBonus - initialAllResBonus) > 1e-9) {
      ELEMENT_IDS.forEach((id) => {
        const key = `${id}Resistance`;
        const originalFinal = (baseElementResistances[key] || 0) + initialAllResBonus;
        const currentFinal = this.stats[key] || 0;
        const delta = currentFinal - originalFinal;
        const adjustedBase = Math.max(0, (baseElementResistances[key] || 0) + delta);
        this.stats[key] = Math.max(0, adjustedBase + updatedAllResBonus);
      });
    }
    if (initialAllResBonus === 0 && updatedAllResBonus === 0) {
      // No shared resistance bonus applied; ensure any conversions on individual elements are clamped.
      ELEMENT_IDS.forEach((id) => {
        const key = `${id}Resistance`;
        this.stats[key] = Math.max(0, this.stats[key] || 0);
      });
    }

    this.stats.damage = Math.floor(Math.max(0, this.stats.damage || 0));
    ELEMENT_IDS.forEach((id) => {
      const key = `${id}Damage`;
      this.stats[key] = Math.floor(Math.max(0, this.stats[key] || 0));
    });

    const conversionDeltas = {};
    const physicalDelta = (this.stats.damage || 0) - (preConversionDamage.damage || 0);
    if (Math.abs(physicalDelta) > 1e-6) {
      conversionDeltas.physical = physicalDelta;
    }
    ELEMENT_IDS.forEach((id) => {
      const statKey = `${id}Damage`;
      const before = preConversionDamage[statKey] || 0;
      const after = this.stats[statKey] || 0;
      const delta = after - before;
      if (Math.abs(delta) > 1e-6) {
        conversionDeltas[id] = delta;
      }
    });
    this.damageConversionDeltas = conversionDeltas;
  }

  regenerate(ticksPerSecond = 10) {
    const normalizedTicks = ticksPerSecond > 0 ? ticksPerSecond : 1;
    const lifePerTick = this.stats.lifeRegen / normalizedTicks;

    // Calculate effective max life including overheal
    const maxLife = this.stats.life * (1 + (this.stats.overhealPercent || 0));

    this.stats.currentLife = Math.min(maxLife, this.stats.currentLife + lifePerTick);
    if (this.stats.currentLife < 0) this.stats.currentLife = 0;
    const manaPerTick = this.stats.manaRegen / normalizedTicks;
    game.restoreMana(manaPerTick, { log: false });
  }

  // calculated when hit is successful
  calculateTotalDamage(instantSkillBaseEffects = {}, options = {}) {
    const { includeRandom = true, canCrit = true } = options;
    const elements = ELEMENT_IDS;
    const lightningBonusEffectivenessMultiplier = 1 + (this.stats.lightningEffectivenessPercent || 0);
    const allowedDamageTypes = Array.isArray(instantSkillBaseEffects.allowedDamageTypes)
      ? instantSkillBaseEffects.allowedDamageTypes
      : null;
    const allowAllDamage = !allowedDamageTypes || allowedDamageTypes.length === 0;
    const includePhysical = allowAllDamage || allowedDamageTypes?.includes('physical');
    const allowedElements = allowAllDamage
      ? new Set(elements)
      : new Set(allowedDamageTypes.filter((type) => elements.includes(type)));

    // 1) Flat phase: build flat pools from stored flat-only values
    const flatPools = {
      physical:
        (includePhysical ? (this.baseDamages?.physical || 0) : 0) +
        (includePhysical ? (instantSkillBaseEffects.damage || 0) : 0),
    };
    elements.forEach((e) => {
      const key = `${e}Damage`;
      const baseFlat = allowedElements.has(e) ? (this.baseDamages?.[e] || 0) : 0;
      const skillFlat = allowedElements.has(e) ? (instantSkillBaseEffects[key] || 0) : 0;

      // Aggregated stats already include the effectiveness multiplier (so UI matches).
      // Apply it here only to instant-skill lightning bonus contributions.
      const scaledSkillFlat = e === 'lightning' ? skillFlat * lightningBonusEffectivenessMultiplier : skillFlat;
      flatPools[e] = baseFlat + scaledSkillFlat;
    });

    // flat elementalDamage applies to every elemental pool
    const baseElemental = this.baseDamages?.elemental || 0;
    const flatElementalDamage = instantSkillBaseEffects.elementalDamage || 0;
    if (baseElemental || flatElementalDamage) {
      elements.forEach((e) => {
        if (allowedElements.has(e)) {
          flatPools[e] += baseElemental + flatElementalDamage;
        }
      });
    }

    // 2) Percent phase: apply percent bonuses (physical + per-elemental + global elemental)
    const finalPools = {};
    const physicalPct = (instantSkillBaseEffects.damagePercent || 0) / getDivisor('damagePercent');
    let totalDamagePercent = (this.stats.totalDamagePercent || 0) + (this.stats.damagePercent || 0);

    if (game.fightMode === 'arena' && this.stats.arenaDamagePercent) {
      totalDamagePercent += this.stats.arenaDamagePercent;
    }

    finalPools.physical = includePhysical
      ? flatPools.physical *
        (1 +
          physicalPct +
          totalDamagePercent)
      : 0;

    // elemental global percent from both sources
    const elementalGlobalPct = (instantSkillBaseEffects.elementalDamagePercent || 0) / getDivisor('elementalDamagePercent');
    elements.forEach((e) => {
      const specificBonusPercent = instantSkillBaseEffects[`${e}DamagePercent`] || 0;
      const baseSpecificPct = specificBonusPercent / getDivisor(`${e}DamagePercent`);
      const scaledSpecificPct = e === 'lightning'
        ? baseSpecificPct * lightningBonusEffectivenessMultiplier
        : baseSpecificPct;
      finalPools[e] = allowedElements.has(e)
        ? flatPools[e] *
          (1 +
            scaledSpecificPct +
            elementalGlobalPct +
            (this.stats.totalDamagePercent || 0) +
            (this.stats.elementalDamagePercent || 0) +
            (this.stats[`${e}DamagePercent`] || 0))
        : 0;
    });

    const isDamageTypeAllowed = (type) => {
      if (type === 'physical') {
        return includePhysical;
      }
      return allowedElements.has(type);
    };

    // Apply post-stat conversion adjustments so combat output matches the UI totals.
    if (this.damageConversionDeltas && Object.keys(this.damageConversionDeltas).length > 0) {
      Object.entries(this.damageConversionDeltas).forEach(([type, delta]) => {
        if (!delta || !isDamageTypeAllowed(type)) return;
        const current = finalPools[type] || 0;
        finalPools[type] = Math.max(0, current + delta);
      });
    }

    // 3) Double-damage and criticals (after percent multipliers and conversions)
    const scalePools = (multiplier) => {
      if (!Number.isFinite(multiplier) || Math.abs(multiplier - 1) < 1e-9) return;
      Object.keys(finalPools).forEach((k) => {
        finalPools[k] *= multiplier;
      });
    };

    let isCritical = false;
    if (includeRandom) {
      if (this.stats.doubleDamageChance && Math.random() < this.stats.doubleDamageChance) {
        scalePools(2);
      }
      isCritical = Math.random() < (this.stats.critChance || 0);
      if (isCritical && canCrit) {
        scalePools(this.stats.critDamage || 1);
      }
    } else {
      const doubleChance = Math.max(0, Math.min(1, this.stats.doubleDamageChance || 0));
      let critChance = Math.max(0, Math.min(1, this.stats.critChance || 0));
      let critDamage = Math.max(0, this.stats.critDamage || 1);
      if (!canCrit) {
        critChance = 0;
        critDamage = 1;
      }
      const expectedMultiplier =
        (1 + doubleChance) * (1 + (critDamage - 1) * critChance);
      scalePools(expectedMultiplier);
    }

    const totalDamage = Object.values(finalPools).reduce((sum, v) => sum + v, 0);
    const breakdown = Object.fromEntries(Object.entries(finalPools).map(([k, v]) => [k, Math.floor(v)]));
    console.debug('Damage Breakdown:', breakdown);
    return { damage: Math.floor(totalDamage), isCritical, breakdown };
  }

  calculateDamageAgainst(enemy, instantSkillBaseEffects = {}) {
    console.debug(instantSkillBaseEffects, 'instantSkillBaseEffects');
    const result = this.calculateTotalDamage(instantSkillBaseEffects);

    if (!enemy) return result;
    // Calculate effective enemy armor after hero's armor penetration
    let effectiveArmor = enemy.armor;
    const flatPenMultiplier = 1 + (this.stats.flatPenetrationPercent || 0);
    if (this.stats.ignoreEnemyArmor > 0 || instantSkillBaseEffects.ignoreEnemyArmor > 0) {
      effectiveArmor = 0;
    } else {
      // Apply percent armor penetration first
      const armorPenFraction =
        (this.stats.armorPenetrationPercent || 0) +
        (instantSkillBaseEffects.armorPenetrationPercent || 0) / getDivisor('armorPenetrationPercent');
      effectiveArmor *= 1 - armorPenFraction;
      // Then apply flat armor penetration
      const armorPenFromSkill = (instantSkillBaseEffects.armorPenetration || 0) * flatPenMultiplier;
      effectiveArmor -= (this.stats.armorPenetration || 0) + armorPenFromSkill;
      // Armor cannot go below zero
      effectiveArmor = Math.max(0, effectiveArmor);
    }

    // Use PoE2 armor formula for physical reduction
    const armorReduction = calculateArmorReduction(effectiveArmor, result.breakdown.physical) / 100;
    const breakdown = result.breakdown;

    // Helper to calculate effective resistance after penetration
    function getEffectiveResistance(baseRes, flatPen, percentPen) {
      if (this.stats.ignoreAllEnemyResistances > 0) return 0;
      let effectiveRes = baseRes;
      // Apply percent penetration first (elementalPenetrationPercent + specific percent)
      let totalPercentPen =
        (percentPen || 0) +
        (this.stats.elementalPenetrationPercent || 0) +
        (instantSkillBaseEffects.elementalPenetrationPercent || 0) / getDivisor('elementalPenetrationPercent');

      // Add Arcane Dissolution reduction
      if (this.stats.reduceEnemyResistancesPercent) {
        totalPercentPen += this.stats.reduceEnemyResistancesPercent;
      }

      effectiveRes *= 1 - totalPercentPen;
      // Then apply flat penetration (elementalPenetration + specific flat)
      const skillFlatPen = (instantSkillBaseEffects.elementalPenetration || 0) * flatPenMultiplier;
      const totalFlatPen = (flatPen || 0) + (this.stats.elementalPenetration || 0) + skillFlatPen;
      effectiveRes -= totalFlatPen;
      // Resistance cannot go below zero
      return Math.max(0, effectiveRes);
    }

    const reducedBreakdown = {
      physical: breakdown.physical * (1 - armorReduction),
    };
    ELEMENT_IDS.forEach((id) => {
      reducedBreakdown[id] =
        breakdown[id] *
        (1 -
          calculateResistanceReduction(
            getEffectiveResistance.call(
              this,
              enemy[`${id}Resistance`],
              this.stats[`${id}Penetration`],
              this.stats[`${id}PenetrationPercent`],
            ),
            breakdown[id],
          ) / 100);
    });

    let finalDamage = Object.values(reducedBreakdown).reduce((sum, val) => sum + val, 0);

    // Apply damage multipliers based on enemy type
    if (enemy) {
      let multiplier = 1;
      if (enemy.rarity !== ENEMY_RARITY.NORMAL.type && this.stats.damageToHighRarityEnemiesPercent) {
        let rarityMult = 1;
        // rare is default 1
        if (enemy.rarity === ENEMY_RARITY.EPIC.type) rarityMult = 2;
        if (enemy.rarity === ENEMY_RARITY.LEGENDARY.type) rarityMult = 3;
        if (enemy.rarity === ENEMY_RARITY.MYTHIC.type) rarityMult = 4;

        if (enemy.isBoss) rarityMult = Math.max(rarityMult, 4);

        multiplier += (this.stats.damageToHighRarityEnemiesPercent * rarityMult);
      }

      finalDamage *= multiplier;
    }

    console.debug('Final Damage Breakdown:', reducedBreakdown);
    console.debug('Final Damage:', finalDamage);

    return {
      damage: Math.floor(finalDamage),
      isCritical: result.isCritical,
      breakdown: reducedBreakdown,
    };
  }

  /**
   * Calculate the damage returned to the attacker via thorns.
   *
   * @param {number} incomingDamage - The damage taken from the enemy. Retained
   * for compatibility but does not influence the reflected amount.
   * @returns {{ damage: number, isCritical: boolean, wasDoubleDamage: boolean } | null}
   * The damage info to reflect back to the attacker, or null if no thorns damage.
   */
  calculateTotalThornsDamage(_incomingDamage) {
    const thornsValue = Math.max(0, this.stats.thornsDamage || 0);
    if (!thornsValue) return null;

    let total = thornsValue;

    const didDoubleDamage =
      this.stats.doubleDamageChance &&
      Math.random() < this.stats.doubleDamageChance;
    if (didDoubleDamage) {
      total *= 2;
    }

    const critChance = this.stats.critChance || 0;
    const isCritical = Math.random() < critChance;
    if (isCritical) {
      const critMultiplier = this.stats.critDamage || 1;
      total *= critMultiplier;
    }

    const damage = Math.floor(Math.max(0, total));
    return {
      damage,
      isCritical,
      wasDoubleDamage: Boolean(didDoubleDamage),
    };
  }

  willRessurect() {
    let res = false;

    // Check if soul shop resurrection is available
    if (soulShop.soulUpgrades?.extraLife && game.soulShopResurrectCount === 0) {
      game.resurrectCount++;
      game.soulShopResurrectCount++;
      res = true;
    }

    // Check if resurrection chance is enabled
    if (!res && this.stats.resurrectionChance > 0) {
      if (Math.random() < this.stats.resurrectionChance && game.resurrectCount < 2) {
        game.resurrectCount++;
        res = true;
      }
    }

    // If resurrection was successful
    if (res) {
      createDamageNumber({ text: 'Ressurected!', isPlayer: true, isCritical: false, color: '#00FF00' });
      game.healPlayer(this.stats.life);
      game.restoreMana(this.stats.mana);
      return true;
    }

    return false;
  }

  calculateBlockHealing() {
    // Get evasion skill level if it exists
    const evasionSkill = skillTree.skills['evasion'];
    if (evasionSkill) {
      // Heal 1% of max life when blocking
      const healAmount = this.stats.life * 0.01;
      game.healPlayer(healAmount);
      return healAmount;
    }
    return 0;
  }

  /**
   * Resets all allocated primary stats and refunds stat points for reallocation.
   */
  resetAttributes() {
    let totalAllocated = 0;
    for (const stat in this.primaryStats) {
      totalAllocated += this.primaryStats[stat];
      this.primaryStats[stat] = 0;
    }
    this.statPoints += totalAllocated;
    this.recalculateFromAttributes();
    dataManager.saveGame();
  }

  /**
   * Apply warmup ailment to the hero
   */
  applyWarmup() {
    const id = AILMENTS.warmup.id;
    this.ailments[id] = { duration: AILMENTS.warmup.duration };
  }

  /**
   * Process hero ailments (duration decay)
   * @param {number} deltaMs - Time delta in milliseconds
   * @param {boolean} inCombat - Whether the hero is in combat
   */
  processAilments(deltaMs, inCombat = false) {
    Object.entries(this.ailments).forEach(([id, ailment]) => {
      if (ailment.duration > 0) {
        // Only process warmup when in combat
        if (id === AILMENTS.warmup.id && !inCombat) {
          return; // Don't decay warmup outside of combat
        }

        ailment.duration -= deltaMs;
        if (ailment.duration <= 0) {
          delete this.ailments[id];
        }
      } else {
        delete this.ailments[id];
      }
    });
  }
}
