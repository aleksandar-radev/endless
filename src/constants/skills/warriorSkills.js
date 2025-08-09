import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat } from '../../common.js';

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
      damage: level * 2,
      damagePercent: 2 * scaleDownFlat(level),
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
      armor: level * 3,
      armorPercent: 2.5 * scaleDownFlat(level),
      extraDamageFromArmorPercent: Math.min(0.02 * scaleDownFlat(level), 3),
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
      damage: level * 2,
      damagePercent: 5 * scaleDownFlat(level),
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
      vitality: level * 3,
      vitalityPercent: scaleDownFlat(level),
      lifeRegen: level * 1,
      allResistance: level * 3,
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
      damagePercent: 2.5 * scaleDownFlat(level),
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
      lifeRegen: level * 1,
      lifeRegenPercent: 1 * scaleDownFlat(level),
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
      damagePercent: 8 * scaleDownFlat(level),
    }),
  },

  // Tier 3 Skills
  armorBreaker: {
    id: 'armorBreaker',
    name: () => 'Armor Breaker',
    type: () => 'passive',
    manaCost: (level) => 5 + level * 0.375,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'armor-break',
    description: () => 'Deals instant damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPenetration: 15 * level,
      armorPenetrationPercent: Math.min(0.5 * scaleDownFlat(level), 40),
    }),
  },

  // Tier 4 Skills
  shieldWall: {
    id: 'shieldWall',
    name: () => 'Shield Wall',
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.625,
    cooldown: () => 40000,
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
    description: () => 'Gives huge amounts of physical and fire damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: 1.5 * scaleDownFlat(level),
      fireDamage: level * 3,
      fireDamagePercent: 6 * scaleDownFlat(level),
    }),
  },

  lastStand: {
    id: 'lastStand',
    name: () => 'Last Stand',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'last-stand',
    description: () => 'Greatly increases offensive stats',
    maxLevel: () => 150,
    effect: (level) => ({
      lifeSteal: level * 0.02,
      attackSpeed: level * 0.01,
      attackRating: level * 6,
      attackRatingPercent: 4 * scaleDownFlat(level),
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
    maxLevel: () => 200,
    effect: (level) => ({
      lifePercent: 1 * scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(0.015 * scaleDownFlat(level), 2),
      strengthPercent: 1.5 * scaleDownFlat(level),
      vitalityPercent: 1.5 * scaleDownFlat(level),
      endurancePercent: 1.5 * scaleDownFlat(level),
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
      damagePercent: 2 * scaleDownFlat(level),
      attackRatingPercent: 3 * scaleDownFlat(level),
      critDamage: level * 0.01,
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
      armorPercent: 2 * scaleDownFlat(level),
      blockChance: level * 0.1,
      lifeRegen: level * 2,
    }),
  },

  // Tier 2000 Skills
  bladeStorm: {
    id: 'bladeStorm',
    name: () => 'Blade Storm',
    type: () => 'instant',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 1000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blade-storm',
    description: () => 'Spins violently, striking all nearby enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 20,
      damagePercent: 2 * scaleDownFlat(level),
      armorPenetrationPercent: 2 * scaleDownFlat(level),
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
      armor: level * 8,
      lifePercent: 1.5 * scaleDownFlat(level),
      allResistance: level * 8,
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
      strength: level * 5,
      strengthPercent: 3 * scaleDownFlat(level),
      damagePercent: 2 * scaleDownFlat(level),
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
