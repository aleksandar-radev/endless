import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Mage skills
export const MAGE_SKILLS = {
  // Tier 1 Skills
  magicMissile: {
    id: 'magicMissile',
    name: () => t('Magic Missile'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'missile',
    description: () => t('skill.magicMissile'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const waterDamage = scaleUpFlat(level, 3, 6);
      const waterDamagePercent = scaleDownFlat(level, 4);
      return {
        waterDamage: waterDamage * 4,
        waterDamagePercent: waterDamagePercent * 4,
      };
    },
  },
  arcaneIntellect: {
    id: 'arcaneIntellect',
    name: () => t('Arcane Intellect'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'intellect',
    description: () => t('skill.arcaneIntellect'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaPercent: scaleDownFlat(level, 3),
      wisdom: scaleUpFlat(level, 3),
      wisdomPercent: scaleDownFlat(level, 1),
      perseverance: scaleUpFlat(level, 2),
      perseverancePercent: scaleDownFlat(level, 1),
    }),
  },

  // Tier 10 Skills
  frostBolt: {
    id: 'frostBolt',
    name: () => t('Frost Bolt'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 3 + level * 0.25,
    cooldown: () => 5700,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'frost-bolt',
    description: () => t('skill.frostBolt'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const coldDamage = scaleUpFlat(level, 2);
      const coldDamagePercent = scaleDownFlat(level, 6);
      return {
        coldDamage: coldDamage * 4,
        coldDamagePercent: coldDamagePercent * 4,
      };
    },
  },
  fireBlast: {
    id: 'fireBlast',
    name: () => t('Fire Blast'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.25,
    cooldown: () => 7600,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'fire-blast',
    description: () => t('skill.fireBlast'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const fireDamagePercent = scaleDownFlat(level, 5);
      const fireDamage = scaleUpFlat(level, 6);
      return {
        fireDamagePercent: fireDamagePercent * 4,
        fireDamage: fireDamage * 4,
      };
    },
  },

  // Tier 25 Skills
  mindControl: {
    id: 'mindControl',
    name: () => t('Mind Control'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mind-control',
    description: () => t('skill.mindControl'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      perseverance: scaleUpFlat(level, 4),
      wisdom: scaleUpFlat(level, 8),
      intelligence: scaleUpFlat(level, 2),
      intelligencePercent: scaleDownFlat(level, 0.75),
    }),
  },
  manaShield: {
    id: 'manaShield',
    name: () => t('Mana Shield'),
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.625,
    cooldown: () => 30000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mana-shield',
    description: () => t('skill.manaShield'),
    maxLevel: () => 250,
    effect: (level) => ({
      manaShieldPercent: Math.min(scaleDownFlat(level, 0.75), 100),
    }),
  },

  // Tier 50 Skills
  resourceInfusion: {
    id: 'resourceInfusion',
    name: () => t('Resource Infusion'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'resource-infusion',
    description: () => t('skill.resourceInfusion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: scaleUpFlat(level, 25, 7, 0.5),
      manaRegenOfTotalPercent: Math.min(scaleDownFlat(level, 0.015), 2),
      extraDamageFromManaPercent: Math.min(scaleDownFlat(level, 0.012), 2),
    }),
  },
  iceStorm: {
    id: 'iceStorm',
    name: () => t('Ice Storm'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.75,
    cooldown: () => 64000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'ice-storm',
    description: () => t('skill.iceStorm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: scaleDownFlat(level, 5),
      waterDamagePercent: scaleDownFlat(level, 3),
      airDamagePercent: scaleDownFlat(level, 3),
    }),
  },
  arcaneFocus: {
    id: 'arcaneFocus',
    name: () => t('Arcane Focus'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'focus',
    description: () => t('skill.arcaneFocus'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 0.75),
      attackRating: scaleUpFlat(level, 5, 5),
    }),
  },

  // Tier 75 Skills
  pyroclasm: {
    id: 'pyroclasm',
    name: () => t('Pyroclasm'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.75,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pyroclasm',
    description: () => t('skill.pyroclasm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: scaleUpFlat(level, 2),
      fireDamagePercent: scaleDownFlat(level, 8),
    }),
  },
  timeWarp: {
    id: 'timeWarp',
    name: () => t('Time Warp'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 0.875,
    cooldown: () => 96000,
    duration: () => 15000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'time-warp',
    description: () => t('skill.timeWarp'),
    maxLevel: () => 300,
    effect: (level) => ({
      attackSpeedPercent: Math.min(scaleDownFlat(level, 1), 100),
    }),
  },

  // Tier 100 Skills
  arcanePower: {
    id: 'arcanePower',
    name: () => t('Arcane Power'),
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 0.375,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'arcane-power',
    description: () => t('skill.arcanePower'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 1.25),
    }),
  },
  summonElemental: {
    id: 'summonElemental',
    name: () => t('Summon Elemental'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.8), 100),
        damage: scaleUpFlat(level, 8, 5),
        attackSpeed: 1.3,
        fireDamage: scaleUpFlat(level, 22, 5),
        airDamage: scaleUpFlat(level, 22, 5),
        coldDamage: scaleUpFlat(level, 22, 5),
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
    name: () => t('Archmage'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'archmage',
    description: () => t('skill.archmage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      wisdom: scaleUpFlat(level, 5),
      wisdomPercent: scaleDownFlat(level, 4),
      elementalDamagePercent: scaleDownFlat(level, 1),
      manaPercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 1200 Skills
  arcaneMight: {
    id: 'arcaneMight',
    name: () => t('Arcane Might'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'arcane-might',
    description: () => t('skill.arcaneMight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 2),
      manaRegenPercent: scaleDownFlat(level, 1.5),
      manaPercent: scaleDownFlat(level, 2),
    }),
  },
  voidBlast: {
    id: 'voidBlast',
    name: () => t('Void Blast'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 17000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'void-blast',
    description: () => t('skill.voidBlast'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const waterDamage = scaleUpFlat(level, 15);
      return {
        waterDamage: waterDamage * 4,
        elementalPenetrationPercent: scaleDownFlat(level, 3),
      };
    },
  },

  // Tier 2000 Skills
  chronomancerSurge: {
    id: 'chronomancerSurge',
    name: () => t('Chronomancer Surge'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 120000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'chronomancer-surge',
    description: () => t('skill.chronomancerSurge'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(scaleDownFlat(level, 1), 150),
      cooldownReductionPercent: Math.min(scaleDownFlat(level, 0.1), 50),
    }),
  },
  starFire: {
    id: 'starFire',
    name: () => t('Star Fire'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'star-fire',
    description: () => t('skill.starFire'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const fireDamagePercent = scaleDownFlat(level, 4);
      const airDamagePercent = scaleDownFlat(level, 3);
      return {
        fireDamagePercent: fireDamagePercent * 4,
        airDamagePercent: airDamagePercent * 4,
      };
    },
  },

  // Tier 3000 Skills
  manaOverflow: {
    id: 'manaOverflow',
    name: () => t('Mana Overflow'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'mana-overflow',
    description: () => t('skill.manaOverflow'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: scaleUpFlat(level, 10),
      manaPercent: scaleDownFlat(level, 3),
      elementalDamagePercent: scaleDownFlat(level, 2),
    }),
  },
  dimensionalRift: {
    id: 'dimensionalRift',
    name: () => t('Dimensional Rift'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 45 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'dimensional-rift',
    description: () => t('skill.dimensionalRift'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const lightningDamagePercent = scaleDownFlat(level, 5);
      return {
        lightningDamagePercent: lightningDamagePercent * 4,
        ignoreAllEnemyResistances: 1,
      };
    },
  },

  // Tier 5000 Skills
  supremeSorcery: {
    id: 'supremeSorcery',
    name: () => t('Supreme Sorcery'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'supreme-sorcery',
    description: () => t('skill.supremeSorcery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 1.5),
      manaPercent: scaleDownFlat(level, 3),
      wisdomPercent: scaleDownFlat(level, 3),
    }),
  },
  apocalypse: {
    id: 'apocalypse',
    name: () => t('Apocalypse'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 60 + level * 1.25,
    cooldown: () => 27000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apocalypse',
    description: () => t('skill.apocalypse'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const fireDamagePercent = scaleDownFlat(level, 6);
      const coldDamagePercent = scaleDownFlat(level, 6);
      const lightningDamagePercent = scaleDownFlat(level, 6);
      return {
        fireDamagePercent: fireDamagePercent * 4,
        coldDamagePercent: coldDamagePercent * 4,
        lightningDamagePercent: lightningDamagePercent * 4,
      };
    },
  },

  /////////////////////////////////////////////////////////////////////////////
  // NEW TIERS BELOW
  /////////////////////////////////////////////////////////////////////////////

  // Tier 10000 Skills
  astralConvergence: {
    id: 'astralConvergence',
    name: () => t('Astral Convergence'),
    type: () => 'buff',
    manaCost: (level) => 200 + level * 2,
    cooldown: () => 160000,
    duration: () => 30000,
    requiredLevel: () => 10000,
    icon: () => 'astral-convergence',
    description: () => t('skill.astralConvergence'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 10),
      manaPercent: scaleDownFlat(level, 8),
      cooldownReductionPercent: Math.min(scaleDownFlat(level, 0.2), 60),
    }),
  },

  voidEntropy: {
    id: 'voidEntropy',
    name: () => t('Void Entropy'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 250 + level * 3,
    cooldown: () => 26000,
    requiredLevel: () => 10000,
    icon: () => 'void-entropy',
    description: () => t('skill.voidEntropy'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      chaosDamagePercent: scaleDownFlat(level, 8) * 4,
      ignoreAllEnemyResistances: 1,
      elementalPenetrationPercent: scaleDownFlat(level, 4),
    }),
  },

  // Tier 25000 Skills
  celestialHarmony: {
    id: 'celestialHarmony',
    name: () => t('Celestial Harmony'),
    type: () => 'passive',
    requiredLevel: () => 25000,
    icon: () => 'celestial-harmony',
    description: () => t('skill.celestialHarmony'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaRegenPercent: scaleDownFlat(level, 5),
      elementalDamagePercent: scaleDownFlat(level, 4),
      wisdomPercent: scaleDownFlat(level, 6),
    }),
  },

  starlance: {
    id: 'starlance',
    name: () => t('Starlance'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 350 + level * 4,
    cooldown: () => 20000,
    requiredLevel: () => 25000,
    icon: () => 'starlance',
    description: () => t('skill.starlance'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: scaleDownFlat(level, 9),
      airDamagePercent: scaleDownFlat(level, 9),
      coldDamagePercent: scaleDownFlat(level, 9),
    }),
  },

  // Tier 50000 Skills
  arcaneEternity: {
    id: 'arcaneEternity',
    name: () => t('Arcane Eternity'),
    type: () => 'buff',
  },
};
