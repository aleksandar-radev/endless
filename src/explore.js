import { ALL_ITEM_TYPES } from './constants/items.js';
import { getCurrentRegion, getRegionEnemies } from './region.js';
import {
  ENEMY_RARITY,
  MOB_REGION_SCALING_MULTIPLIER,
  MOB_REWARD_STAGE_SCALING_PERCENT,
  MOB_STAGE_SCALING_PERCENT,
} from './constants/enemies.js';
import { createPercentScaleFunction, scaleStat, computeScaledReward, xpDiminishingFactor } from './common.js';
import { hero, options } from './globals.js';
import { battleLog } from './battleLog.js';
import { ELEMENTS, BASE_MATERIAL_DROP_CHANCE } from './constants/common.js';
import { t, tp } from './i18n.js';
import { formatNumber as formatNumberValue } from './utils/numberFormatter.js';
import EnemyBase from './enemyBase.js';

// Legacy scaling system (kept for backward compatibility)
const TIER_STAT_SCALE = {
  1: createPercentScaleFunction(0.65, 25, 0.025, 6),
  2: createPercentScaleFunction(0.6, 30, 0.02, 5.5),
  3: createPercentScaleFunction(0.55, 35, 0.015, 5),
  4: createPercentScaleFunction(0.5, 40, 0.01, 4.5),
  5: createPercentScaleFunction(0.45, 45, 0.01, 4),
  6: createPercentScaleFunction(0.4, 50, 0.01, 3.6),
  7: createPercentScaleFunction(0.32, 55, 0.01, 3),
  8: createPercentScaleFunction(0.24, 60, 0.01, 2.5),
  9: createPercentScaleFunction(0.2, 65, 0.01, 2),
  10: createPercentScaleFunction(0.15, 70, 0.01, 1.5),
  11: createPercentScaleFunction(0.1, 75, 0.01, 1),
  12: createPercentScaleFunction(0.08, 80, 0.01, 0.75),
};

const BASE_SCALE_PER_TIER_AND_LEVEL = {
  1: { tierScale: 0.6, levelScale: 0.01 },
  2: { tierScale: 1, levelScale: 0.01 },
  3: { tierScale: 2, levelScale: 0.01 },
  4: { tierScale: 2, levelScale: 0.01 },
  5: { tierScale: 3, levelScale: 0.01 },
  6: { tierScale: 3, levelScale: 0.01 },
  7: { tierScale: 4, levelScale: 0.01 },
  8: { tierScale: 4, levelScale: 0.01 },
  9: { tierScale: 5, levelScale: 0.01 },
  10: { tierScale: 6, levelScale: 0.01 },
  11: { tierScale: 7, levelScale: 0.01 },
  12: { tierScale: 8, levelScale: 0.01 },
};

const attackRatingAndEvasionScale = 0.6;

const ELEMENT_IDS = Object.values(ELEMENTS).map(({ id }) => id);

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

const ARMOR_BIAS_RANGES = {
  strong: {
    armor: [1.3, 1.6],
    evasion: [0.8, 1.0],
    attackRating: [0.9, 1.05],
  },
  average: {
    armor: [0.9, 1.1],
    evasion: [0.95, 1.1],
    attackRating: [0.95, 1.1],
  },
  weak: {
    armor: [0.45, 0.75],
    evasion: [1.05, 1.25],
    attackRating: [1.05, 1.2],
  },
};

function buildExploreRegionMultipliers(region) {
  if (!region) return {};
  const baseMultipliers = region.multiplier || {};
  const result = { ...baseMultipliers };
  const profile = region.combatProfile;

  if (!profile) {
    return result;
  }

  const armorRanges = ARMOR_BIAS_RANGES[profile.armorBias] || ARMOR_BIAS_RANGES.average;

  const getBase = (value, fallback = 1) => (Number.isFinite(value) ? value : fallback);

  result.life = getBase(baseMultipliers.life, 1) * randomInRange(0.96, 1.05);
  result.attackSpeed = getBase(baseMultipliers.attackSpeed, 1) * randomInRange(0.97, 1.05);
  result.armor = getBase(baseMultipliers.armor, 1) * randomInRange(armorRanges.armor[0], armorRanges.armor[1]);
  result.evasion = getBase(baseMultipliers.evasion, 1) * randomInRange(armorRanges.evasion[0], armorRanges.evasion[1]);
  result.attackRating =
    getBase(baseMultipliers.attackRating, 1) * randomInRange(armorRanges.attackRating[0], armorRanges.attackRating[1]);

  if (profile.primaryDamage === 'physical') {
    result.damage = getBase(baseMultipliers.damage, 1) * randomInRange(1.15, 1.35);
  } else {
    result.damage = getBase(baseMultipliers.damage, 1) * randomInRange(0.75, 0.95);
  }

  const weakSet = new Set(profile.weakElements || []);
  const averageElements =
    profile.averageElements && profile.averageElements.length
      ? profile.averageElements
      : ELEMENT_IDS.filter((id) => id !== profile.primaryElement && !weakSet.has(id));
  const averageSet = new Set(averageElements);

  ELEMENT_IDS.forEach((elementId) => {
    const resistanceKey = `${elementId}Resistance`;
    const damageKey = `${elementId}Damage`;

    const baseResistance = getBase(baseMultipliers[resistanceKey], 1);
    let resistanceRange;
    if (elementId === profile.primaryElement) {
      resistanceRange = [1.6, 2.0];
    } else if (weakSet.has(elementId)) {
      resistanceRange = [0.3, 0.6];
    } else if (averageSet.has(elementId)) {
      resistanceRange = [0.85, 1.15];
    } else {
      resistanceRange = [0.85, 1.15];
    }
    result[resistanceKey] = baseResistance * randomInRange(resistanceRange[0], resistanceRange[1]);

    const baseDamage = getBase(baseMultipliers[damageKey], 1);
    let damageRange;
    if (profile.primaryDamage === 'physical') {
      if (elementId === profile.primaryElement) {
        damageRange = [0.9, 1.2];
      } else if (weakSet.has(elementId)) {
        damageRange = [0.55, 0.75];
      } else if (averageSet.has(elementId)) {
        damageRange = [0.7, 0.95];
      } else {
        damageRange = [0.7, 0.95];
      }
    } else {
      if (elementId === profile.primaryDamage) {
        damageRange = [1.5, 1.85];
      } else if (elementId === profile.primaryElement && profile.primaryElement !== profile.primaryDamage) {
        damageRange = [1.1, 1.35];
      } else if (weakSet.has(elementId)) {
        damageRange = [0.5, 0.75];
      } else if (averageSet.has(elementId)) {
        damageRange = [0.8, 1.05];
      } else {
        damageRange = [0.8, 1.05];
      }
    }
    result[damageKey] = baseDamage * randomInRange(damageRange[0], damageRange[1]);
  });

  return result;
}

class Enemy extends EnemyBase {
  constructor(level) {
    super();
    this.level = level; // level of enemy is same as stage

    this.region = getCurrentRegion();
    this.regionMultipliers = buildExploreRegionMultipliers(this.region);
    let regionEnemies = getRegionEnemies(this.region);

    const baseData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    this.baseData = baseData;

    this.name = `${baseData.name}`;
    this.image = baseData.image;
    this.special = Array.isArray(baseData.special) ? [...baseData.special] : [];
    this.specialData = { ...(baseData.specialData || {}) };

    // For legacy scaling system
    if (options.scalingSystem === 'legacy') {
      this.baseScale = TIER_STAT_SCALE[baseData.tier](this.level);
    }

    this.rarity = this.generateRarity();
    this.color = this.getRarityColor(this.rarity);
    this.rarityData = ENEMY_RARITY[this.rarity] || {};
    this.xp = this.calculateXP();
    this.gold = this.calculateGold();

    // to add increases for stage
    this.damage = this.calculateDamage();
    Object.values(ELEMENTS).forEach(({ id }) => {
      this[`${id}Damage`] = this.calculateElementalDamage(id);
    });

    this.life = this.calculateLife();
    this.attackSpeed = this.calculateAttackSpeed();
    this.armor = this.calculateArmor();
    this.evasion = this.calculateEvasion();
    this.attackRating = this.calculateAttackRating(); // Default attackRating if not defined

    Object.values(ELEMENTS).forEach(({ id }) => {
      this[`${id}Resistance`] = this.calculateElementalResistance(id);
    });

    this.currentLife = this.life;
    this.lastAttack = Date.now();

    const rarityName = t(`rarity.${this.rarity.toLowerCase()}`);
    battleLog.addBattle(
      tp('battleLog.encounteredEnemy', {
        rarity: rarityName,
        level: formatNumberValue(this.level, options?.shortNumbers),
        name: t(this.name),
      }),
    );
  }

  recalculateStats() {
    this.attackSpeed = this.calculateAttackSpeed();
    this.life = this.calculateLife();
    this.damage = this.calculateDamage();
    Object.values(ELEMENTS).forEach(({ id }) => {
      this[`${id}Damage`] = this.calculateElementalDamage(id);
    });
  }

  setEnemyColor() {
    // Get enemy section element
    const enemySection = document.querySelector('.enemy-section');
    if (!enemySection) {
      return;
    }

    // Remove any existing rarity classes
    enemySection.classList.remove(
      ENEMY_RARITY.NORMAL.color,
      ENEMY_RARITY.RARE.color,
      ENEMY_RARITY.EPIC.color,
      ENEMY_RARITY.LEGENDARY.color,
      ENEMY_RARITY.MYTHIC.color,
    );
    // Add the new color class
    enemySection.classList.add(this.color);
  }

  generateRarity() {
    const random = Math.random() * 1000; // 0 to 1000
    if (random < ENEMY_RARITY.NORMAL.threshold) return ENEMY_RARITY.NORMAL.type;
    if (random < ENEMY_RARITY.RARE.threshold) return ENEMY_RARITY.RARE.type;
    if (random < ENEMY_RARITY.EPIC.threshold) return ENEMY_RARITY.EPIC.type;
    if (random < ENEMY_RARITY.LEGENDARY.threshold) return ENEMY_RARITY.LEGENDARY.type;
    return ENEMY_RARITY.MYTHIC.type;
  }

  getRarityColor(rarity) {
    const rarityMap = {
      [ENEMY_RARITY.NORMAL.type]: ENEMY_RARITY.NORMAL.color,
      [ENEMY_RARITY.RARE.type]: ENEMY_RARITY.RARE.color,
      [ENEMY_RARITY.EPIC.type]: ENEMY_RARITY.EPIC.color,
      [ENEMY_RARITY.LEGENDARY.type]: ENEMY_RARITY.LEGENDARY.color,
      [ENEMY_RARITY.MYTHIC.type]: ENEMY_RARITY.MYTHIC.color,
    };
    return rarityMap[rarity] || 'white';
  }

  getRegionMultiplier(stat) {
    const rolled = this.regionMultipliers?.[stat];
    if (Number.isFinite(rolled)) {
      return rolled;
    }
    const base = this.region?.multiplier?.[stat];
    return Number.isFinite(base) ? base : 1;
  }

  /**
   * Calculate simple scaling based on region and stage.
   * This applies the new scaling system where:
   * - Mobs scale 5x per region (multiplicative from previous region)
   * - Mobs scale 10% per stage (additive from base at stage 1)
   *
   * @param {number} baseStat - The base stat value from enemy data
   * @returns {number} Scaled stat value
   */
  calculateSimpleScaling(baseStat) {
    if (!Number.isFinite(baseStat) || baseStat === 0) return 0;

    // Get the region tier (1-12)
    const tier = this.region?.tier || 1;

    // Calculate region scaling: multiply by MOB_REGION_SCALING_MULTIPLIER for each tier above 1
    // Tier 1: multiplier^0 = 1
    // Tier 2: multiplier^1 = 5
    // Tier 3: multiplier^2 = 25, etc.
    const regionScale = Math.pow(MOB_REGION_SCALING_MULTIPLIER, tier - 1);

    // Calculate stage scaling: 10% increase per stage from the base value
    // Stage 1: base * (1 + 0 * 0.1) = base
    // Stage 2: base * (1 + 1 * 0.1) = base * 1.1
    // Stage 3: base * (1 + 2 * 0.1) = base * 1.2, etc.
    const stageScale = 1 + (this.level - 1) * MOB_STAGE_SCALING_PERCENT;

    return baseStat * regionScale * stageScale;
  }

  calculateAttackSpeed() {
    const baseSpeed =
      (this.baseData.attackSpeed || 1) *
      (this.rarityData.multiplier.attackSpeed || 1) *
      this.getRegionMultiplier('attackSpeed') *
      (this.baseData.multiplier?.attackSpeed || 1);
    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    return baseSpeed * (1 - speedRed);
  }

  calculateLife() {
    let base = this.baseData.life || 0;
    let scaled;

    if (options.scalingSystem === 'simple') {
      scaled = this.calculateSimpleScaling(base);
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
      base *= scale.tierScale * levelBonus;
      scaled = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    }

    const baseLife =
      scaled *
      this.getRegionMultiplier('life') *
      (this.rarityData.multiplier.life || 1) *
      (this.baseData.multiplier?.life || 1);
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    return baseLife * (1 - hpRed);
  }

  calculateDamage = () => {
    let base = this.baseData.damage || 0;
    let scaled;

    if (options.scalingSystem === 'simple') {
      scaled = this.calculateSimpleScaling(base);
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
      base *= scale.tierScale * levelBonus;
      scaled = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    }

    const damageRed = hero.stats.reduceEnemyDamagePercent || 0;
    const totalDamage =
      scaled *
      this.getRegionMultiplier('damage') *
      (this.rarityData.multiplier.damage || 1) *
      (this.baseData.multiplier?.damage || 1) *
      (1 - damageRed);
    return Math.max(totalDamage, 1);
  };

  calculateArmor() {
    let base = this.baseData.armor || 0;
    let scaled;

    if (options.scalingSystem === 'simple') {
      scaled = this.calculateSimpleScaling(base);
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
      base *= scale.tierScale * levelBonus;
      scaled = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    }

    return (
      scaled *
      this.getRegionMultiplier('armor') *
      (this.rarityData.multiplier.armor || 1) *
      (this.baseData.multiplier?.armor || 1)
    );
  }

  calculateEvasion() {
    let base = this.baseData.evasion || 0;
    let scaled;

    if (options.scalingSystem === 'simple') {
      scaled = this.calculateSimpleScaling(base);
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
      base *= scale.tierScale * levelBonus;
      scaled = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    }

    return (
      scaled *
      this.getRegionMultiplier('evasion') *
      (this.rarityData.multiplier.evasion || 1) *
      (this.baseData.multiplier?.evasion || 1) *
      attackRatingAndEvasionScale
    );
  }

  calculateAttackRating() {
    let base = this.baseData.attackRating || 0;
    let scaled;

    if (options.scalingSystem === 'simple') {
      scaled = this.calculateSimpleScaling(base);
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
      base *= scale.tierScale * levelBonus;
      scaled = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    }

    return (
      scaled *
      this.getRegionMultiplier('attackRating') *
      (this.rarityData.multiplier.attackRating || 1) *
      (this.baseData.multiplier?.attackRating || 1) *
      attackRatingAndEvasionScale
    );
  }

  calculateElementalDamage(type) {
    // type should be an id from ELEMENTS (e.g., ELEMENTS.fire.id)
    let base = this.baseData[`${type}Damage`] || 0;
    if (base === 0) return 0;

    let scaled;
    if (options.scalingSystem === 'simple') {
      scaled = this.calculateSimpleScaling(base);
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
      base *= scale.tierScale * levelBonus;
      scaled = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    }

    const regionMult = this.getRegionMultiplier(`${type}Damage`);
    const rarityMult = this.rarityData.multiplier[`${type}Damage`] || 1;
    const baseMult = this.baseData.multiplier?.[`${type}Damage`] || 1;
    const damageRed = hero.stats.reduceEnemyDamagePercent || 0;
    const totalDamage = scaled * regionMult * rarityMult * baseMult * (1 - damageRed);
    return Math.round(totalDamage);
  }

  calculateElementalResistance(type) {
    let base = this.baseData[`${type}Resistance`] || 0;
    if (base === 0) return 0;

    let scaled;
    if (options.scalingSystem === 'simple') {
      scaled = this.calculateSimpleScaling(base);
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
      base *= scale.tierScale * levelBonus;
      scaled = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    }

    const regionMult = this.getRegionMultiplier(`${type}Resistance`);
    const rarityMult = this.rarityData.multiplier[`${type}Resistance`] || 1;
    const baseMult = this.baseData.multiplier?.[`${type}Resistance`] || 1;
    return scaled * regionMult * rarityMult * baseMult;
  }

  calculateXP() {
    const base = this.baseData.xp || 0;
    const tier = this.region?.tier || 1;
    let baseAtL1;
    let basePercent;
    let levelBonus;

    if (options.scalingSystem === 'simple') {
      // Apply region scaling to XP
      const regionScale = Math.pow(MOB_REGION_SCALING_MULTIPLIER, tier - 1);
      baseAtL1 = base * regionScale;
      // Apply stage scaling using the existing reward computation
      basePercent = MOB_REWARD_STAGE_SCALING_PERCENT;
      levelBonus = 1;
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      baseAtL1 = base * scale.tierScale;
      const basePercentFn = TIER_STAT_SCALE[this.baseData.tier];
      basePercent = basePercentFn ? basePercentFn(this.level) : 0;
      levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    }

    const diminishing = xpDiminishingFactor(this.level);
    const val = computeScaledReward(baseAtL1, this.level, basePercent, levelBonus, diminishing);
    return (
      val *
      this.getRegionMultiplier('xp') *
      (this.rarityData.multiplier.xp || 1) *
      (this.baseData.multiplier?.xp || 1)
    );
  }

  calculateGold() {
    const base = this.baseData.gold || 0;
    const tier = this.region?.tier || 1;
    let baseAtL1;
    let basePercent;
    let levelBonus;

    if (options.scalingSystem === 'simple') {
      // Apply region scaling to Gold
      const regionScale = Math.pow(MOB_REGION_SCALING_MULTIPLIER, tier - 1);
      baseAtL1 = base * regionScale;
      // Apply stage scaling using the existing reward computation
      basePercent = MOB_REWARD_STAGE_SCALING_PERCENT;
      levelBonus = 1;
    } else {
      // Legacy scaling
      const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
      baseAtL1 = base * scale.tierScale;
      const basePercentFn = TIER_STAT_SCALE[this.baseData.tier];
      basePercent = basePercentFn ? basePercentFn(this.level) : 0;
      levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    }

    const diminishing = xpDiminishingFactor(this.level);
    const val = computeScaledReward(baseAtL1, this.level, basePercent, levelBonus, diminishing);
    return (
      val *
      this.getRegionMultiplier('gold') *
      (this.rarityData.multiplier.gold || 1) *
      (this.baseData.multiplier?.gold || 1)
    );
  }

  calculateDropChance() {
    const enemyConst = ENEMY_RARITY[this.rarity];
    // Apply region item drop multiplier
    return (
      enemyConst.itemDropChance *
      this.getRegionMultiplier('itemDrop') *
      (this.baseData.multiplier?.itemDrop || 1)
    );
  }

  // Calculate item level based on stage (no effect at the moment)
  calculateItemLevel(stage) {
    return Math.max(1, Math.floor(stage * 1));
  }

  rollForDrop() {
    const dropChance = this.calculateDropChance();
    return Math.random() * 100 <= dropChance;
  }

  getRandomItemType() {
    const types = ALL_ITEM_TYPES;
    return types[Math.floor(Math.random() * types.length)];
  }

  rollForMaterialDrop() {
    const baseChance = BASE_MATERIAL_DROP_CHANCE / 100; // Base chance of 2.5%

    return (
      baseChance *
        this.getRegionMultiplier('materialDrop') *
        (this.baseData.multiplier?.materialDrop || 1) +
      hero.stats.extraMaterialDropPercent
    ) * 100;
  }
}
export default Enemy;
