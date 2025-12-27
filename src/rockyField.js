import { ROCKY_FIELD_BASE_STATS, ROCKY_FIELD_ENEMIES } from './constants/rocky_field.js';
import { createPercentScaleFunction, scaleStat, computeScaledReward, xpDiminishingFactor } from './common.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';
import { ELEMENTS } from './constants/common.js';
import { MAX_CONVERSION_PERCENT, MIN_CONVERSION_PERCENT } from './constants/runes.js';
import { hero, options } from './globals.js';
import { formatNumber as formatNumberValue } from './utils/numberFormatter.js';
import EnemyBase from './enemyBase.js';

export const ROCKY_FIELD_REGIONS = [
  {
    id: 'outskirts',
    get name() {
      return t('rockyField.region.outskirts.name');
    },
    get description() {
      return t('rockyField.region.outskirts.desc');
    },
    unlockStage: 1,
    multiplier: {
      life: 1,
      damage: 1,
      armor: 1,
      fireResistance: 1,
      coldResistance: 1,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 1,
      attackSpeed: 1,
      attackRating: 1,
      evasion: 1,
      xp: 1,
      gold: 1,
    },
  },
  {
    id: 'boulders',
    get name() {
      return t('rockyField.region.boulders.name');
    },
    get description() {
      return t('rockyField.region.boulders.desc');
    },
    unlockStage: 500,
    multiplier: {
      life: 3,
      damage: 3,
      armor: 3,
      fireResistance: 3,
      coldResistance: 3,
      airResistance: 3,
      earthResistance: 3,
      lightningResistance: 3,
      waterResistance: 3,
      attackSpeed: 0.8,
      attackRating: 3,
      evasion: 3,
      xp: 3,
      gold: 3,
    },
  },
  {
    id: 'caves',
    get name() {
      return t('rockyField.region.caves.name');
    },
    get description() {
      return t('rockyField.region.caves.desc');
    },
    unlockStage: 1000,
    multiplier: {
      life: 12,
      damage: 12,
      armor: 12,
      fireResistance: 12,
      coldResistance: 12,
      airResistance: 12,
      earthResistance: 12,
      lightningResistance: 12,
      waterResistance: 12,
      attackSpeed: 1,
      attackRating: 12,
      evasion: 12,
      xp: 12,
      gold: 12,
    },
  },
  {
    id: 'cliffs',
    get name() {
      return t('rockyField.region.cliffs.name');
    },
    get description() {
      return t('rockyField.region.cliffs.desc');
    },
    unlockStage: 2000,
    multiplier: {
      life: 48,
      damage: 48,
      armor: 48,
      fireResistance: 48,
      coldResistance: 48,
      airResistance: 48,
      earthResistance: 48,
      lightningResistance: 48,
      waterResistance: 48,
      attackSpeed: 0.9,
      attackRating: 48,
      evasion: 48,
      xp: 40,
      gold: 40,
    },
  },
  {
    id: 'valley',
    get name() {
      return t('rockyField.region.valley.name');
    },
    get description() {
      return t('rockyField.region.valley.desc');
    },
    unlockStage: 4000,
    multiplier: {
      life: 288,
      damage: 288,
      armor: 288,
      fireResistance: 288,
      coldResistance: 288,
      airResistance: 288,
      earthResistance: 288,
      lightningResistance: 288,
      waterResistance: 288,
      attackSpeed: 1,
      attackRating: 288,
      evasion: 288,
      xp: 250,
      gold: 250,
    },
  },
  {
    id: 'summit',
    get name() {
      return t('rockyField.region.summit.name');
    },
    get description() {
      return t('rockyField.region.summit.desc');
    },
    unlockStage: 5000,
    multiplier: {
      life: 2880,
      damage: 2880,
      armor: 2880,
      fireResistance: 2880,
      coldResistance: 2880,
      airResistance: 2880,
      earthResistance: 2880,
      lightningResistance: 2880,
      waterResistance: 2880,
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
  outskirts: createPercentScaleFunction(0.65, 25, 0.025, 3.2),
  boulders: createPercentScaleFunction(0.6, 30, 0.02, 2.9),
  caves: createPercentScaleFunction(0.55, 35, 0.015, 2.5),
  cliffs: createPercentScaleFunction(0.5, 40, 0.01, 2.2),
  valley: createPercentScaleFunction(0.45, 45, 0.01, 2),
  summit: createPercentScaleFunction(0.4, 50, 0.01, 1.8),
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

const REGION_RUNE_RANGES = {
  outskirts: { min: 10, max: 30 },
  boulders: { min: 30, max: 50 },
  caves: { min: 50, max: 70 },
  cliffs: { min: 70, max: 90 },
  valley: { min: 90, max: 120 },
  summit: { min: 120, max: 150 },
};

// Conversion rolls use a low-percent band, a truncated normal mid-band, and a rare
// high-percent tail so that:
//  • Early regions still surface a couple of 10-20% runes in a typical batch
//  • Mid tiers average around the mid-50s with a healthy spread up to ~90%
//  • 100%+ conversions remain extremely rare no matter the stage
const HIGH_CONVERSION_START = 100;
const HIGH_CONVERSION_CHANCE = 1 / 2000;
const LOW_BAND_MAX = 20;
const LOW_BAND_WEIGHT_MAX = 0.24;
const LOW_BAND_WEIGHT_MIN = 0.12;
const STAGE_WEIGHT = 0.6;
const REGION_WEIGHT = 0.2;
const SYNERGY_WEIGHT = 0.2;

const DEFAULT_REGION_RUNE_RANGE = { min: MIN_CONVERSION_PERCENT, max: MAX_CONVERSION_PERCENT };
const REGION_MAX_VALUES = Object.values(REGION_RUNE_RANGES).map((range) => range.max);
const REGION_DIFFICULTY_MIN = Math.min(...REGION_MAX_VALUES);
const REGION_DIFFICULTY_RANGE = Math.max(1, Math.max(...REGION_MAX_VALUES) - REGION_DIFFICULTY_MIN);
const LOW_BAND_FRACTION = (LOW_BAND_MAX - MIN_CONVERSION_PERCENT) / (MAX_CONVERSION_PERCENT - MIN_CONVERSION_PERCENT);

function sampleTruncatedNormal(mean, std) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = mean + std * z;
    if (value >= 0 && value <= 1) {
      return value;
    }
  }
  return Math.min(1, Math.max(0, mean));
}

function getRegionRuneRange(regionId) {
  return REGION_RUNE_RANGES[regionId] ?? DEFAULT_REGION_RUNE_RANGE;
}

function scaleNormalizedToRange(value, range) {
  const clamped = Math.min(1, Math.max(0, value));
  const span = Math.max(0, range.max - range.min);
  if (span === 0) {
    return range.min;
  }
  return Math.max(range.min, Math.min(range.max, range.min + Math.round(clamped * span)));
}

function rollLowBandPercent(regionRange) {
  const span = Math.max(0, regionRange.max - regionRange.min);
  const width = Math.max(1, Math.round(span * LOW_BAND_FRACTION));
  const lowMax = Math.min(regionRange.max, regionRange.min + width);
  const options = lowMax - regionRange.min + 1;
  const bias = 0.25;
  const roll = 1 - Math.pow(Math.random(), bias);
  const offset = Math.floor(roll * options);
  return Math.min(lowMax, regionRange.min + offset);
}

export function getRockyFieldRunePercent(regionId, stage) {
  const stageNorm = Math.min(Math.max(stage || 0, 0), 5000) / 5000;
  const regionRange = getRegionRuneRange(regionId);
  const regionBase = regionRange.max;
  const regionNorm = (regionBase - REGION_DIFFICULTY_MIN) / REGION_DIFFICULTY_RANGE;
  const synergy = stageNorm * regionNorm;
  const difficulty = Math.min(1, STAGE_WEIGHT * stageNorm + REGION_WEIGHT * regionNorm + SYNERGY_WEIGHT * synergy);

  const highStart = Math.max(regionRange.min, HIGH_CONVERSION_START);
  if (regionRange.max >= highStart && Math.random() < HIGH_CONVERSION_CHANCE) {
    const highRange = Math.max(1, regionRange.max - highStart + 1);
    const highRoll = highStart + Math.floor(Math.random() * highRange);
    return Math.max(highStart, Math.min(regionRange.max, highRoll));
  }

  const lowBandWeight = Math.max(
    LOW_BAND_WEIGHT_MIN,
    Math.min(LOW_BAND_WEIGHT_MAX, LOW_BAND_WEIGHT_MAX - difficulty * 0.1)
  );
  if (Math.random() < lowBandWeight) {
    return rollLowBandPercent(regionRange);
  }

  const meanNorm = 0.38 + difficulty * 0.32;
  const stdNorm = Math.max(0.18, 0.42 - difficulty * 0.18);
  const roll = sampleTruncatedNormal(meanNorm, stdNorm);
  const scaled = scaleNormalizedToRange(roll, {
    min: regionRange.min,
    max: Math.min(regionRange.max, HIGH_CONVERSION_START - 1),
  });

  return Math.max(regionRange.min, Math.min(regionRange.max, scaled));
}

export class RockyFieldEnemy extends EnemyBase {
  constructor(regionId, level) {
    super();
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
    this.special = Array.isArray(baseData.special) ? [...baseData.special] : [];
    this.specialData = { ...(baseData.specialData || {}) };
    this.runeDrop = baseData.runeDrop || [];

    this.baseScale = REGION_STAT_SCALE[regionId](level);

    // Calculate all stats using dedicated methods
    this.attackSpeed = this.calculateAttackSpeed();
    this.life = this.calculateLife();
    this.damage = this.calculateDamage();
    this.armor = this.calculateArmor();
    this.evasion = this.calculateEvasion();
    this.attackRating = this.calculateAttackRating();
    this.xp = this.calculateXP();
    this.gold = this.calculateGold();

    // Calculate elemental damages and resistances
    ELEMENT_IDS.forEach((id) => {
      this[`${id}Damage`] = this.calculateElementalDamage(id);
      this[`${id}Resistance`] = this.calculateElementalResistance(id);
    });

    this.currentLife = this.life;
    this.lastAttack = Date.now();

    const rarityName = t('rarity.normal');
    battleLog.addBattle(
      tp('battleLog.encounteredEnemy', {
        rarity: rarityName,
        level: formatNumberValue(this.level, options?.shortNumbers),
        name: t(this.name),
      })
    );
  }

  // Helper methods for stat calculations
  getRegion() {
    const region = ROCKY_FIELD_REGIONS.find((r) => r.id === this.regionId);
    if (!region) {
      throw new Error(`No region defined for "${this.regionId}"`);
    }
    return region;
  }

  getMultiplierValue(source, stat) {
    const value = source[stat];
    return value === undefined ? 1 : value;
  }

  getSpecialMultiplier(key) {
    const value = this.specialData?.[key];
    return Number.isFinite(value) ? value : 1;
  }

  getStatValue(stat, defaultValue = 0) {
    const region = this.getRegion();
    const regionMultipliers = region.multiplier;
    const enemyMultipliers = this.baseData.multiplier || {};

    const base = ROCKY_FIELD_BASE_STATS[stat];
    const baseValue = base === undefined ? defaultValue : base;
    const regionMultiplier = this.getMultiplierValue(regionMultipliers, stat);
    const enemyMultiplier = this.getMultiplierValue(enemyMultipliers, stat);
    return baseValue * regionMultiplier * enemyMultiplier;
  }

  getStatMultiplier() {
    const baseScale = BASE_SCALE_PER_REGION_AND_LEVEL[this.regionId] || { tierScale: 1, levelScale: 0 };
    const levelBonus = 1 + Math.floor(this.level / 20) * baseScale.levelScale;
    return baseScale.tierScale * levelBonus;
  }

  // Calculate methods (consistent with Enemy and Boss classes)
  calculateAttackSpeed() {
    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    const attackSpeedBoost = this.getSpecialMultiplier('attackSpeedMultiplier');
    return this.getStatValue('attackSpeed', 1) * attackSpeedBoost * (1 - speedRed);
  }

  calculateLife() {
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    const statMultiplier = this.getStatMultiplier();
    return scaleStat(this.getStatValue('life') * statMultiplier, this.level, 0, 0, 0, this.baseScale) * (1 - hpRed);
  }

  calculateDamage() {
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    const statMultiplier = this.getStatMultiplier();
    return Math.floor(
      Math.max(
        scaleStat(this.getStatValue('damage') * statMultiplier, this.level, 0, 0, 0, this.baseScale) * (1 - dmgRed),
        1
      )
    );
  }

  calculateArmor() {
    const statMultiplier = this.getStatMultiplier();
    const armorMult = this.getSpecialMultiplier('armorMultiplier');
    return Math.floor(
      scaleStat(this.getStatValue('armor') * statMultiplier, this.level, 0, 0, 0, this.baseScale) * armorMult
    );
  }

  calculateEvasion() {
    const statMultiplier = this.getStatMultiplier();
    return Math.floor(scaleStat(this.getStatValue('evasion') * statMultiplier, this.level, 0, 0, 0, this.baseScale));
  }

  calculateAttackRating() {
    const statMultiplier = this.getStatMultiplier();
    return Math.floor(
      scaleStat(this.getStatValue('attackRating') * statMultiplier, this.level, 0, 0, 0, this.baseScale)
    );
  }

  calculateXP() {
    const baseScale = BASE_SCALE_PER_REGION_AND_LEVEL[this.regionId] || { tierScale: 1, levelScale: 0 };
    const baseAtL1 = this.getStatValue('xp') * baseScale.tierScale;
    const basePercentFn = REGION_STAT_SCALE[this.regionId];
    const basePercent = basePercentFn ? basePercentFn(this.level) : 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * baseScale.levelScale;
    const diminishing = xpDiminishingFactor(this.level);
    return computeScaledReward(baseAtL1, this.level, basePercent, levelBonus, diminishing);
  }

  calculateGold() {
    const baseScale = BASE_SCALE_PER_REGION_AND_LEVEL[this.regionId] || { tierScale: 1, levelScale: 0 };
    const baseGoldAtL1 = this.getStatValue('gold') * baseScale.tierScale;
    const basePercentFn = REGION_STAT_SCALE[this.regionId];
    const basePercent = basePercentFn ? basePercentFn(this.level) : 0;
    const levelBonus = 1 + Math.floor(this.level / 20) * baseScale.levelScale;
    const diminishing = xpDiminishingFactor(this.level);
    return computeScaledReward(baseGoldAtL1, this.level, basePercent, levelBonus, diminishing);
  }

  calculateElementalDamage(id) {
    const region = this.getRegion();
    const regionMultipliers = region.multiplier;
    const enemyMultipliers = this.baseData.multiplier || {};
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;
    const statMultiplier = this.getStatMultiplier();

    const enemyElMult = this.getMultiplierValue(enemyMultipliers, `${id}Damage`);
    const regionElMult = this.getMultiplierValue(regionMultipliers, `${id}Damage`);
    const hasElementalDamage = enemyElMult !== 1 || regionElMult !== 1 || this.getStatValue(`${id}Damage`) > 0;

    // If an elemental multiplier is present but no explicit base value,
    // use the physical damage base as the template for elemental damage.
    const baseDamageForElement = hasElementalDamage ? this.getStatValue('damage') * enemyElMult * regionElMult : 0;

    const configuredElementDamage = this.getStatValue(`${id}Damage`);
    const elementDamage = Math.max(baseDamageForElement, configuredElementDamage);

    const dmgBase = scaleStat(elementDamage * statMultiplier, this.level, 0, 0, 0, this.baseScale);
    return elementDamage > 0 ? Math.floor(Math.max(dmgBase * (1 - dmgRed), 1)) : 0;
  }

  calculateElementalResistance(id) {
    const statMultiplier = this.getStatMultiplier();
    const resistanceMult = this.getSpecialMultiplier('resistanceMultiplier');
    return Math.floor(
      scaleStat(this.getStatValue(`${id}Resistance`) * statMultiplier, this.level, 0, 0, 0, this.baseScale) *
        resistanceMult
    );
  }

  recalculateStats() {
    this.attackSpeed = this.calculateAttackSpeed();
    this.life = this.calculateLife();
    this.damage = this.calculateDamage();
    ELEMENT_IDS.forEach((id) => {
      this[`${id}Damage`] = this.calculateElementalDamage(id);
    });
  }
}

export default {
  regions: ROCKY_FIELD_REGIONS,
  getEnemies: getRockyFieldEnemies,
};
