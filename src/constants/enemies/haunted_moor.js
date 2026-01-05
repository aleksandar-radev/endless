import { t } from '../../i18n.js';

const tier = 10;

export const HAUNTED_MOOR_ENEMIES = [
  {
    name: t('enemy.banshee'),

    image: '/enemies/banshee.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      damage: 0.24,
      evasion: 1.83,
      xp: 0.83,
      gold: 0.83,
      fireDamage: 0.1,
      coldDamage: 0.09,
      airDamage: 0.3,
      earthDamage: 0.06,
      lightningDamage: 0.05,
      waterDamage: 0.03,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 3.33,
      earthResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: t('enemy.phantom'),

    image: '/enemies/phantom.jpg',
    tier: tier,

    multiplier: {
      life: 0.9,
      damage: 0.24,
      fireDamage: 0.12,
      coldDamage: 0.7,
      airDamage: 0.1,
      earthDamage: 0.08,
      lightningDamage: 0.05,
      waterDamage: 0.04,
      fireResistance: 0.67,
      coldResistance: 3,
      airResistance: 1.67,
      earthResistance: 1.67,
      lightningResistance: 1.33,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: t('enemy.wraithLord'),

    image: '/enemies/wraith-lord.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.4,
      damage: 0.36,
      attackRating: 1.4,
      evasion: 1.17,
      gold: 1.83,
      fireDamage: 0.1,
      coldDamage: 0.09,
      airDamage: 0.08,
      earthDamage: 0.2,
      lightningDamage: 0.06,
      waterDamage: 0.05,
      fireResistance: 1,
      coldResistance: 1.33,
      airResistance: 1.33,
      earthResistance: 2.33,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
  {
    name: t('enemy.dreadfang'),

    image: '/enemies/dreadfang.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      life: 1.2,
      damage: 0.34,
      attackRating: 1.6,
      evasion: 1.17,
      xp: 1.5,
      fireDamage: 0.12,
      coldDamage: 0.08,
      airDamage: 0.28,
      earthDamage: 0.07,
      lightningDamage: 0.05,
      waterDamage: 0.03,
      fireResistance: 1,
      coldResistance: 1,
      airResistance: 2.33,
      earthResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['haunted_moor'],
  },
];
