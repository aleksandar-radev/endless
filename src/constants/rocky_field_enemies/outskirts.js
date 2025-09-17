import { t } from '../../i18n.js';
import { ROCKY_FIELD_COMMON_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_OUTSKIRTS_ENEMIES = [
  {
    id: 'stone_beetle',
    get name() { return t('Stone Beetle'); },
    image: '/enemies/stone-beetle.jpg',
    multiplier: {
      life: 1.1,
      damage: 0.9,
      armor: 1.3,
      attackSpeed: 0.9,
      attackRating: 1.1,
      evasion: 0.8,
      xp: 1,
      gold: 1,
    },
    special: ['alwaysHit'],
    runeDrop: ROCKY_FIELD_COMMON_RUNES,
    tags: ['outskirts'],
  },
];
