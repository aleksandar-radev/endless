import { ITEM_TYPES } from './constants/items.js';
import { getCurrentRegion, getRegionEnemies } from './region.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { ELEMENTS } from './constants/common.js';

class Enemy {
  constructor(level) {
    this.level = level; // level of enemy is same as stage

    this.region = getCurrentRegion();
    let regionEnemies = getRegionEnemies(this.region);

    const baseData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    this.baseData = baseData;

    this.name = `${ELEMENTS[baseData.element].icon} ${baseData.name}`;
    this.element = baseData.element || null;
    this.image = baseData.image;

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

    this.fireResistance = baseData.fireResistance || 0;
    this.coldResistance = baseData.coldResistance || 0;
    this.airResistance = baseData.airResistance || 0;
    this.earthResistance = baseData.earthResistance || 0;
    this.lightningResistance = baseData.lightningResistance || 0;
    this.waterResistance = baseData.waterResistance || 0;

    this.currentLife = this.life;
    this.lastAttack = Date.now();
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
    return (
      this.baseData.attackSpeed *
      (this.rarityData.multiplier.attackSpeed || 1) *
      (this.region.multiplier.attackSpeed || 1) *
      (this.baseData.multiplier.attackSpeed || 1)
    );
  }

  calculateLife() {
    let life = this.baseData.life - 10; // to account for level 1 enemy having +10 life
    const segLen = 10,
      initialInc = 12,
      incStep = 8;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      life += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return life * this.region.multiplier.life * this.rarityData.multiplier.life * this.baseData.multiplier.life;
  }

  calculateDamage = () => {
    let dmg = this.baseData.damage;
    const segLen = 10,
      initialInc = 0.4,
      incStep = 0.1;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      dmg += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return dmg * this.region.multiplier.damage * this.rarityData.multiplier.damage * this.baseData.multiplier.damage;
  };

  calculateArmor() {
    const baseArmor = this.baseData.armor * this.level || 0;
    const segLen = 10,
      initialInc = 0.5,
      incStep = 0.2;
    let armor = baseArmor;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      armor += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return armor * this.region.multiplier.armor * this.rarityData.multiplier.armor * this.baseData.multiplier.armor;
  }

  calculateEvasion() {
    const baseEvasion = this.baseData.evasion * this.level || 0;
    const segLen = 10,
      initialInc = 0.5,
      incStep = 0.2;
    let evasion = baseEvasion;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      evasion += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return (
      evasion * this.region.multiplier.evasion * this.rarityData.multiplier.evasion * this.baseData.multiplier.evasion
    );
  }

  calculateAttackRating() {
    const baseAttackRating = this.baseData.attackRating * this.level || 0;
    const segLen = 10,
      initialInc = 0.5,
      incStep = 0.2;
    let attackRating = baseAttackRating;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      attackRating += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return (
      attackRating *
      this.region.multiplier.attackRating *
      this.rarityData.multiplier.attackRating *
      this.baseData.multiplier.attackRating
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
    return Math.random() < baseChance * (this.region.multiplier.materialDrop || 1) * (this.baseData.multiplier.materialDrop || 1);
  }

  calculateElementalDamage(type) {
    // type: 'fire', 'cold', 'air', 'earth', 'lightning', 'water'
    const base = this.baseData[`${type}Damage`] || 0;
    if (base === 0) return 0;
    const segLen = 10,
      initialInc = 0.3,
      incStep = 0.1;
    let dmg = base;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      dmg += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    const regionMult = this.region.multiplier[`${type}Damage`] || 1;
    const rarityMult = this.rarityData.multiplier[`${type}Damage`] || 1;
    const baseMult = this.baseData.multiplier ? this.baseData.multiplier[`${type}Damage`] || 1 : 1;
    return dmg * regionMult * rarityMult * baseMult;
  }

  calculateXP() {
    let xp = this.baseData.xp;
    const segLen = 10,
      initialInc = 2,
      incStep = 1;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      xp += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return xp * this.region.multiplier.xp * (this.rarityData.multiplier.xp || 1) * (this.baseData.multiplier.xp || 1);
  }

  calculateGold() {
    let gold = this.baseData.gold;
    const segLen = 10,
      initialInc = 1.5,
      incStep = 0.75;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      gold += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return gold * this.region.multiplier.gold * (this.rarityData.multiplier.gold || 1) * (this.baseData.multiplier.gold || 1);
  }
}
export default Enemy;
