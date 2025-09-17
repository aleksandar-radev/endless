import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_CAVES_ENEMIES = [
  {
    id: 'cave_stalker',
    get name() { return t('Cave Stalker'); },
    image: '/enemies/cave-stalker.jpg',
    multiplier: {
      life: 1,
      damage: 1.3,
      armor: 0.9,
      attackSpeed: 1.2,
      attackRating: 1.2,
      evasion: 1.2,
      xp: 1.1,
      gold: 1,
    },
    special: ['alwaysHit'],
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['caves'],
  },
];
