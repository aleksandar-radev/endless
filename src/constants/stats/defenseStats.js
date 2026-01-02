import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createHiddenStat } from './stats.js';
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
      cost: 80, bonus: 8, maxLevel: Infinity,
    },
    item: {
      min: 30, max: 80, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
  }),
  lifePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(15, 250, 1.1) },
    itemTags: ['belt', 'pants'],
  }),
  armor: createStat({
    training: {
      cost: 100, bonus: 4, maxLevel: Infinity,
    },
    item: {
      min: 25, max: 60, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
  }),
  armorPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['armor', 'shield'],
    sub: 'defense',
  }),
  blockChance: createPercentStat({
    training: {
      cost: 400,
      costIncrease: 600,
      costIncreaseMultiplier: 1.01,
      costThresholds: [{ level: 50, costIncreaseMultiplier: 1.018 }],
      bonus: 0.05,
      maxLevel: 300,
    }, // max bonus: 15%
    item: { tierScalingMaxPercent: createTierScaling(5, 50, 0.8) },
    itemTags: ['shield'],
    show: true,
    sub: 'defense',
    cap: 50,
  }),
  blockChancePercent: createStat({ div: 100 }),
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
  }),
  lifeRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: resistanceTierScalingMaxPercent },
    itemTags: ['belt'],
  }),
  lifeRegenOfTotalPercent: createPercentStat({
    dec: 2,
    training: {
      cost: 1000, bonus: 0.01, maxLevel: 100,
    },
    item: { tierScalingMaxPercent: createTierScaling(0.05, 1, 0.9) },
    itemTags: ['belt'],
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
  }),
  thornsDamagePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(18, 250, 1.2) },
    itemTags: ['shield', 'armor'],
    sub: 'defense',
  }),
  thornsOnMiss: createHiddenStat({ sub: 'defense' }),
  resurrectionChance: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(8, 40, 0.7) },
    itemTags: ['amulet'],
    sub: 'defense',
  }),
  reflectFireDamage: createStat(),
  evasion: createStat({
    dec: 1,
    training: {
      cost: 100, bonus: 3, maxLevel: Infinity,
    },
    item: {
      min: 30, max: 75, scaling: (level, tier) => defenseScaling(level, tier),
    },
    itemTags: ['defense'],
    show: true,
    sub: 'defense',
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
  }),
  allResistancePercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(7, 100, 1.2) },
    itemTags: ['defense', 'jewelry'],
    sub: 'elemental',
  }),
  manaShieldPercent: createPercentStat(),
  manaShieldDamageTakenReductionPercent: createPercentStat({ sub: 'defense' }),
  arenaDamageReductionPercent: createPercentStat({
    sub: 'defense',
    cap: 80,
  }),
  itemLifeEffectivenessPercent: createPercentStat({ sub: 'defense' }),
  itemArmorEffectivenessPercent: createPercentStat({ sub: 'defense' }),
  shieldEffectiveness: createStat({
    dec: 1,
    sub: 'defense',
  }),
  divineProtectionBuffEffectivenessPercent: createPercentStat({ sub: 'defense' }),
  damageTakenConvertedToColdPercent: createPercentStat({
    sub: 'elemental',
    cap: 75,
  }),
  coldDamageTakenReductionPercent: createPercentStat({
    sub: 'elemental',
    cap: 50,
  }),
  elementalDamageTakenReductionPercent: createPercentStat({
    sub: 'elemental',
    cap: 80,
  }),
  damageTakenReductionPercent: createPercentStat({
    show: true,
    sub: 'defense',
    cap: 80,
  }),
};
