import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Druid skills
export const DRUID_SKILLS = {
  // Tier 1 Skills
  summonPest: {
    id: 'summonPest',
    name: () => t('skill.summonPest.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2.5, limit: 80 },
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
      armorPerLevel: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', perLevel: true,
      }),
      armorPercent: getSkillStatBonus({
        level, statKey: 'armorPercent', skillType: 'passive', scale: { base: 1 },
      }),
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive', scale: { base: 1 },
      }),
      lifeRegenPerLevel: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive', perLevel: true,
      }),
      extraDamageFromLifeRegenPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifeRegenPercent', skillType: 'passive', scale: { base: 5, limit: 100 },
      }) / 10,
    }),
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
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true,
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 0.4 },
      }),
      lifeRegenOfTotalPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenOfTotalPercent', skillType: 'passive', scale: { base: 0.33, limit: 2 },
      }),
    }),
  },

  // Tier 10 Skills
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
      lifeRegenPerLevel: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', perLevel: true,
      }),
      lifeRegenPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenPercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      extraDamageFromLifeRegenPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifeRegenPercent', skillType: 'buff', scale: { base: 2.5, limit: 75 },
      }) / 5,
    }),
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
      earthDamagePerLevel: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', perLevel: true,
      }),
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      reduceEnemyDamagePercent: getSkillStatBonus({
        level, statKey: 'reduceEnemyDamagePercent', skillType: 'instant', scale: { base: 20, limit: 25 },
      }),
    }),
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
      waterDamagePerLevel: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', perLevel: true,
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', perLevel: true,
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
    }),
  },

  sproutling: {
    id: 'sproutling',
    name: () => t('skill.sproutling.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 1.25, limit: 60 },
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
  },

  // Tier 25 Skills
  animalCompanion: {
    id: 'animalCompanion',
    name: () => t('skill.animalCompanion.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2.5, limit: 100 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 7.5, increment: 3 },
        }),
        attackSpeed: 0.9,
        lifePerHit: getSkillStatBonus({
          level, statKey: 'lifePerHit', skillType: 'summon', scale: { base: 5, increment: 5 },
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
  },

  // Summoner specialization bonus skill
  summonTreant: {
    id: 'summonTreant',
    name: () => t('skill.summonTreant.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 3.75, limit: 400 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 15, increment: 5 },
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
        level, statKey: 'extraDamageFromLifePercent', skillType: 'passive', scale: { base: 0.4, limit: 1.11 },
      }),
    }),
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
      earthDamagePerLevel: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', perLevel: true,
      }),
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'instant', scale: { base: 2 },
      }),
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      waterDamagePerLevel: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', perLevel: true,
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 2 },
      }),
    }),
  },

  // Tier 50 Skills
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
      waterDamagePerLevel: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', perLevel: true,
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 4, increment: 2 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', perLevel: true,
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
    }),
  },

  spiritBear: {
    id: 'spiritBear',
    name: () => t('skill.spiritBear.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 3.75, limit: 200 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 15, increment: 5 },
        }),
        earthDamage: getSkillStatBonus({
          level, statKey: 'earthDamage', skillType: 'summon', scale: { base: 12.5, increment: 4 },
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
      armorPerLevel: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', perLevel: true, scale: { base: 2 },
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
      allResistancePerLevel: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'buff', perLevel: true,
      }),
    }),
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
        level, statKey: 'life', skillType: 'buff', scale: { base: 0.83, increment: 0.83 },
      }),
      lifePerLevel: getSkillStatBonus({
        level, statKey: 'life', skillType: 'buff', perLevel: true, scale: { base: 5 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'buff', scale: { base: 3.75, increment: 3 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'buff', perLevel: true,
      }),
    }),
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
      earthDamagePerLevel: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'buff', perLevel: true,
      }),
      poisonDamagePercent: getSkillStatBonus({
        level, statKey: 'poisonDamagePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      poisonChance: 20,
    }),
  },

  // Tier 75 Skills
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
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 0.4, limit: 10 },
      }),
      manaPerHit: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'buff', scale: { base: 1, increment: 1.25 },
      }),
      manaPerHitPerLevel: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'buff', perLevel: true,
      }),
    }),
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
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'passive', perLevel: true,
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'passive', scale: { base: 5, increment: 3 },
      }),
      waterDamagePerLevel: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'passive', perLevel: true,
      }),
    }),
  },

  // Tier 100 Skills
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
      lifeRegenPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenPercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', scale: { base: 3.33, increment: 2.5 },
      }),
      lifeRegenPerLevel: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', perLevel: true,
      }),
      lifeRegenOfTotalPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenOfTotalPercent', skillType: 'buff', scale: { base: 0.14, limit: 2 },
      }),
    }),
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
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', perLevel: true,
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2.5, increment: 4 },
      }),
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true, scale: { base: 2 },
      }),
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
    }),
  },

  // Tier 200 Skills
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
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 3.75, increment: 6 },
      }),
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true, scale: { base: 3 },
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'passive', scale: { base: 1 },
      }),
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 3, increment: 3 },
      }),
      strengthPerLevel: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', perLevel: true, scale: { base: 3 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 1 },
      }),
    }),
  },

  // Tier 1200 Skills
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
        level, statKey: 'lifeRegen', skillType: 'passive', scale: { base: 5, increment: 4 },
      }),
      lifeRegenPerLevel: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive', perLevel: true, scale: { base: 2 },
      }),
      lifeRegenPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenPercent', skillType: 'passive', scale: { base: 1 },
      }),
      manaRegenPercent: getSkillStatBonus({
        level, statKey: 'manaRegenPercent', skillType: 'passive', scale: { base: 1 },
      }),
      extraDamageFromLifeRegenPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifeRegenPercent', skillType: 'passive', scale: { base: 5, limit: 20 },
      }) / 2,
    }),
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
      lifeRegenPerLevel: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', perLevel: true, scale: { base: 1.5 },
      }),
      lifeRegenPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenPercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      lifeRegenOfTotalPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenOfTotalPercent', skillType: 'buff', scale: { base: 0.14, limit: 2 },
      }),
    }),
  },

  // Tier 2000 Skills
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
      armorPerLevel: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', perLevel: true, scale: { base: 3 },
      }),
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      lifePerLevel: getSkillStatBonus({
        level, statKey: 'life', skillType: 'passive', perLevel: true, scale: { base: 5 },
      }),
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'passive', scale: { base: 2 },
      }),
    }),
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
      const damagePerLevel = getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', perLevel: true,
      });
      const coldDamagePercent = getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1 },
      });
      const waterDamagePercent = getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 1 },
      });
      return {
        damage,
        damagePerLevel,
        coldDamagePercent,
        waterDamagePercent,
      };
    },
  },

  // Tier 3000 Skills
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
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 7.5, increment: 12 },
      }),
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true, scale: { base: 6 },
      }),
      endurance: getSkillStatBonus({
        level, statKey: 'endurance', skillType: 'passive', scale: { base: 15, increment: 12 }, // Assuming default misc stats are small, need big scaling? No, base is 4. 30/4 = 7.5
      }),
      endurancePerLevel: getSkillStatBonus({
        level, statKey: 'endurance', skillType: 'passive', perLevel: true, // No skills on endurance? Assuming added
      }),
      perseverance: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', scale: { base: 15, increment: 24 },
      }),
      perseverancePerLevel: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', perLevel: true, scale: { base: 6 },
      }),
    }),
  },
  primevalGuardian: {
    id: 'primevalGuardian',
    name: () => t('skill.primevalGuardian.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 3.75, limit: 150 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 20, increment: 8 },
        }),
        earthDamage: getSkillStatBonus({
          level, statKey: 'earthDamage', skillType: 'summon', scale: { base: 20, increment: 8 },
        }),
        earthDamagePercent: getSkillStatBonus({
          level, statKey: 'earthDamagePercent', skillType: 'summon', scale: { base: 2.5 },
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
  },

  // Tier 5000 Skills
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
        level, statKey: 'armor', skillType: 'passive', scale: { base: 2.08, increment: 2.5 },
      }),
      armorPerLevel: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', perLevel: true, scale: { base: 5 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 2 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 3, increment: 3 },
      }),
      allResistancePerLevel: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', perLevel: true, scale: { base: 2 },
      }),
    }),
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
        level, statKey: 'elementalDamage', skillType: 'toggle', scale: { base: 12.5, increment: 10 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', perLevel: true,
      }),
    }),
  },
};