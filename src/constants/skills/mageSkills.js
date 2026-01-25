import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Mage skills
export const MAGE_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
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
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 1.5, increment: 1 },
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 1 },
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
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 1.5, increment: 1.5 },
      }),
      perseverance: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', scale: { base: 1 },
      }),
    }),
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
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
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 2, increment: 1.5 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'magicMissile',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', scale: { base: 3, increment: 2 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'magicMissile',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2
  // ===========================================================================
  mindControl: {
    id: 'mindControl',
    name: () => t('skill.mindControl.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mind-control',
    description: () => t('skill.mindControl'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      intelligence: getSkillStatBonus({
        level, statKey: 'intelligence', skillType: 'passive', scale: { base: 1.5, increment: 1.5 },
      }),
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 2, increment: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'arcaneIntellect',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
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
      manaShieldPercent: getSkillStatBonus({
        level, statKey: 'manaShieldPercent', skillType: 'buff', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'arcaneIntellect',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.1, increment: 0.1, cap: 50,
        }),
      },
    ],
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
      damageTakenReductionPercent: getSkillStatBonus({
        level, statKey: 'damageTakenReductionPercent', skillType: 'passive', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'manaShield',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.1, increment: 0.1, cap: 20,
        }),
      },
    ],
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
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'passive', scale: { base: 2.5, increment: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'crimsonAegis',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
  resourceInfusion: {
    id: 'resourceInfusion',
    name: () => t('skill.resourceInfusion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'resource-infusion',
    description: () => t('skill.resourceInfusion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', scale: { base: 2.5, increment: 2.5 },
      }),
      extraDamageFromManaPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromManaPercent', skillType: 'passive', scale: { base: 1, max: 1.6 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'arcaneIntellect',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
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
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'buff', scale: { base: 2.5, increment: 2 },
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'frostBolt',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
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
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 3.33, increment: 2 },
      }),
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'passive', scale: { base: 1.5, increment: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'resourceInfusion',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
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
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'buff', scale: { base: 2.5, increment: 2 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'buff', scale: { base: 1.875 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'fireBlast',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66, max: 0.57 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'mindControl',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.2, increment: 0.2, cap: 100,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5
  // ===========================================================================
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
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', scale: { base: 4, increment: 3 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'arcaneFocus',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  summonElemental: {
    id: 'summonElemental',
    name: () => t('skill.summonElemental.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2.5, max: 0.5 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 7.5, increment: 3 },
        }),
        attackSpeed: 1.3,
        fireDamage: getSkillStatBonus({
          level, statKey: 'fireDamage', skillType: 'summon', scale: { base: 12.5, increment: 5 },
        }),
        airDamage: getSkillStatBonus({
          level, statKey: 'airDamage', skillType: 'summon', scale: { base: 12.5, increment: 5 },
        }),
        coldDamage: getSkillStatBonus({
          level, statKey: 'coldDamage', skillType: 'summon', scale: { base: 12.5, increment: 5 },
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
    synergies: [
      {
        sourceSkillId: 'iceStorm',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 6
  // ===========================================================================
  archmage: {
    id: 'archmage',
    name: () => t('skill.archmage.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'archmage',
    description: () => t('skill.archmage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 3.75, increment: 3 },
      }),
      mana: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', scale: { base: 5, increment: 5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'arcanePower',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 1200
  // ===========================================================================
  arcaneMight: {
    id: 'arcaneMight',
    name: () => t('skill.arcaneMight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'arcane-might',
    description: () => t('skill.arcaneMight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 10, increment: 5 },
      }),
      manaRegen: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', scale: { base: 10, increment: 10 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'archmage',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2500,
        }),
      },
    ],
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
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 7, increment: 2.5 },
      }),
      elementalPenetrationPercent: getSkillStatBonus({
        level, statKey: 'elementalPenetrationPercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'frostBolt',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2000
  // ===========================================================================
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
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66, max: 0.86 },
      }),
      cooldownReductionPercent: getSkillStatBonus({
        level, statKey: 'cooldownReductionPercent', skillType: 'buff', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'timeWarp',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 2000,
        }),
      },
    ],
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
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'pyroclasm',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3000
  // ===========================================================================
  manaOverflow: {
    id: 'manaOverflow',
    name: () => t('skill.manaOverflow.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'mana-overflow',
    description: () => t('skill.manaOverflow'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', scale: { base: 5, increment: 5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'resourceInfusion',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2500,
        }),
      },
    ],
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
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      ignoreAllEnemyResistances: 1,
    }),
    synergies: [
      {
        sourceSkillId: 'iceStorm',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5000
  // ===========================================================================
  supremeSorcery: {
    id: 'supremeSorcery',
    name: () => t('skill.supremeSorcery.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'supreme-sorcery',
    description: () => t('skill.supremeSorcery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 16.66, increment: 10 },
      }),
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 5, increment: 4 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'arcaneMight',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 3000,
        }),
      },
    ],
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
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'starFire',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 3000,
        }),
      },
    ],
  },

  // Specialization Skills
  weaponIllusion: {
    id: 'weaponIllusion',
    name: () => t('skill.weaponIllusion.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 1.5 },
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