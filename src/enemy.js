import { ITEM_TYPES } from './constants/items.js';
import { getCurrentRegion, getRegionEnemies } from './region.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { percentIncreasedByLevel, scaleStat, computeXPAdjustedMonotonic, xpDiminishingFactor } from './common.js';
import { hero, options } from './globals.js';
import { battleLog } from './battleLog.js';
import { ELEMENTS } from './constants/common.js';
import { t, tp } from './i18n.js';
import { formatNumber as formatNumberValue } from './utils/numberFormatter.js';

// base value increase per level
// for tier 1 enemy level 1 50 life, level 2 is 50 + 25 = 75 (e.g. 50% increase for base value per level)
// tier 12 enemy gets 8% increase per level on the base value
const TIER_STAT_SCALE = {
  1: (level) => percentIncreasedByLevel(0.65, level, 25, 0.025, 6),
  2: (level) => percentIncreasedByLevel(0.6, level, 30, 0.02, 5.5),
  3: (level) => percentIncreasedByLevel(0.55, level, 35, 0.015, 5),
  4: (level) => percentIncreasedByLevel(0.5, level, 40, 0.01, 4.5),
  5: (level) => percentIncreasedByLevel(0.45, level, 45, 0.01, 4),
  6: (level) => percentIncreasedByLevel(0.4, level, 50, 0.01, 3.6),
  7: (level) => percentIncreasedByLevel(0.32, level, 55, 0.01, 3),
  8: (level) => percentIncreasedByLevel(0.24, level, 60, 0.01, 2.5),
  9: (level) => percentIncreasedByLevel(0.2, level, 65, 0.01, 2),
  10: (level) => percentIncreasedByLevel(0.15, level, 70, 0.01, 1.5),
  11: (level) => percentIncreasedByLevel(0.1, level, 75, 0.01, 1),
  12: (level) => percentIncreasedByLevel(0.08, level, 80, 0.01, 0.75),
};

// Removed tier-specific diminishing for XP/Gold. Both use the global xpDiminishingFactor.


// levelScale -> [fixed increase, bonus interval, bonus increase]
const BASE_SCALE_PER_TIER_AND_LEVEL = {
  1: {
    tierScale: 0.6,
    levelScale: 0.01,
  },
  2: {
    tierScale: 1,
    levelScale: 0.01,
  },
  3: {
    tierScale: 2,
    levelScale: 0.01,
  },
  4: {
    tierScale: 2,
    levelScale: 0.01,
  },
  5: {
    tierScale: 3,
    levelScale: 0.01,
  },
  6: {
    tierScale: 3,
    levelScale: 0.01,
  },
  7: {
    tierScale: 4,
    levelScale: 0.01,
  },
  8: {
    tierScale: 4,
    levelScale: 0.01,
  },
  9: {
    tierScale: 5,
    levelScale: 0.01,
  },
  10: {
    tierScale: 6,
    levelScale: 0.01,
  },
  11: {
    tierScale: 7,
    levelScale: 0.01,
  },
  12: {
    tierScale: 8,
    levelScale: 0.01,
  },
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

class Enemy {
  constructor(level) {
    this.level = level; // level of enemy is same as stage

    this.region = getCurrentRegion();
    this.regionMultipliers = buildExploreRegionMultipliers(this.region);
    let regionEnemies = getRegionEnemies(this.region);

    const baseData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    this.baseData = baseData;

    this.name = `${baseData.name}`;
    this.image = baseData.image;

    this.baseScale = TIER_STAT_SCALE[baseData.tier](this.level);

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

  // used when reductions are applied from skills usually buff, but can be instant too
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
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const baseLife =
      val *
      this.getRegionMultiplier('life') *
      (this.rarityData.multiplier.life || 1) *
      (this.baseData.multiplier?.life || 1);
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    return baseLife * (1 - hpRed);
  }

  calculateDamage = () => {
    let base = this.baseData.damage || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const damageRed = hero.stats.reduceEnemyDamagePercent || 0;
    const totalDamage =
      val *
      this.getRegionMultiplier('damage') *
      (this.rarityData.multiplier.damage || 1) *
      (this.baseData.multiplier?.damage || 1) *
      (1 - damageRed);
    return Math.max(totalDamage, 1);
  };

  calculateArmor() {
    let base = this.baseData.armor || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return (
      val *
      this.getRegionMultiplier('armor') *
      (this.rarityData.multiplier.armor || 1) *
      (this.baseData.multiplier?.armor || 1)
    );
  }

  calculateEvasion() {
    let base = this.baseData.evasion || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return (
      val *
      this.getRegionMultiplier('evasion') *
      (this.rarityData.multiplier.evasion || 1) *
      (this.baseData.multiplier?.evasion || 1) *
      attackRatingAndEvasionScale
    );
  }

  calculateAttackRating() {
    let base = this.baseData.attackRating || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return (
      val *
      this.getRegionMultiplier('attackRating') *
      (this.rarityData.multiplier.attackRating || 1) *
      (this.baseData.multiplier?.attackRating || 1) *
      attackRatingAndEvasionScale
    );
  }

  calculateElementalDamage(type) {
    // type should be an id from ELEMENTS (e.g., ELEMENTS.fire.id)
    let base = this.baseData[`${type}Damage`] || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const regionMult = this.getRegionMultiplier(`${type}Damage`);
    const rarityMult = this.rarityData.multiplier[`${type}Damage`] || 1;
    const baseMult = this.baseData.multiplier?.[`${type}Damage`] || 1;

    const damageRed = hero.stats.reduceEnemyDamagePercent || 0;
    const totalDamage = val * regionMult * rarityMult * baseMult * (1 - damageRed);
    return Math.max(totalDamage, 1);
  }

  calculateElementalResistance(type) {
    let base = this.baseData[`${type}Resistance`] || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const regionMult = this.getRegionMultiplier(`${type}Resistance`);
    const rarityMult = this.rarityData.multiplier[`${type}Resistance`] || 1;
    const baseMult = this.baseData.multiplier?.[`${type}Resistance`] || 1;
    return val * regionMult * rarityMult * baseMult;
  }

  calculateXP() {
    let base = this.baseData.xp || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    const baseAtL1 = (this.baseData.xp || 0) * scale.tierScale; // levelBonus handled inside
    const basePercentFn = TIER_STAT_SCALE[this.baseData.tier];
    const tierFn = (lvl) => xpDiminishingFactor(lvl);
    const levelBonusFn = (lvl) => 1 + Math.floor(lvl / 20) * scale.levelScale;
    const val = computeXPAdjustedMonotonic(
      baseAtL1,
      this.level,
      basePercentFn,
      levelBonusFn,
      tierFn,
      `tier-${this.baseData.tier}`,
    );
    return (
      val *
      this.getRegionMultiplier('xp') *
      (this.rarityData.multiplier.xp || 1) *
      (this.baseData.multiplier?.xp || 1)
    );
  }

  calculateGold() {
    let base = this.baseData.gold || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    const baseAtL1 = (this.baseData.gold || 0) * scale.tierScale; // levelBonus handled inside
    const basePercentFn = TIER_STAT_SCALE[this.baseData.tier];
    const tierFn = (lvl) => xpDiminishingFactor(lvl);
    const levelBonusFn = (lvl) => 1 + Math.floor(lvl / 20) * scale.levelScale;
    const val = computeXPAdjustedMonotonic(
      baseAtL1,
      this.level,
      basePercentFn,
      levelBonusFn,
      tierFn,
      `gold-tier-${this.baseData.tier}`,
    );
    return (
      val *
      this.getRegionMultiplier('gold') *
      (this.rarityData.multiplier.gold || 1) *
      (this.baseData.multiplier?.gold || 1)
    );
  }

  canAttack(currentTime) {
    if (this.attackSpeed <= 0) return false;
    const timeBetweenAttacks = 1000 / this.attackSpeed; // now attacks/sec
    return currentTime - this.lastAttack >= timeBetweenAttacks;
  }

  resetLife() {
    this.currentLife = this.life;
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
    const types = Object.values(ITEM_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  rollForMaterialDrop() {
    const baseChance = 0.025; // Base chance of 2.5%

    return (
      baseChance *
        this.getRegionMultiplier('materialDrop') *
        (this.baseData.multiplier?.materialDrop || 1) +
      hero.stats.extraMaterialDropPercent
    ) * 100;
  }
}
export default Enemy;
