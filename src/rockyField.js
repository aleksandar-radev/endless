import { ROCKY_FIELD_BASE_STATS, ROCKY_FIELD_ENEMIES } from './constants/rocky_field.js';
import {
  percentIncreasedByLevel,
  scaleStat,
  computeXPAdjustedMonotonic,
  xpDiminishingFactor,
} from './common.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';
import { ELEMENTS } from './constants/common.js';
import { MAX_CONVERSION_PERCENT, MIN_CONVERSION_PERCENT } from './constants/runes.js';
import { hero } from './globals.js';

export const ROCKY_FIELD_REGIONS = [
  {
    id: 'outskirts',
    name: 'Outskirts',
    description: 'The edge of the rocky expanse.',
    unlockStage: 1,
    multiplier: {
      life: 1,
      damage: 1,
      armor: 1,
      attackSpeed: 1,
      attackRating: 1,
      evasion: 1,
      xp: 1,
      gold: 1,
    },
  },
  {
    id: 'boulders',
    name: 'Boulder Basin',
    description: 'Boulders scatter this wide basin.',
    unlockStage: 500,
    multiplier: {
      life: 3,
      damage: 3,
      armor: 3,
      attackSpeed: 0.8,
      attackRating: 3,
      evasion: 3,
      xp: 3,
      gold: 3,
    },
  },
  {
    id: 'caves',
    name: 'Hidden Caves',
    description: 'Dark caverns hide unseen threats.',
    unlockStage: 1000,
    multiplier: {
      life: 12,
      damage: 12,
      armor: 12,
      attackSpeed: 1,
      attackRating: 12,
      evasion: 12,
      xp: 12,
      gold: 12,
    },
  },
  {
    id: 'cliffs',
    name: 'Sheer Cliffs',
    description: 'Treacherous cliffs tower above.',
    unlockStage: 2000,
    multiplier: {
      life: 48,
      damage: 48,
      armor: 48,
      attackSpeed: 0.9,
      attackRating: 48,
      evasion: 48,
      xp: 40,
      gold: 40,
    },
  },
  {
    id: 'valley',
    name: 'Silent Valley',
    description: 'A quiet valley with lurking danger.',
    unlockStage: 4000,
    multiplier: {
      life: 288,
      damage: 288,
      armor: 288,
      attackSpeed: 1,
      attackRating: 288,
      evasion: 288,
      xp: 250,
      gold: 250,
    },
  },
  {
    id: 'summit',
    name: 'Windy Summit',
    description: 'Blistering winds dominate the peak.',
    unlockStage: 5000,
    multiplier: {
      life: 2880,
      damage: 2880,
      armor: 2880,
      attackSpeed: 1.2,
      attackRating: 2880,
      evasion: 2880,
      xp: 500,
      gold: 500,
    },
  },
];

export function getRockyFieldEnemies(regionId) {
  return ROCKY_FIELD_ENEMIES.filter((e) => Array.isArray(e.tags) && e.tags.includes(regionId));
}

const ELEMENT_IDS = Object.keys(ELEMENTS);

const REGION_STAT_SCALE = {
  outskirts: (level) => percentIncreasedByLevel(0.65, level, 25, 0.025, 3.2),
  boulders: (level) => percentIncreasedByLevel(0.6, level, 30, 0.02, 2.9),
  caves: (level) => percentIncreasedByLevel(0.55, level, 35, 0.015, 2.5),
  cliffs: (level) => percentIncreasedByLevel(0.5, level, 40, 0.01, 2.2),
  valley: (level) => percentIncreasedByLevel(0.45, level, 45, 0.01, 2),
  summit: (level) => percentIncreasedByLevel(0.4, level, 50, 0.01, 1.8),
};

// Removed region-specific diminishing. XP/Gold now use global xpDiminishingFactor.

const BASE_SCALE_PER_REGION_AND_LEVEL = {
  outskirts: {
    tierScale: 0.6,
    levelScale: 0.01,
  },
  boulders: {
    tierScale: 1,
    levelScale: 0.01,
  },
  caves: {
    tierScale: 2,
    levelScale: 0.01,
  },
  cliffs: {
    tierScale: 2,
    levelScale: 0.01,
  },
  valley: {
    tierScale: 3,
    levelScale: 0.01,
  },
  summit: {
    tierScale: 3,
    levelScale: 0.01,
  },
};

const attackRatingAndEvasionScale = 0.6;

const REGION_RUNE_MAX = {
  outskirts: 5,
  boulders: 10,
  caves: 20,
  cliffs: 40,
  valley: 60,
  summit: 80,
};

// Bias values tuned so that:
//  • Stage 1, Outskirts ≈ 1/5,000 chance to roll the maximum conversion
//  • Stage 5,000, Summit ≈ 1/3,600 chance to roll the maximum conversion
const MIN_CONVERSION_BIAS = 26;
const MAX_CONVERSION_BIAS = 36;
const STAGE_WEIGHT = 0.6;
const REGION_WEIGHT = 0.2;
const SYNERGY_WEIGHT = 0.2;

const REGION_RUNE_VALUES = Object.values(REGION_RUNE_MAX);
const REGION_RUNE_MIN = Math.min(...REGION_RUNE_VALUES);
const REGION_RUNE_RANGE = Math.max(1, Math.max(...REGION_RUNE_VALUES) - REGION_RUNE_MIN);

export function getRockyFieldRunePercent(regionId, stage) {
  const stageNorm = Math.min(Math.max(stage || 0, 0), 5000) / 5000;
  const regionBase = REGION_RUNE_MAX[regionId] ?? REGION_RUNE_MIN;
  const regionNorm = (regionBase - REGION_RUNE_MIN) / REGION_RUNE_RANGE;
  const synergy = stageNorm * regionNorm;
  const difficulty = Math.min(
    1,
    STAGE_WEIGHT * stageNorm + REGION_WEIGHT * regionNorm + SYNERGY_WEIGHT * synergy,
  );

  const bias = MAX_CONVERSION_BIAS - difficulty * (MAX_CONVERSION_BIAS - MIN_CONVERSION_BIAS);
  const roll = Math.pow(Math.random(), bias);
  const range = MAX_CONVERSION_PERCENT - MIN_CONVERSION_PERCENT + 1;

  const percent = Math.floor(roll * range) + MIN_CONVERSION_PERCENT;
  return Math.max(MIN_CONVERSION_PERCENT, Math.min(MAX_CONVERSION_PERCENT, percent));
}

export class RockyFieldEnemy {
  constructor(regionId, level) {
    this.regionId = regionId;
    this.level = level;

    const regionEnemies = getRockyFieldEnemies(regionId);
    const baseData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    if (!baseData) {
      throw new Error(`No enemies defined for region "${regionId}"`);
    }
    this.baseData = baseData;

    this.name = baseData.name;
    this.image = baseData.image;
    this.special = baseData.special || [];
    this.runeDrop = baseData.runeDrop || [];

    const region = ROCKY_FIELD_REGIONS.find((r) => r.id === regionId);
    if (!region) {
      throw new Error(`No region defined for "${regionId}"`);
    }
    const regionMultipliers = region.multiplier;
    if (!regionMultipliers) {
      throw new Error(`No multipliers defined for region "${regionId}"`);
    }
    const enemyMultipliers = baseData.multiplier || {};
    const getMultiplierValue = (source, stat) => {
      const value = source[stat];
      return value === undefined ? 1 : value;
    };
    const getStatValue = (stat, defaultValue = 0) => {
      const base = ROCKY_FIELD_BASE_STATS[stat];
      const baseValue = base === undefined ? defaultValue : base;
      const regionMultiplier = getMultiplierValue(regionMultipliers, stat);
      const enemyMultiplier = getMultiplierValue(enemyMultipliers, stat);
      return baseValue * regionMultiplier * enemyMultiplier;
    };
    const baseScale = BASE_SCALE_PER_REGION_AND_LEVEL[regionId] || { tierScale: 1, levelScale: 0 };
    const levelBonus = 1 + Math.floor(level / 20) * baseScale.levelScale;
    const statMultiplier = baseScale.tierScale * levelBonus;

    this.baseScale = REGION_STAT_SCALE[regionId](level);
    // Diminishing is applied inside the monotonic computation below when needed

    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;

    this.attackSpeed = getStatValue('attackSpeed', 1) * (1 - speedRed);
    this.life = scaleStat(getStatValue('life') * statMultiplier, level, 0, 0, 0, this.baseScale) * (1 - hpRed);
    this.damage = Math.max(
      scaleStat(getStatValue('damage') * statMultiplier, level, 0, 0, 0, this.baseScale) * (1 - dmgRed),
      1,
    );
    this.armor = scaleStat(getStatValue('armor') * statMultiplier, level, 0, 0, 0, this.baseScale);
    this.evasion =
      scaleStat(getStatValue('evasion') * statMultiplier, level, 0, 0, 0, this.baseScale) *
      attackRatingAndEvasionScale;
    this.attackRating =
      scaleStat(getStatValue('attackRating') * statMultiplier, level, 0, 0, 0, this.baseScale) *
      attackRatingAndEvasionScale;
    // Monotonic XP in Rocky Field: accumulate per-level increments only
    const baseAtL1 = getStatValue('xp') * baseScale.tierScale; // levelBonus handled in series
    const levelBonusFn = (lvl) => 1 + Math.floor(lvl / 20) * baseScale.levelScale;
    this.xp = computeXPAdjustedMonotonic(
      baseAtL1,
      level,
      (lvl) => REGION_STAT_SCALE[regionId](lvl),
      levelBonusFn,
      (lvl) => xpDiminishingFactor(lvl),
      `rocky-${regionId}`,
    );
    const baseGoldAtL1 = getStatValue('gold') * baseScale.tierScale;
    this.gold = computeXPAdjustedMonotonic(
      baseGoldAtL1,
      level,
      (lvl) => REGION_STAT_SCALE[regionId](lvl),
      (lvl) => 1 + Math.floor(lvl / 20) * baseScale.levelScale,
      (lvl) => xpDiminishingFactor(lvl),
      `rocky-gold-${regionId}`,
    );

    ELEMENT_IDS.forEach((id) => {
      const enemyElMult = getMultiplierValue(enemyMultipliers, `${id}Damage`);
      const regionElMult = getMultiplierValue(regionMultipliers, `${id}Damage`);
      const hasElementalDamage =
        enemyElMult !== 1 || regionElMult !== 1 || getStatValue(`${id}Damage`) > 0;

      // If an elemental multiplier is present but no explicit base value,
      // use the physical damage base as the template for elemental damage.
      const baseDamageForElement = hasElementalDamage
        ? getStatValue('damage') * enemyElMult * regionElMult
        : 0;

      const configuredElementDamage = getStatValue(`${id}Damage`);
      const elementDamage = Math.max(baseDamageForElement, configuredElementDamage);

      const dmgBase = scaleStat(
        elementDamage * statMultiplier,
        level,
        0,
        0,
        0,
        this.baseScale,
      );
      this[`${id}Damage`] = elementDamage > 0 ? Math.max(dmgBase * (1 - dmgRed), 1) : 0;

      this[`${id}Resistance`] = scaleStat(
        getStatValue(`${id}Resistance`) * statMultiplier,
        level,
        0,
        0,
        0,
        this.baseScale,
      );
    });

    this.currentLife = this.life;
    this.lastAttack = Date.now();

    const rarityName = t('rarity.normal');
    battleLog.addBattle(tp('battleLog.encounteredEnemy', { rarity: rarityName, level: this.level, name: t(this.name) }));
  }

  // used when reductions are applied from skills usually buff, but can be instant too
  recalculateStats() {
    const region = ROCKY_FIELD_REGIONS.find((r) => r.id === this.regionId);
    const regionMultipliers = region.multiplier;
    const enemyMultipliers = this.baseData.multiplier || {};
    const getMultiplierValue = (source, stat) => {
      const value = source[stat];
      return value === undefined ? 1 : value;
    };
    const getStatValue = (stat, defaultValue = 0) => {
      const base = ROCKY_FIELD_BASE_STATS[stat];
      const baseValue = base === undefined ? defaultValue : base;
      const regionMultiplier = getMultiplierValue(regionMultipliers, stat);
      const enemyMultiplier = getMultiplierValue(enemyMultipliers, stat);
      return baseValue * regionMultiplier * enemyMultiplier;
    };
    const baseScale = BASE_SCALE_PER_REGION_AND_LEVEL[this.regionId] || { tierScale: 1, levelScale: 0 };
    const levelBonus = 1 + Math.floor(this.level / 20) * baseScale.levelScale;
    const statMultiplier = baseScale.tierScale * levelBonus;

    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;

    this.attackSpeed = getStatValue('attackSpeed', 1) * (1 - speedRed);
    this.life = scaleStat(getStatValue('life') * statMultiplier, this.level, 0, 0, 0, this.baseScale) * (1 - hpRed);
    this.damage = Math.max(
      scaleStat(getStatValue('damage') * statMultiplier, this.level, 0, 0, 0, this.baseScale) * (1 - dmgRed),
      1,
    );

    ELEMENT_IDS.forEach((id) => {
      const enemyElMult = getMultiplierValue(enemyMultipliers, `${id}Damage`);
      const regionElMult = getMultiplierValue(regionMultipliers, `${id}Damage`);
      const hasElementalDamage =
        enemyElMult !== 1 || regionElMult !== 1 || getStatValue(`${id}Damage`) > 0;

      // If an elemental multiplier is present but no explicit base value,
      // use the physical damage base as the template for elemental damage.
      const baseDamageForElement = hasElementalDamage
        ? getStatValue('damage') * enemyElMult * regionElMult
        : 0;

      const configuredElementDamage = getStatValue(`${id}Damage`);
      const elementDamage = Math.max(baseDamageForElement, configuredElementDamage);

      const dmgBase = scaleStat(
        elementDamage * statMultiplier,
        this.level,
        0,
        0,
        0,
        this.baseScale,
      );
      this[`${id}Damage`] = elementDamage > 0 ? Math.max(dmgBase * (1 - dmgRed), 1) : 0;
    });
  }

  canAttack(currentTime) {
    const timeBetweenAttacks = 1000 / this.attackSpeed;
    return currentTime - this.lastAttack >= timeBetweenAttacks;
  }

  resetLife() {
    this.currentLife = this.life;
  }

  takeDamage(damage) {
    this.currentLife -= damage;
    if (this.currentLife < 0) this.currentLife = 0;
    return this.currentLife <= 0;
  }
}

export default {
  regions: ROCKY_FIELD_REGIONS,
  getEnemies: getRockyFieldEnemies,
};
