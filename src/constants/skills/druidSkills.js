import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Druid skills
export const DRUID_SKILLS = {
  // Tier 1 Skills
  summonPest: {
    id: 'summonPest',
    name: () => t('Summon Pest'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.75), 80),
        damage: scaleUpFlat(level, 1.25),
        earthDamage: scaleUpFlat(level, 1.6),
        waterDamage: scaleUpFlat(level, 1),
        attackSpeed: 1,
      };
    },
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 18000,
    duration: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'summon-pest',
    description: () => t('skill.summonPest'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
  },
  barkSkin: {
    id: 'barkSkin',
    name: () => t('Bark Skin'),
    type: () => 'passive',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bark-skin',
    description: () => t('skill.barkSkin'),
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
    name: () => t('Natural Affinity'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'leaf',
    description: () => t('skill.naturalAffinity'),
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
    name: () => t('Rejuvenation'),
    type: () => 'buff',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 45000,
    duration: () => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'rejuvenation',
    description: () => t('skill.rejuvenation'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: scaleUpFlat(level, 4),
      lifeRegenPercent: scaleDownFlat(level, 0.5),
      extraDamageFromLifeRegenPercent: Math.min(scaleDownFlat(level, 0.2), 15),
    }),
  },
  entanglingRoots: {
    id: 'entanglingRoots',
    name: () => t('Entangling Roots'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 15200,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'roots',
    description: () => t('skill.entanglingRoots'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const earthDamage = scaleUpFlat(level, 5);
      const earthDamagePercent = scaleDownFlat(level, 5);
      return {
        earthDamage: earthDamage * 4,
        earthDamagePercent: earthDamagePercent * 4,
      };
    },
  },

  sproutling: {
    id: 'sproutling',
    name: () => t('Sproutling'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.2, 25), 60),
        damage: scaleUpFlat(level, 5),
        earthDamage: scaleUpFlat(level, 4),
        attackSpeed: 2,
      };
    },
    manaCost: (level) => 3 + level * 0.2,
    cooldown: () => 14000,
    duration: () => 5250,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'sproutling',
    description: () => t('skill.sproutling'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
  },

  // Tier 25 Skills
  animalCompanion: {
    id: 'animalCompanion',
    name: () => t('Animal Companion'),
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
    description: () => t('skill.animalCompanion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
  },
  naturalGrowth: {
    id: 'naturalGrowth',
    name: () => t('Natural Growth'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'growth',
    description: () => t('skill.naturalGrowth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: scaleDownFlat(level, 1),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.008), 1.11),
    }),
  },

  // Tier 50 Skills
  hurricane: {
    id: 'hurricane',
    name: () => t('Hurricane'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 8 + level * 0.5,
    cooldown: () => 11400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'hurricane',
    description: () => t('skill.hurricane'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const waterDamage = scaleUpFlat(level, 4);
      const waterDamagePercent = scaleDownFlat(level, 6);
      const coldDamage = scaleUpFlat(level, 4);
      const coldDamagePercent = scaleDownFlat(level, 6);
      return {
        waterDamage: waterDamage * 4,
        waterDamagePercent: waterDamagePercent * 4,
        coldDamage: coldDamage * 4,
        coldDamagePercent: coldDamagePercent * 4,
      };
    },
  },

  spiritBear: {
    id: 'spiritBear',
    name: () => t('Spirit Bear'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 1.5), 200),
        damage: scaleUpFlat(level, 8, 10, 0.5),
        earthDamage: scaleUpFlat(level, 6, 10, 0.4),
        attackSpeed: 0.6,
      };
    },
    manaCost: (level) => 8 + level * 0.5,
    cooldown: () => 120000,
    duration: () => 43250,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'spirit-bear',
    description: () => t('skill.spiritBear'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
    }),
  },
  stoneform: {
    id: 'stoneform',
    name: () => t('Stoneform'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 52000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'stoneform',
    description: () => t('skill.stoneform'),
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
    name: () => t('Spirit Link'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.625,
    cooldown: () => 76000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'spirit-link',
    description: () => t('skill.spiritLink'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: Math.min(scaleDownFlat(level, 0.02), 10),
      manaPerHit: scaleUpFlat(level, 0.75),
    }),
  },
  moonfury: {
    id: 'moonfury',
    name: () => t('Moonfury'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'moonfury',
    description: () => t('skill.moonfury'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: scaleDownFlat(level, 2),
      coldDamage: scaleUpFlat(level, 4),
      waterDamagePercent: scaleDownFlat(level, 2),
      waterDamage: scaleUpFlat(level, 4),
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
    description: () => t('skill.earthsEmbrace'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 2),
      lifeRegenPercent: scaleDownFlat(level, 0.5),
      lifeRegen: scaleUpFlat(level, 2),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level, 0.01), 2),
    }),
  },
  wrathOfNature: {
    id: 'wrathOfNature',
    name: () => t('Wrath of Nature'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath-of-nature',
    description: () => t('skill.wrathOfNature'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
      vitalityPercent: scaleDownFlat(level),
      elementalDamagePercent: scaleDownFlat(level),
    }),
  },

  // Tier 200 Skills
  avatarOfNature: {
    id: 'avatarOfNature',
    name: () => t('Avatar of Nature'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'avatar-of-nature',
    description: () => t('skill.avatarOfNature'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: scaleUpFlat(level, 3, 8),
      vitalityPercent: scaleDownFlat(level, 1.5),
      strength: scaleUpFlat(level, 4, 8),
      damagePercent: scaleDownFlat(level, 2),
    }),
  },

  // Tier 1200 Skills
  spiritBond: {
    id: 'spiritBond',
    name: () => t('Spirit Bond'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'spirit-bond',
    description: () => t('skill.spiritBond'),
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
    name: () => t('Wild Growth'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'wild-growth',
    description: () => t('skill.wildGrowth'),
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
    name: () => t('Ancient Roots'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'ancient-roots',
    description: () => t('skill.ancientRoots'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 2),
      lifePercent: scaleDownFlat(level, 1.5),
      earthDamagePercent: scaleDownFlat(level, 4),
    }),
  },
  furyOfTheWilds: {
    id: 'furyOfTheWilds',
    name: () => t('Fury of the Wilds'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'fury-of-the-wilds',
    description: () => t('skill.furyOfTheWilds'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const damage = scaleUpFlat(level, 14, 4, 0.2);
      const coldDamagePercent = scaleDownFlat(level, 3);
      const waterDamagePercent = scaleDownFlat(level, 3);
      return {
        damage: damage * 4,
        coldDamagePercent: coldDamagePercent * 4,
        waterDamagePercent: waterDamagePercent * 4,
      };
    },
  },

  // Tier 3000 Skills
  natureEternal: {
    id: 'natureEternal',
    name: () => t('Nature Eternal'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'nature-eternal',
    description: () => t('skill.natureEternal'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitalityPercent: scaleDownFlat(level, 2),
      endurancePercent: scaleDownFlat(level, 2),
      perseverancePercent: scaleDownFlat(level, 2),
    }),
  },
  primevalGuardian: {
    id: 'primevalGuardian',
    name: () => t('Primeval Guardian'),
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
    description: () => t('skill.primevalGuardian'),
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
    description: () => t('skill.earthsEmbrace'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 12, 5),
      lifePercent: scaleDownFlat(level, 2.5),
      allResistance: scaleUpFlat(level, 12, 5),
    }),
  },
  cosmicHarmony: {
    id: 'cosmicHarmony',
    name: () => t('Cosmic Harmony'),
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'cosmic-harmony',
    description: () => t('skill.cosmicHarmony'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 3),
    }),
  },
};
