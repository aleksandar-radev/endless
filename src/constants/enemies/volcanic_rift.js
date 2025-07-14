import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 8;

export const VOLCANIC_RIFT_ENEMIES = [
  {
    name: 'Magma Titan',
    image: '/enemies/magma-titan.jpg',
    tier: tier,

    life: 31 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    armor: 13 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 15 * getEnemyStatMultiplier(tier),

    fireDamage: 1.3 * getEnemyStatMultiplier(tier),
    earthDamage: 1.12 * getEnemyStatMultiplier(tier),

    fireResistance: 60,
    coldResistance: 0,
    airResistance: 20,
    earthResistance: 15,
    lightningResistance: 20,
    waterResistance: 5,

    multiplier: {
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['volcano', 'fire'],
  },
  {
    name: 'Lava Elemental',
    image: '/enemies/lava-elemental.jpg',
    tier: tier,

    life: 32 * getEnemyStatMultiplier(tier),
    damage: 0.4 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    armor: 9 * getEnemyStatMultiplier(tier),

    xp: 15 * getEnemyStatMultiplier(tier),

    fireDamage: 2 * getEnemyStatMultiplier(tier),
    earthDamage: 0.8 * getEnemyStatMultiplier(tier),

    fireResistance: 60,
    coldResistance: 5,
    airResistance: 30,
    earthResistance: 30,
    lightningResistance: 25,
    waterResistance: 5,

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['volcano', 'fire'],
  },
  {
    name: 'Wildfire Spirit',
    image: '/enemies/wildfire-spirit.jpg',
    tier: tier,

    life: 14 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.4,

    fireDamage: 3.3 * getEnemyStatMultiplier(tier),

    fireResistance: 45,
    coldResistance: 5,
    airResistance: 5,
    earthResistance: 10,
    lightningResistance: 5,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['volcano', 'fire'],
  },
  {
    name: 'Molten Wyrm',
    image: '/enemies/molten-wyrm.jpg',
    tier: tier,

    life: 18 * getEnemyStatMultiplier(tier),
    damage: 0.8 * getEnemyStatMultiplier(tier),
    armor: 11 * getEnemyStatMultiplier(tier),

    fireDamage: 1.9 * getEnemyStatMultiplier(tier),
    earthDamage: 0.6 * getEnemyStatMultiplier(tier),

    fireResistance: 50,
    coldResistance: 10,
    airResistance: 25,
    earthResistance: 10,
    lightningResistance: 25,
    waterResistance: 25,

    multiplier: {
      materialDrop: 1.3,
    },
    materialDropWeights: {},
    tags: ['volcano', 'fire'],
  },
  {
    name: 'Thunderwing',
    image: '/enemies/thunderwing.jpg',
    tier: tier,

    life: 16 * getEnemyStatMultiplier(tier),
    damage: 0.8 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.3,
    attackRating: 14 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 11 * getEnemyStatMultiplier(tier),
    gold: 11 * getEnemyStatMultiplier(tier),

    airDamage: 2.12 * getEnemyStatMultiplier(tier),

    fireResistance: 0,
    coldResistance: 15,
    airResistance: 55,
    earthResistance: 15,
    lightningResistance: 15,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['volcano', 'air'],
  },
];
