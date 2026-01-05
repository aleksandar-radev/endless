import { t } from '../../i18n.js';

const tier = 2;

export const CRYSTAL_CAVE_ENEMIES = [
  {
    nameKey: 'enemy.crystalGolem',

    image: '/enemies/crystal-golem.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.6,
      damage: 0.2,
      attackRating: 0.8,
      armor: 2.29,
      evasion: 0.5,
      fireDamage: 0.12,
      coldDamage: 0.12,
      airDamage: 0.09,
      earthDamage: 0.6,
      lightningDamage: 0.1,
      waterDamage: 0.1,
      earthResistance: 1.67,
      fireResistance: 0.67,
      coldResistance: 1,
      airResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: { crystalized_rock: 4 },
    tags: ['crystal_cave'],
  },
  {
    nameKey: 'enemy.gemGuardian',

    image: '/enemies/gem-guardian.jpg',
    tier: tier,

    multiplier: {
      armor: 1.71,
      damage: 0.1,
      evasion: 0.67,
      fireDamage: 0.08,
      coldDamage: 0.09,
      airDamage: 0.05,
      earthDamage: 0.35,
      lightningDamage: 0.03,
      waterDamage: 0.3,
      earthResistance: 1.33,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 0.67,
      lightningResistance: 1,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
  {
    nameKey: 'enemy.grimspike',

    image: '/enemies/grimspike.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      damage: 0.28,
      fireDamage: 0.12,
      coldDamage: 0.1,
      airDamage: 0.34,
      earthDamage: 0.08,
      lightningDamage: 0.05,
      waterDamage: 0.03,
      airResistance: 1,
      fireResistance: 0.67,
      coldResistance: 0.67,
      earthResistance: 1,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
  {
    nameKey: 'enemy.shardling',

    image: '/enemies/shardling.jpg',
    tier: tier,

    attackSpeed: 1.2,

    multiplier: {
      damage: 0.22,
      fireDamage: 0.1,
      coldDamage: 0.08,
      airDamage: 0.07,
      earthDamage: 0.45,
      lightningDamage: 0.05,
      waterDamage: 0.03,
      earthResistance: 1,
      fireResistance: 0.67,
      coldResistance: 0.67,
      airResistance: 0.67,
      lightningResistance: 0.67,
      waterResistance: 0.67,
    },

    materialDropWeights: {},
    tags: ['crystal_cave'],
  },
];
