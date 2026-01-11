import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent } from '../../common.js';
import { hero } from '../../globals.js';

// Elementalist skills extracted from skills.js
export const ELEMENTALIST_SKILLS = {
  // Tier 1 Skills
  fireball: {
    id: 'fireball',
    name: () => t('skill.fireball.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 5200,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'fireball',
    description: () => t('skill.fireball'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
  frostArmor: {
    id: 'frostArmor',
    name: () => t('skill.frostArmor.name'),
    type: () => 'buff',
    manaCost: (level) => 6 + level * 1.25,
    cooldown: () => 34000,
    duration: () => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frost-armor',
    description: () => t('skill.frostArmor'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      armorPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
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
      manaPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      manaRegen: getScalingFlat({
        level, base: 1, increment: 0.2, interval: 50, bonus: 0.1,
      }),
      manaRegenPerLevel: getScalingFlat({
        level, base: 0.001, increment: 0.005, interval: 50, bonus: 0,
      }),
      manaRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      wisdomPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      wisdom: getScalingFlat({
        level, base: 4, increment: 1, interval: 50, bonus: 0.1,
      }),
      wisdomPerLevel: getScalingFlat({
        level, base: 0.004, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 10 Skills
  lightningStrike: {
    id: 'lightningStrike',
    name: () => t('skill.lightningStrike.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 3500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'lightning',
    description: () => t('skill.lightningStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      lightningDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      airDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
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
      elementalDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalPenetration: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      elementalPenetrationPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.01, interval: 50, bonus: 0,
      }),
      elementalPenetrationPercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.1, power: 0.5,
      }), 20),
    }),
  },

  // Tier 25 Skills
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
      coldDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      airDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      coldDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      airDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      airDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      lightningDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      lightningDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
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
      reflectFireDamage: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      reflectFireDamagePerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
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
      manaPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      manaRegen: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      manaRegenPerLevel: getScalingFlat({
        level, base: 0.002, increment: 0.005, interval: 50, bonus: 0,
      }),
      manaRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      manaRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.5,
      }), 1),
    }),
  },

  // Tier 50 Skills
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
      elementalDamage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      elementalDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
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
      elementalDamage: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      elementalDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      intelligencePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      allResistance: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 75 Skills
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
      attackRatingPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      manaPerHit: getScalingFlat({
        level, base: 1, increment: 0.2, interval: 50, bonus: 0.1,
      }),
      manaPerHitPerLevel: getScalingFlat({
        level, base: 0.001, increment: 0.005, interval: 50, bonus: 0,
      }),
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 50),
    }),
  },

  // Tier 100 Skills
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
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      airDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalDamage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
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
      earthDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      vitality: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      wisdomPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 200 Skills
  avatarOfTheElements: {
    id: 'avatarOfTheElements',
    name: () => t('skill.avatarOfTheElements.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'avatar-of-elements',
    description: () => t('skill.avatarOfTheElements'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalDamage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      allResistance: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      perseverance: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      perseverancePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      perseverancePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 1200 Skills
  elementalCorrosion: {
    id: 'elementalCorrosion',
    name: () => t('skill.elementalCorrosion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'elemental-corrosion',
    description: () => t('skill.elementalCorrosion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalPenetrationPercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 20),
      manaRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalDamage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  volcanicWrath: {
    id: 'volcanicWrath',
    name: () => t('skill.volcanicWrath.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'volcanic-wrath',
    description: () => t('skill.volcanicWrath'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      earthDamage: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.15,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      fireDamage: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.15,
      }),
      fireDamagePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 2000 Skills
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
      lightningDamage: getScalingFlat({
        level, base: 35, increment: 7, interval: 50, bonus: 0.15,
      }),
      lightningDamagePerLevel: getScalingFlat({
        level, base: 0.035, increment: 0.01, interval: 50, bonus: 0,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamage: getScalingFlat({
        level, base: 35, increment: 7, interval: 50, bonus: 0.15,
      }),
      coldDamagePerLevel: getScalingFlat({
        level, base: 0.035, increment: 0.01, interval: 50, bonus: 0,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
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
      earthDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      earthDamage: getScalingFlat({
        level, base: 45, increment: 9, interval: 50, bonus: 0.15,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.045, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 3000 Skills
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
      waterDamage: getScalingFlat({
        level, base: 40, increment: 8, interval: 50, bonus: 0.15,
      }),
      waterDamagePerLevel: getScalingFlat({
        level, base: 0.04, increment: 0.01, interval: 50, bonus: 0,
      }),
      waterDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      reduceEnemyAttackSpeedPercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 15),
    }),
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
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      manaPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 5000 Skills
  elementalAscension: {
    id: 'elementalAscension',
    name: () => t('skill.elementalAscension.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'elemental-ascension',
    description: () => t('skill.elementalAscension'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalPenetrationPercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 15),
      allResistance: getScalingFlat({
        level, base: 40, increment: 8, interval: 50, bonus: 0.15,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.04, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
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
      fireDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lightningDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      elementalDamage: getScalingFlat({
        level, base: 40, increment: 8, interval: 50, bonus: 0.15,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.04, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
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
      damageTakenConvertedToColdPercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.1, power: 0.5,
      }), 75),
      coldDamageTakenReductionPercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.1, power: 0.5,
      }), 50),
      armor: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
    isVisible: () => hero.stats.glacialBulwarkUnlocked > 0,
  },
};
