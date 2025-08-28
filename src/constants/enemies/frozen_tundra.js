import { t } from '../../i18n.js';

const tier = 3;

export const TUNDRA_ENEMIES = [
  {
    name: t('Frostbite'),

    image: '/enemies/frostbite.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.3,
      damage: 0.33,
      attackRating: 2,
      armor: 1.29,
      evasion: 1,
      xp: 1.5,
      gold: 1.17,
      airDamage: 0.33,
      coldDamage: 0.33,
      coldResistance: 1.33,
      fireResistance: 0.67,
      earthResistance: 1,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: t('Frostfury'),

    image: '/enemies/frostfury.jpg',
    tier: tier,

    multiplier: {
      life: 1.2,
      damage: 0.67,
      attackRating: 2.2,
      armor: 1,
      evasion: 1.33,
      xp: 1.33,
      coldDamage: 0.33,
      coldResistance: 1.33,
      fireResistance: 0.67,
      earthResistance: 1,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: t('Frost Giant'),

    image: '/enemies/frost-giant.jpg',
    tier: tier,

    attackSpeed: 0.95,

    multiplier: {
      life: 1.6,
      damage: 0.67,
      attackRating: 3,
      armor: 1.57,
      evasion: 0.83,
      xp: 1.67,
      gold: 1.67,
      coldDamage: 0.4,
      coldResistance: 1.33,
      fireResistance: 0.67,
      earthResistance: 1,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 1,
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: t('Ice Wraith'),

    image: '/enemies/ice-wraith.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.1,
      damage: 0,
      attackRating: 1.8,
      armor: 0.86,
      evasion: 2.17,
      xp: 1.33,
      gold: 1,
      coldDamage: 1,
      coldResistance: 1.67,
      fireResistance: 0.67,
      earthResistance: 0.67,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
];
