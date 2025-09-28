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
      damage: 0.24,
      attackRating: 2.4,
      armor: 0.86,
      evasion: 1.83,
      xp: 1.5,
      gold: 1.33,
      fireDamage: 0.12,
      coldDamage: 0.1,
      airDamage: 0.6,
      earthDamage: 0.1,
      lightningDamage: 0.1,
      waterDamage: 0.07,
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
      damage: 0.58,
      attackRating: 2.8,
      armor: 1,
      evasion: 1.33,
      xp: 1.67,
      gold: 1.67,
      fireDamage: 0.12,
      coldDamage: 0.08,
      airDamage: 0.24,
      earthDamage: 0.06,
      lightningDamage: 0.05,
      waterDamage: 0.03,
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
      damage: 0.18,
      attackRating: 2.6,
      armor: 0.86,
      evasion: 1.5,
      xp: 1.5,
      gold: 1.5,
      fireDamage: 0.08,
      coldDamage: 0.06,
      airDamage: 0.46,
      earthDamage: 0.14,
      lightningDamage: 0.05,
      waterDamage: 0.03,
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
      damage: 0.38,
      attackRating: 2.8,
      armor: 2.14,
      evasion: 1.17,
      xp: 1.83,
      gold: 2.17,
      fireDamage: 0.12,
      coldDamage: 0.08,
      airDamage: 0.24,
      earthDamage: 0.08,
      lightningDamage: 0.06,
      waterDamage: 0.04,
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
