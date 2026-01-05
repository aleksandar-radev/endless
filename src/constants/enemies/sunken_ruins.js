import { t } from '../../i18n.js';

const tier = 9;

export const SUNKEN_RUINS_ENEMIES = [
  {
    nameKey: 'enemy.tideGuardian',

    image: '/enemies/tide-guardian.jpg',
    tier: tier,

    attackSpeed: 0.95,

    multiplier: {
      life: 1.65,
      damage: 0.18,
      attackRating: 1.4,
      armor: 1.71,
      evasion: 0.67,
      xp: 1.5,
      gold: 1,
      fireDamage: 0.12,
      coldDamage: 0.48,
      airDamage: 0.1,
      earthDamage: 0.1,
      lightningDamage: 0.1,
      waterDamage: 0.25,
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
    nameKey: 'enemy.coralSentinel',

    image: '/enemies/coral-sentinel.jpg',
    tier: tier,

    multiplier: {
      life: 1.25,
      damage: 0.36,
      attackRating: 1.3,
      armor: 0.69,
      evasion: 1,
      gold: 1.33,
      fireDamage: 0.14,
      coldDamage: 0.12,
      airDamage: 0.1,
      earthDamage: 0.34,
      lightningDamage: 0.1,
      waterDamage: 0.08,
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
    nameKey: 'enemy.depthsLeviathan',

    image: '/enemies/depths-leviathan.jpg',
    tier: tier,

    attackSpeed: 0.8,

    multiplier: {
      life: 1.6,
      damage: 0.7,
      armor: 1.71,
      xp: 1.83,
      fireDamage: 0.12,
      coldDamage: 0.18,
      airDamage: 0.08,
      earthDamage: 0.07,
      lightningDamage: 0.05,
      waterDamage: 0.03,
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
    nameKey: 'enemy.arcaneConstruct',

    image: '/enemies/arcane-construct.jpg',
    tier: tier,

    attackSpeed: 1.1,

    multiplier: {
      life: 1.1,
      damage: 0.15,
      fireDamage: 0.1,
      coldDamage: 0.08,
      airDamage: 0.55,
      earthDamage: 0.07,
      lightningDamage: 0.03,
      waterDamage: 0.02,
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
