import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 5;

export const SWAMP_ENEMIES = [
  {
    name: 'Boglurker',

    image: '/enemies/boglurker.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 1.5 * getEnemyStatMultiplier(tier),
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 8 * getEnemyStatMultiplier(tier),
    evasion: 6 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    earthDamage: 1.5 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['murky_swamp'],
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

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['murky_swamp'],
  },
  {
    name: 'Venomspitter',

    image: '/enemies/venomspitter.jpg',
    tier: tier,

    life: 20 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['murky_swamp'],
  },
  {
    name: 'Frostweaver',

    image: '/enemies/frostweaver.jpg',
    tier: tier,

    life: 22 * getEnemyStatMultiplier(tier),
    damage: 1.2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    attackRating: 10 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 7 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 8 * getEnemyStatMultiplier(tier),

    coldDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['murky_swamp'],
  },
];
