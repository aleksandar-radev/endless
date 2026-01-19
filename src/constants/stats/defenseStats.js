import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createChanceStat, createHiddenStat, getSkillBonusesFlat, getSkillBonusesPercent, getSkillBonusesChance } from './stats.js';
import { ELEMENTS } from '../common.js';

const resistanceTierScalingMaxPercent = createTierScaling(18, 250, 1.2);

const defenseScaling = (level, tier) => itemStatScaleFactor(level, tier);

const generateElementalDefenseStats = () => {
  const stats = {};
  Object.keys(ELEMENTS).forEach((element) => {
    stats[`${element}Resistance`] = createStat({
      training: {
        cost: 100, bonus: 3, maxLevel: Infinity,
      },
      item: {
        min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier),
      },
      itemTags: ['defense', 'jewelry'],
      show: true,
      sub: 'elemental',
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
      cost: 160, bonus: 16, maxLevel: Infinity,
    },
    item: {
      min: 30, max: 80, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 60, increment: 12, interval: 50, bonus: 0.15,
      }),
    },
  }),
  lifePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(15, 250, 1.1) },
    itemTags: ['belt', 'pants'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.5, power: 0.6, max: 100,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 8, softcap: 2000, linear: 0.6, power: 0.6, max: 150,
      }),
    },
  }),
  armor: createStat({
    training: {
      cost: 200, bonus: 14, maxLevel: Infinity,
    },
    item: {
      min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 24, increment: 4, interval: 50, bonus: 0.18,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 20, increment: 3, interval: 50, bonus: 0.15,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 30, increment: 6, interval: 50, bonus: 0.2,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 25, increment: 5, interval: 50, bonus: 0.18,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 15, increment: 3, interval: 50, bonus: 0.12,
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
      min: 3, max: 8, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['belt', 'pants'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 2, increment: 0.5, interval: 50, bonus: 0.15,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 2.5, increment: 0.6, interval: 50, bonus: 0.16,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 4, increment: 1, interval: 50, bonus: 0.2,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 3, increment: 0.8, interval: 50, bonus: 0.18,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 1.5, increment: 0.4, interval: 50, bonus: 0.12,
      }),
    },
  }),
  lifeRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['belt'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.5, power: 0.6, max: 100,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 8, softcap: 2000, linear: 0.6, power: 0.6, max: 150,
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
        type: 'passive', base: 0.3, softcap: 2000, linear: 0.05, power: 0.6, max: 300,
      }),
      toggle: getSkillBonusesPercent({
        type: 'toggle', base: 0.5, softcap: 2000, linear: 0.08, power: 0.6, max: 350,
      }),
      instant: getSkillBonusesPercent({
        type: 'instant', base: 1, softcap: 2000, linear: 0.15, power: 0.6, max: 500,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 0.7, softcap: 2000, linear: 0.1, power: 0.6, max: 400,
      }),
      summon: getSkillBonusesPercent({
        type: 'summon', base: 0.2, softcap: 2000, linear: 0.04, power: 0.6, max: 200,
      }),
    },
  }),
  thornsDamage: createStat({
    dec: 1,
    training: {
      cost: 100, bonus: 2, maxLevel: Infinity,
    },
    item: {
      min: 15, max: 40, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['shield', 'armor'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
    },
  }),
  thornsDamagePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(18, 250, 1.2) },
    itemTags: ['shield', 'armor'],
    sub: 'defense',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    },
  }),
  thornsOnMiss: createHiddenStat({ sub: 'defense' }),
  resurrectionChance: createChanceStat({
    item: { tierScalingMaxPercent: createTierScaling(8, 40, 0.7) },
    itemTags: ['amulet'],
    sub: 'defense',
    skills: {
      passive: getSkillBonusesChance({
        type: 'passive', base: 1, levelsPerPoint: 20, cap: 50,
      }),
      buff: getSkillBonusesChance({
        type: 'buff', base: 1, levelsPerPoint: 20, cap: 50,
      }),
    },
  }),
  reflectFireDamage: createStat({
    skills: {
      buff: getSkillBonusesFlat({
        type: 'buff', base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
    },
  }),
  evasion: createStat({
    dec: 1,
    training: {
      cost: 200, bonus: 14, maxLevel: Infinity,
    },
    item: {
      min: 30, max: 75, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 50, increment: 10, interval: 50, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 60, increment: 12, interval: 50, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 80, increment: 15, interval: 50, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 70, increment: 14, interval: 50, bonus: 0.14,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 30, increment: 5, interval: 50, bonus: 0.08,
      }),
    },
  }),
  evasionPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['boots', 'helmet'],
    sub: 'defense',
  }),
  ...generateElementalDefenseStats(),
  allResistance: createStat({
    item: {
      min: 8, max: 20, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense', 'jewelry'],
    sub: 'elemental',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 12, increment: 2.5, interval: 50, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 5, increment: 1, interval: 50, bonus: 0.08,
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

