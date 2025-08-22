import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat } from '../../common.js';
import { scaleUpFlat } from '../../common.js';

// Warrior skills extracted from skills.js
export const WARRIOR_SKILLS = {
  // Tier 0 Skills
  bash: {
    id: 'bash',
    name: () => t('Bash'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'war-axe',
    description: () => t('While active, increases damage but costs mana per attack'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 2, 5, 0.2),
      damagePercent: scaleDownFlat(level, 2),
    }),
  },
  toughness: {
    id: 'toughness',
    name: () => t('Toughness'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'shield',
    description: () => t('Permanently increases armor, armor percent, and adds damage from armor'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 3, 5, 0.2),
      armorPercent: scaleDownFlat(level, 2.5),
      extraDamageFromArmorPercent: Math.min(0.014 * scaleDownFlat(level), 1.5),
    }),
  },

  // Tier 1 Skills
  powerStrike: {
    id: 'powerStrike',
    name: () => t('Power Strike'),
    type: () => 'instant',
    manaCost: (level) => 4 + level * 0.25,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'sword',
    description: () => t('A powerful strike that deals increased damage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 3, 5, 0.2),
      damagePercent: scaleDownFlat(level, 5, 5),
    }),
  },
  ironWill: {
    id: 'ironWill',
    name: () => t('Iron Will'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'helmet',
    description: () => t('Increases vitality, life regen, and resistance while converting life regen to damage'),
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
    name: () => t('Battle Cry'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'cry',
    description: () => t('Temporarily increases damage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
    }),
  },
  fortitude: {
    id: 'fortitude',
    name: () => t('Fortitude'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'armor',
    description: () => t('Increases life regeneration'),
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
    name: () => t('Ground Slam'),
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.375,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'slam',
    description: () => t('Deals instant damage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 8),
    }),
  },

  // Tier 3 Skills
  armorBreaker: {
    id: 'armorBreaker',
    name: () => t('Armor Breaker'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'armor-break',
    description: () => t('Gives armor penetration'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPenetration: scaleUpFlat(level, 15, 5, 0.5),
      armorPenetrationPercent: Math.min(0.35 * scaleDownFlat(level), 40),
    }),
  },

  // Tier 4 Skills
  shieldWall: {
    id: 'shieldWall',
    name: () => t('Shield Wall'),
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.625,
    cooldown: () => 45000,
    duration: () => 16000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'wall',
    description: () => t('Increases armor percent, block chance, and damage from armor temporarily'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      extraDamageFromArmorPercent: Math.min(0.03 * scaleDownFlat(level), 2),
      armorPercent: 4 * scaleDownFlat(level),
      blockChance: Math.min(level * 0.1, 20),
    }),
  },

  // Tier 5 Skills
  berserk: {
    id: 'berserk',
    name: () => t('Berserk'),
    type: () => 'toggle',
    manaCost: (level) => 3 + level * 0.188,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'berserk',
    description: () => t('Grants large amounts of fire damage and fire damage percent'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: scaleUpFlat(level, 4, 5, 0.5),
      fireDamagePercent: scaleDownFlat(level, 7),
    }),
  },

  lastStand: {
    id: 'lastStand',
    name: () => t('Last Stand'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'last-stand',
    description: () => t('Increases life steal, attack speed, and attack rating'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 1),
      attackSpeed: Math.min(scaleDownFlat(level, 0.013), 1.5),
      attackRating: scaleUpFlat(level, 6, 5, 0.3),
      attackRatingPercent: scaleDownFlat(level, 1.4),
    }),
  },

  // Tier 6 Skills
  warlord: {
    id: 'warlord',
    name: () => t('Warlord'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => t('Boosts life, strength, vitality, and endurance while adding damage from life'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: scaleDownFlat(level, 1),
      extraDamageFromLifePercent: Math.min(0.008 * scaleDownFlat(level), 1),
      strengthPercent: scaleDownFlat(level, 1.5),
      vitalityPercent: scaleDownFlat(level, 1.5),
      endurancePercent: scaleDownFlat(level, 1.5),
    }),
  },

  // Tier 1200 Skills
  unstoppableForce: {
    id: 'unstoppableForce',
    name: () => t('Unstoppable Force'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unstoppable-force',
    description: () => t('Massively boosts damage, attack rating, and crit damage.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      attackRatingPercent: scaleDownFlat(level, 3),
      critDamage: Math.min(scaleDownFlat(level, 0.006), 1),
    }),
  },
  unyieldingDefense: {
    id: 'unyieldingDefense',
    name: () => t('Unyielding Defense'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unyielding-defense',
    description: () => t('Temporarily increases armor percent, block chance, and resistance.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 1.5),
      blockChance: Math.min(scaleDownFlat(level, 0.1), 10),
      allResistancePercent: scaleDownFlat(level, 2.5),
    }),
  },

  // Tier 2000 Skills
  bladeStorm: {
    id: 'bladeStorm',
    name: () => t('Blade Storm'),
    type: () => 'instant',
    manaCost: (level) => 30 + level * 0.4,
    cooldown: () => 3500,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blade-storm',
    description: () => t('Spins violently, dealing damage and penetrating armor.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 20, 5, 0.5),
      damagePercent: scaleDownFlat(level, 2),
      armorPenetrationPercent: Math.min(scaleDownFlat(level, 1), 40),
    }),
  },
  ironFortress: {
    id: 'ironFortress',
    name: () => t('Iron Fortress'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'iron-fortress',
    description: () => t('Increases armor, life, and resistance.'),
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
    name: () => t('Titan Strength'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'titan-strength',
    description: () => t('Greatly increases strength and damage.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: scaleUpFlat(level, 6),
      strengthPercent: scaleDownFlat(level, 1.3),
      damagePercent: scaleDownFlat(level, 1.3),
    }),
  },
  heroicStand: {
    id: 'heroicStand',
    name: () => t('Heroic Stand'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 150000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'heroic-stand',
    description: () => t('Greatly boosts armor and life regeneration when near death.'),
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
    name: () => t('Legendary Warlord'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'legendary-warlord',
    description: () => t('Provides crit chance, crit damage, and increased damage.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.1), 20),
      critDamage: scaleDownFlat(level, 0.012),
      damagePercent: scaleDownFlat(level, 2.5),
    }),
  },
  eternalGuardian: {
    id: 'eternalGuardian',
    name: () => t('Eternal Guardian'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.35,
    cooldown: () => 110000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'eternal-guardian',
    description: () => t('Channels protection that reduces enemy attack speed and damage.'),
    maxLevel: () => 350,
    effect: (level) => ({
      reduceEnemyAttackSpeedPercent: Math.min(scaleDownFlat(level, 0.1), 15),
      reduceEnemyDamagePercent: Math.min(scaleDownFlat(level, 0.075), 10),
    }),
  },
};
