import { t } from '../../i18n.js';

const tier = 11;

export const GOLDEN_STEPPE_ENEMIES = [
  {
    name: t('Golden Sphinx'),

    image: '/enemies/golden-sphinx.jpg',
    tier: tier,

    multiplier: {
      life: 2,
      damage: 0.67,
      earthDamage: 0.4,
      armor: 1.14,
      gold: 2.17,
      fireResistance: 2,
      coldResistance: 2,
      airResistance: 2,
      earthResistance: 3.33,
      lightningResistance: 2,
      waterResistance: 2.33,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    name: t('Aurelius'),

    image: '/enemies/aurelius.jpg',
    tier: tier,

    multiplier: {
      damage: 0.47,
      airDamage: 0.4,
      fireResistance: 2.67,
      coldResistance: 1.33,
      airResistance: 1.33,
      earthResistance: 1.33,
      lightningResistance: 1,
      waterResistance: 1.33,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    name: t('Solar Phoenix'),

    image: '/enemies/solar-phoenix.jpg',
    tier: tier,
    tier: tier,

    multiplier: {
      itemDrop: 1.1,
      life: 0.9,
      damage: 0.33,
      evasion: 1.33,
      fireDamage: 0.67,
      fireResistance: 3,
      coldResistance: 0,
      airResistance: 2.33,
      earthResistance: 1.33,
      lightningResistance: 1.33,
      waterResistance: 0,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],

  },
  {
    name: t('Radiant Lion'),

    image: '/enemies/radiant-lion.jpg',
    tier: tier,

    multiplier: {
      life: 1.2,
      damage: 0.25,
      airDamage: 0.27,
      fireDamage: 0.48,
      fireResistance: 3.33,
      coldResistance: 0.67,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],

  },
];
