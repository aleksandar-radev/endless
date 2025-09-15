import { t } from '../../i18n.js';
import { ALL_RUNES } from './common.js';

export const ROCKY_FIELD_CAVES_ENEMIES = [
  {
    id: 'cave_stalker',
    get name() { return t('Cave Stalker'); },
    image: '/enemies/cave-stalker.jpg',
    multiplier: {},
    special: ['alwaysHit'],
    runeDrop: ALL_RUNES,
    tags: ['caves'],
  },
];
