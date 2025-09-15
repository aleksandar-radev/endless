import { t } from '../../i18n.js';
import { COMMON_RUNES } from './common.js';

export const ROCKY_FIELD_BOULDERS_ENEMIES = [
  {
    id: 'pebble_golem',
    get name() { return t('Pebble Golem'); },
    image: '/enemies/pebble-golem.jpg',
    multiplier: {},
    special: ['noLeech'],
    runeDrop: COMMON_RUNES,
    tags: ['boulders'],
  },
];
