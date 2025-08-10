import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Berserker skills extracted from skills.js
export const BERSERKER_SKILLS = {
  // Tier 1 Skills
  frenzy: {
    id: 'frenzy',
    name: () => 'Frenzy',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frenzy',
    description: () => 'Increases attack speed and damage while active.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 2),
      damagePercent: scaleDownFlat(level, 2),
      lifePerHit: scaleUpFlat(level, -0.4),
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
      armor: scaleUpFlat(level, 4),
      armorPercent: scaleDownFlat(level, 2),
    }),
  },

  // Tier 10 Skills
  recklessSwing: {
    id: 'recklessSwing',
    name: () => 'Reckless Swing',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'swing',
    description: () => 'A powerful strike that sacrifices life for damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 3),
      damagePercent: scaleDownFlat(level, 4),
      lifePerHit: scaleUpFlat(level, -1),
    }),
  },
  battleCry: {
    id: 'battleCry',
    name: () => 'Battle Cry',
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.625,
    cooldown: () => 24400,
    duration: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'battle-cry',
    description: () => 'Boosts damage and attack speed temporarily.',
    maxLevel: () => 100,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 0.5),
      attackSpeed: Math.min(scaleDownFlat(level, 0.005), 1.5),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 4),
    }),
  },

  // Tier 25 Skills
  berserkersRage: {
    id: 'berserkersRage',
    name: () => 'Berserker\'s Rage',
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'berserker-rage',
    description: () => 'Greatly increases damage but lowers defense.',
    maxLevel: () => 200,
    effect: (level) => ({
      fireDamagePercent: scaleDownFlat(level, 3),
      airDamagePercent: scaleDownFlat(level, 3),
      doubleDamageChance: Math.min(scaleDownFlat(level, 0.2), 20),
    }),
  },
  greaterFrenzy: {
    id: 'greaterFrenzy',
    name: () => 'Greater Frenzy',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'greater-rage',
    description: () => 'Further enhances attack speed and damage.',
    maxLevel: () => 300,
    effect: (level) => ({
      attackSpeed: Math.min(scaleDownFlat(level, 0.0075), 1.5),
      lifePerHit: scaleUpFlat(level, 0.75),
    }),
  },

  // Tier 50 Skills
  earthquake: {
    id: 'earthquake',
    name: () => 'Earthquake',
    type: () => 'instant',
    manaCost: (level) => 7 + level * 0.375,
    cooldown: () => 9900,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'earthquake',
    description: () => 'Smashes the ground, dealing earth damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 5),
      earthDamagePercent: scaleDownFlat(level, 10),
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
      critChance: Math.min(scaleDownFlat(level, 0.05), 20),
      critDamage: Math.min(scaleDownFlat(level, 0.005), 3),
      doubleDamageChance: Math.min(scaleDownFlat(level, 0.1), 20),
      attackRatingPercent: scaleDownFlat(level, 5),
      lifePercent: -scaleDownFlat(level, 0.15),
    }),
  },

  // Tier 75 Skills
  bloodLust: {
    id: 'bloodLust',
    name: () => 'Blood Lust',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.313,
    cooldown: () => 76000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'bloodlust',
    description: () => 'Increases attack speed and life steal temporarily.',
    maxLevel: () => 250,
    effect: (level) => ({
      attackSpeed: Math.min(scaleDownFlat(level, 0.002), 1.5),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 4),
      lifePercent: scaleDownFlat(level, 0.25),
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
      damagePercent: scaleDownFlat(level, 2),
      manaPerHit: scaleUpFlat(level, 0.1),
      lifePerHit: scaleUpFlat(level, 1),
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
      resurrectionChance: Math.min(scaleDownFlat(level, 0.1), 50),
      lifeRegen: scaleUpFlat(level, 1),
      lifeRegenPercent: scaleDownFlat(level, 0.75),
      armorPercent: scaleDownFlat(level, 3),
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
      strengthPercent: scaleDownFlat(level, 2.5),
      critChance: Math.min(scaleDownFlat(level, 0.05), 20),
      attackSpeed: Math.min(scaleDownFlat(level, 0.002), 1.5),
      damagePercent: scaleDownFlat(level),
    }),
  },

  // Tier 1200 Skills
  rageOverflow: {
    id: 'rageOverflow',
    name: () => 'Rage Overflow',
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'rage-overflow',
    description: () => 'Unleash uncontrolled rage to boost power.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      lifeSteal: Math.min(scaleDownFlat(level, 0.02), 10),
    }),
  },
  crushingBlows: {
    id: 'crushingBlows',
    name: () => 'Crushing Blows',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'crushing-blows',
    description: () => 'Increases critical damage and armor penetration.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(scaleDownFlat(level, 0.02), 3),
      armorPenetrationPercent: scaleDownFlat(level, 2),
      damage: scaleUpFlat(level, 3),
    }),
  },

  // Tier 2000 Skills
  bloodFrenzy: {
    id: 'bloodFrenzy',
    name: () => 'Blood Frenzy',
    type: () => 'buff',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 110000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blood-frenzy',
    description: () => 'Enter a frenzy that greatly increases attack speed.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeed: Math.min(scaleDownFlat(level, 0.02), 3),
      damagePercent: scaleDownFlat(level, 2),
      lifePerHit: scaleUpFlat(level, 2),
    }),
  },
  unyieldingOnslaught: {
    id: 'unyieldingOnslaught',
    name: () => 'Unyielding Onslaught',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'unyielding-onslaught',
    description: () => 'Relentless attacks break enemy defenses.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
      attackRatingPercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 3000 Skills
  primalRoar: {
    id: 'primalRoar',
    name: () => 'Primal Roar',
    type: () => 'instant',
    manaCost: (level) => 40 + level * 0.625,
    cooldown: () => 80000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'primal-roar',
    description: () => 'A terrifying roar that weakens foes.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      ignoreEnemyArmor: 1,
      reduceEnemyDamagePercent: Math.min(scaleDownFlat(level, 0.1), 25),
    }),
  },
  berserkerSpirit: {
    id: 'berserkerSpirit',
    name: () => 'Berserker Spirit',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'berserker-spirit',
    description: () => 'Channel the true spirit of the berserker.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level, 3),
      lifePercent: scaleDownFlat(level, 1.5),
      critChance: Math.min(scaleDownFlat(level, 0.08), 30),
    }),
  },

  // Tier 5000 Skills
  apexPredator: {
    id: 'apexPredator',
    name: () => 'Apex Predator',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apex-predator',
    description: () => 'Become the ultimate hunter on the battlefield.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 3),
      attackSpeed: Math.min(scaleDownFlat(level, 0.02), 3),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 3),
    }),
  },
  rageIncarnate: {
    id: 'rageIncarnate',
    name: () => 'Rage Incarnate',
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 0.85,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'rage-incarnate',
    description: () => 'Embody pure rage to crush enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 4),
      armorPenetrationPercent: Math.min(scaleDownFlat(level, 0.5), 35),
      attackRatingPercent: scaleDownFlat(level, 5),
    }),
  },
};
