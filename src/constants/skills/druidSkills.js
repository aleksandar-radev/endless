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
        percentOfPlayerDamage: Math.min(level * 0.75, 80),
        damage: level * 1,
        earthDamage: level * 1,
        waterDamage: level * 0.5,
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
      armor: level * 5,
      armorPercent: 2 * scaleDownFlat(level),
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
      vitality: level * 2,
      lifePercent: 0.5 * scaleDownFlat(level),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level) * 0.01, 2),
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
      lifeRegen: level * 4,
      lifeRegenPercent: 0.5 * scaleDownFlat(level),
      extraDamageFromLifeRegenPercent: Math.min(0.2 * scaleDownFlat(level), 15),
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
      earthDamage: level * 5,
      earthDamagePercent: 5 * scaleDownFlat(level),
    }),
  },

  // Tier 25 Skills
  animalCompanion: {
    id: 'animalCompanion',
    name: () => 'Animal Companion',
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(level * 1, 100),
        damage: level * 4,
        attackSpeed: 0.9,
        lifePerHit: level * 4,
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
      lifePercent: 1 * scaleDownFlat(level),
      extraDamageFromLifePercent: Math.min(0.015 * scaleDownFlat(level), 2),
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
      airDamage: level * 4,
      airDamagePercent: 6 * scaleDownFlat(level),
      coldDamage: level * 4,
      coldDamagePercent: 6 * scaleDownFlat(level),
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
      armor: level * 4,
      armorPercent: 5 * scaleDownFlat(level),
      earthDamagePercent: 2 * scaleDownFlat(level),
      allResistance: level * 4,
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
      lifeSteal: level * 0.02,
      manaPerHit: level * 0.75,
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
      coldDamagePercent: 2 * scaleDownFlat(level),
      coldDamage: level * 4,
      airDamagePercent: 2 * scaleDownFlat(level),
      airDamage: level * 4,
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
      armorPercent: 2 * scaleDownFlat(level),
      lifeRegenPercent: 0.5 * scaleDownFlat(level),
      lifeRegen: level * 2,
      lifeRegenOfTotalPercent: scaleDownFlat(level) * 0.01,
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
      damagePercent: 2.5 * scaleDownFlat(level),
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
      vitality: level * 3,
      vitalityPercent: 3 * scaleDownFlat(level),
      strength: level * 4,
      damagePercent: 2 * scaleDownFlat(level),
      lifePercent: 2 * scaleDownFlat(level),
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
      lifeRegen: level * 2,
      lifeRegenPercent: 1.5 * scaleDownFlat(level),
      manaRegenPercent: scaleDownFlat(level),
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
      lifeRegen: level * 4,
      lifePercent: scaleDownFlat(level),
      vitality: level * 2,
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
      armorPercent: 2 * scaleDownFlat(level),
      lifePercent: 1.5 * scaleDownFlat(level),
      earthDamagePercent: 2 * scaleDownFlat(level),
    }),
  },
  furyOfTheWilds: {
    id: 'furyOfTheWilds',
    name: () => 'Fury of the Wilds',
    type: () => 'instant',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 120000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'fury-of-the-wilds',
    description: () => 'Unleash nature\'s wrath on your foes.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 14,
      coldDamagePercent: 3 * scaleDownFlat(level),
      lightningDamagePercent: 3 * scaleDownFlat(level),
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
      lifePercent: 2 * scaleDownFlat(level),
      vitalityPercent: 3 * scaleDownFlat(level),
      endurancePercent: 2 * scaleDownFlat(level),
    }),
  },
  primevalGuardian: {
    id: 'primevalGuardian',
    name: () => 'Primeval Guardian',
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 150000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'primeval-guardian',
    description: () => 'Summon an ancient guardian to protect allies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      percentOfPlayerDamage: Math.min(level * 1.2, 150),
      damage: level * 5,
      earthDamage: level * 5,
      earthDamagePercent: 2 * scaleDownFlat(level),
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
      armor: level * 12,
      lifePercent: 2 * scaleDownFlat(level),
      allResistance: level * 12,
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
      lifeRegenPercent: 2 * scaleDownFlat(level),
      manaRegenPercent: 2 * scaleDownFlat(level),
      elementalDamagePercent: 3 * scaleDownFlat(level),
    }),
  },
};
