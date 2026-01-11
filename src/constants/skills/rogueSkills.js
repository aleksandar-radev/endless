import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent } from '../../common.js';
import { hero } from '../../globals.js';

// Rogue skills extracted from skills.js
export const ROGUE_SKILLS = {
  // Tier 0 Skills
  shadowDance: {
    id: 'shadowDance',
    name: () => t('skill.shadowDance.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dagger',
    description: () => t('skill.shadowDance'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      agility: getScalingFlat({
        level, base: 4, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      agilityPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      critChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 20),
    }),
  },
  evasion: {
    id: 'evasion',
    name: () => t('skill.evasion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dodge',
    description: () => t('skill.evasion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      dexterity: getScalingFlat({
        level, base: 4, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      dexterityPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      extraDamageFromEvasionPercent: Math.min(getScalingPercent({
        level, base: 0.5, linear: 0.1,
      }) / 100, 2.5),
    }),
  },

  // Tier 1 Skills
  poisonAffinity: {
    id: 'poisonAffinity',
    name: () => t('skill.poisonAffinity.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'poison-affinity',
    description: () => t('skill.poisonAffinity'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: getScalingFlat({
        level, base: 3, increment: 1, interval: 50, bonus: 0.1,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  poisonDagger: {
    id: 'poisonDagger',
    name: () => t('skill.poisonDagger.name'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison-dagger',
    description: () => t('skill.poisonDagger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 5, increment: 2, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      earthDamage: getScalingFlat({
        level, base: 5, increment: 2, interval: 50, bonus: 0.1,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  shadowForm: {
    id: 'shadowForm',
    name: () => t('skill.shadowForm.name'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 66000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'stealth',
    description: () => t('skill.shadowForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      agility: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      agilityPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      critChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 20),
    }),
  },

  // Tier 2 Skills
  flurry: {
    id: 'flurry',
    name: () => t('skill.flurry.name'),
    type: () => 'summon',
    summonStats: (level) => ({
      percentOfPlayerDamage: Math.min(getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }), 30),
      damage: getScalingFlat({
        level, base: 8, increment: 1.5, interval: 50, bonus: 0.15,
      }),
      attackSpeed: 4,
    }),
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 10000,
    duration: () => 3000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'flurry',
    description: () => t('skill.flurry'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: () => ({}),
  },
  precision: {
    id: 'precision',
    name: () => t('skill.precision.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'agility',
    description: () => t('skill.precision'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRating: getScalingFlat({
        level, base: 25, increment: 5, interval: 50, bonus: 0.15,
      }),
      attackRatingPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  backstab: {
    id: 'backstab',
    name: () => t('skill.backstab.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 0,
    cooldown: () => 18200,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'backstab',
    description: () => t('skill.backstab'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 20, softcap: 2000, linear: 0.8, power: 0.6,
      }),
      earthDamagePercent: getScalingPercent({
        level, base: 20, softcap: 2000, linear: 0.8, power: 0.6,
      }),
      ignoreEnemyArmor: 1,
      ignoreAllEnemyResistances: 1,
    }),
  },

  evasiveManeuver: {
    id: 'evasiveManeuver',
    name: () => t('skill.evasiveManeuver.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'evasive-maneuver',
    description: () => t('skill.evasiveManeuver'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      dexterity: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
      dexterityPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      extraDamageFromEvasionPercent: Math.min(getScalingPercent({
        level, base: 0.5, linear: 0.1,
      }) / 100, 3),
    }),
  },

  // Tier 4 Skills
  darkPact: {
    id: 'darkPact',
    name: () => t('skill.darkPact.name'),
    type: () => 'buff',
    manaCost: (level) => 14 + level * 0.375,
    cooldown: () => 61000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'dark-pact',
    description: () => t('skill.darkPact'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.005, interval: 50, bonus: 0,
      }),
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 100),
    }),
  },

  // Tier 5 Skills
  assassination: {
    id: 'assassination',
    name: () => t('skill.assassination.name'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.5,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'assassination',
    description: () => t('skill.assassination'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.005, interval: 50, bonus: 0,
      }),
      earthDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  deadlyPrecision: {
    id: 'deadlyPrecision',
    name: () => t('skill.deadlyPrecision.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'precision',
    description: () => t('skill.deadlyPrecision'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRating: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      attackRatingPerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      critChance: Math.min(getScalingPercent({
        level, base: 2.5, softcap: 2000, linear: 0.1, power: 0.5,
      }), 20),
    }),
  },

  // Tier 6 Skills
  masterThief: {
    id: 'masterThief',
    name: () => t('skill.masterThief.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'master',
    description: () => t('skill.masterThief'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      dexterity: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.1,
      }),
      dexterityPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.005, interval: 50, bonus: 0,
      }),
      agility: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.1,
      }),
      agilityPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 1200 Skills
  shadowMastery: {
    id: 'shadowMastery',
    name: () => t('skill.shadowMastery.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'shadow-mastery',
    description: () => t('skill.shadowMastery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 30, increment: 5, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      critChance: Math.min(getScalingPercent({
        level, base: 3, softcap: 2000, linear: 0.1, power: 0.5,
      }), 25),
    }),
  },
  venomousAssault: {
    id: 'venomousAssault',
    name: () => t('skill.venomousAssault.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 15 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'venomous-assault',
    description: () => t('skill.venomousAssault'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: getScalingFlat({
        level, base: 25, increment: 5, interval: 50, bonus: 0.15,
      }),
      earthDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 2000 Skills
  phantomStrike: {
    id: 'phantomStrike',
    name: () => t('skill.phantomStrike.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'phantom-strike',
    description: () => t('skill.phantomStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 35, increment: 5, interval: 50, bonus: 0.15,
      }),
      damagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      ignoreEnemyArmor: 1,
    }),
  },
  silentExecution: {
    id: 'silentExecution',
    name: () => t('skill.silentExecution.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'silent-execution',
    description: () => t('skill.silentExecution'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 75),
      critDamage: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 3),
    }),
  },

  // Tier 3000 Skills
  eclipseForm: {
    id: 'eclipseForm',
    name: () => t('skill.eclipseForm.name'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 140000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eclipse-form',
    description: () => t('skill.eclipseForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRating: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.1,
      }),
      attackRatingPerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  perfectDodge: {
    id: 'perfectDodge',
    name: () => t('skill.perfectDodge.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'perfect-dodge',
    description: () => t('skill.perfectDodge'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      evasion: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.1,
      }),
      evasionPerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 5000 Skills
  kingOfThieves: {
    id: 'kingOfThieves',
    name: () => t('skill.kingOfThieves.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'king-of-thieves',
    description: () => t('skill.kingOfThieves'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      bonusGold: getScalingFlat({
        level, base: 10, increment: 5, interval: 50, bonus: 0.1,
      }),
      dexterity: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.1,
      }),
      dexterityPerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  nightfallAssassin: {
    id: 'nightfallAssassin',
    name: () => t('skill.nightfallAssassin.name'),
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 0.35,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'nightfall-assassin',
    description: () => t('skill.nightfallAssassin'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 35, increment: 5, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.025, increment: 0.01, interval: 50, bonus: 0,
      }),
      critChance: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.1, power: 0.5,
      }), 50),
    }),
  },

  // Specialization Skills
  shadowClone: {
    id: 'shadowClone',
    name: () => t('skill.shadowClone.name'),
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
    icon: () => 'shadow-clone',
    description: () => t('skill.shadowClone'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    isVisible: () => hero.stats.cloneUnlocked > 0,
  },
};
