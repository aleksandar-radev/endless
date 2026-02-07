import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createHiddenStat, getSkillBonusesFlat, createDefaultSkillBonusesPercent, createDefaultSkillBonusesFlat } from './stats.js';
import { getItemRange } from '../ratios.js';

const rewardTierScalingMaxPercent = createTierScaling(20, 400, 1.2);
const dropTierScalingMaxPercent = createTierScaling(13, 200, 1.2);
const attributeTierScalingMaxPercent = createTierScaling(12, 200, 1.2);

const miscScaling = (level, tier) => itemStatScaleFactor(level, tier);

export const MISC_STATS = {
  mana: createStat({
    base: 50,
    levelUpBonus: 0,
    training: {
      cost: 120, bonus: 5, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('mana'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: createDefaultSkillBonusesFlat('mana', {
      toggle: { base: 1.33, increment: 1.33 },
      buff: {
        base: 1.33, increment: 1.33, bonus: 1.2,
      },
      summon: {
        base: 0.67, increment: 0.67, bonus: 0.8,
      },
    }),
  }),
  manaPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(8, 100, 1.2) },
    itemTags: ['misc', 'jewelry', 'magic'],
    sub: 'resources',
    skills: createDefaultSkillBonusesPercent(),
  }),
  manaRegen: createStat({
    dec: 1,
    training: {
      cost: 300, bonus: 0.1, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('manaRegen'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: createDefaultSkillBonusesFlat('manaRegen'),
  }),
  manaRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(10, 100, 1.2) },
    itemTags: ['jewelry', 'magic'],
    sub: 'resources',
    skills: createDefaultSkillBonusesPercent(),
  }),
  manaPerHit: createStat({
    dec: 1,
    training: {
      cost: 1750, bonus: 1, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('manaPerHit'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: createDefaultSkillBonusesFlat('manaPerHit'),
  }),
  manaPerHitPercent: createStat({ div: 100, sub: 'resources' }),
  manaSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(1.25, 10, 1.2) },
    show: true,
    sub: 'resources',
  }),
  manaStealPercent: createPercentStat({ forceNotShow: true }),
  strength: createStat({
    item: {
      ...getItemRange('strength'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
    skills: createDefaultSkillBonusesFlat('strength'),
  }),
  strengthPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'axe', 'mace'],
    skills: createDefaultSkillBonusesPercent(),
    forceNotShow: true,
  }),
  agility: createStat({
    item: {
      ...getItemRange('agility'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
    skills: createDefaultSkillBonusesFlat('agility'),
  }),
  agilityPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'axe', 'mace'],
    skills: createDefaultSkillBonusesPercent(),
    forceNotShow: true,
  }),
  vitality: createStat({
    item: {
      ...getItemRange('vitality'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat'],
    skills: createDefaultSkillBonusesFlat('vitality'),
  }),
  vitalityPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc'],
    skills: createDefaultSkillBonusesPercent({
      passive: { base: 5 },
      buff: { base: 8, linear: 0.08 },
      forceNotShow: true,
    }),
  }),
  wisdom: createStat({
    item: {
      ...getItemRange('wisdom'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
    skills: createDefaultSkillBonusesFlat('wisdom'),
  }),
  wisdomPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'magic'],
    skills: createDefaultSkillBonusesPercent(),
    forceNotShow: true,
  }),
  endurance: createStat({
    item: {
      ...getItemRange('endurance'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: createDefaultSkillBonusesFlat('endurance'),
  }),
  endurancePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    skills: createDefaultSkillBonusesPercent(),
    forceNotShow: true,
  }),
  dexterity: createStat({
    item: {
      ...getItemRange('dexterity'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: createDefaultSkillBonusesFlat('dexterity'),
  }),
  dexterityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    skills: createDefaultSkillBonusesPercent(),
    forceNotShow: true,
  }),
  intelligence: createStat({
    item: {
      ...getItemRange('intelligence'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
    skills: createDefaultSkillBonusesFlat('intelligence'),
  }),
  intelligencePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'magic'],
    skills: createDefaultSkillBonusesPercent(),
    forceNotShow: true,
  }),
  perseverance: createStat({
    item: {
      ...getItemRange('perseverance'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: createDefaultSkillBonusesFlat('perseverance'),
  }),
  perseverancePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    skills: createDefaultSkillBonusesPercent(),
    forceNotShow: true,
  }),
  enduranceThornsDamagePerPoint: createStat({
    dec: 1,
    sub: 'defense',
    skills: createDefaultSkillBonusesFlat({
      passive: {
        base: 0.2, increment: 0, interval: 0, bonus: 0,
      },
    }),
  }),
  summonsCanCrit: createHiddenStat(),
  bonusGoldPercent: createPercentStat({
    item: { tierScalingMaxPercent: rewardTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    show: true,
    sub: 'rewards',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 0.5, max: 500,
      },
    }),
  }),
  bonusExperiencePercent: createPercentStat({
    item: { tierScalingMaxPercent: rewardTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    show: true,
    sub: 'rewards',
  }),
  cooldownReductionPercent: createPercentStat({
    show: true,
    sub: 'misc',
    item: {
      tierScalingMaxPercent: createTierScaling(5, 5, 1),
      overrides: {
        WAND: { tierScalingMaxPercent: createTierScaling(10, 13, 1) },
        STAFF: { tierScalingMaxPercent: createTierScaling(20, 25, 1) },
        AMULET: { tierScalingMaxPercent: createTierScaling(15, 25, 1) },
        RING: { tierScalingMaxPercent: createTierScaling(5, 10, 1) },
      },
    },
    itemTags: ['magic', 'jewelry'],
    skills: createDefaultSkillBonusesPercent({
      passive: {
        linear: 0.01, power: 0.2, max: 10,
      },
      buff: {
        linear: 0.01, power: 0.5, max: 20,
      },
    }),
  }),
  cooldownReductionCapPercent: createStat({
    base: 80,
    div: 100,
    sub: 'misc',
  }),
  adDamagePercent: createPercentStat({ sub: 'rewards', show: true }),
  adLifePercent: createPercentStat({ sub: 'rewards', show: true }),
  adArmorPercent: createPercentStat({ sub: 'rewards', show: true }),
  adEvasionPercent: createPercentStat({ sub: 'rewards', show: true }),
  adAllResistancePercent: createPercentStat({ sub: 'rewards', show: true }),
  adXpBonusPercent: createPercentStat({ sub: 'rewards', show: true }),
  adGoldGainPercent: createPercentStat({ sub: 'rewards', show: true }),
  manaCostReductionPercent: createPercentStat({ sub: 'resources' }),
  buffDurationPercent: createPercentStat({
    show: true,
    sub: 'misc',
    item: {
      tierScalingMaxPercent: createTierScaling(20, 50, 1),
      overrides: {
        AMULET: { tierScalingMaxPercent: createTierScaling(40, 80, 1) },
        RING: { tierScalingMaxPercent: createTierScaling(20, 50, 1) },
      },
    },
    itemTags: ['jewelry'],
  }),
  buffEffectivenessPercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  itemBonusesPercent: createPercentStat({ sub: 'misc' }),
  itemQuantityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: dropTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'gloves'],
    show: true,
    sub: 'rewards',
  }),
  itemRarityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: dropTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'gloves'],
    show: true,
    sub: 'rewards',
  }),
  enemyRarityPercent: createStat({
    div: 100,
    show: true,
    sub: 'rewards',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 20, increment: 0, interval: 20, bonus: 0.5,
      }),
    },
  }),
  materialQuantityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: dropTierScalingMaxPercent },
    itemTags: ['jewelry', 'ring', 'amulet'],
    show: true,
    sub: 'rewards',
  }),
  skillPoints: createStat({
    show: true,
    sub: 'rewards',
  }),
  skillPointsPerLevel: createStat({ dec: 0, sub: 'rewards' }),
  attributesPerLevel: createStat({ dec: 0, sub: 'rewards' }),
  extraResourceDamageCapPerLevel: createStat({ dec: 0, sub: 'rewards' }),
  extraMaterialDropPercent: createStat({ div: 100, sub: 'rewards' }),
  extraMaterialDropMax: createStat({ base: 1, sub: 'rewards' }),
  manaRegenOfTotalPercent: createPercentStat({
    dec: 2,
    sub: 'resources',
    training: {
      cost: 1000, bonus: 0.01, maxLevel: 100,
    },
    item: { tierScalingMaxPercent: createTierScaling(0.05, 1, 1.2) },
    itemTags: ['staff'],
  }),
  allAttributes: createStat({
    item: {
      ...getItemRange('allAttributes'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['defense', 'jewelry', 'gloves', 'misc'],
    sub: 'misc',
    skills: createDefaultSkillBonusesFlat('allAttributes'),
  }),
  allAttributesPercent: createPercentStat({
    dec: 1,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent(),
  }),
  canDualWieldTwoHanded: createHiddenStat(),
  weaponEffectivenessPercent: createStat({ dec: 1, sub: 'misc' }),
  weaponFlatEffectivenessPercent: createStat({
    dec: 1,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 15, linear: 2, power: 0.725,
      },
    }),
  }),
  jewelryEffectivenessPercent: createStat({ dec: 1, sub: 'misc' }),
  jewelryFlatEffectivenessPercent: createStat({
    dec: 1,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 15, linear: 2, power: 0.725,
      },
    }),
  }),
  allowBossLoot: createHiddenStat({ itemTags: [] }),
  animatedWeaponsUnlocked: createHiddenStat(),
  cloneUnlocked: createHiddenStat(),
  nightStalkerBuffEffectivenessPercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.685,
      },
    }),
  }),
  canUseTwoShields: createHiddenStat(),
  amuletEffectivenessPercent: createPercentStat({ sub: 'misc' }),
  amuletFlatEffectivenessPercent: createStat({ dec: 1, sub: 'misc' }),
  ringEffectivenessPercent: createPercentStat({ sub: 'misc' }),
  ringFlatEffectivenessPercent: createStat({ dec: 1, sub: 'misc' }),
  uncappedAttackSpeed: createHiddenStat(),
  warlordEffectivenessPercent: createPercentStat({
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({
      passive: {
        base: 10, linear: 1, power: 0.725,
      },
    }),
  }),
  overhealToLife: createHiddenStat(),
  overhealPercent: createStat({
    div: 100,
    sub: 'misc',
    skills: createDefaultSkillBonusesPercent({ passive: { base: 5, linear: 0.5 } }),
  }),
  bloodSacrificeUnlocked: createHiddenStat(),
  shapeshiftUnlocked: createHiddenStat(),
  reduceEnemyResistancesPercent: createPercentStat({ sub: 'misc' }),
  convertManaToLifePercent: createPercentStat({ sub: 'resources' }),
  weaponIllusionUnlocked: createHiddenStat(),
  glacialBulwarkUnlocked: createHiddenStat(),
  weaponBuffEffectivenessPercent: createPercentStat({ sub: 'misc' }),
  crimsonAegisSkillUnlocked: createHiddenStat(),
  bloodSiphonSkillUnlocked: createHiddenStat(),
};
