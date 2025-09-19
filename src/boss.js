/**
 * Manages boss properties and state.
 */
import { percentIncreasedByLevel, percentReducedByLevel, scaleStat } from './common.js';
import { BOSSES } from './constants/bosses.js';
import { hero } from './globals.js';
import { battleLog } from './battleLog.js';
import { ELEMENTS } from './constants/common.js';
import { t, tp } from './i18n.js';

const INCREASE_PER_LEVEL = 0.01;
// Base scaling increases slowly at first, but after higher levels bosses scale faster.
// Above level 500, apply an extra percentage that ramps up every 1,000 levels, capped
// so that bosses grow stronger at high tiers without becoming impossible.
const stat_increase = (level) => {
  const base = percentIncreasedByLevel(0.1, level, 50, 0.1, 2);
  if (level <= 500) return base;
  const extra = percentIncreasedByLevel(0, level - 500, 1000, 0.5, 20);
  return base + extra;
};
const xp_gold_scale = (level) => percentReducedByLevel(1, level, 20, 0.01, 0.025);
const attackRatingAndEvasionScale = 0.7;

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

    this.baseScale = stat_increase(hero.bossLevel || 1);

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

    // Elemental damages and resistances
    Object.values(ELEMENTS).forEach(({ id }) => {
      this[`${id}Damage`] = this.calculateElementalDamage(id);
      this[`${id}Resistance`] = this.calculateElementalResistance(id);
    });

    this.reward = this.baseData.reward;
    this.lastAttack = Date.now();
    battleLog.addBattle(tp('battleLog.encounteredBoss', { level: this.level, name: t(this.name) }));
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


  calculateXP() {
    let base = this.baseData.xp || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const tierXpGoldScale = xp_gold_scale(this.level);
    return val * (this.baseData.multiplier?.xp || 1) * tierXpGoldScale;
  }

  calculateGold() {
    let base = this.baseData.gold || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const tierXpGoldScale = xp_gold_scale(this.level);
    return val * (this.baseData.multiplier?.gold || 1) * tierXpGoldScale;
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

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    return val * (this.baseData.multiplier?.life || 1) * (1 - hpRed);
  }

  calculateDamage() {
    let base = this.baseData.damage || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    return val * (this.baseData.multiplier?.damage || 1) * (1 - dmgRed);
  }

  calculateArmor() {
    let base = this.baseData.armor || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return val * (this.baseData.multiplier?.armor || 1);
  }

  calculateEvasion() {
    let base = this.baseData.evasion || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return val * (this.baseData.multiplier?.evasion || 1) * attackRatingAndEvasionScale;
  }

  calculateAttackRating() {
    let base = this.baseData.attackRating || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return val * (this.baseData.multiplier?.attackRating || 1) * attackRatingAndEvasionScale;
  }

  calculateElementalDamage(type) {
    let base = this.baseData[`${type}Damage`] || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);

    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    return val * (this.baseData.multiplier?.[`${type}Damage`] || 1) * (1 - dmgRed);
  }

  calculateElementalResistance(type) {
    let base = this.baseData[`${type}Resistance`] || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
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