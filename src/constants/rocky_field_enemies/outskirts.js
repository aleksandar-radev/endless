import { t } from '../../i18n.js';
import { ROCKY_FIELD_COMMON_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_OUTSKIRTS_ENEMIES = [
  {
    id: 'stone_beetle',
    nameKey: 'enemy.stoneBeetle',
    image: '/enemies/stone-beetle.jpg',
    multiplier: {
      life: 1.1,
      damage: 0.45,
      armor: 1.3,
      attackSpeed: 1,
      attackRating: 1.1,
      evasion: 0.8,
      xp: 1,
      gold: 1,
      fireDamage: 0.03,
      coldDamage: 0.08,
      airDamage: 0.05,
      earthDamage: 0.32,
      lightningDamage: 0.04,
      waterDamage: 0.18,
      fireResistance: 0.65,
      coldResistance: 1.1,
      airResistance: 0.75,
      earthResistance: 1.7,
      lightningResistance: 0.6,
      waterResistance: 1.2,
    },
    special: ['alwaysHit', 'frenzied'],
    specialData: { attackSpeedMultiplier: 1.4 },
    runeDrop: ROCKY_FIELD_COMMON_RUNES,
    tags: ['outskirts'],
  },
];
