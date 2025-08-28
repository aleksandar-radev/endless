import { t } from '../../i18n.js';

const tier = 9;

export const SUNKEN_RUINS_ENEMIES = [
  {
    name: t('Tide Guardian'),

    image: '/enemies/tide-guardian.jpg',
    tier: tier,

    attackSpeed: 0.95,

    multiplier: {
      life: 1.65,
      damage: 0.23,
      attackRating: 1.4,
      armor: 1.71,
      evasion: 0.67,
      xp: 1.5,
      gold: 1,
      coldDamage: 0.73,
      waterDamage: 0.37,
      fireResistance: 1.33,
      coldResistance: 2.67,
      airResistance: 1.33,
      earthResistance: 1.33,
      lightningResistance: 1,
      waterResistance: 1.33,
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['sunken_ruins'],
  },
  {
    name: t('Coral Sentinel'),

    image: '/enemies/coral-sentinel.jpg',
    tier: tier,

    multiplier: {
      life: 1.25,
      damage: 0.57,
      attackRating: 1.3,
      armor: 0.69,
      evasion: 1,
      gold: 1.33,
      earthDamage: 0.67,
      fireResistance: 0.67,
      coldResistance: 2.33,
      airResistance: 0.67,
      earthResistance: 3.33,
      lightningResistance: 1,
      waterResistance: 1,
    },

    materialDropWeights: {},
    tags: ['sunken_ruins'],
  },
  {
    name: t('Depths Leviathan'),

    image: '/enemies/depths-leviathan.jpg',
    tier: tier,

    attackSpeed: 0.8,

    multiplier: {
      life: 1.6,
      damage: 1.1,
      armor: 1.71,
      xp: 1.83,
      coldDamage: 0.13,
      fireResistance: 0.67,
      coldResistance: 2,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 1.33,
      itemDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['sunken_ruins'],
  },
  {
    name: t('Arcane Construct'),

    image: '/enemies/arcane-construct.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.1,
      damage: 0,
      airDamage: 1,
      fireResistance: 1.33,
      coldResistance: 1.33,
      airResistance: 2.33,
      earthResistance: 1.33,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['sunken_ruins'],
  },
];
