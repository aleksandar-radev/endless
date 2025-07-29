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

    fireResistance: 5,
    coldResistance: 10,
    airResistance: 75,
    earthResistance: 5,
    lightningResistance: 10,
    waterResistance: 10,

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

    fireResistance: 5,
    coldResistance: 65,
    airResistance: 35,
    earthResistance: 35,
    lightningResistance: 20,
    waterResistance: 10,

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

    fireResistance: 15,
    coldResistance: 25,
    airResistance: 25,
    earthResistance: 45,
    lightningResistance: 10,
    waterResistance: 10,

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

    fireResistance: 15,
    coldResistance: 15,
    airResistance: 50,
    earthResistance: 5,
    lightningResistance: 10,
    waterResistance: 15,

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
];
