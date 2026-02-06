import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createChanceStat, createHiddenStat, getSkillBonusesPercent, getSkillBonusesChance, createDefaultSkillBonusesPercent, createDefaultSkillBonusesFlat } from './stats.js';
import { ELEMENTS } from '../common.js';
import { getItemRange, getTrainingBonus } from '../ratios.js';

const WAND_ELEMENTAL_FLAT_MULTIPLIER = 1.4;
const STAFF_ELEMENTAL_FLAT_MULTIPLIER = 1.75;
const WAND_ELEMENTAL_PERCENT_MULTIPLIER = 1.25;
const STAFF_ELEMENTAL_PERCENT_MULTIPLIER = 1.45;

const tierScalingMaxPercent = createTierScaling(100, 2000, 1.2);

const offenseScaling = (level, tier) => itemStatScaleFactor(level, tier);

const createElementalDamageConfig = () => ({
  ...getItemRange('elementalDamage'),
  scaling: (level, tier) => offenseScaling(level, tier),
  overrides: {
    WAND: getItemRange('elementalDamage', WAND_ELEMENTAL_FLAT_MULTIPLIER),
    STAFF: getItemRange('elementalDamage', STAFF_ELEMENTAL_FLAT_MULTIPLIER),
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
      itemTags: ['sword', 'dagger', 'jewelry', 'bow', 'arrows', 'gloves', 'magic'],
      show: true,
      sub: 'elemental',
      skills: createDefaultSkillBonusesFlat(`${element}Damage`),
    });
    stats[`${element}DamagePercent`] = createPercentStat({
      item: createElementalDamagePercentConfig(),
      itemTags: ['sword', 'dagger', 'jewelry', 'bow', 'arrows', 'gloves', 'magic'],
      sub: 'elemental',
      skills: createDefaultSkillBonusesPercent(),
    });
    stats[`${element}Penetration`] = createStat({ sub: 'elemental' });
    stats[`${element}PenetrationPercent`] = createPercentStat({ sub: 'elemental' });
    stats[`${element}EffectivenessPercent`] = createPercentStat({ sub: 'elemental' });
    stats[`extraDamageFrom${element.charAt(0).toUpperCase() + element.slice(1)}ResistancePercent`] = createPercentStat({
      dec: 2,
      sub: 'elemental',
      skills: createDefaultSkillBonusesPercent({
        passive: {
          base: 0.05, linear: 0.0003, max: 2,
        },
      }),
    });
  });
  return stats;
};

export const OFFENSE_STATS = {
  damage: createStat({
    base: 10,
    training: {
      cost: 200, bonus: getTrainingBonus('damage'), maxLevel: Infinity,
    },
    item: {
      ...getItemRange('damage'),
      scaling: (level, tier) => offenseScaling(level, tier),
      overrides: {
        AXE: getItemRange('damage', 1.35),
        DAGGER: getItemRange('damage', 0.8),
      },
    },
    itemTags: ['offense', 'jewelry', 'gloves'],
    show: true,
    sub: 'attack',
    skills: createDefaultSkillBonusesFlat('damage'),
  }),
  damagePercent: createPercentStat({
    item: {
      tierScalingMaxPercent,
      overrides: {
        DAGGER: { min: 1, tierScalingMaxPercent: createTierScaling(75, 1500, 1.2) },
        WAND: { min: 0, max: 0 },
        STAFF: { min: 0, max: 0 },
      },
    },
    itemTags: ['offense', 'gloves', 'jewelry'],
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent(),
  }),
  totalDamagePercent: createPercentStat({ sub: 'attack' }),
  attackSpeed: createStat({
    base: 1,
    dec: 2,
    show: true,
    sub: 'attack',
    cap: 5,
  }),
  attackSpeedPercent: createPercentStat({
    dec: 2,
    sub: 'attack',
    training: {
      cost: 400,
      costIncrease: 600,
      costIncreaseMultiplier: 1.08,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.05 }],
      bonus: 0.25,
      maxLevel: 100,
    }, // max bonus: 50% -> +0.5 attacks/s on the 1.0 base before other flats
    item: {
      tierScalingMaxPercent: createTierScaling(50, 150, 1),
      overrides: { AXE: { min: 1, tierScalingMaxPercent: createTierScaling(40, 130, 1) } },
    },
    itemTags: ['offense', 'gloves'],
    forceNotShow: true,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 1, linear: 0.005, max: 100,
      },
      toggle: {
        base: 2, linear: 0.01, max: 150,
      },
      instant: { linear: 0.02, max: 200 },
      buff: {
        base: 3, linear: 0.015, max: 175,
      },
      summon: {
        base: 0.5, linear: 0.002, max: 50,
      },
    }),
  }),
  critChance: createChanceStat({
    base: 5,
    dec: 2,
    training: {
      cost: 550,
      costIncrease: 600,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.05,
      maxLevel: 200,
    }, // max bonus: 10
    item: {
      tierScalingMaxPercent: createTierScaling(10, 15, 1.2),
      overrides: {
        DAGGER: { min: 1, max: 20 },
        RING: { min: 1, max: 5 },
      },
    },
    itemTags: ['offense', 'ring', 'wand', 'staff'],
    show: true,
    sub: 'attack',
    cap: 50,
    skills: {
      passive: getSkillBonusesChance({
        type: 'passive', base: 1, levelsPerPoint: 60, cap: 15,
      }),
      toggle: getSkillBonusesChance({
        type: 'toggle', base: 2, levelsPerPoint: 75, cap: 20,
      }),
      instant: getSkillBonusesChance({
        type: 'instant', base: 3, levelsPerPoint: 30, cap: 40,
      }),
      buff: getSkillBonusesChance({
        type: 'buff', base: 2.5, levelsPerPoint: 40, cap: 25,
      }),
      summon: getSkillBonusesChance({
        type: 'summon', base: 1.5, levelsPerPoint: 50, cap: 25,
      }),
    },
  }),
  critChanceCap: createStat({
    base: 60,
    div: 100,
    dec: 2,
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent({
      buff: {
        base: 0.12, linear: 0.0025, max: 20,
      },
    }),
  }),
  critChancePercent: createPercentStat({ forceNotShow: true }),
  critDamage: createStat({
    base: 1.33,
    dec: 2,
    show: true,
    sub: 'attack',
  }),
  critDamagePercent: createPercentStat({
    dec: 2,
    sub: 'attack',
    training: {
      cost: 400,
      costIncrease: 600,
      costIncreaseMultiplier: 1.08,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.05 }],
      bonus: 0.25,
      maxLevel: 200,
    }, // max bonus: 50% -> +0.5 attacks/s on the 1.0 base before other flats
    item: { tierScalingMaxPercent: createTierScaling(50, 150, 1) },
    itemTags: ['offense', 'gloves'],
    forceNotShow: true,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 1, linear: 0.005, power: 0.6, max: 100,
      },
      toggle: {
        base: 2, linear: 0.01, power: 0.6, max: 150,
      },
      instant: {
        base: 5, linear: 0.02, power: 0.6, max: 200,
      },
      buff: {
        base: 3, linear: 0.015, power: 0.6, max: 175,
      },
      summon: {
        base: 0.5, linear: 0.002, power: 0.6, max: 50,
      },
    }),
  }),
  attackRating: createStat({
    base: 100,
    training: {
      cost: 320,
      bonus: getTrainingBonus('attackRating'),
      maxLevel: Infinity,
    },
    item: {
      ...getItemRange('attackRating'),
      scaling: (level, tier) => offenseScaling(level, tier),
    },
    itemTags: ['offense', 'jewelry', 'gloves'],
    show: true,
    sub: 'attack',
    skills: createDefaultSkillBonusesFlat('attackRating'),
  }),
  attackRatingPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(30, 600, 1.2) },
    itemTags: ['offense', 'gloves'],
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent(),
  }),
  chanceToHitPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(10, 50, 1.1) },
    itemTags: ['offense', 'magic', 'gloves'],
    show: true,
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent({ passive: { base: 0.2, max: 40 } }),
  }),
  lifeSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(1.25, 10, 1.2) },
    show: true,
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.0001, power: 0.6, max: 2,
      },
      toggle: {
        base: 0.1, linear: 0.0002, power: 0.6, max: 3,
      },
      instant: {
        base: 0.15, linear: 0.0003, power: 0.6, max: 4,
      },
      buff: {
        base: 0.12, linear: 0.00025, power: 0.6, max: 3.5,
      },
      summon: {
        base: 0.02, linear: 0.00005, power: 0.6, max: 1,
      },
    }),
  }),
  lifeStealPercent: createPercentStat({ sub: 'attack', forceNotShow: true }),
  omniSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(0.7, 5.0, 1.1) },
    show: true,
    sub: 'attack',
  }),
  omniStealPercent: createPercentStat({ sub: 'attack', forceNotShow: true }),
  lifePerHit: createStat({
    dec: 1,
    training: {
      cost: 250,
      bonus: getTrainingBonus('lifePerHit'),
      maxLevel: Infinity,
    },
    item: {
      ...getItemRange('lifePerHit'),
      scaling: (level, tier) => offenseScaling(level, tier),
    },
    itemTags: ['offense'],
    show: true,
    sub: 'attack',
    skills: createDefaultSkillBonusesFlat('lifePerHit'),
  }),
  lifePerHitPercent: createPercentStat({ sub: 'attack', forceNotShow: true }),
  doubleDamageChance: createChanceStat({
    training: {
      cost: 550,
      costIncrease: 600,
      costIncreaseMultiplier: 1.012,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.025 }],
      bonus: 0.05,
      maxLevel: 200,
    }, // max bonus: 10
    item: { tierScalingMaxPercent: createTierScaling(5, 50, 1.0) },
    itemTags: ['offense', 'gloves', 'jewelry', 'wand', 'staff'],
    show: true,
    sub: 'attack',
    skills: {
      toggle: getSkillBonusesChance({
        type: 'toggle', base: 1, levelsPerPoint: 20, cap: 25,
      }),
    },
  }),
  ...generateElementalOffenseStats(),
  elementalDamage: createStat({
    dec: 1,
    training: {
      cost: 90,
      bonus: getTrainingBonus('elementalDamage'),
      maxLevel: Infinity,
    },
    item: {
      ...getItemRange('elementalDamage'),
      scaling: (level, tier) => offenseScaling(level, tier),
    },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    sub: 'elemental',
    skills: createDefaultSkillBonusesFlat('elementalDamage'),
  }),
  elementalDamagePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(7, 100, 1.1) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent(),
  }),
  percentOfPlayerDamage: createPercentStat({
    sub: 'misc',
    forceNotShow: true,
    skills: createDefaultSkillBonusesPercent({ summon: { linear: 0.01, max: 200 } }),
  }),
  armorPenetration: createStat({
    training: {
      cost: 50,
      bonus: getTrainingBonus('armorPenetration'),
      maxLevel: Infinity,
    },
    item: {
      ...getItemRange('armorPenetration'),
      scaling: (level, tier) => offenseScaling(level, tier),
    },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    sub: 'attack',
    skills: createDefaultSkillBonusesFlat('armorPenetration', {
      passive: { increment: 5.5, bonus: 5 },
      toggle: { increment: 7, bonus: 7 },
      instant: { increment: 15, bonus: 10 },
      buff: { increment: 9, bonus: 9 },
      summon: { increment: 6, bonus: 6 },
    }),
  }),
  armorPenetrationPercent: createPercentStat({
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent({
      passive: { linear: 0.005, max: 20 },
      toggle: { linear: 0.015, max: 25 },
      instant: { linear: 0.035, max: 60 },
      buff: { linear: 0.02, max: 30 },
    }),
  }),
  elementalPenetration: createStat({
    training: {
      cost: 50,
      bonus: getTrainingBonus('elementalPenetration'),
      maxLevel: Infinity,
    },
    item: {
      ...getItemRange('elementalPenetration'),
      scaling: (level, tier) => offenseScaling(level, tier),
    },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic', 'elemental'],
    sub: 'elemental',
    skills: createDefaultSkillBonusesFlat('elementalPenetration', {
      passive: { increment: 5.5, bonus: 5 },
      toggle: { increment: 7, bonus: 7 },
      instant: { increment: 15, bonus: 10 },
      buff: { increment: 9, bonus: 9 },
      summon: { increment: 6, bonus: 6 },
    }),
  }),
  flatPenetrationPercent: createPercentStat({ sub: 'attack' }),
  elementalPenetrationPercent: createPercentStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({
      passive: { linear: 0.005, max: 20 },
      toggle: { linear: 0.015, max: 25 },
      instant: { linear: 0.035, max: 60 },
      buff: { linear: 0.02, max: 30 },
    }),
  }),
  ignoreEnemyArmor: createHiddenStat(),
  ignoreAllEnemyResistances: createHiddenStat(),
  attackNeverMiss: createStat(),
  reduceEnemyDamagePercent: createPercentStat({
    dec: 2,
    sub: 'attack',
    cap: 80,
    skills: createDefaultSkillBonusesPercent({
      instant: {
        base: 0.02, linear: 0.01, power: 0.6, max: 70,
      },
      passive: {
        base: 0.02, linear: 0.01, power: 0.6, max: 30,
      },
      buff: {
        base: 0.05, linear: 0.02, power: 0.6, max: 40,
      },
    }),
  }),
  reduceEnemyHpPercent: createPercentStat({
    dec: 2,
    sub: 'attack',
    cap: 50,
  }),
  reduceEnemyAttackSpeedPercent: createPercentStat({
    dec: 2,
    sub: 'attack',
    cap: 50,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.01, max: 30,
      },
      toggle: {
        base: 0.08, linear: 0.015, max: 40,
      },
      buff: {
        base: 0.12, linear: 0.02, max: 50,
      },
    }),
  }),
  // Flat milliseconds delay applied to enemy attack interval when bows are equipped.
  enemyAttackDelayMs: createHiddenStat(),
  extraDamageFromLifePercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.0008, max: 2.25,
      },
      toggle: {
        base: 0.08, linear: 0.0013, max: 2.8,
      },
      buff: {
        base: 0.12, linear: 0.0017, max: 3.25,
      },
    }),
  }),
  extraDamageFromArmorPercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, softcap: 2000, linear: 0.00075, power: 0.6, max: 2.5,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.08, softcap: 2000, linear: 0.00095, power: 0.6, max: 3,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.1, softcap: 2000, linear: 0.001, power: 0.6, max: 3.5,
      }),
    },
  }),
  extraDamageFromManaPercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.001, max: 2,
      },
    }),
  }),
  extraDamageFromLifeRegenPercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.001, max: 3.5,
      },
      toggle: {
        base: 0.08, linear: 0.0015, max: 4,
      },
      buff: {
        base: 0.12, linear: 0.002, max: 4.5,
      },
    }),
  }),
  extraDamageFromEvasionPercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.00075, max: 2.5,
      },
      toggle: {
        base: 0.08, linear: 0.00095, max: 3,
      },
      buff: {
        base: 0.1, linear: 0.001, max: 3.5,
      },
    }),
  }),
  extraDamageFromAttackRatingPercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    item: { tierScalingMaxPercent: createTierScaling(0.3, 1.5, 1.0) },
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.00075, max: 2.5,
      },
      toggle: {
        base: 0.08, linear: 0.00095, max: 3,
      },
      buff: {
        base: 0.1, linear: 0.001, max: 3.5,
      },
    }),
  }),
  extraEvasionFromLifePercent: createPercentStat({ dec: 2, sub: 'misc' }),
  extraDamageFromAllResistancesPercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.05, linear: 0.0003, max: 2,
      },
      buff: {
        base: 0.1, linear: 0.0005, max: 3,
      },
    }),
  }),
  retaliateWhenHit: createHiddenStat(),
  arenaDamagePercent: createPercentStat({
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  animatedWeaponsDamagePercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  cloneDamagePercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  avoidChance: createChanceStat({ forceNotShow: true }),
  executeThresholdPercent: createPercentStat({
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 5, linear: 0.1, max: 50,
      },
    }),
  }),
  damageToHighRarityEnemiesPercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  healDamagesEnemiesPercent: createPercentStat({ sub: 'misc' }),
  batsHealPercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  bleedChance: createChanceStat({
    sub: 'attack',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 5, linear: 0.6, max: 100,
      },
    }),
  }),
  bleedDamagePercent: createPercentStat({
    dec: 0,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  overkillDamagePercent: createStat({ div: 100, sub: 'misc' }),
  burnChance: createChanceStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({ passive: { linear: 0.5, max: 60 } }),
  }),
  burnDamagePercent: createPercentStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  poisonChance: createChanceStat({ sub: 'elemental' }),
  poisonDamagePercent: createPercentStat({ sub: 'elemental' }),
  explosionChance: createChanceStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({ passive: { base: 1, linear: 0.1 } }),
  }),
  extraDamageAgainstBurningEnemies: createPercentStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  arcDischargeChance: createChanceStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({ passive: { max: 10 } }),
  }),
  shockChance: createChanceStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 1, linear: 0.1, max: 20,
      },
    }),
  }),
  shockEffectivenessPercent: createPercentStat({ sub: 'elemental', skills: createDefaultSkillBonusesPercent({ passive: { linear: 0.5, power: 0.7 } }) }),
  freezeChance: createChanceStat({ sub: 'elemental' }),
  stunChance: createChanceStat({ sub: 'attack' }),
  extraDamageAgainstFrozenEnemies: createPercentStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  chanceToShatterEnemy: createChanceStat({
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 1, linear: 0.1, max: 15,
      },
    }),
  }),
  summonDamageBuffPercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  summonAttackSpeedBuffPercent: createPercentStat({ sub: 'misc', skills: createDefaultSkillBonusesPercent({ passive: { linear: 0.5, max: 30 } }) }),
  summonerExtraSummonUnlocked: createHiddenStat(),
  naturalistInstantSkillsUnlocked: createHiddenStat(),
  teleportDodgeChance: createChanceStat({ sub: 'defense' }),
  manaToLifeTransferPercent: createPercentStat({ sub: 'misc' }),
  damageToBossesPercent: createPercentStat({ sub: 'misc' }),
  bloodSacrificeEffectivenessPercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  instaKillPercent: createPercentStat({
    dec: 2,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.2, softcap: 100, linear: 0.1, power: 0.5, max: 5,
      },
    }),
  }),
};

