import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getSkillStatBonus } from '../../common.js';
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
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', scale: { base: 1 },
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
    cooldown: () => 34000,
    duration: () => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frost-armor',
    description: () => t('skill.frostArmor'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', scale: { base: 0.4, increment: 0.4 },
      }),
      armorPerLevel: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', perLevel: true,
      }),
      armorPercent: getSkillStatBonus({
        level, statKey: 'armorPercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'buff', scale: { base: 0.625 },
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
      manaPercent: getSkillStatBonus({
        level, statKey: 'manaPercent', skillType: 'passive', scale: { base: 1 },
      }),
      manaRegen: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', scale: { base: 1 },
      }),
      manaRegenPerLevel: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', perLevel: true, scale: { base: 0.5 },
      }),
      manaRegenPercent: getSkillStatBonus({
        level, statKey: 'manaRegenPercent', skillType: 'passive', scale: { base: 1 },
      }),
      wisdomPercent: getSkillStatBonus({
        level, statKey: 'wisdomPercent', skillType: 'passive', scale: { base: 1 },
      }),
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 1 },
      }),
      wisdomPerLevel: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', perLevel: true,
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
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      lightningDamagePerLevel: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'instant', perLevel: true,
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'instant', scale: { base: 0.5 },
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
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      elementalPenetration: getSkillStatBonus({
        level, statKey: 'elementalPenetration', skillType: 'passive', scale: { base: 0.5, increment: 0.2 },
      }),
      elementalPenetrationPerLevel: getSkillStatBonus({
        level, statKey: 'elementalPenetration', skillType: 'passive', perLevel: true, scale: { base: 0.5 },
      }),
      elementalPenetrationPercent: Math.min(getSkillStatBonus({
        level, statKey: 'elementalPenetrationPercent', skillType: 'passive', scale: { base: 0.2 },
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
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'buff', scale: { base: 3.75, increment: 3 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'buff', perLevel: true,
      }),
      airDamage: getSkillStatBonus({
        level, statKey: 'airDamage', skillType: 'buff', scale: { base: 3.75, increment: 3 },
      }),
      airDamagePerLevel: getSkillStatBonus({
        level, statKey: 'airDamage', skillType: 'buff', perLevel: true,
      }),
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'buff', scale: { base: 3.75, increment: 3 },
      }),
      lightningDamagePerLevel: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'buff', perLevel: true,
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
      reflectFireDamage: getSkillStatBonus({
        level, statKey: 'reflectFireDamage', skillType: 'buff', scale: { base: 1, increment: 1 },
      }),
      reflectFireDamagePerLevel: getSkillStatBonus({
        level, statKey: 'reflectFireDamage', skillType: 'buff', perLevel: true, scale: { base: 2 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'buff', scale: { base: 1.25 },
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
      manaPercent: getSkillStatBonus({
        level, statKey: 'manaPercent', skillType: 'passive', scale: { base: 1 },
      }),
      manaRegen: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', scale: { base: 2, increment: 2.5 },
      }),
      manaRegenPerLevel: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', perLevel: true, scale: { base: 2 },
      }),
      manaRegenPercent: getSkillStatBonus({
        level, statKey: 'manaRegenPercent', skillType: 'passive', scale: { base: 1 },
      }),
      manaRegenOfTotalPercent: Math.min(getSkillStatBonus({
        level, statKey: 'manaRegenOfTotalPercent', skillType: 'passive', scale: { base: 0.33 },
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
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'instant', scale: { base: 2, increment: 1 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'instant', perLevel: true,
      }),
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'instant', scale: { base: 1 },
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
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 1.66, increment: 1 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', perLevel: true,
      }),
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      intelligencePercent: getSkillStatBonus({
        level, statKey: 'intelligencePercent', skillType: 'passive', scale: { base: 1 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 0.5, increment: 0.5 },
      }),
      allResistancePerLevel: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', perLevel: true,
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
      attackRatingPercent: getSkillStatBonus({
        level, statKey: 'attackRatingPercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'buff', scale: { base: 1.25, increment: 1.25 },
      }),
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'buff', perLevel: true,
      }),
      manaPerHit: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'buff', scale: { base: 0.5, increment: 0.5 },
      }),
      manaPerHitPerLevel: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'buff', perLevel: true,
      }),
      attackSpeedPercent: Math.min(getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66 },
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
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', scale: { base: 2.5, increment: 2 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', perLevel: true,
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
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2.5, increment: 4 },
      }),
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true, scale: { base: 2 },
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'passive', scale: { base: 1 },
      }),
      wisdomPercent: getSkillStatBonus({
        level, statKey: 'wisdomPercent', skillType: 'passive', scale: { base: 1 },
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
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 3.33, increment: 2 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', perLevel: true,
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      allResistancePerLevel: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', perLevel: true,
      }),
      perseverance: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', scale: { base: 5, increment: 8 },
      }),
      perseverancePerLevel: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', perLevel: true, scale: { base: 2 },
      }),
      perseverancePercent: getSkillStatBonus({
        level, statKey: 'perseverancePercent', skillType: 'passive', scale: { base: 1 },
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
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 1 },
      }),
      elementalPenetrationPercent: Math.min(getSkillStatBonus({
        level, statKey: 'elementalPenetrationPercent', skillType: 'passive', scale: { base: 0.4 },
      }), 20),
      manaRegenPercent: getSkillStatBonus({
        level, statKey: 'manaRegenPercent', skillType: 'passive', scale: { base: 1 },
      }),
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 3.33, increment: 2 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', perLevel: true,
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
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', scale: { base: 6, increment: 3 },
      }),
      earthDamagePerLevel: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', perLevel: true,
      }),
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', scale: { base: 6, increment: 3 },
      }),
      fireDamagePerLevel: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', perLevel: true,
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
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'instant', scale: { base: 7, increment: 3.5 },
      }),
      lightningDamagePerLevel: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'instant', perLevel: true,
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 7, increment: 3.5 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', perLevel: true,
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1 },
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
      earthDamagePercent: getSkillStatBonus({
        level, statKey: 'earthDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      earthDamage: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', scale: { base: 9, increment: 4.5 },
      }),
      earthDamagePerLevel: getSkillStatBonus({
        level, statKey: 'earthDamage', skillType: 'instant', perLevel: true,
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
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'buff', scale: { base: 10, increment: 8 },
      }),
      waterDamagePerLevel: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'buff', perLevel: true,
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      reduceEnemyAttackSpeedPercent: Math.min(getSkillStatBonus({
        level, statKey: 'reduceEnemyAttackSpeedPercent', skillType: 'buff', scale: { base: 40 },
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
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'passive', scale: { base: 2 },
      }),
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 5, increment: 3 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', perLevel: true,
      }),
      manaPercent: getSkillStatBonus({
        level, statKey: 'manaPercent', skillType: 'passive', scale: { base: 1 },
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
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 2 },
      }),
      elementalPenetrationPercent: Math.min(getSkillStatBonus({
        level, statKey: 'elementalPenetrationPercent', skillType: 'passive', scale: { base: 0.4 },
      }), 15),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 4, increment: 4 },
      }),
      allResistancePerLevel: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', perLevel: true, scale: { base: 4 },
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
        level, statKey: 'elementalDamage', skillType: 'instant', scale: { base: 8, increment: 4 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'instant', perLevel: true,
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
      damageTakenConvertedToColdPercent: Math.min(getSkillStatBonus({
        level, statKey: 'damageTakenConvertedToColdPercent', skillType: 'passive', scale: { base: 1 },
      }), 75),
      coldDamageTakenReductionPercent: Math.min(getSkillStatBonus({
        level, statKey: 'coldDamageTakenReductionPercent', skillType: 'passive', scale: { base: 1 },
      }), 50),
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 0.42, increment: 0.5 },
      }),
      armorPerLevel: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', perLevel: true,
      }),
    }),
    isVisible: () => hero.stats.glacialBulwarkUnlocked > 0,
  },
};
