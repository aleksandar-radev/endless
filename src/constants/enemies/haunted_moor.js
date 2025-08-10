import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 10;

export const HAUNTED_MOOR_ENEMIES = [
  {
    name: 'Banshee',

    image: '/enemies/banshee.jpg',
    tier: tier,

    damage: 1.4 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    evasion: 11 * getEnemyStatMultiplier(tier),

    xp: 5 * getEnemyStatMultiplier(tier),
    gold: 5 * getEnemyStatMultiplier(tier),

    airDamage: 1.2 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 10 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: 'Phantom',

    image: '/enemies/phantom.jpg',
    tier: tier,

    life: 18 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),

    coldDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 9 * getEnemyStatMultiplier(tier),
    airResistance: 5 * getEnemyStatMultiplier(tier),
    earthResistance: 5 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: 'Wraith Lord',

    image: '/enemies/wraith-lord.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    attackRating: 7 * getEnemyStatMultiplier(tier),
    evasion: 7 * getEnemyStatMultiplier(tier),

    gold: 11 * getEnemyStatMultiplier(tier),

    earthDamage: 0.8 * getEnemyStatMultiplier(tier),

    fireResistance: 3 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 4 * getEnemyStatMultiplier(tier),
    earthResistance: 7 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: 'Dreadfang',

    image: '/enemies/dreadfang.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 1.8 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 8 * getEnemyStatMultiplier(tier),
    evasion: 7 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),

    airDamage: 1.1 * getEnemyStatMultiplier(tier),

    fireResistance: 3 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 7 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
];
