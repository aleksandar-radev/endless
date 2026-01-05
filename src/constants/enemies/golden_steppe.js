import { t } from '../../i18n.js';

const tier = 11;

export const GOLDEN_STEPPE_ENEMIES = [
  {
    nameKey: 'enemy.goldenSphinx',

    image: '/enemies/golden-sphinx.jpg',
    tier: tier,

    multiplier: {
      life: 2,
      damage: 0.35,
      fireDamage: 0.12,
      coldDamage: 0.1,
      airDamage: 0.08,
      earthDamage: 0.3,
      lightningDamage: 0.07,
      waterDamage: 0.05,
      armor: 1.14,
      gold: 2.17,
      fireResistance: 2,
      coldResistance: 2,
      airResistance: 2,
      earthResistance: 3.33,
      lightningResistance: 2,
      waterResistance: 2.33,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    nameKey: 'enemy.aurelius',

    image: '/enemies/aurelius.jpg',
    tier: tier,

    multiplier: {
      damage: 0.26,
      fireDamage: 0.1,
      coldDamage: 0.08,
      airDamage: 0.3,
      earthDamage: 0.07,
      lightningDamage: 0.04,
      waterDamage: 0.02,
      fireResistance: 2.67,
      coldResistance: 1.33,
      airResistance: 1.33,
      earthResistance: 1.33,
      lightningResistance: 1,
      waterResistance: 1.33,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    nameKey: 'enemy.solarPhoenix',

    image: '/enemies/solar-phoenix.jpg',
    tier: tier,
    tier: tier,

    multiplier: {
      itemDrop: 1.1,
      life: 0.9,
      damage: 0.24,
      evasion: 1.33,
      fireDamage: 0.4,
      coldDamage: 0.08,
      airDamage: 0.1,
      earthDamage: 0.08,
      lightningDamage: 0.06,
      waterDamage: 0.04,
      fireResistance: 3,
      coldResistance: 0,
      airResistance: 2.33,
      earthResistance: 1.33,
      lightningResistance: 1.33,
      waterResistance: 0,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
  {
    nameKey: 'enemy.radiantLion',

    image: '/enemies/radiant-lion.jpg',
    tier: tier,

    multiplier: {
      life: 1.2,
      damage: 0.18,
      fireDamage: 0.32,
      coldDamage: 0.1,
      airDamage: 0.22,
      earthDamage: 0.08,
      lightningDamage: 0.06,
      waterDamage: 0.04,
      fireResistance: 3.33,
      coldResistance: 0.67,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['golden_steppe'],
  },
];
