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

const DEFAULT_SPECIALIZATIONS = [
  {
    id: 'VANGUARD_OATH',
    icon: () => 'eternal-guardian',
    avatar: () => 'monk-avatar.jpg',
    name: () => t('skillTree.specialization.vanguard.name'),
    description: () => t('skillTree.specialization.vanguard.description'),
    steps: [
      {
        id: 'VANGUARD_STEP_1',
        name: () => t('skillTree.specialization.vanguard.step1.name'),
        description: () => t('skillTree.specialization.vanguard.step1.description'),
        requiredLevel: () => 50,
        cost: () => 10,
        effect: () => ({
          lifePercent: 15,
          armorPercent: 20,
        }),
      },
      {
        id: 'VANGUARD_STEP_2',
        name: () => t('skillTree.specialization.vanguard.step2.name'),
        description: () => t('skillTree.specialization.vanguard.step2.description'),
        requiredLevel: () => 110,
        cost: () => 20,
        effect: () => ({
          lifeRegenPercent: 20,
          blockChance: 5,
        }),
      },
      {
        id: 'VANGUARD_STEP_3',
        name: () => t('skillTree.specialization.vanguard.step3.name'),
        description: () => t('skillTree.specialization.vanguard.step3.description'),
        requiredLevel: () => 170,
        cost: () => 30,
        effect: () => ({
          lifePercent: 20,
          allResistance: 150,
        }),
      },
    ],
  },
  {
    id: 'PREDATOR_PATH',
    icon: () => 'apex-predator',
    avatar: () => 'dwarf-avatar.jpg',
    name: () => t('skillTree.specialization.predator.name'),
    description: () => t('skillTree.specialization.predator.description'),
    steps: [
      {
        id: 'PREDATOR_STEP_1',
        name: () => t('skillTree.specialization.predator.step1.name'),
        description: () => t('skillTree.specialization.predator.step1.description'),
        requiredLevel: () => 50,
        cost: () => 10,
        effect: () => ({
          damagePercent: 15,
          critChance: 5,
        }),
      },
      {
        id: 'PREDATOR_STEP_2',
        name: () => t('skillTree.specialization.predator.step2.name'),
        description: () => t('skillTree.specialization.predator.step2.description'),
        requiredLevel: () => 110,
        cost: () => 20,
        effect: () => ({
          attackSpeedPercent: 10,
          attackRating: 250,
        }),
      },
      {
        id: 'PREDATOR_STEP_3',
        name: () => t('skillTree.specialization.predator.step3.name'),
        description: () => t('skillTree.specialization.predator.step3.description'),
        requiredLevel: () => 170,
        cost: () => 30,
        effect: () => ({
          critDamage: 0.35,
          damagePercent: 10,
        }),
      },
    ],
  },
  {
    id: 'ARCANE_LEGACY',
    icon: () => 'arcane-power',
    avatar: () => 'witch-avatar.jpg',
    name: () => t('skillTree.specialization.arcane.name'),
    description: () => t('skillTree.specialization.arcane.description'),
    steps: [
      {
        id: 'ARCANE_STEP_1',
        name: () => t('skillTree.specialization.arcane.step1.name'),
        description: () => t('skillTree.specialization.arcane.step1.description'),
        requiredLevel: () => 50,
        cost: () => 10,
        effect: () => ({
          manaPercent: 20,
          manaRegen: 2,
        }),
      },
      {
        id: 'ARCANE_STEP_2',
        name: () => t('skillTree.specialization.arcane.step2.name'),
        description: () => t('skillTree.specialization.arcane.step2.description'),
        requiredLevel: () => 110,
        cost: () => 20,
        effect: () => ({
          cooldownReductionPercent: 0.1,
          elementalDamagePercent: 15,
        }),
      },
      {
        id: 'ARCANE_STEP_3',
        name: () => t('skillTree.specialization.arcane.step3.name'),
        description: () => t('skillTree.specialization.arcane.step3.description'),
        requiredLevel: () => 170,
        cost: () => 30,
        effect: () => ({
          manaPercent: 15,
          damagePercent: 10,
        }),
      },
    ],
  },
];

const specializationMap = { DEFAULT: DEFAULT_SPECIALIZATIONS };
Object.keys(CLASS_PATHS).forEach((key) => {
  specializationMap[key] = DEFAULT_SPECIALIZATIONS;
});

export const CLASS_SPECIALIZATIONS = specializationMap;
