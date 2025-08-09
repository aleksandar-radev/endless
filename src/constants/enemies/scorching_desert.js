import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 4;

export const DESERT_ENEMIES = [
  {
    name: 'Dunewraith',

    image: '/enemies/dunewraith.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 1.5 * getEnemyStatMultiplier(tier),
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    earthDamage: 1.5 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['scorching_desert'],
  },
  {
    name: 'Sandstalker',

    image: '/enemies/sandstalker.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 13 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['scorching_desert'],
  },
  {
    name: 'Scorching Salamander',

    image: '/enemies/scorching-salamander.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.0,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 8 * getEnemyStatMultiplier(tier),

    xp: 10 * getEnemyStatMultiplier(tier),
    gold: 8 * getEnemyStatMultiplier(tier),

    fireDamage: 4 * getEnemyStatMultiplier(tier),

    fireResistance: 5 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['scorching_desert'],

  },
  {
    name: 'Dune Blazer',

    image: '/enemies/dune-blazer.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 9 * getEnemyStatMultiplier(tier),

    fireDamage: 1.5 * getEnemyStatMultiplier(tier),

    fireResistance: 4 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['scorching_desert'],

  },
];
