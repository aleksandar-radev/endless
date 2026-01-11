import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent } from '../../common.js';
import { hero } from '../../globals.js';

// Vampire skills extracted from skills.js
export const VAMPIRE_SKILLS = {
  // Tier 1 Skills
  bloodSiphon: {
    id: 'bloodSiphon',
    name: () => t('skill.bloodSiphon.name'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'blood',
    description: () => t('skill.bloodSiphon'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePerHit: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      damage: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  nightStalker: {
    id: 'nightStalker',
    name: () => t('skill.nightStalker.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'moon',
    description: () => t('skill.nightStalker'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const buffEffectiveness = 1 + (hero.stats.nightStalkerBuffEffectivenessPercent || 0);
      return {
        damagePercent: getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }) * buffEffectiveness,
        agility: getScalingFlat({
          level, base: 4, increment: 1, interval: 50, bonus: 0.1,
        }) * buffEffectiveness,
        agilityPerLevel: getScalingFlat({
          level, base: 0.004, increment: 0.005, interval: 50, bonus: 0,
        }) * buffEffectiveness,
      };
    },
  },

  // Tier 10 Skills
  crimsonBurst: {
    id: 'crimsonBurst',
    name: () => t('skill.crimsonBurst.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: () => 0,
    cooldown: () => 4000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'burst',
    description: () => t('skill.crimsonBurst'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: -30, increment: -5, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: -0.05, increment: -0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  darkAura: {
    id: 'darkAura',
    name: () => t('skill.darkAura.name'),
    type: () => 'buff',
    manaCost: (level) => 6 + level * 0.625,
    cooldown: () => 64000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-aura',
    description: () => t('skill.darkAura'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(getScalingPercent({
        level, base: 0.2, softcap: 2000, linear: 0.05, power: 0.5,
      }), 10),
      attackRating: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      attackRatingPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      attackRatingPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.05, softcap: 2000, linear: 0.01, power: 0.5,
      }), 0.4),
    }),
  },

  // Tier 25 Skills
  drainingTouch: {
    id: 'drainingTouch',
    name: () => t('skill.drainingTouch.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 0 + level * 0,
    cooldown: () => 12200,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'draining-touch',
    description: () => t('skill.drainingTouch'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const airDamage = getScalingFlat({
        level, base: 4, increment: 1, interval: 50, bonus: 0.1,
      });
      const airDamagePercent = getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      });
      return {
        airDamage: airDamage * 4,
        airDamagePercent: airDamagePercent * 4,
        manaPerHit: getScalingFlat({
          level, base: 0.5, increment: 0.1, interval: 50, bonus: 0.1,
        }),
      };
    },
  },
  greaterBloodHunger: {
    id: 'greaterBloodHunger',
    name: () => t('skill.greaterBloodHunger.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'bloodlust',
    description: () => t('skill.greaterBloodHunger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      strength: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      strengthPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      vitality: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 50 Skills
  vampiricStrike: {
    id: 'vampiricStrike',
    name: () => t('skill.vampiricStrike.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'bite',
    description: () => t('skill.vampiricStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 6, increment: 1.5, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.006, increment: 0.005, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: 40, increment: 8, interval: 50, bonus: 0.15,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.04, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  summonBats: {
    id: 'summonBats',
    name: () => t('skill.summonBats.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: 5 + Math.min(getScalingPercent({
          level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
        }), 25),
        damage: getScalingFlat({
          level, base: 3, increment: 0.5, interval: 50, bonus: 0.1,
        }),
        damagePerLevel: getScalingFlat({
          level, base: 0.003, increment: 0.005, interval: 50, bonus: 0,
        }),
        airDamage: getScalingFlat({
          level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
        }),
        airDamagePerLevel: getScalingFlat({
          level, base: 0.002, increment: 0.005, interval: 50, bonus: 0,
        }),
        attackSpeed: 4,
        canCrit: true,
      };
    },
    manaCost: (level) => 3 + level * 0.625,
    cooldown: () => 60000,
    duration: () => 24000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'bat',
    description: () => t('skill.summonBats'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
  },

  // Tier 75 Skills
  bloodPact: {
    id: 'bloodPact',
    name: () => t('skill.bloodPact.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.25,
    cooldown: () => 66000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pact',
    description: () => t('skill.bloodPact'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      lifePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.05, softcap: 2000, linear: 0.01, power: 0.5,
      }), 0.4),
    }),
  },

  // Tier 100 Skills
  eternalThirst: {
    id: 'eternalThirst',
    name: () => t('skill.eternalThirst.name'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.425,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'thirst',
    description: () => t('skill.eternalThirst'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.002, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  deathlyPresence: {
    id: 'deathlyPresence',
    name: () => t('skill.deathlyPresence.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'presence',
    description: () => t('skill.deathlyPresence'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      strengthPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      strength: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      strengthPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      vitality: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 200 Skills
  lordOfNight: {
    id: 'lordOfNight',
    name: () => t('skill.lordOfNight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'lord',
    description: () => t('skill.lordOfNight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.05, softcap: 2000, linear: 0.01, power: 0.5,
      }), 0.6),
      resurrectionChance: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.1, power: 0.5,
      }), 20),
      perseverancePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      perseverance: getScalingFlat({
        level, base: 2, increment: 0.4, interval: 50, bonus: 0.1,
      }),
      perseverancePerLevel: getScalingFlat({
        level, base: 0.002, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 1200 Skills
  bloodMoon: {
    id: 'bloodMoon',
    name: () => t('skill.bloodMoon.name'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'blood-moon',
    description: () => t('skill.bloodMoon'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(getScalingPercent({
        level, base: 0.2, softcap: 2000, linear: 0.05, power: 0.5,
      }), 3),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      attackSpeedPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      damage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  sanguineFury: {
    id: 'sanguineFury',
    name: () => t('skill.sanguineFury.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'sanguine-fury',
    description: () => t('skill.sanguineFury'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 25),
      lifePerHit: getScalingFlat({
        level, base: 120, increment: 24, interval: 50, bonus: 0.15,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.12, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 2000 Skills
  twilightVeil: {
    id: 'twilightVeil',
    name: () => t('skill.twilightVeil.name'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 120000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'twilight-veil',
    description: () => t('skill.twilightVeil'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getScalingFlat({
        level, base: 150, increment: 30, interval: 50, bonus: 0.15,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.15, increment: 0.01, interval: 50, bonus: 0,
      }),
      evasionPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  shadowRebirth: {
    id: 'shadowRebirth',
    name: () => t('skill.shadowRebirth.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'shadow-rebirth',
    description: () => t('skill.shadowRebirth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.1, power: 0.5,
      }), 50),
      lifePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      critDamage: getScalingPercent({
        level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.5,
      }) / 100, // Normalized to 2? No, `scaleDownFlat(level, 0.01)` is small, usually means 1% scaled.
    }),
  },

  // Tier 3000 Skills
  eternalHunger: {
    id: 'eternalHunger',
    name: () => t('skill.eternalHunger.name'),
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eternal-hunger',
    description: () => t('skill.eternalHunger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 12, increment: 3, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.012, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      manaPerHit: getScalingFlat({
        level, base: 0.5, increment: 0.1, interval: 50, bonus: 0.1,
      }),
      manaPerHitPerLevel: getScalingFlat({
        level, base: 0.0005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  nocturnalDominion: {
    id: 'nocturnalDominion',
    name: () => t('skill.nocturnalDominion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'nocturnal-dominion',
    description: () => t('skill.nocturnalDominion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      attackSpeedPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      damage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 5000 Skills
  vampireOverlord: {
    id: 'vampireOverlord',
    name: () => t('skill.vampireOverlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'vampire-overlord',
    description: () => t('skill.vampireOverlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      strength: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      strengthPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      vitality: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  immortalSovereign: {
    id: 'immortalSovereign',
    name: () => t('skill.immortalSovereign.name'),
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'immortal-sovereign',
    description: () => t('skill.immortalSovereign'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      airDamage: getScalingFlat({
        level, base: 26, increment: 6, interval: 50, bonus: 0.15,
      }),
      airDamagePerLevel: getScalingFlat({
        level, base: 0.026, increment: 0.01, interval: 50, bonus: 0,
      }),
      airDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Specialization Skills
  bloodSacrifice: {
    id: 'bloodSacrifice',
    name: () => t('skill.bloodSacrifice.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: () => 0,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-sacrifice',
    description: () => t('skill.bloodSacrifice'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    isVisible: () => hero.stats.bloodSacrificeUnlocked > 0,
  },
};
