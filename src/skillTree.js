import { handleSavedData } from './functions.js';
import { dataManager, game, hero, crystalShop, options, inventory } from './globals.js';
import { SKILLS_MAX_QTY } from './constants/limits.js';
import { CLASS_PATHS, SKILL_TREES } from './constants/skills.js';
import { getSpecialization } from './constants/specializations.js';
import { ELEMENTS } from './constants/common.js';
import { calculateHitChance, createDamageNumber } from './combat.js';
import { battleLog } from './battleLog.js';
import { t } from './i18n.js';
import { floorSumBigInt } from './utils/bulkMath.js';
import {
  showLifeWarning,
  showManaWarning,
  showToast,
  updateActionBar,
  updatePlayerLife,
  updateSkillTreeValues,
  initializeSkillTreeUI,
  updateTabIndicators,
} from './ui/ui.js';

export const SKILL_LEVEL_TIERS = [1, 10, 25, 60, 150, 400, 750, 1200, 2000, 3000, 5000];
export const DEFAULT_MAX_SKILL_LEVEL = Infinity;
export const SPECIALIZATION_POINT_INTERVAL = 100;

const ELEMENT_IDS = Object.keys(ELEMENTS);
export function getSpellDamageTypes(effects) {
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
    this.totalEarnedSkillPoints = 0;
    this.specializationPoints = 0;
    this.selectedPath = null;
    this.selectedSpecialization = null;
    this.skills = {};
    this.specializationSkills = {};
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

    // Ensure specialization skills are properly merged with definitions
    if (this.selectedPath && this.selectedSpecialization) {
      const spec = getSpecialization(this.selectedPath.name, this.selectedSpecialization.id);
      if (spec) {
        // Initialize any missing skills from the spec definition
        Object.entries(spec.skills).forEach(([skillId, skillDef]) => {
          const savedSkill = this.specializationSkills[skillId] || {};
          this.specializationSkills[skillId] = {
            ...skillDef,
            ...savedSkill,
          };
        });
      }
    }

    // always empty at start
    this.activeBuffs = new Map();

    this.ensureTotalEarnedSkillPointsConsistency();
    this.updateSpecializationPoints();

    // Quick allocation quantity for skills (used by quick skill allocation UI)
    this.quickQty = options.useNumericInputs
      ? Math.min(options.skillQuickQty || 1, SKILLS_MAX_QTY)
      : 1;
  }

  getPathBonuses() {
    return CLASS_PATHS[this.selectedPath?.name]?.baseStats() || {};
  }

  getSpecializationBaseBonuses() {
    if (!this.selectedPath || !this.selectedSpecialization) return {};
    const spec = getSpecialization(this.selectedPath.name, this.selectedSpecialization.id);
    return spec?.baseStats ? spec.baseStats() : {};
  }

  getAllSkillTreeBonuses() {
    const pathBonuses = this.getPathBonuses();
    const passiveBonuses = this.calculatePassiveBonuses();
    const activeBuffEffects = this.getActiveBuffEffects();
    const toggleBonuses = this.calculateToggleBonuses();
    const specializationBonuses = this.calculateSpecializationBonuses();
    const specializationBaseBonuses = this.getSpecializationBaseBonuses();

    const allBonuses = {};

    ;[pathBonuses, passiveBonuses, activeBuffEffects, toggleBonuses, specializationBonuses, specializationBaseBonuses].forEach((bonus) => {
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

  calculateSpecializationBonuses() {
    const bonuses = {};
    // Add specialization skill bonuses
    Object.entries(this.specializationSkills).forEach(([skillId, skillData]) => {
      const skill = this.getSpecializationSkill(skillId);

      if (!skill) {
        console.error('contact support. specialization skill not found: ', skillId);
        return;
      }

      if ((skillData.level || 0) <= 0) return;

      if (skill.type() === 'passive') {
        const effects = this.getSpecializationSkillEffect(skillId, skillData.level);
        Object.entries(effects).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
      }

      if (skill.type() === 'toggle' && skillData.active && skillData.affordable) {
        const manaCost = this.getSkillManaCost(skill);
        const effects = this.getSpecializationSkillEffect(skillId, skillData.level);
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
    if (!Number.isFinite(points) || points === 0) return;

    this.skillPoints += points;
    if (points > 0) {
      this.totalEarnedSkillPoints += points;
    }
    this.ensureTotalEarnedSkillPointsConsistency();
    this.updateSpecializationPoints();
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
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    const levels = Math.floor(qty);
    if (levels <= 0) return 0;

    const startLevel = Math.max(0, Math.floor(currentLevel));
    const qtyBig = BigInt(levels);
    const baseCost = qtyBig;
    const bandIncrements = floorSumBigInt(qtyBig, 50n, 1n, BigInt(startLevel));
    const totalCost = Number(baseCost + bandIncrements);
    return Number.isFinite(totalCost) ? totalCost : Infinity;
  }

  calculateTotalSpentSkillPoints() {
    return Object.values(this.skills).reduce((total, skillData) => {
      const level = skillData?.level || 0;
      if (level <= 0) return total;
      return total + this.calculateSkillPointCost(0, level);
    }, 0);
  }

  calculateTotalSpentSpecializationPoints() {
    return Object.values(this.specializationSkills).reduce((total, skillData) => {
      const level = skillData?.level || 0;
      if (level <= 0) return total;
      return total + this.calculateSkillPointCost(0, level);
    }, 0);
  }

  updateSpecializationPoints() {
    const totalEarned = Math.floor(hero.level / SPECIALIZATION_POINT_INTERVAL);
    const spent = this.calculateTotalSpentSpecializationPoints();
    this.specializationPoints = Math.max(0, totalEarned - spent);
  }

  ensureTotalEarnedSkillPointsConsistency() {
    const currentPoints = Number.isFinite(this.skillPoints) ? this.skillPoints : 0;
    const spentPoints = this.calculateTotalSpentSkillPoints();
    const minimumTotal = currentPoints + spentPoints;

    if (!Number.isFinite(this.totalEarnedSkillPoints) || this.totalEarnedSkillPoints < minimumTotal) {
      this.totalEarnedSkillPoints = minimumTotal;
    }
  }

  // Calculate max levels you can afford given SP and maxLevel
  calculateMaxPurchasable(skill, availablePoints = this.skillPoints) {
    const currentLevel = Math.max(0, skill.level || 0);
    const rawMaxLevel = skill.maxLevel() || DEFAULT_MAX_SKILL_LEVEL;
    const availableSP = Math.max(0, Math.floor(availablePoints));
    if (availableSP <= 0) return 0;

    const levelCap = Number.isFinite(rawMaxLevel) ? Math.max(0, rawMaxLevel - currentLevel) : SKILLS_MAX_QTY;
    const heroCap = Number.isFinite(hero.level) ? Math.max(0, hero.level - currentLevel) : SKILLS_MAX_QTY;
    let upperBound = Math.max(0, Math.min(levelCap, heroCap, SKILLS_MAX_QTY));

    if (upperBound <= 0) return 0;

    let low = 0;
    let high = upperBound;
    let best = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cost = this.calculateSkillPointCost(currentLevel, mid);
      if (!Number.isFinite(cost) || cost > availableSP) {
        high = mid - 1;
      } else {
        best = mid;
        low = mid + 1;
      }
    }
    return best;
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
    const newLevel = currentLevel + allowedQty;
    const isToggle = skill.type() === 'toggle';
    const shouldAutoEnableToggle =
      isToggle && (currentLevel > 0 ? wasActive : crystalShop.hasAutoSpellCastUpgrade());
    const isActive = isToggle ? shouldAutoEnableToggle : false;
    const isAffordable =
      isToggle && isActive ? hero.stats.currentMana >= this.getSkillManaCost(skill, newLevel) : false;

    this.skills[skillId] = {
      ...skill,
      level: newLevel,
      active: isActive,
      affordable: isToggle ? isAffordable : undefined,
      slot: skill.type() !== 'passive' ? Object.keys(this.skills).length + 1 : null,
    };

    if (!isToggle) {
      delete this.skills[skillId].affordable;
    }

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

    const skillDefinitions = SKILL_TREES[this.selectedPath?.name] || {};

    const entries = Object.keys(skillDefinitions)
      .map((skillId) => {
        const skill = this.getSkill(skillId);
        if (!skill) return null;
        const prerequisitesMet =
          !Array.isArray(skill.prerequisites) || skill.prerequisites.length === 0 || this.arePrerequisitesMet(skill);
        if (!prerequisitesMet) return null;
        const requiredLevel = typeof skill.requiredLevel === 'function' ? skill.requiredLevel() : 0;
        if (hero.level < requiredLevel) return null;
        const currentLevel = this.skills[skillId]?.level || 0;
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

  calculateSpecializationBulkAllocation(qtySetting) {
    if (!this.selectedSpecialization) {
      return { totalCost: 0, allocations: [], affordable: false };
    }

    const spec = getSpecialization(this.selectedPath.name, this.selectedSpecialization.id);
    if (!spec) return { totalCost: 0, allocations: [], affordable: false };

    const entries = Object.keys(spec.skills)
      .map((skillId) => {
        const skill = this.getSpecializationSkill(skillId);
        if (!skill) return null;

        const requiredLevel = typeof skill.requiredLevel === 'function' ? skill.requiredLevel() : 0;
        if (hero.level < requiredLevel) return null;

        const currentLevel = this.specializationSkills[skillId]?.level || 0;
        const rawMax = typeof skill.maxLevel === 'function' ? skill.maxLevel() : DEFAULT_MAX_SKILL_LEVEL;
        const maxLevel = Number.isFinite(rawMax) ? rawMax : DEFAULT_MAX_SKILL_LEVEL;
        const levelCap = Math.min(maxLevel, hero.level);
        const levelsLeft = Math.max(0, levelCap - currentLevel);

        if (levelsLeft <= 0) return null;

        return { skillId, currentLevel, levelsLeft };
      })
      .filter(Boolean);

    if (entries.length === 0) {
      return { totalCost: 0, allocations: [], affordable: false };
    }

    let totalCost = 0;
    const allocations = [];

    if (qtySetting === 'max') {
      const perChunk = Math.floor(this.specializationPoints / entries.length);
      if (perChunk <= 0) {
        return { totalCost: 0, allocations: [], affordable: false };
      }
      entries.forEach(({ skillId, currentLevel, levelsLeft }) => {
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
            allocations.push({ skillId, qty: bestQty, cost });
          }
        }
      });
    } else {
      const desiredRaw = Number(qtySetting);
      const desired = Number.isFinite(desiredRaw) ? Math.max(0, Math.min(desiredRaw, SKILLS_MAX_QTY)) : 0;
      if (desired <= 0) {
        return { totalCost: 0, allocations: [], affordable: false };
      }
      entries.forEach(({ skillId, currentLevel, levelsLeft }) => {
        const qty = Math.min(desired, levelsLeft);
        if (qty <= 0) return;
        const cost = this.calculateSkillPointCost(currentLevel, qty);
        if (!Number.isFinite(cost) || cost <= 0) return;
        totalCost += cost;
        allocations.push({ skillId, qty, cost });
      });
    }

    const affordable = this.specializationPoints >= totalCost && totalCost > 0;
    return { totalCost, allocations, affordable };
  }

  bulkAllocateSpecializationSkills(qtySetting) {
    const { totalCost, allocations, affordable } = this.calculateSpecializationBulkAllocation(qtySetting);
    if (allocations.length === 0) return 0;
    if (!affordable) {
      showToast(t('skillTree.notEnoughSkillPointsBulk'), 'error');
      return 0;
    }

    allocations.forEach(({ skillId, qty }) => {
      this.unlockSpecializationSkill(skillId, qty);
    });

    hero.queueRecalculateFromAttributes();
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

  getSpecializationSkill(skillId) {
    if (!this.selectedPath || !this.selectedSpecialization) return null;
    const spec = getSpecialization(this.selectedPath.name, this.selectedSpecialization.id);
    if (!spec) return null;
    const skillObj = {
      ...spec.skills[skillId],
      ...this.specializationSkills[skillId],
    };
    return skillObj;
  }

  getSkillEffect(skillId, level = 0) {
    const skill = this.getSkill(skillId);
    return this.getSkill(skillId)?.effect(level || this.getSkill(skillId)?.level || 0);
  }

  getSpecializationSkillEffect(skillId, level = 0) {
    const skill = this.getSpecializationSkill(skillId);
    return skill?.effect(level || skill?.level || 0);
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
    const cap = hero.stats.cooldownReductionCap || 0.8;
    const cooldownReduction = Math.min(hero.stats.cooldownReductionPercent, cap); // Max cap reduction
    // Apply direct percentage reduction
    const reducedCooldown = baseCooldown * (1 - cooldownReduction);
    // Prevent cooldown from dropping below (1 - cap) of the base cooldown
    const minCooldown = baseCooldown * (1 - cap);
    return Math.floor(Math.max(minCooldown, reducedCooldown));
  }

  getSkillDuration(skill, level = 0) {
    let effectiveLevel = level || skill?.level || 0;
    if (!skill?.duration) return 0;
    return Math.floor(
      skill.duration(effectiveLevel) + (skill.duration(effectiveLevel) * hero.stats.buffDurationPercent),
    );
  }

  evaluateLifeCost(effects, { includePerHit = false } = {}) {
    if (!effects) {
      return { hasCost: false, willSurvive: true };
    }

    const maxLife = hero.stats.life;
    let projectedLife = hero.stats.currentLife;
    let hasCost = false;

    const applyChange = (change) => {
      if (!change) return true;
      if (change < 0) {
        hasCost = true;
        projectedLife += change;
      } else {
        projectedLife += change;
        projectedLife = Math.min(projectedLife, maxLife);
      }
      return projectedLife > 0;
    };

    if (!applyChange(effects.life || 0)) {
      return { hasCost, willSurvive: false };
    }

    if (effects.lifePercent) {
      const percentAmount = (maxLife * effects.lifePercent) / 100;
      if (!applyChange(percentAmount)) {
        return { hasCost, willSurvive: false };
      }
      if (percentAmount < 0) {
        hasCost = true;
      }
    }

    if (includePerHit && effects.lifePerHit) {
      if (effects.lifePerHit < 0) {
        hasCost = true;
      }
      if (!applyChange(effects.lifePerHit)) {
        return { hasCost, willSurvive: false };
      }
    }

    return { hasCost, willSurvive: true };
  }

  useInstantSkill(skillId, isAutoCast = false) {
    if (!game.gameStarted) return false;
    // if there is no live enemy, don’t cast
    if (!game.currentEnemy || game.currentEnemy.currentLife <= 0) return false;

    const skill = this.getSkill(skillId);
    const baseEffects = { ...this.getSkillEffect(skillId) };
    const manaCost = this.getSkillManaCost(skill);

    if (skillId === 'bloodSacrifice') {
      const lifeCost = hero.stats.currentLife * 0.5;
      baseEffects.life = (baseEffects.life || 0) - lifeCost;
      const effectiveness = 1 + (hero.stats.bloodSacrificeEffectiveness || 0) / 100;
      baseEffects.damage = (baseEffects.damage || 0) + (lifeCost * effectiveness);
    };


    if (!isAutoCast && hero.stats.currentMana < manaCost) {
      showManaWarning();
      return false;
    }

    const includePerHit =
      this.isDamageSkill(baseEffects) && typeof baseEffects.lifePerHit === 'number' && baseEffects.lifePerHit !== 0;
    const lifeCostCheck = this.evaluateLifeCost(baseEffects, { includePerHit });
    if (lifeCostCheck.hasCost && !lifeCostCheck.willSurvive) {
      if (!isAutoCast) {
        showLifeWarning();
      }
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

    const canHeal = !skillId.includes('bloodSacrifice');

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

      if (lifeStealPercent && canHeal) {
        game.healPlayer(damage * (lifeStealPercent / 100));
      }

      if (manaStealPercent) {
        game.restoreMana(damage * (manaStealPercent / 100));
      }

      if (omniStealPercent && canHeal) {
        const omniStealAmount = damage * (omniStealPercent / 100);
        game.healPlayer(omniStealAmount);
        game.restoreMana(omniStealAmount);
      }

      if (baseEffects.lifePerHit && canHeal) {
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
        const playerDamage = hero.calculateTotalDamage({}, { canCrit: buffData?.summonStats?.canCrit || false });
        let damage = 0;
        damage += buffData.summonStats.damage || 0;
        damage += buffData.summonStats.fireDamage || 0;
        damage += buffData.summonStats.coldDamage || 0;
        damage += buffData.summonStats.airDamage || 0;
        damage += buffData.summonStats.earthDamage || 0;
        damage += buffData.summonStats.lightningDamage || 0;
        damage += buffData.summonStats.waterDamage || 0;

        if (playerDamage.isCritical) {
          damage *= hero.stats.critDamage;
        }

        // in the % damage, the crit damage is already factored in
        damage += playerDamage.damage * (buffData.summonStats.percentOfPlayerDamage / 100);

        if (skillId === 'animatedWeapons') {
          damage *= (hero.stats.animatedWeaponsDamagePercent) || 1;
        }
        if (skillId === 'shadowClone') {
          damage *= (hero.stats.cloneDamagePercent) || 1;
        }

        if (skillId === 'summonBats' && hero.stats.batsHealPercent) {
          game.healPlayer(damage * (hero.stats.batsHealPercent));
        }

        if (buffData.summonStats.lifePerHit) {
          game.healPlayer(buffData.summonStats.lifePerHit);
        }
        if (buffData.summonStats.manaPerHit) {
          game.restoreMana(buffData.summonStats.manaPerHit);
        }

        const skill = this.getSkill(skillId);
        const summonName = typeof skill?.name === 'function' ? skill.name() : null;

        const canCrit = buffData.summonStats.canCrit;
        game.damageEnemy(damage, canCrit ? playerDamage.isCritical : false, null, null, summonName);

        // Schedule next attack
        buffData.nextAttackTime = now + 1000 / buffData.summonStats.attackSpeed;
      }
    });
  }

  // --- Add this method for resetting the skill tree ---
  resetSkillTree() {
    // First, ensure any specialization is reset and points refunded
    if (this.selectedSpecialization) {
      this.resetSpecialization();
    }

    // Refund all skill points
    this.skillPoints = this.totalEarnedSkillPoints;
    this.selectedPath = null;
    this.skills = {};
    this.autoCastSettings = {};
    this.displaySettings = {};
    this.activeBuffs.clear();
    this.ensureTotalEarnedSkillPointsConsistency();
    hero.queueRecalculateFromAttributes();
    initializeSkillTreeUI();
    dataManager.saveGame();

    // Google Analytics event: skill tree reset
    if (typeof gtag === 'function') {
      gtag('event', 'skill_tree_reset', {
        event_category: 'SkillTree',
      });
    }
  }

  // --- Reset specialization ---
  resetSpecialization() {
    // Refund skill points from specialization skills
    // No need to calculate refund, just recalculate points
    this.selectedSpecialization = null;
    this.specializationSkills = {};
    this.updateSpecializationPoints();
    hero.queueRecalculateFromAttributes();
    inventory.validateEquipment();
    updateActionBar();
    updateSkillTreeValues();
    dataManager.saveGame();

    // Google Analytics event: specialization reset
    if (typeof gtag === 'function') {
      gtag('event', 'specialization_reset', {
        event_category: 'SkillTree',
      });
    }
  }

  // --- Select a specialization ---
  selectSpecialization(specializationId) {
    if (this.selectedSpecialization) return false;
    if (!this.selectedPath) return false;

    if (hero.level < 1000) {
      showToast(t('skillTree.specializationLevelReq'), 'error');
      return false;
    }

    this.selectedSpecialization = { id: specializationId };

    // Initialize specialization skills
    const spec = getSpecialization(this.selectedPath.name, specializationId);
    if (spec) {
      this.specializationSkills = {};
      Object.entries(spec.skills).forEach(([skillId, skillDef]) => {
        this.specializationSkills[skillId] = {
          ...skillDef,
          level: 0,
        };
      });
    }

    hero.queueRecalculateFromAttributes();
    dataManager.saveGame();

    // Google Analytics event: specialization chosen
    if (typeof gtag === 'function') {
      gtag('event', 'specialization_chosen', {
        event_category: 'SkillTree',
        event_label: specializationId,
      });
    }
    return true;
  }

  canUnlockSpecializationSkill(skillId, showWarning = false) {
    if (!this.selectedSpecialization) return false;

    const skill = this.getSpecializationSkill(skillId);
    if (!skill) return false;

    const currentLevel = this.specializationSkills[skillId]?.level || 0;

    // Prevent leveling skill above hero level
    if (currentLevel >= hero.level) {
      if (showWarning) {
        showToast(tp('skillTree.cannotLevelAbove', { skill: skill.name() }), 'warning');
      }
      return false;
    }

    const hasPoints = this.specializationPoints >= this.calculateSkillPointCost(currentLevel, 1);
    const notMaxed = currentLevel < (skill.maxLevel() || DEFAULT_MAX_SKILL_LEVEL);
    const levelReqMet = hero.level >= skill.requiredLevel();

    return hasPoints && notMaxed && levelReqMet;
  }

  unlockSpecializationSkill(skillId, count) {
    if (!this.selectedSpecialization) return 0;

    const skill = this.getSpecializationSkill(skillId);
    if (!skill) return 0;

    // Calculate max possible to buy
    let maxLevel = skill.maxLevel() || DEFAULT_MAX_SKILL_LEVEL;
    const maxQty = this.calculateMaxPurchasable(skill, this.specializationPoints);
    const qty = count === Infinity ? maxQty : Math.min(count, maxQty);
    if (qty <= 0) return 0;

    let currentLevel = this.specializationSkills[skillId]?.level || 0;

    // Clamp qty to not exceed maxLevel or hero.level
    const allowedQty = Math.max(0, Math.min(qty, maxLevel - currentLevel, hero.level - currentLevel));

    if (allowedQty <= 0) return 0;

    let totalCost = this.calculateSkillPointCost(currentLevel, allowedQty);

    if (this.specializationPoints < totalCost) return 0;

    // Set new level
    const newLevel = currentLevel + allowedQty;

    this.specializationSkills[skillId] = {
      ...this.specializationSkills[skillId],
      level: newLevel,
    };

    this.updateSpecializationPoints();

    hero.queueRecalculateFromAttributes();
    updateSkillTreeValues();
    dataManager.saveGame();
    updateTabIndicators();

    return allowedQty;
  }

  enableAutoCastForAllSkills() {
    let togglesActivated = false;

    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      this.autoCastSettings[skillId] = true;

      if (typeof skillData.type === 'function' && skillData.type() === 'toggle') {
        if (!skillData.active) {
          skillData.active = true;
          togglesActivated = true;
        }

        const manaCost = this.getSkillManaCost(skillData, skillData.level);
        skillData.affordable = hero.stats.currentMana >= manaCost;
      }
    });

    if (togglesActivated) {
      hero.queueRecalculateFromAttributes();
      updateActionBar();
    }

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
