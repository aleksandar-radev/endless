import { initializeSkillTreeStructure, updatePlayerLife, updateTabIndicators } from './ui/ui.js';
import { game, inventory, training, skillTree, statistics, soulShop, dataManager } from './globals.js';
import { createCombatText, createDamageNumber } from './combat.js';
import { handleSavedData } from './functions.js';
import { getCurrentRegion, updateRegionUI } from './region.js';
import { STATS } from './constants/stats/stats.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ATTRIBUTES } from './constants/stats/attributes.js';
import { ELEMENT_OPPOSITES } from './constants/enemies.js';
import { SOUL_UPGRADE_CONFIG } from './soulShop.js';

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
    this.highestStage = 1;
    this.bossLevel = 1;

    this.primaryStats = {
      strength: 0,
      agility: 0,
      vitality: 0,
      wisdom: 0,
      endurance: 0,
      dexterity: 0,
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
    // Original: starts at 66, increases by 84 per level up
    return 66 + 84 * (this.level - 1);
  }

  gainExp(amount) {
    this.exp += amount;
    while (this.exp >= this.getExpToNextLevel()) {
      const xpOverflow = this.exp - this.getExpToNextLevel();
      this.levelUp(1);
      this.exp = xpOverflow; // Carry over excess experience to next level
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

    skillTree.addSkillPoints(levels); // Add 1 skill point per level

    this.recalculateFromAttributes();
    createCombatText(`LEVEL UP! (${this.level})`);
    updatePlayerLife();
    updateStatsAndAttributesUI();
    initializeSkillTreeStructure();
    dataManager.saveGame();
    updateRegionUI();
    updateTabIndicators();
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

    // 1) Build primary (flat) stats
    this.calculatePrimaryStats(skillTreeBonuses, equipmentBonuses, trainingBonuses);

    // 2) Get base flatValues & percentBonuses WITHOUT any attributeEffects
    const baseFlat = this.calculateFlatValues(
      /* attributeEffects */ {},
      skillTreeBonuses,
      equipmentBonuses,
      trainingBonuses
    );
    const basePercent = this.calculatePercentBonuses(
      /* attributeEffects */ {},
      skillTreeBonuses,
      equipmentBonuses,
      trainingBonuses
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
      trainingBonuses
    );
    this.applyFinalCalculations(flatValues, percentBonuses);

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
        (skillTreeBonuses[stat] ?? 0);
    }

    return flatValues;
  }

  calculatePercentBonuses(attributeEffects, skillTreeBonuses, equipmentBonuses, trainingBonuses) {
    const percentBonuses = {};
    // Add all standard percent bonuses
    for (const stat in STATS) {
      if (stat.endsWith('Percent')) {
        percentBonuses[stat] =
          (attributeEffects[stat] || 0) +
          (this.permaStats[stat] || 0) / 100 +
          (skillTreeBonuses[stat] || 0) / 100 +
          (equipmentBonuses[stat] || 0) / 100 +
          (trainingBonuses[stat] || 0) / 100;
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

    for (const stat in STATS) {
      if (!stat.endsWith('Percent')) {
        let percent = percentBonuses[stat + 'Percent'] || 0;

        // Use Math.floor for integer stats, Number.toFixed for decimals
        let value = flatValues[stat];
        if (percent) value *= 1 + percent;

        // Diminishing returns for attackSpeed
        if (stat === 'attackSpeed') {
          const flatAttackSpeedBonus = flatValues.attackSpeed - STATS.attackSpeed.base;
          const maxBonus = 3;
          const scale = 7;
          value =
            STATS.attackSpeed.base +
            (flatAttackSpeedBonus > 0 ? maxBonus * (1 - Math.exp(-flatAttackSpeedBonus / scale)) : 0);
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

        // Apply caps
        if (stat === 'blockChance') value = Math.min(value, 75);
        if (stat === 'critChance') value = Math.min(value, 100);
        if (stat === 'attackSpeed') value = Math.min(value, 5);
        if (stat === 'resurrectionChance') value = Math.min(value, 50);
        if (stat === 'extraMaterialDropMax') value = Math.max(value, 1); // Always at least 1

        this.stats[stat] = value;
      }
    }
    // Special handling for elemental damages
    this.stats.fireDamage = Math.floor(
      flatValues.fireDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.fireDamagePercent)
    );
    this.stats.coldDamage = Math.floor(
      flatValues.coldDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.coldDamagePercent)
    );
    this.stats.airDamage = Math.floor(
      flatValues.airDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.airDamagePercent)
    );
    this.stats.earthDamage = Math.floor(
      flatValues.earthDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.earthDamagePercent)
    );
    this.stats.reflectFireDamage = (() => {
      const base = flatValues.fireDamage + flatValues.reflectFireDamage;
      return Math.floor(base * (1 + this.stats.elementalDamagePercent + percentBonuses.fireDamagePercent));
    })();
  }

  calculateArmorReduction() {
    let scalingFactor;

    if (game.currentRegion === 'arena') {
      scalingFactor = this.bossLevel * 15 || 15;
    } else {
      scalingFactor = game.stage * getCurrentRegion().armorReductionMultiplier;
    }

    const scale = 1 + (scalingFactor - 1) * 0.18;
    const reduction = (this.stats.armor / (this.stats.armor + 25 * scale)) * 100;
    return Math.min(reduction, 75); // Keep the 75% cap
  }

  calculateEvasionChance() {
    let scalingFactor;

    if (game.currentRegion === 'arena') {
      scalingFactor = this.bossLevel * 15 || 15;
    } else {
      scalingFactor = game.stage * getCurrentRegion().evasionReductionMultiplier;
    }

    const scale = 1 + (scalingFactor - 1) * 0.18;
    const reduction = (this.stats.evasion / (this.stats.evasion + 25 * scale)) * 100;
    return Math.min(reduction, 75); // Keep the 75% cap
  }

  calculateHitChance() {
    let scalingFactor;

    if (game.fightMode === 'arena') {
      scalingFactor = this.bossLevel * 15 || 15;
    } else if (game.fightMode === 'explore') {
      scalingFactor = game.stage * getCurrentRegion().hitChanceMultiplier;
    }

    const scale = 1 + (scalingFactor - 1) * 0.25;
    const baseChance = (this.stats.attackRating / (this.stats.attackRating + 25 * scale)) * 100;
    return Math.min(Math.max(baseChance, 10), 100);
  }

  regenerate() {
    this.stats.currentLife = Math.min(this.stats.life, this.stats.currentLife + this.stats.lifeRegen / 10);
    this.stats.currentMana = Math.min(this.stats.mana, this.stats.currentMana + this.stats.manaRegen / 10);
    updatePlayerLife();
  }

  // calculated when hit is successful
  calculateTotalDamage(damageBonus = 0) {
    // Hit - existing damage calculation code
    const isCritical = Math.random() * 100 < this.stats.critChance;
    // Calculate physical damage
    let physicalDamage = this.stats.damage * (1 + this.stats.damagePercent / 100);

    // Calculate elemental damage with type effectiveness
    const enemyElement = game.currentEnemy.element;

    // Calculate total damage before crit
    let totalDamage = physicalDamage + damageBonus; // more dmg added later

    // Add toggle skill effects
    const toggleEffects = skillTree.applyToggleEffects();
    let elementalDamage = 0;

    // Calculate each element type
    const elements = {
      fire: this.stats.fireDamage,
      cold: this.stats.coldDamage,
      air: this.stats.airDamage,
      earth: this.stats.earthDamage,
    };

    // Add toggle elemental effects before the element calculations
    if (toggleEffects.fireDamage) elements.fire += toggleEffects.fireDamage;
    if (toggleEffects.coldDamage) elements.cold += toggleEffects.coldDamage;
    if (toggleEffects.airDamage) elements.air += toggleEffects.airDamage;
    if (toggleEffects.earthDamage) elements.earth += toggleEffects.earthDamage;

    Object.entries(elements).forEach(([elementType, damage]) => {
      if (damage > 0) {
        if (ELEMENT_OPPOSITES[elementType] === enemyElement) {
          // Double damage against opposite element
          elementalDamage += damage * 2;
        } else if (elementType === enemyElement) {
          // No damage against same element
          elementalDamage += 0;
        } else {
          // 25% damage against non-opposite elements
          elementalDamage += damage * 0.25;
        }
      }
    });

    totalDamage += elementalDamage;

    if (toggleEffects.damage) {
      totalDamage += toggleEffects.damage;
    }
    if (toggleEffects.lifePerHit) {
      game.healPlayer(toggleEffects.lifePerHit);
    }
    if (toggleEffects.manaPerHit) {
      game.restoreMana(toggleEffects.manaPerHit);
    }

    if (toggleEffects.doubleDamageChance) {
      const doubleDamageChance = Math.random() * 100;
      if (doubleDamageChance < toggleEffects.doubleDamageChance) {
        totalDamage *= 2;
      }
    }

    // Apply crit at the end to total damage
    return {
      damage: Math.floor(isCritical ? totalDamage * this.stats.critDamage : totalDamage),
      isCritical,
    };
  }

  calculateTotalThornsDamage(enemyDamage) {
    const damage = (this.stats.thornsDamage + enemyDamage) * (1 + this.stats.thornsDamagePercent / 100);
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
