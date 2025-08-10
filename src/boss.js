/**
 * Manages boss properties and state.
 */
import { scaleStat } from './common.js';
import { BOSSES } from './constants/bosses.js';
import { hero } from './globals.js';

const INCREASE_PER_LEVEL = 0.02;

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
    this.attackSpeed = this.calculateAttackSpeed();
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

    this.fireResistance = this.calculateElementalResistance('fire');
    this.coldResistance = this.calculateElementalResistance('cold');
    this.airResistance = this.calculateElementalResistance('air');
    this.earthResistance = this.calculateElementalResistance('earth');
    this.lightningResistance = this.calculateElementalResistance('lightning');
    this.waterResistance = this.calculateElementalResistance('water');

    this.reward = this.baseData.reward;
    this.lastAttack = Date.now();
  }


  calculateXP() {
    let base = this.baseData.xp || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level);
    return val * (this.baseData.multiplier?.xp || 1);
  }

  calculateGold() {
    let base = this.baseData.gold || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level);
    return val * (this.baseData.multiplier?.gold || 1);
  }


  calculateAttackSpeed() {
    const baseSpeed = this.baseData.attackSpeed || 1;
    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    return baseSpeed * (1 - speedRed);
  }

  calculateLife() {
    let base = this.baseData.life;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level);
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    return val * (this.baseData.multiplier?.life || 1) * (1 - hpRed);
  }

  calculateDamage() {
    let base = this.baseData.damage || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level);
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    return val * (this.baseData.multiplier?.damage || 1) * (1 - dmgRed);
  }

  calculateArmor() {
    let base = this.baseData.armor || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level);
    return val * (this.baseData.multiplier?.armor || 1);
  }

  calculateEvasion() {
    let base = this.baseData.evasion || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level);
    return val * (this.baseData.multiplier?.evasion || 1);
  }

  calculateAttackRating() {
    let base = this.baseData.attackRating || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level);
    return val * (this.baseData.multiplier?.attackRating || 1);
  }

  calculateElementalDamage(type) {
    let base = this.baseData[`${type}Damage`] || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level);

    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    return val * (this.baseData.multiplier?.[`${type}Damage`] || 1) * (1 - dmgRed);
  }

  calculateElementalResistance(type) {
    let base = this.baseData[`${type}Resistance`] || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level);
    return val * (this.baseData.multiplier?.[`${type}Resistance`] || 1);
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