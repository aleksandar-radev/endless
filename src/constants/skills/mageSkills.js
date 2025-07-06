import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

// Mage skills
export const MAGE_SKILLS = {
  // Tier 1 Skills
  magicMissile: {
    id: 'magicMissile',
    name: () => 'Magic Missile',
    type: () => 'instant',
    manaCost: (level) => 2 + level * 0.2,
    cooldown: (level) => 2500,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'missile',
    description: () => 'Launches a missile of arcane energy.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 4,
    }),
  },
  arcaneIntellect: {
    id: 'arcaneIntellect',
    name: () => 'Arcane Intellect',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'intellect',
    description: () => 'Increases mana and wisdom.',
    maxLevel: () => 300,
    effect: (level) => ({
      manaPercent: level * 1,
      wisdomPercent: level * 1,
    }),
  },

  // Tier 10 Skills
  frostBolt: {
    id: 'frostBolt',
    name: () => 'Frost Bolt',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.2,
    cooldown: (level) => 3000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'frost-bolt',
    description: () => 'Fires a bolt of frost at the enemy.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: level * 6,
    }),
  },
  fireBlast: {
    id: 'fireBlast',
    name: () => 'Fire Blast',
    type: () => 'instant',
    manaCost: (level) => 4 + level * 0.2,
    cooldown: (level) => 4000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'fire-blast',
    description: () => 'Blasts the target with fire.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: level * 6,
    }),
  },

  // Tier 25 Skills
  teleport: {
    id: 'teleport',
    name: () => 'Teleport',
    type: () => 'instant',
    manaCost: (level) => 15 + level * 1,
    cooldown: (level) => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'teleport',
    description: () => 'Instantly move to a nearby location.',
    maxLevel: () => 100,
    effect: () => ({}) ,
  },
  manaShield: {
    id: 'manaShield',
    name: () => 'Mana Shield',
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.5,
    cooldown: (level) => 20000,
    duration: (level) => 12000 + level * 500,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mana-shield',
    description: () => 'Absorbs damage using mana.',
    maxLevel: () => 200,
    effect: (level) => ({
      armorPercent: level * 4,
    }),
  },

  // Tier 50 Skills
  iceStorm: {
    id: 'iceStorm',
    name: () => 'Ice Storm',
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.6,
    cooldown: (level) => 40000,
    duration: (level) => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'ice-storm',
    description: () => 'Summons a storm of ice around you.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: level * 8,
    }),
  },
  arcaneFocus: {
    id: 'arcaneFocus',
    name: () => 'Arcane Focus',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'focus',
    description: () => 'Improves spell damage and hit rate.',
    maxLevel: () => 500,
    effect: (level) => ({
      damagePercent: level * 1,
      attackRatingPercent: level * 4,
    }),
  },

  // Tier 75 Skills
  pyroclasm: {
    id: 'pyroclasm',
    name: () => 'Pyroclasm',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.6,
    cooldown: (level) => 45000,
    duration: (level) => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pyroclasm',
    description: () => 'Engulfs the area in flames.',
    maxLevel: () => 300,
    effect: (level) => ({
      fireDamagePercent: level * 10,
    }),
  },
  timeWarp: {
    id: 'timeWarp',
    name: () => 'Time Warp',
    type: () => 'buff',
    manaCost: (level) => 25 + level * 0.7,
    cooldown: (level) => 60000,
    duration: (level) => 15000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'time-warp',
    description: () => 'Greatly increases attack speed for a short time.',
    maxLevel: () => 300,
    effect: (level) => ({
      attackSpeedPercent: level * 0.01,
    }),
  },

  // Tier 100 Skills
  arcanePower: {
    id: 'arcanePower',
    name: () => 'Arcane Power',
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 0.3,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'arcane-power',
    description: () => 'Unleash arcane power, increasing spell damage.',
    maxLevel: () => 600,
    effect: (level) => ({
      elementalDamagePercent: level * 3,
    }),
  },
  summonElemental: {
    id: 'summonElemental',
    name: () => 'Summon Elemental',
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.8,
    cooldown: (level) => 80000,
    duration: (level) => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'summon-elemental',
    description: () => 'Summons an elemental ally.',
    maxLevel: () => 500,
    effect: (level) => ({
      fireDamagePercent: level * 2,
      coldDamagePercent: level * 2,
      airDamagePercent: level * 2,
    }),
  },

  // Tier 200 Skills
  archmage: {
    id: 'archmage',
    name: () => 'Archmage',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'archmage',
    description: () => 'Mastery of all magical arts.',
    maxLevel: () => 100,
    effect: (level) => ({
      wisdomPercent: level * 4,
      elementalDamagePercent: level * 2,
      manaPercent: level * 2,
    }),
  },
};
