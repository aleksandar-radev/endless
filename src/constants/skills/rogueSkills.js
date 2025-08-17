import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Rogue skills extracted from skills.js
export const ROGUE_SKILLS = {
  // Tier 0 Skills
  shadowDance: {
    id: 'shadowDance',
    name: () => t('Shadow Dance'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dagger',
    description: () => t('A quick dance from the shadows, boosting damage, crit chance, and agility.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 0.75, 20, 400),
      critChance: Math.min(scaleDownFlat(level, 0.07), 20),
      agility: scaleUpFlat(level, 3),
    }),
  },
  evasion: {
    id: 'evasion',
    name: () => t('Evasion'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dodge',
    description: () => t('Raises block chance and dexterity, adding damage from evasion.'),
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
    name: () => t('Poison Dagger'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison',
    description: () => t('Adds damage along with earth and water damage to attacks.'),
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
    name: () => t('Shadow Form'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 66000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'stealth',
    description: () => t('Increases crit chance, crit damage, life steal, and agility. (Crit chance capped at 20%, crit damage capped at 3, life steal capped at 4%)'),
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
    name: () => t('Flurry'),
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 7000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'flurry',
    description: () => t('Unleash a series of rapid attacks, dealing bonus damage.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 5, 6, 0.3),
      damagePercent: scaleDownFlat(level, 4.5),
    }),
  },
  precision: {
    id: 'precision',
    name: () => t('Precision'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'agility',
    description: () => t('Increases attack rating and agility.'),
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
    manaCost: (level) => 0,
    cooldown: () => 18200,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'backstab',
    description: () => t('A devastating attack from behind, dealing massive damage and stealing resources.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
      lifePerHit: scaleUpFlat(level, 6, 5, 0.3),
      manaPerHit: scaleUpFlat(level, 0.9),
    }),
  },

  evasiveManeuver: {
    id: 'evasiveManeuver',
    name: () => t('Evasive Maneuver'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'evasive-maneuver',
    description: () => t('Boosts dexterity and converts evasion into extra damage.'),
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
    name: () => t('Dark Pact'),
    type: () => 'buff',
    manaCost: (level) => 14 + level * 0.375,
    cooldown: () => 61000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'dark-pact',
    description: () => t('Massively increases crit damage temporarily.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(scaleDownFlat(level, 0.0065), 5),
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
    description: () => t('Greatly increases damage and cold damage'),
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
    name: () => t('Deadly Precision'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'precision',
    description: () => t('Permanently increases crit chance, crit damage, and attack rating.'),
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
    description: () => t('Increases damage, dexterity, agility, and gold gains.'),
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
    description: () => t('Enhances crit chance, damage, and evasion.'),
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
    manaCost: (level) => 15 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'venomous-assault',
    description: () => t('Strikes with poison, adding earth damage and earth damage percent.'),
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
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'phantom-strike',
    description: () => t('Blinks through shadows to strike, dealing damage and ignoring armor.'),
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
    description: () => t('Boosts crit damage, double-damage chance, and attack speed.'),
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
    name: () => t('Eclipse Form'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 140000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eclipse-form',
    description: () => t('Increases attack rating and damage while turning elusive.'),
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
    description: () => t('Grants block chance and increased evasion.'),
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
    description: () => t('Supreme mastery of stealth, granting gold, dexterity, and agility.'),
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
    description: () => t('Unleashes lethal precision with increased damage and crit chance.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 3.5),
      critChance: Math.min(scaleDownFlat(level, 0.15), 50),
    }),
  },
};
