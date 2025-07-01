import { ITEM_TYPES } from './constants/items.js';
import { getCurrentRegion, getRegionEnemies } from './region.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { ELEMENTS } from './constants/common.js';

class Enemy {
  constructor(level) {
    this.level = level; // level of enemy is same as stage

    this.region = getCurrentRegion();
    let regionEnemies = getRegionEnemies(this.region);

    const enemyData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    this.baseData = enemyData;

    this.name = `${ELEMENTS[enemyData.element].icon} ${enemyData.name}`;
    this.element = enemyData.element || null;
    this.image = enemyData.image;

    this.itemDropMultiplier = (this.region.multiplier.itemDrop || 1) * (enemyData.itemDropMultiplier || 1);
    this.materialDropMultiplier = (this.region.multiplier.materialDrop || 1) * (enemyData.materialDropMultiplier || 1);

    this.rarity = this.generateRarity();
    this.color = this.getRarityColor(this.rarity);
    this.rarityData = ENEMY_RARITY[this.rarity] || {};
    this.xp = enemyData.xp * this.region.multiplier.xp * (this.rarityData.multiplier.xp || 1);
    this.gold = enemyData.gold * this.region.multiplier.gold * (this.rarityData.multiplier.gold || 1);

    // to add increases for stage
    this.damage = this.calculateDamage();
    this.life = this.calculateLife();
    this.attackSpeed = this.calculateAttackSpeed();
    this.armor = this.calculateArmor();
    this.evasion = this.calculateEvasion();
    this.attackRating = this.calculateAttackRating(); // Default attackRating if not defined
    const rarityMult = this.rarityData.multiplier;
    const regionMult = this.region.multiplier;
    const baseMult = enemyData.multiplier || {};
    this.fireDamage =
      (enemyData.fireDamage || 0) *
      (regionMult.fireDamage || 1) *
      (rarityMult.fireDamage || 1) *
      (baseMult.fireDamage || 1);
    this.coldDamage =
      (enemyData.coldDamage || 0) *
      (regionMult.coldDamage || 1) *
      (rarityMult.coldDamage || 1) *
      (baseMult.coldDamage || 1);
    this.airDamage =
      (enemyData.airDamage || 0) *
      (regionMult.airDamage || 1) *
      (rarityMult.airDamage || 1) *
      (baseMult.airDamage || 1);
    this.earthDamage =
      (enemyData.earthDamage || 0) *
      (regionMult.earthDamage || 1) *
      (rarityMult.earthDamage || 1) *
      (baseMult.earthDamage || 1);
    this.fireResistance = enemyData.fireResistance || 0;
    this.coldResistance = enemyData.coldResistance || 0;
    this.airResistance = enemyData.airResistance || 0;
    this.earthResistance = enemyData.earthResistance || 0;
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
      initialInc = 10,
      incStep = 5;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      life += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return life * this.region.multiplier.life * this.rarityData.multiplier.life * this.baseData.multiplier.life;
  }

  calculateDamage = () => {
    let dmg = this.baseData.damage;
    const segLen = 10,
      initialInc = 0.3,
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
    return enemyConst.itemDropChance * this.itemDropMultiplier;
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
    return Math.random() < baseChance * this.materialDropMultiplier;
  }
}
export default Enemy;
