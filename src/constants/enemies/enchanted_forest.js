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

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 6 * getEnemyStatMultiplier(tier),

    earthDamage: 1.2 * getEnemyStatMultiplier(tier),

    earthResistance: 6 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
  },
  {
    name: 'Thornling',

    image: '/enemies/thornling.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 1.5 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),

    gold: 8 * getEnemyStatMultiplier(tier),

    earthDamage: 1.35 * getEnemyStatMultiplier(tier),

    earthResistance: 4 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    multiplier: {
      itemDrop: 1.1,
    },
    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
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

    earthResistance: 3 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
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

    gold: 8 * getEnemyStatMultiplier(tier),

    airDamage: 3 * getEnemyStatMultiplier(tier),

    airResistance: 4 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: [ 'enchanted_forest' ],
  },
];
