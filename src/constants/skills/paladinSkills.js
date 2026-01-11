import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent } from '../../common.js';
import { hero } from '../../globals.js';

// Paladin skills extracted from skills.js
export const PALADIN_SKILLS = {
  // Tier 1 Skills
  holyLight: {
    id: 'holyLight',
    name: () => t('skill.holyLight.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 3 + level * 0.25,
    cooldown: () => 6000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'light',
    description: () => t('skill.holyLight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      lifePercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.1, power: 0.6,
      }), 5),
    }),
  },
  smite: {
    id: 'smite',
    name: () => t('skill.smite.name'),
    type: () => 'toggle',
    manaCost: (level) => 1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'smite',
    description: () => t('skill.smite'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      fireDamage: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      fireDamagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  shieldBash: {
    id: 'shieldBash',
    name: () => t('skill.shieldBash.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 3 + level * 0.125,
    cooldown: () => 5500,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bash',
    description: () => t('skill.shieldBash'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  divineProtection: {
    id: 'divineProtection',
    name: () => t('skill.divineProtection.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'protection',
    description: () => t('skill.divineProtection'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const buffEffectiveness = 1 + (hero.stats.divineProtectionBuffEffectivenessPercent || 0);
      return {
        armor: getScalingFlat({
          level, base: 5, increment: 1, interval: 50, bonus: 0.1,
        }) * buffEffectiveness,
        armorPerLevel: getScalingFlat({
          level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
        }) * buffEffectiveness,
        armorPercent: getScalingPercent({
          level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
        }) * buffEffectiveness,
        thornsDamage: getScalingFlat({
          level, base: 10, increment: 2, interval: 50, bonus: 0.1,
        }) * buffEffectiveness,
        thornsDamagePerLevel: getScalingFlat({
          level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
        }) * buffEffectiveness,
        thornsDamagePercent: getScalingPercent({
          level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
        }) * buffEffectiveness,
      };
    },
  },

  // Tier 10 Skills
  consecration: {
    id: 'consecration',
    name: () => t('skill.consecration.name'),
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.75,
    cooldown: () => 70000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'consecration',
    description: () => t('skill.consecration'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      fireDamagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lightningDamage: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      lightningDamagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  greaterHealing: {
    id: 'greaterHealing',
    name: () => t('skill.greaterHealing.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 8 + level * 0.375,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'heal',
    description: () => t('skill.greaterHealing'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      life: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      lifePerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifePercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 20),
    }),
  },

  // Tier 25 Skills
  divineShield: {
    id: 'divineShield',
    name: () => t('skill.divineShield.name'),
    type: () => 'buff',
    manaCost: (level) => 13 + level * 0.625,
    cooldown: () => 47000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-shield',
    description: () => t('skill.divineShield'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      armorPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      blockChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.6,
      }), 25),
    }),
  },
  auraOfLight: {
    id: 'auraOfLight',
    name: () => t('skill.auraOfLight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-aura',
    description: () => t('skill.auraOfLight'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      life: getScalingFlat({
        level, base: 25, increment: 5, interval: 50, bonus: 0.15,
      }),
      lifePerLevel: getScalingFlat({
        level, base: 0.025, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      allResistance: Math.min(getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }), 30),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  thornedBulwark: {
    id: 'thornedBulwark',
    name: () => t('skill.thornedBulwark.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'thorned-bulwark',
    description: () => t('skill.thornedBulwark'),
    maxLevel: () => 1,
    effect: (level) => ({ enduranceThornsDamagePerPoint: level > 0 ? 0.2 : 0 }),
  },

  // Tier 50 Skills
  wrathOfTheHeavens: {
    id: 'wrathOfTheHeavens',
    name: () => t('skill.wrathOfTheHeavens.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 10 + level * 1,
    cooldown: () => 12400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'wrath',
    description: () => t('skill.wrathOfTheHeavens'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      fireDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  beaconOfFaith: {
    id: 'beaconOfFaith',
    name: () => t('skill.beaconOfFaith.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'beacon',
    description: () => t('skill.beaconOfFaith'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.15,
      }),
      lifePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifeRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.5,
      }), 1),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.1, linear: 0.05,
      }) / 100, 0.75),
    }),
  },

  // Tier 75 Skills
  holyBarrier: {
    id: 'holyBarrier',
    name: () => t('skill.holyBarrier.name'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.875,
    cooldown: () => 44000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'barrier',
    description: () => t('skill.holyBarrier'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      resurrectionChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.2, power: 0.5,
      }), 20),
    }),
  },

  AidFromHeaven: {
    id: 'AidFromHeaven',
    name: () => t('skill.AidFromHeaven.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }), 120),
        damage: getScalingFlat({
          level, base: 15, increment: 3, interval: 50, bonus: 0.15,
        }),
        attackSpeed: Math.min(Math.max(0.9, 0.7 + getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }) / 100), 2.2),
      };
    },
    manaCost: (level) => 20 + level * 0.875,
    cooldown: () => 66000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'aid-from-heaven',
    description: () => t('skill.AidFromHeaven'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
  },

  // Tier 100 Skills
  divineWrath: {
    id: 'divineWrath',
    name: () => t('skill.divineWrath.name'),
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.3,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath',
    description: () => t('skill.divineWrath'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  guardianAngel: {
    id: 'guardianAngel',
    name: () => t('skill.guardianAngel.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'angel',
    description: () => t('skill.guardianAngel'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      resurrectionChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.2, power: 0.5,
      }), 50),
      lifeRegen: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      allResistance: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 200 Skills
  ascension: {
    id: 'ascension',
    name: () => t('skill.ascension.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'ascension',
    description: () => t('skill.ascension'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      endurance: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      endurancePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      endurancePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      vitality: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      attackRatingPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 1200 Skills
  celestialGuard: {
    id: 'celestialGuard',
    name: () => t('skill.celestialGuard.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'celestial-guard',
    description: () => t('skill.celestialGuard'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      armorPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      blockChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.6,
      }), 25),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  holyCrusade: {
    id: 'holyCrusade',
    name: () => t('skill.holyCrusade.name'),
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 0.625,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'holy-crusade',
    description: () => t('skill.holyCrusade'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 2000 Skills
  radiantAegis: {
    id: 'radiantAegis',
    name: () => t('skill.radiantAegis.name'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 1000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'radiant-aegis',
    description: () => t('skill.radiantAegis'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 35, increment: 7, interval: 50, bonus: 0.15,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.035, increment: 0.01, interval: 50, bonus: 0,
      }),
      allResistance: getScalingFlat({
        level, base: 25, increment: 5, interval: 50, bonus: 0.15,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.025, increment: 0.01, interval: 50, bonus: 0,
      }),
      thornsDamage: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      thornsDamagePerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  divineJudgment: {
    id: 'divineJudgment',
    name: () => t('skill.divineJudgment.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 20 + level * 1,
    cooldown: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'divine-judgment',
    description: () => t('skill.divineJudgment'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 40, increment: 8, interval: 50, bonus: 0.15,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 3000 Skills
  angelicResurgence: {
    id: 'angelicResurgence',
    name: () => t('skill.angelicResurgence.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'angelic-resurgence',
    description: () => t('skill.angelicResurgence'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.2, power: 0.5,
      }), 50),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      attackSpeedPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  sacredGround: {
    id: 'sacredGround',
    name: () => t('skill.sacredGround.name'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 140000,
    duration: () => 45000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'sacred-ground',
    description: () => t('skill.sacredGround'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      manaRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 5000 Skills
  eternalLight: {
    id: 'eternalLight',
    name: () => t('skill.eternalLight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'eternal-light',
    description: () => t('skill.eternalLight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      allResistance: getScalingFlat({
        level, base: 40, increment: 8, interval: 50, bonus: 0.15,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.04, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  championOfFaith: {
    id: 'championOfFaith',
    name: () => t('skill.championOfFaith.name'),
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'champion-of-faith',
    description: () => t('skill.championOfFaith'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
};
