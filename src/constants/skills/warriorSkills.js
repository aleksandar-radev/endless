import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getPercentBonus, getFlatBonus, getChanceBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Warrior skills extracted from skills.js
export const WARRIOR_SKILLS = {
  // Tier 0 Skills
  bash: {
    id: 'bash',
    name: () => t('skill.bash.name'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'war-axe',
    description: () => t('skill.bash'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getFlatBonus(level, { basePerLevel: 2, milestoneInterval: 50, milestoneMultiplier: 1.2 }),
    }),
  },
  toughness: {
    id: 'toughness',
    name: () => t('skill.toughness.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'shield',
    description: () => t('skill.toughness'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getFlatBonus(level, { basePerLevel: 3, milestoneInterval: 50, milestoneMultiplier: 1.2 }),
      extraDamageFromArmorPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.01, 
        earlyGameScale: 0.8,
        earlyGameType: 'log' 
      }) / 100,
    }),
  },

  // Tier 1 Skills
  powerStrike: {
    id: 'powerStrike',
    name: () => t('skill.powerStrike.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 4 + level * 0.3,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'sword',
    description: () => t('skill.powerStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getFlatBonus(level, { basePerLevel: 5, milestoneInterval: 50, milestoneMultiplier: 1.2 }),
      damagePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.5, 
        earlyGameScale: 1.2,
        earlyGameType: 'sqrt' 
      }) / 100,
    }),
    // Power Strike benefits from Iron Will (strength synergy)
    synergiesFrom: () => [
      { skillId: 'ironWill', bonusPerLevel: 0.005, maxBonus: 0.5 } // +0.5% per level, max +50%
    ],
    synergiesTo: () => ['ironWill'],
  },
  ironWill: {
    id: 'ironWill',
    name: () => t('skill.ironWill.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'helmet',
    description: () => t('skill.ironWill'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getFlatBonus(level, { basePerLevel: 4, milestoneInterval: 50, milestoneMultiplier: 1.15 }),
      perseverance: getFlatBonus(level, { basePerLevel: 4, milestoneInterval: 50, milestoneMultiplier: 1.15 }),
      extraDamageFromLifePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.02, 
        earlyGameScale: 0.6,
        earlyGameType: 'log' 
      }) / 100,
    }),
    // Iron Will benefits from Toughness (defensive synergy)
    synergiesFrom: () => [
      { skillId: 'toughness', bonusPerLevel: 0.005, maxBonus: 0.4 }
    ],
    synergiesTo: () => ['powerStrike'],
  },

  // Tier 2 Skills
  battleCry: {
    id: 'battleCry',
    name: () => t('skill.battleCry.name'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'cry',
    description: () => t('skill.battleCry'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getFlatBonus(level, { basePerLevel: 3, milestoneInterval: 50, milestoneMultiplier: 1.15 }),
      damagePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.3, 
        earlyGameScale: 1.0,
        earlyGameType: 'sqrt' 
      }) / 100,
    }),
  },
  fortitude: {
    id: 'fortitude',
    name: () => t('skill.fortitude.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'armor',
    description: () => t('skill.fortitude'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegenOfTotalPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.005, 
        earlyGameScale: 0.4,
        earlyGameType: 'log' 
      }) / 100,
      lifeRegenPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.1, 
        earlyGameScale: 0.8,
        earlyGameType: 'log' 
      }) / 100,
    }),
  },

  // Tier 3 Skills
  groundSlam: {
    id: 'groundSlam',
    name: () => t('skill.groundSlam.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 5 + level * 0.6,
    cooldown: () => 11400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'slam',
    description: () => t('skill.groundSlam'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getFlatBonus(level, { basePerLevel: 4, milestoneInterval: 50, milestoneMultiplier: 1.25 }),
      damagePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.6, 
        earlyGameScale: 1.5,
        earlyGameType: 'sqrt' 
      }) / 100,
    }),
  },

  // Tier 3 Skills
  armorBreaker: {
    id: 'armorBreaker',
    name: () => t('skill.armorBreaker.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'armor-break',
    description: () => t('skill.armorBreaker'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPenetration: getFlatBonus(level, { basePerLevel: 10, milestoneInterval: 50, milestoneMultiplier: 1.2 }),
      armorPenetrationPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.3, 
        earlyGameScale: 1.0,
        earlyGameType: 'log' 
      }) / 100,
    }),
  },

  // Tier 4 Skills
  shieldWall: {
    id: 'shieldWall',
    name: () => t('skill.shieldWall.name'),
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.625,
    cooldown: () => 45000,
    duration: () => 16000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'wall',
    description: () => t('skill.shieldWall'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      extraDamageFromArmorPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.02, 
        earlyGameScale: 0.7,
        earlyGameType: 'log' 
      }) / 100,
      armorPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.4, 
        earlyGameScale: 1.2,
        earlyGameType: 'sqrt' 
      }) / 100,
    }),
  },

  // Tier 5 Skills
  berserk: {
    id: 'berserk',
    name: () => t('skill.berserk.name'),
    type: () => 'toggle',
    manaCost: (level) => 3 + level * 0.188,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'berserk',
    description: () => t('skill.berserk'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getFlatBonus(level, { basePerLevel: 3, milestoneInterval: 50, milestoneMultiplier: 1.3 }),
    }),
  },

  lastStand: {
    id: 'lastStand',
    name: () => t('skill.lastStand.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'last-stand',
    description: () => t('skill.lastStand'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.5, 
        earlyGameScale: 1.0,
        earlyGameType: 'log' 
      }) / 100,
      attackRatingPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.6, 
        earlyGameScale: 1.0,
        earlyGameType: 'log' 
      }) / 100,
    }),
  },

  // Tier 6 Skills
  warlord: {
    id: 'warlord',
    name: () => t('skill.warlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => t('skill.warlordWarrior'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.1, 
        earlyGameScale: 0.8,
        earlyGameType: 'log' 
      }) / 100,
      extraDamageFromLifePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.008, 
        earlyGameScale: 0.5,
        earlyGameType: 'log' 
      }) / 100,
      strengthPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.15, 
        earlyGameScale: 0.9,
        earlyGameType: 'log' 
      }) / 100,
      vitalityPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.15, 
        earlyGameScale: 0.9,
        earlyGameType: 'log' 
      }) / 100,
      endurancePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.15, 
        earlyGameScale: 0.9,
        earlyGameType: 'log' 
      }) / 100,
    }),
  },

  // Tier 1200 Skills
  unstoppableForce: {
    id: 'unstoppableForce',
    name: () => t('skill.unstoppableForce.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unstoppable-force',
    description: () => t('skill.unstoppableForce'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.2, 
        earlyGameScale: 1.0,
        earlyGameType: 'log' 
      }) / 100,
      attackRatingPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.3, 
        earlyGameScale: 1.0,
        earlyGameType: 'log' 
      }) / 100,
      critDamage: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.006, 
        earlyGameScale: 0.4,
        earlyGameType: 'log' 
      }) / 100,
    }),
  },
  unyieldingDefense: {
    id: 'unyieldingDefense',
    name: () => t('skill.unyieldingDefense.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unyielding-defense',
    description: () => t('skill.unyieldingDefense'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.15, 
        earlyGameScale: 1.0,
        earlyGameType: 'sqrt' 
      }) / 100,
      blockChance: getChanceBonus(level, { 
        perLevel: 0.05, 
        maxChance: 10 
      }),
      allResistancePercent: getPercentBonus(level, { 
        softcapLevel: 200, 
        linearSlope: 0.25, 
        earlyGameScale: 1.2,
        earlyGameType: 'sqrt' 
      }) / 100,
    }),
  },

  // Tier 2000 Skills
  bladeStorm: {
    id: 'bladeStorm',
    name: () => t('skill.bladeStorm.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 30 + level * 0.4,
    cooldown: () => 3500,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blade-storm',
    description: () => t('skill.bladeStorm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 20, 5, 0.5),
      damagePercent: scaleDownFlat(level, 2),
      armorPenetrationPercent: Math.min(scaleDownFlat(level, 1), 40),
    }),
  },
  ironFortress: {
    id: 'ironFortress',
    name: () => t('skill.ironFortress.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'iron-fortress',
    description: () => t('skill.ironFortress'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 15, 5, 0.5),
      lifePercent: scaleDownFlat(level, 1.5),
      allResistance: scaleUpFlat(level, 10, 5, 0.5),
    }),
  },

  // Tier 3000 Skills
  titanStrength: {
    id: 'titanStrength',
    name: () => t('skill.titanStrength.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'titan-strength',
    description: () => t('skill.titanStrength'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: scaleUpFlat(level, 6),
      strengthPercent: scaleDownFlat(level, 1.3),
      damagePercent: scaleDownFlat(level, 1.3),
    }),
  },
  heroicStand: {
    id: 'heroicStand',
    name: () => t('skill.heroicStand.name'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 150000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'heroic-stand',
    description: () => t('skill.heroicStand'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 3),
      lifeRegenPercent: scaleDownFlat(level, 2),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level, 1) * 0.015, 3),
    }),
  },

  // Tier 5000 Skills
  legendaryWarlord: {
    id: 'legendaryWarlord',
    name: () => t('skill.legendaryWarlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'legendary-warlord',
    description: () => t('skill.legendaryWarlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.1), 20),
      critDamage: scaleDownFlat(level, 0.012),
      damagePercent: scaleDownFlat(level, 2.5),
    }),
  },
  eternalGuardian: {
    id: 'eternalGuardian',
    name: () => t('skill.eternalGuardian.name'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.35,
    cooldown: () => 110000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'eternal-guardian',
    description: () => t('skill.eternalGuardian'),
    maxLevel: () => 350,
    effect: (level) => ({
      reduceEnemyAttackSpeedPercent: Math.min(scaleDownFlat(level, 0.1), 15),
      reduceEnemyDamagePercent: Math.min(scaleDownFlat(level, 0.075), 10),
    }),
  },

  // Specialization Skills
  animatedWeapons: {
    id: 'animatedWeapons',
    name: () => t('skill.animatedWeapons.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: 5 + scaleDownFlat(level, 4),
        attackSpeed: hero.stats.attackSpeed,
        canCrit: true,
      };
    },
    manaCost: (level) => 30 + level * 1,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'animated-weapons',
    description: () => t('skill.animatedWeapons'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
    isVisible: () => hero.stats.animatedWeaponsUnlocked > 0,
  },
};