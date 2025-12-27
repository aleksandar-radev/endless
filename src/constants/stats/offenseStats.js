import { itemLevelScaling, createTierScaling, createStat, createPercentStat, createHiddenStat } from './stats.js';
import { ELEMENTS } from '../common.js';

const ELEMENTAL_DAMAGE_MIN = 8;
const ELEMENTAL_DAMAGE_MAX = 20;

const WAND_ELEMENTAL_FLAT_MULTIPLIER = 1.4;
const STAFF_ELEMENTAL_FLAT_MULTIPLIER = 1.75;
const WAND_ELEMENTAL_PERCENT_MULTIPLIER = 1.25;
const STAFF_ELEMENTAL_PERCENT_MULTIPLIER = 1.45;

const tierScalingMaxPercent = createTierScaling(100, 2000, 1.2);

const offenseScaling = (level, tier) => itemLevelScaling(level, tier);

const createElementalDamageConfig = () => ({
  min: ELEMENTAL_DAMAGE_MIN,
  max: ELEMENTAL_DAMAGE_MAX,
  scaling: (level, tier) => offenseScaling(level, tier),
  overrides: {
    WAND: {
      min: Math.round(ELEMENTAL_DAMAGE_MIN * WAND_ELEMENTAL_FLAT_MULTIPLIER),
      max: Math.round(ELEMENTAL_DAMAGE_MAX * WAND_ELEMENTAL_FLAT_MULTIPLIER),
    },
    STAFF: {
      min: Math.round(ELEMENTAL_DAMAGE_MIN * STAFF_ELEMENTAL_FLAT_MULTIPLIER),
      max: Math.round(ELEMENTAL_DAMAGE_MAX * STAFF_ELEMENTAL_FLAT_MULTIPLIER),
    },
  },
});

const createElementalDamagePercentConfig = () => ({
  tierScalingMaxPercent,
  overrides: {
    WAND: {
      min: 1,
      max: Math.round(100 * WAND_ELEMENTAL_PERCENT_MULTIPLIER),
    },
    STAFF: {
      min: 1,
      max: Math.round(100 * STAFF_ELEMENTAL_PERCENT_MULTIPLIER),
    },
  },
});

const generateElementalOffenseStats = () => {
  const stats = {};
  Object.keys(ELEMENTS).forEach((element) => {
    stats[`${element}Damage`] = createStat({
      item: createElementalDamageConfig(),
      itemTags: ['sword', 'dagger', 'gloves', 'magic'],
      show: true,
      sub: 'elemental',
    });
    stats[`${element}DamagePercent`] = createPercentStat({
      item: createElementalDamagePercentConfig(),
      itemTags: ['sword', 'dagger', 'jewelry', 'gloves', 'magic'],
      sub: 'elemental',
    });
    stats[`${element}Penetration`] = createStat({
      sub: 'elemental',
    });
    stats[`${element}PenetrationPercent`] = createPercentStat({
      sub: 'elemental',
    });
  });
  return stats;
};

export const OFFENSE_STATS = {
  damage: createStat({
    base: 10,
    training: { cost: 100, bonus: 1, maxLevel: Infinity },
    item: {
      min: 10,
      max: 28,
      scaling: (level, tier) => offenseScaling(level, tier),
      overrides: {
        AXE: { min: 14, max: 35 },
        MACE: { min: 16, max: 38 },
        DAGGER: { min: 6, max: 18 },
        BOW: { min: 8, max: 24 },
      },
    },
    itemTags: ['offense', 'sword', 'axe', 'mace', 'dagger', 'bow'],
    show: true,
    sub: 'attack',
  }),
  damagePerLevel: createStat({
    dec: 1,
  }),
  damagePercent: createPercentStat({
    item: {
      tierScalingMaxPercent,
      overrides: {
        WAND: { min: 0, max: 0 },
        STAFF: { min: 0, max: 0 },
      },
    },
    itemTags: ['offense', 'gloves'],
    sub: 'attack',
  }),
  totalDamagePercent: createPercentStat({
    sub: 'attack',
  }),
  attackSpeed: createStat({
    base: 1,
    dec: 2,
    show: true,
    sub: 'attack',
    cap: 5,
  }),
  attackSpeedPercent: createPercentStat({
    dec: 2,
    training: {
      cost: 400,
      costIncrease: 600,
      costIncreaseMultiplier: 1.08,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.05 }],
      bonus: 0.5,
      maxLevel: 100,
    }, // max bonus: 50% -> +0.5 attacks/s on the 1.0 base before other flats
    item: {
      tierScalingMaxPercent: createTierScaling(50, 150, 1),
    },
    itemTags: ['offense', 'gloves'],
    forceNotShow: true,
  }),
  critChance: createPercentStat({
    base: 5,
    dec: 2,
    training: {
      cost: 550,
      costIncrease: 600,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.1,
      maxLevel: 250,
    }, // max bonus: 25
    item: {
      tierScalingMaxPercent: createTierScaling(5, 100, 1.2),
      overrides: {
        DAGGER: { min: 1, max: 120 },
        WAND: { min: 1, max: 110 },
        STAFF: { min: 1, max: 105 },
      },
    },
    itemTags: ['offense', 'jewelry', 'gloves', 'wand', 'staff'],
    show: true,
    sub: 'attack',
    cap: 50,
  }),
  critChanceCap: createStat({
    base: 50,
    div: 100,
    sub: 'attack',
  }),
  critChancePercent: createPercentStat({
    forceNotShow: true,
  }),
  critDamage: createStat({
    base: 1.33,
    dec: 2,
    training: {
      cost: 750,
      costIncrease: 800,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.01,
      maxLevel: 250,
    }, // max bonus: 2.5
    item: { min: 0.02, max: 0.1, limit: 2, scaling: (level, tier) => offenseScaling(level, tier) },
    itemTags: ['offense', 'jewelry', 'gloves', 'wand', 'staff'],
    show: true,
    sub: 'attack',
  }),
  critDamagePercent: createPercentStat({
    forceNotShow: true,
  }),
  attackRating: createStat({
    base: 100,
    training: { cost: 160, bonus: 10, maxLevel: Infinity },
    item: { min: 60, max: 140, scaling: (level, tier) => offenseScaling(level, tier) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    show: true,
    sub: 'attack',
  }),
  attackRatingPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(30, 600, 1.2) },
    itemTags: ['offense', 'gloves'],
    sub: 'attack',
  }),
  chanceToHitPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(10, 50, 1.1) },
    itemTags: ['offense', 'magic', 'gloves'],
    show: true,
    sub: 'attack',
  }),
  lifeSteal: createPercentStat({
    dec: 2,
    training: { cost: 800, bonus: 0.01, maxLevel: 100 }, // max bonus: 1
    item: { tierScalingMaxPercent: createTierScaling(1.25, 10, 1.2) },
    show: true,
    sub: 'attack',
  }),
  lifeStealPercent: createPercentStat({
    forceNotShow: true,
  }),
  omniSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(0.7, 5.0, 1.1) },
    show: true,
    sub: 'attack',
  }),
  omniStealPercent: createPercentStat({
    forceNotShow: true,
  }),
  lifePerHit: createStat({
    dec: 1,
    item: { min: 1, max: 7, scaling: (level, tier) => offenseScaling(level, tier) },
    itemTags: ['offense'],
    show: true,
    sub: 'attack',
  }),
  lifePerHitPercent: createPercentStat({
    forceNotShow: true,
  }),
  doubleDamageChance: createPercentStat({
    training: {
      cost: 550,
      costIncrease: 600,
      costIncreaseMultiplier: 1.012,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.025 }],
      bonus: 0.1,
      maxLevel: 200,
    }, // max bonus: 20
    item: {
      tierScalingMaxPercent: createTierScaling(5, 50, 1.0),
    },
    itemTags: ['offense', 'gloves', 'jewelry', 'wand', 'staff'],
    show: true,
    sub: 'attack',
  }),
  ...generateElementalOffenseStats(),
  elementalDamage: createStat({
    dec: 1,
    training: { cost: 90, bonus: 1, maxLevel: Infinity },
    item: { min: 1, max: 3, scaling: (level, tier) => offenseScaling(level, tier) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    sub: 'elemental',
  }),
  elementalDamagePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(7, 100, 1.1) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    sub: 'elemental',
  }),
  percentOfPlayerDamage: createPercentStat({
    forceNotShow: true,
  }),
  armorPenetration: createStat({
    training: { cost: 50, bonus: 10, maxLevel: Infinity },
    item: {
      min: 10,
      max: 25,
      scaling: (level, tier) => offenseScaling(level, tier),
    },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    sub: 'attack',
  }),
  armorPenetrationPercent: createPercentStat({
    sub: 'attack',
  }),
  elementalPenetration: createStat({
    training: { cost: 50, bonus: 10, maxLevel: Infinity },
    item: {
      min: 10,
      max: 25,
      scaling: (level, tier) => offenseScaling(level, tier),
    },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic', 'elemental'],
    sub: 'elemental',
  }),
  flatPenetrationPercent: createPercentStat({
    sub: 'attack',
  }),
  elementalPenetrationPercent: createPercentStat({
    sub: 'elemental',
  }),
  ignoreEnemyArmor: createHiddenStat(),
  ignoreAllEnemyResistances: createHiddenStat(),
  attackNeverMiss: createStat(),
  reduceEnemyDamagePercent: createPercentStat({
    dec: 2,
    cap: 50,
  }),
  reduceEnemyHpPercent: createPercentStat({
    dec: 2,
    cap: 50,
  }),
  reduceEnemyAttackSpeedPercent: createPercentStat({
    dec: 2,
    cap: 50,
  }),
  extraDamageFromLifePercent: createPercentStat({
    dec: 2,
  }),
  extraDamageFromArmorPercent: createPercentStat({
    dec: 2,
  }),
  extraDamageFromManaPercent: createPercentStat({
    dec: 2,
  }),
  extraDamageFromLifeRegenPercent: createPercentStat({
    dec: 2,
  }),
  extraDamageFromEvasionPercent: createPercentStat({
    dec: 2,
  }),
  extraDamageFromAttackRatingPercent: createPercentStat({
    dec: 2,
    item: {
      tierScalingMaxPercent: createTierScaling(0.3, 1.5, 1.0),
    },
  }),
  extraEvasionFromLifePercent: createPercentStat({
    dec: 2,
  }),
  extraDamageFromAllResistancesPercent: createPercentStat({
    dec: 2,
  }),
  retaliateWhenHit: createHiddenStat(),
  arenaDamagePercent: createPercentStat({
    sub: 'attack',
  }),
  animatedWeaponsDamagePercent: createPercentStat(),
  cloneDamagePercent: createPercentStat(),
  avoidChance: createPercentStat({
    forceNotShow: true,
  }),
  executeThresholdPercent: createPercentStat({
    sub: 'attack',
  }),
  damageToHighRarityEnemiesPercent: createPercentStat(),
  healDamagesEnemiesPercent: createPercentStat(),
  batsHealPercent: createPercentStat(),
  bleedChance: createPercentStat({
    sub: 'attack',
  }),
  bleedDamagePercent: createPercentStat({
    dec: 0,
  }),
  overkillDamagePercent: createStat({
    div: 100,
  }),
  burnChance: createPercentStat({
    sub: 'elemental',
  }),
  burnDamagePercent: createPercentStat({
    sub: 'elemental',
  }),
  poisonChance: createPercentStat({
    sub: 'elemental',
  }),
  poisonDamagePercent: createPercentStat({
    sub: 'elemental',
  }),
  explosionChance: createPercentStat({
    sub: 'elemental',
  }),
  extraDamageAgainstBurningEnemies: createPercentStat({
    sub: 'elemental',
  }),
  lightningEffectivenessPercent: createPercentStat({
    sub: 'elemental',
  }),
  arcDischargeChance: createPercentStat({
    sub: 'elemental',
  }),
  shockChance: createPercentStat({
    sub: 'elemental',
  }),
  shockEffectiveness: createPercentStat(),
  freezeChance: createPercentStat({
    sub: 'elemental',
  }),
  stunChance: createPercentStat({
    sub: 'attack',
  }),
  extraDamageAgainstFrozenEnemies: createPercentStat({
    sub: 'elemental',
  }),
  chanceToShatterEnemy: createPercentStat({
    sub: 'elemental',
  }),
  summonDamageBuffPercent: createPercentStat(),
  summonAttackSpeedBuffPercent: createPercentStat(),
  summonerExtraSummonUnlocked: createHiddenStat(),
  naturalistInstantSkillsUnlocked: createHiddenStat(),
  teleportDodgeChance: createPercentStat({
    sub: 'defense',
  }),
  manaToLifeTransferPercent: createPercentStat(),
  damageToBossesPercent: createPercentStat(),
  bloodSacrificeEffectiveness: createPercentStat(),
  instaKillPercent: createPercentStat({
    dec: 2,
  }),
};
