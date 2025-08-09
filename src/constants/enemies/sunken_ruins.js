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

    fireResistance: 4 * getEnemyStatMultiplier(tier),
    coldResistance: 8 * getEnemyStatMultiplier(tier),
    airResistance: 4 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['sunken_ruins'],
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

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 7 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 10 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['sunken_ruins'],
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

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 6 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    multiplier: {
      itemDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['sunken_ruins'],
  },
  {
    name: 'Arcane Construct',

    image: '/enemies/arcane-construct.jpg',
    tier: tier,

    life: 22 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,

    airDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 4 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 7 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['sunken_ruins'],
  },
];
