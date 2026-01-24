import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createChanceStat, createHiddenStat, getSkillBonusesFlat, getSkillBonusesPercent, getSkillBonusesChance } from './stats.js';
import { ELEMENTS } from '../common.js';
import { getItemRange, getTrainingBonus, getSkillFlatBase, getSkillFlatIncrement, SKILL_INTERVAL, getSkillFlatBonus } from '../ratios.js';

const resistanceTierScalingMaxPercent = createTierScaling(18, 250, 1.2);

const defenseScaling = (level, tier) => itemStatScaleFactor(level, tier);

const generateElementalDefenseStats = () => {
  const stats = {};
  Object.keys(ELEMENTS).forEach((element) => {
    stats[`${element}Resistance`] = createStat({
      training: {
        cost: 100,
        bonus: getTrainingBonus('elementalResistance'),
        maxLevel: Infinity,
      },
      item: {
        ...getItemRange('elementalResistance'),
        scaling: (level, tier) => defenseScaling(level, tier),
      },
      itemTags: ['defense', 'jewelry'],
      show: true,
      sub: 'elemental',
      skills: {
        passive: getSkillBonusesFlat({
          type: 'passive',
          base: getSkillFlatBase('elementalResistance'),
          increment: getSkillFlatIncrement('elementalResistance'),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus('elementalResistance'),
        }),
        toggle: getSkillBonusesFlat({
          type: 'toggle',
          base: getSkillFlatBase('elementalResistance', 1.33),
          increment: getSkillFlatIncrement('elementalResistance', 1.33),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus('elementalResistance', 1.33),
        }),
        instant: getSkillBonusesFlat({
          type: 'instant',
          base: getSkillFlatBase('elementalResistance', 1.67),
          increment: getSkillFlatIncrement('elementalResistance', 1.67),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus('elementalResistance', 1.5),
        }),
        buff: getSkillBonusesFlat({
          type: 'buff',
          base: getSkillFlatBase('elementalResistance', 1.33),
          increment: getSkillFlatIncrement('elementalResistance', 1.33),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus('elementalResistance', 1.2),
        }),
        summon: getSkillBonusesFlat({
          type: 'summon',
          base: getSkillFlatBase('elementalResistance', 0.67),
          increment: getSkillFlatIncrement('elementalResistance', 0.67),
          interval: SKILL_INTERVAL,
          bonus: getSkillFlatBonus('elementalResistance', 0.8),
        }),
      },
    });

    stats[`${element}ResistancePercent`] = createPercentStat({
      item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
      itemTags: ['defense', 'jewelry'],
      sub: 'elemental',
    });
  });
  return stats;
};

export const DEFENSE_STATS = {
  life: createStat({
    base: 100,
    levelUpBonus: 1,
    training: {
      cost: 160,
      bonus: getTrainingBonus('life'),
      maxLevel: Infinity,
    },
    item: {
      ...getItemRange('life'),
      scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('life'),
        increment: getSkillFlatIncrement('life'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('life', 1.5),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('life', 1.7),
        increment: getSkillFlatIncrement('life', 1.7),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('life', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('life', 1.33),
        increment: getSkillFlatIncrement('life', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('life', 1.5),
      }),
    },
  }),
  lifePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(15, 250, 1.1) },
    itemTags: ['belt', 'pants'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.2, power: 0.6, max: 2000,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 0.05, softcap: 2000, linear: 0.002, power: 0.6, max: 40,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 8, softcap: 2000, linear: 0.2, power: 0.6, max: 4000,
      }),
    },
  }),
  armor: createStat({
    training: {
      cost: 200,
      bonus: getTrainingBonus('armor'),
      maxLevel: Infinity,
    },
    item: {
      ...getItemRange('armor'),
      scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('armor'),
        increment: getSkillFlatIncrement('armor'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('armor', 1.8),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('armor'),
        increment: getSkillFlatIncrement('armor'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('armor', 1.5),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('armor', 1.67),
        increment: getSkillFlatIncrement('armor', 1.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('armor', 2.0),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('armor', 1.33),
        increment: getSkillFlatIncrement('armor', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('armor', 1.8),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('armor', 0.67),
        increment: getSkillFlatIncrement('armor', 0.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('armor', 1.2),
      }),
    },
  }),
  armorPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['armor', 'shield'],
    sub: 'defense',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.5, power: 0.6, max: 100,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 8, softcap: 2000, linear: 0.6, power: 0.6, max: 150,
      }),
    },
  }),
  blockChance: createChanceStat({
    training: {
      cost: 400,
      costIncrease: 600,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.05,
      maxLevel: 200,
    }, // max bonus: 15%
    item: { tierScalingMaxPercent: createTierScaling(5, 50, 0.8) },
    itemTags: ['shield'],
    show: true,
    sub: 'defense',
    cap: 50,
    skills: {
      passive: getSkillBonusesChance({
        type: 'passive', base: 1, levelsPerPoint: 20, cap: 50,
      }),
      buff: getSkillBonusesChance({
        type: 'buff', base: 1, levelsPerPoint: 20, cap: 50,
      }),
    },
  }),
  blockChancePercent: createPercentStat({}),
  lifeRegen: createStat({
    dec: 1,
    training: {
      cost: 100, bonus: 1, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('lifeRegen'),
      scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['belt', 'pants'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('lifeRegen'),
        increment: getSkillFlatIncrement('lifeRegen'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifeRegen', 1.5),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('lifeRegen', 1.33),
        increment: getSkillFlatIncrement('lifeRegen', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifeRegen', 1.6),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('lifeRegen', 1.67),
        increment: getSkillFlatIncrement('lifeRegen', 1.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifeRegen', 2.0),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('lifeRegen', 1.33),
        increment: getSkillFlatIncrement('lifeRegen', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifeRegen', 1.8),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('lifeRegen', 0.67),
        increment: getSkillFlatIncrement('lifeRegen', 0.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('lifeRegen', 1.2),
      }),
    },
  }),
  lifeRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['belt'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6, max: 100,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 8, softcap: 2000, linear: 0.06, power: 0.6, max: 150,
      }),
    },
  }),
  lifeRegenOfTotalPercent: createPercentStat({
    dec: 2,
    training: {
      cost: 1000, bonus: 0.01, maxLevel: 100,
    },
    item: { tierScalingMaxPercent: createTierScaling(0.05, 1, 0.9) },
    itemTags: ['belt'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.3, softcap: 2000, linear: 0.0005, power: 0.6, max: 3,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.5, softcap: 2000, linear: 0.0008, power: 0.6, max: 3.5,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 1, softcap: 2000, linear: 0.0015, power: 0.6, max: 5,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.7, softcap: 2000, linear: 0.001, power: 0.6, max: 4,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 0.2, softcap: 2000, linear: 0.0004, power: 0.6, max: 2,
      }),
    },
  }),
  thornsDamage: createStat({
    dec: 1,
    training: {
      cost: 100, bonus: 2, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('thornsDamage'),
      scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['shield', 'armor'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('thornsDamage'),
        increment: getSkillFlatIncrement('thornsDamage'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('thornsDamage'),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('thornsDamage', 1.33),
        increment: getSkillFlatIncrement('thornsDamage', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('thornsDamage', 1.5),
      }),
    },
  }),
  thornsDamagePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(18, 250, 1.2) },
    itemTags: ['shield', 'armor'],
    sub: 'defense',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  thornsOnMiss: createHiddenStat({ sub: 'defense' }),
  resurrectionChance: createChanceStat({
    item: { tierScalingMaxPercent: createTierScaling(4, 20, 0.7) },
    itemTags: ['amulet'],
    sub: 'defense',
    skills: {
      passive: getSkillBonusesChance({
        type: 'passive', base: 1, levelsPerPoint: 20, cap: 25,
      }),
      buff: getSkillBonusesChance({
        type: 'buff', base: 1, levelsPerPoint: 20, cap: 25,
      }),
    },
  }),
  reflectFireDamage: createStat({
    skills: {
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('reflectFireDamage', 2.5),
        increment: getSkillFlatIncrement('reflectFireDamage', 2.5),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('reflectFireDamage', 1.5),
      }),
    },
  }),
  evasion: createStat({
    dec: 1,
    training: {
      cost: 200, bonus: 14, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('evasion'),
      scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('evasion'),
        increment: getSkillFlatIncrement('evasion'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasion'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('evasion', 1.33),
        increment: getSkillFlatIncrement('evasion', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasion', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('evasion', 1.67),
        increment: getSkillFlatIncrement('evasion', 1.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasion', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('evasion', 1.33),
        increment: getSkillFlatIncrement('evasion', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasion', 1.4),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('evasion', 0.67),
        increment: getSkillFlatIncrement('evasion', 0.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasion', 0.8),
      }),
    },
  }),
  evasionPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['boots', 'helmet'],
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('evasionPercent'),
        increment: getSkillFlatIncrement('evasionPercent'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasionPercent'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('evasionPercent', 1.33),
        increment: getSkillFlatIncrement('evasionPercent', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasionPercent', 1.2),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('evasionPercent', 1.33),
        increment: getSkillFlatIncrement('evasionPercent', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('evasionPercent', 1.5),
      }),
    },
  }),
  ...generateElementalDefenseStats(),
  allResistance: createStat({
    item: {
      ...getItemRange('allResistance'),
      scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense', 'jewelry'],
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('allResistance'),
        increment: getSkillFlatIncrement('allResistance'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('allResistance'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('allResistance', 1.33),
        increment: getSkillFlatIncrement('allResistance', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('allResistance', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('allResistance', 1.67),
        increment: getSkillFlatIncrement('allResistance', 1.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('allResistance', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('allResistance', 1.33),
        increment: getSkillFlatIncrement('allResistance', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('allResistance', 1.5),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('allResistance', 0.67),
        increment: getSkillFlatIncrement('allResistance', 0.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('allResistance', 0.8),
      }),
    },
  }),
  allResistancePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(7, 100, 1.2) },
    itemTags: ['defense', 'jewelry'],
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 2000, linear: 0.1, power: 0.6, max: 100,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 3, softcap: 2000, linear: 0.15, power: 0.6, max: 150,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 5, softcap: 2000, linear: 0.25, power: 0.6, max: 200,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 4, softcap: 2000, linear: 0.2, power: 0.6, max: 175,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 1, softcap: 2000, linear: 0.05, power: 0.6, max: 50,
      }),
    },
  }),
  manaShieldPercent: createPercentStat({
    skills: {
      buff: getSkillBonusesPercent({
        type: 'buff', base: 5, softcap: 2000, linear: 0.5, power: 0.6, max: 100,
      }),
    },
  }),
  manaShieldDamageTakenReductionPercent: createPercentStat({ sub: 'defense' }),
  arenaDamageReductionPercent: createPercentStat({
    sub: 'defense',
    cap: 80,
  }),
  itemLifeEffectivenessPercent: createPercentStat({ sub: 'defense' }),
  itemArmorEffectivenessPercent: createPercentStat({ sub: 'defense' }),
  shieldEffectivenessPercent: createStat({
    dec: 1,
    sub: 'defense',
  }),
  shieldFlatEffectivenessPercent: createStat({
    dec: 1,
    sub: 'defense',
  }),
  divineProtectionBuffEffectivenessPercent: createPercentStat({ sub: 'defense' }),
  damageTakenConvertedToColdPercent: createPercentStat({
    sub: 'elemental',
    cap: 75,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 1, softcap: 2000, linear: 0.1, power: 0.5, max: 75,
      }),
    },
  }),
  coldDamageTakenReductionPercent: createPercentStat({
    sub: 'elemental',
    cap: 50,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 1, softcap: 2000, linear: 0.1, power: 0.5, max: 50,
      }),
    },
  }),
  elementalDamageTakenReductionPercent: createPercentStat({
    sub: 'elemental',
    cap: 80,
  }),
  damageTakenReductionPercent: createPercentStat({
    show: true,
    sub: 'defense',
    cap: 80,
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 2, softcap: 200, linear: 0.15, power: 0.6, max: 35,
      }),
    },
  }),
};
