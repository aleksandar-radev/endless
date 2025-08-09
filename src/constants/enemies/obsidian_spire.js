import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 12;

export const OBSIDIAN_SPIRE_ENEMIES = [
  {
    name: 'Void Sentinel',

    image: '/enemies/void-sentinel.jpg',
    tier: tier,

    life: 18 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackRating: 10 * getEnemyStatMultiplier(tier),
    evasion: 10 * getEnemyStatMultiplier(tier),

    coldDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 8 * getEnemyStatMultiplier(tier),
    airResistance: 5 * getEnemyStatMultiplier(tier),
    earthResistance: 5 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 7 * getEnemyStatMultiplier(tier),

    multiplier: {
      itemDrop: 1.1,
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],
  },
  {
    name: 'Obsidian Golem',

    image: '/enemies/obsidian-golem.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.7,
    attackRating: 4.5 * getEnemyStatMultiplier(tier),
    armor: 15 * getEnemyStatMultiplier(tier),

    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 4 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 9 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.4,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],
  },
  {
    name: 'Crimson Wisp',

    image: '/enemies/crimson-wisp.jpg',
    tier: tier,

    life: 16 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackRating: 8 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    fireDamage: 2 * getEnemyStatMultiplier(tier),
    airDamage: 1 * getEnemyStatMultiplier(tier),

    fireResistance: 7 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 5 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    multiplier: {
      itemDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],

  },
  {
    name: 'Flame Djinn',

    image: '/enemies/flame-djinn.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 1.2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,

    fireDamage: 1.8 * getEnemyStatMultiplier(tier),

    fireResistance: 7 * getEnemyStatMultiplier(tier),
    coldResistance: 5 * getEnemyStatMultiplier(tier),
    airResistance: 5 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 0 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.5,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],

  },
];
