import { t } from '../../i18n.js';

const tier = 8;

export const VOLCANIC_RIFT_ENEMIES = [
  {
    name: t('Magma Titan'),
    image: '/enemies/magma-titan.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.55,
      damage: 0.33,
      armor: 1.86,
      evasion: 1.5,
      xp: 2.17,
      fireDamage: 0.43,
      earthDamage: 0.37,
      fireResistance: 2.67,
      coldResistance: 0,
      airResistance: 1.33,
      earthResistance: 1,
      lightningResistance: 1.33,
      waterResistance: 0.67,
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Lava Elemental'),
    image: '/enemies/lava-elemental.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.6,
      damage: 0.13,
      armor: 1.29,
      xp: 2.17,
      fireDamage: 0.67,
      earthDamage: 0.27,
      fireResistance: 2.67,
      coldResistance: 0.67,
      airResistance: 1.67,
      earthResistance: 1.67,
      lightningResistance: 1.33,
      waterResistance: 0.67,
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Wildfire Spirit'),
    image: '/enemies/wildfire-spirit.jpg',
    tier: tier,

    attackSpeed: 1.4,

    multiplier: {
      life: 0.7,
      damage: 0,
      fireDamage: 1.1,
      fireResistance: 2.33,
      coldResistance: 0.67,
      airResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Molten Wyrm'),
    image: '/enemies/molten-wyrm.jpg',
    tier: tier,

    multiplier: {
      life: 0.9,
      damage: 0.27,
      armor: 1.57,
      fireDamage: 0.63,
      earthDamage: 0.2,
      fireResistance: 2.33,
      coldResistance: 1,
      airResistance: 1.33,
      earthResistance: 1,
      lightningResistance: 1.33,
      waterResistance: 1.33,
      materialDrop: 1.3,
    },
    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Thunderwing'),
    image: '/enemies/thunderwing.jpg',
    tier: tier,

    attackSpeed: 1.3,

    multiplier: {
      life: 0.8,
      damage: 0.27,
      attackRating: 2.8,
      evasion: 1.5,
      xp: 1.5,
      gold: 1.5,
      airDamage: 0.71,
      fireResistance: 0,
      coldResistance: 1,
      airResistance: 2.67,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
];
