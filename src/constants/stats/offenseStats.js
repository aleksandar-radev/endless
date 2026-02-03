import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createChanceStat, createHiddenStat, getSkillBonusesFlat, getSkillBonusesPercent, getSkillBonusesChance } from './stats.js';
import { ELEMENTS } from '../common.js';
import { getItemRange, getSkillFlatBase, getSkillFlatIncrement, getTrainingBonus, SKILL_INTERVAL, getSkillFlatBonus } from '../ratios.js';

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
      skills: {
        passive: getSkillBonusesFlat({
          type: 'passive',
          base: getSkillFlatBase(`${element}Damage`),
          increment: getSkillFlatIncrement(`${element}Damage`),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus(`${element}Damage`),
        }),
        toggle: getSkillBonusesFlat({
          type: 'toggle',
          base: getSkillFlatBase(`${element}Damage`, 1.33),
          increment: getSkillFlatIncrement(`${element}Damage`, 1.33),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus(`${element}Damage`),
        }),
        instant: getSkillBonusesFlat({
          type: 'instant',
          base: getSkillFlatBase(`${element}Damage`, 1.67),
          increment: getSkillFlatIncrement(`${element}Damage`, 1.67),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus(`${element}Damage`, 1.5),
        }),
        buff: getSkillBonusesFlat({
          type: 'buff',
          base: getSkillFlatBase(`${element}Damage`, 1.33),
          increment: getSkillFlatIncrement(`${element}Damage`, 1.33),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus(`${element}Damage`, 1.2),
        }),
        summon: getSkillBonusesFlat({
          type: 'summon',
          base: getSkillFlatBase(`${element}Damage`, 2),
          increment: getSkillFlatIncrement(`${element}Damage`, 1),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus(`${element}Damage`, 1),
        }),
      },
    });
    stats[`${element}DamagePercent`] = createPercentStat({
      item: createElementalDamagePercentConfig(),
      itemTags: ['sword', 'dagger', 'jewelry', 'bow', 'arrows', 'gloves', 'magic'],
      sub: 'elemental',
      skills: {
        passive: getSkillBonusesPercent({
          type: 'passive', base: 5, softcap: 2000, linear: 0.25, power: 0.6, max: 5000,
        }),
        toggle: getSkillBonusesPercent({
          type: 'toggle', base: 7, softcap: 2000, linear: 0.35, power: 0.6, max: 6000,
        }),
        instant: getSkillBonusesPercent({
          type: 'instant', base: 10, softcap: 2000, linear: 0.5, power: 0.6, max: 8000,
        }),
        buff: getSkillBonusesPercent({
          type: 'buff', base: 8, softcap: 2000, linear: 0.4, power: 0.6, max: 7000,
        }),
        summon: getSkillBonusesPercent({
          type: 'summon', base: 4, softcap: 2000, linear: 0.2, power: 0.6, max: 4000,
        }),
      },
    });
    stats[`${element}Penetration`] = createStat({ sub: 'elemental' });
    stats[`${element}PenetrationPercent`] = createPercentStat({ sub: 'elemental' });
    stats[`${element}EffectivenessPercent`] = createPercentStat({ sub: 'elemental' });
    stats[`extraDamageFrom${element.charAt(0).toUpperCase() + element.slice(1)}ResistancePercent`] = createPercentStat({
      dec: 2,
      sub: 'elemental',
      skills: {
        passive: getSkillBonusesPercent({
          type: 'passive', base: 0.05, linear: 0.0003, max: 2,
        }),
      },
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
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('damage'),
        increment: getSkillFlatIncrement('damage'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('damage'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('damage', 1.77),
        increment: getSkillFlatIncrement('damage', 1.3),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('damage', 1.1),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('damage', 2),
        increment: getSkillFlatIncrement('damage', 1.8),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('damage', 1.4),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('damage', 1.33),
        increment: getSkillFlatIncrement('damage', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('damage', 1.2),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('damage', 2),
        increment: getSkillFlatIncrement('damage', 1.2),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('damage', 1.3),
      }),
    },
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
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.05, power: 0.6, max: 5000,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 3.5, softcap: 2000, linear: 0.15, power: 0.6, max: 6000,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 5, softcap: 2000, linear: 0.35, power: 0.6, max: 8000,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 5, softcap: 2000, linear: 0.2, power: 0.6, max: 7000,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 5, softcap: 2000, linear: 0.3, power: 0.6, max: 4000,
      }),
    },
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
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 1, softcap: 2000, linear: 0.005, power: 0.6, max: 100,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 2, softcap: 2000, linear: 0.01, power: 0.6, max: 150,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 5, softcap: 2000, linear: 0.02, power: 0.6, max: 200,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 3, softcap: 2000, linear: 0.015, power: 0.6, max: 175,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 0.5, softcap: 2000, linear: 0.002, power: 0.6, max: 50,
      }),
    },
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
    skills: {
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.12, softcap: 2000, linear: 0.0025, power: 0.6, max: 20,
      }),
    },
  }),
  critChancePercent: createPercentStat({ forceNotShow: true }),
  critDamage: createStat({
    base: 1.33,
    dec: 2,
    training: {
      cost: 750,
      costIncrease: 800,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.005,
      maxLevel: 250,
    }, // max bonus: 1.25
    item: { tierScalingMaxPercent: createTierScaling(1, 12, 1) },
    itemTags: ['offense', 'jewelry', 'gloves', 'wand', 'staff'],
    show: true,
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, softcap: 2000, linear: 0.0001, power: 0.6, max: 2,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.1, softcap: 2000, linear: 0.0002, power: 0.6, max: 3,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 0.15, softcap: 2000, linear: 0.0003, power: 0.6, max: 4,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.12, softcap: 2000, linear: 0.00025, power: 0.6, max: 3.5,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 0.02, softcap: 2000, linear: 0.00005, power: 0.6, max: 1,
      }),
    },
  }),
  critDamagePercent: createPercentStat({ forceNotShow: true }),
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
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('attackRating'),
        increment: getSkillFlatIncrement('attackRating'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('attackRating'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('attackRating', 1.33),
        increment: getSkillFlatIncrement('attackRating', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('attackRating', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('attackRating', 1.67),
        increment: getSkillFlatIncrement('attackRating', 1.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('attackRating', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('attackRating', 1.5),
        increment: getSkillFlatIncrement('attackRating', 1.5),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('attackRating', 1.4),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('attackRating', 0.67),
        increment: getSkillFlatIncrement('attackRating', 0.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('attackRating', 0.8),
      }),
    },
  }),
  attackRatingPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(30, 600, 1.2) },
    itemTags: ['offense', 'gloves'],
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.05, power: 0.6, max: 5000,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 3.5, softcap: 2000, linear: 0.15, power: 0.6, max: 6000,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 5, softcap: 2000, linear: 0.35, power: 0.6, max: 8000,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 5, softcap: 2000, linear: 0.2, power: 0.6, max: 7000,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 5, softcap: 2000, linear: 0.3, power: 0.6, max: 4000,
      }),
    },
  }),
  chanceToHitPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(10, 50, 1.1) },
    itemTags: ['offense', 'magic', 'gloves'],
    show: true,
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.2, power: 0.6, max: 40,
      }),
    },
  }),
  lifeSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(1.25, 10, 1.2) },
    show: true,
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, softcap: 2000, linear: 0.0001, power: 0.6, max: 2,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.1, softcap: 2000, linear: 0.0002, power: 0.6, max: 3,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 0.15, softcap: 2000, linear: 0.0003, power: 0.6, max: 4,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.12, softcap: 2000, linear: 0.00025, power: 0.6, max: 3.5,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 0.02, softcap: 2000, linear: 0.00005, power: 0.6, max: 1,
      }),
    },
  }),
  lifeStealPercent: createPercentStat({ forceNotShow: true }),
  omniSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(0.7, 5.0, 1.1) },
    show: true,
    sub: 'attack',
  }),
  omniStealPercent: createPercentStat({ forceNotShow: true }),
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
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('lifePerHit'),
        increment: getSkillFlatIncrement('lifePerHit'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifePerHit'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('lifePerHit', 1.5),
        increment: getSkillFlatIncrement('lifePerHit', 1.5),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifePerHit'),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('lifePerHit', 2.5),
        increment: getSkillFlatIncrement('lifePerHit', 2.5),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifePerHit', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('lifePerHit', 2.0),
        increment: getSkillFlatIncrement('lifePerHit', 2.0),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifePerHit', 1.2),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('lifePerHit', 0.5),
        increment: getSkillFlatIncrement('lifePerHit', 0.5),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifePerHit', 0.5),
      }),
    },
  }),
  lifePerHitPercent: createPercentStat({ forceNotShow: true }),
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
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('elementalDamage'),
        increment: getSkillFlatIncrement('elementalDamage'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalDamage'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('elementalDamage', 3),
        increment: getSkillFlatIncrement('elementalDamage', 1.3),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalDamage', 1.1),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('elementalDamage', 8),
        increment: getSkillFlatIncrement('elementalDamage', 1.8),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalDamage', 1.4),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('elementalDamage', 1.33),
        increment: getSkillFlatIncrement('elementalDamage', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalDamage', 1.2),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('elementalDamage', 4),
        increment: getSkillFlatIncrement('elementalDamage', 1.2),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalDamage', 1.3),
      }),
    },
  }),
  elementalDamagePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(7, 100, 1.1) },
    itemTags: ['offense', 'jewelry', 'gloves', 'magic'],
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.05, power: 0.6, max: 5000,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 3.5, softcap: 2000, linear: 0.15, power: 0.6, max: 6000,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 5, softcap: 2000, linear: 0.35, power: 0.6, max: 8000,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 5, softcap: 2000, linear: 0.2, power: 0.6, max: 7000,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 5, softcap: 2000, linear: 0.3, power: 0.6, max: 4000,
      }),
    },
  }),
  percentOfPlayerDamage: createPercentStat({
    forceNotShow: true,
    skills: {
      summon: getSkillBonusesPercent({
        type: 'summon', base: 5, softcap: 2000, linear: 0.01, power: 0.6, max: 200,
      }),
    },
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
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('armorPenetration'),
        increment: getSkillFlatIncrement('armorPenetration'),
        interval: SKILL_INTERVAL / 10,
        bonus: getSkillFlatBonus('armorPenetration'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('armorPenetration', 1.25),
        increment: getSkillFlatIncrement('armorPenetration', 1.25),
        interval: SKILL_INTERVAL / 10,
        bonus: getSkillFlatBonus('armorPenetration', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('armorPenetration', 1.5),
        increment: getSkillFlatIncrement('armorPenetration', 1.5),
        interval: SKILL_INTERVAL / 10,
        bonus: getSkillFlatBonus('armorPenetration', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('armorPenetration', 1.25),
        increment: getSkillFlatIncrement('armorPenetration', 1.25),
        interval: SKILL_INTERVAL / 10,
        bonus: getSkillFlatBonus('armorPenetration', 1.2),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('armorPenetration', 0.5),
        increment: getSkillFlatIncrement('armorPenetration', 0.5),
        interval: SKILL_INTERVAL / 10,
        bonus: getSkillFlatBonus('armorPenetration', 0.8),
      }),
    },
  }),
  armorPenetrationPercent: createPercentStat({
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.005, power: 0.6, max: 20,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 3.5, softcap: 2000, linear: 0.015, power: 0.6, max: 25,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 5, softcap: 2000, linear: 0.035, power: 0.6, max: 60,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 5, softcap: 2000, linear: 0.02, power: 0.6, max: 30,
      }),
    },
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
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('elementalPenetration'),
        increment: getSkillFlatIncrement('elementalPenetration'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalPenetration'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('elementalPenetration', 3),
        increment: getSkillFlatIncrement('elementalPenetration', 1.3),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalPenetration', 1.1),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('elementalPenetration', 8),
        increment: getSkillFlatIncrement('elementalPenetration', 1.8),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalPenetration', 1.4),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('elementalPenetration', 1.33),
        increment: getSkillFlatIncrement('elementalPenetration', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalPenetration', 1.2),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('elementalPenetration', 4),
        increment: getSkillFlatIncrement('elementalPenetration', 1.2),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('elementalPenetration', 1.3),
      }),
    },
  }),
  flatPenetrationPercent: createPercentStat({ sub: 'attack' }),
  elementalPenetrationPercent: createPercentStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.005, power: 0.6, max: 20,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 3.5, softcap: 2000, linear: 0.015, power: 0.6, max: 25,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 5, softcap: 2000, linear: 0.035, power: 0.6, max: 60,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 5, softcap: 2000, linear: 0.02, power: 0.6, max: 30,
      }),
    },
  }),
  ignoreEnemyArmor: createHiddenStat(),
  ignoreAllEnemyResistances: createHiddenStat(),
  attackNeverMiss: createStat(),
  reduceEnemyDamagePercent: createPercentStat({
    dec: 2,
    cap: 80,
    skills: {
      instant: getSkillBonusesPercent({
        type: 'instant', base: 0.02, softcap: 2000, linear: 0.01, power: 0.6, max: 70,
      }),
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.02, softcap: 2000, linear: 0.01, power: 0.6, max: 30,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.05, softcap: 2000, linear: 0.02, power: 0.6, max: 40,
      }),
    },
  }),
  reduceEnemyHpPercent: createPercentStat({
    dec: 2,
    cap: 50,
  }),
  reduceEnemyAttackSpeedPercent: createPercentStat({
    dec: 2,
    cap: 50,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, softcap: 2000, linear: 0.01, power: 0.6, max: 30,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.08, softcap: 2000, linear: 0.015, power: 0.6, max: 40,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.12, softcap: 2000, linear: 0.02, power: 0.6, max: 50,
      }),
    },
  }),
  // Flat milliseconds delay applied to enemy attack interval when bows are equipped.
  enemyAttackDelayMs: createHiddenStat(),
  extraDamageFromLifePercent: createPercentStat({
    dec: 2,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, softcap: 2000, linear: 0.0008, power: 0.6, max: 2.25,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.08, softcap: 2000, linear: 0.0013, power: 0.6, max: 2.8,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.12, softcap: 2000, linear: 0.0017, power: 0.6, max: 3.25,
      }),
    },
  }),
  extraDamageFromArmorPercent: createPercentStat({
    dec: 2,
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
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, linear: 0.001, max: 2,
      }),
    },
  }),
  extraDamageFromLifeRegenPercent: createPercentStat({
    dec: 2,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, softcap: 2000, linear: 0.001, power: 0.6, max: 3.5,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.08, softcap: 2000, linear: 0.0015, power: 0.6, max: 4,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.12, softcap: 2000, linear: 0.002, power: 0.6, max: 4.5,
      }),
    },
  }),
  extraDamageFromEvasionPercent: createPercentStat({
    dec: 2,
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
  extraDamageFromAttackRatingPercent: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(0.3, 1.5, 1.0) },
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
  extraEvasionFromLifePercent: createPercentStat({ dec: 2 }),
  extraDamageFromAllResistancesPercent: createPercentStat({
    dec: 2,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.05, linear: 0.0003, max: 2,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.1, linear: 0.0005, max: 3,
      }),
    },
  }),
  retaliateWhenHit: createHiddenStat(),
  arenaDamagePercent: createPercentStat({
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  animatedWeaponsDamagePercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  cloneDamagePercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  avoidChance: createChanceStat({ forceNotShow: true }),
  executeThresholdPercent: createPercentStat({
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.1, power: 0.6, max: 50,
      }),
    },
  }),
  damageToHighRarityEnemiesPercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  healDamagesEnemiesPercent: createPercentStat(),
  batsHealPercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  bleedChance: createChanceStat({
    sub: 'attack',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.6, power: 0.6, max: 100,
      }),
    },
  }),
  bleedDamagePercent: createPercentStat({
    dec: 0,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  overkillDamagePercent: createStat({ div: 100 }),
  burnChance: createChanceStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.5, power: 0.6, max: 60,
      }),
    },
  }),
  burnDamagePercent: createPercentStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  poisonChance: createChanceStat({ sub: 'elemental' }),
  poisonDamagePercent: createPercentStat({ sub: 'elemental' }),
  explosionChance: createChanceStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 1, softcap: 2000, linear: 0.1, power: 0.6,
      }),
    },
  }),
  extraDamageAgainstBurningEnemies: createPercentStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  arcDischargeChance: createChanceStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, max: 10,
      }),
    },
  }),
  shockChance: createChanceStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 1, softcap: 2000, linear: 0.1, power: 0.6, max: 20,
      }),
    },
  }),
  shockEffectivenessPercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.5, power: 0.7,
      }),
    },
  }),
  freezeChance: createChanceStat({ sub: 'elemental' }),
  stunChance: createChanceStat({ sub: 'attack' }),
  extraDamageAgainstFrozenEnemies: createPercentStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  chanceToShatterEnemy: createChanceStat({
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 1, softcap: 2000, linear: 0.1, power: 0.6, max: 15,
      }),
    },
  }),
  summonDamageBuffPercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  summonAttackSpeedBuffPercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.5, power: 0.6, max: 30,
      }),
    },
  }),
  summonerExtraSummonUnlocked: createHiddenStat(),
  naturalistInstantSkillsUnlocked: createHiddenStat(),
  teleportDodgeChance: createChanceStat({ sub: 'defense' }),
  manaToLifeTransferPercent: createPercentStat(),
  damageToBossesPercent: createPercentStat(),
  bloodSacrificeEffectivenessPercent: createPercentStat({
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 1, power: 0.685,
      }),
    },
  }),
  instaKillPercent: createPercentStat({
    dec: 2,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.2, softcap: 100, linear: 0.1, power: 0.5, max: 5,
      }),
    },
  }),
};
