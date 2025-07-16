import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 9;

export const SUNKEN_RUINS_ENEMIES = [
  {
    name: 'Tide Guardian',

    image: '/enemies/tide-guardian.jpg',
    tier: tier,

    life: 33 * getEnemyStatMultiplier(tier),
    damage: 0.7 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.95,
    attackRating: 7 * getEnemyStatMultiplier(tier),
    armor: 12 * getEnemyStatMultiplier(tier),
    evasion: 4 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 6 * getEnemyStatMultiplier(tier),

    coldDamage: 2.2 * getEnemyStatMultiplier(tier),
    waterDamage: 1.1 * getEnemyStatMultiplier(tier),

    fireResistance: 25,
    coldResistance: 60,
    airResistance: 25,
    earthResistance: 20,
    lightningResistance: 10,
    waterResistance: 20,

    multiplier: {
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['ruins', 'water'],
  },
  {
    name: 'Coral Sentinel',

    image: '/enemies/coral-sentinel.jpg',
    tier: tier,

    life: 25 * getEnemyStatMultiplier(tier),
    damage: 1.7 * getEnemyStatMultiplier(tier),
    attackRating: 6.5 * getEnemyStatMultiplier(tier),
    armor: 4.8 * getEnemyStatMultiplier(tier),
    evasion: 6 * getEnemyStatMultiplier(tier),

    gold: 8 * getEnemyStatMultiplier(tier),

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 45,
    airResistance: 5,
    earthResistance: 75,
    lightningResistance: 10,
    waterResistance: 15,

    materialDropWeights: {},
    tags: ['ruins', 'water'],
  },
  {
    name: 'Depths Leviathan',

    image: '/enemies/depths-leviathan.jpg',
    tier: tier,

    life: 32 * getEnemyStatMultiplier(tier),
    damage: 3.3 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.8,
    armor: 12 * getEnemyStatMultiplier(tier),

    xp: 11 * getEnemyStatMultiplier(tier),

    coldDamage: 0.4 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 40,
    airResistance: 10,
    earthResistance: 10,
    lightningResistance: 10,
    waterResistance: 25,

    multiplier: {
      itemDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['ruins', 'water'],
  },
  {
    name: 'Arcane Construct',

    image: '/enemies/arcane-construct.jpg',
    tier: tier,

    life: 22 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,

    airDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 25,
    coldResistance: 20,
    airResistance: 45,
    earthResistance: 25,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['ruins', 'arcane'],
  },
];
