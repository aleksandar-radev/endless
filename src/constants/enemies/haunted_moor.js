import { t } from '../../i18n.js';

const tier = 10;

export const HAUNTED_MOOR_ENEMIES = [
  {
    name: t('Banshee'),

    image: '/enemies/banshee.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      damage: 0.47,
      evasion: 1.83,
      xp: 0.83,
      gold: 0.83,
      airDamage: 0.4,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 3.33,
      earthResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: t('Phantom'),

    image: '/enemies/phantom.jpg',
    tier: tier,

    multiplier: {
      life: 0.9,
      damage: 0.33,
      coldDamage: 1,
      fireResistance: 0.67,
      coldResistance: 3,
      airResistance: 1.67,
      earthResistance: 1.67,
      lightningResistance: 1.33,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: t('Wraith Lord'),

    image: '/enemies/wraith-lord.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.4,
      damage: 0.67,
      attackRating: 1.4,
      evasion: 1.17,
      gold: 1.83,
      earthDamage: 0.27,
      fireResistance: 1,
      coldResistance: 1.33,
      airResistance: 1.33,
      earthResistance: 2.33,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: t('Dreadfang'),

    image: '/enemies/dreadfang.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      life: 1.2,
      damage: 0.6,
      attackRating: 1.6,
      evasion: 1.17,
      xp: 1.5,
      airDamage: 0.37,
      fireResistance: 1,
      coldResistance: 1,
      airResistance: 2.33,
      earthResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
];
