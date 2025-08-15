import { WARRIOR_SKILLS } from '../constants/skills/warriorSkills.js';
import { ROGUE_SKILLS } from '../constants/skills/rogueSkills.js';
import { VAMPIRE_SKILLS } from '../constants/skills/vampireSkills.js';
import { PALADIN_SKILLS } from '../constants/skills/paladinSkills.js';
import { BERSERKER_SKILLS } from '../constants/skills/berserkerSkills.js';
import { ELEMENTALIST_SKILLS } from '../constants/skills/elementalistSkills.js';
import { DRUID_SKILLS } from '../constants/skills/druidSkills.js';
import { MAGE_SKILLS } from '../constants/skills/mageSkills.js';
import { t } from '../i18n.js';

export const CLASS_PATHS = {
  WARRIOR: {
    name: () => t('class.warrior'),
    enabled: () => true,
    avatar: () => 'warrior-avatar.jpg',
    baseStats: () => ({
      strength: 20,
      damagePerLevel: 0.5,
      armorPercent: 20,
      lifePercent: 30,
    }),
    description: () => t('class.warriorDesc'),
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  ROGUE: {
    name: () => t('class.rogue'),
    enabled: () => true,
    avatar: () => 'rogue-avatar.jpg',
    baseStats: () => ({
      agility: 20,
      attackRatingPercent: 20,
      critChance: 3,
      damagePercent: 20,
    }),
    description: () => t('class.rogueDesc'),
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  VAMPIRE: {
    name: () => t('class.vampire'),
    enabled: () => true,
    avatar: () => 'vampire-avatar.jpg',
    baseStats: () => ({
      lifeSteal: 1,
      lifePercent: 20,
      attackSpeed: 0.2,
      damagePercent: 10,
    }),
    description: () => t('class.vampireDesc'),
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  PALADIN: {
    name: () => t('class.paladin'),
    enabled: () => true,
    avatar: () => 'paladin-avatar.jpg',
    baseStats: () => ({
      blockChance: 5,
      armorPercent: 40,
      vitality: 40,
      lifePercent: 20,
    }),
    description: () => t('class.paladinDesc'),
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  BERSERKER: {
    name: () => t('class.berserker'),
    enabled: () => true,
    avatar: () => 'berserker-avatar.jpg',
    baseStats: () => ({
      damage: 20,
      attackSpeed: 0.2,
      damagePercent: 30,
      lifePercent: -20,
    }),
    description: () => t('class.berserkerDesc'),
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  ELEMENTALIST: {
    name: () => t('class.elementalist'),
    enabled: () => true,
    avatar: () => 'elementalist-avatar.jpg',
    baseStats: () => ({
      elementalDamage: 3,
      intelligencePercent: 15,
      elementalDamagePercent: 25,
    }),
    description: () => t('class.elementalistDesc'),
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  DRUID: {
    name: () => t('class.druid'),
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
    description: () => t('class.druidDesc'),
    requiredLevel: () => 0,
    crystalCost: () => 0,
  },
  MAGE: {
    name: () => t('class.mage'),
    enabled: () => true,
    avatar: () => 'mage-avatar.jpg',
    baseStats: () => ({
      manaPercent: 50,
      manaRegen: 2,
      elementalDamagePercent: 25,
      wisdom: 40,
      manaPerLevel: 0.5,
    }),
    description: () => t('class.mageDesc'),
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
