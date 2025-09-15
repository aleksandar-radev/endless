import { t } from '../../i18n.js';
import { ALL_RUNES } from './common.js';

export const ROCKY_FIELD_SUMMIT_ENEMIES = [
  {
    id: 'rock_spirit',
    get name() { return t('Rock Spirit'); },
    image: '/enemies/rock-spirit.jpg',
    multiplier: {},
    special: [],
    runeDrop: ALL_RUNES,
    tags: ['summit'],
  },
];
