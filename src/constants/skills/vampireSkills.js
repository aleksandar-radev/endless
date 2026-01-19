import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Vampire skills extracted from skills.js
export const VAMPIRE_SKILLS = {
  // Tier 1 Skills
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
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', perLevel: true,
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 0.66, increment: 0.5 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', perLevel: true,
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 0.71 },
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
        damagePercent: getSkillStatBonus({
          level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 2 },
        }) * buffEffectiveness,
        agility: getSkillStatBonus({
          level, statKey: 'agility', skillType: 'passive', scale: { base: 1, increment: 2 },
        }) * buffEffectiveness,
        agilityPerLevel: getSkillStatBonus({
          level, statKey: 'agility', skillType: 'passive', perLevel: true,
        }) * buffEffectiveness,
      };
    },
  },

  // Tier 10 Skills
  crimsonBurst: {
    id: 'crimsonBurst',
    name: () => t('skill.crimsonBurst.name'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: () => 0,
    cooldown: () => 4000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'burst',
    description: () => t('skill.crimsonBurst'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 4, increment: 2 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', perLevel: true,
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1.5 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'instant', scale: { base: -6, increment: -5 },
      }),
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'instant', perLevel: true, scale: { base: -10 },
      }),
    }),
  },
  darkAura: {
    id: 'darkAura',
    name: () => t('skill.darkAura.name'),
    type: () => 'buff',
    manaCost: (level) => 6 + level * 0.625,
    cooldown: () => 64000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-aura',
    description: () => t('skill.darkAura'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: getSkillStatBonus({
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 0.16, max: 0.5 },
      }),
      attackRating: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'buff', scale: { base: 0.11, increment: 0.07 },
      }),
      attackRatingPerLevel: getSkillStatBonus({
        level, statKey: 'attackRating', skillType: 'buff', perLevel: true,
      }),
      attackRatingPercent: getSkillStatBonus({
        level, statKey: 'attackRatingPercent', skillType: 'buff', scale: { base: 1.66 }, // Assuming default percent is 3? No, attackRatingPercent in stats is percent.
      }),
      extraDamageFromLifePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifePercent', skillType: 'buff', scale: { base: 0.04, max: 0.228 },
      }),
    }),
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
      const airDamage = getSkillStatBonus({
        level, statKey: 'airDamage', skillType: 'instant', scale: { base: 0.8, increment: 0.5 },
      });
      const airDamagePerLevel = getSkillStatBonus({
        level, statKey: 'airDamage', skillType: 'instant', perLevel: true,
      });
      const airDamagePercent = getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'instant', scale: { base: 0.5 },
      });
      return {
        airDamage: airDamage * 4,
        airDamagePerLevel: airDamagePerLevel * 4,
        airDamagePercent: airDamagePercent * 4,
        manaPerHit: getSkillStatBonus({
          level, statKey: 'manaPerHit', skillType: 'instant', scale: { base: 0.16, increment: 0.2 },
        }),
        manaPerHitPerLevel: getSkillStatBonus({
          level, statKey: 'manaPerHit', skillType: 'instant', perLevel: true,
        }),
      };
    },
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
      strengthPercent: getSkillStatBonus({
        level, statKey: 'strengthPercent', skillType: 'passive', scale: { base: 2 },
      }),
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      strengthPerLevel: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', perLevel: true,
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'passive', scale: { base: 2 },
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 1.25, increment: 2 },
      }),
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true,
      }),
    }),
  },

  // Tier 50 Skills
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
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', perLevel: true,
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'instant', scale: { base: 1 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'instant', scale: { base: 8, increment: 8 },
      }),
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'instant', perLevel: true, scale: { base: 4 },
      }),
    }),
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
        damagePerLevel: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'summon', perLevel: true,
        }),
        airDamage: getSkillStatBonus({
          level, statKey: 'airDamage', skillType: 'summon', scale: { base: 1, increment: 0.5 },
        }),
        airDamagePerLevel: getSkillStatBonus({
          level, statKey: 'airDamage', skillType: 'summon', perLevel: true,
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
  },

  // Tier 75 Skills
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
        level, statKey: 'life', skillType: 'buff', scale: { base: 0.16, increment: 0.16 },
      }),
      lifePerLevel: getSkillStatBonus({
        level, statKey: 'life', skillType: 'buff', perLevel: true, scale: { base: 1 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
      extraDamageFromLifePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifePercent', skillType: 'buff', scale: { base: 0.04, max: 0.228 },
      }),
    }),
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
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', scale: { base: 0.66, increment: 0.625 },
      }),
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', perLevel: true,
      }),
    }),
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
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 1 },
      }),
      strengthPercent: getSkillStatBonus({
        level, statKey: 'strengthPercent', skillType: 'passive', scale: { base: 2 },
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'passive', scale: { base: 2 },
      }),
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 2, increment: 2 },
      }),
      strengthPerLevel: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', perLevel: true, scale: { base: 2 },
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 2.5, increment: 4 },
      }),
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true, scale: { base: 2 },
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
      strengthPercent: getSkillStatBonus({
        level, statKey: 'strengthPercent', skillType: 'passive', scale: { base: 2 },
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'passive', scale: { base: 2 },
      }),
      extraDamageFromLifePercent: getSkillStatBonus({
        level, statKey: 'extraDamageFromLifePercent', skillType: 'passive', scale: { base: 0.1, max: 0.48 },
      }),
      resurrectionChance: getSkillStatBonus({
        level, statKey: 'resurrectionChance', skillType: 'passive', scale: { base: 1, cap: 0.4 },
      }),
      perseverancePercent: getSkillStatBonus({
        level, statKey: 'perseverancePercent', skillType: 'passive', scale: { base: 1 },
      }),
      perseverance: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', scale: { base: 1, increment: 1.6 },
      }),
      perseverancePerLevel: getSkillStatBonus({
        level, statKey: 'perseverance', skillType: 'passive', perLevel: true, scale: { base: 0.4 },
      }),
    }),
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
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 0.16, max: 0.5 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'buff', scale: { base: 1.25 },
      }),
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'buff', scale: { base: 2.5, increment: 2 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'buff', perLevel: true,
      }),
    }),
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
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'passive', perLevel: true, scale: { base: 24 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 1 },
      }),
    }),
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
      lifeRegenPerLevel: getSkillStatBonus({
        level, statKey: 'lifeRegen', skillType: 'buff', perLevel: true, scale: { base: 15 },
      }),
      evasionPercent: getSkillStatBonus({
        level, statKey: 'evasionPercent', skillType: 'buff', scale: { base: 1 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'buff', scale: { base: 0.625 },
      }),
    }),
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
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 2 },
      }),
      critDamage: getSkillStatBonus({
        level, statKey: 'critDamage', skillType: 'passive', scale: { base: 0.02 },
      }),
    }),
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
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 4, increment: 3 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', perLevel: true,
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      manaPerHit: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'toggle', scale: { base: 0.33, increment: 0.33 },
      }),
      manaPerHitPerLevel: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'toggle', perLevel: true, scale: { base: 0.5 },
      }),
    }),
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
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 2 },
      }),
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { base: 5 },
      }),
      lifePercent: getSkillStatBonus({
        level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 2 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', scale: { base: 5, increment: 3 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', perLevel: true,
      }),
    }),
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
      strengthPercent: getSkillStatBonus({
        level, statKey: 'strengthPercent', skillType: 'passive', scale: { base: 2 },
      }),
      vitalityPercent: getSkillStatBonus({
        level, statKey: 'vitalityPercent', skillType: 'passive', scale: { base: 2 },
      }),
      elementalDamagePercent: getSkillStatBonus({
        level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 2 },
      }),
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 3, increment: 3 },
      }),
      strengthPerLevel: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', perLevel: true, scale: { base: 3 },
      }),
      vitality: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', scale: { base: 3.75, increment: 3 },
      }),
      vitalityPerLevel: getSkillStatBonus({
        level, statKey: 'vitality', skillType: 'passive', perLevel: true, scale: { base: 3 },
      }),
    }),
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
        level, statKey: 'airDamage', skillType: 'toggle', scale: { base: 6.5, increment: 6 },
      }),
      airDamagePerLevel: getSkillStatBonus({
        level, statKey: 'airDamage', skillType: 'toggle', perLevel: true, scale: { base: 5.2 },
      }),
      airDamagePercent: getSkillStatBonus({
        level, statKey: 'airDamagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
    }),
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
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({}),
    isVisible: () => hero.stats.bloodSacrificeUnlocked > 0,
  },
};
