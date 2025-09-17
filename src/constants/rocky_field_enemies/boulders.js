import { t } from '../../i18n.js';
import { ROCKY_FIELD_COMMON_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_BOULDERS_ENEMIES = [
  {
    id: 'pebble_golem',
    get name() { return t('Pebble Golem'); },
    image: '/enemies/pebble-golem.jpg',
    multiplier: {
      life: 1.4,
      damage: 1.1,
      armor: 1.2,
      attackSpeed: 0.9,
      attackRating: 1,
      evasion: 0.8,
      xp: 1.1,
      gold: 1.1,
    },
    special: ['noLeech'],
    runeDrop: ROCKY_FIELD_COMMON_RUNES,
    tags: ['boulders'],
  },
];
