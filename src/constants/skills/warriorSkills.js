import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

// Warrior skills extracted from skills.js
export const WARRIOR_SKILLS = {
  // Tier 0 Skills
  bash: {
    id: 'bash',
    name: () => 'Bash',
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.2,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'war-axe',
    description: () => 'While active, increases damage but costs mana per attack',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 3,
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
      armorPercent: level * 8,
    }),
  },

  // Tier 1 Skills
  powerStrike: {
    id: 'powerStrike',
    name: () => 'Power Strike',
    type: () => 'instant',
    manaCost: (level) => 4 + level * 0.2,
    cooldown: (level) => 2500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'sword',
    description: () => 'A powerful strike that deals increased damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 8,
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
      vitalityPercent: level * 3,
      lifeRegenPercent: level * 0.33,
    }),
  },

  // Tier 2 Skills
  battleCry: {
    id: 'battleCry',
    name: () => 'Battle Cry',
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.4,
    cooldown: (level) => 60000,
    duration: (level) => 45000 + level * 500,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'cry',
    description: () => 'Temporarily increases damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 5,
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
      lifeRegenPercent: level * 2,
    }),
  },

  // Tier 3 Skills
  groundSlam: {
    id: 'groundSlam',
    name: () => 'Ground Slam',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.5,
    cooldown: (level) => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'slam',
    description: () => 'Deals instant damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 18,
    }),
  },

  // Tier 4 Skills
  shieldWall: {
    id: 'shieldWall',
    name: () => 'Shield Wall',
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.5,
    cooldown: (level) => 20000,
    duration: (level) => 16000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'wall',
    description: () => 'Increases armor and block chance temporarily',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: level * 50,
      blockChancePercent: level * 0.1,
    }),
  },

  // Tier 5 Skills
  berserk: {
    id: 'berserk',
    name: () => 'Berserk',
    type: () => 'toggle',
    manaCost: (level) => 3 + level * 0.3,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'berserk',
    description: () => 'Gives huge amounts of physical and fire damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 5,
      fireDamagePercent: level * 25,
    }),
  },

  lastStand: {
    id: 'lastStand',
    name: () => 'Last Stand',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'last-stand',
    description: () => 'Greatly increases offensive stats',
    maxLevel: () => 100,
    effect: (level) => ({
      damagePercent: level * 1,
      lifeStealPercent: level * 0.01,
      attackSpeedPercent: level * 0.01,
      attackRatingPercent: level * 50,
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
      lifePercent: level * 0.3,
      damagePercent: level * 0.3,
      strengthPercent: level * 5,
      vitalityPercent: level * 5,
      agilityPercent: level * 5,
      wisdomPercent: level * 2,
      endurancePercent: level * 5,
    }),
  },
};
