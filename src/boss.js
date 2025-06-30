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
    this.id = def.id;
    this.name = def.name;
    this.image = def.image;

    // Base stats
    this.baseLife = 3000;
    this.baseDamage = 25;
    // Scaled stats
    this.life = (this.baseLife + hero.bossLevel * 677) * def.multiplier.life;
    this.currentLife = this.life;
    this.damage = (this.baseDamage + hero.bossLevel * 14) * def.multiplier.damage;
    // Attack timing for boss combat
    this.attackSpeed = def.attackSpeed || 1; // attacks per second
    this.lastAttack = Date.now();
    this.reward = def.reward;
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
      // Track kill and bump boss level
      statistics.increment('bossesKilled', null, 1);
      // Auto-select next boss
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
    return currentTime - this.lastAttack >= this.attackSpeed * 1000;
  }
}

export default Boss;
