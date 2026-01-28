import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Druid skills
export const DRUID_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
  summonPest: {
    id: 'summonPest',
    name: () => t('skill.summonPest.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2.5, max: 0.8 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 2.5, increment: 1 },
        }),
        earthDamage: getSkillStatBonus({
          level, statKey: 'earthDamage', skillType: 'summon', scale: { base: 2.5, increment: 1 },
        }),
        waterDamage: getSkillStatBonus({
          level, statKey: 'waterDamage', skillType: 'summon', scale: { base: 2.5, increment: 1 },
        }),
        attackSpeed: 1,
      };
    },
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 18000,
    duration: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'summon-pest',
    description: () => t('skill.summonPest'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
  },
  barkSkin: {
    id: 'barkSkin',
    name: () => t('skill.barkSkin.name'),
    type: () => 'passive',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bark-skin',
    description: () => t('skill.barkSkin'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 0.42, increment: 0.5 },
      }),
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'naturalAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },
  naturalAffinity: {
    id: 'naturalAffinity',
    name: () => t('skill.naturalAffinity.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'leaf',
    description: () => t('skill.naturalAffinity'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 1, increment: 2 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 0.4, max: 1 },
      }),
    }),
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
  rejuvenation: {
    id: 'rejuvenation',
    name: () => t('skill.rejuvenation.name'),
    type: () => 'buff',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 45000,
    duration: () => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'rejuvenation',
    description: () => t('skill.rejuvenation'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', scale: { base: 3.33, increment: 2.5 },
      }),
      lifeRegenPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenPercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      extraDamageFromLifeRegenPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifeRegenPercent', skillType: 'buff', scale: { base: 2.5, max: 1 },
      }) / 5,
    }),
    synergies: [
      {
        sourceSkillId: 'barkSkin',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },
  entanglingRoots: {
    id: 'entanglingRoots',
    name: () => t('skill.entanglingRoots.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 15200,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'roots',
    description: () => t('skill.entanglingRoots'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      reduceEnemyDamagePercent: getSkillStatBonus({
        level, statKey: 'reduceEnemyDamagePercent', skillType: 'instant', scale: { base: 1, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'naturalAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  frostBloom: {
    id: 'frostBloom',
    name: () => t('skill.frostBloom.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.35,
    cooldown: () => 13500,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'frost-bloom',
    description: () => t('skill.frostBloom'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.naturalistInstantSkillsUnlocked > 0,
    effect: (level) => ({
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'entanglingRoots',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  sproutling: {
    id: 'sproutling',
    name: () => t('skill.sproutling.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 1.25, max: 0.6 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 5, increment: 2 },
        }),
        earthDamage: getSkillStatBonus({
          level, statKey: 'earthDamage', skillType: 'summon', scale: { base: 5, increment: 2 },
        }),
        attackSpeed: 2,
      };
    },
    manaCost: (level) => 3 + level * 0.2,
    cooldown: () => 14000,
    duration: () => 5250,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'sproutling',
    description: () => t('skill.sproutling'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    synergies: [
      {
        sourceSkillId: 'summonPest',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2
  // ===========================================================================
  animalCompanion: {
    id: 'animalCompanion',
    name: () => t('skill.animalCompanion.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2.5, max: 1 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 7.5, increment: 2 },
        }),
        attackSpeed: 0.9,
        lifePerHit: getSkillStatBonus({
          level, statKey: 'lifePerHit', skillType: 'summon', scale: { base: 5, increment: 3 },
        }),
      };
    },
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 56000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'companion',
    description: () => t('skill.animalCompanion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    synergies: [
      {
        sourceSkillId: 'sproutling',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },

  // Summoner specialization bonus skill
  summonTreant: {
    id: 'summonTreant',
    name: () => t('skill.summonTreant.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 3.75, max: 4 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 15, increment: 6 },
        }),
        earthDamage: getSkillStatBonus({
          level, statKey: 'earthDamage', skillType: 'summon', scale: { base: 20, increment: 8 },
        }),
        attackSpeed: 0.25,
      };
    },
    manaCost: (level) => 10 + level * 0.4,
    cooldown: () => 90000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'primeval-guardian',
    description: () => t('skill.summonTreant'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.summonerExtraSummonUnlocked > 0,
    effect: (level) => ({}),
  },
  naturalGrowth: {
    id: 'naturalGrowth',
    name: () => t('skill.naturalGrowth.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'growth',
    description: () => t('skill.naturalGrowth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 1 },
      }),
      extraDamageFromLifePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifePercent', skillType: 'passive', scale: { base: 0.4, max: 1.11 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'naturalAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 500,
        }),
      },
    ],
  },

  stoneTorrent: {
    id: 'stoneTorrent',
    name: () => t('skill.stoneTorrent.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 7 + level * 0.45,
    cooldown: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'stone-torrent',
    description: () => t('skill.stoneTorrent'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.naturalistInstantSkillsUnlocked > 0,
    effect: (level) => ({
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', scale: { base: 5, increment: 2.5 },
      }),
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'instant', scale: { base: 2 },
      }),
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'hurricane',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
  hurricane: {
    id: 'hurricane',
    name: () => t('skill.hurricane.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 8 + level * 0.5,
    cooldown: () => 11400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'hurricane',
    description: () => t('skill.hurricane'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 4, increment: 2 },
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 4, increment: 2 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'entanglingRoots',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  spiritBear: {
    id: 'spiritBear',
    name: () => t('skill.spiritBear.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 3.75, max: 2 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 3, increment: 3 },
        }),
        earthDamage: getSkillStatBonus({
          level, statKey: 'earthDamage', skillType: 'summon', scale: { base: 2, increment: 2 },
        }),
        attackSpeed: 0.6,
      };
    },
    manaCost: (level) => 8 + level * 0.5,
    cooldown: () => 120000,
    duration: () => 43250,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'spirit-bear',
    description: () => t('skill.spiritBear'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    synergies: [
      {
        sourceSkillId: 'animalCompanion',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },
  stoneform: {
    id: 'stoneform',
    name: () => t('skill.stoneform.name'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 52000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'stoneform',
    description: () => t('skill.stoneform'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', scale: { base: 0.8, increment: 0.8 },
      }),
      armorPercent: getSkillStatBonus({
        level, statKey: 'armorPercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'buff', scale: { base: 0.66, increment: 0.66 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'barkSkin',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // Shapeshifting Skills (Unlocked via Shapeshifter specialization)
  bearForm: {
    id: 'bearForm',
    name: () => t('skill.bearForm.name'),
    type: () => 'buff',
    exclusiveWith: () => ['snakeForm'],
    exclusiveBuffGroup: () => 'shapeshiftForm',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 60000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'bear-form',
    description: () => t('skill.bearForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.shapeshiftUnlocked > 0,
    effect: (level) => ({
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'buff', scale: { base: 3, increment: 5 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'buff', scale: { base: 3.75, increment: 5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'stoneform',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },
  snakeForm: {
    id: 'snakeForm',
    name: () => t('skill.snakeForm.name'),
    type: () => 'buff',
    exclusiveWith: () => ['bearForm'],
    exclusiveBuffGroup: () => 'shapeshiftForm',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 60000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'snake-form',
    description: () => t('skill.snakeForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.shapeshiftUnlocked > 0,
    effect: (level) => ({
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'buff', scale: { base: 3.75, increment: 3 },
      }),
      poisonDamagePercent: getSkillStatBonus({
        level, statKey: 'poisonDamagePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      poisonChance: 20,
    }),
    synergies: [
      {
        sourceSkillId: 'summonPest',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
  spiritLink: {
    id: 'spiritLink',
    name: () => t('skill.spiritLink.name'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.625,
    cooldown: () => 76000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'spirit-link',
    description: () => t('skill.spiritLink'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: getSkillStatBonus({
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 0.4, max: 1 },
      }),
      manaPerHit: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'buff', scale: { base: 1, increment: 1.25 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'rejuvenation',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },
  moonfury: {
    id: 'moonfury',
    name: () => t('skill.moonfury.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'moonfury',
    description: () => t('skill.moonfury'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'passive', scale: { base: 5, increment: 3 },
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'passive', scale: { base: 5, increment: 3 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'hurricane',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5
  // ===========================================================================
  earthsEmbrace: {
    id: 'earthsEmbrace',
    name: () => t('skill.earthsEmbrace.name'),
    type: () => 'buff',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 64000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'embrace',
    description: () => t('skill.earthsEmbrace'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: getSkillStatBonus({
        level, statKey: 'armorPercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', scale: { base: 3.33, increment: 2.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'stoneform',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  wrathOfNature: {
    id: 'wrathOfNature',
    name: () => t('skill.wrathOfNature.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath-of-nature',
    description: () => t('skill.wrathOfNature'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', scale: { base: 3.33, increment: 2 },
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2.5, increment: 1.3 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'naturalGrowth',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 6
  // ===========================================================================
  avatarOfNature: {
    id: 'avatarOfNature',
    name: () => t('skill.avatarOfNature.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'avatar-of-nature',
    description: () => t('skill.avatarOfNature'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2.5, increment: 1.5 },
      }),
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 3, increment: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'wrathOfNature',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 1200
  // ===========================================================================
  spiritBond: {
    id: 'spiritBond',
    name: () => t('skill.spiritBond.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'spirit-bond',
    description: () => t('skill.spiritBond'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive', scale: { base: 5, increment: 2 },
      }),
      manaRegenPercent: getSkillStatBonus({
        level, statKey: 'manaRegenPercent', skillType: 'passive', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'spiritLink',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  wildGrowth: {
    id: 'wildGrowth',
    name: () => t('skill.wildGrowth.name'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'wild-growth',
    description: () => t('skill.wildGrowth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', scale: { base: 5, increment: 3.75 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'rejuvenation',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2000
  // ===========================================================================
  ancientRoots: {
    id: 'ancientRoots',
    name: () => t('skill.ancientRoots.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'ancient-roots',
    description: () => t('skill.ancientRoots'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 1.25, increment: 1.5 },
      }),
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'entanglingRoots',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  furyOfTheWilds: {
    id: 'furyOfTheWilds',
    name: () => t('skill.furyOfTheWilds.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'fury-of-the-wilds',
    description: () => t('skill.furyOfTheWilds'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const damage = getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 7, increment: 2.5 },
      });
      const coldDamagePercent = getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1 },
      });
      const waterDamagePercent = getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 1 },
      });
      return {
        damage,
        coldDamagePercent,
        waterDamagePercent,
      };
    },
    synergies: [
      {
        sourceSkillId: 'frostBloom',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3000
  // ===========================================================================
  natureEternal: {
    id: 'natureEternal',
    name: () => t('skill.natureEternal.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'nature-eternal',
    description: () => t('skill.natureEternal'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2, increment: 1.3 },
      }),
      endurance: getSkillStatBonus({
        level, statKey: 'endurance', skillType: 'passive', scale: { base: 2, increment: 1.3 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'naturalAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  primevalGuardian: {
    id: 'primevalGuardian',
    name: () => t('skill.primevalGuardian.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 3.75, max: 1.5 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 20, increment: 4 },
        }),
        earthDamage: getSkillStatBonus({
          level, statKey: 'earthDamage', skillType: 'summon', scale: { base: 20, increment: 4 },
        }),
        earthDamagePercent: getSkillStatBonus({
          level, statKey: 'earthDamagePercent', skillType: 'summon', scale: { base: 2 },
        }),
        attackSpeed: 1.25,
      };
    },
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 150000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'primeval-guardian',
    description: () => t('skill.primevalGuardian'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    synergies: [
      {
        sourceSkillId: 'summonTreant',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5000
  // ===========================================================================
  earthsEmbraceAscended: {
    id: 'earthsEmbraceAscended',
    name: () => t('skill.earthsEmbraceAscended.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'earths-embrace',
    description: () => t('skill.earthsEmbrace'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 2.08, increment: 1.2 },
      }),
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'passive', scale: { base: 2, increment: 1.2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'earthsEmbrace',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  cosmicHarmony: {
    id: 'cosmicHarmony',
    name: () => t('skill.cosmicHarmony.name'),
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'cosmic-harmony',
    description: () => t('skill.cosmicHarmony'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', scale: { base: 12.5, increment: 2.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'avatarOfNature',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
};
