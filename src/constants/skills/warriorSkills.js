import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy } from '../../common.js';
import { hero } from '../../globals.js';

// Warrior skills extracted from skills.js
export const WARRIOR_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
  bash: {
    id: 'bash',
    name: () => t('skill.bash.name'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'war-axe',
    description: () => t('skill.bash'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 3, increment: 1, interval: 50, bonus: 0.1,
      }),
      damagePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
  },
  toughness: {
    id: 'toughness',
    name: () => t('skill.toughness.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'shield',
    description: () => t('skill.toughness'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 24, increment: 4, interval: 50, bonus: 0.18,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      extraDamageFromArmorPercent: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 2.5),
    }),
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
  powerStrike: {
    id: 'powerStrike',
    name: () => t('skill.powerStrike.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 4 + level * 0.3,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'sword',
    description: () => t('skill.powerStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 10, increment: 5, interval: 50, bonus: 0.2,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'groundSlam',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.5, cap: 5000,
        }),
      },
    ],
  },
  ironWill: {
    id: 'ironWill',
    name: () => t('skill.ironWill.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'helmet',
    description: () => t('skill.ironWill'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getScalingFlat({
        level, base: 4, increment: 0.5, interval: 100, bonus: 0.1,
      }),
      vitalityPerLevel: getScalingFlat({
        level, base: 0.004, increment: 0.004, interval: 100, bonus: 0,
      }),
      perseverance: getScalingFlat({
        level, base: 2, increment: 0.25, interval: 100, bonus: 0.1,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 1.25),
    }),
    synergies: [
      {
        sourceSkillId: 'fortitude',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.25, increment: 0.25, cap: 500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2
  // ===========================================================================
  battleCry: {
    id: 'battleCry',
    name: () => t('skill.battleCry.name'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'cry',
    description: () => t('skill.battleCry'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 8, increment: 1.5, interval: 50, bonus: 0.15,
      }),
      damagePercent: getScalingPercent({
        level, base: 8, softcap: 2000, linear: 0.2, power: 0.6,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bash',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.25, cap: 5000,
        }),
      },
    ],
  },
  fortitude: {
    id: 'fortitude',
    name: () => t('skill.fortitude.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'armor',
    description: () => t('skill.fortitude'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.3, softcap: 2000, linear: 0.05, power: 0.6,
      }) / 100, 3.0),
      lifeRegen: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.15,
      }),
      lifeRegenPerLevel: getScalingFlat({
        level, base: 0.001, increment: 0.001, interval: 50, bonus: 0,
      }),
    }),
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
  groundSlam: {
    id: 'groundSlam',
    name: () => t('skill.groundSlam.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 5 + level * 0.6,
    cooldown: () => 11400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'slam',
    description: () => t('skill.groundSlam'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 8, increment: 1.2, interval: 50, bonus: 0.1,
      }),
      damagePercent: getScalingPercent({
        level, base: 20, softcap: 2000, linear: 0.8, power: 0.6,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'powerStrike',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.3, cap: 2500,
        }),
      },
    ],
  },
  armorBreaker: {
    id: 'armorBreaker',
    name: () => t('skill.armorBreaker.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'armor-break',
    description: () => t('skill.armorBreaker'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPenetration: getScalingFlat({
        level, base: 20, increment: 10, interval: 5, bonus: 0.1,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'powerStrike',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.5, cap: 500,
        }),
        additionalEffects: (sourceLevel) => ({
          armorPenetration: getScalingFlat({
            level: sourceLevel, base: 5, increment: 0.5, interval: 50, bonus: 0.1,
          }),
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
  shieldWall: {
    id: 'shieldWall',
    name: () => t('skill.shieldWall.name'),
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.625,
    cooldown: () => 45000,
    duration: () => 16000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'wall',
    description: () => t('skill.shieldWall'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 30, increment: 8, interval: 50, bonus: 0.18,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.015, increment: 0.015, interval: 50, bonus: 0,
      }),
      extraDamageFromArmorPercent: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 2),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.3, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5
  // ===========================================================================
  berserk: {
    id: 'berserk',
    name: () => t('skill.berserk.name'),
    type: () => 'toggle',
    manaCost: (level) => 3 + level * 0.188,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'berserk',
    description: () => t('skill.berserk'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getScalingFlat({
        level, base: 25, increment: 5, interval: 50, bonus: 0.15,
      }),
      fireDamagePerLevel: getScalingFlat({
        level, base: 0.02, increment: 0.01, interval: 50, bonus: 0,
      }),
      fireDamagePercent: getScalingPercent({
        level, base: 8, softcap: 2000, linear: 0.2, power: 0.6,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'legendaryWarlord',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.1, increment: 0.1, cap: 200,
        }),
      },
    ],
  },

  lastStand: {
    id: 'lastStand',
    name: () => t('skill.lastStand.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'last-stand',
    description: () => t('skill.lastStand'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.05, power: 0.6,
      }), 175),
      attackRating: getScalingFlat({
        level, base: 30, increment: 10, interval: 50, bonus: 0.1,
      }),
      attackRatingPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
  },

  // ===========================================================================
  // TIER 6
  // ===========================================================================
  warlord: {
    id: 'warlord',
    name: () => t('skill.warlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => t('skill.warlordWarrior'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      allAttributes: getScalingFlat({
        level, base: 3, increment: 1, interval: 50, bonus: 0.10,
      }),
      allAttributesPerLevel: getScalingFlat({
        level, base: 0.0038, increment: 0.0038, interval: 50, bonus: 0,
      }),
    }),
  },

  // ===========================================================================
  // TIER 1200
  // ===========================================================================
  unstoppableForce: {
    id: 'unstoppableForce',
    name: () => t('skill.unstoppableForce.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unstoppable-force',
    description: () => t('skill.unstoppableForce'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 5, increment: 2, interval: 50, bonus: 0.05,
      }),
      critDamage: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 3),
    }),
  },
  unyieldingDefense: {
    id: 'unyieldingDefense',
    name: () => t('skill.unyieldingDefense.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'unyielding-defense',
    description: () => t('skill.unyieldingDefense'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.1,
      }),
      armorPerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
      allResistance: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'shieldWall',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.2, increment: 0.2, cap: 1000,
        }),
      },
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.1, increment: 0.1, cap: 800,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2000
  // ===========================================================================
  bladeStorm: {
    id: 'bladeStorm',
    name: () => t('skill.bladeStorm.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 30 + level * 0.4,
    cooldown: () => 3500,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blade-storm',
    description: () => t('skill.bladeStorm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 30, increment: 3, interval: 50, bonus: 0.1,
      }),
      damagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 0.5, power: 0.6,
      }),
      armorPenetration: getScalingFlat({
        level, base: 20, increment: 20, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'powerStrike',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.3, cap: 2000,
        }),
      },
      {
        sourceSkillId: 'groundSlam',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.25, cap: 1500,
        }),
      },
    ],
  },
  ironFortress: {
    id: 'ironFortress',
    name: () => t('skill.ironFortress.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'iron-fortress',
    description: () => t('skill.ironFortress'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
      allResistancePerLevel: getScalingFlat({
        level, base: 0.005, increment: 0.005, interval: 50, bonus: 0,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.5, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3000
  // ===========================================================================
  titanStrength: {
    id: 'titanStrength',
    name: () => t('skill.titanStrength.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'titan-strength',
    description: () => t('skill.titanStrength'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
      strengthPerLevel: getScalingFlat({
        level, base: 0.0055, increment: 0.0055, interval: 50, bonus: 0,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'warlord',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.2, cap: 2500,
        }),
      },
    ],
  },
  heroicStand: {
    id: 'heroicStand',
    name: () => t('skill.heroicStand.name'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 150000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'heroic-stand',
    description: () => t('skill.heroicStand'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      allResistance: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.15,
      }),
      extraDamageFromAllResistancesPercent: Math.min(getScalingFlat({
        level, base: 0.005, increment: 0.001, interval: 50, bonus: 0,
      }), 2),
    }),
  },

  // ===========================================================================
  // TIER 5000
  // ===========================================================================
  legendaryWarlord: {
    id: 'legendaryWarlord',
    name: () => t('skill.legendaryWarlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'legendary-warlord',
    description: () => t('skill.legendaryWarlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.1,
      }),
      fireDamagePerLevel: getScalingFlat({
        level, base: 0.01, increment: 0.01, interval: 50, bonus: 0,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'berserk',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.5, cap: 5000,
        }),
      },
    ],
  },
  eternalGuardian: {
    id: 'eternalGuardian',
    name: () => t('skill.eternalGuardian.name'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.35,
    cooldown: () => 110000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'eternal-guardian',
    description: () => t('skill.eternalGuardian'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      lifePerHitPerLevel: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.15,
      }),
      reduceEnemyDamagePercent: Math.min(getScalingPercent({
        level, base: 0.02, softcap: 2000, linear: 0.01, power: 0.6,
      }), 20),
    }),
  },

  // ===========================================================================
  // SPECIALIZATION
  // ===========================================================================
  animatedWeapons: {
    id: 'animatedWeapons',
    name: () => t('skill.animatedWeapons.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(5 + getScalingPercent({
          level, base: 0.1, softcap: 2000, linear: 0.1, power: 0.6,
        }), 120),
        attackSpeed: hero.stats.attackSpeed,
        canCrit: true,
      };
    },
    manaCost: (level) => 30 + level * 1,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'animated-weapons',
    description: () => t('skill.animatedWeapons'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    isVisible: () => hero.stats.animatedWeaponsUnlocked > 0,
  },
};