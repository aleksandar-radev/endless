import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

// Berserker skills extracted from skills.js
export const BERSERKER_SKILLS = {
  // Tier 1 Skills
  frenzy: {
    id: 'frenzy',
    name: () => 'Frenzy',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frenzy',
    description: () => 'Increases attack speed and damage while active.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 5,
      lifePerHitPercent: level * -1,
    }),
  },
  toughSkin: {
    id: 'toughSkin',
    name: () => 'Tough Skin',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'tough-skin',
    description: () => 'Increases armor and reduces damage taken.',
    maxLevel: () => 200,
    effect: (level) => ({
      armorPercent: level * 8.5,
    }),
  },

  // Tier 10 Skills
  recklessSwing: {
    id: 'recklessSwing',
    name: () => 'Reckless Swing',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.2,
    cooldown: (level) => 2000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'swing',
    description: () => 'A powerful strike that sacrifices life for damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 30,
      lifePerHitPercent: level * -5,
    }),
  },
  battleCry: {
    id: 'battleCry',
    name: () => 'Battle Cry',
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.5,
    cooldown: (level) => 12000,
    duration: (level) => 6000 + level * 500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'battle-cry',
    description: () => 'Boosts damage and attack speed temporarily.',
    maxLevel: () => 100,
    effect: (level) => ({
      damagePercent: level * 0.5,
      attackSpeedPercent: level * 0.5,
      lifeStealPercent: level * 0.01,
    }),
  },

  // Tier 25 Skills
  berserkersRage: {
    id: 'berserkersRage',
    name: () => 'Berserker\'s Rage',
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'berserker-rage',
    description: () => 'Greatly increases damage but lowers defense.',
    maxLevel: () => 200,
    effect: (level) => ({
      fireDamagePercent: level * 5,
      airDamagePercent: level * 5,
      doubleDamageChance: level * 0.2,
    }),
  },
  greaterFrenzy: {
    id: 'greaterFrenzy',
    name: () => 'Greater Frenzy',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'greater-rage',
    description: () => 'Further enhances attack speed and damage.',
    maxLevel: () => 100,
    effect: (level) => ({
      attackSpeedPercent: level * 1,
      lifePerHitPercent: level * 0.5,
    }),
  },

  // Tier 50 Skills
  earthquake: {
    id: 'earthquake',
    name: () => 'Earthquake',
    type: () => 'instant',
    manaCost: (level) => 7 + level * 0.3,
    cooldown: (level) => 5500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'earthquake',
    description: () => 'Smashes the ground, dealing earth damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 15,
      earthDamagePercent: level * 30,
    }),
  },
  rageMastery: {
    id: 'rageMastery',
    name: () => 'Rage Mastery',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'mastery',
    description: () => 'Increases critical chance and critical damage.',
    maxLevel: () => 100,
    effect: (level) => ({
      critChancePercent: level * 0.05,
      critDamagePercent: level * 0.01,
      doubleDamageChance: level * 0.1,
      attackRatingPercent: level * 100,
      lifePercent: level * -1,
    }),
  },

  // Tier 75 Skills
  bloodLust: {
    id: 'bloodLust',
    name: () => 'Blood Lust',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.25,
    cooldown: (level) => 60000,
    duration: (level) => 10000 + level * 140,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'bloodlust',
    description: () => 'Increases attack speed and life steal temporarily.',
    maxLevel: () => 250,
    effect: (level) => ({
      attackSpeedPercent: level * 0.5,
      lifeStealPercent: level * 0.01,
      lifePercent: level * 0.2,
    }),
  },

  // Tier 100 Skills
  unbridledFury: {
    id: 'unbridledFury',
    name: () => 'Unbridled Fury',
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'fury',
    description: () => 'Increases damage and restores resources.',
    maxLevel: () => 400,
    effect: (level) => ({
      damagePercent: level * 4,
      manaPerHitPercent: level * 0.1,
      lifePerHitPercent: level * 1,
    }),
  },
  undyingRage: {
    id: 'undyingRage',
    name: () => 'Undying Rage',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'undying',
    description: () => 'Provides a chance to survive fatal damage.',
    maxLevel: () => 500,
    effect: (level) => ({
      resurrectionChance: level * 0.1,
      lifeRegenPercent: level * 1,
      armorPercent: level * 5,
    }),
  },

  // Tier 200 Skills
  warlord: {
    id: 'warlord',
    name: () => 'Warlord',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => 'Significantly increases all combat stats.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: level * 7,
      critChancePercent: level * 0.05,
      attackSpeedPercent: level * 0.4,
      damagePercent: level * 2,
    }),
  },
};
