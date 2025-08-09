import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 7;

export const ABYSS_ENEMIES = [
  {
    name: 'Abyssal Wraith',
    image: '/enemies/abyssal-wraith.jpg',
    tier: tier,

    damage: 1.6 * getEnemyStatMultiplier(tier),
    attackRating: 8 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    gold: 9 * getEnemyStatMultiplier(tier),

    coldDamage: 1.4 * getEnemyStatMultiplier(tier),

    coldResistance: 5 * getEnemyStatMultiplier(tier),
    fireResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
  {
    name: 'Shadowclaw',
    image: '/enemies/shadowclaw.jpg',
    tier: tier,

    damage: 0.4 * getEnemyStatMultiplier(tier),
    attackRating: 13 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    airDamage: 2.2 * getEnemyStatMultiplier(tier),

    airResistance: 7 * getEnemyStatMultiplier(tier),
    fireResistance: 4 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
  {
    name: 'Hellhound',
    image: '/enemies/hellhound.jpg',
    tier: tier,

    life: 30 * getEnemyStatMultiplier(tier),
    damage: 1.8 * getEnemyStatMultiplier(tier),
    armor: 9 * getEnemyStatMultiplier(tier),
    evasion: 3 * getEnemyStatMultiplier(tier),

    fireDamage: 1.1 * getEnemyStatMultiplier(tier),

    fireResistance: 7 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 8 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
  {
    name: 'Infernal Knight',

    image: '/enemies/infernal-knight.jpg',
    tier: tier,

    life: 27 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),

    fireDamage: 1 * getEnemyStatMultiplier(tier),

    fireResistance: 7 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
];
