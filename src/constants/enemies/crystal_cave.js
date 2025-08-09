import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 2;

export const CRYSTAL_CAVE_ENEMIES = [
  {
    name: 'Crystal Golem',

    image: '/enemies/crystal-golem.jpg',
    tier: tier,

    life: 32 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    attackRating: 4 * getEnemyStatMultiplier(tier),
    armor: 16 * getEnemyStatMultiplier(tier),
    evasion: 3 * getEnemyStatMultiplier(tier),

    earthDamage: 3 * getEnemyStatMultiplier(tier),

    earthResistance: 5 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {
      crystalized_rock: 4,
    },
    tags: ['crystal_cave'],
  },
  {
    name: 'Gem Guardian',

    image: '/enemies/gem-guardian.jpg',
    tier: tier,

    armor: 12 * getEnemyStatMultiplier(tier),
    damage: 0,
    evasion: 4 * getEnemyStatMultiplier(tier),

    earthDamage: 1.5 * getEnemyStatMultiplier(tier),
    waterDamage: 1.5 * getEnemyStatMultiplier(tier),

    earthResistance: 4 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
  {
    name: 'Grimspike',

    image: '/enemies/grimspike.jpg',
    tier: tier,

    attackSpeed: 1.2,

    damage: 1.5 * getEnemyStatMultiplier(tier),
    airDamage: 1.5 * getEnemyStatMultiplier(tier),

    airResistance: 3 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
  {
    name: 'Shardling',

    image: '/enemies/shardling.jpg',
    tier: tier,

    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    earthResistance: 3 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
];
