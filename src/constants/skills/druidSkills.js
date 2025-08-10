import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Druid skills
export const DRUID_SKILLS = {
  // Tier 1 Skills
  summonPest: {
    id: 'summonPest',
    name: () => 'Summon Pest',
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.75), 80),
        damage: scaleUpFlat(level, 1),
        earthDamage: scaleUpFlat(level, 1),
        waterDamage: scaleUpFlat(level, 0.5),
        attackSpeed: 1,
      };
    },
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 18000,
    duration: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'summon-pest',
    description: () => 'Summons a pest to your aid, dealing percent of your damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
  },
  barkSkin: {
    id: 'barkSkin',
    name: () => 'Bark Skin',
    type: () => 'passive',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bark-skin',
    description: () => 'Increases armor while active.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 5),
      armorPercent: scaleDownFlat(level, 2),
      lifeRegen: 1 * scaleUpFlat(level, 1, 5, 0.3),
      extraDamageFromLifeRegenPercent: Math.min(0.1 * scaleDownFlat(level), 10),
    }),
  },
  naturalAffinity: {
    id: 'naturalAffinity',
    name: () => 'Natural Affinity',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'leaf',
    description: () => 'Increases vitality and life regeneration.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: scaleUpFlat(level, 2),
      lifePercent: scaleDownFlat(level, 0.5),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level, 0.01), 2),
    }),
  },

  // Tier 10 Skills
  rejuvenation: {
    id: 'rejuvenation',
    name: () => 'Rejuvenation',
    type: () => 'buff',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 45000,
    duration: () => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'rejuvenation',
    description: () => 'Restores life over time.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: scaleUpFlat(level, 4),
      lifeRegenPercent: scaleDownFlat(level, 0.5),
      extraDamageFromLifeRegenPercent: Math.min(scaleDownFlat(level, 0.2), 15),
    }),
  },
  entanglingRoots: {
    id: 'entanglingRoots',
    name: () => 'Entangling Roots',
    type: () => 'instant',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 15200,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'roots',
    description: () => 'Deals earth damage and slows enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: scaleUpFlat(level, 5),
      earthDamagePercent: scaleDownFlat(level, 5),
    }),
  },

  // Tier 25 Skills
  animalCompanion: {
    id: 'animalCompanion',
    name: () => 'Animal Companion',
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 1), 100),
        damage: scaleUpFlat(level, 4),
        attackSpeed: 0.9,
        lifePerHit: scaleUpFlat(level, 4),
      };
    },
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 56000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'companion',
    description: () => 'Summons a beast to aid you. Heals you when hitting.',
    maxLevel: () => 200,
    effect: (level) => ({
    }),
  },
  naturalGrowth: {
    id: 'naturalGrowth',
    name: () => 'Natural Growth',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'growth',
    description: () => 'Increases life and life regeneration.',
    maxLevel: () => 1000,
    effect: (level) => ({
      lifePercent: scaleDownFlat(level, 1),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.015), 2),
    }),
  },

  // Tier 50 Skills
  hurricane: {
    id: 'hurricane',
    name: () => 'Hurricane',
    type: () => 'instant',
    manaCost: (level) => 8 + level * 0.5,
    cooldown: () => 11400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'hurricane',
    description: () => 'Calls forth fierce winds to damage enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      airDamage: scaleUpFlat(level, 4),
      airDamagePercent: scaleDownFlat(level, 6),
      coldDamage: scaleUpFlat(level, 4),
      coldDamagePercent: scaleDownFlat(level, 6),
    }),
  },
  stoneform: {
    id: 'stoneform',
    name: () => 'Stoneform',
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 52000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'stoneform',
    description: () => 'Hardens your skin, boosting armor and resistance.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 4),
      armorPercent: scaleDownFlat(level, 5),
      earthDamagePercent: scaleDownFlat(level, 2),
      allResistance: scaleUpFlat(level, 4),
    }),
  },

  // Tier 75 Skills
  spiritLink: {
    id: 'spiritLink',
    name: () => 'Spirit Link',
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.625,
    cooldown: () => 76000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'spirit-link',
    description: () => 'Increases life steal and mana gain.',
    maxLevel: () => 300,
    effect: (level) => ({
      lifeSteal: Math.min(scaleDownFlat(level, 0.02), 10),
      manaPerHit: scaleUpFlat(level, 0.75),
    }),
  },
  moonfury: {
    id: 'moonfury',
    name: () => 'Moonfury',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'moonfury',
    description: () => 'Empowers you under the moon, boosting elemental damage.',
    maxLevel: () => 300,
    effect: (level) => ({
      coldDamagePercent: scaleDownFlat(level, 2),
      coldDamage: scaleUpFlat(level, 4),
      airDamagePercent: scaleDownFlat(level, 2),
      airDamage: scaleUpFlat(level, 4),
    }),
  },

  // Tier 100 Skills
  earthsEmbrace: {
    id: 'earthsEmbrace',
    name: () => "Earth's Embrace",
    type: () => 'buff',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 64000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'embrace',
    description: () => 'Embrace the earth for defense and regeneration.',
    maxLevel: () => 500,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 2),
      lifeRegenPercent: scaleDownFlat(level, 0.5),
      lifeRegen: scaleUpFlat(level, 2),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level, 0.01), 2),
    }),
  },
  wrathOfNature: {
    id: 'wrathOfNature',
    name: () => 'Wrath of Nature',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath-of-nature',
    description: () => 'Nature fights with you, increasing all stats.',
    maxLevel: () => 500,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
      vitalityPercent: scaleDownFlat(level),
      elementalDamagePercent: scaleDownFlat(level),
    }),
  },

  // Tier 200 Skills
  avatarOfNature: {
    id: 'avatarOfNature',
    name: () => 'Avatar of Nature',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'avatar-of-nature',
    description: () => 'Become one with nature, greatly increasing attributes.',
    maxLevel: () => 100,
    effect: (level) => ({
      vitality: scaleUpFlat(level, 3),
      vitalityPercent: scaleDownFlat(level, 3),
      strength: scaleUpFlat(level, 4),
      damagePercent: scaleDownFlat(level, 2),
      lifePercent: scaleDownFlat(level, 2),
    }),
  },

  // Tier 1200 Skills
  spiritBond: {
    id: 'spiritBond',
    name: () => 'Spirit Bond',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'spirit-bond',
    description: () => 'Bond with spirits to enhance regeneration.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: scaleUpFlat(level, 2),
      lifeRegenPercent: scaleDownFlat(level, 1.5),
      manaRegenPercent: scaleDownFlat(level),
      extraDamageFromLifeRegenPercent: Math.min(0.1 * scaleDownFlat(level), 10),
    }),
  },
  wildGrowth: {
    id: 'wildGrowth',
    name: () => 'Wild Growth',
    type: () => 'buff',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'wild-growth',
    description: () => 'Causes allies to rapidly regenerate life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: scaleUpFlat(level, 4, 2),
      lifeRegenPercent: scaleDownFlat(level, 2),
      lifePercent: scaleDownFlat(level),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level, 0.01), 2),
    }),
  },

  // Tier 2000 Skills
  ancientRoots: {
    id: 'ancientRoots',
    name: () => 'Ancient Roots',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'ancient-roots',
    description: () => 'Tap into ancient power to fortify yourself.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 2),
      lifePercent: scaleDownFlat(level, 1.5),
      earthDamagePercent: scaleDownFlat(level, 4),
    }),
  },
  furyOfTheWilds: {
    id: 'furyOfTheWilds',
    name: () => 'Fury of the Wilds',
    type: () => 'instant',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'fury-of-the-wilds',
    description: () => 'Unleash nature\'s wrath on your foes.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 14, 4, 0.2),
      coldDamagePercent: scaleDownFlat(level, 3),
      lightningDamagePercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 3000 Skills
  natureEternal: {
    id: 'natureEternal',
    name: () => 'Nature Eternal',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'nature-eternal',
    description: () => 'Gain everlasting resilience from nature.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitalityPercent: scaleDownFlat(level, 2),
      endurancePercent: scaleDownFlat(level, 2),
      perseverancePercent: scaleDownFlat(level, 2),
    }),
  },
  primevalGuardian: {
    id: 'primevalGuardian',
    name: () => 'Primeval Guardian',
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 1.2), 150),
        damage: scaleUpFlat(level, 25, 3),
        earthDamage: scaleUpFlat(level, 20, 3),
        earthDamagePercent: scaleDownFlat(level, 2),
        attackSpeed: 1.25,
      };
    },
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 150000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'primeval-guardian',
    description: () => 'Summon an ancient guardian to protect allies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
  },

  // Tier 5000 Skills
  earthsEmbrace: {
    id: 'earthsEmbrace',
    name: () => "Earth's Embrace",
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'earths-embrace',
    description: () => 'Become one with the earth for immense fortitude.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 12, 5),
      lifePercent: scaleDownFlat(level, 2.5),
      allResistance: scaleUpFlat(level, 12, 5),
    }),
  },
  cosmicHarmony: {
    id: 'cosmicHarmony',
    name: () => 'Cosmic Harmony',
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'cosmic-harmony',
    description: () => 'Balance all energies to empower allies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 3),
    }),
  },
};
