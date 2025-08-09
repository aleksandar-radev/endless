import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat } from '../../common.js';
import { scaleUpFlat } from '../../common.js';

// Warrior skills extracted from skills.js
export const WARRIOR_SKILLS = {
  // Tier 0 Skills
  bash: {
    id: 'bash',
    name: () => 'Bash',
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'war-axe',
    description: () => 'While active, increases damage but costs mana per attack',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 2, 5, 0.2),
      damagePercent: scaleDownFlat(level, 2),
    }),
  },
  toughness: {
    id: 'toughness',
    name: () => 'Toughness',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'shield',
    description: () => 'Permanently increases armor',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 3, 5, 0.2),
      armorPercent: scaleDownFlat(level, 2.5),
      extraDamageFromArmorPercent: Math.min(0.016 * scaleDownFlat(level), 2),
    }),
  },

  // Tier 1 Skills
  powerStrike: {
    id: 'powerStrike',
    name: () => 'Power Strike',
    type: () => 'instant',
    manaCost: (level) => 4 + level * 0.25,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'sword',
    description: () => 'A powerful strike that deals increased damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 3, 5, 0.2),
      damagePercent: scaleDownFlat(level, 5, 5),
    }),
  },
  ironWill: {
    id: 'ironWill',
    name: () => 'Iron Will',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'helmet',
    description: () => 'Increases resistance to damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: scaleUpFlat(level, 3),
      vitalityPercent: scaleDownFlat(level),
      lifeRegen: scaleUpFlat(level, 1),
      allResistance: scaleUpFlat(level, 3),
      extraDamageFromLifeRegenPercent: Math.min(0.2 * scaleDownFlat(level), 25),
    }),
  },

  // Tier 2 Skills
  battleCry: {
    id: 'battleCry',
    name: () => 'Battle Cry',
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'cry',
    description: () => 'Temporarily increases damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
    }),
  },
  fortitude: {
    id: 'fortitude',
    name: () => 'Fortitude',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'armor',
    description: () => 'Increases life regeneration',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level) * 0.005, 1),
      lifeRegen: scaleUpFlat(level, 2, 4),
      lifeRegenPercent: scaleDownFlat(level, 1),
    }),
  },

  // Tier 3 Skills
  groundSlam: {
    id: 'groundSlam',
    name: () => 'Ground Slam',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.375,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'slam',
    description: () => 'Deals instant damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 8),
    }),
  },

  // Tier 3 Skills
  armorBreaker: {
    id: 'armorBreaker',
    name: () => 'Armor Breaker',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'armor-break',
    description: () => 'Gives armor penetration',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPenetration: scaleUpFlat(level, 15, 5, 0.5),
      armorPenetrationPercent: Math.min(0.35 * scaleDownFlat(level), 40),
    }),
  },

  // Tier 4 Skills
  shieldWall: {
    id: 'shieldWall',
    name: () => 'Shield Wall',
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.625,
    cooldown: () => 45000,
    duration: () => 16000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'wall',
    description: () => 'Increases armor and block chance temporarily',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      extraDamageFromArmorPercent: Math.min(0.06 * scaleDownFlat(level), 5),
      armorPercent: 6 * scaleDownFlat(level),
      blockChance: Math.min(level * 0.1, 20),
    }),
  },

  // Tier 5 Skills
  berserk: {
    id: 'berserk',
    name: () => 'Berserk',
    type: () => 'toggle',
    manaCost: (level) => 3 + level * 0.188,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'berserk',
    description: () => 'Gives huge amounts of fire damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: scaleUpFlat(level, 4, 5, 0.5),
      fireDamagePercent: scaleDownFlat(level, 7),
    }),
  },

  lastStand: {
    id: 'lastStand',
    name: () => 'Last Stand',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'last-stand',
    description: () => 'Greatly increases offensive stats',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 1),
      attackSpeed: Math.min(scaleDownFlat(level, 0.013), 1.5),
      attackRating: scaleUpFlat(level, 6, 5, 0.3),
      attackRatingPercent: scaleDownFlat(level, 2.8),
    }),
  },

  // Tier 6 Skills
  warlord: {
    id: 'warlord',
    name: () => 'Warlord',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => 'Increases all attributes significantly',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: scaleDownFlat(level, 1),
      extraDamageFromLifePercent: Math.min(0.015 * scaleDownFlat(level), 2),
      strengthPercent: scaleDownFlat(level, 1.5),
      vitalityPercent: scaleDownFlat(level, 1.5),
      endurancePercent: scaleDownFlat(level, 1.5),
    }),
  },

  // Tier 1200 Skills
  unstoppableForce: {
    id: 'unstoppableForce',
    name: () => 'Unstoppable Force',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unstoppable-force',
    description: () => 'Massively increases damage output.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      attackRatingPercent: scaleDownFlat(level, 3),
      critDamage: Math.min(scaleDownFlat(level, 0.006), 1),
    }),
  },
  unyieldingDefense: {
    id: 'unyieldingDefense',
    name: () => 'Unyielding Defense',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unyielding-defense',
    description: () => 'Temporarily increases armor and block chance.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 1.5),
      blockChance: Math.min(scaleDownFlat(level, 0.1), 10),
      allElementalResistancePercent: scaleDownFlat(level, 2.5),
    }),
  },

  // Tier 2000 Skills
  bladeStorm: {
    id: 'bladeStorm',
    name: () => 'Blade Storm',
    type: () => 'instant',
    manaCost: (level) => 30 + level * 1.1,
    cooldown: () => 3500,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blade-storm',
    description: () => 'Spins violently, striking all nearby enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 20, 5, 0.5),
      damagePercent: scaleDownFlat(level, 2),
      armorPenetrationPercent: Math.min(scaleDownFlat(level, 1), 40),
    }),
  },
  ironFortress: {
    id: 'ironFortress',
    name: () => 'Iron Fortress',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'iron-fortress',
    description: () => 'Greatly increases defensive capabilities.',
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
    name: () => 'Titan Strength',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'titan-strength',
    description: () => 'Increases raw strength to titanic levels.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: scaleUpFlat(level, 10),
      strengthPercent: scaleDownFlat(level, 1.5),
      damagePercent: scaleDownFlat(level, 2),
    }),
  },
  heroicStand: {
    id: 'heroicStand',
    name: () => 'Heroic Stand',
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 150000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'heroic-stand',
    description: () => 'Greatly boosts defenses when near death.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: 3 * scaleDownFlat(level),
      lifeRegenPercent: 2 * scaleDownFlat(level),
      blockChance: level * 0.15,
    }),
  },

  // Tier 5000 Skills
  legendaryWarlord: {
    id: 'legendaryWarlord',
    name: () => 'Legendary Warlord',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'legendary-warlord',
    description: () => 'Ultimate mastery of warfare.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRatingPercent: 5 * scaleDownFlat(level),
      critChance: Math.min(level * 0.1, 40),
      damagePercent: 3 * scaleDownFlat(level),
    }),
  },
  eternalGuardian: {
    id: 'eternalGuardian',
    name: () => 'Eternal Guardian',
    type: () => 'toggle',
    manaCost: (level) => 15 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'eternal-guardian',
    description: () => 'Channel unmatched protection.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 12,
      lifePercent: 2 * scaleDownFlat(level),
      allResistance: level * 12,
    }),
  },
};
