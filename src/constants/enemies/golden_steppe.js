import { t } from '../../i18n.js';
import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 11;

export const GOLDEN_STEPPE_ENEMIES = [
  {
    name: t('Golden Sphinx'),

    image: '/enemies/golden-sphinx.jpg',
    tier: tier,

    life: 40 * getEnemyStatMultiplier(tier),
    damage: 2 * getEnemyStatMultiplier(tier),
    earthDamage: 1.2 * getEnemyStatMultiplier(tier),
    armor: 8 * getEnemyStatMultiplier(tier),

    gold: 13 * getEnemyStatMultiplier(tier),

    fireResistance: 6 * getEnemyStatMultiplier(tier),
    coldResistance: 6 * getEnemyStatMultiplier(tier),
    airResistance: 6 * getEnemyStatMultiplier(tier),
    earthResistance: 10 * getEnemyStatMultiplier(tier),
    lightningResistance: 6 * getEnemyStatMultiplier(tier),
    waterResistance: 7 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    name: t('Aurelius'),

    image: '/enemies/aurelius.jpg',
    tier: tier,

    damage: 1.4 * getEnemyStatMultiplier(tier),
    airDamage: 1.2 * getEnemyStatMultiplier(tier),

    fireResistance: 8 * getEnemyStatMultiplier(tier),
    coldResistance: 4 * getEnemyStatMultiplier(tier),
    airResistance: 4 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    name: t('Solar Phoenix'),

    image: '/enemies/solar-phoenix.jpg',
    tier: tier,
    multiplier: {
      itemDrop: 1.1,
    },

    life: 18 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    evasion: 8 * getEnemyStatMultiplier(tier),

    fireDamage: 2 * getEnemyStatMultiplier(tier),

    fireResistance: 9 * getEnemyStatMultiplier(tier),
    coldResistance: 0 * getEnemyStatMultiplier(tier),
    airResistance: 7 * getEnemyStatMultiplier(tier),
    earthResistance: 4 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 0 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['golden_steppe'],

  },
  {
    name: t('Radiant Lion'),

    image: '/enemies/radiant-lion.jpg',
    tier: tier,

    life: 24 * getEnemyStatMultiplier(tier),
    damage: 0.75 * getEnemyStatMultiplier(tier),

    airDamage: 0.8 * getEnemyStatMultiplier(tier),
    fireDamage: 1.45 * getEnemyStatMultiplier(tier),

    fireResistance: 10 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 3 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['golden_steppe'],

  },
];
