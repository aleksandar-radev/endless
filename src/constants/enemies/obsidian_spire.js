import { t } from '../../i18n.js';

const tier = 12;

export const OBSIDIAN_SPIRE_ENEMIES = [
  {
    name: t('Void Sentinel'),

    image: '/enemies/void-sentinel.jpg',
    tier: tier,

    multiplier: {
      life: 0.9,
      damage: 0.26,
      attackRating: 2,
      evasion: 1.67,
      fireDamage: 0.12,
      coldDamage: 0.7,
      airDamage: 0.1,
      earthDamage: 0.08,
      lightningDamage: 0.05,
      waterDamage: 0.02,
      fireResistance: 0.67,
      coldResistance: 2.67,
      airResistance: 1.67,
      earthResistance: 1.67,
      lightningResistance: 1.33,
      waterResistance: 2.33,
      itemDrop: 1.1,
      materialDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],
  },
  {
    name: t('Obsidian Golem'),

    image: '/enemies/obsidian-golem.jpg',
    tier: tier,

    attackSpeed: 0.7,

    multiplier: {
      life: 1.4,
      damage: 0.38,
      attackRating: 0.9,
      armor: 2.14,
      fireDamage: 0.14,
      coldDamage: 0.12,
      airDamage: 0.1,
      earthDamage: 0.4,
      lightningDamage: 0.1,
      waterDamage: 0.1,
      fireResistance: 1.33,
      coldResistance: 1.33,
      airResistance: 1,
      earthResistance: 3,
      lightningResistance: 1.33,
      waterResistance: 1.33,
      materialDrop: 1.4,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],
  },
  {
    name: t('Crimson Wisp'),

    image: '/enemies/crimson-wisp.jpg',
    tier: tier,

    multiplier: {
      life: 0.8,
      damage: 0.16,
      attackRating: 1.6,
      evasion: 1.33,
      fireDamage: 0.32,
      coldDamage: 0.1,
      airDamage: 0.22,
      earthDamage: 0.08,
      lightningDamage: 0.07,
      waterDamage: 0.05,
      fireResistance: 2.33,
      coldResistance: 1.33,
      airResistance: 1.67,
      earthResistance: 1.33,
      lightningResistance: 1.33,
      waterResistance: 1.33,
      itemDrop: 1.2,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],

  },
  {
    name: t('Flame Djinn'),

    image: '/enemies/flame-djinn.jpg',
    tier: tier,

    attackSpeed: 0.9,

    multiplier: {
      life: 1.2,
      damage: 0.28,
      fireDamage: 0.45,
      coldDamage: 0.1,
      airDamage: 0.07,
      earthDamage: 0.05,
      lightningDamage: 0.03,
      waterDamage: 0.02,
      fireResistance: 3,
      coldResistance: 1.67,
      airResistance: 1.67,
      earthResistance: 1.33,
      lightningResistance: 1.33,
      waterResistance: 0,
      materialDrop: 1.5,
    },
    materialDropWeights: {},
    tags: ['obsidian_spire'],

  },
];
