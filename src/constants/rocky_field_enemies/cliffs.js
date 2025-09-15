import { t } from '../../i18n.js';
import { ALL_RUNES } from './common.js';

export const ROCKY_FIELD_CLIFFS_ENEMIES = [
  {
    id: 'cliff_gargoyle',
    get name() { return t('Cliff Gargoyle'); },
    image: '/enemies/cliff-gargoyle.jpg',
    multiplier: {},
    special: ['noLeech'],
    runeDrop: ALL_RUNES,
    tags: ['cliffs'],
  },
];
