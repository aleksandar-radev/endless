import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Berserker skills extracted from skills.js
export const BERSERKER_SKILLS = {
  // Tier 1 Skills
  frenzy: {
    id: 'frenzy',
    name: () => t('Frenzy'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frenzy',
    description: () => t('skill.frenzy'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 2),
      damagePercent: scaleDownFlat(level, 2),
      lifePerHit: scaleUpFlat(level, -0.4),
    }),
  },
  toughSkin: {
    id: 'toughSkin',
    name: () => t('Tough Skin'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'tough-skin',
    description: () => t('skill.toughSkin'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 5, 7, 0.2),
      armorPercent: scaleDownFlat(level, 2),
      allResistance: scaleUpFlat(level, 4, 5, 0.2),
      allResistancePercent: scaleDownFlat(level, 2),
    }),
  },

  // Tier 10 Skills
  recklessSwing: {
    id: 'recklessSwing',
    name: () => t('Reckless Swing'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'swing',
    description: () => t('skill.recklessSwing'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: scaleUpFlat(level, 3),
      damagePercent: scaleDownFlat(level, 4),
      lifePerHit: scaleUpFlat(level, -1),
    }),
  },
  battleCry: {
    id: 'battleCry',
    name: () => t('Battle Cry'),
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.625,
    cooldown: () => 24400,
    duration: () => 12000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'battle-cry',
    description: () => t('skill.battleCry'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 0.5),
      attackSpeed: Math.min(scaleDownFlat(level, 0.01), 1.5),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 4),
    }),
  },

  // Tier 25 Skills
  berserkersRage: {
    id: 'berserkersRage',
    name: () => t('Berserker\'s Rage'),
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.025,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'berserker-rage',
    description: () => t('skill.berserkersRage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const coldDamage = scaleUpFlat(level, 4, 6) * 2;
      const coldDamagePercent = scaleDownFlat(level, 3) * 2;

      return {
        coldDamage,
        coldDamagePercent,
        doubleDamageChance: Math.min(scaleDownFlat(level, 0.35), 25),
      };
    },
  },
  greaterFrenzy: {
    id: 'greaterFrenzy',
    name: () => t('Greater Frenzy'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'greater-rage',
    description: () => t('skill.greaterFrenzy'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeed: Math.min(scaleDownFlat(level, 0.0075), 1.5),
      lifePerHit: scaleUpFlat(level, 0.75),
    }),
  },

  // Tier 50 Skills
  earthquake: {
    id: 'earthquake',
    name: () => t('Earthquake'),
    type: () => 'instant',
    skill_type: 'attack',
    manaCost: (level) => 7 + level * 0.375,
    cooldown: () => 9900,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'earthquake',
    description: () => t('skill.earthquake'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 5),
      earthDamagePercent: scaleDownFlat(level, 10),
    }),
  },
  rageMastery: {
    id: 'rageMastery',
    name: () => t('Rage Mastery'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'mastery',
    description: () => t('skill.rageMastery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.05), 25),
      critDamage: Math.min(scaleDownFlat(level, 0.005), 2),
      attackRatingPercent: scaleDownFlat(level, 7),
      lifePercent: Math.max(-scaleDownFlat(level, 0.15), -10),
    }),
  },

  // Tier 75 Skills
  bloodLust: {
    id: 'bloodLust',
    name: () => t('Blood Lust'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.313,
    cooldown: () => 76000,
    duration: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'bloodlust',
    description: () => t('skill.bloodLust'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeed: Math.min(scaleDownFlat(level, 0.002), 1.5),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 4),
      lifePercent: scaleDownFlat(level, 1),
    }),
  },

  // Tier 100 Skills
  unbridledFury: {
    id: 'unbridledFury',
    name: () => t('Unbridled Fury'),
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'fury',
    description: () => t('skill.unbridledFury'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      manaPerHit: scaleUpFlat(level, 0.1),
      lifePerHit: scaleUpFlat(level, 1),
    }),
  },
  undyingRage: {
    id: 'undyingRage',
    name: () => t('Undying Rage'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'undying',
    description: () => t('skill.undyingRage'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: Math.min(scaleDownFlat(level, 0.25), 50),
      attackSpeed: Math.min(scaleDownFlat(level, 0.0085), 1.5),
      armorPenetration: scaleUpFlat(level, 20, 7, 0.4),
    }),
  },

  // Tier 200 Skills
  warlord: {
    id: 'warlord',
    name: () => t('Warlord'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => t('skill.warlord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level, 2.5),
      critChance: Math.min(scaleDownFlat(level, 0.05), 20),
      attackSpeed: Math.min(scaleDownFlat(level, 0.002), 1.5),
      damagePercent: scaleDownFlat(level),
    }),
  },

  // Tier 1200 Skills
  rageOverflow: {
    id: 'rageOverflow',
    name: () => t('Rage Overflow'),
    type: () => 'toggle',
    manaCost: (level) => 10 + level * 1.25,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'rage-overflow',
    description: () => t('skill.rageOverflow'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 1),
    }),
  },
  crushingBlows: {
    id: 'crushingBlows',
    name: () => t('Crushing Blows'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'crushing-blows',
    description: () => t('skill.crushingBlows'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critDamage: Math.min(scaleDownFlat(level, 0.012), 3),
      armorPenetrationPercent: Math.min(scaleDownFlat(level, 2), 25),
      damage: scaleUpFlat(level, 3, 5, 1),
    }),
  },

  // Tier 2000 Skills
  bloodFrenzy: {
    id: 'bloodFrenzy',
    name: () => t('Blood Frenzy'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 110000,
    duration: () => 35000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'blood-frenzy',
    description: () => t('skill.bloodFrenzy'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeed: Math.min(scaleDownFlat(level, 0.02), 3),
      damagePercent: scaleDownFlat(level, 2),
      lifePerHit: scaleUpFlat(level, 5, 2, 1),
    }),
  },
  unyieldingOnslaught: {
    id: 'unyieldingOnslaught',
    name: () => t('Unyielding Onslaught'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'unyielding-onslaught',
    description: () => t('skill.unyieldingOnslaught'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 2.5),
      attackRatingPercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 3000 Skills
  primalRoar: {
    id: 'primalRoar',
    name: () => t('Primal Roar'),
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
      reduceEnemyDamagePercent: Math.min(scaleDownFlat(level, 0.1), 25),
    }),
  },
  berserkerSpirit: {
    id: 'berserkerSpirit',
    name: () => t('Berserker Spirit'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'berserker-spirit',
    description: () => t('skill.berserkerSpirit'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: scaleDownFlat(level, 3),
      lifePercent: scaleDownFlat(level, 1.5),
      critChance: Math.min(scaleDownFlat(level, 0.08), 30),
    }),
  },

  // Tier 5000 Skills
  apexPredator: {
    id: 'apexPredator',
    name: () => t('Apex Predator'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'apex-predator',
    description: () => t('skill.apexPredator'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 3),
      attackSpeed: Math.min(scaleDownFlat(level, 0.013), 3),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 3),
    }),
  },
  rageIncarnate: {
    id: 'rageIncarnate',
    name: () => t('Rage Incarnate'),
    type: () => 'toggle',
    manaCost: (level) => 20 + level * 0.85,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'rage-incarnate',
    description: () => t('skill.rageIncarnate'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 4),
      armorPenetrationPercent: Math.min(scaleDownFlat(level, 0.5), 35),
      attackRatingPercent: scaleDownFlat(level, 5),
    }),
  },
};
