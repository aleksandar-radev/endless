import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent } from '../../common.js';
import { hero } from '../../globals.js';

// Mage skills
export const MAGE_SKILLS = {
  // Tier 1 Skills
  magicMissile: {
    id: 'magicMissile',
    name: () => t('skill.magicMissile.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'missile',
    description: () => t('skill.magicMissile'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: getScalingFlat({
        level, base: 5, increment: 2, interval: 50, bonus: 0.1,
      }),
      waterDamagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      waterDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  arcaneIntellect: {
    id: 'arcaneIntellect',
    name: () => t('skill.arcaneIntellect.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'intellect',
    description: () => t('skill.arcaneIntellect'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      wisdom: getScalingFlat({
        level, base: 4, increment: 1, interval: 50, bonus: 0.1,
      }),
      wisdomPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      perseverance: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      perseverancePerLevel: getScalingFlat({
        level, base: 0.003, increment: 0.003, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 10 Skills
  frostBolt: {
    id: 'frostBolt',
    name: () => t('skill.frostBolt.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 3 + level * 0.25,
    cooldown: () => 5700,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'frost-bolt',
    description: () => t('skill.frostBolt'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamage: getScalingFlat({
        level, base: 10, increment: 3, interval: 50, bonus: 0.15,
      }),
      coldDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  fireBlast: {
    id: 'fireBlast',
    name: () => t('skill.fireBlast.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.25,
    cooldown: () => 7600,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'fire-blast',
    description: () => t('skill.fireBlast'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getScalingFlat({
        level, base: 15, increment: 4, interval: 50, bonus: 0.15,
      }),
      fireDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.005, interval: 50, bonus: 0,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 25 Skills
  mindControl: {
    id: 'mindControl',
    name: () => t('skill.mindControl.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mind-control',
    description: () => t('skill.mindControl'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      intelligence: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      intelligencePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      wisdom: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      wisdomPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  manaShield: {
    id: 'manaShield',
    name: () => t('skill.manaShield.name'),
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.625,
    cooldown: () => 30000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mana-shield',
    description: () => t('skill.manaShield'),
    maxLevel: () => 250,
    effect: (level) => ({
      manaShieldPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 100),
    }),
  },
  crimsonAegis: {
    id: 'crimsonAegis',
    name: () => t('skill.crimsonAegis.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    isVisible: () => hero.stats.crimsonAegisSkillUnlocked > 0,
    icon: () => 'crimson-aegis',
    description: () => t('skill.crimsonAegis'),
    maxLevel: () => 200,
    effect: (level) => ({
      damageTakenReductionPercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 200, linear: 0.15, power: 0.6,
      }), 35),
    }),
  },
  crimsonDrain: {
    id: 'crimsonDrain',
    name: () => t('skill.crimsonDrain.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    isVisible: () => hero.stats.bloodSiphonSkillUnlocked > 0,
    icon: () => 'crimson-drain',
    description: () => t('skill.crimsonDrain'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePerHit: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 50 Skills
  resourceInfusion: {
    id: 'resourceInfusion',
    name: () => t('skill.resourceInfusion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'resource-infusion',
    description: () => t('skill.resourceInfusion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: getScalingFlat({
        level, base: 25, increment: 5, interval: 50, bonus: 0.15,
      }),
      manaPerLevel: getScalingFlat({
        level, base: 0.025, increment: 0.01, interval: 50, bonus: 0,
      }),
      extraDamageFromManaPercent: Math.min(getScalingPercent({
        level, base: 0.1, linear: 0.01,
      }) / 100, 2),
    }),
  },
  iceStorm: {
    id: 'iceStorm',
    name: () => t('skill.iceStorm.name'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.75,
    cooldown: () => 64000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'ice-storm',
    description: () => t('skill.iceStorm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      coldDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      waterDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      airDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  arcaneFocus: {
    id: 'arcaneFocus',
    name: () => t('skill.arcaneFocus.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'arcane-focus',
    description: () => t('skill.arcaneFocus'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      attackRating: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      attackRatingPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 75 Skills
  pyroclasm: {
    id: 'pyroclasm',
    name: () => t('skill.pyroclasm.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.75,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pyroclasm',
    description: () => t('skill.pyroclasm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      fireDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  timeWarp: {
    id: 'timeWarp',
    name: () => t('skill.timeWarp.name'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 0.875,
    cooldown: () => 96000,
    duration: () => 15000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'time-warp',
    description: () => t('skill.timeWarp'),
    maxLevel: () => 300,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 100),
    }),
  },

  // Tier 100 Skills
  arcanePower: {
    id: 'arcanePower',
    name: () => t('skill.arcanePower.name'),
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 0.375,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'arcane-power',
    description: () => t('skill.arcanePower'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  summonElemental: {
    id: 'summonElemental',
    name: () => t('skill.summonElemental.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }), 100),
        damage: getScalingFlat({
          level, base: 15, increment: 3, interval: 50, bonus: 0.15,
        }),
        attackSpeed: 1.3,
        fireDamage: getScalingFlat({
          level, base: 25, increment: 5, interval: 50, bonus: 0.15,
        }),
        airDamage: getScalingFlat({
          level, base: 25, increment: 5, interval: 50, bonus: 0.15,
        }),
        coldDamage: getScalingFlat({
          level, base: 25, increment: 5, interval: 50, bonus: 0.15,
        }),
      };
    },
    manaCost: (level) => 30 + level * 1,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'summon-elemental',
    description: () => t('skill.summonElemental'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
  },

  // Tier 200 Skills
  archmage: {
    id: 'archmage',
    name: () => t('skill.archmage.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'archmage',
    description: () => t('skill.archmage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      wisdom: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      wisdomPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      mana: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      manaPerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 1200 Skills
  arcaneMight: {
    id: 'arcaneMight',
    name: () => t('skill.arcaneMight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'arcane-might',
    description: () => t('skill.arcaneMight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getScalingFlat({
        level, base: 30, increment: 5, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      manaRegen: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      manaRegenPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  voidBlast: {
    id: 'voidBlast',
    name: () => t('skill.voidBlast.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 17000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'void-blast',
    description: () => t('skill.voidBlast'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: getScalingFlat({
        level, base: 35, increment: 5, interval: 50, bonus: 0.15,
      }),
      waterDamagePerLevel: getScalingFlat({
        level, base: 0.035, increment: 0.01, interval: 50, bonus: 0,
      }),
      elementalPenetrationPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 2000 Skills
  chronomancerSurge: {
    id: 'chronomancerSurge',
    name: () => t('skill.chronomancerSurge.name'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 120000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'chronomancer-surge',
    description: () => t('skill.chronomancerSurge'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 150),
      cooldownReductionPercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 50),
    }),
  },
  starFire: {
    id: 'starFire',
    name: () => t('skill.starFire.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'star-fire',
    description: () => t('skill.starFire'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      airDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 3000 Skills
  manaOverflow: {
    id: 'manaOverflow',
    name: () => t('skill.manaOverflow.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'mana-overflow',
    description: () => t('skill.manaOverflow'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      manaPerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  dimensionalRift: {
    id: 'dimensionalRift',
    name: () => t('skill.dimensionalRift.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 45 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'dimensional-rift',
    description: () => t('skill.dimensionalRift'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      ignoreAllEnemyResistances: 1,
    }),
  },

  // Tier 5000 Skills
  supremeSorcery: {
    id: 'supremeSorcery',
    name: () => t('skill.supremeSorcery.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'supreme-sorcery',
    description: () => t('skill.supremeSorcery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
      wisdom: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.1,
      }),
      wisdomPerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  apocalypse: {
    id: 'apocalypse',
    name: () => t('skill.apocalypse.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 60 + level * 1.25,
    cooldown: () => 27000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apocalypse',
    description: () => t('skill.apocalypse'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Specialization Skills
  weaponIllusion: {
    id: 'weaponIllusion',
    name: () => t('skill.weaponIllusion.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: 5 + getScalingPercent({
          level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
        }),
        attackSpeed: hero.stats.attackSpeed,
        canCrit: true,
      };
    },
    manaCost: (level) => 30 + level * 1,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'weapon-illusion',
    description: () => t('skill.weaponIllusion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    isVisible: () => hero.stats.weaponIllusionUnlocked > 0,
  },
};
