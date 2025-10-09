import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Paladin skills extracted from skills.js
export const PALADIN_SKILLS = {
  // Tier 1 Skills
  holyLight: {
    id: 'holyLight',
    name: () => t('Holy Light'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 3 + level * 0.25,
    cooldown: () => 6000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'light',
    description: () => t('skill.holyLight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: scaleUpFlat(level, 5, 5, 0.2),
      lifePercent: Math.min(scaleDownFlat(level, 0.065, 5, 50), 5),
    }),
  },
  smite: {
    id: 'smite',
    name: () => t('Smite'),
    type: () => 'toggle',
    manaCost: (level) => 1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'smite',
    description: () => t('skill.smite'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 1),
      damagePercent: scaleDownFlat(level),
      fireDamage: scaleUpFlat(level, 2),
      fireDamagePercent: scaleDownFlat(level, 2),
    }),
  },
  shieldBash: {
    id: 'shieldBash',
    name: () => t('Shield Bash'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 3 + level * 0.125,
    cooldown: () => 4500,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bash',
    description: () => t('skill.shieldBash'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 2),
      damagePercent: scaleDownFlat(level, 4),
    }),
  },
  divineProtection: {
    id: 'divineProtection',
    name: () => t('Divine Protection'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'protection',
    description: () => t('skill.divineProtection'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 2),
      armorPercent: scaleDownFlat(level, 2),
      thornsDamage: scaleUpFlat(level, 4, 6),
      thornsDamagePercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 10 Skills
  consecration: {
    id: 'consecration',
    name: () => t('Consecration'),
    type: () => 'buff',
    manaCost: (level) => 12 + level * 0.75,
    cooldown: () => 70000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'consecration',
    description: () => t('skill.consecration'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: scaleDownFlat(level, 5),
      coldDamagePercent: scaleDownFlat(level, 5),
      lightningDamagePercent: scaleDownFlat(level, 5),
    }),
  },
  greaterHealing: {
    id: 'greaterHealing',
    name: () => t('Greater Healing'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 8 + level * 0.375,
    cooldown: () => 18000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'heal',
    description: () => t('skill.greaterHealing'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      life: scaleUpFlat(level, 8),
      lifePercent: Math.min(scaleDownFlat(level, 0.25), 20),
    }),
  },

  // Tier 25 Skills
  divineShield: {
    id: 'divineShield',
    name: () => t('Divine Shield'),
    type: () => 'buff',
    manaCost: (level) => 13 + level * 0.625,
    cooldown: () => 47000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-shield',
    description: () => t('skill.divineShield'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      armor: scaleUpFlat(level, 4),
      armorPercent: scaleDownFlat(level, 6),
      blockChance: Math.min(scaleDownFlat(level, 0.2), 25),
    }),
  },
  auraOfLight: {
    id: 'auraOfLight',
    name: () => t('Aura of Light'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-aura',
    description: () => t('skill.auraOfLight'),
    maxLevel: () => Infinity,
    effect: (level) => ({
      life: scaleUpFlat(level, 15),
      lifePercent: scaleDownFlat(level, 1.2),
      allResistance: Math.min(scaleUpFlat(level, 0.25), 30),
    }),
  },
  thornedBulwark: {
    id: 'thornedBulwark',
    name: () => t('Thorned Bulwark'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'thorned-bulwark',
    description: () => t('skill.thornedBulwark'),
    maxLevel: () => 1,
    effect: (level) => ({
      enduranceThornsDamagePerPoint: level > 0 ? 0.3 : 0,
    }),
  },

  // Tier 50 Skills
  wrathOfTheHeavens: {
    id: 'wrathOfTheHeavens',
    name: () => t('Wrath of the Heavens'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 10 + level * 1,
    cooldown: () => 12400,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'wrath',
    description: () => t('skill.wrathOfTheHeavens'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const damagePercent = scaleDownFlat(level, 2);
      const lightningDamage = scaleUpFlat(level, 8);
      const lightningDamagePercent = scaleDownFlat(level, 5);
      const airDamagePercent = scaleDownFlat(level, 3);
      return {
        damagePercent: damagePercent * 4,
        lightningDamage: lightningDamage * 4,
        lightningDamagePercent: lightningDamagePercent * 4,
        airDamagePercent: airDamagePercent * 4,
      };
    },
  },
  beaconOfFaith: {
    id: 'beaconOfFaith',
    name: () => t('Beacon of Faith'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'beacon',
    description: () => t('skill.beaconOfFaith'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: scaleUpFlat(level, 20),
      lifeRegenPercent: scaleDownFlat(level, 0.5),
      lifeRegenOfTotalPercent: Math.min(scaleDownFlat(level, 0.1), 1),
      extraDamageFromLifePercent: Math.min(scaleDownFlat(level, 0.0065), 0.75),
    }),
  },

  // Tier 75 Skills
  holyBarrier: {
    id: 'holyBarrier',
    name: () => t('Holy Barrier'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.875,
    cooldown: () => 44000,
    duration: () => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'barrier',
    description: () => t('skill.holyBarrier'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      vitality: scaleUpFlat(level, 4),
      vitalityPercent: scaleDownFlat(level, 0.5),
      resurrectionChance: Math.min(scaleDownFlat(level, 0.1), 20),
    }),
  },

  AidFromHeaven: {
    id: 'AidFromHeaven',
    name: () => t('Aid From Heaven'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: Math.min(scaleDownFlat(level, 1), 120),
        damage: scaleUpFlat(level, 4),
        attackSpeed: Math.min(Math.max(0.9, 0.7 + scaleDownFlat(level, 0.003)), 2.2),
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

  // Tier 100 Skills
  divineWrath: {
    id: 'divineWrath',
    name: () => t('Divine Wrath'),
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.3,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath',
    description: () => t('skill.divineWrath'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 5),
      lifePerHit: scaleUpFlat(level, 2, 5, 0.2),
    }),
  },
  guardianAngel: {
    id: 'guardianAngel',
    name: () => t('Guardian Angel'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'angel',
    description: () => t('skill.guardianAngel'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: scaleDownFlat(level, 0.5),
      resurrectionChance: Math.min(scaleDownFlat(level, 0.1), 50),
      lifeRegen: scaleUpFlat(level, 2, 5, 0.2),
      lifeRegenPercent: scaleDownFlat(level, 0.5),
      allResistance: scaleUpFlat(level, 8),
    }),
  },

  // Tier 200 Skills
  ascension: {
    id: 'ascension',
    name: () => t('Ascension'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'ascension',
    description: () => t('skill.ascension'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 0.75),
      endurance: scaleUpFlat(level, 3),
      endurancePercent: scaleDownFlat(level, 2),
      vitality: scaleUpFlat(level, 3),
      vitalityPercent: scaleDownFlat(level, 2),
      attackRatingPercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 1200 Skills
  celestialGuard: {
    id: 'celestialGuard',
    name: () => t('Celestial Guard'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'celestial-guard',
    description: () => t('skill.celestialGuard'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armorPercent: scaleDownFlat(level, 2),
      blockChance: Math.min(scaleDownFlat(level, 0.1), 25),
      lifeRegenPercent: scaleDownFlat(level),
    }),
  },
  holyCrusade: {
    id: 'holyCrusade',
    name: () => t('Holy Crusade'),
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 0.625,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'holy-crusade',
    description: () => t('skill.holyCrusade'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      fireDamagePercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 2000 Skills
  radiantAegis: {
    id: 'radiantAegis',
    name: () => t('Radiant Aegis'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 1000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'radiant-aegis',
    description: () => t('skill.radiantAegis'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 15, 4, 0.1),
      allResistance: scaleUpFlat(level, 12.25, 4, 0.1),
      thornsDamage: scaleUpFlat(level, 20, 4, 1),
    }),
  },
  divineJudgment: {
    id: 'divineJudgment',
    name: () => t('Divine Judgment'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 20 + level * 1,
    cooldown: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'divine-judgment',
    description: () => t('skill.divineJudgment'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const damage = scaleUpFlat(level, 15);
      const lightningDamagePercent = scaleDownFlat(level, 3);
      const fireDamagePercent = scaleDownFlat(level, 3);
      return {
        damage: damage * 4,
        lightningDamagePercent: lightningDamagePercent * 4,
        fireDamagePercent: fireDamagePercent * 4,
      };
    },
  },

  // Tier 3000 Skills
  angelicResurgence: {
    id: 'angelicResurgence',
    name: () => t('Angelic Resurgence'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'angelic-resurgence',
    description: () => t('skill.angelicResurgence'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: Math.min(scaleDownFlat(level, 0.1), 50),
      lifePercent: scaleDownFlat(level, 1.5),
      attackSpeedPercent: scaleDownFlat(level, 0.5),
    }),
  },
  sacredGround: {
    id: 'sacredGround',
    name: () => t('Sacred Ground'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 140000,
    duration: () => 45000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'sacred-ground',
    description: () => t('skill.sacredGround'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: scaleUpFlat(level, 5, 5, 1),
      lifeRegenPercent: scaleDownFlat(level, 1.5),
      manaRegenPercent: scaleDownFlat(level),
    }),
  },

  // Tier 5000 Skills
  eternalLight: {
    id: 'eternalLight',
    name: () => t('Eternal Light'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'eternal-light',
    description: () => t('skill.eternalLight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 2),
      allResistance: scaleUpFlat(level, 15),
      lifePercent: scaleDownFlat(level, 2),
    }),
  },
  championOfFaith: {
    id: 'championOfFaith',
    name: () => t('Champion of Faith'),
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'champion-of-faith',
    description: () => t('skill.championOfFaith'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 3),
      fireDamagePercent: scaleDownFlat(level, 4),
    }),
  },
};
