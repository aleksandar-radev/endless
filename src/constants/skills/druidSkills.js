import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';
import { hero } from '../../globals.js';

// Druid skills
export const DRUID_SKILLS = {
  // Tier 1 Skills
  summonPest: {
    id: 'summonPest',
    name: () => t('skill.summonPest.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.75), 80),
        damage: scaleUpFlat(level, 1.6, 8),
        earthDamage: scaleUpFlat(level, 2, 8),
        waterDamage: scaleUpFlat(level, 1.3, 8),
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
    effect: (level) => ({}),
  },
  barkSkin: {
    id: 'barkSkin',
    name: () => t('skill.barkSkin.name'),
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
    name: () => t('skill.naturalAffinity.name'),
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
    name: () => t('skill.rejuvenation.name'),
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
    name: () => t('skill.entanglingRoots.name'),
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
        reduceEnemyDamagePercent: Math.min(scaleDownFlat(level, 1.5), 25),
      };
    },
  },

  frostBloom: {
    id: 'frostBloom',
    name: () => t('skill.frostBloom.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.35,
    cooldown: () => 13500,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'frost-bloom',
    description: () => t('skill.frostBloom'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.naturalistInstantSkillsUnlocked > 0,
    effect: (level) => {
      const waterDamage = scaleUpFlat(level, 3.5);
      const waterDamagePercent = scaleDownFlat(level, 6);
      const coldDamage = scaleUpFlat(level, 3.5);
      const coldDamagePercent = scaleDownFlat(level, 6);
      return {
        waterDamage: waterDamage * 3.5,
        waterDamagePercent: waterDamagePercent * 3.5,
        coldDamage: coldDamage * 3.5,
        coldDamagePercent: coldDamagePercent * 3.5,
      };
    },
  },

  sproutling: {
    id: 'sproutling',
    name: () => t('skill.sproutling.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 0.2, 25), 60),
        damage: scaleUpFlat(level, 6.5, 8),
        earthDamage: scaleUpFlat(level, 5, 8),
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
    effect: (level) => ({}),
  },

  // Tier 25 Skills
  animalCompanion: {
    id: 'animalCompanion',
    name: () => t('skill.animalCompanion.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 1), 100),
        damage: scaleUpFlat(level, 5.2, 5),
        attackSpeed: 0.9,
        lifePerHit: scaleUpFlat(level, 4, 5),
      };
    },
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 56000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'companion',
    description: () => t('skill.animalCompanion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
  },

  // Summoner specialization bonus skill
  summonTreant: {
    id: 'summonTreant',
    name: () => t('skill.summonTreant.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 1.5), 400),
        damage: scaleUpFlat(level, 22, 5, 0.6),
        earthDamage: scaleUpFlat(level, 30, 5, 0.7),
        attackSpeed: 0.25,
      };
    },
    manaCost: (level) => 10 + level * 0.4,
    cooldown: () => 90000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'primeval-guardian',
    description: () => t('skill.summonTreant'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.summonerExtraSummonUnlocked > 0,
    effect: (level) => ({}),
  },
  naturalGrowth: {
    id: 'naturalGrowth',
    name: () => t('skill.naturalGrowth.name'),
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

  stoneTorrent: {
    id: 'stoneTorrent',
    name: () => t('skill.stoneTorrent.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 7 + level * 0.45,
    cooldown: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'stone-torrent',
    description: () => t('skill.stoneTorrent'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.naturalistInstantSkillsUnlocked > 0,
    effect: (level) => {
      const earthDamage = scaleUpFlat(level, 5);
      const earthDamagePercent = scaleDownFlat(level, 6);
      const waterDamage = scaleUpFlat(level, 3);
      const waterDamagePercent = scaleDownFlat(level, 6);
      return {
        earthDamage: earthDamage * 4.2,
        earthDamagePercent: earthDamagePercent * 4.2,
        waterDamage: waterDamage * 4.2,
        waterDamagePercent: waterDamagePercent * 4.2,
      };
    },
  },

  // Tier 50 Skills
  hurricane: {
    id: 'hurricane',
    name: () => t('skill.hurricane.name'),
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
    name: () => t('skill.spiritBear.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 1.5), 200),
        damage: scaleUpFlat(level, 8, 6, 0.5),
        earthDamage: scaleUpFlat(level, 6, 7, 0.4),
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
    effect: (level) => ({}),
  },
  stoneform: {
    id: 'stoneform',
    name: () => t('skill.stoneform.name'),
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

  // Shapeshifting Skills (Unlocked via Shapeshifter specialization)
  bearForm: {
    id: 'bearForm',
    name: () => t('skill.bearForm.name'),
    type: () => 'buff',
    exclusiveWith: () => ['snakeForm'],
    exclusiveBuffGroup: () => 'shapeshiftForm',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 60000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'spirit-bear',
    description: () => t('skill.bearForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.shapeshiftUnlocked > 0,
    effect: (level) => ({
      life: scaleUpFlat(level, 10),
      damage: scaleUpFlat(level, 4),
    }),
  },
  snakeForm: {
    id: 'snakeForm',
    name: () => t('skill.snakeForm.name'),
    type: () => 'buff',
    exclusiveWith: () => ['bearForm'],
    exclusiveBuffGroup: () => 'shapeshiftForm',
    manaCost: (level) => 10 + level * 0.625,
    cooldown: () => 60000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'fangs',
    description: () => t('skill.snakeForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.shapeshiftUnlocked > 0,
    effect: (level) => ({
      earthDamage: scaleUpFlat(level, 4),
      poisonDamagePercent: scaleDownFlat(level, 0.5),
      poisonChance: 20,
    }),
  },

  // Tier 75 Skills
  spiritLink: {
    id: 'spiritLink',
    name: () => t('skill.spiritLink.name'),
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
    name: () => t('skill.moonfury.name'),
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
    name: () => t('skill.earthsEmbrace.name'),
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
    name: () => t('skill.wrathOfNature.name'),
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
    name: () => t('skill.avatarOfNature.name'),
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
    name: () => t('skill.spiritBond.name'),
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
    name: () => t('skill.wildGrowth.name'),
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
    name: () => t('skill.ancientRoots.name'),
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
    name: () => t('skill.furyOfTheWilds.name'),
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
    name: () => t('skill.natureEternal.name'),
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
    name: () => t('skill.primevalGuardian.name'),
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
    effect: (level) => ({}),
  },

  // Tier 5000 Skills
  earthsEmbrace: {
    id: 'earthsEmbrace',
    name: () => t('skill.earthsEmbrace.name'),
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
    name: () => t('skill.cosmicHarmony.name'),
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
