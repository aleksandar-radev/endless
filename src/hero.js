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
    statistics.increment('totalCrystalsEarned', null, amount);
    this.crystals += amount;
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
    const skillPointsPerLevel = 1 + (ascBonuses.skillPointsPerLevel || 0);
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
      const itemsFlat = equipmentBonuses[attr] || 0;
      const itemsPercent = (equipmentBonuses[`${attr}Percent`] || 0) / 100;
      const skillsFlat = skillTreeBonuses[attr] || 0;
      const skillsPercent = (skillTreeBonuses[`${attr}Percent`] || 0) / 100;
      const trainingFlat = trainingBonuses[attr] || 0;
      const trainingPercent = (trainingBonuses[`${attr}Percent`] || 0) / 100;
      const soulFlat = soulBonuses[attr] || 0;
      const soulPercent = soulBonuses[`${attr}Percent`] || 0;
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
    ATTRIBUTE_KEYS.forEach((attr) => {
      this.stats[attr] =
        (this.primaryStats[attr] || 0) +
        (this.permaStats[attr] || 0) +
        (equipmentBonuses[attr] || 0) +
        (skillTreeBonuses[attr] || 0) +
        (trainingBonuses[attr] || 0);
    });
  }

  calculateAttributeEffects() {
    const effects = {};
    const ascensionBonuses = ascension?.getBonuses() || {};

    // Loop through all stats in STATS
    for (const stat of STAT_KEYS) {
      // Flat bonuses: look for {stat}Flat in attribute effects
      let flatBonus = 0;
      let percentBonus = 0;

      // Check each attribute for contributions to this stat
      for (const attr of ATTRIBUTE_KEYS) {
        const attrEffects = ATTRIBUTES[attr].effects;
        const attrMultiplier = 1 + (ascensionBonuses[`${attr}EffectPercent`] || 0);

        // Flat per-point bonus (e.g., damagePerPoint, lifePerPoint, etc.)
        const flatKey = stat + 'PerPoint';
        if (flatKey in attrEffects) {
          let perPoint = attrEffects[flatKey] * attrMultiplier;
          flatBonus += (this.stats[attr] || 0) * perPoint;
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

    return effects;
  }

  calculateFlatValues(attributeEffects, skillTreeBonuses, equipmentBonuses, trainingBonuses) {
    const flatValues = {};
    for (const stat of STAT_KEYS) {
      flatValues[stat] =
        (this.primaryStats[stat] ?? 0) +
        (this.permaStats[stat] ?? 0) +
        (STATS[stat].base ?? 0) +
        (attributeEffects[stat] ?? 0) +
        (STATS[stat].levelUpBonus ?? 0) * (this.level - 1) +
        (trainingBonuses[stat] ?? 0) +
        (equipmentBonuses[stat] ?? 0) +
        (skillTreeBonuses[stat] ?? 0) +
        (ATTRIBUTE_SET.has(stat) ? this.permaStats['allAttributes'] : 0) +
        (RESISTANCE_SET.has(stat) ? this.permaStats['allResistance'] : 0);
    }
    return flatValues;
  }

  calculatePercentBonuses(attributeEffects, skillTreeBonuses, equipmentBonuses, trainingBonuses) {
    const percentBonuses = {};
    const ascensionBonuses = ascension?.getBonuses() || {};
    for (const stat of STAT_KEYS) {
      if (stat.endsWith('Percent')) {
        const statName = stat.replace('Percent', '');
        let value =
          (attributeEffects[stat] || 0) +
          (this.permaStats[stat] || 0) +
          (skillTreeBonuses[stat] || 0) / 100 +
          (equipmentBonuses[stat] || 0) / 100 +
          (trainingBonuses[stat] || 0) / 100 +
          (ATTRIBUTE_SET.has(statName) ? this.permaStats['allAttributesPercent'] : 0);
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
        if (stat === 'blockChance') value = Math.min(value, 75);
        if (stat === 'critChance') value = Math.min(value, 100);
        if (stat === 'attackSpeed') value = Math.min(value, 5);
        if (stat === 'resurrectionChance') value = Math.min(value, 50);
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

    let allRes = this.stats.allResistance || 0;
    if (allRes) {
      allRes *= 1 + (this.stats.allResistancePercent || 0);
    }

    this.stats.fireResistance = Math.max(this.stats.fireResistance + allRes, 0);
    this.stats.coldResistance = Math.max(this.stats.coldResistance + allRes, 0);
    this.stats.airResistance = Math.max(this.stats.airResistance + allRes, 0);
    this.stats.earthResistance = Math.max(this.stats.earthResistance + allRes, 0);
    this.stats.lightningResistance = Math.max(this.stats.lightningResistance + allRes, 0);
    this.stats.waterResistance = Math.max(this.stats.waterResistance + allRes, 0);

    this.stats.manaRegen += this.stats.manaRegenOfTotalPercent * this.stats.mana * (1 + this.stats.manaRegenPercent);
    this.stats.lifeRegen += this.stats.lifeRegenOfTotalPercent * this.stats.life * (1 + this.stats.lifeRegenPercent);

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
  }

  regenerate() {
    this.stats.currentLife = Math.min(this.stats.life, this.stats.currentLife + this.stats.lifeRegen / 10);
    this.stats.currentMana = Math.min(this.stats.mana, this.stats.currentMana + this.stats.manaRegen / 10);
    if (this.stats.currentLife < 0) this.stats.currentLife = 0;
    if (this.stats.currentMana < 0) this.stats.currentMana = 0;
    updatePlayerLife();
  }

  // calculated when hit is successful
  calculateTotalDamage(instantSkillBaseEffects = {}) {
    const elements = ELEMENT_IDS;

    // 1) Flat phase: build flat pools from stored flat-only values
    const flatPools = {
      physical: (this.baseDamages?.physical || 0) + (instantSkillBaseEffects.damage || 0),
    };
    elements.forEach((e) => {
      const key = `${e}Damage`;
      flatPools[e] = (this.baseDamages?.[e] || 0) + (instantSkillBaseEffects[key] || 0);
    });

    // flat elementalDamage applies to every elemental pool
    const flatElementalDamage =
      (this.baseDamages?.elemental || 0) + (instantSkillBaseEffects.elementalDamage || 0);
    if (flatElementalDamage) elements.forEach((e) => (flatPools[e] += flatElementalDamage));

    // 2) Percent phase: apply percent bonuses (physical + per-elemental + global elemental)
    const finalPools = {};
    const physicalPct = (instantSkillBaseEffects.damagePercent || 0) / 100;
    finalPools.physical =
      flatPools.physical *
      (1 +
        physicalPct +
        (this.stats.totalDamagePercent || 0) +
        (this.stats.damagePercent || 0));

    // elemental global percent from both sources
    const elementalGlobalPct = (instantSkillBaseEffects.elementalDamagePercent || 0) / 100;
    elements.forEach((e) => {
      const specificPct = (instantSkillBaseEffects[`${e}DamagePercent`] || 0) / 100;
      finalPools[e] =
        flatPools[e] *
        (1 +
          specificPct +
          elementalGlobalPct +
          (this.stats.totalDamagePercent || 0) +
          (this.stats.elementalDamagePercent || 0) +
          (this.stats[`${e}DamagePercent`] || 0));
    });

    // 3) Double-damage and criticals (after percent multipliers)
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
    if (this.stats.ignoreEnemyArmor > 0 || instantSkillBaseEffects.ignoreEnemyArmor > 0) {
      effectiveArmor = 0;
    } else {
      // Apply percent armor penetration first
      effectiveArmor *= 1 - ((this.stats.armorPenetrationPercent || 0) + (instantSkillBaseEffects.armorPenetrationPercent || 0)) / 100;
      // Then apply flat armor penetration
      effectiveArmor -= (this.stats.armorPenetration || 0) + (instantSkillBaseEffects.armorPenetration || 0);
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
      const totalFlatPen = (flatPen || 0) + (this.stats.elementalPenetration || 0) + (instantSkillBaseEffects.elementalPenetration || 0);
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
