import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 1;

export const FOREST_ENEMIES = [
  {
    name: 'Mossback',

    image: '/enemies/mossback.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 1.8 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),

    xp: 10 * getEnemyStatMultiplier(tier),
    gold: 8 * getEnemyStatMultiplier(tier),

    earthDamage: 1.2 * getEnemyStatMultiplier(tier),

    earthResistance: 40,
    fireResistance: 5,
    coldResistance: 15,
    airResistance: 5,
    lightningResistance: 5,
    waterResistance: 5,

    materialDropWeights: {},
    tags: [ 'forest' ],
  },
  {
    name: 'Thornling',

    image: '/enemies/thornling.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 1.5 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),

    gold: 10 * getEnemyStatMultiplier(tier),

    earthDamage: 1.35 * getEnemyStatMultiplier(tier),

    earthResistance: 20,
    fireResistance: 5,
    coldResistance: 10,
    airResistance: 5,
    lightningResistance: 5,
    waterResistance: 5,

    multiplier: {
      itemDrop: 1.1,
    },
    materialDropWeights: {},
    tags: [ 'forest' ],
  },
  {
    name: 'Barkhide',

    image: '/enemies/barkhide.jpg',
    tier: tier,

    life: 34 * getEnemyStatMultiplier(tier),
    damage: 1.7 * getEnemyStatMultiplier(tier),
    attackRating: 7 * getEnemyStatMultiplier(tier),
    armor: 9 * getEnemyStatMultiplier(tier),

    earthDamage: 1 * getEnemyStatMultiplier(tier),

    earthResistance: 15,
    fireResistance: 5,
    coldResistance: 5,
    airResistance: 25,
    lightningResistance: 5,
    waterResistance: 5,

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: [ 'forest' ],
  },
  {
    name: 'Sylvan Wisp',

    image: '/enemies/sylvan-wisp.jpg',
    tier: tier,

    life: 16 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 8 * getEnemyStatMultiplier(tier),
    armor: 4 * getEnemyStatMultiplier(tier),
    evasion: 12 * getEnemyStatMultiplier(tier),

    gold: 10 * getEnemyStatMultiplier(tier),

    airDamage: 3 * getEnemyStatMultiplier(tier),

    airResistance: 25,
    fireResistance: 5,
    coldResistance: 10,
    earthResistance: 5,
    lightningResistance: 5,
    waterResistance: 10,

    materialDropWeights: {},
    tags: [ 'forest' ],
  },
];
