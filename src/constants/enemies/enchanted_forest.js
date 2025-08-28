import { t } from '../../i18n.js';

const tier = 1;

export const FOREST_ENEMIES = [
  {
    get name() { return t('Mossback'); },

    image: '/enemies/mossback.jpg',
    tier: tier,

    multiplier: {
      life: 1.3,
      damage: 0.6,
      armor: 1,
      xp: 1.33,
      gold: 1,
      earthDamage: 0.4,
      earthResistance: 2,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
  },
  {
    get name() { return t('Thornling'); },

    image: '/enemies/thornling.jpg',
    tier: tier,

    multiplier: {
      life: 1.4,
      damage: 0.5,
      armor: 0.86,
      gold: 1.33,
      earthDamage: 0.45,
      earthResistance: 1.33,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 0.67,
      itemDrop: 1.1,
    },
    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
  },
  {
    get name() { return t('Barkhide'); },

    image: '/enemies/barkhide.jpg',
    tier: tier,

    multiplier: {
      life: 1.7,
      damage: 0.57,
      attackRating: 0,
      armor: 1.29,
      earthDamage: 0.33,
      earthResistance: 1,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 1.33,
      lightningResistance: 0.67,
      waterResistance: 0.67,
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
  },
  {
    get name() { return t('Sylvan Wisp'); },

    image: '/enemies/sylvan-wisp.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      life: 0.8,
      damage: 0,
      attackRating: 1.6,
      armor: 0.57,
      evasion: 2,
      gold: 1.33,
      airDamage: 1,
      airResistance: 1.33,
      fireResistance: 0.67,
      coldResistance: 1,
      earthResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
  },
];
