import { handleSavedData } from './functions.js';
import { dataManager, game, hero, crystalShop, options } from './globals.js';
import { SKILLS_MAX_QTY } from './constants/limits.js';
import { CLASS_PATHS, SKILL_TREES } from './constants/skills.js';
import { ELEMENTS } from './constants/common.js';
import { calculateHitChance, createDamageNumber } from './combat.js';
import { battleLog } from './battleLog.js';
import { t } from './i18n.js';
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

const ELEMENT_IDS = Object.keys(ELEMENTS);
function getSpellDamageTypes(effects) {
  const types = new Set();
  if ('damage' in effects || 'damagePercent' in effects) {
    types.add('physical');
  }
  if ('elementalDamage' in effects || 'elementalDamagePercent' in effects) {
    ELEMENT_IDS.forEach((id) => types.add(id));
  }
  ELEMENT_IDS.forEach((id) => {
    if (`${id}Damage` in effects || `${id}DamagePercent` in effects) {
      types.add(id);
    }
  });
  return Array.from(types);
}

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
        affordable: true,
      };
    });
    // always empty at start
    this.activeBuffs = new Map();

    // Quick allocation quantity for skills (used by quick skill allocation UI)
    this.quickQty = options.useNumericInputs
      ? Math.min(options.skillQuickQty || 1, SKILLS_MAX_QTY)
      : 1;
  }

  getPathBonuses() {
    return CLASS_PATHS[this.selectedPath?.name]?.baseStats() || {};
  }

  getAllSkillTreeBonuses() {
    const pathBonuses = this.getPathBonuses();
    const passiveBonuses = this.calculatePassiveBonuses();
    const activeBuffEffects = this.getActiveBuffEffects();
    const toggleBonuses = this.calculateToggleBonuses();

    const allBonuses = {};

    ;[pathBonuses, passiveBonuses, activeBuffEffects, toggleBonuses].forEach((bonus) => {
      Object.entries(bonus).forEach(([stat, value]) => {
        allBonuses[stat] = (allBonuses[stat] || 0) + value;
      });
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

  calculateToggleBonuses() {
    const bonuses = {};
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = this.getSkill(skillId);
      if (skill.type() === 'toggle' && skillData.active && skillData.affordable) {
        const manaCost = this.getSkillManaCost(skill);
        const effects = this.getSkillEffect(skillId, skillData.level);
        Object.entries(effects).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
        if (manaCost) {
          bonuses.manaPerHit = (bonuses.manaPerHit || 0) - manaCost;
        }
      }
    });
    return bonuses;
  }

  updateToggleStates() {
    let changed = false;
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = this.getSkill(skillId);
      if (skill.type() === 'toggle' && skillData.active) {
        const affordable = hero.stats.currentMana >= this.getSkillManaCost(skill);
        if (skillData.affordable !== affordable) {
          skillData.affordable = affordable;
          changed = true;
        }
      }
    });
    if (changed) {
      hero.queueRecalculateFromAttributes();
    }
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
      showToast(tp('skillTree.requiresLevel', { level: reqLevel }), 'warning');
      return false;
    }
    // Handle crystal cost and unlocking once
    const cost = pathData.crystalCost();
    const alreadyUnlocked = this.unlockedPaths.includes(pathName);
    if (!alreadyUnlocked) {
      if (hero.crystals < cost) {
        const key = cost === 1 ? 'skillTree.requiresCrystal' : 'skillTree.requiresCrystals';
        showToast(tp(key, { count: cost }), 'warning');
        return false;
      }
      hero.crystals -= cost;
      this.unlockedPaths.push(pathName);
    }
    this.selectedPath = { name: pathName };
    hero.queueRecalculateFromAttributes();
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
        showToast(tp('skillTree.cannotLevelAbove', { skill: skill.name() }), 'warning');
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
  unlockSkillBulk(skillId, count, opts = {}) {
    if (!this.selectedPath) return 0;

    const skill = this.getSkill(skillId);
    if (!skill) return 0;

    const { skipUpdates = false } = opts;

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

    if (crystalShop.hasAutoSpellCastUpgrade()) {
      this.autoCastSettings[skillId] = true;
    }

    this.skillPoints -= totalCost;
    if (!skipUpdates) {
      hero.queueRecalculateFromAttributes();
      if (skill.type() !== 'passive') {
        updateActionBar();
      }
      updateSkillTreeValues();
      dataManager.saveGame();
      updateTabIndicators();
    }
    return allowedQty;
  }

  calculateBulkAllocation(qtySetting) {
    if (!this.selectedPath) {
      return { totalCost: 0, allocations: [], affordable: false };
    }

    const entries = Object.entries(this.skills || {})
      .map(([skillId, skillData]) => {
        const skill = this.getSkill(skillId);
        if (!skill) return null;
        const currentLevel = skillData?.level || 0;
        const rawMax = typeof skill.maxLevel === 'function' ? skill.maxLevel() : DEFAULT_MAX_SKILL_LEVEL;
        const maxLevel = Number.isFinite(rawMax) ? rawMax : DEFAULT_MAX_SKILL_LEVEL;
        const levelCap = Math.min(maxLevel, hero.level);
        const levelsLeft = Math.max(0, levelCap - currentLevel);
        if (levelsLeft <= 0) return null;
        const affectsActionBar = typeof skill.type === 'function' && skill.type() !== 'passive';
        return { skillId, currentLevel, levelsLeft, affectsActionBar };
      })
      .filter(Boolean);

    if (entries.length === 0) {
      return { totalCost: 0, allocations: [], affordable: false };
    }

    let totalCost = 0;
    const allocations = [];

    if (qtySetting === 'max') {
      const perChunk = Math.floor(this.skillPoints / entries.length);
      if (perChunk <= 0) {
        return { totalCost: 0, allocations: [], affordable: false };
      }
      entries.forEach(({ skillId, currentLevel, levelsLeft, affectsActionBar }) => {
        const cap = Math.min(levelsLeft, SKILLS_MAX_QTY);
        if (cap <= 0) return;
        let low = 0;
        let high = cap;
        let bestQty = 0;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const cost = this.calculateSkillPointCost(currentLevel, mid);
          if (cost <= perChunk) {
            bestQty = mid;
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        if (bestQty > 0) {
          const cost = this.calculateSkillPointCost(currentLevel, bestQty);
          if (Number.isFinite(cost) && cost > 0) {
            totalCost += cost;
            allocations.push({ skillId, qty: bestQty, cost, affectsActionBar });
          }
        }
      });
    } else {
      const desiredRaw = Number(qtySetting);
      const desired = Number.isFinite(desiredRaw) ? Math.max(0, Math.min(desiredRaw, SKILLS_MAX_QTY)) : 0;
      if (desired <= 0) {
        return { totalCost: 0, allocations: [], affordable: false };
      }
      entries.forEach(({ skillId, currentLevel, levelsLeft, affectsActionBar }) => {
        const qty = Math.min(desired, levelsLeft);
        if (qty <= 0) return;
        const cost = this.calculateSkillPointCost(currentLevel, qty);
        if (!Number.isFinite(cost) || cost <= 0) return;
        totalCost += cost;
        allocations.push({ skillId, qty, cost, affectsActionBar });
      });
    }

    const affordable = this.skillPoints >= totalCost && totalCost > 0;
    return { totalCost, allocations, affordable };
  }

  bulkAllocateSkills(qtySetting) {
    const { totalCost, allocations, affordable } = this.calculateBulkAllocation(qtySetting);
    if (allocations.length === 0) return 0;
    if (!affordable) {
      showToast(t('skillTree.notEnoughSkillPointsBulk'), 'error');
      return 0;
    }

    let requiresActionBarUpdate = false;
    allocations.forEach(({ skillId, qty, affectsActionBar }) => {
      if (affectsActionBar) requiresActionBarUpdate = true;
      this.unlockSkillBulk(skillId, qty, { skipUpdates: true });
    });

    hero.queueRecalculateFromAttributes();
    if (requiresActionBarUpdate) {
      updateActionBar();
    }
    updateSkillTreeValues();
    updateTabIndicators();
    dataManager.saveGame();
    showToast(t('skillTree.bulkAllocateSuccess'), 'success');
    return allocations.reduce((sum, { qty }) => sum + qty, 0);
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
        this.skills[skillId].affordable = this.skills[skillId].active
          ? hero.stats.currentMana >= this.getSkillManaCost(skill)
          : false;
        hero.queueRecalculateFromAttributes();
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
    const cooldownReduction = Math.min(hero.stats.cooldownReductionPercent, 0.8); // Max 80% reduction
    // Apply direct percentage reduction
    const reducedCooldown = baseCooldown * (1 - cooldownReduction);
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
    const baseEffects = { ...this.getSkillEffect(skillId) };
    const manaCost = this.getSkillManaCost(skill);

    if (!isAutoCast && hero.stats.currentMana < manaCost) {
      showManaWarning();
      return false;
    }

    if (skill.cooldownEndTime && skill.cooldownEndTime > Date.now()) return false;

    const manaPerHit = (hero.stats.manaPerHit || 0) * (1 + (hero.stats.manaPerHitPercent || 0) / 100);
    const skillTypeSource = skill?.skill_type ?? skill?.skillType;
    const resolvedSkillType =
      typeof skillTypeSource === 'function' ? skillTypeSource() : skillTypeSource;
    const skillType = (resolvedSkillType || 'attack').toLowerCase();
    const isSpell = skillType === 'spell';
    const dealsDamage = this.isDamageSkill(baseEffects);

    let damageEffects = baseEffects;
    if (dealsDamage && isSpell) {
      const allowedDamageTypes = getSpellDamageTypes(baseEffects);
      damageEffects = {
        ...baseEffects,
        ...(allowedDamageTypes.length ? { allowedDamageTypes } : {}),
      };
    }

    let didHit = true;
    let damageResult = null;

    if (dealsDamage) {
      if (!isSpell) {
        const alwaysEvade = game.currentEnemy.special?.includes('alwaysEvade');
        const hitChance = alwaysEvade
          ? 0
          : calculateHitChance(
            hero.stats.attackRating,
            game.currentEnemy.evasion,
            undefined,
            hero.stats.chanceToHitPercent || 0,
          );
        const roll = Math.random() * 100;
        const neverMiss = hero.stats.attackNeverMiss > 0 && !alwaysEvade;

        if (!neverMiss && (alwaysEvade || roll > hitChance)) {
          createDamageNumber({ text: 'MISS', color: '#888888' });
          battleLog.addBattle(t('battleLog.missedAttack'));
          didHit = false;
        }
      }
      if (didHit) {
        damageResult = hero.calculateDamageAgainst(game.currentEnemy, damageEffects);
      }
    }

    if (baseEffects.life) {
      game.healPlayer(baseEffects.life);
    }

    if (baseEffects.lifePercent) {
      game.healPlayer((hero.stats.life * baseEffects.lifePercent) / 100);
    }

    if (baseEffects.reduceEnemyDamagePercent) {
      hero.stats.reduceEnemyDamagePercent += baseEffects.reduceEnemyDamagePercent / 100;
      game.currentEnemy.damage = game.currentEnemy.calculateDamage();
      // reset after calculation
      hero.stats.reduceEnemyDamagePercent -= baseEffects.reduceEnemyDamagePercent / 100;
    }

    if (dealsDamage && didHit && damageResult) {
      const { damage, isCritical, breakdown } = damageResult;

      let lifeStealPercent = 0;
      let manaStealPercent = 0;
      let omniStealPercent = hero.stats.omniSteal || 0;

      if (isSpell) {
        omniStealPercent += baseEffects.omniSteal || 0;
      } else {
        lifeStealPercent += (hero.stats.lifeSteal || 0) + (baseEffects.lifeSteal || 0);
        manaStealPercent += (hero.stats.manaSteal || 0) + (baseEffects.manaSteal || 0);
        omniStealPercent += baseEffects.omniSteal || 0;
      }

      if (lifeStealPercent) {
        game.healPlayer(damage * (lifeStealPercent / 100));
      }

      if (manaStealPercent) {
        game.restoreMana(damage * (manaStealPercent / 100));
      }

      if (omniStealPercent) {
        const omniStealAmount = damage * (omniStealPercent / 100);
        game.healPlayer(omniStealAmount);
        game.restoreMana(omniStealAmount);
      }

      if (baseEffects.lifePerHit) {
        game.healPlayer(baseEffects.lifePerHit);
      }

      if (manaPerHit > 0) {
        game.restoreMana(manaPerHit);
      }

      if (baseEffects.manaPerHit) {
        game.restoreMana(baseEffects.manaPerHit);
      }

      game.damageEnemy(damage, isCritical, breakdown, skill.name());
    }

    hero.stats.currentMana -= manaCost;
    this.updateToggleStates();
    if (manaPerHit < 0) {
      game.restoreMana(manaPerHit);
    }

    // Set cooldown
    this.skills[skill.id].cooldownEndTime = Date.now() + this.getSkillCooldown(skill);

    // Update UI
    updatePlayerLife();
    updateActionBar();

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
      effects.waterDamagePercent ||
      effects.elementalDamage ||
      effects.elementalDamagePercent
    );
  }

  activateSkill(skillId, isAutoCast = false) {
    if (!game.gameStarted) return false;

    const skill = this.getSkill(skillId);

    if (skill.type() !== 'buff' && skill.type() !== 'summon') return false;
    const manaCost = this.getSkillManaCost(skill);
    if (!isAutoCast && hero.stats.currentMana < manaCost) {
      showManaWarning();
      return false;
    }

    // Check if skill is on cooldown
    if (skill.cooldownEndTime && skill.cooldownEndTime > Date.now()) return false;

    // Apply buff
    hero.stats.currentMana -= manaCost;
    this.updateToggleStates();
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

    // update enemy right away
    if (skill.effect(skill.level).reduceEnemyAttackSpeedPercent) {
      hero.stats.reduceEnemyAttackSpeedPercent += skill.effect(skill.level).reduceEnemyAttackSpeedPercent / 100;
      if (game.currentEnemy) {
        game.currentEnemy.recalculateStats();
      }
    }
    if (skill.effect(skill.level).reduceEnemyDamagePercent) {
      hero.stats.reduceEnemyDamagePercent += skill.effect(skill.level).reduceEnemyDamagePercent / 100;
      if (game.currentEnemy) {
        game.currentEnemy.recalculateStats();
      }
    }

    // Apply buff effects
    hero.queueRecalculateFromAttributes();
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
      hero.queueRecalculateFromAttributes();
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
    hero.queueRecalculateFromAttributes();
    updateActionBar(); // Update UI to reset all visual states
  }

  resetAllCooldowns() {
    Object.values(this.skills).forEach((skill) => {
      if (skill.cooldownEndTime) {
        skill.cooldownEndTime = 0;
      }
    });
    updateActionBar();
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

        const skill = this.getSkill(skillId);
        const summonName = typeof skill?.name === 'function' ? skill.name() : null;
        game.damageEnemy(damage, false, null, null, summonName);
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
    this.skillPoints = (hero.level - 1) * 1 + hero.permaStats.skillPoints;
    this.selectedPath = null;
    this.skills = {};
    this.autoCastSettings = {};
    this.displaySettings = {};
    this.activeBuffs.clear();
    hero.queueRecalculateFromAttributes();
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

  enableAutoCastForAllSkills() {
    Object.keys(this.skills).forEach((skillId) => {
      this.autoCastSettings[skillId] = true;
    });
    dataManager.saveGame();
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
