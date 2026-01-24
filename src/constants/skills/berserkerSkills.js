import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { getScalingFlat, getScalingPercent, getScalingSynergy, getSkillStatBonus } from '../../common.js';
import { hero } from '../../globals.js';

// Berserker skills extracted from skills.js
export const BERSERKER_SKILLS = {
  // ===========================================================================
  // TIER 0
  // ===========================================================================
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 1.66, increment: 1 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', perLevel: true,
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 0.71, max: 1 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', scale: { base: -0.33, increment: -0.25 },
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
      armor: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      armorPerLevel: getSkillStatBonus({
        level, statKey: 'armor', skillType: 'passive', perLevel: true,
      }),
      allResistance: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', scale: { base: 1, increment: 0.5 },
      }),
      allResistancePerLevel: getSkillStatBonus({
        level, statKey: 'allResistance', skillType: 'passive', perLevel: true,
      }),
    }),
  },

  // ===========================================================================
  // TIER 1
  // ===========================================================================
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', perLevel: true,
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'instant', scale: { base: -1.6, increment: -1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'frenzy',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'buff', scale: { base: 0.625, max: 1 },
      }),
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66, max: 1 },
      }),
      lifeSteal: getSkillStatBonus({
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 0.08, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'toughSkin',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2
  // ===========================================================================
  berserkersRage: {
    id: 'berserkersRage',
    name: () => t('skill.berserkersRage.name'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.025,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'berserker-rage',
    description: () => t('skill.berserkersRage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'toggle', scale: { base: 1.5, increment: 1.5 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'toggle', perLevel: true,
      }),
      coldDamagePercent: getSkillStatBonus({
        level, statKey: 'coldDamagePercent', skillType: 'toggle', scale: { base: 1.42, max: 1 },
      }),
      doubleDamageChance: getSkillStatBonus({
        level, statKey: 'doubleDamageChance', skillType: 'toggle', scale: { base: 1, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'greaterFrenzy',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { base: 2, max: 1 },
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'passive', scale: { base: 1, increment: 1 },
      }),
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'passive', perLevel: true,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'frenzy',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3
  // ===========================================================================
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'instant', perLevel: true,
      }),
      coldDamage: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', scale: { base: 3, increment: 1.5 },
      }),
      coldDamagePerLevel: getSkillStatBonus({
        level, statKey: 'coldDamage', skillType: 'instant', perLevel: true,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'recklessSwing',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'passive', scale: { base: 2, max: 1 },
      }),
      critDamage: getSkillStatBonus({
        level, statKey: 'critDamage', skillType: 'passive', scale: { base: 1, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'berserkersRage',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 4
  // ===========================================================================
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
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 1.66, max: 1 },
      }),
      lifeSteal: getSkillStatBonus({
        level, statKey: 'lifeSteal', skillType: 'buff', scale: { base: 0.16, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'battleCry',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5
  // ===========================================================================
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
      manaPerHit: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'toggle', scale: { base: 0.66, increment: 0.66 },
      }),
      manaPerHitPerLevel: getSkillStatBonus({
        level, statKey: 'manaPerHit', skillType: 'toggle', perLevel: true,
      }),
      lifePerHit: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', scale: { base: 1.66, increment: 1.25 },
      }),
      lifePerHitPerLevel: getSkillStatBonus({
        level, statKey: 'lifePerHit', skillType: 'toggle', perLevel: true,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'berserkersRage',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      resurrectionChance: getSkillStatBonus({
        level, statKey: 'resurrectionChance', skillType: 'passive', scale: { base: 5, max: 1 },
      }),
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { base: 5, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'toughSkin',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 1000,
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
    description: () => t('skill.warlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const effectiveness = 1 + (hero.stats.warlordEffectivenessPercent || 0);
      return {
        strength: getSkillStatBonus({
          level, statKey: 'strength', skillType: 'passive', scale: { base: 3, increment: 3 },
        }) * effectiveness,
        strengthPerLevel: getSkillStatBonus({
          level, statKey: 'strength', skillType: 'passive', perLevel: true,
        }) * effectiveness,
        damage: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'passive', scale: { base: 5, increment: 3 },
        }) * effectiveness,
        damagePerLevel: getSkillStatBonus({
          level, statKey: 'damage', skillType: 'passive', perLevel: true,
        }) * effectiveness,
      };
    },
    synergies: [
      {
        sourceSkillId: 'rageMastery',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 1200
  // ===========================================================================
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
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'toggle', scale: { base: 1.42 },
      }),
      lifeSteal: getSkillStatBonus({
        level, statKey: 'lifeSteal', skillType: 'toggle', scale: { base: 0.4, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bloodLust',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      critDamage: getSkillStatBonus({
        level, statKey: 'critDamage', skillType: 'passive', scale: { base: 1, max: 1 },
      }),
      armorPenetrationPercent: getSkillStatBonus({
        level, statKey: 'armorPenetrationPercent', skillType: 'passive', scale: { base: 1, max: 1 },
      }),
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', scale: { base: 5, increment: 3 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', perLevel: true,
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'warlord',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 2500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 2000
  // ===========================================================================
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
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'buff', scale: { base: 3.33, max: 1 },
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'buff', scale: { base: 1.25 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'unbridledFury',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', scale: { base: 10, increment: 6 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'passive', perLevel: true,
      }),
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 2 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'undyingRage',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.2, cap: 1500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 3000
  // ===========================================================================
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
      reduceEnemyDamagePercent: getSkillStatBonus({
        level, statKey: 'reduceEnemyDamagePercent', skillType: 'instant', scale: { base: 50, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'battleCry',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2000,
        }),
      },
    ],
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
      strength: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', scale: { base: 6, increment: 6 },
      }),
      strengthPerLevel: getSkillStatBonus({
        level, statKey: 'strength', skillType: 'passive', perLevel: true,
      }),
      critChance: getSkillStatBonus({
        level, statKey: 'critChance', skillType: 'passive', scale: { base: 2, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'frenzy',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 0.5, increment: 0.3, cap: 2500,
        }),
      },
    ],
  },

  // ===========================================================================
  // TIER 5000
  // ===========================================================================
  apexPredator: {
    id: 'apexPredator',
    name: () => t('skill.apexPredator.name'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apex-predator',
    description: () => t('skill.apexPredator'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: getSkillStatBonus({
        level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 2 },
      }),
      attackSpeedPercent: getSkillStatBonus({
        level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { base: 10, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'bloodFrenzy',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 3000,
        }),
      },
    ],
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
      damage: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', scale: { base: 16.66, increment: 10 },
      }),
      damagePerLevel: getSkillStatBonus({
        level, statKey: 'damage', skillType: 'toggle', perLevel: true,
      }),
      armorPenetrationPercent: getSkillStatBonus({
        level, statKey: 'armorPenetrationPercent', skillType: 'toggle', scale: { base: 1, max: 1 },
      }),
    }),
    synergies: [
      {
        sourceSkillId: 'rageOverflow',
        calculateBonus: (sourceLevel) => getScalingSynergy({
          level: sourceLevel, base: 1, increment: 1, cap: 3000,
        }),
      },
    ],
  },
};
