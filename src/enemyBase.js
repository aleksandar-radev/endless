/**
 * Base Enemy class containing shared logic for all enemy types.
 * This class is extended by explore enemies, arena bosses, and rocky field enemies.
 */
import { game } from './globals.js';
import { AILMENTS } from './constants/ailments.js';

class EnemyBase {
  constructor() {
    this.currentLife = 0;
    this.lastAttack = Date.now();
    this.ailments = {};
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
    this.ailments = {};
  }

  /**
   * Apply bleed damage over time effect
   * @param {number} damage - Amount of damage to add to the bleed pool
   */
  applyBleed(damage) {
    const id = AILMENTS.bleed.id;
    if (!this.ailments[id]) {
      this.ailments[id] = { damagePool: 0, duration: AILMENTS.bleed.duration };
    }
    this.ailments[id].damagePool += damage;
    this.ailments[id].duration = AILMENTS.bleed.duration;
  }

  /**
   * Apply burn damage over time effect
   * @param {number} damage - Amount of damage to add to the burn pool
   */
  applyBurn(damage) {
    const id = AILMENTS.burn.id;
    if (!this.ailments[id]) {
      this.ailments[id] = { damagePool: 0, duration: AILMENTS.burn.duration };
    }
    this.ailments[id].damagePool += damage;
    this.ailments[id].duration = AILMENTS.burn.duration;
  }

  /**
   * Apply shock status effect
   * Shock does not deal damage but applies a status effect for the duration.
   * If already shocked, the duration is refreshed.
   */
  applyShock() {
    const id = AILMENTS.shock.id;
    if (!this.ailments[id]) {
      this.ailments[id] = { duration: AILMENTS.shock.duration };
      return;
    }
    this.ailments[id].duration = AILMENTS.shock.duration;
  }

  /**
   * Process damage over time effects (bleed, burn)
   * @param {number} deltaMs - Time delta in milliseconds
   */
  processDoT(deltaMs) {
    if (this.currentLife <= 0) return;

    Object.entries(this.ailments).forEach(([id, ailment]) => {
      if (ailment.duration > 0) {
        // Handle DoTs (Bleed, Burn)
        if (ailment.damagePool !== undefined) {
          const tickMs = Math.min(deltaMs, ailment.duration);
          // ensure at least 1 damage per tick if there's any damage left in pool
          const damage = Math.max((ailment.damagePool / ailment.duration) * tickMs, 1);

          if (damage > 0) {
            game.damageEnemy(damage, false, null, id);
            ailment.damagePool -= damage;
          }
        }

        // Reduce duration for all ailments
        ailment.duration -= deltaMs;

        // Cleanup
        if (ailment.duration <= 0 || (ailment.damagePool !== undefined && ailment.damagePool <= 1e-6)) {
          delete this.ailments[id];
        }
      } else {
        delete this.ailments[id];
      }
    });
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
