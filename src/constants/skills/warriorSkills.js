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
      // NERF: Increased interval to 100 to discourage pure spam.
      // Players must seek multipliers from other skills to scale this effectively.
      damage: getScalingFlat({
        level, base: 3, increment: 1, interval: 50, bonus: 0.1,
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
      }) / 100, 2.5), // Buffed cap slightly
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
      // Acts as a "Big Hit" burst source
      damage: getScalingFlat({
        level, base: 10, increment: 5, interval: 50, bonus: 0.2,
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
        level, base: 4, increment: 0.5, interval: 100, bonus: 0.1,
      }),
      perseverance: getScalingFlat({
        level, base: 2.5, increment: 0.3, interval: 100, bonus: 0.1,
      }),
      extraDamageFromLifePercent: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 1),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        // Increased cap significantly to reward leveling Toughness
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 0.5, cap: 500,
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
        level, base: 6, increment: 1.33, interval: 50, bonus: 0.2,
      }),
      // STRATEGY: High % Damage here multiplies the Flat Damage from Bash
      damagePercent: getScalingPercent({
        level, base: 8, softcap: 2000, linear: 0.2, power: 0.65,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bash',
        // STRATEGY: Huge synergy. Leveling Bash makes Battle Cry stronger.
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
        level, base: 20, increment: 2, interval: 1, bonus: 0.15,
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
      extraDamageFromArmorPercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.15, power: 0.6,
      }) / 100, 5.0),
      armor: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.1,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.8, cap: 1000,
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
        level, base: 30, increment: 8, interval: 50, bonus: 0.15,
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
      // STRATEGY: Changed from Attack Rating to Attack Speed.
      // Speed * Damage = DPS. This forces players to level this skill.
      attackSpeedPercent: Math.min(getScalingPercent({
        level, base: 1, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 300), // Cap at +300% Attack Speed
      attackRating: getScalingFlat({
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'ironWill',
        // High scaling synergy
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.6, cap: 800,
        }),
      },
    ],
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
      }) / 100, 2),
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
        level, base: 15, increment: 3, interval: 50, bonus: 0.1,
      }),
      attackRating: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
      // Critical Damage multiplier to add another "Pillar" of damage
      critDamage: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 5),
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
      allResistance: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'shieldWall',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 0.8, cap: 1000,
        }),
      },
      {
        sourceSkillId: 'fortitude',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.6, cap: 800,
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
        level, base: 30, increment: 5, interval: 50, bonus: 0.1,
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
          level: sourceLevel, base: 2, increment: 1.0, cap: 2000,
        }),
      },
      {
        sourceSkillId: 'groundSlam',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.8, cap: 1500,
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
        level, base: 25, increment: 4, interval: 50, bonus: 0.1,
      }),
      allResistance: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.15,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 1.0, cap: 2000,
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
        level, base: 10, increment: 2, interval: 50, bonus: 0.15,
      }),
      damage: getScalingFlat({
        level, base: 20, increment: 4, interval: 50, bonus: 0.1,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'warlord',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 1.0, cap: 2500,
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
        level, base: 30, increment: 5, interval: 50, bonus: 0.1,
      }),
      lifeRegen: getScalingFlat({
        level, base: 15, increment: 3, interval: 50, bonus: 0.1,
      }),
      lifeRegenOfTotalPercent: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 5),
    }),
    synergies: [
      {
        sourceSkillId: 'fortitude',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 1.0, cap: 2500,
        }),
      },
    ],
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
      damage: getScalingFlat({
        level, base: 30, increment: 6, interval: 50, bonus: 0.1,
      }),
      critDamage: Math.min(getScalingPercent({
        level, base: 0.5, softcap: 2000, linear: 0.1, power: 0.6,
      }) / 100, 5),
    }),
    synergies: [
      {
        sourceSkillId: 'unstoppableForce',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2.5, increment: 1.5, cap: 5000,
        }),
      },
      {
        sourceSkillId: 'titanStrength',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 2, increment: 1.2, cap: 4000,
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
      }), 25),
      reduceEnemyDamagePercent: Math.min(getScalingPercent({
        level, base: 1.5, softcap: 2000, linear: 0.15, power: 0.6,
      }), 15),
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