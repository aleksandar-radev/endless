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
    description: () => t('Steal life and deal extra damage with each attack.'),
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
    description: () => t('Increases damage and agility at night. Upon unlocking the skill, sun never rises!'),
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
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'bite',
    description: () => t('A powerful strike that deals damage and restores life.'),
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
    description: () => t('Temporarily boosts life steal, attack rating, and damage from life.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(scaleDownFlat(level, 0.02), 10),
      attackRating: scaleUpFlat(level, 5),
      attackRatingPercent: scaleDownFlat(level, 2),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.005), 0.5),
    }),
  },

  // Tier 25 Skills
  drainingTouch: {
    id: 'drainingTouch',
    name: () => t('Draining Touch'),
    type: () => 'instant',
    manaCost: (level) => 0 + level * 0,
    cooldown: () => 12200,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'drain',
    description: () => t('Drains life with earth damage, restoring mana and life.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: scaleUpFlat(level, 4, 3, 0.1),
      earthDamagePercent: scaleDownFlat(level, 5),
      manaPerHit: scaleUpFlat(level, 0.2),
    }),
  },
  greaterBloodHunger: {
    id: 'greaterBloodHunger',
    name: () => t('Greater Blood Hunger'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'bloodlust',
    description: () => t('Increases strength and vitality.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level),
      vitalityPercent: scaleDownFlat(level, 1.33),
    }),
  },

  // Tier 50 Skills
  crimsonBurst: {
    id: 'crimsonBurst',
    name: () => t('Crimson Burst'),
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.625,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'burst',
    description: () => t('Unleashes crimson energy, greatly damaging enemies while draining life per hit.'),
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
    description: () => t('Unleashes a swarm of bats to attack enemies.'),
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
    description: () => t('Temporarily increases life and converts life into extra damage.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: scaleUpFlat(level, 10, 6),
      lifePercent: scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.005), 0.5),
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
    description: () => t('Increases damage and life gained per hit.'),
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
    description: () => t('Greatly increases life and vitality with a modest strength boost, adding damage from life.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: scaleDownFlat(level, 0.34),
      strengthPercent: scaleDownFlat(level, 1.3),
      vitalityPercent: scaleDownFlat(level, 1.5),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.005), 0.5),
    }),
  },

  // Tier 200 Skills
  lordOfNight: {
    id: 'lordOfNight',
    name: () => t('Lord of Night'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'lord',
    description: () => t('Boosts strength, vitality, perseverance, and grants resurrection with bonus damage from life.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level, 1.5),
      vitalityPercent: scaleDownFlat(level, 1.4),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.0075), 0.8),
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
    description: () => t('Empowers vampiric abilities with life steal, damage, and attack speed.'),
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
    description: () => t('Increases crit chance, life per hit, and damage.'),
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
    description: () => t('Shrouds the vampire in shadows, restoring life and boosting evasion.'),
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
    description: () => t('Grants a chance to revive with extra life and crit damage.'),
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
    description: () => t('Constantly drains enemies, dealing damage and restoring mana.'),
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
    description: () => t('Rules the night with increased damage, attack speed, and life.'),
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
    description: () => t('Increases strength, vitality, and elemental damage.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level, 3),
      vitalityPercent: scaleDownFlat(level, 2),
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
    description: () => t('Become nearly unstoppable with massive fire and damage boosts.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: scaleUpFlat(level, 26, 4, 0.15),
      fireDamagePercent: scaleDownFlat(level, 5),
      damagePercent: scaleDownFlat(level, 3.8),
    }),
  },
};
