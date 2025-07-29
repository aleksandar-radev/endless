import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 11;

export const GOLDEN_STEPPE_ENEMIES = [
  {
    name: 'Golden Sphinx',

    image: '/enemies/golden-sphinx.jpg',
    tier: tier,

    life: 40 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    earthDamage: 1.2 * getEnemyStatMultiplier(tier),
    armor: 8 * getEnemyStatMultiplier(tier),

    gold: 13 * getEnemyStatMultiplier(tier),

    fireResistance: 40,
    coldResistance: 40,
    airResistance: 40,
    earthResistance: 75,
    lightningResistance: 40,
    waterResistance: 45,

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    name: 'Aurelius',

    image: '/enemies/aurelius.jpg',
    tier: tier,

    damage: 1.4 * getEnemyStatMultiplier(tier),
    airDamage: 1.2 * getEnemyStatMultiplier(tier),

    fireResistance: 60,
    coldResistance: 25,
    airResistance: 25,
    earthResistance: 25,
    lightningResistance: 10,
    waterResistance: 25,

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    name: 'Solar Phoenix',

    image: '/enemies/solar-phoenix.jpg',
    tier: tier,
    multiplier: {
      itemDrop: 1.1,
    },

    life: 18 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    fireDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 70,
    coldResistance: 0,
    airResistance: 50,
    earthResistance: 20,
    lightningResistance: 25,
    waterResistance: 0,

    materialDropWeights: {},
    tags: ['golden_steppe'],

  },
  {
    name: 'Radiant Lion',

    image: '/enemies/radiant-lion.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 0.75 * getEnemyStatMultiplier(tier),

    airDamage: 0.8 * getEnemyStatMultiplier(tier),
    fireDamage: 1.45 * getEnemyStatMultiplier(tier),

    fireResistance: 75,
    coldResistance: 5,
    airResistance: 15,
    earthResistance: 15,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['golden_steppe'],

  },
];
