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
    description: () => t('Boosts damage but drains life per hit while active.'),
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
    description: () => t('Raises armor and armor percent to reduce damage taken.'),
    maxLevel: () => 200,
    effect: (level) => ({
      armor: scaleUpFlat(level, 4),
      armorPercent: scaleDownFlat(level, 2),
    }),
  },

  // Tier 10 Skills
  recklessSwing: {
    id: 'recklessSwing',
    name: () => t('Reckless Swing'),
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.25,
    cooldown: () => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'swing',
    description: () => t('Delivers a powerful strike that boosts damage at the cost of life per hit.'),
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
    description: () => t('Temporarily increases damage, attack speed, and life steal.'),
    maxLevel: () => 100,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 0.5),
      attackSpeed: Math.min(scaleDownFlat(level, 0.005), 1.5),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 4),
    }),
  },

  // Tier 25 Skills
  berserkersRage: {
    id: 'berserkersRage',
    name: () => t('Berserker\'s Rage'),
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.125,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'berserker-rage',
    description: () => t('Greatly boosts fire and air damage with a chance to deal double damage.'),
    maxLevel: () => 200,
    effect: (level) => ({
      fireDamagePercent: scaleDownFlat(level, 3),
      airDamagePercent: scaleDownFlat(level, 3),
      doubleDamageChance: Math.min(scaleDownFlat(level, 0.2), 20),
    }),
  },
  greaterFrenzy: {
    id: 'greaterFrenzy',
    name: () => t('Greater Frenzy'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'greater-rage',
    description: () => t('Passively grants extra attack speed and life per hit.'),
    maxLevel: () => 300,
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
    manaCost: (level) => 7 + level * 0.375,
    cooldown: () => 9900,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'earthquake',
    description: () => t('Smashes the ground, increasing damage and earth damage.'),
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
    description: () => t('Raises crit chance, crit damage, double damage chance, and attack rating at the cost of life.'),
    maxLevel: () => 100,
    effect: (level) => ({
      critChance: Math.min(scaleDownFlat(level, 0.05), 20),
      critDamage: Math.min(scaleDownFlat(level, 0.005), 3),
      doubleDamageChance: Math.min(scaleDownFlat(level, 0.1), 20),
      attackRatingPercent: scaleDownFlat(level, 5),
      lifePercent: -scaleDownFlat(level, 0.15),
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
    description: () => t('Temporarily boosts attack speed, life steal, and life percent.'),
    maxLevel: () => 250,
    effect: (level) => ({
      attackSpeed: Math.min(scaleDownFlat(level, 0.002), 1.5),
      lifeSteal: Math.min(scaleDownFlat(level, 0.01), 4),
      lifePercent: scaleDownFlat(level, 0.25),
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
    description: () => t('Increases damage and restores mana and life per hit.'),
    maxLevel: () => 400,
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
    description: () => t('Grants a resurrection chance with extra life regeneration and armor.'),
    maxLevel: () => 500,
    effect: (level) => ({
      resurrectionChance: Math.min(scaleDownFlat(level, 0.1), 50),
      lifeRegen: scaleUpFlat(level, 1),
      lifeRegenPercent: scaleDownFlat(level, 0.75),
      armorPercent: scaleDownFlat(level, 3),
    }),
  },

  // Tier 200 Skills
  warlord: {
    id: 'warlord',
    name: () => t('Warlord'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => t('Boosts strength, crit chance, attack speed, and damage.'),
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
    description: () => t('Unleashes rage to raise damage and add life steal.'),
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
    description: () => t('Increases crit damage, armor penetration, and flat damage.'),
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
    description: () => t('Greatly increases attack speed, damage, and life per hit.'),
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
    description: () => t('Passively increases damage and attack rating.'),
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
    manaCost: (level) => 40 + level * 0.625,
    cooldown: () => 80000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'primal-roar',
    description: () => t('Ignores enemy armor and reduces enemy damage.'),
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
    description: () => t('Boosts strength, life, and crit chance.'),
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
    description: () => t('Increases damage, attack speed, and life steal.'),
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
    description: () => t('Increases damage with added armor penetration and attack rating.'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: scaleDownFlat(level, 4),
      armorPenetrationPercent: Math.min(scaleDownFlat(level, 0.5), 35),
      attackRatingPercent: scaleDownFlat(level, 5),
    }),
  },
};
