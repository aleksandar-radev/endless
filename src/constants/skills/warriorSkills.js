import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy } from '../../common.js';
import { hero } from '../../globals.js';

// Warrior skills extracted from skills.js
export const WARRIOR_SKILLS = {
  // Tier 0 Skills
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
        level, base: 3, increment: 0.5, interval: 50, bonus: 0.2,
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
        level, base: 5, increment: 1, interval: 50, bonus: 0.2,
      }),
      extraDamageFromArmorPercent: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 1.5),
    }),
  },

  // Tier 1 Skills
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
        level, base: 10, increment: 1.5, interval: 50, bonus: 0.2,
      }),
      damagePercent: getScalingPercent({
        level, base: 10, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
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
        level, base: 5, increment: 1, interval: 50, bonus: 0.15,
      }),
      perseverance: getScalingFlat({
        level, base: 5, increment: 1, interval: 50, bonus: 0.15,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.2, power: 0.6,
      }) / 100, 25),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.3, cap: 50,
        }),
      },
    ],
  },

  // Tier 2 Skills
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
        level, base: 5, increment: 1, interval: 50, bonus: 0.2,
      }),
      damagePercent: getScalingPercent({
        level, base: 8, softcap: 2000, linear: 0.5, power: 0.6,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bash',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.5, cap: 75,
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
      }) / 100, 1.5),
      lifeRegen: getScalingFlat({
        level, base: 2, increment: 0.5, interval: 50, bonus: 0.15,
      }),
    }),
  },

  // Tier 3 Skills
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
        level, base: 8, increment: 1.2, interval: 50, bonus: 0.2,
      }),
      damagePercent: getScalingPercent({
        level, base: 20, softcap: 2000, linear: 0.8, power: 0.6,
      }),
    }),
  },

  // Tier 3 Skills
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
        level, base: 20, increment: 2, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'powerStrike',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.4, cap: 60,
        }),
        additionalEffects: (sourceLevel) => ({
          armorPenetration: getScalingFlat({
            level: sourceLevel, base: 5, increment: 0.5, interval: 50, bonus: 0.10000000000000009,
          }),
        }),
      },
    ],
  },

  // Tier 4 Skills
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
      extraDamageFromArmorPercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.15, power: 0.6,
      }) / 100, 2.5),
      armor: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.2,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.5, cap: 80,
        }),
      },
    ],
  },

  // Tier 5 Skills
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
        level, base: 6, increment: 1.5, interval: 50, bonus: 0.2,
      }),
    }),
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
      attackRating: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'ironWill',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.4, cap: 70,
        }),
        additionalEffects: (sourceLevel) => ({
          attackSpeed: Math.min(getScalingPercent({
            level: sourceLevel, base: 0.5, softcap: 2000, linear: 0.05, power: 0.6,
          }) / 100, 0.75),
        }),
      },
    ],
  },

  // Tier 6 Skills
  warlord: {
    id: 'warlord',
    name: () => t('skill.warlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => t('skill.warlordWarrior'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: getScalingFlat({
        level, base: 8, increment: 1.5, interval: 50, bonus: 0.15,
      }),
      vitality: getScalingFlat({
        level, base: 8, increment: 1.5, interval: 50, bonus: 0.15,
      }),
      endurance: getScalingFlat({
        level, base: 8, increment: 1.5, interval: 50, bonus: 0.15,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.4, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 1),
    }),
  },

  // Tier 1200 Skills
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
        level, base: 15, increment: 3, interval: 50, bonus: 0.2,
      }),
      attackRating: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      critDamage: Math.min(getScalingPercent({
        level, base: 0.3, softcap: 2000, linear: 0.05, power: 0.6,
      }) / 100, 1),
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
        level, base: 20, increment: 4, interval: 50, bonus: 0.2,
      }),
      allResistance: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'shieldWall',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.5, cap: 80,
        }),
      },
      {
        sourceSkillId: 'fortitude',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.4, cap: 60,
        }),
      },
    ],
  },

  // Tier 2000 Skills
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
        level, base: 30, increment: 5, interval: 50, bonus: 0.2,
      }),
      damagePercent: getScalingPercent({
        level, base: 15, softcap: 2000, linear: 1, power: 0.6,
      }),
      armorPenetration: getScalingFlat({
        level, base: 20, increment: 3, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'powerStrike',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.6, cap: 100,
        }),
      },
      {
        sourceSkillId: 'groundSlam',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.5, cap: 80,
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
      armor: getScalingFlat({
        level, base: 25, increment: 4, interval: 50, bonus: 0.2,
      }),
      allResistance: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.5, cap: 90,
        }),
      },
    ],
  },

  // Tier 3000 Skills
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
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
      damage: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.2,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'warlord',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.6, cap: 100,
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
      armor: getScalingFlat({
        level, base: 30, increment: 5, interval: 50, bonus: 0.2,
      }),
      lifeRegen: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.2,
      }),
      lifeRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 3),
    }),
    synergies: [
      {
        sourceSkillId: 'fortitude',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.6, cap: 100,
        }),
      },
    ],
  },

  // Tier 5000 Skills
  legendaryWarlord: {
    id: 'legendaryWarlord',
    name: () => t('skill.legendaryWarlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'legendary-warlord',
    description: () => t('skill.legendaryWarlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.2,
      }),
      critDamage: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 2),
    }),
    synergies: [
      {
        sourceSkillId: 'unstoppableForce',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2.5, increment: 0.8, cap: 150,
        }),
      },
      {
        sourceSkillId: 'titanStrength',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.6, cap: 120,
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
    maxLevel: () => 350,
    effect: (level) => ({
      reduceEnemyAttackSpeedPercent: Math.min(getScalingPercent({
        level, base: 2, softcap: 2000, linear: 0.2, power: 0.6,
      }), 15),
      reduceEnemyDamagePercent: Math.min(getScalingPercent({
        level, base: 1.5, softcap: 2000, linear: 0.15, power: 0.6,
      }), 10),
    }),
  },

  // Specialization Skills
  animatedWeapons: {
    id: 'animatedWeapons',
    name: () => t('skill.animatedWeapons.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: 5 + getScalingPercent({
          level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
        }),
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
