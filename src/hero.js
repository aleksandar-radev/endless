import { initializeSkillTreeStructure, updatePlayerLife, updateResources, updateTabIndicators } from './ui/ui.js';
import { game,
  inventory,
  training,
  skillTree,
  statistics,
  soulShop,
  dataManager,
  prestige,
  ascension,
  crystalShop,
  achievements,
  quests,
  runes } from './globals.js';
import { calculateArmorReduction,
  calculateResistanceReduction,
  createCombatText,
  createDamageNumber } from './combat.js';
import { handleSavedData } from './functions.js';
import { updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { SOUL_UPGRADE_CONFIG } from './soulShop.js';
import { ELEMENTS, BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL } from './constants/common.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { STATS, getDivisor, getStatDecimalPlaces } from './constants/stats/stats.js';
import { AILMENTS } from './constants/ailments.js';
import { AD_BONUS_DURATION } from './constants/ads.js';

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

function getResourceExtraDamagePhysicalShare() {
  if (typeof training?.getResourceExtraDamagePhysicalShare === 'function') {
    const share = Number(training.getResourceExtraDamagePhysicalShare());
    if (Number.isFinite(share)) return Math.max(0, Math.min(1, share));
  }
  return 0.5;
}

function getResourceExtraDamageThornsShare() {
  if (typeof training?.getResourceExtraDamageThornsShare === 'function') {
    const share = Number(training.getResourceExtraDamageThornsShare());
    if (Number.isFinite(share)) return Math.max(0, Math.min(1, share));
  }
  return 0;
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
  const squaresSum = n * baseLevel * baseLevel + baseLevel * n * nMinus1 + (nMinus1 * n * (2 * n - 1)) / 6;

  const total = 10 * n + 30 * linearSum + 2 * squaresSum;
  if (!Number.isFinite(total)) return Number.POSITIVE_INFINITY;
  return Math.round(total);
}

export function levelsAffordable(startLevel, availableExp) {
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

    // stats obtained by materials (elixirs, potions, etc.)
    this.permaStats = {};
    for (const [stat, config] of Object.entries(STATS)) {
      this.permaStats[stat] = 0;
    }

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

    this.adBonuses = {
      active: [], // Array of { type, value, expiry }
      history: [],
    };
    if (savedData && savedData.adBonuses) {
      this.adBonuses = savedData.adBonuses;
    }
    // Clean up expired on load
    this.updateAdBonuses(0);

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
    const mult = this.getAdResourceMultiplier('xp');
    amount = Math.floor(amount * mult);
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
    const mult = this.getAdResourceMultiplier('gold');
    amount = Math.floor(amount * mult);
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
    const skillPointsPerLevel = 1 + (ascBonuses.skillPointsPerLevel || 0) + (runeBonuses.skillPointsPerLevel || 0);
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
    const weaponEffectivenessPercent = skillTreeBonuses.weaponEffectivenessPercent || 0;
    const weaponFlatEffectivenessPercent = skillTreeBonuses.weaponFlatEffectivenessPercent || 0;

    const shieldEffectivenessPercent = skillTreeBonuses.shieldEffectivenessPercent || 0;
    const shieldFlatEffectivenessPercent = skillTreeBonuses.shieldFlatEffectivenessPercent || 0;

    const jewelryEffectivenessPercent = skillTreeBonuses.jewelryEffectivenessPercent || 0;
    const jewelryFlatEffectivenessPercent = skillTreeBonuses.jewelryFlatEffectivenessPercent || 0;

    const amuletEffectivenessPercent = skillTreeBonuses.amuletEffectivenessPercent || 0;
    const amuletFlatEffectivenessPercent = skillTreeBonuses.amuletFlatEffectivenessPercent || 0;

    const ringEffectivenessPercent = skillTreeBonuses.ringEffectivenessPercent || 0;
    const ringFlatEffectivenessPercent = skillTreeBonuses.ringFlatEffectivenessPercent || 0;

    const itemLifeEffectivenessPercent = skillTreeBonuses.itemLifeEffectivenessPercent || 0;
    const itemArmorEffectivenessPercent = skillTreeBonuses.itemArmorEffectivenessPercent || 0;
    const equipmentBonuses = inventory.getEquipmentBonuses(
      weaponEffectivenessPercent,
      weaponFlatEffectivenessPercent,
      itemLifeEffectivenessPercent,
      itemArmorEffectivenessPercent,
      shieldEffectivenessPercent,
      shieldFlatEffectivenessPercent,
      jewelryEffectivenessPercent,
      jewelryFlatEffectivenessPercent,
      amuletEffectivenessPercent,
      amuletFlatEffectivenessPercent,
      ringEffectivenessPercent,
      ringFlatEffectivenessPercent,
    );
    const trainingBonuses = training.getTrainingBonuses();
    const soulBonuses = this.getSoulShopBonuses();
    const prestigeBonuses = prestige?.bonuses || {};
    const questsBonuses = quests?.getQuestsBonuses?.() || {};
    const achievementsBonuses = achievements?.getBonuses?.() || {};
    const ascensionBonuses = ascension?.getBonuses?.() || {};

    // --- Unified Bonus Aggregation ---
    const unifiedBonuses = {};

    // Helper: Normalize value to Fraction (e.g. 5 -> 0.05) if needed
    const getNorm = (raw, statKey, isFractionSource = false) => {
      if (!raw || typeof raw !== 'number') return 0;
      if (isFractionSource) return raw;
      return raw / getDivisor(statKey);
    };

    const addBonusesToUnified = (target, source, isFractionSource = false) => {
      if (!source) return;
      for (const [key, value] of Object.entries(source)) {
        if (!value) continue;
        if (key.endsWith('Percent')) {
          const norm = getNorm(value, key, isFractionSource);
          target[key] = (target[key] || 0) + norm;
        } else {
          target[key] = (target[key] || 0) + value;
        }
      }
    };

    // Aggregate all sources
    addBonusesToUnified(unifiedBonuses, this.permaStats, false);
    addBonusesToUnified(unifiedBonuses, equipmentBonuses, false);
    addBonusesToUnified(unifiedBonuses, skillTreeBonuses, false);
    addBonusesToUnified(unifiedBonuses, trainingBonuses, false);
    addBonusesToUnified(unifiedBonuses, questsBonuses, false);
    addBonusesToUnified(unifiedBonuses, achievementsBonuses, true);
    addBonusesToUnified(unifiedBonuses, prestigeBonuses, true);
    addBonusesToUnified(unifiedBonuses, ascensionBonuses, true);
    addBonusesToUnified(unifiedBonuses, soulBonuses, true);

    const runeBonuses = runes?.getBonusEffects?.() || {};
    addBonusesToUnified(unifiedBonuses, runeBonuses, false);

    // Generate Stat Breakdown
    this.generateStatBreakdown(
      prestigeBonuses,
      questsBonuses,
      achievementsBonuses,
      equipmentBonuses,
      skillTreeBonuses,
      trainingBonuses,
      soulBonuses,
      runeBonuses,
    );

    // 1) Build primary stats using unified bonuses
    this.calculatePrimaryStats(unifiedBonuses);

    // 2) Get base flat and percent bonuses
    const baseFlat = this.calculateFlatValues(unifiedBonuses);
    const basePercent = this.filterPercentBonuses(unifiedBonuses);

    // 3) "Lock in" attributes
    ATTRIBUTE_KEYS.forEach((attr) => {
      const pct = basePercent[`${attr}Percent`] || 0;
      let v = baseFlat[attr] * (1 + pct);
      const decimals = getStatDecimalPlaces(attr);
      this.stats[attr] = decimals > 0 ? Number(v.toFixed(decimals)) : Math.floor(v);
    });

    // 4) Calculate Attribute Effects
    const attributeEffects = this.calculateAttributeEffects(skillTreeBonuses);

    // 5) Final Pass: separate or merged? Merging is cleaner for calculateFlatValues.
    const finalBonuses = { ...unifiedBonuses };
    // Add attribute effects to final bonuses (treated as flat/integer sources usually, but they are calculated values)
    // The calculateAttributeEffects returns values that match STAT definitions.
    // e.g. 'damagePercent' -> 50 (meaning 50%).
    // So we treat them as Integer Source (false) so they get normalized if they are percents.
    addBonusesToUnified(finalBonuses, attributeEffects, false);

    const flatValues = this.calculateFlatValues(finalBonuses);

    const finalPercentBonuses = this.filterPercentBonuses(finalBonuses);

    // applyFinalCalculations now only needs the aggregated values
    this.applyFinalCalculations(flatValues, finalPercentBonuses, finalBonuses);

    // Assign calculated percentage bonuses to stats so they are available for UI and logic
    Object.assign(this.stats, finalPercentBonuses);

    updatePlayerLife();
    updateStatsAndAttributesUI();
    dataManager.saveGame();
  }

  generateStatBreakdown(prestigeBonuses, questsBonuses, achievementsBonuses, equipmentBonuses, skillTreeBonuses, trainingBonuses, soulBonuses, runeBonuses) {
    const getNorm = (raw, statKey, isFractionSource = false) => {
      if (!raw || typeof raw !== 'number') return 0;
      if (isFractionSource) return raw;
      return raw / getDivisor(statKey);
    };

    const getSourceValues = (source, attr, isFraction = false) => {
      const flat = (source[attr] || 0) + (source.allAttributes || 0);
      const percent =
        getNorm(source[`${attr}Percent`], `${attr}Percent`, isFraction) +
        getNorm(source.allAttributesPercent, 'allAttributesPercent', isFraction);
      return { flat, percent };
    };

    ATTRIBUTE_KEYS.forEach((attr) => {
      const base = (STATS[attr]?.base || 0) + (STATS[attr]?.levelUpBonus || 0) * (this.level - 1);
      const allocated = this.primaryStats[attr] || 0;

      const prestigeVals = getSourceValues(prestigeBonuses, attr, true);
      const questsVals = getSourceValues(questsBonuses, attr, false);
      const achievementsVals = getSourceValues(achievementsBonuses, attr, true);
      const permaVals = getSourceValues(this.permaStats, attr, false);
      const itemsVals = getSourceValues(equipmentBonuses, attr, false);
      const skillsVals = getSourceValues(skillTreeBonuses, attr, false);
      const trainingVals = getSourceValues(trainingBonuses, attr, false);
      const soulVals = getSourceValues(soulBonuses, attr, true);
      const runeVals = getSourceValues(runeBonuses, attr, false);

      this.statBreakdown[attr] = {
        base,
        allocated,
        perma: permaVals.flat,
        prestige: prestigeVals.flat,
        quests: questsVals.flat,
        achievements: achievementsVals.flat,
        items: itemsVals.flat,
        skills: skillsVals.flat,
        training: trainingVals.flat,
        soul: soulVals.flat,
        runes: runeVals.flat,
        percent: {
          perma: permaVals.percent,
          prestige: prestigeVals.percent,
          quests: questsVals.percent,
          achievements: achievementsVals.percent,
          items: itemsVals.percent,
          skills: skillsVals.percent,
          training: trainingVals.percent,
          soul: soulVals.percent,
          runes: runeVals.percent,
        },
      };
    });
  }

  filterPercentBonuses(bonuses) {
    const result = {};
    for (const [key, val] of Object.entries(bonuses)) {
      if (key.endsWith('Percent')) {
        result[key] = val;
      }
    }
    return result;
  }

  calculatePrimaryStats(unifiedBonuses) {
    const sharedFlatAttributes = unifiedBonuses.allAttributes || 0;

    ATTRIBUTE_KEYS.forEach((attr) => {
      this.stats[attr] =
        (this.primaryStats[attr] || 0) +
        (unifiedBonuses[attr] || 0) +
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

      for (const attr of ATTRIBUTE_KEYS) {
        const attrEffects = ATTRIBUTES[attr].effects;
        if (!attrEffects) continue;
        const attrMultiplier = 1 + (ascensionBonuses[`${attr}EffectPercent`] || 0);

        const flatKey = stat + 'PerPoint';
        const hasFlatKey = flatKey in attrEffects;
        const extraPerPoint =
          attr === 'endurance' && stat === 'thornsDamage' ? skillTreeBonuses.enduranceThornsDamagePerPoint || 0 : 0;
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

        const percentKey = stat + 'PercentPer';
        if (percentKey in attrEffects && attrEffects[percentKey].enabled) {
          const value = attrEffects[percentKey].value * attrMultiplier;
          percentBonus += Math.floor((this.stats[attr] || 0) / attrEffects[percentKey].points) * value;
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
      const distribution = distributeElementalAmount(distributedIntelligenceElementalDamage, shareMap);
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

  calculateFlatValues(unifiedBonuses) {
    const flatValues = {};
    const sharedFlatAttributes = unifiedBonuses.allAttributes || 0;

    for (const stat of STAT_KEYS) {
      let value =
        (this.primaryStats[stat] ?? 0) +
        (STATS[stat].base ?? 0) +
        (STATS[stat].levelUpBonus ?? 0) * (this.level - 1) +
        (unifiedBonuses[stat] ?? 0);

      if (ATTRIBUTE_SET.has(stat)) {
        value += sharedFlatAttributes;
      }

      if (RESISTANCE_SET.has(stat)) {
        value += unifiedBonuses.allResistance || 0;
      }

      flatValues[stat] = value;
    }

    // --- Generic Per-Level Flat Bonus ---
    // Safely iterate all accumulated bonuses to find any ...PerLevel keys
    for (const key of Object.keys(unifiedBonuses)) {
      if (key.endsWith('PerLevel') && !key.endsWith('PercentPerLevel')) {
        const statName = key.slice(0, -8); // remove "PerLevel"
        // Only apply if the base stat exists in flatValues (which covers all STAT_KEYS)
        // or if we want to allow new stats. STAT_KEYS covers all defined stats.
        if (Object.prototype.hasOwnProperty.call(flatValues, statName)) {
          const bonus = unifiedBonuses[key] * this.level;
          if (bonus) {
            flatValues[statName] += bonus;
          }
        }
      }
    }
    return flatValues;
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

  applyFinalCalculations(flatValues, percentBonuses, unifiedBonuses = {}) {
    const ascensionBonuses = ascension?.getBonuses() || {};

    // --- Generic Per-Level Percent Bonus ---
    for (const key of Object.keys(unifiedBonuses)) {
      if (key.endsWith('PercentPerLevel')) {
        const statName = key.slice(0, -15); // remove "PercentPerLevel"
        const percentKey = statName + 'Percent';
        const bonus = unifiedBonuses[key] * this.level;
        if (bonus) {
          percentBonuses[percentKey] = (percentBonuses[percentKey] || 0) + bonus;
        }
      }
    }

    // 1. Handle Percent Stats and Effectiveness Scaling
    ELEMENT_IDS.forEach((id) => {
      const effectivenessKey = `${id}EffectivenessPercent`;
      const damageKey = `${id}Damage`;
      const damagePercentKey = `${id}DamagePercent`;

      const effectiveness = percentBonuses[effectivenessKey] || 0;
      const multiplier = Math.max(0, 1 + (effectiveness || 0));

      if (Math.abs(multiplier - 1) > 1e-9) {
        if (Number.isFinite(flatValues[damageKey])) {
          flatValues[damageKey] *= multiplier;
        }

        const pSpecific = percentBonuses[damagePercentKey] || 0;

        const pShared = (percentBonuses.elementalDamagePercent || 0) + (percentBonuses.totalDamagePercent || 0);
        const sharedBase = pShared;

        percentBonuses[damagePercentKey] =
          pSpecific * multiplier +
          sharedBase * (multiplier - 1);
      }
    });


    // Calculate Ad Multipliers once
    const adMultipliers = this.getAdBonusMultipliers();

    // Inject into percentBonuses so they are picked up by the loop and formatted correctly
    percentBonuses['adDamagePercent'] = (adMultipliers['damage'] || 1) - 1;
    percentBonuses['adLifePercent'] = (adMultipliers['life'] || 1) - 1;
    percentBonuses['adArmorPercent'] = (adMultipliers['armor'] || 1) - 1;
    percentBonuses['adEvasionPercent'] = (adMultipliers['evasion'] || 1) - 1;
    percentBonuses['adAttackRatingPercent'] = (adMultipliers['attackRating'] || 1) - 1;
    percentBonuses['adAllResistancePercent'] = (adMultipliers['allResistance'] || 1) - 1;
    percentBonuses['adXpBonusPercent'] = (adMultipliers['xp'] || 1) - 1;
    percentBonuses['adGoldGainPercent'] = (adMultipliers['gold'] || 1) - 1;

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

          if ((stat === 'armorPenetration' || stat === 'elementalPenetration') && this.stats.flatPenetrationPercent) {
            percent += this.stats.flatPenetrationPercent;
          }

          value = flatValues[stat] + (ascensionBonuses[stat] || 0);
          if (percent) value *= 1 + percent;
        }

        // --- Ad Bonuses Multiplier (Applies after percetages) ---
        // For stats that are "multiplicative to other bonuses"
        if (adMultipliers[stat]) {
          // Defer damage stats to the end of the function to capture all modifications (including resources)
          if (stat !== 'damage' && !ELEMENT_IDS.some((id) => stat === `${id}Damage`)) {
            value *= adMultipliers[stat];
          }
        }


        if (stat === 'mana') {
          value += (this.stats.manaPerLevel || 0) * (this.level - 1);
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
        const hasShield = Object.values(inventory.equippedItems).some((i) => i && i.type === 'SHIELD');
        if (!hasShield) {
          this.stats[stat] = 0;
          continue;
        }
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
      if (divisor !== 1) {
        this.stats[stat] = value / divisor;
      } else {
        this.stats[stat] = value;
      }
    }

    // --- Specific Interactions ---

    let convertedManaForBloodmage = 0;
    const conversionPercent = this.stats.convertManaToLifePercent || 0;

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



    const computeResourceExtraDamage = (statsSnapshot, shareMap, physicalShare = 0.5, thornsShare = 0) => {
      if (!statsSnapshot) return {
        physical: 0, elemental: 0, thorns: 0, perElement: {},
      };

      const resourceCapPerLevel = Math.max(
        0,
        BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL + (ascensionBonuses.extraResourceDamageCapPerLevel || 0),
      );
      const maxResourceAmount = Math.max(0, this.level * resourceCapPerLevel);
      if (maxResourceAmount <= 0) return {
        physical: 0, elemental: 0, thorns: 0, perElement: {},
      };

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

      let resistanceExtras = 0;
      RESISTANCE_KEYS.forEach((key) => {
        const value = capResource(statsSnapshot[key]);
        const element = key.replace('Resistance', '');
        const statKey = `extraDamageFrom${element.charAt(0).toUpperCase() + element.slice(1)}ResistancePercent`;
        const bonus = statsSnapshot[statKey] || 0;
        if (bonus > 0) {
          resistanceExtras += value * bonus;
        }
      });

      const totalExtra =
        (statsSnapshot.extraDamageFromLifePercent || 0) * life +
        (statsSnapshot.extraDamageFromArmorPercent || 0) * armor +
        (statsSnapshot.extraDamageFromManaPercent || 0) * mana +
        (statsSnapshot.extraDamageFromLifeRegenPercent || 0) * lifeRegen +
        (statsSnapshot.extraDamageFromEvasionPercent || 0) * evasion +
        (statsSnapshot.extraDamageFromAttackRatingPercent || 0) * attackRating +
        (statsSnapshot.extraDamageFromAllResistancesPercent || 0) * allResistances +
        resistanceExtras;

      if (!totalExtra) return {
        physical: 0, elemental: 0, thorns: 0, perElement: {},
      };

      const clampedPhysical = Math.max(0, Math.min(1, Number(physicalShare) || 0));
      const clampedThorns = Math.max(0, Math.min(1, Number(thornsShare) || 0));
      const physical = totalExtra * clampedPhysical;
      const thorns = totalExtra * clampedThorns;
      let totalElemental = totalExtra - physical - thorns;
      totalElemental = Math.max(0, totalElemental);
      const perElement = distributeElementalAmount(totalElemental, shareMap);

      return {
        physical, elemental: totalElemental, thorns, perElement,
      };
    };

    const baseFlatDamageBeforeResources = flatValues.damage;
    const baseFlatElementalBeforeResources = flatValues.elementalDamage;

    const elementalShareMap = getElementalShareMap();
    const resourceExtraPhysicalShare = getResourceExtraDamagePhysicalShare();
    const resourceExtraThornsShare = getResourceExtraDamageThornsShare();
    const initialResourceExtraDamage = computeResourceExtraDamage(
      this.stats,
      elementalShareMap,
      resourceExtraPhysicalShare,
      resourceExtraThornsShare,
    );

    if (initialResourceExtraDamage.physical) {
      flatValues.damage += initialResourceExtraDamage.physical;
    }
    if (initialResourceExtraDamage.thorns) {
      flatValues.thornsDamage = (flatValues.thornsDamage || 0) + initialResourceExtraDamage.thorns;
    }
    Object.entries(initialResourceExtraDamage.perElement).forEach(([statKey, amount]) => {
      if (!amount) return;
      flatValues[statKey] = (flatValues[statKey] || 0) + amount;
    });

    // Store flat-only values for later damage calculations
    this.baseDamages.physical = Math.floor(
      flatValues.damage + (ascensionBonuses.damage || 0) + (this.stats.damagePerLevel || 0) * this.level,
    );
    this.baseDamages.elemental = Math.floor(flatValues.elementalDamage + (ascensionBonuses.elementalDamage || 0));
    ELEMENT_IDS.forEach((id) => {
      this.baseDamages[id] = Math.floor((flatValues[`${id}Damage`] || 0) + (ascensionBonuses[`${id}Damage`] || 0));
    });

    const flatThornsDamage = Math.max(0, (flatValues.thornsDamage || 0) + (ascensionBonuses.thornsDamage || 0));
    const combinedThornsPercent =
      (this.stats.thornsDamagePercent || 0) + (this.stats.totalDamagePercent || 0);
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
      this.baseDamages.physical * (1 + this.stats.totalDamagePercent + this.stats.damagePercent),
    );

    // Special handling for elemental damages
    ELEMENT_IDS.forEach((id) => {
      const base = this.baseDamages[id] + this.baseDamages.elemental;
      this.stats[`${id}Damage`] = Math.floor(
        base *
          (1 + this.stats.elementalDamagePercent + this.stats[`${id}DamagePercent`] + this.stats.totalDamagePercent),
      );

      // reflect damage calculation
      const reflectKey = `reflect${id.charAt(0).toUpperCase()}${id.slice(1)}Damage`;
      if (flatValues[reflectKey] > 0) {
        this.stats[reflectKey] = Math.floor(
          (flatValues[reflectKey] + base) *
            (1 + this.stats.totalDamagePercent + this.stats[`${id}DamagePercent`] + this.stats.elementalDamagePercent),
        );
      }
    });

    const preConversionDamage = { damage: this.stats.damage };
    ELEMENT_IDS.forEach((id) => {
      preConversionDamage[`${id}Damage`] = this.stats[`${id}Damage`];
    });



    const finalResourceExtraDamage = computeResourceExtraDamage(
      this.stats,
      elementalShareMap,
      resourceExtraPhysicalShare,
      resourceExtraThornsShare,
    );
    const basePhysicalFlatWithoutResources =
      baseFlatDamageBeforeResources + (ascensionBonuses.damage || 0) + (this.stats.damagePerLevel || 0) * this.level;
    const baseElementalFlatWithoutResources =
      baseFlatElementalBeforeResources + (ascensionBonuses.elementalDamage || 0);

    this.baseDamages.physical = Math.floor(
      Math.max(0, basePhysicalFlatWithoutResources + finalResourceExtraDamage.physical),
    );
    this.baseDamages.elemental = Math.floor(Math.max(0, baseElementalFlatWithoutResources));
    this.elementalDamageFromResources = finalResourceExtraDamage.elemental;
    this.physicalDamageFromResources = finalResourceExtraDamage.physical;
    this.thornsDamageFromResources = finalResourceExtraDamage.thorns;
    this.totalExtraDamageFromResources = finalResourceExtraDamage.physical + finalResourceExtraDamage.elemental + (finalResourceExtraDamage.thorns || 0);

    const deltaPhysicalFlat = finalResourceExtraDamage.physical - initialResourceExtraDamage.physical;
    const deltaThornsFlat = (finalResourceExtraDamage.thorns || 0) - (initialResourceExtraDamage.thorns || 0);

    if (Math.abs(deltaPhysicalFlat) > 1e-9) {
      const physicalMultiplier = 1 + (this.stats.totalDamagePercent || 0) + (this.stats.damagePercent || 0);
      const deltaPhysicalFinal = deltaPhysicalFlat * physicalMultiplier;
      this.stats.damage = (this.stats.damage || 0) + deltaPhysicalFinal;
      preConversionDamage.damage = (preConversionDamage.damage || 0) + deltaPhysicalFinal;
    }

    if (Math.abs(deltaThornsFlat) > 1e-9) {
      const combinedThornsPercent = (this.stats.thornsDamagePercent || 0) + (this.stats.totalDamagePercent || 0);
      const thornsMultiplier = Math.max(0, 1 + combinedThornsPercent);
      const deltaThornsFinal = deltaThornsFlat * thornsMultiplier;
      this.stats.thornsDamage = (this.stats.thornsDamage || 0) + deltaThornsFinal;
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
    // --- Apply Final Ad Multipliers for Damage ---
    // We deferred this to ensure it multiplies the fully calculated damage (including resource additions)
    const finalAdMultipliers = this.getAdBonusMultipliers();
    if (finalAdMultipliers['damage']) {
      this.stats.damage = Math.floor((this.stats.damage || 0) * finalAdMultipliers['damage']);
    }
    ELEMENT_IDS.forEach((id) => {
      const key = `${id}Damage`;
      if (finalAdMultipliers[key]) {
        this.stats[key] = Math.floor((this.stats[key] || 0) * finalAdMultipliers[key]);
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

  // Helper to expand per-level stats for instant skills
  expandSkillEffects(instantSkillBaseEffects = {}) {
    if (!instantSkillBaseEffects || this.level <= 0) return { ...instantSkillBaseEffects };

    // Clone to avoid mutating original which is used by UI
    const effects = { ...instantSkillBaseEffects };

    Object.keys(effects).forEach((key) => {
      if (key.endsWith('PerLevel')) {
        const value = effects[key];
        if (typeof value === 'number') {
          if (key.endsWith('PercentPerLevel')) {
            const stat = key.slice(0, -15);
            const target = `${stat}Percent`;
            effects[target] = (effects[target] || 0) + value * this.level;
          } else {
            const stat = key.slice(0, -8);
            effects[stat] = (effects[stat] || 0) + value * this.level;
          }
        }
      }
    });

    return effects;
  }

  // calculated when hit is successful
  calculateTotalDamage(instantSkillBaseEffects = {}, options = {}) {
    const effects = this.expandSkillEffects(instantSkillBaseEffects);
    const { includeRandom = true, canCrit = true } = options;
    const elements = ELEMENT_IDS;
    const allowedDamageTypes = Array.isArray(effects.allowedDamageTypes)
      ? effects.allowedDamageTypes
      : null;
    const allowAllDamage = !allowedDamageTypes || allowedDamageTypes.length === 0;
    const includePhysical = allowAllDamage || allowedDamageTypes?.includes('physical');
    const allowedElements = allowAllDamage
      ? new Set(elements)
      : new Set(allowedDamageTypes.filter((type) => elements.includes(type)));

    // 1) Flat phase: build flat pools from stored flat-only values
    const flatPools = {
      physical:
        (includePhysical ? this.baseDamages?.physical || 0 : 0) +
        (includePhysical ? effects.damage || 0 : 0),
    };
    elements.forEach((e) => {
      const effectivenessMultiplier = 1 + (this.stats[`${e}EffectivenessPercent`] || 0);
      const key = `${e}Damage`;
      const baseFlat = allowedElements.has(e) ? this.baseDamages?.[e] || 0 : 0;
      const skillFlat = allowedElements.has(e) ? effects[key] || 0 : 0;

      // Aggregated stats already include the effectiveness multiplier (so UI matches).
      // Apply it here only to instant-skill bonus contributions.
      const scaledSkillFlat = skillFlat * effectivenessMultiplier;
      flatPools[e] = baseFlat + scaledSkillFlat;
    });

    // flat elementalDamage applies to every elemental pool
    const baseElemental = this.baseDamages?.elemental || 0;
    const flatElementalDamage = effects.elementalDamage || 0;
    if (baseElemental || flatElementalDamage) {
      elements.forEach((e) => {
        if (allowedElements.has(e)) {
          flatPools[e] += baseElemental + flatElementalDamage;
        }
      });
    }

    // 2) Percent phase: apply percent bonuses (physical + per-elemental + global elemental)
    const finalPools = {};
    const physicalPct = (effects.damagePercent || 0) / getDivisor('damagePercent');
    let totalDamagePercent = (this.stats.totalDamagePercent || 0) + (this.stats.damagePercent || 0);

    if (game.fightMode === 'arena' && this.stats.arenaDamagePercent) {
      totalDamagePercent += this.stats.arenaDamagePercent;
    }

    finalPools.physical = includePhysical ? flatPools.physical * (1 + physicalPct + totalDamagePercent) : 0;

    // elemental global percent from both sources
    const elementalGlobalPct =
      (effects.elementalDamagePercent || 0) / getDivisor('elementalDamagePercent');
    elements.forEach((e) => {
      const effectivenessMultiplier = 1 + (this.stats[`${e}EffectivenessPercent`] || 0);
      const specificBonusPercent = effects[`${e}DamagePercent`] || 0;
      const baseSpecificPct = specificBonusPercent / getDivisor(`${e}DamagePercent`);
      const scaledSpecificPct = baseSpecificPct * effectivenessMultiplier;
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
      const expectedMultiplier = (1 + doubleChance) * (1 + (critDamage - 1) * critChance);
      scalePools(expectedMultiplier);
    }

    const totalDamage = Object.values(finalPools).reduce((sum, v) => sum + v, 0);
    const breakdown = Object.fromEntries(Object.entries(finalPools).map(([k, v]) => [k, Math.floor(v)]));
    console.debug('Damage Breakdown:', breakdown);
    return {
      damage: Math.floor(totalDamage), isCritical, breakdown,
    };
  }

  calculateDamageAgainst(enemy, instantSkillBaseEffects = {}) {
    console.debug(instantSkillBaseEffects, 'instantSkillBaseEffects');
    const effects = this.expandSkillEffects(instantSkillBaseEffects);
    // calculateTotalDamage will call expandSkillEffects again, which is redundant but safe.
    // Optimization: pass expanded effects if calculateTotalDamage supports skipping it,
    // or just let it happen (idempotent for keys like 'damagePerLevel' if values are numbers,
    // BUT WAIT: `expandSkillEffects` adds `value * level` to `damage`.
    // If I call it TWICE, I will add it TWICE.
    // Solution: `calculateTotalDamage` calls `expandSkillEffects` internally.
    // So I should pass original `instantSkillBaseEffects` to `calculateTotalDamage`,
    // OR change `calculateTotalDamage` to accept `effects`.
    // Let's rely on `calculateTotalDamage` doing the expansion internally.

    // HOWEVER, `calculateDamageAgainst` needs expanded `effects` for Penetration logic below.
    // So `effects` (expanded) is used for local logic.
    // And `calculateTotalDamage(instantSkillBaseEffects)` handles damage logic with its own expansion.
    // This is SAFE and CORRECT because `instantSkillBaseEffects` is passed raw.

    const result = this.calculateTotalDamage(instantSkillBaseEffects);

    if (!enemy) return result;
    // Calculate effective enemy armor after hero's armor penetration
    let effectiveArmor = enemy.armor;
    const flatPenMultiplier = 1 + (this.stats.flatPenetrationPercent || 0);
    if (this.stats.ignoreEnemyArmor > 0 || effects.ignoreEnemyArmor > 0) {
      effectiveArmor = 0;
    } else {
      // Apply percent armor penetration first
      const armorPenFraction =
        (this.stats.armorPenetrationPercent || 0) +
        (effects.armorPenetrationPercent || 0) / getDivisor('armorPenetrationPercent');
      effectiveArmor *= 1 - armorPenFraction;
      // Then apply flat armor penetration
      const armorPenFromSkill = (effects.armorPenetration || 0) * flatPenMultiplier;
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
        (effects.elementalPenetrationPercent || 0) / getDivisor('elementalPenetrationPercent');

      // Add Arcane Dissolution reduction
      if (this.stats.reduceEnemyResistancesPercent) {
        totalPercentPen += this.stats.reduceEnemyResistancesPercent;
      }

      effectiveRes *= 1 - totalPercentPen;
      // Then apply flat penetration (elementalPenetration + specific flat)
      const skillFlatPen = (effects.elementalPenetration || 0) * flatPenMultiplier;
      const totalFlatPen = (flatPen || 0) + (this.stats.elementalPenetration || 0) + skillFlatPen;
      effectiveRes -= totalFlatPen;
      // Resistance cannot go below zero
      return Math.max(0, effectiveRes);
    }

    const reducedBreakdown = { physical: breakdown.physical * (1 - armorReduction) };
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
          ) /
            100);
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

        multiplier += this.stats.damageToHighRarityEnemiesPercent * rarityMult;
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

    const didDoubleDamage = this.stats.doubleDamageChance && Math.random() < this.stats.doubleDamageChance;
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
      if (Math.random() < this.stats.resurrectionChance) {
        game.resurrectCount++;
        res = true;
      }
    }

    // If resurrection was successful
    if (res) {
      createDamageNumber({
        text: 'Ressurected!', isPlayer: true, isCritical: false, color: '#00FF00',
      });
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


  updateAdBonuses(dt) {
    const now = Date.now();
    let changed = false;
    if (this.adBonuses.active.length > 0) {
      const initialLen = this.adBonuses.active.length;
      this.adBonuses.active = this.adBonuses.active.filter((b) => b.expiry > now);
      if (this.adBonuses.active.length !== initialLen) {
        changed = true;
      }
    }
    if (changed) {
      this.queueRecalculateFromAttributes();
      // Notify UI about update?
      document.dispatchEvent(new CustomEvent('adBonusesUpdated'));
    }
  }

  activateAdBonus(bonusType, value) {
    const now = Date.now();
    this.adBonuses.active = this.adBonuses.active.filter((b) => b.type !== bonusType);

    this.adBonuses.active.push({
      type: bonusType,
      value: value,
      expiry: now + AD_BONUS_DURATION,
      startTime: now,
    });
    this.queueRecalculateFromAttributes();
    document.dispatchEvent(new CustomEvent('adBonusesUpdated'));
    dataManager.saveGame();
  }

  getAdBonusMultipliers() {
    const multipliers = {};
    const getMult = (val) => 1 + (val / 100);

    this.adBonuses.active.forEach((bonus) => {
      let stat = bonus.type.replace('Percent', '');

      // Handle Exception Mappings
      if (bonus.type === 'totalDamagePercent') stat = 'damage';
      else if (bonus.type === 'xpBonusPercent') stat = 'xp';
      else if (bonus.type === 'goldGainPercent') stat = 'gold';

      const mult = getMult(bonus.value);
      multipliers[stat] = (multipliers[stat] || 1) * mult;

      // Handle Expansions
      if (stat === 'damage') {
        ELEMENT_IDS.forEach((el) => {
          const key = `${el}Damage`;
          multipliers[key] = (multipliers[key] || 1) * mult;
        });
      } else if (stat === 'allResistance') {
        RESISTANCE_KEYS.forEach((key) => {
          multipliers[key] = (multipliers[key] || 1) * mult;
        });
      }
    });

    return multipliers;
  }

  getAdResourceMultiplier(type) {
    let mult = 1;
    const now = Date.now();
    this.adBonuses.active.forEach((bonus) => {
      if (bonus.expiry <= now) return;
      if (type === 'xp' && bonus.type === 'xpBonusPercent') {
        mult *= (1 + bonus.value / 100);
        this.stats.adXpBonusPercent = (mult - 1) * 100;
      }
      if (type === 'gold' && bonus.type === 'goldGainPercent') {
        mult *= (1 + bonus.value / 100);
        this.stats.adGoldGainPercent = (mult - 1) * 100;
      }
    });
    return mult;
  }
}
