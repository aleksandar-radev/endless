import { t } from '../../i18n.js';
import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 3;

export const TUNDRA_ENEMIES = [
  {
    name: t('Frostbite'),

    image: '/enemies/frostbite.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    attackRating: 10 * getEnemyStatMultiplier(tier),
    armor: 9 * getEnemyStatMultiplier(tier),
    evasion: 6 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 7 * getEnemyStatMultiplier(tier),

    airDamage: 1 * getEnemyStatMultiplier(tier),
    coldDamage: 1 * getEnemyStatMultiplier(tier),

    coldResistance: 4 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: t('Frostfury'),

    image: '/enemies/frostfury.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackRating: 11 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),

    coldDamage: 1 * getEnemyStatMultiplier(tier),

    coldResistance: 4 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: t('Frost Giant'),

    image: '/enemies/frost-giant.jpg',
    tier: tier,

    life: 32 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.95,
    attackRating: 15 * getEnemyStatMultiplier(tier),
    armor: 11 * getEnemyStatMultiplier(tier),
    evasion: 5 * getEnemyStatMultiplier(tier),

    xp: 10 * getEnemyStatMultiplier(tier),
    gold: 10 * getEnemyStatMultiplier(tier),

    coldDamage: 1.2 * getEnemyStatMultiplier(tier),

    coldResistance: 4 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
  {
    name: t('Ice Wraith'),

    image: '/enemies/ice-wraith.jpg',
    tier: tier,

    life: 22 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 9 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 13 * getEnemyStatMultiplier(tier),

    xp: 8 * getEnemyStatMultiplier(tier),
    gold: 6 * getEnemyStatMultiplier(tier),

    coldDamage: 3 * getEnemyStatMultiplier(tier),

    coldResistance: 5 * getEnemyStatMultiplier(tier),
    fireResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 3 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['frozen_tundra'],
  },
];
