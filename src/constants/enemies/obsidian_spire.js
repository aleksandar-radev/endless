import { t } from '../../i18n.js';

const tier = 12;

export const OBSIDIAN_SPIRE_ENEMIES = [
  {
    name: t('Void Sentinel'),

    image: '/enemies/void-sentinel.jpg',
    tier: tier,

    multiplier: {
      life: 0.9,
      damage: 0.33,
      attackRating: 2,
      evasion: 1.67,
      coldDamage: 1,
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
      damage: 0.67,
      attackRating: 0.9,
      armor: 2.14,
      earthDamage: 0.67,
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
      damage: 0,
      attackRating: 1.6,
      evasion: 1.33,
      fireDamage: 0.67,
      airDamage: 0.33,
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
      damage: 0.4,
      fireDamage: 0.6,
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
