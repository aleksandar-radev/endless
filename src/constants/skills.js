import { WARRIOR_SKILLS } from '../constants/skills/warriorSkills.js';
import { ROGUE_SKILLS } from '../constants/skills/rogueSkills.js';
import { VAMPIRE_SKILLS } from '../constants/skills/vampireSkills.js';
import { PALADIN_SKILLS } from '../constants/skills/paladinSkills.js';
import { BERSERKER_SKILLS } from '../constants/skills/berserkerSkills.js';
import { ELEMENTALIST_SKILLS } from '../constants/skills/elementalistSkills.js';

export const CLASS_PATHS = {
  WARRIOR: {
    name: () => 'Warrior',
    enabled: () => true,
    avatar: () => 'warrior-avatar.jpg',
    baseStats: () => ({
      strength: 20,
      armor: 20,
      armorPercent: 20,
      lifePercent: 30,
    }),
    description: () => 'A mighty warrior specializing in heavy armor and raw strength',
    requiredLevel: () => 1,
    crystalCost: () => 0,
  },
  ROGUE: {
    name: () => 'Rogue',
    enabled: () => true,
    avatar: () => 'rogue-avatar.jpg',
    baseStats: () => ({
      agility: 20,
      attackRatingPercent: 20,
      critChance: 3,
      damagePercent: 20,
    }),
    description: () => 'Swift and deadly, focusing on critical hits and attack speed',
    requiredLevel: () => 10,
    crystalCost: () => 10,
  },
  VAMPIRE: {
    name: () => 'Vampire',
    enabled: () => true,
    avatar: () => 'vampire-avatar.jpg',
    baseStats: () => ({
      lifeSteal: 1,
      lifePercent: 20,
      attackSpeed: 0.2,
      damagePercent: 10,
    }),
    description: () => 'Master of life-stealing and critical strikes',
    requiredLevel: () => 30,
    crystalCost: () => 25,
  },
  PALADIN: {
    name: () => 'Paladin',
    enabled: () => true,
    avatar: () => 'paladin-avatar.jpg',
    baseStats: () => ({
      blockChance: 5,
      armorPercent: 40,
      vitality: 40,
      lifePercent: 20,
    }),
    description: () => 'Holy warrior specializing in defense and vitality',
    requiredLevel: () => 50,
    crystalCost: () => 30,
  },
  BERSERKER: {
    name: () => 'Berserker',
    enabled: () => true,
    avatar: () => 'berserker-avatar.jpg',
    baseStats: () => ({
      damage: 10,
      attackSpeed: 0.2,
      damagePercent: 30,
      lifePercent: -20,
    }),
    description: () => 'Frenzied fighter focusing on raw damage output',
    requiredLevel: () => 88,
    crystalCost: () => 60,
  },
  ELEMENTALIST: {
    name: () => 'Elementalist',
    enabled: () => true,
    avatar: () => 'elementalist-avatar.jpg',
    baseStats: () => ({
      fireDamage: 30,
      airDamage: 30,
      coldDamage: 30,
      earthDamage: 30,
      elementalDamagePercent: 30,
    }),
    description: () => 'Master of elemental damage types',
    requiredLevel: () => 110,
    crystalCost: () => 75,
  },
};

export const SKILL_TREES = {
  WARRIOR: WARRIOR_SKILLS,

  ROGUE: ROGUE_SKILLS,

  VAMPIRE: VAMPIRE_SKILLS,

  PALADIN: PALADIN_SKILLS,

  BERSERKER: BERSERKER_SKILLS,

  ELEMENTALIST: ELEMENTALIST_SKILLS,
};
