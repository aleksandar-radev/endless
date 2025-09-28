import { t } from '../../i18n.js';

const tier = 7;

export const ABYSS_ENEMIES = [
  {
    name: t('Abyssal Wraith'),
    image: '/enemies/abyssal-wraith.jpg',
    tier: tier,

    multiplier: {
      damage: 0.25,
      attackRating: 1.6,
      evasion: 1.33,
      gold: 1.5,
      fireDamage: 0.12,
      coldDamage: 0.3,
      airDamage: 0.1,
      earthDamage: 0.08,
      lightningDamage: 0.1,
      waterDamage: 0.05,
      coldResistance: 1.67,
      fireResistance: 1.33,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
  {
    name: t('Shadowclaw'),
    image: '/enemies/shadowclaw.jpg',
    tier: tier,

    multiplier: {
      damage: 0.05,
      attackRating: 2.6,
      evasion: 1.33,
      fireDamage: 0.1,
      coldDamage: 0.08,
      airDamage: 0.45,
      earthDamage: 0.08,
      lightningDamage: 0.05,
      waterDamage: 0.05,
      airResistance: 2.33,
      fireResistance: 1.33,
      coldResistance: 1,
      earthResistance: 1.33,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
  {
    name: t('Hellhound'),
    image: '/enemies/hellhound.jpg',
    tier: tier,

    multiplier: {
      life: 1.5,
      damage: 0.38,
      armor: 1.29,
      evasion: 0.5,
      fireDamage: 0.25,
      coldDamage: 0.08,
      airDamage: 0.1,
      earthDamage: 0.06,
      lightningDamage: 0.06,
      waterDamage: 0.04,
      fireResistance: 2.33,
      airResistance: 1,
      coldResistance: 1.33,
      earthResistance: 1,
      lightningResistance: 2.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
  {
    name: t('Infernal Knight'),

    image: '/enemies/infernal-knight.jpg',
    tier: tier,

    multiplier: {
      life: 1.35,
      damage: 0.4,
      fireDamage: 0.25,
      coldDamage: 0.1,
      airDamage: 0.09,
      earthDamage: 0.08,
      lightningDamage: 0.05,
      waterDamage: 0.03,
      fireResistance: 2.33,
      coldResistance: 0.67,
      airResistance: 1,
      earthResistance: 1.33,
      lightningResistance: 1.33,
      waterResistance: 0.67,
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['abyssal_depths'],
  },
];
