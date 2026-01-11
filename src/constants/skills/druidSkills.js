import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent } from '../../common.js';
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
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }), 80),
        damage: getScalingFlat({
          level, base: 5, increment: 1, interval: 50, bonus: 0.1,
        }),
        earthDamage: getScalingFlat({
          level, base: 5, increment: 1, interval: 50, bonus: 0.1,
        }),
        waterDamage: getScalingFlat({
          level, base: 5, increment: 1, interval: 50, bonus: 0.1,
        }),
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
      armor: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.005, interval: 50, bonus: 0,
      }),
      armorPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifeRegen: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      extraDamageFromLifeRegenPercent: Math.min(getScalingPercent({
        level, base: 0.5, linear: 0.1,
      }) / 10, 10),
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
      vitality: getScalingFlat({
        level, base: 4, increment: 1, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      lifePercent: getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.2, power: 0.6,
      }),
      lifeRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.5,
      }), 2),
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
      lifeRegen: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      extraDamageFromLifeRegenPercent: Math.min(getScalingPercent({
        level, base: 0.5, linear: 0.1,
      }) / 5, 15),
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
    effect: (level) => ({
      earthDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      earthDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      reduceEnemyDamagePercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.1, power: 0.5,
      }), 25),
    }),
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
    effect: (level) => ({
      waterDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      waterDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      waterDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      coldDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  sproutling: {
    id: 'sproutling',
    name: () => t('skill.sproutling.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
        }), 60),
        damage: getScalingFlat({
          level, base: 10, increment: 2, interval: 50, bonus: 0.1,
        }),
        earthDamage: getScalingFlat({
          level, base: 10, increment: 2, interval: 50, bonus: 0.1,
        }),
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
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }), 100),
        damage: getScalingFlat({
          level, base: 15, increment: 3, interval: 50, bonus: 0.15,
        }),
        attackSpeed: 0.9,
        lifePerHit: getScalingFlat({
          level, base: 5, increment: 1, interval: 50, bonus: 0.1,
        }),
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
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
        }), 400),
        damage: getScalingFlat({
          level, base: 30, increment: 5, interval: 50, bonus: 0.15,
        }),
        earthDamage: getScalingFlat({
          level, base: 40, increment: 8, interval: 50, bonus: 0.15,
        }),
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
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.2, linear: 0.05,
      }) / 100, 1.11),
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
    effect: (level) => ({
      earthDamage: getScalingFlat({
        level, base: 25, increment: 5, interval: 50, bonus: 0.15,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.025, increment: 0.01, interval: 50, bonus: 0,
      }),
      earthDamagePercent: getScalingPercent({
        level, base: 20, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      waterDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      waterDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      waterDamagePercent: getScalingPercent({
        level, base: 20, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
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
    effect: (level) => ({
      waterDamage: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      waterDamagePerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      waterDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamage: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      coldDamagePerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      coldDamagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  spiritBear: {
    id: 'spiritBear',
    name: () => t('skill.spiritBear.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
        }), 200),
        damage: getScalingFlat({
          level, base: 30, increment: 5, interval: 50, bonus: 0.15,
        }),
        earthDamage: getScalingFlat({
          level, base: 25, increment: 4, interval: 50, bonus: 0.15,
        }),
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
      armor: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      armorPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      earthDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      allResistance: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
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
    icon: () => 'bear-form',
    description: () => t('skill.bearForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.shapeshiftUnlocked > 0,
    effect: (level) => ({
      life: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      lifePerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
      damage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
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
    icon: () => 'snake-form',
    description: () => t('skill.snakeForm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    isVisible: () => hero.stats.shapeshiftUnlocked > 0,
    effect: (level) => ({
      earthDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      earthDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      poisonDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
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
      lifeSteal: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 10),
      manaPerHit: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      manaPerHitPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
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
      coldDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      coldDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      coldDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      waterDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      waterDamage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      waterDamagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
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
      armorPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifeRegen: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifeRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.5,
      }), 2),
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
      damage: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      vitality: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      elementalDamagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
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
      vitality: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      vitalityPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      strength: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      strengthPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
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
      lifeRegen: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      manaRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      extraDamageFromLifeRegenPercent: Math.min(getScalingPercent({
        level, base: 0.5, linear: 0.1,
      }) / 2, 10),
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
      lifeRegen: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifeRegenPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifeRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.5,
      }), 2),
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
      armor: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      life: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.1,
      }),
      lifePerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
      earthDamagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
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
      const damage = getScalingFlat({
        level, base: 35, increment: 5, interval: 50, bonus: 0.15,
      });
      const coldDamagePercent = getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      });
      const waterDamagePercent = getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      });
      return {
        damage: getScalingFlat({
          level, base: 35, increment: 5, interval: 50, bonus: 0.15,
        }),
        coldDamagePercent: getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }),
        waterDamagePercent: getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }),
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
      vitality: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      endurance: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.1,
      }),
      endurancePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      perseverance: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.1,
      }),
      perseverancePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  primevalGuardian: {
    id: 'primevalGuardian',
    name: () => t('skill.primevalGuardian.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }), 150),
        damage: getScalingFlat({
          level, base: 40, increment: 8, interval: 50, bonus: 0.15,
        }),
        earthDamage: getScalingFlat({
          level, base: 40, increment: 8, interval: 50, bonus: 0.15,
        }),
        earthDamagePercent: getScalingPercent({
          level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
        }),
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
  earthsEmbraceAscended: {
    id: 'earthsEmbraceAscended',
    name: () => t('skill.earthsEmbraceAscended.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'earths-embrace',
    description: () => t('skill.earthsEmbrace'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
      lifePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      allResistance: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.15,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
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
      elementalDamage: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      elementalDamagePerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
};
