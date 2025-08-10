import { initializeSkillTreeStructure, updatePlayerLife, updateTabIndicators } from './ui/ui.js';
import { game, inventory, training, skillTree, statistics, soulShop, dataManager, prestige } from './globals.js';
import { calculateArmorReduction, calculateResistanceReduction, createCombatText, createDamageNumber } from './combat.js';
import { handleSavedData } from './functions.js';
import { getCurrentRegion, updateRegionUI } from './region.js';
import { STATS } from './constants/stats/stats.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { SOUL_UPGRADE_CONFIG } from './soulShop.js';
import { ELEMENTS } from './constants/common.js';

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

    handleSavedData(savedData, this);
  }

  /**
   * Calculates the experience required to reach the next level.
   * @returns {number} EXP required for next level
   */
  getExpToNextLevel() {
    if (this.level === 1) return 66;
    let xp = 66;
    for (let lvl = 2; lvl <= this.level; lvl++) {
      const block = Math.floor((lvl - 1) / 20);
      const xpPerLevel = 86 + 4 * Math.floor((lvl - 1) / 50);
      xp += xpPerLevel + 40 * block;
    }
    return xp;
  }

  gainExp(amount) {
    this.exp += amount;
    document.dispatchEvent(new CustomEvent('xpGained', { detail: amount }));
    while (this.exp >= this.getExpToNextLevel()) {
      const xpOverflow = this.exp - this.getExpToNextLevel();
      this.levelUp(1);
      this.exp = xpOverflow; // Carry over excess experience to next level
      updateStatsAndAttributesUI();
    }
  }

  gainGold(amount) {
    statistics.increment('totalGoldEarned', null, amount);
    this.gold += amount;
  }

  gainCrystals(amount) {
    statistics.increment('totalCrystalsEarned', null, amount);
    this.crystals += amount;
  }

  gainSouls(amount) {
    statistics.increment('totalSoulsEarned', null, amount);
    this.souls += amount;
  }
  levelUp(levels) {
    this.exp = 0;
    this.level += levels;
    this.statPoints += STATS_ON_LEVEL_UP * levels;

    skillTree.addSkillPoints(levels * 1); // Add 1 skill points per level

    this.recalculateFromAttributes();
    createCombatText(`LEVEL UP! (${this.level})`);
    updatePlayerLife();
    updateStatsAndAttributesUI();
    initializeSkillTreeStructure();
    dataManager.saveGame();
    updateRegionUI();
    updateTabIndicators();

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
    Object.keys(ATTRIBUTES).forEach((attr) => {
      const pct = basePercent[`${attr}Percent`] || 0;
      let v = baseFlat[attr] * (1 + pct);
      const decimals = STATS[attr].decimalPlaces ?? 0;
      this.stats[attr] = decimals > 0 ? Number(v.toFixed(decimals)) : Math.floor(v);
    });

    // 4) Now calculate all attributeEffects off those updated attribute stats
    const attributeEffects = this.calculateAttributeEffects();

    // 5) Normal flat+% pass
    const flatValues = this.calculateFlatValues(attributeEffects, skillTreeBonuses, equipmentBonuses, trainingBonuses);
    const percentBonuses = this.calculatePercentBonuses(
      attributeEffects,
      skillTreeBonuses,
      equipmentBonuses,
      trainingBonuses,
    );

    Object.keys(ATTRIBUTES).forEach((attr) => {
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

    this.applyFinalCalculations(flatValues, percentBonuses);

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
    this.stats.strength =
      this.primaryStats.strength +
      this.permaStats.strength +
      (equipmentBonuses.strength || 0) +
      (skillTreeBonuses.strength || 0) +
      (trainingBonuses.strength || 0);
    this.stats.agility =
      this.primaryStats.agility +
      this.permaStats.agility +
      (equipmentBonuses.agility || 0) +
      (skillTreeBonuses.agility || 0) +
      (trainingBonuses.agility || 0);
    this.stats.vitality =
      this.primaryStats.vitality +
      this.permaStats.vitality +
      (equipmentBonuses.vitality || 0) +
      (skillTreeBonuses.vitality || 0) +
      (trainingBonuses.vitality || 0);
    this.stats.wisdom =
      this.primaryStats.wisdom +
      this.permaStats.wisdom +
      (equipmentBonuses.wisdom || 0) +
      (skillTreeBonuses.wisdom || 0) +
      (trainingBonuses.wisdom || 0);
    this.stats.endurance =
      this.primaryStats.endurance +
      this.permaStats.endurance +
      (equipmentBonuses.endurance || 0) +
      (skillTreeBonuses.endurance || 0) +
      (trainingBonuses.endurance || 0);
    this.stats.dexterity =
      this.primaryStats.dexterity +
      this.permaStats.dexterity +
      (equipmentBonuses.dexterity || 0) +
      (skillTreeBonuses.dexterity || 0) +
      (trainingBonuses.dexterity || 0);
    this.stats.intelligence =
      this.primaryStats.intelligence +
      this.permaStats.intelligence +
      (equipmentBonuses.intelligence || 0) +
      (skillTreeBonuses.intelligence || 0) +
      (trainingBonuses.intelligence || 0);
    this.stats.perseverance =
      this.primaryStats.perseverance +
      this.permaStats.perseverance +
      (equipmentBonuses.perseverance || 0) +
      (skillTreeBonuses.perseverance || 0) +
      (trainingBonuses.perseverance || 0);
  }

  calculateAttributeEffects() {
    const effects = {};

    // Loop through all stats in STATS
    for (const stat in STATS) {
      // Flat bonuses: look for {stat}Flat in attribute effects
      let flatBonus = 0;
      let percentBonus = 0;

      // Check each attribute for contributions to this stat
      for (const attr in ATTRIBUTES) {
        const attrEffects = ATTRIBUTES[attr].effects;

        // Flat per-point bonus (e.g., damagePerPoint, lifePerPoint, etc.)
        const flatKey = stat + 'PerPoint';
        if (flatKey in attrEffects) {
          flatBonus += (this.stats[attr] || 0) * attrEffects[flatKey];
        }

        // Percent per N points bonus (e.g., damagePercentPer, lifePercentPer, etc.)
        const percentKey = stat + 'PercentPer';
        if (percentKey in attrEffects && attrEffects[percentKey].enabled) {
          percentBonus +=
            Math.floor((this.stats[attr] || 0) / attrEffects[percentKey].points) * attrEffects[percentKey].value;
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
    const attributes = Object.keys(ATTRIBUTES);
    const resistances = ['fireResistance', 'coldResistance', 'airResistance', 'earthResistance', 'lightningResistance', 'waterResistance'];

    for (const stat in STATS) {
      // Sum all sources for each stat
      flatValues[stat] =
        (this.primaryStats[stat] ?? 0) +
        (this.permaStats[stat] ?? 0) +
        (STATS[stat].base ?? 0) +
        (attributeEffects[stat] ?? 0) +
        (STATS[stat].levelUpBonus ?? 0) * (this.level - 1) +
        (trainingBonuses[stat] ?? 0) +
        (equipmentBonuses[stat] ?? 0) +
        (skillTreeBonuses[stat] ?? 0) +
        (attributes.includes(stat) ? this.permaStats['allAttributes'] : 0) +
        (resistances.includes(stat) ? this.permaStats['allResistance'] : 0);
    }

    return flatValues;
  }

  calculatePercentBonuses(attributeEffects, skillTreeBonuses, equipmentBonuses, trainingBonuses) {
    const percentBonuses = {};
    const attributes = Object.keys(ATTRIBUTES);
    // Add all standard percent bonuses
    for (const stat in STATS) {
      if (stat.endsWith('Percent')) {
        const statName = stat.replace('Percent', '');
        percentBonuses[stat] =
          (attributeEffects[stat] || 0) +
          (this.permaStats[stat] || 0) +
          (skillTreeBonuses[stat] || 0) / 100 +
          (equipmentBonuses[stat] || 0) / 100 +
          (trainingBonuses[stat] || 0) / 100 +
          (attributes.includes(statName) ? this.permaStats['allAttributesPercent'] : 0);
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

  applyFinalCalculations(flatValues, percentBonuses) {
    // Apply percent bonuses to all stats that have them

    for (const stat in STATS) {
      if (stat.endsWith('Percent')) {
        // add percent bonuses to stats, mainly for elemental damage
        let percentValue = percentBonuses[stat] || 0;
        // Add soul shop percent bonuses
        const soulShopBonuses = this.getSoulShopBonuses();
        if (soulShopBonuses[stat]) percentValue += soulShopBonuses[stat];
        this.stats[stat] = percentValue;
        percentBonuses[stat] = percentValue; // todo: this or above makes no sense, but keep it
      }
    }

    const elementalResistances = [
      'fireResistance',
      'coldResistance',
      'airResistance',
      'earthResistance',
      'lightningResistance',
      'waterResistance',
    ];

    for (const stat in STATS) {
      if (!stat.endsWith('Percent')) {
        let percent = percentBonuses[stat + 'Percent'] || 0;
        if (elementalResistances.includes(stat)) {
          percent += this.stats.allResistancePercent || 0;
        }

        // Use Math.floor for integer stats, Number.toFixed for decimals
        let value = flatValues[stat];
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
        if (stat ==='mana') {
          value += (this.stats.manaPerLevel || 0) * (this.level - 1);
        }

        // Apply soul shop bonuses (flat or percent)
        const soulShopBonuses = this.getSoulShopBonuses();
        if (stat.endsWith('Percent')) {
          value += soulShopBonuses[stat] || 0;
        } else if (soulShopBonuses[stat]) {
          value += soulShopBonuses[stat];
        }

        // Apply decimal places
        const decimals = STATS[stat].decimalPlaces ?? 0;
        value = decimals > 0 ? Number(value.toFixed(decimals)) : Math.floor(value);

        // reduce resistance based on region
        if (stat == 'allResistance') {
          const region = getCurrentRegion();
          if (region && region.resistanceReduction) {
            value = Number(value - region.resistanceReduction);
          }
        }

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

    this.stats.manaRegen += this.stats.manaRegenOfTotalPercent * this.stats.mana;
    this.stats.lifeRegen += this.stats.lifeRegenOfTotalPercent * this.stats.life;


    // Extra damage based on hero resources, split between physical and elemental
    const extraFromLife = (this.stats.extraDamageFromLifePercent || 0) * this.stats.life;
    const extraFromArmor = (this.stats.extraDamageFromArmorPercent || 0) * this.stats.armor;
    const extraFromMana = (this.stats.extraDamageFromManaPercent || 0) * this.stats.mana;
    const extraFromLifeRegen = (this.stats.extraDamageFromLifeRegenPercent || 0) * this.stats.lifeRegen;
    const extraFromEvasion = (this.stats.extraDamageFromEvasionPercent || 0) * this.stats.evasion;
    const extraFromAttackRating = (this.stats.extraDamageFromAttackRatingPercent || 0) * this.stats.attackRating;

    // Split: 50% to physical, 50% distributed equally among elements
    const elements = Object.keys(ELEMENTS);

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

    flatValues.elementalDamage += eleShareLife + eleShareMana + eleShareLifeRegen + eleShareArmor + eleShareEvasion + eleShareAttackRating;

    this.stats.damage = Math.floor((flatValues.damage + (this.stats.damagePerLevel || 0) * this.level) * (1 + this.stats.totalDamagePercent + this.stats.damagePercent));

    // Special handling for elemental damages
    this.stats.fireDamage = Math.floor(
      (flatValues.fireDamage + flatValues.elementalDamage) * (1 + this.stats.elementalDamagePercent + percentBonuses.fireDamagePercent + this.stats.totalDamagePercent),
    );
    this.stats.coldDamage = Math.floor(
      (flatValues.coldDamage + flatValues.elementalDamage) * (1 + this.stats.elementalDamagePercent + percentBonuses.coldDamagePercent + this.stats.totalDamagePercent),
    );
    this.stats.airDamage = Math.floor(
      (flatValues.airDamage + flatValues.elementalDamage) * (1 + this.stats.elementalDamagePercent + percentBonuses.airDamagePercent + this.stats.totalDamagePercent),
    );
    this.stats.earthDamage = Math.floor(
      (flatValues.earthDamage + flatValues.elementalDamage) * (1 + this.stats.elementalDamagePercent + percentBonuses.earthDamagePercent + this.stats.totalDamagePercent),
    );
    this.stats.lightningDamage = Math.floor(
      (flatValues.lightningDamage + flatValues.elementalDamage) * (1 + this.stats.elementalDamagePercent + percentBonuses.lightningDamagePercent + this.stats.totalDamagePercent),
    );
    this.stats.waterDamage = Math.floor(
      (flatValues.waterDamage + flatValues.elementalDamage) * (1 + this.stats.elementalDamagePercent + percentBonuses.waterDamagePercent + this.stats.totalDamagePercent),
    );

    this.stats.reflectFireDamage = (() => {
      const base = flatValues.fireDamage + flatValues.reflectFireDamage;
      return Math.floor(base * (1 + this.stats.elementalDamagePercent + percentBonuses.fireDamagePercent + this.stats.totalDamagePercent));
    })();
  }

  regenerate() {
    this.stats.currentLife = Math.min(this.stats.life, this.stats.currentLife + this.stats.lifeRegen / 10);
    this.stats.currentMana = Math.min(this.stats.mana, this.stats.currentMana + this.stats.manaRegen / 10);
    updatePlayerLife();
  }

  // calculated when hit is successful
  calculateTotalDamage(instantSkillBaseEffects = {}, toggleEffects = {}) {

    let physicalDamage = this.stats.damage + (instantSkillBaseEffects.damage || 0);
    let fireDamage = this.stats.fireDamage + (instantSkillBaseEffects.fireDamage || 0);
    let coldDamage = this.stats.coldDamage + (instantSkillBaseEffects.coldDamage || 0);
    let airDamage = this.stats.airDamage + (instantSkillBaseEffects.airDamage || 0);
    let earthDamage = this.stats.earthDamage + (instantSkillBaseEffects.earthDamage || 0);
    let lightningDamage = this.stats.lightningDamage + (instantSkillBaseEffects.lightningDamage || 0);
    let waterDamage = this.stats.waterDamage + (instantSkillBaseEffects.waterDamage || 0);

    const isCritical = Math.random() * 100 < (this.stats.critChance + (toggleEffects.critChance || 0));

    // Add flat bonuses from toggles if present
    if (toggleEffects.damage) physicalDamage += toggleEffects.damage;
    if (toggleEffects.fireDamage) fireDamage += toggleEffects.fireDamage;
    if (toggleEffects.coldDamage) coldDamage += toggleEffects.coldDamage;
    if (toggleEffects.airDamage) airDamage += toggleEffects.airDamage;
    if (toggleEffects.earthDamage) earthDamage += toggleEffects.earthDamage;
    if (toggleEffects.lightningDamage) lightningDamage += toggleEffects.lightningDamage;
    if (toggleEffects.waterDamage) waterDamage += toggleEffects.waterDamage;

    // apply percent bonuses from toggles and instant skill effects
    physicalDamage *= (1 + ((toggleEffects.damagePercent || 0) +
        (instantSkillBaseEffects.damagePercent || 0)) / 100);
    fireDamage *= (1 + ((toggleEffects.fireDamagePercent || 0) +
        (instantSkillBaseEffects.fireDamagePercent || 0) + (toggleEffects.elementalDamagePercent || 0)) / 100);
    coldDamage *= (1 + ((toggleEffects.coldDamagePercent || 0) +
        (instantSkillBaseEffects.coldDamagePercent || 0) + (toggleEffects.elementalDamagePercent || 0)) / 100);
    airDamage *= (1 + ((toggleEffects.airDamagePercent || 0) +
        (instantSkillBaseEffects.airDamagePercent || 0) + (toggleEffects.elementalDamagePercent || 0)) / 100);
    earthDamage *= (1 + ((toggleEffects.earthDamagePercent || 0) +
        (instantSkillBaseEffects.earthDamagePercent || 0) + (toggleEffects.elementalDamagePercent || 0)) / 100);
    lightningDamage *= (1 + ((toggleEffects.lightningDamagePercent || 0) +
        (instantSkillBaseEffects.lightningDamagePercent || 0) + (toggleEffects.elementalDamagePercent || 0)) / 100);
    waterDamage *= (1 + ((toggleEffects.waterDamagePercent || 0) +
        (instantSkillBaseEffects.waterDamagePercent || 0) + (toggleEffects.elementalDamagePercent || 0)) / 100);

    if (toggleEffects.doubleDamageChance) {
      const doubleDamageChance = Math.random() * 100;
      if (doubleDamageChance < toggleEffects.doubleDamageChance) {
        physicalDamage *= 2;
        fireDamage *= 2;
        coldDamage *= 2;
        airDamage *= 2;
        earthDamage *= 2;
        lightningDamage *= 2;
        waterDamage *= 2;
      }
    }

    if (isCritical) {
      physicalDamage *= this.stats.critDamage;
      fireDamage *= this.stats.critDamage;
      coldDamage *= this.stats.critDamage;
      airDamage *= this.stats.critDamage;
      earthDamage *= this.stats.critDamage;
      lightningDamage *= this.stats.critDamage;
      waterDamage *= this.stats.critDamage;
    }

    let totalDamage = physicalDamage + fireDamage + coldDamage + airDamage + earthDamage + lightningDamage + waterDamage;

    const breakdown = {
      physical: Math.floor(physicalDamage),
      fire: Math.floor(fireDamage),
      cold: Math.floor(coldDamage),
      air: Math.floor(airDamage),
      earth: Math.floor(earthDamage),
      lightning: Math.floor(lightningDamage),
      water: Math.floor(waterDamage),
    };

    console.debug('Damage Breakdown:', breakdown);

    return {
      damage: Math.floor(totalDamage),
      isCritical,
      breakdown,
    };
  }

  calculateDamageAgainst(enemy, instantSkillBaseEffects = {}, toggleEffects = {}) {
    console.debug(instantSkillBaseEffects, 'instantSkillBaseEffects');
    const result = this.calculateTotalDamage(instantSkillBaseEffects, toggleEffects);

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
      fire: breakdown.fire * (1 - calculateResistanceReduction(
        getEffectiveResistance.call(this,
          enemy.baseData.fireResistance,
          this.stats.firePenetration,
          this.stats.firePenetrationPercent,
        ),
        breakdown.fire,
      ) / 100),
      cold: breakdown.cold * (1 - calculateResistanceReduction(
        getEffectiveResistance.call(this,
          enemy.baseData.coldResistance,
          this.stats.coldPenetration,
          this.stats.coldPenetrationPercent,
        ),
        breakdown.cold,
      ) / 100),
      air: breakdown.air * (1 - calculateResistanceReduction(
        getEffectiveResistance.call(this,
          enemy.baseData.airResistance,
          this.stats.airPenetration,
          this.stats.airPenetrationPercent,
        ),
        breakdown.air,
      ) / 100),
      earth: breakdown.earth * (1 - calculateResistanceReduction(
        getEffectiveResistance.call(this,
          enemy.baseData.earthResistance,
          this.stats.earthPenetration,
          this.stats.earthPenetrationPercent,
        ),
        breakdown.earth,
      ) / 100),
      lightning: breakdown.lightning * (1 - calculateResistanceReduction(
        getEffectiveResistance.call(this,
          enemy.baseData.lightningResistance,
          this.stats.lightningPenetration,
          this.stats.lightningPenetrationPercent,
        ),
        breakdown.lightning,
      ) / 100),
      water: breakdown.water * (1 - calculateResistanceReduction(
        getEffectiveResistance.call(this,
          enemy.baseData.waterResistance,
          this.stats.waterPenetration,
          this.stats.waterPenetrationPercent,
        ),
        breakdown.water,
      ) / 100),
    };

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
