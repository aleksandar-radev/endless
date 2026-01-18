import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createHiddenStat, getSkillBonusesFlat, getSkillBonusesPercent } from './stats.js';

const rewardTierScalingMaxPercent = createTierScaling(20, 400, 1.2);
const dropTierScalingMaxPercent = createTierScaling(13, 200, 1.2);
const attributeTierScalingMaxPercent = createTierScaling(12, 200, 1.2);

const STATS_MIN = 8;
const STATS_MAX = 15;

const miscScaling = (level, tier) => itemStatScaleFactor(level, tier);

export const MISC_STATS = {
  mana: createStat({
    base: 50,
    levelUpBonus: 0,
    training: {
      cost: 120, bonus: 5, maxLevel: Infinity,
    },
    item: {
      min: 25, max: 70, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 8, increment: 2, interval: 50, bonus: 0.1,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 12, increment: 2, interval: 50, bonus: 0.12,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 5, increment: 1, interval: 50, bonus: 0.08,
      }),
    },
  }),
  manaPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(8, 100, 1.2) },
    itemTags: ['misc', 'jewelry', 'magic'],
  }),
  manaRegen: createStat({
    dec: 1,
    training: {
      cost: 300, bonus: 0.1, maxLevel: Infinity,
    },
    item: {
      min: 2, max: 4, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 1, increment: 0.2, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 1.2, increment: 0.25, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 2, increment: 0.5, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 1.5, increment: 0.4, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 0.5, increment: 0.1, interval: 100, bonus: 0.08,
      }),
    },
  }),
  manaRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(10, 100, 1.2) },
    itemTags: ['jewelry', 'magic'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.5, power: 0.6, max: 100,
      }),
    },
  }),
  manaPerHit: createStat({
    dec: 1,
    training: {
      cost: 1750, bonus: 1, maxLevel: Infinity,
    },
    item: {
      min: 3, max: 6, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 1, increment: 0.2, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 1.5, increment: 0.3, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 3, increment: 0.5, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 2, increment: 0.4, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 0.5, increment: 0.1, interval: 100, bonus: 0.08,
      }),
    },
  }),
  manaPerHitPercent: createStat({ div: 100 }),
  manaSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(1.25, 10, 1.2) },
    show: true,
    sub: 'attack',
  }),
  manaStealPercent: createPercentStat({ forceNotShow: true }),
  strength: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 5, increment: 1, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 6, increment: 1.2, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 8, increment: 1.5, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 7, increment: 1.4, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 3, increment: 0.6, interval: 100, bonus: 0.08,
      }),
    },
  }),
  strengthPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'axe', 'mace'],
  }),
  agility: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 4, increment: 0.5, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 5, increment: 0.7, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 8, increment: 1, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 6, increment: 0.8, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 3, increment: 0.4, interval: 100, bonus: 0.08,
      }),
    },
  }),
  agilityPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'axe', 'mace'],
  }),
  vitality: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 4, increment: 0.5, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 5, increment: 0.7, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 8, increment: 1, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 6, increment: 0.8, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 3, increment: 0.4, interval: 100, bonus: 0.08,
      }),
    },
  }),
  vitalityPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc'],
  }),
  wisdom: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 4, increment: 1, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 5, increment: 1.2, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 8, increment: 1.5, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 6, increment: 1.4, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 3, increment: 0.6, interval: 100, bonus: 0.08,
      }),
    },
  }),
  wisdomPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'magic'],
  }),
  endurance: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
  }),
  endurancePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
  }),
  dexterity: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 4, increment: 0.5, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 5, increment: 0.7, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 8, increment: 1, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 6, increment: 0.8, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 3, increment: 0.4, interval: 100, bonus: 0.08,
      }),
    },
  }),
  dexterityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
  }),
  intelligence: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 5, increment: 1, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 6, increment: 1.2, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 10, increment: 2, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 8, increment: 1.5, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 4, increment: 0.8, interval: 100, bonus: 0.08,
      }),
    },
  }),
  intelligencePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'magic'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    },
  }),
  perseverance: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 2, increment: 0.25, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 2.5, increment: 0.3, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 4, increment: 0.5, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 3, increment: 0.4, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 1.5, increment: 0.2, interval: 100, bonus: 0.08,
      }),
    },
  }),
  perseverancePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
  }),
  enduranceThornsDamagePerPoint: createStat({
    dec: 1,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 0.2, increment: 0, interval: 0, bonus: 0,
      }),
    },
  }),
  summonsCanCrit: createHiddenStat(),
  bonusGoldPercent: createPercentStat({
    item: { tierScalingMaxPercent: rewardTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    show: true,
    sub: 'rewards',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 0.5, power: 0.6, max: 500,
      }),
    },
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
        WAND: { tierScalingMaxPercent: createTierScaling(10, 10, 1) },
        STAFF: { tierScalingMaxPercent: createTierScaling(20, 20, 1) },
        AMULET: { tierScalingMaxPercent: createTierScaling(15, 25, 1) },
        RING: { tierScalingMaxPercent: createTierScaling(5, 10, 1) },
      },
    },
    itemTags: ['magic', 'jewelry'],
    skills: {
      buff: getSkillBonusesPercent({
        type: 'buff', base: 2, softcap: 2000, linear: 0.1, power: 0.5, max: 50,
      }),
    },
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
  manaCostReductionPercent: createPercentStat(),
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
  buffEffectivenessPercent: createPercentStat({ sub: 'misc' }),
  itemBonusesPercent: createPercentStat(),
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
  skillPointsPerLevel: createStat({ dec: 0 }),
  attributesPerLevel: createStat({ dec: 0 }),
  extraResourceDamageCapPerLevel: createStat({ dec: 0 }),
  extraMaterialDropPercent: createStat({ div: 100 }),
  extraMaterialDropMax: createStat({ base: 1 }),
  manaRegenOfTotalPercent: createPercentStat({
    dec: 2,
    training: {
      cost: 1000, bonus: 0.01, maxLevel: 100,
    },
    item: { tierScalingMaxPercent: createTierScaling(0.05, 1, 1.2) },
    itemTags: ['staff'],
  }),
  allAttributes: createStat({
    item: {
      min: 4,
      max: 8,
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['defense', 'jewelry', 'gloves', 'misc'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 2, increment: 0.5, interval: 100, bonus: 0.1,
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle', base: 2.5, increment: 0.6, interval: 100, bonus: 0.12,
      }),
      instant: getSkillBonusesFlat({
        type: 'instant', base: 4, increment: 1, interval: 100, bonus: 0.15,
      }),
      buff: getSkillBonusesFlat({
        type: 'buff', base: 3, increment: 0.8, interval: 100, bonus: 0.13,
      }),
      summon: getSkillBonusesFlat({
        type: 'summon', base: 1, increment: 0.3, interval: 100, bonus: 0.08,
      }),
    },
  }),
  allAttributesPercent: createPercentStat(),
  canDualWieldTwoHanded: createHiddenStat(),
  weaponEffectivenessPercent: createStat({ dec: 1 }),
  weaponFlatEffectivenessPercent: createStat({ dec: 1 }),
  jewelryEffectivenessPercent: createStat({ dec: 1 }),
  jewelryFlatEffectivenessPercent: createStat({ dec: 1 }),
  allowBossLoot: createHiddenStat({ itemTags: [] }),
  animatedWeaponsUnlocked: createHiddenStat(),
  cloneUnlocked: createHiddenStat(),
  nightStalkerBuffEffectivenessPercent: createPercentStat(),
  canUseTwoShields: createHiddenStat(),
  amuletEffectivenessPercent: createPercentStat(),
  amuletFlatEffectivenessPercent: createStat({ dec: 1 }),
  ringEffectivenessPercent: createPercentStat(),
  ringFlatEffectivenessPercent: createStat({ dec: 1 }),
  uncappedAttackSpeed: createHiddenStat(),
  warlordEffectivenessPercent: createPercentStat(),
  overhealToLife: createHiddenStat(),
  overhealPercent: createStat({ div: 100 }),
  bloodSacrificeUnlocked: createHiddenStat(),
  shapeshiftUnlocked: createHiddenStat(),
  reduceEnemyResistancesPercent: createPercentStat(),
  convertManaToLifePercent: createPercentStat(),
  weaponIllusionUnlocked: createHiddenStat(),
  glacialBulwarkUnlocked: createHiddenStat(),
  weaponBuffEffectivenessPercent: createPercentStat(),
  crimsonAegisSkillUnlocked: createHiddenStat(),
  bloodSiphonSkillUnlocked: createHiddenStat(),
};

