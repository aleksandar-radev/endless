import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 3;

export const TUNDRA_ENEMIES = [
  {
    name: 'Frostbite',

    image: '/enemies/frostbite.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    attackRating: 10 * getEnemyStatMultiplier(tier),
    armor: 9 * getEnemyStatMultiplier(tier),
    evasion: 6 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    airDamage: 3 * getEnemyStatMultiplier(tier),
    coldDamage: 3 * getEnemyStatMultiplier(tier),

    coldResistance: 25,
    fireResistance: 5,
    earthResistance: 10,
    airResistance: 5,
    lightningResistance: 5,
    waterResistance: 10,

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: 'Frostfury',

    image: '/enemies/frostfury.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 4 * getEnemyStatMultiplier(tier),
    attackRating: 11 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),

    coldDamage: 1 * getEnemyStatMultiplier(tier),

    coldResistance: 20,
    fireResistance: 5,
    earthResistance: 10,
    airResistance: 5,
    lightningResistance: 5,
    waterResistance: 10,

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: 'Frost Giant',

    image: '/enemies/frost-giant.jpg',
    tier: tier,

    life: 32 * getEnemyStatMultiplier(tier),
    damage: 3 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.95,
    attackRating: 15 * getEnemyStatMultiplier(tier),
    armor: 11 * getEnemyStatMultiplier(tier),
    evasion: 5 * getEnemyStatMultiplier(tier),

    xp: 10 * getEnemyStatMultiplier(tier),
    gold: 10 * getEnemyStatMultiplier(tier),

    coldDamage: 2 * getEnemyStatMultiplier(tier),

    coldResistance: 20,
    fireResistance: 5,
    earthResistance: 10,
    airResistance: 5,
    lightningResistance: 5,
    waterResistance: 10,

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: 'Ice Wraith',

    image: '/enemies/ice-wraith.jpg',
    tier: tier,

    life: 22 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 9 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 13 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 6 * getEnemyStatMultiplier(tier),

    coldDamage: 3 * getEnemyStatMultiplier(tier),

    coldResistance: 30,
    fireResistance: 5,
    earthResistance: 5,
    airResistance: 5,
    lightningResistance: 5,
    waterResistance: 15,

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
];
