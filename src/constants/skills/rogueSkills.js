import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

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
      damagePercent: level * 0.5,
      critChance: level * 0.05,
      agility: level * 1,
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
      blockChance: level * 0.1,
      dexterityPercent: level * 2,
    }),
  },

  // Tier 1 Skills
  poisonDagger: {
    id: 'poisonDagger',
    name: () => 'Poison Dagger',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.2,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison',
    description: () => 'Applies physical damage to your attacks.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 3,
    }),
  },
  shadowForm: {
    id: 'shadowForm',
    name: () => 'Shadow Form',
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: (level) => 60000,
    duration: (level) => 45000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'stealth',
    description: () => 'Shadow form increases crit chance, life steal and dexterity (crit damage).',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: level * 0.05,
      lifeSteal: level * 0.01,
      dexterityPercent: level * 1.5,
    }),
  },

  // Tier 2 Skills
  flurry: {
    id: 'flurry',
    name: () => 'Flurry',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.5,
    cooldown: (level) => 2000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'flurry',
    description: () => 'Unleash a series of rapid attacks, dealing bonus damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 8,
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
      agilityPercent: level * 3,
    }),
  },

  // Tier 3 Skills
  backstab: {
    id: 'backstab',
    name: () => 'Backstab',
    type: () => 'instant',
    manaCost: (level) => 5,
    cooldown: (level) => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'backstab',
    description: () => 'A devastating attack from behind, dealing massive damage and stealing resources.',
    maxLevel: () => 100,
    effect: (level) => ({
      damagePercent: level * 3,
      lifePerHit: level * 2,
      manaPerHit: level * 0.33,
    }),
  },

  // Tier 4 Skills
  darkPact: {
    id: 'darkPact',
    name: () => 'Dark Pact',
    type: () => 'buff',
    manaCost: (level) => 14 + level * 0.3,
    cooldown: (level) => 30000,
    duration: (level) => 40000,
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
      damagePercent: level * 3,
      coldDamagePercent: level * 5,
      airDamagePercent: level * 5,
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
      critDamage: level * 0.01,
      attackRating: level * 20,
      attackRatingPercent: level * 0.5,
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
      damagePercent: level * 0.3,
      dexterityPercent: level * 2,
      agilityPercent: level * 3,
      wisdomPercent: level * 1,
      bonusGoldPercent: level * 0.5,
    }),
  },
};
