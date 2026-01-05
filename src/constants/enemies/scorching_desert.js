import { t } from '../../i18n.js';

const tier = 4;

export const DESERT_ENEMIES = [
  {
    name: t('enemy.dunewraith'),

    image: '/enemies/dunewraith.jpg',
    tier: tier,

    multiplier: {
      life: 1.3,
      damage: 0.28,
      attackRating: 2.4,
      armor: 1,
      evasion: 1.5,
      xp: 1.5,
      gold: 1.17,
      fireDamage: 0.18,
      coldDamage: 0.08,
      airDamage: 0.07,
      earthDamage: 0.32,
      lightningDamage: 0.04,
      waterDamage: 0.03,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 0.67,
      earthResistance: 1.33,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['scorching_desert'],
  },
  {
    name: t('enemy.sandstalker'),

    image: '/enemies/sandstalker.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.2,
      damage: 0.18,
      attackRating: 2.4,
      armor: 0.86,
      evasion: 2.17,
      xp: 1.33,
      gold: 1.17,
      fireDamage: 0.14,
      coldDamage: 0.1,
      airDamage: 0.08,
      earthDamage: 0.38,
      lightningDamage: 0.07,
      waterDamage: 0.05,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['scorching_desert'],
  },
  {
    name: t('enemy.scorchingSalamander'),

    image: '/enemies/scorching-salamander.jpg',
    tier: tier,

    attackSpeed: 1.0,

    multiplier: {
      life: 1.4,
      damage: 0.18,
      attackRating: 2.4,
      armor: 1.14,
      xp: 1.67,
      gold: 1.33,
      fireDamage: 0.75,
      coldDamage: 0.14,
      airDamage: 0.1,
      earthDamage: 0.08,
      lightningDamage: 0.05,
      waterDamage: 0.03,
      fireResistance: 1.67,
      coldResistance: 1.33,
      airResistance: 0.67,
      earthResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['scorching_desert'],
  },
  {
    name: t('enemy.duneBlazar'),

    image: '/enemies/dune-blazer.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.3,
      damage: 0.38,
      attackRating: 2.4,
      armor: 1,
      evasion: 1.33,
      xp: 1.5,
      gold: 1.5,
      fireDamage: 0.34,
      coldDamage: 0.12,
      airDamage: 0.1,
      earthDamage: 0.09,
      lightningDamage: 0.08,
      waterDamage: 0.06,
      fireResistance: 1.33,
      coldResistance: 0.67,
      airResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['scorching_desert'],
  },
];
