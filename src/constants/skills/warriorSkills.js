import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy, getSkillStatBonus } from '../../common.js';
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle',
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
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive',
      }),
      extraDamageFromArmorPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromArmorPercent', skillType: 'passive', scale: { max: 1 },
      }),
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 1 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'groundSlam',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 5000,
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
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2, increment: 1.6 },
      }),
      extraDamageFromLifePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifePercent', skillType: 'passive',
      }),
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'buff', scale: { base: 2 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'buff',
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
      lifeRegenOfTotalPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenOfTotalPercent', skillType: 'passive',
      }),
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive',
      }),
      extraDamageFromLifeRegenPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifeRegenPercent', skillType: 'passive',
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
      damage: getSkillStatBonus({
        level,
        statKey: 'damage',
        skillType: 'instant',
        scale: {
          base: 5, increment: 4, bonus: 2.5,
        },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1.5, linear: 0.9 },
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
      armorPenetration: getSkillStatBonus({
        level, statKey: 'armorPenetration', skillType: 'passive',
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'powerStrike',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1.5, increment: 0.5, cap: 500,
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
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', scale: { base: 1.2, increment: 1.6 },
      }),
      extraDamageFromArmorPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromArmorPercent', skillType: 'buff', scale: { base: 0.8, max: 1 },
      }),
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
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'toggle', scale: { base: 6.25, increment: 4 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'toggle', scale: { base: 1.1 },
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
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { max: 1.25 },
      }),
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'passive', scale: { base: 1.8, increment: 1.1 },
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
      allAttributes: getSkillStatBonus({
        level, statKey: 'allAttributes', skillType: 'passive', scale: { base: 2, increment: 2 },
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', scale: { base: 1.66, increment: 2 },
      }),
      critDamage: getSkillStatBonus({
        level, statKey: 'critDamage', skillType: 'passive', scale: { base: 0.1, max: 1.4 },
      }),
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
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', scale: { base: 1, increment: 1 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'buff', scale: { base: 1, increment: 1 },
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 6, increment: 1 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1.2 },
      }),
      armorPenetration: getSkillStatBonus({
        level, statKey: 'armorPenetration', skillType: 'instant', scale: { base: 0.66, increment: 1.33 },
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
    effect: (level) => ({}),
    synergies: [
      {
        sourceSkillId: 'toughness',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
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
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 2, increment: 2 },
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
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'buff', scale: { base: 1.33, increment: 1.33 },
      }),
      extraDamageFromAllResistancesPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromAllResistancesPercent', skillType: 'buff', scale: { base: 0.5, max: 1.8 },
      }),
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
      fireDamage: getSkillStatBonus({
        level,
        statKey: 'fireDamage',
        skillType: 'passive',
        scale: {
          base: 6, increment: 3, bonus: 1.5,
        },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'berserk',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 5000,
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
      reduceEnemyDamagePercent: getSkillStatBonus({
        level, statKey: 'reduceEnemyDamagePercent', skillType: 'buff', scale: { base: 0.4, max: 1 },
      }),
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
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 1, max: 0.6 },
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
