/**
 * Base Enemy class containing shared logic for all enemy types.
 * This class is extended by explore enemies, arena bosses, and rocky field enemies.
 */
import { game } from './globals.js';
import { BLEED_DURATION_MS, BURN_DURATION_MS, SHOCK_DURATION_MS } from './constants/ailments.js';

class EnemyBase {
  constructor() {
    this.currentLife = 0;
    this.lastAttack = Date.now();
    this.bleed = null;
    this.burn = null;
    this.shock = null;
  }

  /**
   * Recalculate stats when reductions are applied from skills (usually buffs, but can be instant too)
   * This method should be overridden by subclasses to implement specific recalculation logic
   */
  recalculateStats() {
    // Subclasses should override this method
  }

  /**
   * Check if enemy can attack based on attack speed and time since last attack
   * @param {number} currentTime - Current timestamp in ms
   * @returns {boolean} - Whether the enemy can attack
   */
  canAttack(currentTime) {
    if (this.attackSpeed <= 0) return false;
    const timeBetweenAttacks = 1000 / this.attackSpeed;
    return currentTime - this.lastAttack >= timeBetweenAttacks;
  }

  /**
   * Reset enemy life to full and clear all status effects
   */
  resetLife() {
    this.currentLife = this.life;
    this.bleed = null;
    this.burn = null;
    this.shock = null;
  }

  /**
   * Apply bleed damage over time effect
   * @param {number} damage - Amount of damage to add to the bleed pool
   */
  applyBleed(damage) {
    if (!this.bleed) {
      this.bleed = { damagePool: 0, duration: BLEED_DURATION_MS };
    }
    this.bleed.damagePool += damage;
    this.bleed.duration = BLEED_DURATION_MS;
  }

  /**
   * Apply burn damage over time effect
   * @param {number} damage - Amount of damage to add to the burn pool
   */
  applyBurn(damage) {
    if (!this.burn) {
      this.burn = { damagePool: 0, duration: BURN_DURATION_MS };
    }
    this.burn.damagePool += damage;
    this.burn.duration = BURN_DURATION_MS;
  }

  /**
   * Apply shock status effect
   */
  applyShock() {
    if (!this.shock) {
      this.shock = { duration: SHOCK_DURATION_MS };
      return;
    }
    this.shock.duration = SHOCK_DURATION_MS;
  }

  /**
   * Process damage over time effects (bleed, burn)
   * @param {number} deltaMs - Time delta in milliseconds
   */
  processDoT(deltaMs) {
    if (this.currentLife <= 0) return;

    if (this.bleed) {
      if (this.bleed.duration > 0) {
        const tickMs = Math.min(deltaMs, this.bleed.duration);
        const damage = (this.bleed.damagePool / this.bleed.duration) * tickMs;

        if (damage > 0) {
          game.damageEnemy(damage, false, null, 'bleed');
          this.bleed.damagePool -= damage;
        }
        this.bleed.duration -= deltaMs;
      }
      if (this.bleed.duration <= 0 || this.bleed.damagePool <= 1e-6) {
        this.bleed = null;
      }
    }

    if (this.burn) {
      if (this.burn.duration > 0) {
        const tickMs = Math.min(deltaMs, this.burn.duration);
        const damage = (this.burn.damagePool / this.burn.duration) * tickMs;

        if (damage > 0) {
          game.damageEnemy(damage, false, null, 'burn');
          this.burn.damagePool -= damage;
        }
        this.burn.duration -= deltaMs;
      }
      if (this.burn.duration <= 0 || this.burn.damagePool <= 1e-6) {
        this.burn = null;
      }
    }

    if (this.shock) {
      this.shock.duration -= deltaMs;
      if (this.shock.duration <= 0) {
        this.shock = null;
      }
    }
  }

  /**
   * Heal the enemy by a certain amount
   * @param {number} amount - Amount of healing
   * @returns {number} - Actual amount healed
   */
  heal(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return 0;
    }
    const previousLife = this.currentLife;
    this.currentLife = Math.min(this.life, this.currentLife + amount);
    return this.currentLife - previousLife;
  }

  /**
   * Inflict damage to the enemy
   * @param {number} amount - Amount of damage
   * @returns {boolean} - True if enemy is dead after damage
   */
  takeDamage(amount) {
    this.currentLife -= amount;
    return this.currentLife <= 0;
  }
}

export default EnemyBase;
