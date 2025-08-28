import { t } from '../../i18n.js';

const tier = 6;

export const SKYREALM_ENEMIES = [
  {
    name: t('Cloudstrider'),

    image: '/enemies/cloudstrider.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      life: 1.2,
      damage: 0.33,
      attackRating: 2.4,
      armor: 0.86,
      evasion: 1.83,
      xp: 1.5,
      gold: 1.33,
      airDamage: 1,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 1.33,
      earthResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
  {
    name: t('Stormbringer'),

    image: '/enemies/stormbringer.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.4,
      damage: 0.83,
      attackRating: 2.8,
      armor: 1,
      evasion: 1.33,
      xp: 1.67,
      gold: 1.67,
      airDamage: 0.33,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 1,
      earthResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
  {
    name: t('Stormsoul'),

    image: '/enemies/stormsoul.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.3,
      damage: 0,
      attackRating: 2.6,
      armor: 0.86,
      evasion: 1.5,
      xp: 1.5,
      gold: 1.5,
      airDamage: 0.83,
      earthDamage: 0.17,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 1.67,
      earthResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
  {
    name: t('Midas Beast'),

    image: '/enemies/midas-beast.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      life: 1.5,
      damage: 0.67,
      attackRating: 2.8,
      armor: 2.14,
      evasion: 1.17,
      xp: 1.83,
      gold: 2.17,
      airDamage: 0.33,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['skyrealm_peaks'],
  },
];
