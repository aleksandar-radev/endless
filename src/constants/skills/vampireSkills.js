import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Vampire skills extracted from skills.js
export const VAMPIRE_SKILLS = {
  // Tier 1 Skills
  bloodSiphon: {
    id: 'bloodSiphon',
    name: () => t('Blood Siphon'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'blood',
    description: () => t('skill.bloodSiphon'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePerHit: scaleUpFlat(level, 1, 5, 0.2),
      damage: scaleUpFlat(level, 2, 4, 0.2),
      damagePercent: scaleDownFlat(level, 1.5),
    }),
  },
  nightStalker: {
    id: 'nightStalker',
    name: () => t('Night Stalker'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'moon',
    description: () => t('skill.nightStalker'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      agility: scaleUpFlat(level, 4),
    }),
  },

  // Tier 10 Skills
  vampiricStrike: {
    id: 'vampiricStrike',
    name: () => t('Vampiric Strike'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'bite',
    description: () => t('skill.vampiricStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 1),
      damagePercent: scaleDownFlat(level, 2),
      lifePerHit: scaleUpFlat(level, 5, 5, 0.1),
    }),
  },
  darkAura: {
    id: 'darkAura',
    name: () => t('Dark Aura'),
    type: () => 'buff',
    manaCost: (level) => 6 + level * 0.625,
    cooldown: () => 64000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-aura',
    description: () => t('skill.darkAura'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(scaleDownFlat(level, 0.02), 10),
      attackRating: scaleUpFlat(level, 5),
      attackRatingPercent: scaleDownFlat(level, 1.5),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.005), 0.4),
    }),
  },

  // Tier 25 Skills
  drainingTouch: {
    id: 'drainingTouch',
    name: () => t('Draining Touch'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 0 + level * 0,
    cooldown: () => 12200,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'drain',
    description: () => t('skill.drainingTouch'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const airDamage = scaleUpFlat(level, 4, 3, 0.1);
      const airDamagePercent = scaleDownFlat(level, 5);
      return {
        airDamage: airDamage * 4,
        airDamagePercent: airDamagePercent * 4,
        manaPerHit: scaleUpFlat(level, 0.5),
      };
    },
  },
  greaterBloodHunger: {
    id: 'greaterBloodHunger',
    name: () => t('Greater Blood Hunger'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'bloodlust',
    description: () => t('skill.greaterBloodHunger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level),
      vitalityPercent: scaleDownFlat(level, 1.1),
    }),
  },

  // Tier 50 Skills
  crimsonBurst: {
    id: 'crimsonBurst',
    name: () => t('Crimson Burst'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 3 + level * 0.625,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'burst',
    description: () => t('skill.crimsonBurst'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 10),
      lifePerHit: scaleUpFlat(level, -1),
    }),
  },
  summonBats: {
    id: 'summonBats',
    name: () => t('Summon Bats'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.25), 20),
        damage: scaleUpFlat(level, 3),
        airDamage: scaleUpFlat(level, 2),
        attackSpeed: 4,
      };
    },
    manaCost: (level) => 3 + level * 0.625,
    cooldown: () => 60000,
    duration: () => 24000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'bat',
    description: () => t('skill.summonBats'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
  },

  // Tier 75 Skills
  bloodPact: {
    id: 'bloodPact',
    name: () => t('Blood Pact'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.25,
    cooldown: () => 66000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pact',
    description: () => t('skill.bloodPact'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: scaleUpFlat(level, 10, 6),
      lifePercent: scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.005), 0.4),
    }),
  },

  // Tier 100 Skills
  eternalThirst: {
    id: 'eternalThirst',
    name: () => t('Eternal Thirst'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.425,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'thirst',
    description: () => t('skill.eternalThirst'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      lifePerHit: scaleUpFlat(level, 2, 3, 0.1),
    }),
  },
  deathlyPresence: {
    id: 'deathlyPresence',
    name: () => t('Deathly Presence'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'presence',
    description: () => t('skill.deathlyPresence'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: scaleDownFlat(level, 0.34),
      strengthPercent: scaleDownFlat(level, 1.3),
      vitalityPercent: scaleDownFlat(level, 1.1),
    }),
  },

  // Tier 200 Skills
  lordOfNight: {
    id: 'lordOfNight',
    name: () => t('Lord of Night'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'lord',
    description: () => t('skill.lordOfNight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level, 1.5),
      vitalityPercent: scaleDownFlat(level, 0.9),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.0075), 0.6),
      resurrectionChance: Math.min(scaleDownFlat(level, 0.1, 5, 400), 20),
      perseverancePercent: scaleDownFlat(level),
      perseverance: scaleUpFlat(level, 2, 3, 0.1),
    }),
  },

  // Tier 1200 Skills
  bloodMoon: {
    id: 'bloodMoon',
    name: () => t('Blood Moon'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'blood-moon',
    description: () => t('skill.bloodMoon'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(scaleDownFlat(level, 0.024), 3),
      damagePercent: scaleDownFlat(level, 2),
      attackSpeed: scaleDownFlat(level, 0.01),
    }),
  },
  sanguineFury: {
    id: 'sanguineFury',
    name: () => t('Sanguine Fury'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'sanguine-fury',
    description: () => t('skill.sanguineFury'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.12), 25),
      lifePerHit: scaleUpFlat(level, 120),
      damagePercent: scaleDownFlat(level),
    }),
  },

  // Tier 2000 Skills
  twilightVeil: {
    id: 'twilightVeil',
    name: () => t('Twilight Veil'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 120000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'twilight-veil',
    description: () => t('skill.twilightVeil'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: scaleUpFlat(level, 150),
      evasionPercent: scaleDownFlat(level, 5),
      lifePercent: scaleDownFlat(level),
    }),
  },
  shadowRebirth: {
    id: 'shadowRebirth',
    name: () => t('Shadow Rebirth'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'shadow-rebirth',
    description: () => t('skill.shadowRebirth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: Math.min(scaleDownFlat(level, 0.1), 50),
      lifePercent: scaleDownFlat(level, 1.5),
      critDamage: scaleDownFlat(level, 0.01),
    }),
  },

  // Tier 3000 Skills
  eternalHunger: {
    id: 'eternalHunger',
    name: () => t('Eternal Hunger'),
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eternal-hunger',
    description: () => t('skill.eternalHunger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 12, 3, 0.2),
      damagePercent: scaleDownFlat(level, 2.5),
      manaPerHit: scaleUpFlat(level, 0.5),
    }),
  },
  nocturnalDominion: {
    id: 'nocturnalDominion',
    name: () => t('Nocturnal Dominion'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'nocturnal-dominion',
    description: () => t('skill.nocturnalDominion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
      attackSpeed: scaleDownFlat(level, 0.015),
      lifePercent: scaleDownFlat(level, 1.5),
    }),
  },

  // Tier 5000 Skills
  vampireOverlord: {
    id: 'vampireOverlord',
    name: () => t('Vampire Overlord'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'vampire-overlord',
    description: () => t('skill.vampireOverlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level, 3),
      vitalityPercent: scaleDownFlat(level, 1.5),
      elementalDamagePercent: scaleDownFlat(level, 2),
    }),
  },
  immortalSovereign: {
    id: 'immortalSovereign',
    name: () => t('Immortal Sovereign'),
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'immortal-sovereign',
    description: () => t('skill.immortalSovereign'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      airDamage: scaleUpFlat(level, 26, 4, 0.15),
      airDamagePercent: scaleDownFlat(level, 5),
      damagePercent: scaleDownFlat(level, 3.8),
    }),
  },
};
