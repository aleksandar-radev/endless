import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent } from '../../common.js';
import { hero } from '../../globals.js';

// Berserker skills extracted from skills.js
export const BERSERKER_SKILLS = {
  // Tier 1 Skills
  frenzy: {
    id: 'frenzy',
    name: () => t('skill.frenzy.name'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frenzy',
    description: () => t('skill.frenzy'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: -1, increment: -0.2, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: -0.001, increment: -0.001, interval: 50, bonus: 0,
      }),
    }),
  },
  toughSkin: {
    id: 'toughSkin',
    name: () => t('skill.toughSkin.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'tough-skin',
    description: () => t('skill.toughSkin'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      armorPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      allResistance: getScalingFlat({
        level, base: 4, increment: 1, interval: 50, bonus: 0.1,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.004, increment: 0.005, interval: 50, bonus: 0,
      }),
      allResistancePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 10 Skills
  recklessSwing: {
    id: 'recklessSwing',
    name: () => t('skill.recklessSwing.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: () => 0,
    cooldown: () => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'swing',
    description: () => t('skill.recklessSwing'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 14, increment: 3, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.014, increment: 0.005, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: -8, increment: -1, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: -0.008, increment: -0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  battleCry: {
    id: 'battleCry',
    name: () => t('skill.battleCry.name'),
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.625,
    cooldown: () => 24400,
    duration: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'battle-cry',
    description: () => t('skill.battleCry'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 75),
      lifeSteal: Math.min(getScalingPercent({
        level, base: 0.1, softcap: 2000, linear: 0.05, power: 0.5,
      }), 4),
    }),
  },

  // Tier 25 Skills
  berserkersRage: {
    id: 'berserkersRage',
    name: () => t('skill.berserkersRage.name'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.025,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'berserker-rage',
    description: () => t('skill.berserkersRage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const coldDamage = getScalingFlat({
        level, base: 6, increment: 1.5, interval: 50, bonus: 0.1,
      });
      const coldDamagePerLevel = getScalingFlat({
        level, base: 0.006, increment: 0.005, interval: 50, bonus: 0,
      });
      const coldDamagePercent = getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      });

      return {
        coldDamage,
        coldDamagePerLevel,
        coldDamagePercent,
        doubleDamageChance: Math.min(getScalingPercent({
          level, base: 1, softcap: 2000, linear: 0.1, power: 0.5,
        }), 25),
      };
    },
  },
  greaterFrenzy: {
    id: 'greaterFrenzy',
    name: () => t('skill.greaterFrenzy.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'greater-rage',
    description: () => t('skill.greaterFrenzy'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.2, power: 0.6,
      }), 75),
      lifePerHit: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.002, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 50 Skills
  earthquake: {
    id: 'earthquake',
    name: () => t('skill.glacialTremor.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 7 + level * 0.66,
    cooldown: () => 12400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'earthquake',
    description: () => t('skill.glacialTremor'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
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
  rageMastery: {
    id: 'rageMastery',
    name: () => t('skill.rageMastery.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'mastery',
    description: () => t('skill.rageMastery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.2, power: 0.5,
      }), 25),
      critDamage: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 2),
      attackRatingPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 75 Skills
  bloodLust: {
    id: 'bloodLust',
    name: () => t('skill.bloodLust.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.313,
    cooldown: () => 76000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'bloodlust',
    description: () => t('skill.bloodLust'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 75),
      lifeSteal: Math.min(getScalingPercent({
        level, base: 0.2, softcap: 2000, linear: 0.05, power: 0.6,
      }), 4),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 100 Skills
  unbridledFury: {
    id: 'unbridledFury',
    name: () => t('skill.unbridledFury.name'),
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'fury',
    description: () => t('skill.unbridledFury'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      manaPerHit: getScalingFlat({
        level, base: 1, increment: 0.2, interval: 50, bonus: 0.1,
      }),
      manaPerHitPerLevel: getScalingFlat({
        level, base: 0.001, increment: 0.005, interval: 50, bonus: 0,
      }),
      lifePerHit: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.1,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  undyingRage: {
    id: 'undyingRage',
    name: () => t('skill.undyingRage.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'undying',
    description: () => t('skill.undyingRage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.2, power: 0.5,
      }), 50),
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 75),
      armorPenetration: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      armorPenetrationPerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 200 Skills
  warlord: {
    id: 'warlord',
    name: () => t('skill.warlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => t('skill.warlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const effectiveness = 1 + (hero.stats.warlordEffectivenessPercent || 0);
      return {
        strength: getScalingFlat({
          level, base: 15, increment: 3, interval: 50, bonus: 0.15,
        }) * effectiveness,
        strengthPerLevel: getScalingFlat({
          level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
        }) * effectiveness,
        strengthPercent: getScalingPercent({
          level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
        }) * effectiveness,
        damage: getScalingFlat({
          level, base: 15, increment: 3, interval: 50, bonus: 0.15,
        }) * effectiveness,
        damagePerLevel: getScalingFlat({
          level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
        }) * effectiveness,
        critChance: Math.min(getScalingPercent({
          level, base: 2, softcap: 2000, linear: 0.2, power: 0.5,
        }), 20) * effectiveness,
        attackSpeedPercent: Math.min(getScalingPercent({
          level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
        }), 75) * effectiveness,
        damagePercent: getScalingPercent({
          level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
        }) * effectiveness,
      };
    },
  },

  // Tier 1200 Skills
  rageOverflow: {
    id: 'rageOverflow',
    name: () => t('skill.rageOverflow.name'),
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 0.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'rage-overflow',
    description: () => t('skill.rageOverflow'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifeSteal: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.05, power: 0.6,
      }), 1),
    }),
  },
  crushingBlows: {
    id: 'crushingBlows',
    name: () => t('skill.crushingBlows.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'crushing-blows',
    description: () => t('skill.crushingBlows'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.2, power: 0.6,
      }) / 100, 3),
      armorPenetrationPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 25),
      damage: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // Tier 2000 Skills
  bloodFrenzy: {
    id: 'bloodFrenzy',
    name: () => t('skill.bloodFrenzy.name'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 110000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blood-frenzy',
    description: () => t('skill.bloodFrenzy'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }), 150),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePerHit: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
      lifePerHitPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },
  unyieldingOnslaught: {
    id: 'unyieldingOnslaught',
    name: () => t('skill.unyieldingOnslaught.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'unyielding-onslaught',
    description: () => t('skill.unyieldingOnslaught'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      attackRatingPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },

  // Tier 3000 Skills
  primalRoar: {
    id: 'primalRoar',
    name: () => t('skill.primalRoar.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 40 + level * 0.625,
    cooldown: () => 80000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'primal-roar',
    description: () => t('skill.primalRoar'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      ignoreEnemyArmor: 1,
      reduceEnemyDamagePercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.1, power: 0.5,
      }), 25),
    }),
  },
  berserkerSpirit: {
    id: 'berserkerSpirit',
    name: () => t('skill.berserkerSpirit.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'berserker-spirit',
    description: () => t('skill.berserkerSpirit'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.15,
      }),
      strengthPerLevel: getScalingFlat({
        level, base: 0.03, increment: 0.01, interval: 50, bonus: 0,
      }),
      strengthPercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      lifePercent: getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      critChance: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.2, power: 0.5,
      }), 30),
    }),
  },

  // Tier 5000 Skills
  apexPredator: {
    id: 'apexPredator',
    name: () => t('skill.apexPredator.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apex-predator',
    description: () => t('skill.apexPredator'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }), 150),
      lifeSteal: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.5,
      }), 3),
    }),
  },
  rageIncarnate: {
    id: 'rageIncarnate',
    name: () => t('skill.rageIncarnate.name'),
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 0.85,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'rage-incarnate',
    description: () => t('skill.rageIncarnate'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 50, increment: 10, interval: 50, bonus: 0.15,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.05, increment: 0.01, interval: 50, bonus: 0,
      }),
      damagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      armorPenetrationPercent: Math.min(getScalingPercent({
        level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
      }), 35),
      attackRatingPercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
  },
};
