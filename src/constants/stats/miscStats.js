import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createHiddenStat } from './stats.js';

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
  }),
  manaRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(10, 100, 1.2) },
    itemTags: ['jewelry', 'magic'],
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
  }),
  intelligencePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'magic'],
  }),
  perseverance: createStat({
    item: {
      min: STATS_MIN, max: STATS_MAX, scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
  }),
  perseverancePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
  }),
  enduranceThornsDamagePerPoint: createStat({
    dec: 1,
    sub: 'defense',
  }),
  summonsCanCrit: createHiddenStat(),
  bonusGoldPercent: createPercentStat({
    item: { tierScalingMaxPercent: rewardTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    show: true,
    sub: 'rewards',
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
  }),
  cooldownReductionCapPercent: createStat({
    base: 80,
    div: 100,
    sub: 'misc',
  }),
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
