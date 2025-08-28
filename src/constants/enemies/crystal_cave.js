import { t } from '../../i18n.js';

const tier = 2;

export const CRYSTAL_CAVE_ENEMIES = [
  {
    name: t('Crystal Golem'),

    image: '/enemies/crystal-golem.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.6,
      damage: 0.33,
      attackRating: 0.8,
      armor: 2.29,
      evasion: 0.5,
      earthDamage: 1,
      earthResistance: 1.67,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {
      crystalized_rock: 4,
    },
    tags: ['crystal_cave'],
  },
  {
    name: t('Gem Guardian'),

    image: '/enemies/gem-guardian.jpg',
    tier: tier,

    multiplier: {
      armor: 1.71,
      damage: 0,
      evasion: 0.67,
      earthDamage: 0.5,
      waterDamage: 0.5,
      earthResistance: 1.33,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
  {
    name: t('Grimspike'),

    image: '/enemies/grimspike.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      damage: 0.5,
      airDamage: 0.5,
      airResistance: 1,
      fireResistance: 0.67,
      coldResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
  {
    name: t('Shardling'),

    image: '/enemies/shardling.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      damage: 0.33,
      earthDamage: 0.67,
      earthResistance: 1,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
];
