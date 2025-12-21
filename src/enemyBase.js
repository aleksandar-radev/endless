/**
 * Base Enemy class containing shared logic for all enemy types.
 * This class is extended by explore enemies, arena bosses, and rocky field enemies.
 */
import { game } from './globals.js';
import { AILMENTS } from './constants/ailments.js';

class EnemyBase {
  /**
   * Scaling system configuration
   * Set to 'simple' for the new simplified scaling system
   * Set to 'legacy' to use the old complex scaling system
   */
  static SCALING_SYSTEM = 'simple';

  /**
   * Mob Scaling Constants
   * 
   * Mobs scale based on two factors:
   * 1. Region scaling - multiplicative scaling per region tier
   * 2. Stage scaling - additive percentage scaling per stage from base value
   */
  
  // Multiplier applied to mob stats when moving from one region to the next
  // e.g., 5x means region 2 mobs have 5x the stats of region 1 mobs at the same stage
  static MOB_REGION_SCALING_MULTIPLIER = 5;
  
  // Percentage increase per stage based on the base value at stage 1
  // e.g., 0.1 means each stage increases mob stats by 10% of the base (stage 1) value
  static MOB_STAGE_SCALING_PERCENT = 0.1;

  /**
   * Item Scaling Constants
   * 
   * Items scale based on two factors:
   * 1. Region/tier scaling - multiplicative scaling per item tier
   * 2. Stage scaling - additive percentage scaling per stage from base value
   * 
   * Items have two types of stats:
   * - Flat values (e.g., +100 life, +50 damage)
   * - Percent values (e.g., +10% life, +5% damage)
   */
  
  // Multiplier applied to item flat values when moving from one tier to the next
  // e.g., 2x means tier 2 items have 2x the flat stats of tier 1 items at the same level
  static ITEM_FLAT_REGION_SCALING_MULTIPLIER = 2;
  
  // Multiplier applied to item percent values when moving from one tier to the next
  // e.g., 1.3x means tier 2 items have 1.3x the percent stats of tier 1 items at the same level
  static ITEM_PERCENT_REGION_SCALING_MULTIPLIER = 1.3;
  
  // Percentage increase per stage for item flat values based on the base value at level 1
  // e.g., 0.008 means each level increases flat stats by 0.8% of the base value
  static ITEM_FLAT_STAGE_SCALING_PERCENT = 0.008;
  
  // Percentage increase per stage for item percent values based on the base value at level 1
  // e.g., 0.001 means each level increases percent stats by 0.1% of the base value
  static ITEM_PERCENT_STAGE_SCALING_PERCENT = 0.001;

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
   * Apply poison damage over time effect
   * @param {number} damage - Amount of damage to add to the poison pool
   */
  applyPoison(damage) {
    const id = AILMENTS.poison.id;
    if (!this.ailments[id]) {
      this.ailments[id] = { damagePool: 0, duration: AILMENTS.poison.duration };
    }
    this.ailments[id].damagePool += damage;
    this.ailments[id].duration = AILMENTS.poison.duration;
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
