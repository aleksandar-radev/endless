import { t } from '../../i18n.js';

const tier = 5;

export const SWAMP_ENEMIES = [
  {
    name: t('Boglurker'),

    image: '/enemies/boglurker.jpg',
    tier: tier,

    multiplier: {
      life: 1.2,
      damage: 0.28,
      attackRating: 2.4,
      armor: 1.14,
      evasion: 1,
      xp: 1.33,
      gold: 1.17,
      fireDamage: 0.12,
      coldDamage: 0.1,
      airDamage: 0.08,
      earthDamage: 0.3,
      lightningDamage: 0.07,
      waterDamage: 0.05,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 1.33,
    },

    materialDropWeights: {},
    tags: ['murky_swamp'],
  },
  {
    name: t('Toxictoad'),

    image: '/enemies/toxictoad.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.1,
      damage: 0.4,
      attackRating: 2.2,
      armor: 1,
      evasion: 1.17,
      xp: 1.17,
      gold: 1,
      fireDamage: 0.16,
      coldDamage: 0.12,
      airDamage: 0.1,
      earthDamage: 0.4,
      lightningDamage: 0.09,
      waterDamage: 0.07,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 1.33,
    },

    materialDropWeights: {},
    tags: ['murky_swamp'],
  },
  {
    name: t('Venomspitter'),

    image: '/enemies/venomspitter.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      life: 1,
      damage: 0.2,
      attackRating: 2.4,
      armor: 0.86,
      evasion: 1.33,
      xp: 1.33,
      gold: 1.17,
      fireDamage: 0.12,
      coldDamage: 0.1,
      airDamage: 0.08,
      earthDamage: 0.35,
      lightningDamage: 0.08,
      waterDamage: 0.07,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 0.67,
      earthResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['murky_swamp'],
  },
  {
    name: t('Frostweaver'),

    image: '/enemies/frostweaver.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.1,
      damage: 0.24,
      attackRating: 2,
      armor: 1,
      evasion: 1.17,
      xp: 1.5,
      gold: 1.33,
      fireDamage: 0.12,
      coldDamage: 0.45,
      airDamage: 0.1,
      earthDamage: 0.08,
      lightningDamage: 0.05,
      waterDamage: 0.03,
      fireResistance: 0.67,
      coldResistance: 1.33,
      airResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['murky_swamp'],
  },
];
