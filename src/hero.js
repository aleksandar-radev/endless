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
import { getCurrentRegion, updateRegionUI } from './region.js';
import { STATS } from './constants/stats/stats.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { SOUL_UPGRADE_CONFIG } from './soulShop.js';
import { ELEMENTS } from './constants/common.js';

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

export default class Hero {
  constructor(savedData = null) {
    this._recalcScheduled = false;
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
    while (this.exp >= this.getExpToNextLevel()) {
      const xpOverflow = this.exp - this.getExpToNextLevel();
      this.levelUp(1);
      this.exp = xpOverflow; // Carry over excess experience to next level
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
    this.statPoints += STATS_ON_LEVEL_UP * levels;
    statistics.heroLevel = this.level;

    const ascBonuses = ascension?.getBonuses() || {};
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
    const equipmentBonuses = inventory.getEquipmentBonuses();
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
      const decimals = STATS[attr].decimalPlaces ?? 0;
      this.stats[attr] = decimals > 0 ? Number(v.toFixed(decimals)) : Math.floor(v);
    });

    // 4) Now calculate all attributeEffects off those updated attribute stats
    const attributeEffects = this.calculateAttributeEffects();

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
        (equipmentBonuses[`${attr}Percent`] || 0) / 100 +
        (equipmentBonuses.allAttributesPercent || 0) / 100;
      const skillsFlat = (skillTreeBonuses[attr] || 0) + (skillTreeBonuses.allAttributes || 0);
      const skillsPercent =
        (skillTreeBonuses[`${attr}Percent`] || 0) / 100 +
        (skillTreeBonuses.allAttributesPercent || 0) / 100;
      const trainingFlat = (trainingBonuses[attr] || 0) + (trainingBonuses.allAttributes || 0);
      const trainingPercent =
        (trainingBonuses[`${attr}Percent`] || 0) / 100 +
        (trainingBonuses.allAttributesPercent || 0) / 100;
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

    // cycle through all stats to make all numbers have the correct decimal places
    for (const stat in this.stats) {
      const decimals = STATS[stat]?.decimalPlaces || 0;
      this.stats[stat] = Number((this.stats[stat] * 100).toFixed(decimals) / 100);
    }

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

  calculateAttributeEffects() {
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
        if (flatKey in attrEffects) {
          const perPoint = attrEffects[flatKey] * attrMultiplier;
          const points = this.stats[attr] || 0;
          const amount = points * perPoint;
          flatBonus += amount;
          if (stat === 'elementalDamage' && attr === 'intelligence') {
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

      let distributed = 0;
      ELEMENT_IDS.forEach((elementId) => {
        const statKey = `${elementId}Damage`;
        const share = Number(shareMap[statKey]) || 0;
        if (share <= 0) return;
        const amount = distributedIntelligenceElementalDamage * share;
        distributed += amount;
        effects[statKey] = (effects[statKey] || 0) + amount;
      });

      const remainder = distributedIntelligenceElementalDamage - distributed;
      if (remainder > 1e-6 && ELEMENT_IDS.length > 0) {
        const fallbackKey = `${ELEMENT_IDS[0]}Damage`;
        effects[fallbackKey] = (effects[fallbackKey] || 0) + remainder;
      }

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
    const sharedPercentAttributes =
      (this.permaStats.allAttributesPercent || 0) +
      (equipmentBonuses.allAttributesPercent || 0) / 100 +
      (skillTreeBonuses.allAttributesPercent || 0) / 100 +
      (trainingBonuses.allAttributesPercent || 0) / 100;
    for (const stat of STAT_KEYS) {
      if (stat.endsWith('Percent')) {
        const statName = stat.replace('Percent', '');
        let value =
          (attributeEffects[stat] || 0) +
          (this.permaStats[stat] || 0) +
          (skillTreeBonuses[stat] || 0) / 100 +
          (equipmentBonuses[stat] || 0) / 100 +
          (trainingBonuses[stat] || 0) / 100;
        if (ATTRIBUTE_SET.has(statName)) {
          value += sharedPercentAttributes;
        }
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
    this.damageConversionDeltas = {};

    for (const stat of STAT_KEYS) {
      if (stat.endsWith('Percent')) {
        let percentValue = percentBonuses[stat] || 0;
        percentValue += soulBonuses[stat] || 0;
        if (
          stat === 'reduceEnemyHpPercent' ||
          stat === 'reduceEnemyAttackSpeedPercent' ||
          stat === 'reduceEnemyDamagePercent'
        ) {
          percentValue = Math.min(percentValue, 0.5);
        }
        this.stats[stat] = percentValue;
        percentBonuses[stat] = percentValue;
      }
    }

    for (const stat of STAT_KEYS) {
      if (!stat.endsWith('Percent')) {
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

        // Use Math.floor for integer stats, Number.toFixed for decimals
        let value = flatValues[stat] + (ascensionBonuses[stat] || 0);
        if (percent) value *= 1 + percent;

        // Diminishing returns for attackSpeed
        if (stat === 'attackSpeed') {
          const flatAttackSpeedBonus = flatValues.attackSpeed - STATS.attackSpeed.base;
          const maxBonus = 4;
          const scale = 9;
          value =
            STATS.attackSpeed.base +
            (flatAttackSpeedBonus > 0 ? maxBonus * (1 - Math.exp(-flatAttackSpeedBonus / scale)) : 0);
        }
        if (stat === 'mana') {
          value += (this.stats.manaPerLevel || 0) * (this.level - 1);
        }

        // Apply soul shop bonuses (flat or percent)
        if (stat.endsWith('Percent')) {
          value += soulBonuses[stat] || 0;
        } else if (soulBonuses[stat]) {
          value += soulBonuses[stat];
        }

        // Apply decimal places
        const decimals = STATS[stat].decimalPlaces ?? 0;
        value = decimals > 0 ? Number(value.toFixed(decimals)) : Math.floor(value);

        // Apply caps
        if (stat === 'blockChance') {
          const cap = 50 + ((ascensionBonuses.blockChanceCap || 0) | 0);
          value = Math.min(value, cap);
        }
        if (stat === 'critChance') {
          const cap = 50 + ((ascensionBonuses.critChanceCap || 0) | 0);
          value = Math.min(value, cap);
        }
        if (stat === 'attackSpeed') {
          const cap = 5 + (ascensionBonuses.attackSpeedCap || 0);
          value = Math.min(value, cap);
        }
        if (stat === 'extraMaterialDropMax') value = Math.max(value, 1); // Always at least 1
        if (stat === 'extraDamageFromLifePercent') value = Math.min(value, 5);
        if (stat === 'extraDamageFromArmorPercent') value = Math.min(value, 10);
        if (stat === 'extraDamageFromManaPercent') value = Math.min(value, 5);
        if (stat === 'extraDamageFromLifeRegenPercent') value = Math.min(value, 40);
        if (stat === 'extraDamageFromEvasionPercent') value = Math.min(value, 10);
        if (stat === 'extraDamageFromAttackRatingPercent') value = Math.min(value, 6);
        if (stat === 'reduceEnemyHpPercent') value = Math.min(value, 50);
        if (stat === 'reduceEnemyAttackSpeedPercent') value = Math.min(value, 50);
        if (stat === 'reduceEnemyDamagePercent') value = Math.min(value, 50);

        this.stats[stat] = value;
      }
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

    this.stats.manaRegen += this.stats.manaRegenOfTotalPercent * this.stats.mana * (1 + this.stats.manaRegenPercent);
    this.stats.lifeRegen += this.stats.lifeRegenOfTotalPercent * this.stats.life * (1 + this.stats.lifeRegenPercent);

    let pendingDamageAdditions = {};
    if (runes && typeof runes.applyPreDamageConversions === 'function') {
      pendingDamageAdditions = runes.applyPreDamageConversions(this.stats) || {};
    }

    // Extra damage based on hero resources, split between physical and elemental
    const extraFromLife = (this.stats.extraDamageFromLifePercent || 0) * this.stats.life;
    const extraFromArmor = (this.stats.extraDamageFromArmorPercent || 0) * this.stats.armor;
    const extraFromMana = (this.stats.extraDamageFromManaPercent || 0) * this.stats.mana;
    const extraFromLifeRegen = (this.stats.extraDamageFromLifeRegenPercent || 0) * this.stats.lifeRegen;
    const extraFromEvasion = (this.stats.extraDamageFromEvasionPercent || 0) * this.stats.evasion;
    const extraFromAttackRating = (this.stats.extraDamageFromAttackRatingPercent || 0) * this.stats.attackRating;

    // Split: 50% to physical, 50% distributed equally among elements
    const elements = ELEMENT_IDS;

    const splitLife = extraFromLife / 2;
    const splitMana = extraFromMana / 2;
    const splitLifeRegen = extraFromLifeRegen / 2;
    const splitArmor = extraFromArmor / 2;
    const splitEvasion = extraFromEvasion / 2;
    const splitAttackRating = extraFromAttackRating / 2;

    flatValues.damage += splitLife + splitMana + splitLifeRegen + splitArmor + splitEvasion + splitAttackRating;

    const eleShareLife = splitLife / elements.length;
    const eleShareMana = splitMana / elements.length;
    const eleShareLifeRegen = splitLifeRegen / elements.length;
    const eleShareArmor = splitArmor / elements.length;
    const eleShareEvasion = splitEvasion / elements.length;
    const eleShareAttackRating = splitAttackRating / elements.length;

    flatValues.elementalDamage +=
      eleShareLife +
      eleShareMana +
      eleShareLifeRegen +
      eleShareArmor +
      eleShareEvasion +
      eleShareAttackRating;

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
    this.stats.currentLife = Math.min(this.stats.life, this.stats.currentLife + lifePerTick);
    if (this.stats.currentLife < 0) this.stats.currentLife = 0;
    const manaPerTick = this.stats.manaRegen / normalizedTicks;
    game.restoreMana(manaPerTick, { log: false });
  }

  // calculated when hit is successful
  calculateTotalDamage(instantSkillBaseEffects = {}) {
    const elements = ELEMENT_IDS;
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
      flatPools[e] =
        (allowedElements.has(e) ? (this.baseDamages?.[e] || 0) : 0) +
        (allowedElements.has(e) ? (instantSkillBaseEffects[key] || 0) : 0);
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
    const physicalPct = (instantSkillBaseEffects.damagePercent || 0) / 100;
    finalPools.physical = includePhysical
      ? flatPools.physical *
        (1 +
          physicalPct +
          (this.stats.totalDamagePercent || 0) +
          (this.stats.damagePercent || 0))
      : 0;

    // elemental global percent from both sources
    const elementalGlobalPct = (instantSkillBaseEffects.elementalDamagePercent || 0) / 100;
    elements.forEach((e) => {
      const specificPct = (instantSkillBaseEffects[`${e}DamagePercent`] || 0) / 100;
      finalPools[e] = allowedElements.has(e)
        ? flatPools[e] *
          (1 +
            specificPct +
            elementalGlobalPct +
            (this.stats.totalDamagePercent || 0) +
            (this.stats.elementalDamagePercent || 0) +
            (this.stats[`${e}DamagePercent`] || 0))
        : 0;
    });

    // Apply post-stat conversion adjustments so combat output matches the UI totals.
    if (this.damageConversionDeltas && Object.keys(this.damageConversionDeltas).length > 0) {
      Object.entries(this.damageConversionDeltas).forEach(([type, delta]) => {
        if (!delta) return;
        const current = finalPools[type] || 0;
        finalPools[type] = Math.max(0, current + delta);
      });
    }

    // 3) Double-damage and criticals (after percent multipliers and conversions)
    const isCritical = Math.random() * 100 < this.stats.critChance;
    if (this.stats.doubleDamageChance && Math.random() * 100 < this.stats.doubleDamageChance) {
      Object.keys(finalPools).forEach((k) => (finalPools[k] *= 2));
    }
    if (isCritical) Object.keys(finalPools).forEach((k) => (finalPools[k] *= (this.stats.critDamage || 1)));

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
      effectiveArmor *= 1 - ((this.stats.armorPenetrationPercent || 0) + (instantSkillBaseEffects.armorPenetrationPercent || 0)) / 100;
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
      const totalPercentPen = ((percentPen || 0) + (this.stats.elementalPenetrationPercent || 0) + (instantSkillBaseEffects.elementalPenetrationPercent || 0)) * 100;

      effectiveRes *= 1 - totalPercentPen / 100;
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

    const finalDamage = Object.values(reducedBreakdown).reduce((sum, val) => sum + val, 0);

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
   * @param {number} incomingDamage - The total damage the hero received after
   * armor and resistances have been applied.
   * @returns {number} The damage to reflect back to the attacker.
   */
  calculateTotalThornsDamage(incomingDamage) {
    const damage = (this.stats.thornsDamage + incomingDamage)
      * (1 + this.stats.thornsDamagePercent / 100);
    return Math.floor(damage) || 0;
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
      const roll = Math.random() * 100;
      if (roll < this.stats.resurrectionChance && game.resurrectCount < 2) {
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
}
