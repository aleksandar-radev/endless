import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Paladin skills extracted from skills.js
export const PALADIN_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
  holyLight: {
    id: 'holyLight',
    name: () => t('skill.holyLight.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 3 + level * 0.25,
    cooldown: () => 6000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'light',
    description: () => t('skill.holyLight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'instant', scale: { base: 0.2, increment: 0.2 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },
  smite: {
    id: 'smite',
    name: () => t('skill.smite.name'),
    type: () => 'toggle',
    manaCost: (level) => 1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'smite',
    description: () => t('skill.smite'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 1.66, increment: 1 },
      }),
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'toggle', scale: { base: 1.25, increment: 1 },
      }),
    }),
  },
  shieldBash: {
    id: 'shieldBash',
    name: () => t('skill.shieldBash.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 3 + level * 0.125,
    cooldown: () => 5500,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bash',
    description: () => t('skill.shieldBash'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 2, increment: 1 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },
  divineProtection: {
    id: 'divineProtection',
    name: () => t('skill.divineProtection.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'protection',
    description: () => t('skill.divineProtection'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const buffEffectiveness = 1 + (hero.stats.divineProtectionBuffEffectivenessPercent || 0);
      return {
        thornsDamage: getSkillStatBonus({
          level, statKey: 'thornsDamage', skillType: 'passive', scale: { base: 1 },
        }) * buffEffectiveness,
        thornsDamagePercent: getSkillStatBonus({
          level, statKey: 'thornsDamagePercent', skillType: 'passive', scale: { base: 1 },
        }) * buffEffectiveness,
      };
    },
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
  consecration: {
    id: 'consecration',
    name: () => t('skill.consecration.name'),
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.75,
    cooldown: () => 70000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'consecration',
    description: () => t('skill.consecration'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'buff', scale: { base: 1.25, increment: 1 },
      }),
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'buff', scale: { base: 1.25, increment: 1 },
      }),
    }),
  },
  greaterHealing: {
    id: 'greaterHealing',
    name: () => t('skill.greaterHealing.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 8 + level * 0.375,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'heal',
    description: () => t('skill.greaterHealing'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'instant', scale: { base: 0.4, increment: 0.4 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'instant', scale: { base: 1, max: 0.2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'holyLight',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2
  // ===========================================================================
  divineShield: {
    id: 'divineShield',
    name: () => t('skill.divineShield.name'),
    type: () => 'buff',
    manaCost: (level) => 13 + level * 0.625,
    cooldown: () => 47000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-shield',
    description: () => t('skill.divineShield'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', scale: { base: 0.4, increment: 0.4 },
      }),
      armorPercent: getSkillStatBonus({
        level, statKey: 'armorPercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      blockChance: getSkillStatBonus({
        level, statKey: 'blockChance', skillType: 'buff', scale: { base: 0.8, max: 0.33 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'divineProtection',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  auraOfLight: {
    id: 'auraOfLight',
    name: () => t('skill.auraOfLight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-aura',
    description: () => t('skill.auraOfLight'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'passive', scale: { base: 0.5, increment: 0.5 },
      }),
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      allResistance: getSkillStatBonus({
        level,
        statKey: 'allResistance',
        skillType: 'passive',
        scale: {
          base: 0.5, increment: 0.5, max: 0.5,
        },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'holyLight',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  thornedBulwark: {
    id: 'thornedBulwark',
    name: () => t('skill.thornedBulwark.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'thorned-bulwark',
    description: () => t('skill.thornedBulwark'),
    maxLevel: () => 1,
    effect: (level) => ({
      enduranceThornsDamagePerPoint: getSkillStatBonus({
        level, statKey: 'enduranceThornsDamagePerPoint', skillType: 'passive', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'divineProtection',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.1, increment: 0.1, cap: 50,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
  wrathOfTheHeavens: {
    id: 'wrathOfTheHeavens',
    name: () => t('skill.wrathOfTheHeavens.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 10 + level * 1,
    cooldown: () => 12400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'wrath',
    description: () => t('skill.wrathOfTheHeavens'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'consecration',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  beaconOfFaith: {
    id: 'beaconOfFaith',
    name: () => t('skill.beaconOfFaith.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'beacon',
    description: () => t('skill.beaconOfFaith'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'passive', scale: { base: 0.6, increment: 0.6 },
      }),
      extraDamageFromLifePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifePercent', skillType: 'passive', scale: { base: 0.2, max: 0.6 },
      }),
    }),
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
  holyBarrier: {
    id: 'holyBarrier',
    name: () => t('skill.holyBarrier.name'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.875,
    cooldown: () => 44000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'barrier',
    description: () => t('skill.holyBarrier'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'buff', scale: { base: 1.66, increment: 2.5 },
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'buff', scale: { base: 1 },
      }),
      resurrectionChance: getSkillStatBonus({
        level, statKey: 'resurrectionChance', skillType: 'buff', scale: { base: 2, max: 0.4 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'divineShield',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  AidFromHeaven: {
    id: 'AidFromHeaven',
    name: () => t('skill.AidFromHeaven.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2.5, max: 0.6 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 7.5, increment: 3 },
        }),
        attackSpeed: Math.max(0.9, 0.7 + getSkillStatBonus({
          level, statKey: 'attackSpeedPercent', skillType: 'summon', scale: { base: 2, max: 150 },
        }) / 100),
      };
    },
    manaCost: (level) => 20 + level * 0.875,
    cooldown: () => 66000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'aid-from-heaven',
    description: () => t('skill.AidFromHeaven'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
  },

  // ===========================================================================
  // TIER 5
  // ===========================================================================
  divineWrath: {
    id: 'divineWrath',
    name: () => t('skill.divineWrath.name'),
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.3,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath',
    description: () => t('skill.divineWrath'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 1.42 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', scale: { base: 1.66, increment: 1.25 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'smite',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  guardianAngel: {
    id: 'guardianAngel',
    name: () => t('skill.guardianAngel.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'angel',
    description: () => t('skill.guardianAngel'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'passive', scale: { base: 2.5, increment: 2 },
      }),
      resurrectionChance: getSkillStatBonus({
        level, statKey: 'resurrectionChance', skillType: 'passive', scale: { base: 2, max: 1 },
      }),
      extraDamageFromLifeRegenPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifeRegenPercent', skillType: 'passive', scale: { base: 1, increment: 0.5 },
      }),
    }),
  },

  // Tier 200 Skills
  ascension: {
    id: 'ascension',
    name: () => t('skill.ascension.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'ascension',
    description: () => t('skill.ascension'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      endurance: getSkillStatBonus({
        level, statKey: 'endurance', skillType: 'passive', scale: { base: 5, increment: 4 },
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2.5, increment: 4 },
      }),
    }),
  },

  // Tier 1200 Skills
  celestialGuard: {
    id: 'celestialGuard',
    name: () => t('skill.celestialGuard.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'celestial-guard',
    description: () => t('skill.celestialGuard'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 2, increment: 2 },
      }),
      blockChance: getSkillStatBonus({
        level, statKey: 'blockChance', skillType: 'passive', scale: { base: 2, cap: 0.5 },
      }),
      extraDamageFromArmorPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromArmorPercent', skillType: 'passive', scale: { base: 0.2 },
      }),
    }),
  },
  holyCrusade: {
    id: 'holyCrusade',
    name: () => t('skill.holyCrusade.name'),
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 0.625,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'holy-crusade',
    description: () => t('skill.holyCrusade'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 0.71 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'divineWrath',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // Tier 2000 Skills
  radiantAegis: {
    id: 'radiantAegis',
    name: () => t('skill.radiantAegis.name'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 1000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'radiant-aegis',
    description: () => t('skill.radiantAegis'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'buff', scale: { base: 1.4, increment: 1.4 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'buff', scale: { base: 1.66, increment: 1.66 },
      }),
      thornsDamage: getSkillStatBonus({
        level, statKey: 'thornsDamage', skillType: 'buff', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'divineShield',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  divineJudgment: {
    id: 'divineJudgment',
    name: () => t('skill.divineJudgment.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 20 + level * 1,
    cooldown: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'divine-judgment',
    description: () => t('skill.divineJudgment'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 8, increment: 2 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'wrathOfTheHeavens',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // Tier 3000 Skills
  angelicResurgence: {
    id: 'angelicResurgence',
    name: () => t('skill.angelicResurgence.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'angelic-resurgence',
    description: () => t('skill.angelicResurgence'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: getSkillStatBonus({
        level, statKey: 'resurrectionChance', skillType: 'passive', scale: { base: 5, cap: 1 },
      }),
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'passive', scale: { base: 8, increment: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'guardianAngel',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  sacredGround: {
    id: 'sacredGround',
    name: () => t('skill.sacredGround.name'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 140000,
    duration: () => 45000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'sacred-ground',
    description: () => t('skill.sacredGround'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', scale: { base: 6.66, increment: 3 },
      }),
      lifeRegenPercent: getSkillStatBonus({
        level, statKey: 'lifeRegenPercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      manaRegenPercent: getSkillStatBonus({
        level, statKey: 'manaRegenPercent', skillType: 'buff', scale: { base: 1 },
      }),
    }),
  },

  // Tier 5000 Skills
  eternalLight: {
    id: 'eternalLight',
    name: () => t('skill.eternalLight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'eternal-light',
    description: () => t('skill.eternalLight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 4, increment: 2 },
      }),
      extraDamageFromAllResistancesPercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromAllResistancesPercent', skillType: 'passive', scale: { base: 1 },
      }),
    }),
  },
  championOfFaith: {
    id: 'championOfFaith',
    name: () => t('skill.championOfFaith.name'),
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'champion-of-faith',
    description: () => t('skill.championOfFaith'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 1, increment: 1 },
      }),
      lightningDamage: getSkillStatBonus({
        level, statKey: 'lightningDamage', skillType: 'toggle', scale: { base: 1.42 },
      }),
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'toggle', scale: { base: 1.42 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'holyCrusade',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2500,
        }),
      },
    ],
  },
};