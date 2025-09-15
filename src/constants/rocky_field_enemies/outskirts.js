import { t } from '../../i18n.js';
import { COMMON_RUNES } from './common.js';

export const ROCKY_FIELD_OUTSKIRTS_ENEMIES = [
  {
    id: 'stone_beetle',
    get name() { return t('Stone Beetle'); },
    image: '/enemies/stone-beetle.jpg',
    multiplier: {},
    special: ['alwaysHit'],
    runeDrop: COMMON_RUNES,
    tags: ['outskirts'],
  },
];
