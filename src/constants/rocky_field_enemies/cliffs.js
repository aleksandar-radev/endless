import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_CLIFFS_ENEMIES = [
  {
    id: 'cliff_gargoyle',
    get name() { return t('Cliff Gargoyle'); },
    image: '/enemies/cliff-gargoyle.jpg',
    multiplier: {
      life: 1.1,
      damage: 1.2,
      armor: 1,
      attackSpeed: 1,
      attackRating: 1.3,
      evasion: 1.3,
      xp: 1.2,
      gold: 1.2,
    },
    special: ['noLeech'],
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['cliffs'],
  },
];
