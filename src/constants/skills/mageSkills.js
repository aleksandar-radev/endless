import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Mage skills
export const MAGE_SKILLS = {
  // Tier 1 Skills
  magicMissile: {
    id: 'magicMissile',
    name: () => t('skill.magicMissile.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'missile',
    description: () => t('skill.magicMissile'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 1 },
      }),
      waterDamagePerLevel: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', perLevel: true,
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },
  arcaneIntellect: {
    id: 'arcaneIntellect',
    name: () => t('skill.arcaneIntellect.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'intellect',
    description: () => t('skill.arcaneIntellect'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 1 },
      }),
      wisdomPerLevel: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', perLevel: true,
      }),
      perseverance: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', scale: { base: 1 },
      }),
      perseverancePerLevel: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', perLevel: true,
      }),
    }),
  },

  // Tier 10 Skills
  frostBolt: {
    id: 'frostBolt',
    name: () => t('skill.frostBolt.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 3 + level * 0.25,
    cooldown: () => 5700,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'frost-bolt',
    description: () => t('skill.frostBolt'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 2, increment: 1.5 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', perLevel: true,
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },
  fireBlast: {
    id: 'fireBlast',
    name: () => t('skill.fireBlast.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.25,
    cooldown: () => 7600,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'fire-blast',
    description: () => t('skill.fireBlast'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', scale: { base: 3, increment: 2 },
      }),
      fireDamagePerLevel: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'instant', perLevel: true,
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },

  // Tier 25 Skills
  mindControl: {
    id: 'mindControl',
    name: () => t('skill.mindControl.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mind-control',
    description: () => t('skill.mindControl'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      intelligence: getSkillStatBonus({
        level, statKey: 'intelligence', skillType: 'passive', scale: { base: 1 },
      }),
      intelligencePerLevel: getSkillStatBonus({
        level, statKey: 'intelligence', skillType: 'passive', perLevel: true,
      }),
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 2.5, increment: 2 },
      }),
      wisdomPerLevel: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', perLevel: true,
      }),
    }),
  },
  manaShield: {
    id: 'manaShield',
    name: () => t('skill.manaShield.name'),
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.625,
    cooldown: () => 30000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'mana-shield',
    description: () => t('skill.manaShield'),
    maxLevel: () => 250,
    effect: (level) => ({
      manaShieldPercent: Math.min(getSkillStatBonus({
        level, statKey: 'manaShieldPercent', skillType: 'buff', scale: { base: 1 },
      }), 100),
    }),
  },
  crimsonAegis: {
    id: 'crimsonAegis',
    name: () => t('skill.crimsonAegis.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    isVisible: () => hero.stats.crimsonAegisSkillUnlocked > 0,
    icon: () => 'crimson-aegis',
    description: () => t('skill.crimsonAegis'),
    maxLevel: () => 200,
    effect: (level) => ({
      damageTakenReductionPercent: Math.min(getSkillStatBonus({
        level, statKey: 'damageTakenReductionPercent', skillType: 'passive', scale: { base: 1 },
      }), 35),
    }),
  },
  crimsonDrain: {
    id: 'crimsonDrain',
    name: () => t('skill.crimsonDrain.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    isVisible: () => hero.stats.bloodSiphonSkillUnlocked > 0,
    icon: () => 'crimson-drain',
    description: () => t('skill.crimsonDrain'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'passive', scale: { base: 2.5, increment: 2 },
      }),
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'passive', perLevel: true,
      }),
    }),
  },

  // Tier 50 Skills
  resourceInfusion: {
    id: 'resourceInfusion',
    name: () => t('skill.resourceInfusion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'resource-infusion',
    description: () => t('skill.resourceInfusion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', scale: { base: 2.5, increment: 2.5 },
      }),
      manaPerLevel: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', perLevel: true,
      }),
      extraDamageFromManaPercent: Math.min(getSkillStatBonus({
        level, statKey: 'extraDamageFromManaPercent', skillType: 'passive', scale: { base: 1 },
      }) / 100, 2),
    }),
  },
  iceStorm: {
    id: 'iceStorm',
    name: () => t('skill.iceStorm.name'),
    type: () => 'buff',
    manaCost: (level) => 15 + level * 0.75,
    cooldown: () => 64000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'ice-storm',
    description: () => t('skill.iceStorm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'buff', scale: { base: 2.5, increment: 2 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'buff', perLevel: true,
      }),
      waterDamagePercent: getSkillStatBonus({
        level, statKey: 'waterDamagePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
    }),
  },
  arcaneFocus: {
    id: 'arcaneFocus',
    name: () => t('skill.arcaneFocus.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'arcane-focus',
    description: () => t('skill.arcaneFocus'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 3.33, increment: 2 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', perLevel: true,
      }),
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'passive', scale: { base: 0.33, increment: 0.2 },
      }),
      attackRatingPerLevel: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'passive', perLevel: true,
      }),
    }),
  },

  // Tier 75 Skills
  pyroclasm: {
    id: 'pyroclasm',
    name: () => t('skill.pyroclasm.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.75,
    cooldown: () => 72000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pyroclasm',
    description: () => t('skill.pyroclasm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'buff', scale: { base: 2.5, increment: 2 },
      }),
      fireDamagePerLevel: getSkillStatBonus({
        level, statKey: 'fireDamage', skillType: 'buff', perLevel: true,
      }),
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'buff', scale: { base: 1.875 },
      }),
    }),
  },
  timeWarp: {
    id: 'timeWarp',
    name: () => t('skill.timeWarp.name'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 0.875,
    cooldown: () => 96000,
    duration: () => 15000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'time-warp',
    description: () => t('skill.timeWarp'),
    maxLevel: () => 300,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66 },
      }), 100),
    }),
  },

  // Tier 100 Skills
  arcanePower: {
    id: 'arcanePower',
    name: () => t('skill.arcanePower.name'),
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 0.375,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'arcane-power',
    description: () => t('skill.arcanePower'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', scale: { base: 3.75, increment: 3 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'toggle', perLevel: true,
      }),
    }),
  },
  summonElemental: {
    id: 'summonElemental',
    name: () => t('skill.summonElemental.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 2.5 },
        }), 100),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 7.5, increment: 3 },
        }),
        attackSpeed: 1.3,
        fireDamage: getSkillStatBonus({
          level, statKey: 'fireDamage', skillType: 'summon', scale: { base: 12.5, increment: 5 },
        }),
        airDamage: getSkillStatBonus({
          level, statKey: 'airDamage', skillType: 'summon', scale: { base: 12.5, increment: 5 },
        }),
        coldDamage: getSkillStatBonus({
          level, statKey: 'coldDamage', skillType: 'summon', scale: { base: 12.5, increment: 5 },
        }),
      };
    },
    manaCost: (level) => 30 + level * 1,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'summon-elemental',
    description: () => t('skill.summonElemental'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
  },

  // Tier 200 Skills
  archmage: {
    id: 'archmage',
    name: () => t('skill.archmage.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'archmage',
    description: () => t('skill.archmage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 3.75, increment: 3 },
      }),
      wisdomPerLevel: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', perLevel: true,
      }),
      mana: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', scale: { base: 5, increment: 5 },
      }),
      manaPerLevel: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', perLevel: true,
      }),
    }),
  },

  // Tier 1200 Skills
  arcaneMight: {
    id: 'arcaneMight',
    name: () => t('skill.arcaneMight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'arcane-might',
    description: () => t('skill.arcaneMight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 10, increment: 5 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', perLevel: true,
      }),
      manaRegen: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', scale: { base: 10, increment: 10 },
      }),
      manaRegenPerLevel: getSkillStatBonus({
        level, statKey: 'manaRegen', skillType: 'passive', perLevel: true,
      }),
    }),
  },
  voidBlast: {
    id: 'voidBlast',
    name: () => t('skill.voidBlast.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 17000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'void-blast',
    description: () => t('skill.voidBlast'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', scale: { base: 7, increment: 2.5 },
      }),
      waterDamagePerLevel: getSkillStatBonus({
        level, statKey: 'waterDamage', skillType: 'instant', perLevel: true,
      }),
      elementalPenetrationPercent: getSkillStatBonus({
        level, statKey: 'elementalPenetrationPercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },

  // Tier 2000 Skills
  chronomancerSurge: {
    id: 'chronomancerSurge',
    name: () => t('skill.chronomancerSurge.name'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 120000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'chronomancer-surge',
    description: () => t('skill.chronomancerSurge'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: Math.min(getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66 },
      }), 150),
      cooldownReductionPercent: Math.min(getSkillStatBonus({
        level, statKey: 'cooldownReductionPercent', skillType: 'buff', scale: { base: 1 },
      }), 50),
    }),
  },
  starFire: {
    id: 'starFire',
    name: () => t('skill.starFire.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'star-fire',
    description: () => t('skill.starFire'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'instant', scale: { base: 1 },
      }),
    }),
  },

  // Tier 3000 Skills
  manaOverflow: {
    id: 'manaOverflow',
    name: () => t('skill.manaOverflow.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'mana-overflow',
    description: () => t('skill.manaOverflow'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', scale: { base: 5, increment: 5 },
      }),
      manaPerLevel: getSkillStatBonus({
        level, statKey: 'mana', skillType: 'passive', perLevel: true,
      }),
    }),
  },
  dimensionalRift: {
    id: 'dimensionalRift',
    name: () => t('skill.dimensionalRift.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 45 + level * 1.25,
    cooldown: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'dimensional-rift',
    description: () => t('skill.dimensionalRift'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      ignoreAllEnemyResistances: 1,
    }),
  },

  // Tier 5000 Skills
  supremeSorcery: {
    id: 'supremeSorcery',
    name: () => t('skill.supremeSorcery.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'supreme-sorcery',
    description: () => t('skill.supremeSorcery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', scale: { base: 16.66, increment: 10 },
      }),
      elementalDamagePerLevel: getSkillStatBonus({
        level, statKey: 'elementalDamage', skillType: 'passive', perLevel: true,
      }),
      wisdom: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', scale: { base: 5, increment: 4 },
      }),
      wisdomPerLevel: getSkillStatBonus({
        level, statKey: 'wisdom', skillType: 'passive', perLevel: true,
      }),
    }),
  },
  apocalypse: {
    id: 'apocalypse',
    name: () => t('skill.apocalypse.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 60 + level * 1.25,
    cooldown: () => 27000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apocalypse',
    description: () => t('skill.apocalypse'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: getSkillStatBonus({
        level, statKey: 'fireDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      lightningDamagePercent: getSkillStatBonus({
        level, statKey: 'lightningDamagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
    }),
  },

  // Specialization Skills
  weaponIllusion: {
    id: 'weaponIllusion',
    name: () => t('skill.weaponIllusion.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: 5 + getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 0.5 },
        }),
        attackSpeed: hero.stats.attackSpeed,
        canCrit: true,
      };
    },
    manaCost: (level) => 30 + level * 1,
    cooldown: () => 48000,
    duration: () => 22000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'weapon-illusion',
    description: () => t('skill.weaponIllusion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    isVisible: () => hero.stats.weaponIllusionUnlocked > 0,
  },
};
