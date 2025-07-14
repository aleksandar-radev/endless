import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 6;

export const SKYREALM_ENEMIES = [
  {
    name: 'Cloudstrider',
     
    image: '/enemies/cloudstrider.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 11 * getEnemyStatMultiplier(tier),

    xp: 11 * getEnemyStatMultiplier(tier),
    gold: 10 * getEnemyStatMultiplier(tier),

    airDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 5,
    airResistance: 20,
    earthResistance: 5,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['skyrealm', 'air'],
  },
  {
    name: 'Stormbringer',
     
    image: '/enemies/stormbringer.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 4 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 14 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 12 * getEnemyStatMultiplier(tier),
    gold: 12 * getEnemyStatMultiplier(tier),

    airDamage: 1 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 5,
    airResistance: 15,
    earthResistance: 5,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['skyrealm', 'storm'],
  },
  {
    name: 'Stormsoul',
     
    image: '/enemies/stormsoul.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 13 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 11 * getEnemyStatMultiplier(tier),
    gold: 11 * getEnemyStatMultiplier(tier),

    airDamage: 4 * getEnemyStatMultiplier(tier),
    earthDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 10,
    airResistance: 30,
    earthResistance: 5,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['skyrealm', 'soul'],
  },
  {
    name: 'Midas Beast',
     
    image: '/enemies/midas-beast.jpg',
    tier: tier,

    life: 30 * getEnemyStatMultiplier(tier),
    damage: 4 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 14 * getEnemyStatMultiplier(tier),
    armor: 15 * getEnemyStatMultiplier(tier),
    evasion: 7 * getEnemyStatMultiplier(tier),

    xp: 13 * getEnemyStatMultiplier(tier),
    gold: 15 * getEnemyStatMultiplier(tier),

    airDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 5,
    coldResistance: 5,
    airResistance: 15,
    earthResistance: 10,
    lightningResistance: 10,
    waterResistance: 5,

    materialDropWeights: {},
    tags: ['skyrealm', 'gold'],
  },
];
