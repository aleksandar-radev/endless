import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat } from '../../common.js';

// Mage skills
export const MAGE_SKILLS = {
  // Tier 1 Skills
  magicMissile: {
    id: 'magicMissile',
    name: () => 'Magic Missile',
    type: () => 'instant',
    manaCost: (level) => 2 + level * 0.2,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'missile',
    description: () => 'Launches a missile of arcane energy.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: level * 3,
      waterDamagePercent: 5 * scaleDownFlat(level),
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
      manaPercent: 3 * scaleDownFlat(level),
      wisdom: level * 3,
      wisdomPercent: 1 * scaleDownFlat(level),
      perseverance: level * 2,
      perseverancePercent: 1 * scaleDownFlat(level),
    }),
  },

  // Tier 10 Skills
  frostBolt: {
    id: 'frostBolt',
    name: () => 'Frost Bolt',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 0.2,
    cooldown: () => 5700,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'frost-bolt',
    description: () => 'Fires a bolt of frost at the enemy.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamage: level * 2,
      coldDamagePercent: 6 * scaleDownFlat(level),
    }),
  },
  fireBlast: {
    id: 'fireBlast',
    name: () => 'Fire Blast',
    type: () => 'instant',
    manaCost: (level) => 4 + level * 0.2,
    cooldown: () => 7600,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'fire-blast',
    description: () => 'Blasts the target with fire.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: 5 * scaleDownFlat(level),
      fireDamage: level * 6,
    }),
  },

  // Tier 25 Skills
  mindControl: {
    id: 'mindControl',
    name: () => 'Mind Control',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mind-control',
    description: () => 'Instantly move to a nearby location.',
    maxLevel: () => 100,
    effect: (level) => ({
      perseverance: level * 4,
      wisdom: level * 8,
      intelligence: level * 2,
      intelligencePercent: 0.75 * scaleDownFlat(level),
    }),
  },
  manaShield: {
    id: 'manaShield',
    name: () => 'Mana Shield',
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.5,
    cooldown: () => 30000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mana-shield',
    description: () => 'Absorbs damage using mana.',
    maxLevel: () => 200,
    effect: (level) => ({
      manaShieldPercent: 0.5 * scaleDownFlat(level),
    }),
  },

  // Tier 50 Skills
  resourceInfusion: {
    id: 'resourceInfusion',
    name: () => 'Resource Infusion',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'resource-infusion',
    description: () => 'Infuses yourself with magical energy. Greatly increases mana regeneration.',
    maxLevel: () => 1000,
    effect: (level) => ({
      mana: level * 25,
      manaRegenOfTotalPercent: 0.025 * scaleDownFlat(level),
      extraDamageFromManaPercent: Math.min(0.012 * scaleDownFlat(level), 2),
    }),
  },
  iceStorm: {
    id: 'iceStorm',
    name: () => 'Ice Storm',
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.6,
    cooldown: () => 64000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'ice-storm',
    description: () => 'Summons a storm of ice around you.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: 5 * scaleDownFlat(level),
      waterDamagePercent: 3 * scaleDownFlat(level),
      airDamagePercent: 3 * scaleDownFlat(level),
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
      elementalDamagePercent: 0.75 * scaleDownFlat(level),
      attackRating: level * 5,
      attackRatingPercent: 5 * scaleDownFlat(level),
    }),
  },

  // Tier 75 Skills
  pyroclasm: {
    id: 'pyroclasm',
    name: () => 'Pyroclasm',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.6,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pyroclasm',
    description: () => 'Engulfs the area in flames.',
    maxLevel: () => 300,
    effect: (level) => ({
      fireDamage: level * 2,
      fireDamagePercent: 8 * scaleDownFlat(level),
    }),
  },
  timeWarp: {
    id: 'timeWarp',
    name: () => 'Time Warp',
    type: () => 'buff',
    manaCost: (level) => 25 + level * 0.7,
    cooldown: () => 96000,
    duration: () => 15000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'time-warp',
    description: () => 'Greatly increases attack speed for a short time.',
    maxLevel: () => 300,
    effect: (level) => ({
      attackSpeed: 0.04 * scaleDownFlat(level),
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
      elementalDamagePercent: 2 * scaleDownFlat(level, 1, 10, 100, 0.2),
    }),
  },
  summonElemental: {
    id: 'summonElemental',
    name: () => 'Summon Elemental',
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(0.8 * scaleDownFlat(level), 100),
        damage: level * 8,
        attackSpeed: 1.3,
        fireDamage: level * 22,
        airDamage: level * 22,
        coldDamage: level * 22,
      };
    },
    manaCost: (level) => 30 + level * 0.8,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'summon-elemental',
    description: () => 'Summons an elemental ally.',
    maxLevel: () => 500,
    effect: (level) => ({
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
      wisdom: level * 5,
      wisdomPercent: 4 * scaleDownFlat(level),
      elementalDamagePercent: 1.5 * scaleDownFlat(level),
      manaPercent: 3 * scaleDownFlat(level),
    }),
  },

  // Tier 1200 Skills
  arcaneMight: {
    id: 'arcaneMight',
    name: () => 'Arcane Might',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'arcane-might',
    description: () => 'Greatly increases magical potency.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: 2 * scaleDownFlat(level),
      manaRegenPercent: 1.5 * scaleDownFlat(level),
      manaPercent: 2 * scaleDownFlat(level),
    }),
  },
  voidBlast: {
    id: 'voidBlast',
    name: () => 'Void Blast',
    type: () => 'instant',
    manaCost: (level) => 25 + level,
    cooldown: () => 100000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'void-blast',
    description: () => 'Unleashes unstable void energy.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 15,
      elementalPenetrationPercent: 3 * scaleDownFlat(level),
    }),
  },

  // Tier 2000 Skills
  chronomancerSurge: {
    id: 'chronomancerSurge',
    name: () => 'Chronomancer Surge',
    type: () => 'buff',
    manaCost: (level) => 35 + level,
    cooldown: () => 120000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'chronomancer-surge',
    description: () => 'Manipulate time to act faster.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeed: 0.02 * scaleDownFlat(level),
      cooldownReductionPercent: level * 0.1,
    }),
  },
  starFire: {
    id: 'starFire',
    name: () => 'Star Fire',
    type: () => 'instant',
    manaCost: (level) => 30 + level,
    cooldown: () => 130000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'star-fire',
    description: () => 'Calls down stellar flames on enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: 4 * scaleDownFlat(level),
      airDamagePercent: 3 * scaleDownFlat(level),
      damage: level * 18,
    }),
  },


  // Tier 3000 Skills
  manaOverflow: {
    id: 'manaOverflow',
    name: () => 'Mana Overflow',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'mana-overflow',
    description: () => 'Your mana reserves overflow with power.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: level * 10,
      manaPercent: 3 * scaleDownFlat(level),
      elementalDamagePercent: 2 * scaleDownFlat(level),
    }),
  },
  dimensionalRift: {
    id: 'dimensionalRift',
    name: () => 'Dimensional Rift',
    type: () => 'instant',
    manaCost: (level) => 45 + level,
    cooldown: () => 160000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'dimensional-rift',
    description: () => 'Tear open a rift dealing massive damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 25,
      lightningDamagePercent: 5 * scaleDownFlat(level),
      ignoreAllEnemyResistances: 1,
    }),
  },

  // Tier 5000 Skills
  supremeSorcery: {
    id: 'supremeSorcery',
    name: () => 'Supreme Sorcery',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'supreme-sorcery',
    description: () => 'Unmatched arcane knowledge and power.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: 1.5 * scaleDownFlat(level),
      manaPercent: 3 * scaleDownFlat(level),
      wisdomPercent: 3 * scaleDownFlat(level),
    }),
  },
  apocalypse: {
    id: 'apocalypse',
    name: () => 'Apocalypse',
    type: () => 'instant',
    manaCost: (level) => 60 + level,
    cooldown: () => 200000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apocalypse',
    description: () => 'Release a devastating wave of destruction.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: 6 * scaleDownFlat(level),
      coldDamagePercent: 6 * scaleDownFlat(level),
      lightningDamagePercent: 6 * scaleDownFlat(level),
      damage: level * 30,
    }),
  },
};
