import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat } from '../../common.js';

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
      damagePercent: 0.75 * scaleDownFlat(level),
      critChance: level * 0.05,
      agility: level * 3,
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
      blockChance: Math.min(level * 0.05, 25),
      dexterity: level * 4,
      dexterityPercent: 2 * scaleDownFlat(level),
    }),
  },

  // Tier 1 Skills
  poisonDagger: {
    id: 'poisonDagger',
    name: () => 'Poison Dagger',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison',
    description: () => 'Applies physical damage to your attacks.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 2,
      damagePercent: 2 * scaleDownFlat(level),
      earthDamagePercent: 2 * scaleDownFlat(level),
      waterDamagePercent: scaleDownFlat(level),
    }),
  },
  shadowForm: {
    id: 'shadowForm',
    name: () => 'Shadow Form',
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: () => 66000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'stealth',
    description: () => 'Shadow form increases crit chance, life steal and dexterity (crit damage). (Crit chance capped at 20%, crit damage capped at 3, life steal capped at 4%)',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(level * 0.05, 20),
      critDamage: Math.min(level * 0.002, 3),
      lifeSteal: Math.min(level * 0.01, 4),
      agilityPercent: scaleDownFlat(level),
    }),
  },

  // Tier 2 Skills
  flurry: {
    id: 'flurry',
    name: () => 'Flurry',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.2,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'flurry',
    description: () => 'Unleash a series of rapid attacks, dealing bonus damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 5,
      damagePercent: 8 * scaleDownFlat(level),
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
      dexterity: level * 5,
      dexterityPercent: 2 * scaleDownFlat(level),
      agilityPercent: 2 * scaleDownFlat(level),
    }),
  },

  // Tier 3 Skills
  backstab: {
    id: 'backstab',
    name: () => 'Backstab',
    type: () => 'instant',
    manaCost: (level) => 5,
    cooldown: () => 15200,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'backstab',
    description: () => 'A devastating attack from behind, dealing massive damage and stealing resources.',
    maxLevel: () => 100,
    effect: (level) => ({
      damagePercent: 4 * scaleDownFlat(level),
      lifePerHit: level * 6,
      manaPerHit: level * 0.6,
    }),
  },

  // Tier 4 Skills
  darkPact: {
    id: 'darkPact',
    name: () => 'Dark Pact',
    type: () => 'buff',
    manaCost: (level) => 14 + level * 0.3,
    cooldown: () => 61000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'dark-pact',
    description: () => 'Massively increases crit damage temporarily.',
    maxLevel: () => 500,
    effect: (level) => ({
      critDamage: level * 0.005,
    }),
  },

  // Tier 5 Skills
  assassination: {
    id: 'assassination',
    name: () => 'Assassination',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.4,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'assassination',
    description: () => 'Greatly increases damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 3,
      damagePercent: 3 * scaleDownFlat(level),
      coldDamagePercent: 5 * scaleDownFlat(level),
      airDamagePercent: 5 * scaleDownFlat(level),
    }),
  },

  deadlyPrecision: {
    id: 'deadlyPrecision',
    name: () => 'Deadly Precision',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'precision',
    description: () => 'Permanently increases crit chance and crit damage.',
    maxLevel: () => 1000,
    effect: (level) => ({
      critChance: level * 0.05,
      critDamage: level * 0.0025,
      attackRating: level * 15,
      attackRatingPercent: 0.5 * scaleDownFlat(level),
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
    maxLevel: () => 500,
    effect: (level) => ({
      damagePercent: 0.5 * scaleDownFlat(level),
      dexterityPercent: 3 * scaleDownFlat(level),
      agilityPercent: 2 * scaleDownFlat(level),
      wisdomPercent: scaleDownFlat(level),
      bonusGoldPercent: 0.25 * scaleDownFlat(level),
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
      critChance: Math.min(level * 0.05, 25),
      damagePercent: 2 * scaleDownFlat(level),
      evasionPercent: 1.5 * scaleDownFlat(level),
    }),
  },
  venomousAssault: {
    id: 'venomousAssault',
    name: () => 'Venomous Assault',
    type: () => 'instant',
    manaCost: (level) => 15 + level,
    cooldown: () => 90000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'venomous-assault',
    description: () => 'Strikes with poison, dealing heavy damage over time.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 10,
      earthDamagePercent: 20 * scaleDownFlat(level),
    }),
  },

  // Tier 2000 Skills
  phantomStrike: {
    id: 'phantomStrike',
    name: () => 'Phantom Strike',
    type: () => 'instant',
    manaCost: (level) => 25 + level,
    cooldown: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'phantom-strike',
    description: () => 'Blink through shadows to strike the enemy.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 15,
      damagePercent: 3 * scaleDownFlat(level),
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
      critDamage: Math.min(level * 0.02, 3),
      doubleDamageChance: level * 0.05,
      attackSpeed: 0.005 * scaleDownFlat(level),
    }),
  },

  // Tier 3000 Skills
  eclipseForm: {
    id: 'eclipseForm',
    name: () => 'Eclipse Form',
    type: () => 'buff',
    manaCost: (level) => 35 + level,
    cooldown: () => 140000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eclipse-form',
    description: () => 'Become one with the shadows, avoiding attacks.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      evasionPercent: 3 * scaleDownFlat(level),
      damagePercent: 1.5 * scaleDownFlat(level),
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
      blockChance: level * 0.05,
      evasionPercent: 2 * scaleDownFlat(level),
      critChance: Math.min(level * 0.02, 10),
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
      bonusGoldPercent: 0.5 * scaleDownFlat(level),
      dexterityPercent: 4 * scaleDownFlat(level),
      agilityPercent: 3 * scaleDownFlat(level),
    }),
  },
  nightfallAssassin: {
    id: 'nightfallAssassin',
    name: () => 'Nightfall Assassin',
    type: () => 'toggle',
    manaCost: (level) => 10 + level,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'nightfall-assassin',
    description: () => 'Unleash lethal precision in the darkness.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: 4 * scaleDownFlat(level),
      critChance: Math.min(level * 0.1, 50),
    }),
  },
};
