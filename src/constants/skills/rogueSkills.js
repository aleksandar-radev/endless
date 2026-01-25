import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Rogue skills extracted from skills.js
export const ROGUE_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
  shadowDance: {
    id: 'shadowDance',
    name: () => t('skill.shadowDance.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dagger',
    description: () => t('skill.shadowDance'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      agility: getSkillStatBonus({
        level, statKey: 'agility', skillType: 'passive',
      }),
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'passive', scale: { max: 0.2 },
      }),
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
      dexterity: getSkillStatBonus({
        level, statKey: 'dexterity', skillType: 'passive',
      }),
      extraDamageFromEvasionPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromEvasionPercent', skillType: 'passive', scale: { max: 2 },
      }),
    }),
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
  poisonAffinity: {
    id: 'poisonAffinity',
    name: () => t('skill.poisonAffinity.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison-affinity',
    description: () => t('skill.poisonAffinity'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthResistance: getSkillStatBonus({
        level, statKey: 'earthResistance', skillType: 'passive', scale: { base: 6, increment: 4 },
      }),
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'passive', scale: { base: 2, increment: 1.5 },
      }),
    }),
  },
  poisonDagger: {
    id: 'poisonDagger',
    name: () => t('skill.poisonDagger.name'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.28,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison-dagger',
    description: () => t('skill.poisonDagger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle',
      }),
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'toggle', scale: { base: 1.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'poisonAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      agility: getSkillStatBonus({
        level, statKey: 'agility', skillType: 'buff', scale: { base: 2 },
      }),
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'buff', scale: { max: 0.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'shadowDance',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.2, increment: 0.2, cap: 500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2
  // ===========================================================================
  flurry: {
    id: 'flurry',
    name: () => t('skill.flurry.name'),
    type: () => 'summon',
    summonStats: (level) => ({
      percentOfPlayerDamage: getSkillStatBonus({
        level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2, max: 0.15 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'summon', scale: { base: 6, increment: 2 },
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
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'passive',
      }),
      extraDamageFromAttackRatingPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromAttackRatingPercent', skillType: 'passive', scale: { max: 1 },
      }),
    }),
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
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
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1.5 },
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
      dexterity: getSkillStatBonus({
        level, statKey: 'dexterity', skillType: 'passive', scale: { base: 2, increment: 3 },
      }),
      extraDamageFromEvasionPercent: getSkillStatBonus({
        level,
        statKey: 'extraDamageFromEvasionPercent',
        skillType: 'passive',
        scale: {
          base: 0.3, linear: 0.3, max: 0.2,
        },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'evasion',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
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
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'buff', scale: { base: 2, linear: 1.5 },
      }),
      critDamage: getSkillStatBonus({
        level, statKey: 'critDamage', skillType: 'buff', scale: { base: 1, increment: 0.5 },
      }),
    }),
  },

  poisonAmplification: {
    id: 'poisonAmplification',
    name: () => t('skill.poisonAmplification.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'poison-amplification',
    description: () => t('skill.poisonAmplification'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthResistance: getSkillStatBonus({
        level, statKey: 'earthResistance', skillType: 'passive', scale: { base: 1, increment: 2 },
      }),
      extraDamageFromEarthResistancePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromEarthResistancePercent', skillType: 'passive', scale: { max: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'poisonAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5
  // ===========================================================================
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 2, increment: 0.8 },
      }),
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'toggle', scale: { base: 2, increment: 0.8 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'poisonDagger',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 2000,
        }),
      },
    ],
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
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'passive', scale: { base: 1.5, increment: 1 },
      }),
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'passive', scale: { max: 0.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'precision',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.2, increment: 0.2, cap: 500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 6
  // ===========================================================================
  masterThief: {
    id: 'masterThief',
    name: () => t('skill.masterThief.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'master',
    description: () => t('skill.masterThief'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      dexterity: getSkillStatBonus({
        level, statKey: 'dexterity', skillType: 'passive', scale: { base: 3, increment: 5 },
      }),
      agility: getSkillStatBonus({
        level, statKey: 'agility', skillType: 'passive', scale: { base: 3, increment: 5 },
      }),
    }),
  },

  // ===========================================================================
  // TIER 1200
  // ===========================================================================
  shadowMastery: {
    id: 'shadowMastery',
    name: () => t('skill.shadowMastery.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'shadow-mastery',
    description: () => t('skill.shadowMastery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', scale: { base: 5, increment: 1 },
      }),
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'passive', scale: { max: 0.6 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'shadowDance',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', scale: { base: 6, increment: 3 },
      }),
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'poisonDagger',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.4, cap: 2500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2000
  // ===========================================================================
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 8, increment: 3 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1.5 },
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
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { max: 1.5 },
      }),
      critDamage: getSkillStatBonus({
        level, statKey: 'critDamage', skillType: 'passive', scale: { base: 0.2, max: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'deadlyPrecision',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3000
  // ===========================================================================
  eclipseForm: {
    id: 'eclipseForm',
    name: () => t('skill.eclipseForm.name'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 120000,
    duration: () => 95000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eclipse-form',
    description: () => t('skill.eclipseForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'buff', scale: { base: 1.5, increment: 1 },
      }),
      extraDamageFromAttackRatingPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromAttackRatingPercent', skillType: 'buff', scale: { max: 1.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'shadowForm',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2000,
        }),
      },
    ],
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
      evasion: getSkillStatBonus({
        level, statKey: 'evasion', skillType: 'passive', scale: { base: 2, increment: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'evasiveManeuver',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5000
  // ===========================================================================
  kingOfThieves: {
    id: 'kingOfThieves',
    name: () => t('skill.kingOfThieves.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'king-of-thieves',
    description: () => t('skill.kingOfThieves'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      bonusGoldPercent: getSkillStatBonus({
        level, statKey: 'bonusGoldPercent', skillType: 'passive', scale: { base: 1 },
      }),
      dexterity: getSkillStatBonus({
        level, statKey: 'dexterity', skillType: 'passive', scale: { base: 5, increment: 10 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'masterThief',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.4, cap: 2500,
        }),
      },
    ],
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 15, increment: 6 },
      }),
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'toggle', scale: { base: 2.5, max: 1 },
      }),
    }),
  },

  // Specialization Skills
  shadowClone: {
    id: 'shadowClone',
    name: () => t('skill.shadowClone.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 1.5, max: 0.15 },
        }),
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