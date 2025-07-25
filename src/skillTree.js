import { handleSavedData } from './functions.js';
import { dataManager, game, hero } from './globals.js';
import { CLASS_PATHS, SKILL_TREES } from './constants/skills.js';
import {
  showManaWarning,
  showToast,
  updateActionBar,
  updatePlayerLife,
  updateSkillTreeValues,
  updateTabIndicators,
} from './ui/ui.js';

export const SKILL_LEVEL_TIERS = [1, 10, 25, 60, 150, 400, 750, 1200, 2000, 3000, 5000];
export const DEFAULT_MAX_SKILL_LEVEL = Infinity;

export default class SkillTree {
  constructor(savedData = null) {
    this.skillPoints = 0;
    this.selectedPath = null;
    this.skills = {};
    this.autoCastSettings = {};
    this.displaySettings = {};
    this.unlockedPaths = [];

    handleSavedData(savedData, this);
    // add methods for all skills from SKILL_TREES
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      this.skills[skillId] = {};
      // find skill in SKILL_TREES
      const skill = this.getSkill(skillId);

      this.skills[skillId] = {
        ...skill,
        ...skillData,
      };
    });
    // always empty at start
    this.activeBuffs = new Map();
  }

  getPathBonuses() {
    return CLASS_PATHS[this.selectedPath?.name]?.baseStats() || {};
  }

  getAllSkillTreeBonuses() {
    const pathBonuses = this.getPathBonuses();
    const passiveBonuses = this.calculatePassiveBonuses();
    const activeBuffEffects = this.getActiveBuffEffects();

    const allBonuses = {};

    // Combine path bonuses
    Object.entries(pathBonuses).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    // Combine passive bonuses
    Object.entries(passiveBonuses).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    // Combine active buff effects
    Object.entries(activeBuffEffects).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    return allBonuses;
  }

  calculatePassiveBonuses() {
    const bonuses = {};
    // Add skill bonuses
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = this.getSkill(skillId);

      if (!skill) {
        console.error('contact support. skill not found: ', skillId);
        return;
      }

      if (skill.type() === 'passive') {
        const effects = this.getSkillEffect(skillId, skillData.level);
        Object.entries(effects).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
      }
    });

    return bonuses;
  }

  isSkillActive(skillId) {
    const skill = this.getSkill(skillId);
    return skill && (skill.type() === 'toggle' || skill.type() === 'buff') && this.skills[skillId]?.active;
  }

  addSkillPoints(points) {
    this.skillPoints += points;
    updateSkillTreeValues();
  }

  selectPath(pathName) {
    if (this.selectedPath) return false;
    const pathData = CLASS_PATHS[pathName];
    if (!pathData || !pathData.enabled()) return false;
    const reqLevel = pathData.requiredLevel();
    if (hero.level < reqLevel) {
      showToast(`Requires Level ${reqLevel}`, 'warning');
      return false;
    }
    // Handle crystal cost and unlocking once
    const cost = pathData.crystalCost();
    const alreadyUnlocked = this.unlockedPaths.includes(pathName);
    if (!alreadyUnlocked) {
      if (hero.crystals < cost) {
        showToast(`Requires ${cost} Crystal${cost !== 1 ? 's' : ''}`, 'warning');
        return false;
      }
      hero.crystals -= cost;
      this.unlockedPaths.push(pathName);
    }
    this.selectedPath = { name: pathName };
    hero.recalculateFromAttributes();
    dataManager.saveGame();

    // Google Analytics event: class path chosen
    if (typeof gtag === 'function') {
      gtag('event', 'class_path_chosen', {
        event_category: 'SkillTree',
        event_label: pathName,
      });
    }
    return true;
  }

  getSelectedPath() {
    return {
      ...CLASS_PATHS[this.selectedPath?.name],
    };
  }

  getSkillsForPath(pathName) {
    return SKILL_TREES[pathName] || [];
  }

  canUnlockSkill(skillId, showWarning = false) {
    if (!this.selectedPath) return false;

    const skill = this.getSkill(skillId);
    if (!skill) return false;

    const currentLevel = this.skills[skillId]?.level || 0;
    const cost = 1 + Math.floor(currentLevel / 50);
    // Prevent leveling skill above hero level
    if (currentLevel >= hero.level) {
      if (showWarning) {
        showToast(`You cannot level up ${skill.name()} above your current level!`, 'warning');
      }
      return false;
    }
    return (
      this.skillPoints >= cost &&
      currentLevel < (skill.maxLevel() || DEFAULT_MAX_SKILL_LEVEL) &&
      hero.level >= skill.requiredLevel()
    );
  }

  arePrerequisitesMet(skill) {
    if (skill.row === 1) return true;

    return skill.prerequisites.some((preReqId) => {
      const preReqLevel = this.skills[preReqId]?.level || 0;
      return preReqLevel > 0;
    });
  }

  // Helper to calculate SP cost for buying qty levels from currentLevel
  calculateSkillPointCost(currentLevel, qty) {
    let cost = 0;
    let level = currentLevel;
    let remaining = qty;
    while (remaining > 0) {
      // Find how many levels until the next 50-level band
      const nextBand = 50 - (level % 50);
      const bandLevels = Math.min(remaining, nextBand);
      const bandCost = bandLevels * (1 + Math.floor(level / 50));
      cost += bandCost;
      level += bandLevels;
      remaining -= bandLevels;
    }
    return cost;
  }

  // Calculate max levels you can afford given SP and maxLevel
  calculateMaxPurchasable(skill) {
    let currentLevel = skill.level || 0;
    const maxLevel = skill.maxLevel() || DEFAULT_MAX_SKILL_LEVEL;
    let availableSP = this.skillPoints;
    let n = 0;
    let level = currentLevel;

    while (level < maxLevel && availableSP > 0) {
      const band = Math.floor(level / 50);
      const bandCost = 1 + band;
      // How many levels left in this band?
      const bandEnd = (band + 1) * 50;
      const levelsInBand = Math.min(bandEnd - level, maxLevel - level);
      // How many can we afford in this band?
      const affordable = Math.min(levelsInBand, Math.floor(availableSP / bandCost));
      if (affordable <= 0) break;
      n += affordable;
      level += affordable;
      availableSP -= affordable * bandCost;
    }
    return n;
  }

  /**
   * Unlocks exactly qty levels of a skill, if the player can afford the total cost.
   * Returns the number of levels actually unlocked (qty or 0).
   */
  unlockSkillBulk(skillId, count) {
    if (!this.selectedPath) return 0;

    const skill = this.getSkill(skillId);
    if (!skill) return 0;

    // Calculate max possible to buy
    let maxLevel = skill.maxLevel() || DEFAULT_MAX_SKILL_LEVEL;
    const maxQty = this.calculateMaxPurchasable(skill);
    const qty = count === Infinity ? maxQty : Math.min(count, maxQty);
    if (qty <= 0) return;

    let currentLevel = this.skills[skillId]?.level || 0;
    let wasActive = this.skills[skillId]?.active || false;

    // Clamp qty to not exceed maxLevel or hero.level
    const allowedQty = Math.max(0, Math.min(qty, maxLevel - currentLevel, hero.level - currentLevel));

    if (allowedQty <= 0) return 0;
    // Calculate total cost for allowedQty levels

    let totalCost = this.calculateSkillPointCost(currentLevel, allowedQty);

    if (this.skillPoints < totalCost) return 0;

    // Set new level and deduct points
    this.skills[skillId] = {
      ...skill,
      level: currentLevel + allowedQty,
      active: skill.type() === 'toggle' ? wasActive : false,
      slot: skill.type() !== 'passive' ? Object.keys(this.skills).length + 1 : null,
    };

    this.skillPoints -= totalCost;
    hero.recalculateFromAttributes();
    if (skill.type() !== 'passive') {
      updateActionBar();
    }
    updateSkillTreeValues();
    dataManager.saveGame();
    updateTabIndicators();
    return allowedQty;
  }

  toggleSkill(skillId) {
    if (!this.skills[skillId]) return;

    const skill = this.getSkill(skillId);

    // Handle different skill types
    switch (skill.type()) {
      case 'buff':
      case 'summon':
        this.activateSkill(skillId);
        break;
      case 'toggle':
        this.skills[skillId].active = !this.skills[skillId].active;
        hero.recalculateFromAttributes();
        break;
      case 'instant':
        this.useInstantSkill(skillId);
        break;
    }

    updateActionBar();
  }

  getSkill(skillId) {
    const skillObj = {
      ...SKILL_TREES[this.selectedPath?.name][skillId],
      ...this.skills[skillId],
    };
    return skillObj;
  }

  getSkillEffect(skillId, level = 0) {
    const skill = this.getSkill(skillId);
    return this.getSkill(skillId)?.effect(level || this.getSkill(skillId)?.level || 0);
  }

  // level is for getting the mana cost for a certain level
  getSkillManaCost(skill, level = 0) {
    let effectiveLevel = level || skill?.level || 0;
    if (!skill?.manaCost) return 0;
    return Math.floor(
      skill.manaCost(effectiveLevel) - (skill.manaCost(effectiveLevel) * hero.stats.manaCostReductionPercent) / 100,
    );
  }

  getSkillCooldown(skill, level = 0) {
    let effectiveLevel = level || skill?.level || 0;
    if (!skill?.cooldown) return 0;
    const baseCooldown = skill.cooldown(effectiveLevel);
    const abilityHaste = hero.stats.cooldownReductionPercent * 100;
    // Apply diminishing returns similar to League of Legends ability haste
    const reducedCooldown = baseCooldown * (100 / (100 + abilityHaste));
    // Prevent cooldown from dropping below 20% of the base cooldown
    const minCooldown = baseCooldown * 0.2;
    return Math.floor(Math.max(minCooldown, reducedCooldown));
  }

  getSkillDuration(skill, level = 0) {
    let effectiveLevel = level || skill?.level || 0;
    if (!skill?.duration) return 0;
    return Math.floor(
      skill.duration(effectiveLevel) + (skill.duration(effectiveLevel) * hero.stats.buffDurationPercent),
    );
  }

  useInstantSkill(skillId, isAutoCast = false) {
    if (!game.gameStarted) return false;
    // if there is no live enemy, don’t cast
    if (!game.currentEnemy || game.currentEnemy.currentLife <= 0) return false;

    const skill = this.getSkill(skillId);
    const baseEffects = this.getSkillEffect(skillId);

    if (!isAutoCast && hero.stats.currentMana < this.getSkillManaCost(skill)) {
      showManaWarning();
      return false;
    }

    if (skill.cooldownEndTime && skill.cooldownEndTime > Date.now()) return false;

    hero.stats.currentMana -= this.getSkillManaCost(skill);

    const { damage, isCritical } = hero.calculateDamageAgainst(game.currentEnemy, baseEffects);

    if (baseEffects.lifeSteal) {
      const lifeStealAmount = damage * (baseEffects.lifeSteal / 100);
      game.healPlayer(lifeStealAmount);
    }
    if (baseEffects.lifePerHit) {
      game.healPlayer(baseEffects.lifePerHit);
    }

    if (baseEffects.life) {
      game.healPlayer(baseEffects.life);
    }

    if (baseEffects.lifePercent) {
      game.healPlayer((hero.stats.life * baseEffects.lifePercent) / 100);
    }

    if (baseEffects.manaPerHit) {
      game.restoreMana(baseEffects.manaPerHit);
    }

    if (this.isDamageSkill(baseEffects)) {
      game.damageEnemy(damage, isCritical);
    }

    // Set cooldown
    this.skills[skill.id].cooldownEndTime = Date.now() + this.getSkillCooldown(skill);

    // Update UI
    updatePlayerLife();

    return true;
  }

  isDamageSkill(effects) {
    return (
      effects.damage ||
      effects.damagePercent ||
      effects.fireDamage ||
      effects.coldDamage ||
      effects.airDamage ||
      effects.earthDamage ||
      effects.lightningDamage ||
      effects.waterDamage ||
      effects.fireDamagePercent ||
      effects.coldDamagePercent ||
      effects.airDamagePercent ||
      effects.earthDamagePercent ||
      effects.lightningDamagePercent ||
      effects.waterDamagePercent
    );
  }
  applyToggleEffects(isHit = true) {
    if (!game.currentEnemy || game.currentEnemy.currentLife <= 0) return {};

    let effects = {};

    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = this.getSkill(skillId);
      if (skill.type() === 'toggle' && skillData.active) {
        if (hero.stats.currentMana >= this.getSkillManaCost(skill)) {
          hero.stats.currentMana -= this.getSkillManaCost(skill);
          effects = { ...effects, ...this.getSkillEffect(skillId, skillData.level) };

          if (isHit) {
            if (effects.lifePerHit) {
              game.healPlayer(effects.lifePerHit);
            }
            if (effects.manaPerHit) {
              game.restoreMana(effects.manaPerHit);
            }
          }
        } else {
          // showManaWarning();
          // Deactivate if not enough mana
          // skillData.active = false;
          // updateActionBar();
        }
      }
    });

    updateActionBar();

    return effects;
  }

  activateSkill(skillId, isAutoCast = false) {
    if (!game.gameStarted) return false;

    const skill = this.getSkill(skillId);

    if (skill.type() !== 'buff' && skill.type() !== 'summon') return false;
    if (!isAutoCast && hero.stats.currentMana < this.getSkillManaCost(skill)) {
      showManaWarning();
      return false;
    }

    // Check if skill is on cooldown
    if (skill.cooldownEndTime && skill.cooldownEndTime > Date.now()) return false;

    // Apply buff
    hero.stats.currentMana -= this.getSkillManaCost(skill);
    const buffEndTime = Date.now() + this.getSkillDuration(skill);
    const cooldownEndTime = Date.now() + this.getSkillCooldown(skill);



    if (skill.type() === 'summon') {
      const summonStats = skill.summonStats(skill.level);
      const now = Date.now();
      this.activeBuffs.set(skillId, {
        endTime: now + this.getSkillDuration(skill),
        summonStats,
        nextAttackTime: now + 1000 / summonStats.attackSpeed,
        skillId,
        effects: {},
      });
    } else {
      // Store buff data
      this.activeBuffs.set(skillId, {
        endTime: buffEndTime,
        effects: this.getSkillEffect(skillId, skill.level),
      });
    }

    // Set cooldown and active state
    this.skills[skillId].cooldownEndTime = cooldownEndTime;
    this.skills[skillId].active = true;

    // Apply buff effects
    hero.recalculateFromAttributes();
    updateActionBar();

    return true;
  }

  deactivateSkill(skillId) {
    if (this.activeBuffs.has(skillId)) {
      this.activeBuffs.delete(skillId);
      // Reset the active state when buff expires
      if (this.skills[skillId]) {
        this.skills[skillId].active = false;
      }
      hero.recalculateFromAttributes();
      updateActionBar(); // Update UI to reflect deactivated state
    }
  }

  getActiveBuffEffects() {
    const effects = {};

    this.activeBuffs.forEach((buffData, skillId) => {
      if (buffData.endTime <= Date.now()) {
        this.deactivateSkill(skillId);
        return;
      }

      Object.entries(buffData.effects).forEach(([stat, value]) => {
        effects[stat] = (effects[stat] || 0) + value;
      });
    });

    return effects;
  }

  stopAllBuffs() {
    this.activeBuffs.clear();
    Object.values(this.skills).forEach((skill) => {
      // Fix an abuse where player can start/stop game fast while casting skills.
      // if (skill.cooldownEndTime) {
      //   skill.cooldownEndTime = 0;
      // }
      if (skill.type() !== 'toggle') skill.active = false; // Reset active state except for toggles
    });
    hero.recalculateFromAttributes();
    updateActionBar(); // Update UI to reset all visual states
  }

  processSummons() {
    const now = Date.now();
    this.activeBuffs.forEach((buffData, skillId) => {
      if (!buffData.summonStats) return;
      if (buffData.nextAttackTime <= now) {
      // Calculate summon damage as % of player's damage
        const playerDamage = hero.calculateTotalDamage();
        let damage = playerDamage.damage * (buffData.summonStats.percentOfPlayerDamage / 100);
        damage += buffData.summonStats.damage || 0;
        damage += buffData.summonStats.fireDamage || 0;
        damage += buffData.summonStats.coldDamage || 0;
        damage += buffData.summonStats.airDamage || 0;
        damage += buffData.summonStats.earthDamage || 0;
        damage += buffData.summonStats.lightningDamage || 0;
        damage += buffData.summonStats.waterDamage || 0;

        if (buffData.summonStats.lifePerHit) {
          game.healPlayer(buffData.summonStats.lifePerHit);
        }
        if (buffData.summonStats.manaPerHit) {
          game.restoreMana(buffData.summonStats.manaPerHit);
        }

        game.damageEnemy(damage, false);
        // Schedule next attack
        buffData.nextAttackTime = now + 1000 / buffData.summonStats.attackSpeed;
      }
    });
  }

  // --- Add this method for resetting the skill tree ---
  resetSkillTree() {
    // Clear the skill tree UI container
    const container = document.getElementById('skill-tree-container');
    if (container) container.innerHTML = '';

    // Refund all skill points
    this.skillPoints = hero.level - 1 + hero.permaStats.skillPoints;
    this.selectedPath = null;
    this.skills = {};
    this.autoCastSettings = {};
    this.displaySettings = {};
    this.activeBuffs.clear();
    hero.recalculateFromAttributes();
    updateActionBar();
    updateSkillTreeValues();
    dataManager.saveGame();

    // Google Analytics event: skill tree reset
    if (typeof gtag === 'function') {
      gtag('event', 'skill_tree_reset', {
        event_category: 'SkillTree',
      });
    }
  }

  setAutoCast(skillId, enabled) {
    this.autoCastSettings[skillId] = enabled;
    dataManager.saveGame();
  }

  isAutoCastEnabled(skillId) {
    return !!this.autoCastSettings[skillId];
  }

  // --- Slot display settings (default ON) ---
  setDisplay(skillId, enabled) {
    this.displaySettings[skillId] = enabled;
    dataManager.saveGame();
  }

  isDisplayEnabled(skillId) {
    // Default ON unless explicitly disabled
    return skillId in this.displaySettings ? !!this.displaySettings[skillId] : true;
  }

  autoCastEligibleSkills() {
    if (!game.gameStarted) return;
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[this.selectedPath?.name]?.[skillId];
      if (!skill || !this.isAutoCastEnabled(skillId)) return;
      // Do not auto-cast skills hidden from display
      if (!this.isDisplayEnabled(skillId)) return;
      if (skill.type() === 'instant') {
        // Only cast if not on cooldown and enough mana
        if (!skillData.cooldownEndTime || skillData.cooldownEndTime <= Date.now()) {
          if (hero.stats.currentMana >= this.getSkillManaCost(skill)) {
            this.useInstantSkill(skillId, true);
          }
        }
      } else if (skill.type() === 'buff' || skill.type() === 'summon') {
        // Only cast if not active, not on cooldown, and enough mana
        if (!skillData.active && (!skillData.cooldownEndTime || skillData.cooldownEndTime <= Date.now())) {
          if (hero.stats.currentMana >= this.getSkillManaCost(skill)) {
            this.activateSkill(skillId, true);
          }
        }
      }
    });
  }
}
