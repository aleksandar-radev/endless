import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';
import { hero } from '../../globals.js';

// Rogue skills extracted from skills.js
export const ROGUE_SKILLS = {
  // Tier 0 Skills
  shadowDance: {
    id: 'shadowDance',
    name: () => t('Shadow Dance'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dagger',
    description: () => t('skill.shadowDance'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 1, 20, 400, 0.5),
      critChance: Math.min(scaleDownFlat(level, 0.07), 20),
      agility: scaleUpFlat(level, 4),
    }),
  },
  evasion: {
    id: 'evasion',
    name: () => t('Evasion'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dodge',
    description: () => t('skill.evasion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      dexterity: scaleUpFlat(level, 4),
      dexterityPercent: scaleDownFlat(level, 1),
      extraDamageFromEvasionPercent: Math.min(0.03 * scaleDownFlat(level), 2.5),
    }),
  },

  // Tier 1 Skills
  poisonAffinity: {
    id: 'poisonAffinity',
    name: () => t('Poison Affinity'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'poison-affinity',
    description: () => t('skill.poisonAffinity'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: scaleUpFlat(level, 3, 6, 0.2),
      earthDamagePercent: scaleDownFlat(level, 1),
      intelligencePercent: scaleDownFlat(level, 0.75),
    }),
  },
  poisonDagger: {
    id: 'poisonDagger',
    name: () => t('Poison Dagger'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison-dagger',
    description: () => t('skill.poisonDagger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 3, 5, 0.2),
      earthDamage: scaleUpFlat(level, 3, 5, 0.2),
      attackSpeedPercent: Math.min(scaleDownFlat(level, 0.375), 100),
    }),
  },
  shadowForm: {
    id: 'shadowForm',
    name: () => t('Shadow Form'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 66000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'stealth',
    description: () => t('skill.shadowForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.05), 20),
      critDamage: Math.min(scaleDownFlat(level, 0.003, 20, 500), 3),
      agilityPercent: scaleDownFlat(level, 1.5),
    }),
  },

  // Tier 2 Skills
  flurry: {
    id: 'flurry',
    name: () => t('Flurry'),
    type: () => 'summon',
    summonStats: (level) => ({
      percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.35), 30),
      damage: scaleUpFlat(level, 4, 6, 0.3),
      attackSpeed: 4,
    }),
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 10000,
    duration: () => 3000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'flurry',
    description: () => t('skill.flurry'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: () => ({
    }),
  },
  precision: {
    id: 'precision',
    name: () => t('Precision'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'agility',
    description: () => t('skill.precision'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRating: scaleUpFlat(level, 8, 7, 0.2),
      attackRatingPercent: scaleDownFlat(level, 1),
      agilityPercent: scaleDownFlat(level, 1.5),
    }),
  },

  backstab: {
    id: 'backstab',
    name: () => t('Backstab'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 0,
    cooldown: () => 18200,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'backstab',
    description: () => t('skill.backstab'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 15),
      earthDamagePercent: scaleDownFlat(level, 15),
      ignoreEnemyArmor: 1,
      ignoreAllEnemyResistances: 1,
    }),
  },

  evasiveManeuver: {
    id: 'evasiveManeuver',
    name: () => t('Evasive Maneuver'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'evasive-maneuver',
    description: () => t('skill.evasiveManeuver'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      dexterity: scaleUpFlat(level, 5),
      dexterityPercent: scaleDownFlat(level, 2),
      extraDamageFromEvasionPercent: Math.min(0.02 * scaleDownFlat(level), 3),
    }),
  },

  // Tier 4 Skills
  darkPact: {
    id: 'darkPact',
    name: () => t('Dark Pact'),
    type: () => 'buff',
    manaCost: (level) => 14 + level * 0.375,
    cooldown: () => 61000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'dark-pact',
    description: () => t('skill.darkPact'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(scaleDownFlat(level, 0.0065), 5),
      attackSpeedPercent: Math.min(scaleDownFlat(level, 0.25), 100),
      earthDamagePercent: scaleDownFlat(level, 2),
    }),
  },

  // Tier 5 Skills
  assassination: {
    id: 'assassination',
    name: () => t('Assassination'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.5,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'assassination',
    description: () => t('skill.assassination'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 3, 5, 0.2),
      damagePercent: scaleDownFlat(level, 2),
      earthDamage: scaleUpFlat(level, 5, 5, 0.3),
      earthDamagePercent: scaleDownFlat(level, 4),
    }),
  },

  deadlyPrecision: {
    id: 'deadlyPrecision',
    name: () => t('Deadly Precision'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'precision',
    description: () => t('skill.deadlyPrecision'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.05), 20),
      critDamage: Math.min(scaleDownFlat(level, 0.0035, 10, 350), 3),
      attackRating: scaleUpFlat(level, 15),
      attackRatingPercent: scaleDownFlat(level, 1.5),
    }),
  },

  // Tier 6 Skills
  masterThief: {
    id: 'masterThief',
    name: () => t('Master Thief'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'master',
    description: () => t('skill.masterThief'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 1),
      dexterityPercent: scaleDownFlat(level, 2),
      agilityPercent: scaleDownFlat(level, 2),
      bonusGoldPercent: Math.min(scaleDownFlat(level, 0.25), 100),
    }),
  },

  // Tier 1200 Skills
  shadowMastery: {
    id: 'shadowMastery',
    name: () => t('Shadow Mastery'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'shadow-mastery',
    description: () => t('skill.shadowMastery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.075), 25),
      damagePercent: scaleDownFlat(level, 2),
      evasionPercent: scaleDownFlat(level, 1.5),
    }),
  },
  venomousAssault: {
    id: 'venomousAssault',
    name: () => t('Venomous Assault'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 15 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'venomous-assault',
    description: () => t('skill.venomousAssault'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: scaleUpFlat(level, 10, 5, 0.5),
      earthDamagePercent: scaleDownFlat(level, 15),
    }),
  },

  // Tier 2000 Skills
  phantomStrike: {
    id: 'phantomStrike',
    name: () => t('Phantom Strike'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'phantom-strike',
    description: () => t('skill.phantomStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 15),
      damagePercent: scaleDownFlat(level, 3),
      ignoreEnemyArmor: 1,
    }),
  },
  silentExecution: {
    id: 'silentExecution',
    name: () => t('Silent Execution'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'silent-execution',
    description: () => t('skill.silentExecution'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(scaleDownFlat(level, 0.01), 3),
      doubleDamageChance: Math.min(scaleDownFlat(level, 0.1, 10, 300, 0.5), 20),
      attackSpeedPercent: Math.min(scaleDownFlat(level, 0.375), 75),
    }),
  },

  // Tier 3000 Skills
  eclipseForm: {
    id: 'eclipseForm',
    name: () => t('Eclipse Form'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 140000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eclipse-form',
    description: () => t('skill.eclipseForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRatingPercent: scaleDownFlat(level, 4),
      extraDamageFromAttackRatingPercent: Math.min(0.03 * scaleDownFlat(level), 6),
      damagePercent: scaleDownFlat(level, 1),
    }),
  },
  perfectDodge: {
    id: 'perfectDodge',
    name: () => t('Perfect Dodge'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'perfect-dodge',
    description: () => t('skill.perfectDodge'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      blockChance: Math.min(scaleDownFlat(level, 0.085), 25),
      evasionPercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 5000 Skills
  kingOfThieves: {
    id: 'kingOfThieves',
    name: () => t('King of Thieves'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'king-of-thieves',
    description: () => t('skill.kingOfThieves'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      bonusGoldPercent: scaleDownFlat(level, 0.75),
      dexterityPercent: scaleDownFlat(level, 2),
      agilityPercent: scaleDownFlat(level, 2),
    }),
  },
  nightfallAssassin: {
    id: 'nightfallAssassin',
    name: () => t('Nightfall Assassin'),
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 0.35,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'nightfall-assassin',
    description: () => t('skill.nightfallAssassin'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 3.5),
      critChance: Math.min(scaleDownFlat(level, 0.15), 50),
    }),
  },

  // Specialization Skills
  shadowClone: {
    id: 'shadowClone',
    name: () => t('Shadow Clone'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: 5 + level * 5,
        attackSpeed: hero.stats.attackSpeed,
      };
    },
    manaCost: (level) => 30 + level * 1,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'clone-mastery',
    description: () => t('skill.shadowClone'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
    isVisible: () => hero.stats.cloneUnlocked > 0,
  },
};
