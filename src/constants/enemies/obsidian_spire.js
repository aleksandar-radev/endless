import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 12;

export const OBSIDIAN_SPIRE_ENEMIES = [
  {
    name: 'Void Sentinel',
    element: 'cold',
    image: '/enemies/void-sentinel.jpg',
    tier: tier,

    life: 18 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackRating: 10 * getEnemyStatMultiplier(tier),
    evasion: 10 * getEnemyStatMultiplier(tier),

    coldDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 60,
    airResistance: 30,
    earthResistance: 30,
    lightningResistance: 25,
    waterResistance: 45,

    multiplier: {
      itemDrop: 1.1,
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['obsidian', 'arcane'],
  },
  {
    name: 'Obsidian Golem',
    element: 'earth',
    image: '/enemies/obsidian-golem.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.7,
    attackRating: 4.5 * getEnemyStatMultiplier(tier),
    armor: 15 * getEnemyStatMultiplier(tier),

    earthDamage: 2.5 * getEnemyStatMultiplier(tier),

    fireResistance: 25,
    coldResistance: 20,
    airResistance: 15,
    earthResistance: 70,
    lightningResistance: 20,
    waterResistance: 20,

    multiplier: {
      materialDrop: 1.4,
    },
    materialDropWeights: {},
    tags: ['obsidian', 'arcane'],
  },
  {
    name: 'Crimson Wisp',
    element: 'fire',
    image: '/enemies/crimson-wisp.jpg',
    tier: tier,

    life: 16 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackRating: 8 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    fireDamage: 2 * getEnemyStatMultiplier(tier),
    airDamage: 1 * getEnemyStatMultiplier(tier),

    fireResistance: 45,
    coldResistance: 25,
    airResistance: 30,
    earthResistance: 20,
    lightningResistance: 20,
    waterResistance: 20,

    multiplier: {
      itemDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['obsidian', 'arcane'],
    icon: '🔥',
  },
  {
    name: 'Flame Djinn',
    element: 'fire',
    image: '/enemies/flame-djinn.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 1.2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,

    fireDamage: 1.8 * getEnemyStatMultiplier(tier),

    fireResistance: 50,
    coldResistance: 30,
    airResistance: 30,
    earthResistance: 25,
    lightningResistance: 25,
    waterResistance: 0,

    multiplier: {
      materialDrop: 1.5,
    },
    materialDropWeights: {},
    tags: ['obsidian', 'arcane'],
    icon: '🔥',
  },
];
