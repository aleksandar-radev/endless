import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_VALLEY_ENEMIES = [
  {
    id: 'valley_sentinel',
    get name() { return t('Valley Sentinel'); },
    image: '/enemies/valley-sentinel.jpg',
    multiplier: {
      life: 1.4,
      damage: 1.1,
      armor: 1.4,
      attackSpeed: 1,
      attackRating: 1.2,
      evasion: 1,
      xp: 1.2,
      gold: 1.2,
    },
    special: [],
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['valley'],
  },
];
