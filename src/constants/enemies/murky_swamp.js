import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 5;

export const SWAMP_ENEMIES = [
  {
    name: 'Boglurker',

    image: '/enemies/boglurker.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 8 * getEnemyStatMultiplier(tier),
    evasion: 6 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    earthDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 5,
    airResistance: 5,
    earthResistance: 10,
    lightningResistance: 5,
    waterResistance: 20,

    materialDropWeights: {},
    tags: ['swamp', 'poison'],
  },
  {
    name: 'Toxictoad',

    image: '/enemies/toxictoad.jpg',
    tier: tier,

    life: 22 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    attackRating: 11 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 7 * getEnemyStatMultiplier(tier),

    xp: 7 * getEnemyStatMultiplier(tier),
    gold: 6 * getEnemyStatMultiplier(tier),

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 10,
    airResistance: 5,
    earthResistance: 15,
    lightningResistance: 5,
    waterResistance: 20,

    materialDropWeights: {},
    tags: ['swamp', 'toxic'],
  },
  {
    name: 'Venomspitter',

    image: '/enemies/venomspitter.jpg',
    tier: tier,

    life: 20 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 5,
    airResistance: 5,
    earthResistance: 5,
    lightningResistance: 5,
    waterResistance: 15,

    materialDropWeights: {},
    tags: ['swamp', 'venom'],
  },
  {
    name: 'Frostweaver',

    image: '/enemies/frostweaver.jpg',
    tier: tier,

    life: 22 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    attackRating: 10 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 7 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 8 * getEnemyStatMultiplier(tier),

    coldDamage: 5 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 25,
    airResistance: 5,
    earthResistance: 10,
    lightningResistance: 5,
    waterResistance: 15,

    materialDropWeights: {},
    tags: ['swamp', 'ice'],
  },
];
