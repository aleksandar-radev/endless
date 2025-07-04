/**
 * Manages boss properties and state.
 */
import { BOSSES } from './constants/bosses.js';
import { hero } from './globals.js';

class Boss {
  /**
   * Create a new Boss instance with a random boss definition.
   * @throws {Error} If no bosses are defined in BOSSES.
   */
  constructor() {
    if (!BOSSES.length) {
      throw new Error('No bosses defined in BOSSES array.');
    }
    const baseData = BOSSES[Math.floor(Math.random() * BOSSES.length)];
    this.baseData = baseData;
    this.id = baseData.id;
    this.name = baseData.name;
    this.image = baseData.image;

    // Use boss definition stats and scale by boss level
    this.level = hero.bossLevel || 1;

    // Life scaling (4x stronger)
    this.life = this.calculateLife();
    this.currentLife = this.life;

    this.xp = this.calculateXP();
    this.gold = this.calculateGold();

    // Damage scaling (4x stronger)
    this.damage = this.calculateDamage();

    // Other stats (4x stronger)
    this.attackSpeed = this.baseData.attackSpeed || 1;
    this.armor = this.calculateArmor();
    this.evasion = this.calculateEvasion();
    this.attackRating = this.calculateAttackRating();

    // Elemental damages (4x stronger, use method)
    this.fireDamage = this.calculateElementalDamage( 'fire');
    this.coldDamage = this.calculateElementalDamage( 'cold');
    this.airDamage = this.calculateElementalDamage('air');
    this.earthDamage = this.calculateElementalDamage('earth');
    this.lightningDamage = this.calculateElementalDamage('lightning');
    this.waterDamage = this.calculateElementalDamage('water');

    this.fireResistance = baseData.fireResistance || 0;
    this.coldResistance = baseData.coldResistance || 0;
    this.airResistance = baseData.airResistance || 0;
    this.earthResistance = baseData.earthResistance || 0;
    this.lightningResistance = baseData.lightningResistance || 0;
    this.waterResistance = baseData.waterResistance || 0;

    this.reward = this.baseData.reward;
    this.lastAttack = Date.now();
  }


  calculateXP() {
    let xp = this.baseData.xp;
    const segLen = 40,
      initialInc = 4,
      incStep = 2;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      xp += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return xp * (this.baseData.multiplier.xp || 1);
  }

  calculateGold() {
    let gold = this.baseData.gold;
    const segLen = 40,
      initialInc = 6,
      incStep = 3;
    for (let lvl = 1; lvl <= this.level; lvl++) {
      gold += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    return gold * (this.baseData.multiplier.gold || 1);
  }

  calculateLife() {
    let life = this.baseData.life - 40; // 4x the original -10
    const segLen = 2.5, initialInc = 40, incStep = 20; // 4x the original values
    for (let i = 1; i <= this.level; i++) {
      life += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return life * (this.baseData.multiplier?.life || 1);
  }

  calculateDamage() {
    let dmg = this.baseData.damage;
    const segLen = 2.5, initialInc = 1.2, incStep = 0.4; // 4x the original values
    for (let i = 1; i <= this.level; i++) {
      dmg += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return dmg * (this.baseData.multiplier?.damage || 1);
  }

  calculateArmor() {
    const baseArmor = this.baseData.armor * this.level || 0;
    const segLen = 2.5, initialInc = 2, incStep = 0.8; // 4x the original values
    let armor = baseArmor;
    for (let i = 1; i <= this.level; i++) {
      armor += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return armor * (this.baseData.multiplier?.armor || 1);
  }

  calculateEvasion() {
    const baseEvasion = this.baseData.evasion * this.level || 0;
    const segLen = 2.5, initialInc = 2, incStep = 0.8; // 4x the original values
    let evasion = baseEvasion;
    for (let i = 1; i <= this.level; i++) {
      evasion += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return evasion * (this.baseData.multiplier?.evasion || 1);
  }

  calculateAttackRating() {
    const baseAttackRating = this.baseData.attackRating * this.level || 0;
    const segLen = 2.5, initialInc = 2, incStep = 0.8; // 4x the original values
    let attackRating = baseAttackRating;
    for (let i = 1; i <= this.level; i++) {
      attackRating += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return attackRating * (this.baseData.multiplier?.attackRating || 1);
  }

  calculateElementalDamage( type) {
    const base = this.baseData[`${type}Damage`] || 0;
    if (base === 0) return 0;
    const segLen = 2.5, initialInc = 1.2, incStep = 0.4; // 4x the original values
    let dmg = base;
    for (let i = 1; i <= this.level; i++) {
      dmg += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    const mult = this.baseData.multiplier?.[`${type}Damage`] || 1;
    return dmg * mult;
  }

  /**
   * Inflict damage to the boss.
   * @param {number} amount Amount of damage.
   * @returns {boolean} True if boss is dead after damage.
   */
  takeDamage(amount) {
    this.currentLife = Math.max(this.currentLife - amount, 0);
    // On death
    if (this.currentLife === 0) {
      return true;
    }
    return false;
  }

  /**
   * Reset boss life to full.
   */
  resetLife() {
    this.currentLife = this.life;
  }

  /**
   * Get life percentage for UI display.
   * @returns {number} Percentage of life remaining.
   */
  getLifePercent() {
    return (this.currentLife / this.life) * 100;
  }

  /**
   * Whether boss can attack again based on attackSpeed.
   * @param {number} currentTime Timestamp in ms
   * @returns {boolean}
   */
  canAttack(currentTime) {
    if (this.attackSpeed <= 0) return false;
    const timeBetweenAttacks = 1000 / this.attackSpeed; // now attacks/sec
    return currentTime - this.lastAttack >= timeBetweenAttacks;
  }
}

export default Boss;