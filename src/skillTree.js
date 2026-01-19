import { handleSavedData } from './functions.js';
import { dataManager, game, hero, crystalShop, options, inventory } from './globals.js';
import { SKILLS_MAX_QTY } from './constants/limits.js';
import { CLASS_PATHS, SKILL_TREES } from './constants/skills.js';
import { getSpecialization } from './constants/specializations.js';
import { ELEMENTS, SKILL_MANA_SCALING_MAX_MULTIPLIER, SKILL_DAMAGE_SCALING_MAX_INSTANT, SKILL_DAMAGE_SCALING_MAX_TOGGLE, SKILL_EFFECT_SCALING_MAX_BUFF } from './constants/common.js';
import { calculateHitChance, createDamageNumber } from './combat.js';
import { battleLog } from './battleLog.js';
import { t } from './i18n.js';
import { floorSumBigInt } from './utils/bulkMath.js';
import { AILMENTS } from './constants/ailments.js';
import { getDivisor } from './constants/stats/stats.js';
import { showLifeWarning,
  showManaWarning,
  showToast,
  updateActionBar,
  updatePlayerLife,
  updateSkillTreeValues,
  initializeSkillTreeUI,
  updateTabIndicators } from './ui/ui.js';

export const SKILL_LEVEL_TIERS = [1, 10, 25, 60, 150, 400, 750, 1200, 2000, 3000, 5000];
export const DEFAULT_MAX_SKILL_LEVEL = Infinity;
export const SPECIALIZATION_POINT_INTERVAL = 50;
export const SPECIALIZATION_UNLOCK_LEVEL = 100;
export const SKILL_POINT_COST_PER_LEVEL = 1;

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
    this.manaScaling = 0;

    handleSavedData(savedData, this);
    // add methods for all skills from SKILL_TREES
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      this.skills[skillId] = {};
      // find skill in SKILL_TREES
      const skill = this.getSkill(skillId);

      if (!skill) {
        delete this.skills[skillId];
        return;
      }

      // Prevent saved serialized data from overwriting function-based properties
      // (e.g., synergy.calculateBonus functions are lost when serialized). Strip
      // out any `synergies` or other complex fields from saved data before merging.
      const { synergies: _discardedSynergies, ...sanitizedSkillData } = skillData || {};

      this.skills[skillId] = {
        ...skill,
        ...sanitizedSkillData,
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
          // Sanitize saved specialization skill data to avoid overriding function fields
          const { synergies: _discardedSpecSynergies, ...sanitizedSavedSkill } = savedSkill;
          this.specializationSkills[skillId] = {
            ...skillDef,
            ...sanitizedSavedSkill,
          };
        });
      }
    }

    // always empty at start
    this.activeBuffs = new Map();

    this.ensureTotalEarnedSkillPointsConsistency();
    this.updateSpecializationPoints();

    // Quick allocation quantity for skills (used by quick skill allocation UI)
    const initialQuickQty = options?.skillQuickQty || 1;
    this.quickQty = initialQuickQty === 'max' ? 'max' : Math.min(initialQuickQty, SKILLS_MAX_QTY);
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

    [
      pathBonuses,
      passiveBonuses,
      activeBuffEffects,
      toggleBonuses,
      specializationBonuses,
      specializationBaseBonuses,
    ].forEach((bonus) => {
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

      if (!skill) return;

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
      if (skill && skill.type() === 'toggle' && skillData.active && skillData.affordable) {
        const manaCost = this.getSkillManaCost(skill);
        const effects = this.getSkillEffect(skillId, skillData.level);
        Object.entries(effects).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
        if (manaCost) {
          if (hero.stats.convertManaToLifePercent >= 1) {
            bonuses.lifePerHit = (bonuses.lifePerHit || 0) - manaCost;
          } else {
            bonuses.manaPerHit = (bonuses.manaPerHit || 0) - manaCost;
          }
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

      if (!skill) return;

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
          if (hero.stats.convertManaToLifePercent >= 1) {
            bonuses.lifePerHit = (bonuses.lifePerHit || 0) - manaCost;
          } else {
            bonuses.manaPerHit = (bonuses.manaPerHit || 0) - manaCost;
          }
        }
      }
    });

    return bonuses;
  }

  updateToggleStates() {
    let changed = false;
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = this.getSkill(skillId);
      if (skill && skill.type() === 'toggle' && skillData.active) {
        const cost = this.getSkillManaCost(skill);
        const affordable =
          hero.stats.convertManaToLifePercent > 0
            ? hero.stats.currentLife + hero.stats.currentMana >= cost
            : hero.stats.currentMana >= cost;
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
    return { ...CLASS_PATHS[this.selectedPath?.name] };
  }

  getSkillsForPath(pathName) {
    return SKILL_TREES[pathName] || [];
  }

  getExclusiveSkillIds(skill) {
    const src = typeof skill?.exclusiveWith === 'function' ? skill.exclusiveWith() : skill?.exclusiveWith;
    if (!Array.isArray(src)) return [];
    return src.filter(Boolean);
  }

  isSkillVisible(skill) {
    if (!skill) return false;
    if (typeof skill.isVisible !== 'function') return true;
    try {
      return !!skill.isVisible();
    } catch {
      return true;
    }
  }

  isSkillUnlockBlocked(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) return true;
    const exclusiveIds = this.getExclusiveSkillIds(skill);
    if (exclusiveIds.length === 0) return false;
    return exclusiveIds.some((otherId) => (this.skills[otherId]?.level || 0) > 0);
  }

  shouldSkipExclusiveSkillInBulk(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) return true;
    const exclusiveIds = this.getExclusiveSkillIds(skill);
    if (exclusiveIds.length === 0) return false;
    const currentLevel = this.skills[skillId]?.level || 0;
    if (currentLevel > 0) return false;
    const anyChosen = exclusiveIds.some((otherId) => (this.skills[otherId]?.level || 0) > 0);
    return !anyChosen;
  }

  canUnlockSkill(skillId, showWarning = false) {
    if (!this.selectedPath) return false;

    const skill = this.getSkill(skillId);
    if (!skill) return false;

    if (!this.isSkillVisible(skill)) {
      return false;
    }

    if (this.isSkillUnlockBlocked(skillId)) {
      if (showWarning) {
        showToast(t('skillTree.shapeshiftExclusiveWarning'), 'warning');
      }
      return false;
    }

    const currentLevel = this.skills[skillId]?.level || 0;
    const cost = SKILL_POINT_COST_PER_LEVEL;
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

    // Flat cost per level
    return levels * SKILL_POINT_COST_PER_LEVEL;
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
    const totalEarned = Math.floor((hero?.level || 1) / SPECIALIZATION_POINT_INTERVAL);
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

    if (!this.isSkillVisible(skill) || this.isSkillUnlockBlocked(skillId)) {
      return 0;
    }

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
    const shouldAutoEnableToggle = isToggle && (currentLevel > 0 ? wasActive : true);
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

    this.autoCastSettings[skillId] = true;

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
      return {
        totalCost: 0, allocations: [], affordable: false,
      };
    }

    const skillDefinitions = SKILL_TREES[this.selectedPath?.name] || {};

    const entries = Object.keys(skillDefinitions)
      .map((skillId) => {
        const skill = this.getSkill(skillId);
        if (!skill) return null;
        if (!this.isSkillVisible(skill)) return null;
        if (this.isSkillUnlockBlocked(skillId)) return null;
        if (this.shouldSkipExclusiveSkillInBulk(skillId)) return null;
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
        return {
          skillId, currentLevel, levelsLeft, affectsActionBar,
        };
      })
      .filter(Boolean);

    if (entries.length === 0) {
      return {
        totalCost: 0, allocations: [], affordable: false,
      };
    }

    let totalCost = 0;
    const allocations = [];

    if (qtySetting === 'max') {
      const perChunk = Math.floor(this.skillPoints / entries.length);
      if (perChunk <= 0) {
        return {
          totalCost: 0, allocations: [], affordable: false,
        };
      }
      entries.forEach(({
        skillId, currentLevel, levelsLeft, affectsActionBar,
      }) => {
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
            allocations.push({
              skillId, qty: bestQty, cost, affectsActionBar,
            });
          }
        }
      });
    } else {
      const desiredRaw = Number(qtySetting);
      const desired = Number.isFinite(desiredRaw) ? Math.max(0, Math.min(desiredRaw, SKILLS_MAX_QTY)) : 0;
      if (desired <= 0) {
        return {
          totalCost: 0, allocations: [], affordable: false,
        };
      }
      entries.forEach(({
        skillId, currentLevel, levelsLeft, affectsActionBar,
      }) => {
        const qty = Math.min(desired, levelsLeft);
        if (qty <= 0) return;
        const cost = this.calculateSkillPointCost(currentLevel, qty);
        if (!Number.isFinite(cost) || cost <= 0) return;
        totalCost += cost;
        allocations.push({
          skillId, qty, cost, affectsActionBar,
        });
      });
    }

    const affordable = this.skillPoints >= totalCost && totalCost > 0;
    return {
      totalCost, allocations, affordable,
    };
  }

  bulkAllocateSkills(qtySetting) {
    const {
      totalCost, allocations, affordable,
    } = this.calculateBulkAllocation(qtySetting);
    if (allocations.length === 0) return 0;
    if (!affordable) {
      showToast(t('skillTree.notEnoughSkillPointsBulk'), 'error');
      return 0;
    }

    let requiresActionBarUpdate = false;
    allocations.forEach(({
      skillId, qty, affectsActionBar,
    }) => {
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
      return {
        totalCost: 0, allocations: [], affordable: false,
      };
    }

    const spec = getSpecialization(this.selectedPath.name, this.selectedSpecialization.id);
    if (!spec) return {
      totalCost: 0, allocations: [], affordable: false,
    };

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

        return {
          skillId, currentLevel, levelsLeft,
        };
      })
      .filter(Boolean);

    if (entries.length === 0) {
      return {
        totalCost: 0, allocations: [], affordable: false,
      };
    }

    let totalCost = 0;
    const allocations = [];

    if (qtySetting === 'max') {
      const perChunk = Math.floor(this.specializationPoints / entries.length);
      if (perChunk <= 0) {
        return {
          totalCost: 0, allocations: [], affordable: false,
        };
      }
      entries.forEach(({
        skillId, currentLevel, levelsLeft,
      }) => {
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
            allocations.push({
              skillId, qty: bestQty, cost,
            });
          }
        }
      });
    } else {
      const desiredRaw = Number(qtySetting);
      const desired = Number.isFinite(desiredRaw) ? Math.max(0, Math.min(desiredRaw, SKILLS_MAX_QTY)) : 0;
      if (desired <= 0) {
        return {
          totalCost: 0, allocations: [], affordable: false,
        };
      }
      entries.forEach(({
        skillId, currentLevel, levelsLeft,
      }) => {
        const qty = Math.min(desired, levelsLeft);
        if (qty <= 0) return;
        const cost = this.calculateSkillPointCost(currentLevel, qty);
        if (!Number.isFinite(cost) || cost <= 0) return;
        totalCost += cost;
        allocations.push({
          skillId, qty, cost,
        });
      });
    }

    const affordable = this.specializationPoints >= totalCost && totalCost > 0;
    return {
      totalCost, allocations, affordable,
    };
  }

  bulkAllocateSpecializationSkills(qtySetting) {
    const {
      totalCost, allocations, affordable,
    } = this.calculateSpecializationBulkAllocation(qtySetting);
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
    if (!skill) return;

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
    if (!this.selectedPath) return null;
    const skillDef = SKILL_TREES[this.selectedPath.name]?.[skillId];
    if (!skillDef) return null;

    const skillObj = {
      ...skillDef,
      ...this.skills[skillId],
    };
    return skillObj;
  }

  getSpecializationSkill(skillId) {
    if (!this.selectedPath || !this.selectedSpecialization) return null;
    const spec = getSpecialization(this.selectedPath.name, this.selectedSpecialization.id);
    if (!spec) return null;

    const specSkill = spec.skills[skillId];
    if (!specSkill) return null;

    const savedSkill = this.specializationSkills[skillId];

    return {
      ...specSkill,
      level: savedSkill?.level || 0,
    };
  }

  getSkillEffect(skillId, level = 0) {
    const skill = this.getSkill(skillId);
    if (!skill) return {};
    const baseEffects = skill.effect(level || skill.level || 0);

    // Apply Mana Scaling
    const scalingPercent = Number(this.manaScaling) || 0;
    if (scalingPercent > 0) {
      const type = skill.type();
      let mult = 1;
      let scaleAll = false;

      if (type === 'instant') {
        mult = 1 + (scalingPercent / 100) * (SKILL_DAMAGE_SCALING_MAX_INSTANT - 1);
      } else if (type === 'toggle') {
        mult = 1 + (scalingPercent / 100) * (SKILL_DAMAGE_SCALING_MAX_TOGGLE - 1);
      } else if (type === 'buff') {
        mult = 1 + (scalingPercent / 100) * (SKILL_EFFECT_SCALING_MAX_BUFF - 1);
        scaleAll = true;
      }

      if (mult > 1) {
        Object.keys(baseEffects).forEach((key) => {
          const val = baseEffects[key];
          const isStatBonus = val && val._isStatBonus;
          if (typeof val === 'number' || isStatBonus) {
            if (
              scaleAll ||
              key === 'damage' ||
              key.endsWith('Damage') ||
              key.endsWith('DamagePercent')
            ) {
              let effectiveMult = mult;
              if (key.endsWith('Percent')) {
                // Percentage bonuses only get 25% of the multiplier effectiveness
                effectiveMult = 1 + (mult - 1) * 0.25;
              }

              if (isStatBonus) {
                val.uncappedValue *= effectiveMult;
                val.value = Math.min(val.uncappedValue, val.max);
              } else {
                baseEffects[key] *= effectiveMult;
              }
            }
          }
        });
      }
    }

    let finalEffects;
    // Apply synergies if any
    if (skill.synergies) {
      finalEffects = this.applySkillSynergies(skill, baseEffects);
    } else {
      finalEffects = baseEffects;
    }

    // Unwrap any remaining wrapper objects
    const unwrappedEffects = { ...finalEffects };
    Object.keys(unwrappedEffects).forEach((stat) => {
      const val = unwrappedEffects[stat];
      if (val && val._isStatBonus) {
        unwrappedEffects[stat] = val.value;
      }
    });

    // Apply per-level stats for instant skills
    if (skill.type() === 'instant') {
      Object.keys(unwrappedEffects).forEach((key) => {
        if (key.endsWith('PerLevel')) {
          const value = unwrappedEffects[key];
          if (typeof value === 'number') {
            if (key.endsWith('PercentPerLevel')) {
              const stat = key.slice(0, -15);
              const target = `${stat}Percent`;
              unwrappedEffects[target] = (unwrappedEffects[target] || 0) + value * hero.level;
            } else {
              const stat = key.slice(0, -8);
              unwrappedEffects[stat] = (unwrappedEffects[stat] || 0) + value * hero.level;
            }
          }
        }
      });
    }

    return unwrappedEffects;
  }

  applySkillSynergies(skill, baseEffects) {
    if (!skill.synergies || !Array.isArray(skill.synergies)) {
      return baseEffects;
    }

    const modifiedEffects = { ...baseEffects };
    let totalSynergyBonus = 0;

    for (const synergy of skill.synergies) {
      const sourceSkillId = synergy.sourceSkillId;
      const sourceLevel = this.skills[sourceSkillId]?.level || 0;

      if (sourceLevel <= 0) continue;

      // Calculate synergy bonus percentage
      const synergyBonus = synergy.calculateBonus ?
        synergy.calculateBonus(sourceLevel) : 0;

      totalSynergyBonus += synergyBonus;

      // Add any additional effects from the synergy
      if (synergy.additionalEffects) {
        const additionalEffects = synergy.additionalEffects(sourceLevel);
        Object.entries(additionalEffects).forEach(([stat, value]) => {
          modifiedEffects[stat] = (modifiedEffects[stat] || 0) + value;
        });
      }
    }

    // Apply total synergy bonus as a percentage multiplier to all base effects
    if (totalSynergyBonus > 0) {
      const multiplier = 1 + (totalSynergyBonus / 100);
      Object.keys(baseEffects).forEach((stat) => {
        const val = baseEffects[stat];
        if (val && val._isStatBonus) {
          const potential = val.uncappedValue * multiplier;
          modifiedEffects[stat] = Math.min(potential, val.max);
        } else {
          modifiedEffects[stat] = val * multiplier;
        }
      });
    }

    // Unwrap objects to return simple numbers
    Object.keys(modifiedEffects).forEach((stat) => {
      const val = modifiedEffects[stat];
      if (val && val._isStatBonus) {
        modifiedEffects[stat] = val.value;
      }
    });

    return modifiedEffects;
  }

  getSpecializationSkillEffect(skillId, level = 0) {
    const skill = this.getSpecializationSkill(skillId);
    if (!skill) return {};
    return skill.effect(level || skill.level || 0);
  }

  // level is for getting the mana cost for a certain level
  getSkillManaCost(skill, level = 0) {
    let effectiveLevel = level || skill?.level || 0;
    if (!skill?.manaCost) return 0;

    let scalingMult = 1;
    const scalingPercent = Number(this.manaScaling) || 0;
    if (scalingPercent > 0 && skill.type() !== 'passive') {
      scalingMult = 1 + (scalingPercent / 100) * (SKILL_MANA_SCALING_MAX_MULTIPLIER - 1);
    }

    return Math.floor(
      (skill.manaCost(effectiveLevel) - skill.manaCost(effectiveLevel) * (hero.stats.manaCostReductionPercent || 0)) * scalingMult,
    );
  }

  getSkillCooldown(skill, level = 0) {
    let effectiveLevel = level || skill?.level || 0;
    if (!skill?.cooldown) return 0;
    const baseCooldown = skill.cooldown(effectiveLevel);
    const cap = hero.stats.cooldownReductionCapPercent || 0.8;
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
    return Math.floor(skill.duration(effectiveLevel) + skill.duration(effectiveLevel) * hero.stats.buffDurationPercent);
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
      const d = getDivisor('lifePercent');
      const percentAmount = maxLife * ((effects.lifePercent || 0) / d);
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
    const scaledLifePerHitFromStats = (hero.stats.lifePerHit || 0) * (1 + (hero.stats.lifePerHitPercent || 0));

    let manaCost = this.getSkillManaCost(skill);
    if (hero.stats.convertManaToLifePercent > 0 && manaCost > hero.stats.currentMana) {
      const remainingCost = manaCost - hero.stats.currentMana;
      baseEffects.life = (baseEffects.life || 0) - remainingCost;
      manaCost = hero.stats.currentMana;
    }

    if (skillId === 'bloodSacrifice') {
      const lifeCost = hero.stats.currentLife * 0.5;
      baseEffects.life = (baseEffects.life || 0) - lifeCost;
      const effectiveness = 1 + (hero.stats.bloodSacrificeEffectivenessPercent || 0);
      baseEffects.damage = (baseEffects.damage || 0) + lifeCost * effectiveness;
    }

    if (!isAutoCast && manaCost && hero.stats.currentMana < manaCost) {
      showManaWarning();
      return false;
    }

    const dealsDamageForCost = this.isDamageSkill(baseEffects);
    const totalLifePerHitEffect = (baseEffects.lifePerHit || 0) + scaledLifePerHitFromStats;
    const includePerHit =
      dealsDamageForCost && typeof totalLifePerHitEffect === 'number' && totalLifePerHitEffect !== 0;
    const lifeCostCheck = this.evaluateLifeCost(
      {
        ...baseEffects,
        ...(includePerHit ? { lifePerHit: totalLifePerHitEffect } : {}),
      },
      { includePerHit },
    );
    if (lifeCostCheck.hasCost && !lifeCostCheck.willSurvive) {
      if (!isAutoCast) {
        showLifeWarning();
      }
      return false;
    }

    if (skill.cooldownEndTime && skill.cooldownEndTime > Date.now()) return false;

    const manaPerHit = (hero.stats.manaPerHit || 0) * (1 + (hero.stats.manaPerHitPercent || 0));
    const skillTypeSource = skill?.skill_type ?? skill?.skillType;
    const resolvedSkillType = typeof skillTypeSource === 'function' ? skillTypeSource() : skillTypeSource;
    const skillType = (resolvedSkillType || 'attack').toLowerCase();
    const isSpell = skillType === 'spell';
    const dealsDamage = dealsDamageForCost;

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
      const d = getDivisor('lifePercent');
      game.healPlayer(hero.stats.life * ((baseEffects.lifePercent || 0) / d));
    }

    if (baseEffects.reduceEnemyDamagePercent) {
      const d = getDivisor('reduceEnemyDamagePercent');
      hero.stats.reduceEnemyDamagePercent += (baseEffects.reduceEnemyDamagePercent || 0) / d;
      game.currentEnemy.damage = game.currentEnemy.calculateDamage();
      // reset after calculation
      hero.stats.reduceEnemyDamagePercent -= (baseEffects.reduceEnemyDamagePercent || 0) / d;
    }

    const canHeal = !skillId.includes('bloodSacrifice');

    if (dealsDamage && didHit && damageResult) {
      let {
        damage, isCritical, breakdown,
      } = damageResult;

      const now = Date.now();
      const enemy = game.currentEnemy;
      const isFrozen = enemy?.frozenUntil && enemy.frozenUntil > now;

      if (isFrozen && hero.stats.extraDamageAgainstFrozenEnemies > 0) {
        const mult = 1 + hero.stats.extraDamageAgainstFrozenEnemies;
        damage *= mult;
        if (breakdown) {
          Object.keys(breakdown).forEach((k) => {
            breakdown[k] *= mult;
          });
        }
      }

      let didShatter = false;
      if (isFrozen && hero.stats.chanceToShatterEnemy > 0 && Math.random() < hero.stats.chanceToShatterEnemy) {
        didShatter = true;
        enemy.frozenUntil = 0;
        damage *= 3;
        if (breakdown) {
          Object.keys(breakdown).forEach((k) => {
            breakdown[k] *= 3;
          });
        }
      }

      const coldDealt = breakdown?.cold || 0;
      if (!didShatter && coldDealt > 0 && hero.stats.freezeChance > 0 && Math.random() < hero.stats.freezeChance) {
        const now = Date.now();
        enemy.frozenUntil = now + AILMENTS.freeze.duration;
        createDamageNumber({ text: 'FROZEN', color: '#ADD8E6' });
      }

      const isInstantSkill = skill.type() === 'instant';
      if (isInstantSkill && hero.stats.stunChance > 0 && Math.random() < hero.stats.stunChance) {
        enemy.stunnedUntil = now + AILMENTS.stun.duration;
        createDamageNumber({ text: 'STUNNED', color: 'var(--stun)' });
      }

      let lifeStealFraction = 0;
      let manaStealFraction = 0;
      let omniStealFraction = hero.stats.omniSteal || 0;

      if (isSpell) {
        const d = getDivisor('omniSteal');
        omniStealFraction += (baseEffects.omniSteal || 0) / d;
      } else {
        const lifeD = getDivisor('lifeSteal');
        const manaD = getDivisor('manaSteal');
        const omniD = getDivisor('omniSteal');
        lifeStealFraction += (hero.stats.lifeSteal || 0) + (baseEffects.lifeSteal || 0) / lifeD;
        manaStealFraction += (hero.stats.manaSteal || 0) + (baseEffects.manaSteal || 0) / manaD;
        omniStealFraction += (baseEffects.omniSteal || 0) / omniD;
      }

      if (lifeStealFraction && canHeal) {
        game.healPlayer(damage * lifeStealFraction);
      }

      if (manaStealFraction) {
        game.restoreMana(damage * manaStealFraction);
      }

      if (omniStealFraction && canHeal) {
        const omniStealAmount = damage * omniStealFraction;
        game.healPlayer(omniStealAmount);
        game.restoreMana(omniStealAmount);
      }

      if (totalLifePerHitEffect > 0 && canHeal) {
        game.healPlayer(totalLifePerHitEffect);
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

    // Negative life-per-hit should behave like manaPerHit costs (applies even on miss).
    if (totalLifePerHitEffect < 0) {
      game.healPlayer(totalLifePerHitEffect);
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
    let manaCost = this.getSkillManaCost(skill);
    let lifeCost = 0;
    if (hero.stats.convertManaToLifePercent > 0 && manaCost > hero.stats.currentMana) {
      lifeCost = manaCost - hero.stats.currentMana;
    }

    if (lifeCost > 0) {
      const lifeCostCheck = this.evaluateLifeCost({ life: -lifeCost });
      if (!lifeCostCheck.willSurvive) {
        if (!isAutoCast) {
          showLifeWarning();
        }
        return false;
      }
    } else if (!isAutoCast && hero.stats.currentMana < manaCost) {
      showManaWarning();
      return false;
    }

    // Check if skill is on cooldown
    if (skill.cooldownEndTime && skill.cooldownEndTime > Date.now()) return false;

    // Mutually-exclusive buff groups (e.g. shapeshift forms)
    const group =
      typeof skill.exclusiveBuffGroup === 'function' ? skill.exclusiveBuffGroup() : skill.exclusiveBuffGroup;
    if (group) {
      Array.from(this.activeBuffs.keys()).forEach((activeId) => {
        if (activeId === skillId) return;
        const activeSkill = this.getSkill(activeId);
        if (!activeSkill) return;
        const activeGroup =
          typeof activeSkill.exclusiveBuffGroup === 'function'
            ? activeSkill.exclusiveBuffGroup()
            : activeSkill.exclusiveBuffGroup;
        if (activeGroup === group) {
          this.deactivateSkill(activeId);
        }
      });
    }

    // Apply buff
    if (lifeCost > 0) {
      hero.stats.currentLife -= lifeCost;
      manaCost = hero.stats.currentMana;
      updatePlayerLife();
    }
    hero.stats.currentMana -= manaCost;
    this.updateToggleStates();
    const buffEndTime = Date.now() + this.getSkillDuration(skill);
    const cooldownEndTime = Date.now() + this.getSkillCooldown(skill);

    if (skill.type() === 'summon') {
      const summonStats = skill.summonStats(skill.level);
      const now = Date.now();

      // Keep the base attack speed so we can apply dynamic buffs/caps later.
      if (typeof summonStats.baseAttackSpeed !== 'number') {
        summonStats.baseAttackSpeed = summonStats.attackSpeed;
      }

      const summonAttackSpeedBonus = hero.stats.summonAttackSpeedBuffPercent || 0;
      const effectiveAttackSpeed = (summonStats.baseAttackSpeed || 1) * (1 + summonAttackSpeedBonus);

      const buffData = {
        endTime: now + this.getSkillDuration(skill),
        summonStats,
        nextAttackTime: now + 1000 / effectiveAttackSpeed,
        skillId,
        effects: {},
      };

      if (!this.activeBuffs.has(skillId)) {
        this.activeBuffs.set(skillId, []);
      }
      // For summons, we append to allow stacking
      this.activeBuffs.get(skillId).push(buffData);
    } else {
      // Store buff data
      // For regular buffs, we overwrite (refresh)
      this.activeBuffs.set(skillId, [{
        endTime: buffEndTime,
        effects: this.getSkillEffect(skillId, skill.level),
      }]);
    }

    // Set cooldown and active state
    this.skills[skillId].cooldownEndTime = cooldownEndTime;
    this.skills[skillId].active = true;

    // update enemy right away
    if (skill.effect(skill.level).reduceEnemyAttackSpeedPercent) {
      const d = getDivisor('reduceEnemyAttackSpeedPercent');
      hero.stats.reduceEnemyAttackSpeedPercent += (skill.effect(skill.level).reduceEnemyAttackSpeedPercent || 0) / d;
      if (game.currentEnemy) {
        game.currentEnemy.recalculateStats();
      }
    }
    if (skill.effect(skill.level).reduceEnemyDamagePercent) {
      const d = getDivisor('reduceEnemyDamagePercent');
      hero.stats.reduceEnemyDamagePercent += (skill.effect(skill.level).reduceEnemyDamagePercent || 0) / d;
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
    const buffMultiplier = 1 + (hero.stats.buffEffectivenessPercent || 0);
    const now = Date.now();

    this.activeBuffs.forEach((instances, skillId) => {
      // Filter out expired instances
      // If instances is not an array (legacy safety), wrap it
      const list = Array.isArray(instances) ? instances : [instances];

      const activeInstances = list.filter((inst) => inst.endTime > now);

      if (activeInstances.length === 0) {
        this.deactivateSkill(skillId);
        return;
      }

      // Update map if some expired but not all
      if (activeInstances.length < list.length) {
        this.activeBuffs.set(skillId, activeInstances);
      }

      const skill = this.getSkill(skillId);
      const isBuff = skill && skill.type() === 'buff';
      const multiplier = isBuff ? buffMultiplier : 1;

      activeInstances.forEach((buffData) => {
        Object.entries(buffData.effects).forEach(([stat, value]) => {
          effects[stat] = (effects[stat] || 0) + value * multiplier;
        });
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
    this.activeBuffs.forEach((instances, skillId) => {
      const list = Array.isArray(instances) ? instances : [instances];

      list.forEach((buffData) => {
        if (buffData.endTime <= now) return; // Ignore expired
        if (!buffData.summonStats) return;
        if (buffData.nextAttackTime <= now) {
          // Calculate summon damage as % of player's damage
          const canCrit = buffData?.summonStats?.canCrit || false || (hero.stats.summonsCanCrit || 0) > 0;
          const playerDamage = hero.calculateTotalDamage({}, { canCrit });
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
          const d = getDivisor('percentOfPlayerDamage');
          damage += playerDamage.damage * ((buffData.summonStats.percentOfPlayerDamage || 0) / d);

          if (skillId === 'animatedWeapons') {
            damage *= hero.stats.animatedWeaponsDamagePercent || 1;
          }
          if (skillId === 'shadowClone') {
            damage *= hero.stats.cloneDamagePercent || 1;
          }

          if (skillId === 'summonBats' && hero.stats.batsHealPercent) {
            game.healPlayer(damage * hero.stats.batsHealPercent);
          }

          if (buffData.summonStats.lifePerHit) {
            game.healPlayer(buffData.summonStats.lifePerHit);
          }
          if (buffData.summonStats.manaPerHit) {
            game.restoreMana(buffData.summonStats.manaPerHit);
          }

          const skill = this.getSkill(skillId);
          const summonName = typeof skill?.name === 'function' ? skill.name() : null;

          // Apply summon damage bonus (if any) after all damage components are combined.
          const summonDamageMultiplier = 1 + (hero.stats.summonDamageBuffPercent || 0);
          damage *= summonDamageMultiplier;

          game.damageEnemy(damage, canCrit ? playerDamage.isCritical : false, null, null, summonName);

          // Schedule next attack
          const baseAttackSpeed = buffData?.summonStats?.baseAttackSpeed || buffData?.summonStats?.attackSpeed || 1;
          const summonAttackSpeedBonus = hero.stats.summonAttackSpeedBuffPercent || 0;
          const effectiveAttackSpeed = baseAttackSpeed * (1 + summonAttackSpeedBonus);
          buffData.nextAttackTime = now + 1000 / effectiveAttackSpeed;
        }
      });
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
      gtag('event', 'skill_tree_reset', { event_category: 'SkillTree' });
    }
  }

  // --- Reset specialization ---
  resetSpecialization() {
    // Refund skill points from specialization skills
    // No need to calculate refund, just recalculate points
    this.selectedSpecialization = null;
    this.specializationSkills = {};
    this.updateSpecializationPoints();
    hero.recalculateFromAttributes();

    // Check for main skills that are no longer visible (e.g. specialized skills)
    let refundedPoints = 0;
    Object.keys(this.skills).forEach((skillId) => {
      const skill = this.getSkill(skillId);
      if (skill && !this.isSkillVisible(skill)) {
        // This skill is no longer visible, refund it
        const level = this.skills[skillId].level || 0;
        if (level > 0) {
          refundedPoints += this.calculateSkillPointCost(0, level);
        }
        delete this.skills[skillId];
        delete this.autoCastSettings[skillId]; // cleanup
        delete this.displaySettings[skillId]; // cleanup
      }
    });

    if (refundedPoints > 0) {
      this.addSkillPoints(refundedPoints);
      showToast(t('skillTree.specializationSkillsRefunded', { points: refundedPoints }), 'info');
    }

    inventory.validateEquipment();
    updateActionBar();
    updateSkillTreeValues();
    dataManager.saveGame();

    // Google Analytics event: specialization reset
    if (typeof gtag === 'function') {
      gtag('event', 'specialization_reset', { event_category: 'SkillTree' });
    }
  }

  // --- Select a specialization ---
  selectSpecialization(specializationId) {
    if (this.selectedSpecialization) return false;
    if (!this.selectedPath) return false;

    if (hero.level < SPECIALIZATION_UNLOCK_LEVEL) {
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

  setAutoCast(skillId, enabled) {
    this.autoCastSettings[skillId] = enabled;
    dataManager.saveGame();
  }

  isAutoCastEnabled(skillId) {
    return skillId in this.autoCastSettings ? !!this.autoCastSettings[skillId] : true;
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
          const cost = this.getSkillManaCost(skill);
          const affordable =
            hero.stats.convertManaToLifePercent > 0
              ? hero.stats.currentLife + hero.stats.currentMana >= cost
              : hero.stats.currentMana >= cost;
          if (affordable) {
            this.useInstantSkill(skillId, true);
          }
        }
      } else if (skill.type() === 'buff' || skill.type() === 'summon') {
        // Only cast if not active (unless it's a summon), not on cooldown, and enough mana
        const shouldCast = (!skillData.active || skill.type() === 'summon') &&
          (!skillData.cooldownEndTime || skillData.cooldownEndTime <= Date.now());

        if (shouldCast) {
          const cost = this.getSkillManaCost(skill);
          const affordable =
            hero.stats.convertManaToLifePercent > 0
              ? hero.stats.currentLife + hero.stats.currentMana >= cost
              : hero.stats.currentMana >= cost;
          if (affordable) {
            this.activateSkill(skillId, true);
          }
        }
      }
    });
  }
}
