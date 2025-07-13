import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

// Vampire skills extracted from skills.js
export const VAMPIRE_SKILLS = {
  // Tier 1 Skills
  bloodSiphon: {
    id: 'bloodSiphon',
    name: () => 'Blood Siphon',
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'blood',
    description: () => 'Steal life from enemies with each attack.',
    maxLevel: () => 300,
    effect: (level) => ({
      lifePerHit: level * 0.33,
      damage: level * 1,
      damagePercent: level * 0.5,
    }),
  },
  nightStalker: {
    id: 'nightStalker',
    name: () => 'Night Stalker',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'moon',
    description: () => 'Increases damage at night.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 0.5,
      agility: level * 2,
    }),
  },

  // Tier 10 Skills
  vampiricStrike: {
    id: 'vampiricStrike',
    name: () => 'Vampiric Strike',
    type: () => 'instant',
    manaCost: (level) => 2 + level * 0.2,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'bite',
    description: () => 'A powerful strike that restores life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 2,
      lifePerHit: level * 1,
    }),
  },
  darkAura: {
    id: 'darkAura',
    name: () => 'Dark Aura',
    type: () => 'buff',
    manaCost: (level) => 6 + level * 0.5,
    cooldown: () => 64000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-aura',
    description: () => 'Increases life steal and damage temporarily.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: level * 0.02,
      attackRating: level * 3,
      attackRatingPercent: level * 2,
    }),
  },

  // Tier 25 Skills
  drainingTouch: {
    id: 'drainingTouch',
    name: () => 'Draining Touch',
    type: () => 'instant',
    manaCost: (level) => 0 + level * 0.0,
    cooldown: () => 12200,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'drain',
    description: () => 'Drains life from enemies, restoring your life.',
    maxLevel: () => 100,
    effect: (level) => ({
      earthDamage: level * 4,
      earthDamagePercent: level * 4,
      manaPerHit: level * 0.2,
    }),
  },
  greaterBloodHunger: {
    id: 'greaterBloodHunger',
    name: () => 'Greater Blood Hunger',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'bloodlust',
    description: () => 'Increases strength and vitality.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: level * 0.5,
      vitalityPercent: level * 1,
    }),
  },

  // Tier 50 Skills
  crimsonBurst: {
    id: 'crimsonBurst',
    name: () => 'Crimson Burst',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.5,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'burst',
    description: () => 'Unleashes a burst of crimson energy, greatly damaging the enemy at the cost of life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 10,
      lifePerHit: level * -1,
    }),
  },

  // Tier 75 Skills
  bloodPact: {
    id: 'bloodPact',
    name: () => 'Blood Pact',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.2,
    cooldown: () => 66000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pact',
    description: () => 'Increases life steal and life temporarily.',
    maxLevel: () => 400,
    effect: (level) => ({
      lifePercent: level * 1,
    }),
  },

  // Tier 100 Skills
  eternalThirst: {
    id: 'eternalThirst',
    name: () => 'Eternal Thirst',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.5,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'thirst',
    description: () => 'Increases life steal and damage.',
    maxLevel: () => 200,
    effect: (level) => ({
      damagePercent: level * 2,
      lifePerHit: level * 2,
    }),
  },
  deathlyPresence: {
    id: 'deathlyPresence',
    name: () => 'Deathly Presence',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'presence',
    description: () => 'Increases life greatly, and strength mildly.',
    maxLevel: () => 100,
    effect: (level) => ({
      lifePercent: level * 0.5,
      strengthPercent: level * 0.38,
      vitalityPercent: level * 2,
    }),
  },

  // Tier 200 Skills
  lordOfNight: {
    id: 'lordOfNight',
    name: () => 'Lord of Night',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'lord',
    description: () => 'Greatly increases all attributes and gives resurrection.',
    maxLevel: () => 500,
    effect: (level) => ({
      strengthPercent: level * 1,
      vitalityPercent: level * 2,
      resurrectionChance: level * 0.1,
      wisdomPercent: level * 1,
      wisdom: level * 2,
    }),
  },
};
