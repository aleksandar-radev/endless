import { t } from '../../i18n.js';

const tier = 4;

export const DESERT_ENEMIES = [
  {
    name: t('Dunewraith'),

    image: '/enemies/dunewraith.jpg',
    tier: tier,

    multiplier: {
      life: 1.3,
      damage: 0.5,
      attackRating: 2.4,
      armor: 1,
      evasion: 1.5,
      xp: 1.5,
      gold: 1.17,
      earthDamage: 0.5,
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
    name: t('Sandstalker'),

    image: '/enemies/sandstalker.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.2,
      damage: 0.33,
      attackRating: 2.4,
      armor: 0.86,
      evasion: 2.17,
      xp: 1.33,
      gold: 1.17,
      earthDamage: 0.67,
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
    name: t('Scorching Salamander'),

    image: '/enemies/scorching-salamander.jpg',
    tier: tier,

    attackSpeed: 1.0,

    multiplier: {
      life: 1.4,
      damage: 0,
      attackRating: 2.4,
      armor: 1.14,
      xp: 1.67,
      gold: 1.33,
      fireDamage: 1.33,
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
    name: t('Dune Blazer'),

    image: '/enemies/dune-blazer.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.3,
      damage: 0.67,
      attackRating: 2.4,
      armor: 1,
      evasion: 1.33,
      xp: 1.5,
      gold: 1.5,
      fireDamage: 0.5,
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
