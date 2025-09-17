import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_SUMMIT_ENEMIES = [
  {
    id: 'rock_spirit',
    get name() { return t('Rock Spirit'); },
    image: '/enemies/rock-spirit.jpg',
    multiplier: {
      life: 1.5,
      damage: 1.3,
      armor: 1.3,
      attackSpeed: 1.1,
      attackRating: 1.3,
      evasion: 1.1,
      xp: 1.3,
      gold: 1.3,
    },
    special: [],
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['summit'],
  },
];
