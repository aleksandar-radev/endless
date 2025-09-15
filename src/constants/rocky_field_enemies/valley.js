import { t } from '../../i18n.js';
import { ALL_RUNES } from './common.js';

export const ROCKY_FIELD_VALLEY_ENEMIES = [
  {
    id: 'valley_sentinel',
    get name() { return t('Valley Sentinel'); },
    image: '/enemies/valley-sentinel.jpg',
    multiplier: {},
    special: [],
    runeDrop: ALL_RUNES,
    tags: ['valley'],
  },
];
