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

    earthResistance: 30,
    fireResistance: 5,
    coldResistance: 10,
    airResistance: 5,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {
      crystalized_rock: 4,
    },
    tags: [ 'golem', 'crystal' ],
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

    earthResistance: 20,
    fireResistance: 5,
    coldResistance: 5,
    airResistance: 5,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {},
    tags: [ 'guardian', 'gem', 'cave' ],
  },
  {
    name: 'Grimspike',
     
    image: '/enemies/grimspike.jpg',
    tier: tier,

    attackSpeed: 1.2,

    airResistance: 10,
    fireResistance: 5,
    coldResistance: 5,
    earthResistance: 10,
    lightningResistance: 5,
    waterResistance: 5,

    materialDropWeights: {},
    tags: [ 'spike', 'earth', 'cave' ],
  },
  {
    name: 'Shardling',
     
    image: '/enemies/shardling.jpg',
    tier: tier,

    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    earthResistance: 15,
    fireResistance: 5,
    coldResistance: 5,
    airResistance: 5,
    lightningResistance: 5,
    waterResistance: 5,

    materialDropWeights: {},
    tags: [ 'shard', 'earth', 'cave' ],
  },
];
