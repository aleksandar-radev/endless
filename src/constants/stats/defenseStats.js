import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createChanceStat, createHiddenStat, getSkillBonusesPercent, getSkillBonusesChance, createDefaultSkillBonusesPercent, createDefaultSkillBonusesFlat } from './stats.js';
import { ELEMENTS } from '../common.js';
import { getItemRange, getTrainingBonus } from '../ratios.js';

const resistanceTierScalingMaxPercent = createTierScaling(100, 2000, 1.2);

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
      skills: createDefaultSkillBonusesFlat('elementalResistance', {
        toggle: {
          base: 1.33, increment: 1.33, bonus: 1.33,
        },
        buff: { bonus: 1.2 },
        summon: {
          base: 0.67, increment: 0.67, bonus: 0.8,
        },
      }),
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
    skills: createDefaultSkillBonusesFlat('life', {
      passive: { bonus: 1.5 },
      instant: {
        base: 1.7, increment: 1.7, bonus: 1.5,
      },
      buff: {
        base: 1.33, increment: 1.33, bonus: 1.5,
      },
    }),
  }),
  lifePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(15, 250, 1.1) },
    itemTags: ['belt', 'pants'],
    skills: createDefaultSkillBonusesPercent(),
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
    skills: createDefaultSkillBonusesFlat('armor', {
      passive: { bonus: 1.8 },
      toggle: { bonus: 1.5 },
      instant: {
        base: 1.67, increment: 1.67, bonus: 2.0,
      },
      buff: {
        base: 1.33, increment: 1.33, bonus: 1.8,
      },
      summon: { base: 0.67, increment: 0.67 },
    }),
  }),
  armorPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['armor', 'shield'],
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent(),
  }),
  armorPercentPerLevel: createPercentStat({
    sub: 'defense',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 0.5, softcap: 2000, linear: 0.08, power: 0.81,
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
        type: 'passive', base: 1, levelsPerPoint: 20, cap: 20,
      }),
      buff: getSkillBonusesChance({
        type: 'buff', base: 1, levelsPerPoint: 20, cap: 30,
      }),
    },
  }),
  blockChancePercent: createPercentStat({}),
  blockChanceCap: createStat({
    base: 50,
    showValue: true,
    displayed: false,
  }),
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
    skills: createDefaultSkillBonusesFlat('lifeRegen', {
      passive: { bonus: 1.5 },
      toggle: {
        base: 1.33, increment: 1.33, bonus: 1.6,
      },
      instant: {
        base: 1.67, increment: 1.67, bonus: 2.0,
      },
      buff: {
        base: 1.33, increment: 1.33, bonus: 1.8,
      },
      summon: { base: 0.67, increment: 0.67 },
    }),
  }),
  lifeRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['belt'],
    skills: createDefaultSkillBonusesPercent({
      passive: { base: 5 },
      buff: { base: 8, linear: 0.06 },
    }),
  }),
  lifeRegenOfTotalPercent: createPercentStat({
    dec: 2,
    training: {
      cost: 1000, bonus: 0.01, maxLevel: 100,
    },
    item: { tierScalingMaxPercent: createTierScaling(0.05, 1, 0.9) },
    itemTags: ['belt'],
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.3, linear: 0.0005, max: 3,
      },
      toggle: {
        base: 0.5, linear: 0.0008, max: 3.5,
      },
      instant: {
        base: 1, linear: 0.0015, max: 5,
      },
      buff: {
        base: 0.7, linear: 0.001, max: 4,
      },
      summon: {
        base: 0.2, linear: 0.0004, max: 2,
      },
    }),
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
    skills: createDefaultSkillBonusesFlat('thornsDamage', { buff: { base: 1.33, increment: 1.33 } }),
  }),
  thornsDamagePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(18, 250, 1.2) },
    itemTags: ['shield', 'armor'],
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent({ passive: { base: 5 } }),
  }),
  thornsOnMiss: createHiddenStat({ sub: 'defense' }),
  resurrectionChance: createChanceStat({
    item: { tierScalingMaxPercent: createTierScaling(4, 20, 0.7) },
    itemTags: ['amulet', 'helmet'],
    sub: 'defense',
    cap: 95,
    skills: {
      passive: getSkillBonusesChance({
        type: 'passive', base: 1, levelsPerPoint: 20, cap: 15,
      }),
      buff: getSkillBonusesChance({
        type: 'buff', base: 1, levelsPerPoint: 20, cap: 20,
      }),
    },
  }),
  reflectFireDamage: createStat({ skills: createDefaultSkillBonusesFlat('reflectFireDamage', { buff: { base: 2.5, increment: 2.5 } }) }),
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
    skills: createDefaultSkillBonusesFlat('evasion', {
      toggle: {
        base: 1.33, increment: 1.33, bonus: 1.2,
      },
      buff: { base: 1.33, increment: 1.33 },
      summon: {
        base: 0.67, increment: 0.67, bonus: 0.8,
      },
    }),
  }),
  evasionPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['boots', 'helmet'],
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent(),
  }),
  avoidChance: createChanceStat({
    forceNotShow: true,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 0.466, linear: 0.1, max: 80,
      },
    }),
  }),
  ...generateElementalDefenseStats(),
  allResistance: createStat({
    item: {
      ...getItemRange('allResistance'),
      scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense', 'jewelry'],
    sub: 'elemental',
    skills: createDefaultSkillBonusesFlat('allResistance', {
      toggle: {
        base: 1.33, increment: 1.33, bonus: 1.2,
      },
      summon: {
        base: 0.67, increment: 0.67, bonus: 0.8,
      },
    }),
  }),
  allResistancePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(7, 100, 1.2) },
    itemTags: ['defense', 'jewelry'],
    sub: 'elemental',
    skills: createDefaultSkillBonusesPercent({
      passive: { linear: 0.1 },
      toggle: { base: 3, max: 7000 },
      buff: { base: 4, max: 8000 },
    }),
  }),
  manaShieldPercent: createPercentStat({ skills: createDefaultSkillBonusesPercent({ buff: { linear: 0.103, max: 100 } }) }),
  manaShieldDamageTakenReductionPercent: createPercentStat({
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent({ passive: { linear: 0.2, max: 50 } }),
  }),
  arenaDamageReductionPercent: createPercentStat({
    sub: 'defense',
    cap: 80,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 5, softcap: 500, linear: 0.15, max: 75,
      },
    }),
  }),
  itemLifeEffectivenessPercent: createPercentStat({
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 15, linear: 2, power: 0.725,
      },
    }),
  }),
  itemArmorEffectivenessPercent: createPercentStat({
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 15, linear: 2, power: 0.725,
      },
    }),
  }),
  shieldEffectivenessPercent: createStat({
    dec: 1,
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 15, linear: 2, power: 0.725,
      },
    }),
  }),
  shieldFlatEffectivenessPercent: createStat({
    dec: 1,
    sub: 'defense',
  }),
  divineProtectionBuffEffectivenessPercent: createPercentStat({
    sub: 'defense',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  damageTakenConvertedToColdPercent: createPercentStat({
    sub: 'elemental',
    cap: 75,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 1, linear: 0.1, power: 0.5, max: 75,
      },
    }),
  }),
  coldDamageTakenReductionPercent: createPercentStat({
    sub: 'elemental',
    cap: 50,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 1, linear: 0.1, power: 0.5, max: 50,
      },
    }),
  }),
  elementalDamageTakenReductionPercent: createPercentStat({
    sub: 'elemental',
    cap: 80,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 1, linear: 0.1, max: 25,
      },
    }),
  }),
  damageTakenReductionPercent: createPercentStat({
    show: true,
    sub: 'defense',
    cap: 80,
    skills: createDefaultSkillBonusesPercent({
      passive: {
        softcap: 200, linear: 0.15, max: 35,
      },
    }),
  }),
};
