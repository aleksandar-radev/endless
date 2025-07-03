import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

// Paladin skills extracted from skills.js
export const PALADIN_SKILLS = {
  // Tier 1 Skills
  holyLight: {
    id: 'holyLight',
    name: () => 'Holy Light',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.2,
    cooldown: (level) => 3000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'light',
    description: () => 'A burst of holy light that heals allies and damages enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: level * 5,
      lifePercent: level * 2,
    }),
  },
  smite: {
    id: 'smite',
    name: () => 'Smite',
    type: () => 'toggle',
    manaCost: (level) => 1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'smite',
    description: () => 'A powerful strike that deals holy damage to enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 1,
      fireDamagePercent: level * 2,
    }),
  },
  shieldBash: {
    id: 'shieldBash',
    name: () => 'Shield Bash',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.1,
    cooldown: (level) => 2000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bash',
    description: () => 'Bashes an enemy with your shield, stunning them.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 5,
    }),
  },
  divineProtection: {
    id: 'divineProtection',
    name: () => 'Divine Protection',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'protection',
    description: () => 'Greatly increases armor and block chance.',
    maxLevel: () => 200,
    effect: (level) => ({
      armorPercent: level * 3,
      blockChance: level * 0.1,
      thornsDamage: level * 0.5,
      thornsDamagePercent: level * 1,
    }),
  },

  // Tier 10 Skills
  consecration: {
    id: 'consecration',
    name: () => 'Consecration',
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.6,
    cooldown: (level) => 50000,
    duration: (level) => 60000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'consecration',
    description: () => 'Blesses the ground, dealing holy damage to enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: level * 6,
      coldDamagePercent: level * 6,
    }),
  },
  greaterHealing: {
    id: 'greaterHealing',
    name: () => 'Greater Healing',
    type: () => 'instant',
    manaCost: (level) => 8 + level * 0.3,
    cooldown: (level) => 10000 + level * 100,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'heal',
    description: () => 'Heals a large amount of life instantly.',
    maxLevel: () => 200,
    effect: (level) => ({
      lifePercent: level * 0.25,
    }),
  },

  // Tier 25 Skills
  divineShield: {
    id: 'divineShield',
    name: () => 'Divine Shield',
    type: () => 'buff',
    manaCost: (level) => 13 + level * 0.5,
    cooldown: (level) => 15000,
    duration: (level) => 10000 + level * 1000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-shield',
    description: () => 'Creates a shield that absorbs damage.',
    maxLevel: () => 200,
    effect: (level) => ({
      armorPercent: level * 6,
      endurancePercent: level * 1,
      blockChance: level * 0.2,
    }),
  },
  auraOfLight: {
    id: 'auraOfLight',
    name: () => 'Aura of Light',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-aura',
    description: () => 'Increases healing effects and reduces damage taken.',
    maxLevel: () => 500,
    effect: (level) => ({
      lifePercent: level * 0.4,
      armorPercent: level * 1,
    }),
  },

  // Tier 50 Skills
  wrathOfTheHeavens: {
    id: 'wrathOfTheHeavens',
    name: () => 'Wrath of the Heavens',
    type: () => 'instant',
    manaCost: (level) => 10 + level * 0.8,
    cooldown: (level) => Math.max(6000 - level * 100, 1000),
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'wrath',
    description: () => 'Calls down holy energy to smite enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 5,
      fireDamagePercent: level * 10,
      airDamagePercent: level * 10,
    }),
  },
  beaconOfFaith: {
    id: 'beaconOfFaith',
    name: () => 'Beacon of Faith',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'beacon',
    description: () => 'Increases healing done.',
    maxLevel: () => 500,
    effect: (level) => ({
      lifeRegen: level * 0.5,
      lifeRegenPercent: level * 0.2,
    }),
  },

  // Tier 75 Skills
  holyBarrier: {
    id: 'holyBarrier',
    name: () => 'Holy Barrier',
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.7,
    cooldown: (level) => 20000,
    duration: (level) => 80000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'barrier',
    description: () => 'Creates a holy barrier that increases all healing effects.',
    maxLevel: () => 500,
    effect: (level) => ({
      vitality: level * 3,
      vitalityPercent: level * 0.5,
      resurrectionChance: level * 0.1,
    }),
  },

  // Tier 100 Skills
  divineWrath: {
    id: 'divineWrath',
    name: () => 'Divine Wrath',
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.5,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath',
    description: () => 'Unleashes divine energy to increase damage and healing.',
    maxLevel: () => 400,
    effect: (level) => ({
      damagePercent: level * 3,
      lifePerHit: level * 2,
    }),
  },
  guardianAngel: {
    id: 'guardianAngel',
    name: () => 'Guardian Angel',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'angel',
    description: () => 'Provides a chance to resurrect with maximum life upon death',
    maxLevel: () => 400,
    effect: (level) => ({
      resurrectionChance: level * 0.1,
      lifeRegenPercent: level * 0.25,
      manaRegenPercent: level * 0.05,
    }),
  },

  // Tier 200 Skills
  ascension: {
    id: 'ascension',
    name: () => 'Ascension',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'ascension',
    description: () => 'Grants significant bonuses to all attributes.',
    maxLevel: () => 400,
    effect: (level) => ({
      damagePercent: level * 1,
      endurancePercent: level * 1,
      vitalityPercent: level * 1,
      attackRatingPercent: level * 25,
    }),
  },
};
