import { WARRIOR_SKILLS } from '../constants/skills/warriorSkills.js';
import { ROGUE_SKILLS } from '../constants/skills/rogueSkills.js';
import { VAMPIRE_SKILLS } from '../constants/skills/vampireSkills.js';
import { PALADIN_SKILLS } from '../constants/skills/paladinSkills.js';
import { BERSERKER_SKILLS } from '../constants/skills/berserkerSkills.js';
import { ELEMENTALIST_SKILLS } from '../constants/skills/elementalistSkills.js';
import { DRUID_SKILLS } from '../constants/skills/druidSkills.js';
import { MAGE_SKILLS } from '../constants/skills/mageSkills.js';

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
    requiredLevel: () => 0,
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
    requiredLevel: () => 0,
    crystalCost: () => 0,
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
    requiredLevel: () => 0,
    crystalCost: () => 0,
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
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  BERSERKER: {
    name: () => 'Berserker',
    enabled: () => true,
    avatar: () => 'berserker-avatar.jpg',
    baseStats: () => ({
      damage: 20,
      attackSpeed: 0.2,
      damagePercent: 30,
      lifePercent: -20,
    }),
    description: () => 'Frenzied fighter focusing on raw damage output',
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  ELEMENTALIST: {
    name: () => 'Elementalist',
    enabled: () => true,
    avatar: () => 'elementalist-avatar.jpg',
    baseStats: () => ({
      elementalDamage: 8,
      intelligencePercent: 10,
      elementalDamagePercent: 25,
    }),
    description: () => 'Master of elemental damage types',
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  DRUID: {
    name: () => 'Druid',
    enabled: () => true,
    avatar: () => 'druid-avatar.jpg',
    baseStats: () => ({
      lifeRegen: 5,
      lifeRegenPercent: 20,
      lifePercent: 20,
      coldDamagePercent: 30,
      earthDamagePercent: 30,
      waterDamagePercent: 30,
    }),
    description: () => 'Wielder of nature magic and animal allies',
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  MAGE: {
    name: () => 'Mage',
    enabled: () => true,
    avatar: () => 'mage-avatar.jpg',
    baseStats: () => ({
      manaPercent: 50,
      manaRegen: 2,
      elementalDamagePercent: 25,
      wisdom: 40,
    }),
    description: () => 'Master of arcane spells and destructive magic',
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
};

export const SKILL_TREES = {
  WARRIOR: WARRIOR_SKILLS,

  ROGUE: ROGUE_SKILLS,

  VAMPIRE: VAMPIRE_SKILLS,

  PALADIN: PALADIN_SKILLS,

  BERSERKER: BERSERKER_SKILLS,

  ELEMENTALIST: ELEMENTALIST_SKILLS,

  DRUID: DRUID_SKILLS,

  MAGE: MAGE_SKILLS,
};
