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

    gold: 11 * getEnemyStatMultiplier(tier),

    coldDamage: 1.4 * getEnemyStatMultiplier(tier),

    coldResistance: 30,
    fireResistance: 20,
    airResistance: 10,
    earthResistance: 10,
    lightningResistance: 10,
    waterResistance: 15,

    materialDropWeights: {},
    tags: [ 'abyss', 'dark' ],
  },
  {
    name: 'Shadowclaw',
    image: '/enemies/shadowclaw.jpg',
    tier: tier,

    damage: 0.4 * getEnemyStatMultiplier(tier),
    attackRating: 13 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    airDamage: 2.2 * getEnemyStatMultiplier(tier),

    airResistance: 50,
    fireResistance: 25,
    coldResistance: 10,
    earthResistance: 25,
    lightningResistance: 10,
    waterResistance: 10,

    materialDropWeights: {},
    tags: [ 'abyss', 'shadow' ],
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

    fireResistance: 45,
    airResistance: 10,
    coldResistance: 25,
    earthResistance: 10,
    lightningResistance: 55,
    waterResistance: 5,

    materialDropWeights: {},
    tags: [ 'abyss', 'dark' ],
  },
  {
    name: 'Infernal Knight',

    image: '/enemies/infernal-knight.jpg',
    tier: tier,

    life: 27 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),

    fireDamage: 1 * getEnemyStatMultiplier(tier),

    fireResistance: 50,
    coldResistance: 5,
    airResistance: 15,
    earthResistance: 20,
    lightningResistance: 20,
    waterResistance: 5,

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: [ 'abyss', 'dark' ],
  },
];
