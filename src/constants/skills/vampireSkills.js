import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat } from '../../common.js';

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
      lifePerHit: level * 1,
      damage: level * 2,
      damagePercent: scaleDownFlat(level),
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
      damagePercent: 2 * scaleDownFlat(level),
      agility: level * 4,
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
      damage: level * 1,
      damagePercent: 2 * scaleDownFlat(level),
      lifePerHit: level * 5,
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
      attackRating: level * 5,
      attackRatingPercent: 2 * scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(0.01 * scaleDownFlat(level), 1),
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
      earthDamagePercent: 5 * scaleDownFlat(level),
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
      strengthPercent: scaleDownFlat(level),
      vitalityPercent: 2 * scaleDownFlat(level),
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
      damagePercent: 10 * scaleDownFlat(level),
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
      life: level * 10,
      lifePercent: scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(0.01 * scaleDownFlat(level), 1),
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
      damagePercent: 2 * scaleDownFlat(level),
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
      lifePercent: 0.5 * scaleDownFlat(level),
      strengthPercent: 0.38 * scaleDownFlat(level),
      vitalityPercent: 2 * scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(0.01 * scaleDownFlat(level), 1),
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
      strengthPercent: 1.5 * scaleDownFlat(level),
      vitalityPercent: 2 * scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(0.0075 * scaleDownFlat(level), 0.5),
      resurrectionChance: level * 0.1,
      perseverancePercent: scaleDownFlat(level),
      perseverance: level * 2,
    }),
  },

  // Tier 1200 Skills
  bloodMoon: {
    id: 'bloodMoon',
    name: () => 'Blood Moon',
    type: () => 'buff',
    manaCost: (level) => 25 + level,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'blood-moon',
    description: () => 'Empowers vampiric abilities under the crimson moon.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: level * 0.05,
      damagePercent: 2 * scaleDownFlat(level),
      attackSpeed: 0.01 * scaleDownFlat(level),
    }),
  },
  sanguineFury: {
    id: 'sanguineFury',
    name: () => 'Sanguine Fury',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'sanguine-fury',
    description: () => 'Harness the fury of blood to increase power.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(level * 0.05, 25),
      lifePerHit: level * 200,
      damagePercent: scaleDownFlat(level),
    }),
  },

  // Tier 2000 Skills
  twilightVeil: {
    id: 'twilightVeil',
    name: () => 'Twilight Veil',
    type: () => 'buff',
    manaCost: (level) => 35 + level,
    cooldown: () => 120000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'twilight-veil',
    description: () => 'Shrouds the vampire in shadows, restoring life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: level * 150,
      evasionPercent: 5 * scaleDownFlat(level),
      lifePercent: scaleDownFlat(level),
    }),
  },
  shadowRebirth: {
    id: 'shadowRebirth',
    name: () => 'Shadow Rebirth',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'shadow-rebirth',
    description: () => 'Revive from death with a portion of life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: level * 0.1,
      lifePercent: 1.5 * scaleDownFlat(level),
      critDamage: level * 0.01,
    }),
  },

  // Tier 3000 Skills
  eternalHunger: {
    id: 'eternalHunger',
    name: () => 'Eternal Hunger',
    type: () => 'toggle',
    manaCost: (level) => 15 + level,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eternal-hunger',
    description: () => 'Constantly drains enemies to sustain yourself.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: level * 0.07,
      damagePercent: 2 * scaleDownFlat(level),
      manaPerHit: level * 0.2,
    }),
  },
  nocturnalDominion: {
    id: 'nocturnalDominion',
    name: () => 'Nocturnal Dominion',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'nocturnal-dominion',
    description: () => 'Rule the night with unparalleled power.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: 2.5 * scaleDownFlat(level),
      attackSpeed: 0.015 * scaleDownFlat(level),
      lifePercent: 1.5 * scaleDownFlat(level),
    }),
  },

  // Tier 5000 Skills
  vampireOverlord: {
    id: 'vampireOverlord',
    name: () => 'Vampire Overlord',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'vampire-overlord',
    description: () => 'Ascend to the pinnacle of vampiric power.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: 3 * scaleDownFlat(level),
      vitalityPercent: 3 * scaleDownFlat(level),
      elementalDamagePercent: 2 * scaleDownFlat(level),
    }),
  },
  immortalSovereign: {
    id: 'immortalSovereign',
    name: () => 'Immortal Sovereign',
    type: () => 'toggle',
    manaCost: (level) => 20 + level,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'immortal-sovereign',
    description: () => 'Become nearly unstoppable for a short time.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: 2 * scaleDownFlat(level),
      resurrectionChance: level * 0.15,
      damagePercent: 4 * scaleDownFlat(level),
    }),
  },
};
