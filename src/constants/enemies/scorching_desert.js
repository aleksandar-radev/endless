import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 4;

export const DESERT_ENEMIES = [
  {
    name: 'Dunewraith',
     
    image: '/enemies/dunewraith.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 11 * getEnemyStatMultiplier(tier),
    gold: 9 * getEnemyStatMultiplier(tier),

    earthDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 15,
    airResistance: 5,
    earthResistance: 20,
    lightningResistance: 5,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['desert', 'undead'],
  },
  {
    name: 'Sandstalker',
     
    image: '/enemies/sandstalker.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 13 * getEnemyStatMultiplier(tier),

    xp: 10 * getEnemyStatMultiplier(tier),
    gold: 9 * getEnemyStatMultiplier(tier),

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 5,
    airResistance: 5,
    earthResistance: 10,
    lightningResistance: 5,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['desert', 'scorpion'],
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

    xp: 12 * getEnemyStatMultiplier(tier),
    gold: 10 * getEnemyStatMultiplier(tier),

    fireDamage: 4 * getEnemyStatMultiplier(tier),

    fireResistance: 30,
    coldResistance: 20,
    airResistance: 5,
    earthResistance: 5,
    lightningResistance: 5,
    waterResistance: 10,

    materialDropWeights: {},
    tags: ['desert', 'fire'],
     
  },
  {
    name: 'Dune Blazer',
     
    image: '/enemies/dune-blazer.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 3 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 11 * getEnemyStatMultiplier(tier),
    gold: 11 * getEnemyStatMultiplier(tier),

    fireDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 20,
    coldResistance: 5,
    airResistance: 5,
    earthResistance: 10,
    lightningResistance: 5,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['desert', 'sand'],
     
  },
];
