import { t } from '../../i18n.js';

const tier = 1;

export const FOREST_ENEMIES = [
  {
    get name() { return t('Mossback'); },

    image: '/enemies/mossback.jpg',
    tier: tier,

    multiplier: {
      life: 1.3,
      damage: 0.32,
      armor: 1,
      xp: 1.33,
      gold: 1,
      fireDamage: 0.12,
      coldDamage: 0.09,
      airDamage: 0.07,
      earthDamage: 0.3,
      lightningDamage: 0.05,
      waterDamage: 0.05,
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
      damage: 0.26,
      armor: 0.86,
      gold: 1.33,
      fireDamage: 0.1,
      coldDamage: 0.09,
      airDamage: 0.08,
      earthDamage: 0.32,
      lightningDamage: 0.05,
      waterDamage: 0.05,
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
      damage: 0.27,
      attackRating: 0,
      armor: 1.29,
      fireDamage: 0.1,
      coldDamage: 0.08,
      airDamage: 0.07,
      earthDamage: 0.28,
      lightningDamage: 0.06,
      waterDamage: 0.04,
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
      damage: 0.12,
      attackRating: 1.6,
      armor: 0.57,
      evasion: 2,
      gold: 1.33,
      fireDamage: 0.1,
      coldDamage: 0.08,
      airDamage: 0.55,
      earthDamage: 0.07,
      lightningDamage: 0.05,
      waterDamage: 0.03,
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
