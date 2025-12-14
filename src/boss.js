/**
 * Manages boss properties and state.
 */
import { percentIncreasedByLevel,
  scaleStat,
  computeScaledReward,
  xpDiminishingFactor,
  setStepFunctionMetadata,
} from './common.js';
import { BOSSES } from './constants/bosses.js';
import { hero, options, game } from './globals.js';
import { battleLog } from './battleLog.js';

import { ELEMENTS } from './constants/common.js';
import { BLEED_DURATION_MS, BURN_DURATION_MS } from './constants/ailments.js';
import { t, tp } from './i18n.js';
import { getCurrentBossRegion } from './bossRegion.js';
import { formatNumber as formatNumberValue } from './utils/numberFormatter.js';

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
setStepFunctionMetadata(stat_increase, 50, 1);
const attackRatingAndEvasionScale = 0.7;

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

const REGION_VARIANCE_CONFIG = {
  balanced_grounds: { type: 'elemental', boosted: ['fire', 'earth'] },
  shattered_bulwark: { type: 'elemental', boosted: ['air', 'lightning'] },
  elemental_nexus: { type: 'elemental', boosted: ['cold', 'water'] },
  iron_vanguard: { type: 'armor' },
  twilight_frontier: {
    type: 'elemental',
    boosted: ['lightning', 'cold', 'air'],
    boostedDamageRange: [1.05, 1.2],
    boostedResistanceRange: [1.05, 1.25],
    nonBoostedResistanceRange: [0.75, 1.05],
  },
  voidscarred_wastes: {
    type: 'elemental',
    boosted: ['fire', 'earth', 'lightning'],
    boostedDamageRange: [1.08, 1.25],
    boostedResistanceRange: [1.1, 1.3],
    nonBoostedResistanceRange: [0.85, 1.1],
  },
  celestial_crucible: {
    type: 'elemental',
    boosted: ['fire', 'air', 'lightning', 'cold'],
    boostedDamageRange: [1.1, 1.28],
    boostedResistanceRange: [1.12, 1.32],
    nonBoostedResistanceRange: [0.95, 1.18],
  },
  paradox_realm: { type: 'chaos' },
};

function applyRegionVariance(region, multipliers = {}) {
  if (!region) {
    return { ...multipliers };
  }

  const config = REGION_VARIANCE_CONFIG[region.id];
  if (!config) {
    return { ...multipliers };
  }

  const result = { ...multipliers };
  const scaleStatWithVariance = (stat, min, max) => {
    const base = Number.isFinite(result[stat]) ? result[stat] : 1;
    result[stat] = base * randomInRange(min, max);
  };

  if (config.type === 'elemental') {
    const lifeRange = config.lifeRange || [0.95, 1.1];
    const damageRange = config.damageRange || [0.95, 1.15];
    const attackRange = config.attackRange || [1.05, 1.2];
    const evasionRange = config.evasionRange || [1.05, 1.2];
    const armorRange = config.armorRange || [0.9, 1.05];

    scaleStatWithVariance('life', lifeRange[0], lifeRange[1]);
    scaleStatWithVariance('damage', damageRange[0], damageRange[1]);
    scaleStatWithVariance('attackRating', attackRange[0], attackRange[1]);
    scaleStatWithVariance('evasion', evasionRange[0], evasionRange[1]);
    scaleStatWithVariance('armor', armorRange[0], armorRange[1]);

    const boosted = new Set(config.boosted);
    const boostedDamageRange = config.boostedDamageRange || [0.95, 1.1];
    const boostedResistanceRange = config.boostedResistanceRange || [0.9, 1.1];
    const nonBoostedResistanceRange = config.nonBoostedResistanceRange || [0.4, 0.7];

    Object.values(ELEMENTS).forEach(({ id }) => {
      if (boosted.has(id)) {
        scaleStatWithVariance(`${id}Damage`, boostedDamageRange[0], boostedDamageRange[1]);
        scaleStatWithVariance(`${id}Resistance`, boostedResistanceRange[0], boostedResistanceRange[1]);
      } else {
        scaleStatWithVariance(
          `${id}Resistance`,
          nonBoostedResistanceRange[0],
          nonBoostedResistanceRange[1],
        );
      }
    });
  } else if (config.type === 'armor') {
    scaleStatWithVariance('life', 0.95, 1.1);
    scaleStatWithVariance('damage', 0.95, 1.05);
    scaleStatWithVariance('attackRating', 0.95, 1.05);
    scaleStatWithVariance('evasion', 0.9, 1.05);
    scaleStatWithVariance('armor', 1.05, 1.25);

    Object.values(ELEMENTS).forEach(({ id }) => {
      scaleStatWithVariance(`${id}Resistance`, 0.6, 0.9);
    });
  } else if (config.type === 'chaos') {
    scaleStatWithVariance('life', 1.15, 1.35);
    scaleStatWithVariance('damage', 1.2, 1.4);
    scaleStatWithVariance('attackRating', 1.2, 1.35);
    scaleStatWithVariance('evasion', 1.15, 1.3);
    scaleStatWithVariance('armor', 1.15, 1.35);

    Object.values(ELEMENTS).forEach(({ id }) => {
      scaleStatWithVariance(`${id}Damage`, 1.05, 1.25);
      scaleStatWithVariance(`${id}Resistance`, 0.95, 1.25);
    });
  }

  return result;
}

class Boss {
  /**
   * Create a new Boss instance with a random boss definition.
   * @throws {Error} If no bosses are defined in BOSSES.
   */
  constructor() {
    if (!BOSSES.length) {
      throw new Error('No bosses defined in BOSSES array.');
    }
    this.region = getCurrentBossRegion();
    const multiplier = this.region?.multiplier;
    const baseRegionMultiplier =
      typeof multiplier === 'function' ? multiplier() : multiplier ? { ...multiplier } : {};
    this.regionMultiplier = applyRegionVariance(this.region, baseRegionMultiplier);
    const regionBossIds = this.region?.bosses;
    let availableBosses =
      Array.isArray(regionBossIds) && regionBossIds.length
        ? BOSSES.filter((boss) => regionBossIds.includes(boss.id))
        : BOSSES;

    if (!availableBosses.length) {
      availableBosses = BOSSES;
    }

    const baseData = availableBosses[Math.floor(Math.random() * availableBosses.length)];
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
    battleLog.addBattle(
      tp('battleLog.encounteredBoss', {
        level: formatNumberValue(this.level, options?.shortNumbers),
        name: t(this.name),
      }),
    );
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
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    const basePercent = stat_increase(this.level);
    const diminishing = xpDiminishingFactor(this.level);
    const val = computeScaledReward(this.baseData.xp || 0, this.level, basePercent, levelBonus, diminishing);
    const regionMultiplier = Number.isFinite(this.regionMultiplier?.xp) ? this.regionMultiplier.xp : 1;
    return val * (this.baseData.multiplier?.xp || 1) * regionMultiplier;
  }

  calculateGold() {
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    const basePercent = stat_increase(this.level);
    const diminishing = xpDiminishingFactor(this.level);
    const val = computeScaledReward(this.baseData.gold || 0, this.level, basePercent, levelBonus, diminishing);
    const regionMultiplier = Number.isFinite(this.regionMultiplier?.gold) ? this.regionMultiplier.gold : 1;
    return val * (this.baseData.multiplier?.gold || 1) * regionMultiplier;
  }


  calculateAttackSpeed() {
    const baseSpeed =
      (this.baseData.attackSpeed || 1) *
      (this.baseData.multiplier?.attackSpeed || 1) *
      (Number.isFinite(this.regionMultiplier?.attackSpeed) ? this.regionMultiplier.attackSpeed : 1);
    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    return baseSpeed * (1 - speedRed);
  }

  calculateLife() {
    let base = this.baseData.life;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    const regionMultiplier = Number.isFinite(this.regionMultiplier?.life) ? this.regionMultiplier.life : 1;
    return val * (this.baseData.multiplier?.life || 1) * regionMultiplier * (1 - hpRed);
  }

  calculateDamage() {
    let base = this.baseData.damage || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    const regionMultiplier = Number.isFinite(this.regionMultiplier?.damage) ? this.regionMultiplier.damage : 1;
    return val * (this.baseData.multiplier?.damage || 1) * regionMultiplier * (1 - dmgRed);
  }

  calculateArmor() {
    let base = this.baseData.armor || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    const regionMultiplier = Number.isFinite(this.regionMultiplier?.armor) ? this.regionMultiplier.armor : 1;
    return val * (this.baseData.multiplier?.armor || 1) * regionMultiplier;
  }

  calculateEvasion() {
    let base = this.baseData.evasion || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return (
      val *
      (this.baseData.multiplier?.evasion || 1) *
      (Number.isFinite(this.regionMultiplier?.evasion) ? this.regionMultiplier.evasion : 1) *
      attackRatingAndEvasionScale
    );
  }

  calculateAttackRating() {
    let base = this.baseData.attackRating || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return (
      val *
      (this.baseData.multiplier?.attackRating || 1) *
      (Number.isFinite(this.regionMultiplier?.attackRating) ? this.regionMultiplier.attackRating : 1) *
      attackRatingAndEvasionScale
    );
  }

  calculateElementalDamage(type) {
    let base = this.baseData[`${type}Damage`] || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);

    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    return (
      val *
      (this.baseData.multiplier?.[`${type}Damage`] || 1) *
      (Number.isFinite(this.regionMultiplier?.[`${type}Damage`]) ? this.regionMultiplier[`${type}Damage`] : 1) *
      (1 - dmgRed)
    );
  }

  calculateElementalResistance(type) {
    let base = this.baseData[`${type}Resistance`] || 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * INCREASE_PER_LEVEL;
    base *= levelBonus;

    if (base === 0) return 0;
    const val = scaleStat(base, this.level, 0, 0, 0, this.baseScale);
    return (
      val *
      (this.baseData.multiplier?.[`${type}Resistance`] || 1) *
      (Number.isFinite(this.regionMultiplier?.[`${type}Resistance`])
        ? this.regionMultiplier[`${type}Resistance`]
        : 1)
    );
  }

  /**
   * Inflict damage to the boss.
   * @param {number} amount Amount of damage.
   * @returns {boolean} True if boss is dead after damage.
   */
  takeDamage(amount) {
    this.currentLife -= amount;
    // On death
    if (this.currentLife <= 0) {
      return true;
    }
    return false;
  }

  /**
   * Reset boss life to full.
   */
  resetLife() {
    this.currentLife = this.life;
    this.bleed = null;
    this.burn = null;
  }

  applyBleed(damage) {
    if (!this.bleed) {
      this.bleed = { damagePool: 0, duration: BLEED_DURATION_MS };
    }
    this.bleed.damagePool += damage;
    this.bleed.duration = BLEED_DURATION_MS;
  }

  applyBurn(damage) {
    if (!this.burn) {
      this.burn = { damagePool: 0, duration: BURN_DURATION_MS };
    }
    this.burn.damagePool += damage;
    this.burn.duration = BURN_DURATION_MS;
  }

  processDoT(deltaMs) {
    if (this.currentLife <= 0) return;

    if (this.bleed) {
      if (this.bleed.duration > 0) {
        // Calculate damage for this tick based on remaining pool and duration
        // We want to deplete the pool over the remaining duration
        // rate = pool / duration (dmg/ms)
        // tickDmg = rate * deltaMs
        // However, if deltaMs > duration, we just deal remainder.
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
