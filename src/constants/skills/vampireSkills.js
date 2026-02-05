import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingSynergy, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Vampire skills extracted from skills.js
export const VAMPIRE_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
  bloodSiphon: {
    id: 'bloodSiphon',
    name: () => t('skill.bloodSiphon.name'),
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'blood',
    description: () => t('skill.bloodSiphon'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', scale: { base: 0.66, increment: 0.625 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 0.66, increment: 0.5 },
      }),
    }),
  },
  nightStalker: {
    id: 'nightStalker',
    name: () => t('skill.nightStalker.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'moon',
    description: () => t('skill.nightStalker'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const buffEffectiveness = 1 + (hero.stats.nightStalkerBuffEffectivenessPercent || 0);
      return {
        agility: getSkillStatBonus({
          level, statKey: 'agility', skillType: 'passive', scale: { base: 1, increment: 1 },
        }) * buffEffectiveness,
        dexterity: getSkillStatBonus({
          level, statKey: 'dexterity', skillType: 'passive', scale: { base: 1, increment: 1 },
        }) * buffEffectiveness,
      };
    },
    synergies: [
      {
        sourceSkillId: 'nocturnalDominion',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
  crimsonBurst: {
    id: 'crimsonBurst',
    name: () => t('skill.crimsonBurst.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: () => 0,
    cooldown: () => 6000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'burst',
    description: () => t('skill.crimsonBurst'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 4, increment: 2 },
      }),
      damagePercent: getSkillStatBonus({
        level,
        statKey: 'damagePercent',
        skillType: 'instant',
        scale: {
          base: 5, linear: 1.5, max: 1,
        },
      }),
      lifePerHit: getSkillStatBonus({
        level,
        statKey: 'lifePerHit',
        skillType: 'instant',
        scale: {
          base: -2, increment: -1, bonus: 2,
        },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bloodSiphon',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },
  darkAura: {
    id: 'darkAura',
    name: () => t('skill.darkAura.name'),
    type: () => 'buff',
    manaCost: (level) => 6 + level * 0.625,
    cooldown: () => 64000,
    duration: () => 48000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-aura',
    description: () => t('skill.darkAura'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: getSkillStatBonus({
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 1, max: 0.3 },
      }),
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'buff', scale: { base: 3, increment: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'nightStalker',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // Tier 25 Skills
  drainingTouch: {
    id: 'drainingTouch',
    name: () => t('skill.drainingTouch.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 0 + level * 0,
    cooldown: () => 12200,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'draining-touch',
    description: () => t('skill.drainingTouch'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      return {
        airDamage: getSkillStatBonus({
          level, statKey: 'airDamage', skillType: 'instant', scale: { base: 1.2, increment: 1 },
        }),
        airDamagePercent: getSkillStatBonus({
          level, statKey: 'airDamagePercent', skillType: 'instant', scale: { base: 1, linear: 0.7 },
        }),
        manaPerHit: getSkillStatBonus({
          level, statKey: 'manaPerHit', skillType: 'instant', scale: { base: 1, increment: 1 },
        }),
      };
    },
    synergies: [
      {
        sourceSkillId: 'crimsonBurst',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  greaterBloodHunger: {
    id: 'greaterBloodHunger',
    name: () => t('skill.greaterBloodHunger.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'bloodlust',
    description: () => t('skill.greaterBloodHunger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 1, increment: 1.2 },
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 1.25, increment: 1.2 },
      }),
    }),
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
  vampiricStrike: {
    id: 'vampiricStrike',
    name: () => t('skill.vampiricStrike.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 9500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'bite',
    description: () => t('skill.vampiricStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 1.2, increment: 0.75 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'instant', scale: { base: 8, increment: 8 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bloodSiphon',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
      {
        sourceSkillId: 'drainingTouch',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  summonBats: {
    id: 'summonBats',
    name: () => t('skill.summonBats.name'),
    type: () => 'summon',
    summonStats: (level) => {
      return {
        percentOfPlayerDamage: getSkillStatBonus({
          level, statKey: 'percentOfPlayerDamage', skillType: 'summon', scale: { base: 1.5, max: 0.15 },
        }),
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', scale: { base: 1.5, increment: 0.5 },
        }),
        airDamage: getSkillStatBonus({
          level, statKey: 'airDamage', skillType: 'summon', scale: { base: 1, increment: 0.7 },
        }),
        attackSpeed: 4,
        canCrit: true,
      };
    },
    manaCost: (level) => 3 + level * 0.625,
    cooldown: () => 60000,
    duration: () => 24000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'bat',
    description: () => t('skill.summonBats'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    synergies: [
      {
        sourceSkillId: 'nightStalker',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
  bloodPact: {
    id: 'bloodPact',
    name: () => t('skill.bloodPact.name'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.25,
    cooldown: () => 66000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pact',
    description: () => t('skill.bloodPact'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: getSkillStatBonus({
        level, statKey: 'life', skillType: 'buff', scale: { base: 2, increment: 1 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'buff', scale: { base: 0.625, linear: 0.7 },
      }),
      extraDamageFromLifePercent: getSkillStatBonus({
        level,
        statKey: 'extraDamageFromLifePercent',
        skillType: 'buff',
        scale: {
          base: 1, linear: 0.75, max: 1,
        },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'darkAura',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // Tier 100 Skills
  eternalThirst: {
    id: 'eternalThirst',
    name: () => t('skill.eternalThirst.name'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.425,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'thirst',
    description: () => t('skill.eternalThirst'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', scale: { base: 2, increment: 3 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'greaterBloodHunger',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1500,
        }),
      },
    ],
  },
  deathlyPresence: {
    id: 'deathlyPresence',
    name: () => t('skill.deathlyPresence.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'presence',
    description: () => t('skill.deathlyPresence'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 2, increment: 4 },
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 2.5, increment: 4 },
      }),
    }),
  },

  // Tier 200 Skills
  lordOfNight: {
    id: 'lordOfNight',
    name: () => t('skill.lordOfNight.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'lord',
    description: () => t('skill.lordOfNight'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      extraDamageFromLifePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifePercent', skillType: 'passive', scale: { base: 1, max: 2 },
      }),
      resurrectionChance: getSkillStatBonus({
        level, statKey: 'resurrectionChance', skillType: 'passive', scale: { base: 1, cap: 0.4 },
      }),
      perseverance: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', scale: { base: 1, increment: 1.6 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'nightStalker',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // Tier 1200 Skills
  bloodMoon: {
    id: 'bloodMoon',
    name: () => t('skill.bloodMoon.name'),
    type: () => 'buff',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'blood-moon',
    description: () => t('skill.bloodMoon'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: getSkillStatBonus({
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 0.5, max: 0.5 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'buff', scale: { base: 1.25, linear: 0.75 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'buff', scale: { base: 1, increment: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'darkAura',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 2000,
        }),
      },
    ],
  },
  sanguineFury: {
    id: 'sanguineFury',
    name: () => t('skill.sanguineFury.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'sanguine-fury',
    description: () => t('skill.sanguineFury'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'passive', scale: { base: 2, cap: 0.833 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'passive', scale: { base: 60, increment: 48 },
      }),
      damagePercent: getSkillStatBonus({
        level,
        statKey: 'damagePercent',
        skillType: 'passive',
        scale: {
          base: 0.5, linear: 0.3, max: 0.2,
        },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'crimsonBurst',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // Tier 2000 Skills
  twilightVeil: {
    id: 'twilightVeil',
    name: () => t('skill.twilightVeil.name'),
    type: () => 'buff',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 120000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'twilight-veil',
    description: () => t('skill.twilightVeil'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', scale: { base: 50, increment: 37.5 },
      }),
      evasionPercent: getSkillStatBonus({
        level, statKey: 'evasionPercent', skillType: 'buff', scale: { base: 1 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bloodPact',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },
  shadowRebirth: {
    id: 'shadowRebirth',
    name: () => t('skill.shadowRebirth.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'shadow-rebirth',
    description: () => t('skill.shadowRebirth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: getSkillStatBonus({
        level, statKey: 'resurrectionChance', skillType: 'passive', scale: { base: 1, cap: 1 },
      }),
      life: getSkillStatBonus({
        level,
        statKey: 'life',
        skillType: 'passive',
        scale: {
          base: 0.5, increment: 1.4, bonus: 1.5,
        },
      }),
      lifePercent: getSkillStatBonus({
        level,
        statKey: 'lifePercent',
        skillType: 'passive',
        scale: {
          base: 1, linear: 0.3, max: 0.3,
        },
      }),
      critDamagePercent: getSkillStatBonus({
        level, statKey: 'critDamagePercent', skillType: 'passive', scale: { base: 0.02 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'lordOfNight',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // Tier 3000 Skills
  eternalHunger: {
    id: 'eternalHunger',
    name: () => t('skill.eternalHunger.name'),
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'eternal-hunger',
    description: () => t('skill.eternalHunger'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 4, increment: 1.5 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      manaPerHit: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'toggle', scale: { base: 1, increment: 0.83 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'vampiricStrike',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },
  nocturnalDominion: {
    id: 'nocturnalDominion',
    name: () => t('skill.nocturnalDominion.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'nocturnal-dominion',
    description: () => t('skill.nocturnalDominion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { base: 5 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', scale: { base: 4, increment: 1.6 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'nightStalker',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
  },

  // Tier 5000 Skills
  vampireOverlord: {
    id: 'vampireOverlord',
    name: () => t('skill.vampireOverlord.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'vampire-overlord',
    description: () => t('skill.vampireOverlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      allAttributes: getSkillStatBonus({
        level, statKey: 'allAttributes', skillType: 'passive', scale: { base: 3, increment: 4 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'lordOfNight',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 3, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },
  immortalSovereign: {
    id: 'immortalSovereign',
    name: () => t('skill.immortalSovereign.name'),
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'immortal-sovereign',
    description: () => t('skill.immortalSovereign'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      airDamage: getSkillStatBonus({
        level, statKey: 'airDamage', skillType: 'toggle', scale: { base: 1, increment: 2 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'eternalThirst',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 3000,
        }),
      },
    ],
  },

  // Specialization Skills
  bloodSacrifice: {
    id: 'bloodSacrifice',
    name: () => t('skill.bloodSacrifice.name'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: () => 0,
    cooldown: () => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-sacrifice',
    description: () => t('skill.bloodSacrifice'),
    maxLevel: () => 1,
    effect: (level) => ({}),
    isVisible: () => hero.stats.bloodSacrificeUnlocked > 0,
  },
};