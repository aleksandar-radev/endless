import { t } from '../../i18n.js';
import { getEnemyStatMultiplier } from '../enemies.js';

const tier = 8;

export const VOLCANIC_RIFT_ENEMIES = [
  {
    name: t('Magma Titan'),
    image: '/enemies/magma-titan.jpg',
    tier: tier,

    life: 31 * getEnemyStatMultiplier(tier),
    damage: 1 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    armor: 13 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 13 * getEnemyStatMultiplier(tier),

    fireDamage: 1.3 * getEnemyStatMultiplier(tier),
    earthDamage: 1.12 * getEnemyStatMultiplier(tier),

    fireResistance: 8 * getEnemyStatMultiplier(tier),
    coldResistance: 0 * getEnemyStatMultiplier(tier),
    airResistance: 4 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Lava Elemental'),
    image: '/enemies/lava-elemental.jpg',
    tier: tier,

    life: 32 * getEnemyStatMultiplier(tier),
    damage: 0.4 * getEnemyStatMultiplier(tier),
    attackSpeed: 0.9,
    armor: 9 * getEnemyStatMultiplier(tier),

    xp: 13 * getEnemyStatMultiplier(tier),

    fireDamage: 2 * getEnemyStatMultiplier(tier),
    earthDamage: 0.8 * getEnemyStatMultiplier(tier),

    fireResistance: 8 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 5 * getEnemyStatMultiplier(tier),
    earthResistance: 5 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Wildfire Spirit'),
    image: '/enemies/wildfire-spirit.jpg',
    tier: tier,

    life: 14 * getEnemyStatMultiplier(tier),
    damage: 0 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.4,

    fireDamage: 3.3 * getEnemyStatMultiplier(tier),

    fireResistance: 7 * getEnemyStatMultiplier(tier),
    coldResistance: 2 * getEnemyStatMultiplier(tier),
    airResistance: 2 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 2 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Molten Wyrm'),
    image: '/enemies/molten-wyrm.jpg',
    tier: tier,

    life: 18 * getEnemyStatMultiplier(tier),
    damage: 0.8 * getEnemyStatMultiplier(tier),
    armor: 11 * getEnemyStatMultiplier(tier),

    fireDamage: 1.9 * getEnemyStatMultiplier(tier),
    earthDamage: 0.6 * getEnemyStatMultiplier(tier),

    fireResistance: 7 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 4 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 4 * getEnemyStatMultiplier(tier),
    waterResistance: 4 * getEnemyStatMultiplier(tier),

    multiplier: {
      materialDrop: 1.3,
    },
    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
  {
    name: t('Thunderwing'),
    image: '/enemies/thunderwing.jpg',
    tier: tier,

    life: 16 * getEnemyStatMultiplier(tier),
    damage: 0.8 * getEnemyStatMultiplier(tier),
    attackSpeed: 1.3,
    attackRating: 14 * getEnemyStatMultiplier(tier),
    evasion: 9 * getEnemyStatMultiplier(tier),

    xp: 9 * getEnemyStatMultiplier(tier),
    gold: 9 * getEnemyStatMultiplier(tier),

    airDamage: 2.12 * getEnemyStatMultiplier(tier),

    fireResistance: 0 * getEnemyStatMultiplier(tier),
    coldResistance: 3 * getEnemyStatMultiplier(tier),
    airResistance: 8 * getEnemyStatMultiplier(tier),
    earthResistance: 3 * getEnemyStatMultiplier(tier),
    lightningResistance: 3 * getEnemyStatMultiplier(tier),
    waterResistance: 2 * getEnemyStatMultiplier(tier),

    materialDropWeights: {},
    tags: ['volcanic_rift'],
  },
];
