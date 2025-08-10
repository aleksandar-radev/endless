import { ITEM_TYPES } from './constants/items.js';
import { getCurrentRegion, getRegionEnemies } from './region.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { scaleStat } from './common.js';
import { hero } from './globals.js';

// base value increase per level
// for tier 1 enemy level 1 50 life, level 2 is 50 + 25 = 75 (e.g. 50% increase for base value per level)
// tier 12 enemy gets 8% increase per level on the base value
const TIER_STAT_SCALE = {
  1: 0.3,
  2: 0.4,
  3: 0.5,
  4: 0.6,
  5: 0.5,
  6: 0.4,
  7: 0.32,
  8: 0.24,
  9: 0.2,
  10: 0.15,
  11: 0.1,
  12: 0.08,
};

// levelScale -> [fixed increase, bonus interval, bonus increase]
const BASE_SCALE_PER_TIER_AND_LEVEL = {
  1: {
    tierScale: 0.5,
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

class Enemy {
  constructor(level) {
    this.level = level; // level of enemy is same as stage

    this.region = getCurrentRegion();
    let regionEnemies = getRegionEnemies(this.region);

    const baseData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    this.baseData = baseData;

    this.name = `${baseData.name}`;
    this.image = baseData.image;

    this.baseScale = TIER_STAT_SCALE[baseData.tier];

    this.rarity = this.generateRarity();
    this.color = this.getRarityColor(this.rarity);
    this.rarityData = ENEMY_RARITY[this.rarity] || {};
    this.xp = this.calculateXP();
    this.gold = this.calculateGold();

    // to add increases for stage
    this.damage = this.calculateDamage();
    this.fireDamage = this.calculateElementalDamage('fire');
    this.coldDamage = this.calculateElementalDamage('cold');
    this.airDamage = this.calculateElementalDamage('air');
    this.earthDamage = this.calculateElementalDamage('earth');
    this.lightningDamage = this.calculateElementalDamage('lightning');
    this.waterDamage = this.calculateElementalDamage('water');

    this.life = this.calculateLife();
    this.attackSpeed = this.calculateAttackSpeed();
    this.armor = this.calculateArmor();
    this.evasion = this.calculateEvasion();
    this.attackRating = this.calculateAttackRating(); // Default attackRating if not defined

    this.fireResistance = this.calculateElementalResistance('fire');
    this.coldResistance = this.calculateElementalResistance('cold');
    this.airResistance = this.calculateElementalResistance('air');
    this.earthResistance = this.calculateElementalResistance('earth');
    this.lightningResistance = this.calculateElementalResistance('lightning');
    this.waterResistance = this.calculateElementalResistance('water');

    this.currentLife = this.life;
    this.lastAttack = Date.now();
  }

  // used when reductions are applied from skills usually buff, but can be instant too
  recalculateStats() {
    this.attackSpeed = this.calculateAttackSpeed();
    this.life = this.calculateLife();
    this.damage = this.calculateDamage();
    this.fireDamage = this.calculateElementalDamage('fire');
    this.coldDamage = this.calculateElementalDamage('cold');
    this.airDamage = this.calculateElementalDamage('air');
    this.earthDamage = this.calculateElementalDamage('earth');
    this.lightningDamage = this.calculateElementalDamage('lightning');
    this.waterDamage = this.calculateElementalDamage('water');
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
    const random = Math.random() * 100;
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

  calculateAttackSpeed() {
    const baseSpeed =
      this.baseData.attackSpeed *
      (this.rarityData.multiplier.attackSpeed || 1) *
      (this.region.multiplier.attackSpeed || 1) *
      (this.baseData.multiplier.attackSpeed || 1);
    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    return baseSpeed * (1 - speedRed);
  }

  calculateLife() {
    let base = this.baseData.life || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const baseLife = val * this.region.multiplier.life * this.rarityData.multiplier.life * this.baseData.multiplier.life;
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
    return val * this.region.multiplier.damage * this.rarityData.multiplier.damage * this.baseData.multiplier.damage * (1 - damageRed);
  };

  calculateArmor() {
    let base = this.baseData.armor || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0,0,0, this.baseScale);
    return val * this.region.multiplier.armor * this.rarityData.multiplier.armor * this.baseData.multiplier.armor;
  }

  calculateEvasion() {
    let base = this.baseData.evasion || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0,0,0, this.baseScale);
    return val * this.region.multiplier.evasion * this.rarityData.multiplier.evasion * this.baseData.multiplier.evasion;
  }

  calculateAttackRating() {
    let base = this.baseData.attackRating || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0,0,0, this.baseScale);
    return (
      val *
      this.region.multiplier.attackRating *
      this.rarityData.multiplier.attackRating *
      this.baseData.multiplier.attackRating
    );
  }

  calculateElementalDamage(type) {
    // type: 'fire', 'cold', 'air', 'earth', 'lightning', 'water'
    let base = this.baseData[`${type}Damage`] || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const regionMult = this.region.multiplier[`${type}Damage`] || 1;
    const rarityMult = this.rarityData.multiplier[`${type}Damage`] || 1;
    const baseMult = this.baseData.multiplier ? this.baseData.multiplier[`${type}Damage`] || 1 : 1;

    const damageRed = hero.stats.reduceEnemyDamagePercent || 0;
    return val * regionMult * rarityMult * baseMult * (1 - damageRed);
  }

  calculateElementalResistance(type) {
    let base = this.baseData[`${type}Resistance`] || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const regionMult = this.region.multiplier[`${type}Resistance`] || 1;
    const rarityMult = this.rarityData.multiplier[`${type}Resistance`] || 1;
    const baseMult = this.baseData.multiplier ? this.baseData.multiplier[`${type}Resistance`] || 1 : 1;
    return val * regionMult * rarityMult * baseMult;
  }

  calculateXP() {
    let base = this.baseData.xp || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return val * this.region.multiplier.xp * (this.rarityData.multiplier.xp || 1) * (this.baseData.multiplier.xp || 1);
  }

  calculateGold() {
    let base = this.baseData.gold || 0;
    const scale = BASE_SCALE_PER_TIER_AND_LEVEL[this.baseData.tier];
    const levelBonus = 1 + Math.floor(this.level / 20) * scale.levelScale;
    base *= scale.tierScale * levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return val * this.region.multiplier.gold * (this.rarityData.multiplier.gold || 1) * (this.baseData.multiplier.gold || 1);
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
    return enemyConst.itemDropChance * (this.region.multiplier.itemDrop || 1) * (this.baseData.multiplier.itemDrop || 1);
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

    return (baseChance * (this.region.multiplier.materialDrop || 1) * (this.baseData.multiplier.materialDrop || 1) + hero.stats.extraMaterialDropPercent) * 100;
  }
}
export default Enemy;
