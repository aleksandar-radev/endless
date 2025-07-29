import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat } from '../../common.js';

// Paladin skills extracted from skills.js
export const PALADIN_SKILLS = {
  // Tier 1 Skills
  holyLight: {
    id: 'holyLight',
    name: () => 'Holy Light',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.2,
    cooldown: () => 6000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'light',
    description: () => 'A burst of holy light that heals allies and damages enemies. (max 5% of max life)',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: level * 5,
      lifePercent: Math.min(scaleDownFlat(level) * 0.1, 5),
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
      damage: level * 1,
      damagePercent: scaleDownFlat(level),
      fireDamagePercent: 2 * scaleDownFlat(level),
    }),
  },
  shieldBash: {
    id: 'shieldBash',
    name: () => 'Shield Bash',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.1,
    cooldown: () => 4500,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bash',
    description: () => 'Bashes an enemy with your shield, stunning them.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 2,
      damagePercent: 3 * scaleDownFlat(level),
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
      armorPercent: 2 * scaleDownFlat(level),
      thornsDamage: level * 1,
      thornsDamagePercent: 0.5 * scaleDownFlat(level),
    }),
  },

  // Tier 10 Skills
  consecration: {
    id: 'consecration',
    name: () => 'Consecration',
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.6,
    cooldown: () => 70000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'consecration',
    description: () => 'Blesses the ground, dealing holy damage to enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: 4 * scaleDownFlat(level),
      coldDamagePercent: 4 * scaleDownFlat(level),
      lightningDamagePercent: 4 * scaleDownFlat(level),
    }),
  },
  greaterHealing: {
    id: 'greaterHealing',
    name: () => 'Greater Healing',
    type: () => 'instant',
    manaCost: (level) => 8 + level * 0.3,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'heal',
    description: () => 'Heals a large amount of life instantly.',
    maxLevel: () => Infinity,
    effect: (level) => ({
      life: level * 8,
      lifePercent: Math.min(scaleDownFlat(level) * 0.25, 20),
    }),
  },

  // Tier 25 Skills
  divineShield: {
    id: 'divineShield',
    name: () => 'Divine Shield',
    type: () => 'buff',
    manaCost: (level) => 13 + level * 0.5,
    cooldown: () => 47000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-shield',
    description: () => 'Creates a shield that absorbs damage.',
    maxLevel: () => 200,
    effect: (level) => ({
      armor: level * 4,
      armorPercent: 6 * scaleDownFlat(level),
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
      life: level * 5,
      lifePercent: 0.6 * scaleDownFlat(level),
      armorPercent: scaleDownFlat(level),
      allResistance: Math.min(level * 0.25, 30),
    }),
  },

  // Tier 50 Skills
  wrathOfTheHeavens: {
    id: 'wrathOfTheHeavens',
    name: () => 'Wrath of the Heavens',
    type: () => 'instant',
    manaCost: (level) => 10 + level * 0.8,
    cooldown: () => 12400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'wrath',
    description: () => 'Calls down holy energy to smite enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: 2 * scaleDownFlat(level),
      lightningDamage: level * 8,
      lightningDamagePercent: 5 * scaleDownFlat(level),
      airDamagePercent: 3 * scaleDownFlat(level),
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
      lifeRegen: level * 1,
      lifeRegenPercent: 0.5 * scaleDownFlat(level),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level) * 0.1, 1),
    }),
  },

  // Tier 75 Skills
  holyBarrier: {
    id: 'holyBarrier',
    name: () => 'Holy Barrier',
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.7,
    cooldown: () => 44000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'barrier',
    description: () => 'Creates a holy barrier that increases all healing effects.',
    maxLevel: () => 500,
    effect: (level) => ({
      vitality: level * 3,
      vitalityPercent: 0.5 * scaleDownFlat(level),
      resurrectionChance: level * 0.1,
    }),
  },

  // Tier 100 Skills
  divineWrath: {
    id: 'divineWrath',
    name: () => 'Divine Wrath',
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.3,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath',
    description: () => 'Unleashes divine energy to increase damage and healing.',
    maxLevel: () => 400,
    effect: (level) => ({
      damagePercent: 2 * scaleDownFlat(level),
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
      lifeRegen: level * 2,
      lifeRegenPercent: 0.5 * scaleDownFlat(level),
      manaRegen: level * 0.5,
      manaRegenPercent: scaleDownFlat(level),
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
      elementalDamagePercent: 0.75 * scaleDownFlat(level),
      endurance: level * 3,
      endurancePercent: 2 * scaleDownFlat(level),
      vitality: level * 3,
      vitalityPercent: 2 * scaleDownFlat(level),
      attackRatingPercent: 6 * scaleDownFlat(level),
    }),
  },
};
