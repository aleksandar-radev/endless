import { t } from '../../i18n.js';
import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 6;

export const SKYREALM_ENEMIES = [
  {
    name: t('Cloudstrider'),

    image: '/enemies/cloudstrider.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 12 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 11 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 8 * getEnemyStatMultiplier(tier),

    airDamage: 3 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 4 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
  {
    name: t('Stormbringer'),

    image: '/enemies/stormbringer.jpg',
    tier: tier,

    life: 28 * getEnemyStatMultiplier(tier),
    damage: 2.5 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 14 * getEnemyStatMultiplier(tier),
    armor: 7 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    xp: 10 * getEnemyStatMultiplier(tier),
    gold: 10 * getEnemyStatMultiplier(tier),

    airDamage: 1 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
  {
    name: t('Stormsoul'),

    image: '/enemies/stormsoul.jpg',
    tier: tier,

    life: 26 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.1,
    attackRating: 13 * getEnemyStatMultiplier(tier),
    armor: 6 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 9 * getEnemyStatMultiplier(tier),

    airDamage: 2.5 * getEnemyStatMultiplier(tier),
    earthDamage: 0.5 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 5 * getEnemyStatMultiplier(tier),
    earthResistance: 2 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
  {
    name: t('Midas Beast'),

    image: '/enemies/midas-beast.jpg',
    tier: tier,

    life: 30 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.2,
    attackRating: 14 * getEnemyStatMultiplier(tier),
    armor: 15 * getEnemyStatMultiplier(tier),
    evasion: 7 * getEnemyStatMultiplier(tier),

    xp: 11 * getEnemyStatMultiplier(tier),
    gold: 13 * getEnemyStatMultiplier(tier),

    airDamage: 1 * getEnemyStatMultiplier(tier),

    fireResistance: 2 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
];
