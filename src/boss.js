/**
 * Manages boss properties and state.
 */
import { BOSSES } from './constants/bosses.js';
import { statistics, game, hero } from './globals.js';
import { selectBoss } from './ui/bossUi.js';

class Boss {
  /**
   * Create a new Boss instance with a random boss definition.
   * @throws {Error} If no bosses are defined in BOSSES.
   */
  constructor() {
    if (!BOSSES.length) {
      throw new Error('No bosses defined in BOSSES array.');
    }
    const def = BOSSES[Math.floor(Math.random() * BOSSES.length)];
    this.baseData = def;
    this.id = def.id;
    this.name = def.name;
    this.image = def.image;

    // Use boss definition stats and scale by boss level
    const lvl = hero.bossLevel || 1;

    // Life scaling (similar to enemy scaling, but with higher base)
    this.life = this.calculateLife(def, lvl);
    this.currentLife = this.life;

    // Damage scaling
    this.damage = this.calculateDamage(def, lvl);

    // Other stats
    this.attackSpeed = def.attackSpeed || 1;
    this.armor = this.calculateArmor(def, lvl);
    this.evasion = this.calculateEvasion(def, lvl);
    this.attackRating = this.calculateAttackRating(def, lvl);

    // Elemental damages
    this.fireDamage = (def.fireDamage || 0) * (def.multiplier?.fireDamage || 1);
    this.coldDamage = (def.coldDamage || 0) * (def.multiplier?.coldDamage || 1);
    this.airDamage = (def.airDamage || 0) * (def.multiplier?.airDamage || 1);
    this.earthDamage = (def.earthDamage || 0) * (def.multiplier?.earthDamage || 1);

    this.reward = def.reward;
    this.lastAttack = Date.now();
  }

  calculateLife(def, lvl) {
    // Example scaling: base + per level, then apply multiplier
    let life = def.life - 10;
    const segLen = 10, initialInc = 10, incStep = 5;
    for (let i = 1; i <= lvl; i++) {
      life += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return life * (def.multiplier?.life || 1);
  }

  calculateDamage(def, lvl) {
    let dmg = def.damage;
    const segLen = 10, initialInc = 0.3, incStep = 0.1;
    for (let i = 1; i <= lvl; i++) {
      dmg += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return dmg * (def.multiplier?.damage || 1);
  }

  calculateArmor(def, lvl) {
    const baseArmor = def.armor * lvl || 0;
    const segLen = 10, initialInc = 0.5, incStep = 0.2;
    let armor = baseArmor;
    for (let i = 1; i <= lvl; i++) {
      armor += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return armor * (def.multiplier?.armor || 1);
  }

  calculateEvasion(def, lvl) {
    const baseEvasion = def.evasion * lvl || 0;
    const segLen = 10, initialInc = 0.5, incStep = 0.2;
    let evasion = baseEvasion;
    for (let i = 1; i <= lvl; i++) {
      evasion += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return evasion * (def.multiplier?.evasion || 1);
  }

  calculateAttackRating(def, lvl) {
    const baseAttackRating = def.attackRating * lvl || 0;
    const segLen = 10, initialInc = 0.5, incStep = 0.2;
    let attackRating = baseAttackRating;
    for (let i = 1; i <= lvl; i++) {
      attackRating += initialInc + Math.floor((i - 1) / segLen) * incStep;
    }
    return attackRating * (def.multiplier?.attackRating || 1);
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
      statistics.increment('bossesKilled', null, 1);
      selectBoss(game);
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