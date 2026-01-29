import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingSynergy, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Elementalist skills extracted from skills.js
export const ELEMENTALIST_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
  fireball: {
    id: 'fireball',
    name: () => t('skill.fireball.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 2200,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'fireball',
    description: () => t('skill.fireball'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', scale: { base: 1.5, increment: 1 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },
  frostArmor: {
    id: 'frostArmor',
    name: () => t('skill.frostArmor.name'),
    type: () => 'buff',
    manaCost: (level) => 6 + level * 1.25,
    cooldown: () => 30000,
    duration: () => 24000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frost-armor',
    description: () => t('skill.frostArmor'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', scale: { base: 1, increment: 1.75 },
      }),
      armorPercent: getSkillStatBonus({
        level, statKey: 'armorPercent', skillType: 'buff', scale: { base: 0.625, linear: 1.25 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'buff', scale: { base: 0.625, linear: 0.4 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'warmth',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  warmth: {
    id: 'warmth',
    name: () => t('skill.warmth.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'storm',
    description: () => t('skill.warmth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaRegen: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', scale: { base: 1 },
      }),
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'fireball',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
  lightningStrike: {
    id: 'lightningStrike',
    name: () => t('skill.lightningStrike.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 6500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'lightning',
    description: () => t('skill.lightningStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'instant', scale: { base: 0.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalMastery',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  elementalMastery: {
    id: 'elementalMastery',
    name: () => t('skill.elementalMastery.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'elemental-mastery',
    description: () => t('skill.elementalMastery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 1 },
      }),
      elementalPenetration: getSkillStatBonus({
        level, statKey: 'elementalPenetration', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      elementalPenetrationPercent: getSkillStatBonus({
        level, statKey: 'elementalPenetrationPercent', skillType: 'passive',
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'warmth',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2
  // ===========================================================================
  blizzard: {
    id: 'blizzard',
    name: () => t('skill.blizzard.name'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 1.25,
    cooldown: () => 88000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'blizzard',
    description: () => t('skill.blizzard'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'buff', scale: { base: 3, increment: 2 },
      }),
      airDamage: getSkillStatBonus({
        level, statKey: 'airDamage', skillType: 'buff', scale: { base: 3, increment: 2 },
      }),
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'buff', scale: { base: 3, increment: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'frostArmor',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.25, cap: 2000,
        }),
      },
    ],
  },
  fireShield: {
    id: 'fireShield',
    name: () => t('skill.fireShield.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.5,
    cooldown: () => 37000,
    duration: () => 15000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'fire-shield',
    description: () => t('skill.fireShield'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      reflectFireDamage: getSkillStatBonus({
        level, statKey: 'reflectFireDamage', skillType: 'buff', scale: { base: 1, increment: 1 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'buff', scale: { base: 1.25, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'fireball',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  arcaneWisdom: {
    id: 'arcaneWisdom',
    name: () => t('skill.arcaneWisdom.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'wisdom',
    description: () => t('skill.arcaneWisdom'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaPercent: getSkillStatBonus({
        level, statKey: 'manaPercent', skillType: 'passive', scale: { base: 1 },
      }),
      manaRegen: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', scale: { base: 2, increment: 2.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'warmth',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
  elementalStorm: {
    id: 'elementalStorm',
    name: () => t('skill.elementalStorm.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 50,
    cooldown: () => 4500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'storm',
    description: () => t('skill.elementalStorm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'instant', scale: { base: 2, increment: 1 },
      }),
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalMastery',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  elementalAffinity: {
    id: 'elementalAffinity',
    name: () => t('skill.elementalAffinity.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'affinity',
    description: () => t('skill.elementalAffinity'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 0.5, increment: 0.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalMastery',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
  arcanePulse: {
    id: 'arcanePulse',
    name: () => t('skill.arcanePulse.name'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.75,
    cooldown: () => 51000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pulse',
    description: () => t('skill.arcanePulse'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRatingPercent: getSkillStatBonus({
        level, statKey: 'attackRatingPercent', skillType: 'buff', scale: { base: 1.25, max: 1 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'buff', scale: { base: 1.25, increment: 1.25 },
      }),
      manaPerHit: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'buff', scale: { base: 0.5, increment: 0.5 },
      }),
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'arcaneWisdom',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5
  // ===========================================================================
  elementalOverload: {
    id: 'elementalOverload',
    name: () => t('skill.elementalOverload.name'),
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.625,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'overload',
    description: () => t('skill.elementalOverload'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', scale: { base: 2.5, increment: 2 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'toggle', scale: { base: 1, increment: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.25, cap: 2000,
        }),
      },
    ],
  },
  primordialControl: {
    id: 'primordialControl',
    name: () => t('skill.primordialControl.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'control',
    description: () => t('skill.primordialControl'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2.5, increment: 4 },
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'passive', scale: { base: 1, linear: 0.8 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalAffinity',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 6
  // ===========================================================================
  avatarOfTheElements: {
    id: 'avatarOfTheElements',
    name: () => t('skill.avatarOfTheElements.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'avatar-of-elements',
    description: () => t('skill.avatarOfTheElements'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 3.33, increment: 2 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalOverload',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 1200
  // ===========================================================================
  elementalCorrosion: {
    id: 'elementalCorrosion',
    name: () => t('skill.elementalCorrosion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'elemental-corrosion',
    description: () => t('skill.elementalCorrosion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalPenetrationPercent: getSkillStatBonus({
        level, statKey: 'elementalPenetrationPercent', skillType: 'passive', scale: { base: 0.4, max: 1 },
      }),
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 3.33, increment: 1.5 },
      }),
      elementalPenetration: getSkillStatBonus({
        level, statKey: 'elementalPenetration', skillType: 'passive', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalStorm',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  volcanicWrath: {
    id: 'volcanicWrath',
    name: () => t('skill.volcanicWrath.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'volcanic-wrath',
    description: () => t('skill.volcanicWrath'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', scale: { base: 4, increment: 2 },
      }),
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', scale: { base: 4, increment: 2 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalStorm',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  // ===========================================================================
  // TIER 2000
  // ===========================================================================
  tempestNova: {
    id: 'tempestNova',
    name: () => t('skill.tempestNova.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'tempest-nova',
    description: () => t('skill.tempestNova'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'instant', scale: { base: 5, increment: 2 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 5, increment: 2 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'blizzard',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  earthShatter: {
    id: 'earthShatter',
    name: () => t('skill.earthShatter.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 17000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'earth-shatter',
    description: () => t('skill.earthShatter'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', scale: { base: 2, increment: 2.5 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'elementalStorm',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3000
  // ===========================================================================
  tidalWave: {
    id: 'tidalWave',
    name: () => t('skill.tidalWave.name'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 70000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'tidal-wave',
    description: () => t('skill.tidalWave'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'buff', scale: { base: 3, increment: 3 },
      }),
      reduceEnemyAttackSpeedPercent: getSkillStatBonus({
        level, statKey: 'reduceEnemyAttackSpeedPercent', skillType: 'buff', scale: { base: 1, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'blizzard',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  stormLord: {
    id: 'stormLord',
    name: () => t('skill.stormLord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'storm-lord',
    description: () => t('skill.stormLord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'passive', scale: { base: 2 },
      }),
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 5, increment: 3 },
      }),
      manaPercent: getSkillStatBonus({
        level, statKey: 'manaPercent', skillType: 'passive', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'tempestNova',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5000
  // ===========================================================================
  elementalAscension: {
    id: 'elementalAscension',
    name: () => t('skill.elementalAscension.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'elemental-ascension',
    description: () => t('skill.elementalAscension'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 2, linear: 0.5 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 4, increment: 3 },
      }),
      extraDamageFromResistancesPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromResistancesPercent', skillType: 'passive', scale: { base: 1, max: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'avatarOfTheElements',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  natureCataclysm: {
    id: 'natureCataclysm',
    name: () => t('skill.natureCataclysm.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 50 + level * 1.25,
    cooldown: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'nature-cataclysm',
    description: () => t('skill.natureCataclysm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'instant', scale: { base: 8, increment: 3 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'volcanicWrath',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // Specialization-unlocked skills
  glacialBulwark: {
    id: 'glacialBulwark',
    name: () => t('skill.glacialBulwark.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'ice-barrier',
    description: () => t('skill.glacialBulwark'),
    maxLevel: () => 150,
    effect: (level) => ({
      damageTakenConvertedToColdPercent: getSkillStatBonus({
        level, statKey: 'damageTakenConvertedToColdPercent', skillType: 'passive', scale: { base: 1, limit: 75 },
      }),
      coldDamageTakenReductionPercent: getSkillStatBonus({
        level, statKey: 'coldDamageTakenReductionPercent', skillType: 'passive', scale: { base: 1, limit: 50 },
      }),
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 3, increment: 3 },
      }),
    }),
    isVisible: () => hero.stats.glacialBulwarkUnlocked > 0,
  },
};
