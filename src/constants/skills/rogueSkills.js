import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Rogue skills extracted from skills.js
export const ROGUE_SKILLS = {
  // Tier 0 Skills
  shadowDance: {
    id: 'shadowDance',
    name: () => 'Shadow Dance',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dagger',
    description: () => 'A quick dance from the shadows, increasing your damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 0.75, 20, 400),
      critChance: Math.min(scaleDownFlat(level, 0.07), 20),
      agility: scaleUpFlat(level, 3),
    }),
  },
  evasion: {
    id: 'evasion',
    name: () => 'Evasion',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dodge',
    description: () => `
        Increases armor and block chance. 
        Additionally, when blocking, you also recover life equal to 1% of your maximum life.
        `,
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      blockChance: Math.min(scaleDownFlat(level, 0.075), 15),
      dexterity: scaleUpFlat(level, 4),
      dexterityPercent: scaleDownFlat(level, 1),
      extraDamageFromEvasionPercent: Math.min(0.04 * scaleDownFlat(level), 5),
    }),
  },

  // Tier 1 Skills
  poisonDagger: {
    id: 'poisonDagger',
    name: () => 'Poison Dagger',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison',
    description: () => 'Applies physical damage to your attacks.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 2, 6, 0.2),
      damagePercent: scaleDownFlat(level, 1.5),
      earthDamagePercent: scaleDownFlat(level, 3),
      waterDamagePercent: scaleDownFlat(level, 2),
    }),
  },
  shadowForm: {
    id: 'shadowForm',
    name: () => 'Shadow Form',
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 66000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'stealth',
    description: () => 'Shadow form increases crit chance, life steal and dexterity (crit damage). (Crit chance capped at 20%, crit damage capped at 3, life steal capped at 4%)',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.05), 20),
      critDamage: Math.min(scaleDownFlat(level, 0.003, 20, 500), 3),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 4),
      agilityPercent: scaleDownFlat(level),
    }),
  },

  // Tier 2 Skills
  flurry: {
    id: 'flurry',
    name: () => 'Flurry',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 7000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'flurry',
    description: () => 'Unleash a series of rapid attacks, dealing bonus damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 5, 6, 0.3),
      damagePercent: scaleDownFlat(level, 4.5),
    }),
  },
  precision: {
    id: 'precision',
    name: () => 'Precision',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'agility',
    description: () => 'Significantly increases agility.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRating: scaleUpFlat(level, 8, 7, 0.2),
      attackRatingPercent: scaleDownFlat(level, 1),
      agilityPercent: scaleDownFlat(level, 1.5),
    }),
  },

  backstab: {
    id: 'backstab',
    name: () => 'Backstab',
    type: () => 'instant',
    manaCost: (level) => 0,
    cooldown: () => 18200,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'backstab',
    description: () => 'A devastating attack from behind, dealing massive damage and stealing resources.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
      lifePerHit: scaleUpFlat(level, 6, 5, 0.3),
      manaPerHit: scaleUpFlat(level, 0.9),
    }),
  },

  evasiveManeuver: {
    id: 'evasiveManeuver',
    name: () => 'Evasive Maneuver',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'evasive-maneuver',
    description: () => 'Increases evasion and reduces damage taken.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      dexterity: scaleUpFlat(level, 5),
      dexterityPercent: scaleDownFlat(level, 2),
      extraDamageFromEvasionPercent: Math.min(0.03 * scaleDownFlat(level), 6),
    }),
  },

  // Tier 4 Skills
  darkPact: {
    id: 'darkPact',
    name: () => 'Dark Pact',
    type: () => 'buff',
    manaCost: (level) => 14 + level * 0.375,
    cooldown: () => 61000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'dark-pact',
    description: () => 'Massively increases crit damage temporarily.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(scaleDownFlat(level, 0.0065), 5),
    }),
  },

  // Tier 5 Skills
  assassination: {
    id: 'assassination',
    name: () => 'Assassination',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.5,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'assassination',
    description: () => 'Greatly increases damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 3, 5, 0.2),
      damagePercent: scaleDownFlat(level, 2),
      coldDamage: scaleUpFlat(level, 5, 5, 0.3),
      coldDamagePercent: scaleDownFlat(level, 4),
    }),
  },

  deadlyPrecision: {
    id: 'deadlyPrecision',
    name: () => 'Deadly Precision',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'precision',
    description: () => 'Permanently increases crit chance and crit damage.',
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
    name: () => 'Master Thief',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'master',
    description: () => 'Greatly increases attributes and gold gains.',
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
    name: () => 'Shadow Mastery',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'shadow-mastery',
    description: () => 'Further enhances stealth and critical strikes.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.075), 25),
      damagePercent: scaleDownFlat(level, 2),
      evasionPercent: scaleDownFlat(level, 1.5),
    }),
  },
  venomousAssault: {
    id: 'venomousAssault',
    name: () => 'Venomous Assault',
    type: () => 'instant',
    manaCost: (level) => 15 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'venomous-assault',
    description: () => 'Strikes with poison, dealing heavy damage over time.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: scaleUpFlat(level, 10, 5, 0.5),
      earthDamagePercent: scaleDownFlat(level, 15),
    }),
  },

  // Tier 2000 Skills
  phantomStrike: {
    id: 'phantomStrike',
    name: () => 'Phantom Strike',
    type: () => 'instant',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'phantom-strike',
    description: () => 'Blink through shadows to strike the enemy.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 15),
      damagePercent: scaleDownFlat(level, 3),
      ignoreEnemyArmor: 1,
    }),
  },
  silentExecution: {
    id: 'silentExecution',
    name: () => 'Silent Execution',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'silent-execution',
    description: () => 'Increases chance for deadly critical hits.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(scaleDownFlat(level, 0.01), 3),
      doubleDamageChance: Math.min(scaleDownFlat(level, 0.1, 10, 300, 0.5), 20),
      attackSpeed: Math.min(scaleDownFlat(level, 0.0075), 1.5),
    }),
  },

  // Tier 3000 Skills
  eclipseForm: {
    id: 'eclipseForm',
    name: () => 'Eclipse Form',
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 140000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eclipse-form',
    description: () => 'Become one with the shadows, avoiding attacks.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRatingPercent: scaleDownFlat(level, 4),
      extraDamageFromAttackRatingPercent: Math.min(0.03 * scaleDownFlat(level), 6),
      damagePercent: scaleDownFlat(level, 1),
    }),
  },
  perfectDodge: {
    id: 'perfectDodge',
    name: () => 'Perfect Dodge',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'perfect-dodge',
    description: () => 'Grants a chance to completely evade attacks.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      blockChance: Math.min(scaleDownFlat(level, 0.085), 25),
      evasionPercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 5000 Skills
  kingOfThieves: {
    id: 'kingOfThieves',
    name: () => 'King of Thieves',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'king-of-thieves',
    description: () => 'Supreme mastery of stealth and theft.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      bonusGoldPercent: scaleDownFlat(level, 0.75),
      dexterityPercent: scaleDownFlat(level, 2),
      agilityPercent: scaleDownFlat(level, 2),
    }),
  },
  nightfallAssassin: {
    id: 'nightfallAssassin',
    name: () => 'Nightfall Assassin',
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 0.35,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'nightfall-assassin',
    description: () => 'Unleash lethal precision in the darkness.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 3.5),
      critChance: Math.min(scaleDownFlat(level, 0.15), 50),
    }),
  },
};
